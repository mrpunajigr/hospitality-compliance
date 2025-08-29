# Upload Test Debug Steps

## Quick Test Commands for Browser Console

Copy and paste this into your browser console at jigr.app to test specific components:

### 1. Test Database Connection
```javascript
fetch('/api/db-test', { method: 'POST' }).then(r => r.json()).then(data => console.log('DB TEST:', data))
```

### 2. Test Upload API Direct
```javascript
// Create a simple test
const testData = new FormData()
testData.append('clientId', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
testData.append('userId', 'demo-user-id')

fetch('/api/test-bulk', { method: 'POST', body: testData }).then(r => r.json()).then(data => console.log('API TEST:', data))
```

### 3. Check Edge Function Status  
```javascript
fetch('/api/debug-upload', { 
  method: 'POST', 
  body: new FormData() 
}).then(r => r.json()).then(data => console.log('EDGE FUNCTION STATUS:', data))
```

## What to Look For:

### SUCCESS Indicators:
- ✅ Status 200 responses
- ✅ "success: true" in responses  
- ✅ Edge Function shows AWS processing
- ✅ Database records created

### FAILURE Indicators:
- ❌ "Function failed to start"
- ❌ AWS credential errors
- ❌ Status 500 errors
- ❌ Database constraint violations

## Next Steps Based on Results:
1. If DB test fails → Database issue
2. If API test fails → API configuration issue  
3. If Edge Function fails → AWS credential issue still exists
4. If all pass but upload fails → File processing issue