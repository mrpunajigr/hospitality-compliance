# Client Onboarding & Authorization Strategy - Claude Code Prompt

## 🎯 **OBJECTIVE**
Create a comprehensive client onboarding system with role-based access control (RBAC) for the JiGR hospitality compliance platform. The system must handle multi-tenant security while providing intuitive user management for small hospitality businesses.

---

## 🏢 **CLIENT ONBOARDING FLOW**

### **Phase 1: Account Creation (Owner/Head Chef)**
```typescript
// Primary account holder creates organization
interface ClientRegistration {
  // Business Information
  businessName: string;
  businessType: 'restaurant' | 'cafe' | 'hotel' | 'catering' | 'pub' | 'other';
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  
  // Compliance Information
  foodLicenseNumber: string;
  alcoholLicenseNumber?: string;
  councilArea: string;
  
  // Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  
  // Account Setup
  password: string;
  agreedToTerms: boolean;
  subscriptionPlan: 'LITE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
}
```

### **Phase 2: Automatic User Account Creation**
```typescript
// System automatically creates:
// 1. Client record (organization)
// 2. Owner user account with OWNER role
// 3. Stripe customer record
// 4. Default compliance settings
// 5. Welcome email with setup guide
```

---

## 👥 **ROLE-BASED ACCESS CONTROL (RBAC)**

### **User Roles Hierarchy**

#### **1. OWNER (Highest Authority)**
```bash
BusinessOwner
```
- **Full system access** - All features, all settings
- **Billing management** - Stripe subscriptions, usage, invoicing
- **User management** - Invite/remove all users, change roles
- **Company settings** - Business details, compliance rules, branding
- **Data access** - All documents, all reports, all analytics
- **Export/Delete** - Can export data, delete organization

#### **2. MANAGER (Operations Management)**
```bash
OperationsManager
```
- **Operational access** - Upload documents, view reports, manage settings
- **Limited user management** - Invite/remove STAFF users only
- **Company settings** - Limited to operational settings (not billing/legal)
- **Data access** - All compliance documents and reports
- **No billing access** - Cannot change plans or view invoicing

#### **3. SUPERVISOR (Shift Management)**
```bash
ShiftSupervisor
```
- **Shift-level access** - Upload documents, view recent reports
- **No user management** - Cannot invite or manage users
- **Limited settings** - Can update shift-specific preferences
- **Data access** - Documents uploaded during their shifts
- **No company settings** - Cannot change business configuration

#### **4. STAFF (Basic Users)**
```bash
GeneralStaff
```
- **Upload only** - Can photograph and upload delivery dockets
- **View own uploads** - See documents they personally uploaded
- **No management access** - Cannot change any settings
- **No reports** - Cannot access analytics or reports
- **No user management** - Cannot see other users

---

## 🔐 **PERMISSION MATRIX**

### **Feature Access Control**
```typescript
interface PermissionMatrix {
  // Document Management
  uploadDocuments: ['OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF'];
  viewAllDocuments: ['OWNER', 'MANAGER'];
  viewOwnDocuments: ['SUPERVISOR', 'STAFF'];
  deleteDocuments: ['OWNER', 'MANAGER'];
  
  // User Management  
  inviteUsers: ['OWNER', 'MANAGER'];
  removeUsers: ['OWNER', 'MANAGER'];
  changeUserRoles: ['OWNER'];
  viewUserList: ['OWNER', 'MANAGER'];
  
  // Company Settings
  editBusinessDetails: ['OWNER'];
  editComplianceRules: ['OWNER', 'MANAGER'];
  editBranding: ['OWNER'];
  viewSettings: ['OWNER', 'MANAGER', 'SUPERVISOR'];
  
  // Billing & Subscriptions
  manageBilling: ['OWNER'];
  viewUsage: ['OWNER'];
  changeSubscription: ['OWNER'];
  downloadInvoices: ['OWNER'];
  
  // Reports & Analytics
  viewComplianceReports: ['OWNER', 'MANAGER'];
  exportReports: ['OWNER', 'MANAGER'];
  viewAnalytics: ['OWNER', 'MANAGER'];
  viewBasicStats: ['SUPERVISOR'];
  
  // System Administration
  exportData: ['OWNER'];
  deleteOrganization: ['OWNER'];
  viewAuditLogs: ['OWNER'];
}
```

---

## 🏗️ **DATABASE SCHEMA**

