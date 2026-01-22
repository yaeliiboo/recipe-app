-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  public_share_token UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX recipes_user_id_idx ON recipes(user_id);

-- Create index on public_share_token for public access
CREATE INDEX recipes_public_share_token_idx ON recipes(public_share_token) WHERE is_public = true;

-- Create index on created_at for sorting
CREATE INDEX recipes_created_at_idx ON recipes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own recipes
CREATE POLICY "Users can view own recipes"
  ON recipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own recipes
CREATE POLICY "Users can insert own recipes"
  ON recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recipes
CREATE POLICY "Users can update own recipes"
  ON recipes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own recipes
CREATE POLICY "Users can delete own recipes"
  ON recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Anyone can view public recipes via share token
CREATE POLICY "Anyone can view public recipes"
  ON recipes
  FOR SELECT
  USING (is_public = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for recipe images (execute separately in Supabase dashboard)
-- This is documented in the storage setup file
