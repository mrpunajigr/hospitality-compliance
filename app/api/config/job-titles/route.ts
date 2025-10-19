import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * GET /api/config/job-titles
 * Fetch business job titles for the authenticated user's client
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

    // Fetch job titles with department information
    const { data: jobTitles, error } = await supabase
      .from('business_job_titles')
      .select(`
        id,
        title,
        description,
        default_role,
        hierarchy_level,
        security_clearance,
        permission_template,
        sort_order,
        is_active,
        is_default,
        created_at,
        updated_at,
        primary_department:business_departments(id, name, color),
        reports_to:business_job_titles(id, title)
      `)
      .eq('client_id', userClient.clientId)
      .order('hierarchy_level', { ascending: false }) // Highest hierarchy first
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })

    if (error) {
      console.error('Job titles fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch job titles' }, { status: 500 })
    }

    // Filter sensitive information based on user role
    const filteredJobTitles = jobTitles?.map(title => {
      // Only MANAGER/OWNER can see permission templates and security clearance
      if (!['MANAGER', 'OWNER'].includes(userClient.role)) {
        const { security_clearance, permission_template, ...publicTitle } = title
        return publicTitle
      }
      return title
    })

    return NextResponse.json({
      success: true,
      jobTitles: filteredJobTitles || [],
      userPermissions: {
        canCreate: ['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role),
        canEdit: ['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role),
        canDelete: ['OWNER', 'CHAMPION'].includes(userClient.role),
        canViewSecurity: ['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role),
        canEditHigherRoles: userClient.role === 'OWNER'
      }
    })

  } catch (error) {
    console.error('Job titles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/config/job-titles
 * Create a new business job title
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

    // Check permissions - only MANAGER/OWNER/CHAMPION can create job titles
    if (!['MANAGER', 'OWNER', 'CHAMPION'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      title, 
      description, 
      default_role, 
      hierarchy_level, 
      security_clearance, 
      permission_template,
      primary_department_id,
      reports_to_title_id,
      sort_order 
    } = body

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER']
    if (default_role && !validRoles.includes(default_role)) {
      return NextResponse.json({ error: 'Invalid default role' }, { status: 400 })
    }

    // Only OWNER can create MANAGER/OWNER level titles
    if (['MANAGER', 'OWNER'].includes(default_role) && userClient.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can create manager/owner level positions' }, { status: 403 })
    }

    // Validate hierarchy level
    if (hierarchy_level && (hierarchy_level < 1 || hierarchy_level > 4)) {
      return NextResponse.json({ error: 'Hierarchy level must be between 1-4' }, { status: 400 })
    }

    // Validate security clearance
    const validSecurityLevels = ['basic', 'standard', 'elevated', 'admin']
    if (security_clearance && !validSecurityLevels.includes(security_clearance)) {
      return NextResponse.json({ error: 'Invalid security clearance' }, { status: 400 })
    }

    // Only OWNER can set elevated/admin security clearance
    if (['elevated', 'admin'].includes(security_clearance) && userClient.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can set elevated/admin security clearance' }, { status: 403 })
    }

    // Validate circular reporting (if reports_to_title_id is provided)
    if (reports_to_title_id) {
      // This will be checked by database constraint, but we can add client-side validation too
      const { data: reportingTitle } = await supabase
        .from('business_job_titles')
        .select('hierarchy_level')
        .eq('id', reports_to_title_id)
        .eq('client_id', userClient.clientId)
        .single()

      if (reportingTitle && hierarchy_level && reportingTitle.hierarchy_level <= hierarchy_level) {
        return NextResponse.json({ 
          error: 'Job title cannot report to a position at the same or lower hierarchy level' 
        }, { status: 400 })
      }
    }

    // Create job title
    const { data: jobTitle, error } = await supabase
      .from('business_job_titles')
      .insert({
        client_id: userClient.clientId,
        title: title.trim(),
        description: description?.trim() || null,
        default_role: default_role || 'STAFF',
        hierarchy_level: hierarchy_level || 1,
        security_clearance: security_clearance || 'standard',
        permission_template: permission_template || {},
        primary_department_id: primary_department_id || null,
        reports_to_title_id: reports_to_title_id || null,
        sort_order: sort_order || 0,
        is_active: true,
        is_default: false,
        created_by: user.id,
        updated_by: user.id
      })
      .select(`
        id,
        title,
        description,
        default_role,
        hierarchy_level,
        security_clearance,
        permission_template,
        sort_order,
        is_active,
        is_default,
        created_at,
        updated_at,
        primary_department:business_departments(id, name, color),
        reports_to:business_job_titles(id, title)
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Job title already exists' }, { status: 409 })
      }
      if (error.code === '23514') { // Check constraint violation
        return NextResponse.json({ error: 'Invalid hierarchy or circular reporting detected' }, { status: 400 })
      }
      console.error('Job title creation error:', error)
      return NextResponse.json({ error: 'Failed to create job title' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      jobTitle,
      message: 'Job title created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Job title creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/config/job-titles
 * Update an existing business job title
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

    // Check permissions - only MANAGER/OWNER can update job titles
    if (!['MANAGER', 'OWNER'].includes(userClient.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      id, 
      title, 
      description, 
      default_role, 
      hierarchy_level, 
      security_clearance, 
      permission_template,
      primary_department_id,
      reports_to_title_id,
      sort_order,
      is_active 
    } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'Job title ID is required' }, { status: 400 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    // Get existing job title to check permissions
    const { data: existingTitle } = await supabase
      .from('business_job_titles')
      .select('default_role, hierarchy_level')
      .eq('id', id)
      .eq('client_id', userClient.clientId)
      .single()

    if (!existingTitle) {
      return NextResponse.json({ error: 'Job title not found' }, { status: 404 })
    }

    // Only OWNER can modify MANAGER/OWNER level titles
    if (['MANAGER', 'OWNER'].includes(existingTitle.default_role) && userClient.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can modify manager/owner level positions' }, { status: 403 })
    }

    // Build update object
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    // Add optional fields with validation
    if (default_role) {
      const validRoles = ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER']
      if (!validRoles.includes(default_role)) {
        return NextResponse.json({ error: 'Invalid default role' }, { status: 400 })
      }
      
      // Only OWNER can set MANAGER/OWNER roles
      if (['MANAGER', 'OWNER'].includes(default_role) && userClient.role !== 'OWNER') {
        return NextResponse.json({ error: 'Only owners can set manager/owner roles' }, { status: 403 })
      }
      
      updateData.default_role = default_role
    }

    if (hierarchy_level !== undefined) {
      if (hierarchy_level < 1 || hierarchy_level > 4) {
        return NextResponse.json({ error: 'Hierarchy level must be between 1-4' }, { status: 400 })
      }
      updateData.hierarchy_level = hierarchy_level
    }

    if (security_clearance) {
      const validSecurityLevels = ['basic', 'standard', 'elevated', 'admin']
      if (!validSecurityLevels.includes(security_clearance)) {
        return NextResponse.json({ error: 'Invalid security clearance' }, { status: 400 })
      }
      
      // Only OWNER can set elevated/admin clearance
      if (['elevated', 'admin'].includes(security_clearance) && userClient.role !== 'OWNER') {
        return NextResponse.json({ error: 'Only owners can set elevated/admin security clearance' }, { status: 403 })
      }
      
      updateData.security_clearance = security_clearance
    }

    if (permission_template) updateData.permission_template = permission_template
    if (primary_department_id !== undefined) updateData.primary_department_id = primary_department_id
    if (reports_to_title_id !== undefined) updateData.reports_to_title_id = reports_to_title_id
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active

    // Update job title
    const { data: jobTitle, error } = await supabase
      .from('business_job_titles')
      .update(updateData)
      .eq('id', id)
      .eq('client_id', userClient.clientId)
      .select(`
        id,
        title,
        description,
        default_role,
        hierarchy_level,
        security_clearance,
        permission_template,
        sort_order,
        is_active,
        is_default,
        created_at,
        updated_at,
        primary_department:business_departments(id, name, color),
        reports_to:business_job_titles(id, title)
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Job title already exists' }, { status: 409 })
      }
      if (error.code === '23514') { // Check constraint violation
        return NextResponse.json({ error: 'Invalid hierarchy or circular reporting detected' }, { status: 400 })
      }
      console.error('Job title update error:', error)
      return NextResponse.json({ error: 'Failed to update job title' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      jobTitle,
      message: 'Job title updated successfully'
    })

  } catch (error) {
    console.error('Job title update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/config/job-titles
 * Delete a business job title
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

    // Check permissions - only OWNER can delete job titles
    if (userClient.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can delete job titles' }, { status: 403 })
    }

    // Get job title ID from query params
    const { searchParams } = new URL(request.url)
    const titleId = searchParams.get('id')

    if (!titleId) {
      return NextResponse.json({ error: 'Job title ID is required' }, { status: 400 })
    }

    // Check if job title is in use (has users assigned or other titles reporting to it)
    const { data: usageCheck, error: usageError } = await supabase
      .from('business_job_titles')
      .select('id')
      .eq('reports_to_title_id', titleId)
      .limit(1)

    if (usageError) {
      console.error('Job title usage check error:', usageError)
      return NextResponse.json({ error: 'Failed to check job title usage' }, { status: 500 })
    }

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete job title that has other positions reporting to it. Please reassign reporting structure first.' 
      }, { status: 409 })
    }

    // TODO: Also check if any users are assigned this job title in profiles/invitations
    // This would require checking the profiles table for job_title field

    // Delete job title
    const { error } = await supabase
      .from('business_job_titles')
      .delete()
      .eq('id', titleId)
      .eq('client_id', userClient.clientId)

    if (error) {
      console.error('Job title deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete job title' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Job title deleted successfully'
    })

  } catch (error) {
    console.error('Job title deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}