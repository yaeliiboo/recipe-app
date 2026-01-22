'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

const CATEGORIES = ['מרקים', 'צמחוני', 'אסייתי', 'סלטים', 'קינוחים', 'אחר']

export default function NewRecipePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [sourceLink, setSourceLink] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError('') // Clear any previous errors
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReplaceImage = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Require image for now
      if (!imageFile) {
        setError('יש להעלות צילום מסך')
        setLoading(false)
        return
      }

      // Generate recipe ID
      const recipeId = uuidv4()
      let imageUrl = null

      // Upload image
      const fileExt = imageFile.name.split('.').pop() || 'png'
      const filePath = `${user.id}/${recipeId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('recipe_images')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('שגיאה בהעלאת התמונה. נסי שוב.')
      }

      imageUrl = filePath

      // Parse ingredients
      const ingredientsArray = ingredients
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      // Parse instructions
      const instructionsArray = instructions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      // Determine final category
      const finalCategory = category === 'אחר' ? customCategory : category

      // Save recipe
      const { error: insertError } = await supabase
        .from('recipes')
        .insert({
          id: recipeId,
          user_id: user.id,
          title: title || 'ללא כותרת',
          description: sourceLink || null,
          ingredients: ingredientsArray,
          instructions: instructionsArray,
          tags: finalCategory ? [finalCategory] : [],
          image_url: imageUrl,
          is_public: false,
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('משהו השתבש. נסי שוב.')
      }

      // Navigate to recipe page
      router.push(`/app/recipes/${recipeId}`)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'משהו השתבש. נסי שוב.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">מתכון חדש</h1>
      <p className="text-sm text-gray-600 mb-2">
        אפשר לשמור מתכון גם חלקי. רק צילום מסך חובה.
      </p>
      <p className="text-xs text-gray-500 mb-8">
        אפשר לשמור גם בלי למלא הכל. תמיד אפשר לערוך אחר כך.
      </p>

      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            העלאת צילום מסך <span className="text-red-500">*</span>
          </label>
          {!imagePreview ? (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReplaceImage}
                  className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 transition-colors"
                >
                  החלפת תמונה
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  הסרת תמונה
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Source Link - moved here */}
        <div>
          <label htmlFor="sourceLink" className="block text-sm font-medium text-gray-700 mb-2">
            קישור מקור <span className="text-gray-400">(אופציונלי)</span>
          </label>
          <input
            id="sourceLink"
            type="url"
            value={sourceLink}
            onChange={(e) => setSourceLink(e.target.value)}
            placeholder="הדביקי קישור לאתר/וידאו"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            כותרת <span className="text-gray-400">(אופציונלי)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל: מרק עדשים כתומות"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            קטגוריה <span className="text-gray-400">(אופציונלי)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {category === 'אחר' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="כתבי קטגוריה משלך"
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Ingredients */}
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
            מרכיבים <span className="text-gray-400">(אופציונלי)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            אפשר להדביק כאן רשימה, או למלא אחר כך
          </p>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="שורה לכל מרכיב, למשל:&#10;2 ביצים&#10;כוס קמח&#10;מלח"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Preparation Steps */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            שלבי הכנה <span className="text-gray-400">(אופציונלי)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            שורה לכל שלב
          </p>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="שורה לכל שלב, למשל:&#10;מחממים תנור ל-180 מעלות&#10;מערבבים את החומרים היבשים&#10;מוסיפים את הביצים"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 left-0 right-0 mt-8 pt-4 pb-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={loading || !imageFile}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'שומר...' : 'שמירה'}
        </button>
      </div>
    </div>
  )
}
