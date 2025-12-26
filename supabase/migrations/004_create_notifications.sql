-- Migration: 004_create_notifications
-- Description: Creates notifications table for in-app notifications
-- Date: 2025-01-01

-- Create notification type enum
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('course', 'achievement', 'community', 'system', 'payment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification content
  type notification_type NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),              -- Navigation link (optional)

  -- Status
  is_read BOOLEAN DEFAULT false,

  -- Additional data (flexible)
  metadata JSONB DEFAULT '{}',    -- course_id, invoice_number, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Users can insert notifications for themselves
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do anything (for system notifications)
CREATE POLICY "Service role has full access to notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Comments
COMMENT ON TABLE notifications IS 'Stores user notifications for various events';
COMMENT ON COLUMN notifications.metadata IS 'JSONB for additional context like course_id, invoice_number';
