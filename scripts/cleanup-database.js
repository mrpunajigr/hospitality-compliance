/**
 * Database Cleanup Script - JiGR Hospitality Compliance
 * Safely clears all test data while preserving schema
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role
const supabaseUrl = 'https://rggdywqnvpuwssluzfud.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ2R5d3FudnB1d3NzbHV6ZnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTA5MjY0NCwiZXhwIjoyMDM0NjY4NjQ0fQ.MZBTCgxF4pWt3gMXdcUNJr7OM4O7G0aU1VxmvSDTzEo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function showStatus(title) {
  console.log(`\n📊 ${title}`)
  console.log('=' .repeat(50))
  
  try {
    const [clients, profiles, clientUsers, invitations] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('client_users').select('id', { count: 'exact', head: true }),
      supabase.from('invitations').select('id', { count: 'exact', head: true })
    ])
    
    console.log(`Clients: ${clients.count || 0}`)
    console.log(`Profiles: ${profiles.count || 0}`)
    console.log(`Client Users: ${clientUsers.count || 0}`)
    console.log(`Invitations: ${invitations.count || 0}`)
    
    return {
      clients: clients.count || 0,
      profiles: profiles.count || 0,
      clientUsers: clientUsers.count || 0,
      invitations: invitations.count || 0
    }
  } catch (error) {
    console.error('Error getting status:', error)
    return null
  }
}

async function cleanupDatabase() {
  console.log('🗃️ JiGR Database Cleanup Starting...')
  console.log('⚠️ WARNING: This will delete ALL test users and companies!')
  
  // Show current status
  const beforeStatus = await showStatus('BEFORE CLEANUP')
  
  if (!beforeStatus || (beforeStatus.clients === 0 && beforeStatus.profiles === 0)) {
    console.log('\n✅ Database appears to be already clean!')
    return
  }
  
  try {
    console.log('\n🧹 Starting cleanup process...')
    
    // Phase 1: Clear user-related data
    console.log('\n📋 Phase 1: Clearing user-related data...')
    
    const { error: invitationsError } = await supabase
      .from('invitations')
      .delete()
      .neq('id', 0) // Delete all
    
    if (invitationsError) throw invitationsError
    console.log('✅ Cleared invitations')
    
    const { error: clientUsersError } = await supabase
      .from('client_users')
      .delete()
      .neq('id', 0) // Delete all
    
    if (clientUsersError) throw clientUsersError
    console.log('✅ Cleared client_users')
    
    // Phase 2: Clear document data
    console.log('\n📄 Phase 2: Clearing document data...')
    
    const { error: analysesError } = await supabase
      .from('document_analyses')
      .delete()
      .not('client_id', 'is', null) // Delete where client_id is not null
    
    if (analysesError && analysesError.code !== 'PGRST116') { // Ignore if table doesn't exist
      console.log('Note: document_analyses table may not exist yet')
    } else {
      console.log('✅ Cleared document_analyses')
    }
    
    const { error: docketsError } = await supabase
      .from('delivery_dockets')
      .delete()
      .not('client_id', 'is', null)
    
    if (docketsError && docketsError.code !== 'PGRST116') {
      console.log('Note: delivery_dockets table may not exist yet')
    } else {
      console.log('✅ Cleared delivery_dockets')
    }
    
    // Phase 3: Clear assets
    console.log('\n🖼️ Phase 3: Clearing assets...')
    
    const { error: assetsError } = await supabase
      .from('assets')
      .delete()
      .not('client_id', 'is', null)
    
    if (assetsError && assetsError.code !== 'PGRST116') {
      console.log('Note: assets table may not exist yet')
    } else {
      console.log('✅ Cleared client assets')
    }
    
    // Phase 4: Clear company data
    console.log('\n🏢 Phase 4: Clearing company data...')
    
    const { error: clientsError } = await supabase
      .from('clients')
      .delete()
      .neq('id', 0) // Delete all
    
    if (clientsError) throw clientsError
    console.log('✅ Cleared clients')
    
    // Phase 5: Clear profiles
    console.log('\n👤 Phase 5: Clearing profiles...')
    
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '') // Delete all
    
    if (profilesError) throw profilesError
    console.log('✅ Cleared profiles')
    
    // Show final status
    await showStatus('AFTER CLEANUP')
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Clear Supabase Auth users via dashboard:')
    console.log('   https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/auth/users')
    console.log('2. Clear storage buckets if needed (company-logos, document-uploads)')
    console.log('3. Test new account creation')
    console.log('\n✅ Database cleanup completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error)
    console.log('\n🔄 Some data may have been partially cleared.')
    console.log('Check the status above and run again if needed.')
  }
}

// Execute cleanup
cleanupDatabase().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})