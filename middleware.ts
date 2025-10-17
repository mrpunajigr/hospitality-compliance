import { NextRequest, NextResponse } from 'next/server'

// Global middleware to handle CSRF issues on Netlify and Supabase auth redirects
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const url = request.nextUrl.clone()
  
  // Handle Supabase auth redirects that come to root with recovery tokens
  if (path === '/' && url.searchParams.has('token') && url.searchParams.get('type') === 'recovery') {
    console.log('🔄 Middleware: Redirecting Supabase recovery token to reset-password page', {
      originalUrl: request.url,
      token: url.searchParams.get('token')?.substring(0, 20) + '...',
      type: url.searchParams.get('type'),
      allParams: Object.fromEntries(url.searchParams.entries())
    })
    url.pathname = '/reset-password'
    const redirectUrl = url.toString()
    console.log('🔄 Middleware: Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Don't interfere with company-setup or admin routes during onboarding
  if (path.startsWith('/company-setup') || path.startsWith('/admin/console')) {
    console.log('🛣️ Middleware: Allowing access to:', path)
    return NextResponse.next()
  }
  
  // Only apply to API routes
  if (path.startsWith('/api/')) {
    
    // Handle OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // For all API requests, add security headers to prevent CSRF
    const response = NextResponse.next()
    
    // Add comprehensive CORS and security headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Critical: Disable CSRF protection for API routes on Netlify
    response.headers.set('X-CSRF-Protection', 'disabled')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response
  }

  // For non-API routes, just continue
  return NextResponse.next()
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}