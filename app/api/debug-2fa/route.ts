import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get MFA factors using the client library
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    
    // Also try to query the database directly (with service role)
    const serviceSupabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
      // Note: This might not work without service role key
    })

    let dbFactors = null
    try {
      const { data: dbResult, error: dbError } = await serviceSupabase
        .from('auth.mfa_factors')
        .select('*')
        .eq('user_id', user.id)
      
      dbFactors = { data: dbResult, error: dbError }
    } catch (dbErr) {
      dbFactors = { error: 'Cannot query auth schema directly' }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        aal: (user as any).aal
      },
      clientFactors: {
        data: factors,
        error: factorsError
      },
      dbFactors,
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