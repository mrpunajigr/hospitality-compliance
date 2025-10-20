'use client'

import ConfigCardTemplate from './ConfigCardTemplate'
import { SECURITY_LEVELS } from '@/app/types/config-card'
import type { ConfigItem } from '@/app/types/config-card'

// StorageArea interface extending ConfigItem
interface StorageArea extends ConfigItem {
  area_type: 'pantry' | 'storeroom' | 'fridge' | 'freezer' | 'chiller' | 'underbench' | 'other'
  temperature_min?: number
  temperature_max?: number
  location_description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// Built-in storage areas with colors and area types
const BUILTIN_STORAGE_AREAS = [
  { name: 'Pantry', color: '#F59E0B', area_type: 'pantry' },
  { name: 'Storeroom', color: '#6B7280', area_type: 'storeroom' },
  { name: 'Fridge 1', color: '#3B82F6', area_type: 'fridge' },
  { name: 'Fridge 2', color: '#1E40AF', area_type: 'fridge' },
  { name: 'Walk-in Chiller', color: '#06B6D4', area_type: 'chiller' },
  { name: 'Freezer', color: '#8B5CF6', area_type: 'freezer' },
  { name: 'Under Bench Fridge', color: '#10B981', area_type: 'underbench' },
  { name: 'Under Bench Freezer', color: '#EC4899', area_type: 'underbench' }
]

// Custom form fields for storage areas
const STORAGE_FORM_FIELDS = [
  {
    key: 'name',
    label: 'Area Name',
    type: 'text' as const,
    placeholder: 'e.g., Cold Room 3',
    required: true
  },
  {
    key: 'area_type',
    label: 'Area Type',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'pantry', label: 'Pantry' },
      { value: 'storeroom', label: 'Storeroom' },
      { value: 'fridge', label: 'Fridge' },
      { value: 'freezer', label: 'Freezer' },
      { value: 'chiller', label: 'Chiller' },
      { value: 'underbench', label: 'Under Bench' },
      { value: 'other', label: 'Other' }
    ]
  }
]

export default function StorageConfigCardNew() {
  const securityLevel = {
    level: 'high' as const,
    label: 'Restricted',
    description: 'Changes affect storage compliance and food safety',
    color: 'text-orange-400'
  }

  return (
    <ConfigCardTemplate<StorageArea>
      title="Storage"
      description="Set areas"
      icon=""
      securityLevel={securityLevel}
      apiEndpoint="/api/config/storage-areas"
      builtInItems={BUILTIN_STORAGE_AREAS}
      itemDisplayKey="name"
      itemTypeKey="area_type"
      colorKey="color"
      canRename={true}
      canToggle={true}
      canAddCustom={true}
      customFields={STORAGE_FORM_FIELDS}
      customItemDefaults={{
        area_type: 'fridge',
        is_active: true
      }}
    />
  )
}