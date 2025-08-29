# 🗂️ Clear Supabase Storage Bucket

## Commands to Clear Delivery Dockets Bucket

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → Storage
2. Select `delivery-dockets` bucket
3. Select all files
4. Delete all files

### Option 2: SQL Commands (if bucket operations are exposed)
```sql
-- Note: Supabase Storage operations typically need to be done via API or Dashboard
-- These are reference commands for the storage API

-- List all files in bucket (for verification)
SELECT * FROM storage.objects WHERE bucket_id = 'delivery-dockets';

-- Delete all files in delivery-dockets bucket
DELETE FROM storage.objects WHERE bucket_id = 'delivery-dockets';

-- Verify bucket is empty
SELECT COUNT(*) as remaining_files FROM storage.objects WHERE bucket_id = 'delivery-dockets';
```

### Option 3: JavaScript/API Approach
```javascript
// If needed, this could be added to the console page as a cleanup function
const clearStorageBucket = async () => {
  try {
    // List all files in bucket
    const { data: files, error: listError } = await supabase.storage
      .from('delivery-dockets')
      .list()
    
    if (listError) throw listError
    
    if (files && files.length > 0) {
      // Delete all files
      const filePaths = files.map(file => file.name)
      const { error: deleteError } = await supabase.storage
        .from('delivery-dockets')
        .remove(filePaths)
      
      if (deleteError) throw deleteError
      console.log('✅ All files cleared from delivery-dockets bucket')
    } else {
      console.log('✅ Bucket already empty')
    }
  } catch (error) {
    console.error('❌ Error clearing storage bucket:', error)
  }
}
```

## Verification
After clearing, verify:
- ✅ delivery-dockets bucket is empty
- ✅ No orphaned file references
- ✅ Storage quota reset to 0 used space