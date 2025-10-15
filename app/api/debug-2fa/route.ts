import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get MFA factors using the client library
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    
    // Note: auth.mfa_factors is not directly queryable via regular Supabase client
    // MFA factors are only accessible through the auth.mfa APIs

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        aal: (user as any).aal
      },
      factors: {
        data: factors,
        error: factorsError
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug 2FA error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}