-- Storage Bucket Setup for recipe_images
-- Run this in Supabase SQL Editor or via Dashboard

-- Note: You may need to create the bucket via the Dashboard UI first:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "Create a new bucket"
-- 3. Name: recipe_images
-- 4. Public: OFF (private bucket)
-- 5. Then run the policies below

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can upload images to their own folder
CREATE POLICY "Users can upload own recipe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own recipe images
CREATE POLICY "Users can view own recipe images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Anyone can view images from public recipes
CREATE POLICY "Public can view public recipe images"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'recipe_images' AND
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.image_url = storage.objects.name
    AND recipes.is_public = true
  )
);

-- Policy 4: Users can update their own recipe images
CREATE POLICY "Users can update own recipe images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Users can delete their own recipe images
CREATE POLICY "Users can delete own recipe images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
