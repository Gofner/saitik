-- Add vk_url column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vk_url TEXT;
