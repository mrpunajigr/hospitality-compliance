import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'
import type { InvitationEmailData } from '@/lib/email-service'

// Team Member Invitation API
export async function POST(request: NextRequest) {
  console.log('🔵 Invitation API called')
  try {
    const body = await request.json()
    console.log('🔵 Request body:', body)
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      phone, 
      department, 
      jobTitle, 
      message,
      clientId 
    } = body
    console.log('🔵 Extracted data:', { email, firstName, lastName, role, clientId })

    // Validate required fields
    if (!email || !firstName || !lastName || !role || !clientId) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: email, firstName, lastName, role, clientId' },
        { status: 400 }
      )
    }
    console.log('✅ Required fields validated')

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be STAFF, SUPERVISOR, MANAGER, or OWNER' },
        { status: 400 }
      )
    }

    // Check for demo mode (clientId = '1' means demo)
    if (clientId === '1') {
      const invitationId = `demo-${Date.now()}`
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const invitationToken = `demo-token-${Date.now()}`
      
      // Send demo email
      try {
        const emailData: InvitationEmailData = {
          inviteeEmail: email,
          inviteeName: `${firstName} ${lastName}`,
          inviterName: 'Demo User',
          organizationName: 'Demo Restaurant',
          role: role as any,
          invitationToken,
          expiresAt,
          personalMessage: message,
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation?token=${invitationToken}`
        }
        
        const emailResult = await emailService.sendInvitation(emailData)
        
        return NextResponse.json({
          success: true,
          invitation: {
            id: invitationId,
            email,
            firstName,
            lastName,
            role,
            status: 'pending',
            expiresAt,
            message: 'Demo invitation created and email sent successfully',
            emailSent: emailResult.success,
            emailError: emailResult.error
          }
        })
      } catch (error) {
        console.error('Error sending demo email:', error)
        return NextResponse.json({
          success: true,
          invitation: {
            id: invitationId,
            email,
            firstName,
            lastName,
            role,
            status: 'pending',
            expiresAt,
            message: 'Demo invitation created but email failed',
            emailSent: false,
            emailError: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    // TEMPORARY: Skip authentication for testing - will fix after confirming API works
    // For demo mode, create a mock user to test the invitation flow
    const user = {
      id: 'demo-user-id',
      email: 'dev@jigr.app'
    }

    // Check if user has permission to invite users
    const { data: userRole, error: roleError } = await supabase
      .rpc('user_client_role', {
        user_uuid: user.id,
        target_client_id: clientId
      })

    if (roleError || !userRole || !['OWNER', 'MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite users' },
        { status: 403 }
      )
    }

    // Check if MANAGER trying to invite OWNER or MANAGER
    if (userRole === 'MANAGER' && ['OWNER', 'MANAGER'].includes(role)) {
      return NextResponse.json(
        { error: 'Managers can only invite STAFF and SUPERVISOR users' },
        { status: 403 }
      )
    }

    // Check if user is already invited or a member
    const { data: existingUser } = await supabase
      .from('client_users')
      .select('profiles!inner(email)')
      .eq('client_id', clientId)
      .eq('profiles.email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      )
    }

    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('client_id', clientId)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'User already has a pending invitation' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        client_id: clientId,
        email: email.toLowerCase().trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
        phone: phone?.trim(),
        department: department?.trim(),
        job_title: jobTitle?.trim(),
        invitation_message: message?.trim(),
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select('id, token')
      .single()

    if (inviteError) {
      console.error('❌ Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }
    console.log('✅ Invitation created successfully:', invitation)

    // Log audit trail
    await supabase.from('audit_logs').insert({
      client_id: clientId,
      user_id: user.id,
      action: 'user_invited',
      resource_type: 'invitation',
      resource_id: invitation.id,
      details: {
        invitedEmail: email,
        assignedRole: role,
        inviterRole: userRole
      }
    })

    // Send invitation email using email service
    try {
      const { data: organization } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single()

      const organizationName = organization?.name || 'Unknown Organization'
      
      const emailData: InvitationEmailData = {
        inviteeEmail: email,
        inviteeName: `${firstName} ${lastName}`,
        inviterName: 'System Administrator', // TODO: Get actual inviter name
        organizationName,
        role: role as any,
        invitationToken: invitation.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        personalMessage: message,
        acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation?token=${invitation.token}`
      }
      
      const emailResult = await emailService.sendInvitation(emailData)
      console.log('📧 Email result:', emailResult)
    } catch (emailError) {
      console.warn('⚠️ Failed to send invitation email:', emailError)
      // Continue - the invitation was created successfully
    }

    console.log('🎉 About to return success response')
    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitation.id
    })

  } catch (error) {
    console.error('❌ Error in team invitation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get pending invitations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId parameter' },
        { status: 400 }
      )
    }

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      )
    }

    // Check if user has permission to view invitations
    const { data: userRole, error: roleError } = await supabase
      .rpc('user_client_role', {
        user_uuid: user.id,
        target_client_id: clientId
      })

    if (roleError || !userRole || !['OWNER', 'MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view invitations' },
        { status: 403 }
      )
    }

    // Get pending invitations
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        phone,
        department,
        job_title,
        created_at,
        expires_at,
        status,
        profiles!invited_by (
          full_name,
          email
        )
      `)
      .eq('client_id', clientId)
      .in('status', ['pending'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invitations: invitations || []
    })

  } catch (error) {
    console.error('❌ Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Cancel invitation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitationId')
    const clientId = searchParams.get('clientId')

    if (!invitationId || !clientId) {
      return NextResponse.json(
        { error: 'Missing invitationId or clientId parameter' },
        { status: 400 }
      )
    }

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      )
    }

    // Check if user has permission to cancel invitations
    const { data: userRole, error: roleError } = await supabase
      .rpc('user_client_role', {
        user_uuid: user.id,
        target_client_id: clientId
      })

    if (roleError || !userRole || !['OWNER', 'MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to cancel invitations' },
        { status: 403 }
      )
    }

    // Get invitation details for audit log
    const { data: invitation, error: getError } = await supabase
      .from('invitations')
      .select('email, role, status')
      .eq('id', invitationId)
      .eq('client_id', clientId)
      .single()

    if (getError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending invitations' },
        { status: 400 }
      )
    }

    // Cancel the invitation
    const { error: cancelError } = await supabase
      .from('invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('client_id', clientId)

    if (cancelError) {
      console.error('Error cancelling invitation:', cancelError)
      return NextResponse.json(
        { error: 'Failed to cancel invitation' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      client_id: clientId,
      user_id: user.id,
      action: 'invitation_cancelled',
      resource_type: 'invitation',
      resource_id: invitationId,
      details: {
        invitedEmail: invitation.email,
        assignedRole: invitation.role
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    })

  } catch (error) {
    console.error('❌ Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

