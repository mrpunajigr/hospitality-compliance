import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for server operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface TrainingDataEntry {
  document: {
    inputConfig: {
      gcsSource: {
        inputUris: string[]
      }
    }
  }
  entities: Array<{
    textSegment: {
      startOffset: string
      endOffset: string
      content: string
    }
    entityType: string
    pageAnchor?: {
      pageRefs: Array<{
        page: string
        boundingPoly?: {
          normalizedVertices: Array<{
            x: number
            y: number
          }>
        }
      }>
    }
  }>
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const clientId = url.searchParams.get('clientId')
    const format = url.searchParams.get('format') || 'automl' // automl, documentai, jsonl
    const minCorrections = parseInt(url.searchParams.get('minCorrections') || '1')
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    console.log(`📊 Exporting training data for client ${clientId}`)

    // Get training corrections with original records
    const { data: corrections, error } = await supabaseAdmin
      .from('ai_training_corrections')
      .select(`
        *,
        delivery_records (
          id,
          image_path,
          raw_extracted_text,
          supplier_name,
          delivery_date,
          extracted_temperatures,
          products,
          confidence_score
        )
      `)
      .eq('client_id', clientId)
      .not('corrected_extraction', 'is', null)

    if (error) {
      console.error('Error fetching training corrections:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!corrections || corrections.length === 0) {
      return NextResponse.json({ 
        message: 'No training corrections found',
        count: 0,
        data: []
      })
    }

    console.log(`📋 Found ${corrections.length} training corrections`)

    // Group corrections by delivery record (one record might have multiple corrections)
    const recordCorrections = corrections.reduce((acc, correction) => {
      const recordId = correction.delivery_record_id
      if (!acc[recordId]) {
        acc[recordId] = {
          record: correction.delivery_records,
          corrections: []
        }
      }
      acc[recordId].corrections.push(correction)
      return acc
    }, {})

    // Filter records that have minimum number of corrections
    const qualifiedRecords = Object.values(recordCorrections).filter(
      (item: any) => item.corrections.length >= minCorrections
    )

    console.log(`✅ Found ${qualifiedRecords.length} records with ${minCorrections}+ corrections`)

    if (format === 'automl') {
      return exportAutoMLFormat(qualifiedRecords)
    } else if (format === 'documentai') {
      return exportDocumentAIFormat(qualifiedRecords)
    } else {
      return exportJSONLFormat(qualifiedRecords)
    }

  } catch (error) {
    console.error('Training data export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function exportAutoMLFormat(records: any[]) {
  const trainingData = []

  for (const { record, corrections } of records) {
    // Get the most recent correction (highest confidence)
    const bestCorrection = corrections.reduce((best: any, current: any) => {
      const currentConfidence = current.reviewer_confidence === 'high' ? 3 : 
                               current.reviewer_confidence === 'medium' ? 2 : 1
      const bestConfidence = best.reviewer_confidence === 'high' ? 3 : 
                             best.reviewer_confidence === 'medium' ? 2 : 1
      return currentConfidence > bestConfidence ? current : best
    })

    const correctedData = bestCorrection.corrected_extraction
    
    // Create AutoML Natural Language entity annotations
    const entities = []
    
    // Extract supplier name entity
    if (correctedData.supplier_name) {
      const supplierIndex = record.raw_extracted_text?.indexOf(correctedData.supplier_name)
      if (supplierIndex !== -1) {
        entities.push({
          textSegment: {
            content: correctedData.supplier_name,
            startOffset: supplierIndex.toString(),
            endOffset: (supplierIndex + correctedData.supplier_name.length).toString()
          },
          entityType: 'SUPPLIER_NAME'
        })
      }
    }

    // Extract temperature entities
    if (correctedData.temperatures && correctedData.temperatures.length > 0) {
      correctedData.temperatures.forEach(temp => {
        const tempString = `${temp.value}°${temp.unit}`
        const tempIndex = record.raw_extracted_text?.indexOf(tempString)
        if (tempIndex !== -1) {
          entities.push({
            textSegment: {
              content: tempString,
              startOffset: tempIndex.toString(),
              endOffset: (tempIndex + tempString.length).toString()
            },
            entityType: 'TEMPERATURE_READING'
          })
        }
      })
    }

    // Extract product entities
    if (correctedData.products && correctedData.products.length > 0) {
      correctedData.products.forEach(product => {
        const productIndex = record.raw_extracted_text?.indexOf(product)
        if (productIndex !== -1) {
          entities.push({
            textSegment: {
              content: product,
              startOffset: productIndex.toString(),
              endOffset: (productIndex + product.length).toString()
            },
            entityType: 'PRODUCT_ITEM'
          })
        }
      })
    }

    trainingData.push({
      document: record.image_path,
      text_snippet: {
        content: record.raw_extracted_text || ''
      },
      annotations: entities,
      metadata: {
        delivery_record_id: record.id,
        correction_id: bestCorrection.id,
        confidence_score: record.confidence_score,
        reviewer_confidence: bestCorrection.reviewer_confidence,
        correction_type: bestCorrection.correction_type
      }
    })
  }

  const exportData = {
    format: 'automl',
    version: '1.0',
    created_at: new Date().toISOString(),
    total_records: trainingData.length,
    entity_types: ['SUPPLIER_NAME', 'TEMPERATURE_READING', 'PRODUCT_ITEM', 'DELIVERY_DATE'],
    data: trainingData
  }

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="training-data-automl-${new Date().toISOString().split('T')[0]}.json"`
    }
  })
}

async function exportDocumentAIFormat(records: any[]) {
  const trainingData: TrainingDataEntry[] = []

  for (const { record, corrections } of records) {
    const bestCorrection = corrections.reduce((best, current) => {
      const currentConfidence = current.reviewer_confidence === 'high' ? 3 : 
                               current.reviewer_confidence === 'medium' ? 2 : 1
      const bestConfidence = best.reviewer_confidence === 'high' ? 3 : 
                             best.reviewer_confidence === 'medium' ? 2 : 1
      return currentConfidence > bestConfidence ? current : best
    })

    const correctedData = bestCorrection.corrected_extraction
    const entities = []

    // Create Document AI compatible entities
    if (correctedData.supplier_name) {
      entities.push({
        textSegment: {
          startOffset: "0",
          endOffset: correctedData.supplier_name.length.toString(),
          content: correctedData.supplier_name
        },
        entityType: "supplier_name"
      })
    }

    if (correctedData.delivery_date) {
      entities.push({
        textSegment: {
          startOffset: "0",
          endOffset: "10",
          content: correctedData.delivery_date
        },
        entityType: "delivery_date"
      })
    }

    if (correctedData.temperatures) {
      correctedData.temperatures.forEach((temp, index) => {
        entities.push({
          textSegment: {
            startOffset: (index * 10).toString(),
            endOffset: ((index * 10) + 5).toString(),
            content: `${temp.value}°${temp.unit}`
          },
          entityType: "temperature_reading"
        })
      })
    }

    trainingData.push({
      document: {
        inputConfig: {
          gcsSource: {
            inputUris: [`gs://your-bucket/${record.image_path}`]
          }
        }
      },
      entities
    })
  }

  const exportData = {
    format: 'document_ai',
    version: '1.0',
    created_at: new Date().toISOString(),
    total_records: trainingData.length,
    data: trainingData
  }

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="training-data-documentai-${new Date().toISOString().split('T')[0]}.json"`
    }
  })
}

async function exportJSONLFormat(records: any[]) {
  const jsonlLines = []

  for (const { record, corrections } of records) {
    const bestCorrection = corrections.reduce((best, current) => {
      const currentConfidence = current.reviewer_confidence === 'high' ? 3 : 
                               current.reviewer_confidence === 'medium' ? 2 : 1
      const bestConfidence = best.reviewer_confidence === 'high' ? 3 : 
                             best.reviewer_confidence === 'medium' ? 2 : 1
      return currentConfidence > bestCorrection ? current : best
    })

    const trainingExample = {
      image_path: record.image_path,
      raw_text: record.raw_extracted_text,
      original_extraction: bestCorrection.original_extraction,
      corrected_extraction: bestCorrection.corrected_extraction,
      correction_metadata: {
        correction_type: bestCorrection.correction_type,
        fields_corrected: bestCorrection.fields_corrected,
        reviewer_confidence: bestCorrection.reviewer_confidence,
        review_time_seconds: bestCorrection.review_time_seconds
      }
    }

    jsonlLines.push(JSON.stringify(trainingExample))
  }

  const jsonlContent = jsonlLines.join('\n')

  return new Response(jsonlContent, {
    headers: {
      'Content-Type': 'application/jsonl',
      'Content-Disposition': `attachment; filename="training-data-${new Date().toISOString().split('T')[0]}.jsonl"`
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, trainingConfig } = body

    // This would trigger a Google Cloud AI training job
    // Implementation depends on your specific training pipeline
    
    console.log('🚀 Starting Google Cloud AI training job...')
    console.log('Client:', clientId)
    console.log('Config:', trainingConfig)

    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Training job queued',
      training_job_id: `train-${Date.now()}`,
      estimated_completion: new Date(Date.now() + 3600000).toISOString() // 1 hour
    })

  } catch (error) {
    console.error('Training job creation error:', error)
    return NextResponse.json({ error: 'Failed to start training job' }, { status: 500 })
  }
}