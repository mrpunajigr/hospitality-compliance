// Create delivery record API - Works with direct Supabase uploads
// Creates database record after file is already uploaded to storage

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating delivery record for uploaded file')
    
    const { filePath, fileName, fileSize, fileType, clientId, userId } = await request.json()
    
    if (!filePath || !fileName || !clientId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: filePath, fileName, clientId, or userId' },
        { status: 400 }
      )
    }

    console.log('📋 Record data:', { filePath, fileName, fileSize, fileType, clientId, userId })

    const supabase = getSupabaseAdmin()

    // Create delivery record in database
    const { data: deliveryRecord, error: insertError } = await supabase
      .from('delivery_records')
      .insert([
        {
          client_id: clientId,
          user_id: userId,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          upload_timestamp: new Date().toISOString(),
          processing_status: 'uploaded',
          ocr_status: 'pending'
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database insert error:', insertError)
      throw insertError
    }

    if (!deliveryRecord) {
      throw new Error('No delivery record returned from database')
    }

    console.log('✅ Delivery record created:', deliveryRecord.id)

    // Create audit log entry
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: userId,
          client_id: clientId,
          action: 'file_upload',
          resource_type: 'delivery_record',
          resource_id: deliveryRecord.id,
          details: {
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType,
            upload_method: 'direct_supabase'
          }
        }
      ])

    if (auditError) {
      console.warn('⚠️ Audit log creation failed:', auditError)
      // Don't fail the request for audit log issues
    }

    return NextResponse.json({
      success: true,
      deliveryRecord: deliveryRecord,
      message: 'Delivery record created successfully'
    })

  } catch (error) {
    console.error('❌ Delivery record creation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create delivery record',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}