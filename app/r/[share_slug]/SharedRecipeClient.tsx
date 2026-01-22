'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  instructions: string[]
  tags: string[]
  image_url: string | null
  created_at: string
}

interface SharedRecipeClientProps {
  recipe: Recipe
}

export default function SharedRecipeClient({ recipe }: SharedRecipeClientProps) {
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!recipe.image_url) {
        setImageLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/signed-image?path=${encodeURIComponent(recipe.image_url)}`
        )
        const data = await response.json()

        if (data.signedUrl) {
          setSignedImageUrl(data.signedUrl)
        }
      } catch (err) {
        console.error('Error fetching signed URL:', err)
      } finally {
        setImageLoading(false)
      }
    }

    fetchSignedUrl()
  }, [recipe.image_url])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {recipe.title}
          </h1>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex gap-2">
              {recipe.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image */}
        {imageLoading ? (
          <div className="mb-8">
            <div className="w-full aspect-video rounded-lg bg-gray-200 animate-pulse" />
          </div>
        ) : signedImageUrl ? (
          <div className="mb-8">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={signedImageUrl}
                alt={recipe.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ) : null}

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">מרכיבים</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preparation Steps */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">שלבי הכנה</h2>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Source Link */}
        {recipe.description && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">מקור</h2>
            <a
              href={recipe.description}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline break-all"
            >
              {recipe.description}
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            מתכון שותף דרך אפליקציית מתכונים
          </p>
        </div>
      </div>
    </div>
  )
}
