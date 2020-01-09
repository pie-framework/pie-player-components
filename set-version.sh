#!/usr/bin/env bash

cat > ./src/version.ts <<- EOF
export const VERSION = "$1";
EOF
