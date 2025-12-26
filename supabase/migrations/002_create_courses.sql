-- Migration: 002_create_courses
-- Description: Creates courses table with hybrid schema (typed + JSONB)
-- Date: 2025-01-01

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stable metadata (typed columns for querying/filtering)
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_description VARCHAR(500),
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  thumbnail_url VARCHAR(500),
  preview_video_url VARCHAR(500),
  instructor_name VARCHAR(255),
  instructor_title VARCHAR(255),
  instructor_avatar VARCHAR(500),
  level VARCHAR(50) DEFAULT 'Pemula',  -- Pemula, Menengah, Mahir
  category VARCHAR(255),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Flexible content (JSONB for evolving structure)
  -- Stores: { sections: [{ id, title, lessons: [{ title, duration, videoId, isFree }] }] }
  content JSONB DEFAULT '{}',

  -- Flexible metadata (JSONB for presentational data)
  -- Stores: { whatYouWillLearn, features, tags, stats, requirements, targetAudience }
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS on_courses_updated ON courses;
CREATE TRIGGER on_courses_updated
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can read published courses
CREATE POLICY "Anyone can read published courses" ON courses
  FOR SELECT USING (is_published = true);

-- Service role can do anything (for admin operations)
CREATE POLICY "Service role has full access" ON courses
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_display_order ON courses(display_order);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);

-- GIN index for JSONB content (for searching within JSON)
CREATE INDEX IF NOT EXISTS idx_courses_metadata ON courses USING GIN (metadata);

-- Grant permissions
GRANT SELECT ON courses TO anon;
GRANT SELECT ON courses TO authenticated;
GRANT ALL ON courses TO service_role;

-- Comments for documentation
COMMENT ON TABLE courses IS 'Stores course information with hybrid schema';
COMMENT ON COLUMN courses.content IS 'JSONB storing sections and lessons structure';
COMMENT ON COLUMN courses.metadata IS 'JSONB storing whatYouWillLearn, features, tags, stats';
