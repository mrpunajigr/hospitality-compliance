# Enhanced Version Control Protocol

## Current System Enhancement

### **DEVELOPMENT vs PRODUCTION Versioning**

#### **Development Versions: vMAJOR.MONTH.DAY.BUILD[ALPHA]**
```
v1.8.11.001a    (Production)
v1.8.11.045d    (Development - 45th build today, 4th iteration)
```

#### **Production Versions: vMAJOR.MONTH.DAY[ALPHA]** (Keep Current)
```
v1.8.11.f       (Production release)
```

### **Version Display Strategy**

#### **Always Visible Version Info**
```typescript
// In every page header or footer component
const VersionDisplay = {
  development: {
    position: 'top-right corner',
    format: 'v1.8.11.045d | DEV | 14:23',
    includes: ['version', 'environment', 'build_time'],
    styling: 'red background, white text, small fixed position'
  },
  
  production: {
    position: 'footer only',
    format: 'v1.8.11.f',
    includes: ['version'],
    styling: 'subtle gray text'
  }
};
```

## **BUILD TRACKING SYSTEM**

### **Auto-Incrementing Build Numbers**
```json
// package.json scripts
{
  "scripts": {
    "dev": "npm run increment-build && next dev",
    "build": "npm run increment-build && next build",
    "increment-build": "node scripts/increment-build.js"
  }
}
```

### **Build Script: scripts/increment-build.js**
```javascript
const fs = require('fs');
const path = require('path');

function incrementBuild() {
  const versionPath = path.join(__dirname, '../version.json');
  
  // Read current version
  let versionData = {
    major: 1,
    month: 8,
    day: 11,
    build: 1,
    alpha: '',
    lastBuildDate: new Date().toDateString()
  };
  
  if (fs.existsSync(versionPath)) {
    versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  }
  
  // Reset build counter if new day
  const today = new Date().toDateString();
  if (versionData.lastBuildDate !== today) {
    versionData.build = 1;
    versionData.alpha = '';
    versionData.lastBuildDate = today;
  } else {
    versionData.build++;
  }
  
  // Generate version string
  const version = `v${versionData.major}.${versionData.month}.${versionData.day}.${String(versionData.build).padStart(3, '0')}${versionData.alpha}`;
  
  // Write to version.json
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
  
  // Write to public/version.js for runtime access
  fs.writeFileSync(
    path.join(__dirname, '../public/version.js'),
    `window.APP_VERSION = "${version}";
window.BUILD_TIME = "${new Date().toISOString()}";
window.BUILD_ENV = "${process.env.NODE_ENV || 'development'}";`
  );
  
  console.log(`🚀 Build ${version} generated at ${new Date().toLocaleString()}`);
}

incrementBuild();
```

## **VERSION DISPLAY COMPONENTS**

### **Development Header Component**
```typescript
// components/DevVersionHeader.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DevVersionHeader() {
  const [versionInfo, setVersionInfo] = useState<any>(null);
  
  useEffect(() => {
    // Load version info from public/version.js
    if (typeof window !== 'undefined' && (window as any).APP_VERSION) {
      setVersionInfo({
        version: (window as any).APP_VERSION,
        buildTime: (window as any).BUILD_TIME,
        env: (window as any).BUILD_ENV
      });
    }
  }, []);
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;
  
  if (!versionInfo) return null;
  
  return (
    <div className="fixed top-2 right-2 z-50 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg font-mono">
      <div>{versionInfo.version}</div>
      <div>{versionInfo.env.toUpperCase()}</div>
      <div>{new Date(versionInfo.buildTime).toLocaleTimeString()}</div>
    </div>
  );
}
```

### **Production Footer Component**
```typescript
// components/ProductionVersionFooter.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ProductionVersionFooter() {
  const [version, setVersion] = useState<string>('');
  
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).APP_VERSION) {
      // Strip build number for production display
      const fullVersion = (window as any).APP_VERSION;
      const prodVersion = fullVersion.replace(/\.\d{3}[a-z]?$/, '');
      setVersion(prodVersion);
    }
  }, []);
  
  return (
    <footer className="text-center text-xs text-gray-400 py-2">
      JiGR Compliance Platform {version}
    </footer>
  );
}
```

