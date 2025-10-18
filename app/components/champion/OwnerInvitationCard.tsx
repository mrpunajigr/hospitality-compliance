'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCardStyle, getTextStyle, getButtonStyle, getFormFieldStyle } from '@/lib/design-system'

interface OwnerInvitation {
  id: string
  owner_name: string
  email: string
  phone?: string
  relationship: string
  preferred_contact: string
  evaluation_message?: string
  timeline?: string
  status: 'pending' | 'viewed' | 'accepted' | 'declined' | 'expired'
  created_at: string
  expires_at: string
  responded_at?: string
  owner_feedback?: string
}

interface EvaluationSummary {
  configurationProgress: {
    departmentsConfigured: number
    jobTitlesConfigured: number
    teamMembersAdded: number
    documentsUploaded: number
    complianceRulesSet: number
    workflowsConfigured: number
  }
  estimatedValue: {
    timesSavedWeekly: number
    complianceImprovement: string
    riskReduction: string
    efficiencyGain: string
  }
  readinessScore: number
  nextSteps: string[]
}

export default function OwnerInvitationCard() {
  const [invitation, setInvitation] = useState<OwnerInvitation | null>(null)
  const [evaluationSummary, setEvaluationSummary] = useState<EvaluationSummary | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    relationship: 'Business Owner',
    preferredContact: 'email',
    evaluationMessage: '',
    timeline: '',
    includeROIData: true
  })

  useEffect(() => {
    loadInvitationStatus()
  }, [])

  const loadInvitationStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/champion/invite-owner')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load invitation status')
      }

      setInvitation(data.invitation)
      setEvaluationSummary(data.currentEvaluationSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSending(true)
      setError(null)

      const response = await fetch('/api/champion/invite-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setMessage('Owner invitation sent successfully!')
      setShowInviteForm(false)
      await loadInvitationStatus()
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'viewed': return 'text-blue-400 bg-blue-500/20'
      case 'accepted': return 'text-green-400 bg-green-500/20'
      case 'declined': return 'text-red-400 bg-red-500/20'
      case 'expired': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'viewed': return '👀'
      case 'accepted': return '✅'
      case 'declined': return '❌'
      case 'expired': return '⌛'
      default: return '❓'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDaysRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (isLoading) {
    return (
      <div className={getCardStyle('primary')}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white/60">Loading invitation status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={getCardStyle('primary')}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`${getTextStyle('sectionTitle')} flex items-center gap-2`}>
            👑 Owner Invitation
          </h2>
          <p className={`${getTextStyle('body')} text-white/70 mt-1`}>
            Invite the business owner to review and approve your configuration
          </p>
        </div>
        {!invitation && (
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40`}>
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="text-sm font-medium text-orange-300">Owner Needed</span>
            </div>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-100">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-100">
          {error}
        </div>
      )}

      {/* Evaluation Summary */}
      {evaluationSummary && (
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className={`${getTextStyle('cardTitle')} mb-4`}>📊 Your Evaluation Progress</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {evaluationSummary.configurationProgress.departmentsConfigured}
              </div>
              <div className="text-sm text-white/60">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {evaluationSummary.configurationProgress.jobTitlesConfigured}
              </div>
              <div className="text-sm text-white/60">Job Titles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {evaluationSummary.configurationProgress.teamMembersAdded}
              </div>
              <div className="text-sm text-white/60">Team Members</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className={getTextStyle('body')}>Readiness Score</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${evaluationSummary.readinessScore}%` }}
                ></div>
              </div>
              <span className="text-xl font-bold text-green-400">
                {evaluationSummary.readinessScore}%
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-500/20 border border-blue-500/40">
            <h4 className="font-medium text-blue-300 mb-2">💰 Estimated Value</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>⏱️ {evaluationSummary.estimatedValue.timesSavedWeekly} hours saved weekly</div>
              <div>📈 {evaluationSummary.estimatedValue.complianceImprovement} compliance improvement</div>
              <div>🛡️ {evaluationSummary.estimatedValue.riskReduction} risk reduction</div>
              <div>⚡ {evaluationSummary.estimatedValue.efficiencyGain} efficiency gain</div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Invitation Status */}
      {invitation ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(invitation.status)}</span>
              <div>
                <h4 className="font-medium text-white">{invitation.owner_name}</h4>
                <p className="text-sm text-white/60">{invitation.email}</p>
                {invitation.phone && (
                  <p className="text-sm text-white/60">{invitation.phone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(invitation.status)}`}>
                <span className="text-sm font-medium capitalize">{invitation.status}</span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Sent {formatDate(invitation.created_at)}
              </p>
              {invitation.status === 'pending' && (
                <p className="text-xs text-yellow-400 mt-1">
                  Expires in {calculateDaysRemaining(invitation.expires_at)} days
                </p>
              )}
            </div>
          </div>

          {invitation.status === 'pending' && (
            <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/40">
              <h4 className="font-medium text-yellow-300 mb-2">⏳ Waiting for Owner Response</h4>
              <p className="text-sm text-yellow-200">
                The invitation has been sent to {invitation.owner_name}. They'll receive an email with 
                a link to review your configuration and approve the setup.
              </p>
              {invitation.timeline && (
                <p className="text-sm text-yellow-200 mt-2">
                  <strong>Timeline:</strong> {invitation.timeline}
                </p>
              )}
            </div>
          )}

          {invitation.status === 'viewed' && (
            <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/40">
              <h4 className="font-medium text-blue-300 mb-2">👀 Owner is Reviewing</h4>
              <p className="text-sm text-blue-200">
                {invitation.owner_name} has opened the invitation and is reviewing your configuration. 
                You should hear back from them soon.
              </p>
            </div>
          )}

          {invitation.status === 'accepted' && (
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/40">
              <h4 className="font-medium text-green-300 mb-2">✅ Invitation Accepted!</h4>
              <p className="text-sm text-green-200">
                Great news! {invitation.owner_name} has accepted the invitation and approved your setup. 
                The ownership transfer process will begin shortly.
              </p>
              {invitation.owner_feedback && (
                <div className="mt-3 p-3 rounded bg-white/10">
                  <p className="text-sm"><strong>Owner's feedback:</strong> {invitation.owner_feedback}</p>
                </div>
              )}
            </div>
          )}

          {invitation.status === 'declined' && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40">
              <h4 className="font-medium text-red-300 mb-2">❌ Invitation Declined</h4>
              <p className="text-sm text-red-200">
                {invitation.owner_name} has declined the invitation. You can send a new invitation 
                after addressing their concerns.
              </p>
              {invitation.owner_feedback && (
                <div className="mt-3 p-3 rounded bg-white/10">
                  <p className="text-sm"><strong>Owner's feedback:</strong> {invitation.owner_feedback}</p>
                </div>
              )}
              <button
                onClick={() => setShowInviteForm(true)}
                className={`${getButtonStyle('outline')} mt-3`}
              >
                Send New Invitation
              </button>
            </div>
          )}
        </div>
      ) : (
        // No invitation sent yet
        <div className="text-center py-8">
          {!showInviteForm ? (
            <div>
              <span className="text-4xl block mb-4">👑</span>
              <h3 className={`${getTextStyle('cardTitle')} mb-2`}>Ready to Invite the Owner?</h3>
              <p className={`${getTextStyle('body')} text-white/70 mb-6`}>
                You've set up the configuration. Now invite the business owner to review and approve your work.
              </p>
              <button
                onClick={() => setShowInviteForm(true)}
                className={`${getButtonStyle('primary')} px-8 py-3`}
              >
                📧 Invite Business Owner
              </button>
            </div>
          ) : (
            // Invitation Form
            <form onSubmit={handleSendInvitation} className="text-left space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className={getTextStyle('cardTitle')}>👑 Invite Business Owner</h3>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="text-white/60 hover:text-white/80"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Owner's Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className={getFormFieldStyle('default')}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className={getFormFieldStyle('default')}
                    placeholder="owner@restaurant.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className={getFormFieldStyle('default')}
                    placeholder="+64 21 123 4567"
                  />
                </div>

                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>
                    Relationship
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className={getFormFieldStyle('default')}
                  >
                    <option value="Business Owner">Business Owner</option>
                    <option value="Managing Partner">Managing Partner</option>
                    <option value="CEO">CEO</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>
                  Personal Message (Optional)
                </label>
                <textarea
                  value={formData.evaluationMessage}
                  onChange={(e) => setFormData({ ...formData, evaluationMessage: e.target.value })}
                  className={getFormFieldStyle('default')}
                  placeholder="Add a personal note to the owner about your evaluation..."
                  rows={3}
                />
              </div>

              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>
                  Decision Timeline
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className={getFormFieldStyle('default')}
                  placeholder="e.g., Need decision by end of week"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeROI"
                  checked={formData.includeROIData}
                  onChange={(e) => setFormData({ ...formData, includeROIData: e.target.checked })}
                  className="w-4 h-4 bg-white/20 border-white/40 rounded focus:ring-blue-500 focus:ring-2 text-blue-500"
                />
                <label htmlFor="includeROI" className={getTextStyle('body')}>
                  Include ROI calculations and value metrics in invitation
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSending}
                  className={`${getButtonStyle('primary')} flex-1 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSending ? '📧 Sending...' : '📧 Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className={`${getButtonStyle('outline')} px-6`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}