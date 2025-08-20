import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getDevSessionFromCookie } from '@/lib/dev-auth'
// Authentication Core module integration (optional - keeping direct Supabase for now)
// import { getAuthenticationModule } from '@/lib/core/Authentication'

export async function middleware(request: NextRequest) {
  // URL Redirects for Module Structure Migration
  const urlRedirects: Record<string, string> = {
    '/console/dashboard': '/upload/console',
    '/console/upload': '/upload/capture', 
    '/console/reports': '/upload/reports',
    // Legacy compliance routes redirect to upload
    '/compliance/console': '/upload/console',
    '/compliance/action': '/upload/capture',
    '/compliance/reports': '/upload/reports'
  }

  // Check for redirect matches
  const redirectTarget = urlRedirects[request.nextUrl.pathname]
  if (redirectTarget) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = redirectTarget
    return NextResponse.redirect(redirectUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user from Supabase
  const { data: { user } } = await supabase.auth.getUser()

  // DEV routes protection - separate from regular user authentication
  const devPaths = ['/dev']
  const isDevPath = devPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isDevPath) {
    // Allow access to /dev/login without authentication
    if (request.nextUrl.pathname === '/dev/login') {
      return response
    }
    
    // Check for DEV session
    const devSessionCookie = request.cookies.get('dev_session_token')
    const devUser = devSessionCookie ? getDevSessionFromCookie(devSessionCookie.value) : null
    
    if (!devUser) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dev/login'
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Log DEV access
    console.log(`🔧 DEV ACCESS: ${devUser.username} (${devUser.role}) accessed ${request.nextUrl.pathname}`)
    return response
  }

  // Regular protected routes that require Supabase authentication
  const protectedPaths = ['/console', '/admin', '/upload']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow demo access to console and upload pages (development/testing)
  const isDemoAccess = request.nextUrl.pathname.startsWith('/console') || 
                       request.nextUrl.pathname.startsWith('/upload')
  
  // If accessing protected route without authentication, redirect to signin
  // (except for demo access)
  if (isProtectedPath && !user && !isDemoAccess) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/signin'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and accessing signin, redirect to console
  const authPaths = ['/signin'] // Removed /create-account temporarily
  const isAuthPath = authPaths.includes(request.nextUrl.pathname)
  
  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone()
    // Check if there's a redirectTo parameter
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    redirectUrl.pathname = redirectTo || '/upload/console'
    redirectUrl.search = '' // Clear the search params
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - handled separately)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}