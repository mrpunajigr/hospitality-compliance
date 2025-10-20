import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { getUserClient } from '@/lib/auth-utils'

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch storage areas for the client
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 STORAGE API: Fetching storage areas...')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ STORAGE API: Authentication failed:', authError)
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Get user client info for permissions
    const userClient = await getUserClient(user.id)
    if (!userClient) {
      return NextResponse.json({ error: 'User client not found' }, { status: 404 })
    }

    // Check permissions based on role
    const userPermissions = {
      canCreate: ['OWNER', 'MANAGER'].includes(userClient.role),
      canEdit: ['OWNER', 'MANAGER', 'SUPERVISOR'].includes(userClient.role),
      canDelete: ['OWNER', 'MANAGER'].includes(userClient.role),
      canViewSecurity: ['OWNER', 'MANAGER'].includes(userClient.role)
    }

    // For demo purposes, return sample data with user permissions
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

    console.log('✅ STORAGE API: Storage areas returned with permissions')
    return NextResponse.json({
      items: sampleStorageAreas,
      userPermissions
    })

  } catch (error) {
    console.error('❌ STORAGE API: Error fetching storage areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage areas' },
      { status: 500 }
    )
  }
}

// POST - Create new storage area
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ STORAGE API: Authentication failed:', authError)
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Get user client info for permissions
    const userClient = await getUserClient(user.id)
    if (!userClient) {
      return NextResponse.json({ error: 'User client not found' }, { status: 404 })
    }

    // Check create permissions
    if (!['OWNER', 'MANAGER'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    console.log('🔍 STORAGE API: Creating storage area:', body)

    // For demo purposes, simulate successful creation
    const createdArea = {
      id: `storage-${Date.now()}`,
      name: body.name,
      area_type: body.area_type || 'fridge',
      is_active: true,
      created_at: new Date().toISOString()
    }

    console.log('✅ STORAGE API: Storage area created successfully')
    return NextResponse.json({
      success: true,
      item: createdArea,
      message: 'Storage area created successfully'
    })

  } catch (error) {
    console.error('❌ STORAGE API: Error creating storage area:', error)
    return NextResponse.json(
      { error: 'Failed to create storage area' },
      { status: 500 }
    )
  }
}

// PUT - Update storage area
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ STORAGE API: Authentication failed:', authError)
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Get user client info for permissions
    const userClient = await getUserClient(user.id)
    if (!userClient) {
      return NextResponse.json({ error: 'User client not found' }, { status: 404 })
    }

    // Check edit permissions
    if (!['OWNER', 'MANAGER', 'SUPERVISOR'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

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
      item: updatedArea,
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
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ STORAGE API: Authentication failed:', authError)
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Get user client info for permissions
    const userClient = await getUserClient(user.id)
    if (!userClient) {
      return NextResponse.json({ error: 'User client not found' }, { status: 404 })
    }

    // Check delete permissions
    if (!['OWNER', 'MANAGER'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

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