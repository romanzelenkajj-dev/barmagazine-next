#!/usr/bin/env bash
#
# The one gate to run before pushing. `npm run verify`
#
# WHY THIS EXISTS. On 2026-09-21 a commit was pushed with a failing
# redirect-chain test, because the command was
#
#     npx vitest run 2>&1 | tail -4 && git commit ... && git push
#
# and `&&` then ran on tail's exit code, not vitest's. The test had caught a
# real bug (a redirect that would have made Coa Shanghai unreachable) and its
# failure was invisible.
#
# Two things close that class of mistake:
#   1. `set -o pipefail`, so a failure anywhere in a pipeline is the exit code
#      of the whole pipeline;
#   2. this script prints a SHORT summary itself, so there is never a reason
#      to pipe it to `tail` or `head` in the first place.
#
# Use this instead of running vitest and next build by hand.
set -euo pipefail

cd "$(dirname "$0")/.."

fail() { echo ""; echo "VERIFY FAILED: $1"; exit 1; }

# A DEV SERVER IS SERVING THE SAME .next/ THIS BUILD WOULD OVERWRITE.
#
# `next build` rewrites .next while `next dev` is reading it, and the running
# server then dies with "Cannot find module './1590.js'" on every request. It
# looks like a code fault and is not one. Refuse instead, because the recovery
# (stop the server, delete .next, restart) is annoying enough to be worth
# never needing.
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "VERIFY REFUSED: something is listening on port 3000, almost certainly"
  echo "the dev server. 'next build' would overwrite the .next/ directory it is"
  echo "serving from and break it until you delete .next and restart."
  echo "Stop the preview server first, then run this again."
  exit 1
fi

echo "1/3  unit tests"
# No pipe: vitest's own exit code decides, and its output is already terse on
# success. On failure you want the full output anyway.
npx vitest run || fail "tests"

echo ""
echo "1a/3 route budget: next.config.mjs must stay under 1,800 routes"
# Vercel caps a deployment at 2,048 routes and counts every redirect, rewrite
# and header rule in next.config.mjs. On 2026-09-23 the config reached 2,053
# and every deployment failed with too_many_routes, main included. Per-bar
# and merged-slug redirects now live in src/middleware.ts (uncounted); this
# gate refuses the push long before the cap is back in reach.
node --input-type=module -e '
  const cfg = (await import("./next.config.mjs")).default;
  const r = cfg.redirects ? await cfg.redirects() : [];
  const rwRaw = cfg.rewrites ? await cfg.rewrites() : [];
  const rw = Array.isArray(rwRaw) ? rwRaw.length : Object.values(rwRaw).reduce((n, a) => n + a.length, 0);
  const h = cfg.headers ? await cfg.headers() : [];
  const total = r.length + rw + h.length;
  console.log(`     routes: ${total} (redirects ${r.length}, rewrites ${rw}, headers ${h.length}), cap 2048, gate 1800`);
  if (total > 1800) { console.error(`ROUTE BUDGET EXCEEDED: ${total} > 1800. Slug redirects belong in src/middleware.ts.`); process.exit(1); }
' || fail "route budget"

echo ""
echo "1b/3 award claims: descriptions must agree with accolade records"
# A description that names an award the records do not back, or a year the
# records do not hold, is a profile arguing with itself (task 102). Live read,
# paged; fails the gate on the first disagreement.
node scripts/audit-award-claims.mjs --quiet

echo "2/3  type check and build"
# `next build` prints "Compiled successfully" BEFORE type-checking, so its
# own success line proves nothing. Capture the output, then decide on the
# exit code AND on the one string that means a real failure.
build_log="$(mktemp)"
trap 'rm -f "$build_log"' EXIT
if ! npx next build >"$build_log" 2>&1; then
  tail -40 "$build_log"
  fail "next build exited non-zero"
fi
if grep -q "Failed to compile" "$build_log"; then
  grep -A 20 "Failed to compile" "$build_log" | head -40
  fail "next build printed 'Failed to compile'"
fi
pages="$(grep -oE "Generating static pages \([0-9]+/[0-9]+\)" "$build_log" | tail -1 || true)"

echo ""
echo "3/3  summary"
echo "     tests:  passed"
echo "     build:  clean  ${pages:-}"
echo ""
echo "VERIFY PASSED"
