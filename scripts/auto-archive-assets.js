#!/usr/bin/env node
/**
 * Auto-Archive Development Assets
 * 
 * Automatically moves development screenshots and assets to Supabase storage
 * after they're 2+ days old to prevent git bloat
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const ASSET_FOLDERS = [
  ':assets/DevScreenshots',
  ':assets/BackupComponents', 
  ':assets/ConversationBackups',
  ':assets/Read'
];

const DAYS_THRESHOLD = 2;
const ARCHIVE_BUCKET = 'development-assets';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials. Skipping archive.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function archiveOldAssets() {
  console.log('🗂️ Starting automatic asset archival...');
  
  const now = Date.now();
  const thresholdTime = now - (DAYS_THRESHOLD * 24 * 60 * 60 * 1000);
  
  let archivedCount = 0;
  let errorCount = 0;
  
  for (const folder of ASSET_FOLDERS) {
    const folderPath = path.join(process.cwd(), folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`📁 Folder ${folder} doesn't exist, skipping...`);
      continue;
    }
    
    console.log(`📁 Processing ${folder}...`);
    
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      
      // Skip directories and recent files
      if (stats.isDirectory() || stats.mtime.getTime() > thresholdTime) {
        continue;
      }
      
      try {
        // Read file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Upload to Supabase
        const uploadPath = `archived/${folder.replace(':assets/', '')}/${file}`;
        const { error } = await supabase.storage
          .from(ARCHIVE_BUCKET)
          .upload(uploadPath, fileBuffer, {
            contentType: getContentType(file),
            upsert: true
          });
        
        if (error) {
          console.log(`❌ Failed to upload ${file}: ${error.message}`);
          errorCount++;
          continue;
        }
        
        // Delete local file after successful upload
        fs.unlinkSync(filePath);
        console.log(`✅ Archived: ${file}`);
        archivedCount++;
        
      } catch (error) {
        console.log(`❌ Error processing ${file}: ${error.message}`);
        errorCount++;
      }
    }
  }
  
  console.log(`\n📊 Archive Summary:`);
  console.log(`✅ Archived: ${archivedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  if (archivedCount > 0) {
    console.log('\n💡 Development assets have been moved to Supabase storage.');
    console.log('   This keeps your git repository clean and fast!');
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg', 
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.txt': 'text/plain'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Run if called directly
if (require.main === module) {
  archiveOldAssets().catch(console.error);
}

module.exports = { archiveOldAssets };