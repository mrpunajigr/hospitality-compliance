'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import Image from 'next/image'
import TrainingNavigation from '@/components/training/TrainingNavigation'

interface DeliveryRecord {
  id: string
  client_id: string
  supplier_name: string
  delivery_date: string
  extracted_temperatures: any[]
  products: string[]
  confidence_score: number
  image_path: string
  raw_extracted_text: string
  extracted_line_items: any[]
  product_classification: any
  line_item_analysis: any
  distinct_product_count: number
  confidence_scores: any
}

interface TrainingCorrection {
  delivery_record_id: string
  original_extraction: any
  corrected_extraction: any
  correction_type: 'correct' | 'wrong' | 'missing'
  fields_corrected: string[]
  reviewer_confidence: 'high' | 'medium' | 'low'
  notes: string
}

interface TrainingImageProps {
  imagePath: string
  alt: string
  className?: string
  onError?: (e: any) => void
  onLoad?: () => void
}

function TrainingImage({ imagePath, alt, className, onError, onLoad }: TrainingImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setImageUrl('/placeholder-image.png')
        setIsLoading(false)
        return
      }

      try {
        // Debug: Check actual bucket contents
        console.log('🔍 Checking bucket structure for path:', imagePath)
        
        // Try to list files in the bucket to understand structure
        const pathParts = imagePath.split('/')
        const folderPath = pathParts.slice(0, -1).join('/')
        
        const { data: bucketList, error: listError } = await supabase.storage
          .from('delivery-dockets')
          .list(folderPath || '', {
            limit: 10
          })
          
        if (bucketList) {
          console.log('📁 Bucket contents in', folderPath, ':', bucketList.map((f: any) => f.name))
          
          // Try to find the actual file with different extensions
          const baseFileName = imagePath.split('/').pop()?.split('.')[0] // Get filename without extension
          const actualFile = bucketList.find((f: any) => 
            f.name.startsWith(baseFileName || '') && 
            (f.name.endsWith('.jpeg') || f.name.endsWith('.jpg') || f.name.endsWith('.HEIC') || f.name.endsWith('.png'))
          )
          
          if (actualFile) {
            console.log('🎯 Found actual file:', actualFile.name, 'instead of:', imagePath)
            // Update imagePath to use the actual file
            const actualPath = [...pathParts.slice(0, -1), actualFile.name].join('/')
            console.log('🔄 Using corrected path:', actualPath)
            imagePath = actualPath
          }
        }
        
        // Try public URL first since bucket is configured as public
        console.log('🖼️ Loading image with public URL for:', imagePath)
        const { data: publicData } = supabase.storage
          .from('delivery-dockets')
          .getPublicUrl(imagePath)
        
        console.log('✅ Public URL generated:', publicData.publicUrl)
        setImageUrl(publicData.publicUrl)
        
        // Test if the URL actually works by creating a test image (client-side only)
        if (typeof window !== 'undefined') {
          const testImg = document.createElement('img')
          testImg.onload = () => {
            console.log('✅ Public URL confirmed working')
          }
          testImg.onerror = async () => {
            console.warn('⚠️ Public URL failed, trying signed URL fallback')
            try {
              const { data: signedData, error } = await supabase.storage
                .from('delivery-dockets')
                .createSignedUrl(imagePath, 3600)
              
              if (!error && signedData) {
                console.log('🔄 Using signed URL fallback:', signedData.signedUrl)
                setImageUrl(signedData.signedUrl)
              } else {
                console.error('❌ Both public and signed URLs failed')
                setError(true)
              }
            } catch (signedError) {
              console.error('❌ Signed URL fallback failed:', signedError)
              setError(true)
            }
          }
          testImg.src = publicData.publicUrl
        }
        
      } catch (err) {
        console.error('❌ Image URL generation failed:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [imagePath])

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-800`}>
        <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-800 text-center p-4`}>
        <div>
          <div className="text-4xl mb-2">❌</div>
          <div className="text-sm text-red-300">Image Load Failed</div>
          <div className="text-xs text-slate-400 mt-2">
            Path: {imagePath}
          </div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={(e) => {
        console.error('❌ Image failed to load:', { path: imagePath, url: imageUrl })
        setError(true)
        onError?.(e)
      }}
    />
  )
}

