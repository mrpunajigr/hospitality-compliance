import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * GET /api/config/security
 * Fetch business security settings for the authenticated user's client
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Bearer token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Fetch security settings
    const { data: securitySettings, error } = await supabase
      .from('business_security_settings')
      .select(`
        id,
        setting_key,
        setting_name,
        setting_value,
        category,
        is_enabled,
        created_at,
        updated_at
      `)
      .eq('client_id', userClient.clientId)
      .order('category', { ascending: true })
      .order('setting_name', { ascending: true })

    if (error) {
      console.error('Security settings fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch security settings' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      securitySettings: securitySettings || [],
      userPermissions: {
        canCreate: ['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role),
        canEdit: ['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role),
        canDelete: ['OWNER', 'CHAMPION'].includes(userClient.role),
        canViewSecurity: ['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role)
      }
    })

  } catch (error) {
    console.error('Security settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/config/security
 * Create a new business security setting
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Bearer token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Check permissions - only MANAGER/OWNER/CHAMPION can create security settings
    if (!['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      setting_key, 
      setting_name, 
      setting_value, 
      category
    } = body

    // Validate required fields
    if (!setting_key?.trim() || !setting_name?.trim()) {
      return NextResponse.json({ error: 'Setting key and name are required' }, { status: 400 })
    }

    // Validate category
    const validCategories = ['authentication', 'sessions', 'monitoring', 'access', 'compliance', 'custom']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create security setting
    const { data: securitySetting, error } = await supabase
      .from('business_security_settings')
      .insert({
        client_id: userClient.clientId,
        setting_key: setting_key.trim(),
        setting_name: setting_name.trim(),
        setting_value: setting_value || null,
        category: category || 'custom',
        is_enabled: true,
        created_by: user.id,
        updated_by: user.id
      })
      .select(`
        id,
        setting_key,
        setting_name,
        setting_value,
        category,
        is_enabled,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Security setting already exists' }, { status: 409 })
      }
      console.error('Security setting creation error:', error)
      return NextResponse.json({ error: 'Failed to create security setting' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      securitySetting,
      message: 'Security setting created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Security setting creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/config/security
 * Update an existing business security setting
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Bearer token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Check permissions - only MANAGER/OWNER/CHAMPION can update security settings
    if (!['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      id, 
      setting_name, 
      setting_value, 
      is_enabled 
    } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'Security setting ID is required' }, { status: 400 })
    }

    // Build update object
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    // Add optional fields
    if (setting_name !== undefined) updateData.setting_name = setting_name.trim()
    if (setting_value !== undefined) updateData.setting_value = setting_value
    if (is_enabled !== undefined) updateData.is_enabled = is_enabled

    // Update security setting
    const { data: securitySetting, error } = await supabase
      .from('business_security_settings')
      .update(updateData)
      .eq('id', id)
      .eq('client_id', userClient.clientId)
      .select(`
        id,
        setting_key,
        setting_name,
        setting_value,
        category,
        is_enabled,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Security setting already exists' }, { status: 409 })
      }
      console.error('Security setting update error:', error)
      return NextResponse.json({ error: 'Failed to update security setting' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      securitySetting,
      message: 'Security setting updated successfully'
    })

  } catch (error) {
    console.error('Security setting update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/config/security
 * Delete a business security setting
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user from Bearer token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Check permissions - only OWNER/CHAMPION can delete security settings
    if (!['OWNER', 'CHAMPION'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Only owners can delete security settings' }, { status: 403 })
    }

    // Get security setting ID from query params
    const { searchParams } = new URL(request.url)
    const settingId = searchParams.get('id')

    if (!settingId) {
      return NextResponse.json({ error: 'Security setting ID is required' }, { status: 400 })
    }

    // Delete security setting
    const { error } = await supabase
      .from('business_security_settings')
      .delete()
      .eq('id', settingId)
      .eq('client_id', userClient.clientId)

    if (error) {
      console.error('Security setting deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete security setting' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Security setting deleted successfully'
    })

  } catch (error) {
    console.error('Security setting deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}