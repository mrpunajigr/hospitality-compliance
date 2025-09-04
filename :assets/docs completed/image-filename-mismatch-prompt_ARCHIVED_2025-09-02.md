# Image File Name Mismatch Debug & Fix - Claude Code Prompt

## 🚨 CRITICAL BUG TO RESOLVE

**Issue:** File name mismatch between upload and retrieval
- **Uploaded:** `test30_IMG_3250.jpg` 
- **Retrieved:** `test20_IMG_3250.jpg`

## 🔍 DEBUG & FIX PROTOCOL

### Step 1: Immediate Investigation
**ANALYZE these components for the filename mismatch:**

```javascript
// 1. Check upload handler - trace filename processing
console.log('Original filename:', uploadedFile.name);
console.log('Processed filename before storage:', processedFilename);
console.log('Storage path created:', storagePath);

// 2. Check database insertion
console.log('Database record created:', insertedRecord);

// 3. Check retrieval query  
console.log('Query used for retrieval:', retrievalQuery);
console.log('Retrieved record:', retrievedRecord);
```

### Step 2: Root Cause Analysis
**CHECK FOR THESE SPECIFIC BUGS:**

#### A. Filename Processing Bug
```javascript
// WRONG: Don't do this
const processedName = filename.replace(/test\d+/, 'test20'); 

// RIGHT: Preserve original filename
const processedName = filename; // Keep exact original
```

#### B. Database Query Issue
```sql
-- WRONG: Partial match might return wrong record
SELECT * FROM test_uploads 
WHERE filename LIKE '%IMG_3250.jpg%'
ORDER BY created_at DESC LIMIT 1;

-- RIGHT: Exact filename match
SELECT * FROM test_uploads 
WHERE filename = 'test30_IMG_3250.jpg';
```

#### C. Caching Problem
```javascript
// Clear any filename caches
// Check for stale state in components
// Verify database connection isn't cached
```

### Step 3: Database Investigation
**RUN THESE QUERIES IN SUPABASE:**

```sql
-- Check all recent uploads
SELECT id, filename, image_path, created_at 
FROM test_uploads 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for duplicate filenames
SELECT filename, COUNT(*) as count
FROM test_uploads 
GROUP BY filename
HAVING COUNT(*) > 1;

-- Check specific problematic file
SELECT * FROM test_uploads 
WHERE filename LIKE '%IMG_3250%';
```

### Step 4: Environment Variable Fix
**RESOLVE GOOGLE_CREDENTIALS ERROR:**

```javascript
// In your Edge Function or processing component
if (!process.env.GOOGLE_CREDENTIALS) {
  console.error('❌ GOOGLE_CREDENTIALS environment variable not set');
  // Fallback or proper error handling
}

// Verify Secret Manager access
const credentials = await getSecret('google-cloud-credentials');
console.log('✅ Credentials loaded:', !!credentials);
```

### Step 5: Comprehensive Logging
**ADD DETAILED LOGGING TO TRACK FILENAME FLOW:**

```javascript
const debugFilenameFlow = {
  upload: (filename) => console.log('🔵 UPLOAD:', filename),
  process: (original, processed) => console.log('🟡 PROCESS:', original, '→', processed),
  store: (filename, path) => console.log('🟢 STORE:', filename, 'at', path),
  retrieve: (query, result) => console.log('🔴 RETRIEVE:', query, '→', result?.filename)
};
```

### Step 6: Data Cleanup & Testing
**CLEAN TEST DATA AND VERIFY FIX:**

```javascript
// 1. Clear problematic test data
const clearTestData = async () => {
  const { error } = await supabase
    .from('test_uploads')
    .delete()
    .like('filename', '%test%_IMG%');
  
  if (error) console.error('Cleanup error:', error);
  else console.log('✅ Test data cleared');
};

// 2. Test with fresh upload
const testFilenameMaintenance = async (testFile) => {
  console.log('🧪 Testing filename maintenance...');
  
  // Upload
  const uploadResult = await uploadFile(testFile);
  console.log('Upload result:', uploadResult);
  
  // Retrieve
  const retrievedFile = await getFileByName(testFile.name);
  console.log('Retrieved file:', retrievedFile);
  
  // Verify match
  const matches = uploadResult.filename === retrievedFile.filename;
  console.log(matches ? '✅ FILENAMES MATCH' : '❌ MISMATCH STILL EXISTS');
  
  return matches;
};
```

## 🛡️ SAFETY PROTOCOLS

### Before Making Changes:
1. **Create backup** of current test data
2. **Document current behavior** with screenshots/logs  
3. **Test in development only** - don't touch production uploads
4. **Verify no existing files get affected** by changes

### Testing Requirements:
1. **Upload new test file** with unique name
2. **Verify exact filename preservation** through entire flow
3. **Test retrieval by exact filename match**
4. **Confirm no regression** in existing functionality

## 🎯 EXPECTED OUTCOMES

### Immediate Fix:
- [ ] Uploaded filename exactly matches retrieved filename
- [ ] No more `test20` appearing when `test30` uploaded
- [ ] Google credentials error resolved
- [ ] Clear logging shows exact filename flow

### Long-term Improvements:
- [ ] Robust filename handling using **PascalCase** convention
- [ ] Proper error handling for missing credentials
- [ ] Test data management utilities
- [ ] Filename validation and sanitization

## 🚨 CRITICAL SUCCESS CRITERIA

**DO NOT PROCEED until you can:**
1. Upload a file named `TestFilename123.jpg`
2. Retrieve exact same filename `TestFilename123.jpg` 
3. Verify in database the stored filename is identical
4. Confirm no caching or processing is altering the filename

**IF ANY FILENAME MISMATCH PERSISTS:** Stop and report exact flow where the filename changes occur.

---

**PRIORITY:** Fix this immediately - filename integrity is critical for document processing and client trust.