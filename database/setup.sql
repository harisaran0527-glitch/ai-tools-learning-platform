-- Run once in your Supabase SQL editor. Provision admin users through Supabase Auth.
create table if not exists public.academy_tools (
  slug text primary key,
  tool jsonb not null,
  summary jsonb not null,
  draft jsonb not null default '[]',
  questions jsonb,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.academy_tools enable row level security;
revoke all on public.academy_tools from anon, authenticated;
grant all on public.academy_tools to service_role;

create table if not exists public.academy_practice_limits (
  key text primary key,
  window_start timestamptz not null,
  requests integer not null
);
alter table public.academy_practice_limits enable row level security;
revoke all on public.academy_practice_limits from anon, authenticated;
create or replace function public.academy_practice_quota(fingerprint text)
returns boolean language plpgsql security definer set search_path = public as $$
declare count_now integer; global_now integer;
begin
  insert into academy_practice_limits as limits(key, window_start, requests)
  values (fingerprint, date_trunc('hour', now()), 1)
  on conflict(key) do update set
    requests = case when limits.window_start < date_trunc('hour', now()) then 1 else limits.requests + 1 end,
    window_start = date_trunc('hour', now()) returning requests into count_now;
  insert into academy_practice_limits as limits(key, window_start, requests)
  values ('global', date_trunc('hour', now()), 1)
  on conflict(key) do update set
    requests = case when limits.window_start < date_trunc('hour', now()) then 1 else limits.requests + 1 end,
    window_start = date_trunc('hour', now()) returning requests into global_now;
  return count_now <= 20 and global_now <= 200;
end $$;
revoke all on function public.academy_practice_quota(text) from public, anon, authenticated;
grant execute on function public.academy_practice_quota(text) to service_role;
