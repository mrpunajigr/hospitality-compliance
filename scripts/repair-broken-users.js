/**
 * Repair Broken Users Script
 * Fixes users who have auth accounts but no company/client relationships
 */

const { createClient } = require('@supabase/supabase-js')

// You'll need to get the correct service key from your .env.local
const supabaseUrl = 'https://rggdywqnvpuwssluzfud.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function repairBrokenUsers() {
  console.log('🔧 Repairing users with broken company relationships...')
  
  try {
    // Find users who have profiles but no client_users records
    const { data: orphanedProfiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone
      `)
    
    if (profileError) {
      console.error('❌ Cannot access profiles:', profileError)
      return
    }
    
    console.log(`Found ${orphanedProfiles?.length || 0} profiles`)
    
    for (const profile of orphanedProfiles || []) {
      console.log(`\n🔍 Checking user: ${profile.email}`)
      
      // Check if user has client relationship
      const { data: existingRelation } = await supabase
        .from('client_users')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle()
      
      if (existingRelation) {
        console.log('✅ User already has company relationship')
        continue
      }
      
      console.log('🔧 User needs company - creating one...')
      
      // Create a basic company for this user
      const companyName = profile.full_name ? `${profile.full_name}'s Company` : `${profile.email.split('@')[0]} Business`
      
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: companyName,
          business_email: profile.email,
          phone: profile.phone,
          subscription_status: 'trial',
          subscription_tier: 'basic',
          onboarding_status: 'started'
        })
        .select()
        .single()
      
      if (clientError) {
        console.error(`❌ Failed to create company for ${profile.email}:`, clientError)
        continue
      }
      
      console.log(`✅ Created company: ${companyName}`)
      
      // Link user to company
      const { error: linkError } = await supabase
        .from('client_users')
        .insert({
          user_id: profile.id,
          client_id: newClient.id,
          role: 'OWNER',
          status: 'active',
          joined_at: new Date().toISOString()
        })
      
      if (linkError) {
        console.error(`❌ Failed to link user to company:`, linkError)
      } else {
        console.log(`✅ Linked ${profile.email} to company`)
      }
    }
    
    console.log('\n🎯 Repair complete! Users should now be able to access admin console.')
    
  } catch (error) {
    console.error('❌ Repair failed:', error)
  }
}

// Run the repair
repairBrokenUsers()