import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * POST /api/champion/invite-owner
 * Champion sends owner invitation with evaluation data
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

    // Check if user is CHAMPION
    if (userClient.role !== 'CHAMPION') {
      return NextResponse.json({ error: 'Only champions can invite owners' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      ownerName, 
      ownerEmail, 
      ownerPhone, 
      relationship, 
      preferredContact,
      evaluationMessage,
      timeline,
      includeROIData 
    } = body

    // Validate required fields
    if (!ownerName?.trim() || !ownerEmail?.trim()) {
      return NextResponse.json({ error: 'Owner name and email are required' }, { status: 400 })
    }

    // Check if owner already exists in the system
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', ownerEmail.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists in the system' }, { status: 409 })
    }

    // Check for existing owner invitation
    const { data: existingInvitation } = await supabase
      .from('owner_invitations')
      .select('id, status')
      .eq('client_id', userClient.clientId)
      .eq('email', ownerEmail.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json({ error: 'Owner invitation already sent and pending' }, { status: 409 })
    }

    // Generate evaluation summary
    const evaluationSummary = await generateEvaluationSummary(userClient.clientId)

    // Create owner invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('owner_invitations')
      .insert({
        client_id: userClient.clientId,
        champion_id: user.id,
        owner_name: ownerName.trim(),
        email: ownerEmail.toLowerCase(),
        phone: ownerPhone?.trim() || null,
        relationship: relationship || 'Business Owner',
        preferred_contact: preferredContact || 'email',
        evaluation_message: evaluationMessage?.trim() || null,
        timeline: timeline || null,
        evaluation_summary: evaluationSummary,
        include_roi_data: includeROIData || false,
        invitation_token: generateInvitationToken(),
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        status: 'pending'
      })
      .select('id, invitation_token')
      .single()

    if (inviteError) {
      console.error('Error creating owner invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create owner invitation' }, { status: 500 })
    }

    // Send invitation email
    const emailSent = await sendOwnerInvitationEmail({
      ownerName,
      ownerEmail,
      championName: userClient.name,
      clientName: userClient.name,
      invitationToken: invitation.invitation_token,
      evaluationSummary,
      preferredContact,
      ownerPhone,
      timeline
    })

    if (!emailSent) {
      console.warn('Failed to send invitation email, but invitation created')
    }

    // Log audit event
    await supabase
      .from('audit_logs')
      .insert({
        client_id: userClient.clientId,
        user_id: user.id,
        action: 'owner_invitation_sent',
        resource_type: 'owner_invitation',
        resource_id: invitation.id,
        details: {
          ownerEmail,
          relationship,
          timeline: timeline || 'Not specified',
          evaluationStage: 'champion_setup_complete'
        }
      })

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      message: 'Owner invitation sent successfully',
      emailSent
    }, { status: 201 })

  } catch (error) {
    console.error('Owner invitation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/champion/invite-owner
 * Get owner invitation status and evaluation summary
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

    // Check if user is CHAMPION
    if (userClient.role !== 'CHAMPION') {
      return NextResponse.json({ error: 'Only champions can view owner invitation status' }, { status: 403 })
    }

    // Get latest owner invitation
    const { data: invitation, error } = await supabase
      .from('owner_invitations')
      .select(`
        id,
        owner_name,
        email,
        phone,
        relationship,
        preferred_contact,
        evaluation_message,
        timeline,
        evaluation_summary,
        status,
        created_at,
        expires_at,
        responded_at,
        owner_feedback
      `)
      .eq('client_id', userClient.clientId)
      .eq('champion_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching owner invitation:', error)
      return NextResponse.json({ error: 'Failed to fetch invitation status' }, { status: 500 })
    }

    // Generate current evaluation summary
    const currentEvaluationSummary = await generateEvaluationSummary(userClient.clientId)

    return NextResponse.json({
      success: true,
      invitation,
      currentEvaluationSummary,
      canInviteOwner: !invitation || invitation.status !== 'pending'
    })

  } catch (error) {
    console.error('Owner invitation status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to generate evaluation summary
async function generateEvaluationSummary(clientId: string) {
  try {
    // Get departments count
    const { count: departmentCount } = await supabase
      .from('business_departments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    // Get job titles count
    const { count: jobTitleCount } = await supabase
      .from('business_job_titles')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    // Get team members count
    const { count: teamMemberCount } = await supabase
      .from('client_users')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'active')

    // Get documents count (placeholder - adjust based on your documents table)
    // const { count: documentCount } = await supabase
    //   .from('documents')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('client_id', clientId)

    return {
      configurationProgress: {
        departmentsConfigured: departmentCount || 0,
        jobTitlesConfigured: jobTitleCount || 0,
        teamMembersAdded: teamMemberCount || 0,
        documentsUploaded: 0, // Placeholder
        complianceRulesSet: 5, // Placeholder
        workflowsConfigured: 3 // Placeholder
      },
      estimatedValue: {
        timesSavedWeekly: Math.round((departmentCount || 0) * 2.5 + (jobTitleCount || 0) * 1.5),
        complianceImprovement: '85%',
        riskReduction: '$12,500 annually',
        efficiencyGain: '60%'
      },
      readinessScore: Math.min(95, ((departmentCount || 0) * 15) + ((jobTitleCount || 0) * 10) + ((teamMemberCount || 0) * 5) + 30),
      nextSteps: [
        'Owner review and approval',
        'Finalize billing setup',
        'Complete team onboarding',
        'Launch full operations'
      ]
    }
  } catch (error) {
    console.error('Error generating evaluation summary:', error)
    return {
      configurationProgress: { error: 'Unable to generate summary' },
      estimatedValue: { error: 'Unable to calculate value' },
      readinessScore: 0,
      nextSteps: ['Contact support for assistance']
    }
  }
}

// Helper function to generate unique invitation token
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Helper function to send owner invitation email
async function sendOwnerInvitationEmail(params: {
  ownerName: string
  ownerEmail: string
  championName: string
  clientName: string
  invitationToken: string
  evaluationSummary: any
  preferredContact: string
  ownerPhone?: string
  timeline?: string
}): Promise<boolean> {
  try {
    const {
      ownerName,
      ownerEmail,
      championName,
      clientName,
      invitationToken,
      evaluationSummary,
      preferredContact,
      ownerPhone,
      timeline
    } = params

    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/owner/review/${invitationToken}`
    const trackingPixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/owner/track-engagement`
    
    const emailBody = `
      <h2>JiGR Setup Complete - Review & Approve</h2>
      
      <p>Hi ${ownerName},</p>
      
      <p>${championName} has been evaluating JiGR's hospitality compliance solution for ${clientName} and has configured a complete setup for your review.</p>
      
      <h3>📊 Evaluation Summary:</h3>
      <ul>
        <li>${evaluationSummary.configurationProgress.departmentsConfigured} departments configured</li>
        <li>${evaluationSummary.configurationProgress.jobTitlesConfigured} job roles defined with security levels</li>
        <li>${evaluationSummary.configurationProgress.teamMembersAdded} team members added for testing</li>
        <li>${evaluationSummary.configurationProgress.complianceRulesSet} compliance workflows mapped</li>
      </ul>
      
      <h3>🎯 Potential Value:</h3>
      <ul>
        <li>Estimated ${evaluationSummary.estimatedValue.timesSavedWeekly} hours saved weekly</li>
        <li>${evaluationSummary.estimatedValue.complianceImprovement} compliance improvement</li>
        <li>${evaluationSummary.estimatedValue.riskReduction} potential risk reduction</li>
        <li>${evaluationSummary.estimatedValue.efficiencyGain} efficiency gain</li>
      </ul>
      
      <p><strong>Readiness Score: ${evaluationSummary.readinessScore}%</strong></p>
      
      <p><a href="${reviewUrl}?utm_source=invitation&utm_medium=email&utm_campaign=champion_handoff" 
           onclick="fetch('${trackingPixelUrl}', { method: 'POST', body: JSON.stringify({ action: 'link_clicked', invitationToken: '${invitationToken}' }), headers: { 'Content-Type': 'application/json' } })"
           style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">👀 Review Setup</a></p>
      
      <h3>⚡ Next Steps:</h3>
      <ol>
        <li>Review the configuration ${championName} created</li>
        <li>Approve settings or request changes</li>
        <li>Activate your account with billing setup</li>
      </ol>
      
      <p>Trial expires in 14 days${timeline ? ` (${timeline})` : ''}. Take a look when convenient.</p>
      
      <p>Questions? Reply to this email${ownerPhone && preferredContact !== 'email' ? ` or call ${ownerPhone}` : ''}.</p>
      
      <p>Best regards,<br>The JiGR Team</p>
      
      <!-- Email tracking pixel -->
      <img src="${trackingPixelUrl}?action=email_opened&token=${invitationToken}" width="1" height="1" style="display:none;" />
    `

    // For now, just log the email (replace with actual email service)
    console.log('Owner invitation email:', {
      to: ownerEmail,
      subject: `${championName} has set up JiGR for ${clientName} - Review & Approve`,
      body: emailBody
    })

    // TODO: Integrate with actual email service (Resend, etc.)
    return true
  } catch (error) {
    console.error('Error sending owner invitation email:', error)
    return false
  }
}