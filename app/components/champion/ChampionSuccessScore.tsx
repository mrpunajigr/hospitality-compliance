'use client'

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle, getButtonStyle } from '@/lib/design-system'

interface SuccessScoreBreakdown {
  configurationQuality: {
    score: number
    maxScore: number
    percentage: number
  }
  valueArticulation: {
    score: number
    maxScore: number
    percentage: number
  }
  readinessIndicators: {
    score: number
    maxScore: number
    percentage: number
  }
}

interface SuccessScoreData {
  score: number
  breakdown: SuccessScoreBreakdown
  recommendations: string[]
  guidance: string
}

export default function ChampionSuccessScore() {
  const [successScore, setSuccessScore] = useState<SuccessScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    loadSuccessScore()
  }, [])

  const loadSuccessScore = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/champion/success-score')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load success score')
      }

      setSuccessScore(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load success score')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500'
    if (score >= 75) return 'from-blue-500 to-cyan-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🏆'
    if (score >= 75) return '🎯'
    if (score >= 60) return '📈'
    return '🚀'
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-blue-400'
    if (percentage >= 40) return 'text-yellow-400'
    return 'text-orange-400'
  }

  if (isLoading) {
    return (
      <div className={`${getCardStyle('primary')} p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white/60">Calculating success score...</span>
        </div>
      </div>
    )
  }

  if (error || !successScore) {
    return (
      <div className={`${getCardStyle('primary')} p-6`}>
        <div className="text-center">
          <span className="text-2xl block mb-2">❓</span>
          <p className="text-white/70">{error || 'Unable to calculate success score'}</p>
          <button
            onClick={loadSuccessScore}
            className={`${getButtonStyle('outline')} mt-3`}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={getCardStyle('primary')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`${getTextStyle('cardTitle')} flex items-center gap-2`}>
            🎯 Champion Success Score
          </h2>
          <p className={`${getTextStyle('body')} text-white/70 text-sm`}>
            Track your evaluation setup progress
          </p>
        </div>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-white/60 hover:text-white/80 text-sm"
        >
          {showBreakdown ? 'Hide Details' : 'Show Breakdown'}
        </button>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {/* Circular Progress */}
          <div className="w-32 h-32 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${successScore.score * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={getScoreGradient(successScore.score).split(' ')[0].replace('from-', 'stop-')} />
                  <stop offset="100%" className={getScoreGradient(successScore.score).split(' ')[2].replace('to-', 'stop-')} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(successScore.score)}`}>
                  {successScore.score}
                </div>
                <div className="text-sm text-white/60">/ 100</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Score icon and guidance */}
        <div className="mt-4">
          <span className="text-3xl block mb-2">{getScoreIcon(successScore.score)}</span>
          <p className={`${getTextStyle('body')} text-white/80 max-w-md mx-auto`}>
            {successScore.guidance}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {successScore.recommendations.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/40">
          <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
            💡 Quick Wins
          </h4>
          <ul className="space-y-2">
            {successScore.recommendations.slice(0, 3).map((recommendation, index) => (
              <li key={index} className="text-sm text-blue-200 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <div className="space-y-4">
          <h4 className={`${getTextStyle('cardTitle')} text-sm mb-4`}>Score Breakdown</h4>
          
          {/* Configuration Quality */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏢</span>
                <span className="font-medium text-white">Configuration Quality</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getPercentageColor(successScore.breakdown.configurationQuality.percentage)}`}>
                  {successScore.breakdown.configurationQuality.score}/{successScore.breakdown.configurationQuality.maxScore}
                </div>
                <div className="text-xs text-white/60">
                  {successScore.breakdown.configurationQuality.percentage}%
                </div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getScoreGradient(successScore.breakdown.configurationQuality.percentage)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${successScore.breakdown.configurationQuality.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              Departments, job titles, and team setup completeness
            </p>
          </div>

          {/* Value Articulation */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="font-medium text-white">Value Articulation</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getPercentageColor(successScore.breakdown.valueArticulation.percentage)}`}>
                  {successScore.breakdown.valueArticulation.score}/{successScore.breakdown.valueArticulation.maxScore}
                </div>
                <div className="text-xs text-white/60">
                  {successScore.breakdown.valueArticulation.percentage}%
                </div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getScoreGradient(successScore.breakdown.valueArticulation.percentage)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${successScore.breakdown.valueArticulation.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              ROI data, evaluation messages, and value demonstration
            </p>
          </div>

          {/* Readiness Indicators */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span className="font-medium text-white">Readiness Indicators</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getPercentageColor(successScore.breakdown.readinessIndicators.percentage)}`}>
                  {successScore.breakdown.readinessIndicators.score}/{successScore.breakdown.readinessIndicators.maxScore}
                </div>
                <div className="text-xs text-white/60">
                  {successScore.breakdown.readinessIndicators.percentage}%
                </div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getScoreGradient(successScore.breakdown.readinessIndicators.percentage)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${successScore.breakdown.readinessIndicators.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              Owner invitation preparation and follow-up planning
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={loadSuccessScore}
          className={`${getButtonStyle('outline')} flex-1`}
        >
          🔄 Refresh Score
        </button>
        {successScore.score >= 75 && (
          <button
            onClick={() => window.location.href = '#owner-invitation'}
            className={`${getButtonStyle('primary')} flex-1`}
          >
            👑 Invite Owner
          </button>
        )}
      </div>
    </div>
  )
}