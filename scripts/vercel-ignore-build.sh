#!/bin/bash
# Vercel Ignored Build Step. Exit 0 = SKIP the build, exit 1 = BUILD.
#
# WHY (task 103, 2026-09-22). Build CPU minutes went from 1.3K to 17.9K in
# one billing cycle. Most of the commits behind that changed nothing a
# visitor can see: outreach lists, task reports, parked.txt. Every one of
# them rebuilt 832 pages.
#
# WHAT COUNTS AS A BUILD INPUT. Roman's list is src/, public/, next.config,
# package.json and the lockfile. Three more are included because a change to
# any of them changes the build output and a skipped build there would be a
# silent bug rather than a saving: tsconfig.json, tailwind.config.ts,
# postcss.config.mjs. vercel.json is included so a change to this rule or to
# the crons always builds. scripts/ is NOT an input: nothing under it is
# imported by the app.
#
# WHICH COMMITS TO COMPARE. Vercel builds the head of a push, not each
# commit. If a push carries three commits and only the last is noise,
# `git diff HEAD^ HEAD` would look clean and the earlier code change would
# never deploy. So compare against the last DEPLOYED commit when Vercel
# tells us what it was (VERCEL_GIT_PREVIOUS_SHA), and fall back to HEAD^
# only when it does not. Any git error means "build": a wrong skip costs a
# missing deploy, a wrong build costs a few minutes.
set -u
INPUTS=(src public next.config.mjs package.json pnpm-lock.yaml package-lock.json tsconfig.json tailwind.config.ts postcss.config.mjs vercel.json)

BASE=""
if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] && git cat-file -e "${VERCEL_GIT_PREVIOUS_SHA}^{commit}" 2>/dev/null; then
  BASE="$VERCEL_GIT_PREVIOUS_SHA"
elif git cat-file -e "HEAD^{commit}" 2>/dev/null && git rev-parse -q --verify "HEAD^" >/dev/null 2>&1; then
  BASE="HEAD^"
fi

if [ -z "$BASE" ]; then
  echo "ignore-build: no base commit available, building"
  exit 1
fi

if git diff --quiet "$BASE" HEAD -- "${INPUTS[@]}" 2>/dev/null; then
  echo "ignore-build: no build input changed between ${BASE} and HEAD, skipping"
  exit 0
fi

echo "ignore-build: build inputs changed since ${BASE}:"
git diff --name-only "$BASE" HEAD -- "${INPUTS[@]}" | head -20
exit 1