export default function TrainingReviewPage() {
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [correction, setCorrection] = useState<TrainingCorrection | null>(null)
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now())
  

  useEffect(() => {
    loadUnreviewedRecords()
    setReviewStartTime(Date.now())
  }, [])

  const loadUnreviewedRecords = async () => {
    try {
      // First get all training corrections to identify reviewed records
      const { data: corrections } = await supabase
        .from('ai_training_corrections')
        .select('delivery_record_id')

      const reviewedIds = corrections?.map((c: any) => c.delivery_record_id) || []

      // Get delivery records that haven't been reviewed for training
      // Prioritize successful processing records over failed ones
      let query = supabase
        .from('delivery_records')
        .select('*')
        .eq('client_id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') // Filter by dev company ID
        .neq('processing_status', 'failed') // Exclude failed processing records first
        .order('created_at', { ascending: false })
        .limit(50) // Load batch of 50 for review

      // Exclude reviewed records if any exist
      if (reviewedIds.length > 0) {
        query = query.not('id', 'in', `(${reviewedIds.join(',')})`)
      }

      let { data: records, error } = await query

      // If no successful records found, then include failed records as fallback
      if (!records || records.length === 0) {
        console.log('🔄 No successful records found, including failed records...')
        query = supabase
          .from('delivery_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (reviewedIds.length > 0) {
          query = query.not('id', 'in', `(${reviewedIds.join(',')})`)
        }
        
        const fallbackResult = await query
        records = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) {
        console.error('Error loading records:', error)
        return
      }

      console.log(`📋 Found ${records?.length || 0} unreviewed records`)
      
      // Verify file existence for each record before showing in training
      if (records && records.length > 0) {
        console.log('🔍 Verifying file existence for all records...')
        const recordsWithFiles = []
        
        for (const record of records) {
          if (!record.image_path) {
            console.log(`⚠️ Skipping record ${record.id} - no image path`)
            continue
          }

          try {
            // Check if file actually exists in storage by listing folder contents
            const pathParts = record.image_path.split('/')
            const folderPath = pathParts.slice(0, -1).join('/')
            
            const { data: fileList } = await supabase.storage
              .from('delivery-dockets')
              .list(folderPath || '', { limit: 100 })

            const fileName = pathParts[pathParts.length - 1]
            const fileExists = fileList?.some((f: any) => f.name === fileName)

            if (fileExists) {
              console.log(`✅ File verified for record ${record.id}: ${record.image_path}`)
              recordsWithFiles.push(record)
            } else {
              console.log(`❌ File missing for record ${record.id}: ${record.image_path}`)
            }
          } catch (verifyError) {
            console.error(`❌ File verification failed for record ${record.id}:`, verifyError)
          }
        }

        console.log(`📁 ${recordsWithFiles.length} records have actual files out of ${records.length} total records`)
        setDeliveryRecords(recordsWithFiles)
      } else {
        setDeliveryRecords([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading records:', error)
      setLoading(false)
    }
  }

  const currentRecord = deliveryRecords[currentIndex]

  const initializeCorrection = (type: 'correct' | 'wrong' | 'missing') => {
    if (!currentRecord) return

    const originalExtraction = {
      supplier_name: currentRecord.supplier_name,
      delivery_date: currentRecord.delivery_date,
      temperatures: currentRecord.extracted_temperatures,
      products: currentRecord.products,
      line_items: currentRecord.extracted_line_items,
      confidence_score: currentRecord.confidence_score
    }

    setCorrection({
      delivery_record_id: currentRecord.id,
      original_extraction: originalExtraction,
      corrected_extraction: { ...originalExtraction },
      correction_type: type,
      fields_corrected: [],
      reviewer_confidence: 'high',
      notes: ''
    })
  }

  const updateCorrectedField = (field: string, value: any) => {
    if (!correction) return

    const updatedCorrection = {
      ...correction,
      corrected_extraction: {
        ...correction.corrected_extraction,
        [field]: value
      },
      fields_corrected: correction.fields_corrected.includes(field) 
        ? correction.fields_corrected
        : [...correction.fields_corrected, field]
    }

    setCorrection(updatedCorrection)
  }

  const saveCorrection = async () => {
    if (!correction || !currentRecord) return

    setSaving(true)
    try {
      const reviewTimeSeconds = Math.floor((Date.now() - reviewStartTime) / 1000)

      const { error } = await supabase
        .from('ai_training_corrections')
        .insert({
          delivery_record_id: correction.delivery_record_id,
          client_id: currentRecord.client_id,
          original_extraction: correction.original_extraction,
          original_confidence_scores: currentRecord.confidence_scores,
          corrected_extraction: correction.corrected_extraction,
          correction_type: correction.correction_type,
          fields_corrected: correction.fields_corrected,
          review_time_seconds: reviewTimeSeconds,
          reviewer_confidence: correction.reviewer_confidence,
          notes: correction.notes
        })

      if (error) {
        console.error('Error saving correction:', error)
        return
      }

      // Move to next record
      if (currentIndex < deliveryRecords.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setCorrection(null)
        setReviewStartTime(Date.now())
      } else {
        // Load more records if we've finished the batch
        loadUnreviewedRecords()
        setCurrentIndex(0)
        setCorrection(null)
        setReviewStartTime(Date.now())
      }
    } catch (error) {
      console.error('Error saving correction:', error)
    } finally {
      setSaving(false)
    }
  }

  const skipRecord = () => {
    if (currentIndex < deliveryRecords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setCorrection(null)
      setReviewStartTime(Date.now())
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-image.png'
    
    // Try public URL first, but use signed URL as primary for production reliability
    console.log('🖼️ Generating image URL for path:', JSON.stringify(imagePath))
    
    // Generate public URL for fallback
    const { data } = supabase.storage
      .from('delivery-dockets') 
      .getPublicUrl(imagePath)
    
    console.log('🔍 Public URL generated:', data.publicUrl)
    return data.publicUrl
  }

  const getSignedImageUrl = async (imagePath: string) => {
    if (!imagePath) return '/placeholder-image.png'
    
    try {
      const { data, error } = await supabase.storage
        .from('delivery-dockets')
        .createSignedUrl(imagePath, 3600) // 1 hour expiry
      
      if (error) {
        console.error('Signed URL error:', error)
        return '/placeholder-image.png'
      }
      
      return data.signedUrl
    } catch (error) {
      console.error('Failed to create signed URL:', error)
      return '/placeholder-image.png'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className={getTextStyle('body')}>Loading training data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="p-8 text-center">
            <h2 className={`${getTextStyle('pageTitle')} text-white mb-4`}>
              Training Complete!
            </h2>
            <p className={getTextStyle('body')}>
              All available records have been reviewed for training.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="space-y-6">
        
        {/* Navigation */}
        <TrainingNavigation />
        
        {/* Header */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className={`${getTextStyle('pageTitle')} text-white`}>
                AI Training Review
              </h1>
              <div className="text-sm text-slate-300">
                {currentIndex + 1} of {deliveryRecords.length}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-sm text-slate-300">
                <strong>Supplier:</strong> {currentRecord.supplier_name || 'Unknown'}
              </div>
              <div className="text-sm text-slate-300">
                <strong>Date:</strong> {currentRecord.delivery_date || 'Unknown'}
              </div>
              <div className="text-sm text-slate-300">
                <strong>Distinct Items:</strong> {currentRecord.distinct_product_count || currentRecord.products?.length || 0}
              </div>
              <div className="text-sm text-slate-300">
                <strong>AI Confidence:</strong> {(currentRecord.confidence_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Original Document Image */}
          <div className={getCardStyle('secondary')}>
            <div className="p-6">
              <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                Original Document
              </h3>
              <div className="relative aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden">
                {currentRecord.image_path ? (
                  <TrainingImage 
                    imagePath={currentRecord.image_path}
                    alt="Delivery Docket"
                    className="w-full h-full object-contain"
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', currentRecord.image_path)
                      // Hide fallback when image loads
                      const fallback = document.getElementById('image-fallback')
                      if (fallback) {
                        fallback.style.display = 'none'
                      }
                    }}
                  />
                ) : null}
                
                {/* Fallback content if no image path or image fails to load */}
                <div className="w-full h-full flex items-center justify-center text-white absolute inset-0" id="image-fallback">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm text-slate-300">Delivery Docket</div>
                    <div className="text-xs text-slate-400 mt-2">
                      File: {currentRecord.image_path || 'No path'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Loading image...
                    </div>
                  </div>
                </div>
                
                {/* Image path info overlay - only show when image loads */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
                  Path: {currentRecord.image_path || 'No path'}
                </div>
              </div>
            </div>
          </div>

          {/* AI Extraction Review */}
          <div className={getCardStyle('secondary')}>
            <div className="p-6">
              <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                AI Extracted Data
              </h3>

              {!correction ? (
                // Initial Review Buttons
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => initializeCorrection('correct')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      ✅ Correct
                    </button>
                    <button
                      onClick={() => initializeCorrection('wrong')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      ❌ Wrong
                    </button>
                    <button
                      onClick={() => initializeCorrection('missing')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      ➕ Missing
                    </button>
                  </div>

                  {/* Display extracted data */}
                  <div className="space-y-3 mt-6">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <label className="text-sm font-medium text-slate-300">Supplier</label>
                      <div className="text-white">{currentRecord.supplier_name || 'Not detected'}</div>
                    </div>
                    
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <label className="text-sm font-medium text-slate-300">Delivery Date</label>
                      <div className="text-white">{currentRecord.delivery_date || 'Not detected'}</div>
                    </div>

                    <div className="p-3 bg-slate-800 rounded-lg">
                      <label className="text-sm font-medium text-slate-300">Temperatures</label>
                      <div className="text-white">
                        {currentRecord.extracted_temperatures?.length > 0 
                          ? currentRecord.extracted_temperatures.map((temp, i) => 
                              `${temp.value}°${temp.unit}`
                            ).join(', ')
                          : 'None detected'
                        }
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800 rounded-lg">
                      <label className="text-sm font-medium text-slate-300">Products</label>
                      <div className="text-white">
                        {currentRecord.products?.length > 0 
                          ? currentRecord.products.join(', ')
                          : 'None detected'
                        }
                      </div>
                    </div>

                    {/* Product Categories */}
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <label className="text-sm font-medium text-slate-300">Product Categories</label>
                      <div className="flex gap-2 mt-2">
                        {currentRecord.product_classification?.summary ? (
                          <>
                            <div className="flex items-center gap-1 text-sm bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                              ❄️ {currentRecord.product_classification.summary.frozenCount || 0} Frozen
                            </div>
                            <div className="flex items-center gap-1 text-sm bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded">
                              🧊 {currentRecord.product_classification.summary.chilledCount || 0} Chilled
                            </div>
                            <div className="flex items-center gap-1 text-sm bg-green-900/30 text-green-300 px-2 py-1 rounded">
                              🌡️ {currentRecord.product_classification.summary.ambientCount || 0} Ambient
                            </div>
                            {(currentRecord.product_classification.summary.unclassifiedCount || 0) > 0 && (
                              <div className="flex items-center gap-1 text-sm bg-gray-900/30 text-gray-300 px-2 py-1 rounded">
                                ❓ {currentRecord.product_classification.summary.unclassifiedCount} Unknown
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-slate-400 text-sm">Categories not analyzed</div>
                        )}
                      </div>
                    </div>

                    {/* Line Item Analysis */}
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <label className="text-sm font-medium text-slate-300">Line Item Analysis</label>
                      <div className="text-white space-y-1">
                        <div>Distinct Products: <span className="font-semibold">{currentRecord.distinct_product_count || 0}</span></div>
                        {currentRecord.line_item_analysis && (
                          <>
                            <div>Total Line Items: <span className="font-semibold">{currentRecord.line_item_analysis.totalLineItems || 0}</span></div>
                            <div>Extraction Method: <span className="font-semibold capitalize">{currentRecord.line_item_analysis.analysis?.extractionMethod || 'unknown'}</span></div>
                            {(currentRecord.line_item_analysis.analysis?.duplicatesFound || 0) > 0 && (
                              <div className="text-yellow-400">Duplicates Found: {currentRecord.line_item_analysis.analysis.duplicatesFound}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={skipRecord}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ) : (
                // Correction Interface
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      correction.correction_type === 'correct' ? 'bg-green-100 text-green-800' :
                      correction.correction_type === 'wrong' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {correction.correction_type.toUpperCase()}
                    </span>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        value={correction.corrected_extraction.supplier_name || ''}
                        onChange={(e) => updateCorrectedField('supplier_name', e.target.value)}
                        className={getFormFieldStyle()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={correction.corrected_extraction.delivery_date?.split('T')[0] || ''}
                        onChange={(e) => updateCorrectedField('delivery_date', e.target.value)}
                        className={getFormFieldStyle()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Temperature Readings (comma separated, e.g. &quot;4°C, -18°F&quot;)
                      </label>
                      <input
                        type="text"
                        value={correction.corrected_extraction.temperatures?.map((t: any) => `${t.value}°${t.unit}`).join(', ') || ''}
                        onChange={(e) => {
                          const temps = e.target.value.split(',').map(temp => {
                            const match = temp.trim().match(/(-?\d+\.?\d*)[°]?([CF]?)/i)
                            if (match) {
                              return {
                                value: parseFloat(match[1]),
                                unit: match[2] || 'C',
                                context: 'manual correction'
                              }
                            }
                            return null
                          }).filter(Boolean)
                          updateCorrectedField('temperatures', temps)
                        }}
                        className={getFormFieldStyle()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Products (comma separated)
                      </label>
                      <input
                        type="text"
                        value={correction.corrected_extraction.products?.join(', ') || ''}
                        onChange={(e) => updateCorrectedField('products', e.target.value.split(',').map(p => p.trim()))}
                        className={getFormFieldStyle()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Your Confidence in this Correction
                      </label>
                      <select
                        value={correction.reviewer_confidence}
                        onChange={(e) => setCorrection({...correction, reviewer_confidence: e.target.value as any})}
                        className={getFormFieldStyle()}
                      >
                        <option value="high">High - Very confident</option>
                        <option value="medium">Medium - Somewhat confident</option>
                        <option value="low">Low - Uncertain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={correction.notes}
                        onChange={(e) => setCorrection({...correction, notes: e.target.value})}
                        className={getFormFieldStyle()}
                        rows={3}
                        placeholder="Any additional notes about this correction..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCorrection(null)}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCorrection}
                      disabled={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save & Next'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}