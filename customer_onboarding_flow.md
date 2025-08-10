# Customer Onboarding Flow - Complete Journey

## Overview
The onboarding flow takes a new hospitality business from initial signup to fully active compliance system with their first delivery docket processed.

## Flow Stages

### Stage 1: Initial Signup & Business Information
**Landing Page → Business Registration**

#### Step 1.1: Business Information Collection
```typescript
interface BusinessSignupForm {
  businessName: string;
  businessType: 'restaurant' | 'bar' | 'cafe' | 'hotel' | 'club' | 'other';
  alcoholLicenseNumber?: string; // NZ license number
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: 'NZ';
  };
  estimatedMonthlyDeliveries: number; // Help suggest plan
}
```

#### Step 1.2: Account Creation
```typescript
async function createBusinessAccount(formData: BusinessSignupForm) {
  // 1. Create auth user for the business owner
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email: formData.contactEmail,
    password: temporaryPassword, // They'll set this later
    options: {
      data: {
        full_name: formData.contactName,
        business_name: formData.businessName
      }
    }
  });
  
  // 2. Create client record
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: formData.businessName,
      business_type: formData.businessType,
      license_number: formData.alcoholLicenseNumber,
      business_email: formData.contactEmail,
      phone: formData.contactPhone,
      address: formData.address,
      estimated_monthly_deliveries: formData.estimatedMonthlyDeliveries,
      onboarding_status: 'business_info_collected',
      subscription_status: 'trial' // 7-day free trial
    })
    .select()
    .single();
    
  // 3. Create owner relationship
  await supabase
    .from('client_users')
    .insert({
      user_id: authUser.user.id,
      client_id: client.id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString()
    });
    
  return { authUser, client };
}
```

### Stage 2: Plan Selection & Pricing
**Business Info → Plan Selection**

#### Step 2.1: Plan Recommendation Engine
```typescript
function recommendPlan(estimatedDeliveries: number): 'basic' | 'professional' | 'enterprise' {
  if (estimatedDeliveries <= 400) return 'basic';
  if (estimatedDeliveries <= 1800) return 'professional';
  return 'enterprise';
}

const PLAN_DETAILS = {
  basic: {
    name: 'Basic Compliance',
    price: 49,
    currency: 'NZD',
    documents: 500,
    features: [
      'Up to 500 delivery dockets/month',
      'Basic temperature compliance tracking',
      'Email support',
      'Standard reporting',
      'Mobile app access'
    ],
    stripeLookupKey: 'hospitality-basic-monthly'
  },
  professional: {
    name: 'Professional Compliance',
    price: 99,
    currency: 'NZD',
    documents: 2000,
    features: [
      'Up to 2000 delivery dockets/month',
      'Advanced compliance analytics',
      'Temperature trend analysis',
      'Custom supplier rules',
      'Priority email support',
      'Compliance reports for inspectors'
    ],
    stripeLookupKey: 'hospitality-professional-monthly'
  },
  enterprise: {
    name: 'Enterprise Compliance',
    price: 199,
    currency: 'NZD',
    documents: -1, // unlimited
    features: [
      'Unlimited delivery dockets',
      'Custom compliance rules',
      'API access for integrations',
      'Phone support',
      'Dedicated account manager',
      'Custom reporting'
    ],
    stripeLookupKey: 'hospitality-enterprise-monthly'
  }
};
```

#### Step 2.2: Plan Selection UI
```typescript
async function handlePlanSelection(clientId: string, selectedPlan: string) {
  // Update client with selected plan
  await supabase
    .from('clients')
    .update({
      selected_plan: selectedPlan,
      onboarding_status: 'plan_selected'
    })
    .eq('id', clientId);
    
  // Proceed to Stripe customer creation
  return await createStripeCustomer(clientId, selectedPlan);
}
```

### Stage 3: Stripe Customer & Subscription Setup
**Plan Selection → Payment Setup**

#### Step 3.1: Create Stripe Customer
```typescript
async function createStripeCustomer(clientId: string, selectedPlan: string) {
  // Get client details
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();
    
  // Create Stripe customer
  const stripeCustomer = await stripe.customers.create({
    email: client.business_email,
    name: client.name,
    phone: client.phone,
    address: {
      line1: client.address.street,
      city: client.address.city,
      state: client.address.region,
      postal_code: client.address.postalCode,
      country: 'NZ'
    },
    metadata: {
      client_id: clientId,
      business_type: client.business_type,
      license_number: client.license_number || ''
    }
  });
  
  // Update client with Stripe customer ID
  await supabase
    .from('clients')
    .update({
      stripe_customer_id: stripeCustomer.id,
      onboarding_status: 'stripe_customer_created'
    })
    .eq('id', clientId);
    
  return stripeCustomer;
}
```

