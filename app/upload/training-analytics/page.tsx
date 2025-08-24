'use client'

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import TrainingNavigation from '@/components/training/TrainingNavigation'

interface TrainingAnalytics {
  totalCorrections: number
  averageReviewTime: number
  correctionsToday: number
  accuracyTrend: Array<{
    correction_type: string
    correction_count: number
    accuracy_score: number
  }>
}

interface BulkStats {
  totalBulkRecords: number
  completedProcessing: number
  failedProcessing: number
  averageConfidence: number
  readyForTraining: number
  lastBulkUpload: string | null
}

export default function TrainingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null)
  const [bulkStats, setBulkStats] = useState<BulkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingData, setExportingData] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Load training analytics (skip for now to avoid errors)
      console.log('Analytics APIs temporarily disabled to avoid 500 errors')
      
      // TODO: Fix client ID authentication and enable these APIs
      // const analyticsResponse = await fetch('/api/training-corrections?type=analytics&clientId=demo-client-id')
      // const bulkResponse = await fetch('/api/bulk-process-dockets?clientId=demo-client-id')

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportTrainingData = async (format: 'automl' | 'documentai' | 'jsonl') => {
    setExportingData(true)
    try {
      const response = await fetch(`/api/export-training-data?clientId=demo-client-id&format=${format}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `training-data-${format}-${new Date().toISOString().split('T')[0]}.${format === 'jsonl' ? 'jsonl' : 'json'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Export failed:', await response.text())
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportingData(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className={getTextStyle('body')}>Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const getAccuracyColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const overallAccuracy = (analytics?.accuracyTrend?.length ?? 0) > 0
    ? analytics.accuracyTrend.reduce((sum, item) => sum + item.accuracy_score, 0) / analytics.accuracyTrend.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation */}
        <TrainingNavigation />
        
        {/* Header */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <h1 className={`${getTextStyle('pageTitle')} text-white mb-2`}>
              AI Training Analytics
            </h1>
            <p className={`${getTextStyle('body')} text-slate-300`}>
              Track AI accuracy improvements and training data quality
            </p>
          </div>
        </div>

        {/* Training Stats Overview */}
        {analytics && (
          <div className={getCardStyle('secondary')}>
            <div className="p-6">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                Training Review Progress
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white">{analytics.totalCorrections}</div>
                  <div className="text-sm text-slate-400">Total Reviews</div>
                </div>
                
                <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400">{analytics.correctionsToday}</div>
                  <div className="text-sm text-slate-400">Reviews Today</div>
                </div>
                
                <div className="text-center p-4 bg-purple-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-purple-400">
                    {formatTime(analytics.averageReviewTime)}
                  </div>
                  <div className="text-sm text-slate-400">Avg Review Time</div>
                </div>
                
                <div className="text-center p-4 bg-green-900/30 rounded-lg">
                  <div className={`text-3xl font-bold ${getAccuracyColor(overallAccuracy)}`}>
                    {overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Overall Accuracy</div>
                </div>
              </div>

              {/* Correction Types Breakdown */}
              {analytics.accuracyTrend.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Correction Types</h3>
                  <div className="space-y-2">
                    {analytics.accuracyTrend.map((trend, index) => {
                      const percentage = analytics.totalCorrections > 0 
                        ? (trend.correction_count / analytics.totalCorrections) * 100 
                        : 0
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              trend.correction_type === 'correct' ? 'bg-green-100 text-green-800' :
                              trend.correction_type === 'wrong' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {trend.correction_type.toUpperCase()}
                            </span>
                            <span className="text-white">{trend.correction_count} reviews</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-400">{percentage.toFixed(1)}%</div>
                            <div className={`text-sm font-medium ${getAccuracyColor(trend.accuracy_score)}`}>
                              {trend.accuracy_score.toFixed(1)}% accuracy
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Processing Stats */}
        {bulkStats && (
          <div className={getCardStyle('secondary')}>
            <div className="p-6">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                Bulk Processing Status
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white">{bulkStats.totalBulkRecords}</div>
                  <div className="text-sm text-slate-400">Total Uploaded</div>
                </div>
                
                <div className="text-center p-4 bg-green-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">{bulkStats.completedProcessing}</div>
                  <div className="text-sm text-slate-400">Successfully Processed</div>
                </div>
                
                <div className="text-center p-4 bg-red-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-red-400">{bulkStats.failedProcessing}</div>
                  <div className="text-sm text-slate-400">Failed Processing</div>
                </div>
                
                <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                  <div className={`text-3xl font-bold ${getAccuracyColor(bulkStats.averageConfidence * 100)}`}>
                    {(bulkStats.averageConfidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Avg AI Confidence</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-400">{bulkStats.readyForTraining}</div>
                  <div className="text-sm text-slate-400">Ready for Training</div>
                </div>
                
                <div className="text-center p-4 bg-purple-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {bulkStats.lastBulkUpload 
                      ? new Date(bulkStats.lastBulkUpload).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-slate-400">Last Upload</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Data Export */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Export Training Data
            </h2>
            
            <p className={`${getTextStyle('body')} text-slate-300 mb-6`}>
              Export human-corrected training data for Google Cloud AI model improvement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => exportTrainingData('automl')}
                disabled={exportingData}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Export for AutoML
              </button>
              
              <button
                onClick={() => exportTrainingData('documentai')}
                disabled={exportingData}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Export for Document AI
              </button>
              
              <button
                onClick={() => exportTrainingData('jsonl')}
                disabled={exportingData}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Export as JSONL
              </button>
            </div>

            {exportingData && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Exporting training data...</span>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Quick Actions</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <a
                  href="/upload/bulk-training"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📁 Bulk Upload Dockets
                </a>
                
                <a
                  href="/upload/training"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ✏️ Review & Correct AI Data
                </a>
                
                <a
                  href="/console/dashboard"
                  className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📊 View Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={getCardStyle('secondary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Training Workflow
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="text-white font-medium">Bulk Upload Documents</h3>
                  <p className="text-slate-400 text-sm">Upload your large collection of delivery dockets for AI processing</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="text-white font-medium">Review AI Extractions</h3>
                  <p className="text-slate-400 text-sm">Correct AI mistakes and mark good extractions to improve accuracy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="text-white font-medium">Export Training Data</h3>
                  <p className="text-slate-400 text-sm">Generate formatted training data for Google Cloud AI model training</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h3 className="text-white font-medium">Retrain AI Model</h3>
                  <p className="text-slate-400 text-sm">Use exported data to create custom Google Cloud Document AI processor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}