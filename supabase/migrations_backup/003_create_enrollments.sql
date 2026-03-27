-- Migration: 003_create_enrollments
-- Description: Creates enrollments table for course purchases and paywall
-- Date: 2025-01-01

-- Create payment status enum type
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment method enum type
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'virtual_account',
    'credit_card',
    'e_wallet',
    'qris',
    'retail',
    'direct_debit',
    'paylater'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Payment information
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  payment_reference VARCHAR(255),  -- Invoice number / transaction ID
  payment_channel VARCHAR(100),    -- Specific channel (e.g., BCA, OVO, etc.)
  amount_paid INTEGER DEFAULT 0,

  -- Timestamps
  purchased_at TIMESTAMPTZ,        -- When payment was confirmed
  expires_at TIMESTAMPTZ,          -- For pending payments
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraint: one enrollment per user per course
  CONSTRAINT unique_user_course UNIQUE (user_id, course_id)
);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS on_enrollments_updated ON enrollments;
CREATE TRIGGER on_enrollments_updated
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can read their own enrollments
CREATE POLICY "Users can read own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own enrollments (for initiating payment)
CREATE POLICY "Users can insert own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments (limited - mainly for status)
CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can do anything (for webhooks)
CREATE POLICY "Service role has full access to enrollments" ON enrollments
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_reference ON enrollments(payment_reference);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON enrollments TO authenticated;
GRANT ALL ON enrollments TO service_role;

-- Comments
COMMENT ON TABLE enrollments IS 'Tracks user course enrollments and payment status';
COMMENT ON COLUMN enrollments.payment_reference IS 'DOKU invoice number or transaction ID';
