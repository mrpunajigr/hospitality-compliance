'use client'

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle, getButtonStyle } from '@/lib/design-system'

interface Achievement {
  id: string
  title: string
  description: string
  earnedAt: string
  value: string
}

interface Reward {
  id: string
  title: string
  description: string
  type: 'credit' | 'badge' | 'access'
  value: string | number
  claimable: boolean
}

interface IncentiveData {
  immediateValue: {
    earlyAccess: boolean
    professionalDevelopment: string
    personalBrand: string
  }
  achievements: Achievement[]
  availableRewards: Reward[]
  conversionIncentives: {
    referralBonus: any
    careerBenefits: any
  }
  postHandoffValue: {
    retainedPrivileges: string
    prioritySupport: string
    voiceInRoadmap: string
  }
  progressMetrics: any
}

export default function ChampionIncentives() {
  const [incentiveData, setIncentiveData] = useState<IncentiveData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [claimingReward, setClaimingReward] = useState<string | null>(null)

  useEffect(() => {
    loadIncentiveData()
  }, [])

  const loadIncentiveData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/champion/incentives')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load incentive data')
      }

      setIncentiveData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incentive data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimReward = async (reward: Reward) => {
    try {
      setClaimingReward(reward.id)

      const response = await fetch('/api/champion/incentives/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incentiveType: reward.type,
          incentiveId: reward.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim reward')
      }

      // Refresh incentive data after successful claim
      await loadIncentiveData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim reward')
    } finally {
      setClaimingReward(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'earned': return 'text-green-400 bg-green-500/20'
      case 'active': return 'text-blue-400 bg-blue-500/20'
      case 'available': return 'text-purple-400 bg-purple-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'credit': return '💳'
      case 'badge': return '🏆'
      case 'access': return '🔑'
      default: return '🎁'
    }
  }

  if (isLoading) {
    return (
      <div className={`${getCardStyle('primary')} p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white/60">Loading your rewards...</span>
        </div>
      </div>
    )
  }

  if (error || !incentiveData) {
    return (
      <div className={`${getCardStyle('primary')} p-6`}>
        <div className="text-center">
          <span className="text-2xl block mb-2">❓</span>
          <p className="text-white/70">{error || 'Unable to load incentive data'}</p>
          <button
            onClick={loadIncentiveData}
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
            🎁 Champion Rewards
          </h2>
          <p className={`${getTextStyle('body')} text-white/70 text-sm`}>
            Your achievements and available incentives
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">
            {incentiveData.achievements.length} achievements earned
          </div>
        </div>
      </div>

      {/* Immediate Value Section */}
      <div className="mb-6">
        <h3 className={`${getTextStyle('cardTitle')} text-sm mb-3`}>⚡ Immediate Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">🚀</span>
              <span className="font-medium text-green-300">Early Access</span>
            </div>
            <p className="text-sm text-green-200">
              Beta features before public release
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">📚</span>
              <span className="font-medium text-blue-300">Professional Development</span>
            </div>
            <p className="text-sm text-blue-200">
              {incentiveData.immediateValue.professionalDevelopment}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-400">⭐</span>
              <span className="font-medium text-purple-300">Personal Brand</span>
            </div>
            <p className="text-sm text-purple-200">
              {incentiveData.immediateValue.personalBrand}
            </p>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      {incentiveData.availableRewards.length > 0 && (
        <div className="mb-6">
          <h3 className={`${getTextStyle('cardTitle')} text-sm mb-3`}>🎯 Available Rewards</h3>
          <div className="space-y-3">
            {incentiveData.availableRewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon(reward.type)}</span>
                  <div>
                    <h4 className="font-medium text-white">{reward.title}</h4>
                    <p className="text-sm text-white/60">{reward.description}</p>
                    <p className="text-sm text-green-400 mt-1">
                      Value: {typeof reward.value === 'number' ? `$${reward.value}` : reward.value}
                    </p>
                  </div>
                </div>
                
                {reward.claimable && (
                  <button
                    onClick={() => handleClaimReward(reward)}
                    disabled={claimingReward === reward.id}
                    className={`${getButtonStyle('primary')} px-4 py-2 ${
                      claimingReward === reward.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {claimingReward === reward.id ? 'Claiming...' : 'Claim'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${getTextStyle('cardTitle')} text-sm`}>🏆 Achievements</h3>
          {incentiveData.achievements.length > 3 && (
            <button
              onClick={() => setShowAllAchievements(!showAllAchievements)}
              className="text-sm text-white/60 hover:text-white/80"
            >
              {showAllAchievements ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>

        {incentiveData.achievements.length === 0 ? (
          <div className="text-center py-6 text-white/60">
            <span className="text-2xl block mb-2">🎯</span>
            <p>Complete configuration steps to earn your first achievement!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(showAllAchievements ? incentiveData.achievements : incentiveData.achievements.slice(0, 3))
              .map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="text-2xl">🏆</div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{achievement.title}</h4>
                  <p className="text-sm text-white/60">{achievement.description}</p>
                  <p className="text-sm text-green-400">Reward: {achievement.value}</p>
                </div>
                <div className="text-xs text-white/60">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversion Incentives */}
      <div className="mb-6">
        <h3 className={`${getTextStyle('cardTitle')} text-sm mb-3`}>💰 Conversion Bonuses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Referral Bonuses */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              💳 Financial Rewards
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Owner Approval:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(incentiveData.conversionIncentives.referralBonus?.ownerApproval?.status || 'pending')}`}>
                  {incentiveData.conversionIncentives.referralBonus?.ownerApproval?.amount || '$50'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">First Subscription:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(incentiveData.conversionIncentives.referralBonus?.firstSubscription?.status || 'pending')}`}>
                  {incentiveData.conversionIncentives.referralBonus?.firstSubscription?.amount || '$150'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Multi-Location:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor('pending')}`}>
                  Revenue Share
                </span>
              </div>
            </div>
          </div>

          {/* Career Benefits */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              🚀 Career Benefits
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Certification:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(incentiveData.conversionIncentives.careerBenefits?.skillRecognition?.status || 'pending')}`}>
                  Champion Badge
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Network Access:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(incentiveData.conversionIncentives.careerBenefits?.industryNetwork?.status || 'active')}`}>
                  Community
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Content Ops:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(incentiveData.conversionIncentives.careerBenefits?.thoughtLeadership?.status || 'pending')}`}>
                  Speaking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Handoff Value */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40">
        <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
          🔮 Post-Handoff Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-400 font-medium">Power User Status</span>
            <p className="text-blue-200 mt-1">{incentiveData.postHandoffValue.retainedPrivileges}</p>
          </div>
          <div>
            <span className="text-purple-400 font-medium">Priority Support</span>
            <p className="text-purple-200 mt-1">{incentiveData.postHandoffValue.prioritySupport}</p>
          </div>
          <div>
            <span className="text-green-400 font-medium">Feature Influence</span>
            <p className="text-green-200 mt-1">{incentiveData.postHandoffValue.voiceInRoadmap}</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadIncentiveData}
          className={`${getButtonStyle('outline')} px-6`}
        >
          🔄 Refresh Rewards
        </button>
      </div>
    </div>
  )
}