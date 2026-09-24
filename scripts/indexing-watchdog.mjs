#!/usr/bin/env node
// Watchdog for the daily Search Console indexing job (task 123, 2026-09-23).
//
// The job itself is a Claude desktop scheduled task (gsc-daily-indexing-requests,
// 16:30 local). It failed silently twice: the run of 15 Sep 09:24 hung on a
// permission prompt, stayed "running", and the scheduler skipped every later
// dispatch with "per_task_limit (active=1, limit=1)". Nothing wrote a log row,
// so nobody saw it for eight days.
//
// This script runs from launchd at 17:30 local (com.barmagazine.indexing-watchdog).
// It checks claude/indexing-requests.md for a row dated today. If there is none
// it appends a MISSED row itself and emails Roman through Resend, quoting the
// scheduler's own log lines for the day so the cause is in the mail.
// It never touches Search Console and never commits or pushes: the row lands in
// the working tree and rides along with the next push from the session.
//
// Usage: node scripts/indexing-watchdog.mjs [--dry-run]
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = '/Users/romanzelenka/barmagazine-next';
const LOG = `${ROOT}/claude/indexing-requests.md`;
const QUEUE = `${ROOT}/claude/indexing-queue.json`;
const APP_LOG = `${process.env.HOME}/Library/Logs/Claude/main.log`;
const OWN_LOG = `${ROOT}/outreach/indexing-watchdog.log`;
const TO = 'office@barmagazine.com';
const FROM = 'BarMagazine watchdog <office@barmagazine.com>';
const DRY = process.argv.includes('--dry-run');

for (const f of ['.env.vercel', '.env.local']) {
  const p = `${ROOT}/${f}`;
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

const now = new Date();
const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
const stamp = now.toISOString();
const note = (s) => { const line = `${stamp} ${s}\n`; process.stdout.write(line); if (!DRY) appendFileSync(OWN_LOG, line); };

const log = readFileSync(LOG, 'utf8');
if (log.split('\n').some(l => l.startsWith(`| ${today} |`))) {
  note(`ok: a log row for ${today} exists`);
  process.exit(0);
}

// No row today. Gather what the desktop scheduler said.
let schedulerLines = [];
try {
  const text = execSync(`grep -h "CCDScheduledTasks" "${APP_LOG}" | grep "${today}" | tail -400`, { encoding: 'utf8' });
  schedulerLines = text.split('\n').filter(Boolean);
} catch { /* no lines is a finding in itself */ }
const skips = schedulerLines.filter(l => /Skipping dispatch for gsc-daily-indexing-requests/.test(l));
const others = schedulerLines.filter(l => /gsc-daily-indexing-requests/.test(l) && !/Skipping dispatch/.test(l));
let cause;
if (skips.length) cause = `the desktop scheduler skipped the dispatch ${skips.length} time(s) today (${skips[skips.length - 1].replace(/^.*\] /, '')}); a previous run is still counted as running, so stop or archive that session in the sidebar`;
else if (others.length) cause = `scheduler lines today: ${others.slice(-3).map(l => l.replace(/^.*\] /, '')).join(' / ')}`;
else if (!schedulerLines.length) cause = 'no scheduler activity in the desktop log today (the app was closed, asleep, or logging elsewhere)';
else cause = 'the scheduler ran but the job left no row (stuck on a prompt, or the Chrome tools were unavailable)';

let remaining = '?';
try {
  const q = JSON.parse(readFileSync(QUEUE, 'utf8'));
  const items = Array.isArray(q) ? q : q.items;
  remaining = items.filter(i => i.status === 'pending' || i.status === 'quota').length;
} catch { /* leave ? */ }

const row = `| ${today} | 0 | 0 | ${remaining} | MISSED: no run logged by 17:30 local. Watchdog (scripts/indexing-watchdog.mjs) wrote this row and emailed ${TO}. Likely cause: ${cause}. |`;
note(`missed run: ${cause}`);
if (!DRY) writeFileSync(LOG, log.replace(/\n*$/, '\n') + row + '\n');

const key = process.env.RESEND_API_KEY;
if (!key) { note('no RESEND_API_KEY, row written but no email sent'); process.exit(2); }
const subject = `Indexing job did not run today (${today})`;
const body = [
  `The daily Search Console indexing job left no log row for ${today}.`,
  '',
  `Likely cause: ${cause}.`,
  '',
  skips.length ? 'If a previous run is still counted as running: open the Claude desktop sidebar, find the session "Daily Search Console indexing requests (barmagazine)", stop it, then archive it. The next dispatch then goes through. Clicking "Run now" on the scheduled task once, and approving its tool prompts, stores those approvals for future runs.' : 'Check the Claude desktop app is open and signed in at 16:30, and that Chrome is signed in to Search Console.',
  '',
  `Queue: ${remaining} pages still pending.`,
  `Row appended to claude/indexing-requests.md (uncommitted, in the working tree).`,
  '',
  schedulerLines.length ? `Scheduler log, last lines:\n${schedulerLines.slice(-5).join('\n')}` : 'Scheduler log: no lines today.',
].join('\n');
if (DRY) { note(`dry run: would email ${TO}: ${subject}`); process.exit(0); }
const r = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ from: FROM, to: [TO], subject, text: body }),
});
note(r.ok ? `emailed ${TO}` : `email failed: ${r.status} ${await r.text()}`);
process.exit(r.ok ? 0 : 3);
