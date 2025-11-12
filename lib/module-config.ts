/**
 * Module Configuration System
 * 
 * Centralized configuration for all hospitality compliance modules
 * including icons, descriptions, and standard page structures.
 */

export interface ModulePage {
  key: string
  label: string
  href: string
}

export interface ModuleConfig {
  key: string
  title: string
  description: string
  iconUrl: string
  pages: ModulePage[]
  isActive: boolean
  theme?: 'light' | 'dark' // light = light text for dark backgrounds, dark = dark text for light backgrounds
}

// Standard 3-page structure for each module
const createModulePages = (moduleKey: string): ModulePage[] => [
  {
    key: 'console',
    label: 'Console', 
    href: `/${moduleKey}/console`
  },
  {
    key: 'capture',
    label: moduleKey === 'upload' ? 'Capture' : 'Action',
    href: `/${moduleKey}/${moduleKey === 'upload' ? 'capture' : 'action'}`
  },
  {
    key: 'reports',
    label: 'Reports',
    href: `/${moduleKey}/reports`
  }
]

// Module configuration registry
export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  upload: {
    key: 'upload',
    title: 'UPLOAD',
    description: 'Document upload, processing, and compliance management',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRModuleUpload.png',
    pages: createModulePages('upload'),
    isActive: true,
    theme: 'light' // Light text for dark background
  },
  
  stock: {
    key: 'stock', 
    title: 'STOCK',
    description: 'Inventory management and tracking',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRstockWhite.png',
    pages: [
      {
        key: 'items',
        label: 'Items',
        href: '/stock/items'
      },
      {
        key: 'console',
        label: 'Console', 
        href: '/stock/console'
      },
      {
        key: 'reports',
        label: 'Reports',
        href: '/stock/reports'
      }
    ],
    isActive: true,
    theme: 'light' // Light text for dark backgrounds
  },
  
  temperature: {
    key: 'temperature',
    title: 'TEMPERATURE', 
    description: 'Fridge and freezer monitoring',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRtemp.png',
    pages: createModulePages('temperature'),
    isActive: false
  },
  
  admin: {
    key: 'admin',
    title: 'ADMIN',
    description: 'Configuring your operation',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRModuleAdmin.png?t=2025090922', 
    pages: [
      { key: 'console', label: 'Console', href: '/admin/console' },
      { key: 'configure', label: 'Configure', href: '/admin/configure' },
      { key: 'team', label: 'Team', href: '/admin/team' }
    ],
    isActive: true,
    theme: 'dark' // Dark text for light background
  },
  
  diary: {
    key: 'diary',
    title: 'DIARY',
    description: 'Daily logs and incident reporting', 
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRdiaryWhite.png',
    pages: createModulePages('diary'),
    isActive: false
  },
  
  recipes: {
    key: 'recipes',
    title: 'RECIPES',
    description: 'Recipe management and costing',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRrecipes.png',
    pages: createModulePages('recipes'), 
    isActive: false
  },
  
  stocktake: {
    key: 'stocktake',
    title: 'STOCKTAKE',
    description: 'Inventory audits and reconciliation',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRstocktake.png',
    pages: createModulePages('stocktake'),
    isActive: false
  },
  
  count: {
    key: 'count',
    title: 'COUNT',
    description: 'Stocktake and inventory counting',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRstocktake.png',
    pages: [
      {
        key: 'new',
        label: 'New Count',
        href: '/count/new'
      },
      {
        key: 'console',
        label: 'Console',
        href: '/count/console'
      },
      {
        key: 'history',
        label: 'History',
        href: '/count/history'
      }
    ],
    isActive: true,
    theme: 'light' // Light text for dark backgrounds
  },

  dev: {
    key: 'dev',
    title: 'DEV',
    description: 'Development tools and configuration management',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRModuleAdmin.png',
    pages: [
      { key: 'architecture-testing', label: 'Architecture', href: '/dev/architecture-testing' },
      { key: 'configcard-planner', label: 'ConfigCard Planner', href: '/dev/configcard-planner' },
      { key: 'configcard-designer', label: 'ConfigCard Designer', href: '/dev/configcard-designer' },
      { key: 'console', label: 'Console', href: '/dev/console' }
    ],
    isActive: true,
    theme: 'dark' // Dark text for light background
  }
}

/**
 * Get module configuration by key
 */
export function getModuleConfig(moduleKey: string): ModuleConfig | null {
  return MODULE_CONFIGS[moduleKey] || null
}

/**
 * Get all active modules
 */
export function getActiveModules(): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS).filter(module => module.isActive)
}

/**
 * Get all modules (active and inactive)
 */
export function getAllModules(): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS)
}

/**
 * Check if a module is active
 */
export function isModuleActive(moduleKey: string): boolean {
  const config = getModuleConfig(moduleKey)
  return config ? config.isActive : false
}