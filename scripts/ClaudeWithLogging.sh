#!/bin/bash
# ClaudeWithLogging.sh - Comprehensive Claude Code session capture

# Configuration
PROJECT_NAME="JiGR-Hospitality-Compliance"
LOG_DIR="SessionLogs"
SESSION_DATE=$(date +%Y%m%d)
SESSION_TIME=$(date +%H%M)
SESSION_FILE="ClaudeCodeSession_${SESSION_DATE}_${SESSION_TIME}.md"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Initialize session log with header
cat > "$LOG_DIR/$SESSION_FILE" << EOF
# Claude Code Session Log
**Project**: $PROJECT_NAME  
**Date**: $(date +"%B %d, %Y")  
**Time Started**: $(date +"%H:%M:%S")  
**Session File**: $SESSION_FILE

## Pre-Session Context
**Previous Status**: $(cat CurrentSessionStatus.md 2>/dev/null | grep "Working on" | head -1 || echo "No previous session status")  
**Current Focus**: [TO BE UPDATED]  
**Planned Objectives**: [TO BE UPDATED]

## Session Conversation
---
EOF

echo "📝 Session logging initialized: $LOG_DIR/$SESSION_FILE"
echo "🎯 Starting Claude Code with conversation capture..."
echo ""

# Start session with logging
script -a "$LOG_DIR/$SESSION_FILE" -c "claude"

# Post-session cleanup
echo ""
echo "📝 Session ended. Cleaning up log file..."

# Remove terminal control characters
sed 's/\x1b\[[0-9;]*m//g' "$LOG_DIR/$SESSION_FILE" > "$LOG_DIR/Clean_$SESSION_FILE"
mv "$LOG_DIR/Clean_$SESSION_FILE" "$LOG_DIR/$SESSION_FILE"

echo "✅ Session log saved: $LOG_DIR/$SESSION_FILE"
echo "🔄 Don't forget to update CurrentSessionStatus.md with results!"