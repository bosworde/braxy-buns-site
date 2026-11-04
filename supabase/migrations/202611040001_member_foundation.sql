-- Apply to a staging Supabase database first. This transaction fails rather than merging duplicate accounts.
begin;

do $$
begin
  if exists (select 1 from public.members where email is null or btrim(email) = '') then
    raise exception 'Resolve missing member emails before applying the foundation migration';
  end if;
  if exists (select 1 from public.members group by lower(btrim(email)) having count(*) > 1) then
    raise exception 'Resolve duplicate member emails before applying the foundation migration';
  end if;
end $$;
update public.members set email = lower(btrim(email));
create unique index if not exists braxy_members_email_unique on public.members(email);
create unique index if not exists braxy_members_customer_unique on public.members(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists braxy_members_subscription_unique on public.members(stripe_subscription_id) where stripe_subscription_id is not null;
alter table public.members add column if not exists stripe_subscription_created bigint not null default 0;
alter table public.members add column if not exists stripe_synced_at timestamptz;
alter table public.members add constraint braxy_member_email_normalized check (email = lower(btrim(email)) and email <> '');

-- Preserve the two existing admin identities; ordinary members cannot grant themselves admin access.
create or replace function public.braxy_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users u where u.id = auth.uid()
    and u.email_confirmed_at is not null
    and lower(u.email) in ('dennis@braxybuns.com', 'dennisddx@gmail.com'));
$$;
revoke all on function public.braxy_is_admin() from public;
grant execute on function public.braxy_is_admin() to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['members','wash_visits','tunnel_queue','welcome_screen','leads','founding_member_leads'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    -- Restrictive policy blocks even pre-existing permissive/public policies. Keep those policies for review.
    execute format('create policy braxy_admin_boundary on public.%I as restrictive for all to anon, authenticated using (public.braxy_is_admin()) with check (public.braxy_is_admin())', t);
    execute format('create policy braxy_admin_access on public.%I for all to authenticated using (public.braxy_is_admin()) with check (public.braxy_is_admin())', t);
  end loop;
end $$;

create table public.braxy_billing_locks (
  email text primary key, token uuid not null, expires_at timestamptz not null
);
create table public.braxy_billing_events (
  event_id text primary key, processed_at timestamptz not null default now()
);
create table public.braxy_checkout_state (
  email text primary key, customer_id text not null, attempt_id uuid not null,
  profile jsonb not null, price_id text not null, return_origin text not null, session_id text
);
alter table public.braxy_billing_locks enable row level security;
alter table public.braxy_billing_events enable row level security;
alter table public.braxy_checkout_state enable row level security;
revoke all on public.braxy_billing_locks, public.braxy_billing_events, public.braxy_checkout_state from public, anon, authenticated;
grant all on public.braxy_billing_locks, public.braxy_billing_events, public.braxy_checkout_state to service_role;

create function public.braxy_acquire_billing_lock(p_key text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare lease uuid;
begin
  insert into public.braxy_billing_locks(email, token, expires_at)
  values (lower(btrim(p_key)), gen_random_uuid(), clock_timestamp() + interval '120 seconds')
  on conflict (email) do update set token = excluded.token, expires_at = excluded.expires_at
  where public.braxy_billing_locks.expires_at < clock_timestamp()
  returning token into lease;
  return lease;
end $$;
create function public.braxy_release_billing_lock(p_key text, p_token uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.braxy_billing_locks where email = lower(btrim(p_key)) and token = p_token;
$$;

create function public.braxy_apply_subscription(
  p_email text, p_token uuid, p_event_id text, p_customer text, p_subscription text,
  p_created bigint, p_plan text, p_status text, p_profile jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare existing public.members%rowtype;
begin
  -- Fence expired workers: an old request cannot overwrite a newer reconciliation.
  perform 1 from public.braxy_billing_locks where email = p_email and token = p_token
    and expires_at > clock_timestamp() for update;
  if not found then raise exception 'Billing lease expired'; end if;
  if p_customer is null or p_subscription is null or p_email <> lower(btrim(p_email)) then
    raise exception 'Invalid billing identity';
  end if;
  if p_event_id is not null then
    insert into public.braxy_billing_events(event_id) values (p_event_id) on conflict do nothing;
    if not found then return; end if;
  end if;
  select * into existing from public.members where email = p_email for update;
  if found then
    if existing.stripe_customer_id is not null and existing.stripe_customer_id <> p_customer then
      raise exception 'Customer ownership mismatch';
    end if;
    if existing.stripe_subscription_created > p_created then return; end if;
    if existing.stripe_subscription_created = p_created and existing.stripe_subscription_id is not null
      and existing.stripe_subscription_id <> p_subscription then raise exception 'Conflicting subscription'; end if;
    update public.members set stripe_customer_id = p_customer, stripe_subscription_id = p_subscription,
      stripe_subscription_created = p_created, membership_plan = p_plan, membership_status = p_status,
      stripe_synced_at = clock_timestamp() where id = existing.id;
  else
    insert into public.members(email,first_name,last_name,license_plate,vehicle_make,vehicle_model,vehicle_color,
      membership_plan,membership_status,stripe_customer_id,stripe_subscription_id,stripe_subscription_created,stripe_synced_at)
    values (p_email,coalesce(p_profile->>'firstName',''),coalesce(p_profile->>'lastName',''),
      nullif(p_profile->>'licensePlate',''),nullif(p_profile->>'vehicleMake',''),nullif(p_profile->>'vehicleModel',''),nullif(p_profile->>'vehicleColor',''),
      p_plan,p_status,p_customer,p_subscription,p_created,clock_timestamp());
  end if;
end $$;
revoke all on function public.braxy_acquire_billing_lock(text), public.braxy_release_billing_lock(text,uuid),
  public.braxy_apply_subscription(text,uuid,text,text,text,bigint,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.braxy_acquire_billing_lock(text), public.braxy_release_billing_lock(text,uuid),
  public.braxy_apply_subscription(text,uuid,text,text,text,bigint,text,text,jsonb) to service_role;
create function public.braxy_save_checkout(p_email text, p_token uuid, p_state jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.braxy_billing_locks where email = p_email and token = p_token
    and expires_at > clock_timestamp() for update;
  if not found then raise exception 'Billing lease expired'; end if;
  insert into public.braxy_checkout_state(email,customer_id,attempt_id,profile,price_id,return_origin,session_id)
    values (p_email,p_state->>'customer_id',(p_state->>'attempt_id')::uuid,p_state->'profile',
      p_state->>'price_id',p_state->>'return_origin',p_state->>'session_id')
    on conflict (email) do update set customer_id = excluded.customer_id, attempt_id = excluded.attempt_id,
      profile = excluded.profile, price_id = excluded.price_id, return_origin = excluded.return_origin, session_id = excluded.session_id;
end $$;
revoke all on function public.braxy_save_checkout(text,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.braxy_save_checkout(text,uuid,jsonb) to service_role;
commit;
