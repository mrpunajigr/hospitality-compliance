import { NextRequest, NextResponse } from 'next/server'
import { verifyDevCredentials, logDevAccess } from '@/lib/dev-auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    // Verify credentials
    const devUser = verifyDevCredentials(username, password)
    
    if (!devUser) {
      // Log failed attempt (IP logging not available in Next.js Edge Runtime)
      console.warn(`🚫 DEV LOGIN FAILED: ${username} - invalid credentials`)
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Log successful login
    logDevAccess(devUser, 'LOGIN_ATTEMPT', 'api/dev-auth/login')
    
    // Return user data (token creation handled client-side)
    return NextResponse.json({
      username: devUser.username,
      role: devUser.role,
      loginTime: devUser.loginTime,
      expiresAt: devUser.expiresAt
    })

  } catch (error) {
    console.error('DEV auth API error:', error)
    return NextResponse.json(
      { error: 'Authentication service error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}