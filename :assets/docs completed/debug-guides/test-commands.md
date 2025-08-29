# Database Test Commands

## Test Foreign Key Fix
Copy and paste this entire command into the browser console on jigr.app:

```javascript
fetch('/api/disable-rls', { method: 'POST' }).then(r => r.json()).then(data => console.log('FOREIGN KEY FIX RESULT:', data))
```

## Test RLS Disable (Previous)
```javascript
fetch('/api/disable-rls', { method: 'POST' }).then(r => r.json()).then(data => console.log('DISABLE RLS RESULT:', data))
```

## Previous Test Commands

### Test Database Connection
```javascript
fetch('/api/db-test', { method: 'POST' }).then(r => r.json()).then(data => console.log('DB TEST RESULT:', data))
```

### Test Environment Variables
```javascript
fetch('/api/env-test').then(r => r.json()).then(data => console.log('ENV TEST RESULT:', data))
```

### Test RLS Fix (Previous attempt)
```javascript
fetch('/api/fix-rls', { method: 'POST' }).then(r => r.json()).then(data => console.log('RLS FIX RESULT:', data))
```

## Instructions
1. Go to jigr.app (any page)
2. Open Developer Tools (F12)
3. Click "Console" tab
4. Copy and paste the command
5. Press Enter
6. Screenshot the result and send it back