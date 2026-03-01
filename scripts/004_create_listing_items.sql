-- Create listing_items table
CREATE TABLE IF NOT EXISTS public.listing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  price NUMERIC,
  description TEXT,
  sort_order INT DEFAULT 0
);

ALTER TABLE public.listing_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read listing items (for active listings, enforced at app level)
CREATE POLICY "listing_items_select_all" ON public.listing_items
  FOR SELECT USING (true);

-- Users can insert items for their own listings
CREATE POLICY "listing_items_insert_own" ON public.listing_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );

-- Users can update items for their own listings
CREATE POLICY "listing_items_update_own" ON public.listing_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );

-- Users can delete items for their own listings
CREATE POLICY "listing_items_delete_own" ON public.listing_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );
