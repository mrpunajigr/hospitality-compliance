# 🚨 AGGRESSIVE FILENAME DEBUG - FIND THE EXACT BUG

## CRITICAL ISSUE STILL EXISTS
**The filename mismatch is STILL happening after previous debugging attempt!**

- **INPUT:** `test32_IMG_3250.jpg`
- **OUTPUT:** `test20_IMG_3250.jpg`

## 🔍 MANDATORY INVESTIGATION - DO THIS NOW

### Step 1: FIND THE EXACT LINE OF CODE
**Search your ENTIRE codebase for these patterns:**

```bash
# Search for hardcoded "test20"
grep -r "test20" .
grep -r "test.*20" .

# Search for filename replacement logic
grep -r "replace.*test" .
grep -r "test.*replace" .

# Search for number extraction/manipulation
grep -r "\d+" . | grep -i test
grep -r "substring" . | grep -i filename
```

### Step 2: CHECK EVERY FILE UPLOAD FUNCTION
**Add logging to EVERY function that touches filenames:**

```javascript
// In your file upload handler
const uploadFile = async (file) => {
  console.log('🔴 UPLOAD START - Original filename:', file.name);
  
  // Check if there's ANY processing here
  const processedName = someProcessingFunction(file.name);
  console.log('🟡 PROCESSING RESULT:', file.name, '→', processedName);
  
  // Check storage path creation
  const storagePath = createStoragePath(processedName);
  console.log('🔵 STORAGE PATH:', storagePath);
  
  return storagePath;
};
```

### Step 3: TRACE THE EDGE FUNCTION
**Your Edge Function is showing fallback behavior - debug it:**

```javascript
// In your Edge Function that processes the upload
export const uploadAndProcess = async (request) => {
  const formData = await request.formData();
  const file = formData.get('file');
  
  console.log('🚨 EDGE FUNCTION - Original file name:', file.name);
  
  // Check if filename gets modified HERE
  const modifiedName = file.name; // Don't modify!
  console.log('🚨 EDGE FUNCTION - After any processing:', modifiedName);
  
  // Trace the storage operation
  const uploadResult = await supabase.storage
    .from('test-uploads')
    .upload(`folder/${modifiedName}`, file);
    
  console.log('🚨 STORAGE RESULT:', uploadResult);
  return uploadResult;
};
```

### Step 4: CHECK YOUR DATABASE TRIGGER/FUNCTION
**There might be a database function auto-renaming files:**

```sql
-- Check for triggers on your upload table
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'test_uploads';

-- Check for functions that modify filenames
SELECT * FROM pg_proc 
WHERE proname LIKE '%filename%' 
   OR proname LIKE '%test%';
```

### Step 5: EXAMINE THE TIMESTAMP LOGIC
**I see `1756757762371_test20_IMG_3250.jpg` - this suggests:**

```javascript
// Look for code like this that might be hardcoding test20:
const createUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  
  // BUG MIGHT BE HERE - hardcoded test20:
  const processedName = originalName.replace(/test\d+/, 'test20'); // WRONG!
  
  return `${timestamp}_${processedName}`;
};

// Should be:
const createUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  return `${timestamp}_${originalName}`; // Keep original exactly!
};
```

## 🎯 SPECIFIC ACTIONS REQUIRED

### Action 1: Global Code Search
**Run these commands in your project root:**

```bash
# Find ANY occurrence of test20
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -exec grep -l "test20" {} \;

# Find filename processing functions
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -exec grep -l "filename.*replace\|replace.*filename" {} \;
```

### Action 2: Add Breakpoint Logging
**Put this at the START of every function that handles file uploads:**

```javascript
const debugFilename = (location, filename) => {
  console.log(`🚨 ${location}: ${filename}`);
  if (filename !== originalFilename) {
    console.error(`💥 FILENAME CHANGED AT ${location}!`);
    console.error(`Original: ${originalFilename}`);
    console.error(`Current: ${filename}`);
    throw new Error(`Filename corruption detected at ${location}`);
  }
};
```

### Action 3: Check Component State
**In your React component, verify the file state:**

```javascript
const [uploadedFile, setUploadedFile] = useState(null);

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  console.log('🔴 FILE SELECTED:', file.name);
  setUploadedFile(file);
};

const handleUpload = async () => {
  console.log('🔴 UPLOADING FILE:', uploadedFile.name);
  // Make sure uploadedFile.name is still test32_IMG_3250.jpg here
  
  const result = await uploadFunction(uploadedFile);
  console.log('🔴 UPLOAD RESULT:', result);
};
```

## 🚨 STOP EVERYTHING UNTIL YOU FIND THIS

**DO NOT CONTINUE with any other work until you can answer:**

1. **What exact line of code** changes `test32` to `test20`?
2. **What function** is doing this transformation?
3. **Why** is it hardcoded to `test20`?

**This is blocking critical functionality!**

## 🎯 SUCCESS CRITERIA

Upload a file named `TEST_FILENAME_DEBUG_123.jpg` and verify:
- [ ] Console shows exact same filename at every step
- [ ] Database stores exact same filename
- [ ] No transformation or modification occurs
- [ ] Storage path contains exact original filename

**If filename changes ANYWHERE - STOP and report the exact location!**

---

**PRIORITY 1:** This bug must be found and eliminated completely.