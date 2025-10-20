# Fix Client ID Issue

## 🔍 Find Valid Client ID

Run this in Supabase SQL Editor to see what clients exist:

```sql
-- Check all existing clients
SELECT id, name, created_at FROM clients ORDER BY created_at DESC;
```

## 🛠️ Update Hook with Valid Client ID

Once you see the client list, I need to update the configuration page to use a valid client ID.

Based on our previous session, valid client IDs were:
- `dcea74d0-a187-4bfc-a55c-50c6cd8cf76c` (Corellis 83)
- `1709ff53-19e1-4915-a3ea-a7377c62a40b` (Beach Bistro)
- `bd784b9b-43d3-4a03-8d31-3483ba53cc22` (Beach Bistro1)
- `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` (Demo Restaurant)

Please run the query and tell me which client ID to use!