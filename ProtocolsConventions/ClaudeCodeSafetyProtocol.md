# Claude Code Safety & Autonomy Instructions

## 🚨 CRITICAL SAFETY RULES - READ FIRST

### **BREAKING CHANGE PREVENTION:**
- **NEVER** rename existing files without explicit approval
- **NEVER** modify working components without safety checks  
- **NEVER** change database schemas without migration plans
- **NEVER** delete files during cleanup without verification
- **ALWAYS** preserve existing functionality during updates
- **ALWAYS** test changes before committing

### **MANDATORY SAFETY CHECKS:**
Before making ANY changes that could break existing functionality:

1. **Dependency Analysis:** What files/components depend on this?
2. **Impact Assessment:** What features could break?
3. **Rollback Plan:** How do we undo this change?
4. **Testing Requirements:** What needs to be tested?

### **RED FLAG WARNINGS:**
Stop immediately and ask for approval before:
- Renaming files that are imported elsewhere
- Changing component interfaces/props
- Modifying database table structures
- Deleting any existing files
- Changing routing patterns
- Updating environment configurations

## ⚡ AUTONOMY GUIDELINES

### **EXECUTE AUTOMATICALLY (Green Light):**
- Creating new components
- Adding new features that don't modify existing code
- Styling updates and CSS improvements
- Bug fixes that don't change interfaces
- Documentation updates
- New route creation (that doesn't conflict)
- Performance optimizations that don't change behavior

### **STOP AND ASK (Red Light):**
- Architectural changes
- File renames or moves
- Database modifications
- Breaking changes to existing APIs
- Security-related changes
- Configuration changes
- Dependency updates

### **NOTIFICATION PROTOCOL:**
When human intervention is required, output:

```bash
echo -e "\a🚨 DEVELOPER INTERVENTION REQUIRED 🚨\a"
```

Then clearly explain:
- What you want to change
- Why it requires approval
- Potential risks
- Recommended approach

## 📋 SAFE IMPLEMENTATION PHASES

### **Phase 1: Additive Changes Only**
- New files, new features, new components
- Zero risk to existing functionality
- Can be implemented immediately

### **Phase 2: Gradual Improvements**
- Enhance existing code with backward compatibility
- Requires testing but minimal risk
- Document all changes

### **Phase 3: Architectural Changes**
- Requires explicit approval
- Full testing protocol
- Rollback plan mandatory

## 🔧 DEBUGGING PROTOCOL

### **When Things Break:**
1. **Stop immediately** - Don't try to fix by making more changes
2. **Document the issue** - Screenshot, error messages, steps to reproduce
3. **Identify last working state** - What was the last successful version?
4. **Request intervention** - Use the notification protocol above
5. **Wait for guidance** - Don't attempt fixes without approval

### **Error Communication Format:**
```
🚨 BREAKING CHANGE DETECTED:
- What broke: [specific functionality]
- Last working version: [version number]
- Change that caused issue: [what was modified]
- Current error: [error message/screenshot reference]
- Recommended action: [rollback/fix strategy]
```

## 🛡️ PROTECTIVE MEASURES

### **File Protection:**
- **Never delete** files in `/ProtocolsConventions/` folder
- **Always verify** before renaming files with multiple imports
- **Create backups** before major refactoring
- **Use git branches** for experimental changes

### **Database Protection:**
- **Never run** DROP TABLE or DELETE FROM without approval
- **Always use** migrations for schema changes
- **Test on development** before production changes
- **Backup before** major modifications

### **Component Protection:**
- **Preserve existing props** when enhancing components
- **Add new props** as optional with defaults
- **Test all usage locations** when changing interfaces
- **Document breaking changes** clearly

## 🎯 SUCCESS CRITERIA

### **Good Autonomy:**
- Features implemented without breaking existing functionality
- New components follow established patterns
- Styling improvements enhance user experience
- Bug fixes resolve issues without side effects

### **Failed Autonomy:**
- Any existing feature stops working
- Breaking changes made without approval
- Files deleted or renamed without verification
- Database integrity compromised

## 📞 ESCALATION PROTOCOL

### **When in Doubt:**
1. **Default to caution** - Ask rather than break
2. **Provide context** - Explain what you want to do and why
3. **Suggest alternatives** - Offer safer approaches
4. **Wait for guidance** - Don't proceed with risky changes

Remember: It's better to ask for permission than to break working functionality!

---
**This protocol protects the JiGR platform while enabling efficient development. Follow these guidelines to maintain system stability while building amazing features.**