### **Organizations Table**
```sql
CREATE TABLE Organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  business_address TEXT NOT NULL,
  business_phone VARCHAR(20),
  business_email VARCHAR(255),
  food_license_number VARCHAR(100),
  alcohol_license_number VARCHAR(100),
  council_area VARCHAR(100),
  stripe_customer_id VARCHAR(255),
  subscription_plan VARCHAR(20) DEFAULT 'LITE',
  subscription_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Users Table**
```sql
CREATE TABLE Users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES Organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF')),
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES Users(id),
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **User Invitations Table**
```sql
CREATE TABLE UserInvitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES Organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  invited_by UUID NOT NULL REFERENCES Users(id),
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔒 **ROW LEVEL SECURITY (RLS) POLICIES**

### **Organization Data Isolation**
```sql
-- Users can only see their own organization's data
CREATE POLICY "OrganizationDataIsolation" ON Organizations
FOR ALL USING (
  id IN (
    SELECT organization_id FROM Users 
    WHERE id = auth.uid()
  )
);

-- Users can only see users from their organization
CREATE POLICY "OrganizationUserIsolation" ON Users
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM Users 
    WHERE id = auth.uid()
  )
);
```

### **Role-Based Document Access**
```sql
-- OWNER and MANAGER can see all organization documents
CREATE POLICY "ManagerDocumentAccess" ON ComplianceDocuments
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM Users 
    WHERE id = auth.uid() 
    AND role IN ('OWNER', 'MANAGER')
  )
);

-- SUPERVISOR and STAFF can only see their own uploads
CREATE POLICY "StaffDocumentAccess" ON ComplianceDocuments
FOR SELECT USING (
  uploaded_by = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM Users 
    WHERE id = auth.uid()
  )
);
```

---

## 🎨 **USER INTERFACE COMPONENTS**

### **Role-Based Navigation**
```typescript
// NavigationMenu.tsx
const NavigationMenu = ({ userRole }: { userRole: UserRole }) => {
  const menuItems = {
    OWNER: [
      { label: 'Dashboard', href: '/app/dashboard', icon: 'dashboard' },
      { label: 'Upload', href: '/app/upload', icon: 'upload' },
      { label: 'Reports', href: '/app/reports', icon: 'reports' },
      { label: 'Team', href: '/admin/team', icon: 'users' },
      { label: 'Settings', href: '/admin/settings', icon: 'settings' },
      { label: 'Billing', href: '/admin/billing', icon: 'billing' }
    ],
    MANAGER: [
      { label: 'Dashboard', href: '/app/dashboard', icon: 'dashboard' },
      { label: 'Upload', href: '/app/upload', icon: 'upload' },
      { label: 'Reports', href: '/app/reports', icon: 'reports' },
      { label: 'Team', href: '/admin/team', icon: 'users' },
      { label: 'Settings', href: '/admin/settings', icon: 'settings' }
    ],
    SUPERVISOR: [
      { label: 'Dashboard', href: '/app/dashboard', icon: 'dashboard' },
      { label: 'Upload', href: '/app/upload', icon: 'upload' },
      { label: 'My Uploads', href: '/app/my-uploads', icon: 'documents' }
    ],
    STAFF: [
      { label: 'Upload', href: '/app/upload', icon: 'upload' },
      { label: 'My Uploads', href: '/app/my-uploads', icon: 'documents' }
    ]
  };

  return (
    <nav className="NavigationMenu">
      {menuItems[userRole].map(item => (
        <NavigationLink key={item.href} {...item} />
      ))}
    </nav>
  );
};
```

### **User Invitation Interface**
```typescript
// UserInvitationModal.tsx
const UserInvitationModal = () => {
  const [invitationData, setInvitationData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'STAFF' as UserRole
  });

  const handleInviteUser = async () => {
    // Send invitation email with unique token
    // Create pending invitation record
    // Notify existing team members
  };

  return (
    <Modal title="Invite Team Member">
      <form onSubmit={handleInviteUser}>
        <InputField label="Email" value={invitationData.email} />
        <InputField label="First Name" value={invitationData.firstName} />
        <InputField label="Last Name" value={invitationData.lastName} />
        <SelectField 
          label="Role" 
          value={invitationData.role}
          options={[
            { value: 'STAFF', label: 'Staff - Upload only' },
            { value: 'SUPERVISOR', label: 'Supervisor - Shift management' },
            { value: 'MANAGER', label: 'Manager - Full operations' }
          ]}
        />
        <Button type="submit">Send Invitation</Button>
      </form>
    </Modal>
  );
};
```

---

## 🔄 **ONBOARDING WORKFLOW**

### **Step 1: Account Creation**
```typescript
const CreateAccountFlow = () => {
  // 1. Business information form
  // 2. Owner details form
  // 3. Password setup
  // 4. Terms acceptance
  // 5. Plan selection (LITE default)
  // 6. Payment setup (if not LITE)
  // 7. Account verification email
};
```

### **Step 2: Welcome & Setup**
```typescript
const WelcomeSetupFlow = () => {
  // 1. Welcome message with quick tour
  // 2. Upload first test document
  // 3. Configure compliance settings
  // 4. Invite first team member
  // 5. Setup complete - redirect to dashboard
};
```

### **Step 3: Team Invitation Process**
```typescript
const TeamInvitationFlow = () => {
  // 1. Owner sends invitation email
  // 2. Invited user clicks link
  // 3. User creates password
  // 4. User accepts invitation
  // 5. User added to organization
  // 6. Welcome email sent
};
```

---

## 🛡️ **SECURITY CONSIDERATIONS**

### **Authentication Security**
```typescript
// Strong password requirements
const PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// Multi-factor authentication (future)
const MFASettings = {
  enabled: false, // Start simple, add later
  methods: ['email', 'sms', 'authenticator']
};
```

### **Session Management**
```typescript
// Secure session handling
const SessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours
  autoLogout: 2 * 60 * 60, // 2 hours inactivity
  maxConcurrentSessions: 3
};
```

### **Data Protection**
```typescript
// Audit logging for sensitive actions
const AuditableActions = [
  'user_invited',
  'user_removed',
  'role_changed',
  'billing_updated',
  'organization_deleted',
  'data_exported'
];
```

---

## 📱 **IPAD AIR COMPATIBILITY**

### **Touch-Optimized Role Selection**
```css
.RoleSelector {
  /* Large touch targets for role selection */
  min-height: 44px;
  border-radius: 8px;
  margin: 8px 0;
}

