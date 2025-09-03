# Session Recovery Protocol

## For New Claude Code Sessions

### Step 1: Read Documentation First
1. Read `ClaudeCodeQuickStart.md` completely - **This contains essential project context**
2. Review `CurrentSessionStatus.md` for current development state and immediate priorities  
3. Scan all .md files in project root and `:assets/docs completed/` for historical context
4. Understand established patterns, constraints, and naming conventions before asking questions

### Step 2: Assess Current State  
1. Check git status and recent commits to understand what was last modified
2. Review most recently modified files in key directories (`/app/`, `/supabase/functions/`, `/lib/`)
3. Understand what systems are working correctly vs. what needs fixing
4. Identify current task priority from `CurrentSessionStatus.md`

### Step 3: Confirm Understanding
Ask ONLY if documentation doesn't cover:
- Specific implementation details not documented in planning files
- Clarification on current development priorities not clear from session status
- Technical details missing from the quick start guide or planning documents

### DO NOT Ask About
- **Project overview** (documented in `ClaudeCodeQuickStart.md`)
- **Naming conventions** (PascalCase policy is documented)  
- **Architecture decisions** (multi-tenant, Safari 12 compatibility documented)
- **Technology stack** (Next.js, Supabase, Google Cloud AI documented)
- **Constraints and requirements** (iPad Air 2013, memory optimization documented)
- **Authentication system** (working correctly, don't modify)

## Recovery Prompt Template

Use this exact prompt for new sessions:

```
"Read the project documentation (especially ClaudeCodeQuickStart.md and CurrentSessionStatus.md) and continue where we left off with [SPECIFIC TASK FROM SESSION STATUS]. Ask only if you need clarification on something not covered in the documentation."
```

## Critical Recovery Rules
1. **Read First, Ask Later** - Documentation exists to prevent re-explanation
2. **Respect Working Systems** - Don't modify authentication, database schema, or stable components
3. **Follow Established Patterns** - Use existing code conventions and design patterns
4. **Focus on Current Task** - Continue specific work in progress rather than starting fresh
5. **Maintain Compatibility** - All changes must work on Safari 12 / iPad Air 2013

## Emergency Recovery Commands
```bash
# Check current system state
git status
git log --oneline -5

# Verify key services are running
npx supabase status

# Check latest database records
npx supabase db shell
\d delivery_records
SELECT * FROM delivery_records ORDER BY created_at DESC LIMIT 3;

# Test authentication
curl -X GET http://localhost:3000/api/health-check
```

## Session Handoff Checklist
Before ending a session, ensure:
- [ ] `CurrentSessionStatus.md` is updated with exact stopping point
- [ ] Known issues and next steps are documented  
- [ ] Any new files or significant changes are noted
- [ ] Working systems vs. problem areas are clearly identified
- [ ] Specific test cases or success criteria are documented