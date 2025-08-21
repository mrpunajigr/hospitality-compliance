// Demo authentication bypass route - Production Optimized
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🚀 Demo route accessed in production')
  console.log('Request URL:', request.url)
  console.log('Request headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    // Create response that redirects to dashboard with demo parameter
    const dashboardUrl = new URL('/console/dashboard', request.url)
    dashboardUrl.searchParams.set('demo', 'true')
    
    const response = NextResponse.redirect(dashboardUrl)
    
    // Set demo session cookie as fallback
    response.cookies.set('demo-session', 'active', {
      httpOnly: false,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'lax'
    })
    
    console.log('🔄 Redirecting to:', dashboardUrl.toString())
    console.log('✅ Demo session cookie set')
    
    return response
  } catch (error) {
    console.error('❌ Demo route error:', error)
    
    // Fallback response
    return NextResponse.json({ 
      error: 'Demo mode failed',
      message: 'Please try accessing /console/dashboard?demo=true directly'
    }, { status: 500 })
  }
}