'use client'

import { useState, useEffect } from 'react'
import { getUserClient } from '@/lib/rbac-core'
import { supabase } from '@/lib/supabase'
import ConfigCard, { PermissionGate, useConfigConfirmation } from './ConfigCard'

interface SecuritySetting {
  id: string
  setting_key: string
  setting_value: any
  is_enabled: boolean
  updated_at: string
}

// Built-in security settings for hospitality businesses
const BUILTIN_SECURITY_SETTINGS = [
  { 
    key: 'two_factor_auth', 
    name: 'Two-Factor Authentication', 
    color: '#EF4444', 
    description: 'Require 2FA for all user logins',
    category: 'authentication',
    defaultValue: false
  },
  { 
    key: 'session_timeout', 
    name: 'Session Timeout', 
    color: '#F59E0B', 
    description: 'Auto-logout after 30 minutes of inactivity',
    category: 'sessions',
    defaultValue: 30
  },
  { 
    key: 'password_complexity', 
    name: 'Strong Passwords', 
    color: '#10B981', 
    description: 'Require complex passwords with symbols',
    category: 'authentication',
    defaultValue: true
  },
  { 
    key: 'login_monitoring', 
    name: 'Login Monitoring', 
    color: '#3B82F6', 
    description: 'Track and alert on failed login attempts',
    category: 'monitoring',
    defaultValue: true
  },
  { 
    key: 'ip_restrictions', 
    name: 'IP Restrictions', 
    color: '#8B5CF6', 
    description: 'Limit access to approved IP addresses',
    category: 'access',
    defaultValue: false
  },
  { 
    key: 'device_registration', 
    name: 'Device Registration', 
    color: '#EC4899', 
    description: 'Require approval for new devices',
    category: 'access',
    defaultValue: false
  },
  { 
    key: 'audit_logging', 
    name: 'Enhanced Audit Logs', 
    color: '#14B8A6', 
    description: 'Detailed tracking of all user actions',
    category: 'compliance',
    defaultValue: true
  },
  { 
    key: 'data_retention', 
    name: 'Data Retention', 
    color: '#6B7280', 
    description: 'Keep compliance records for 7 years',
    category: 'compliance',
    defaultValue: true
  }
]

export default function SecurityConfigCard() {
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([])
  const [userClient, setUserClient] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewSecurity: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSettingName, setNewSettingName] = useState('')
  const [renamingSetting, setRenamingSetting] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  useEffect(() => {
    loadUserClient()
    loadSecuritySettings()
  }, [])

  const loadUserClient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          setUserClient(clientInfo)
        }
      }
    } catch (error) {
      console.error('Error loading user client:', error)
    }
  }

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/security', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load security settings')
      }

      setSecuritySettings(data.securitySettings || [])
      setUserPermissions(data.userPermissions || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security settings')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBuiltinSetting = async (builtinSetting: any, enable: boolean) => {
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      if (enable) {
        // Create/enable the security setting
        const response = await fetch('/api/config/security', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            setting_key: builtinSetting.key,
            setting_name: builtinSetting.name,
            setting_value: builtinSetting.defaultValue,
            category: builtinSetting.category
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to enable security setting')
        }
      } else {
        // Disable the security setting
        const existingSetting = securitySettings.find(s => s.setting_key === builtinSetting.key)
        if (existingSetting) {
          const response = await fetch('/api/config/security', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              id: existingSetting.id,
              is_enabled: false
            })
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to disable security setting')
          }
        }
      }

      await loadSecuritySettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed')
    }
  }

  const handleRename = (builtinSetting: any) => {
    const currentName = securitySettings.find(s => s.setting_key === builtinSetting.key)?.setting_key || builtinSetting.name
    setRenamingSetting(builtinSetting.key)
    setRenameValue(currentName)
  }

  const saveRename = async () => {
    if (!renamingSetting || !renameValue.trim()) return

    try {
      const existingSetting = securitySettings.find(s => s.setting_key === renamingSetting)
      if (!existingSetting) return

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/security', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: existingSetting.id,
          setting_name: renameValue.trim()
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename security setting')
      }

      await loadSecuritySettings()
      setRenamingSetting(null)
      setRenameValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rename failed')
    }
  }

  const addCustomSetting = async () => {
    if (!newSettingName.trim()) return

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/security', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          setting_key: newSettingName.toLowerCase().replace(/\s+/g, '_'),
          setting_name: newSettingName.trim(),
          setting_value: true,
          category: 'custom'
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add security setting')
      }

      await loadSecuritySettings()
      setNewSettingName('')
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed')
    }
  }

  const securityLevel = {
    level: 'critical' as const,
    label: 'Critical',
    description: 'Changes affect system security and compliance',
    color: 'text-red-400'
  }

  return (
    <>
      <ConfigCard
        title="Security"
        description="Set policies"
        icon=""
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadSecuritySettings}
      >
        {/* Built-in Security Settings with Toggles */}
        <div className="space-y-3 mb-6">
          {BUILTIN_SECURITY_SETTINGS.map((builtinSetting) => {
            const isEnabled = securitySettings.some(s => s.setting_key === builtinSetting.key && s.is_enabled)
            const customName = securitySettings.find(s => s.setting_key === builtinSetting.key)?.setting_key || builtinSetting.name
            
            return (
              <div
                key={builtinSetting.key}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: builtinSetting.color }}
                  >
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{customName}</h4>
                    <p className="text-sm text-gray-600">{builtinSetting.description}</p>
                    <p className="text-xs text-gray-500">Category: {builtinSetting.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PermissionGate hasPermission={userPermissions.canEdit}>
                    <button
                      onClick={() => toggleBuiltinSetting(builtinSetting, !isEnabled)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </PermissionGate>
                  {isEnabled && (
                    <button
                      onClick={() => handleRename(builtinSetting)}
                      className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      Rename
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Rename Dialog */}
        {renamingSetting && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Rename Security Setting</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new name"
              />
              <button
                onClick={saveRename}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {setRenamingSetting(null); setRenameValue('')}}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Custom Security Setting */}
        <PermissionGate hasPermission={userPermissions.canCreate}>
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Add Custom Security Policy</h4>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Custom Security Policy
              </button>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSettingName}
                  onChange={(e) => setNewSettingName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter security policy name"
                />
                <button
                  onClick={addCustomSetting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {setShowAddForm(false); setNewSettingName('')}}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </PermissionGate>
      </ConfigCard>

      <ConfirmationDialog />
    </>
  )
}