#!/bin/bash
# SearchSessionLogs.sh - Search through session logs for specific topics

if [ -z "$1" ]; then
    echo "Usage: $0 <search-term>"
    echo "Example: $0 'parser fix'"
    echo "Example: $0 'storage error'"
    exit 1
fi

SEARCH_TERM="$1"
LOG_DIR="SessionLogs"

echo "🔍 Searching session logs for: '$SEARCH_TERM'"
echo "================================================"

# Search through all session logs
grep -n -i -A 2 -B 2 "$SEARCH_TERM" "$LOG_DIR"/*.md 2>/dev/null | while IFS=: read -r file line content; do
    echo "📁 File: $(basename "$file")"
    echo "📍 Line $line: $content"
    echo "---"
done

echo ""
echo "🎯 Use specific session files for full context"
echo "📂 All logs located in: $LOG_DIR/"