#!/bin/bash
# Patches ReactFabric-dev.js to wrap addObjectDiffToProperties in a try/catch.
# This fixes a React 19.2 dev-mode crash when logComponentRender tries to
# introspect Proxy objects (e.g. from valtio), which breaks the render cycle.
# Only affects dev builds — production builds use ReactFabric-prod.js.

DEV_FILE="node_modules/react-native/Libraries/Renderer/implementations/ReactFabric-dev.js"

if [ ! -f "$DEV_FILE" ]; then
  echo "ReactFabric-dev.js not found, skipping patch"
  exit 0
fi

# Check if already patched
if grep -q "PATCHED_addObjectDiff" "$DEV_FILE"; then
  echo "ReactFabric-dev.js already patched"
  exit 0
fi

# Replace the function with a try/catch wrapper (supports both BSD and GNU sed)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/function addObjectDiffToProperties(prev, next, properties, indent) {/function addObjectDiffToProperties(prev, next, properties, indent) { \/* PATCHED_addObjectDiff *\/ try { return _addObjectDiffToProperties(prev, next, properties, indent); } catch (e) { return true; } } function _addObjectDiffToProperties(prev, next, properties, indent) {/' "$DEV_FILE"
else
  sed -i 's/function addObjectDiffToProperties(prev, next, properties, indent) {/function addObjectDiffToProperties(prev, next, properties, indent) { \/* PATCHED_addObjectDiff *\/ try { return _addObjectDiffToProperties(prev, next, properties, indent); } catch (e) { return true; } } function _addObjectDiffToProperties(prev, next, properties, indent) {/' "$DEV_FILE"
fi

# Validate the patch was actually applied
if grep -q "PATCHED_addObjectDiff" "$DEV_FILE"; then
  echo "Patched ReactFabric-dev.js (addObjectDiffToProperties try/catch)"
else
  echo "Failed to patch ReactFabric-dev.js (pattern not found)"
  exit 1
fi
