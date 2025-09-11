import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🚀 TEST API REACHED - POST')
  
  try {
    const body = await request.json()
    console.log('📋 Test POST request body:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'TEST API is working - POST',
      timestamp: new Date().toISOString(),
      requestBody: body
    })
  } catch (error) {
    console.error('❌ Test API error:', error)
    return NextResponse.json({
      success: false,
      message: 'TEST API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  console.log('🚀 TEST API REACHED - GET')
  
  return NextResponse.json({ 
    success: true,
    message: 'TEST API endpoint is active - GET',
    timestamp: new Date().toISOString()
  })
}