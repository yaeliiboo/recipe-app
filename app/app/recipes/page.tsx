import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import RecipesListClient from './RecipesListClient'

export default async function RecipesListPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all recipes for current user
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recipes:', error)
  }

  // Generate signed URLs for recipe images
  const recipesWithSignedUrls = await Promise.all(
    (recipes || []).map(async (recipe) => {
      let signedImageUrl = null
      if (recipe.image_url) {
        try {
          const { data, error: signedUrlError } = await supabase.storage
            .from('recipe_images')
            .createSignedUrl(recipe.image_url, 3600) // 1 hour expiry

          if (!signedUrlError && data) {
            signedImageUrl = data.signedUrl
          }
        } catch (err) {
          console.error('Error creating signed URL:', err)
        }
      }
      return { ...recipe, signedImageUrl }
    })
  )

  return <RecipesListClient recipes={recipesWithSignedUrls || []} />
}
