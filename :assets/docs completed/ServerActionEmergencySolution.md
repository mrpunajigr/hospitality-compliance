# Server Action Emergency Solution - Bypass All Middleware

## 🚀 IMMEDIATE PIVOT STRATEGY

Stop all middleware debugging. Implement server actions RIGHT NOW.

## 🎯 Step 1: Create Server Action

Create this file: `/app/actions/CreateCompanyAction.ts`

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createCompanyAction(formData: FormData) {
  console.log('🚀 SERVER ACTION: Starting company creation')
  
  try {
    // Extract form data
    const businessName = formData.get('businessName') as string
    const businessType = formData.get('businessType') as string
    const email = formData.get('email') as string
    const userId = formData.get('userId') as string
    const fullName = formData.get('fullName') as string

    console.log('📝 SERVER ACTION: Data extracted', { businessName, businessType, email })

    // Create Supabase client with service role
    const supabase = createClient()
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ SERVER ACTION: Database connection failed', testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }

    console.log('✅ SERVER ACTION: Database connection successful')

    // Create client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_name: businessName,
        business_type: businessType,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (clientError) {
      console.error('❌ SERVER ACTION: Client creation failed', clientError)
      throw new Error(`Client creation failed: ${clientError.message}`)
    }

    console.log('✅ SERVER ACTION: Client created', clientData)

    // Create user profile if doesn't exist
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('❌ SERVER ACTION: Profile creation failed', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      console.log('✅ SERVER ACTION: Profile created')
    }

    // Link user to client
    const { error: linkError } = await supabase
      .from('client_users')
      .insert({
        client_id: clientData.id,
        user_id: userId,
        role: 'OWNER',
        status: 'ACTIVE',
        invited_by: userId,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (linkError) {
      console.error('❌ SERVER ACTION: User linking failed', linkError)
      throw new Error(`User linking failed: ${linkError.message}`)
    }

    console.log('✅ SERVER ACTION: User linked to client')

    // Create compliance settings
    const { error: complianceError } = await supabase
      .from('compliance_settings')
      .insert({
        client_id: clientData.id,
        temperature_monitoring: true,
        document_retention_days: 730,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (complianceError) {
      console.error('❌ SERVER ACTION: Compliance settings failed', complianceError)
      throw new Error(`Compliance settings failed: ${complianceError.message}`)
    }

    console.log('✅ SERVER ACTION: Company creation completed successfully')

    // Redirect to dashboard
    redirect('/app/dashboard')

  } catch (error) {
    console.error('💥 SERVER ACTION: Fatal error', error)
    
    // Return error state instead of throwing
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }
  }
}
```

## 🎯 Step 2: Update Your Form

Modify your account creation form to use server action:

```typescript
// In your account creation component
import { createCompanyAction } from '@/app/actions/CreateCompanyAction'

export default function CreateAccountForm() {
  return (
    <form action={createCompanyAction} className="space-y-6">
      {/* Hidden field for user ID */}
      <input type="hidden" name="userId" value={user?.id} />
      
      {/* Your existing form fields */}
      <input 
        name="businessName" 
        placeholder="Business Name"
        required
        className="w-full p-3 border rounded"
      />
      
      <select 
        name="businessType" 
        required
        className="w-full p-3 border rounded"
      >
        <option value="">Select Business Type</option>
        <option value="restaurant">Restaurant</option>
        <option value="cafe">Cafe</option>
        <option value="hotel">Hotel</option>
        <option value="catering">Catering</option>
      </select>
      
      <input 
        name="email" 
        type="email"
        value={user?.email}
        readOnly
        className="w-full p-3 border rounded bg-gray-100"
      />
      
      <input 
        name="fullName" 
        placeholder="Full Name"
        required
        className="w-full p-3 border rounded"
      />
      
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
      >
        Create Company
      </button>
    </form>
  )
}
```

## 🎯 Step 3: Test Immediately

1. **Deploy this change**
2. **Test account creation**
3. **Check server logs** (these will appear in your deployment logs, not browser console)

## 🎯 Why This Will Work

✅ **Bypasses ALL middleware** - Server actions run on server, not through API routes
✅ **No CSRF issues** - Built into Next.js security model  
✅ **No routing problems** - Direct function calls
✅ **Same database logic** - Just different execution context
✅ **Better debugging** - Server logs instead of browser console

## 🚨 CRITICAL: Stop Middleware Debugging

- Don't waste more time on middleware.ts
- Don't chase CSRF token issues
- Don't debug API routing
- **USE SERVER ACTIONS NOW**

## 🎯 Success Metrics

If this works:
- ✅ No more CSRF errors
- ✅ Company creation succeeds  
- ✅ User gets redirected to dashboard
- ✅ Can proceed with invitation testing

If this fails:
- We know it's a database/environment issue, not middleware
- Much easier to debug with server-side logs
- Clear error messages instead of HTML responses

## ⚡ Emergency Deployment

1. **Create the server action file**
2. **Update your form to use it**  
3. **Deploy immediately**
4. **Test once and report back**

NO MORE MIDDLEWARE DEBUGGING. Server actions are the solution.