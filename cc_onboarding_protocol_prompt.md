# Claude Code Onboarding Protocol Setup

## 🎯 **TASK: Create Comprehensive Session Recovery System**

You need to create a foolproof onboarding system that eliminates the "teaching a child" problem when Claude Code sessions crash or restart. This protocol ensures any new Claude Code session can instantly understand the project context and continue work without extensive re-explanation.

---

## 📋 **REQUIRED DELIVERABLES**

### **1. Create ClaudeCodeQuickStart.md**

**Location**: Place in project root directory

**Content Requirements**:

#### **Project Overview (1 paragraph)**
- JiGR hospitality compliance SaaS platform
- Document AI processing for delivery dockets
- Multi-tenant architecture for small hospitality businesses
- Current development status and main business value

#### **Critical Technical Constraints**
- **Target Hardware**: iPad Air (2013) with Safari 12 compatibility
- **Naming Convention**: PascalCase for all files, components, and documentation
- **Architecture**: Multi-tenant with client data isolation
- **Performance**: Memory-optimized for 1GB RAM devices
- **Technology Stack**: Next.js, Supabase, Google Cloud Document AI, Stripe

#### **Current Development Focus**
- Document AI parser improvements
- Storage bucket upload fixes  
- Line item extraction and display
- Production readiness tasks

#### **Development Rules**
- **DO NOT change existing working code without explicit approval**
- **DO NOT modify authentication system - it's working correctly**
- **DO NOT alter database schema without permission**
- **DO ask before making structural changes to components**

#### **Documentation References**
- List all key .md planning files to read first
- Reference current session status file
- Point to naming convention policy

---

### **2. Create Session State Management System**

#### **CurrentSessionStatus.md Template**
Create a template file that gets updated before ending each session:

```markdown
# Current Session Status
*Updated: [DATE] at [TIME]*

## Current Focus
**Working on**: [Current feature/task]
**Next Priority**: [Next immediate task] 
**Progress**: [Brief status update]

## Active Components
**Modified files**: [List of files being worked on]
**New components**: [Any new files created]
**Dependencies**: [External services or APIs involved]

## Context for Next Session
**Where we left off**: [Specific stopping point]
**Next steps**: [1-3 immediate next actions]
**Known issues**: [Any problems encountered]
**Success criteria**: [How to know when current task is done]

## Important Notes
**Don't touch**: [Files/systems that are working and shouldn't be modified]
**Ask before**: [Changes that need approval]
**Reference docs**: [Specific .md files relevant to current work]
```

#### **Session Update Commands**
Create bash commands for easy session status updates:

```bash
# Update current session status
update_session_status() {
    echo "# Current Session Status" > CurrentSessionStatus.md
    echo "*Updated: $(date)*" >> CurrentSessionStatus.md
    echo "" >> CurrentSessionStatus.md
    echo "## Current Focus" >> CurrentSessionStatus.md
    echo "**Working on**: $1" >> CurrentSessionStatus.md
    echo "**Next Priority**: $2" >> CurrentSessionStatus.md
    echo "**Progress**: $3" >> CurrentSessionStatus.md
}

# Usage examples:
# update_session_status "Document AI parser" "Fix line item display" "Parser extracting data but display shows generic text"
```

---

### **3. Create Smart Recovery Protocol**

#### **SessionRecoveryInstructions.md**
Create instructions for how to properly onboard a new Claude Code session:

**Template for Session Handoff**:
```markdown
# Session Recovery Protocol

## For New Claude Code Sessions

### Step 1: Read Documentation First
1. Read `ClaudeCodeQuickStart.md` completely
2. Review `CurrentSessionStatus.md` for current context
3. Scan all .md files in project documentation
4. Understand established patterns before asking questions

### Step 2: Assess Current State
1. Check git status and recent commits
2. Review last modified files
3. Understand what's working vs. what needs fixing
4. Identify current task from session status

### Step 3: Confirm Understanding
Ask ONLY if documentation doesn't cover:
- Specific implementation details not documented
- Clarification on current priorities
- Technical details missing from planning docs

### DO NOT Ask About:
- Project overview (it's documented)
- Naming conventions (it's in the policy)
- Architecture decisions (it's in the planning docs)
- Constraints and requirements (it's in the quick start)

## Recovery Prompt Template
Use this exact prompt for new sessions:

"Read the project documentation (especially ClaudeCodeQuickStart.md and CurrentSessionStatus.md) and continue where we left off with [SPECIFIC TASK]. Ask only if you need clarification on something not covered in the docs."
```

---

### **4. Create Documentation Index**

#### **DocumentationIndex.md**
Create a master index of all project documentation:

```markdown
# JiGR Project Documentation Index

## Essential Reading for New Sessions
1. **ClaudeCodeQuickStart.md** - Start here for project context
2. **CurrentSessionStatus.md** - Current development state  
3. **NamingConventionPolicyImplementation.md** - PascalCase standards

## Architecture & Planning
- App architecture and page structure docs
- Database portability documentation  
- Document AI extraction specifications
- Multi-tenant authentication plans

## Development Protocols
- Enhanced version control protocol
- Screenshot analysis procedures  
- Session recovery instructions

## Business Context
- Strategic planning conversations
- Feature prioritization decisions
- Market positioning and competitive analysis
```

---

## 🎯 **IMPLEMENTATION REQUIREMENTS**

### **File Locations**
- `ClaudeCodeQuickStart.md` - Project root
- `CurrentSessionStatus.md` - Project root  
- `SessionRecoveryInstructions.md` - `/Documentation/` folder
- `DocumentationIndex.md` - `/Documentation/` folder

### **Update Workflow**
Before ending each session, you must:
1. Update `CurrentSessionStatus.md` with current state
2. Note what's working vs. what needs fixing
3. List specific next steps for continuation
4. Reference relevant documentation for context

### **Recovery Testing**
After creating these files, test the recovery process by:
1. Reading only the documentation (don't rely on memory)
2. Confirming you can understand current project state
3. Identifying next development priorities
4. Knowing what not to touch vs. what needs work

---

## 🚀 **SUCCESS CRITERIA**

✅ **Any new Claude Code session can become productive within 2-3 minutes**  
✅ **No need to re-explain project context, constraints, or conventions**  
✅ **Clear understanding of what's working vs. what needs fixing**  
✅ **Immediate focus on current development priorities**  
✅ **Respect for working systems and established patterns**

---

## ⚠️ **CRITICAL IMPORTANCE**

This onboarding system prevents:
- Lost development time re-explaining project context
- Accidental breaking of working systems
- Confusion about naming conventions and constraints  
- Unclear development priorities after session restarts
- Frustration with "teaching a child" every session

**Build this system NOW** - it will save hours of setup time and prevent costly mistakes from uninformed Claude Code sessions.

---

**START WITH**: Create the `ClaudeCodeQuickStart.md` file first, then build the session management system around it.