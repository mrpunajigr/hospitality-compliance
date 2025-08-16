# App Architecture - Page Structure

## File Structure & Routing

```
/app
├── page.tsx                   # Landing page (root)
├── layout.tsx                 # Root layout
├── globals.css                # Global styles
├── page-with-supabase.tsx     # Supabase test page
│
├── (admin)/                   # Admin routes group  
│   ├── company/
│   │   ├── page.tsx           # Company profile
│   │   ├── settings/          # Company settings (empty)
│   │   ├── billing/           # Billing management (empty)
│   │   └── team/              # Team management (empty)
│   ├── profile/
│   │   └── page.tsx           # User profile settings
│   └── layout.tsx             # Admin layout (auth required)
│
├── workspace/                 # Core app functionality (renamed from doing)
│   ├── dashboard/
│   │   └── page.tsx           # Compliance dashboard with tabs
│   ├── upload/
│   │   └── page.tsx           # Document upload page
│   ├── reports/
│   │   └── page.tsx           # Compliance reports
│   └── layout.tsx             # Workspace layout with bottom tabs
│
├── create-account/
│   └── page.tsx               # Account creation & onboarding
│
├── signin/
│   └── page.tsx               # Sign in page
│
├── signup/                    # Signup folder (empty)
├── dashboard/                 # Dashboard folder (empty)
├── test/
│   └── page.tsx               # Test page
│
├── components/                # Shared components
│   ├── ErrorBoundary.tsx      # Error boundary wrapper
│   ├── Footer.tsx             # Footer component
│   ├── compliance/
│   │   └── ComplianceDashboard.tsx  # Main compliance dashboard
│   └── delivery/
│       └── SafariCompatibleUpload.tsx  # Upload component
│
└── api/                       # API routes
    ├── compliance-alerts/
    │   └── route.ts           # Compliance alerts endpoint
    ├── delivery-records/
    │   └── route.ts           # Delivery records endpoint
    ├── process-docket/
    │   └── route.ts           # Process uploaded docket
    └── upload-docket/
        └── route.ts           # Upload docket endpoint
```

## Section Breakdown

### 🏠 PUBLIC Section - Landing & Auth
**Public routes (no auth required)**

#### **Landing Page** - `/`
```typescript
// Features for iPad Air compatibility
const LandingPage = {
  purpose: 'Convert visitors to trial users',
  compatibility: 'Safari 12 optimized',
  
  sections: {
    hero: {
      headline: 'Food Safety Compliance Made Simple',
      subheadline: 'AI-powered delivery tracking for NZ hospitality',
      cta: 'Start 7-Day Free Trial',
      benefits: ['Save 2+ hours daily', 'Inspector ready reports', 'Works on any tablet']
    },
    
    problemSolution: {
      problem: 'Manual temperature logging is time-consuming and error-prone',
      solution: 'Photograph delivery dockets, AI extracts temperatures automatically'
    },
    
    features: {
      simple: ['Photo → Process → Compliance', 'No training required'],
      smart: ['AI reads handwritten temps', 'Instant violation alerts'],
      compliant: ['Inspector portal access', 'Audit-ready reports']
    },
    
    pricing: {
      trial: '7 days free',
      plans: ['Basic $49/month', 'Professional $99/month', 'Enterprise $199/month'],
      hardware: 'Works on budget tablets'
    },
    
    social_proof: {
      testimonials: 'Small restaurant success stories',
      compliance: 'NZ Food Act 2014 compliant',
      security: 'Bank-level data security'
    }
  },
  
  cta_buttons: {
    primary: 'Start Free Trial',
    secondary: 'Watch Demo'
  }
};
```

