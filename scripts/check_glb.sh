#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

f="public/models/gyroscope.glb"
manifest="public/models/MANIFEST.sha256"

if [ ! -f "$f" ] || [ ! -s "$f" ]; then
  echo "FAIL: $f does not exist or is empty"
  exit 1
fi

header="$(xxd -p -l 4 "$f")"
if [ "$header" != "676c5446" ]; then
  echo "FAIL: $f magic bytes mismatch. Expected 676c5446, got $header"
  exit 1
fi

# Check sha256 against manifest
if [ -f "$manifest" ]; then
  shasum -a 256 -c "$manifest" > /dev/null
else
  shasum -a 256 "$f" > "$manifest"
fi

# Run gltf-validator
node -e '
const validator = require("gltf-validator");
const fs = require("fs");
const glb = fs.readFileSync("public/models/gyroscope.glb");
validator.validateBytes(new Uint8Array(glb)).then(report => {
  if (report.issues.numErrors > 0) {
    console.error("gltf-validator errors:", report.issues.numErrors);
    process.exit(1);
  }
}).catch(err => {
  console.error(err);
  process.exit(1);
});
'

echo "check_glb PASSED: gyroscope.glb is valid (glTF header, sha256 verified, 0 errors)"
exit 0
