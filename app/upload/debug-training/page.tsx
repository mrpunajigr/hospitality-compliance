'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import TrainingNavigation from '@/components/training/TrainingNavigation'

export default function DebugTrainingPage() {
  const [deliveryRecords, setDeliveryRecords] = useState<any[]>([])
  const [trainingCorrections, setTrainingCorrections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDebugData()
  }, [])

  const loadDebugData = async () => {
    try {
      // Get all delivery records
      const { data: records, error: recordsError } = await supabase
        .from('delivery_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (recordsError) {
        console.error('Error loading delivery records:', recordsError)
      } else {
        setDeliveryRecords(records || [])
        console.log('Delivery records:', records)
      }

      // Get all training corrections
      const { data: corrections, error: correctionsError } = await supabase
        .from('ai_training_corrections')
        .select('*')
        .order('created_at', { ascending: false })

      if (correctionsError) {
        console.error('Error loading training corrections:', correctionsError)
      } else {
        setTrainingCorrections(corrections || [])
        console.log('Training corrections:', corrections)
      }

    } catch (error) {
      console.error('Debug loading error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDebugData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className={getTextStyle('body')}>Loading debug data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation */}
        <TrainingNavigation />
        
        {/* Header */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`${getTextStyle('pageTitle')} text-white mb-2`}>
                  Debug Training Data
                </h1>
                <p className={`${getTextStyle('body')} text-slate-300`}>
                  Check what records are in the database
                </p>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg 
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Records */}
        <div className={getCardStyle('secondary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Delivery Records ({deliveryRecords.length})
            </h2>
            
            {deliveryRecords.length === 0 ? (
              <p className="text-slate-400">No delivery records found</p>
            ) : (
              <div className="space-y-4">
                {deliveryRecords.map((record, index) => (
                  <div key={record.id} className="p-4 bg-slate-800 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong className="text-white">ID:</strong> 
                        <div className="text-slate-300 font-mono text-xs">{record.id}</div>
                      </div>
                      <div>
                        <strong className="text-white">Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          record.processing_status === 'completed' ? 'bg-green-800 text-green-200' :
                          record.processing_status === 'failed' ? 'bg-red-800 text-red-200' :
                          'bg-yellow-800 text-yellow-200'
                        }`}>
                          {record.processing_status}
                        </span>
                      </div>
                      <div>
                        <strong className="text-white">Created:</strong> 
                        <div className="text-slate-300">{new Date(record.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <strong className="text-white">Supplier:</strong> 
                        <div className="text-slate-300">{record.supplier_name || 'Not detected'}</div>
                      </div>
                      <div>
                        <strong className="text-white">Image Path:</strong> 
                        <div className="text-slate-300 text-xs">{record.image_path}</div>
                      </div>
                      <div>
                        <strong className="text-white">Confidence:</strong> 
                        <div className="text-slate-300">{record.confidence_score ? `${(record.confidence_score * 100).toFixed(1)}%` : 'N/A'}</div>
                      </div>
                    </div>
                    
                    {record.error_message && (
                      <div className="mt-3 p-3 bg-red-900/30 rounded text-red-200 text-sm">
                        <strong>Error:</strong> {record.error_message}
                      </div>
                    )}

                    {record.raw_extracted_text && (
                      <div className="mt-3 p-3 bg-slate-700/50 rounded">
                        <strong className="text-white text-sm">Raw Text:</strong>
                        <div className="text-slate-300 text-xs mt-1 max-h-20 overflow-y-auto">
                          {record.raw_extracted_text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Training Corrections */}
        <div className={getCardStyle('secondary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Training Corrections ({trainingCorrections.length})
            </h2>
            
            {trainingCorrections.length === 0 ? (
              <p className="text-slate-400">No training corrections found</p>
            ) : (
              <div className="space-y-4">
                {trainingCorrections.map((correction, index) => (
                  <div key={correction.id} className="p-4 bg-slate-800 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong className="text-white">Record ID:</strong> 
                        <div className="text-slate-300 font-mono text-xs">{correction.delivery_record_id}</div>
                      </div>
                      <div>
                        <strong className="text-white">Type:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          correction.correction_type === 'correct' ? 'bg-green-800 text-green-200' :
                          correction.correction_type === 'wrong' ? 'bg-red-800 text-red-200' :
                          'bg-yellow-800 text-yellow-200'
                        }`}>
                          {correction.correction_type}
                        </span>
                      </div>
                      <div>
                        <strong className="text-white">Created:</strong> 
                        <div className="text-slate-300">{new Date(correction.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Summary
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">{deliveryRecords.length}</div>
                <div className="text-sm text-slate-400">Total Records</div>
              </div>
              
              <div className="text-center p-4 bg-green-900/30 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {deliveryRecords.filter(r => r.processing_status === 'completed').length}
                </div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-red-900/30 rounded-lg">
                <div className="text-2xl font-bold text-red-400">
                  {deliveryRecords.filter(r => r.processing_status === 'failed').length}
                </div>
                <div className="text-sm text-slate-400">Failed</div>
              </div>
              
              <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{trainingCorrections.length}</div>
                <div className="text-sm text-slate-400">Corrections</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">Available for Training</h3>
              <p className="text-slate-300">
                Records with status &apos;completed&apos; that haven&apos;t been corrected yet: 
                <span className="ml-2 text-white font-bold">
                  {deliveryRecords.filter(r => 
                    r.processing_status === 'completed' && 
                    !trainingCorrections.some(c => c.delivery_record_id === r.id)
                  ).length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}