import { ReactNode } from 'react'

// Security level configuration
export interface SecurityLevel {
  level: 'low' | 'medium' | 'high' | 'critical'
  label: string
  description: string
  color: string
}

// User permissions for RBAC
export interface UserPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canViewSecurity?: boolean
}

// Built-in item configuration
export interface BuiltInItem {
  name: string
  description?: string
  color?: string
  icon?: string
  area_type?: string
  default_role?: string
  [key: string]: any // Allow additional properties
}

// Generic item interface that all config items should extend
export interface ConfigItem {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at?: string
  [key: string]: any // Allow additional properties
}

// API response structure
export interface ConfigApiResponse<T> {
  items: T[]
  userPermissions: UserPermissions
  error?: string
}

// Form data for creating new items
export interface CreateItemData {
  name: string
  description?: string
  color?: string
  icon?: string
  [key: string]: any
}

// Configuration for different field types in the add form
export interface FormField {
  key: string
  label: string
  type: 'text' | 'select' | 'color' | 'number'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: any
}

// Main template props
export interface ConfigCardTemplateProps<T extends ConfigItem> {
  // Basic card configuration
  title: string
  description: string
  icon?: string
  securityLevel: SecurityLevel

  // Data configuration
  apiEndpoint: string
  builtInItems: BuiltInItem[]
  
  // Display configuration
  itemDisplayKey: keyof T
  itemTypeKey?: keyof T
  colorKey?: keyof T
  
  // Feature toggles
  canRename?: boolean
  canToggle?: boolean
  canAddCustom?: boolean
  
  // Custom form fields for adding new items
  customFields?: FormField[]
  
  // Custom item defaults
  customItemDefaults?: Partial<CreateItemData>
  
  // Custom renderers
  renderItem?: (item: T, isBuiltIn: boolean, builtInConfig?: BuiltInItem) => ReactNode
  renderAddForm?: (fields: FormField[], onSubmit: (data: CreateItemData) => void) => ReactNode
  
  // Event handlers
  onItemToggle?: (item: T, enabled: boolean) => void
  onItemRename?: (item: T, newName: string) => void
  onItemAdd?: (data: CreateItemData) => void
  onItemDelete?: (item: T) => void
  
  // Styling overrides
  className?: string
}

// Hook return type for data management
export interface UseConfigCardData<T extends ConfigItem> {
  // Data state
  items: T[]
  userPermissions: UserPermissions
  isLoading: boolean
  error: string | null
  
  // Actions
  loadItems: () => Promise<void>
  toggleItem: (builtInItem: BuiltInItem, enable: boolean) => Promise<void>
  renameItem: (item: T, newName: string) => Promise<void>
  addCustomItem: (data: CreateItemData) => Promise<void>
  deleteItem: (item: T) => Promise<void>
  
  // UI state
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  renamingItem: string | null
  setRenamingItem: (id: string | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
}

// Predefined security levels
export const SECURITY_LEVELS: Record<string, SecurityLevel> = {
  low: {
    level: 'low',
    label: 'Standard',
    description: 'Basic configuration changes',
    color: 'text-green-400'
  },
  medium: {
    level: 'medium',
    label: 'Elevated',
    description: 'Changes affect user access',
    color: 'text-yellow-400'
  },
  high: {
    level: 'high',
    label: 'Restricted',
    description: 'Changes affect security permissions',
    color: 'text-orange-400'
  },
  critical: {
    level: 'critical',
    label: 'Critical',
    description: 'Changes affect system security',
    color: 'text-red-400'
  }
}

// Default form fields that most config cards will use
export const DEFAULT_FORM_FIELDS: FormField[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter name',
    required: true
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Enter description (optional)',
    required: false
  }
]