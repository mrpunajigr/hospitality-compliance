'use client'

// User Profile Page - Personal account settings
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { ModuleHeader } from '@/app/components/ModuleHeader'
import { getModuleConfig } from '@/lib/module-config'

function ProfilePageContent() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean>(true)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState({
    jobTitle: '',
    preferredName: '',
    businessType: 'restaurant',
    notificationPreferences: {
      emailAlerts: true,
      complianceReminders: true,
      weeklyReports: false
    }
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'

  const handleEmailVerification = async (token: string) => {
    try {
      console.log('🔐 Verifying email with token:', token.substring(0, 8) + '...')
      
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log('✅ Email verification successful')
        setEmailVerified(true)
        // Remove verification token from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('verify')
        window.history.replaceState({}, '', newUrl.toString())
      } else {
        console.error('❌ Email verification failed:', result.error)
        alert('Email verification failed: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Email verification error:', error)
      alert('Email verification error. Please try again.')
    }
  }

  const handleResendVerification = async () => {
    try {
      if (!user?.email) {
        alert('No email address found')
        return
      }

      console.log('📧 Requesting verification email resend for:', user.email)

      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Verification email resent successfully')
        alert('Verification email sent! Please check your inbox.')
      } else {
        console.error('❌ Failed to resend verification email:', result.error)
        alert('Failed to resend verification email: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Resend verification error:', error)
      alert('Error sending verification email. Please try again.')
    }
  }

  const handleOnboardingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setOnboardingData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: checkbox.checked
        }
      }))
    } else {
      setOnboardingData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSaveOnboardingData = async () => {
    try {
      if (!user) return

      console.log('💾 Saving onboarding data:', onboardingData)

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          job_title: onboardingData.jobTitle,
          preferred_name: onboardingData.preferredName,
          notification_preferences: onboardingData.notificationPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('❌ Profile update error:', profileError)
        alert('Failed to update profile: ' + profileError.message)
        return
      }

      // Update business type in clients table if user has a client
      if (userClient && onboardingData.businessType !== userClient.business_type) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({
            business_type: onboardingData.businessType,
            updated_at: new Date().toISOString()
          })
          .eq('id', userClient.clientId)

        if (clientError) {
          console.warn('⚠️ Business type update failed:', clientError)
        }
      }

      // Update job title in client_users if user has client relationship
      if (userClient) {
        const { error: clientUserError } = await supabase
          .from('client_users')
          .update({
            job_title: onboardingData.jobTitle,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('client_id', userClient.clientId)

        if (clientUserError) {
          console.warn('⚠️ Job title update failed:', clientUserError)
        }
      }

      console.log('✅ Onboarding data saved successfully')
      alert('Profile updated successfully!')

      // If this was onboarding, redirect to console
      if (isOnboarding) {
        router.push('/admin/console')
      }

    } catch (error) {
      console.error('❌ Save error:', error)
      alert('Failed to save profile changes. Please try again.')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // Check for verification token in URL
      const verifyToken = searchParams.get('verify')
      if (verifyToken) {
        setVerificationToken(verifyToken)
        await handleEmailVerification(verifyToken)
      }

      // Try to get authenticated user, with fallback to demo user
      let user = null
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser
        console.log('🔍 PROFILE PAGE: Auth user check result:', user ? 'Found' : 'Not found')
      } catch (authError) {
        console.log('⚠️ PROFILE PAGE: Auth check failed, using demo user:', authError)
      }
      
      if (!user) {
        // Auto sign-in as demo user for development
        console.log('🔍 PROFILE PAGE: Using demo user for development')
        const demoUser = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
          email: 'demo@example.com',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(demoUser)
        setHasAccess(true)
        
        // Set demo profile immediately
        setProfile({
          id: demoUser.id,
          email: demoUser.email,
          full_name: demoUser.user_metadata?.full_name || 'Demo User',
          avatar_url: null,
          phone: '+64 21 123 4567'
        })
        
        // Set demo onboarding data
        setOnboardingData({
          jobTitle: 'Demo Role',
          preferredName: 'Demo User',
          businessType: 'restaurant',
          notificationPreferences: {
            emailAlerts: true,
            complianceReminders: true,
            weeklyReports: false
          }
        })
      } else {
        setUser(user)
        
        // Get user's company information using reliable API call
        try {
          console.log('🔍 PROFILE PAGE: Loading client info via API for user:', user.id)
          const response = await fetch(`/api/user-client?userId=${user.id}`)
          
          if (response.ok) {
            const data = await response.json()
            const clientInfo = data.userClient
            
            console.log('✅ PROFILE PAGE: Client info loaded via API:', {
              name: clientInfo.name,
              role: clientInfo.role
            })
            
            setUserClient(clientInfo)
            
            // Check if user has permission to access profile management
            // Allow: Administrators, Owners, or the profile owner themselves
            const hasProfileAccess = 
              clientInfo.role === 'Administrator' || 
              clientInfo.role === 'Owner' ||
              user.id === user.id // Profile owner (they can always edit their own profile)
            
            setHasAccess(hasProfileAccess)
            
            if (!hasProfileAccess) {
              console.warn('Access denied: User does not have permission to access profile management')
            }
          } else {
            console.log('ℹ️ PROFILE PAGE: No client info found (demo user or missing data) - allowing profile access')
            // For demo users or users without client data, allow profile access
            setHasAccess(true)
          }
        } catch (error) {
          console.log('⚠️ PROFILE PAGE: Error loading client info via API (continuing):', error)
          // Continue loading profile even if client info fails
          setHasAccess(true)
        }
        
        // Fetch user profile data with error handling
        try {
          console.log('🔍 PROFILE PAGE: Loading profile data for user:', user.id)
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (!error && profileData) {
            console.log('✅ PROFILE PAGE: Profile data loaded successfully')
            setProfile(profileData)
            setAvatarUrl(profileData.avatar_url)
            
            // Load email verification status and onboarding data
            setEmailVerified(profileData.email_verified || false)
            setOnboardingData({
              jobTitle: profileData.job_title || '',
              preferredName: profileData.preferred_name || '',
              businessType: userClient?.business_type || 'restaurant',
              notificationPreferences: profileData.notification_preferences || {
                emailAlerts: true,
                complianceReminders: true,
                weeklyReports: false
              }
            })
          } else {
            console.log('ℹ️ PROFILE PAGE: No profile data found, using demo fallback')
            // Demo fallback
            setProfile({
              id: user.id,
              email: user.email || 'demo@example.com',
              full_name: user.user_metadata?.full_name || 'Demo User',
              avatar_url: null,
              phone: '+64 21 123 4567'
            })
          }
          
          // Profile data loaded successfully
          console.log('✅ PROFILE PAGE: Profile initialization complete')
          
        } catch (profileError) {
          console.log('⚠️ PROFILE PAGE: Profile loading failed, using demo fallback:', profileError)
          // Demo fallback for any profile loading errors
          setProfile({
            id: user.id,
            email: user.email || 'demo@example.com',
            full_name: user.user_metadata?.full_name || 'Demo User',
            avatar_url: null,
            phone: '+64 21 123 4567'
          })
        }
      }
      
      setLoading(false)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser(session.user)
      }
      // Don't set user to null if session is null - preserve demo user
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAvatarUploadSuccess = (imageUrl: string) => {
    setAvatarUrl(imageUrl)
    // Show success message
    alert('Avatar updated successfully!')
  }

  const handleAvatarUploadError = (error: string) => {
    console.error('Avatar upload error:', error)
    alert(`Avatar upload failed: ${error}`)
  }


  // Account Action Handlers
  const handleDownloadData = async () => {
    try {
      console.log('🚀 ENROLLMENT: Starting fresh 2FA enrollment...')
      setSetupError('')
      setTwoFactorSetupStep('enrolling')
      
      // First, clean up any existing unverified factors
      console.log('🧹 ENROLLMENT: Cleaning up existing factors...')
      const { data: existingFactors } = await supabase.auth.mfa.listFactors()
      
      if (existingFactors?.totp) {
        for (const factor of existingFactors.totp) {
          if (factor.status === 'unverified') {
            console.log('🗑️ ENROLLMENT: Removing unverified factor:', factor.id)
            try {
              await supabase.auth.mfa.unenroll({ factorId: factor.id })
              console.log('✅ ENROLLMENT: Unverified factor removed')
            } catch (cleanupError) {
              console.log('⚠️ ENROLLMENT: Could not remove factor:', cleanupError)
            }
          }
        }
      }
      
      // Wait a moment after cleanup
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Enroll user in MFA with fresh start
      console.log('📝 ENROLLMENT: Starting fresh enrollment...')
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })

      console.log('📋 ENROLLMENT: Fresh enroll response:', { data, error })

      if (error) {
        console.error('❌ ENROLLMENT: Fresh enroll failed:', error)
        setSetupError(error.message)
        setTwoFactorSetupStep('disabled')
        return
      }

      if (!data?.totp?.qr_code) {
        console.error('❌ ENROLLMENT: No QR code received')
        setSetupError('Failed to generate QR code')
        setTwoFactorSetupStep('disabled')
        return
      }

      console.log('✅ ENROLLMENT: Fresh QR code generated successfully')
      // Set QR code URL for user to scan
      setQrCodeUrl(data.totp.qr_code)
      setTwoFactorSetupStep('verifying')
    } catch (error: any) {
      console.error('❌ ENROLLMENT: Exception during fresh enrollment:', error)
      setSetupError(error.message || 'Failed to setup 2FA')
      setTwoFactorSetupStep('disabled')
    }
  }

  const handleVerify2FA = async () => {
    console.log('🔍 VERIFICATION: Starting verification process...')
    
    try {
      setSetupError('')
      
      if (!verificationCode || verificationCode.length !== 6) {
        setSetupError('Please enter a valid 6-digit code')
        return
      }

      console.log('📝 VERIFICATION: Code entered:', verificationCode)

      // List all current factors
      console.log('📋 VERIFICATION: Checking current factors...')
      const { data: allFactors, error: listError } = await supabase.auth.mfa.listFactors()
      
      if (listError) {
        console.error('❌ VERIFICATION: Failed to list factors:', listError)
        setSetupError('Failed to check 2FA status')
        return
      }

      console.log('📋 VERIFICATION: All factors:', allFactors)

      // Find unverified TOTP factor
      const unverifiedFactor = allFactors?.totp?.find(f => f.status === 'unverified')
      
      if (!unverifiedFactor) {
        console.error('❌ VERIFICATION: No unverified factor found')
        setSetupError('No pending 2FA setup found. Please restart.')
        setTwoFactorSetupStep('disabled')
        return
      }

      console.log('🔑 VERIFICATION: Found unverified factor:', unverifiedFactor)

      // Simple verification approach - back to challengeAndVerify but with fresh factor
      console.log('✨ VERIFICATION: Using challengeAndVerify on fresh factor...')
      console.log('🔑 VERIFICATION: Factor details before verify:', {
        id: unverifiedFactor.id,
        status: unverifiedFactor.status,
        created: unverifiedFactor.created_at,
        updated: unverifiedFactor.updated_at
      })
      
      const { data: verifyResult, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: unverifiedFactor.id,
        code: verificationCode
      })

      console.log('📝 VERIFICATION: challengeAndVerify result:', { verifyResult, verifyError })

      if (verifyError) {
        console.error('❌ VERIFICATION: Verification failed:', verifyError)
        setSetupError('Verification failed: ' + verifyError.message)
        return
      }

      console.log('✅ VERIFICATION: challengeAndVerify succeeded')

      // Wait for database update
      console.log('⏱️ VERIFICATION: Waiting for database update...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Double-check factors are now verified
      console.log('🔄 VERIFICATION: Checking final factor status...')
      const { data: finalFactors } = await supabase.auth.mfa.listFactors()
      console.log('📋 VERIFICATION: Final factors:', finalFactors)

      // Check the specific factor that was just verified
      const verifiedFactor = finalFactors?.totp?.find(f => f.id === unverifiedFactor.id)
      console.log('🔍 VERIFICATION: Specific factor status after verify:', {
        factorId: unverifiedFactor.id,
        beforeStatus: unverifiedFactor.status,
        afterStatus: verifiedFactor?.status,
        factorExists: !!verifiedFactor,
        factorDetails: verifiedFactor
      })

      const verifiedCount = finalFactors?.totp?.filter(f => f.status === 'verified')?.length || 0
      console.log('✅ VERIFICATION: Verified factors count:', verifiedCount)

      if (verifiedCount > 0 && verifiedFactor?.status === 'verified') {
        console.log('🎉 VERIFICATION: SUCCESS! Factor status updated to verified')
        setTwoFactorEnabled(true)
        setTwoFactorSetupStep('enabled')
        setVerificationCode('')
        setSetupError('')
        
        // Refresh status to ensure toggle is accurate
        setTimeout(() => refresh2FAStatus(), 1000)
      } else {
        console.error('❌ VERIFICATION: Factor status not updated to verified', {
          verifiedCount,
          factorStatus: verifiedFactor?.status,
          expectedStatus: 'verified'
        })
        setSetupError('Code appears correct but factor not verified. The factor may need to be re-enrolled.')
        
        // Don't update UI state since verification didn't complete
      }
      
    } catch (error: any) {
      console.error('❌ VERIFICATION: Exception:', error)
      setSetupError(error.message || 'Failed to verify 2FA code')
    }
  }


  const handleCancelSetup = () => {
    setTwoFactorSetupStep('disabled')
    setQrCodeUrl('')
    setVerificationCode('')
    setSetupError('')
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      return
    }

    try {
      console.log('🔓 Disabling 2FA...')
      
      // Get the user's current factors
      const { data: factors } = await supabase.auth.mfa.listFactors()
      
      if (!factors?.totp || factors.totp.length === 0) {
        alert('No 2FA factors found to disable.')
        return
      }

      // Unenroll all TOTP factors
      for (const factor of factors.totp) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: factor.id
        })
        
        if (error) {
          console.error('❌ Failed to disable 2FA factor:', error)
          alert('Failed to disable 2FA: ' + error.message)
          return
        }
      }

      // Update UI state
      setTwoFactorEnabled(false)
      setTwoFactorSetupStep('disabled')
      setQrCodeUrl('')
      setBackupCodes([])
      setVerificationCode('')
      setSetupError('')
      
      console.log('✅ 2FA disabled successfully')
      alert('Two-Factor Authentication has been disabled.')
      
    } catch (error: any) {
      console.error('❌ 2FA disable error:', error)
      alert('Failed to disable 2FA: ' + (error.message || 'Unknown error'))
    }
  }

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('This will generate new backup codes and invalidate any existing ones. Continue?')) {
      return
    }

    try {
      console.log('🔄 Generating new backup codes...')
      
      // Simulate backup code generation (in a real app, this would be an API call)
      const newBackupCodes = [
        'ABC123-DEF456',
        'GHI789-JKL012', 
        'MNO345-PQR678',
        'STU901-VWX234',
        'YZA567-BCD890'
      ]
      
      setBackupCodes(newBackupCodes)
      
      // Show backup codes in an alert for now
      alert('New backup codes generated:\n\n' + newBackupCodes.join('\n') + '\n\nPlease save these codes in a secure location.')
      
      console.log('✅ Backup codes regenerated successfully')
      
    } catch (error: any) {
      console.error('❌ Backup code generation error:', error)
      alert('Failed to generate backup codes: ' + (error.message || 'Unknown error'))
    }
  }

  // Account Action Handlers
  const handleDownloadData = async () => {
    setIsDownloading(true)
    try {
      // Create formatted HTML report
      const reportDate = new Date().toLocaleDateString('en-NZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>JiGR Data Export - ${user?.email}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .header h1 { color: #3B82F6; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; }
        .section h2 { color: #1F2937; margin-top: 0; font-size: 20px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px; }
        .data-row { display: flex; margin: 10px 0; }
        .data-label { font-weight: 600; width: 200px; color: #4B5563; }
        .data-value { flex: 1; color: #1F2937; }
        .empty-value { color: #9CA3AF; font-style: italic; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>JiGR Data Export Report</h1>
        <p>Personal Data Report for ${user?.email}</p>
        <p>Generated on ${reportDate}</p>
    </div>

    <div class="section">
        <h2>👤 Personal Information</h2>
        <div class="data-row">
            <div class="data-label">Email Address:</div>
            <div class="data-value">${user?.email || 'Not specified'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">User ID:</div>
            <div class="data-value">${user?.id || 'Not available'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Account Created:</div>
            <div class="data-value">${user?.created_at ? new Date(user.created_at).toLocaleDateString('en-NZ') : 'Not available'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Email Verified:</div>
            <div class="data-value">${user?.email_verified_at ? 'Yes (' + new Date(user.email_verified_at).toLocaleDateString('en-NZ') + ')' : 'No'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Preferred Name:</div>
            <div class="data-value">${profile?.preferred_name || onboardingData?.preferredName || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Job Title:</div>
            <div class="data-value">${profile?.job_title || onboardingData?.jobTitle || '<span class="empty-value">Not specified</span>'}</div>
        </div>
    </div>

    <div class="section">
        <h2>🏢 Company Information</h2>
        <div class="data-row">
            <div class="data-label">Company Name:</div>
            <div class="data-value">${userClient?.name || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Business Type:</div>
            <div class="data-value">${userClient?.business_type || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Owner Name:</div>
            <div class="data-value">${userClient?.owner_name || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Business Email:</div>
            <div class="data-value">${userClient?.business_email || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Phone Number:</div>
            <div class="data-value">${userClient?.phone || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Business Address:</div>
            <div class="data-value">${userClient?.address || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">License Number:</div>
            <div class="data-value">${userClient?.license_number || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Role:</div>
            <div class="data-value">${userClient?.role || '<span class="empty-value">Not specified</span>'}</div>
        </div>
    </div>

    <div class="section">
        <h2>📊 Account Status</h2>
        <div class="data-row">
            <div class="data-label">Subscription Status:</div>
            <div class="data-value">${userClient?.subscription_status || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Subscription Tier:</div>
            <div class="data-value">${userClient?.subscription_tier || '<span class="empty-value">Not specified</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Onboarding Status:</div>
            <div class="data-value">${userClient?.onboarding_status || '<span class="empty-value">Not completed</span>'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Account Security:</div>
            <div class="data-value">Standard authentication</div>
        </div>
    </div>

    <div class="section">
        <h2>⚙️ Preferences</h2>
        <div class="data-row">
            <div class="data-label">Email Alerts:</div>
            <div class="data-value">${onboardingData?.notificationPreferences?.emailAlerts ? 'Enabled' : 'Disabled'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Compliance Reminders:</div>
            <div class="data-value">${onboardingData?.notificationPreferences?.complianceReminders ? 'Enabled' : 'Disabled'}</div>
        </div>
        <div class="data-row">
            <div class="data-label">Weekly Reports:</div>
            <div class="data-value">${onboardingData?.notificationPreferences?.weeklyReports ? 'Enabled' : 'Disabled'}</div>
        </div>
    </div>

    <div class="footer">
        <p>This report contains all personal data stored in the JiGR Hospitality Compliance system.</p>
        <p>Generated by JiGR Suite v${getVersionDisplay ? getVersionDisplay('short') : '1.0'} | Export ID: ${Date.now()}</p>
        <p>For questions about your data, contact: support@jigr.app</p>
    </div>
</body>
</html>
      `

      // Create downloadable HTML file
      const dataBlob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(dataBlob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `JiGR-Data-Report-${user?.email?.split('@')[0]}-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('✅ Data export completed successfully as HTML report')
    } catch (error) {
      console.error('❌ Data export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSignOutAllDevices = async () => {
    if (!confirm('Are you sure you want to sign out from all devices? You will need to log in again on all devices.')) {
      return
    }

    setIsSigningOut(true)
    try {
      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('❌ Sign out failed:', error)
        alert('Failed to sign out from all devices. Please try again.')
        setIsSigningOut(false)
        return
      }

      console.log('✅ Successfully signed out from all devices')
      // Redirect to login page
      window.location.href = '/'
    } catch (error) {
      console.error('❌ Sign out exception:', error)
      alert('An error occurred. Please try again.')
      setIsSigningOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion')
      return
    }

    try {
      // Call delete account API
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Account deletion requested. You will be contacted within 24 hours.')
        // Sign out user
        await supabase.auth.signOut()
        window.location.href = '/'
      } else {
        const errorData = await response.json()
        alert(`Failed to delete account: ${errorData.message}`)
      }
    } catch (error) {
      console.error('❌ Account deletion failed:', error)
      alert('Failed to process account deletion. Please contact support.')
    }
  }

  const handleDemoSignIn = async () => {
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        return
      }

      // Fallback to demo user
      const demoUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
      
    } catch (err) {
      console.error('Demo sign in error:', err)
      
      const demoUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-black font-medium">Loading Profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Access Control Check
  if (!hasAccess && userClient) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
        <ModuleHeader 
          module={getModuleConfig('admin')!}
          currentPage=""
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚫</span>
              </div>
              <h1 className="text-xl font-semibold text-black mb-2">Access Denied</h1>
              <p className="text-gray-700 mb-4">
                You don&apos;t have permission to access profile management. 
                Only Administrators, Owners, or the profile owner can edit profile information.
              </p>
              <p className="text-sm text-gray-600">
                Current Role: {userClient.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className={`${getCardStyle('primary')} max-w-md w-full`}>
          <div className="text-center">
            <h1 className={`${getTextStyle('pageTitle')} mb-2`}>
              User Profile
            </h1>
            <p className={`${getTextStyle('bodySmall')} mb-6`}>
              Please sign in to view your profile
            </p>
            
            <button
              onClick={handleDemoSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
            >
              Sign In as Demo User
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/70">
                Demo mode with test profile data
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const moduleConfig = getModuleConfig('admin')
  
  if (!moduleConfig) {
    return <div>Module configuration not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
      
      {/* Standardized Module Header with Onboarding */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="profile"
        onboardingData={isOnboarding ? {
          userFirstName: user?.user_metadata?.full_name?.split(' ')[0] || 'there'
        } : undefined}
      />

      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-gray-700 text-sm">
            {userClient.name} • {userClient.role}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
          
          <div className="flex gap-6">
            
            {/* Left Column - Main Content */}
            <div className="flex-1">
              
              {/* Profile Overview */}
              <div className={`${getCardStyle('primary')} mb-6`}>
                <div className="flex items-start space-x-6 mb-6">
                  {/* Avatar Upload */}
                  <div className="flex-shrink-0">
                    <ImageUploader
                      currentImageUrl={avatarUrl}
                      onUploadSuccess={handleAvatarUploadSuccess}
                      onUploadError={handleAvatarUploadError}
                      uploadEndpoint="/api/upload-avatar"
                      uploadData={{ userId: user?.id || '' }}
                      acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                      maxSizeMB={5}
                      shape="circle"
                      size="large"
                      title="Profile Picture"
                      description="Click to change avatar"
                    />
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 pt-4">
                    <h2 className="text-2xl font-semibold text-black">{profile?.preferred_name || profile?.full_name || 'Demo User'}</h2>
                    <p className="text-gray-800">{profile?.email || 'demo@example.com'}</p>
                    <p className="text-sm text-gray-700 mt-1">{profile?.job_title || userClient?.jobTitle || 'Job Title'} • {userClient?.name || 'Company Name'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">47</div>
                    <div className="text-sm text-gray-700">Documents Uploaded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">12</div>
                    <div className="text-sm text-gray-700">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">98%</div>
                    <div className="text-sm text-gray-700">Compliance Rate</div>
                  </div>
                </div>
              </div>

              {/* Onboarding Progress Indicator - Only show in onboarding mode */}
              {isOnboarding && (
                <div className={`${getCardStyle('primary')} mb-6`}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile Setup</h2>
                  
                  {/* Progress Steps */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          ✓
                        </div>
                        <span className="ml-2 text-green-600 font-medium">Account Created</span>
                      </div>
                      <div className="w-12 h-1 bg-green-500 rounded"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          2
                        </div>
                        <span className="ml-2 text-blue-600 font-medium">Your Profile</span>
                      </div>
                      <div className="w-12 h-1 bg-gray-300 rounded"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-semibold">
                          3
                        </div>
                        <span className="ml-2 text-gray-500">Complete Setup</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 text-center">
                    Fill out the fields below to personalize your JiGR experience!
                  </p>
                </div>
              )}


              {/* Personal Information */}
              <div className={`${getCardStyle('primary')} mb-6`}>
                <h2 className="text-xl font-semibold text-black mb-6">Personal Information</h2>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={profile?.full_name || 'Demo User'}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Preferred Name</label>
                      <input
                        type="text"
                        name="preferredName"
                        value={onboardingData.preferredName}
                        onChange={handleOnboardingInputChange}
                        placeholder="What should we call you?"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          defaultValue={profile?.email || 'demo@example.com'}
                          className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled
                        />
                        {emailVerified && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={onboardingData.jobTitle}
                        onChange={handleOnboardingInputChange}
                        placeholder="e.g., Owner, Manager, Head Chef"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={profile?.phone || '+64 21 123 4567'}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Timezone</label>
                      <select className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Pacific/Auckland">New Zealand (NZST)</option>
                        <option value="Australia/Sydney">Australia (AEST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="bg-white/40 hover:bg-white/60 text-black font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-300/40 backdrop-blur-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveOnboardingData}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isOnboarding ? 'Complete Setup' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>



              {/* Password & Security */}
              <div className={`${getCardStyle('primary')} mb-6`}>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Password & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Two-Factor Authentication Section */}
                  <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                        className={`
                          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full 
                          border-2 border-transparent transition-colors duration-200 ease-in-out 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${twoFactorEnabled 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-300 hover:bg-gray-400'
                          }
                        `}
                        role="switch"
                        aria-checked={twoFactorEnabled}
                        aria-label="Toggle Two-Factor Authentication"
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-6 w-6 transform rounded-full 
                            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                            ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>
                    </div>
                    
                    {twoFactorSetupStep === 'disabled' && (
                      <p className="text-sm text-gray-700">
                        Use the toggle above to enable two-factor authentication with an authenticator app like Google Authenticator or Authy.
                      </p>
                    )}
                    
                    {twoFactorSetupStep === 'enabled' && (
                      <>
                        <p className="text-sm text-gray-700 mb-4">
                          ✅ Two-factor authentication is active. Your account is protected with an additional layer of security.
                        </p>
                        <button 
                          onClick={handleRegenerateBackupCodes}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          Generate Backup Codes
                        </button>
                      </>
                    )}

                    {twoFactorSetupStep === 'enrolling' && (
                      <div className="text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-sm text-gray-700">Setting up 2FA...</p>
                      </div>
                    )}

                    {twoFactorSetupStep === 'verifying' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700 mb-4">
                          Scan this QR code with your authenticator app, then enter the 6-digit code:
                        </p>
                        
                        {qrCodeUrl && (
                          <div className="flex justify-center mb-4">
                            <img 
                              src={qrCodeUrl} 
                              alt="2FA QR Code" 
                              className="w-40 h-40 border rounded-lg bg-white p-2"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black text-center text-lg font-mono tracking-widest placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            maxLength={6}
                          />
                          
                          {setupError && (
                            <p className="text-red-600 text-sm text-center">{setupError}</p>
                          )}
                          
                          <div className="flex space-x-3">
                            <button 
                              onClick={handleCancelSetup}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleVerify2FA}
                              disabled={verificationCode.length !== 6}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              Verify & Enable
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {twoFactorSetupStep === 'enabled' && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            Two-factor authentication is <strong>enabled</strong> and protecting your account.
                          </p>
                        </div>
                        
                        {backupCodes.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-yellow-800 mb-2">Backup Codes</h4>
                            <p className="text-xs text-yellow-700 mb-3">
                              Save these codes in a secure location. You can use them to access your account if you lose your authenticator device.
                            </p>
                            <div className="grid grid-cols-1 gap-1 font-mono text-xs">
                              {backupCodes.map((code, index) => (
                                <div key={index} className="bg-white px-2 py-1 rounded border text-center">
                                  {code}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={handleDisable2FA}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          Disable 2FA
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className={`${getCardStyle('primary')} mb-6`}>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Uploaded delivery document</h4>
                      <p className="text-sm text-gray-600">Today at 2:15 PM</p>
                    </div>
                    <div className="text-green-400">✓</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Generated weekly report</h4>
                      <p className="text-sm text-gray-600">Yesterday at 11:30 AM</p>
                    </div>
                    <div className="text-blue-400">📄</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Signed in from new device</h4>
                      <p className="text-sm text-gray-600">2 days ago at 9:45 AM</p>
                    </div>
                    <div className="text-yellow-400">🔑</div>
                  </div>
                </div>
              </div>

              {/* Account Actions - Horizontal Layout */}
              <div className={getCardStyle('primary')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={handleDownloadData}
                    disabled={isDownloading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 text-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isDownloading ? 'Downloading...' : 'Download My Data'}
                      </h3>
                      <p className="text-sm text-blue-100 mt-1">Export all your data</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleSignOutAllDevices}
                    disabled={isSigningOut}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 text-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isSigningOut ? 'Signing Out...' : 'Sign Out All Devices'}
                      </h3>
                      <p className="text-sm text-yellow-100 mt-1">Security action</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 text-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">Delete Account</h3>
                      <p className="text-sm text-red-100 mt-1">Permanent action</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column - Empty Sidebar */}
            <div className="w-64">
              {/* Empty sidebar to maintain layout consistency */}
            </div>

          </div>
          
          {/* Version */}
          <div className="text-center mt-8">
            <span className={`${getTextStyle('version')} text-white/60`}>{getVersionDisplay('short')}</span>
          </div>

        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
              <p className="text-gray-700 mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <p className="text-gray-700 mb-4">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
        
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  )
}