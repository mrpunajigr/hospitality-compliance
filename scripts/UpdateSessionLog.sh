#!/bin/bash
# UpdateSessionLog.sh - Quick session context updates

LATEST_LOG=$(ls -t SessionLogs/ClaudeCodeSession_*.md 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No session log found. Start with ./scripts/ClaudeWithLogging.sh"
    exit 1
fi

echo "📝 Updating session context in: $LATEST_LOG"
echo ""

# Interactive prompts for session context
read -p "🎯 Current Focus: " CURRENT_FOCUS
read -p "📋 Planned Objectives: " OBJECTIVES
read -p "⚠️  Known Issues: " ISSUES
read -p "🔧 Files Being Modified: " FILES

# Update the session log header
sed -i.bak "s/\*\*Current Focus\*\*: \[TO BE UPDATED\]/\*\*Current Focus\*\*: $CURRENT_FOCUS/" "$LATEST_LOG"
sed -i.bak "s/\*\*Planned Objectives\*\*: \[TO BE UPDATED\]/\*\*Planned Objectives\*\*: $OBJECTIVES/" "$LATEST_LOG"

# Add session context section if not exists
if ! grep -q "## Session Context" "$LATEST_LOG"; then
    cat >> "$LATEST_LOG" << EOF

## Session Context
**Known Issues**: $ISSUES  
**Active Files**: $FILES  
**Last Updated**: $(date +"%H:%M:%S")

EOF
fi

echo "✅ Session context updated!"
rm -f "$LATEST_LOG.bak"