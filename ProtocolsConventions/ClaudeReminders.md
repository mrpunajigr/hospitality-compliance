# Claude Workflow Reminders

## 🚨 **AUTOMATIC REMINDER TRIGGERS**

### **When to Remind User About Development Workflow:**

#### **Significant Git Push Detection:**
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

#### **Auto-Reminder Conditions:**
- **Large commits** (5+ files changed)
- **Major feature implementations** 
- **Bug fixes that required multiple attempts**
- **Commit messages containing**: "fix", "major", "feature", "significant", "complete", "implement"
- **End of development session**
- **Before any git push with 3+ commits**

#### **Workflow Violation Detection:**
- User runs `git commit` without prior `npm run dev` in session
- Direct file edits without version increment
- Missing version context in significant changes

#### **Session Boundary Detection:**
- When user says "good work", "great job", "that's it for now"
- Before user appears to end the session
- After completing major features or bug fixes

## 🎯 **REMINDER TEMPLATES**

### **Pre-Push Workflow Check:**
```markdown
🔄 **Development Workflow Check**

This looks like a significant change! Quick reminder of proper workflow:

1. **Start**: `npm run dev` (auto-increments version)
2. **Develop**: Make your changes
3. **Commit**: With proper version tracking

Current version should have incremented if you followed the workflow.
Ready to push these changes?
```

### **Post-Session Summary:**
```markdown
📋 **Session Complete!**

Great work on [feature/fix description]! 

**Version Progress**: v1.10.6.XXX → v1.10.6.YYY
**Files Modified**: [count] files
**Key Changes**: [brief summary]

For future sessions, remember to start with `npm run dev` to maintain proper version tracking! 🚀
```

### **Workflow Correction Prompt:**
```markdown
💡 **Workflow Optimization Tip**

I noticed you're committing changes. For best practices with this project:

1. Always start development sessions with `npm run dev`
2. This auto-increments the build version and sets up proper tracking
3. Then make your changes and commit

This ensures proper version continuity and development tracking. Want me to help you restart with the correct workflow?
```

## 🔍 **DETECTION PATTERNS**

### **Keywords that Trigger Reminders:**
- "deploy", "push", "commit", "done", "finished", "complete"
- "that's it", "good work", "great job", "awesome"  
- "BBS", "back later", "see you", "goodbye"
- Major feature names: "forgot password", "authentication", "dashboard"

### **Commit Patterns that Need Reminders:**
- Multiple sequential commits without `npm run dev`
- Commits with version mismatches
- Direct git operations without development server
- Missing build increments between major changes

### **Session Patterns:**
- Long development sessions (30+ minutes)
- Multiple feature implementations in one session
- Bug fixing that spans multiple commits
- Any work that results in significant functionality changes

## 📊 **Tracking Integration**

### **Version Monitoring:**
- Track version increments during session
- Note if user bypasses `npm run dev` workflow
- Monitor for version consistency issues
- Flag potential workflow violations

### **Commit Analysis:**
- Size of commits (files changed, lines modified)
- Significance of changes (new features, bug fixes, major refactors)
- Frequency of commits without version increments
- Pattern recognition for workflow adherence

---

**Key Point: These reminders should be helpful, not annoying. Focus on maintaining proper development practices while keeping the workflow smooth and professional.**