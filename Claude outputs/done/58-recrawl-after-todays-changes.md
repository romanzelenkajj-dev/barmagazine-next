# Tell Google what changed today, without wasting crawl budget

Today changed four things that matter to search, and they need different treatment. Do not mass-request anything.

## 1. The best-bars city pages, the real priority

Task 53 retitled roughly 70 of them, "The 23 Best Bars in London (2026)" and so on, and changed which bars they list. Those are our highest-intent pages and the change is in the title tag, which is what Google shows.

Bump their `lastmod` in the sitemap the same way `PROFILE_TEMPLATE_CHANGED_AT` drives profile lastmod: one constant, set to today, so every best-bars city page reports as modified. Check whether the city and type routes even carry a lastmod today, and if they do not, that is the actual fix.

## 2. The 67 noindex type pages

Nothing to request. A page carrying `noindex` needs to be crawled to be dropped, and requesting indexing on it is contradictory. Leave them to the normal crawl, and confirm they are out of the sitemap so nothing keeps pointing Google at them.

## 3. The profiles

Leave them alone. Task 46 already pushed the recrawl this morning after the title rewrite, and re-requesting the same URLs a few hours later does not make Google move faster. Check that `PROFILE_TEMPLATE_CHANGED_AT` was in fact bumped this morning and report the date it holds.

## 4. The 210 bars added Tuesday and today

New URLs in the sitemap are the right mechanism and they are already there. Confirm every one of them is in `sitemap-bars` and that none is excluded by a thin-page rule it should not be caught by.

## Report

Which surfaces carry a lastmod and which do not, the value `PROFILE_TEMPLATE_CHANGED_AT` holds, the count of URLs in each sitemap before and after, and confirmation that no noindex URL is still listed.

Then the ten URLs Roman should spend tomorrow's manual GSC quota on, ranked, with the reason for each.
