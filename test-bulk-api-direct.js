// Test the bulk processing API directly with a minimal request

const fs = require('fs')

async function testBulkAPI() {
  try {
    console.log('🧪 Testing Bulk Processing API directly...')
    
    // Create a tiny test "image" file
    const testImageContent = Buffer.from('fake image data')
    
    const formData = new FormData()
    formData.append('clientId', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    formData.append('userId', 'demo-user-id')
    formData.append('processingPriority', 'medium')
    formData.append('batchSize', '1')
    
    // Add a fake file
    const blob = new Blob([testImageContent], { type: 'image/jpeg' })
    formData.append('file_0', blob, 'test.jpg')
    
    console.log('📤 Sending request to bulk processing API...')
    
    const response = await fetch('http://localhost:3000/api/bulk-process-dockets', {
      method: 'POST',
      body: formData
    })
    
    console.log('📥 API Response status:', response.status)
    console.log('📥 API Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('📄 API Response body:', responseText)
    
    if (!response.ok) {
      console.error('❌ Bulk processing API failed!')
      return
    }
    
    try {
      const data = JSON.parse(responseText)
      console.log('✅ Bulk processing API success:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testBulkAPI()