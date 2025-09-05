#!/usr/bin/env node

/**
 * Archive Manager - Node.js Version
 * 
 * Manages development artifact archives with Supabase Storage integration.
 * Node.js compatible version for CLI usage.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
} else {
  console.error('❌ Supabase environment variables not found')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
}

// Archive configuration
const ARCHIVE_CONFIG = {
  ARCHIVE_DELAY_DAYS: 5,
  LOCAL_ARCHIVE_PATHS: {
    screenshots: [':assets/DevScreenshots/', ':assets/Read/'],
    sql: [':assets/sql completed/'],
    documentation: [':assets/docs completed/', ':assets/pages archived/'],
    designAssets: [':assets/design-assets/']
  },
  SUPABASE_BUCKET: 'dev-archive',
  ARCHIVE_LOG_PATH: ':assets/archive-operations.log'
}

/**
 * Calculate file age in days
 */
function getFileAgeInDays(filePath) {
  try {
    const stats = fs.statSync(filePath)
    const createdDate = stats.birthtime
    const currentDate = new Date()
    const timeDiff = currentDate.getTime() - createdDate.getTime()
    return Math.floor(timeDiff / (1000 * 3600 * 24))
  } catch (error) {
    console.error(`Error getting file age for ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Determine file type based on path and content
 */
function categorizeFile(filePath) {
  const normalizedPath = filePath.toLowerCase()
  
  if (normalizedPath.includes('screenshot') || normalizedPath.includes('/read/')) {
    return 'screenshot'
  }
  if (normalizedPath.includes('sql') && normalizedPath.endsWith('.sql')) {
    return 'sql'
  }
  if (normalizedPath.includes('docs') || normalizedPath.includes('pages archived') || normalizedPath.endsWith('.md')) {
    return 'documentation'
  }
  if (normalizedPath.includes('design')) {
    return 'designAsset'
  }
  
  // Default based on file extension
  if (normalizedPath.match(/\.(png|jpg|jpeg|webp)$/)) {
    return 'screenshot'
  }
  if (normalizedPath.endsWith('.sql')) {
    return 'sql'
  }
  if (normalizedPath.endsWith('.md')) {
    return 'documentation'
  }
  
  return 'designAsset'
}

/**
 * Extract context from screenshot filename
 */
function extractScreenshotContext(fileName) {
  // Extract context from naming patterns like:
  // "2025-08-22_ocr-enhancement-success_Screen Shot..."
  const contextMatch = fileName.match(/\d{4}-\d{2}-\d{2}_([^_]+)_/)
  if (contextMatch) {
    return contextMatch[1]
  }
  
  // Fallback patterns
  if (fileName.includes('ocr')) return 'ocr-enhancements'
  if (fileName.includes('navigation')) return 'navigation-testing' 
  if (fileName.includes('dashboard')) return 'dashboard-development'
  if (fileName.includes('upload')) return 'upload-module'
  
  return 'general-development'
}

/**
 * Extract documentation category
 */
function extractDocumentationCategory(fileName) {
  if (fileName.includes('PHASE')) return 'phase-docs'
  if (fileName.includes('IMPLEMENTATION')) return 'implementation-summaries'
  if (fileName.includes('TEMPLATE')) return 'templates'
  if (fileName.includes('DEBUG')) return 'debug-guides'
  if (fileName.includes('ARCHIVED')) return 'archived-features'
  
  return 'misc-docs'
}

/**
 * Generate destination path in Supabase storage
 */
function generateDestinationPath(file) {
  const year = file.createdDate.getFullYear()
  const month = String(file.createdDate.getMonth() + 1).padStart(2, '0')
  const yearMonth = `${year}-${month}`
  
  switch (file.fileType) {
    case 'screenshot':
      const context = extractScreenshotContext(file.fileName)
      return `screenshots/${yearMonth}/${context}/${file.fileName}`
    
    case 'sql':
      return `SQLmigrations/${yearMonth}/${file.fileName}`
    
    case 'documentation':
      const docCategory = extractDocumentationCategory(file.fileName)
      return `documentation/${yearMonth}/${docCategory}/${file.fileName}`
    
    case 'designAsset':
      return `design-assets/${yearMonth}/${file.fileName}`
    
    default:
      return `misc/${yearMonth}/${file.fileName}`
  }
}

/**
 * Scan local directories for archiveable files
 */
async function detectArchiveableFiles() {
  const archiveableFiles = []
  
  // Scan all configured archive paths
  for (const [fileType, paths] of Object.entries(ARCHIVE_CONFIG.LOCAL_ARCHIVE_PATHS)) {
    for (const dirPath of paths) {
      const absolutePath = path.resolve(dirPath)
      
      if (!fs.existsSync(absolutePath)) {
        console.warn(`Archive path not found: ${absolutePath}`)
        continue
      }
      
      try {
        const files = fs.readdirSync(absolutePath, { withFileTypes: true })
        
        for (const file of files) {
          if (file.isFile() && !file.name.startsWith('.')) {
            const filePath = path.join(absolutePath, file.name)
            const ageInDays = getFileAgeInDays(filePath)
            
            // Only include files older than configured delay
            if (ageInDays >= ARCHIVE_CONFIG.ARCHIVE_DELAY_DAYS) {
              const stats = fs.statSync(filePath)
              const categorizedType = categorizeFile(filePath)
              
              const archiveableFile = {
                localPath: filePath,
                fileName: file.name,
                fileType: categorizedType,
                ageInDays,
                fileSize: stats.size,
                createdDate: stats.birthtime,
                destinationPath: ''
              }
              
              // Generate destination path
              archiveableFile.destinationPath = generateDestinationPath(archiveableFile)
              archiveableFiles.push(archiveableFile)
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${absolutePath}:`, error.message)
      }
    }
  }
  
  return archiveableFiles
}

