#!/bin/bash
# ExtractDecisions.sh - Extract key decisions from session logs

LOG_DIR="SessionLogs"
OUTPUT_FILE="DecisionHistory.md"

echo "# Development Decision History" > "$OUTPUT_FILE"
echo "**Generated**: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Extract common decision patterns
DECISION_PATTERNS=(
    "decided to"
    "chose to"
    "approach will be"
    "solution is"
    "fix this by"
    "implementation strategy"
)

for pattern in "${DECISION_PATTERNS[@]}"; do
    echo "## Decisions: $pattern" >> "$OUTPUT_FILE"
    grep -n -i -A 1 "$pattern" "$LOG_DIR"/*.md 2>/dev/null | while IFS=: read -r file line content; do
        echo "- **$(basename "$file" .md)**: $content" >> "$OUTPUT_FILE"
    done
    echo "" >> "$OUTPUT_FILE"
done

echo "✅ Decision history extracted to: $OUTPUT_FILE"
echo "📊 Review this file to understand project evolution"