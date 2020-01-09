#!/usr/bin/env bash

cat > ./src/version.ts <<- EOF
// auto generated on release
export const VERSION = "$1";
EOF
