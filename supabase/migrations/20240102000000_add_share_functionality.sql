-- Migration: Add share functionality
-- This migration adds share_slug column and public sharing capability

-- Add share_slug column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'share_slug'
  ) THEN
    ALTER TABLE recipes ADD COLUMN share_slug TEXT;
  END IF;
END $$;

-- Ensure is_public column exists (it should from initial schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE recipes ADD COLUMN is_public BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create unique index on share_slug (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS recipes_share_slug_idx
ON recipes(share_slug)
WHERE share_slug IS NOT NULL;

-- Policy: Anyone can view recipes via share_slug
DROP POLICY IF EXISTS "Anyone can view public shared recipes" ON recipes;
CREATE POLICY "Anyone can view public shared recipes"
  ON recipes
  FOR SELECT
  TO anon
  USING (is_public = true AND share_slug IS NOT NULL);

-- Policy: Authenticated users can also view public shared recipes
DROP POLICY IF EXISTS "Authenticated can view public shared recipes" ON recipes;
CREATE POLICY "Authenticated can view public shared recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (is_public = true AND share_slug IS NOT NULL);
