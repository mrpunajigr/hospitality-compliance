Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. Keep all Table names short when creating the database schema.
9. When I give you a Screenshot or File, do not ask permisson to READ, Just do it.
10. When in AUTO-ACCEPT EDIT mode, it means I trust you. Do Not ask for permisson, unless it is a CRITICAL step.

# ⚠️ MANDATORY: Page Archival Protocol

## Before ANY Page/Component Deletion
**CRITICAL RULE:** No page, component, or significant feature may be deleted without first creating a complete archive.

### Required Pre-Deletion Steps:
1. **Create Archive Folder:** `:assets/pages archived/YYYY-MM-DD_component-name_reason_ARCHIVED/`
2. **Archive All Code:** Copy complete source code to `original-code/` subdirectory
3. **Capture Screenshots:** Save visual documentation to `screenshots/` subdirectory  
4. **Document Dependencies:** List all required imports/packages in `dependencies.txt`
5. **Create Restoration Guide:** Write step-by-step restoration instructions
6. **Complete Archive Documentation:** Fill out `ARCHIVE_INFO.md` with full context
7. **Update Archive Index:** Add entry to `:assets/pages archived/README.md`
8. **Git Commit Archive:** Commit archive before deletion with message format: `Archive [component] before deletion - see :assets/pages archived/[folder]`

### Archive Naming Convention:
- **Format:** `YYYY-MM-DD_component-name_reason_ARCHIVED`
- **Reason Categories:** 
  - `vercel-deployment-fix` - Build/deployment issues
  - `production-cleanup` - Production optimization
  - `workflow-simplification` - Development process improvement
  - `architecture-refactor` - Structural changes
  - `performance-optimization` - Performance improvements
  - `security-update` - Security compliance

### Archive Quality Requirements:
- **Complete Source Code:** All component files and dependencies
- **Working Restoration Guide:** Must be testable and accurate
- **Visual Documentation:** Screenshots showing functionality
- **Dependency Tracking:** Complete list for successful restoration
- **Context Documentation:** Why component existed and why deleted

### Exceptions (No Archive Required):
- Minor utility functions (< 20 lines)
- Temporary debugging code
- Generated files (build artifacts)
- Duplicate code being consolidated

### Archive Success Example:
The mood board component was successfully archived and restored, demonstrating the value of this system. See `:assets/pages archived/2025-08-14_mood-board_vercel-deployment-fix_ARCHIVED/` for the complete archive that enabled full restoration with enhancements.

# Development Philosophy

## Always Choose the Most Robust Solution
When faced with multiple implementation options, ALWAYS choose the most robust, secure, and production-ready approach, even if it takes longer initially. This prevents technical debt and eliminates the need to revisit and refactor later.

### Examples of Robust Choices:
- **Security**: Authenticated signed URLs vs public URLs (even if public seems simpler)
- **Error Handling**: Comprehensive error handling with graceful fallbacks vs basic try/catch
- **Authentication**: Proper RLS policies vs disabling security for convenience  
- **State Management**: Proper async/await patterns vs blocking synchronous calls
- **Data Validation**: Type-safe operations vs loose type checking
- **Performance**: Optimized queries and caching vs quick-and-dirty solutions

### Rationale:
- **Saves time long-term**: 30 minutes extra now vs hours of refactoring later
- **Production-ready**: Code is immediately suitable for enterprise use
- **Maintainable**: Future developers can build on solid foundations
- **Secure by default**: Security considerations built-in from the start
- **Scalable**: Solutions work as the application grows

### Decision Framework:
When choosing between options, ask:
1. Which option is more secure?
2. Which option will scale better?
3. Which option follows industry best practices?
4. Which option eliminates future refactoring needs?
5. Which option provides better error handling?

Choose the option that scores highest on these criteria, regardless of initial time investment.

# Development Server Protocol

## Standard Dev Server Startup Protocol ⚠️
**IMPORTANT**: Before any NEW testing session on the development server:

### **Required Fresh Start Process:**
1. **Restart computer** - Full system restart to clear all processes and memory
2. **Open Terminal** - Fresh terminal session on startup
3. **Navigate to project**: `cd /path/to/hospitality-compliance`
4. **Start dev server**: `npm run dev`
5. **Verify connection**: Check that localhost:3000 (or assigned port) loads properly

