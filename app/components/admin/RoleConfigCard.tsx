'use client'

import { useState, useEffect } from 'react'
import { getUserClient } from '@/lib/rbac-core'
import { supabase } from '@/lib/supabase'
import { getButtonStyle } from '@/lib/design-system'
import ConfigCard, { PermissionGate, useConfigConfirmation, SecurityBadge } from './ConfigCard'

interface SystemRole {
  role: 'STAFF' | 'SUPERVISOR' | 'MANAGER' | 'OWNER'
  name: string
  description: string
  permissions: string[]
  icon: string
  color: string
}

interface BusinessRole {
  id: string
  system_role: string
  display_name: string
  is_enabled: boolean
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

const BUILT_IN_ROLES: SystemRole[] = [
  {
    role: 'STAFF',
    name: 'Staff',
    description: 'Basic users with document upload and viewing permissions',
    permissions: ['Upload documents', 'View own uploads', 'Update profile'],
    icon: '👤',
    color: '#10B981'
  },
  {
    role: 'SUPERVISOR', 
    name: 'Supervisor',
    description: 'Team leaders with oversight and basic reporting capabilities',
    permissions: ['Staff permissions', 'View team uploads', 'Basic reporting', 'Team management'],
    icon: '👥',
    color: '#3B82F6'
  },
  {
    role: 'MANAGER',
    name: 'Manager', 
    description: 'Operational managers with full business management access',
    permissions: ['Supervisor permissions', 'User management', 'Business settings', 'Advanced reporting'],
    icon: '📊',
    color: '#8B5CF6'
  },
  {
    role: 'OWNER',
    name: 'Owner',
    description: 'Business owners with complete system control and access',
    permissions: ['Manager permissions', 'Company settings', 'Billing', 'Full admin access'],
    icon: '👑',
    color: '#EF4444'
  }
]

export default function RoleConfigCard() {
  const [businessRoles, setBusinessRoles] = useState<BusinessRole[]>([])
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewSecurity: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/config/roles')
      const data = await response.json()

      if (!response.ok) {
        // For now, if API fails, just show default permissions and empty roles
        console.warn('Roles API not available yet:', data.error)
        setBusinessRoles([])
        setUserPermissions({
          canCreate: true,
          canEdit: true,
          canDelete: false,
          canViewSecurity: true
        })
        return
      }

      setBusinessRoles(data.roles || [])
      setUserPermissions(data.userPermissions || {})
    } catch (err) {
      // Fallback for development - show interface but no data
      console.warn('Roles API error:', err)
      setBusinessRoles([])
      setUserPermissions({
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewSecurity: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRole = async (systemRole: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/config/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_role: systemRole,
          is_enabled: enabled
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.warn('Role toggle failed:', data.error)
        setError('Role configuration not available yet')
        return
      }

      await loadRoles()
    } catch (err) {
      console.warn('Role toggle error:', err)
      setError('Role configuration not available yet')
    }
  }

  const updateRoleName = async (systemRole: string, newName: string) => {
    try {
      const response = await fetch('/api/config/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_role: systemRole,
          display_name: newName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.warn('Role rename failed:', data.error)
        setError('Role configuration not available yet')
        return
      }

      await loadRoles()
      setEditingRole(null)
      setEditName('')
    } catch (err) {
      console.warn('Role rename error:', err)
      setError('Role configuration not available yet')
    }
  }

  const startEdit = (role: SystemRole) => {
    const businessRole = businessRoles.find(br => br.system_role === role.role)
    setEditingRole(role.role)
    setEditName(businessRole?.display_name || role.name)
  }

  const cancelEdit = () => {
    setEditingRole(null)
    setEditName('')
  }

  const getBusinessRole = (systemRole: string) => {
    return businessRoles.find(br => br.system_role === systemRole)
  }

  const securityLevel = {
    level: 'critical' as const,
    label: 'Critical',
    description: 'Changes affect user permissions and system security',
    color: 'text-red-400'
  }

  return (
    <>
      <ConfigCard
        title="User Roles"
        description="Configure system roles and permissions for your business"
        icon="👤"
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadRoles}
      >
        <div className="space-y-4">
          <div className="text-sm text-white/70 mb-6">
            Enable the roles your business needs. Each role comes with predefined permissions that match common hospitality business structures.
          </div>

          {/* Roles List */}
          <div className="space-y-3">
            {BUILT_IN_ROLES.map((role) => {
              const businessRole = getBusinessRole(role.role)
              const isEnabled = businessRole?.is_enabled ?? false
              const displayName = businessRole?.display_name || role.name

              return (
                <div
                  key={role.role}
                  className={`p-4 rounded-lg border transition-all ${
                    isEnabled 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/5 border-white/10 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: role.color + '20', color: role.color }}
                      >
                        {role.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {editingRole === role.role ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateRoleName(role.role, editName)
                                  } else if (e.key === 'Escape') {
                                    cancelEdit()
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => updateRoleName(role.role, editName)}
                                className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium text-white">{displayName}</h4>
                              <span 
                                className="px-2 py-0.5 text-xs rounded"
                                style={{ backgroundColor: role.color + '20', color: role.color }}
                              >
                                {role.role}
                              </span>
                              {userPermissions.canEdit && isEnabled && (
                                <button
                                  onClick={() => startEdit(role)}
                                  className="text-white/60 hover:text-white/80 text-xs"
                                  title="Rename role"
                                >
                                  ✏️
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        <p className="text-sm text-white/70 mb-3">{role.description}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <PermissionGate hasPermission={userPermissions.canEdit}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => toggleRole(role.role, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {businessRoles.length === 0 && !isLoading && (
            <div className="text-center py-8 text-white/60">
              <span className="text-2xl block mb-2">👤</span>
              <p>No roles configured yet</p>
              <p className="text-sm mt-1">Enable the roles you need for your business</p>
            </div>
          )}
        </div>
      </ConfigCard>

      <ConfirmationDialog />
    </>
  )
}