-- Server-only atomic admission. Existing one-wash-per-day rule uses the site's Central timezone.
create or replace function public.braxy_admit_wash(p_member uuid, p_token uuid,
 p_subscription text, p_customer text, p_plan text, p_plate text, p_commit boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare m public.members%rowtype; visit uuid; plate text;
 day_start timestamptz := date_trunc('day', now() at time zone 'America/Chicago') at time zone 'America/Chicago';
begin
 select * into m from public.members where id=p_member;
 if not found then raise exception 'Member not found'; end if;
 perform 1 from public.braxy_billing_locks where email=m.email and token=p_token and expires_at>clock_timestamp() for update;
 if not found then raise exception 'Billing lease expired'; end if;
 select * into m from public.members where id=p_member for update;
 if m.stripe_subscription_id is distinct from p_subscription or m.stripe_customer_id is distinct from p_customer
 or m.license_plate is distinct from p_plate then raise exception 'Membership changed; recheck'; end if;
 plate := upper(regexp_replace(coalesce(m.license_plate,''),'[^a-zA-Z0-9]','','g'));
 if plate = '' then raise exception 'Plate is required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(plate, 0));
 if exists(select 1 from public.members where id<>m.id and upper(regexp_replace(coalesce(license_plate,''),'[^a-zA-Z0-9]','','g'))=plate) then
  raise exception 'Ambiguous plate; review accounts';
 end if;
 if exists(select 1 from public.wash_visits where created_at>=day_start and
  (member_id=m.id or upper(regexp_replace(coalesce(license_plate,''),'[^a-zA-Z0-9]','','g'))=plate)) then
  return jsonb_build_object('approved',false,'recorded',false,'duplicate',true);
 end if;
 if not p_commit then return jsonb_build_object('approved',true,'recorded',false); end if;
 insert into public.wash_visits(member_id,email,membership_plan,license_plate)
 values(m.id,m.email,p_plan,m.license_plate) returning id into visit;
 update public.members set rewards_points=coalesce(rewards_points,0)+10,lifetime_washes=coalesce(lifetime_washes,0)+1
 where id=m.id returning * into m;
 insert into public.tunnel_queue(wash_visit_id,member_id,license_plate,first_name,membership_plan,rewards_points,lifetime_washes,status)
 values(visit,m.id,m.license_plate,m.first_name,p_plan,m.rewards_points,m.lifetime_washes,'waiting');
 return jsonb_build_object('approved',true,'recorded',true,'visit_id',visit,'rewards_points',m.rewards_points,'lifetime_washes',m.lifetime_washes);
end $$;
revoke all on function public.braxy_admit_wash(uuid,uuid,text,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.braxy_admit_wash(uuid,uuid,text,text,text,text,boolean) to service_role;
