import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams
  
  // Get all parameters
  const params = Object.fromEntries(searchParams.entries())
  
  console.log('🔧 Debug reset password URL params:', {
    fullUrl: req.url,
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    params,
    timestamp: new Date().toISOString()
  })
  
  return NextResponse.json({
    success: true,
    data: {
      fullUrl: req.url,
      params,
      timestamp: new Date().toISOString()
    }
  })
}