/**
 * DEV Level Authentication System
 * Provides secure authentication for development team access to /dev tools
 * Works in both development and production environments
 */

export type DevRole = 'DEV' | 'SENIOR_DEV' | 'ARCHITECT'

export interface DevUser {
  username: string
  role: DevRole
  loginTime: number
  expiresAt: number
}

export interface DevCredentials {
  username: string
  password: string
  role: DevRole
}

// DEV authentication configuration
const DEV_CONFIG = {
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  SESSION_KEY: 'hospitality_dev_session',
  COOKIE_NAME: 'dev_session_token',
}

/**
 * Get DEV credentials from environment variables
 * Format: DEV_CREDENTIALS=user1:pass1:DEV,user2:pass2:SENIOR_DEV
 */
function getDevCredentials(): DevCredentials[] {
  const credentialsStr = process.env.DEV_CREDENTIALS || 
    // Default dev credentials for development (should be overridden in production)
    'dev:dev123:DEV,senior:senior123:SENIOR_DEV,architect:arch123:ARCHITECT'
  
  return credentialsStr.split(',').map(cred => {
    const [username, password, role] = cred.split(':')
    return { username, password, role: role as DevRole }
  })
}

/**
 * Verify DEV credentials
 */
export function verifyDevCredentials(username: string, password: string): DevUser | null {
  const credentials = getDevCredentials()
  const validCredential = credentials.find(
    cred => cred.username === username && cred.password === password
  )
  
  if (!validCredential) {
    return null
  }
  
  const now = Date.now()
  return {
    username: validCredential.username,
    role: validCredential.role,
    loginTime: now,
    expiresAt: now + DEV_CONFIG.SESSION_DURATION
  }
}

/**
 * Create DEV session token
 */
export function createDevSessionToken(devUser: DevUser): string {
  const payload = {
    username: devUser.username,
    role: devUser.role,
    loginTime: devUser.loginTime,
    expiresAt: devUser.expiresAt
  }
  
  // Simple base64 encoding for now (could be enhanced with JWT)
  return btoa(JSON.stringify(payload))
}

/**
 * Verify and decode DEV session token
 */
export function verifyDevSessionToken(token: string): DevUser | null {
  try {
    const payload = JSON.parse(atob(token))
    const now = Date.now()
    
    // Check if token is expired
    if (now > payload.expiresAt) {
      return null
    }
    
    return {
      username: payload.username,
      role: payload.role,
      loginTime: payload.loginTime,
      expiresAt: payload.expiresAt
    }
  } catch {
    return null
  }
}

/**
 * Client-side session management
 */
export class DevSessionManager {
  static setSession(devUser: DevUser): void {
    if (typeof window === 'undefined') return
    
    const token = createDevSessionToken(devUser)
    localStorage.setItem(DEV_CONFIG.SESSION_KEY, token)
    
    // Also set as cookie for middleware access
    document.cookie = `${DEV_CONFIG.COOKIE_NAME}=${token}; path=/dev; max-age=${DEV_CONFIG.SESSION_DURATION / 1000}`
  }
  
  static getSession(): DevUser | null {
    if (typeof window === 'undefined') return null
    
    try {
      const token = localStorage.getItem(DEV_CONFIG.SESSION_KEY)
      if (!token) {
        console.log('🔧 DEV SESSION: No token found in localStorage')
        return null
      }
      
      const session = verifyDevSessionToken(token)
      if (session) {
        console.log('🔧 DEV SESSION: Valid session found for', session.username)
      } else {
        console.log('🔧 DEV SESSION: Invalid or expired token, clearing storage')
        localStorage.removeItem(DEV_CONFIG.SESSION_KEY)
      }
      return session
    } catch (error) {
      console.error('🚫 DEV SESSION: Error retrieving session', error)
      return null
    }
  }
  
  static clearSession(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(DEV_CONFIG.SESSION_KEY)
    document.cookie = `${DEV_CONFIG.COOKIE_NAME}=; path=/dev; expires=Thu, 01 Jan 1970 00:00:01 GMT`
  }
  
  static isAuthenticated(): boolean {
    return this.getSession() !== null
  }
  
  static hasRole(requiredRole: DevRole): boolean {
    const session = this.getSession()
    if (!session) return false
    
    const roleHierarchy: Record<DevRole, number> = {
      'DEV': 1,
      'SENIOR_DEV': 2,
      'ARCHITECT': 3
    }
    
    return roleHierarchy[session.role] >= roleHierarchy[requiredRole]
  }
}

/**
 * Server-side session verification
 */
export function getDevSessionFromCookie(cookieValue: string): DevUser | null {
  return verifyDevSessionToken(cookieValue)
}

/**
 * Audit logging for DEV access
 */
export function logDevAccess(devUser: DevUser, action: string, resource: string): void {
  const timestamp = new Date().toISOString()
  console.log(`🔧 DEV ACCESS [${timestamp}] ${devUser.username} (${devUser.role}) - ${action} on ${resource}`)
  
  // In production, this could be sent to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement production logging
  }
}

export default {
  verifyDevCredentials,
  createDevSessionToken,
  verifyDevSessionToken,
  getDevSessionFromCookie,
  logDevAccess,
  DevSessionManager,
  DEV_CONFIG
}