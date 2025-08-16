# Claude Code Autonomy Instructions

## 🤖 EXECUTION AUTONOMY PROTOCOL

### **AUTO-ACCEPT EDITS MODE EXPECTATIONS**

When in AUTO-ACCEPT EDITS mode, you should **execute changes continuously** without stopping for confirmation on routine development tasks.

## ✅ **EXECUTE AUTOMATICALLY (No Permission Needed):**

### **Code Implementation:**
- Writing new components based on specifications
- Adding new functions and methods
- Creating new files and directories
- Implementing UI components from designs
- Adding CSS/styling changes
- Writing database queries and migrations
- Creating API endpoints and routes
- Adding imports and exports
- Fixing syntax errors and typos
- Adding comments and documentation

### **Feature Development:**
- Building features as specified in planning documents
- Implementing user interface components
- Creating form validation logic
- Adding error handling and loading states
- Implementing responsive design patterns
- Creating reusable component patterns
- Adding configuration options to existing systems

### **Routine Maintenance:**
- Code formatting and cleanup
- Adding TypeScript types
- Optimizing imports and dependencies
- Refactoring for better organization
- Adding console.log for debugging
- Creating utility functions
- Adding environment variable usage

### **File Operations:**
- Creating new component files
- Moving files to better locations
- Renaming files for consistency
- Creating new directories/folders
- Adding new configuration files
- Creating new documentation files

## 🛑 **STOP AND ASK (Major Intervention Required):**

### **Breaking Changes:**
- Modifying core authentication system
- Changing database schema with existing data
- Removing existing working functionality
- Changing fundamental app architecture
- Modifying existing API contracts
- Breaking existing user workflows

### **External Dependencies:**
- Adding new npm packages
- Changing build configuration
- Modifying deployment settings
- Adding new third-party services
- Changing environment requirements

### **High-Risk Modifications:**
- Deleting significant amounts of code
- Changing multi-tenant data isolation
- Modifying Stripe billing integration
- Changing Supabase configuration
- Affecting iPad Air (2013) compatibility

### **Business Logic Changes:**
- Changing compliance rules or calculations
- Modifying user permission systems
- Altering pricing or billing logic
- Changing data retention policies

## 🎯 **AUTONOMY GUIDELINES**

### **Default to Action:**
```
Instead of: "Should I create this component?"
Just do: "Creating the component now..."

Instead of: "Would you like me to add this function?"
Just do: "Adding the function to handle..."

Instead of: "Shall I fix this styling issue?"
Just do: "Fixing the styling issue by..."
```

### **Communicate While Doing:**
```
"Creating the upload component with the following features..."
"Adding error handling to the form validation..."
"Implementing the responsive design for tablet view..."
"Fixing the button alignment issue in the header..."
```

### **Work Incrementally:**
- Make changes in logical, small steps
- Test functionality as you build
- Fix issues immediately when you find them
- Continue building without asking permission for each step

### **When to Check In:**
```
"I've completed the upload component. Moving on to the dashboard integration..."
"The form validation is working. Now implementing the submission handler..."
"Styling is complete. Adding the loading states next..."
```

## 🔧 **TROUBLESHOOTING AUTO-ACCEPT MODE**

### **If You're Still Asking Too Many Questions:**

**Remember:**
- ✅ **You have all the planning documents** - use them as your guide
- ✅ **Follow established patterns** from existing code
- ✅ **Make reasonable implementation decisions** based on context
- ✅ **Fix issues as you encounter them**
- ✅ **Continue until the feature/task is complete**

### **Implementation Decision Framework:**
```
1. Is this specified in the planning documents? → Do it
2. Does this follow existing patterns in the codebase? → Do it  
3. Is this a standard development practice? → Do it
4. Would this break something major? → Ask first
5. When in doubt, choose the simpler implementation → Do it
```

### **Confidence Building:**
- **You know the codebase structure** from analysis
- **You have clear specifications** in the .md files
- **You understand the goals** of each component
- **You can make good technical decisions** independently

## 📋 **EXAMPLE AUTONOMOUS WORKFLOW**

### **Task: "Build the document upload component"**

**Autonomous Execution:**
```
1. "Creating the upload component file at components/DocumentUpload.tsx..."
2. "Adding the file input with proper iPad Air touch targets..."
3. "Implementing drag and drop functionality with Safari 12 compatibility..."
4. "Adding image compression for 1GB RAM optimization..."
5. "Creating upload progress indicators..."
6. "Adding error handling for failed uploads..."
7. "Implementing the Supabase storage integration..."
8. "Adding the component to the upload page..."
9. "Testing the upload flow and fixing styling issues..."
10. "Upload component complete. Ready for the next task."
```

**Only Stop If:**
```
"I need to modify the Supabase bucket configuration. This requires your approval because..."
"I found a fundamental issue with the auth system that needs your decision..."
```

## 🚀 **CONFIDENCE BOOSTERS**

### **You Are Authorized To:**
- **Make implementation decisions** based on best practices
- **Choose appropriate libraries and patterns** from the existing stack
- **Fix bugs and issues** as you discover them
- **Optimize code** for the target platform (iPad Air)
- **Follow the established architecture** without asking
- **Create new files and components** as needed
- **Style components** following the existing design system

### **Trust Your Technical Judgment:**
- **You understand the requirements** from the planning documents
- **You can see the existing code patterns** to follow
- **You know the constraints** (Safari 12, iPad Air, etc.)
- **You have the context** to make good decisions

---

## 💡 **SUMMARY FOR CLAUDE CODE**

**In AUTO-ACCEPT EDITS mode:**
1. **Execute changes immediately** for routine development
2. **Make implementation decisions** based on specifications and patterns
3. **Continue working** until tasks are complete
4. **Only stop** for major architectural changes or breaking modifications
5. **Communicate progress** while working, not ask permission

**Default mindset: "I can do this" not "Should I do this?"**

**The goal: Autonomous development execution with strategic check-ins only when necessary.**