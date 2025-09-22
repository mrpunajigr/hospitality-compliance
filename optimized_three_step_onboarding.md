# Optimized Three-Step Onboarding Flow - Claude Code Prompt

## 🎯 **Refined Onboarding Strategy**

Perfect approach! This three-step progression is actually more intuitive than complex multi-modal flows. Let's optimize it for maximum conversion while leveraging your existing app architecture.

---

## 📝 **Step 1: Minimal Signup (Landing Page)**

### **Required Fields (Clean & Simple):**
```typescript
interface MinimalSignup {
  companyName: string;        // "Fresh Valley Cafe"
  userFullName: string;       // "Sarah Thompson" 
  userEmail: string;          // "sarah@freshvalley.co.nz"
}
```

### **Form Design Optimizations:**
```html
<!-- Clean, single-column layout -->
<form class="MinimalSignupForm">
  <h2>Start Your Free Compliance Trial</h2>
  <p class="Subtitle">No credit card required • Ready in 60 seconds</p>
  
  <input 
    type="text" 
    placeholder="Your Business Name" 
    class="SignupInput"
    autoComplete="organization"
  />
  
  <input 
    type="text" 
    placeholder="Your Full Name" 
    class="SignupInput"
    autoComplete="name"
  />
  
  <input 
    type="email" 
    placeholder="Your Email Address" 
    class="SignupInput"
    autoComplete="email"
  />
  
  <button type="submit" class="PrimarySignupButton">
    Create Free Account
  </button>
  
  <p class="TrustSignal">✅ Start immediately • ✅ Cancel anytime • ✅ NZ owned</p>
</form>
```

### **Auto-Account Creation Process:**
```javascript
const handleMinimalSignup = async (formData) => {
  // 1. Create account immediately
  const account = await createTrialAccount({
    companyName: formData.companyName,
    ownerName: formData.userFullName,
    ownerEmail: formData.userEmail,
    accountType: 'TRIAL',
    trialDocsRemaining: 20
  });
  
  // 2. Auto-generate secure password
  const tempPassword = generateSecurePassword();
  
  // 3. Send welcome email with login details
  await sendWelcomeEmail({
    email: formData.userEmail,
    companyName: formData.companyName,
    tempPassword: tempPassword,
    loginLink: `${APP_URL}/signin`
  });
  
  // 4. Auto-login user (skip password entry)
  await autoLoginUser(account.id);
  
  // 5. Redirect to User Profile completion
  router.push('/profile/complete');
};
```

---

## 👤 **Step 2: User Profile Completion**

### **Progressive Profile Enhancement:**
```typescript
interface UserProfileCompletion {
  // Required for personalization
  jobTitle: string;           // "Owner", "Manager", "Head Chef"
  phoneNumber?: string;       // Optional but helpful
  
  // Preferences for app customization  
  preferredName?: string;     // "Sarah" instead of "Sarah Thompson"
  notificationPreferences: {
    emailAlerts: boolean;
    complianceReminders: boolean;
    weeklyReports: boolean;
  };
  
  // Role definition for team management
  userRole: 'OWNER' | 'MANAGER' | 'STAFF';
}
```

### **Profile Page Flow:**
```html
<!-- Welcome modal on profile page -->
<div class="WelcomeToProfile">
  <h2>Welcome to JiGR, Sarah! 👋</h2>
  <p>Let's personalize your compliance experience</p>
  
  <!-- Progress indicator -->
  <div class="ProgressSteps">
    <span class="StepComplete">✅ Account Created</span>
    <span class="StepActive">📝 Your Profile</span>
    <span class="StepPending">🏢 Company Setup</span>
  </div>
</div>

<!-- Quick profile form -->
<form class="ProfileCompletionForm">
  <input type="text" placeholder="Your Job Title" />
  <input type="tel" placeholder="Phone (Optional)" />
  <input type="text" placeholder="Preferred Name (Optional)" />
  
  <fieldset class="NotificationPreferences">
    <legend>Stay informed with:</legend>
    <label><input type="checkbox" checked> Email alerts for violations</label>
    <label><input type="checkbox" checked> Weekly compliance reports</label>
    <label><input type="checkbox"> Daily reminders</label>
  </fieldset>
  
  <div class="FormActions">
    <button type="submit" class="PrimaryButton">Continue to Company Setup</button>
    <button type="button" class="SecondaryButton">Skip for Now</button>
  </div>
</form>
```

