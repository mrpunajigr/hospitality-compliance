'use client'

import ConfigCardTemplate from './ConfigCardTemplate'
import { SECURITY_LEVELS } from '@/app/types/config-card'
import type { ConfigItem } from '@/app/types/config-card'

// Department interface extending ConfigItem
interface Department extends ConfigItem {
  name: string
  description: string | null
  color: string
  icon: string
  security_level: 'low' | 'medium' | 'high' | 'critical'
  sort_order: number
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

// Built-in hospitality departments
const BUILTIN_DEPARTMENTS = [
  { name: 'Kitchen', color: '#EF4444', description: 'Food preparation and cooking' },
  { name: 'Front of House', color: '#3B82F6', description: 'Customer service and dining' },
  { name: 'Bar', color: '#8B5CF6', description: 'Beverage service and bartending' },
  { name: 'Management', color: '#10B981', description: 'Administrative and oversight' },
  { name: 'Housekeeping', color: '#F59E0B', description: 'Cleaning and maintenance' },
  { name: 'Maintenance', color: '#6B7280', description: 'Repairs and facility upkeep' },
  { name: 'Administration', color: '#EC4899', description: 'Office and paperwork' },
  { name: 'Events', color: '#14B8A6', description: 'Special events and functions' },
  { name: 'Delivery', color: '#F97316', description: 'Food delivery and logistics' },
  { name: 'Reception', color: '#6366F1', description: 'Guest check-in and concierge' }
]

export default function DepartmentConfigCardNew() {
  const securityLevel = {
    level: 'medium' as const,
    label: 'Elevated',
    description: 'Changes affect departmental organization and user access',
    color: 'text-yellow-400'
  }

  return (
    <ConfigCardTemplate<Department>
      title="Departments"
      description="Select areas"
      securityLevel={securityLevel}
      apiEndpoint="/api/config/departments"
      builtInItems={BUILTIN_DEPARTMENTS}
      itemDisplayKey="name"
      colorKey="color"
      canRename={true}
      canToggle={true}
      canAddCustom={true}
      customItemDefaults={{
        description: 'Custom department',
        color: '#6B7280',
        icon: '●',
        security_level: 'medium',
        sort_order: 0
      }}
    />
  )
}