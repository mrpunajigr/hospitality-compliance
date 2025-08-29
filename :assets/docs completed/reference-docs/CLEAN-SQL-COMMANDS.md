# 🔒 Clean SQL Commands - Copy These Exactly

## Copy and paste ONLY these SQL commands (no markdown formatting):

### Command 1:
ALTER TABLE delivery_records FORCE ROW LEVEL SECURITY;

### Command 2:  
GRANT ALL ON delivery_records TO service_role;

### Command 3:
CREATE POLICY "Allow service role full access" ON delivery_records
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

## OR Alternative (Simple Fix):

### Simple Command:
ALTER TABLE delivery_records DISABLE ROW LEVEL SECURITY;

## Instructions:
1. Go to Supabase Dashboard → SQL Editor
2. Copy ONE command at a time (without the markdown)
3. Paste and run each command separately
4. Test upload after running the commands

**Don't copy the triple backticks (```) - those are just markdown formatting!**