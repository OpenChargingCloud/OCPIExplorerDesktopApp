#!/bin/bash

# On Windows run e.g. 'choco install jq' within an admin shell
if ! command -v jq > /dev/null 2>&1; then
  echo "Error: 'jq' is not installed."
  exit 1
fi

PACKAGE_JSON="package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo "package.json not found!"
  exit 1
fi

# The old way of getting dependencies without 'jq'
# DEPENDENCIES=$(cat package.json | grep -Po '"[^"]*":\s*"\^[^"]*"' | cut -d '"' -f 2)

DEPENDENCIES=$(jq -r '
  [(.dependencies // {} | keys[]), (.devDependencies // {} | keys[])]
  | flatten
  | .[]
' "$PACKAGE_JSON")

for PACKAGE in $DEPENDENCIES; do
  echo "Now updating: '$PACKAGE'..."
  npm install "$PACKAGE"@latest
done
