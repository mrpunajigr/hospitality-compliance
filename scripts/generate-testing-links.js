#!/usr/bin/env node

/**
 * Generate Testing Links for JiGR App Developers
 * 
 * This script generates comprehensive testing URLs for app developers
 * Usage: node scripts/generate-testing-links.js [environment]
 */

const fs = require('fs')
const path = require('path')

// App developers
const APP_DEVELOPERS = [
  {
    id: 'steve_laird',
    name: 'Steve Laird',
    email: 'steve@mrpuna.com',
    role: 'Senior Mobile Developer',
    company: 'mrpuna.com'
  }
]

// Key testing pages
const KEY_TESTING_PAGES = [
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
]

// Environment URLs
const BASE_URLS = {
  development: 'http://localhost:3000',
  staging: 'https://staging.jigr.app',
  production: 'https://jigr.app'
}

/**
 * Generate testing URL
 */
function generateTestingUrl(testerId, environment = 'development', basePath = '/') {
  const baseUrl = BASE_URLS[environment]
  const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`
  return `${baseUrl}${cleanPath}?testing=true&testerId=${encodeURIComponent(testerId)}`
}

/**
 * Generate comprehensive testing URLs for a developer
 */
function generateDeveloperUrls(developer, environment) {
  const urls = KEY_TESTING_PAGES.map(page => ({
    ...page,
    url: generateTestingUrl(developer.id, environment, page.path)
  }))
  
  return {
    developer,
    environment,
    primaryUrl: generateTestingUrl(developer.id, environment),
    pages: urls,
    highPriority: urls.filter(page => page.priority === 'high'),
    mediumPriority: urls.filter(page => page.priority === 'medium'),
    lowPriority: urls.filter(page => page.priority === 'low')
  }
}

/**
 * Generate email template
 */
function generateEmailTemplate(developer, environment) {
  const developerUrls = generateDeveloperUrls(developer, environment)
  
  return `
Subject: JiGR App Testing Request - ${developer.name}

Hi ${developer.name},

We'd like to invite you to test the JiGR Hospitality Compliance Platform and provide feedback.

=== TESTING SESSION DETAILS ===
Tester ID: ${developer.id}
Name: ${developer.name}
Role: ${developer.role}
Company: ${developer.company}
Environment: ${environment.toUpperCase()}

=== MAIN TESTING URL ===
${developerUrls.primaryUrl}

=== HIGH PRIORITY PAGES TO TEST ===
${developerUrls.highPriority.map(page => 
  `• ${page.name}: ${page.url}`
).join('\n')}

=== MEDIUM PRIORITY PAGES ===
${developerUrls.mediumPriority.map(page => 
  `• ${page.name}: ${page.url}`
).join('\n')}

=== DUAL TESTING WORKFLOW ===
🔄 STANDARD TESTING (Start Here):
• Use testing URLs below with feedback widget
• Submit feedback via "Send All" button as usual

🏗️ DETAILED ARCHITECTURE REVIEW (Advanced):
• Request dev dashboard access for systematic component testing
• Use architecture dashboard for comprehensive QA checklist
• Export detailed testing reports for team review

=== HOW TO USE THE FEEDBACK SYSTEM ===
📝 Quick Feedback (Public Testing URLs):
1. Click any of the URLs above to start testing
2. You'll see a "📝 Testing Feedback" button in the bottom-right corner
3. On each page, click the button to add notes about issues or suggestions
4. Use the category and severity dropdowns to classify your feedback
5. When done testing, click "Send All" to email us your comprehensive feedback

🔍 Detailed Architecture Review (Dev Dashboard):
1. Contact team lead for secure dev dashboard credentials
2. Access: https://jigr.app/dev/architecture-testing
3. Use systematic component testing checklist for thorough QA
4. Track testing progress across all app modules
5. Export comprehensive testing reports for development team

=== TESTING FOCUS AREAS ===
• iPad Air compatibility (our primary target device)
• User interface responsiveness
• Navigation and workflow efficiency
• Any bugs or unexpected behavior
• Suggestions for improvements
• Component-level functionality verification

=== DEVICE REQUIREMENTS ===
• Preferred: iPad Air with Safari browser
• Alternative: Desktop browser (Chrome/Safari/Firefox)
• Screen resolution: Test at various sizes

=== FEEDBACK INTEGRATION ===
Both testing systems send feedback to: dev@jigr.app
• Quick issues → Feedback widget (immediate reporting)
• Comprehensive QA → Dev dashboard (systematic testing)
• All feedback is consolidated for development team review

Your feedback is valuable to us and will help improve the platform for hospitality businesses across New Zealand.

Thank you for your time!

Best regards,
JiGR Development Team

---
Generated by JiGR Testing Link Generator
Date: ${new Date().toLocaleDateString('en-NZ')}
Environment: ${environment}
`.trim()
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(environment) {
  const allDeveloperUrls = APP_DEVELOPERS.map(dev => generateDeveloperUrls(dev, environment))
  
  return `
# JiGR Testing Links - ${environment.toUpperCase()} Environment

*Generated: ${new Date().toLocaleDateString('en-NZ')} at ${new Date().toLocaleTimeString('en-NZ')}*

## 🔗 Quick Access Links

| Developer | Primary Testing URL |
|-----------|-------------------|
${allDeveloperUrls.map(dev => 
  `| **${dev.developer.name}** (${dev.developer.company}) | [${dev.developer.id}](${dev.primaryUrl}) |`
).join('\n')}

## 📱 High Priority Testing Pages

${allDeveloperUrls.map(dev => `
### ${dev.developer.name} - High Priority Pages
${dev.highPriority.map(page => `- [${page.name}](${page.url})`).join('\n')}
`).join('\n')}

## 📋 Complete Testing URLs by Developer

${allDeveloperUrls.map(dev => `
### ${dev.developer.name} (${dev.developer.role})
**Company**: ${dev.developer.company}  
**Tester ID**: \`${dev.developer.id}\`  
**Email**: ${dev.developer.email}

#### All Testing Pages:
${dev.pages.map(page => `- **${page.name}** (${page.priority}): [Test Now](${page.url})`).join('\n')}
`).join('\n')}

## 📧 Email Templates

To send testing invitations, copy and paste these templates:

${allDeveloperUrls.map(dev => `
### Email for ${dev.developer.name}
\`\`\`
To: ${dev.developer.email}
${generateEmailTemplate(dev.developer, environment)}
\`\`\`
`).join('\n')}

## 🔧 Environment Configuration

- **Environment**: ${environment}
- **Base URL**: ${BASE_URLS[environment]}
- **Generated**: ${new Date().toISOString()}

## 📝 Testing Instructions

1. Send email templates to respective developers
2. Ensure all developers have access to testing documentation
3. Monitor feedback submissions at dev@jigr.app
4. Follow up on critical issues within 24 hours

---

*This document was generated automatically by the JiGR Testing Link Generator*
`.trim()
}

/**
 * Generate HTML summary for easy viewing
 */
function generateHtmlSummary(environment) {
  const allDeveloperUrls = APP_DEVELOPERS.map(dev => generateDeveloperUrls(dev, environment))
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JiGR Testing Links - ${environment.toUpperCase()}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
        }
        .header { 
            background: linear-gradient(135deg, #3B82F6, #1E40AF); 
            color: white; 
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 30px;
        }
        .developer-card { 
            border: 1px solid #E5E7EB; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 20px;
            background: #F9FAFB;
        }
        .url-list { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 10px; 
            margin: 15px 0;
        }
        .url-link { 
            display: block; 
            padding: 8px 12px; 
            background: #3B82F6; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            font-size: 14px;
        }
        .url-link:hover { 
            background: #2563EB; 
        }
        .priority-high { border-left: 4px solid #EF4444; }
        .priority-medium { border-left: 4px solid #F59E0B; }
        .priority-low { border-left: 4px solid #10B981; }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 20px 0;
        }
        .stat-card { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            border: 1px solid #E5E7EB;
            text-align: center;
        }
        .stat-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #3B82F6; 
        }
        code { 
            background: #F3F4F6; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 JiGR Testing Links</h1>
        <p><strong>Environment:</strong> ${environment.toUpperCase()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-NZ')} at ${new Date().toLocaleTimeString('en-NZ')}</p>
        <p><strong>Base URL:</strong> ${BASE_URLS[environment]}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${APP_DEVELOPERS.length}</div>
            <div>Developers</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${KEY_TESTING_PAGES.length}</div>
            <div>Test Pages</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${KEY_TESTING_PAGES.filter(p => p.priority === 'high').length}</div>
            <div>High Priority</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${APP_DEVELOPERS.length * KEY_TESTING_PAGES.length}</div>
            <div>Total Test URLs</div>
        </div>
    </div>

    <h2>👥 Developer Testing Links</h2>
    
    ${allDeveloperUrls.map(dev => `
    <div class="developer-card">
        <h3>${dev.developer.name}</h3>
        <p><strong>Role:</strong> ${dev.developer.role} at ${dev.developer.company}</p>
        <p><strong>Email:</strong> ${dev.developer.email}</p>
        <p><strong>Tester ID:</strong> <code>${dev.developer.id}</code></p>
        
        <h4>🔥 High Priority Pages</h4>
        <div class="url-list">
            ${dev.highPriority.map(page => 
                `<a href="${page.url}" class="url-link priority-high" target="_blank">${page.name}</a>`
            ).join('')}
        </div>
        
        <h4>⚡ Medium Priority Pages</h4>
        <div class="url-list">
            ${dev.mediumPriority.map(page => 
                `<a href="${page.url}" class="url-link priority-medium" target="_blank">${page.name}</a>`
            ).join('')}
        </div>
        
        ${dev.lowPriority.length > 0 ? `
        <h4>📋 Low Priority Pages</h4>
        <div class="url-list">
            ${dev.lowPriority.map(page => 
                `<a href="${page.url}" class="url-link priority-low" target="_blank">${page.name}</a>`
            ).join('')}
        </div>
        ` : ''}
    </div>
    `).join('')}

    <h2>📧 Email Templates</h2>
    <p>Copy and paste these email templates to invite developers:</p>
    
    ${allDeveloperUrls.map(dev => `
    <div class="developer-card">
        <h4>Email for ${dev.developer.name}</h4>
        <p><strong>To:</strong> ${dev.developer.email}</p>
        <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 12px;">${generateEmailTemplate(dev.developer, environment)}</textarea>
    </div>
    `).join('')}

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280;">
        Generated by JiGR Testing Link Generator • ${new Date().toISOString()}
    </footer>
</body>
</html>
`.trim()
}

