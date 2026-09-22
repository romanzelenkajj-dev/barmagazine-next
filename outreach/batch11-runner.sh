#!/bin/bash
# One-shot runner for batch 11 Europe waves (armed 2026-09-09).
# Usage: batch11-runner.sh 3a|3b  - fires the live send, logs, and removes
# its own crontab line so it can never fire twice.
set -u
WAVE="$1"
REPO="/Users/romanzelenka/barmagazine-next"
LOG="$REPO/outreach/batch11-send.log"
cd "$REPO" || exit 1
SLUGS=$(cat "outreach/batch11-wave${WAVE}.slugs")
echo "=== batch11-europe-wave${WAVE} live send $(date) ===" >> "$LOG"
/usr/local/bin/node scripts/send-upsell.mjs --send --batch "batch11-europe-wave${WAVE}" $SLUGS >> "$LOG" 2>&1
echo "=== done $(date) ===" >> "$LOG"
crontab -l | grep -v "BM-BATCH11-${WAVE}" | crontab -
