-- Add telegram_chat_id field to profiles for Telegram notifications
-- Also add telegram_link_token for secure account linking

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_link_token TEXT,
ADD COLUMN IF NOT EXISTS telegram_link_expires_at TIMESTAMPTZ;

-- Index for fast lookup by chat_id when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;

-- Index for token lookup during linking process
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_link_token ON public.profiles(telegram_link_token) WHERE telegram_link_token IS NOT NULL;