#### **Create Account** - `/create-account`
```typescript
// Multi-step onboarding optimized for touch
const CreateAccountFlow = {
  compatibility: 'Touch-optimized for iPad',
  
  steps: [
    {
      step: 1,
      title: 'Business Information',
      fields: [
        'businessName',
        'businessType', // dropdown: restaurant, cafe, bar, hotel, etc.
        'alcoholLicenseNumber', // NZ specific
        'contactEmail',
        'contactPhone',
        'estimatedDeliveries' // helps recommend plan
      ]
    },
    
    {
      step: 2, 
      title: 'Choose Your Plan',
      content: {
        recommendation: 'Based on your delivery volume',
        plans: {
          basic: { deliveries: 500, price: 49, features: ['Basic compliance', 'Email support'] },
          professional: { deliveries: 2000, price: 99, features: ['Advanced analytics', 'Priority support'] },
          enterprise: { deliveries: 'unlimited', price: 199, features: ['Custom rules', 'Phone support'] }
        },
        trial: '7 days free on any plan'
      }
    },
    
    {
      step: 3,
      title: 'Payment Details',
      content: {
        trial_notice: 'No charge for 7 days',
        stripe_elements: 'Card collection (Safari 12 compatible)',
        security: 'Secured by Stripe'
      }
    },
    
    {
      step: 4,
      title: 'Invite Your Team',
      content: {
        optional: true,
        roles: ['Staff (upload only)', 'Manager (view reports)', 'Admin (full access)'],
        skip_option: 'Add team later'
      }
    },
    
    {
      step: 5,
      title: 'Test Upload',
      content: {
        guided_demo: 'Take photo of sample delivery docket',
        ai_processing: 'Watch AI extract temperature data',
        success_criteria: 'First document processed = onboarding complete'
      }
    }
  ]
};
```

#### **Sign In** - `/signin`
```typescript
const SignInPage = {
  compatibility: 'Simple form for Safari 12',
  
  form: {
    fields: ['email', 'password'],
    options: {
      remember_me: true,
      forgot_password: true
    },
    social_auth: false, // Keep simple for compatibility
    
    post_signin_redirect: {
      new_users: '/doing/upload', // Direct to core functionality
      returning_users: '/doing/dashboard' // Back to their data
    }
  },
  
  features: {
    client_switching: 'If user belongs to multiple clients',
    role_detection: 'Redirect based on user role',
    trial_status: 'Show trial days remaining'
  }
};
```

### ⚙️ ADMIN Section - Configuration & Management
**Route Group: `(admin)/`**

#### **Company Profile** - `/admin/company`
```typescript
const CompanyProfilePage = {
  purpose: 'Manage business information and settings',
  access: 'Admin and Owner roles only',
  
  sections: {
    business_info: {
      editable_fields: [
        'businessName',
        'address',
        'phone', 
        'email',
        'alcoholLicenseNumber',
        'businessType'
      ],
      readonly_fields: [
        'accountCreated',
        'subscriptionStatus',
        'documentsProcessedThisMonth'
      ]
    },
    
    subscription_overview: {
      current_plan: 'Basic/Professional/Enterprise',
      usage_stats: {
        documents_this_month: 'X/500 used',
        overage_charges: '$X.XX',
        next_billing_date: 'DD/MM/YYYY'
      },
      actions: ['Upgrade Plan', 'View Billing Portal', 'Download Invoices']
    },
    
    team_summary: {
      active_users: 'X users',
      pending_invitations: 'X pending',
      last_activity: 'User logged in X hours ago',
      quick_actions: ['Invite User', 'Manage Roles']
    }
  }
};
```

#### **Company Settings** - `/admin/company/settings`
```typescript
const CompanySettingsPage = {
  sections: {
    compliance_rules: {
      temperature_thresholds: {
        chilled: { min: 0, max: 4, unit: 'C' },
        frozen: { min: -25, max: -18, unit: 'C' },
        ambient: { min: 5, max: 25, unit: 'C' }
      },
      violation_alerts: {
        email_recipients: ['manager@restaurant.co.nz'],
        sms_recipients: ['+64211234567'],
        escalation_minutes: 30
      }
    },
    
    suppliers: {
      manage_suppliers: 'Add/edit expected suppliers',
      delivery_schedules: 'Expected delivery days',
      product_types: 'What each supplier delivers'
    },
    
    notifications: {
      email_settings: 'Weekly reports, violation alerts',
      sms_settings: 'Critical alerts only',
      in_app: 'Dashboard notifications'
    },
    
    data_retention: {
      photo_storage: '24 months (NZ compliance)',
      report_history: 'Unlimited',
      export_options: 'CSV, PDF downloads'
    }
  }
};
```

