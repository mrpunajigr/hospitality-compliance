# Claude Code Instructions

## 🚨 CRITICAL: Code Implementation Protocol

**MANDATORY**: When providing code implementations, ALL code must be written to separate `.md` files rather than delivered directly in the terminal.

**Reason**: The terminal truncates long code instructions, causing incomplete implementations and potential system errors.

**Required Process**:
1. Create descriptive `.md` files for each code implementation
2. Include complete, untruncated code in the markdown files
3. Provide clear file paths and implementation instructions
4. Reference the `.md` files in terminal responses

**Example Structure**:
```
implementation-files/
├── rbac-migration.md          # Database migration code
├── user-invitation-api.md     # API endpoint implementation  
├── invitation-modal.md        # React component code
└── acceptance-page.md         # Full page implementation
```

This ensures complete, accurate code delivery and prevents implementation errors due to truncated instructions.

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. Keep all Table names short when creating the database schema.

## Localhost Development Server Troubleshooting

When localhost is not connecting, follow these steps in order:

### Quick Fix Steps
1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev` 
3. **Test connection**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`

### Detailed Troubleshooting
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

### Common Issues
- **Server not binding to port**: Restart with explicit PORT environment variable
- **Process already running**: Kill existing Next.js processes first
- **Dependencies missing**: Run `npm install` to ensure all packages are installed
- **Wrong directory**: Ensure you're in the project root directory

### Success Indicators
- Next.js shows "Ready in X.Xs" message
- `curl http://localhost:3000` returns HTTP 200
- Browser can access http://localhost:3000
- Homepage displays the hospitality compliance landing page

## Context Usage Management

### Warning System
When approaching context limits, Claude must:

1. **Proactive Warning**: Alert user when conversation becomes complex with many file reads/edits
2. **Automatic Commit**: Stop work and commit all changes to date when warning is triggered
3. **Status Summary**: Provide clear summary of completed vs remaining work

### Warning Triggers
- After 15+ file operations in single session
- When working with large files (>500 lines)
- Before starting major refactoring tasks
- When TodoWrite shows 5+ pending high-priority items

### Commit Protocol
When context warning is triggered:
1. Complete current task if nearly finished
2. Mark current todo as in_progress if stopping mid-task  
3. Run git commands to commit all changes
4. Provide user with session summary and suggest `claude --resume`

### Usage Instructions
- Claude should estimate progress vs context usage throughout session
- User will be notified: "⚠️ Approaching context limits - committing work and pausing"
- User can then run `claude --resume` to continue in fresh session

## Project Context

This is the JiGR Hospitality Compliance platform - a multi-tenant SaaS system for New Zealand hospitality businesses to manage delivery compliance and documentation.

### Current Implementation Status

- ✅ Multi-tenant database with RLS policies
- ✅ Role-based access control (OWNER/MANAGER/SUPERVISOR/STAFF)  
- ✅ User invitation system with token-based workflow
- ✅ Enhanced admin interface with team management
- ✅ iPad Air compatible design system
- 🔄 Email notification system (ready for service integration)
- 🔄 Role-based navigation updates needed
- 🔄 Security hardening and testing required

### Key Technologies

- **Frontend**: Next.js 15.4.6, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Enhanced RBAC with permission matrix
- **Design**: Glass morphism, mobile-first responsive
- **Target**: iPad Air Safari 12 compatibility

### Development Protocols

- Always maintain backward compatibility
- Use existing design system tokens
- Follow established naming conventions
- Test on iPad Air viewport (768x1024)
- Implement comprehensive audit logging
- Ensure multi-tenant data isolation

## Email Configuration Memories

- **Email Service Direct Sending Test**: 
  - POST to endpoint with `{"testEmail": "your@email.com"}` to test direct email sending
  - Current Configuration:
    - API Key Present: Yes (preview: `re_XESGX...`)
    - Sender Address: `dev@jigr.app`
    - Environment: Production
    - Configuration Timestamp: 2025-09-24T03:13:28.226Z