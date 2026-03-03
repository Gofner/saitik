-- Add Талисманы/Паки category
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Талисманы/Паки', 'talismans', 'talismans', 7)
ON CONFLICT (slug) DO NOTHING;
