# Email Verification + Onboarding Testing Guide

## 🧪 Complete Local Testing Plan

### **Prerequisites**
- Development server running: `npm run dev`
- Supabase local development running (if using local DB)
- Email configuration set up in `.env.local`

---

## **Phase 1: API Endpoint Testing**

### 1.1 Test Email Verification API
```bash
# Test GET endpoint for instructions
curl http://localhost:3000/api/verify-email

# Test POST with dummy token (should fail gracefully)
curl -X POST http://localhost:3000/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "dummy-token-for-testing"}'
```

### 1.2 Test Resend Verification API
```bash
# Test GET endpoint for instructions
curl http://localhost:3000/api/resend-verification

# Test POST with email (will only work if user exists in profiles table)
curl -X POST http://localhost:3000/api/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 1.3 Test Email Sending API
```bash
# Test basic email API
curl http://localhost:3000/api/send-email

# Test direct email endpoint (restored for testing)
curl -X POST http://localhost:3000/api/test-direct-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "mrpuna+bistro50@gmail.com"}'
```

---

## **Phase 2: Email Template Testing**

### 2.1 Test New Verification Email Template
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "mrpuna+bistro50@gmail.com",
    "subject": "Test Verification Email",
    "data": {
      "verificationToken": "test123456789abcdef",
      "verificationUrl": "http://localhost:3000/admin/profile?verify=test123456789abcdef&onboarding=true",
      "userFullName": "Test User",
      "companyName": "Test Company"
    }
  }'
```

**Expected Result:**
- Beautiful HTML email with verification button
- Link points to profile page with onboarding
- No temporary password mentioned
- 24-hour expiration notice

### 2.2 Test Fallback Email Template
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-real-email@example.com",
    "subject": "Test Fallback Email",
    "data": {
      "userFullName": "Test User",
      "companyName": "Test Company"
    }
  }'
```

**Expected Result:**
- Simple HTML email without verification components
- Fallback message about verification email

---

## **Phase 3: Profile Page Onboarding Testing**

### 3.1 Test Basic Profile Page
**Visit:** `http://localhost:3000/admin/profile`

**Expected:**
- Normal profile page without onboarding elements
- All existing functionality preserved

### 3.2 Test Onboarding Mode
**Visit:** `http://localhost:3000/admin/profile?onboarding=true`

**Expected:**
- Progress indicator showing "Your Profile" step
- Additional sections appear:
  - Business Information (Business Type dropdown)
  - Notification Preferences (Email alerts checkboxes)
- "Complete Setup" button instead of "Save Changes"

### 3.3 Test Onboarding Form Fields
**Fill out and test:**
- **Preferred Name:** "Test User"
- **Job Title:** "Restaurant Owner"  
- **Business Type:** Select "🍽️ Restaurant"
- **Notification Preferences:** 
  - ✅ Email alerts for compliance violations
  - ✅ Weekly compliance reports
  - ❌ Daily reminders

**Click:** "Complete Setup"

**Expected:**
- Success message
- Data saved to profiles table
- Redirect to `/admin/console` (if onboarding)

---

## **Phase 4: Email Verification Flow Testing**

### 4.1 Test Verification with Dummy Token
**Visit:** `http://localhost:3000/admin/profile?verify=dummy-token-12345&onboarding=true`

**Expected:**
- Verification attempt occurs automatically
- Error message: "Invalid or expired verification token"
- Profile page still loads in onboarding mode

### 4.2 Test Verification Status Display
**With unverified email:**
- Orange warning card appears
- "Email Verification Required" message
- "Resend Email" button present

**With verified email:**
- Green success card appears
- "Email Verified!" message
- No resend button
- Green checkmark next to email field

### 4.3 Test Resend Verification Button
**Click:** "Resend Email" button

**Expected:**
- AJAX request to `/api/resend-verification`
- Success/error alert message
- New verification email sent (if user exists)

---

## **Phase 5: Complete Company Creation Flow**

### 5.1 Test Company Creation API
```bash
curl -X POST http://localhost:3000/api/create-company \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Restaurant Ltd",
    "businessType": "restaurant",
    "phone": "+64 21 123 4567",
    "userId": "test-user-id-12345",
    "email": "owner@testrestaurant.co.nz",
    "fullName": "Test Owner",
    "position": "Owner"
  }'
```

**Expected Response:**
- `success: true`
- `verificationEmailSent: true`
- Company created in database
- Verification token generated
- Email sent with verification link

### 5.2 Test Database Tables
**Check new tables exist:**
```sql
-- In Supabase dashboard or local DB
SELECT * FROM email_verification_tokens;
SELECT email_verified, job_title, preferred_name, notification_preferences FROM profiles;
SELECT business_type FROM clients;
```

---

## **Phase 6: Integration Testing Scenarios**

### Scenario A: New User Complete Flow
1. **Signup** via company creation
2. **Receive** verification email
3. **Click** verification link
4. **Land** on profile page in onboarding mode
5. **Complete** profile fields
6. **Save** and redirect to console
7. **Verify** all data saved correctly

### Scenario B: Resend Verification Flow
1. **User** doesn't receive email
2. **Visit** profile page (shows unverified status)
3. **Click** "Resend Email"
4. **Receive** new verification email
5. **Complete** verification process

### Scenario C: Existing User Profile Enhancement
1. **Existing user** visits profile
2. **See** enhanced fields (job title, preferred name)
3. **Fill out** additional information
4. **Save** successfully

---

## **Testing Checklist**

### ✅ API Endpoints
- [ ] `/api/verify-email` GET/POST working
- [ ] `/api/resend-verification` GET/POST working  
- [ ] `/api/send-email` new template working
- [ ] `/api/create-company` generates tokens

### ✅ Email Templates
- [ ] Verification email has beautiful HTML
- [ ] Verification link format correct
- [ ] No temporary password references
- [ ] Fallback template works

### ✅ Profile Page
- [ ] Onboarding mode displays correctly
- [ ] Progress indicator shows
- [ ] Business type dropdown works
- [ ] Notification preferences save
- [ ] Verification status displays
- [ ] Resend button functions

### ✅ Database Integration
- [ ] Verification tokens table created
- [ ] Profile fields updated (job_title, etc.)
- [ ] Email verification status tracked
- [ ] Business type saved to clients table

### ✅ User Experience
- [ ] Complete signup → verification → onboarding flow
- [ ] Error handling graceful
- [ ] Success messages clear
- [ ] Redirects work correctly

---

## **Troubleshooting Common Issues**

### Database Migration Issues
```bash
# If migration fails, try:
npx supabase db reset --debug
```

### Email Not Sending
- Check `.env.local` has `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS`
- Verify Resend API key is valid
- Check console logs for email API errors

### Verification Token Issues
- Tokens expire after 24 hours
- Check database for token creation
- Verify token format (64 hex characters)

### Profile Page Issues
- Check browser console for JavaScript errors
- Verify all required imports present
- Test with demo user if authentication fails

---

## **Success Criteria**

The system is working correctly when:
1. **New users** receive verification emails instead of temp passwords
2. **Verification links** land on profile page with onboarding
3. **Profile page** shows all onboarding components in onboarding mode
4. **Email verification** updates database correctly
5. **Onboarding completion** saves all profile data
6. **Existing functionality** remains unaffected
7. **Error handling** is graceful and informative

---

## **Next Steps After Testing**

If all tests pass:
1. Deploy database migration to production
2. Update environment variables
3. Test email delivery in production
4. Monitor user onboarding completion rates
5. Gather user feedback on new flow