#!/usr/bin/env node

// Cleanup Demo Data Script
// Removes all existing delivery records and related data for fresh testing

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupDemoData() {
  try {
    console.log('🗑️ Starting demo data cleanup...')
    
    // Step 1: Get count of existing records
    const { count: deliveryCount } = await supabase
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })
    
    const { count: tempCount } = await supabase
      .from('temperature_readings')
      .select('*', { count: 'exact', head: true })
    
    const { count: auditCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Found ${deliveryCount} delivery records`)
    console.log(`📊 Found ${tempCount} temperature readings`)
    console.log(`📊 Found ${auditCount} audit logs`)
    
    if (deliveryCount === 0) {
      console.log('✅ No data to clean - database is already empty')
      return
    }
    
    // Step 2: Delete temperature readings first (foreign key dependency)
    console.log('🗑️ Deleting temperature readings...')
    const { error: tempError } = await supabase
      .from('temperature_readings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (tempError) {
      console.error('❌ Error deleting temperature readings:', tempError.message)
    } else {
      console.log('✅ Temperature readings deleted')
    }
    
    // Step 3: Delete audit logs
    console.log('🗑️ Deleting audit logs...')
    const { error: auditError } = await supabase
      .from('audit_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (auditError) {
      console.error('❌ Error deleting audit logs:', auditError.message)
    } else {
      console.log('✅ Audit logs deleted')
    }
    
    // Step 4: Delete delivery records
    console.log('🗑️ Deleting delivery records...')
    const { error: deliveryError } = await supabase
      .from('delivery_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (deliveryError) {
      console.error('❌ Error deleting delivery records:', deliveryError.message)
      return
    }
    
    console.log('✅ Delivery records deleted')
    
    // Step 5: Verify cleanup
    const { count: finalCount } = await supabase
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Final count: ${finalCount} delivery records remaining`)
    
    // Step 6: Clean up Supabase Storage files (optional)
    console.log('🗑️ Cleaning up storage files...')
    const { data: files, error: listError } = await supabase.storage
      .from('delivery-dockets')
      .list()
    
    if (listError) {
      console.error('❌ Error listing storage files:', listError.message)
    } else if (files && files.length > 0) {
      console.log(`📁 Found ${files.length} storage folders to clean`)
      
      // Delete all files in each folder
      for (const folder of files) {
        if (folder.name) {
          const { data: folderFiles } = await supabase.storage
            .from('delivery-dockets')
            .list(folder.name, { limit: 100 })
          
          if (folderFiles && folderFiles.length > 0) {
            const filePaths = folderFiles.map(file => `${folder.name}/${file.name}`)
            const { error: deleteError } = await supabase.storage
              .from('delivery-dockets')
              .remove(filePaths)
            
            if (deleteError) {
              console.error(`❌ Error deleting files in ${folder.name}:`, deleteError.message)
            } else {
              console.log(`✅ Cleaned ${folderFiles.length} files from ${folder.name}`)
            }
          }
        }
      }
    } else {
      console.log('📁 No storage files to clean')
    }
    
    console.log('🎉 Demo data cleanup completed successfully!')
    console.log('🚀 Ready for fresh real AI processing tests')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
    process.exit(1)
  }
}

// Run the cleanup
cleanupDemoData()