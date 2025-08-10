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

# Localhost Development Server Troubleshooting

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

# Memories
- Placeholder for adding future memories about the project workflow and important milestones
- Added the number 1 as a placeholder memory entry