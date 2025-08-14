import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getDevSessionFromCookie } from '@/lib/dev-auth'

export async function middleware(request: NextRequest) {
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
  const protectedPaths = ['/console', '/admin']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If accessing protected route without authentication, redirect to signin
  if (isProtectedPath && !user) {
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
    redirectUrl.pathname = '/console/dashboard'
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