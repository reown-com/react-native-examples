#!/bin/bash
set -e

# Usage: ./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> [match_type] [--auto-merge]
# Example: ./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com appstore
# Example with auto-merge: ./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com appstore --auto-merge

CERTS_REPO=$1
BUNDLE_ID=$2
APPLE_EMAIL=$3
MATCH_TYPE=${4:-appstore}  # Default to appstore
AUTO_MERGE=false

# Check for --auto-merge flag
for arg in "$@"; do
  if [ "$arg" = "--auto-merge" ]; then
    AUTO_MERGE=true
  fi
done

if [ -z "$CERTS_REPO" ] || [ -z "$BUNDLE_ID" ] || [ -z "$APPLE_EMAIL" ]; then
  echo "Usage: $0 <certificates_repo> <bundle_id> <apple_email> [match_type] [--auto-merge]"
  echo "  certificates_repo: GitHub repo in owner/repo format"
  echo "  bundle_id: App bundle identifier"
  echo "  apple_email: Apple Developer account email"
  echo "  match_type: appstore (default), development, adhoc"
  echo "  --auto-merge: Automatically merge the PR (default: manual merge required)"
  exit 1
fi

CERTS_GIT_URL="git@github.com:${CERTS_REPO}.git"
BRANCH_NAME="certs/add-${BUNDLE_ID}-${MATCH_TYPE}"

echo "🔐 Creating certificates for ${BUNDLE_ID}"
echo "   Repo: ${CERTS_REPO}"
echo "   Apple account: ${APPLE_EMAIL}"
echo "   Type: ${MATCH_TYPE}"
echo "   Branch: ${BRANCH_NAME}"
echo "   Auto-merge: ${AUTO_MERGE}"
echo ""

# Cleanup function for error cases
cleanup_branch() {
  echo "🧹 Cleaning up branch ${BRANCH_NAME}..."
  gh api repos/${CERTS_REPO}/git/refs/heads/${BRANCH_NAME} -X DELETE 2>/dev/null || true
}

# 1. Check if branch already exists
echo "🔍 Checking if branch already exists..."
if gh api repos/${CERTS_REPO}/git/ref/heads/${BRANCH_NAME} &>/dev/null; then
  echo "⚠️  Branch ${BRANCH_NAME} already exists."
  echo "   Delete it first with: gh api repos/${CERTS_REPO}/git/refs/heads/${BRANCH_NAME} -X DELETE"
  exit 1
fi

# 2. Get master SHA with error handling
echo "📌 Creating branch ${BRANCH_NAME} from master..."
MASTER_SHA=$(gh api repos/${CERTS_REPO}/git/ref/heads/master --jq '.object.sha' 2>/dev/null)
if [ -z "$MASTER_SHA" ]; then
  echo "❌ Error: Failed to fetch master branch SHA from ${CERTS_REPO}"
  echo "   Make sure you have access to the repository and the master branch exists."
  exit 1
fi

# 3. Create branch
if ! gh api repos/${CERTS_REPO}/git/refs \
  -f ref="refs/heads/${BRANCH_NAME}" \
  -f sha="${MASTER_SHA}" > /dev/null 2>&1; then
  echo "❌ Error: Failed to create branch ${BRANCH_NAME}"
  exit 1
fi
echo "   ✓ Branch created"

# 4. Run fastlane match
echo "🚀 Running fastlane match ${MATCH_TYPE}..."
if ! bundle exec fastlane match ${MATCH_TYPE} \
  --git_url "${CERTS_GIT_URL}" \
  --git_branch "${BRANCH_NAME}" \
  --username "${APPLE_EMAIL}" \
  --app_identifier "${BUNDLE_ID}"; then
  echo ""
  echo "❌ Error: fastlane match failed"
  cleanup_branch
  exit 1
fi
echo "   ✓ Certificates created"

# 5. Create PR
echo "📝 Creating pull request..."
PR_URL=$(gh pr create \
  --repo "${CERTS_REPO}" \
  --base master \
  --head "${BRANCH_NAME}" \
  --title "Add ${MATCH_TYPE} certificates for ${BUNDLE_ID}" \
  --body "Adding ${MATCH_TYPE} certificates and provisioning profiles for \`${BUNDLE_ID}\`" 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to create PR"
  echo "   Branch ${BRANCH_NAME} exists with certificates. Create PR manually or clean up."
  exit 1
fi
echo "   ✓ PR created: ${PR_URL}"

# 6. Merge PR (if auto-merge enabled)
if [ "$AUTO_MERGE" = true ]; then
  echo "🔀 Merging pull request..."
  if ! gh pr merge "${BRANCH_NAME}" \
    --repo "${CERTS_REPO}" \
    --merge \
    --delete-branch; then
    echo "❌ Error: Failed to merge PR"
    echo "   PR was created but not merged. Review and merge manually: ${PR_URL}"
    exit 1
  fi
  echo "   ✓ PR merged and branch deleted"
  echo ""
  echo "✅ Done! Certificates for ${BUNDLE_ID} have been created and merged."
else
  echo ""
  echo "✅ Done! Certificates for ${BUNDLE_ID} have been created."
  echo ""
  echo "📋 Next steps:"
  echo "   1. Review the PR: ${PR_URL}"
  echo "   2. Merge when ready: gh pr merge ${BRANCH_NAME} --repo ${CERTS_REPO} --merge --delete-branch"
fi