/**
 * Main execution
 */
function main() {
  const environment = process.argv[2] || 'development'
  
  if (!BASE_URLS[environment]) {
    console.error(`❌ Invalid environment: ${environment}`)
    console.error(`Available environments: ${Object.keys(BASE_URLS).join(', ')}`)
    process.exit(1)
  }
  
  console.log(`🚀 Generating testing links for ${environment} environment...`)
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'docs', 'testing-links')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Generate files
  const timestamp = new Date().toISOString().split('T')[0]
  
  // Markdown summary
  const markdownContent = generateMarkdownSummary(environment)
  const markdownFile = path.join(outputDir, `testing-links-${environment}-${timestamp}.md`)
  fs.writeFileSync(markdownFile, markdownContent)
  
  // HTML summary
  const htmlContent = generateHtmlSummary(environment)
  const htmlFile = path.join(outputDir, `testing-links-${environment}-${timestamp}.html`)
  fs.writeFileSync(htmlFile, htmlContent)
  
  // JSON data for programmatic use
  const jsonData = {
    environment,
    baseUrl: BASE_URLS[environment],
    generated: new Date().toISOString(),
    developers: APP_DEVELOPERS.map(dev => generateDeveloperUrls(dev, environment))
  }
  const jsonFile = path.join(outputDir, `testing-links-${environment}-${timestamp}.json`)
  fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2))
  
  // Generate individual email files
  const emailDir = path.join(outputDir, 'emails', environment)
  if (!fs.existsSync(emailDir)) {
    fs.mkdirSync(emailDir, { recursive: true })
  }
  
  APP_DEVELOPERS.forEach(developer => {
    const emailContent = generateEmailTemplate(developer, environment)
    const emailFile = path.join(emailDir, `${developer.id}-invitation.txt`)
    fs.writeFileSync(emailFile, emailContent)
  })
  
  console.log(`✅ Generated testing links for ${environment}:`)
  console.log(`   📄 Markdown: ${markdownFile}`)
  console.log(`   🌐 HTML: ${htmlFile}`)
  console.log(`   📊 JSON: ${jsonFile}`)
  console.log(`   📧 Emails: ${emailDir}/`)
  console.log(``)
  console.log(`📱 Open the HTML file in your browser for easy link access:`)
  console.log(`   open "${htmlFile}"`)
  console.log(``)
  console.log(`🎯 Quick stats:`)
  console.log(`   • ${APP_DEVELOPERS.length} developers`)
  console.log(`   • ${KEY_TESTING_PAGES.length} test pages`)
  console.log(`   • ${APP_DEVELOPERS.length * KEY_TESTING_PAGES.length} total test URLs`)
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  generateTestingUrl,
  generateDeveloperUrls,
  generateEmailTemplate,
  generateMarkdownSummary,
  generateHtmlSummary,
  APP_DEVELOPERS,
  KEY_TESTING_PAGES,
  BASE_URLS
}