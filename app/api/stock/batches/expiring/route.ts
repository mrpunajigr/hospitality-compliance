import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authorization = request.headers.get('authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const url = new URL(request.url)
    
    // Parse query parameters
    const days = parseInt(url.searchParams.get('days') || '7')
    const status = url.searchParams.get('status') || 'active'
    const urgency = url.searchParams.get('urgency') || 'all' // critical, warning, good, all

    // Calculate date range
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    // Build query
    let query = supabase
      .from('inventory_batches')
      .select(`
        id,
        batch_number,
        quantity,
        unit,
        expiration_date,
        status,
        received_date,
        vendor_id,
        item_id,
        inventory_items!inner(
          item_name,
          count_unit,
          category_id,
          inventory_categories!left(name)
        ),
        vendor_companies!left(name, email, phone)
      `)
      .eq('client_id', userId)
      .eq('status', status)
      .not('expiration_date', 'is', null)
      .order('expiration_date', { ascending: true })

    // Apply date filter based on urgency
    if (urgency === 'critical') {
      // Expired or expiring today/tomorrow
      query = query.lte('expiration_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    } else if (urgency === 'warning') {
      // Expiring in 2-3 days
      const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
      query = query
        .gte('expiration_date', twoDaysFromNow.toISOString().split('T')[0])
        .lte('expiration_date', threeDaysFromNow.toISOString().split('T')[0])
    } else if (urgency === 'good') {
      // Expiring in 4-7 days
      const fourDaysFromNow = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)
      query = query
        .gte('expiration_date', fourDaysFromNow.toISOString().split('T')[0])
        .lte('expiration_date', futureDate.toISOString().split('T')[0])
    } else {
      // All expiring within the specified days
      query = query.lte('expiration_date', futureDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch expiring batches' }, { status: 500 })
    }

    // Process the data
    const processedBatches = data?.map(batch => {
      const expiryDate = new Date(batch.expiration_date)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Determine urgency level
      let urgencyLevel = 'good'
      if (daysUntilExpiry <= 1) urgencyLevel = 'critical'
      else if (daysUntilExpiry <= 3) urgencyLevel = 'warning'

      return {
        id: batch.id,
        batch_number: batch.batch_number,
        quantity: batch.quantity,
        unit: batch.unit,
        expiration_date: batch.expiration_date,
        status: batch.status,
        received_date: batch.received_date,
        vendor_id: batch.vendor_id,
        item_id: batch.item_id,
        item_name: (batch as any).inventory_items?.item_name,
        item_unit: (batch as any).inventory_items?.count_unit,
        category_name: (batch as any).inventory_items?.inventory_categories?.name,
        vendor_name: (batch as any).vendor_companies?.name,
        vendor_email: (batch as any).vendor_companies?.email,
        vendor_phone: (batch as any).vendor_companies?.phone,
        days_until_expiry: daysUntilExpiry,
        urgency_level: urgencyLevel
      }
    }) || []

    // Group by urgency level
    const groupedBatches = {
      critical: processedBatches.filter(b => b.urgency_level === 'critical'),
      warning: processedBatches.filter(b => b.urgency_level === 'warning'),
      good: processedBatches.filter(b => b.urgency_level === 'good')
    }

    // Calculate summary statistics
    const summary = {
      total: processedBatches.length,
      critical: groupedBatches.critical.length,
      warning: groupedBatches.warning.length,
      good: groupedBatches.good.length,
      daysAhead: days
    }

    return NextResponse.json({
      success: true,
      batches: processedBatches,
      grouped: groupedBatches,
      summary,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}