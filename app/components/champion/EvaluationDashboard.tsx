'use client'

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle, getButtonStyle } from '@/lib/design-system'
import OwnerInvitationCard from './OwnerInvitationCard'
import ChampionSuccessScore from './ChampionSuccessScore'

interface ConfigurationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  icon: string
  route?: string
  completionPercentage: number
}

interface EvaluationStats {
  daysRemaining: number
  overallProgress: number
  readinessScore: number
  valueGenerated: {
    timesSaved: number
    complianceImprovement: number
    costReduction: number
  }
}

export default function EvaluationDashboard() {
  const [evaluationStats, setEvaluationStats] = useState<EvaluationStats>({
    daysRemaining: 14,
    overallProgress: 65,
    readinessScore: 78,
    valueGenerated: {
      timesSaved: 12,
      complianceImprovement: 85,
      costReduction: 2400
    }
  })

  const [configurationSteps, setConfigurationSteps] = useState<ConfigurationStep[]>([
    {
      id: 'business-structure',
      title: 'Business Structure',
      description: 'Configure departments and job titles',
      status: 'completed',
      icon: '🏢',
      route: '/admin/configure',
      completionPercentage: 100
    },
    {
      id: 'team-setup',
      title: 'Team Setup',
      description: 'Add team members and assign roles',
      status: 'in_progress',
      icon: '👥',
      route: '/admin/team',
      completionPercentage: 60
    },
    {
      id: 'compliance-rules',
      title: 'Compliance Rules',
      description: 'Set up compliance workflows and alerts',
      status: 'pending',
      icon: '📋',
      route: '/admin/configure',
      completionPercentage: 20
    },
    {
      id: 'document-templates',
      title: 'Document Templates',
      description: 'Configure document types and templates',
      status: 'pending',
      icon: '📄',
      completionPercentage: 0
    },
    {
      id: 'owner-invitation',
      title: 'Owner Invitation',
      description: 'Invite business owner for approval',
      status: 'pending',
      icon: '👑',
      completionPercentage: 0
    }
  ])

  const [showFeatureTour, setShowFeatureTour] = useState(false)

  useEffect(() => {
    // Load evaluation progress from API
    loadEvaluationProgress()
  }, [])

  const loadEvaluationProgress = async () => {
    try {
      // This would call actual API endpoints
      // For now, using mock data
      
      // Update configuration steps based on actual data
      // const response = await fetch('/api/champion/evaluation-progress')
      // const data = await response.json()
      
      // Mock progress calculation
      const completedSteps = configurationSteps.filter(step => step.status === 'completed').length
      const totalSteps = configurationSteps.length
      const overallProgress = Math.round((completedSteps / totalSteps) * 100)
      
      setEvaluationStats(prev => ({
        ...prev,
        overallProgress
      }))
    } catch (error) {
      console.error('Failed to load evaluation progress:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'in_progress': return 'text-blue-400 bg-blue-500/20'
      case 'pending': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'in_progress': return '🔄'
      case 'pending': return '⏳'
      default: return '❓'
    }
  }

  return (
    <div className="space-y-6">
      {/* Evaluation Header */}
      <div className={getCardStyle('primary')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`${getTextStyle('pageTitle')} flex items-center gap-3`}>
              🚀 Champion Evaluation Mode
            </h1>
            <p className={`${getTextStyle('body')} text-white/70 mt-1`}>
              Set up and demonstrate JiGR's value to get owner approval
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <span className="text-lg font-bold text-yellow-400">
                {evaluationStats.daysRemaining} days left
              </span>
            </div>
            <p className="text-sm text-white/60">Evaluation period</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {evaluationStats.overallProgress}%
            </div>
            <div className="text-sm text-white/60">Setup Progress</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${evaluationStats.overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {evaluationStats.readinessScore}%
            </div>
            <div className="text-sm text-white/60">Readiness Score</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${evaluationStats.readinessScore}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              ${evaluationStats.valueGenerated.costReduction}
            </div>
            <div className="text-sm text-white/60">Annual Savings</div>
            <div className="text-xs text-green-400 mt-2">
              +{evaluationStats.valueGenerated.timesSaved}h/week saved
            </div>
          </div>
        </div>
      </div>

      {/* Champion Success Score */}
      <ChampionSuccessScore />

      {/* Feature Tour CTA */}
      {!showFeatureTour && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-purple-300 mb-1">🎯 New to JiGR?</h3>
              <p className="text-sm text-purple-200">
                Take a quick tour to see all the features you can demonstrate to the owner
              </p>
            </div>
            <button
              onClick={() => setShowFeatureTour(true)}
              className={`${getButtonStyle('primary')} px-6`}
            >
              Start Tour
            </button>
          </div>
        </div>
      )}

      {/* Configuration Steps */}
      <div className={getCardStyle('primary')}>
        <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>📋 Configuration Checklist</h2>
        
        <div className="space-y-4">
          {configurationSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-lg">{getStatusIcon(step.status)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-white/60">{step.description}</p>
                  
                  {/* Progress bar for in-progress items */}
                  {step.status === 'in_progress' && step.completionPercentage > 0 && (
                    <div className="mt-2">
                      <div className="w-48 bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full"
                          style={{ width: `${step.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/60 mt-1 block">
                        {step.completionPercentage}% complete
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(step.status)}`}>
                  <span className="text-sm font-medium capitalize">{step.status.replace('_', ' ')}</span>
                </div>
                
                {step.route && step.status !== 'completed' && (
                  <a
                    href={step.route}
                    className={`${getButtonStyle('outline')} px-4 py-2 text-sm`}
                  >
                    {step.status === 'pending' ? 'Start' : 'Continue'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/40">
          <h4 className="font-medium text-blue-300 mb-2">🎯 What's Next?</h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Complete your team setup by adding key staff members</li>
            <li>• Configure compliance rules for your specific business type</li>
            <li>• Invite the business owner once you're satisfied with the setup</li>
            <li>• Be ready to demo the system and explain the value proposition</li>
          </ul>
        </div>
      </div>

      {/* Owner Invitation Section */}
      <OwnerInvitationCard />

      {/* Value Demonstration Tools */}
      <div className={getCardStyle('primary')}>
        <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>📈 Value Demonstration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              ⏱️ Time Savings Calculator
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Manual compliance checks:</span>
                <span className="text-red-400">4 hours/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">With JiGR automation:</span>
                <span className="text-green-400">30 minutes/week</span>
              </div>
              <div className="flex justify-between font-medium border-t border-white/20 pt-2">
                <span className="text-white">Time saved:</span>
                <span className="text-blue-400">3.5 hours/week</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              💰 Cost Benefit Analysis
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Staff time saved (annual):</span>
                <span className="text-green-400">$8,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Compliance risk reduction:</span>
                <span className="text-green-400">$5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">JiGR annual cost:</span>
                <span className="text-red-400">-$1,200</span>
              </div>
              <div className="flex justify-between font-medium border-t border-white/20 pt-2">
                <span className="text-white">Net annual benefit:</span>
                <span className="text-blue-400">$12,200</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className={`${getButtonStyle('outline')} flex-1`}>
            📊 Generate ROI Report
          </button>
          <button className={`${getButtonStyle('outline')} flex-1`}>
            📋 Export Configuration Summary
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={getCardStyle('primary')}>
        <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>⚡ Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/configure"
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🏢</span>
            <span className="text-sm font-medium">Configure Business</span>
          </a>
          
          <a
            href="/admin/team"
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">👥</span>
            <span className="text-sm font-medium">Manage Team</span>
          </a>
          
          <button
            onClick={() => setShowFeatureTour(true)}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🎯</span>
            <span className="text-sm font-medium">Feature Tour</span>
          </button>
          
          <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center">
            <span className="text-2xl block mb-2">📞</span>
            <span className="text-sm font-medium">Get Help</span>
          </button>
        </div>
      </div>
    </div>
  )
}