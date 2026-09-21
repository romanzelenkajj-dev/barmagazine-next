# Report: 11c-revert-edit-notice-recipient (2026-09-15, 15:35 to 15:45 PT)

Done: commit 542c57a, a full git revert of 8b35f93 (changelog in e973ca7). Tests 309/309, build clean, deployed to production and Ready.

## Recipient now in effect

NOTIFICATION_EMAIL, which is romanzelenkajj@gmail.com in Vercel. The notice is the original HTML "Owner edit pending: <Bar> (Info update | Photo upload)" from src/lib/notify.ts, sent immediately on each submission, exactly as before task 15. Nothing was emailed to anyone in this task.

## What the revert removed

- src/lib/owner-edit-notice.ts and its test file, the two test-rig scripts
- the @vercel/functions dependency in package.json and package-lock.json
- the waitUntil and maxDuration = 90 lines in /api/owner/bars and /api/owner/photos, which call notifyOwnerSubmission again
- the plain-text body option in mail.ts and the shared field-label map in owner-fields.ts (the admin review page has its own map again)

The revert was clean; no manual restoration was needed.

## One thing worth knowing

Task 15's commit never reached production. Its deploy failed at install time with ERR_PNPM_OUTDATED_LOCKFILE: Vercel installs this project with pnpm from pnpm-lock.yaml, and the new dependency had been added with npm, so only package-lock.json was updated. So the Gmail recipient was in effect the whole time; the revert restores the source, and the deploy of 542c57a is the first successful production build since 3316bdb (task 14). The 15 report has a note to the same effect.

The one [Test] email that task 15 sent to office@barmagazine.com (Resend id d1418296, 15:30 PT) is the only email that went out today from this work.
