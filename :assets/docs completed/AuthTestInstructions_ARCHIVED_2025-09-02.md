# 🔐 Authentication & Database Test Instructions

## Quick Test Commands

```bash
# Start development server
npm run dev

# Navigate to test page
# Go to: http://localhost:3000/upload/capture
```

## Test Procedure

### 1. Authentication Verification
- ✅ If you see "Not Authenticated", click "Quick Sign In (dev@jigr.app)" button
- ✅ Check that user email and ID display correctly after sign-in
- ✅ Confirm session status shows "authenticated"
- ✅ Verify no authentication errors in console

### 2. Database Write Test
- ✅ Click "Test Write" button
- ✅ Should show "✅ Write Success" status
- ✅ Check browser console for success logs

### 3. Database Read Test  
- ✅ Click "Test Read" button
- ✅ Should show "✅ Read Success" status
- ✅ Test record should display with:
  - Record ID
  - User ID (matches your auth)
  - Test message with timestamp
  - Created timestamp

### 4. Cleanup
- ✅ Click "Clear Test Data" to remove test records
- ✅ Verify test record disappears from display

## Expected Results

**Success Indicators:**
- 🟢 All buttons show green ✅ success states
- 🟢 Test record displays properly
- 🟢 No error messages appear
- 🟢 Console shows auth and database success logs

**If Tests Fail:**
- 🔴 Check browser console for detailed error messages
- 🔴 Verify user is signed in correctly
- 🔴 Check RLS policies allow read/write for current user
- 🔴 Confirm delivery_records table structure

## Test Component Location
- Component: `/app/components/auth/AuthDatabaseTest.tsx`
- Integration: `/app/upload/capture/page.tsx:630-632`
- Purpose: Verify core auth→database chain without AWS complexity

This foundation test confirms the authentication and database systems work properly before testing the full upload→AWS→extraction workflow.