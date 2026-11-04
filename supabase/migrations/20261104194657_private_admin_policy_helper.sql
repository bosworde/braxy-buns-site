create schema if not exists braxy_private;
revoke all on schema braxy_private from public, anon, authenticated;
grant usage on schema braxy_private to authenticated;
alter function public.braxy_is_admin() set schema braxy_private;
revoke all on function braxy_private.braxy_is_admin() from public, anon, authenticated;
grant execute on function braxy_private.braxy_is_admin() to authenticated;