#### Step 3.2: Subscription Creation with Trial
```typescript
async function createSubscriptionWithTrial(stripeCustomerId: string, planLookupKey: string) {
  // Create subscription with 7-day trial
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{
      price_data: {
        lookup_key: planLookupKey
      }
    }],
    trial_period_days: 7,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription'
    },
    expand: ['latest_invoice.payment_intent']
  });
  
  return subscription;
}
```

### Stage 4: Payment Method Collection
**Stripe Setup → Payment Details**

#### Step 4.1: Payment Method Setup UI
```typescript
// Frontend: Stripe Elements integration
function PaymentMethodSetup({ clientSecret, onSuccess }: PaymentSetupProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/onboarding/setup-complete`
      }
    });
    
    if (!error) {
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Start 7-Day Free Trial
      </button>
    </form>
  );
}
```

### Stage 5: Team Setup & User Invitations
**Payment Setup → Team Management**

#### Step 5.1: Team Member Invitation
```typescript
async function inviteTeamMembers(clientId: string, invitations: TeamInvitation[]) {
  const invitePromises = invitations.map(async (invite) => {
    // Create invitation record
    const { data: invitation } = await supabase
      .from('invitations')
      .insert({
        email: invite.email,
        client_id: clientId,
        role: invite.role,
        invited_by: invite.invitedBy,
        token: crypto.randomUUID()
      })
      .select()
      .single();
      
    // Send invitation email
    await sendTeamInvitationEmail(invitation);
    
    return invitation;
  });
  
  await Promise.all(invitePromises);
  
  // Update onboarding status
  await supabase
    .from('clients')
    .update({
      onboarding_status: 'team_invited'
    })
    .eq('id', clientId);
}

interface TeamInvitation {
  email: string;
  role: 'staff' | 'manager' | 'admin';
  name?: string;
  invitedBy: string;
}
```

### Stage 6: System Configuration
**Team Setup → App Configuration**

#### Step 6.1: Supplier Setup
```typescript
interface SupplierSetup {
  name: string;
  contactEmail?: string;
  expectedDeliveryDays: string[]; // ['monday', 'wednesday', 'friday']
  productTypes: string[]; // ['dairy', 'meat', 'frozen', 'dry goods']
  temperatureRequirements: {
    chilled: { min: 0, max: 4 };
    frozen: { min: -25, max: -18 };
    ambient: { min: 5, max: 25 };
  };
}

async function setupSuppliers(clientId: string, suppliers: SupplierSetup[]) {
  const supplierRecords = suppliers.map(supplier => ({
    client_id: clientId,
    name: supplier.name,
    contact_email: supplier.contactEmail,
    delivery_schedule: supplier.expectedDeliveryDays,
    product_types: supplier.productTypes,
    temperature_requirements: supplier.temperatureRequirements,
    status: 'active'
  }));
  
  await supabase
    .from('suppliers')
    .insert(supplierRecords);
}
```

#### Step 6.2: Compliance Rules Configuration
```typescript
async function setupComplianceRules(clientId: string, customRules?: ComplianceRule[]) {
  const defaultRules = {
    temperature_violations: {
      chilled_max: 4,
      frozen_min: -18,
      ambient_max: 25,
      alert_threshold: 'immediate'
    },
    documentation_requirements: {
      photo_required: true,
      temperature_required: true,
      supplier_verification: true
    },
    retention_policy: {
      keep_records_months: 24, // NZ compliance requirement
      backup_frequency: 'weekly'
    }
  };
  
  await supabase
    .from('compliance_settings')
    .insert({
      client_id: clientId,
      rules: { ...defaultRules, ...customRules },
      created_at: new Date().toISOString()
    });
}
```

### Stage 7: First Document Upload & Test
**Configuration → Live Testing**

#### Step 7.1: Guided First Upload
```typescript
async function guidedFirstUpload(clientId: string, imageFile: File) {
  // Upload to storage
  const fileName = `${clientId}/onboarding-test/${Date.now()}-test-upload.jpg`;
  
  const { data: uploadResult, error: uploadError } = await supabase.storage
    .from('delivery-dockets')
    .upload(fileName, imageFile);
    
  if (uploadError) throw uploadError;
  
  // Process with Document AI (same as production)
  const processingResult = await processDeliveryDocket({
    bucketId: 'delivery-dockets',
    fileName: uploadResult.path,
    filePath: uploadResult.path,
    userId: currentUser.id,
    clientId: clientId
  });
  
  // Mark onboarding as complete
  await supabase
    .from('clients')
    .update({
      onboarding_status: 'completed',
      onboarding_completed_at: new Date().toISOString(),
      first_document_processed: true
    })
    .eq('id', clientId);
    
  return processingResult;
}
```

### Stage 8: Onboarding Completion & Success
**Test Upload → Welcome Dashboard**

#### Step 8.1: Welcome Dashboard Setup
```typescript
async function setupWelcomeDashboard(clientId: string) {
  // Create sample compliance report
  const welcomeData = {
    documentsProcessed: 1,
    complianceRate: 100,
    nextSteps: [
      'Install mobile app for easy photo capture',
      'Train your team on temperature checking procedures',
      'Set up delivery schedules with suppliers',
      'Review compliance reports weekly'
    ],
    supportResources: [
      'Quick start video guide',
      'Temperature compliance checklist',
      'Mobile app download links',
      'Contact support if needed'
    ]
  };
  
  return welcomeData;
}
```

## Onboarding Progress Tracking

### Progress States
```typescript
type OnboardingStatus = 
  | 'started'
  | 'business_info_collected'
  | 'plan_selected'
  | 'stripe_customer_created'
  | 'payment_method_added'
  | 'team_invited'
  | 'suppliers_configured'
  | 'compliance_rules_set'
  | 'first_document_processed'
  | 'completed';