### **Smart Defaults & Skip Options:**
```javascript
const handleProfileCompletion = async (profileData) => {
  // Apply smart defaults for missing fields
  const completeProfile = {
    jobTitle: profileData.jobTitle || 'Manager',
    userRole: 'OWNER', // First user is always owner
    notificationPreferences: {
      emailAlerts: true,        // Critical for compliance
      complianceReminders: true, // Helpful default
      weeklyReports: profileData.weeklyReports ?? false
    },
    ...profileData
  };
  
  await updateUserProfile(completeProfile);
  
  // Redirect to company setup
  router.push('/admin/company/setup');
};
```

---

## 🏢 **Step 3: Company Setup (Admin Console)**

### **Essential Company Information:**
```typescript
interface CompanySetup {
  // Business context for compliance rules
  businessType: 'CAFE' | 'RESTAURANT' | 'HOTEL' | 'CATERING' | 'OTHER';
  teamSize: '1-5' | '6-15' | '16-50' | '50+';
  
  // Address for compliance reporting
  businessAddress: {
    street: string;
    city: string;
    region: string;
    postcode: string;
    country: 'NEW_ZEALAND'; // Default
  };
  
  // Compliance preferences
  complianceSettings: {
    temperatureUnits: 'CELSIUS' | 'FAHRENHEIT';
    alertThresholds: {
      chilled: { min: 0, max: 4 };    // °C
      frozen: { min: -25, max: -18 };  // °C
      ambient: { min: 5, max: 25 };    // °C
    };
    reportingFrequency: 'WEEKLY' | 'MONTHLY';
  };
}
```

### **Company Setup Interface:**
```html
<!-- Company setup in Admin Console -->
<div class="CompanySetupWizard">
  <header class="SetupHeader">
    <h1>Complete Your Company Profile</h1>
    <p>Almost ready! Just a few details to customize your compliance tracking.</p>
    
    <div class="ProgressSteps">
      <span class="StepComplete">✅ Account Created</span>
      <span class="StepComplete">✅ Profile Setup</span>  
      <span class="StepActive">🏢 Company Details</span>
    </div>
  </header>
  
  <!-- Business Type Selection -->
  <section class="BusinessTypeSelection">
    <h3>What type of business is Fresh Valley Cafe?</h3>
    <div class="BusinessTypeGrid">
      <button class="BusinessTypeCard" data-type="CAFE">
        ☕ Cafe
        <small>Coffee, light meals, pastries</small>
      </button>
      <button class="BusinessTypeCard" data-type="RESTAURANT">
        🍽️ Restaurant  
        <small>Full dining service</small>
      </button>
      <button class="BusinessTypeCard" data-type="HOTEL">
        🏨 Hotel
        <small>Accommodation with food service</small>
      </button>
      <button class="BusinessTypeCard" data-type="CATERING">
        🚐 Catering
        <small>Off-site food service</small>
      </button>
    </div>
  </section>
  
  <!-- Quick Address -->
  <section class="AddressSection">
    <h3>Business Address</h3>
    <div class="AddressGrid">
      <input type="text" placeholder="Street Address" />
      <input type="text" placeholder="City" />
      <input type="text" placeholder="Region" />
      <input type="text" placeholder="Postcode" />
    </div>
  </section>
  
  <!-- Compliance Defaults -->
  <section class="ComplianceDefaults">
    <h3>Compliance Settings</h3>
    <div class="DefaultSettings">
      <label>
        Temperature Units:
        <select>
          <option value="CELSIUS" selected>Celsius (°C)</option>
          <option value="FAHRENHEIT">Fahrenheit (°F)</option>
        </select>
      </label>
      
      <label>
        Reporting:
        <select>
          <option value="WEEKLY" selected>Weekly Reports</option>
          <option value="MONTHLY">Monthly Reports</option>
        </select>
      </label>
    </div>
  </section>
  
  <!-- Completion Actions -->
  <div class="SetupActions">
    <button class="PrimaryButton" onclick="completeSetup()">
      🚀 Start Processing Documents
    </button>
    <button class="SecondaryButton" onclick="saveAndContinueLater()">
      Save & Complete Later
    </button>
  </div>
</div>
```

---

## 🎯 **Flow Optimization Features**

### **Smart Pre-Population:**
```javascript
// Use company name to suggest business type
const suggestBusinessType = (companyName) => {
  const keywords = {
    'CAFE': ['cafe', 'coffee', 'espresso', 'bean'],
    'RESTAURANT': ['restaurant', 'dining', 'bistro', 'grill'],
    'HOTEL': ['hotel', 'motel', 'accommodation', 'lodge'],
    'CATERING': ['catering', 'events', 'mobile']
  };
  
  const name = companyName.toLowerCase();
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => name.includes(word))) {
      return type;
    }
  }
  return null;
};

// Pre-select business type if obvious
const suggestedType = suggestBusinessType(user.companyName);
if (suggestedType) {
  highlightBusinessType(suggestedType);
}
```

