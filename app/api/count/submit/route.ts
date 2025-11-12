import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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
    const body = await request.json()

    // Validate required fields
    const { itemId, quantity, unit, locationId, notes } = body

    if (!itemId || quantity === undefined || quantity < 0) {
      return NextResponse.json({ 
        error: 'Missing or invalid required fields: itemId and quantity are required' 
      }, { status: 400 })
    }

    // Verify the item exists and belongs to the user
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, item_name, count_unit')
      .eq('id', itemId)
      .eq('client_id', userId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ 
        error: 'Item not found or access denied' 
      }, { status: 404 })
    }

    // Verify location exists if provided
    if (locationId) {
      const { data: location, error: locationError } = await supabase
        .from('inventory_locations')
        .select('id')
        .eq('id', locationId)
        .eq('client_id', userId)
        .single()

      if (locationError || !location) {
        return NextResponse.json({ 
          error: 'Location not found or access denied' 
        }, { status: 400 })
      }
    }

    // Insert the count record
    const { data: countData, error: countError } = await supabase
      .from('inventory_count')
      .insert({
        client_id: userId,
        item_id: itemId,
        quantity_on_hand: quantity,
        count_unit: unit || item.count_unit,
        location_id: locationId || null,
        notes: notes || null,
        counted_by: userId,
        count_date: new Date().toISOString()
      })
      .select()
      .single()

    if (countError) {
      console.error('Error inserting count:', countError)
      return NextResponse.json({ 
        error: 'Failed to save count' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Count saved successfully',
      count: countData
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}