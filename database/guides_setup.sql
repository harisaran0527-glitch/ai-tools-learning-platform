-- ============================================================================
-- AI VERSE — Universal PDF Learning Guide Storage Bucket
-- Idempotent, additive migration for Supabase Storage
-- ============================================================================

-- 1. Create or update tool-guides storage bucket (max 20MB per PDF)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tool-guides',
  'tool-guides',
  true,
  20971520, -- 20 MB limit
  array['application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = array['application/pdf'];

-- 2. Ensure public read CDN access for tool guides
drop policy if exists "Public read-only for tool guides" on storage.objects;
create policy "Public read-only for tool guides"
  on storage.objects
  for select
  using (bucket_id = 'tool-guides');

-- 3. Grant service_role full management access for server-side API handlers
grant all on storage.objects to service_role;
