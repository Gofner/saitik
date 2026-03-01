-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'from')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'hidden', 'rejected')),
  contact_telegram TEXT,
  contact_discord TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Everyone can see active listings
CREATE POLICY "listings_select_active" ON public.listings
  FOR SELECT USING (
    status = 'active'
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Authenticated users can insert their own listings
CREATE POLICY "listings_insert_own" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "listings_update_own" ON public.listings
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can delete their own listings
CREATE POLICY "listings_delete_own" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- Function to check listing limit (max 3 active/pending per user)
CREATE OR REPLACE FUNCTION public.check_listing_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  listing_count INT;
BEGIN
  SELECT COUNT(*) INTO listing_count
  FROM public.listings
  WHERE user_id = NEW.user_id
    AND status IN ('active', 'pending')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');

  IF listing_count >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 active/pending listings per user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_listing_limit_trigger ON public.listings;

CREATE TRIGGER check_listing_limit_trigger
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_listing_limit();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
