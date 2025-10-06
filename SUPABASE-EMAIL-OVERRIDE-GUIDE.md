# 🚀 Supabase Email Override Implementation Guide

## Goal: Route ALL auth emails through JiGR branded Resend system

Currently: Supabase sends plain auth emails  
After: All emails use JiGR branding with cafe background and logo

---

## 📋 **Step 1: Configure Supabase SMTP Settings**

1. **Go to Supabase Dashboard**
   - Navigate to your project dashboard
   - Click **Authentication** in sidebar
   - Click **Settings** tab

2. **Scroll to SMTP Settings**
   - Find "SMTP Settings" section  
   - Click **"Enable custom SMTP"**

3. **Enter Resend SMTP Configuration**
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Pass: [Your Resend API Key - starts with re_]
   Sender Email: dev@jigr.app
   Sender Name: JiGR Hospitality Compliance
   ```

4. **Save SMTP Settings**

---

## 📧 **Step 2: Update Email Templates**

### 2.1 Confirm Signup Template

1. In Supabase Dashboard, go to **Authentication > Email Templates**
2. Click **"Confirm signup"**
3. **Enable custom template**
4. **Subject line:** `Welcome to JiGR - Confirm Your Account`
5. **Copy and paste** the contents of `supabase-email-templates/confirm-signup.html`

### 2.2 Reset Password Template  

1. Click **"Reset password"**
2. **Enable custom template**
3. **Subject line:** `Reset Your JiGR Password`  
4. **Copy and paste** the contents of `supabase-email-templates/password-reset.html`

### 2.3 Magic Link Template (Optional)

1. Click **"Magic Link"**
2. **Enable custom template**
3. **Subject line:** `Sign in to JiGR`
4. Use the same HTML as confirm signup, but change:
   - "Welcome to JiGR!" → "Sign in to JiGR"
   - "Confirm Email & Get Started" → "Sign In to JiGR"

---

## 🧪 **Step 3: Test the Override**

### Test Password Reset:
1. Go to your JiGR login page
2. Click "Forgot Password" 
3. Enter your email address
4. Check your email - should now have JiGR branding!

### Test New User Signup:
1. Create a test account with a new email
2. Check confirmation email - should have JiGR welcome design

### Test Magic Link:
1. Use passwordless login if enabled
2. Check magic link email format

---

## ✅ **Expected Results**

**Before Override:**
- Plain Supabase branded emails
- Generic styling
- "noreply@mail.app.supabase.co" sender

**After Override:**  
- ✅ Beautiful JiGR branded emails
- ✅ Cafe glasses background with logo
- ✅ "dev@jigr.app" sender address
- ✅ Professional hospitality messaging
- ✅ Mobile-responsive design
- ✅ Consistent with all other JiGR emails

---

## 🔧 **Troubleshooting**

### Email Not Sending:
- Check Resend API key is correct in SMTP settings
- Verify Resend domain is properly configured
- Check Supabase logs for SMTP errors

### Wrong Branding:
- Ensure custom templates are **enabled** in each email type
- Clear browser cache and test again
- Check template HTML was pasted correctly

### Template Variables Not Working:
- Supabase uses Go template syntax: `{{ .Email }}`, `{{ .ConfirmationURL }}`
- Don't modify the `{{ }}` template variables
- Only modify the HTML around them

---

## 📊 **Monitoring**

After implementation:
1. **Resend Dashboard**: Monitor email delivery rates  
2. **Supabase Auth Logs**: Check for any SMTP errors
3. **User Feedback**: Confirm emails are received and look professional

---

## 🎯 **Success Criteria**

✅ All auth emails sent via Resend (check Resend dashboard)  
✅ JiGR branding appears in all emails  
✅ No "Supabase" branding visible to users  
✅ Template variables populate correctly  
✅ Email delivery rates remain high (>95%)  
✅ Mobile display looks professional  

---

## 🔄 **Rollback Plan**

If issues occur:
1. Go to **Authentication > Settings**
2. **Disable custom SMTP**
3. Templates revert to Supabase defaults
4. Emails resume normal delivery

---

## 📞 **Support**

- **Resend Issues**: Check [resend.com/docs](https://resend.com/docs)
- **Supabase SMTP**: Check [supabase.com/docs/guides/auth/auth-smtp](https://supabase.com/docs/guides/auth/auth-smtp)
- **Template Variables**: [supabase.com/docs/guides/auth/auth-email-templates](https://supabase.com/docs/guides/auth/auth-email-templates)

**Ready to implement? The templates are generated and waiting! 🚀**