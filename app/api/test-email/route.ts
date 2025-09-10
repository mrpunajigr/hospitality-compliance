import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import type { InvitationEmailData } from '@/lib/email-service'

// Test email API endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type = 'invitation' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    let result
    
    switch (type) {
      case 'invitation':
        const invitationData: InvitationEmailData = {
          inviteeEmail: email,
          inviteeName: 'Test User',
          inviterName: 'System Administrator',
          organizationName: 'Demo Restaurant',
          role: 'STAFF',
          invitationToken: `test-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          personalMessage: 'This is a test invitation email to verify our email service is working correctly.',
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation?token=test-token-${Date.now()}`
        }
        
        result = await emailService.sendInvitation(invitationData)
        break

      case 'welcome':
        result = await emailService.sendWelcome(
          email,
          'Test User',
          'Demo Restaurant'
        )
        break

      case 'role-change':
        result = await emailService.sendRoleChanged(
          email,
          'Test User',
          'MANAGER',
          'System Administrator'
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: invitation, welcome, or role-change' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      provider: process.env.EMAIL_PROVIDER || 'demo',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to show email service status
export async function GET() {
  return NextResponse.json({
    provider: process.env.EMAIL_PROVIDER || 'demo',
    fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@hospitality-compliance.com',
    fromName: process.env.EMAIL_FROM_NAME || 'JiGR Hospitality Compliance',
    hasApiKey: !!process.env.EMAIL_API_KEY,
    status: 'ready',
    availableTypes: ['invitation', 'welcome', 'role-change']
  })
}