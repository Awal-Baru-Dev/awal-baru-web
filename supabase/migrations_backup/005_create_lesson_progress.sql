-- Migration: 005_create_lesson_progress
-- Description: Creates lesson progress tracking table
-- Date: 2025-01-01

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Lesson identification (maps to content JSONB in courses)
  section_id VARCHAR(10) NOT NULL,    -- e.g., "01", "02"
  lesson_index INTEGER NOT NULL,       -- 0-based index within section

  -- Progress tracking
  percent_watched DECIMAL(5,4) DEFAULT 0,  -- 0.0000 to 1.0000
  seconds_watched INTEGER DEFAULT 0,        -- Unique seconds (excludes rewatches)
  last_position DECIMAL(10,2) DEFAULT 0,    -- Last playback position for resume
  video_duration DECIMAL(10,2) DEFAULT 0,   -- Total video duration

  -- Completion status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraint: one record per user per lesson
  CONSTRAINT unique_user_lesson UNIQUE (user_id, course_id, section_id, lesson_index)
);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS on_lesson_progress_updated ON lesson_progress;
CREATE TRIGGER on_lesson_progress_updated
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own progress
CREATE POLICY "Users can read own progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own progress (for reset)
CREATE POLICY "Users can delete own progress" ON lesson_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to lesson_progress" ON lesson_progress
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_updated_at ON lesson_progress(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_is_completed ON lesson_progress(is_completed);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_progress TO authenticated;
GRANT ALL ON lesson_progress TO service_role;

-- Comments
COMMENT ON TABLE lesson_progress IS 'Tracks user progress through course lessons';
COMMENT ON COLUMN lesson_progress.percent_watched IS 'Percentage watched (0.0000 to 1.0000). 0.90+ marks as completed';
COMMENT ON COLUMN lesson_progress.section_id IS 'Maps to content.sections[].id in courses table';
COMMENT ON COLUMN lesson_progress.lesson_index IS '0-based index within content.sections[].lessons[]';
