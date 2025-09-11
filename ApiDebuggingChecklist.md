# Create Company API Debugging Checklist

## 🎯 Immediate Checks (Do These First)

### 1. Verify API Route File Location
Check exact file path and structure:

```bash
# Should be exactly this structure
app/
  api/
    create-company/
      route.ts
```

**Not** `pages/api/create-company.ts` (old Next.js structure)

### 2. Test API Endpoint Directly
Open browser and go to:

```bash
https://jigr.app/api/create-company
```

**Expected Result**: Should return Method Not Allowed (405) for GET request
**Bad Result**: 404 Not Found (means route not deployed)

### 3. Check Environment Variables
In your deployment dashboard, verify these exist:

```bash
SUPABASE_URL
SUPABASE_ANON_KEY  
SUPABASE_SERVICE_ROLE_KEY
```

### 4. Add Basic Test Route
Create this simple test file to verify API routing works:

```typescript
// app/api/test-connection/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🚀 TEST API REACHED')
  
  return NextResponse.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString()
  })
}

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint active' })
}
```

Then test: `POST https://jigr.app/api/test-connection`

## 🔍 Deep Debugging Steps

### 5. Check Middleware.ts
Look for this file in your root directory:

```typescript
// middleware.ts (if it exists)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if this is blocking your API calls
  console.log('🔧 Middleware intercepted:', request.url)
  
  // Make sure it's not blocking /api/ routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('📡 API call detected:', request.nextUrl.pathname)
  }
  
  return NextResponse.next()
}
```

### 6. Deployment Configuration Check
For Netlify, check if you have:

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[functions]
  external_node_modules = ["@supabase/supabase-js"]

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

### 7. Check Next.js Config
Verify `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Ensure API routes are enabled
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

module.exports = nextConfig
```

### 8. Browser Network Analysis
In DevTools Network tab:
1. Look at the actual request being sent
2. Check if it's reaching your domain
3. Look at response headers
4. Check if it's being redirected

### 9. Server-Side Logging (if accessible)
If you can access deployment logs:

```bash
# Look for these in your deployment platform
- Build logs: Check if API routes compiled
- Runtime logs: Look for actual errors
- Function logs: Edge function execution logs
```

## 🚨 Most Likely Culprits

### Scenario A: Route Not Deployed
**Symptoms**: 404 on direct API access
**Solution**: Check file structure, redeploy

### Scenario B: Environment Variables Missing
**Symptoms**: 500 error, "Cannot read property of undefined"
**Solution**: Add missing env vars to deployment

### Scenario C: Middleware Blocking
**Symptoms**: 403 Forbidden, requests intercepted
**Solution**: Fix middleware configuration

### Scenario D: CORS/Security Headers
**Symptoms**: Browser blocking requests
**Solution**: Configure proper headers

## 🎯 Quick Win Strategy

1. **Create test route** (`/api/test-connection`) 
2. **Test it directly** in browser
3. **If test works** → Problem is in create-company logic
4. **If test fails** → Problem is deployment/routing

## 💡 Emergency Workaround

If API routes completely broken, temporarily move to server actions:

```typescript
// app/actions/create-company.ts
'use server'

import { createClient } from '@/utils/supabase/server'

export async function createCompanyAction(formData: FormData) {
  // Move your company creation logic here
  // Server actions bypass API routing issues
}
```

## 🔧 Debug Output Template

When testing, capture this info:

```bash
✅/❌ Direct API access: /api/create-company
✅/❌ Test route works: /api/test-connection  
✅/❌ Environment variables set
✅/❌ Middleware exists/configured
✅/❌ Build logs show API compilation
✅/❌ Network tab shows request reaching server
```

Start with the **Immediate Checks** first - most issues are deployment/routing problems, not code logic issues!