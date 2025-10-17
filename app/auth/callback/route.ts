import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const type = url.searchParams.get('type')
  
  console.log('🔧 Auth callback received:', {
    hasCode: !!code,
    error,
    errorDescription,
    type,
    fullUrl: req.url,
    allParams: Object.fromEntries(url.searchParams.entries())
  })

  // Handle errors from Supabase
  if (error) {
    console.error('❌ Auth callback error:', error, errorDescription)
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', error)
    if (errorDescription) {
      loginUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(loginUrl.toString())
  }

  // Handle password recovery flow
  if (code && type === 'recovery') {
    try {
      console.log('🔄 Processing recovery code exchange')
      
      // Exchange the code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('❌ Code exchange failed:', sessionError)
        const loginUrl = new URL('/login', url.origin)
        loginUrl.searchParams.set('error', 'recovery_failed')
        loginUrl.searchParams.set('error_description', 'Password reset link has expired or is invalid')
        return NextResponse.redirect(loginUrl.toString())
      }

      if (data.session) {
        console.log('✅ Recovery session established successfully')
        
        // Redirect to reset-password with session established
        const resetUrl = new URL('/reset-password', url.origin)
        resetUrl.searchParams.set('recovery', 'true')
        return NextResponse.redirect(resetUrl.toString())
      }
    } catch (err) {
      console.error('❌ Recovery callback error:', err)
      const loginUrl = new URL('/login', url.origin)
      loginUrl.searchParams.set('error', 'callback_error')
      return NextResponse.redirect(loginUrl.toString())
    }
  }

  // Handle other auth flows (like email verification)
  if (code) {
    try {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('❌ Code exchange failed:', sessionError)
        const loginUrl = new URL('/login', url.origin)
        loginUrl.searchParams.set('error', 'auth_failed')
        return NextResponse.redirect(loginUrl.toString())
      }

      // Redirect to profile for regular auth flows
      const profileUrl = new URL('/admin/profile', url.origin)
      return NextResponse.redirect(profileUrl.toString())
    } catch (err) {
      console.error('❌ Auth callback error:', err)
      const loginUrl = new URL('/login', url.origin)
      loginUrl.searchParams.set('error', 'callback_error')
      return NextResponse.redirect(loginUrl.toString())
    }
  }

  // No code provided - invalid callback
  console.warn('⚠️ Auth callback received without code')
  const loginUrl = new URL('/login', url.origin)
  loginUrl.searchParams.set('error', 'invalid_callback')
  return NextResponse.redirect(loginUrl.toString())
}