### **Why This Protocol is Required:**
- **Node.js v22 binding issues**: Port binding problems that persist across sessions
- **Memory cleanup**: Ensures clean state for testing new features
- **Process conflicts**: Eliminates lingering Node processes
- **Consistent environment**: Ensures repeatable testing conditions

## Localhost Development Server Troubleshooting

When localhost is not connecting, follow these steps in order:

## Quick Fix Steps
1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev` 
3. **Test connection**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`

## Detailed Troubleshooting
If quick fix doesn't work:

1. **Check if server is running**:
   ```bash
   ps aux | grep next
   netstat -an | grep 3000
   ```

2. **Kill any existing processes**:
   ```bash
   lsof -i :3000
   # Kill process if found: kill -9 [PID]
   ```

3. **Verify Node.js version**:
   ```bash
   node --version  # Should be v18+ for Next.js 15
   npm --version
   ```

4. **Start server with explicit port**:
   ```bash
   PORT=3000 npm run dev
   ```

5. **Test connection**:
   ```bash
   curl -I http://localhost:3000  # Should return HTTP 200
   ```

## Common Issues
- **Server not binding to port**: Restart with explicit PORT environment variable
- **Process already running**: Kill existing Next.js processes first
- **Dependencies missing**: Run `npm install` to ensure all packages are installed
- **Wrong directory**: Ensure you're in the project root directory
- **Node.js v22 binding issues**: If server shows "Ready" but connection refuses, restart computer to clear OS-level port binding problems

## Success Indicators
- Next.js shows "Ready in X.Xs" message
- `curl http://localhost:3000` returns HTTP 200
- Browser can access http://localhost:3000
- Homepage displays the hospitality compliance landing page

# Context Usage Management

## Warning System
When approaching context limits, Claude must:

1. **Proactive Warning**: Alert user when conversation becomes complex with many file reads/edits
2. **Automatic Commit**: Stop work and commit all changes to date when warning is triggered
3. **Status Summary**: Provide clear summary of completed vs remaining work

## Warning Triggers
- After 15+ file operations in single session
- When working with large files (>500 lines)
- Before starting major refactoring tasks
- When TodoWrite shows 5+ pending high-priority items

## Commit Protocol
When context warning is triggered:
1. Complete current task if nearly finished
2. Mark current todo as in_progress if stopping mid-task  
3. Run git commands to commit all changes
4. Provide user with session summary and suggest `claude --resume`

## Usage Instructions
- Claude should estimate progress vs context usage throughout session
- User will be notified: "⚠️ Approaching context limits - committing work and pausing"
- User can then run `claude --resume` to continue in fresh session

# Centralized Design System

## Architecture
The application uses a centralized design system located at `/lib/design-system.ts` that provides:

### Design Tokens
- **Colors**: Glass morphism cards, text colors, status colors
- **Typography**: Consistent font sizes, weights, and hierarchy
- **Spacing**: Standardized padding, margins, and layout patterns
- **Effects**: Blur, shadows, transitions, and animations

### Utility Functions
- `getCardStyle(variant)`: Returns complete styling for card components
- `getTextStyle(type)`: Returns typography styling for text elements  
- `getFormFieldStyle()`: Returns consistent form input styling

### Reusable Components
Located at `/lib/components.ts`:
- **StyledCard**: Pre-styled card variants (Primary, Secondary, Form, Sidebar)
- **StyledText**: Typography components (PageTitle, SectionTitle, Body, etc.)
- **StyledForm**: Form elements (Input, Select, Textarea)
- **LayoutPatterns**: Common spacing and grid patterns
- **ButtonStyles**: Consistent button styling patterns

## Usage Guidelines

### ✅ Do Use Design System
```typescript
// Good - Using design system utilities
<div className={getCardStyle('primary')}>
  <h1 className={`${getTextStyle('pageTitle')} text-white`}>Title</h1>
  <input className={getFormFieldStyle()} />
</div>
```

### ❌ Avoid Hardcoded Styles
```typescript
// Avoid - Hardcoded Tailwind classes
<div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
  <h1 className="text-2xl font-bold text-white">Title</h1>
  <input className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl" />
</div>
```

### Migration Process
1. Import design system utilities: `import { getCardStyle, getTextStyle } from '@/lib/design-system'`
2. Replace hardcoded classes with utility functions
3. Test for visual consistency across pages
4. Use TypeScript compilation to catch missing properties

