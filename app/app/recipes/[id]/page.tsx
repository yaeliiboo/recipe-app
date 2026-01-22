import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import RecipeDetailClient from './RecipeDetailClient'

export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch recipe
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !recipe) {
    redirect('/app')
  }

  // Check if current user is the owner
  const isOwner = recipe.user_id === user.id

  // Get signed URL for image if exists
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

  return (
    <RecipeDetailClient
      recipe={recipe}
      signedImageUrl={signedImageUrl}
      isOwner={isOwner}
    />
  )
}
