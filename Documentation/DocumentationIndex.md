# JiGR Project Documentation Index

## Essential Reading for New Sessions
1. **ClaudeCodeQuickStart.md** - START HERE for project context, constraints, and current focus
2. **CurrentSessionStatus.md** - Current development state and immediate next steps
3. **Documentation/SessionRecoveryInstructions.md** - How to properly onboard new Claude Code sessions

## Current Development Documents
- **CURRENT-STATUS-UPDATE-FOR-BIG-CLAUDE.md** - Recent progress summary and priorities
- **IMPLEMENTATION-PLAN-PHASE1.md** - Original project planning and architecture decisions
- **cc_parsing_fix_prompt.md** - Document AI parsing improvement requirements
- **ipad-layout-audit-prompt.md** - Safari 12 compatibility requirements

## Architecture & Technical Planning
- **App Structure**: Next.js pages in `/app/` with API routes
- **Database**: Supabase with Row Level Security for multi-tenant isolation
- **Authentication**: Working Supabase auth with test@jigr.app user
- **Storage**: Supabase storage buckets (currently experiencing "Object not found" issues)
- **AI Processing**: Google Cloud Document AI with enhanced table parsing

## Archived Documentation (Historical Context)
Located in `:assets/docs completed/` folder:
- Authentication setup and testing procedures
- AWS Textract integration analysis (replaced by Google Cloud)
- Database schema evolution and client management
- UI component development and Safari compatibility fixes
- Debugging protocols and troubleshooting guides

## Session Logs & Decision History
- **SessionLogs/** - Complete conversation captures
- **DecisionHistory.md** - Extracted key decisions across sessions
- **CurrentSessionStatus.md** - Latest development state with log references

## Session Management Scripts
- **scripts/ClaudeWithLogging.sh** - Start logged Claude Code session
- **scripts/UpdateSessionLog.sh** - Add context to current session
- **scripts/SearchSessionLogs.sh** - Find specific topics in conversation history
- **scripts/ExtractDecisions.sh** - Generate decision audit trail

## Using Session Logs
1. **Starting Development**: Review latest session log for context
2. **Debugging Issues**: Search logs for similar problem resolution
3. **Understanding Decisions**: Check decision history for architectural choices
4. **Session Continuity**: Reference conversation logs for detailed context

## Development Protocols
- **Naming Convention**: PascalCase for all files - enforced project-wide
- **Session Logging**: Always use ClaudeWithLogging.sh wrapper for documentation
- **Version Control**: Standard git workflow, no automatic commits
- **Testing**: Manual testing with test@jigr.app and test70_IMG_3250.jpg
- **Deployment**: Supabase edge functions with Docker integration
- **Compatibility**: All UI changes must work on iPad Air (2013) Safari 12

## Business Context Files
- **Strategic Planning**: Market positioning for small hospitality businesses
- **Feature Priorities**: Document processing accuracy over additional features
- **Compliance Focus**: Temperature monitoring and delivery documentation automation
- **Target Customers**: Small restaurants, cafes, food service providers in New Zealand

## Quick Reference
- **Primary Test User**: test@jigr.app
- **Test Client ID**: b13e93dd-e981-4d43-97e6-26b7713fb90c (JIGR)
- **Test Document**: test70_IMG_3250.jpg (SERVICE FOODS with 8 VEGF products)
- **Expected Extraction**: 9 fields including supplier, invoice #, date, individual VEGF line items, grand total
- **Current Parser**: Google Cloud Document AI with enhanced table structure analysis