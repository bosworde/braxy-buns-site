-- Free pre-opening registrations never grant paid membership or wash admission.
create table public.braxy_preopening_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null check (length(first_name) between 1 and 50),
  last_name text not null check (length(last_name) between 1 and 50),
  preferred_plan text not null check (preferred_plan in ('Gecko','Iguana','Dragon')),
  vehicle_make text not null default '' check (length(vehicle_make) <= 50),
  vehicle_model text not null default '' check (length(vehicle_model) <= 50),
  vehicle_color text not null default '' check (length(vehicle_color) <= 50),
  license_plate text not null default '' check (license_plate = '' or license_plate ~ '^[A-Z0-9-]{2,10}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.braxy_preopening_profiles enable row level security;
revoke all on public.braxy_preopening_profiles from anon, authenticated;
grant all on public.braxy_preopening_profiles to service_role;
comment on table public.braxy_preopening_profiles is 'Verified free registrations; no subscription, billing commitment, rewards, or wash eligibility.';
