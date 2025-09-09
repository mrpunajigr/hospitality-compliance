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
    isActive: true
  },
  
  stock: {
    key: 'stock', 
    title: 'STOCK',
    description: 'Inventory management and tracking',
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRstockWhite.png',
    pages: createModulePages('stock'),
    isActive: false
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
    iconUrl: 'https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRModuleAdmin.png?t=2025090921', 
    pages: [
      { key: 'console', label: 'Console', href: '/admin/console' },
      { key: 'configure', label: 'Configure', href: '/admin/configure' },
      { key: 'team', label: 'Team', href: '/admin/team' }
    ],
    isActive: true
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