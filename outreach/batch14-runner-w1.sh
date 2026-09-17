#!/bin/bash
# One-shot runner for batch 14 window w1 (armed 2026-09-15, moved 2026-09-16 on Roman's go to Wednesday
# 2026-09-16, 21:00 PT). Asia and India rows from the enrichment apply.
set -u
REPO="/Users/romanzelenka/barmagazine-next"
LOG="$REPO/outreach/batch14-send.log"
cd "$REPO" || exit 1
echo "=== batch14-asia-enriched w1 live send $(date) ===" >> "$LOG"
/usr/local/bin/node scripts/send-upsell.mjs --send --batch batch14-asia-enriched $(cat outreach/batch14-w1.slugs) >> "$LOG" 2>&1
echo "=== batch14 w1 done $(date) ===" >> "$LOG"
launchctl unload ~/Library/LaunchAgents/com.barmagazine.batch14-w1.plist >> "$LOG" 2>&1; rm -f ~/Library/LaunchAgents/com.barmagazine.batch14-w1.plist
