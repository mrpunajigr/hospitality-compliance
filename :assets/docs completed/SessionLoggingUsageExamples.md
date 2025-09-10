# Session Logging Usage Examples

## Starting a Productive Session

### Step 1: Initialize Logging
```bash
# Start Claude Code with automatic conversation capture
./scripts/ClaudeWithLogging.sh
```

### Step 2: Add Session Context (Before Starting Work)
```bash
# Update current session with objectives
./scripts/UpdateSessionLog.sh
# Enter: Focus - "Fix Document AI parser display issue"
# Enter: Objectives - "Display 13 line items instead of generic text"
```

### Step 3: Work with Claude Code
- All conversation automatically captured
- Decisions and reasoning preserved
- Code changes documented with context

### Step 4: End Session Properly
- Update CurrentSessionStatus.md with progress
- Reference session log file in status
- Note key decisions for next session

## Searching Previous Sessions

### Find Parser-Related Discussions
```bash
./scripts/SearchSessionLogs.sh "parser"
./scripts/SearchSessionLogs.sh "line items"
./scripts/SearchSessionLogs.sh "extraction"
```

### Find Storage Issue Solutions
```bash
./scripts/SearchSessionLogs.sh "storage error"
./scripts/SearchSessionLogs.sh "bucket upload"
./scripts/SearchSessionLogs.sh "thumbnail"
```

### Extract Decision History
```bash
./scripts/ExtractDecisions.sh
# Review DecisionHistory.md for architectural choices
```

## Session Recovery Examples

### New Claude Code Session Startup
"Read the project documentation and CurrentSessionStatus.md. Review the latest session log at SessionLogs/ClaudeCodeSession_20250905_1430.md for full context. Continue working on the Document AI parser fix where we left off."

### Specific Problem Reference
"Check SessionLogs/ for previous storage error discussions. We solved a similar bucket upload issue on September 3rd - apply the same approach to the current thumbnail problem."

## Benefits in Practice

### Before Session Logging
- ❌ "We discussed this parser issue yesterday but I can't remember the exact solution..."
- ❌ "Why did we choose this approach for the storage system?"
- ❌ "What were the specific debugging steps that worked?"

### After Session Logging
- ✅ "Check SessionLogs/ClaudeCodeSession_20250904_1545.md for the exact parser solution"
- ✅ "DecisionHistory.md shows we chose Supabase storage because of multi-tenant requirements"
- ✅ "Search logs for 'storage debug' to find the successful troubleshooting steps"