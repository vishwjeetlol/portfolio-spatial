#!/usr/bin/env bash
set -euo pipefail

# Key Scan script: ensures no API keys, tokens, or .env files are committed or present in build
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAILED=0

# Check for .env files
ENV_FILES=$(find . -maxdepth 3 -name ".env*" -not -path "*/node_modules/*" -not -path "*/.git/*" || true)
if [ -n "$ENV_FILES" ]; then
  echo "FAIL: Found environment file(s):"
  echo "$ENV_FILES"
  FAILED=1
fi

# Patterns to scan for
# Note: we exclude this script itself from secret scanning
PATTERNS=(
  "AIza[0-9A-Za-z_-]{35}"
  "sk-[A-Za-z0-9]{20,}"
  "ghp_[A-Za-z0-9]{30,}"
)

for p in "${PATTERNS[@]}"; do
  MATCHES=$(grep -rE "$p" . \
    --exclude-dir=".git" \
    --exclude-dir="node_modules" \
    --exclude="scan_keys.sh" \
    --exclude="verify.sh" \
    --exclude="PROMPT_LEAN.md" \
    --exclude="TOOLING.md" || true)
  if [ -n "$MATCHES" ]; then
    echo "FAIL: Secret pattern match for pattern: $p"
    echo "$MATCHES"
    FAILED=1
  fi
done

if [ $FAILED -ne 0 ]; then
  echo "Key scan FAILED. Potential secrets detected."
  exit 1
fi

echo "Key scan PASSED: Zero secret leaks found."
exit 0