#### **User Profile** - `/admin/profile`
```typescript
const UserProfilePage = {
  purpose: 'Personal account settings',
  access: 'All authenticated users',
  
  sections: {
    personal_info: {
      fields: ['fullName', 'email', 'phone', 'avatarUrl'],
      password_change: 'Secure password update',
      two_factor: 'Optional 2FA setup'
    },
    
    preferences: {
      timezone: 'NZ timezone selection',
      language: 'English (NZ)',
      notifications: 'Personal notification preferences',
      dashboard_layout: 'Customize dashboard view'
    },
    
    activity: {
      recent_logins: 'Last 10 login sessions',
      documents_uploaded: 'Personal upload history',
      role_history: 'Role changes over time'
    },
    
    account_actions: {
      download_data: 'Personal data export',
      account_security: 'Security audit log',
      sign_out_all: 'Sign out of all devices'
    }
  }
};
```

### 📱 WORKSPACE Section - Core Functionality  
**Route Group: `/workspace`**

#### **Dashboard Page** - `/workspace/dashboard`
```typescript
const WorkspaceDashboard = {
  purpose: 'Main compliance dashboard with integrated upload functionality',
  compatibility: 'Safari 12 optimized with tab-based interface',
  
  interface: {
    tab_navigation: {
      dashboard_tab: 'Compliance overview and recent uploads',
      upload_tab: 'Quick photo upload interface',
      default_view: 'dashboard'
    },
    
    dashboard_view: {
      summary_cards: 'Compliance metrics and recent activity',
      recent_uploads: 'List of recent delivery records',
      compliance_alerts: 'Temperature violations and issues',
      quick_actions: 'Upload new, generate reports'
    },
    
    upload_view: {
      integrated_camera: 'Safari-compatible file upload',
      real_time_processing: 'AI extraction with progress updates',
      success_feedback: 'Automatic switch to dashboard after upload'
    }
  },
  
  features: {
    demo_mode: 'Works without authentication for testing',
    responsive_layout: 'Optimized for iPad Air screen size',
    touch_friendly: 'Large buttons and touch targets'
  }
};
```

#### **Upload Page** - `/workspace/upload`
```typescript
const UploadPage = {
  purpose: 'Photograph and process delivery dockets',
  compatibility: 'Optimized for iPad Air camera and Safari 12',
  
  interface: {
    camera_section: {
      file_input: 'Basic file input (Safari 12 compatible)',
      camera_tips: [
        'Ensure good lighting',
        'Keep docket flat',
        'Include temperature readings',
        'Capture supplier name clearly'
      ],
      image_preview: 'Show captured image before upload',
      compress_client_side: 'Optimize for 1GB RAM'
    },
    
    upload_process: {
      progress_indicator: 'Upload and processing progress',
      real_time_feedback: 'AI extraction happening...',
      success_state: 'Temperature data extracted successfully',
      error_handling: 'Clear error messages and retry options'
    },
    
    quick_metadata: {
      supplier_dropdown: 'Pre-configured suppliers',
      delivery_time: 'Auto-populate current time',
      product_type: 'Optional categorization',
      notes_field: 'Additional context'
    }
  },
  
  ai_processing: {
    status_updates: [
      'Uploading image...',
      'Processing with AI...',
      'Extracting temperature data...',
      'Checking compliance...',
      'Complete!'
    ],
    
    results_display: {
      temperatures_found: 'List all temperatures detected',
      compliance_status: 'Pass/Fail for each temperature',
      supplier_detected: 'Auto-detected supplier name',
      confidence_scores: 'AI confidence levels'
    },
    
    user_verification: {
      confirm_temperatures: 'User can verify/edit extracted temps',
      add_missing: 'Manual entry for missed temperatures',
      flag_issues: 'Report AI extraction problems'
    }
  }
};
```

