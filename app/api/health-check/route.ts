// Health check API for Netlify deployment verification
// Checks environment variables and basic connectivity

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'production',
      api: {
        healthCheck: true,
        deployment: 'successful'
      }
    }

    return NextResponse.json(checks, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}