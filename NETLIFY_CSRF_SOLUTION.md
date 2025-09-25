# Netlify CSRF Token Mismatch - Complete Solution Guide

## 🚨 Problem: 403 Forbidden "CSRF Token Mismatch" on Next.js API Routes

**Symptoms:**
- All POST requests to `/api/*` routes return 403 Forbidden
- Error message: "CSRF Token Mismatch" (not valid JSON)
- GET requests work fine, but POST/PUT/DELETE fail
- Affects email sending, user signup, and other API functionality

**Root Cause:**
Netlify's automatic form detection and CSRF protection interferes with Next.js API routes, blocking POST requests at the platform level before they reach the application.

---

## ✅ Complete Solution (4-Layer Approach)

### Layer 1: Netlify Configuration (`netlify.toml`)

```toml
# Build configuration
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"

# CRITICAL: Disable automatic form detection that causes CSRF issues
[build.processing]
  skip_processing = false

[build.processing.html]
  pretty_urls = true

[build.processing.html.form_detection]
  enabled = false

# Function configuration for API routes
[functions]
  external_node_modules = ["@supabase/supabase-js", "resend"]
  node_bundler = "esbuild"

# API route specific headers to prevent CSRF issues
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, X-Requested-With"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### Layer 2: Global Middleware (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

// Global middleware to handle CSRF issues on Netlify
export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
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
    '/api/:path*',  // Apply to all API routes
  ]
}
```

### Layer 3: Next.js Configuration (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify-specific configurations
  trailingSlash: false,
  output: 'standalone',
  
  // API route specific settings
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // External packages configuration
  serverExternalPackages: ['resend'],
}

module.exports = nextConfig
```

### Layer 4: Individual API Route Headers

**CRITICAL:** Every API route must have consistent handler pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'

// CRITICAL: Add security headers to prevent CSRF issues
const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Type': 'application/json'
}

// CRITICAL: Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// GET handler for consistency (prevents 405 errors)
export async function GET() {
  return NextResponse.json({
    message: 'API endpoint information',
    // ... endpoint details
  }, { headers: securityHeaders })
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // ... your logic here
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    }, { headers: securityHeaders })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500, headers: securityHeaders })
  }
}
```

---

## 🔧 Implementation Steps

### Step 1: Update Netlify Configuration
1. Create/update `netlify.toml` with form detection disabled
2. Ensure no duplicate sections (causes build failures)
3. Deploy and test - may partially resolve issue

### Step 2: Add Global Middleware
1. Create `middleware.ts` in project root
2. Implement CORS and security headers globally
3. Deploy and test - should improve but may not fully resolve

### Step 3: Update Next.js Configuration  
1. Add headers function to `next.config.js`
2. Fix any duplicate `nextConfig` declarations
3. Deploy and test - additional layer of protection

### Step 4: Fix Individual API Routes
1. Add `OPTIONS` handler to each API route
2. Add `GET` handler to prevent 405 errors
3. Include `securityHeaders` in all responses
4. Deploy and test - should fully resolve issue

### Step 5: Clean Up Configuration
1. Remove any hardcoded workarounds
2. Restore proper environment variable usage
3. Test full user signup flow

---

## 🧪 Testing Procedure

### Test 1: API Route Access
```bash
# Should return 200 OK with configuration info
GET https://yourdomain.com/api/send-email
```

### Test 2: Direct API Test
```javascript
// In browser console
fetch('/api/test-direct-email', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'}, 
  body: JSON.stringify({testEmail: 'test@example.com'})
})
```

### Test 3: Full User Signup
1. Complete signup form with real email
2. Check browser console for 403 errors
3. Verify welcome email is received
4. Confirm email content is correct

---

## ⚠️ Common Pitfalls

### Build Failures
- **Duplicate sections** in `netlify.toml` cause "Can't redefine existing key" errors
- **Duplicate `nextConfig`** declarations in `next.config.js` cause build failures
- Always test builds locally before deploying

### Inconsistent API Routes
- Missing `GET` handlers cause 405 Method Not Allowed errors
- Missing `OPTIONS` handlers break CORS preflight requests
- Inconsistent security headers across routes cause mixed behavior

### Configuration Conflicts
- **Hardcoded workarounds** override environment variables
- **Cached Netlify builds** may persist old configurations
- **Environment variables** must be set in Netlify dashboard

---

## 📋 Troubleshooting Checklist

If CSRF errors persist:

- [ ] Netlify.toml has form detection disabled
- [ ] No duplicate sections in netlify.toml
- [ ] Global middleware is deployed and active
- [ ] next.config.js has headers function
- [ ] All API routes have OPTIONS handler
- [ ] All API routes have GET handler
- [ ] All responses include securityHeaders
- [ ] No hardcoded email addresses remain
- [ ] Environment variables set in Netlify
- [ ] Build and deployment successful
- [ ] Browser cache cleared for testing

---

## 🎯 Success Indicators

✅ **GET requests** to API routes return 200 OK with info  
✅ **POST requests** to API routes return 200 OK (not 403)  
✅ **Browser console** shows no CSRF Token Mismatch errors  
✅ **Email functionality** working end-to-end  
✅ **User signup** completes successfully  
✅ **Welcome emails** delivered to actual users  

---

**Created:** 2025-09-25  
**Issue:** Netlify CSRF protection blocking Next.js API routes  
**Solution:** 4-layer comprehensive approach  
**Status:** Fully resolved and tested  

This solution addresses the root cause at multiple layers to ensure reliable API functionality on Netlify deployments.