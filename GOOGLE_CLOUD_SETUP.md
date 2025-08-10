# Google Cloud Document AI Setup Guide

## 🎯 Objective
Enable real OCR processing by fixing Google Cloud Document AI permissions. This will replace the current fallback with actual text extraction from delivery docket images.

## 📋 Prerequisites
- Google account with access to `hospitality-compliance-apps` project
- Project should already exist with service account created

## 🔧 Step-by-Step Setup

### **Step 1: Access Google Cloud Console**
1. **Open:** https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Select project:** `hospitality-compliance-apps` 
   - Look for the project dropdown at the top of the page
   - If you don't see it, click the project selector and search for "hospitality-compliance-apps"

### **Step 2: Enable Document AI API**
1. **Navigate to:** APIs & Services → Library
   - Left sidebar → "APIs & Services" → "Library"
2. **Search for:** "Document AI API"
3. **Click on:** "Cloud Document AI API" result
4. **Check status:**
   - ✅ If you see "DISABLE" button → API is already enabled
   - ⚠️ If you see "ENABLE" button → click it to enable

### **Step 3: Fix Service Account Permissions** ⚠️ **CRITICAL STEP**
1. **Navigate to:** IAM & Admin → IAM
   - Left sidebar → "IAM & Admin" → "IAM"

2. **Find the service account:** 
   - Look for: `delivery-docket-ai@hospitality-compliance-apps.iam.gserviceaccount.com`
   - Use Ctrl+F / Cmd+F to search for "delivery-docket-ai"

3. **Edit permissions:**
   - Click the **pencil/edit icon** next to the service account
   - Click **"+ ADD ANOTHER ROLE"**
   
   **Option A - Recommended for production:**
   - Search: "Document AI API User"
   - Select: `Document AI API User`
   - Click **"+ ADD ANOTHER ROLE"** again
   - Search: "Document AI Editor" 
   - Select: `Document AI Editor`
   
   **Option B - Simplest for testing:**
   - Search: "Owner"
   - Select: `Owner` (gives full project access)

4. **Click "SAVE"**

### **Step 4: Verify Document AI Processor**
1. **Navigate to:** Document AI → Processors
   - Left sidebar → search for "Document AI" → "Document AI"

2. **Look for processor:**
   - You should see a processor listed
   - **Processor ID should match:** `fd339ffae1a8b4cf`

3. **Check status:**
   - Status should show: **"ENABLED"** ✅
   - Type should be: "Document OCR" or "Form Parser"

4. **Optional test:**
   - Click on the processor
   - Try uploading a sample document to verify it works

### **Step 5: Confirm Billing**
1. **Navigate to:** Billing
   - Left sidebar → "Billing"

2. **Check status:**
   - Should show an active billing account
   - Should not show any warnings about billing

## ✅ Success Checklist

After completing all steps, you should have:

- [ ] Document AI API is enabled
- [ ] Service account `delivery-docket-ai@...` has Document AI permissions
- [ ] Processor `fd339ffae1a8b4cf` shows "ENABLED" status
- [ ] Billing account is active and linked

## 🧪 Testing Real OCR

Once permissions are fixed, test the functionality:

1. **Go to:** Your app upload page (`/workspace/upload`)
2. **Toggle:** TEST mode ON (yellow toggle)
3. **Upload:** A photo of a delivery docket
4. **Expect:** Real OCR processing instead of demo fallback
5. **Check:** Dashboard shows actual extracted data:
   - 📦 Real supplier name (not "Demo Supplier")
   - 📅 Actual delivery date from document
   - 🌡️ Real temperature readings from document
   - 👤 Your user name
   - 🧪 TEST badge (if test mode was on)

## 🔍 Troubleshooting

### Common Issues:

**"Permission denied" errors:**
- Double-check service account has Document AI roles
- Try adding "Owner" role temporarily for testing

**"Processor not found" errors:**
- Verify processor ID: `fd339ffae1a8b4cf`
- Check processor is in "ENABLED" state

**"Billing required" errors:**
- Ensure billing account is linked and active
- Document AI has usage costs (small for testing)

**"API not enabled" errors:**
- Go back to APIs & Services → Library
- Search and enable "Cloud Document AI API"

## 📊 Expected Results

### Before Fix (Current):
```
📦 Demo Supplier
📅 Delivered: [today's date]
🌡️ No temperatures detected  
👤 Uploaded by: Demo User
```

### After Fix (Goal):
```
📦 Fresh Produce Co.
📅 Delivered: 2024-08-09
🌡️ Temperatures: 3.2°C, -18.5°C, 22°C
👤 Uploaded by: [your name]
🧪 TEST
```

## 🆘 If You Get Stuck

Most common solution: **Service account permissions**
- 90% of OCR issues are IAM permission problems
- Try adding "Owner" role as quick test
- Document AI roles: `documentai.apiUser` + `documentai.editor`

## 🎉 Success Indicators

You'll know it's working when:
1. Upload doesn't show "OCR authentication error" 
2. Dashboard displays real supplier names from your documents
3. Temperature readings match what's actually on the delivery docket
4. Processing time is reasonable (5-15 seconds)

---

**Good luck! The infrastructure is 100% ready - just need those Google Cloud permissions! 🚀**