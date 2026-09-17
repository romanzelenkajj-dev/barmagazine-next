# After task 41: make Google recrawl the 1,360 profiles, and find the ones the rewrite cannot help

## 1. Bump the sitemap signal
src/app/api/sitemap-bars/route.ts line ~31 still reads
`const PROFILE_TEMPLATE_CHANGED_AT = '2026-09-14T19:36:00-07:00'; // deploy of b1b306b`
Set it to the deploy timestamp of the task 41 rewrite (commit 25aefaa and its three follow-ups), so every profile's lastmod moves and Google treats all 1,360 as changed. Verify in the served sitemap that profile lastmods reflect the new date. Do not request indexing for them; the manual quota is about ten a day.

## 2. Find the profiles the new template cannot help
The new description is assembled from address and hours. Beogradski Koktel Klub is live as just "Beogradski Koktel Klub, Belgrade | BarMagazine" with no description content, because the row has neither, and that page had 123 impressions at position 6.3 last week with zero clicks.

Count and list active bars whose new meta description comes out shorter than about 80 characters, or that have no address, or no hours. Sort by how many impressions they got in the week of Sept 8 to 14 if you can join to the GSC export Roman provided; otherwise sort by whether they appear in the 65 zero-click list from task 41. That list is the enrichment queue: filling address and hours on those rows is worth more than any further template work.

## 3. Indexing queue
Add the 65 zero-click pages from task 41 to claude/indexing-queue.json so the daily 16:30 run works through them at ten a day, ahead of the usual new-profile backlog.

Report: the new timestamp and a sample of sitemap lastmods, the count and list of data-poor profiles ranked by search demand, and confirmation that the indexing queue is ordered as above.
