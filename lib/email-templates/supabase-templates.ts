// Supabase Email Template Generator
// Generates static HTML for Supabase email template configuration

import { generateWelcomeEmail } from './templates/WelcomeEmail'
import { generatePasswordResetEmail } from './templates/PasswordResetEmail'
import { generateEmailVerificationEmail } from './templates/EmailVerificationEmail'

// Generate templates with Supabase template variables
export function generateSupabaseConfirmSignupTemplate(): string {
  // Generate sample email to get the HTML structure
  const sampleEmail = generateWelcomeEmail({
    userEmail: '{{ .Email }}',
    userName: '{{ .Name }}',
    confirmationUrl: '{{ .ConfirmationURL }}'
  })

  // Replace our test data with Supabase template variables
  return sampleEmail.html
    .replace(/Test User/g, '{{ if .UserMetaData.name }}{{ .UserMetaData.name }}{{ else }}User{{ end }}')
    .replace(/dev@jigr\.app/g, '{{ .Email }}')
    .replace(/https:\/\/jigr\.app\/confirm\?token=welcome-\d+/g, '{{ .ConfirmationURL }}')
}

export function generateSupabasePasswordResetTemplate(): string {
  const sampleEmail = generatePasswordResetEmail({
    userEmail: '{{ .Email }}',
    userName: '{{ .Name }}',
    resetUrl: '{{ .ConfirmationURL }}',
    expiresInHours: 24,
    requestIpAddress: '{{ .IPAddress }}',
    requestTimestamp: '{{ .Timestamp }}'
  })

  return sampleEmail.html
    .replace(/Test User/g, '{{ if .UserMetaData.name }}{{ .UserMetaData.name }}{{ else }}User{{ end }}')
    .replace(/dev@jigr\.app/g, '{{ .Email }}')
    .replace(/https:\/\/jigr\.app\/reset-password\?token=test-\d+/g, '{{ .ConfirmationURL }}')
    .replace(/Unknown/g, '{{ .IPAddress }}')
    .replace(/Monday, 6 October 2025 at \d+:\d+ PM/g, '{{ .Timestamp }}')
}

export function generateSupabaseEmailVerificationTemplate(): string {
  const sampleEmail = generateEmailVerificationEmail({
    userEmail: '{{ .Email }}',
    userName: '{{ .Name }}',
    confirmationUrl: '{{ .ConfirmationURL }}',
    expiresInHours: 24
  })

  return sampleEmail.html
    .replace(/Test User/g, '{{ if .UserMetaData.name }}{{ .UserMetaData.name }}{{ else }}User{{ end }}')
    .replace(/dev@jigr\.app/g, '{{ .Email }}')
    .replace(/https:\/\/jigr\.app\/verify\?token=verify-\d+/g, '{{ .ConfirmationURL }}')
}

export function generateSupabaseMagicLinkTemplate(): string {
  // For magic links, we'll use a simplified version of the welcome email
  const sampleEmail = generateWelcomeEmail({
    userEmail: '{{ .Email }}',
    userName: '{{ .Name }}',
    confirmationUrl: '{{ .ConfirmationURL }}'
  })

  return sampleEmail.html
    .replace(/Welcome to JiGR!/g, 'Sign in to JiGR')
    .replace(/confirm your email address/g, 'sign in to your account')
    .replace(/Confirm Email & Get Started/g, 'Sign In to JiGR')
    .replace(/Test User/g, '{{ if .UserMetaData.name }}{{ .UserMetaData.name }}{{ else }}User{{ end }}')
    .replace(/dev@jigr\.app/g, '{{ .Email }}')
    .replace(/https:\/\/jigr\.app\/confirm\?token=welcome-\d+/g, '{{ .ConfirmationURL }}')
}

// Function to generate all templates and save to files
export function generateAllSupabaseTemplates() {
  return {
    confirmSignup: generateSupabaseConfirmSignupTemplate(),
    passwordReset: generateSupabasePasswordResetTemplate(),
    emailVerification: generateSupabaseEmailVerificationTemplate(),
    magicLink: generateSupabaseMagicLinkTemplate()
  }
}