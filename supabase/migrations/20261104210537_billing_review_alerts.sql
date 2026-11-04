create table public.braxy_operational_alerts (
 id text primary key, kind text not null, resource_id text, customer_id text,
 subscription_ids text[] not null default '{}', message text not null,
 created_at timestamptz not null default now(), resolved_at timestamptz
);
alter table public.braxy_operational_alerts enable row level security;
revoke all on public.braxy_operational_alerts from anon,authenticated;
grant all on public.braxy_operational_alerts to service_role;
