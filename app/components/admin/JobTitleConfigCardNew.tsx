'use client'

import ConfigCardTemplate from './ConfigCardTemplate'
import { SECURITY_LEVELS } from '@/app/types/config-card'
import type { ConfigItem } from '@/app/types/config-card'

// JobTitle interface extending ConfigItem
interface JobTitle extends ConfigItem {
  title: string
  description: string | null
  default_role: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// Built-in hospitality job titles (removed descriptions, kept roles for security)
const BUILTIN_JOBS = [
  { name: 'Server', color: '#3B82F6', default_role: 'STAFF' },
  { name: 'Host/Hostess', color: '#10B981', default_role: 'STAFF' },
  { name: 'Bartender', color: '#8B5CF6', default_role: 'STAFF' },
  { name: 'Kitchen Hand', color: '#EF4444', default_role: 'STAFF' },
  { name: 'Chef', color: '#F59E0B', default_role: 'STAFF' },
  { name: 'Shift Supervisor', color: '#6B7280', default_role: 'SUPERVISOR' },
  { name: 'Assistant Manager', color: '#EC4899', default_role: 'SUPERVISOR' },
  { name: 'Head Chef', color: '#14B8A6', default_role: 'MANAGER' },
  { name: 'Restaurant Manager', color: '#F97316', default_role: 'MANAGER' },
  { name: 'Owner', color: '#6366F1', default_role: 'OWNER' }
]

export default function JobTitleConfigCardNew() {
  const securityLevel = {
    level: 'high' as const,
    label: 'Restricted',
    description: 'Changes affect user roles and system permissions',
    color: 'text-orange-400'
  }

  return (
    <ConfigCardTemplate<JobTitle>
      title="Jobs"
      description="Define jobs"
      icon=""
      securityLevel={securityLevel}
      apiEndpoint="/api/config/job-titles"
      builtInItems={BUILTIN_JOBS}
      itemDisplayKey="title"
      itemTypeKey="default_role"
      colorKey="color"
      canRename={true}
      canToggle={true}
      canAddCustom={true}
      customItemDefaults={{
        description: 'Custom job title',
        default_role: 'STAFF',
        hierarchy_level: 1,
        security_clearance: 'standard',
        primary_department_id: '',
        reports_to_title_id: '',
        sort_order: 0
      }}
    />
  )
}