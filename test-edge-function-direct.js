// Direct test of Edge Function to see what error it returns

const testEdgeFunction = async () => {
  try {
    console.log('🧪 Testing Edge Function directly...')
    
    const testRequest = {
      bucketId: 'delivery-dockets',
      fileName: 'test_file.jpg',
      filePath: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/2025-08-27/test_file.jpg',
      userId: 'demo-user-id',
      clientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      metadata: {
        bulkUpload: true,
        originalFileName: 'test_file.jpg',
        processingPriority: 'medium',
        batchIndex: 0
      }
    }
    
    console.log('📤 Sending request:', JSON.stringify(testRequest, null, 2))
    
    const response = await fetch('https://rggdywqnvpuwssluzfud.supabase.co/functions/v1/process-delivery-docket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING_SERVICE_ROLE_KEY'}`,
      },
      body: JSON.stringify(testRequest)
    })
    
    console.log('📥 Response status:', response.status)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('📄 Raw response:', responseText)
    
    if (!response.ok) {
      console.error('❌ Edge Function failed!')
      return
    }
    
    try {
      const data = JSON.parse(responseText)
      console.log('✅ Edge Function success:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.log('Raw response text:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testEdgeFunction()