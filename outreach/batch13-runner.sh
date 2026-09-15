#!/bin/bash
# One-shot runner for batch 13, US wave 4, three lanes (armed 2026-09-15 for
# Wednesday 2026-09-16 09:00 PT). Sequential in one window, each lane under
# its own batch label. send-upsell.mjs runs net-preflight, the opt-out,
# corporate, parked and claimed guards itself. The plist is removed after
# the send by the last line, so a re-load cannot fire it twice.
set -u
REPO="/Users/romanzelenka/barmagazine-next"
LOG="$REPO/outreach/batch13-send.log"
cd "$REPO" || exit 1
for lane in phoenix nashville metro1; do
  echo "=== batch13-$lane live send $(date) ===" >> "$LOG"
  /usr/local/bin/node scripts/send-upsell.mjs --send --batch "batch13-$lane" $(cat "outreach/batch13-$lane.slugs") >> "$LOG" 2>&1
done
echo "=== batch13 done $(date) ===" >> "$LOG"
launchctl unload ~/Library/LaunchAgents/com.barmagazine.batch13.plist >> "$LOG" 2>&1; rm -f ~/Library/LaunchAgents/com.barmagazine.batch13.plist
