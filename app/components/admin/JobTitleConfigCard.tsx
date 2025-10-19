'use client'

import { useState, useEffect } from 'react'
import { getUserClient } from '@/lib/rbac-core'
import { supabase } from '@/lib/supabase'
import ConfigCard, { PermissionGate, useConfigConfirmation } from './ConfigCard'

interface JobTitle {
  id: string
  title: string
  description: string | null
  default_role: string
  is_active: boolean
}

// Built-in hospitality job titles
const BUILTIN_JOBS = [
  { name: 'Server', color: '#3B82F6', description: 'Customer service and table management', default_role: 'STAFF' },
  { name: 'Host/Hostess', color: '#10B981', description: 'Guest greeting and seating', default_role: 'STAFF' },
  { name: 'Bartender', color: '#8B5CF6', description: 'Beverage preparation and service', default_role: 'STAFF' },
  { name: 'Kitchen Hand', color: '#EF4444', description: 'Food preparation assistance', default_role: 'STAFF' },
  { name: 'Chef', color: '#F59E0B', description: 'Food preparation and cooking', default_role: 'STAFF' },
  { name: 'Shift Supervisor', color: '#6B7280', description: 'Team leadership and oversight', default_role: 'SUPERVISOR' },
  { name: 'Assistant Manager', color: '#EC4899', description: 'Operations support and management', default_role: 'SUPERVISOR' },
  { name: 'Head Chef', color: '#14B8A6', description: 'Kitchen management and menu oversight', default_role: 'MANAGER' },
  { name: 'Restaurant Manager', color: '#F97316', description: 'Overall restaurant operations', default_role: 'MANAGER' },
  { name: 'Owner', color: '#6366F1', description: 'Business ownership and strategic decisions', default_role: 'OWNER' }
]

export default function JobTitleConfigCard() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
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
  const [newJobName, setNewJobName] = useState('')
  const [renamingJob, setRenamingJob] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  useEffect(() => {
    loadUserClient()
    loadJobTitles()
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

  const loadJobTitles = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/job-titles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load job titles')
      }

      setJobTitles(data.jobTitles || [])
      setUserPermissions(data.userPermissions || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job titles')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBuiltinJob = async (builtinJob: any, enable: boolean) => {
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      if (enable) {
        // Create/enable the job title
        const response = await fetch('/api/config/job-titles', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            title: builtinJob.name,
            description: builtinJob.description,
            default_role: builtinJob.default_role,
            hierarchy_level: 1,
            security_clearance: 'standard',
            primary_department_id: '',
            reports_to_title_id: '',
            sort_order: jobTitles.length
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to enable job title')
        }
      } else {
        // Disable the job title
        const existingJob = jobTitles.find(j => j.title === builtinJob.name)
        if (existingJob) {
          const response = await fetch('/api/config/job-titles', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              id: existingJob.id,
              title: existingJob.title,
              is_active: false
            })
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to disable job title')
          }
        }
      }

      await loadJobTitles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed')
    }
  }

  const handleRename = (builtinJob: any) => {
    const currentName = jobTitles.find(j => j.title === builtinJob.name)?.title || builtinJob.name
    setRenamingJob(builtinJob.name)
    setRenameValue(currentName)
  }

  const saveRename = async () => {
    if (!renamingJob || !renameValue.trim()) return

    try {
      const existingJob = jobTitles.find(j => j.title === renamingJob)
      if (!existingJob) return

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/job-titles', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: existingJob.id,
          title: renameValue.trim(),
          description: existingJob.description,
          default_role: existingJob.default_role
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename job title')
      }

      await loadJobTitles()
      setRenamingJob(null)
      setRenameValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rename failed')
    }
  }

  const addCustomJob = async () => {
    if (!newJobName.trim()) return

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const response = await fetch('/api/config/job-titles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: newJobName.trim(),
          description: 'Custom job title',
          default_role: 'STAFF',
          hierarchy_level: 1,
          security_clearance: 'standard',
          primary_department_id: '',
          reports_to_title_id: '',
          sort_order: jobTitles.length
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add job title')
      }

      await loadJobTitles()
      setNewJobName('')
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed')
    }
  }

  const securityLevel = {
    level: 'high' as const,
    label: 'Restricted',
    description: 'Changes affect user roles and system permissions',
    color: 'text-orange-400'
  }

  return (
    <>
      <ConfigCard
        title="Jobs"
        description="Define jobs"
        icon=""
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadJobTitles}
      >
        {/* Built-in Jobs with Toggles */}
        <div className="space-y-3 mb-6">
          {BUILTIN_JOBS.map((builtinJob) => {
            const isEnabled = jobTitles.some(j => j.title === builtinJob.name && j.is_active)
            const customName = jobTitles.find(j => j.title === builtinJob.name)?.title || builtinJob.name
            
            return (
              <div
                key={builtinJob.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: builtinJob.color }}
                  >
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{customName}</h4>
                    <p className="text-sm text-gray-600">{builtinJob.description}</p>
                    <p className="text-xs text-gray-500">Role: {builtinJob.default_role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PermissionGate hasPermission={userPermissions.canEdit}>
                    <button
                      onClick={() => toggleBuiltinJob(builtinJob, !isEnabled)}
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
                      onClick={() => handleRename(builtinJob)}
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
        {renamingJob && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Rename Job Title</h4>
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
                onClick={() => {setRenamingJob(null); setRenameValue('')}}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Custom Job Title */}
        <PermissionGate hasPermission={userPermissions.canCreate}>
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Add Custom Job Title</h4>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Custom Job Title
              </button>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter job title name"
                />
                <button
                  onClick={addCustomJob}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {setShowAddForm(false); setNewJobName('')}}
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