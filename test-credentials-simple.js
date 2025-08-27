// Simple credential test
const testCredentials = () => {
  console.log('Testing Google Cloud credentials...')
  
  const credentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS')
  
  if (!credentials) {
    console.error('❌ GOOGLE_CLOUD_CREDENTIALS not found in environment')
    return
  }
  
  console.log('✅ GOOGLE_CLOUD_CREDENTIALS found, length:', credentials.length)
  console.log('📄 First 100 characters:', credentials.substring(0, 100))
  
  try {
    const parsed = JSON.parse(credentials)
    console.log('✅ JSON parsing successful')
    console.log('🔑 Has private_key:', !!parsed.private_key)
    console.log('📧 Client email:', parsed.client_email)
    console.log('🏠 Project ID:', parsed.project_id)
    
    if (parsed.private_key) {
      console.log('🔐 Private key starts with:', parsed.private_key.substring(0, 50))
      console.log('🔐 Private key contains \\n characters:', parsed.private_key.includes('\\n'))
    }
    
  } catch (error) {
    console.error('❌ JSON parsing failed:', error.message)
  }
}

// For Supabase Edge Function
serve(async (req) => {
  testCredentials()
  return new Response(JSON.stringify({status: 'test complete'}))
})