```

### Progress UI Component
```typescript
function OnboardingProgress({ currentStatus }: { currentStatus: OnboardingStatus }) {
  const steps = [
    { key: 'business_info_collected', label: 'Business Information', icon: '🏢' },
    { key: 'plan_selected', label: 'Select Plan', icon: '📋' },
    { key: 'payment_method_added', label: 'Payment Setup', icon: '💳' },
    { key: 'team_invited', label: 'Invite Team', icon: '👥' },
    { key: 'suppliers_configured', label: 'Configure Suppliers', icon: '🚚' },
    { key: 'first_document_processed', label: 'Test Upload', icon: '📸' },
    { key: 'completed', label: 'Ready to Go!', icon: '🎉' }
  ];
  
  return (
    <div className="onboarding-progress">
      {steps.map((step, index) => (
        <div 
          key={step.key}
          className={`step ${getStepStatus(step.key, currentStatus)}`}
        >
          <span className="icon">{step.icon}</span>
          <span className="label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
```

## Email Templates

### Welcome Email
```typescript
const WELCOME_EMAIL = {
  subject: 'Welcome to Hospitality Compliance - Let\'s get started!',
  template: `
    <h2>Welcome {{business_name}}!</h2>
    <p>Thanks for choosing our compliance platform. You're just a few steps away from streamlined delivery tracking.</p>
    
    <div class="next-steps">
      <h3>Complete your setup:</h3>
      <ol>
        <li>Choose your subscription plan</li>
        <li>Set up payment details (7-day free trial)</li>
        <li>Invite your team members</li>
        <li>Configure your suppliers</li>
        <li>Upload your first delivery docket</li>
      </ol>
    </div>
    
    <a href="{{onboarding_url}}" class="cta-button">Continue Setup</a>
  `
};
```

### Trial Reminder Email (Day 5)
```typescript
const TRIAL_REMINDER_EMAIL = {
  subject: 'Your free trial ends in 2 days - {{business_name}}',
  template: `
    <h2>Your trial is almost over!</h2>
    <p>You have 2 days left in your free trial. Don't lose access to your compliance tracking.</p>
    
    <div class="trial-stats">
      <h3>Your trial activity:</h3>
      <ul>
        <li>{{documents_processed}} delivery dockets processed</li>
        <li>{{compliance_rate}}% compliance rate</li>
        <li>{{team_members}} team members active</li>
      </ul>
    </div>
    
    <p>Continue with your {{selected_plan}} plan for just ${{plan_price}} NZD/month.</p>
    
    <a href="{{billing_portal_url}}" class="cta-button">Confirm Subscription</a>
  `
};
```

---

This onboarding flow takes customers from zero to fully operational in about 15-20 minutes, with a 7-day trial to ensure they're completely satisfied before billing begins.