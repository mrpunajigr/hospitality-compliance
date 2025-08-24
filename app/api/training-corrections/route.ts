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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const clientId = url.searchParams.get('clientId')
    const type = url.searchParams.get('type') || 'pending' // pending, completed, analytics

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    if (type === 'pending') {
      // Get delivery records that need training review
      const { data: records, error } = await supabaseAdmin
        .from('delivery_records')
        .select(`
          id,
          supplier_name,
          delivery_date,
          extracted_temperatures,
          products,
          confidence_score,
          image_path,
          raw_extracted_text,
          extracted_line_items,
          product_classification,
          confidence_scores,
          created_at
        `)
        .eq('client_id', clientId)
        .not('id', 'in', `(
          SELECT delivery_record_id 
          FROM ai_training_corrections 
          WHERE delivery_record_id = delivery_records.id
        )`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching pending records:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ records: records || [] })
    }

    if (type === 'completed') {
      // Get completed training corrections
      const { data: corrections, error } = await supabaseAdmin
        .from('ai_training_corrections')
        .select(`
          *,
          delivery_records (
            supplier_name,
            image_path,
            created_at
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching completed corrections:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ corrections: corrections || [] })
    }

    if (type === 'analytics') {
      // Get training analytics
      const { data: analytics, error } = await supabaseAdmin
        .from('ai_training_analytics')
        .select('*')
        .eq('client_id', clientId)

      if (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Get additional stats
      const { data: totalStats, error: statsError } = await supabaseAdmin
        .from('ai_training_corrections')
        .select('correction_type, review_time_seconds, created_at')
        .eq('client_id', clientId)

      const stats = {
        totalCorrections: totalStats?.length || 0,
        averageReviewTime: (totalStats?.length ?? 0) > 0 
          ? Math.round(totalStats!.reduce((sum, record) => sum + (record.review_time_seconds || 0), 0) / totalStats!.length)
          : 0,
        correctionsToday: totalStats?.filter(record => {
          const today = new Date().toDateString()
          return new Date(record.created_at).toDateString() === today
        }).length || 0,
        accuracyTrend: analytics || []
      }

      return NextResponse.json({ analytics: stats })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Training corrections API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      delivery_record_id,
      client_id,
      user_id,
      original_extraction,
      original_confidence_scores,
      corrected_extraction,
      correction_type,
      fields_corrected,
      review_time_seconds,
      reviewer_confidence,
      notes
    } = body

    // Validate required fields
    if (!delivery_record_id || !client_id || !original_extraction || !corrected_extraction || !correction_type) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Insert training correction
    const { data: correction, error } = await supabaseAdmin
      .from('ai_training_corrections')
      .insert({
        delivery_record_id,
        client_id,
        user_id,
        original_extraction,
        original_confidence_scores,
        corrected_extraction,
        correction_type,
        fields_corrected: fields_corrected || [],
        review_time_seconds,
        reviewer_confidence: reviewer_confidence || 'medium',
        notes: notes || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating training correction:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      correction_id: correction.id,
      message: 'Training correction saved successfully'
    })

  } catch (error) {
    console.error('Training corrections POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { correction_id, ...updates } = body

    if (!correction_id) {
      return NextResponse.json({ error: 'Correction ID required' }, { status: 400 })
    }

    const { data: correction, error } = await supabaseAdmin
      .from('ai_training_corrections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', correction_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating training correction:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      correction,
      message: 'Training correction updated successfully'
    })

  } catch (error) {
    console.error('Training corrections PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}