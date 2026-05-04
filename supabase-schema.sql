-- Bar Directory Schema for Supabase
-- Run this in the Supabase SQL Editor after creating your project

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Main bars table
create table bars (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  -- slug must be ASCII (lowercase letters, digits, hyphens). Vercel
  -- normalizes accented URLs to ASCII before our routing runs, so a
  -- non-ASCII slug here would 404. See scripts/bars-ascii-slug-migration.sql
  -- for the migration that introduced this constraint to existing installs.
  slug text not null unique constraint bars_slug_ascii_only check (slug ~ '^[a-z0-9-]+$'),

  -- Location
  city text not null,
  country text not null,
  region text, -- e.g. "Europe", "Asia", "North America"
  address text,
  lat double precision,
  lng double precision,
  
  -- Classification
  type text not null default 'Cocktail Bar',
  
  -- Contact & social
  website text,
  instagram text,
  phone text,
  email text,
  
  -- Content
  description text,
  short_excerpt text,
  photos text[] default '{}',  -- array of image URLs
  
  -- Monetization tiers: 'free', 'featured', 'premium'
  tier text not null default 'free' check (tier in ('free', 'featured', 'premium')),
  featured_until timestamptz,  -- when paid placement expires
  
  -- Status
  is_verified boolean default false,
  is_active boolean default true,
  
  -- Link to editorial content
  wp_article_slug text,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for common queries
create index bars_country_idx on bars(country);
create index bars_city_idx on bars(city);
create index bars_type_idx on bars(type);
create index bars_tier_idx on bars(tier);
create index bars_slug_idx on bars(slug);
create index bars_active_idx on bars(is_active) where is_active = true;

-- Row-level security (public read, authenticated write)
alter table bars enable row level security;

-- Anyone can read active bars
create policy "Public can view active bars"
  on bars for select
  using (is_active = true);

-- Authenticated users (admin) can do everything
create policy "Authenticated users can manage bars"
  on bars for all
  using (auth.role() = 'authenticated');

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bars_updated_at
  before update on bars
  for each row
  execute function update_updated_at();

-- Bar submissions table (for "Add Your Bar" form)
create table bar_submissions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  city text not null,
  country text not null,
  address text,
  type text default 'Cocktail Bar',
  website text,
  instagram text,
  email text not null,
  phone text,
  description text,
  contact_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  notes text  -- admin notes
);

-- RLS for submissions
alter table bar_submissions enable row level security;

-- Anyone can submit (insert)
create policy "Anyone can submit a bar"
  on bar_submissions for insert
  with check (true);

-- Only authenticated users can view/manage submissions
create policy "Authenticated users can manage submissions"
  on bar_submissions for all
  using (auth.role() = 'authenticated');

-- Enable anonymous access for public reads and form submissions
-- (You'll need to enable anon key in Supabase dashboard)
