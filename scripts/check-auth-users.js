/**
 * Check Supabase Auth Users
 * This script checks for any remaining auth users that need manual cleanup
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

async function checkAuthUsers() {
  console.log('🔍 Checking Supabase Auth Users...')
  
  try {
    // Try to get auth users using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Error fetching auth users:', error)
      return
    }
    
    console.log(`\n📊 Found ${users.length} auth users:`)
    
    if (users.length === 0) {
      console.log('✅ No auth users found - database is completely clean!')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`)
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`)
        console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}`)
        console.log('')
      })
      
      console.log('🎯 To complete cleanup:')
      console.log('1. Go to: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/auth/users')
      console.log('2. Select all users and delete them')
      console.log('3. Or run: DELETE FROM auth.users; (if you have direct access)')
    }
    
  } catch (error) {
    console.error('❌ Failed to check auth users:', error)
  }
}

checkAuthUsers()