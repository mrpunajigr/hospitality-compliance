/**
 * Password generation utilities for onboarding flow
 */

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns Secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  // Character sets for password generation
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%&*+-=?'
  
  // Ensure password has at least one character from each set
  const required = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ]
  
  // Fill remaining length with random characters from all sets
  const allChars = lowercase + uppercase + numbers + symbols
  const remaining = Array.from({ length: length - 4 }, () =>
    allChars[Math.floor(Math.random() * allChars.length)]
  )
  
  // Combine and shuffle
  const password = [...required, ...remaining]
    .sort(() => Math.random() - 0.5)
    .join('')
  
  return password
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with score and feedback
 */
export function validatePasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%&*+\-=?]/.test(password)
  }
  
  const score = Object.values(checks).filter(Boolean).length
  
  return {
    score,
    isValid: score >= 4 && checks.length,
    checks,
    feedback: score < 4 ? 'Password needs more complexity' : 'Strong password'
  }
}