#!/usr/bin/env bash
echo "setting version.ts to $1"
cat > ./src/version.ts <<- EOF
// auto generated on release
export const VERSION = "$1";
EOF
