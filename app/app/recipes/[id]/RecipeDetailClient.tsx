'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabaseClient'

interface Recipe {
  id: string
  user_id: string
  title: string
  description: string | null
  ingredients: string[]
  instructions: string[]
  tags: string[]
  image_url: string | null
  is_public: boolean
  share_slug: string | null
  created_at: string
}

interface RecipeDetailClientProps {
  recipe: Recipe
  signedImageUrl: string | null
  isOwner: boolean
}

function generateShareSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  const length = 20
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function RecipeDetailClient({
  recipe: initialRecipe,
  signedImageUrl,
  isOwner,
}: RecipeDetailClientProps) {
  const supabase = createClient()
  const [recipe, setRecipe] = useState(initialRecipe)
  const [loading, setLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showSharePopover, setShowSharePopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowSharePopover(false)
      }
    }

    if (showSharePopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSharePopover])

  const handleCreateShareLink = async () => {
    setLoading(true)
    try {
      const shareSlug = generateShareSlug()
      const { error } = await supabase
        .from('recipes')
        .update({
          is_public: true,
          share_slug: shareSlug,
        })
        .eq('id', recipe.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setRecipe({ ...recipe, is_public: true, share_slug: shareSlug })
    } catch (err: any) {
      console.error('Error creating share link:', err)
      const errorMessage = err?.message || err?.toString() || 'Unknown error'
      alert(`שגיאה ביצירת קישור שיתוף: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!recipe.share_slug) return

    const shareUrl = `${window.location.origin}/r/${recipe.share_slug}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }

  const handleDisableSharing = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('recipes')
        .update({
          is_public: false,
          share_slug: null,
        })
        .eq('id', recipe.id)

      if (error) throw error

      setRecipe({ ...recipe, is_public: false, share_slug: null })
    } catch (err) {
      console.error('Error disabling sharing:', err)
      alert('שגיאה בביטול שיתוף')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
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

          {/* Share Icon - Only for owner */}
          {isOwner && (
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setShowSharePopover(!showSharePopover)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
                title="שיתוף"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </button>

              {/* Share Popover */}
              {showSharePopover && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                  {!recipe.is_public || !recipe.share_slug ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">שיתוף המתכון דרך קישור</p>
                      <button
                        onClick={() => {
                          handleCreateShareLink()
                          setShowSharePopover(false)
                        }}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'יוצר קישור...' : 'יצירת קישור'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          קישור שיתוף
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${recipe.share_slug}`}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-gray-50 truncate"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
                            title="העתקה"
                          >
                            <span>📋</span>
                            <span>{copySuccess ? 'הועתק' : 'העתקה'}</span>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleDisableSharing()
                          setShowSharePopover(false)
                        }}
                        disabled={loading}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'מבטל...' : 'ביטול שיתוף'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {signedImageUrl && (
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
      )}

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="mb-8">
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
        <div className="mb-8">
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
        <div className="mb-8">
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

      {/* Metadata */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          נוצר ב-
          {new Date(recipe.created_at).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}
