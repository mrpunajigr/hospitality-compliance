#!/usr/bin/env node

// Quick script to check and create dev-archive bucket

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkStorage() {
  try {
    console.log('🔍 Checking existing storage buckets...')
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return
    }
    
    console.log('📁 Existing buckets:')
    buckets.forEach(bucket => {
      console.log(`   • ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    // Check if dev-archive exists
    const devArchiveBucket = buckets.find(b => b.name === 'dev-archive')
    
    if (!devArchiveBucket) {
      console.log('\n📦 Creating dev-archive bucket...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('dev-archive', {
        public: false, // Private bucket for development archives
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'text/plain', 'text/markdown', 'application/json'],
        fileSizeLimit: 10485760 // 10MB limit
      })
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError.message)
        return
      }
      
      console.log('✅ dev-archive bucket created successfully!')
    } else {
      console.log('\n✅ dev-archive bucket already exists')
    }
    
  } catch (error) {
    console.error('❌ Storage check failed:', error.message)
  }
}

checkStorage()