#### **Reports Page** - `/workspace/reports`
```typescript
const ReportsPage = {
  purpose: 'Generate and view compliance reports',
  compatibility: 'Optimized for Safari 12 with simple interface',
  
  layout: {
    summary_cards: {
      todays_uploads: 'Count of today\'s processed dockets',
      compliance_rate: 'Percentage compliant this week',
      pending_alerts: 'Unacknowledged violations',
      this_month_usage: 'Documents processed vs plan limit'
    },
    
    quick_actions: {
      upload_new: 'Quick link to upload page',
      generate_report: 'Create compliance report',
      acknowledge_alerts: 'Clear pending violations',
      export_data: 'Download recent data'
    }
  },
  
  docket_list: {
    columns: [
      'thumbnail', // Small image preview
      'date_time',
      'supplier',
      'temperatures', // List of temps found
      'compliance_status', // Pass/Fail badges
      'uploaded_by',
      'actions' // View, edit, delete
    ],
    
    filtering: {
      date_range: 'Last 7 days, 30 days, custom',
      supplier: 'Filter by supplier name',
      compliance_status: 'Show only violations',
      uploaded_by: 'Filter by team member',
      product_type: 'Filter by product category'
    },
    
    sorting: {
      default: 'Most recent first',
      options: ['Date', 'Supplier', 'Compliance Status', 'Temperature']
    },
    
    pagination: {
      page_size: 20, // Keep light for older hardware
      infinite_scroll: false, // Use pagination for compatibility
      total_count: 'X of Y dockets'
    }
  },
  
  detail_view: {
    modal_popup: 'Click docket to view details',
    full_image: 'Original photo with zoom',
    extracted_data: 'All AI-extracted information',
    edit_capability: 'Correct any extraction errors',
    audit_trail: 'Who uploaded, when processed, etc.'
  }
};
```

## Special Routes

### **Inspector Portal** - `/inspector/[token]`
```typescript
const InspectorPortal = {
  purpose: 'Secure read-only access for health inspectors',
  authentication: 'Token-based, time-limited access',
  
  features: {
    compliance_overview: 'Summary of business compliance',
    date_range_filter: 'Inspect specific time periods',
    violation_reports: 'List of all temperature violations',
    export_capabilities: 'Download official compliance reports',
    audit_trail: 'Complete record of all activities',
    
    restrictions: {
      read_only: 'Cannot modify any data',
      time_limited: 'Access expires after set period',
      logged_access: 'All inspector activity recorded'
    }
  }
};
```

## Navigation Structure

### **Primary Navigation** (Role-based visibility)
```typescript
const NavigationStructure = {
  // Staff: Basic upload functionality only
  staff_role: [
    { label: 'Upload', route: '/workspace/upload', icon: 'camera', active: true },
    { label: 'Dashboard', route: '/workspace/dashboard', icon: 'dashboard' },
    { label: 'Profile', route: '/admin/profile', icon: 'user' }
  ],
  
  // Manager: Upload + viewing + basic reports  
  manager_role: [
    { label: 'Upload', route: '/workspace/upload', icon: 'camera' },
    { label: 'Dashboard', route: '/workspace/dashboard', icon: 'dashboard' },
    { label: 'Reports', route: '/workspace/reports', icon: 'chart' },
    { label: 'Profile', route: '/admin/profile', icon: 'user' }
  ],
  
  // Admin/Owner: Full access to everything
  admin_role: [
    { label: 'Dashboard', route: '/workspace/dashboard', icon: 'dashboard' },
    { label: 'Upload', route: '/workspace/upload', icon: 'camera' },
    { label: 'Reports', route: '/workspace/reports', icon: 'chart' },
    { label: 'Company', route: '/admin/company', icon: 'building' },
    { label: 'Settings', route: '/admin/company/settings', icon: 'settings' },
    { label: 'Profile', route: '/admin/profile', icon: 'user' }
  ]
};
```

### **Navigation Layout Options**

#### **Primary Layout: Bottom Tab Bar** (Recommended for iPad)
```typescript
const BottomTabNavigation = {
  position: 'fixed bottom',
  compatibility: 'Perfect for thumb navigation on iPad',
  styling: {
    height: '60px',
    background: 'white',
    border_top: '1px solid #e5e7eb',
    safe_area: 'padding for home indicator'
  },
  
  tab_design: {
    width: 'equal distribution across screen width',
    touch_target: '60px height x full width',
    icon_size: '24px',
    label_size: '12px',
    active_state: 'blue accent color',
    inactive_state: 'gray-500'
  }
};
```

