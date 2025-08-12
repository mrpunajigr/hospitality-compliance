const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function createAssetsTable() {
  // Load environment variables manually
  const envPath = path.join(__dirname, '../.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key] = value
    }
  })

  // Create admin client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    console.log('🚀 Creating assets table...')
    
    // Test if assets table exists
    const { data: existingAssets, error: testError } = await supabase
      .from('assets')
      .select('id')
      .limit(1)
    
    if (!testError) {
      console.log('✅ Assets table already exists!')
      
      // Test with some default data
      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .limit(5)
      
      console.log(`📊 Current assets in database: ${assets?.length || 0}`)
      return
    }
    
    console.log('❌ Assets table does not exist')
    console.log('🔧 Manual migration required via Supabase Dashboard')
    console.log('')
    console.log('📋 Steps to deploy migration:')
    console.log('1. Open: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/sql/new')
    console.log('2. Copy and paste the SQL from: supabase/migrations/20250812000001_add_assets_table.sql')
    console.log('3. Click "Run" to execute the migration')
    console.log('4. Return here and run this script again to verify')
    
  } catch (error) {
    console.error('💥 Error checking assets table:', error.message)
  }
}

createAssetsTable()