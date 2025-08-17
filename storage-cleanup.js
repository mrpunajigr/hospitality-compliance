/**
 * Supabase Storage Cleanup Script
 * 
 * This script clears all files from Supabase storage buckets to complement
 * the database purge for clean Google Cloud AI testing.
 * 
 * Usage:
 * 1. Set environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY)
 * 2. Run: node storage-cleanup.js
 * 
 * Buckets cleaned:
 * - delivery-documents (uploaded files)
 * - processed-images (AI processing artifacts)
 * - Any other document-related buckets
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables in .env.local:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Buckets to clean (PRODUCTION DATA ONLY)
const BUCKETS_TO_CLEAN = [
  'delivery-dockets',  // Updated to match actual bucket name
  'processed-images', 
  'temp-uploads',
  'document-processing'
]

// ⚠️ PROTECTED BUCKETS - NEVER CLEAN THESE
const PROTECTED_BUCKETS = [
  'dev-screenshots',
  'dev-archives', 
  'assets-read',
  'assets',          // Protect the assets bucket we found
  'avatars',         // Protect user avatars
  'client-logos',    // Protect company logos
  'development-assets',
  'archive-screenshots',
  'debug-screenshots',
  'analyzed-screenshots'
]

/**
 * Safety check to prevent cleaning protected buckets
 */
function isProtectedBucket(bucketName) {
  const isProtected = PROTECTED_BUCKETS.some(protected => 
    bucketName.toLowerCase().includes(protected.toLowerCase()) ||
    protected.toLowerCase().includes(bucketName.toLowerCase())
  )
  
  if (isProtected) {
    console.log(`🛡️  PROTECTION: '${bucketName}' appears to be a dev/archive bucket`)
    console.log(`   This bucket is PROTECTED and will NOT be cleaned`)
    return true
  }
  
  return false
}

/**
 * Clean all files from a specific bucket
 */
async function cleanBucket(bucketName) {
  // SAFETY CHECK: Never clean protected buckets
  if (isProtectedBucket(bucketName)) {
    return { bucket: bucketName, status: 'protected', filesDeleted: 0 }
  }
  try {
    console.log(`🧹 Cleaning bucket: ${bucketName}`)
    
    // List all files in bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000, // Adjust if you have more files
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (listError) {
      if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
        console.log(`   ⏭️  Bucket '${bucketName}' does not exist, skipping`)
        return { bucket: bucketName, status: 'not_found', filesDeleted: 0 }
      }
      throw listError
    }
    
    if (!files || files.length === 0) {
      console.log(`   ✅ Bucket '${bucketName}' is already empty`)
      return { bucket: bucketName, status: 'already_empty', filesDeleted: 0 }
    }
    
    console.log(`   📁 Found ${files.length} files to delete`)
    
    // Get file paths (handle nested directories)
    const filePaths = files.map(file => file.name)
    
    // Delete all files
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths)
    
    if (deleteError) {
      throw deleteError
    }
    
    console.log(`   ✅ Deleted ${filePaths.length} files from '${bucketName}'`)
    return { bucket: bucketName, status: 'cleaned', filesDeleted: filePaths.length }
    
  } catch (error) {
    console.error(`   ❌ Error cleaning bucket '${bucketName}':`, error.message)
    return { bucket: bucketName, status: 'error', error: error.message, filesDeleted: 0 }
  }
}

/**
 * Clean all subdirectories recursively
 */
async function cleanBucketRecursive(bucketName, path = '') {
  try {
    // List items at current path
    const { data: items, error: listError } = await supabase.storage
      .from(bucketName)
      .list(path, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (listError) {
      if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
        return { filesDeleted: 0, dirsProcessed: 0 }
      }
      throw listError
    }
    
    if (!items || items.length === 0) {
      return { filesDeleted: 0, dirsProcessed: 0 }
    }
    
    let totalFilesDeleted = 0
    let totalDirsProcessed = 0
    
    // Separate files and directories
    const files = items.filter(item => item.metadata)
    const directories = items.filter(item => !item.metadata)
    
    // Delete files in current directory
    if (files.length > 0) {
      const filePaths = files.map(file => path ? `${path}/${file.name}` : file.name)
      
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filePaths)
      
      if (deleteError) {
        throw deleteError
      }
      
      totalFilesDeleted += files.length
      console.log(`   📄 Deleted ${files.length} files from '${path || 'root'}'`)
    }
    
    // Recursively process subdirectories
    for (const dir of directories) {
      const subPath = path ? `${path}/${dir.name}` : dir.name
      const subResult = await cleanBucketRecursive(bucketName, subPath)
      totalFilesDeleted += subResult.filesDeleted
      totalDirsProcessed += subResult.dirsProcessed
    }
    
    totalDirsProcessed += directories.length
    
    return { filesDeleted: totalFilesDeleted, dirsProcessed: totalDirsProcessed }
    
  } catch (error) {
    console.error(`   ❌ Error in recursive cleanup:`, error.message)
    throw error
  }
}

/**
 * Discover all buckets and warn about potential dev/archive buckets
 */
