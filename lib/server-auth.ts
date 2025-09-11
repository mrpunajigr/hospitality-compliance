import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Get authenticated user from server-side request
 * Works with Next.js API routes by extracting session from cookies
 */
export async function getServerUser(request: NextRequest) {
  try {
    return await getServerUserFromRequest(request)
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Extract user session from API route request
 */
async function getServerUserFromRequest(request: NextRequest) {
  try {
    // Get cookies from request headers
    const cookieStore = request.headers.get('cookie') || ''
    
    // Parse cookies manually since we're in an API route
    const cookies = new Map()
    cookieStore.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies.set(name, decodeURIComponent(value))
      }
    })
    
    // Look for Supabase auth cookies
    let accessToken = null
    let refreshToken = null
    
    // Try different cookie patterns Supabase might use
    for (const [name, value] of cookies) {
      if (name.includes('auth-token')) {
        try {
          const authData = JSON.parse(value)
          accessToken = authData.access_token
          refreshToken = authData.refresh_token
          break
        } catch (e) {
          // Try as raw token
          if (name.includes('access')) {
            accessToken = value
          }
        }
      }
    }
    
    if (!accessToken) {
      console.warn('No access token found in request cookies')
      return null
    }
    
    // Create Supabase client with the extracted token
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error) {
      console.error('Token validation error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

/**
 * Validate user has required role for action
 */
export async function validateUserPermissions(userId: string, requiredRoles: string[] = ['OWNER', 'MANAGER']) {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    // Get user's role from client_users table
    const { data: userClient, error } = await supabase
      .from('client_users')
      .select('role, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (error || !userClient) {
      console.error('Error getting user role:', error)
      return false
    }
    
    return requiredRoles.includes(userClient.role)
  } catch (error) {
    console.error('Error validating permissions:', error)
    return false
  }
}