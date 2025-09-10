// Session Security Manager for JiGR Hospitality Compliance
// Handles secure session timeouts and user activity tracking

import { UserRole } from '../navigation-permissions'

export interface SessionConfig {
  timeoutMs: number // Session timeout in milliseconds
  warningMs: number // Warning time before timeout
  refreshThresholdMs: number // Refresh token when this much time left
  activityTimeoutMs: number // Inactivity timeout
}

export interface SessionStatus {
  isValid: boolean
  expiresAt: number
  lastActivity: number
  timeRemaining: number
  needsWarning: boolean
  needsRefresh: boolean
}

// Role-based session timeouts (in milliseconds)
export const SESSION_TIMEOUTS: Record<UserRole, SessionConfig> = {
  STAFF: {
    timeoutMs: 8 * 60 * 60 * 1000, // 8 hours
    warningMs: 15 * 60 * 1000, // 15 minutes warning
    refreshThresholdMs: 30 * 60 * 1000, // Refresh when 30 min left
    activityTimeoutMs: 30 * 60 * 1000 // 30 min inactivity
  },
  SUPERVISOR: {
    timeoutMs: 8 * 60 * 60 * 1000, // 8 hours
    warningMs: 15 * 60 * 1000, // 15 minutes warning
    refreshThresholdMs: 30 * 60 * 1000, // Refresh when 30 min left
    activityTimeoutMs: 45 * 60 * 1000 // 45 min inactivity
  },
  MANAGER: {
    timeoutMs: 12 * 60 * 60 * 1000, // 12 hours
    warningMs: 20 * 60 * 1000, // 20 minutes warning
    refreshThresholdMs: 45 * 60 * 1000, // Refresh when 45 min left
    activityTimeoutMs: 60 * 60 * 1000 // 1 hour inactivity
  },
  OWNER: {
    timeoutMs: 12 * 60 * 60 * 1000, // 12 hours
    warningMs: 30 * 60 * 1000, // 30 minutes warning
    refreshThresholdMs: 60 * 60 * 1000, // Refresh when 1 hour left
    activityTimeoutMs: 90 * 60 * 1000 // 1.5 hours inactivity
  }
}

// Activities that should extend session
export const SESSION_EXTENDING_ACTIVITIES = [
  'navigation',
  'form_submission',
  'file_upload',
  'api_call',
  'user_interaction',
  'data_modification'
]

class SessionTracker {
  private activityTimers = new Map<string, NodeJS.Timeout>()
  private sessionData = new Map<string, {
    lastActivity: number
    sessionStart: number
    role: UserRole
    userId: string
    extendedCount: number
  }>()

  /**
   * Initialize session tracking for user
   */
  initializeSession(userId: string, role: UserRole): void {
    const now = Date.now()
    
    // Clear any existing session
    this.destroySession(userId)
    
    // Set up new session
    this.sessionData.set(userId, {
      lastActivity: now,
      sessionStart: now,
      role,
      userId,
      extendedCount: 0
    })
    
    console.log(`🔐 Session initialized for user ${userId} with role ${role}`)
  }

  /**
   * Record user activity and extend session if needed
   */
  recordActivity(userId: string, activityType: string): void {
    const session = this.sessionData.get(userId)
    if (!session) {
      console.warn(`⚠️ Activity recorded for unknown session: ${userId}`)
      return
    }

    const now = Date.now()
    const config = SESSION_TIMEOUTS[session.role]
    
    // Update last activity
    session.lastActivity = now
    
    // Check if activity should extend session
    if (SESSION_EXTENDING_ACTIVITIES.includes(activityType)) {
      session.extendedCount++
      console.log(`🔄 Session activity: ${activityType} for user ${userId}`)
    }
    
    // Reset inactivity timer
    this.resetInactivityTimer(userId, config.activityTimeoutMs)
  }

  /**
   * Get current session status
   */
  getSessionStatus(userId: string): SessionStatus | null {
    const session = this.sessionData.get(userId)
    if (!session) {
      return null
    }

    const now = Date.now()
    const config = SESSION_TIMEOUTS[session.role]
    const sessionExpiresAt = session.sessionStart + config.timeoutMs
    const activityExpiresAt = session.lastActivity + config.activityTimeoutMs
    
    // Session expires at the earlier of session timeout or inactivity timeout
    const expiresAt = Math.min(sessionExpiresAt, activityExpiresAt)
    const timeRemaining = Math.max(0, expiresAt - now)
    
    return {
      isValid: timeRemaining > 0,
      expiresAt,
      lastActivity: session.lastActivity,
      timeRemaining,
      needsWarning: timeRemaining <= config.warningMs && timeRemaining > 0,
      needsRefresh: timeRemaining <= config.refreshThresholdMs && timeRemaining > 0
    }
  }

