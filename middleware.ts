import { NextResponse, type NextRequest } from 'next/server'

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

  // Simple response for now - bypassing Supabase auth temporarily for deployment
  return NextResponse.next()
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