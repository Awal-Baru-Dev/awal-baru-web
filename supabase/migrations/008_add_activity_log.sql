-- Migration: 008_add_activity_log
-- Description: Adds activity logging for dashboard stats (weekly time, lessons, streak)
-- Date: 2025-01-01
--
-- This table tracks daily activity per user per course for dashboard visualizations.
-- Data is aggregated by date for efficient weekly queries.

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Activity date (aggregated by day)
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Daily activity metrics
  lessons_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One record per user per course per day
  CONSTRAINT unique_user_course_date UNIQUE (user_id, course_id, activity_date)
);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS on_activity_log_updated ON activity_log;
CREATE TRIGGER on_activity_log_updated
  BEFORE UPDATE ON activity_log
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity
CREATE POLICY "Users can read own activity log" ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activity
CREATE POLICY "Users can insert own activity log" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity
CREATE POLICY "Users can update own activity log" ON activity_log
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to activity_log" ON activity_log
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON activity_log(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_course_date ON activity_log(user_id, course_id, activity_date);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON activity_log TO authenticated;
GRANT ALL ON activity_log TO service_role;

-- Comments
COMMENT ON TABLE activity_log IS 'Tracks daily user activity for dashboard stats';
COMMENT ON COLUMN activity_log.activity_date IS 'Date of activity (aggregated by day)';
COMMENT ON COLUMN activity_log.lessons_completed IS 'Number of lessons completed on this day';
COMMENT ON COLUMN activity_log.time_spent_minutes IS 'Total time spent watching videos on this day';
