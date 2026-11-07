#!/usr/bin/env bash
set -euo pipefail

root=$(git rev-parse --show-toplevel)
base=${SYNC_BASE:-rocco/main}
branch=${SYNC_BRANCH:-sync/upstream-$(date -u +%Y-%m-%d)}
report=${SYNC_REPORT:-$root/qa-rocco/upstream-conflicts.txt}
checkout=$(mktemp -d "${TMPDIR:-/tmp}/maestro-upstream.XXXXXX")
mkdir -p "$(dirname "$report")"
: > "$report"
cleanup() {
  git -C "$root" worktree remove --force "$checkout" >/dev/null 2>&1 || true
  rmdir "$checkout" 2>/dev/null || true
}
trap cleanup EXIT

if command -v pnpm >/dev/null 2>&1 && [[ $(pnpm --version) == 12.* ]]; then
  package_manager=(pnpm)
else
  package_manager=(corepack pnpm)
fi
[[ $("${package_manager[@]}" --version) == 12.* ]] || { echo 'pnpm 12 is required' >&2; exit 1; }

git -C "$root" fetch upstream main
git -C "$root" worktree add -b "$branch" "$checkout" "$base"
cd "$checkout"
if ! git merge --no-edit upstream/main; then
  git diff --name-only --diff-filter=U > "$report"
  if [[ ! -s $report ]]; then
    echo 'Merge failed without file conflicts. Inspect the sync log.' > "$report"
  fi
  echo 'Upstream merge failed:'
  cat "$report"
  git merge --abort || true
  exit 2
fi

export ORCA_BACKGROUND_LAUNCH=1
"${package_manager[@]}" install --frozen-lockfile
"${package_manager[@]}" -C mobile install --frozen-lockfile
"${package_manager[@]}" tc
"${package_manager[@]}" test --changed="$base" --maxWorkers=2
"${package_manager[@]}" check:changed --base="$base" --maxWorkers=2
printf 'Sync verified on %s. Base %s was left unchanged.\n' "$branch" "$base"
echo "Review and push with: git push -u origin $branch"
