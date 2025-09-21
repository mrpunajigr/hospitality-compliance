/**
 * Debug User-Client Issues
 * Check what's happening with the current user and their client relationship
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rggdywqnvpuwssluzfud.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ2R5d3FudnB1d3NzbHV6ZnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTA5MjY0NCwiZXhwIjoyMDM0NjY4NjQ0fQ.MZBTCgxF4pWt3gMXdcUNJr7OM4O7G0aU1VxmvSDTzEo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugUserClient() {
  console.log('🔍 Debug: Checking user-client relationship issues...')
  console.log('=' .repeat(60))
  
  try {
    // 1. Check auth users
    console.log('1️⃣ Checking auth users...')
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('❌ Cannot access auth users:', authError.message)
    } else {
      console.log(`✅ Found ${users.length} auth user(s)`)
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id.substring(0, 8)}...)`)
      })
    }
    
    // 2. Check profiles table
    console.log('\n2️⃣ Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Error accessing profiles:', profilesError)
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profile(s)`)
      profiles?.forEach(profile => {
        console.log(`   - ${profile.email} (User ID: ${profile.id?.substring(0, 8)}...)`)
      })
    }
    
    // 3. Check clients table
    console.log('\n3️⃣ Checking clients table...')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
    
    if (clientsError) {
      console.log('❌ Error accessing clients:', clientsError)
    } else {
      console.log(`✅ Found ${clients?.length || 0} client(s)`)
      clients?.forEach(client => {
        console.log(`   - ${client.name} (ID: ${client.id})`)
        console.log(`     Owner: ${client.owner_name || 'N/A'}`)
        console.log(`     Type: ${client.business_type || 'N/A'}`)
        console.log(`     Phone: ${client.phone || 'N/A'}`)
      })
    }
    
    // 4. Check client_users relationships
    console.log('\n4️⃣ Checking client_users relationships...')
    const { data: clientUsers, error: clientUsersError } = await supabase
      .from('client_users')
      .select('*')
    
    if (clientUsersError) {
      console.log('❌ Error accessing client_users:', clientUsersError)
    } else {
      console.log(`✅ Found ${clientUsers?.length || 0} user-client relationship(s)`)
      clientUsers?.forEach(rel => {
        console.log(`   - User ${rel.user_id?.substring(0, 8)}... → Client ${rel.client_id} (${rel.role})`)
      })
    }
    
    // 5. Test getUserClient query with actual user ID
    if (users && users.length > 0) {
      const testUserId = users[0].id
      console.log(`\n5️⃣ Testing getUserClient query with user ID: ${testUserId.substring(0, 8)}...`)
      
      const { data: testResult, error: testError } = await supabase
        .from('client_users')
        .select(`
          *,
          clients!inner (
            id,
            name,
            owner_name,
            business_type,
            phone
          )
        `)
        .eq('user_id', testUserId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
      
      if (testError) {
        console.log('❌ getUserClient query failed:', testError)
      } else if (!testResult) {
        console.log('⚠️ getUserClient query succeeded but returned no data')
        console.log('   This means user exists but has no active client relationship')
      } else {
        console.log('✅ getUserClient query succeeded:', testResult)
      }
    }
    
    // 6. Check database schema for new fields
    console.log('\n6️⃣ Checking database schema...')
    const { data: clientsSchema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'clients')
      .in('column_name', ['owner_name', 'business_type', 'phone'])
    
    if (schemaError) {
      console.log('❌ Cannot check schema:', schemaError)
    } else {
      const existingFields = clientsSchema?.map(col => col.column_name) || []
      console.log('✅ Clients table fields:')
      console.log(`   - owner_name: ${existingFields.includes('owner_name') ? '✅' : '❌'}`)
      console.log(`   - business_type: ${existingFields.includes('business_type') ? '✅' : '❌'}`)
      console.log(`   - phone: ${existingFields.includes('phone') ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('🎯 Next steps based on findings:')
  console.log('1. If no client_users records: User needs to be linked to a company')
  console.log('2. If no clients: Need to create a company record') 
  console.log('3. If missing schema fields: Run database migration')
  console.log('4. If query fails: Check RLS policies and permissions')
}

debugUserClient()