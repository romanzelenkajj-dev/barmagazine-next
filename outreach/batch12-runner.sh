#!/bin/bash
# One-shot runner for batch 12 California, both lanes (armed 2026-09-10).
# Lane A fresh upsell, then lane B photo nudge, sequentially in one window.
set -u
REPO="/Users/romanzelenka/barmagazine-next"
LOG="$REPO/outreach/batch12-send.log"
cd "$REPO" || exit 1
echo "=== batch12 lane A (fresh) live send $(date) ===" >> "$LOG"
/usr/local/bin/node scripts/send-upsell.mjs --send --batch batch12-ca-fresh $(cat outreach/batch12-laneA.slugs) >> "$LOG" 2>&1
echo "=== batch12 lane B (photo nudge) live send $(date) ===" >> "$LOG"
/usr/local/bin/node scripts/send-photo-nudge.mjs --send --batch batch12-ca-photo-nudge $(cat outreach/batch12-laneB.slugs) >> "$LOG" 2>&1
echo "=== batch12 done $(date) ===" >> "$LOG"
