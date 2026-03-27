#!/bin/bash

# Cleanup script for archiving worktrees
# Removes node_modules, build artifacts, and Pods from all projects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Target directory (Conductor workspace or script location)
if [ -n "$CONDUCTOR_ROOT_PATH" ]; then
    REPO_DIR="$CONDUCTOR_ROOT_PATH"
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
    REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
fi

echo "Cleaning up worktree: $REPO_DIR"
echo ""

# Function to remove directory if it exists
remove_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo -e "${GREEN}✓${NC} Removed: ${dir#$REPO_DIR/}"
    fi
}

# Find and remove node_modules directories
echo "Removing node_modules directories..."
while IFS= read -r -d '' dir; do
    remove_dir "$dir"
done < <(find "$REPO_DIR" -type d -name "node_modules" -print0 2>/dev/null)
echo ""

# Find and remove android/build directories
echo "Removing android/build directories..."
while IFS= read -r -d '' dir; do
    remove_dir "$dir"
done < <(find "$REPO_DIR" -type d -path "*/android/build" -print0 2>/dev/null)
echo ""

# Find and remove ios/Pods directories
echo "Removing ios/Pods directories..."
while IFS= read -r -d '' dir; do
    remove_dir "$dir"
done < <(find "$REPO_DIR" -type d -path "*/ios/Pods" -print0 2>/dev/null)
echo ""

# Find and remove ios/build directories
echo "Removing ios/build directories..."
while IFS= read -r -d '' dir; do
    remove_dir "$dir"
done < <(find "$REPO_DIR" -type d -path "*/ios/build" -print0 2>/dev/null)
echo ""

# Calculate freed space (rough estimate by checking current size)
echo -e "${GREEN}Cleanup complete!${NC}"
