import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * GET /api/config/roles
 * Fetch business role configuration for the authenticated user's client
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Check permissions - MANAGER and OWNER can view/edit roles
    const canEdit = userClient.permissions.changeUserRoles || false
    const canViewSecurity = ['MANAGER', 'OWNER'].includes(userClient.role)

    // Fetch business roles configuration
    const { data: roles, error } = await supabase
      .from('business_roles')
      .select(`
        id,
        system_role,
        display_name,
        is_enabled,
        description,
        sort_order,
        created_at,
        updated_at
      `)
      .eq('client_id', userClient.clientId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Role fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      roles: roles || [],
      userPermissions: {
        canCreate: canEdit,
        canEdit: canEdit,
        canDelete: false, // Roles cannot be deleted, only disabled
        canViewSecurity: canViewSecurity
      }
    })

  } catch (error) {
    console.error('Role configuration API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * PUT /api/config/roles
 * Update business role configuration
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Check permissions - only MANAGER and OWNER can modify roles
    if (!userClient.permissions.changeUserRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { system_role, display_name, is_enabled, description } = body

    if (!system_role || !['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'].includes(system_role)) {
      return NextResponse.json({ error: 'Invalid system role' }, { status: 400 })
    }

    // Check if role configuration already exists
    const { data: existingRole } = await supabase
      .from('business_roles')
      .select('id')
      .eq('client_id', userClient.clientId)
      .eq('system_role', system_role)
      .single()

    if (existingRole) {
      // Update existing role configuration
      const updateData: any = { updated_at: new Date().toISOString() }
      
      if (display_name !== undefined) updateData.display_name = display_name
      if (is_enabled !== undefined) updateData.is_enabled = is_enabled
      if (description !== undefined) updateData.description = description

      const { error: updateError } = await supabase
        .from('business_roles')
        .update(updateData)
        .eq('id', existingRole.id)

      if (updateError) {
        console.error('Role update error:', updateError)
        return NextResponse.json({ error: 'Failed to update role configuration' }, { status: 500 })
      }
    } else {
      // Create new role configuration
      const { error: insertError } = await supabase
        .from('business_roles')
        .insert({
          client_id: userClient.clientId,
          system_role,
          display_name: display_name || getDefaultRoleName(system_role),
          is_enabled: is_enabled ?? true,
          description: description || null,
          sort_order: getRoleSortOrder(system_role)
        })

      if (insertError) {
        console.error('Role insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create role configuration' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Role configuration updated successfully'
    })

  } catch (error) {
    console.error('Role configuration update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * Helper function to get default role names
 */
function getDefaultRoleName(systemRole: string): string {
  const names = {
    STAFF: 'Staff',
    SUPERVISOR: 'Supervisor',
    MANAGER: 'Manager',
    OWNER: 'Owner'
  }
  return names[systemRole as keyof typeof names] || systemRole
}

/**
 * Helper function to get role sort order
 */
function getRoleSortOrder(systemRole: string): number {
  const order = {
    STAFF: 1,
    SUPERVISOR: 2,
    MANAGER: 3,
    OWNER: 4
  }
  return order[systemRole as keyof typeof order] || 0
}