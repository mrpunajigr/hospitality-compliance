#!/bin/bash
# CheckCodeRabbitFeedback.sh

echo "🤖 Fetching Code Rabbit feedback..."

# Get latest PR number
PR_NUMBER=$(gh pr list --limit 1 --json number --jq '.[0].number')

# Get Code Rabbit comments
gh pr view $PR_NUMBER --json comments --jq '
  .comments[] | 
  select(.author.login == "coderabbitai") | 
  "=== Code Rabbit Feedback ===\n" + .body + "\n"
'

echo "✅ Code Rabbit feedback retrieved for PR #$PR_NUMBER"