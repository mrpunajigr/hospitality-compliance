import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Get current user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('🔍 Debug Auth API called')
    console.log('User from auth.getUser():', user?.id, user?.email)
    console.log('User error:', userError)
    
    // Check if profile exists for this user
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      console.log('Profile data:', profile)
      console.log('Profile error:', profileError)
    }
    
    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      userError: userError?.message,
      hasProfile: !!user,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}