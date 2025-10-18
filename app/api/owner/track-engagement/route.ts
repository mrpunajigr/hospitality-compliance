import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/owner/track-engagement
 * Track owner email engagement (opens, clicks, review starts)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { action, invitationToken, metadata } = body

    // Validate required fields
    if (!action || !invitationToken) {
      return NextResponse.json({ error: 'Action and invitation token are required' }, { status: 400 })
    }

    // Validate action type
    const validActions = ['email_opened', 'link_clicked', 'review_started', 'review_completed']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    // Get invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('owner_invitations')
      .select('id, champion_id, client_id, status')
      .eq('invitation_token', invitationToken)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
    }

    // Update invitation record with engagement data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    switch (action) {
      case 'email_opened':
        updateData.email_opened_at = new Date().toISOString()
        if (invitation.status === 'pending') {
          updateData.status = 'viewed'
        }
        break
      
      case 'link_clicked':
        updateData.link_clicked_at = new Date().toISOString()
        if (invitation.status === 'pending') {
          updateData.status = 'viewed'
        }
        break
      
      case 'review_started':
        updateData.review_started_at = new Date().toISOString()
        updateData.status = 'reviewing'
        break
      
      case 'review_completed':
        updateData.review_completed_at = new Date().toISOString()
        // Status will be updated when owner responds
        break
    }

    // Update invitation record
    const { error: updateError } = await supabase
      .from('owner_invitations')
      .update(updateData)
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation engagement:', updateError)
      return NextResponse.json({ error: 'Failed to track engagement' }, { status: 500 })
    }

    // Log detailed engagement event
    await supabase
      .from('owner_engagement_events')
      .insert({
        invitation_id: invitation.id,
        champion_id: invitation.champion_id,
        client_id: invitation.client_id,
        event_type: action,
        event_data: metadata || {},
        ip_address: getClientIP(request),
        user_agent: request.headers.get('user-agent') || null,
        timestamp: new Date().toISOString()
      })

    // Notify champion of engagement (for immediate actions)
    if (['email_opened', 'link_clicked', 'review_started'].includes(action)) {
      await notifyChampionOfEngagement(invitation.champion_id, invitation.client_id, action, invitationToken)
    }

    return NextResponse.json({
      success: true,
      message: 'Engagement tracked successfully'
    })

  } catch (error) {
    console.error('Email engagement tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/owner/track-engagement
 * Get engagement statistics for invitation (for analytics)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationToken = searchParams.get('token')

    if (!invitationToken) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 })
    }

    // Get invitation with engagement data
    const { data: invitation, error } = await supabase
      .from('owner_invitations')
      .select(`
        id,
        status,
        sent_at,
        email_opened_at,
        link_clicked_at,
        review_started_at,
        review_completed_at,
        responded_at
      `)
      .eq('invitation_token', invitationToken)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
    }

    // Get detailed engagement events
    const { data: events } = await supabase
      .from('owner_engagement_events')
      .select('event_type, event_data, timestamp')
      .eq('invitation_id', invitation.id)
      .order('timestamp', { ascending: true })

    // Calculate engagement metrics
    const metrics = calculateEngagementMetrics(invitation, events || [])

    return NextResponse.json({
      success: true,
      invitation: invitation,
      events: events || [],
      metrics: metrics
    })

  } catch (error) {
    console.error('Engagement statistics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Notify champion of owner engagement
 */
async function notifyChampionOfEngagement(
  championId: string, 
  clientId: string, 
  action: string, 
  invitationToken: string
) {
  try {
    // Create real-time notification for champion
    const notificationMessage = getEngagementNotificationMessage(action)
    
    // Store notification in database for champion to see
    await supabase
      .from('champion_notifications')
      .insert({
        champion_id: championId,
        client_id: clientId,
        notification_type: 'owner_engagement',
        title: notificationMessage.title,
        message: notificationMessage.message,
        action_url: `/champion/dashboard?highlight=owner-invitation`,
        is_read: false,
        created_at: new Date().toISOString()
      })

    // TODO: Implement real-time notifications (WebSocket, Server-Sent Events, etc.)
    console.log(`Champion notification: ${notificationMessage.title}`)

  } catch (error) {
    console.error('Error notifying champion of engagement:', error)
    // Don't throw - notification failure shouldn't break engagement tracking
  }
}

/**
 * Get notification message based on engagement action
 */
function getEngagementNotificationMessage(action: string) {
  switch (action) {
    case 'email_opened':
      return {
        title: '👀 Owner opened your invitation!',
        message: 'Your business owner has opened the email invitation. They\'re reviewing your setup now.'
      }
    
    case 'link_clicked':
      return {
        title: '🚀 Owner clicked the review link!',
        message: 'Great news! The owner is actively engaging with your invitation.'
      }
    
    case 'review_started':
      return {
        title: '📋 Owner is reviewing your configuration!',
        message: 'The owner has started reviewing your JiGR setup. You should hear back soon.'
      }
    
    default:
      return {
        title: '📈 Owner engagement detected',
        message: 'Your business owner is interacting with the invitation.'
      }
  }
}

/**
 * Calculate engagement metrics for analytics
 */
function calculateEngagementMetrics(invitation: any, events: any[]) {
  const now = new Date()
  const sentAt = new Date(invitation.sent_at)
  
  return {
    totalEngagementTime: invitation.responded_at 
      ? Math.round((new Date(invitation.responded_at).getTime() - sentAt.getTime()) / (1000 * 60 * 60)) // hours
      : Math.round((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60)),
    
    timeToFirstOpen: invitation.email_opened_at
      ? Math.round((new Date(invitation.email_opened_at).getTime() - sentAt.getTime()) / (1000 * 60)) // minutes
      : null,
    
    timeToFirstClick: invitation.link_clicked_at
      ? Math.round((new Date(invitation.link_clicked_at).getTime() - sentAt.getTime()) / (1000 * 60)) // minutes
      : null,
    
    timeToReviewStart: invitation.review_started_at
      ? Math.round((new Date(invitation.review_started_at).getTime() - sentAt.getTime()) / (1000 * 60)) // minutes
      : null,
    
    engagementEvents: events.length,
    
    engagementScore: calculateEngagementScore(invitation, events),
    
    conversionFunnel: {
      emailSent: true,
      emailOpened: !!invitation.email_opened_at,
      linkClicked: !!invitation.link_clicked_at,
      reviewStarted: !!invitation.review_started_at,
      reviewCompleted: !!invitation.review_completed_at,
      responded: !!invitation.responded_at
    }
  }
}

/**
 * Calculate engagement score (0-100)
 */
function calculateEngagementScore(invitation: any, events: any[]): number {
  let score = 0
  
  // Email opened (20 points)
  if (invitation.email_opened_at) score += 20
  
  // Link clicked (30 points)
  if (invitation.link_clicked_at) score += 30
  
  // Review started (30 points)
  if (invitation.review_started_at) score += 30
  
  // Response provided (20 points)
  if (invitation.responded_at) score += 20
  
  // Bonus for quick engagement (up to 10 points)
  if (invitation.email_opened_at) {
    const sentAt = new Date(invitation.sent_at)
    const openedAt = new Date(invitation.email_opened_at)
    const hoursToOpen = (openedAt.getTime() - sentAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursToOpen <= 1) score += 10      // Opened within 1 hour
    else if (hoursToOpen <= 6) score += 7  // Opened within 6 hours
    else if (hoursToOpen <= 24) score += 5 // Opened within 24 hours
    else if (hoursToOpen <= 72) score += 2 // Opened within 3 days
  }
  
  return Math.min(100, score)
}