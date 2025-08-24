# Google Cloud Authentication Troubleshooting

## 🔍 **Issue Identified:**
Screenshots show the system is still generating demo data with the message:
"NOTE: This is demo data due to OCR authentication issue"

Console shows: `Analytics APIs temporarily disabled to avoid 500 errors`

## ✅ **Environment Variable Status:**
```
GOOGLE_DOCUMENT_AI_PROCESSOR_ID │ 3640443ed736a53de12c57efea4362660fb94a1695a02082c4026abc704262f3
```
**Status**: ✅ Variable exists and appears to have correct format

## 🛠️ **Troubleshooting Steps:**

### **Step 1: Verify Edge Function Change**
Go to **Supabase Dashboard → Edge Functions → process-delivery-docket**

**Check that line 9 shows:**
```typescript
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID');
```

**If it still shows the old version:**
```typescript
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('DOCUMENT_AI_PROCESSOR_ID'); // ❌ Wrong
```

### **Step 2: Force Fresh Deployment**
1. Edit the Edge Function again
2. Add debugging to line 10:
```typescript
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID');
console.log('🔍 Processor ID loaded:', DOCUMENT_AI_PROCESSOR_ID ? `Found (${DOCUMENT_AI_PROCESSOR_ID.substring(0, 20)}...)` : '❌ Missing');
```
3. Click **Deploy**
4. Wait for deployment to complete

### **Step 3: Check Edge Function Logs**
After uploading a test document:
1. Go to **Supabase Dashboard → Edge Functions → Logs**
2. Look for the debug message: `🔍 Processor ID loaded: Found (...)`
3. Look for any authentication error messages
4. Check for Google Cloud API response errors

### **Step 4: Test Upload After Changes**
1. Upload a new delivery docket 
2. Check if the console log shows: `🔍 Processor ID loaded: Found`
3. Verify if OCR processing succeeds or falls back to demo

### **Step 5: Alternative Diagnostic**
If the above doesn't work, add more detailed logging to the processWithDocumentAI function around line 243:

```typescript
console.log('🔍 GOOGLE_CREDENTIALS available:', !!GOOGLE_CREDENTIALS);
console.log('🔍 DOCUMENT_AI_PROCESSOR_ID available:', !!DOCUMENT_AI_PROCESSOR_ID);
console.log('🔍 Processor ID value:', DOCUMENT_AI_PROCESSOR_ID);
```

## 🎯 **Expected Success Indicators:**

After fixing, you should see in the logs:
- ✅ `🔍 Processor ID loaded: Found (3640443ed736a53de12...)`
- ✅ `Real OCR processing successful`
- ✅ `Document AI response received successfully`

And in the training interface:
- ✅ Actual text from your Gilmours document
- ✅ Real supplier names and data
- ✅ No more "demo data due to OCR authentication issue"

## 🚨 **Common Issues:**

1. **Cached Function**: Old version still running - force redeploy
2. **Environment Variable**: Wrong name or missing value
3. **Google Cloud Permissions**: Service account lacks Document AI permissions
4. **API Quota**: Google Cloud API quota exceeded (check Google Cloud Console)

## 📋 **Next Steps:**
Try Step 1 first, then proceed through steps if issue persists. The debug logging will help identify exactly where the authentication is failing.