/**
 * Get content type for file
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  
  switch (ext) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.sql': return 'text/plain'
    case '.md': return 'text/markdown'
    case '.txt': return 'text/plain'
    case '.json': return 'application/json'
    default: return 'application/octet-stream'
  }
}

/**
 * Log archive operations for audit trail
 */
function logArchiveOperation(operation) {
  try {
    const logEntry = `${operation.timestamp} | ${operation.operation.toUpperCase()} | ${operation.status.toUpperCase()} | ${operation.filePath}${operation.destination ? ` -> ${operation.destination}` : ''}${operation.errorMessage ? ` | ERROR: ${operation.errorMessage}` : ''}\n`
    
    fs.appendFileSync(ARCHIVE_CONFIG.ARCHIVE_LOG_PATH, logEntry)
  } catch (error) {
    console.error('Error writing to archive log:', error.message)
  }
}

/**
 * Upload file to Supabase Storage
 */
async function uploadFileToStorage(file) {
  if (!supabase) {
    console.error('❌ Supabase client not initialized')
    return false
  }
  
  try {
    const fileBuffer = fs.readFileSync(file.localPath)
    
    const { data, error } = await supabase.storage
      .from(ARCHIVE_CONFIG.SUPABASE_BUCKET)
      .upload(file.destinationPath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: getContentType(file.fileName)
      })
    
    if (error) {
      logArchiveOperation({
        timestamp: new Date().toISOString(),
        operation: 'upload',
        filePath: file.localPath,
        destination: file.destinationPath,
        status: 'failure',
        errorMessage: error.message
      })
      return false
    }
    
    logArchiveOperation({
      timestamp: new Date().toISOString(),
      operation: 'upload',
      filePath: file.localPath,
      destination: file.destinationPath,
      status: 'success'
    })
    
    return true
  } catch (error) {
    logArchiveOperation({
      timestamp: new Date().toISOString(),
      operation: 'upload',
      filePath: file.localPath,
      destination: file.destinationPath,
      status: 'failure',
      errorMessage: error.message
    })
    return false
  }
}

/**
 * Verify file exists in Supabase Storage
 */
async function verifyFileUpload(file) {
  if (!supabase) return false
  
  try {
    const { data, error } = await supabase.storage
      .from(ARCHIVE_CONFIG.SUPABASE_BUCKET)
      .download(file.destinationPath)
    
    return !error && data !== null
  } catch (error) {
    return false
  }
}

/**
 * Safely remove local file after successful upload
 */