### **Skip & Continue Options:**
```javascript
// Allow progression with minimal data
const saveAndContinueLater = async () => {
  // Save whatever they've entered
  await savePartialCompanySetup(currentData);
  
  // Redirect to dashboard with demo
  router.push('/app/dashboard?onboarding=demo');
  
  // Show gentle reminder later
  scheduleSetupReminder(user.id, '24_HOURS');
};
```

### **Demo Integration:**
```javascript
const completeSetup = async () => {
  await saveCompanySetup(companyData);
  
  // Apply business-specific demo
  const demoData = getDemoDataForBusinessType(companyData.businessType);
  await loadDemoDocument(demoData);
  
  // Redirect to dashboard with demo loaded
  router.push('/app/dashboard?demo=loaded');
  
  // Show success message
  showSuccessMessage("Setup complete! Let's process your first document.");
};
```

---

## 📱 **iPad Air Optimizations**

### **Touch-Friendly Forms:**
```css
/* Optimized for tablet use */
.SignupInput, .ProfileInput, .CompanyInput {
  height: 50px;
  font-size: 16px; /* Prevents iOS zoom */
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid #E5E7EB;
  margin-bottom: 16px;
}

.BusinessTypeCard {
  min-height: 80px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.BusinessTypeCard:hover,
.BusinessTypeCard:focus {
  border-color: #10B981;
  background-color: #F0FDF4;
}
```

### **Progress Persistence:**
```javascript
// Save progress on every field change
const autoSaveProgress = debounce(async (formData, step) => {
  await supabase
    .from('user_onboarding_progress')
    .upsert({
      user_id: user.id,
      current_step: step,
      form_data: formData,
      updated_at: new Date()
    });
}, 1000);

// Resume from last step on return
const resumeOnboarding = async () => {
  const progress = await getOnboardingProgress(user.id);
  if (progress) {
    router.push(`/${progress.current_step}?resume=true`);
  }
};
```

---

## 🚀 **Implementation Priority**

### **Phase 1: Core Three-Step Flow**
```bash
MinimalSignupForm.tsx
UserProfileCompletion.tsx  
CompanySetupWizard.tsx
OnboardingProgressTracker.tsx
```

### **Phase 2: Optimization Features**
```bash
BusinessTypeSuggestion.tsx
SmartDefaults.tsx
ProgressPersistence.tsx
DemoIntegration.tsx
```

### **Phase 3: Conversion Enhancement**
```bash
ExitIntentProtection.tsx
SetupReminders.tsx
OnboardingAnalytics.tsx
A/BTestVariants.tsx
```

---

## 📊 **Success Metrics**

### **Conversion Funnel:**
```javascript
// Track each step completion
analytics.track('onboarding_step_completed', {
  step: 'minimal_signup',
  companyName: user.companyName,
  timeToComplete: timeSpent
});

analytics.track('onboarding_step_completed', {
  step: 'profile_completion', 
  skipOptions: fieldsSkipped,
  timeToComplete: timeSpent
});

analytics.track('onboarding_step_completed', {
  step: 'company_setup',
  businessType: companyData.businessType,
  demoProcessed: true,
  timeToComplete: timeSpent
});
```

### **Target Metrics:**
```bash
signupToProfileCompletion: >90%
profileToCompanySetup: >85%  
companySetupToFirstDemo: >95%
overallOnboardingCompletion: >80%
timeToFirstValue: <5 minutes
```

---

## ✅ **Implementation Checklist**

**Minimal Signup:**
- [ ] Clean three-field form with smart validation
- [ ] Auto-account creation with trial setup
- [ ] Welcome email with temp password
- [ ] Auto-login and redirect to profile

**Profile Completion:**
- [ ] Progressive profiling with smart defaults
- [ ] Skip options for optional fields  
- [ ] Notification preference setup
- [ ] Progress persistence across sessions

**Company Setup:**
- [ ] Business type selection with suggestions
- [ ] Essential address collection
- [ ] Compliance setting defaults
- [ ] Demo integration and dashboard redirect

**Optimization:**
- [ ] iPad Air touch optimizations
- [ ] Exit intent protection
- [ ] Analytics tracking throughout
- [ ] A/B testing infrastructure

This refined approach leverages your existing app structure while maximizing conversion! 🎯