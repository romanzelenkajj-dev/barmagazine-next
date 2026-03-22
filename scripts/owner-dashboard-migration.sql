-- Owner Dashboard Migration
-- Run this in Supabase SQL Editor

-- 1. Create bar_owners table
CREATE TABLE IF NOT EXISTS bar_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add owner_id to bars table
ALTER TABLE bars ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES bar_owners(id);

-- 3. Create bar_submissions table for owner edits pending approval
CREATE TABLE IF NOT EXISTS bar_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bar_id UUID REFERENCES bars(id),
  owner_id UUID REFERENCES bar_owners(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_data JSONB NOT NULL DEFAULT '{}',
  submission_type TEXT DEFAULT 'info_update',
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_bar_owners_email ON bar_owners(email);
CREATE INDEX IF NOT EXISTS idx_bars_owner_id ON bars(owner_id);
CREATE INDEX IF NOT EXISTS idx_bar_submissions_status ON bar_submissions(status);
CREATE INDEX IF NOT EXISTS idx_bar_submissions_bar_id ON bar_submissions(bar_id);
CREATE INDEX IF NOT EXISTS idx_bar_submissions_owner_id ON bar_submissions(owner_id);

-- 5. Create storage bucket for bar photos (run via Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('bar-photos', 'bar-photos', true);

-- 6. RLS policies
ALTER TABLE bar_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_submissions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access on bar_owners" ON bar_owners
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on bar_submissions" ON bar_submissions
  FOR ALL USING (true) WITH CHECK (true);