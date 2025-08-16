'use client'

import React, { useState, useEffect } from 'react'
import { useClient, useAuth, RoleBadge } from '@/lib/MultiTenantAuthContext'
import { PermissionGate, AdminOnly } from '@/lib/RouteProtection'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/auth'

// =====================================================
// TYPES
// =====================================================

interface TeamMember {
  id: string
  user_id: string
  role: UserRole
  status: 'active' | 'inactive' | 'pending'
  joined_at: string | null
  profiles: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

interface Invitation {
  id: string
  email: string
  role: UserRole
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
  profiles?: {
    full_name: string | null
    email: string
  }
}

// =====================================================
// TEAM MANAGEMENT COMPONENT
// =====================================================

export default function TeamManagement() {
  const { client } = useClient()
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('staff')
  const [inviteMessage, setInviteMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load team data
  useEffect(() => {
    if (client?.client) {
      loadTeamData()
    }
  }, [client?.client])

  const loadTeamData = async () => {
    if (!client?.client) return

    try {
      setLoading(true)

      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('client_users')
        .select(`
          *,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('client_id', client.client.id)
        .order('role', { ascending: false })
        .order('joined_at', { ascending: true })

      if (membersError) {
        console.error('Error loading team members:', membersError)
      } else {
        setTeamMembers(members || [])
      }

      // Load pending invitations
      const session = await supabase.auth.getSession()
      if (session.data.session) {
        const response = await fetch(`/api/team/invite?clientId=${client.client.id}`, {
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`
          }
        })

        if (response.ok) {
          const { invitations } = await response.json()
          setInvitations(invitations || [])
        }
      }

    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Send invitation
  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!client?.client || !inviteEmail.trim()) return

    try {
      setSubmitting(true)

      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          clientId: client.client.id,
          message: inviteMessage.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Show success message
        alert(`Invitation sent to ${inviteEmail}!\n\nInvitation URL: ${result.invitationUrl}`)
        
        // Reset form
        setInviteEmail('')
        setInviteRole('staff')
        setInviteMessage('')
        setShowInviteModal(false)
        
        // Reload data
        loadTeamData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }

    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Cancel invitation
  const cancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return

    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const response = await fetch(`/api/team/invite?invitationId=${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })

      if (response.ok) {
        loadTeamData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      alert('Failed to cancel invitation')
    }
  }

  // Update member role
  const updateMemberRole = async (memberId: string, newRole: UserRole) => {
    if (!confirm(`Are you sure you want to change this member's role to ${newRole}?`)) return

    try {
      const { error } = await supabase
        .from('client_users')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) {
        throw error
      }

      loadTeamData()
    } catch (error) {
      console.error('Error updating member role:', error)
      alert('Failed to update member role')
    }
  }

  // Remove team member
  const removeMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) return

    try {
      const { error } = await supabase
        .from('client_users')
        .update({ status: 'inactive' })
        .eq('id', memberId)

      if (error) {
        throw error
      }

      loadTeamData()
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove team member')
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          
          <AdminOnly>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite Member
            </button>
          </AdminOnly>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Team Members ({teamMembers.filter(m => m.status === 'active').length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {teamMembers
            .filter(member => member.status === 'active')
            .map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {member.profiles.avatar_url ? (
                    <img 
                      src={member.profiles.avatar_url} 
                      alt={member.profiles.full_name || member.profiles.email}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700">
                      {(member.profiles.full_name || member.profiles.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {member.profiles.full_name || 'No name set'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.profiles.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Date unknown'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <RoleBadge role={member.role} />
                
                <AdminOnly>
                  {member.user_id !== user?.id && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value as UserRole)}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        {client.userRole === 'owner' && (
                          <option value="owner">Owner</option>
                        )}
                      </select>
                      
                      <button
                        onClick={() => removeMember(member.id, member.profiles.email)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove member"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </AdminOnly>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {invitations
              .filter(invitation => invitation.status === 'pending')
              .map((invitation) => (
              <div key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {invitation.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      Invited {new Date(invitation.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <RoleBadge role={invitation.role} />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                  
                  <AdminOnly>
                    <button
                      onClick={() => cancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Cancel invitation"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </AdminOnly>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Invite Team Member
            </h3>
            
            <form onSubmit={sendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="colleague@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="staff">Staff - Can upload documents</option>
                  <option value="manager">Manager - Can view reports and manage suppliers</option>
                  <option value="admin">Admin - Can manage team and settings</option>
                  {client.userRole === 'owner' && (
                    <option value="owner">Owner - Full access</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Welcome to our team! Looking forward to working with you."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}