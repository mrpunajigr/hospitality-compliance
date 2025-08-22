import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    // Test 1: Check if user exists in client_users
    const { data: clientUserData, error: clientUserError } = await supabase
      .from('client_users')
      .select('*')
      .eq('user_id', userId)

    // Test 2: Check if any companies exist
    const { data: companiesData, error: companiesError } = await supabase
      .from('clients')
      .select('id, name')
      .limit(3)

    // Test 3: Try basic join
    const { data: joinData, error: joinError } = await supabase
      .from('client_users')
      .select(`
        role,
        status,
        clients (
          id,
          name
        )
      `)
      .eq('user_id', userId)

    return NextResponse.json({
      userId,
      clientUserData: {
        data: clientUserData,
        error: clientUserError
      },
      companiesData: {
        data: companiesData,
        error: companiesError
      },
      joinData: {
        data: joinData,
        error: joinError
      }
    })

  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    )
  }
}