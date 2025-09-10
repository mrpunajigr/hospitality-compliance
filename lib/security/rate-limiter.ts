// Rate Limiting System for JiGR Hospitality Compliance
// Prevents abuse and ensures system stability

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests in window
  keyGenerator?: (request: any) => string // Custom key generator
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

// Default rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 1 minute.'
  },
  
  // API endpoints - generous for normal use
  api: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 100,
    message: 'Too many API requests. Please slow down.'
  },
  
  // Invitation endpoints - prevent spam
  invitations: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many invitations sent. Please try again later.'
  },
  
  // Upload endpoints - prevent abuse
  uploads: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many file uploads. Please slow down.'
  },

  // Admin endpoints - very strict
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many admin requests. Please slow down.'
  }
}

class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key)
    if (!data) return null
    
    // Clean up expired entries
    if (data.resetTime < Date.now()) {
      this.store.delete(key)
      return null
    }
    
    return data
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    this.store.set(key, { count, resetTime })
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const data = await this.get(key)
    
    if (!data) {
      const resetTime = now + windowMs
      await this.set(key, 1, resetTime)
      return { count: 1, resetTime }
    }
    
    const newCount = data.count + 1
    await this.set(key, newCount, data.resetTime)
    return { count: newCount, resetTime: data.resetTime }
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, data] of Array.from(this.store.entries())) {
      if (data.resetTime < now) {
        this.store.delete(key)
      }
    }
  }
}

export class RateLimiter {
  private store: InMemoryStore
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.store = new InMemoryStore()
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.store.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    key: string, 
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      const { count, resetTime } = await this.store.increment(key, config.windowMs)
      const remaining = Math.max(0, config.maxRequests - count)
      
      if (count > config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
        return {
          success: false,
          remaining: 0,
          resetTime,
          retryAfter: Math.max(retryAfter, 1)
        }
      }
      
      return {
        success: true,
        remaining,
        resetTime
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open - allow request if rate limiter fails
      return {
        success: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs
      }
    }
  }

  /**
   * Generate rate limit key from request
   */
  generateKey(
    identifier: string, 
    endpoint: string, 
    prefix: string = 'rl'
  ): string {
    return `${prefix}:${endpoint}:${identifier}`
  }

  /**
   * Get client identifier from request
   */
  getClientIdentifier(request: any): string {
    // Try to get user ID first (most specific)
    if (request.user?.id) {
      return `user:${request.user.id}`
    }
    
    // Fall back to IP address
    const forwarded = request.headers['x-forwarded-for']
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers['x-real-ip'] || 
               request.connection?.remoteAddress || 
               'unknown'
    
    return `ip:${ip}`
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Utility function for Next.js API routes
export async function checkRateLimit(
  request: any,
  endpoint: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = rateLimiter.getClientIdentifier(request)
  const key = rateLimiter.generateKey(identifier, endpoint)
  
  // Use default config based on endpoint type
  let rateLimitConfig = config
  if (!rateLimitConfig) {
    if (endpoint.includes('auth') || endpoint.includes('login')) {
      rateLimitConfig = RATE_LIMIT_CONFIGS.auth
    } else if (endpoint.includes('invite')) {
      rateLimitConfig = RATE_LIMIT_CONFIGS.invitations
    } else if (endpoint.includes('upload')) {
      rateLimitConfig = RATE_LIMIT_CONFIGS.uploads
    } else if (endpoint.includes('admin')) {
      rateLimitConfig = RATE_LIMIT_CONFIGS.admin
    } else {
      rateLimitConfig = RATE_LIMIT_CONFIGS.api
    }
  }
  
  return rateLimiter.checkLimit(key, rateLimitConfig)
}

// Middleware helper for rate limiting
export function createRateLimitMiddleware(
  endpoint: string,
  config?: RateLimitConfig
) {
  return async (request: any): Promise<{ 
    success: boolean
    headers: Record<string, string>
    error?: string 
  }> => {
    const result = await checkRateLimit(request, endpoint, config)
    
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': config?.maxRequests.toString() || '100',
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    }
    
    if (!result.success && result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString()
    }
    
    return {
      success: result.success,
      headers,
      error: result.success ? undefined : config?.message || 'Rate limit exceeded'
    }
  }
}

// Predefined middleware for common endpoints
export const authRateLimit = createRateLimitMiddleware('auth', RATE_LIMIT_CONFIGS.auth)
export const apiRateLimit = createRateLimitMiddleware('api', RATE_LIMIT_CONFIGS.api)
export const inviteRateLimit = createRateLimitMiddleware('invite', RATE_LIMIT_CONFIGS.invitations)
export const uploadRateLimit = createRateLimitMiddleware('upload', RATE_LIMIT_CONFIGS.uploads)
export const adminRateLimit = createRateLimitMiddleware('admin', RATE_LIMIT_CONFIGS.admin)