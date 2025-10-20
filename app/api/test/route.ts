import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    test: 'WORKING', 
    timestamp: new Date().toISOString(),
    deployment: 'NETLIFY_DEPLOY_v4',
    status: 'STANDARD_PROTECTION_ENABLED',
    platform: 'netlify_deployment'
  })
}