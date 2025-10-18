'use client'

import { useState, useEffect } from 'react'
import { getUserClient, UserRole, getRoleDisplayName } from '@/lib/rbac-core'
import { supabase } from '@/lib/supabase'
import { getButtonStyle } from '@/lib/design-system'
import ConfigCard, { PermissionGate, useConfigConfirmation, SecurityBadge } from './ConfigCard'

interface Department {
  id: string
  name: string
  color: string
}

interface JobTitle {
  id: string
  title: string
  description: string | null
  default_role: UserRole
  hierarchy_level: number
  security_clearance: 'basic' | 'standard' | 'elevated' | 'admin'
  permission_template: any
  sort_order: number
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
  primary_department?: Department
  reports_to?: { id: string; title: string }
}

interface JobTitleFormData {
  title: string
  description: string
  default_role: UserRole
  hierarchy_level: number
  security_clearance: 'basic' | 'standard' | 'elevated' | 'admin'
  primary_department_id: string
  reports_to_title_id: string
  sort_order: number
}

const SECURITY_CLEARANCE_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Limited system access' },
  { value: 'standard', label: 'Standard', description: 'Normal operational access' },
  { value: 'elevated', label: 'Elevated', description: 'Enhanced permissions' },
  { value: 'admin', label: 'Admin', description: 'Administrative access' }
]

const HIERARCHY_LEVELS = [
  { value: 1, label: 'Level 1', description: 'Entry level staff' },
  { value: 2, label: 'Level 2', description: 'Experienced staff/supervisors' },
  { value: 3, label: 'Level 3', description: 'Management level' },
  { value: 4, label: 'Level 4', description: 'Executive level' }
]

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'STAFF', label: 'Staff', description: 'Basic user with limited permissions' },
  { value: 'SUPERVISOR', label: 'Supervisor', description: 'Team leader with oversight responsibilities' },
  { value: 'MANAGER', label: 'Manager', description: 'Management level with operational control' },
  { value: 'OWNER', label: 'Owner', description: 'Full system access and control' }
]

