#!/bin/bash
set -e

# Usage: ./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> [match_type] [--auto-merge] [--no-pr]
# Example (local):    ./scripts/create-certificates.sh reown-com/mobile-match com.reown.myapp dev@reown.com appstore
# Example (auto):     ./scripts/create-certificates.sh reown-com/mobile-match com.reown.myapp dev@reown.com appstore --auto-merge
# Example (CI):       ./scripts/create-certificates.sh reown-com/mobile-match com.reown.myapp "" appstore --no-pr
#
# --no-pr: don't touch GitHub (no token needed). fastlane match pushes the certs branch over
#          SSH; a human then opens and merges the PR in the certs repo. This is the CI default.

CERTS_REPO=$1
BUNDLE_ID=$2
APPLE_EMAIL=$3
MATCH_TYPE=${4:-appstore}  # Default to appstore
AUTO_MERGE=false
SKIP_PR=false

# Parse flags
for arg in "$@"; do
  if [ "$arg" = "--auto-merge" ]; then
    AUTO_MERGE=true
  fi
  if [ "$arg" = "--no-pr" ]; then
    SKIP_PR=true
  fi
done

# Decide auth mode: App Store Connect API key (CI, no 2FA) vs Apple ID (local, interactive).
# The API key is used automatically when its env vars are present.
USE_API_KEY=false
if [ -n "$APPLE_KEY_ID" ] && [ -n "$APPLE_ISSUER_ID" ] && [ -n "$APPLE_KEY_CONTENT" ]; then
  USE_API_KEY=true
fi

# apple_email is only required for interactive (Apple ID) auth.
if [ -z "$CERTS_REPO" ] || [ -z "$BUNDLE_ID" ] || { [ "$USE_API_KEY" = false ] && [ -z "$APPLE_EMAIL" ]; }; then
  echo "Usage: $0 <certificates_repo> <bundle_id> <apple_email> [match_type] [--auto-merge] [--no-pr]"
  echo "  certificates_repo: GitHub repo in owner/repo format"
  echo "  bundle_id: App bundle identifier"
  echo "  apple_email: Apple Developer account email (optional when APPLE_KEY_* env vars are set)"
  echo "  match_type: appstore (default), development, adhoc"
  echo "  --auto-merge: Automatically merge the PR (requires a GitHub token; ignored with --no-pr)"
  echo "  --no-pr: Skip all GitHub API calls; match pushes the branch and a human merges the PR"
  exit 1
fi

CERTS_GIT_URL="git@github.com:${CERTS_REPO}.git"
BRANCH_NAME="certs/add-${BUNDLE_ID}-${MATCH_TYPE}"
COMPARE_URL="https://github.com/${CERTS_REPO}/compare/master...${BRANCH_NAME}?expand=1"

echo "🔐 Creating certificates for ${BUNDLE_ID}"
echo "   Repo: ${CERTS_REPO}"
echo "   Apple account: ${APPLE_EMAIL:-<API key>}"
echo "   Type: ${MATCH_TYPE}"
echo "   Branch: ${BRANCH_NAME}"
echo "   PR mode: $([ "$SKIP_PR" = true ] && echo 'skip (manual merge)' || echo "create$([ "$AUTO_MERGE" = true ] && echo ' + auto-merge')")"
echo ""

# Cleanup function for error cases (only when we manage the branch via gh)
cleanup_branch() {
  if [ "$SKIP_PR" = false ]; then
    echo "🧹 Cleaning up branch ${BRANCH_NAME}..."
    gh api repos/${CERTS_REPO}/git/refs/heads/${BRANCH_NAME} -X DELETE 2>/dev/null || true
  fi
}

# In gh mode, pre-create the branch from master. In --no-pr mode, fastlane match
# creates and pushes the branch itself over SSH, so we skip these GitHub API calls.
if [ "$SKIP_PR" = false ]; then
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
fi

# 4. Run fastlane match
echo "🚀 Running fastlane match ${MATCH_TYPE}..."
if [ "$USE_API_KEY" = true ]; then
  # CI path: API-key auth via the create_certs lane (no Apple ID / 2FA).
  echo "   🔑 Using App Store Connect API key auth"
  if ! BUNDLE_ID="${BUNDLE_ID}" \
    MATCH_TYPE="${MATCH_TYPE}" \
    MATCH_GIT_URL="${CERTS_GIT_URL}" \
    MATCH_GIT_BRANCH="${BRANCH_NAME}" \
    bundle exec fastlane ios create_certs; then
    echo ""
    echo "❌ Error: fastlane create_certs failed"
    cleanup_branch
    exit 1
  fi
else
  # Local path: interactive Apple ID auth.
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
fi
echo "   ✓ Certificates created"

# 5/6. Open (and optionally merge) the PR. Skipped entirely in --no-pr mode.
if [ "$SKIP_PR" = true ]; then
  echo ""
  echo "✅ Done! Certificates for ${BUNDLE_ID} have been pushed to branch ${BRANCH_NAME}."
  echo ""
  echo "⚠️  The release workflow will FAIL until this branch is merged into master."
  echo ""
  echo "📋 Next steps (a teammate with access to ${CERTS_REPO}):"
  echo "   1. Open a PR:  ${COMPARE_URL}"
  echo "   2. Review and merge it into master."
  exit 0
fi

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
  echo "⚠️  The release workflow will FAIL until this PR is merged into master."
  echo ""
  echo "📋 Next steps:"
  echo "   1. Review the PR: ${PR_URL}"
  echo "   2. Merge when ready: gh pr merge ${BRANCH_NAME} --repo ${CERTS_REPO} --merge --delete-branch"
fi
