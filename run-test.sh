#!/bin/bash
set -euo pipefail
cd `dirname "$0"`

textWidth=${TW:-80}
echo "Running tests"
echo "  textWidth = $textWidth"
bash -c "printf '=%.0s' {1..$textWidth}"
echo ''

cat ./test-data.txt | ./jsslb.js
