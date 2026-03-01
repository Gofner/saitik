-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "listing_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-photos'
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own photos
CREATE POLICY "listing_photos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
CREATE POLICY "listing_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access
CREATE POLICY "listing_photos_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'listing-photos'
  );
