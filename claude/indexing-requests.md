# Daily indexing requests (URL Inspection, Search Console)

Queue: claude/indexing-queue.json (154 not-indexed profiles that are TOP 10 or carry an accolade, TOP 10 first, then by accolade count). Ten requests per day through URL Inspection in Roman's signed-in Chrome; a URL that Inspection already reports as indexed is marked `indexed` and skipped without spending quota. Stop for the day on the quota message; stop entirely, and say so here, if the session is signed out.

| Date | Requested | Skipped (already indexed) | Remaining | Note |
|---|---|---|---|---|
| 2026-09-14 | 1 | 0 | 153 | handshake-speakeasy requested; quota message on the second request (the-baxter-inn), so the day's allowance was already spent before this run; baxter retried tomorrow. Daily job scheduled 09:24 local from 2026-09-15. |
| 2026-09-15 | 0 | 1 | 152 | The 09:24 scheduled run fired (lastRunAt 09:24:33 PT) but changed nothing and logged nothing, most likely blocked on tool-permission prompts; Roman should press Run now once to pre-approve. Manual attempt at 09:50: the-baxter-inn hit Quota Exceeded on the FIRST request of the day; bar-leone found already indexed (skipped, no quota); licoreria-limantour, three-sheets-soho and sip-guzzle inspected and show no request today, so the scheduled run did not spend the quota either. Something outside this queue is consuming the property's daily Request Indexing allowance two days running. |
