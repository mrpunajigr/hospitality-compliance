import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * GET /api/config/departments
 * Fetch business departments for the authenticated user's client
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

    // Check permissions - all authenticated users can view departments
    // But different roles see different levels of detail

    // Fetch departments with security-aware data
    const { data: departments, error } = await supabase
      .from('business_departments')
      .select(`
        id,
        name,
        description,
        color,
        icon,
        security_level,
        sort_order,
        is_active,
        is_default,
        created_at,
        updated_at
      `)
      .eq('client_id', userClient.clientId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Department fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
    }

    // Filter sensitive information based on user role
    const filteredDepartments = departments?.map(dept => {
      // Only MANAGER/OWNER can see security levels
      if (!['MANAGER', 'OWNER'].includes(userClient.role)) {
        const { security_level, ...publicDept } = dept
        return publicDept
      }
      return dept
    })

    return NextResponse.json({
      success: true,
      departments: filteredDepartments || [],
      userPermissions: {
        canCreate: ['MANAGER', 'OWNER'].includes(userClient.role),
        canEdit: ['MANAGER', 'OWNER'].includes(userClient.role),
        canDelete: userClient.role === 'OWNER',
        canViewSecurity: ['MANAGER', 'OWNER'].includes(userClient.role)
      }
    })

  } catch (error) {
    console.error('Departments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/config/departments
 * Create a new business department
 */
export async function POST(request: NextRequest) {
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

    // Check permissions - only MANAGER/OWNER can create departments
    if (!['MANAGER', 'OWNER'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name, description, color, icon, security_level, sort_order } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    // Validate security level if provided
    const validSecurityLevels = ['public', 'internal', 'restricted', 'confidential']
    if (security_level && !validSecurityLevels.includes(security_level)) {
      return NextResponse.json({ error: 'Invalid security level' }, { status: 400 })
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json({ error: 'Invalid color format. Use hex format (#RRGGBB)' }, { status: 400 })
    }

    // Create department
    const { data: department, error } = await supabase
      .from('business_departments')
      .insert({
        client_id: userClient.clientId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || '🏢',
        security_level: security_level || 'internal',
        sort_order: sort_order || 0,
        is_active: true,
        is_default: false,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Department name already exists' }, { status: 409 })
      }
      console.error('Department creation error:', error)
      return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      department,
      message: 'Department created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Department creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/config/departments
 * Update an existing business department
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

    // Check permissions - only MANAGER/OWNER can update departments
    if (!['MANAGER', 'OWNER'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { id, name, description, color, icon, security_level, sort_order, is_active } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 })
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    // Build update object
    const updateData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
      updateData.color = color
    }
    if (icon) updateData.icon = icon
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active

    // Only OWNER can change security levels of restricted/confidential departments
    if (security_level) {
      const validSecurityLevels = ['public', 'internal', 'restricted', 'confidential']
      if (!validSecurityLevels.includes(security_level)) {
        return NextResponse.json({ error: 'Invalid security level' }, { status: 400 })
      }

      // Check if user has permission to set this security level
      if (['restricted', 'confidential'].includes(security_level) && userClient.role !== 'OWNER') {
        return NextResponse.json({ error: 'Only owners can set restricted/confidential security levels' }, { status: 403 })
      }

      updateData.security_level = security_level
    }

    // Update department
    const { data: department, error } = await supabase
      .from('business_departments')
      .update(updateData)
      .eq('id', id)
      .eq('client_id', userClient.clientId) // Ensure user can only update their client's departments
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Department name already exists' }, { status: 409 })
      }
      console.error('Department update error:', error)
      return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
    }

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      department,
      message: 'Department updated successfully'
    })

  } catch (error) {
    console.error('Department update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/config/departments
 * Delete a business department
 */
export async function DELETE(request: NextRequest) {
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

    // Check permissions - only OWNER can delete departments
    if (userClient.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can delete departments' }, { status: 403 })
    }

    // Get department ID from query params
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('id')

    if (!departmentId) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 })
    }

    // Check if department is in use (has associated job titles or users)
    const { data: usageCheck, error: usageError } = await supabase
      .from('business_job_titles')
      .select('id')
      .eq('primary_department_id', departmentId)
      .limit(1)

    if (usageError) {
      console.error('Department usage check error:', usageError)
      return NextResponse.json({ error: 'Failed to check department usage' }, { status: 500 })
    }

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete department that is assigned to job titles. Please reassign or remove job titles first.' 
      }, { status: 409 })
    }

    // Delete department
    const { error } = await supabase
      .from('business_departments')
      .delete()
      .eq('id', departmentId)
      .eq('client_id', userClient.clientId) // Ensure user can only delete their client's departments

    if (error) {
      console.error('Department deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    })

  } catch (error) {
    console.error('Department deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}