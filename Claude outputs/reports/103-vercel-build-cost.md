# Task 103: Vercel build cost

**Applied: the Ignored Build Step is live on `main`. Recommended, not changed: the build machine.**

---

# The count

Billing cycle from the Vercel API: **27 August to 27 September**. Deployments in it so far, from
Vercel's own deployment list (not GitHub's), 27 August to 22 September:

| | Deployments |
|---|---|
| Total this cycle | **390** |
| Production | 347 |
| Preview | 43 |
| Failed | 7 |
| Same length of time before the cycle, 8 to 27 August | 80 |

Every deployed commit was classified by the files it touched, in git:

| Commit touched | Deployments | Share |
|---|---|---|
| Only `outreach/`, `Claude outputs/`, `claude/` or docs | **135** | 35% |
| Only `scripts/` (nothing the app imports) | 23 | 6% |
| Nothing at all (an empty merge) | 1 | |
| Something under `src/`, `public/` or a config | 231 | 59% |

**159 of 390 deployments, 41%, rebuilt 832 pages for a change no visitor could see.** The
one-commit-per-file habit is visible in the per-day counts: 71 deployments on 15 September, 51
on the 17th, most of them reports, parked lists and slug files landing one at a time.

# Where the 14x actually came from

Deployments went up about 3.7x per day. The bill went up 14x. The gap is the machine.

| Setting | Value |
|---|---|
| Build machine | **Turbo** (`buildMachineType: "turbo"`, selection fixed) |
| Elastic concurrency | on |
| Node | 24.x |

Turbo is the largest tier Vercel sells, roughly seven times the CPU of Standard, and CPU minutes
are billed by the machine's CPU, not by the clock. The 390 builds took **309 wall-clock minutes
in total, 0.8 minutes each**. On Standard the same builds would have taken longer on the clock
and cost a fraction in CPU minutes. 3.7x more builds on a 7x machine is the 14x.

**Recommendation: Standard.** This site is 832 static pages with no heavy compilation; a build
that takes 50 seconds on Turbo will take a few minutes on Standard, and nothing about the
deploy flow waits on it. I have not changed it: it is a project setting, so it is yours. In the
dashboard it is Project Settings, Build and Deployment, Build Machine; or say the word and I set
it through the API.

# The Ignored Build Step

`vercel.json` now carries `"ignoreCommand": "bash scripts/vercel-ignore-build.sh"`.

The script builds only when a push changed a file under `src/`, `public/`, `next.config.mjs`,
`package.json`, either lockfile, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` or
`vercel.json`. The last four are additions to your list, included because a change to any of
them changes the build output and a silently skipped build there would be a bug, not a saving.
`scripts/` is deliberately not an input: nothing under it is imported by the app.

**One thing about how Vercel compares commits, which matters more now that pushes will be
batched.** Vercel builds the head of a push, not each commit. The usual rule, `git diff HEAD^
HEAD`, looks at only the last commit, so a push carrying a code change under a report commit
would read as clean and never deploy. The script compares against the last deployed commit
instead (`VERCEL_GIT_PREVIOUS_SHA`), falling back to `HEAD^` only when Vercel does not supply
it, and treats any git error as "build". Tested locally against real commit pairs from this
repo, including that exact case: the naive rule said skip, the script said build.

# Expected after

| | Before | After ignore step | After batching too |
|---|---|---|---|
| Deployments that build, per cycle | 390 | ~231 | ~231, fewer skipped records |
| CPU minutes, on Turbo | 17.9K | ~10.6K | ~10.6K |
| CPU minutes, on Standard | | | **roughly 2K to 3K** |

The Standard estimate assumes the same 231 builds at three to four minutes of wall clock on a
four-CPU machine; it is an estimate and the first cycle will correct it. Batching changes the
count of skipped deployment records more than the count of builds, because the ignore step
already stops the noise pushes from building; the standing rule is recorded in memory so it
holds across sessions regardless.

# Verified live

This report was pushed on its own, as a noise-only commit, immediately after the ignore step
went live. Its deployment state is in the chat reply, which is the proof the rule holds on
Vercel and not only on this machine.
