import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    test: 'working', 
    timestamp: new Date().toISOString(),
    deployment: 'fresh-api-routes-v2' 
  })
}