.UserInvitationForm {
  /* Simple, clear form layout */
  font-size: 16px; /* Prevents zoom on iOS */
  padding: 16px;
}
```

### **Simplified User Management**
```typescript
// Keep user management simple for iPad Air
const UserManagementInterface = {
  viewType: 'card', // Easy to tap
  actionButtons: 'large', // 44px minimum
  confirmationDialogs: 'clear', // Simple yes/no
  bulkActions: 'disabled' // Too complex for tablet
};
```

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Phase 1: Core Authentication (Week 1)**
1. Organization registration
2. User creation with roles
3. Basic RLS policies
4. Role-based navigation

### **Phase 2: User Management (Week 2)**
1. User invitation system
2. Role management interface
3. Team member listing
4. Basic audit logging

### **Phase 3: Security Hardening (Week 3)**
1. Advanced RLS policies
2. Session management
3. Password requirements
4. Security audit trail

### **Phase 4: UX Polish (Week 4)**
1. iPad Air optimization
2. Onboarding flow refinement
3. Error handling improvements
4. Performance optimization

---

## ✅ **SUCCESS CRITERIA**

### **Security Requirements**
- [ ] Complete data isolation between organizations
- [ ] Role-based access controls functioning
- [ ] Secure user invitation process
- [ ] Password security enforced
- [ ] Audit trail for sensitive actions

### **User Experience Requirements**
- [ ] Intuitive onboarding flow (< 5 minutes)
- [ ] Clear role-based navigation
- [ ] Easy team member management
- [ ] iPad Air compatible interface
- [ ] Error messages are helpful and clear

### **Business Requirements**
- [ ] Supports all subscription tiers
- [ ] Stripe integration for billing
- [ ] Scales to 100+ organizations
- [ ] Admin can manage organization settings
- [ ] Compliance data properly isolated

---

## 🔧 **DEVELOPMENT NOTES**

**Use established patterns from your current codebase:**
- Follow PascalCase naming convention
- Integrate with existing Supabase setup
- Use current component library patterns
- Maintain iPad Air Safari 12 compatibility
- Follow your existing database naming conventions

**Edge Functions Needed:**
- `HandleUserInvitation` - Process invitation emails
- `CreateOrganization` - Set up new client account
- `ManageUserRoles` - Handle role changes
- `OrganizationCleanup` - Handle account deletions

**Remember:**
- Test all role combinations thoroughly
- Ensure no data leakage between organizations
- Keep interface simple for small business users
- Plan for future role additions (ADMIN, READONLY, etc.)

This system provides enterprise-grade security while remaining simple enough for small hospitality businesses to understand and use effectively.