async function discoverBuckets() {
  try {
    console.log('🔍 Discovering all storage buckets...')
    
    // List all buckets (this might not be available in all Supabase plans)
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.log('   ℹ️  Cannot list all buckets (checking configured buckets only)')
      return []
    }
    
    if (buckets && buckets.length > 0) {
      console.log(`   📁 Found ${buckets.length} total buckets:`)
      
      buckets.forEach(bucket => {
        const isTarget = BUCKETS_TO_CLEAN.includes(bucket.name)
        const isProtected = isProtectedBucket(bucket.name)
        
        if (isTarget) {
          console.log(`   🎯 ${bucket.name} - WILL BE CLEANED`)
        } else if (isProtected) {
          console.log(`   🛡️  ${bucket.name} - PROTECTED (will not be cleaned)`)
        } else {
          console.log(`   ❓ ${bucket.name} - Unknown (not in cleanup list)`)
        }
      })
      
      return buckets
    }
    
    return []
  } catch (error) {
    console.log('   ℹ️  Bucket discovery not available, proceeding with configured list')
    return []
  }
}

/**
 * Main cleanup function
 */
async function cleanupStorage() {
  console.log('🚀 Starting Supabase Storage Cleanup')
  console.log('=====================================')
  console.log('')
  
  // First, discover all buckets and show protection status
  await discoverBuckets()
  console.log('')
  
  console.log('🛡️  SAFETY CONFIRMATION:')
  console.log('   Only cleaning PRODUCTION data buckets')
  console.log('   DEV archives and screenshots are PROTECTED')
  console.log('')
  
  const results = []
  let totalFilesDeleted = 0
  
  for (const bucketName of BUCKETS_TO_CLEAN) {
    try {
      console.log(`🧹 Processing bucket: ${bucketName}`)
      
      // Try recursive cleanup for better coverage
      const recursiveResult = await cleanBucketRecursive(bucketName)
      
      if (recursiveResult.filesDeleted > 0) {
        console.log(`   ✅ Recursively deleted ${recursiveResult.filesDeleted} files`)
        results.push({ 
          bucket: bucketName, 
          status: 'cleaned', 
          filesDeleted: recursiveResult.filesDeleted 
        })
        totalFilesDeleted += recursiveResult.filesDeleted
      } else {
        // Fall back to simple cleanup
        const result = await cleanBucket(bucketName)
        results.push(result)
        totalFilesDeleted += result.filesDeleted
      }
      
    } catch (error) {
      console.error(`❌ Failed to process bucket '${bucketName}':`, error.message)
      results.push({ 
        bucket: bucketName, 
        status: 'error', 
        error: error.message, 
        filesDeleted: 0 
      })
    }
    
    console.log('')
  }
  
  // Summary
  console.log('📊 CLEANUP SUMMARY')
  console.log('==================')
  console.log('')
  
  results.forEach(result => {
    const status = result.status === 'cleaned' ? '✅' :
                   result.status === 'already_empty' ? '📭' :
                   result.status === 'not_found' ? '⏭️' : 
                   result.status === 'protected' ? '🛡️' : '❌'
    
    console.log(`${status} ${result.bucket}: ${result.filesDeleted} files deleted`)
    
    if (result.status === 'protected') {
      console.log(`   Protected: DEV/Archive bucket preserved`)
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
  })
  
  console.log('')
  console.log(`🎯 Total files deleted: ${totalFilesDeleted}`)
  
  if (totalFilesDeleted > 0) {
    console.log('✅ Storage cleanup completed successfully')
  } else {
    console.log('📭 Storage was already clean or no accessible buckets found')
  }
  
  console.log('')
  console.log('Next steps:')
  console.log('1. Run PURGE_ALL_DATA.sql to clean database')
  console.log('2. Test upload with clean environment')
  console.log('3. Verify Google Cloud AI processing')
}

/**
 * Verify cleanup by listing remaining files
 */
async function verifyCleanup() {
  console.log('🔍 Verifying storage cleanup...')
  console.log('')
  
  for (const bucketName of BUCKETS_TO_CLEAN) {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 10 })
      
      if (error) {
        if (error.message.includes('not found')) {
          console.log(`📝 ${bucketName}: Bucket does not exist`)
        } else {
          console.log(`❌ ${bucketName}: Error - ${error.message}`)
        }
      } else {
        const fileCount = files ? files.length : 0
        if (fileCount === 0) {
          console.log(`✅ ${bucketName}: Empty (0 files)`)
        } else {
          console.log(`⚠️  ${bucketName}: ${fileCount} files remaining`)
        }
      }
    } catch (error) {
      console.log(`❌ ${bucketName}: Verification failed - ${error.message}`)
    }
  }
}

// Run cleanup
if (require.main === module) {
  cleanupStorage()
    .then(() => {
      console.log('')
      return verifyCleanup()
    })
    .then(() => {
      console.log('')
      console.log('🎉 Storage cleanup process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('')
      console.error('💥 Storage cleanup failed:', error.message)
      console.error('')
      console.error('Please check:')
      console.error('1. Environment variables are set correctly')
      console.error('2. Service role key has storage permissions')
      console.error('3. Bucket names exist in your Supabase project')
      process.exit(1)
    })
}

module.exports = { cleanupStorage, cleanBucket, verifyCleanup }