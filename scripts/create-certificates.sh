#!/bin/bash
set -e

# Usage: ./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> [match_type] [--auto-merge] [--no-pr]
# Example (local):    ./scripts/create-certificates.sh reown-com/mobile-match com.reown.myapp dev@reown.com appstore
# Example (auto):     ./scripts/create-certificates.sh reown-com/mobile-match com.reown.myapp dev@reown.com appstore --auto-merge
# Example (CI):       ./scripts/create-certificates.sh reown-com/mobile-match com.reown.myapp "" appstore --no-pr
#
# --no-pr: make no GitHub API calls (no token needed). match pushes the branch over SSH and a
#          human opens the PR. This is what CI uses.

CERTS_REPO=$1
BUNDLE_ID=$2
APPLE_EMAIL=$3
MATCH_TYPE=${4:-appstore}
AUTO_MERGE=false
SKIP_PR=false

for arg in "$@"; do
  if [ "$arg" = "--auto-merge" ]; then
    AUTO_MERGE=true
  fi
  if [ "$arg" = "--no-pr" ]; then
    SKIP_PR=true
  fi
done

# App Store Connect API key (CI, no 2FA) when available, else interactive Apple ID.
USE_API_KEY=false
if [ -n "$APPLE_KEY_ID" ] && [ -n "$APPLE_ISSUER_ID" ] && [ -n "$APPLE_KEY_CONTENT" ]; then
  USE_API_KEY=true
fi

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

# Drop the branch we created so a retry is clean — but only while it still matches master.
# Once match has pushed, the branch is the sole record of a certificate Apple already issued;
# deleting it strands that cert and lets a retry mint a duplicate against Apple's cap.
cleanup_branch() {
  local branch_sha master_sha
  branch_sha=$(git ls-remote "${CERTS_GIT_URL}" "refs/heads/${BRANCH_NAME}" 2>/dev/null | cut -f1) || true
  master_sha=$(git ls-remote "${CERTS_GIT_URL}" refs/heads/master 2>/dev/null | cut -f1) || true

  if [ -z "$branch_sha" ]; then
    return 0  # nothing was ever pushed
  fi

  if [ -n "$master_sha" ] && [ "$branch_sha" != "$master_sha" ]; then
    echo ""
    echo "⚠️  NOT deleting ${BRANCH_NAME} — match already pushed to it."
    echo "   It may hold a certificate Apple has already issued. Do NOT re-run this script;"
    echo "   inspect the branch first: ${COMPARE_URL}"
    return 0
  fi

  echo "🧹 Cleaning up branch ${BRANCH_NAME} (unchanged from master)..."
  if [ "$SKIP_PR" = false ]; then
    gh api repos/${CERTS_REPO}/git/refs/heads/${BRANCH_NAME} -X DELETE 2>/dev/null || true
  else
    git push "${CERTS_GIT_URL}" --delete "${BRANCH_NAME}" 2>/dev/null || true
  fi
}

# Branch from master BEFORE match runs. Pointed at a non-existent branch, match builds an
# orphan branch holding only the new files — unmergeable — and re-mints a duplicate
# certificate because it can't see the existing one.
if [ "$SKIP_PR" = false ]; then
  echo "🔍 Checking if branch already exists..."
  if gh api repos/${CERTS_REPO}/git/ref/heads/${BRANCH_NAME} &>/dev/null; then
    echo "⚠️  Branch ${BRANCH_NAME} already exists."
    echo "   Delete it first with: gh api repos/${CERTS_REPO}/git/refs/heads/${BRANCH_NAME} -X DELETE"
    exit 1
  fi

  echo "📌 Creating branch ${BRANCH_NAME} from master..."
  # `|| true`: without it `set -e` aborts at the assignment and the diagnostic below never runs.
  MASTER_SHA=$(gh api repos/${CERTS_REPO}/git/ref/heads/master --jq '.object.sha' 2>/dev/null) || true
  if [ -z "$MASTER_SHA" ]; then
    echo "❌ Error: Failed to fetch master branch SHA from ${CERTS_REPO}"
    echo "   Make sure you have access to the repository and the master branch exists."
    exit 1
  fi

  if ! gh api repos/${CERTS_REPO}/git/refs \
    -f ref="refs/heads/${BRANCH_NAME}" \
    -f sha="${MASTER_SHA}" > /dev/null 2>&1; then
    echo "❌ Error: Failed to create branch ${BRANCH_NAME}"
    exit 1
  fi
  echo "   ✓ Branch created"
else
  # --no-pr: same thing over SSH, no GitHub token.
  echo "📌 Creating branch ${BRANCH_NAME} from master over SSH..."
  WORKDIR=$(mktemp -d)
  if ! git clone --depth 1 --branch master "${CERTS_GIT_URL}" "${WORKDIR}" >/dev/null 2>&1; then
    echo "❌ Error: failed to clone ${CERTS_GIT_URL} (check SSH access / MATCH_SSH_KEY)"
    rm -rf "${WORKDIR}"
    exit 1
  fi
  git -C "${WORKDIR}" checkout -b "${BRANCH_NAME}" >/dev/null 2>&1
  if ! git -C "${WORKDIR}" push origin "${BRANCH_NAME}" >/dev/null 2>&1; then
    echo "❌ Error: failed to push branch ${BRANCH_NAME}."
    echo "   It probably already exists (e.g. from a previous run). Delete it first:"
    echo "   git push ${CERTS_GIT_URL} --delete ${BRANCH_NAME}"
    rm -rf "${WORKDIR}"
    exit 1
  fi
  rm -rf "${WORKDIR}"
  echo "   ✓ Branch created from master"
fi

echo "🚀 Running fastlane match ${MATCH_TYPE}..."
if [ "$USE_API_KEY" = true ]; then
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
# Assign inside `if !`, not a trailing $? check — `set -e` aborts at the assignment, and 2>&1
# hides gh's error inside PR_URL, so the failure would otherwise be silent.
if ! PR_URL=$(gh pr create \
  --repo "${CERTS_REPO}" \
  --base master \
  --head "${BRANCH_NAME}" \
  --title "Add ${MATCH_TYPE} certificates for ${BUNDLE_ID}" \
  --body "Adding ${MATCH_TYPE} certificates and provisioning profiles for \`${BUNDLE_ID}\`" 2>&1); then
  echo "❌ Error: Failed to create PR"
  echo "   ${PR_URL}"
  echo ""
  echo "⚠️  The certificates were created successfully — only opening the PR failed."
  echo "   Branch ${BRANCH_NAME} holds them. Do NOT re-run this script; open the PR by hand:"
  echo "   ${COMPARE_URL}"
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
