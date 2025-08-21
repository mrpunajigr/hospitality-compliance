'use client'

// DEV TOOL: AI Recommendations Validation Suite
// Tests recommendation accuracy and contextual relevance

import { useState } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface Recommendation {
  type: 'critical' | 'important' | 'suggestion'
  title: string
  description: string
  action: string
  impact: string
}

interface TestScenario {
  name: string
  description: string
  metrics: {
    complianceRate?: number
    avgTemperature?: number
    riskSuppliers?: Array<{name: string; complianceRate: number}>
  }
  expectedRecommendations: string[]
  context: string
}

// Test scenarios covering different business situations
const testScenarios: TestScenario[] = [
  {
    name: 'Critical Compliance Failure',
    description: 'Restaurant with severe compliance issues',
    metrics: {
      complianceRate: 65,
      avgTemperature: 6.2,
      riskSuppliers: [
        { name: 'Unreliable Foods Ltd', complianceRate: 45 },
        { name: 'Budget Meats Co', complianceRate: 55 }
      ]
    },
    expectedRecommendations: [
      'Low Compliance Rate Alert',
      'High-Risk Suppliers Identified', 
      'Temperature Trend Concern'
    ],
    context: 'Multi-issue scenario requiring immediate intervention'
  },
  {
    name: 'Temperature Risk Only',
    description: 'Good compliance but temperature concerns',
    metrics: {
      complianceRate: 92,
      avgTemperature: 4.8,
      riskSuppliers: []
    },
    expectedRecommendations: [
      'Temperature Trend Concern'
    ],
    context: 'Single-issue scenario requiring monitoring'
  },
  {
    name: 'Supplier Management Issue',
    description: 'Overall good performance but problem suppliers',
    metrics: {
      complianceRate: 88,
      avgTemperature: 2.1,
      riskSuppliers: [
        { name: 'Problematic Supplier Inc', complianceRate: 70 }
      ]
    },
    expectedRecommendations: [
      'High-Risk Suppliers Identified'
    ],
    context: 'Supplier-specific intervention needed'
  },
  {
    name: 'Excellent Performance',
    description: 'Outstanding compliance across all metrics',
    metrics: {
      complianceRate: 98,
      avgTemperature: 1.8,
      riskSuppliers: []
    },
    expectedRecommendations: [
      'Excellent Compliance Performance'
    ],
    context: 'Positive reinforcement and best practice documentation'
  },
  {
    name: 'Borderline Performance',
    description: 'Just above thresholds but no major issues',
    metrics: {
      complianceRate: 87,
      avgTemperature: 3.8,
      riskSuppliers: []
    },
    expectedRecommendations: [],
    context: 'No immediate action needed - monitoring recommended'
  }
]

// Replicate the recommendation logic from EnhancedComplianceDashboard
const generateRecommendations = (metrics: any): Recommendation[] => {
  const recommendations: Recommendation[] = []
  
  // Critical recommendations
  if (metrics.complianceRate && metrics.complianceRate < 85) {
    recommendations.push({
      type: 'critical',
      title: 'Low Compliance Rate Alert',
      description: `Your compliance rate is ${metrics.complianceRate}%, below the 85% safety threshold.`,
      action: 'Review supplier contracts and temperature monitoring procedures immediately.',
      impact: 'Prevents health inspection violations and food safety incidents'
    })
  }
  
  // Supplier-based recommendations
  if (metrics.riskSuppliers && metrics.riskSuppliers.length > 0) {
    recommendations.push({
      type: 'important',
      title: 'High-Risk Suppliers Identified',
      description: `${metrics.riskSuppliers.length} supplier(s) showing poor compliance patterns.`,
      action: `Contact ${metrics.riskSuppliers[0].name} to discuss temperature control improvements.`,
      impact: 'Reduces violation risk by 30-40% through proactive supplier management'
    })
  }
  
  // Temperature-based insights
  if (metrics.avgTemperature && metrics.avgTemperature > 4.0) {
    recommendations.push({
      type: 'important',
      title: 'Temperature Trend Concern',
      description: `Average delivery temperature is ${metrics.avgTemperature}°C, approaching risk zone.`,
      action: 'Implement additional temperature monitoring during transport.',
      impact: 'Maintains food safety and prevents spoilage costs'
    })
  }
  
  // Positive reinforcement
  if (metrics.complianceRate && metrics.complianceRate >= 95) {
    recommendations.push({
      type: 'suggestion',
      title: 'Excellent Compliance Performance',
      description: `Outstanding ${metrics.complianceRate}% compliance rate achieved.`,
      action: 'Document current procedures as best practices for training.',
      impact: 'Maintains high standards and reduces operational risk'
    })
  }
  
  return recommendations
}

