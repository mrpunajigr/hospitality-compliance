# Multi-Tenant Authentication & User Management Plan

## Database Schema Design

### Core Tables

#### 1. `clients` (Organizations/Businesses)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT DEFAULT 'hospitality',
  license_number TEXT, -- NZ alcohol license number
  address JSONB,
  subscription_status TEXT DEFAULT 'active',
  subscription_tier TEXT DEFAULT 'basic',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `profiles` (User Profiles)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE, -- Your admin access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `client_users` (User-Client Relationships)
```sql
CREATE TABLE client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('staff', 'manager', 'admin', 'owner')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, client_id)
);
```

#### 4. `invitations` (Pending Invitations)
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Roles & Permissions

### Role Hierarchy
```typescript
const ROLES = {
  STAFF: {
    name: 'staff',
    permissions: [
      'upload_documents',
      'view_own_uploads',
      'view_basic_reports'
    ]
  },
  MANAGER: {
    name: 'manager', 
    permissions: [
      'upload_documents',
      'view_all_documents',
      'view_compliance_reports',
      'manage_staff',
      'export_data'
    ]
  },
  ADMIN: {
    name: 'admin',
    permissions: [
      'all_manager_permissions',
      'invite_users',
      'manage_user_roles',
      'configure_settings',
      'view_audit_logs'
    ]
  },
  OWNER: {
    name: 'owner',
    permissions: [
      'all_admin_permissions',
      'billing_management',
      'delete_client_data',
      'transfer_ownership'
    ]
  }
};
```

## Row Level Security (RLS) Policies

### Storage Objects Policy
```sql
-- Users can only access files from their client(s)
CREATE POLICY "Multi-tenant file access" ON storage.objects
FOR ALL USING (
  bucket_id = 'delivery-dockets' AND
  (storage.foldername(name))[1] IN (
    SELECT client_id::text FROM client_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

### Client Data Policy
```sql
-- Users can only see clients they belong to
CREATE POLICY "Client access control" ON clients
FOR SELECT USING (
  id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

### Delivery Records Policy
```sql
-- Users can only see delivery records from their client(s)
CREATE POLICY "Client delivery records" ON delivery_records
FOR ALL USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

### User Management Policy
```sql
-- Admins can only manage users within their client
CREATE POLICY "Client user management" ON client_users
FOR ALL USING (
  client_id IN (
    SELECT cu.client_id FROM client_users cu
    WHERE cu.user_id = auth.uid() 
    AND cu.role IN ('admin', 'owner')
    AND cu.status = 'active'
  )
);
```

## Authentication Flow

### 1. User Registration/Invitation
```typescript
// Invitation workflow
async function inviteUser(email: string, clientId: string, role: string) {
  // Check if inviter has admin permissions
  const hasPermission = await checkAdminPermission(auth.user.id, clientId);
  if (!hasPermission) throw new Error('Insufficient permissions');
  
  // Create invitation
  const invitation = await supabase
    .from('invitations')
    .insert({
      email,
      client_id: clientId,
      role,
      invited_by: auth.user.id,
      token: crypto.randomUUID()
    })
    .select()
    .single();
    
  // Send invitation email
  await sendInvitationEmail(invitation);
  
  return invitation;
}
```

### 2. User Signup from Invitation
```typescript
async function acceptInvitation(token: string, password: string) {
  // Validate invitation
  const invitation = await supabase
    .from('invitations')
    .select('*, clients(*)')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();
    
  if (!invitation) throw new Error('Invalid or expired invitation');
  
  // Create auth user
  const { data: authUser } = await supabase.auth.signUp({
    email: invitation.email,
    password
  });
  
  // Create profile
  await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: invitation.email,
      full_name: '' // They'll fill this in
    });
    
  // Create client relationship
  await supabase
    .from('client_users')
    .insert({
      user_id: authUser.user.id,
      client_id: invitation.client_id,
      role: invitation.role,
      status: 'active',
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      joined_at: new Date().toISOString()
    });
    
  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id);
}
```

## Helper Functions

### Permission Checking
```typescript
async function getUserPermissions(userId: string, clientId: string) {
  const { data } = await supabase
    .from('client_users')
    .select('role, permissions, status')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single();
    
  if (!data) return null;
  
  const rolePermissions = ROLES[data.role.toUpperCase()]?.permissions || [];
  const customPermissions = data.permissions || {};
  
  return {
    role: data.role,
    permissions: [...rolePermissions, ...Object.keys(customPermissions)]
  };
}

async function hasPermission(userId: string, clientId: string, permission: string) {
  const userPerms = await getUserPermissions(userId, clientId);
  return userPerms?.permissions.includes(permission) || false;
}
```

### Client Context
```typescript
async function getCurrentClientContext(userId: string) {
  const { data } = await supabase
    .from('client_users')
    .select(`
      client_id,
      role,
      clients (
        id,
        name,
        subscription_status,
        subscription_tier
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active');
    
  return data;
}
```

## Frontend Implementation

### Context Provider
```typescript
const ClientContext = createContext();

export function ClientProvider({ children }) {
  const [currentClient, setCurrentClient] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  
  // Load user's client context on auth
  useEffect(() => {
    if (user) {
      loadClientContext(user.id);
    }
  }, [user]);
  
  return (
    <ClientContext.Provider value={{
      currentClient,
      userRole,
      permissions,
      switchClient: setCurrentClient
    }}>
      {children}
    </ClientContext.Provider>
  );
}
```

### Route Protection
```typescript
function ProtectedRoute({ children, requiredPermission, requiredRole }) {
  const { permissions, userRole } = useContext(ClientContext);
  
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Unauthorized />;
  }
  
  if (requiredRole && !hasRole(userRole, requiredRole)) {
    return <Unauthorized />;
  }
  
  return children;
}
```

## Email Templates for Invitations

### Invitation Email
```typescript
const INVITATION_EMAIL_TEMPLATE = {
  subject: `You've been invited to join {{client_name}} on Delivery Compliance`,
  html: `
    <h2>You've been invited!</h2>
    <p>{{inviter_name}} has invited you to join {{client_name}} as a {{role}}.</p>
    <p>Click the link below to accept your invitation:</p>
    <a href="{{app_url}}/accept-invitation?token={{token}}">Accept Invitation</a>
    <p>This invitation expires in 7 days.</p>
  `
};
```

---

This multi-tenant system gives you:
- **Complete client isolation**
- **Flexible role-based permissions**
- **Secure invitation workflow** 
- **Scalable for unlimited clients**
- **Compliance audit trails**
- **Ready for Stripe integration**