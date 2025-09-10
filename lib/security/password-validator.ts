// Password Security Validator for JiGR Hospitality Compliance
// Implements comprehensive password complexity requirements

export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-100
  feedback: string[]
  errors: string[]
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxConsecutiveChars: number
  preventCommonPasswords: boolean
  preventUserInfo: boolean
}

// Default password policy for hospitality compliance
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxConsecutiveChars: 3,
  preventCommonPasswords: true,
  preventUserInfo: true
}

// Common passwords to reject
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'welcome', 'login', 'guest', 'user', 'test', 'demo',
  'hospitality', 'restaurant', 'kitchen', 'food', 'cafe', 'compliance'
]

// Special characters allowed
const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

export class PasswordValidator {
  private policy: PasswordPolicy

  constructor(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
    this.policy = policy
  }

  /**
   * Validate password against security policy
   */
  validatePassword(
    password: string, 
    userInfo?: { 
      firstName?: string
      lastName?: string
      email?: string
      organization?: string
    }
  ): PasswordValidationResult {
    const errors: string[] = []
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length < this.policy.minLength) {
      errors.push(`Password must be at least ${this.policy.minLength} characters long`)
    } else {
      score += 20
      if (password.length >= 12) {
        score += 10
        feedback.push('Good length!')
      }
    }

    // Character type requirements
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else if (this.policy.requireUppercase) {
      score += 15
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else if (this.policy.requireLowercase) {
      score += 15
    }

    if (this.policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    } else if (this.policy.requireNumbers) {
      score += 15
    }

    if (this.policy.requireSpecialChars && !SPECIAL_CHARS.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)')
    } else if (this.policy.requireSpecialChars) {
      score += 15
    }

    // Consecutive characters check
    if (this.hasConsecutiveChars(password, this.policy.maxConsecutiveChars)) {
      errors.push(`Password cannot have more than ${this.policy.maxConsecutiveChars} consecutive identical characters`)
    } else {
      score += 5
    }

    // Common password check
    if (this.policy.preventCommonPasswords && this.isCommonPassword(password)) {
      errors.push('Password is too common. Please choose a more unique password')
    } else {
      score += 10
    }

    // User information check
    if (this.policy.preventUserInfo && userInfo && this.containsUserInfo(password, userInfo)) {
      errors.push('Password should not contain personal information')
    } else {
      score += 10
    }

    // Additional complexity scoring
    const charTypes = this.getCharacterTypes(password)
    if (charTypes >= 4) {
      score += 10
      feedback.push('Great character variety!')
    }

    // Password strength feedback
    if (score >= 90) {
      feedback.push('Excellent password strength!')
    } else if (score >= 70) {
      feedback.push('Good password strength')
    } else if (score >= 50) {
      feedback.push('Moderate password strength')
    }

    return {
      isValid: errors.length === 0,
      score: Math.min(score, 100),
      feedback,
      errors
    }
  }

  /**
   * Generate password strength indicator
   */
  getPasswordStrength(password: string): 'weak' | 'moderate' | 'strong' | 'excellent' {
    const result = this.validatePassword(password)
    
    if (result.score >= 90) return 'excellent'
    if (result.score >= 70) return 'strong'
    if (result.score >= 50) return 'moderate'
    return 'weak'
  }

  /**
   * Check for consecutive identical characters
   */
  private hasConsecutiveChars(password: string, maxConsecutive: number): boolean {
    let consecutive = 1
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        consecutive++
        if (consecutive > maxConsecutive) {
          return true
        }
      } else {
        consecutive = 1
      }
    }
    return false
  }

  /**
   * Check if password is in common passwords list
   */
  private isCommonPassword(password: string): boolean {
    const lowercasePassword = password.toLowerCase()
    return COMMON_PASSWORDS.some(common => 
      lowercasePassword === common || 
      lowercasePassword.includes(common) ||
      common.includes(lowercasePassword)
    )
  }

  /**
   * Check if password contains user information
   */
  private containsUserInfo(password: string, userInfo: any): boolean {
    const lowercasePassword = password.toLowerCase()
    
    const infoToCheck = [
      userInfo.firstName,
      userInfo.lastName,
      userInfo.email?.split('@')[0], // username part of email
      userInfo.organization
    ].filter(Boolean)

    return infoToCheck.some(info => {
      if (!info || info.length < 3) return false
      return lowercasePassword.includes(info.toLowerCase())
    })
  }

  /**
   * Count different character types in password
   */
  private getCharacterTypes(password: string): number {
    let types = 0
    if (/[a-z]/.test(password)) types++
    if (/[A-Z]/.test(password)) types++
    if (/[0-9]/.test(password)) types++
    if (SPECIAL_CHARS.test(password)) types++
    return types
  }

  /**
   * Generate password suggestions
   */
  generatePasswordSuggestions(): string[] {
    return [
      'Use a mix of uppercase and lowercase letters',
      'Include numbers and special characters (!@#$%^&*)',
      'Make it at least 8 characters long (12+ is better)',
      'Avoid common words or personal information',
      'Consider using a passphrase with special characters',
      'Example pattern: Capital+word+number+symbol+word'
    ]
  }
}

// Default validator instance
export const passwordValidator = new PasswordValidator()

// Utility functions for easy import
export function validatePassword(
  password: string,
  userInfo?: any
): PasswordValidationResult {
  return passwordValidator.validatePassword(password, userInfo)
}

export function getPasswordStrength(password: string): 'weak' | 'moderate' | 'strong' | 'excellent' {
  return passwordValidator.getPasswordStrength(password)
}

export function isValidPassword(password: string, userInfo?: any): boolean {
  return passwordValidator.validatePassword(password, userInfo).isValid
}