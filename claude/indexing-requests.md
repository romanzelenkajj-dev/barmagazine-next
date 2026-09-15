# Daily indexing requests (URL Inspection, Search Console)

Queue: claude/indexing-queue.json (154 not-indexed profiles that are TOP 10 or carry an accolade, TOP 10 first, then by accolade count). Ten requests per day through URL Inspection in Roman's signed-in Chrome; a URL that Inspection already reports as indexed is marked `indexed` and skipped without spending quota. Stop for the day on the quota message; stop entirely, and say so here, if the session is signed out.

| Date | Requested | Skipped (already indexed) | Remaining | Note |
|---|---|---|---|---|
