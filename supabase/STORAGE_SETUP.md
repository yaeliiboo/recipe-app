# Storage Bucket Setup Instructions

## Create the recipe_images bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create a new bucket"
4. Enter the following details:
   - **Name**: `recipe_images`
   - **Public bucket**: ❌ Unchecked (private bucket)
   - **File size limit**: 5 MB (or as needed)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

5. Click "Create bucket"

## Set up Storage Policies

After creating the bucket, you need to set up RLS policies for it:

### Policy 1: Users can upload their own recipe images

```sql
CREATE POLICY "Users can upload own recipe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Users can view their own recipe images

```sql
CREATE POLICY "Users can view own recipe images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Anyone can view images from public recipes

```sql
CREATE POLICY "Public can view public recipe images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'recipe_images' AND
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.image_url = storage.objects.name
    AND recipes.is_public = true
  )
);
```

### Policy 4: Users can update their own recipe images

```sql
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
```

### Policy 5: Users can delete their own recipe images

```sql
CREATE POLICY "Users can delete own recipe images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## File Organization

Images should be organized by user ID:
```
recipe_images/
  ├── {user_id_1}/
  │   ├── recipe_1.jpg
  │   └── recipe_2.png
  └── {user_id_2}/
      └── recipe_3.webp
```

## Usage in Application

To upload an image:

```typescript
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

const fileExt = file.name.split('.').pop()
const fileName = `${user.id}/${Date.now()}.${fileExt}`

const { data, error } = await supabase.storage
  .from('recipe_images')
  .upload(fileName, file)
```

To get a public URL for a private image (authenticated users):

```typescript
const { data } = supabase.storage
  .from('recipe_images')
  .getPublicUrl(fileName)
```
