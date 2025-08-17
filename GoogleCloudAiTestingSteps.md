# Google Cloud AI Upload System - Testing Protocol

## Executive Summary
This document provides comprehensive testing steps for the Google Cloud AI document processing system that was deployed to production. Follow these steps systematically to validate core functionality.

## Pre-Testing Verification

### Deployment Status ✅ COMPLETED
- **Build Status**: Successfully compiled with no TypeScript errors
- **Deployment**: Pushed to Vercel production (commit: cf80e83f)
- **New API Routes**: health-check, get-upload-url, create-delivery-record
- **Architecture**: Direct Supabase uploads bypass Vercel 4.5MB limit

### System Architecture Overview
1. **Frontend Upload**: User selects files via enhanced upload interface
2. **Step 1**: Request signed URL from `/api/get-upload-url`
3. **Step 2**: Direct browser-to-Supabase storage upload
4. **Step 3**: Create database record via `/api/create-delivery-record`
5. **Step 4**: Google Cloud AI processes document from Supabase storage
6. **Step 5**: Return structured compliance data to frontend

---

## Testing Steps

### 🔍 Test 1: Environment Health Check
**Purpose**: Verify new API routes are deployed and environment variables are configured

**URL (Copy/Paste Ready)**:
```
https://hospitality-compliance.vercel.app/api/health-check
```

**Expected Result**:
- ✅ **Success**: JSON response with environment status
- ❌ **Failure**: 404 error (indicates deployment failed)

**Sample Success Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-17T11:48:30.000Z",
  "environment": "production",
  "checks": {
    "supabase": {
      "connection": true,
      "url": "configured"
    },
    "googleCloud": {
      "credentials": true,
      "projectId": "configured"
    }
  }
}
```

**Test Result**: [ ] Pass [ ] Fail  
**Notes**: _______________________

---

### 🏠 Test 2: Dashboard Access & Navigation
**Purpose**: Verify demo authentication and dashboard functionality

**URL (Copy/Paste Ready)**:
```
https://hospitality-compliance.vercel.app/console/dashboard
```

**Expected Behavior**:
1. ✅ Page loads without sign-in requirement (demo mode active)
2. ✅ Dashboard displays with navigation tabs: Dashboard | Upload | Reports
3. ✅ Quick Actions panel visible with upload options
4. ✅ No React crashes or error messages in console

**Test Result**: [ ] Pass [ ] Fail  
**Notes**: _______________________

---

### 📤 Test 3: Upload Interface Access
**Purpose**: Verify upload tab functionality and UI components

**Steps**:
1. Navigate to dashboard (from Test 2)
2. Click "Upload" tab in navigation
3. Verify upload modal/interface appears

**Expected Result**:
- ✅ Upload interface loads successfully
- ✅ "Upload Delivery Dockets" dialog appears
- ✅ File selection area with drag & drop functionality
- ✅ "Add More Files" and "Upload & Process" buttons visible

**Test Result**: [ ] Pass [ ] Fail  
**Notes**: _______________________

---

### 🔄 Test 4: File Upload Process (Core Test)
**Purpose**: Test complete upload workflow with Google Cloud AI processing

**Prerequisites**: Have a delivery docket image ready (PDF or image file)

**Steps**:
1. Click "Add More Files" or drag & drop a delivery docket
2. Select a delivery docket image/PDF file
3. Verify file appears in upload queue
4. Click "Upload & Process" button
5. Monitor progress indicators

**Expected Workflow**:
1. ✅ **File Selection**: File appears in upload queue with preview
2. ✅ **Upload Progress**: Progress bar shows upload to Supabase storage
3. ✅ **Processing Indicator**: "Processing with Google Cloud AI" message
4. ✅ **Results Display**: Structured compliance data appears

**Expected Processing Results**:
- **Supplier Information**: Company name, contact details
- **Delivery Details**: Date, time, temperature readings
- **Compliance Status**: Temperature violations, alerts
- **Product Information**: Items delivered, quantities

**Success Indicators**:
- ✅ No 413 "Content Too Large" errors
- ✅ Upload completes to Supabase storage
- ✅ Google Cloud AI returns structured data
- ✅ Results display in user-friendly format

**Test Result**: [ ] Pass [ ] Fail  
**Notes**: _______________________

---

### 📊 Test 5: Results Display & Data Quality
**Purpose**: Verify Google Cloud AI extraction quality and UI presentation

**Expected Data Extraction**:
- **Company Information**: Accurate supplier name and details
- **Temperature Data**: Correct temperature readings and compliance status
- **Product Details**: Accurate item identification and quantities
- **Date/Time**: Correct delivery timestamp extraction

**UI Verification**:
- ✅ Results display in organized format
- ✅ Temperature violations highlighted appropriately
- ✅ Data is readable and properly formatted
- ✅ No display errors or missing information

**Test Result**: [ ] Pass [ ] Fail  
**Notes**: _______________________

---

## Troubleshooting Guide

### Health Check Returns 404
**Symptoms**: API health check returns 404 error
**Cause**: Deployment failed or API routes not built
**Solution**: Check Vercel deployment logs, re-deploy if necessary

### Upload Fails with 413 Error
**Symptoms**: "Content Too Large" error during upload
**Cause**: Direct Supabase upload not working, falling back to API route
**Solution**: Check signed URL generation and Supabase configuration

### Google Cloud AI Processing Fails
**Symptoms**: Upload succeeds but no AI results returned
**Cause**: Google Cloud credentials or API configuration issue
**Solution**: Verify environment variables and Google Cloud AI API access

### Dashboard Won't Load
**Symptoms**: Dashboard shows errors or crashes
**Cause**: React component errors or authentication issues
**Solution**: Check browser console for React errors

---

## Completion Checklist

### Core Functionality Tests
- [ ] Health check API returns JSON (not 404)
- [ ] Dashboard loads without authentication
- [ ] Upload interface accessible via navigation
- [ ] File upload completes successfully
- [ ] Google Cloud AI processing works
- [ ] Results display correctly

### Performance Verification
- [ ] Large files (>4MB) upload successfully
- [ ] Multiple file uploads work
- [ ] Processing times acceptable (<30 seconds)
- [ ] No memory leaks or performance issues

### Error Handling
- [ ] Invalid file types rejected gracefully
- [ ] Network errors handled appropriately
- [ ] Processing failures show clear error messages
- [ ] User can retry failed uploads

---

## Test Results Summary

**Date Tested**: _______________  
**Tester**: _______________  
**Overall Status**: [ ] All Tests Pass [ ] Issues Found  

**Issues Found**:
1. _______________________
2. _______________________
3. _______________________

**Next Steps**:
- [ ] All tests passed - mark document as COMPLETED
- [ ] Issues found - address before marking complete
- [ ] Archive document to `:assets/docs completed/` when finished

---

## Archive Protocol

When all tests pass and core functionality is verified:

1. **Tag Document**: Add `_COMPLETED_YYYY-MM-DD` to filename
2. **Move to Archive**: `:assets/docs completed/GoogleCloudAiTestingSteps_COMPLETED_2025-08-17.md`
3. **Update Archive Index**: Add entry to `:assets/docs completed/README.md`
4. **Git Commit**: "Archive completed Google Cloud AI testing protocol"

**Archive Ready**: [ ] Yes [ ] No - Pending: _______________

---

**Document Status**: 🔄 IN PROGRESS  
**Created**: 2025-08-17  
**Last Updated**: 2025-08-17  
**Version**: v1.0  

🤖 Generated with [Claude Code](https://claude.ai/code)