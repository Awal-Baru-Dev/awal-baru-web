-- Migration: 006_create_storage
-- Description: Creates storage buckets and policies for file uploads
-- Date: 2025-01-01

-- Note: Storage bucket creation is typically done via Supabase Dashboard or API
-- These are the SQL policies for the buckets

-- Avatars bucket policies (bucket name: 'avatars')
-- Run these after creating the 'avatars' bucket in Supabase Dashboard

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update/replace their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to avatars
CREATE POLICY "Public can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Course thumbnails bucket policies (bucket name: 'course-assets')
-- These are public read, admin write only

-- Allow public read access to course assets
CREATE POLICY "Public can read course assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-assets');

-- Only service role can manage course assets
CREATE POLICY "Service role can manage course assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-assets' AND
    auth.role() = 'service_role'
  );

/*
MANUAL STEPS REQUIRED:
1. Go to Supabase Dashboard > Storage
2. Create bucket 'avatars' with public access
3. Create bucket 'course-assets' with public access
4. Run this migration to apply policies
*/
