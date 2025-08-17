import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    test: 'working', 
    timestamp: new Date().toISOString(),
    deployment: 'production-promotion-v3',
    status: 'force_promote_to_production'
  })
}