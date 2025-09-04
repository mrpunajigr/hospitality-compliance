# Image Rendering Debug & Fix - Claude Code Prompt

## 🚨 **CRITICAL ISSUE: Uploaded Images Not Rendering in SimpleResultsCard**

### **Problem Description**
The `SimpleResultsCard.tsx` component is failing to display uploaded delivery docket images. Debug logs show:

```
❌ Fetch failed loading: GET http://localhost:3000/api/get-upload-url?fileName=1756945774910-test168_IMG_3252.jpeg&userId=a0eebc99-9c0b-4e...
```

**Status:** Upload works ✅ | Database storage works ✅ | Image retrieval fails ❌

### **Root Cause Analysis**
1. **Missing API Endpoint:** `/api/get-upload-url/route.ts` likely doesn't exist
2. **Broken Signed URL Generation:** Supabase storage signed URL creation failing
3. **Path/Permissions Issues:** RLS policies or bucket configuration problems

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

### **Task 1: Create Missing API Endpoint**

**File:** `/app/api/get-upload-url/route.ts`

**Implementation Requirements:**
- Accept `fileName` and `userId` as query parameters
- Generate Supabase signed URLs for delivery-dockets bucket
- Handle errors gracefully with proper HTTP status codes
- Return JSON with `{ success: boolean, signedUrl?: string, error?: string }`
- Set appropriate expiry time (1 hour recommended)

### **Task 2: Verify Supabase Storage Configuration**

**Check:**
- Bucket name: `delivery-dockets` exists
- RLS policies allow authenticated access
- File path format: `${userId}/${fileName}`
- Storage permissions are correctly configured

### **Task 3: Enhance Error Handling in SimpleResultsCard**

**Requirements:**
- Add comprehensive logging to `loadThumbnail` function
- Implement fallback behavior when signed URL fails
- Improve error messages for debugging
- Add retry logic for failed requests

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Step 1: API Route Implementation**
```typescript
// Required structure for /app/api/get-upload-url/route.ts
- Import createClient from Supabase utils
- Implement GET method with NextRequest/NextResponse
- Validate fileName and userId parameters
- Generate signed URL from delivery-dockets bucket
- Return structured JSON response
- Handle all error cases with proper status codes
```

### **Step 2: Debug Logging Enhancement**
```typescript
// Add to SimpleResultsCard loadThumbnail function
- Log request URL and parameters
- Log response status and data
- Log Supabase errors if any
- Add network error handling
- Implement graceful fallback display
```

### **Step 3: Testing & Validation**
```bash
# Test API endpoint directly
curl "http://localhost:3000/api/get-upload-url?fileName=test.jpg&userId=test123"

# Verify Supabase storage
# Check bucket exists and files are accessible
# Validate RLS policies allow read access
```

---

## 🔧 **DEBUGGING REQUIREMENTS**

### **Enhanced Logging**
Add detailed console logs to track:
- API request construction
- Response status and headers  
- Supabase signed URL generation
- Error messages and stack traces
- File existence verification

### **Fallback Behavior**
Implement robust fallbacks:
- Document icon when image loading fails
- Loading states during fetch operations
- Error messages for different failure types
- Retry mechanisms for transient failures

### **Validation Checks**
Verify each step:
- API endpoint exists and responds
- Supabase bucket configuration
- File path format matches database
- RLS policies allow access
- Signed URL generation works

---

## 🚀 **SUCCESS CRITERIA**

### **Must Work:**
1. ✅ API endpoint `/api/get-upload-url` responds with valid signed URLs
2. ✅ SimpleResultsCard displays thumbnail images successfully
3. ✅ Hover expansion and modal preview work
4. ✅ Error handling prevents crashes on failed loads
5. ✅ Loading states provide good UX during fetch operations

### **Testing Verification:**
1. Upload new delivery docket image
2. Verify image appears in SimpleResultsCard thumbnail
3. Test hover expansion functionality
4. Confirm modal preview opens correctly
5. Validate error handling with invalid file paths

---

## ⚠️ **SAFETY REQUIREMENTS**

### **Do NOT Break:**
- Existing upload functionality
- Database operations
- Other working components
- User authentication flows

### **Test Before Deploy:**
- Verify API endpoint with direct curl/browser test
- Test with existing uploaded files
- Confirm new uploads work end-to-end
- Validate error scenarios don't crash app

---

## 📊 **CURRENT DEBUG DATA**

**Working:** Image upload stores to database with correct path
**Failing:** Image retrieval for display in SimpleResultsCard
**Error:** 404/500 on `/api/get-upload-url` endpoint
**Data Available:** `image_path: "1756945774910-test168_IMG_3252.jpeg"`

---

## 🎯 **PRIORITY ORDER**

1. **HIGH PRIORITY:** Create `/api/get-upload-url/route.ts` endpoint
2. **MEDIUM PRIORITY:** Enhance error handling in SimpleResultsCard  
3. **LOW PRIORITY:** Add retry logic and improved UX

**EXECUTE IMMEDIATELY** - This is blocking core functionality testing!