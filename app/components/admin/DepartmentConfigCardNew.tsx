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
  { name: 'Kitchen', color: '#EF4444' },
  { name: 'Front of House', color: '#3B82F6' },
  { name: 'Bar', color: '#8B5CF6' },
  { name: 'Management', color: '#10B981' },
  { name: 'Housekeeping', color: '#F59E0B' },
  { name: 'Maintenance', color: '#6B7280' },
  { name: 'Administration', color: '#EC4899' },
  { name: 'Events', color: '#14B8A6' },
  { name: 'Delivery', color: '#F97316' },
  { name: 'Reception', color: '#6366F1' }
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
      icon=""
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