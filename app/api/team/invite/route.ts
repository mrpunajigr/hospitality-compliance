import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// =====================================================
// TEAM INVITATION API
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role, clientId, message } = body

    // Validate required fields
    if (!email || !role || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, clientId' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['staff', 'manager', 'admin', 'owner']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: staff, manager, admin, owner' },
        { status: 400 }
      )
    }

    // Get the current user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Verify the user has permission to invite users for this client
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Check if user has permission to invite users for this client
    const { data: clientUser, error: clientUserError } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    if (clientUserError || !clientUser) {
      return NextResponse.json(
        { error: 'You do not have access to this client' },
        { status: 403 }
      )
    }

    // Check if user has admin or owner role
    if (!['admin', 'owner'].includes(clientUser.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to invite users' },
        { status: 403 }
      )
    }

    // Check if user already exists in the system
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      // Check if user is already a member of this client
      const { data: existingClientUser } = await supabase
        .from('client_users')
        .select('id, status')
        .eq('user_id', existingProfile.id)
        .eq('client_id', clientId)
        .single()

      if (existingClientUser) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        )
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('email', email)
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'There is already a pending invitation for this email' },
        { status: 400 }
      )
    }

    // Get client information for the invitation
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name, business_email')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        email,
        client_id: clientId,
        role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending'
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Error creating invitation:', invitationError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send invitation email (in a real app, you'd use a service like Resend or SendGrid)
    // For now, we'll just log the invitation details
    console.log('Invitation created:', {
      email,
      clientName: client.name,
      role,
      invitationToken: invitation.token,
      invitedBy: user.email,
      expiresAt: invitation.expires_at
    })

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        user_id: user.id,
        action: 'invite_user',
        resource_type: 'invitation',
        resource_id: invitation.id,
        details: {
          invited_email: email,
          role: role,
          invitation_token: invitation.token
        }
      })

    // Return success response
    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at
      },
      invitationUrl: `${request.nextUrl.origin}/accept-invitation?token=${invitation.token}`
    })

  } catch (error) {
    console.error('Team invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get pending invitations for a client
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

    // Get the current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Check if user has access to this client
    const { data: clientUser, error: clientUserError } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    if (clientUserError || !clientUser) {
      return NextResponse.json(
        { error: 'You do not have access to this client' },
        { status: 403 }
      )
    }

    // Get pending invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        created_at,
        invited_by,
        profiles!invitations_invited_by_fkey (
          full_name,
          email
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      invitations: invitations || []
    })

  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Cancel/delete an invitation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitationId')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Missing invitationId parameter' },
        { status: 400 }
      )
    }

    // Get the current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('client_id, email, status')
      .eq('id', invitationId)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to cancel this invitation
    const { data: clientUser, error: clientUserError } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('client_id', invitation.client_id)
      .eq('status', 'active')
      .single()

    if (clientUserError || !clientUser || !['admin', 'owner'].includes(clientUser.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this invitation' },
        { status: 403 }
      )
    }

    // Update invitation status to cancelled
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)

    if (updateError) {
      console.error('Error cancelling invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel invitation' },
        { status: 500 }
      )
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        client_id: invitation.client_id,
        user_id: user.id,
        action: 'cancel_invitation',
        resource_type: 'invitation',
        resource_id: invitationId,
        details: {
          cancelled_email: invitation.email
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}