#### **Secondary Layout: Sidebar** (For admin pages)
```typescript
const SidebarNavigation = {
  usage: 'Admin pages only (/admin/* routes)',
  collapsible: true,
  
  desktop_behavior: {
    width: '240px',
    position: 'fixed left',
    full_height: true
  },
  
  mobile_behavior: {
    overlay: true,
    slide_in: 'from left',
    backdrop: 'dark overlay',
    close_on_outside_click: true
  }
};
```

#### **Contextual Navigation: Page Headers**
```typescript
const PageHeaderNavigation = {
  all_pages: {
    back_button: 'Return to previous page',
    page_title: 'Current page name',
    action_buttons: 'Page-specific actions'
  },
  
  examples: {
    upload_page: {
      title: 'Upload Delivery Docket',
      actions: ['Help Guide', 'Camera Tips']
    },
    
    dashboard_page: {
      title: 'Compliance Dashboard',
      actions: ['Filter', 'Export', 'Generate Report']
    },
    
    admin_pages: {
      title: 'Company Settings',
      actions: ['Save Changes', 'Reset', 'Help']
    }
  }
};
```

### **Navigation Component Structure**
```typescript
// Component hierarchy for navigation
const NavigationComponents = {
  layouts: {
    'RootLayout': {
      file: '/app/layout.tsx',
      contains: 'Global providers, font loading, meta tags',
      children: 'Route-specific layouts'
    },
    
    'RootLayout': {
      file: '/app/layout.tsx', 
      navigation: 'No navigation - handled by individual pages',
      style: 'Global styles and providers only'
    },
    
    'AdminLayout': {
      file: '/app/(admin)/layout.tsx',
      navigation: 'Sidebar navigation + header',
      auth_required: true,
      role_check: 'admin or owner only'
    },
    
    'WorkspaceLayout': {
      file: '/app/workspace/layout.tsx',
      navigation: 'Bottom tab bar + header with user menu',
      auth_required: 'Demo mode available',
      role_check: 'any authenticated user'
    },
    
    'InspectorLayout': {
      file: '/app/inspector/layout.tsx',
      navigation: 'Minimal header, read-only indicators',
      auth_method: 'token-based'
    }
  },
  
  shared_components: {
    'BottomTabBar': {
      props: ['currentUser', 'activeRoute'],
      features: ['role-based visibility', 'active state', 'badge counts']
    },
    
    'PageHeader': {
      props: ['title', 'backButton', 'actions'],
      features: ['breadcrumbs', 'context actions', 'user menu']
    },
    
    'UserMenu': {
      features: ['profile link', 'sign out', 'client switching', 'role display']
    }
  }
};
```

### **Mobile-First Navigation Patterns**
```typescript
const MobileOptimizations = {
  touch_targets: {
    minimum_size: '44px x 44px',
    spacing: '8px minimum between targets',
    feedback: 'visual press states'
  },
  
  gestures: {
    swipe_navigation: 'Swipe between main sections',
    pull_to_refresh: 'Refresh dashboard data',
    long_press: 'Context menus where appropriate'
  },
  
  accessibility: {
    labels: 'Clear text labels on all nav items',
    focus_states: 'Keyboard navigation support',
    contrast: 'WCAG AA compliance',
    screen_reader: 'Proper ARIA labels'
  }
};
```

### **Responsive Behavior** (iPad Air optimized)
```typescript
const ResponsiveDesign = {
  tablet_layout: {
    navigation: 'Bottom tab bar for thumb navigation',
    content: 'Single column layout',
    touch_targets: 'Minimum 44px for easy tapping',
    font_sizes: 'Larger text for readability'
  },
  
  performance: {
    image_optimization: 'Compress images before display',
    lazy_loading: 'Load content as needed',
    minimal_animations: 'Simple transitions only',
    memory_management: 'Clear unused data regularly'
  }
};
```

---

This architecture provides a clear, iPad Air-optimized structure that Cursor Claude can implement with proper compatibility considerations while maintaining professional SaaS functionality.