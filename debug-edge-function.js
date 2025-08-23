// Debug Edge Function Test
// Tests the actual Edge Function to see authentication errors

import fetch from 'node-fetch'
import fs from 'fs'

const SUPABASE_URL = 'https://rggdywqnvpuwssluzfud.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ2R5d3FudnB1d3NzbHV6ZnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM5MjAxMCwiZXhwIjoyMDY5OTY4MDEwfQ.JUVGuJzQRsBN3Y4Dk_jx4K_YNCKRoDiZimOnZGyNk2E'

async function debugEdgeFunction() {
  try {
    console.log('🧪 Testing Edge Function directly...')
    
    // Test the process-delivery-docket function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-delivery-docket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: 'delivery-dockets',
        fileName: 'test.jpg',
        filePath: 'test/path.jpg',
        userId: 'test-user',
        clientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      })
    })
    
    console.log('Edge Function response status:', response.status)
    const responseText = await response.text()
    console.log('Response:', responseText)
    
  } catch (error) {
    console.error('Error testing Edge Function:', error)
  }
}

debugEdgeFunction()