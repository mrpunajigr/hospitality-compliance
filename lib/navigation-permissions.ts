// Navigation Permissions System
// Controls which navigation items are visible based on user roles

export type UserRole = 'STAFF' | 'SUPERVISOR' | 'MANAGER' | 'OWNER'

export interface NavigationItem {
  name: string
  href: string
  icon: string
  section: 'quickActions' | 'modules' | 'settings'
  context?: 'admin' | 'console' | 'both' | 'upload' | 'operations'
  requiredPermissions: UserRole[]
  description?: string
  subItems?: NavigationSubItem[]
}

export interface NavigationSubItem {
  name: string
  href: string
  icon?: string
  requiredPermissions: UserRole[]
  description?: string
}

// Permission Matrix - what each role can access
export const ROLE_PERMISSIONS = {
  STAFF: {
    canUpload: true,
    canViewOwnRecords: true,
    canViewReports: false,
    canManageTeam: false,
    canAccessAdmin: false,
    canAccessBilling: false,
    canAccessSettings: false,
    canInviteUsers: false,
    canViewAllRecords: false,
    canAccessTraining: false,
    canAccessAnalytics: false,
    canAccessModules: ['upload']
  },
  SUPERVISOR: {
    canUpload: true,
    canViewOwnRecords: true,
    canViewReports: true,
    canManageTeam: false,
    canAccessAdmin: false,
    canAccessBilling: false,
    canAccessSettings: false,
    canInviteUsers: false,
    canViewAllRecords: true,
    canAccessTraining: true,
    canAccessAnalytics: true,
    canAccessModules: ['upload', 'temperature', 'diary']
  },
  MANAGER: {
    canUpload: true,
    canViewOwnRecords: true,
    canViewReports: true,
    canManageTeam: true,
    canAccessAdmin: true,
    canAccessBilling: false,
    canAccessSettings: true,
    canInviteUsers: true,
    canViewAllRecords: true,
    canAccessTraining: true,
    canAccessAnalytics: true,
    canAccessModules: ['upload', 'temperature', 'diary', 'stock', 'repairs', 'menus']
  },
  OWNER: {
    canUpload: true,
    canViewOwnRecords: true,
    canViewReports: true,
    canManageTeam: true,
    canAccessAdmin: true,
    canAccessBilling: true,
    canAccessSettings: true,
    canInviteUsers: true,
    canViewAllRecords: true,
    canAccessTraining: true,
    canAccessAnalytics: true,
    canAccessModules: ['upload', 'temperature', 'diary', 'stock', 'repairs', 'menus', 'recipes', 'stocktake']
  }
} as const

// Role hierarchy levels for permission inheritance
export const ROLE_HIERARCHY = {
  STAFF: 1,
  SUPERVISOR: 2,
  MANAGER: 3,
  OWNER: 4
} as const

// Check if user has permission for a specific action
export function hasPermission(userRole: UserRole, permission: keyof typeof ROLE_PERMISSIONS['OWNER']): boolean {
  return ROLE_PERMISSIONS[userRole][permission] as boolean
}

// Check if user can access a specific module
export function canAccessModule(userRole: UserRole, moduleName: string): boolean {
  const allowedModules = [...(ROLE_PERMISSIONS[userRole].canAccessModules as readonly string[])]
  return allowedModules.includes(moduleName)
}