## Benefits
- **Single source of truth** for all styling
- **Easy global changes** - update design tokens to affect entire app
- **Consistent user experience** across all pages and components
- **Maintainable code** with clear patterns and documentation
- **Type safety** with TypeScript integration

# Claude Code Autonomy Protocol

## Integration with Workflow
The autonomy instructions from `claude_code_autonomy_instructions.md` are now integrated into the standard workflow:

### AUTO-ACCEPT EDITS Mode
When enabled, Claude executes routine development tasks autonomously:

#### ✅ Execute Automatically
- Writing new components and functions
- Implementing UI components from designs  
- Adding CSS/styling changes using design system
- Creating new files and directories
- Fixing syntax errors and TypeScript issues
- Adding imports and exports
- Code formatting and cleanup
- Creating utility functions

#### 🛑 Stop and Ask
- Modifying core authentication system
- Changing database schema with existing data
- Adding new npm packages
- Changing fundamental app architecture
- Modifying Supabase configuration

### Communication Pattern
```
Instead of: "Should I create this component?"
Execute: "Creating the component with design system integration..."

Instead of: "Would you like me to fix this styling?"  
Execute: "Fixing styling inconsistency using getCardStyle()..."
```

### Decision Framework
1. Is this specified in planning documents? → Execute
2. Does this follow existing patterns? → Execute  
3. Is this standard development practice? → Execute
4. Would this break something major? → Ask first
5. When in doubt, choose simpler implementation → Execute

## Token Efficiency Benefits
- Eliminates repetitive confirmation cycles
- Enables batch execution of related changes
- Reduces context usage through autonomous execution
- Maintains quality through established patterns and safeguards

# Enhanced Version Control Protocol

## Implementation Status ✅
The enhanced version protocol from `enhanced-version-protocol.md` is now fully implemented:

### **Commands Available:**
```bash
npm run dev          # Auto-increment build + start development
npm run log "type" "description"  # Add changelog entry
npm run alpha        # Create alpha iteration (same-day)
npm run production   # Mark as production-ready
npm run version-check # Show current version status
```

### **Version Format:**
- **Development**: `v1.8.12.007a` (major.month.day.build + alpha)
- **Production**: `v1.8.12a` (major.month.day + alpha, no build number)

### **Visual Indicators:**
- **Development**: Red header with version, env, and build time
- **Production**: Subtle footer with clean version number

### **Benefits:**
- **🎯 Precise issue tracking**: "Issue appeared in build v1.8.12.045d"
- **⏰ Build timestamps**: Know exactly when changes were made
- **📝 Automatic changelog**: `npm run log "fix" "Fixed upload issue"`
- **🔄 Alpha iterations**: Same-day refinements without incrementing build
- **🏭 Production marking**: Clean versioning for releases

## Quick Reference
```bash
# Development workflow
npm run dev                    # Start with auto-increment
npm run log "fix" "Fixed bug"  # Log the change
npm run alpha                  # Create iteration
npm run production            # Mark ready for release
```

# App Architecture Reference

## Complete System Documentation
The application architecture is comprehensively documented in `/app_architecture_structure.md` which provides:

### **📱 Application Structure**
- **Route organization**: Public routes, admin routes, workspace functionality
- **Component hierarchy**: Shared components, layout components, page-specific elements
- **Navigation patterns**: Bottom tabs, sidebar navigation, contextual headers

### **🎯 Target Platform Optimization**
- **iPad Air (2013) compatibility**: Safari 12+ optimization, 1GB RAM considerations
- **Touch-first interface**: 44px minimum touch targets, thumb-friendly navigation
- **Performance considerations**: Image compression, lazy loading, memory management

### **🔐 Authentication & Authorization**
- **Role-based access**: Staff (upload only), Manager (view reports), Admin (full access)
- **Route protection**: Public vs authenticated routes, role-specific functionality
- **Inspector portal**: Secure token-based read-only access for health inspectors

### **🎨 Design System Integration** 
- **Consistent UI patterns**: Cards, forms, navigation components using design system
- **Mobile-optimized layouts**: Single column, large text, accessible contrast
- **Component standardization**: All components follow design system utilities

### **🚀 Key Features**
- **Core functionality**: Document upload, AI processing, compliance reporting
- **User workflows**: Onboarding, daily operations, admin management
- **Business logic**: Temperature monitoring, violation alerts, audit trails

