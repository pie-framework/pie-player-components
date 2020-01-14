#!/usr/bin/env bash


if [ -d ./src ]; then
  echo "setting version.ts to $1"
  cat > ./src/version.ts <<- EOF
// auto generated on release
export const VERSION = "$1";
EOF
else
  echo "pie-player-components non-root-install do nothing"
fi
