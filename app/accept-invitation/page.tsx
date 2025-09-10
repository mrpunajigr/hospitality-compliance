'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { CheckCircle, AlertTriangle, Users, Building2 } from 'lucide-react'

// =====================================================
// TYPES
// =====================================================

interface InvitationDetails {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  organizationName: string
  inviterName: string
  expiresAt: string
  message?: string
}

function AcceptInvitationContent() {
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'loading' | 'invalid' | 'expired' | 'create-account' | 'success'>('loading')

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // =====================================================
  // INVITATION VALIDATION
  // =====================================================

  useEffect(() => {
    async function validateInvitation() {
      if (!token) {
        setError('Invalid invitation link')
        setStep('invalid')
        setLoading(false)
        return
      }

      try {
        // Fetch invitation details
        const { data: invitationData, error: inviteError } = await supabase
          .from('invitations')
          .select(`
            id,
            email,
            first_name,
            last_name,
            role,
            expires_at,
            invitation_message,
            status,
            clients!inner (
              id,
              name,
              business_name
            ),
            profiles!invited_by (
              full_name
            )
          `)
          .eq('token', token)
          .eq('status', 'pending')
          .single()

        if (inviteError || !invitationData) {
          setError('Invitation not found or has already been used')
          setStep('invalid')
          setLoading(false)
          return
        }

        // Check if invitation has expired
        const expiresAt = new Date(invitationData.expires_at)
        const now = new Date()
        
        if (now > expiresAt) {
          setError('This invitation has expired')
          setStep('expired')
          setLoading(false)
          return
        }

        // Check if user already exists
        const { data: existingUser } = await supabase.auth.getUser()
        if (existingUser.user && existingUser.user.email === invitationData.email) {
          // User is already signed in with the invited email - accept automatically
          await acceptInvitation(invitationData.id, invitationData.clients.id)
          return
        }

        // Check if user account exists but not signed in
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', invitationData.email)
          .single()

        if (userData) {
          // User exists, redirect to sign in
          router.push(`/signin?email=${encodeURIComponent(invitationData.email)}&redirect=/accept-invitation?token=${token}`)
          return
        }

        // New user - show account creation form
        setInvitation({
          id: invitationData.id,
          email: invitationData.email,
          firstName: invitationData.first_name,
          lastName: invitationData.last_name,
          role: invitationData.role,
          organizationName: invitationData.clients.business_name || invitationData.clients.name,
          inviterName: invitationData.profiles?.full_name || 'Team Admin',
          expiresAt: invitationData.expires_at,
          message: invitationData.invitation_message
        })
        setStep('create-account')
        setLoading(false)

      } catch (error) {
        console.error('Error validating invitation:', error)
        setError('An error occurred while processing your invitation')
        setStep('invalid')
        setLoading(false)
      }
    }

    validateInvitation()
  }, [token, router])

  // =====================================================
  // INVITATION ACCEPTANCE
  // =====================================================

  const acceptInvitation = async (invitationId: string, clientId: string) => {
    try {
      setAccepting(true)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Accept the invitation by creating client_users record
      const { error: acceptError } = await supabase
        .from('client_users')
        .insert({
          user_id: user.id,
          client_id: clientId,
          role: invitation!.role,
          status: 'active',
          invited_by: null, // Will be set by trigger
          joined_at: new Date().toISOString()
        })

      if (acceptError) {
        throw new Error('Failed to accept invitation')
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ 
          status: 'accepted',
          accepted_by: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (updateError) {
        console.warn('Failed to update invitation status:', updateError)
      }

      // Log audit event
      await supabase.from('audit_logs').insert({
        client_id: clientId,
        user_id: user.id,
        action: 'invitation_accepted',
        resource_type: 'invitation',
        resource_id: invitationId,
        details: {
          acceptedRole: invitation!.role,
          acceptedAt: new Date().toISOString()
        }
      })

      setStep('success')
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/admin/console')
      }, 3000)

    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError(error instanceof Error ? error.message : 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  // =====================================================
  // ACCOUNT CREATION
  // =====================================================

  const createAccountAndAccept = async () => {
    setError('')
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setAccepting(true)

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation!.email,
        password: password,
        options: {
          data: {
            full_name: `${invitation!.firstName} ${invitation!.lastName}`,
            email: invitation!.email
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // Wait for auth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Accept the invitation
      await acceptInvitation(invitation!.id, '')

    } catch (error) {
      console.error('Error creating account:', error)
      setError(error instanceof Error ? error.message : 'Failed to create account')
      setAccepting(false)
    }
  }

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'STAFF': 'Staff Member',
      'SUPERVISOR': 'Supervisor',
      'MANAGER': 'Manager',
      'OWNER': 'Owner'
    }
    return roleMap[role] || role
  }

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      'STAFF': 'Upload documents and view own uploads',
      'SUPERVISOR': 'Shift management and basic reporting',
      'MANAGER': 'Full operations and team management',
      'OWNER': 'Complete system access and billing'
    }
    return descriptions[role] || ''
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')`,
          filter: 'brightness(0.6)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-24">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12">
                <img 
                  src="/JiGR_Logo-full_figma_circle.png" 
                  alt="JiGR Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-white font-bold text-2xl">Hospitality Compliance</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-40">
        <div className={`${getCardStyle('primary')} max-w-md w-full mx-auto`}>

          {/* Loading State */}
          {step === 'loading' && (
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className={`${getTextStyle('pageTitle')} mb-2`}>Processing Invitation</h1>
              <p className={`${getTextStyle('body')} text-white/70`}>
                Please wait while we validate your invitation...
              </p>
            </div>
          )}

          {/* Invalid/Error State */}
          {['invalid', 'expired'].includes(step) && (
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className={`${getTextStyle('pageTitle')} mb-2`}>
                {step === 'expired' ? 'Invitation Expired' : 'Invalid Invitation'}
              </h1>
              <p className={`${getTextStyle('body')} text-white/70 mb-6`}>
                {error}
              </p>
              <button
                onClick={() => router.push('/signin')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {/* Account Creation State */}
          {step === 'create-account' && invitation && (
            <>
              <div className="text-center mb-6">
                <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h1 className={`${getTextStyle('pageTitle')} mb-2`}>Join {invitation.organizationName}</h1>
                <p className={`${getTextStyle('body')} text-white/70`}>
                  You&apos;ve been invited by {invitation.inviterName}
                </p>
              </div>

              {/* Invitation Details */}
              <div className={`${getCardStyle('secondary')} mb-6`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className={`${getTextStyle('cardTitle')} text-base`}>
                      {getRoleDisplayName(invitation.role)}
                    </h3>
                    <p className={`${getTextStyle('bodySmall')} text-white/70`}>
                      {getRoleDescription(invitation.role)}
                    </p>
                  </div>
                </div>
                
                {invitation.message && (
                  <div className="pt-4 border-t border-white/10">
                    <p className={`${getTextStyle('bodySmall')} text-white/80 italic`}>
                      &ldquo;{invitation.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Account Creation Form */}
              <div className="space-y-4">
                <h3 className={`${getTextStyle('cardTitle')} mb-4`}>Create Your Account</h3>
                
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={invitation.email}
                    disabled
                    className={`${getFormFieldStyle()} opacity-60`}
                  />
                </div>

                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={`${invitation.firstName} ${invitation.lastName}`}
                    disabled
                    className={`${getFormFieldStyle()} opacity-60`}
                  />
                </div>

                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Password (8+ characters)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={getFormFieldStyle()}
                    disabled={accepting}
                  />
                </div>

                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={getFormFieldStyle()}
                    disabled={accepting}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={createAccountAndAccept}
                  disabled={accepting || !password || !confirmPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {accepting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Accept Invitation & Create Account'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Success State */}
          {step === 'success' && invitation && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className={`${getTextStyle('pageTitle')} mb-2`}>Welcome to the Team!</h1>
              <p className={`${getTextStyle('body')} text-white/70 mb-6`}>
                You&apos;ve successfully joined {invitation.organizationName} as a {getRoleDisplayName(invitation.role)}.
              </p>
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-6">
                <p className={`${getTextStyle('bodySmall')} text-green-200`}>
                  Redirecting you to your dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Version Info */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <p className={`${getTextStyle('version')} ${DesignTokens.colors.text.onGlassSecondary}`}>
              {getVersionDisplay('prod')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function AcceptInvitationLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading Invitation</h1>
          <p className="text-white/70">Please wait...</p>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AcceptInvitationLoading />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}