This architecture guide ensures consistent implementation patterns and maintains the iPad Air optimization focus while providing comprehensive SaaS functionality.

# Memories
- **v1.8.12.007a**: Implemented centralized design system across entire application
- **v1.8.12.007a**: Enhanced version control protocol with granular build tracking
- **Design System Migration**: Successfully migrated 15+ pages to use design tokens and utility functions
- **Autonomy Protocol**: Integrated autonomous execution workflow for improved efficiency
- **Type Safety**: Established TypeScript integration with design system for compile-time validation
- **Version Protocol**: Complete implementation of development vs production versioning system
- **Screenshot Analysis Protocol**: Autonomous visual debugging workflow for instant issue detection and fixes
- **Visual Style Guide Protocol**: Living documentation system that auto-syncs with design system changes  
- **App Architecture Documentation**: Complete system reference with iPad Air optimization patterns

## Screenshot Analysis - Context-Aware Auto-Archive Protocol ✅

### **AUTONOMOUS TASK**: Context-driven screenshot analysis and archiving:

#### **Step 0: Identify FIX TOPIC** ✅ Auto-Execute
- **Determine current investigation focus** from conversation context
- **Target analysis** to specific problem area (spacing, theming, responsive, etc.)
- **Ignore irrelevant** design elements outside fix scope

#### **Step 1-5: Context-Focused Analysis & Fixes** ✅ Auto-Execute  
- **Analyze screenshots** with laser focus on current FIX TOPIC
- **Execute targeted fixes** directly addressing the identified issue
- **Apply design system** solutions relevant to the problem area

#### **Step 6: Context-Aware Archive** ✅ Auto-Execute
1. **Rename with fix topic**: `YYYY-MM-DD_fix-topic_feature-mode_ANALYZED.png`
2. **Move to READ folder** from `:assets/dev screenshots/` to `:assets/Read/`
3. **Clean up dev folder** for next screenshot batch
4. **Report completion** with context and archived filenames

### **Context-Aware Naming Examples:**
```
2025-08-12_header-spacing_mood-board-split_ANALYZED.png
2025-08-12_theme-toggle_component-switching_ANALYZED.png
2025-08-12_mobile-responsive_dashboard-tablet_ANALYZED.png
2025-08-12_form-validation_error-states_ANALYZED.png
```

### **Communication Pattern:**
```
🎯 FIX TOPIC: Header spacing inconsistency
✅ Screenshot analysis complete - Headers now consistent between modes  
🔧 Auto-executed: Standardized padding to py-6 across all views
📁 Archived: 2025-08-12_header-spacing_mood-board-comparison_ANALYZED.png
🧹 Dev screenshots folder ready for next batch
```

### **Benefits:**
- **Laser-focused analysis** on actual problems, not general review
- **Relevant fixes only** - no scope creep during investigation
- **Better file organization** with topic-based searchable names
- **Context preservation** for future debugging reference
- **Faster problem resolution** through targeted approach

# SQL Migration Management Protocol

## Database Change Management Workflow ⚠️

### **Standard Migration Process:**
1. **Create Migration**: Write .sql file in project root during development
2. **Deploy to Supabase**: Run in SQL Editor and verify success  
3. **Archive Completed**: Move to `:assets/sql completed/` with completion tag
4. **Update Audit Log**: Record deployment in dev audit system
5. **Version Tracking**: Link migration to version bump

### **File Naming Convention:**
- **Development**: `PHASE2_RLS_MIGRATION.sql`
- **Completed**: `PHASE2_RLS_MIGRATION_COMPLETED_2025-08-13.sql`

### **Required Actions for Each Migration:**
- ✅ Test migration in development
- ✅ Deploy to production Supabase  
- ✅ Move to `:assets/sql completed/` folder
- ✅ Update version documentation
- ✅ Record in development audit log

### **Audit Trail Benefits:**
- **Clear History**: Easy to see what database changes were made when
- **Audit Compliance**: Track all production database modifications  
- **Team Coordination**: Prevent duplicate or conflicting migrations
- **Rollback Reference**: Keep completed migrations for potential rollbacks
- **Version Alignment**: Database changes aligned with code versions

### **Integration with Development System:**
- SQL migrations are tracked alongside version increments
- Each phase completion includes database change documentation
- Migration files are preserved for compliance and rollback purposes
- All database changes must follow this audit trail for production deployments