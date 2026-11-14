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

-- 2. Update theme-assets storage bucket to also accept application/pdf as universal fallback
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'theme-assets',
  'theme-assets',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'];

-- 3. Ensure public read CDN access for tool guides and theme assets
drop policy if exists "Public read-only for tool guides" on storage.objects;
create policy "Public read-only for tool guides"
  on storage.objects
  for select
  using (bucket_id = 'tool-guides');

drop policy if exists "Public read-only for theme assets" on storage.objects;
create policy "Public read-only for theme assets"
  on storage.objects
  for select
  using (bucket_id = 'theme-assets');

-- 4. Grant service_role full management access for server-side API handlers
grant all on storage.objects to service_role;
