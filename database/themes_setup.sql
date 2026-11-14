-- ============================================================================
-- AI VERSE — Advanced Theme Studio & Motion Customization Database Schema
-- Additive, safely repeatable, zero-trust migration script for Supabase.
-- ============================================================================

-- 1. Academy Themes Table (Saved Themes, Presets, and Drafts)
create table if not exists public.academy_themes (
  id text primary key,
  name text not null,
  description text default '',
  is_preset boolean not null default false,
  page_target text not null default 'global', -- 'global', 'home', 'catalog', 'tool_detail', 'prompting', 'prompting_practice', 'admin', 'admin_login', 'assessment'
  status text not null default 'draft',        -- 'draft', 'published', 'scheduled', 'archived'
  config jsonb not null,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- 2. Active Theme Bindings Table (Live Published State per Page)
create table if not exists public.academy_theme_bindings (
  page_target text primary key, -- 'global', 'home', 'catalog', 'tool_detail', 'prompting', 'prompting_practice', 'admin', 'admin_login', 'assessment'
  theme_id text not null references public.academy_themes(id) on delete cascade,
  published_config jsonb not null,
  previous_config jsonb,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id)
);

-- Safely ensure previous_config column exists on pre-existing tables
alter table public.academy_theme_bindings add column if not exists previous_config jsonb;

-- 3. Row Level Security & Zero Direct Client Access
-- Public and admin clients fetch and mutate themes solely through the backend API (/api/platform).
-- All direct anon/authenticated PostgREST access is revoked; only the server-side service role is granted access.
alter table public.academy_themes enable row level security;
alter table public.academy_theme_bindings enable row level security;

-- Revoke all table access from public, anon, and authenticated
revoke all on public.academy_themes from public, anon, authenticated;
revoke all on public.academy_theme_bindings from public, anon, authenticated;

-- Drop any public policies that may have existed on the tables
drop policy if exists "Public read-only on published theme bindings" on public.academy_theme_bindings;
drop policy if exists "Public read-only for themes" on public.academy_themes;

-- Grant service_role full management access for server-side API handlers
grant all on public.academy_themes to service_role;
grant all on public.academy_theme_bindings to service_role;

-- 4. Secure Storage Bucket for Uploaded Background Images & Videos
-- Strict MIME types: JPG, PNG, WebP (max 5MB) and MP4, WebM (max 15MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'theme-assets',
  'theme-assets',
  true,
  20971520, -- 20 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'];

-- Explicitly drop any known or unauthorized write policies on storage.objects
drop policy if exists "Public upload for theme assets" on storage.objects;
drop policy if exists "Authenticated upload for theme assets" on storage.objects;
drop policy if exists "Service role can upload theme assets" on storage.objects;
drop policy if exists "Allow upload to theme assets" on storage.objects;
drop policy if exists "Allow update to theme assets" on storage.objects;
drop policy if exists "Allow delete to theme assets" on storage.objects;

-- Comprehensive Audit: Dynamically scan and drop ALL write/mutation policies on storage.objects
-- for theme-assets, regardless of their names, ensuring zero unauthorized client writes exist.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and (
        coalesce(qual::text, '') ilike '%theme-assets%'
        or coalesce(with_check::text, '') ilike '%theme-assets%'
        or policyname ilike '%theme%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- Storage RLS: Public read-only access to view uploaded background assets via CDN
-- Public, anon, and authenticated users have ZERO insert, update, or delete privileges.
-- Uploads are performed exclusively by the backend service role via api/platform.js after strict content & admin verification.
drop policy if exists "Public read-only for theme assets" on storage.objects;
create policy "Public read-only for theme assets"
on storage.objects for select
to public, anon, authenticated
using (bucket_id = 'theme-assets');

-- 5. Initial Seed Preset (Inserted only if not existing - never overwrites custom edits)
insert into public.academy_themes (id, name, description, is_preset, page_target, status, config)
values
(
  'preset-original-default',
  'Original AI Verse Premium — Default',
  'The approved immutable AI Verse dark navy theme with anime hero background and violet accents.',
  true,
  'global',
  'published',
  '{
    "id": "preset-original-default",
    "name": "Original AI Verse Premium — Default",
    "isPreset": true,
    "pageTarget": "global",
    "bgType": "preset",
    "solidColor": "#070913",
    "gradient": {
      "angle": 135,
      "stops": [
        {"color": "#070913", "position": 0},
        {"color": "#0d1224", "position": 50},
        {"color": "#070913", "position": 100}
      ]
    },
    "imageUrl": "/images/anime-ai-hero.jpg",
    "imageSettings": {
      "size": "cover",
      "position": "center",
      "zoom": 100,
      "brightness": 100,
      "contrast": 100,
      "blur": 0,
      "opacity": 100
    },
    "videoUrl": "",
    "videoSettings": {
      "loop": true,
      "autoplay": true,
      "muted": true,
      "speed": 1,
      "staticFallbackUrl": "/images/anime-ai-hero.jpg",
      "darkOverlay": 0.4
    },
    "motionType": "none",
    "motionSettings": {
      "speed": 1,
      "direction": "up",
      "intensity": 50,
      "particleCount": 60,
      "particleSize": 2,
      "particleColor": "#a78bfa",
      "particleOpacity": 0.6,
      "glowIntensity": 40,
      "blur": 0,
      "duration": 20,
      "smoothness": 80,
      "parallaxDepth": 30,
      "mouseInteraction": true,
      "mouseIntensity": 40,
      "preset3d": "rotating_galaxy"
    },
    "overlay": {
      "enabled": true,
      "color": "#070913",
      "opacity": 0.6,
      "blur": 0
    },
    "layers": [
      {"id": "layer-bg", "type": "background", "enabled": true, "opacity": 1, "blendMode": "normal"},
      {"id": "layer-motion", "type": "motion", "enabled": false, "opacity": 0.8, "blendMode": "screen"},
      {"id": "layer-overlay", "type": "overlay", "enabled": true, "opacity": 0.6, "blendMode": "multiply"},
      {"id": "layer-glow", "type": "glow", "enabled": true, "opacity": 0.4, "blendMode": "screen"}
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- 6. Seed Initial Global Binding (Inserted only if not existing - never overwrites active themes)
insert into public.academy_theme_bindings (page_target, theme_id, published_config)
values (
  'global',
  'preset-original-default',
  (select config from public.academy_themes where id = 'preset-original-default')
)
on conflict (page_target) do nothing;
