import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('🐛 DEBUG UPLOAD: Starting comprehensive upload debugging')
  
  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('🐛 DEBUG UPLOAD: Admin client created')
    
    const formData = await request.formData()
    console.log('🐛 DEBUG UPLOAD: FormData received')
    
    const clientId = formData.get('clientId') as string
    const userId = formData.get('userId') as string
    
    console.log('🐛 DEBUG UPLOAD: clientId =', clientId)
    console.log('🐛 DEBUG UPLOAD: userId =', userId)
    
    // Get the first file
    let testFile = null
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        testFile = value
        console.log('🐛 DEBUG UPLOAD: Found file =', testFile.name, testFile.size, 'bytes')
        break
      }
    }
    
    if (!testFile) {
      return NextResponse.json({
        success: false,
        error: 'No file found in request'
      }, { status: 400 })
    }
    
    // Step 1: Test direct database insert
    console.log('🐛 DEBUG UPLOAD: Step 1 - Testing direct database insert')
    
    const { data: dbTest, error: dbError } = await supabaseAdmin
      .from('delivery_records')
      .insert({
        client_id: clientId,
        user_id: null,
        supplier_name: 'DEBUG UPLOAD TEST',
        image_path: `debug/${testFile.name}`,
        processing_status: 'debug',
        raw_extracted_text: `DEBUG UPLOAD TEST - ${new Date().toISOString()}`,
        confidence_score: 0.99
      })
      .select()
      .single()
    
    console.log('🐛 DEBUG UPLOAD: Database test result:', { data: dbTest, error: dbError })
    
    if (dbError) {
      return NextResponse.json({
        success: false,
        step: 'database_insert',
        error: 'Database insert failed',
        details: dbError
      }, { status: 500 })
    }
    
    // Step 2: Test file upload to Storage
    console.log('🐛 DEBUG UPLOAD: Step 2 - Testing file upload to Storage')
    
    const fileName = `debug_${Date.now()}_${testFile.name}`
    const filePath = `${clientId}/2025-08-28/${fileName}`
    
    console.log('🐛 DEBUG UPLOAD: Uploading to path:', filePath)
    
    const fileBuffer = await testFile.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('delivery-dockets')
      .upload(filePath, fileBuffer, {
        contentType: testFile.type,
        upsert: false
      })
    
    console.log('🐛 DEBUG UPLOAD: Storage upload result:', { data: uploadData, error: uploadError })
    
    if (uploadError) {
      return NextResponse.json({
        success: false,
        step: 'storage_upload',
        error: 'File upload failed',
        details: uploadError,
        databaseRecord: dbTest
      }, { status: 500 })
    }
    
    // Step 3: Test Edge Function call
    console.log('🐛 DEBUG UPLOAD: Step 3 - Testing Edge Function call')
    
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-delivery-docket`
    const requestBody = {
      bucketId: 'delivery-dockets',
      fileName: fileName,
      filePath: uploadData.path,
      userId: null,
      clientId: clientId,
      metadata: {
        bulkUpload: true,
        originalFileName: testFile.name,
        processingPriority: 'medium',
        batchIndex: 0
      }
    }
    
    console.log('🐛 DEBUG UPLOAD: Edge Function URL:', edgeFunctionUrl)
    console.log('🐛 DEBUG UPLOAD: Edge Function request:', requestBody)
    
    const edgeResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log('🐛 DEBUG UPLOAD: Edge Function response status:', edgeResponse.status)
    
    const edgeResponseText = await edgeResponse.text()
    console.log('🐛 DEBUG UPLOAD: Edge Function response:', edgeResponseText)
    
    // Return comprehensive debug info
    return NextResponse.json({
      success: true,
      message: 'Debug upload test completed',
      results: {
        databaseInsert: {
          success: !dbError,
          recordId: dbTest?.id,
          error: dbError
        },
        storageUpload: {
          success: !uploadError,
          path: uploadData?.path,
          error: uploadError
        },
        edgeFunction: {
          status: edgeResponse.status,
          success: edgeResponse.ok,
          response: edgeResponseText
        }
      },
      file: {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type
      }
    })
    
  } catch (error) {
    console.error('🐛 DEBUG UPLOAD: Exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}