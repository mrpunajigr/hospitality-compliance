// Direct Google Auth Test - calls the dedicated test function
const https = require('https');

async function testGoogleAuthDirect() {
  console.log('🧪 Testing Google Cloud authentication directly...');
  
  const supabaseUrl = 'https://rggdywqnvpuwssluzfud.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ2R5d3FudnB1d3NzbHV6ZnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM5MjAxMCwiZXhwIjoyMDY5OTY4MDEwfQ.JUVGuJzQRsBN3Y4Dk_jx4K_YNCKRoDiZimOnZGyNk2E';
  
  try {
    console.log('📡 Calling test-google-auth Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/test-google-auth`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('📋 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📋 Raw Response:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          console.log('✅ SUCCESS: Google Cloud authentication is working!');
          console.log('📄 Details:', JSON.stringify(data.details, null, 2));
        } else {
          console.log('❌ FAILURE: Authentication test failed');
          console.log('🔍 Error:', data.error);
          console.log('🔍 Details:', JSON.stringify(data.details, null, 2));
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:', parseError.message);
      }
    } else {
      console.log('❌ FAILURE: Edge Function returned error status');
    }
    
  } catch (error) {
    console.error('🚨 Network error:', error.message);
  }
}

// Run the test
testGoogleAuthDirect().catch(console.error);