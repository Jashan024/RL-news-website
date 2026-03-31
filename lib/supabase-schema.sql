-- =============================================
-- Report Ludhiana Newspaper — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Ludhiana', 'ludhiana'),
  ('Punjab', 'punjab'),
  ('National', 'national'),
  ('Politics', 'politics'),
  ('Crime', 'crime'),
  ('Sports', 'sports'),
  ('Business', 'business'),
  ('Entertainment', 'entertainment'),
  ('Education', 'education'),
  ('Health', 'health');

-- News Articles
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Galleries
CREATE TABLE galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Photos
CREATE TABLE gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads / Banners
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  click_url TEXT,
  placement TEXT DEFAULT 'top' CHECK (placement IN ('top', 'middle', 'sidebar', 'bottom')),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breaking News
CREATE TABLE breaking_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (open for now since we use server-side auth)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read" ON galleries FOR SELECT USING (true);
CREATE POLICY "Public read" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Public read" ON ads FOR SELECT USING (true);
CREATE POLICY "Public read" ON breaking_news FOR SELECT USING (true);
CREATE POLICY "Public read" ON activity_log FOR SELECT USING (true);

-- Allow anon insert/update/delete (admin uses anon key with server-side auth guard)
CREATE POLICY "Anon write" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON galleries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON gallery_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON ads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON breaking_news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON activity_log FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for uploads
-- (Do this manually in Supabase Dashboard > Storage > New Bucket > "uploads" > Public)