// Check if user role has sufficient level for action
export function hasRoleLevel(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

// Role-Based Navigation Configuration
export const NAVIGATION_CONFIG: NavigationItem[] = [
  // Upload Module - Available to all roles
  {
    name: 'Upload',
    href: '/upload/console',
    icon: '/icons/JiGRcamera.png',
    section: 'modules',
    context: 'both',
    requiredPermissions: ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
    description: 'Document scanning and processing',
    subItems: [
      {
        name: 'Console',
        href: '/upload/console',
        icon: '📊',
        requiredPermissions: ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
        description: 'Main upload dashboard'
      },
      {
        name: 'Capture',
        href: '/upload/capture',
        icon: '📤',
        requiredPermissions: ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
        description: 'Take photos of documents'
      },
      {
        name: 'Reports',
        href: '/upload/reports',
        icon: '📋',
        requiredPermissions: ['SUPERVISOR', 'MANAGER', 'OWNER'],
        description: 'Upload reports and analytics'
      },
      {
        name: 'Training',
        href: '/upload/training',
        icon: '🎯',
        requiredPermissions: ['SUPERVISOR', 'MANAGER', 'OWNER'],
        description: 'Training data and model improvements'
      }
    ]
  },

  // Admin Console - Manager+ only
  {
    name: 'Admin',
    href: '/admin/console',
    icon: '/icons/JiGRadmin.png',
    section: 'settings',
    context: 'admin',
    requiredPermissions: ['MANAGER', 'OWNER'],
    description: 'Administrative controls',
    subItems: [
      {
        name: 'Team',
        href: '/admin/team',
        icon: '👥',
        requiredPermissions: ['MANAGER', 'OWNER'],
        description: 'Manage team members and invitations'
      },
      {
        name: 'Company',
        href: '/admin/company',
        icon: '🏢',
        requiredPermissions: ['MANAGER', 'OWNER'],
        description: 'Company settings and configuration'
      },
      {
        name: 'Settings',
        href: '/admin/company-settings',
        icon: '⚙️',
        requiredPermissions: ['MANAGER', 'OWNER'],
        description: 'System configuration'
      },
      {
        name: 'Billing',
        href: '/admin/company/billing',
        icon: '💳',
        requiredPermissions: ['OWNER'],
        description: 'Billing and subscription management'
      }
    ]
  },

  // Operations Dashboard - Supervisor+ access
  {
    name: 'Dashboard',
    href: '/operations/dashboard',
    icon: '/icons/JiGRdiaryWhite.png',
    section: 'quickActions',
    context: 'operations',
    requiredPermissions: ['SUPERVISOR', 'MANAGER', 'OWNER'],
    description: 'Main dashboard overview'
  },

  // Future Modules - Based on role permissions
  {
    name: 'Temperature',
    href: '/modules/temperature',
    icon: '/ModuleIcons/JiGRtemps.png',
    section: 'modules',
    context: 'both',
    requiredPermissions: ['SUPERVISOR', 'MANAGER', 'OWNER'],
    description: 'Temperature monitoring and alerts'
  },

  {
    name: 'Stock',
    href: '/modules/stock',
    icon: '/ModuleIcons/JiGRstock.png',
    section: 'modules',
    context: 'both',
    requiredPermissions: ['MANAGER', 'OWNER'],
    description: 'Inventory management'
  },

  {
    name: 'Repairs',
    href: '/modules/repairs',
    icon: '/ModuleIcons/JiGRrepair.png',
    section: 'modules',
    context: 'both',
    requiredPermissions: ['MANAGER', 'OWNER'],
    description: 'Equipment maintenance tracking'
  },

  {
    name: 'Menus',
    href: '/modules/menus',
    icon: '/ModuleIcons/JiGRmenus.png',
    section: 'modules',
    context: 'both',
    requiredPermissions: ['MANAGER', 'OWNER'],
    description: 'Menu planning and management'
  },

  {
    name: 'Recipes',
    href: '/modules/recipes',
    icon: '/ModuleIcons/JiGRrecipe.png',
    section: 'modules',
    context: 'both',
    requiredPermissions: ['OWNER'],
    description: 'Recipe management and costing'
  },

  // Profile - Available to all users
  {
    name: 'Profile',
    href: '/admin/profile',
    icon: '/icons/JiGRadmin.png',
    section: 'settings',
    context: 'both',
    requiredPermissions: ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
    description: 'Personal profile settings'
  }
]

// Filter navigation items based on user role
export function getVisibleNavigation(userRole: UserRole, section?: string, context?: string): NavigationItem[] {
  return NAVIGATION_CONFIG.filter(item => {
    // Check role permissions
    const hasRolePermission = item.requiredPermissions.includes(userRole)
    if (!hasRolePermission) return false

    // Check section filter
    if (section && item.section !== section) return false

    // Check context filter
    if (context && item.context && item.context !== context && item.context !== 'both') return false

    return true
  }).map(item => ({
    ...item,
    // Filter sub-items based on role
    subItems: item.subItems?.filter(subItem => subItem.requiredPermissions.includes(userRole))
  }))
}

// Get role display information
export function getRoleDisplayInfo(role: UserRole) {
  const roleInfo = {
    STAFF: {
      label: 'Staff Member',
      color: 'bg-blue-500',
      description: 'Can upload documents and view own records',
      level: 1
    },
    SUPERVISOR: {
      label: 'Supervisor',
      color: 'bg-green-500',
      description: 'Can manage shifts and access reports',
      level: 2
    },
    MANAGER: {
      label: 'Manager',
      color: 'bg-purple-500',
      description: 'Can manage team and access admin features',
      level: 3
    },
    OWNER: {
      label: 'Owner',
      color: 'bg-yellow-500',
      description: 'Full system access including billing',
      level: 4
    }
  }

  return roleInfo[role]
}