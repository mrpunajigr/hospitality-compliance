// Welcome Email Template for JiGR
// Professional welcome email for new user registration

import { getBaseEmailLayoutHTML, getBaseEmailLayoutText } from '../layouts/BaseEmailLayout'
import { getCenteredButtonHTML } from '../components/ButtonPrimary'

interface WelcomeEmailData {
  userEmail: string
  userName?: string
  confirmationUrl: string
  isInvited?: boolean
  inviterName?: string
}

export function generateWelcomeEmail(data: WelcomeEmailData) {
  const {
    userEmail,
    userName = 'User',
    confirmationUrl,
    isInvited = false,
    inviterName
  } = data

  const subject = isInvited 
    ? `Welcome to JiGR - ${inviterName} invited you!`
    : 'Welcome to JiGR | Modular Hospitality Solution'
  
  const preheaderText = isInvited
    ? `${inviterName} invited you to join their compliance team`
    : 'Confirm your email to start managing compliance easily'

  const htmlContent = `
    <div style="margin-bottom: 24px;">
      <h2 style="
        color: #1f2937;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 16px 0;
        text-align: center;
      ">
        ${isInvited ? '🎉 You\'re Invited!' : '🎉 Welcome to JiGR!'}
      </h2>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hello <strong>${userName}</strong>,
      </p>
      
      ${isInvited ? `
        <p style="font-size: 16px; margin-bottom: 20px;">
          <strong>${inviterName}</strong> has invited you to join their JiGR compliance team. 
          You're about to make delivery compliance so much easier!
        </p>
      ` : `
        <p style="font-size: 16px; margin-bottom: 20px;">
          Welcome to JiGR! You've taken the first step toward effortless compliance management 
          for your hospitality business.
        </p>
      `}
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        To get started, please confirm your email address (<strong>${userEmail}</strong>) by clicking the button below:
      </p>
    </div>

    ${getCenteredButtonHTML({
      href: confirmationUrl,
      text: 'Confirm Email & Get Started',
      variant: 'success',
      size: 'large'
    })}

    <div style="
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
    ">
      <h3 style="
        color: #0c4a6e;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
      ">
        🚀 What's next?
      </h3>
      
      <ul style="
        margin: 0;
        padding-left: 20px;
        color: #075985;
        font-size: 14px;
        line-height: 1.6;
      ">
        <li>Upload your first delivery docket</li>
        <li>Set up temperature monitoring</li>
        <li>Invite your team members</li>
        <li>Configure compliance alerts</li>
      </ul>
    </div>

    <div style="margin-top: 32px;">
      <h3 style="
        color: #374151;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
      ">
        Need Help Getting Started?
      </h3>
      
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
        Our team is here to help you get the most out of JiGR:
      </p>
      
      <div style="
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
      ">
        <p style="margin: 0; font-size: 14px; color: #374151;">
          📧 <strong>Email:</strong> <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">support@jigr.app</a><br>
          📚 <strong>Help Center:</strong> <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">jigr.app/help</a><br>
          🎥 <strong>Video Tutorials:</strong> <a href="https://jigr.app/tutorials" style="color: #3b82f6; text-decoration: none;">jigr.app/tutorials</a>
        </p>
      </div>
    </div>

    <hr style="
      margin: 32px 0;
      border: none;
      height: 1px;
      background: #e5e7eb;
    ">

    <div style="text-align: center; color: #6b7280; font-size: 14px;">
      <p style="margin: 0;">
        Welcome to the future of hospitality compliance.
        <br>
        Simple. Digital. Effective.
      </p>
    </div>
  `

  const textContent = `
${isInvited ? 'YOU\'RE INVITED TO JIGR!' : 'WELCOME TO JIGR!'}

Hello ${userName},

${isInvited ? `${inviterName} has invited you to join their JiGR compliance team. You're about to make delivery compliance so much easier!` : 'Welcome to JiGR! You\'ve taken the first step toward effortless compliance management for your hospitality business.'}

To get started, please confirm your email address (${userEmail}) by visiting:
${confirmationUrl}

WHAT'S NEXT?
• Upload your first delivery docket
• Set up temperature monitoring  
• Invite your team members
• Configure compliance alerts

NEED HELP GETTING STARTED?
Our team is here to help you get the most out of JiGR:

Email: support@jigr.app
Help Center: https://jigr.app/help
Video Tutorials: https://jigr.app/tutorials

Welcome to the future of hospitality compliance.
Simple. Digital. Effective.
  `

  const html = getBaseEmailLayoutHTML({
    headerTitle: isInvited ? 'Team Invitation' : 'Welcome to JiGR',
    headerSubtitle: 'Your compliance journey starts here',
    headerVariant: 'welcome',
    children: htmlContent,
    footerInfo: 'You received this email because you created a JiGR account.',
    includeUnsubscribe: false,
    preheaderText
  })

  const text = getBaseEmailLayoutText({
    headerTitle: 'JiGR Welcome',
    children: textContent,
    footerInfo: 'You received this email because you created a JiGR account.'
  })

  return {
    subject,
    html,
    text
  }
}

// Quick test function
export function createTestWelcomeEmail(): ReturnType<typeof generateWelcomeEmail> {
  return generateWelcomeEmail({
    userEmail: 'test@example.com',
    userName: 'Sarah Johnson',
    confirmationUrl: 'https://jigr.app/confirm?token=test123',
    isInvited: false
  })
}

// Test function for invited user
export function createTestInviteWelcomeEmail(): ReturnType<typeof generateWelcomeEmail> {
  return generateWelcomeEmail({
    userEmail: 'newuser@restaurant.com',
    userName: 'Mike Chen',
    confirmationUrl: 'https://jigr.app/confirm?token=invite456',
    isInvited: true,
    inviterName: 'Sarah Johnson'
  })
}