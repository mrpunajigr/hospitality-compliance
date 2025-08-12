'use client'

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

interface BackgroundSelectorProps {
  selectedBackground: string
  onBackgroundChange: (background: BackgroundAsset) => void
  onClose: () => void
  theme?: 'light' | 'dark'
}

export default function BackgroundSelector({
  selectedBackground,
  onBackgroundChange,
  onClose,
  theme = 'dark'
}: BackgroundSelectorProps) {
  const [backgrounds, setBackgrounds] = useState<BackgroundAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchBackgrounds()
  }, [])

  const fetchBackgrounds = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/assets/upload?type=background')
      const data = await response.json()

      if (data.success) {
        setBackgrounds(data.assets)
      } else {
        setError('Failed to load backgrounds')
      }
    } catch (err) {
      setError('Error loading backgrounds')
      console.error('Background fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'all', label: 'All Backgrounds' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'office', label: 'Office' },
    { value: 'neutral', label: 'Neutral' }
  ]

  const filteredBackgrounds = selectedCategory === 'all' 
    ? backgrounds 
    : backgrounds.filter(bg => bg.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy contrast'
      case 'medium': return 'Medium contrast'
      case 'hard': return 'Hard contrast'
      default: return 'Unknown'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl ${getCardStyle('form', theme)}`}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/20">
            <div>
              <h2 className={`${getTextStyle('cardTitle', theme)} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🖼️ Select Background
              </h2>
              <p className={`${getTextStyle('body', theme)} ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mt-1`}>
                Choose a background to test your design system
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-white/70 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Category Filter */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className={`ml-3 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  Loading backgrounds...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mb-2`}>
                  {error}
                </div>
                <button
                  onClick={fetchBackgrounds}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredBackgrounds.length === 0 ? (
              <div className="text-center py-12">
                <div className={`${theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-4`}>
                  No backgrounds found in this category
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBackgrounds.map((background) => (
                  <div
                    key={background.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedBackground === background.file_url
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : theme === 'dark'
                          ? 'border-white/20 hover:border-white/40'
                          : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => onBackgroundChange(background)}
                  >
                    {/* Background Preview */}
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      <img
                        src={background.file_url}
                        alt={background.alt_text || background.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      {/* Difficulty Indicator */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getDifficultyColor(background.difficulty)}`}
                          title={getDifficultyLabel(background.difficulty)}
                        />
                      </div>

                      {/* Selected Indicator */}
                      {selectedBackground === background.file_url && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-1">
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Background Info */}
                    <div className="p-3">
                      <h3 className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {background.name}
                      </h3>
                      {background.category && (
                        <p className={`text-xs capitalize ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                          {background.category}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-500'}>Easy</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-500'}>Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-500'}>Hard</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}