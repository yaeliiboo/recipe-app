'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Recipe {
  id: string
  title: string
  tags: string[]
  ingredients: string[]
  instructions: string[]
  created_at: string
  signedImageUrl: string | null
}

export default function RecipesListClient({ recipes }: { recipes: Recipe[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Extract all unique categories from user's recipes
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>()
    recipes.forEach((recipe) => {
      recipe.tags?.forEach((tag) => {
        if (tag) categoriesSet.add(tag)
      })
    })
    return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b, 'he'))
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    let filtered = recipes

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((recipe) =>
        recipe.tags?.includes(selectedCategory)
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((recipe) => {
        const titleMatch = recipe.title?.toLowerCase().includes(query)
        const ingredientsMatch = recipe.ingredients?.some((ing) =>
          ing.toLowerCase().includes(query)
        )
        const instructionsMatch = recipe.instructions?.some((inst) =>
          inst.toLowerCase().includes(query)
        )
        return titleMatch || ingredientsMatch || instructionsMatch
      })
    }

    return filtered
  }, [recipes, selectedCategory, searchQuery])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">המתכונים שלי</h1>
        <Link
          href="/app/recipes/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          + מתכון חדש
        </Link>
      </div>

      {/* Filters and Search */}
      {recipes.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder="חיפוש במתכונים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filters */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                הכל
              </button>
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty States */}
      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">עדיין אין מתכונים</p>
          <Link
            href="/app/recipes/new"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            צרי מתכון ראשון
          </Link>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">לא נמצאו מתכונים</p>
          <p className="text-sm text-gray-400 mb-4">
            נסי לשנות את הסינון או החיפוש
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSearchQuery('')
            }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            איפוס סינונים
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/app/recipes/${recipe.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {recipe.signedImageUrl ? (
                <div className="relative w-full aspect-video bg-gray-100">
                  <Image
                    src={recipe.signedImageUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">ללא תמונה</span>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {recipe.title || 'ללא כותרת'}
                </h2>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {recipe.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500">
                  {new Date(recipe.created_at).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
