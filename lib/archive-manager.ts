/**
 * Automated Archive Manager for Development Artifacts
 * 
 * Manages the lifecycle of development files including screenshots, SQL migrations,
 * and documentation. Automatically uploads files older than 5 days to Supabase Storage
 * and maintains organized archive structure.
 */

import { supabase } from './supabase'
import * as fs from 'fs'
import * as path from 'path'

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
} as const

interface ArchiveableFile {
  localPath: string
  fileName: string
  fileType: 'screenshot' | 'sql' | 'documentation' | 'designAsset'
  ageInDays: number
  fileSize: number
  createdDate: Date
  destinationPath: string
}

interface ArchiveOperation {
  timestamp: string
  operation: 'upload' | 'delete' | 'verify' | 'error'
  filePath: string
  destination?: string
  status: 'success' | 'failure' | 'pending'
  errorMessage?: string
}

/**
 * Calculate file age in days
 */
function getFileAgeInDays(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    const createdDate = stats.birthtime
    const currentDate = new Date()
    const timeDiff = currentDate.getTime() - createdDate.getTime()
    return Math.floor(timeDiff / (1000 * 3600 * 24))
  } catch (error) {
    console.error(`Error getting file age for ${filePath}:`, error)
    return 0
  }
}

/**
 * Determine file type based on path and content
 */
function categorizeFile(filePath: string): ArchiveableFile['fileType'] {
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
  
  return 'designAsset' // fallback
}

/**
 * Generate destination path in Supabase storage
 */
function generateDestinationPath(file: ArchiveableFile): string {
  const year = file.createdDate.getFullYear()
  const month = String(file.createdDate.getMonth() + 1).padStart(2, '0')
  const yearMonth = `${year}-${month}`
  
  switch (file.fileType) {
    case 'screenshot':
      // Extract context from filename if available
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
 * Extract context from screenshot filename
 */
function extractScreenshotContext(fileName: string): string {
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
function extractDocumentationCategory(fileName: string): string {
  if (fileName.includes('PHASE')) return 'phase-docs'
  if (fileName.includes('IMPLEMENTATION')) return 'implementation-summaries'
  if (fileName.includes('TEMPLATE')) return 'templates'
  if (fileName.includes('DEBUG')) return 'debug-guides'
  if (fileName.includes('ARCHIVED')) return 'archived-features'
  
  return 'misc-docs'
}

/**
 * Scan local directories for archiveable files
 */
export async function detectArchiveableFiles(): Promise<ArchiveableFile[]> {
  const archiveableFiles: ArchiveableFile[] = []
  
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
          if (file.isFile()) {
            const filePath = path.join(absolutePath, file.name)
            const ageInDays = getFileAgeInDays(filePath)
            
            // Only include files older than configured delay
            if (ageInDays >= ARCHIVE_CONFIG.ARCHIVE_DELAY_DAYS) {
              const stats = fs.statSync(filePath)
              const categorizedType = categorizeFile(filePath)
              
              const archiveableFile: ArchiveableFile = {
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
        console.error(`Error scanning directory ${absolutePath}:`, error)
      }
    }
  }
  
  return archiveableFiles
}

/**
 * Upload file to Supabase Storage with retry logic
 */
async function uploadFileToStorage(file: ArchiveableFile): Promise<boolean> {
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
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

/**
 * Get content type for file
 */
function getContentType(fileName: string): string {
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
 * Verify file exists in Supabase Storage
 */
async function verifyFileUpload(file: ArchiveableFile): Promise<boolean> {
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
function removeLocalFile(filePath: string): boolean {
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
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

/**
 * Log archive operations for audit trail
 */
function logArchiveOperation(operation: ArchiveOperation): void {
  try {
    const logEntry = `${operation.timestamp} | ${operation.operation.toUpperCase()} | ${operation.status.toUpperCase()} | ${operation.filePath}${operation.destination ? ` -> ${operation.destination}` : ''}${operation.errorMessage ? ` | ERROR: ${operation.errorMessage}` : ''}\n`
    
    fs.appendFileSync(ARCHIVE_CONFIG.ARCHIVE_LOG_PATH, logEntry)
  } catch (error) {
    console.error('Error writing to archive log:', error)
  }
}

/**
 * Main archive process - upload eligible files
 */
export async function processArchiveUploads(dryRun: boolean = false): Promise<{
  processed: number
  uploaded: number
  failed: number
  errors: string[]
}> {
  const result = {
    processed: 0,
    uploaded: 0,
    failed: 0,
    errors: [] as string[]
  }
  
  console.log(`🗂️ Starting archive process${dryRun ? ' (DRY RUN)' : ''}...`)
  
  const archiveableFiles = await detectArchiveableFiles()
  result.processed = archiveableFiles.length
  
  if (archiveableFiles.length === 0) {
    console.log('✅ No files found for archival')
    return result
  }
  
  console.log(`📁 Found ${archiveableFiles.length} files eligible for archival`)
  
  for (const file of archiveableFiles) {
    console.log(`📤 Processing: ${file.fileName} (${file.ageInDays} days old, ${(file.fileSize / 1024).toFixed(1)}KB)`)
    
    if (dryRun) {
      console.log(`   → Would upload to: ${file.destinationPath}`)
      continue
    }
    
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
 * Generate archive manifest/index
 */
export async function generateArchiveManifest(): Promise<void> {
  const archiveableFiles = await detectArchiveableFiles()
  
  const manifest = {
    generated: new Date().toISOString(),
    totalFiles: archiveableFiles.length,
    filesByType: {} as Record<string, number>,
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

/**
 * Manual upload specific files (override 5-day rule)
 */
export async function uploadSpecificFiles(filePaths: string[]): Promise<void> {
  console.log(`🚀 Manual upload initiated for ${filePaths.length} files`)
  
  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      continue
    }
    
    const stats = fs.statSync(filePath)
    const fileName = path.basename(filePath)
    const fileType = categorizeFile(filePath)
    
    const file: ArchiveableFile = {
      localPath: filePath,
      fileName,
      fileType,
      ageInDays: getFileAgeInDays(filePath),
      fileSize: stats.size,
      createdDate: stats.birthtime,
      destinationPath: ''
    }
    
    file.destinationPath = generateDestinationPath(file)
    
    const uploadSuccess = await uploadFileToStorage(file)
    
    if (uploadSuccess) {
      const verifySuccess = await verifyFileUpload(file)
      
      if (verifySuccess) {
        console.log(`✅ Successfully uploaded: ${file.destinationPath}`)
      } else {
        console.error(`❌ Upload verification failed: ${file.destinationPath}`)
      }
    } else {
      console.error(`❌ Upload failed: ${fileName}`)
    }
  }
}

// Export configuration for external use
export { ARCHIVE_CONFIG }