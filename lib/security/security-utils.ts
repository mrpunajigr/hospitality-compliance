// Security Utilities for JiGR Hospitality Compliance
// Comprehensive security functions for input validation, sanitization, and protection

// Input sanitization and validation
export class SecurityUtils {
  
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(input: string): string {
    if (!input) return ''
    
    // Basic HTML sanitization - remove dangerous tags and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/data:(?!image\/)/gi, '') // Remove data: URLs except images
      .trim()
  }

  /**
   * Sanitize text input for safe database storage
   */
  static sanitizeText(input: string): string {
    if (!input) return ''
    
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 10000) // Limit length
  }

  /**
   * Validate and sanitize email addresses
   */
  static sanitizeEmail(email: string): string | null {
    if (!email) return null
    
    const sanitized = email.toLowerCase().trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!emailRegex.test(sanitized)) {
      return null
    }
    
    // Additional checks for suspicious patterns
    if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
      return null
    }
    
    return sanitized
  }

  /**
   * Validate and sanitize phone numbers
   */
  static sanitizePhone(phone: string): string | null {
    if (!phone) return null
    
    // Remove all non-digit characters except + at the start
    const cleaned = phone.replace(/[^\d+]/g, '')
    
    // Basic validation - must be 7-15 digits with optional + prefix
    const phoneRegex = /^\+?[\d]{7,15}$/
    
    if (!phoneRegex.test(cleaned)) {
      return null
    }
    
    return cleaned
  }

  /**
   * Validate file uploads for security
   */
  static validateFileUpload(file: {
    name: string
    size: number
    type: string
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // File size limits (10MB for documents, 5MB for images)
    const maxSize = file.type.startsWith('image/') ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`)
    }
    
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed')
    }
    
    // Dangerous file extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.js', '.vbs', '.jar',
      '.php', '.asp', '.aspx', '.jsp', '.pl', '.py', '.sh', '.ps1'
    ]
    
    const fileName = file.name.toLowerCase()
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      errors.push('File extension not allowed')
    }
    
    // File name validation
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('File name contains invalid characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Generate secure random tokens
   */
  static generateSecureToken(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      result += charset[randomIndex]
    }
    
    return result
  }

  /**
   * Hash sensitive data (one-way)
   */
  static async hashSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validate SQL query safety (basic check)
   */
  static isQuerySafe(query: string): boolean {
    const dangerousPatterns = [
      /\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|EXEC|EXECUTE)\b/i,
      /[;'"\\]/,
      /--/,
      /\/\*/,
      /\*\//,
      /\bUNION\b/i,
      /\bSELECT\b.*\bFROM\b/i
    ]
    
    return !dangerousPatterns.some(pattern => pattern.test(query))
  }

  /**
   * Validate JSON input safety
   */
  static validateJSONInput(input: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for dangerous function calls
    const jsonString = JSON.stringify(input)
    const dangerousPatterns = [
      /constructor/i,
      /__proto__/i,
      /prototype/i,
      /function/i,
      /eval/i,
      /script/i
    ]
    
    if (dangerousPatterns.some(pattern => pattern.test(jsonString))) {
      errors.push('Input contains potentially dangerous content')
    }
    
    // Check object depth (prevent prototype pollution)
    const checkDepth = (obj: any, depth = 0): boolean => {
      if (depth > 10) return false
      if (typeof obj !== 'object' || obj === null) return true
      
      for (const key in obj) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return false
        }
        if (!checkDepth(obj[key], depth + 1)) {
          return false
        }
      }
      return true
    }
    
    if (!checkDepth(input)) {
      errors.push('Input object too deeply nested or contains dangerous properties')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Rate limit key generation for security
   */
  static generateRateLimitKey(identifier: string, action: string): string {
    return `rl:${action}:${identifier}`
  }

  /**
   * Check if IP address is suspicious
   */
  static isSuspiciousIP(ip: string): boolean {
    // Local/private IPs are generally safe
    const privateRanges = [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^::1$/,
      /^fe80:/,
      /^fc00:/
    ]
    
    if (privateRanges.some(range => range.test(ip))) {
      return false
    }
    
    // Add known bad IP patterns here
    const suspiciousPatterns = [
      /^0\./, // Invalid range
      /^255\./, // Broadcast
      /^224\./, // Multicast
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(ip))
  }

  /**
   * Validate user agent for suspicious activity
   */
  static validateUserAgent(userAgent: string): boolean {
    if (!userAgent || userAgent.length < 10) {
      return false
    }
    
    // Known bot/attack patterns
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /script/i
    ]
    
    // Allow legitimate browsers
    const legitimatePatterns = [
      /Mozilla/,
      /Chrome/,
      /Safari/,
      /Firefox/,
      /Edge/,
      /Opera/
    ]
    
    const hasLegitimate = legitimatePatterns.some(pattern => pattern.test(userAgent))
    const hasSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
    
    return hasLegitimate && !hasSuspicious
  }

  /**
   * Enhanced audit logging for security events
   */
  static logSecurityEvent(event: {
    type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'access_denied' | 'csrf_violation'
    userId?: string
    ip: string
    userAgent?: string
    details: Record<string, any>
    severity: 'low' | 'medium' | 'high' | 'critical'
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'SECURITY_EVENT',
      event: event.type,
      severity: event.severity,
      userId: event.userId || 'anonymous',
      ip: event.ip,
      userAgent: event.userAgent || 'unknown',
      details: event.details,
      environment: process.env.NODE_ENV || 'unknown'
    }
    
    // Log to console (in production, this should go to a security monitoring system)
    console.warn('🚨 SECURITY EVENT:', JSON.stringify(logEntry, null, 2))
    
    // In production, you might want to:
    // - Send to SIEM system
    // - Store in security audit database
    // - Send alerts for critical events
    // - Update threat intelligence
  }
}

// Utility functions for easy import
export const {
  sanitizeHTML,
  sanitizeText, 
  sanitizeEmail,
  sanitizePhone,
  validateFileUpload,
  generateSecureToken,
  hashSensitiveData,
  isQuerySafe,
  validateJSONInput,
  generateRateLimitKey,
  isSuspiciousIP,
  validateUserAgent,
  logSecurityEvent
} = SecurityUtils

// Security middleware helper for API routes
export function createSecurityMiddleware() {
  return {
    validateInput: (input: any) => SecurityUtils.validateJSONInput(input),
    sanitizeInput: (input: string) => SecurityUtils.sanitizeText(input),
    logEvent: (event: Parameters<typeof SecurityUtils.logSecurityEvent>[0]) => 
      SecurityUtils.logSecurityEvent(event)
  }
}

// Export singleton
export const securityUtils = new SecurityUtils()