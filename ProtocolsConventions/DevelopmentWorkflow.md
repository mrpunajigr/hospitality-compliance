# Development Workflow Protocol

## 🔄 **PROPER DEVELOPMENT WORKFLOW**

### **✅ CORRECT SEQUENCE:**

#### **1. Start Development Session**
```bash
npm run dev
```
**What this does:**
- ✅ Increments build version automatically (v1.10.6.015 → v1.10.6.016)
- ✅ Updates `version.json` with new build number
- ✅ Updates `public/version.js` with timestamp and environment
- ✅ Starts Next.js development server
- ✅ Provides proper version tracking for the session

#### **2. Make Code/Content Changes**
- Edit files, add features, fix bugs
- Test changes in browser
- Verify functionality works correctly

#### **3. Commit Changes with Proper Version Tracking**
```bash
git add .
git commit -m "Feature description

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## ❌ **INCORRECT WORKFLOW (AVOID THIS):**

### **What We Were Doing Wrong:**
```bash
# ❌ Direct git commits without npm run dev
git add .
git commit -m "changes"
git push
```

**Problems with this approach:**
- ❌ No version increment
- ❌ No build tracking
- ❌ Missing development session context
- ❌ Breaks version continuity
- ❌ No proper development environment setup

---

## 📋 **VERSION TRACKING BENEFITS**

### **When Using Proper Workflow:**
- **Build Numbers**: Automatically increment per development session
- **Timestamps**: Track when each change was made
- **Environment**: Properly identifies development vs production
- **Debugging**: Easy to trace issues to specific builds
- **Professional**: Follows industry-standard version control

### **Current Version Format:**
```
v1.10.6.016 (should be v1.10.6.016d when Enhanced Protocol is implemented)
```

---

## 🚨 **REMINDER TRIGGERS**

### **When Claude Should Remind You:**

#### **Significant Git Push Alert:**
```
⚠️  DEVELOPMENT WORKFLOW REMINDER ⚠️

Before this significant push, did you:
1. ✅ Start with `npm run dev`?
2. ✅ Make your changes during the dev session?
3. ✅ Commit with proper version tracking?

If not, consider restarting with proper workflow:
→ npm run dev (increments version)
→ Make changes
→ Commit with version context
```

#### **Auto-Reminder Triggers:**
- **Large commits** (5+ files changed)
- **Major feature implementations**
- **Bug fixes that required multiple attempts**
- **Any commit message with "fix", "major", "feature", "significant"**
- **End of development session**

---

## 🎯 **WORKFLOW CHECKLIST**

### **Start of Development Session:**
- [ ] Run `npm run dev` first
- [ ] Note the version increment in console
- [ ] Verify server starts on correct port
- [ ] Check version display shows current build

### **During Development:**
- [ ] Make changes in logical chunks
- [ ] Test each change thoroughly
- [ ] Keep track of what's working vs broken

### **End of Development Session:**
- [ ] Ensure all changes are committed
- [ ] Use descriptive commit messages
- [ ] Include version context if significant changes
- [ ] Push with proper attribution

---

## 📊 **VERSION TRACKING EXAMPLES**

### **Good Commit Messages with Version Context:**
```bash
git commit -m "🔐 Fix password reset token persistence issue

- Store validated tokens in component state during validation
- Use stored tokens in form submission instead of re-reading from URL
- Prevents tokens from being lost between validation and submission
- Resolves 'Missing required parameters' API error
- Build: v1.10.6.016d

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### **Session Summary Format:**
```bash
git commit -m "📋 Complete forgot password system implementation

Session Summary (v1.10.6.010d → v1.10.6.016d):
- Fixed redirect URL configuration
- Added hash token detection for Supabase auth
- Implemented token persistence in component state
- Enhanced error handling and debugging
- Restored original /forgot-password links

Complete password reset flow now working end-to-end.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🔧 **INTEGRATION WITH ENHANCED VERSION PROTOCOL**

### **Future Enhancement:**
When the Enhanced Version Protocol is fully implemented:
- Versions will include environment indicators (d/s/p/t)
- Build numbers will auto-increment on `npm run dev`
- Version display will show in top-right corner during development
- Changelog will be automatically generated

### **Current vs Future:**
```
Current:  v1.10.6.016
Future:   v1.10.6.016d (with environment indicator)
```

---

**Remember: Always start with `npm run dev` to maintain proper version tracking and development environment setup!**