export default function JobTitleConfigCard() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewSecurity: false,
    canEditHigherRoles: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTitle, setEditingTitle] = useState<JobTitle | null>(null)
  const [formData, setFormData] = useState<JobTitleFormData>({
    title: '',
    description: '',
    default_role: 'STAFF',
    hierarchy_level: 1,
    security_clearance: 'standard',
    primary_department_id: '',
    reports_to_title_id: '',
    sort_order: 0
  })

  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load job titles
      const titleResponse = await fetch('/api/config/job-titles')
      const titleData = await titleResponse.json()

      if (!titleResponse.ok) {
        throw new Error(titleData.error || 'Failed to load job titles')
      }

      // Load departments
      const deptResponse = await fetch('/api/config/departments')
      const deptData = await deptResponse.json()

      if (!deptResponse.ok) {
        throw new Error(deptData.error || 'Failed to load departments')
      }

      setJobTitles(titleData.jobTitles || [])
      setUserPermissions(titleData.userPermissions || {})
      setDepartments(deptData.departments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      default_role: 'STAFF',
      hierarchy_level: 1,
      security_clearance: 'standard',
      primary_department_id: '',
      reports_to_title_id: '',
      sort_order: jobTitles.length
    })
    setEditingTitle(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const isEdit = editingTitle !== null
      const url = '/api/config/job-titles'
      const method = isEdit ? 'PUT' : 'POST'
      
      const payload = isEdit 
        ? { id: editingTitle.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} job title`)
      }

      await loadData()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleEdit = (title: JobTitle) => {
    setFormData({
      title: title.title,
      description: title.description || '',
      default_role: title.default_role,
      hierarchy_level: title.hierarchy_level,
      security_clearance: title.security_clearance,
      primary_department_id: title.primary_department?.id || '',
      reports_to_title_id: title.reports_to?.id || '',
      sort_order: title.sort_order
    })
    setEditingTitle(title)
    setShowAddForm(true)
  }

  const handleDelete = async (title: JobTitle) => {
    const confirmed = await confirm({
      title: 'Delete Job Title',
      message: `Are you sure you want to delete "${title.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      isDangerous: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/config/job-titles?id=${title.id}`, {
            method: 'DELETE'
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete job title')
          }

          await loadData()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Delete failed')
        }
      }
    })
  }

  const toggleStatus = async (title: JobTitle) => {
    try {
      const response = await fetch('/api/config/job-titles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: title.id,
          title: title.title,
          is_active: !title.is_active
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job title status')
      }

      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed')
    }
  }

  const getSecurityClearanceColor = (level: string) => {
    const colors = {
      basic: 'text-green-400',
      standard: 'text-blue-400',
      elevated: 'text-yellow-400',
      admin: 'text-red-400'
    }
    return colors[level as keyof typeof colors] || 'text-gray-400'
  }

  const getHierarchyIcon = (level: number) => {
    const icons = ['🔹', '🔸', '🔶', '🔴']
    return icons[level - 1] || '🔹'
  }

  // Filter available reporting titles (must be higher hierarchy)
  const availableReportingTitles = jobTitles.filter(title => 
    title.id !== editingTitle?.id && 
    title.hierarchy_level > formData.hierarchy_level &&
    title.is_active
  )

  const securityLevel = {
    level: 'high' as const,
    label: 'Restricted',
    description: 'Changes affect user roles and system permissions',
    color: 'text-orange-400'
  }

  return (
    <>
      <ConfigCard
        title="Job Titles & Roles"
        description="Configure job titles with role mapping and hierarchy structure"
        icon="👥"
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadData}
      >
        {/* Job Titles List */}
        <div className="space-y-3 mb-6">
          {jobTitles.map((title) => (
            <div
              key={title.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{getHierarchyIcon(title.hierarchy_level)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{title.title}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded bg-${title.default_role === 'OWNER' ? 'red' : title.default_role === 'MANAGER' ? 'blue' : title.default_role === 'SUPERVISOR' ? 'yellow' : 'green'}-500/20 text-${title.default_role === 'OWNER' ? 'red' : title.default_role === 'MANAGER' ? 'blue' : title.default_role === 'SUPERVISOR' ? 'yellow' : 'green'}-300`}>
                          {getRoleDisplayName(title.default_role)}
                        </span>
                        {userPermissions.canViewSecurity && (
                          <span className={`px-2 py-0.5 text-xs rounded border ${getSecurityClearanceColor(title.security_clearance)}`}>
                            {title.security_clearance}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>Level {title.hierarchy_level}</span>
                        {title.primary_department && (
                          <>
                            <span>•</span>
                            <span style={{ color: title.primary_department.color }}>
                              {title.primary_department.name}
                            </span>
                          </>
                        )}
                        {title.reports_to && (
                          <>
                            <span>•</span>
                            <span>Reports to: {title.reports_to.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {title.description && (
                    <p className="text-sm text-white/70 mb-2">{title.description}</p>
                  )}

                  <div className="flex items-center gap-2">
                    {!title.is_active && (
                      <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-300 rounded">
                        Inactive
                      </span>
                    )}
                    {title.is_default && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <PermissionGate hasPermission={userPermissions.canEdit}>
                    <button
                      onClick={() => toggleStatus(title)}
                      className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {title.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(title)}
                      className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    >
                      Edit
                    </button>
                  </PermissionGate>
                  
                  <PermissionGate hasPermission={userPermissions.canDelete && !title.is_default}>
                    <button
                      onClick={() => handleDelete(title)}
                      className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </PermissionGate>
                </div>
              </div>
            </div>
          ))}

          {jobTitles.length === 0 && !isLoading && (
            <div className="text-center py-8 text-white/60">
              <span className="text-2xl block mb-2">👥</span>
              <p>No job titles configured yet</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        <PermissionGate hasPermission={userPermissions.canCreate || (userPermissions.canEdit && !!editingTitle)}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className={`${getButtonStyle('primary')} w-full`}
            >
              + Add Job Title
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">
                  {editingTitle ? 'Edit Job Title' : 'Add New Job Title'}
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
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="e.g., Head Chef, Server, Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Default Role *
                  </label>
                  <select
                    value={formData.default_role}
                    onChange={(e) => setFormData({ ...formData, default_role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value} className="bg-gray-800">
                        {role.label}
                      </option>
                    ))}
                  </select>
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
                  placeholder="Job responsibilities and requirements"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Hierarchy Level
                  </label>
                  <select
                    value={formData.hierarchy_level}
                    onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {HIERARCHY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value} className="bg-gray-800">
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Security Clearance
                  </label>
                  <select
                    value={formData.security_clearance}
                    onChange={(e) => setFormData({ ...formData, security_clearance: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {SECURITY_CLEARANCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value} className="bg-gray-800">
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.primary_department_id}
                    onChange={(e) => setFormData({ ...formData, primary_department_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="" className="bg-gray-800">None</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-gray-800">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {availableReportingTitles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Reports To
                  </label>
                  <select
                    value={formData.reports_to_title_id}
                    onChange={(e) => setFormData({ ...formData, reports_to_title_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="" className="bg-gray-800">No direct report</option>
                    {availableReportingTitles.map((title) => (
                      <option key={title.id} value={title.id} className="bg-gray-800">
                        {title.title} (Level {title.hierarchy_level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`${getButtonStyle('primary')} flex-1`}
                >
                  {editingTitle ? 'Update Job Title' : 'Create Job Title'}
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