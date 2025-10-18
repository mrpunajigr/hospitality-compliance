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

const SECURITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Visible to all users' },
  { value: 'medium', label: 'Medium', description: 'Staff and above' },
  { value: 'high', label: 'High', description: 'Supervisor and above' },
  { value: 'critical', label: 'Critical', description: 'Manager and above' }
]

const DEFAULT_ICONS = ['🏢', '🍳', '🍽️', '🍺', '💼', '🧹', '🔧', '📋', '🎯', '⚙️']
const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#6366F1']

export default function DepartmentConfigCard() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewSecurity: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '🏢',
    security_level: 'medium',
    sort_order: 0
  })

  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/config/departments')
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '🏢',
      security_level: 'medium',
      sort_order: departments.length
    })
    setEditingDept(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const isEdit = editingDept !== null
      const url = '/api/config/departments'
      const method = isEdit ? 'PUT' : 'POST'
      
      const payload = isEdit 
        ? { id: editingDept.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} department`)
      }

      await loadDepartments()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleEdit = (dept: Department) => {
    setFormData({
      name: dept.name,
      description: dept.description || '',
      color: dept.color,
      icon: dept.icon,
      security_level: dept.security_level,
      sort_order: dept.sort_order
    })
    setEditingDept(dept)
    setShowAddForm(true)
  }

  const handleDelete = async (dept: Department) => {
    const confirmed = await confirm({
      title: 'Delete Department',
      message: `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      isDangerous: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/config/departments?id=${dept.id}`, {
            method: 'DELETE'
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete department')
          }

          await loadDepartments()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Delete failed')
        }
      }
    })
  }

  const toggleStatus = async (dept: Department) => {
    try {
      const response = await fetch('/api/config/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dept.id,
          name: dept.name,
          is_active: !dept.is_active
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update department status')
      }

      await loadDepartments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed')
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
        title="Business Departments"
        description="Configure departments and organizational structure for your business"
        icon="🏢"
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadDepartments}
      >
        {/* Departments List */}
        <div className="space-y-3 mb-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: dept.color + '20', color: dept.color }}
                >
                  {dept.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{dept.name}</h4>
                    {userPermissions.canViewSecurity && (
                      <SecurityBadge level={dept.security_level} size="sm" />
                    )}
                    {!dept.is_active && (
                      <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-300 rounded">
                        Inactive
                      </span>
                    )}
                    {dept.is_default && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {dept.description && (
                    <p className="text-sm text-white/60 mt-1">{dept.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <PermissionGate hasPermission={userPermissions.canEdit}>
                  <button
                    onClick={() => toggleStatus(dept)}
                    className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {dept.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(dept)}
                    className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                  >
                    Edit
                  </button>
                </PermissionGate>
                
                <PermissionGate hasPermission={userPermissions.canDelete && !dept.is_default}>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}

          {departments.length === 0 && !isLoading && (
            <div className="text-center py-8 text-white/60">
              <span className="text-2xl block mb-2">🏢</span>
              <p>No departments configured yet</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        <PermissionGate hasPermission={userPermissions.canCreate || (userPermissions.canEdit && !!editingDept)}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className={`${getButtonStyle('primary')} w-full`}
            >
              + Add Department
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">
                  {editingDept ? 'Edit Department' : 'Add New Department'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-white/60 hover:text-white/80"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="e.g., Kitchen, Front of House"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Icon
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {DEFAULT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-8 h-8 rounded border ${
                          formData.icon === icon 
                            ? 'bg-blue-500/30 border-blue-400' 
                            : 'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Brief description of this department"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Color
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded border-2 ${
                          formData.color === color 
                            ? 'border-white' 
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Security Level
                  </label>
                  <select
                    value={formData.security_level}
                    onChange={(e) => setFormData({ ...formData, security_level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {SECURITY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value} className="bg-gray-800">
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`${getButtonStyle('primary')} flex-1`}
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${getButtonStyle('outline')} px-4`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </PermissionGate>
      </ConfigCard>

      <ConfirmationDialog />
    </>
  )
}