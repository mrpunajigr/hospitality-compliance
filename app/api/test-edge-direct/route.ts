import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-delivery-docket`
    
    const testRequest = {
      bucketId: 'delivery-dockets',
      fileName: 'test_direct_call.jpg',
      filePath: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/2025-08-27/test_direct_call.jpg',
      userId: 'test-user-id',
      clientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      metadata: {
        bulkUpload: true,
        originalFileName: 'test_direct_call.jpg',
        processingPriority: 'medium',
        batchIndex: 0
      }
    }
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(testRequest)
    })
    
    const responseText = await response.text()
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: edgeFunctionUrl,
      headers: Object.fromEntries(response.headers.entries()),
      responseBody: responseText,
      requestSent: testRequest,
      serviceRoleKeyAvailable: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}