## **TESTING & DEBUGGING PROTOCOL**

### **Version-Specific Issue Tracking**
```markdown
## Issue Report Template

**Version:** v1.8.11.045d
**Environment:** Development
**Build Time:** 2025-08-11T14:23:15.123Z
**Browser:** Safari 12.5.7 / iPad Air (2013)
**Issue:** [Description]
**Steps to Reproduce:** [Steps]
**Expected:** [Expected behavior]
**Actual:** [Actual behavior]
```

### **Claude Code Communication Protocol**
```markdown
## When Reporting to Claude Code:

"I'm testing version v1.8.11.045d and found an issue with [component]. 
The version header shows build time 14:23, which means this includes 
the [recent changes]. Here's what's happening..."
```

## **CHANGELOG AUTOMATION**

### **Auto-Generated Changelog Entries**
```javascript
// scripts/log-change.js
const fs = require('fs');

function logChange(type, description) {
  const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
  const versionString = `v${version.major}.${version.month}.${version.day}.${String(version.build).padStart(3, '0')}${version.alpha}`;
  
  const logEntry = `### ${versionString} (${new Date().toISOString().split('T')[0]}) - ${type.toUpperCase()}
- **${getEmoji(type)} ${type.toUpperCase()}**: ${description}
- **🕐 Build Time**: ${new Date().toLocaleString()}
- **🔧 Environment**: ${process.env.NODE_ENV || 'development'}

`;

  // Prepend to CHANGELOG.md
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  fs.writeFileSync('CHANGELOG.md', logEntry + changelog);
}

function getEmoji(type) {
  const emojis = {
    'feature': '🎯',
    'fix': '🐛',
    'enhancement': '✨',
    'performance': '⚡',
    'technical': '🔧'
  };
  return emojis[type] || '📝';
}

// Usage: node scripts/log-change.js "fix" "Fixed upload button styling"
logChange(process.argv[2], process.argv[3]);
```

## **QUICK COMMANDS**

### **Development Workflow**
```bash
# Start development with version tracking
npm run dev

# Quick changelog entry
npm run log -- "fix" "Fixed camera upload issue"

# Check current version
cat version.json

# Force new alpha version (same day iteration)
npm run alpha

# Mark as production ready
npm run production
```

### **package.json Script Additions**
```json
{
  "scripts": {
    "dev": "npm run increment-build && next dev",
    "build": "npm run increment-build && next build", 
    "increment-build": "node scripts/increment-build.js",
    "log": "node scripts/log-change.js",
    "alpha": "node scripts/increment-alpha.js",
    "production": "node scripts/mark-production.js",
    "version-check": "cat version.json"
  }
}
```

## **VISUAL INDICATORS**

### **Environment-Specific Styling**
```css
/* Development indicator */
.dev-mode::before {
  content: "🔧 DEVELOPMENT";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #ff4444, #ff8800);
  color: white;
  text-align: center;
  font-size: 10px;
  padding: 2px;
  z-index: 9999;
  font-family: monospace;
}

/* Production indicator */
.prod-mode {
  /* Clean, no dev indicators */
}
```

## **BENEFITS OF THIS ENHANCED SYSTEM**

### **For Development:**
- **🎯 Clear version tracking** - Know exactly which build you're testing
- **⏰ Build timestamps** - See when changes were made
- **🔍 Easy debugging** - "This issue appeared in build v1.8.11.045d"
- **📊 Progress tracking** - See how many iterations per day

### **For Communication with Claude Code:**
- **📋 Precise issue reporting** - "Version v1.8.11.045d has X issue"
- **🔄 Change tracking** - "Since build 040, Y feature stopped working"
- **⚡ Faster debugging** - "That fix should be in build 046 or later"

### **For Production:**
- **🚀 Clean versioning** - Simple v1.8.11.f for customers
- **📈 Release tracking** - Clear major.month.day progression
- **🔧 Rollback capability** - Know exactly which build to revert to

---

**This enhanced protocol gives you development granularity while maintaining clean production versioning!**