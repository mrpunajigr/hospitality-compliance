#!/usr/bin/env node

/**
 * Test Archive System
 * Simple test to verify archive detection works
 */

const fs = require('fs')
const path = require('path')

// Configuration matching the TypeScript version
const ARCHIVE_CONFIG = {
  ARCHIVE_DELAY_DAYS: 5,
  LOCAL_ARCHIVE_PATHS: {
    screenshots: [':assets/DevScreenshots/', ':assets/Read/'],
    sql: [':assets/sql completed/'],
    documentation: [':assets/docs completed/', ':assets/pages archived/']
  }
}

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
  
  return 'other'
}

async function testArchiveDetection() {
  console.log('🔍 Testing Archive Detection System...\n')
  
  const archiveableFiles = []
  
  // Scan all configured archive paths
  for (const [fileType, paths] of Object.entries(ARCHIVE_CONFIG.LOCAL_ARCHIVE_PATHS)) {
    console.log(`📁 Scanning ${fileType} files...`)
    
    for (const dirPath of paths) {
      const absolutePath = path.resolve(dirPath)
      
      if (!fs.existsSync(absolutePath)) {
        console.log(`   ⚠️  Path not found: ${absolutePath}`)
        continue
      }
      
      try {
        const files = fs.readdirSync(absolutePath, { withFileTypes: true })
        let foundFiles = 0
        let eligibleFiles = 0
        
        for (const file of files) {
          if (file.isFile() && !file.name.startsWith('.')) {
            foundFiles++
            const filePath = path.join(absolutePath, file.name)
            const ageInDays = getFileAgeInDays(filePath)
            const stats = fs.statSync(filePath)
            
            if (ageInDays >= ARCHIVE_CONFIG.ARCHIVE_DELAY_DAYS) {
              eligibleFiles++
              archiveableFiles.push({
                localPath: filePath,
                fileName: file.name,
                fileType: categorizeFile(filePath),
                ageInDays,
                fileSize: stats.size,
                createdDate: stats.birthtime
              })
            }
          }
        }
        
        console.log(`   📄 Found ${foundFiles} files, ${eligibleFiles} eligible for archival`)
        
      } catch (error) {
        console.error(`   ❌ Error scanning ${absolutePath}:`, error.message)
      }
    }
    console.log('')
  }
  
  // Summary
  console.log(`📊 ARCHIVE DETECTION SUMMARY:`)
  console.log(`   • Total files eligible for archival: ${archiveableFiles.length}`)
  
  if (archiveableFiles.length > 0) {
    // Group by type
    const byType = archiveableFiles.reduce((acc, file) => {
      acc[file.fileType] = acc[file.fileType] || []
      acc[file.fileType].push(file)
      return acc
    }, {})
    
    console.log(`\n📋 Files by type:`)
    for (const [type, typeFiles] of Object.entries(byType)) {
      const totalSizeKB = typeFiles.reduce((sum, f) => sum + f.fileSize, 0) / 1024
      console.log(`   • ${type}: ${typeFiles.length} files (${totalSizeKB.toFixed(1)}KB)`)
    }
    
    console.log(`\n📝 Oldest files:`)
    const sorted = archiveableFiles.sort((a, b) => b.ageInDays - a.ageInDays)
    for (let i = 0; i < Math.min(5, sorted.length); i++) {
      const file = sorted[i]
      console.log(`   • ${file.fileName} (${file.ageInDays} days old)`)
    }
  } else {
    console.log(`   ✅ No files found for archival (all files are less than ${ARCHIVE_CONFIG.ARCHIVE_DELAY_DAYS} days old)`)
  }
  
  console.log(`\n💡 To upload eligible files to Supabase Storage:`)
  console.log(`   npm run archive upload`)
  console.log(`\n💡 To preview operations without executing:`)
  console.log(`   npm run archive dry-run`)
}

// Run test
testArchiveDetection().catch(error => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})