function removeLocalFile(filePath) {
  try {
    fs.unlinkSync(filePath)
    
    logArchiveOperation({
      timestamp: new Date().toISOString(),
      operation: 'delete',
      filePath: filePath,
      status: 'success'
    })
    
    return true
  } catch (error) {
    logArchiveOperation({
      timestamp: new Date().toISOString(),
      operation: 'delete',
      filePath: filePath,
      status: 'failure',
      errorMessage: error.message
    })
    return false
  }
}

/**
 * Main archive process - upload eligible files
 */
async function processArchiveUploads(dryRun = false) {
  const result = {
    processed: 0,
    uploaded: 0,
    failed: 0,
    errors: []
  }
  
  console.log(`🗂️ Starting archive process${dryRun ? ' (DRY RUN)' : ''}...`)
  
  const archiveableFiles = await detectArchiveableFiles()
  result.processed = archiveableFiles.length
  
  if (archiveableFiles.length === 0) {
    console.log('✅ No files found for archival')
    return result
  }
  
  console.log(`📁 Found ${archiveableFiles.length} files eligible for archival`)
  
  // Group by type for display
  const byType = archiveableFiles.reduce((acc, file) => {
    acc[file.fileType] = acc[file.fileType] || []
    acc[file.fileType].push(file)
    return acc
  }, {})
  
  console.log('\n📊 Files by category:')
  for (const [type, files] of Object.entries(byType)) {
    const totalSizeMB = (files.reduce((sum, f) => sum + f.fileSize, 0) / 1024 / 1024).toFixed(1)
    console.log(`   • ${type}: ${files.length} files (${totalSizeMB}MB)`)
  }
  
  if (dryRun) {
    console.log('\n🎯 DRY RUN: Would upload to these locations:')
    for (const file of archiveableFiles.slice(0, 5)) {
      console.log(`   📤 ${file.fileName} → ${file.destinationPath}`)
    }
    if (archiveableFiles.length > 5) {
      console.log(`   ... and ${archiveableFiles.length - 5} more files`)
    }
    return result
  }
  
  for (const file of archiveableFiles) {
    console.log(`📤 Processing: ${file.fileName} (${file.ageInDays} days old, ${(file.fileSize / 1024).toFixed(1)}KB)`)
    
    // Upload file
    const uploadSuccess = await uploadFileToStorage(file)
    
    if (uploadSuccess) {
      // Verify upload
      const verifySuccess = await verifyFileUpload(file)
      
      if (verifySuccess) {
        // Remove local file
        const deleteSuccess = removeLocalFile(file.localPath)
        
        if (deleteSuccess) {
          result.uploaded++
          console.log(`   ✅ Successfully archived: ${file.destinationPath}`)
        } else {
          result.failed++
          result.errors.push(`Failed to delete local file: ${file.localPath}`)
        }
      } else {
        result.failed++
        result.errors.push(`Upload verification failed: ${file.destinationPath}`)
      }
    } else {
      result.failed++
      result.errors.push(`Upload failed: ${file.fileName}`)
    }
  }
  
  console.log(`🎯 Archive process complete: ${result.uploaded} uploaded, ${result.failed} failed`)
  
  return result
}

/**
 * Generate archive manifest
 */
async function generateArchiveManifest() {
  const archiveableFiles = await detectArchiveableFiles()
  
  const manifest = {
    generated: new Date().toISOString(),
    totalFiles: archiveableFiles.length,
    filesByType: {},
    files: archiveableFiles.map(file => ({
      fileName: file.fileName,
      type: file.fileType,
      ageInDays: file.ageInDays,
      sizeKB: Math.round(file.fileSize / 1024),
      destinationPath: file.destinationPath
    }))
  }
  
  // Count files by type
  for (const file of archiveableFiles) {
    manifest.filesByType[file.fileType] = (manifest.filesByType[file.fileType] || 0) + 1
  }
  
  const manifestPath = ':assets/archive-manifest.json'
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  
  console.log(`📋 Archive manifest generated: ${manifestPath}`)
}

// Export functions for CLI usage
module.exports = {
  detectArchiveableFiles,
  processArchiveUploads,
  generateArchiveManifest,
  ARCHIVE_CONFIG
}