/**
 * Storage cleanup with .env.local file reading
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Read .env.local file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const env = {}
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return env
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error.message)
    process.exit(1)
  }
}

// Load environment variables
const env = loadEnvFile()

console.log('🔍 Loaded environment variables:')
console.log('URL:', env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Key exists:', env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No')
console.log('')

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables in .env.local')
  process.exit(1)
}

// Create Supabase client
console.log('🔗 Creating Supabase client...')
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Test connection
async function testConnection() {
  try {
    console.log('🧪 Testing Supabase connection...')
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log(`📁 Found ${data?.length || 0} storage buckets`)
    
    if (data && data.length > 0) {
      console.log('Buckets:')
      data.forEach(bucket => {
        console.log(`  - ${bucket.name}`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

// Run test
testConnection()
  .then(success => {
    if (success) {
      console.log('')
      console.log('🎉 Environment setup is working!')
      console.log('You can now run the storage cleanup.')
    } else {
      console.log('')
      console.log('❌ Environment setup failed.')
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error.message)
  })