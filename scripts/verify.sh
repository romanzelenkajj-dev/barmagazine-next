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

echo "1/3  unit tests"
# No pipe: vitest's own exit code decides, and its output is already terse on
# success. On failure you want the full output anyway.
npx vitest run || fail "tests"

echo ""
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
