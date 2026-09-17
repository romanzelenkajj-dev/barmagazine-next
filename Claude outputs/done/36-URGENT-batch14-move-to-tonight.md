# URGENT, TIME-SENSITIVE: move batch 14 from Thursday night to TONIGHT (Wednesday 2026-09-16)

Roman confirmed this in chat just now: "Yes, let's move it to tonight." Reason: a Thursday 21:00 PT send lands Friday morning in Asia and India, the weakest day to reach a bar. A Wednesday 21:00 PT send lands Thursday midday in Tokyo and Thursday morning in Mumbai.

It is currently about 19:50 PT on Wednesday 2026-09-16, so the first window is roughly 70 minutes away. Do this first, before anything else in the queue.

1. Unload and remove the two existing agents: ~/Library/LaunchAgents/com.barmagazine.batch14-w1.plist (armed Thu 09-17 21:00) and com.barmagazine.batch14-w2.plist (armed Thu 09-17 23:00).
2. Re-arm both for TONIGHT: w1 at 2026-09-16 21:00 PT, w2 at 2026-09-16 23:00 PT. Same one-shot pattern, same runner scripts (outreach/batch14-runner-w1.sh and -w2.sh, unchanged except the date in their header comment), same self-unload at the end.
3. Verify: `launchctl list | grep barmagazine` shows both loaded, and print each plist's StartCalendarInterval so the date and time are visible in the report.
4. Do not change the slug lists, the batch name (batch14-asia-enriched), the template or the send script. net-preflight still runs inside send-upsell as usual.
5. Report: the two scheduled times as loaded, the recipient counts from outreach/batch14-w1.slugs and -w2.slugs, and a reminder line that the Mac must stay awake and online until about 23:30 PT.

If your guards require Roman's confirmation in chat before arming a live send, ask him in one line and proceed on his yes; he is at the computer and expecting it.