export default function TestAIRecommendationsPage() {
  const [results, setResults] = useState<any[] | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  
  const runValidation = () => {
    console.log('🧠 Running AI recommendations validation...')
    
    const validationResults = testScenarios.map((scenario, index) => {
      const actualRecommendations = generateRecommendations(scenario.metrics)
      const actualTitles = actualRecommendations.map(rec => rec.title)
      
      const matches = scenario.expectedRecommendations.every(expected => 
        actualTitles.includes(expected)
      )
      
      const extraRecommendations = actualTitles.filter(actual => 
        !scenario.expectedRecommendations.includes(actual)
      )
      
      const missingRecommendations = scenario.expectedRecommendations.filter(expected => 
        !actualTitles.includes(expected)
      )
      
      console.log(`📊 Scenario ${index + 1} (${scenario.name}):`, {
        expected: scenario.expectedRecommendations,
        actual: actualTitles,
        matches,
        extra: extraRecommendations,
        missing: missingRecommendations
      })
      
      return {
        scenario,
        actualRecommendations,
        actualTitles,
        matches,
        extraRecommendations,
        missingRecommendations,
        score: matches && extraRecommendations.length === 0 && missingRecommendations.length === 0 ? 100 : 
               matches ? 75 : 25
      }
    })
    
    setResults(validationResults)
  }
  
  const getScenarioIcon = (score: number) => {
    if (score === 100) return '✅'
    if (score >= 75) return '⚠️'
    return '❌'
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/chef-workspace1jpg.jpg')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      
        <div className={getCardStyle('primary')}>
          <div className="text-center mb-8">
            <h1 className={`${getTextStyle('pageTitle')} text-white mb-4`}>
              🧠 AI Recommendations Validation Suite
            </h1>
            <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
              Tests contextual accuracy and business relevance of AI-generated compliance recommendations
            </p>
            
            <button
              onClick={runValidation}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Validate AI Recommendations
            </button>
          </div>
        </div>

        {/* Test Scenarios Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {testScenarios.map((scenario, index) => (
            <div key={index} className={getCardStyle('secondary')}>
              <div className="p-4">
                <h3 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
                  {scenario.name}
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  {scenario.description}
                </p>
                
                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="text-xs text-white/80 space-y-1">
                    <div>Compliance: {scenario.metrics.complianceRate}%</div>
                    <div>Temperature: {scenario.metrics.avgTemperature}°C</div>
                    <div>Risk Suppliers: {scenario.metrics.riskSuppliers?.length || 0}</div>
                  </div>
                </div>
                
                <div className="text-xs text-white/60">
                  Expected: {scenario.expectedRecommendations.length} recommendations
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Results */}
        {results && (
          <div className={getCardStyle('form')}>
            <div className="p-6">
              <h2 className={`${getTextStyle('sectionTitle')} text-gray-900 mb-6`}>
                🔍 Validation Results
              </h2>
              
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{getScenarioIcon(result.score)}</span>
                          <span>{result.scenario.name}</span>
                        </h3>
                        <p className="text-sm text-gray-600">{result.scenario.context}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.score === 100 ? 'bg-green-100 text-green-800' :
                        result.score >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Score: {result.score}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Recommendations</h4>
                        <div className="space-y-1">
                          {result.scenario.expectedRecommendations.map((rec: string, i: number) => (
                            <div key={i} className={`text-xs px-2 py-1 rounded ${
                              result.actualTitles.includes(rec) 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {result.actualTitles.includes(rec) ? '✅' : '❌'} {rec}
                            </div>
                          ))}
                          {result.scenario.expectedRecommendations.length === 0 && (
                            <div className="text-xs text-gray-500 italic">No recommendations expected</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Actual Recommendations</h4>
                        <div className="space-y-1">
                          {result.actualRecommendations.map((rec: Recommendation, i: number) => (
                            <div key={i} className={`text-xs px-2 py-1 rounded ${
                              rec.type === 'critical' ? 'bg-red-100 text-red-700' :
                              rec.type === 'important' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {rec.type === 'critical' ? '🚨' : rec.type === 'important' ? '⚠️' : '💡'} {rec.title}
                            </div>
                          ))}
                          {result.actualRecommendations.length === 0 && (
                            <div className="text-xs text-gray-500 italic">No recommendations generated</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(result.extraRecommendations.length > 0 || result.missingRecommendations.length > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {result.extraRecommendations.length > 0 && (
                          <div className="text-xs text-orange-600 mb-1">
                            Extra: {result.extraRecommendations.join(', ')}
                          </div>
                        )}
                        {result.missingRecommendations.length > 0 && (
                          <div className="text-xs text-red-600">
                            Missing: {result.missingRecommendations.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Overall Summary */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Validation Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.score === 100).length}
                    </div>
                    <div className="text-xs text-gray-600">Perfect Match</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.filter(r => r.score >= 75 && r.score < 100).length}
                    </div>
                    <div className="text-xs text-gray-600">Partial Match</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.filter(r => r.score < 75).length}
                    </div>
                    <div className="text-xs text-gray-600">Poor Match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}