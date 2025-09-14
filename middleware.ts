// Security Middleware for JiGR Hospitality Compliance
// Implements comprehensive security headers, rate limiting, and CSRF protection

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './lib/security/rate-limiter'

// Security headers configuration
const SECURITY_HEADERS = {
  // Content Security Policy - restrictive but functional
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Security headers
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // HSTS (HTTP Strict Transport Security) - only in production
  ...(process.env.NODE_ENV === 'production' ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  } : {}),
  
  // Additional security headers
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'unsafe-none', // Allow for Supabase
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-site'
}

// Routes that require special handling
const PROTECTED_ROUTES = {
  admin: ['/admin', '/api/admin'],
  auth: ['/api/auth', '/api/team/invite', '/api/dev-auth'],
  api: ['/api'],
  upload: ['/api/upload', '/api/get-upload-url']
}

// Routes that should be excluded from middleware
const EXCLUDED_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/api/health',
  '/api/version',
  '/public'
]

// CSRF token generation and validation
function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function validateCSRFToken(token: string, expected: string): boolean {
  if (!token || !expected || token.length !== expected.length) {
    return false
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  
  return result === 0
}

// IP allowlist for admin endpoints (development)
const ADMIN_IP_ALLOWLIST = [
  '127.0.0.1',
  '::1',
  'localhost'
]

function isAdminIPAllowed(request: NextRequest): boolean {
  // For now, allow all IPs - we'll rely on RBAC authentication instead of IP filtering
  return true
  
  // Original IP filtering logic (disabled for production RBAC deployment)
  // if (process.env.NODE_ENV !== 'production') {
  //   return true // Allow all IPs in development
  // }
  // 
  // const forwarded = request.headers.get('x-forwarded-for')
  // const ip = forwarded ? forwarded.split(',')[0].trim() : 
  //            request.headers.get('x-real-ip') || 
  //            'unknown'
  // 
  // return ADMIN_IP_ALLOWLIST.includes(ip)
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Debug log for create-company requests
  if (pathname === '/api/create-company') {
    console.log('🚨 MIDDLEWARE: create-company request detected')
  }
  
  // Skip middleware for excluded routes
  if (EXCLUDED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  const response = NextResponse.next()
  
  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Add timestamp for debugging
  response.headers.set('X-Security-Middleware', new Date().toISOString())
  
  try {
    // Admin route protection
    if (PROTECTED_ROUTES.admin.some(route => pathname.startsWith(route))) {
      if (!isAdminIPAllowed(request)) {
        console.warn(`🚫 Admin access denied from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)
        return new NextResponse('Access Denied', { status: 403 })
      }
      
      // Apply strict rate limiting for admin routes
      const adminRateLimit = await checkRateLimit(request, 'admin')
      if (!adminRateLimit.success) {
        console.warn(`🚫 Admin rate limit exceeded: ${pathname}`)
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0'
          }
        })
      }
    }
    
    // Auth endpoint protection
    if (PROTECTED_ROUTES.auth.some(route => pathname.startsWith(route))) {
      const authRateLimit = await checkRateLimit(request, 'auth')
      if (!authRateLimit.success) {
        console.warn(`🚫 Auth rate limit exceeded: ${pathname}`)
        return new NextResponse('Too Many Authentication Attempts', { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0'
          }
        })
      }
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', '5')
      response.headers.set('X-RateLimit-Remaining', authRateLimit.remaining.toString())
    }
    
    // API endpoint protection
    if (PROTECTED_ROUTES.api.some(route => pathname.startsWith(route))) {
      const apiRateLimit = await checkRateLimit(request, 'api')
      if (!apiRateLimit.success) {
        console.warn(`🚫 API rate limit exceeded: ${pathname}`)
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0'
          }
        })
      }
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', apiRateLimit.remaining.toString())
    }
    
    // Upload endpoint protection
    if (PROTECTED_ROUTES.upload.some(route => pathname.startsWith(route))) {
      const uploadRateLimit = await checkRateLimit(request, 'upload')
      if (!uploadRateLimit.success) {
        console.warn(`🚫 Upload rate limit exceeded: ${pathname}`)
        return new NextResponse('Too Many Upload Requests', { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0'
          }
        })
      }
    }
    
    // CSRF protection for state-changing operations  
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && 
        pathname !== '/api/create-company' && 
        pathname !== '/api/upload-client-logo') {
      // Skip CSRF for API routes that use Bearer tokens
      const authHeader = request.headers.get('authorization')
      const hasValidAuth = authHeader && authHeader.startsWith('Bearer ')
      
      // Skip CSRF for public endpoints that don't require authentication
      const isPublicEndpoint = pathname.startsWith('/api/auth') || 
                              pathname.startsWith('/api/team') || 
                              pathname === '/api/create-company' ||
                              pathname === '/api/upload-client-logo'
      
      console.log(`🔐 CSRF check: ${pathname}, isPublic: ${isPublicEndpoint}, hasAuth: ${hasValidAuth}`)
      
      if (!hasValidAuth && !isPublicEndpoint) {
        const csrfToken = request.headers.get('x-csrf-token')
        const sessionCSRF = request.cookies.get('csrf-token')?.value
        
        if (!csrfToken || !sessionCSRF || !validateCSRFToken(csrfToken, sessionCSRF)) {
          console.warn(`🚫 CSRF validation failed: ${pathname}`)
          return new NextResponse('CSRF Token Mismatch', { status: 403 })
        }
      }
    }
    
    // Generate CSRF token for GET requests (set cookie for forms)
    if (request.method === 'GET' && !request.cookies.get('csrf-token')) {
      const csrfToken = generateCSRFToken()
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8 // 8 hours
      })
    }
    
    // Log security events in production
    if (process.env.NODE_ENV === 'production') {
      console.log(`🔐 Security middleware: ${request.method} ${pathname}`)
    }
    
    return response
    
  } catch (error) {
    console.error('❌ Security middleware error:', error)
    
    // Fail securely - still apply security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}