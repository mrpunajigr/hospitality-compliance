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

interface BulkProcessRequest {
  files: File[]
  clientId: string
  userId: string
  processingPriority?: 'high' | 'medium' | 'low'
  batchSize?: number
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientId = formData.get('clientId') as string
    const userId = formData.get('userId') as string
    const processingPriority = (formData.get('processingPriority') as string) || 'medium'
    const batchSize = parseInt(formData.get('batchSize') as string) || 10

    if (!clientId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: clientId or userId' 
      }, { status: 400 })
    }

    // Get all uploaded files
    const files: File[] = []
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ 
        error: 'No files provided for processing' 
      }, { status: 400 })
    }

    console.log(`🚀 Starting bulk processing of ${files.length} dockets`)

    const results = {
      total: files.length,
      processed: 0,
      uploaded: 0,
      failed: 0,
      errors: [] as string[],
      deliveryRecords: [] as string[]
    }

    // Process files in batches to avoid overwhelming the system
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} files)`)
      
      // Process batch concurrently
      const batchPromises = batch.map(async (file, batchIndex) => {
        const fileIndex = i + batchIndex
        
        try {
          console.log(`📄 Processing file ${fileIndex + 1}/${files.length}: ${file.name}`)

          // Create organized file path with proper date structure
          const timestamp = Date.now() + fileIndex // Ensure uniqueness
          const dateFolder = new Date().toISOString().split('T')[0] // YYYY-MM-DD
          const fileName = `bulk_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = `${dateFolder}/bulk_upload/${fileName}` // Remove client ID from path
          
          console.log(`📂 Upload path details:`)
          console.log(`   • Client ID: ${clientId}`)
          console.log(`   • Date folder: ${dateFolder}`)
          console.log(`   • File name: ${fileName}`)
          console.log(`   • Full path: ${filePath}`)
          console.log(`   • Original name: ${file.name}`)

          // Convert File to Buffer
          const buffer = Buffer.from(await file.arrayBuffer())

          // Upload to Supabase storage
          const { data: uploadResult, error: uploadError } = await supabaseAdmin.storage
            .from('delivery-dockets')
            .upload(filePath, buffer, {
              contentType: file.type,
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error(`❌ Upload failed for ${file.name}:`, uploadError.message)
            results.failed++
            results.errors.push(`${file.name}: ${uploadError.message}`)
            return null
          }

          console.log(`✅ Uploaded: ${file.name} -> ${filePath}`)
          console.log(`📁 Upload result:`, JSON.stringify(uploadResult, null, 2))
          results.uploaded++
          
          // Verify file was actually uploaded by checking bucket
          const { data: verifyData, error: verifyError } = await supabaseAdmin.storage
            .from('delivery-dockets')
            .list(filePath.split('/').slice(0, -1).join('/'))
          
          if (verifyData) {
            const fileName = filePath.split('/').pop()
            const fileExists = verifyData.some(f => f.name === fileName)
            console.log(`🔍 File verification: ${fileExists ? 'EXISTS' : 'MISSING'} in bucket after upload`)
          }

          // Call the real Supabase Edge Function for Document AI processing
          console.log(`🤖 Processing with AI: ${file.name}`)
          console.log(`🔗 Edge Function URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-delivery-docket`)
          console.log(`🔑 Using Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'AVAILABLE' : 'MISSING'}`)
          
          const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-delivery-docket`
          const requestBody = {
            bucketId: 'delivery-dockets',
            fileName: fileName,
            filePath: uploadResult.path,
            userId: userId,
            clientId: clientId,
            metadata: {
              bulkUpload: true,
              originalFileName: file.name,
              processingPriority: processingPriority,
              batchIndex: fileIndex
            }
          }
          
          console.log(`📤 Edge Function request body:`, JSON.stringify(requestBody, null, 2))
          
          const processingResponse = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify(requestBody)
          })
          
          console.log(`📥 Edge Function response status: ${processingResponse.status}`)
          console.log(`📥 Edge Function response headers:`, Object.fromEntries(processingResponse.headers.entries()))

          if (!processingResponse.ok) {
            const errorText = await processingResponse.text()
            console.error(`🤖 AI processing failed for ${file.name}:`, errorText)
            
            // Create basic record even if AI processing fails
            const { data: deliveryRecord, error: dbError } = await supabaseAdmin
              .from('delivery_records')
              .insert({
                client_id: clientId,
                user_id: userId,
                image_path: uploadResult.path,
                processing_status: 'failed',
                error_message: `AI processing failed: ${errorText}`,
                raw_extracted_text: 'Bulk upload - AI processing failed',
                metadata: {
                  bulkUpload: true,
                  originalFileName: file.name
                }
              })
              .select()
              .single()
              
            if (!dbError && deliveryRecord) {
              results.deliveryRecords.push(deliveryRecord.id)
              results.processed++
            }
            
            results.errors.push(`${file.name}: AI processing failed - ${errorText}`)
            return deliveryRecord?.id || null
          }

          const processingResult = await processingResponse.json()
          console.log(`🤖 AI processing completed for ${file.name}:`, processingResult)

          // Find the created delivery record (with retry for timing issues)
          let deliveryRecord = null
          let retries = 3
          
          while (retries > 0 && !deliveryRecord) {
            const { data, error } = await supabaseAdmin
              .from('delivery_records')
              .select('id')
              .eq('image_path', uploadResult.path)
              .single()
              
            if (data) {
              deliveryRecord = data
            } else {
              console.log(`⏳ Delivery record not found yet, retrying... (${retries} attempts left)`)
              await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
              retries--
            }
          }

          if (deliveryRecord) {
            results.deliveryRecords.push(deliveryRecord.id)
            results.processed++
            console.log(`✅ Successfully processed ${file.name} - Record ID: ${deliveryRecord.id}`)
          } else {
            console.error(`❌ Could not find delivery record for ${file.name} after AI processing`)
            results.errors.push(`${file.name}: Record not found after AI processing`)
          }
          
          // Create audit log for bulk processing (only if record found)
          if (deliveryRecord) {
            await supabaseAdmin
              .from('audit_logs')
              .insert({
                client_id: clientId,
                user_id: userId,
                action: 'bulk.document.processed',
                resource_type: 'delivery_record',
                resource_id: deliveryRecord.id,
                details: {
                  fileName: file.name,
                  originalFileName: file.name,
                  bulkUpload: true,
                  processingPriority,
                  batchIndex: fileIndex,
                  aiProcessingSuccess: true
                }
              })
          }

          return deliveryRecord?.id || null

        } catch (error) {
          console.error(`❌ Error processing ${file.name}:`, error)
          results.failed++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`${file.name}: ${errorMessage}`)
          return null
        }
      })

      // Wait for batch to complete before starting next batch
      const batchResults = await Promise.all(batchPromises)
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed`)
      
      // Small delay between batches to avoid overwhelming the system
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`🎉 Bulk processing completed:`)
    console.log(`   📊 Total: ${results.total}`)
    console.log(`   ✅ Processed: ${results.processed}`)
    console.log(`   📤 Uploaded: ${results.uploaded}`)
    console.log(`   ❌ Failed: ${results.failed}`)

    // Create bulk processing summary audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        client_id: clientId,
        user_id: userId,
        action: 'bulk.processing.completed',
        resource_type: 'bulk_operation',
        resource_id: null,
        details: {
          totalFiles: results.total,
          processedFiles: results.processed,
          uploadedFiles: results.uploaded,
          failedFiles: results.failed,
          processingPriority,
          batchSize,
          deliveryRecordIds: results.deliveryRecords,
          errors: results.errors
        }
      })

    return NextResponse.json({
      success: true,
      message: `Bulk processing completed: ${results.processed}/${results.total} files processed successfully`,
      results
    })

  } catch (error) {
    console.error('❌ Bulk processing error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorResponse = { 
      error: 'Bulk processing failed', 
      details: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }
    
    console.log('🔍 Sending error response:', JSON.stringify(errorResponse, null, 2))
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const clientId = url.searchParams.get('clientId')
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Get bulk processing statistics
    const { data: bulkRecords, error } = await supabaseAdmin
      .from('delivery_records')
      .select('id, processing_status, confidence_score, created_at, metadata')
      .eq('client_id', clientId)
      .not('metadata', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const bulkUploads = bulkRecords?.filter(record => 
      record.metadata && record.metadata.bulkUpload === true
    ) || []

    const stats = {
      totalBulkRecords: bulkUploads.length,
      completedProcessing: bulkUploads.filter(r => r.processing_status === 'completed').length,
      failedProcessing: bulkUploads.filter(r => r.processing_status === 'failed').length,
      averageConfidence: bulkUploads.filter(r => r.confidence_score).length > 0
        ? (bulkUploads.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / 
           bulkUploads.filter(r => r.confidence_score).length)
        : 0,
      lastBulkUpload: bulkUploads.length > 0 ? bulkUploads[0].created_at : null,
      readyForTraining: bulkUploads.filter(r => 
        r.processing_status === 'completed' && (r.confidence_score || 0) < 0.85
      ).length
    }

    return NextResponse.json({ stats, recentUploads: bulkUploads.slice(0, 20) })

  } catch (error) {
    console.error('Bulk processing GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}