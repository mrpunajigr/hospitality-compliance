#!/usr/bin/env node

/**
 * Archive Manager CLI
 * 
 * Command-line interface for managing development artifact archives.
 * Provides easy access to archive detection, upload, and management functions.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Command-line argument parsing
const args = process.argv.slice(2)
const command = args[0]
const flags = args.slice(1)

// Help text
const HELP_TEXT = `
🗂️  Archive Manager CLI

USAGE:
  npm run archive <command> [options]

COMMANDS:
  scan          Scan for files eligible for archival (5+ days old)
  upload        Upload eligible files to Supabase Storage
  dry-run       Preview what would be uploaded without executing
  manifest      Generate archive manifest of eligible files
  manual        Upload specific files manually (bypass 5-day rule)
  help          Show this help message

OPTIONS:
  --verbose     Show detailed output
  --force       Skip confirmations (use with caution)

EXAMPLES:
  npm run archive scan
  npm run archive dry-run
  npm run archive upload
  npm run archive manual path/to/file.png
  npm run archive manifest

ARCHIVE LOCATIONS:
  Screenshots:     :assets/DevScreenshots/, :assets/Read/
  SQL Migrations:  :assets/sql completed/
  Documentation:   :assets/docs completed/, :assets/pages archived/
  
SUPABASE STORAGE:
  Bucket: dev-archive
  Structure: [type]/[YYYY-MM]/[files]
`

// Use Node.js compatible archive manager
const archiveManager = require('./archive-manager-node.js')

// Main command handler
async function main() {
  const verbose = flags.includes('--verbose')
  const force = flags.includes('--force')
  
  if (verbose) {
    console.log(`🔧 Archive Manager CLI - Command: ${command}`)
    console.log(`📁 Working Directory: ${process.cwd()}`)
  }
  
  switch (command) {
    case 'scan':
      console.log('🔍 Scanning for archiveable files...')
      try {
        const files = await archiveManager.detectArchiveableFiles()
        
        if (files.length === 0) {
          console.log('✅ No files found for archival (all files are less than 5 days old)')
          return
        }
        
        console.log(`📋 Found ${files.length} files eligible for archival:\n`)
        
        // Group by type
        const byType = files.reduce((acc, file) => {
          acc[file.fileType] = acc[file.fileType] || []
          acc[file.fileType].push(file)
          return acc
        }, {})
        
        for (const [type, typeFiles] of Object.entries(byType)) {
          console.log(`  📁 ${type.toUpperCase()} (${typeFiles.length} files):`)
          for (const file of typeFiles) {
            const sizeKB = (file.fileSize / 1024).toFixed(1)
            console.log(`    • ${file.fileName} (${file.ageInDays} days, ${sizeKB}KB)`)
            if (verbose) {
              console.log(`      → ${file.destinationPath}`)
            }
          }
          console.log('')
        }
        
        const totalSizeMB = (files.reduce((sum, f) => sum + f.fileSize, 0) / 1024 / 1024).toFixed(2)
        console.log(`📊 Total: ${files.length} files, ${totalSizeMB}MB`)
        
      } catch (error) {
        console.error('❌ Error scanning files:', error.message)
        process.exit(1)
      }
      break
      
    case 'dry-run':
      console.log('🧪 Dry run - Preview archive operations...')
      try {
        const result = await archiveManager.processArchiveUploads(true)
        
        console.log(`\n📊 Dry Run Results:`)
        console.log(`   • Files to process: ${result.processed}`)
        console.log(`   • No files were actually uploaded or deleted`)
        console.log(`\n💡 Run 'npm run archive upload' to execute the upload`)
        
      } catch (error) {
        console.error('❌ Error during dry run:', error.message)
        process.exit(1)
      }
      break
      
    case 'upload':
      if (!force) {
        console.log('⚠️  This will upload and DELETE local files after successful transfer!')
        console.log('   Run with --force to skip this confirmation')
        
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        const answer = await new Promise(resolve => {
          readline.question('   Continue? (y/N): ', resolve)
        })
        
        readline.close()
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('❌ Archive upload cancelled')
          process.exit(0)
        }
      }
      
      console.log('🚀 Starting archive upload process...')
      try {
        const result = await archiveManager.processArchiveUploads(false)
        
        console.log(`\n📊 Upload Results:`)
        console.log(`   • Files processed: ${result.processed}`)
        console.log(`   • Successfully uploaded: ${result.uploaded}`)
        console.log(`   • Failed uploads: ${result.failed}`)
        
        if (result.errors.length > 0) {
          console.log(`\n❌ Errors:`)
          for (const error of result.errors) {
            console.log(`   • ${error}`)
          }
        }
        
        if (result.uploaded > 0) {
          console.log(`\n✅ Archive process completed successfully!`)
          console.log(`   View archived files in Supabase Storage: dev-archive bucket`)
        }
        
      } catch (error) {
        console.error('❌ Error during upload:', error.message)
        process.exit(1)
      }
      break
      
    case 'manifest':
      console.log('📋 Generating archive manifest...')
      try {
        await archiveManager.generateArchiveManifest()
        console.log('✅ Archive manifest generated: :assets/archive-manifest.json')
      } catch (error) {
        console.error('❌ Error generating manifest:', error.message)
        process.exit(1)
      }
      break
      
    case 'manual':
      if (flags.length === 0) {
        console.error('❌ Manual upload requires file paths')
        console.error('   Usage: npm run archive manual path/to/file1.png path/to/file2.sql')
        process.exit(1)
      }
      
      const filePaths = flags.filter(f => !f.startsWith('--'))
      console.log(`🚀 Manual upload for ${filePaths.length} files...`)
      
      try {
        const { uploadSpecificFiles } = await import('../lib/archive-manager.ts')
        await uploadSpecificFiles(filePaths)
        console.log('✅ Manual upload completed')
      } catch (error) {
        console.error('❌ Error during manual upload:', error.message)
        process.exit(1)
      }
      break
      
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP_TEXT)
      break
      
    default:
      console.error(`❌ Unknown command: ${command}`)
      console.log('   Run "npm run archive help" for usage information')
      process.exit(1)
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason)
  process.exit(1)
})

// Run main function
main().catch(error => {
  console.error('❌ Archive Manager Error:', error.message)
  process.exit(1)
})