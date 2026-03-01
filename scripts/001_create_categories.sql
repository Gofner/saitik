-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

-- Seed default categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Аккаунты', 'accounts', 'user', 1),
  ('Валюта', 'currency', 'coins', 2),
  ('Предметы', 'items', 'package', 3),
  ('Услуги', 'services', 'wrench', 4),
  ('Бусты', 'boosts', 'zap', 5),
  ('Другое', 'other', 'layers', 6)
ON CONFLICT (slug) DO NOTHING;
