import { createClient } from '@/lib/supabaseServer'
import SharedRecipeClient from './SharedRecipeClient'

export default async function SharedRecipePage({
  params,
}: {
  params: { share_slug: string }
}) {
  const supabase = await createClient()

  // Fetch recipe by share_slug (no auth required - uses anon policy)
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('share_slug', params.share_slug)
    .eq('is_public', true)
    .single()

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            המתכון לא נמצא או שאינו משותף
          </h1>
          <p className="text-gray-600">
            ייתכן שהקישור אינו תקין או שהמתכון אינו משותף יותר
          </p>
        </div>
      </div>
    )
  }

  return <SharedRecipeClient recipe={recipe} />
}
