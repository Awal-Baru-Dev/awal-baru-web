-- Migration: 007_simplify_progress_tracking
-- Description: Simplifies progress tracking from per-lesson to per-course
-- Date: 2025-01-01
--
-- This migration replaces the detailed `lesson_progress` table with a simpler
-- `course_progress` table that tracks only the user's current position.
--
-- MVP Approach: progress = current_lesson_position / total_lessons
-- See docs/PROGRESS_TRACKING.md for full documentation

-- Drop existing lesson_progress table and all its dependencies
DROP TABLE IF EXISTS lesson_progress CASCADE;

-- Create simplified course_progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Current position in course (maps to content JSONB in courses)
  current_section_id VARCHAR(10) NOT NULL,    -- e.g., "01", "02"
  current_lesson_index INTEGER NOT NULL,       -- 0-based index within section

  -- Overall progress (stored for query convenience, derived from position)
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

  -- Timestamps
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One progress record per user per course
  CONSTRAINT unique_user_course_progress UNIQUE (user_id, course_id)
);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS on_course_progress_updated ON course_progress;
CREATE TRIGGER on_course_progress_updated
  BEFORE UPDATE ON course_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own progress
CREATE POLICY "Users can read own course progress" ON course_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own course progress" ON course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own course progress" ON course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own progress (for reset)
CREATE POLICY "Users can delete own course progress" ON course_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to course_progress" ON course_progress
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_course ON course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_last_accessed ON course_progress(last_accessed_at DESC);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON course_progress TO authenticated;
GRANT ALL ON course_progress TO service_role;

-- Comments
COMMENT ON TABLE course_progress IS 'Tracks user progress through courses (MVP: position-based)';
COMMENT ON COLUMN course_progress.current_section_id IS 'Maps to content.sections[].id in courses table';
COMMENT ON COLUMN course_progress.current_lesson_index IS '0-based index within content.sections[].lessons[]';
COMMENT ON COLUMN course_progress.progress_percent IS 'Overall progress 0-100, derived from current position / total lessons';
