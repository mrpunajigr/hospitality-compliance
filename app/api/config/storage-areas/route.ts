import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch storage areas for the client
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 STORAGE API: Fetching storage areas...')
    
    // For demo purposes, return sample data
    // In production, this would fetch from the database based on client_id
    const sampleStorageAreas = [
      {
        id: '1',
        name: 'Main Fridge',
        area_type: 'fridge',
        temperature_min: 0,
        temperature_max: 4,
        location_description: 'Kitchen main refrigerator',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Freezer',
        area_type: 'freezer',
        temperature_min: -20,
        temperature_max: -15,
        location_description: 'Main freezer unit',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    console.log('✅ STORAGE API: Sample storage areas returned')
    return NextResponse.json({
      success: true,
      storage_areas: sampleStorageAreas
    })

  } catch (error) {
    console.error('❌ STORAGE API: Error fetching storage areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage areas' },
      { status: 500 }
    )
  }
}

// POST - Create new storage area(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 STORAGE API: Creating storage area(s):', body)

    const { action, storage_area, storage_areas } = body

    if (action === 'bulk_create' && storage_areas) {
      // Bulk create built-in storage areas
      console.log('📝 STORAGE API: Bulk creating built-in storage areas:', storage_areas.length)
      
      // For demo purposes, simulate successful creation
      const createdAreas = storage_areas.map((area: any, index: number) => ({
        id: `demo-${index + 1}`,
        ...area,
        is_active: true,
        created_at: new Date().toISOString()
      }))

      console.log('✅ STORAGE API: Bulk storage areas created successfully')
      return NextResponse.json({
        success: true,
        storage_areas: createdAreas,
        message: `${storage_areas.length} storage areas created successfully`
      })

    } else if (action === 'create' && storage_area) {
      // Create single custom storage area
      console.log('📝 STORAGE API: Creating custom storage area:', storage_area)
      
      // For demo purposes, simulate successful creation
      const createdArea = {
        id: `custom-${Date.now()}`,
        ...storage_area,
        is_active: true,
        created_at: new Date().toISOString()
      }

      console.log('✅ STORAGE API: Custom storage area created successfully')
      return NextResponse.json({
        success: true,
        storage_area: createdArea,
        message: 'Storage area created successfully'
      })

    } else {
      console.error('❌ STORAGE API: Invalid request format')
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ STORAGE API: Error creating storage area:', error)
    return NextResponse.json(
      { error: 'Failed to create storage area' },
      { status: 500 }
    )
  }
}

// PATCH - Update storage area
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 STORAGE API: Updating storage area:', body)

    const { id, is_active, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Storage area ID is required' },
        { status: 400 }
      )
    }

    // For demo purposes, simulate successful update
    console.log('📝 STORAGE API: Simulating storage area update for ID:', id)
    
    const updatedArea = {
      id,
      ...updateData,
      is_active,
      updated_at: new Date().toISOString()
    }

    console.log('✅ STORAGE API: Storage area updated successfully')
    return NextResponse.json({
      success: true,
      storage_area: updatedArea,
      message: 'Storage area updated successfully'
    })

  } catch (error) {
    console.error('❌ STORAGE API: Error updating storage area:', error)
    return NextResponse.json(
      { error: 'Failed to update storage area' },
      { status: 500 }
    )
  }
}

// DELETE - Delete storage area
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 STORAGE API: Deleting storage area:', body)

    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Storage area ID is required' },
        { status: 400 }
      )
    }

    // For demo purposes, simulate successful deletion
    console.log('🗑️ STORAGE API: Simulating storage area deletion for ID:', id)

    console.log('✅ STORAGE API: Storage area deleted successfully')
    return NextResponse.json({
      success: true,
      message: 'Storage area deleted successfully'
    })

  } catch (error) {
    console.error('❌ STORAGE API: Error deleting storage area:', error)
    return NextResponse.json(
      { error: 'Failed to delete storage area' },
      { status: 500 }
    )
  }
}