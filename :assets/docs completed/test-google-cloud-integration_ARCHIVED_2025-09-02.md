# Test Google Cloud Document AI Integration

## Summary of Fixes Made

### ✅ 1. Enhanced Credentials Validation
- Added detailed logging for all three required secrets
- Validates JSON format of GOOGLE_CREDENTIALS
- Checks for required fields (client_email, private_key, private_key_id)
- Reports specific missing credentials

### ✅ 2. Comprehensive Error Logging  
- Logs each step of Google Cloud authentication process
- Captures detailed API error responses
- Logs JWT creation, access token retrieval, and API call status
- Enhanced fallback messaging clearly identifies demo vs real data

### ✅ 3. Fixed Response Format
- Edge Function now returns `data.data` field expected by frontend
- Added `extractionSource` field to identify data source
- Added `wasRealExtraction` boolean for clear identification

## Testing Protocol

### Step 1: Deploy Updated Function
```bash
# Deploy the enhanced Edge Function
npx supabase functions deploy process-delivery-docket
```

### Step 2: Check Credentials
```bash
# Verify all secrets are set
npx supabase secrets list

# Should show:
# GOOGLE_CREDENTIALS
# GOOGLE_PROJECT_ID  
# GOOGLE_PROCESSOR_ID
```

### Step 3: Test with Real Image
1. **Start development server**: `npm run dev`
2. **Navigate to**: `http://localhost:3000/capture`
3. **Upload a real delivery docket image** (JPG or PNG)
4. **Check browser console** for detailed logs
5. **Check database record** for extracted data

### Step 4: Analyze Results

#### Success Indicators:
- ✅ Browser console shows: "✅ Access token obtained successfully"
- ✅ Browser console shows: "📡 Google Cloud API Response Status: 200 OK"
- ✅ Database record contains actual extracted text (not demo data)
- ✅ Supplier name, date, and temperature extracted from real document
- ✅ `extractionSource` field shows "Google Cloud Document AI"

#### Failure Indicators:  
- ❌ Browser console shows: "❌ Missing Google Cloud credentials"
- ❌ Browser console shows: "❌ Failed to parse Google Cloud credentials JSON"
- ❌ Browser console shows: "📡 Google Cloud API Response Status: 4xx/5xx"
- ❌ Database record contains demo data ("Kitchen Direct Ltd", etc.)
- ❌ `extractionSource` field shows "Demo Data (Google Cloud Failed)"

## Debugging Based on Results

### If Missing Credentials:
```bash
# Example - replace with your actual values
npx supabase secrets set GOOGLE_PROJECT_ID='your-project-id'
npx supabase secrets set GOOGLE_PROCESSOR_ID='your-processor-id'
npx supabase secrets set GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"..."}' 
```

### If Invalid JSON:
- Check that GOOGLE_CREDENTIALS is properly escaped JSON
- Verify service account key contains all required fields
- Ensure no trailing commas or syntax errors

### If Authentication Fails:
- Verify service account has Document AI API access
- Check that Document AI API is enabled in Google Cloud Console
- Confirm processor ID matches an active processor

### If API Call Fails:
- Check Google Cloud Console for API quota limits
- Verify processor is in the correct location (us, eu, etc.)
- Confirm file format is supported (JPEG, PNG, PDF)

## Expected Real vs Demo Data

### Real Extraction Success:
```json
{
  "supplier_name": "Actual Supplier Name from Document",
  "delivery_date": "2025-08-30", 
  "raw_extracted_text": "Actual OCR text from Google Cloud...",
  "extractionSource": "Google Cloud Document AI"
}
```

### Demo Data Fallback:
```json
{
  "supplier_name": "Kitchen Direct Ltd",
  "delivery_date": "2025-09-01",
  "raw_extracted_text": "DEMO DATA: Google Cloud extraction failed...",
  "extractionSource": "Demo Data (Google Cloud Failed)"
}
```

## Final Validation

After testing, you should be able to confirm:

1. **✅ Credentials are properly configured** - No missing secrets errors
2. **✅ Authentication works** - JWT and access token obtained  
3. **✅ API call succeeds** - 200 status response from Google Cloud
4. **✅ Real data extracted** - Actual document text, not demo data
5. **✅ Frontend displays correctly** - DeliveryDocketCard shows real information

If any step fails, the enhanced logging will pinpoint exactly where the issue occurs, making it easy to resolve the specific problem blocking Google Cloud integration.