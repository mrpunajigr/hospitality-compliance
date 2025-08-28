# Edge Function Test Commands

## Copy and paste these commands into your browser console at jigr.app

### Test 1: Database Connection Test
```javascript
fetch('/api/db-test', { method: 'POST' }).then(r => r.json()).then(data => console.log('🧪 DB TEST RESULT:', data))
```

### Test 2: Edge Function API Test
```javascript
const testData = new FormData()
testData.append('clientId', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
testData.append('userId', 'demo-user-id')
fetch('/api/test-bulk', { method: 'POST', body: testData }).then(r => r.json()).then(data => console.log('🧪 API TEST RESULT:', data))
```

### Test 3: Direct Edge Function Debug Test
```javascript
const debugData = new FormData()
debugData.append('clientId', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
debugData.append('userId', 'demo-user-id')
fetch('/api/debug-upload', { method: 'POST', body: debugData }).then(r => r.json()).then(data => console.log('🧪 DEBUG TEST RESULT:', data))
```

## Instructions:
1. Go to jigr.app (any page)
2. Open Developer Tools (F12 or Right-click → Inspect)  
3. Click "Console" tab
4. Copy and paste each command one at a time
5. Press Enter after each command
6. Screenshot the results and send them back

## What We're Looking For:

### ✅ SUCCESS Signs:
- Status 200 responses
- `success: true` in results
- Database records created
- Edge Function processes without "Function failed to start"

### ❌ FAILURE Signs:
- "Function failed to start (please check logs)"
- AWS credential error messages
- Status 500 errors
- Database constraint violations

### 🔍 AWS Credential Issues:
- "Missing region in config"
- "Unable to locate credentials" 
- "AWS credentials not found"
- "InvalidSignatureException"

Run these tests and we'll see exactly what's happening with your Edge Function!