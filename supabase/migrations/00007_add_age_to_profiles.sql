-- Add age column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
