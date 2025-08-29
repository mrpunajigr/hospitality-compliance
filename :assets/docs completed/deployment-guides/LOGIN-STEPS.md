# 🔑 Supabase CLI Login - Exact Steps

## Step 1: Run Login Command in Terminal
In your terminal (where you see `bash-3.2$`), type this command:
```bash
npx supabase login
```

## Step 2: What Will Happen
1. **Your web browser will automatically open** 
2. **You'll see a Supabase login page** in the browser
3. **Login with your normal Supabase credentials** (the same ones you use for dashboard)
4. **Browser will show "Success" message**
5. **Terminal will show "Logged in successfully"**

## Step 3: Where to Login
The browser will open to something like:
- `https://supabase.com/dashboard/sign-in` 
- OR it might go directly to an OAuth page

**Use the SAME email/password you use to access:**
- https://supabase.com/dashboard

## Step 4: After Successful Login
The terminal will show something like:
```
✅ Logged in successfully
```

## Step 5: Then Deploy
```bash
npx supabase functions deploy process-delivery-docket --project-ref jyxypcyrtdpqgapnkhec
```

## Summary
- ✅ **Command**: `npx supabase login`
- ✅ **Browser opens automatically** - you don't need to go anywhere
- ✅ **Login**: Use your normal Supabase dashboard credentials
- ✅ **Result**: CLI gets authenticated to deploy

**Just run `npx supabase login` in your terminal - the browser will open automatically!**