  /**
   * Check if session needs refresh
   */
  shouldRefreshSession(userId: string): boolean {
    const status = this.getSessionStatus(userId)
    return status ? status.needsRefresh : false
  }

  /**
   * Extend session (typically after token refresh)
   */
  extendSession(userId: string): boolean {
    const session = this.sessionData.get(userId)
    if (!session) {
      return false
    }

    const now = Date.now()
    const config = SESSION_TIMEOUTS[session.role]
    
    // Reset session start time but keep activity tracking
    session.sessionStart = now
    session.lastActivity = now
    session.extendedCount++
    
    // Reset timers
    this.resetInactivityTimer(userId, config.activityTimeoutMs)
    
    console.log(`🔄 Session extended for user ${userId}`)
    return true
  }

  /**
   * Destroy session and cleanup
   */
  destroySession(userId: string): void {
    // Clear timers
    const timer = this.activityTimers.get(userId)
    if (timer) {
      clearTimeout(timer)
      this.activityTimers.delete(userId)
    }
    
    // Remove session data
    this.sessionData.delete(userId)
    
    console.log(`🔐 Session destroyed for user ${userId}`)
  }

  /**
   * Get all active sessions (for admin monitoring)
   */
  getActiveSessions(): Array<{
    userId: string
    role: UserRole
    sessionStart: number
    lastActivity: number
    extendedCount: number
    status: SessionStatus
  }> {
    const sessions = []
    
    for (const [userId, session] of Array.from(this.sessionData.entries())) {
      const status = this.getSessionStatus(userId)
      if (status && status.isValid) {
        sessions.push({
          userId,
          role: session.role,
          sessionStart: session.sessionStart,
          lastActivity: session.lastActivity,
          extendedCount: session.extendedCount,
          status
        })
      }
    }
    
    return sessions
  }

  /**
   * Reset inactivity timer
   */
  private resetInactivityTimer(userId: string, timeoutMs: number): void {
    // Clear existing timer
    const existingTimer = this.activityTimers.get(userId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      console.log(`⏰ Inactivity timeout for user ${userId}`)
      this.destroySession(userId)
    }, timeoutMs)
    
    this.activityTimers.set(userId, timer)
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now()
    const expiredUsers = []
    
    for (const [userId] of Array.from(this.sessionData.entries())) {
      const status = this.getSessionStatus(userId)
      if (!status || !status.isValid) {
        expiredUsers.push(userId)
      }
    }
    
    expiredUsers.forEach(userId => {
      this.destroySession(userId)
    })
    
    if (expiredUsers.length > 0) {
      console.log(`🧹 Cleaned up ${expiredUsers.length} expired sessions`)
    }
  }
}

// Singleton session tracker
export const sessionTracker = new SessionTracker()

// Utility functions for easy integration
export function initializeUserSession(userId: string, role: UserRole): void {
  sessionTracker.initializeSession(userId, role)
}

export function recordUserActivity(userId: string, activityType: string): void {
  sessionTracker.recordActivity(userId, activityType)
}

export function getUserSessionStatus(userId: string): SessionStatus | null {
  return sessionTracker.getSessionStatus(userId)
}

export function shouldRefreshUserSession(userId: string): boolean {
  return sessionTracker.shouldRefreshSession(userId)
}

export function extendUserSession(userId: string): boolean {
  return sessionTracker.extendSession(userId)
}

export function destroyUserSession(userId: string): void {
  sessionTracker.destroySession(userId)
}

export function getActiveUserSessions(): ReturnType<SessionTracker['getActiveSessions']> {
  return sessionTracker.getActiveSessions()
}

// Session timeout utilities for frontend
export function formatTimeRemaining(timeMs: number): string {
  const totalMinutes = Math.floor(timeMs / (60 * 1000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function getSessionWarningMessage(status: SessionStatus, role: UserRole): string {
  const timeStr = formatTimeRemaining(status.timeRemaining)
  
  if (status.needsWarning) {
    return `Your session will expire in ${timeStr}. Save your work and refresh to continue.`
  }
  
  return `Session active. Time remaining: ${timeStr}`
}

// Cleanup interval - run every 5 minutes
setInterval(() => {
  sessionTracker.cleanupExpiredSessions()
}, 5 * 60 * 1000)

// Graceful shutdown cleanup
process.on('SIGINT', () => {
  console.log('🔐 Cleaning up sessions before shutdown...')
  // Could save session state here if needed
})

process.on('SIGTERM', () => {
  console.log('🔐 Cleaning up sessions before shutdown...')
  // Could save session state here if needed
})