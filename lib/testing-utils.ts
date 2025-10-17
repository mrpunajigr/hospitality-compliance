/**
 * Testing Utilities for JiGR Hospitality Compliance Platform
 * 
 * Provides utilities for generating testing URLs and managing tester sessions
 * Compatible with iPad Air (2013) Safari 12
 */

export interface TesterInfo {
  id: string
  name: string
  email?: string
  role?: string
  company?: string
}

export interface TestingSession {
  testerId: string
  startTime: string
  environment: 'development' | 'staging' | 'production'
  baseUrl: string
  expiresAt?: string
}

/**
 * Generate a testing URL for a specific tester
 */
export const generateTestingUrl = (
  testerId: string, 
  environment: 'development' | 'staging' | 'production' = 'development',
  basePath: string = '/'
): string => {
  const baseUrls = {
    development: 'http://localhost:3000',
    staging: process.env.NEXT_PUBLIC_STAGING_URL || 'https://staging.jigr.app',
    production: process.env.NEXT_PUBLIC_APP_URL || 'https://app.jigr.app'
  }
  
  const baseUrl = baseUrls[environment]
  const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`
  
  return `${baseUrl}${cleanPath}?testing=true&testerId=${encodeURIComponent(testerId)}`
}

/**
 * Generate testing URLs for multiple environments
 */
export const generateMultiEnvironmentUrls = (testerId: string, basePath: string = '/') => {
  return {
    development: generateTestingUrl(testerId, 'development', basePath),
    staging: generateTestingUrl(testerId, 'staging', basePath),
    production: generateTestingUrl(testerId, 'production', basePath)
  }
}

/**
 * Create a comprehensive testing session
 */
export const createTestingSession = (testerInfo: TesterInfo, environment: 'development' | 'staging' | 'production' = 'development'): TestingSession => {
  return {
    testerId: testerInfo.id,
    startTime: new Date().toISOString(),
    environment,
    baseUrl: generateTestingUrl(testerInfo.id, environment),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }
}

/**
 * Predefined app developers for testing
 */
export const APP_DEVELOPERS: TesterInfo[] = [
  {
    id: 'sarah_smith',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'Senior Mobile Developer',
    company: 'DevCorp'
  },
  {
    id: 'john_doe',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Full Stack Developer',
    company: 'TechSolutions'
  },
  {
    id: 'maria_garcia',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    role: 'UI/UX Developer',
    company: 'DesignStudio'
  },
  {
    id: 'david_chen',
    name: 'David Chen',
    email: 'david@example.com',
    role: 'Frontend Specialist',
    company: 'WebExperts'
  },
  {
    id: 'emma_wilson',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'React Developer',
    company: 'ReactPros'
  }
]

/**
 * Generate testing URLs for all predefined developers
 */
export const generateAllDeveloperUrls = (environment: 'development' | 'staging' | 'production' = 'development') => {
  return APP_DEVELOPERS.map(developer => ({
    developer,
    urls: generateMultiEnvironmentUrls(developer.id),
    primaryUrl: generateTestingUrl(developer.id, environment),
    session: createTestingSession(developer, environment)
  }))
}

/**
 * Key pages for testing coverage
 */
export const KEY_TESTING_PAGES = [
  { path: '/', name: 'Login Page', priority: 'high' },
  { path: '/admin/console', name: 'Admin Console', priority: 'high' },
  { path: '/admin/profile', name: 'Profile Page', priority: 'high' },
  { path: '/admin/upload', name: 'Upload Module', priority: 'high' },
  { path: '/admin/delivery', name: 'Delivery Tracking', priority: 'medium' },
  { path: '/admin/reports', name: 'Reports', priority: 'medium' },
  { path: '/admin/team', name: 'Team Management', priority: 'medium' },
  { path: '/admin/settings', name: 'Settings', priority: 'low' },
  { path: '/company-setup', name: 'Company Setup', priority: 'high' },
  { path: '/register', name: 'Account Creation', priority: 'high' }
] as const

/**
 * Generate comprehensive testing URLs for all key pages
 */
export const generateComprehensiveTestingUrls = (testerId: string, environment: 'development' | 'staging' | 'production' = 'development') => {
  return KEY_TESTING_PAGES.map(page => ({
    ...page,
    url: generateTestingUrl(testerId, environment, page.path),
    testingInstructions: getTestingInstructions(page.name)
  }))
}

/**
 * Get testing instructions for specific pages
 */
export const getTestingInstructions = (pageName: string): string[] => {
  const instructions: Record<string, string[]> = {
    'Login Page': [
      'Test with valid and invalid credentials',
      'Check iPad responsiveness',
      'Verify glass morphism effects work',
      'Test form validation messages'
    ],
    'Admin Console': [
      'Check all dashboard cards display correctly',
      'Test sidebar navigation',
      'Verify statistics are readable',
      'Check module icons and hover states'
    ],
    'Profile Page': [
      'Test avatar upload functionality',
      'Check form field responsiveness',
      'Verify onboarding flow if applicable',
      'Test notification preferences'
    ],
    'Upload Module': [
      'Test file upload with various formats',
      'Check OCR processing feedback',
      'Verify results display correctly',
      'Test error handling for unsupported files'
    ],
    'Delivery Tracking': [
      'Test delivery docket upload',
      'Check parsing accuracy',
      'Verify temperature compliance alerts',
      'Test search and filter functionality'
    ],
    'Company Setup': [
      'Test company information form',
      'Check logo upload functionality',
      'Verify business type selection',
      'Test form validation'
    ],
    'Account Creation': [
      'Test registration form',
      'Check email validation',
      'Verify password requirements',
      'Test invitation flow if applicable'
    ]
  }
  
  return instructions[pageName] || [
    'Navigate through the interface',
    'Test all interactive elements',
    'Check responsiveness on iPad Air',
    'Report any visual or functional issues'
  ]
}

/**
 * Validate if current URL is in testing mode
 */
export const isTestingMode = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const params = new URLSearchParams(window.location.search)
  return params.get('testing') === 'true'
}

/**
 * Get current tester ID from URL
 */
export const getCurrentTesterId = (): string | null => {
  if (typeof window === 'undefined') return null
  
  const params = new URLSearchParams(window.location.search)
  return params.get('testerId')
}

/**
 * Generate email template for sending testing links to developers
 */
export const generateTesterEmailTemplate = (developer: TesterInfo, environment: 'development' | 'staging' | 'production' = 'development') => {
  const session = createTestingSession(developer, environment)
  const keyUrls = generateComprehensiveTestingUrls(developer.id, environment)
  
  return {
    to: developer.email,
    subject: `JiGR App Testing Request - ${developer.name}`,
    body: `
Hi ${developer.name},

We'd like to invite you to test the JiGR Hospitality Compliance Platform and provide feedback.

=== TESTING SESSION DETAILS ===
Tester ID: ${developer.id}
Environment: ${environment.toUpperCase()}
Session Expires: ${new Date(session.expiresAt!).toLocaleDateString('en-NZ')}

=== MAIN TESTING URL ===
${session.baseUrl}

=== KEY PAGES TO TEST ===
${keyUrls.filter(page => page.priority === 'high').map(page => 
  `• ${page.name}: ${page.url}`
).join('\n')}

=== HOW TO USE THE FEEDBACK SYSTEM ===
1. Click any of the URLs above to start testing
2. You'll see a "📝 Testing Feedback" button in the bottom-right corner
3. On each page, click the button to add notes about issues or suggestions
4. Use the category and severity dropdowns to classify your feedback
5. When done testing, click "Send All" to email us your comprehensive feedback

=== TESTING FOCUS AREAS ===
• iPad Air compatibility (our primary target device)
• User interface responsiveness
• Navigation and workflow efficiency
• Any bugs or unexpected behavior
• Suggestions for improvements

=== DEVICE REQUIREMENTS ===
• Preferred: iPad Air with Safari browser
• Alternative: Desktop browser (Chrome/Safari/Firefox)
• Screen resolution: Test at various sizes

Your feedback is valuable to us and will help improve the platform for hospitality businesses across New Zealand.

Thank you for your time!

Best regards,
JiGR Development Team

---
This is an automated testing invitation from the JiGR Feedback System.
    `.trim()
  }
}

/**
 * Browser compatibility checks for Safari 12
 */
export const checkSafari12Compatibility = () => {
  if (typeof window === 'undefined') return { compatible: false, issues: [] }
  
  const issues: string[] = []
  
  // Check for basic JavaScript features
  if (!window.localStorage) {
    issues.push('localStorage not available')
  }
  
  if (!window.URLSearchParams) {
    issues.push('URLSearchParams not supported')
  }
  
  if (!window.fetch) {
    issues.push('fetch API not available')
  }
  
  // Check for modern CSS features that might not work
  const testEl = document.createElement('div')
  testEl.style.backdropFilter = 'blur(10px)'
  if (!testEl.style.backdropFilter) {
    issues.push('backdrop-filter not supported')
  }
  
  return {
    compatible: issues.length === 0,
    issues,
    userAgent: navigator.userAgent,
    isIPad: /iPad/.test(navigator.userAgent),
    isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  }
}