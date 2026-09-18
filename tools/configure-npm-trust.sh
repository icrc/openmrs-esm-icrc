#!/usr/bin/env bash
#
# Configure the npm trusted publisher (OIDC) for every publishable workspace.
#
# Trust is per package, so each workspace needs its own entry. Run this after
# adding a new package, otherwise publish.yml fails on it with an undiagnostic
# 404 ("could not be found or you do not have permission to access it"), which
# npm returns both for a missing package and for a publisher that does not match.
#
# Requires npm >= 11.15.0 and an interactive login as yourself. `npm trust`
# issues a 2FA challenge and rejects tokens that bypass 2FA, so a CI automation
# token will not work here.
#
# Must be run from a real terminal. Every npm trust subcommand, including the
# read-only `list`, completes its 2FA challenge through the browser. Without a
# TTY npm skips that handshake and fails immediately with EOTP, so this script
# cannot be driven from CI or from a non-interactive tool.
#
# Usage:
#   tools/configure-npm-trust.sh                 configure with direct publish
#   tools/configure-npm-trust.sh --stage         configure with staged publish
#   tools/configure-npm-trust.sh --dry-run       preview without changing anything
#   tools/configure-npm-trust.sh --verify-only   report current configuration
set -uo pipefail

REPO="icrc/openmrs-esm-icrc"
WORKFLOW="publish.yml"
ENVIRONMENT="npm"
MIN_NPM="11.15.0"

PERMISSION="--allow-publish"
DRY_RUN=""
VERIFY_ONLY=""

for arg in "$@"; do
  case "$arg" in
    --stage) PERMISSION="--allow-stage-publish" ;;
    --dry-run) DRY_RUN="--dry-run" ;;
    --verify-only) VERIFY_ONLY="yes" ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.." || exit 1
[ -d packages ] || { echo "run this from the repository, packages/ not found" >&2; exit 1; }

# npm trust is only available from 11.15.0 onwards.
have_npm="$(npm --version)"
if [ "$(printf '%s\n%s\n' "$MIN_NPM" "$have_npm" | sort -V | head -1)" != "$MIN_NPM" ]; then
  echo "npm $have_npm is too old, npm trust needs >= $MIN_NPM" >&2
  echo "  npm install -g npm@^$MIN_NPM" >&2
  exit 1
fi

if ! whoami_out="$(npm whoami 2>&1)"; then
  echo "not logged in to npm: $whoami_out" >&2
  echo "  npm login" >&2
  exit 1
fi
echo "npm $have_npm, authenticated as $whoami_out"

# Mirror the selection publish.yml uses: yarn workspaces foreach -A --no-private.
mapfile -t PKGS < <(node -e '
const fs = require("fs");
for (const d of fs.readdirSync("packages").sort()) {
  const f = `packages/${d}/package.json`;
  if (!fs.existsSync(f)) continue;
  const p = JSON.parse(fs.readFileSync(f, "utf8"));
  if (p.private || !p.name) continue;
  console.log(p.name);
}')

[ "${#PKGS[@]}" -gt 0 ] || { echo "no publishable workspaces found" >&2; exit 1; }
echo "${#PKGS[@]} publishable workspaces"
echo "target: repo=$REPO file=$WORKFLOW env=$ENVIRONMENT permission=$PERMISSION"
echo

if [ -z "$VERIFY_ONLY" ]; then
  cat <<'NOTE'
The first package will trigger a two-factor challenge in your browser. On that
npm page, tick "skip two-factor authentication for the next 5 minutes" before
approving. The remaining packages then go through without another challenge.
Miss it and you will be challenged once per package.

NOTE
fi

ok=0
failed=()

# Output is deliberately not captured: npm prints the browser authentication URL
# and waits, so capturing it hides the prompt and the command appears to hang or
# fail with EOTP. The 2 second delay between calls is what the npm docs advise to
# avoid rate limiting during bulk configuration.
for p in "${PKGS[@]}"; do
  printf '== %s\n' "$p"

  if [ -n "$VERIFY_ONLY" ]; then
    npm trust list "$p" --json || failed+=("$p")
    continue
  fi

  if npm trust github "$p" \
      --repo "$REPO" \
      --file "$WORKFLOW" \
      --env "$ENVIRONMENT" \
      $PERMISSION $DRY_RUN --yes; then
    ok=$((ok + 1))
  else
    failed+=("$p")
  fi

  sleep 2
done

echo
if [ -n "$VERIFY_ONLY" ]; then
  echo "listed ${#PKGS[@]} packages, ${#failed[@]} could not be read"
else
  echo "configured $ok of ${#PKGS[@]}"
fi

if [ "${#failed[@]}" -gt 0 ]; then
  echo "failed:"
  printf '  %s\n' "${failed[@]}"
  echo
  echo "Fix these before dispatching publish.yml: it publishes topologically and"
  echo "stops at the first workspace that is rejected."
  exit 1
fi

echo "All set. Dispatch publish.yml with the release input unchecked to validate."
