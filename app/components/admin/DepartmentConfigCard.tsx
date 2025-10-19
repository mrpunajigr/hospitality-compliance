'use client'

import { useState, useEffect } from 'react'
import { getUserClient } from '@/lib/rbac-core'
import { supabase } from '@/lib/supabase'
import { getButtonStyle } from '@/lib/design-system'
import ConfigCard, { PermissionGate, useConfigConfirmation, SecurityBadge } from './ConfigCard'

interface Department {
  id: string
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

interface DepartmentFormData {
  name: string
  description: string
  color: string
  icon: string
  security_level: 'low' | 'medium' | 'high' | 'critical'
  sort_order: number
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

export default function DepartmentConfigCard() {
  const [departments, setDepartments] = useState<Department[]>([])
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
  const [newDeptName, setNewDeptName] = useState('')
  const [renamingDept, setRenamingDept] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  useEffect(() => {
    loadUserClient()
    loadDepartments()
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

  const loadDepartments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/departments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load departments')
      }

      setDepartments(data.departments || [])
      setUserPermissions(data.userPermissions || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBuiltinDepartment = async (builtinDept: any, enable: boolean) => {
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      if (enable) {
        // Create/enable the department
        const response = await fetch('/api/config/departments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            name: builtinDept.name,
            description: builtinDept.description,
            color: builtinDept.color,
            icon: '●',
            security_level: 'medium',
            sort_order: departments.length
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to enable department')
        }
      } else {
        // Disable the department
        const existingDept = departments.find(d => d.name === builtinDept.name)
        if (existingDept) {
          const response = await fetch('/api/config/departments', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              id: existingDept.id,
              name: existingDept.name,
              is_active: false
            })
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to disable department')
          }
        }
      }

      await loadDepartments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed')
    }
  }

  const handleRename = (builtinDept: any) => {
    const currentName = departments.find(d => d.name === builtinDept.name)?.name || builtinDept.name
    setRenamingDept(builtinDept.name)
    setRenameValue(currentName)
  }

  const saveRename = async () => {
    if (!renamingDept || !renameValue.trim()) return

    try {
      const existingDept = departments.find(d => d.name === renamingDept)
      if (!existingDept) return

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/departments', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: existingDept.id,
          name: renameValue.trim(),
          description: existingDept.description,
          color: existingDept.color,
          icon: existingDept.icon
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename department')
      }

      await loadDepartments()
      setRenamingDept(null)
      setRenameValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rename failed')
    }
  }

  const addCustomDepartment = async () => {
    if (!newDeptName.trim()) return

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/departments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: newDeptName.trim(),
          description: 'Custom department',
          color: '#6B7280',
          icon: '●',
          security_level: 'medium',
          sort_order: departments.length
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add department')
      }

      await loadDepartments()
      setNewDeptName('')
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed')
    }
  }

  const securityLevel = {
    level: 'medium' as const,
    label: 'Elevated',
    description: 'Changes affect departmental organization and user access',
    color: 'text-yellow-400'
  }

  return (
    <>
      <ConfigCard
        title="Departments"
        description="Select areas"
        icon=""
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadDepartments}
      >
        {/* Built-in Departments with Toggles */}
        <div className="space-y-3 mb-6">
          {BUILTIN_DEPARTMENTS.map((builtinDept) => {
            const isEnabled = departments.some(d => d.name === builtinDept.name && d.is_active)
            const customName = departments.find(d => d.name === builtinDept.name)?.name || builtinDept.name
            
            return (
              <div
                key={builtinDept.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: builtinDept.color }}
                  >
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{customName}</h4>
                    <p className="text-sm text-gray-600">{builtinDept.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PermissionGate hasPermission={userPermissions.canEdit}>
                    <button
                      onClick={() => toggleBuiltinDepartment(builtinDept, !isEnabled)}
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
                      onClick={() => handleRename(builtinDept)}
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
        {renamingDept && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Rename Department</h4>
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
                onClick={() => {setRenamingDept(null); setRenameValue('')}}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Custom Department */}
        <PermissionGate hasPermission={userPermissions.canCreate}>
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Add Custom Department</h4>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Custom Department
              </button>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter department name"
                />
                <button
                  onClick={addCustomDepartment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {setShowAddForm(false); setNewDeptName('')}}
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