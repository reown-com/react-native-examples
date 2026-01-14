#!/bin/bash
set -e

# Usage: ./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> [match_type]
# Example: ./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com appstore

CERTS_REPO=$1
BUNDLE_ID=$2
APPLE_EMAIL=$3
MATCH_TYPE=${4:-appstore}  # Default to appstore

if [ -z "$CERTS_REPO" ] || [ -z "$BUNDLE_ID" ] || [ -z "$APPLE_EMAIL" ]; then
  echo "Usage: $0 <certificates_repo> <bundle_id> <apple_email> [match_type]"
  echo "  certificates_repo: GitHub repo in owner/repo format"
  echo "  bundle_id: App bundle identifier"
  echo "  apple_email: Apple Developer account email"
  echo "  match_type: appstore (default), development, adhoc"
  exit 1
fi

CERTS_GIT_URL="git@github.com:${CERTS_REPO}.git"
BRANCH_NAME="certs/add-${BUNDLE_ID}-${MATCH_TYPE}"

echo "🔐 Creating certificates for ${BUNDLE_ID}"
echo "   Repo: ${CERTS_REPO}"
echo "   Apple account: ${APPLE_EMAIL}"
echo "   Type: ${MATCH_TYPE}"
echo "   Branch: ${BRANCH_NAME}"
echo ""

# 1. Create branch from master remotely
echo "📌 Creating branch ${BRANCH_NAME} from master..."
MASTER_SHA=$(gh api repos/${CERTS_REPO}/git/ref/heads/master --jq '.object.sha')
gh api repos/${CERTS_REPO}/git/refs \
  -f ref="refs/heads/${BRANCH_NAME}" \
  -f sha="${MASTER_SHA}" > /dev/null

# 2. Run fastlane match
echo "🚀 Running fastlane match ${MATCH_TYPE}..."
bundle exec fastlane match ${MATCH_TYPE} \
  --git_url "${CERTS_GIT_URL}" \
  --git_branch "${BRANCH_NAME}" \
  --username "${APPLE_EMAIL}" \
  --app_identifier "${BUNDLE_ID}"

# 3. Create PR
echo "📝 Creating pull request..."
gh pr create \
  --repo "${CERTS_REPO}" \
  --base master \
  --head "${BRANCH_NAME}" \
  --title "Add ${MATCH_TYPE} certificates for ${BUNDLE_ID}" \
  --body "Adding ${MATCH_TYPE} certificates and provisioning profiles for \`${BUNDLE_ID}\`"

# 4. Merge PR and delete branch
echo "🔀 Merging pull request..."
gh pr merge "${BRANCH_NAME}" \
  --repo "${CERTS_REPO}" \
  --merge \
  --delete-branch

echo ""
echo "✅ Done! Certificates for ${BUNDLE_ID} have been created and merged."
