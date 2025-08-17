import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    test: 'WORKING', 
    timestamp: new Date().toISOString(),
    deployment: 'NUCLEAR_FORCE_DEPLOY_v4',
    status: 'STANDARD_PROTECTION_ENABLED',
    vercel_issue: 'deployment_routing_problem'
  })
}