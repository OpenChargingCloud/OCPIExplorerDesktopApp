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

# Extract dependencies and devDependencies using jq, and trim whitespace
DEPENDENCIES=$(jq -r '
  [(.dependencies // {} | keys[]), (.devDependencies // {} | keys[])]
  | flatten
  | .[]
' "$PACKAGE_JSON" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# Loop through each dependency and update it
echo "$DEPENDENCIES" | while read -r PACKAGE; do
  if [[ -n "$PACKAGE" ]]; then
    echo "Now updating: '$PACKAGE'..."
    npm install "$PACKAGE"@latest
  fi
done
