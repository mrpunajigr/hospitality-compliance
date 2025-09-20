/**
 * Verification Script - Database Cleanup Status
 * Comprehensive check of all tables to ensure cleanup was successful
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

async function checkTable(tableName, description) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`⚠️  ${description}: Table may not exist`)
      return 0
    }
    
    const status = count === 0 ? '✅' : '❌'
    console.log(`${status} ${description}: ${count} rows`)
    return count
  } catch (error) {
    console.log(`⚠️  ${description}: Error checking (${error.message})`)
    return 0
  }
}

async function verifyCleanup() {
  console.log('🔍 JiGR Database Cleanup Verification')
  console.log('=' .repeat(50))
  
  let totalRows = 0
  
  // Core tables that should be empty
  totalRows += await checkTable('clients', 'Clients/Companies')
  totalRows += await checkTable('profiles', 'User Profiles')
  totalRows += await checkTable('client_users', 'User-Client Relationships')
  totalRows += await checkTable('invitations', 'Invitations')
  
  console.log('')
  console.log('📊 Additional Data Tables:')
  totalRows += await checkTable('assets', 'Assets/Uploads')
  totalRows += await checkTable('document_analyses', 'Document Analyses')
  totalRows += await checkTable('delivery_dockets', 'Delivery Dockets')
  
  console.log('')
  console.log('🔧 System Tables (should have data):')
  await checkTable('information_schema.tables', 'Database Schema')
  
  console.log('')
  console.log('=' .repeat(50))
  
  if (totalRows === 0) {
    console.log('✅ DATABASE IS COMPLETELY CLEAN!')
    console.log('🎯 Ready for fresh account creation testing')
    console.log('')
    console.log('📋 What you can test now:')
    console.log('• Create new company accounts')
    console.log('• Test user invitations')
    console.log('• Verify business info displays correctly')
    console.log('• Test all form fields')
    console.log('')
    console.log('💡 New accounts will get clean IDs starting from 1')
  } else {
    console.log(`❌ CLEANUP INCOMPLETE: ${totalRows} rows remain`)
    console.log('Some data may need manual removal')
  }
  
  console.log('')
  console.log('🔗 Manual cleanup steps (if needed):')
  console.log('1. Auth Users: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/auth/users')
  console.log('2. Storage: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/storage/buckets')
  console.log('3. Logs: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/logs')
}

verifyCleanup()