import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface OfflineCount {
  id: string
  itemId: string
  quantity: number
  unit: string
  locationId?: string
  notes: string
  timestamp: string
  synced: boolean
}

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
    const { counts }: { counts: OfflineCount[] } = body

    if (!Array.isArray(counts) || counts.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request: counts array is required' 
      }, { status: 400 })
    }

    const syncResults = {
      successful: [] as OfflineCount[],
      failed: [] as { count: OfflineCount; error: string }[],
      totalProcessed: counts.length
    }

    // Process each count
    for (const count of counts) {
      try {
        // Validate required fields
        if (!count.itemId || count.quantity === undefined || count.quantity < 0) {
          syncResults.failed.push({
            count,
            error: 'Missing or invalid required fields'
          })
          continue
        }

        // Verify the item exists and belongs to the user
        const { data: item, error: itemError } = await supabase
          .from('inventory_items')
          .select('id, item_name, count_unit')
          .eq('id', count.itemId)
          .eq('client_id', userId)
          .single()

        if (itemError || !item) {
          syncResults.failed.push({
            count,
            error: 'Item not found or access denied'
          })
          continue
        }

        // Verify location exists if provided
        if (count.locationId) {
          const { data: location, error: locationError } = await supabase
            .from('inventory_locations')
            .select('id')
            .eq('id', count.locationId)
            .eq('client_id', userId)
            .single()

          if (locationError || !location) {
            syncResults.failed.push({
              count,
              error: 'Location not found or access denied'
            })
            continue
          }
        }

        // Insert the count record
        const { error: countError } = await supabase
          .from('inventory_count')
          .insert({
            client_id: userId,
            item_id: count.itemId,
            quantity_on_hand: count.quantity,
            count_unit: count.unit || item.count_unit,
            location_id: count.locationId || null,
            notes: count.notes || null,
            counted_by: userId,
            count_date: count.timestamp || new Date().toISOString()
          })

        if (countError) {
          console.error('Error inserting count during sync:', countError)
          syncResults.failed.push({
            count,
            error: 'Failed to save count to database'
          })
          continue
        }

        // Mark as successful
        syncResults.successful.push({
          ...count,
          synced: true
        })

      } catch (error) {
        console.error('Error processing individual count:', error)
        syncResults.failed.push({
          count,
          error: 'Unexpected error processing count'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${syncResults.successful.length} successful, ${syncResults.failed.length} failed`,
      results: syncResults
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}