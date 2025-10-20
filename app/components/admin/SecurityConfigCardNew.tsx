'use client'

import ConfigCardTemplate from './ConfigCardTemplate'
import { SECURITY_LEVELS } from '@/app/types/config-card'
import type { ConfigItem } from '@/app/types/config-card'

// SecuritySetting interface extending ConfigItem
interface SecuritySetting extends ConfigItem {
  setting_key: string
  setting_value: any
  is_enabled: boolean
  category?: string
  created_at: string
  updated_at: string
}

// Built-in security settings for hospitality businesses (keeping descriptions & category)
const BUILTIN_SECURITY_SETTINGS = [
  { 
    name: 'Two-Factor Authentication',
    key: 'two_factor_auth', 
    color: '#EF4444', 
    description: 'Require 2FA for all user logins',
    category: 'authentication',
    defaultValue: false
  },
  { 
    name: 'Session Timeout',
    key: 'session_timeout', 
    color: '#F59E0B', 
    description: 'Auto-logout after 30 minutes of inactivity',
    category: 'sessions',
    defaultValue: 30
  },
  { 
    name: 'Strong Passwords',
    key: 'password_complexity', 
    color: '#10B981', 
    description: 'Require complex passwords with symbols',
    category: 'authentication',
    defaultValue: true
  },
  { 
    name: 'Login Monitoring',
    key: 'login_monitoring', 
    color: '#3B82F6', 
    description: 'Track and alert on failed login attempts',
    category: 'monitoring',
    defaultValue: true
  },
  { 
    name: 'IP Restrictions',
    key: 'ip_restrictions', 
    color: '#8B5CF6', 
    description: 'Limit access to approved IP addresses',
    category: 'access',
    defaultValue: false
  },
  { 
    name: 'Device Registration',
    key: 'device_registration', 
    color: '#EC4899', 
    description: 'Require approval for new devices',
    category: 'access',
    defaultValue: false
  },
  { 
    name: 'Enhanced Audit Logs',
    key: 'audit_logging', 
    color: '#14B8A6', 
    description: 'Detailed tracking of all user actions',
    category: 'compliance',
    defaultValue: true
  },
  { 
    name: 'Data Retention',
    key: 'data_retention', 
    color: '#6B7280', 
    description: 'Keep compliance records for 7 years',
    category: 'compliance',
    defaultValue: true
  }
]

export default function SecurityConfigCardNew() {
  const securityLevel = {
    level: 'critical' as const,
    label: 'Critical',
    description: 'Changes affect system security and compliance',
    color: 'text-red-400'
  }

  return (
    <ConfigCardTemplate<SecuritySetting>
      title="Security"
      description="Set policies"
      icon=""
      securityLevel={securityLevel}
      apiEndpoint="/api/config/security"
      builtInItems={BUILTIN_SECURITY_SETTINGS}
      itemDisplayKey="name"
      itemTypeKey="category"
      colorKey="color"
      canRename={true}
      canToggle={true}
      canAddCustom={true}
      customItemDefaults={{
        setting_value: true,
        category: 'custom',
        is_enabled: true
      }}
    />
  )
}