#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAILED=0

log_pass() {
  echo "PASS: $1"
}

log_fail() {
  echo "FAIL: $1"
  FAILED=1
}

# 1. Non-empty required files check
FILES=(
  "STATE.md"
  "LOG.md"
  "DECISIONS.md"
  "design/DESIGN.md"
  "design/tokens.json"
  "src/data/projects.json"
  "src/data/projects.schema.json"
  "blender/generate_gyro.py"
  "public/models/gyroscope.glb"
  "public/models/MANIFEST.sha256"
  "public/img/gyro-poster.png"
  "sandbox/codepen_preview.html"
  "site/public/cv.pdf"
  "social/instagram_launch_plan.md"
  "site/dist/index.html"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ] && [ -s "$file" ]; then
    log_pass "File exists and is non-empty: $file"
  else
    log_fail "File missing or empty: $file"
  fi
done

# 2. GLB checks
if ./scripts/check_glb.sh > /dev/null 2>&1; then
  log_pass "GLB validation (header, sha256 manifest, gltf-validator)"
else
  log_fail "GLB validation failed"
fi

# 3. Schema validation
if node scripts/validate_schema.js > /dev/null 2>&1; then
  log_pass "projects.json validated against projects.schema.json via ajv"
else
  log_fail "projects.json schema validation failed"
fi

# 4. Key scan
if ./scripts/scan_keys.sh > /dev/null 2>&1; then
  log_pass "Key scan: Zero secret leaks found"
else
  log_fail "Key scan failed"
fi

# 5. Network / third-party request check via Playwright verification script
if node scripts/check_network.js > /dev/null 2>&1; then
  log_pass "Network check: only own-origin / allowed external links detected"
else
  log_fail "Network check failed"
fi

if [ $FAILED -ne 0 ]; then
  echo "verify.sh FAILED: One or more checks did not pass."
  exit 1
fi

echo "verify.sh PASSED: All verification gates passed cleanly."
exit 0
