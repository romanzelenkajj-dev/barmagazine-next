#!/bin/bash
# One-shot runner for batch 14 window w2 (armed 2026-09-15 for Thursday
# 2026-09-17, 23:00 PT). Asia and India rows from the enrichment apply.
set -u
REPO="/Users/romanzelenka/barmagazine-next"
LOG="$REPO/outreach/batch14-send.log"
cd "$REPO" || exit 1
echo "=== batch14-asia-enriched w2 live send $(date) ===" >> "$LOG"
/usr/local/bin/node scripts/send-upsell.mjs --send --batch batch14-asia-enriched $(cat outreach/batch14-w2.slugs) >> "$LOG" 2>&1
echo "=== batch14 w2 done $(date) ===" >> "$LOG"
launchctl unload ~/Library/LaunchAgents/com.barmagazine.batch14-w2.plist >> "$LOG" 2>&1; rm -f ~/Library/LaunchAgents/com.barmagazine.batch14-w2.plist
