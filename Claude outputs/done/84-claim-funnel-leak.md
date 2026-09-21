# The claim funnel is leaking 94% of the owners we paid to get there

Vercel Analytics, last 7 days, 250 paths, **1,892 visitors / 2,861 pageviews**. Raw list
is in `Claude outputs/gsc-2026-09-19/vercel-7d-pages.txt`. This is behaviour, not
impressions, and it says something the Search Console work of 2026-09-19 could not see.

## First, the proportion, because it reframes tasks 80 to 83

Search Console: **346 clicks** in the same 7 days. Vercel: **1,892 visitors**. So organic
search is roughly **18% of traffic**. The other 82% is the outreach emails, direct and
referral. Everything in tasks 80 to 83 is real and worth doing, because search is the part
that compounds without sending another email. But it is 18%, and this file is about a
bigger number that nobody has measured.

## Traffic by page type, 7 days

| Bucket | Paths | Visitors | % | Pageviews | pv/visitor |
|---|---|---|---|---|---|
| bar profile | 82 | 349 | 18.4% | 551 | 1.58 |
| `/best-bars/<city>` | 54 | 348 | 18.4% | 486 | 1.40 |
| editorial article | 35 | 340 | 18.0% | 444 | 1.31 |
| **owner funnel** | 6 | **268** | **14.2%** | 353 | 1.32 |
| `/best-bars/<city>/<type>` | 34 | 175 | 9.2% | 267 | 1.53 |
| homepage | 1 | 127 | 6.7% | 207 | 1.63 |
| `/bars` + `/search` | 2 | 94 | 5.0% | 267 | **2.84** |
| `/bars/city/` + `/bars/country/` | 24 | 83 | 4.4% | 144 | 1.73 |
| category | 5 | 72 | 3.8% | 85 | 1.18 |

## The funnel, and it is the headline

| Step | Visitors |
|---|---|
| `/claim-your-bar` | **176** |
| `/claim-your-bar/verify` | **34** |
| `/owner-dashboard` | **11** |
| `/owner-dashboard/auth/callback` | 2 |

**176 bar owners arrived and 11 reached a dashboard.** 19% get from the claim page to
verify; 6% get all the way.

Two caveats on that 6%, so you do not chase a number that is sharper than the data. The 11
dashboard visitors include **existing owners** signing in to edit, not only new claimants, so
the true completion rate for new claims is at or below 6%, not above. And batch 14 fired on
Thursday 09-17, so the 176 is a post-send spike rather than a steady week. Neither changes
the shape: the leak is real and large. They change how precisely you should quote it. `/claim-your-bar` is the single most visited page on the site,
ahead of the homepage, because the outreach emails point there. Every one of those 176 is a
bar owner we spent an email to reach.

Separately, `/feature-your-bar` had **36 visitors** and `/add-your-bar` had 9.

**Diagnose this before changing anything.** I do not know where the 142 go and neither do
you. Candidates worth checking, in the order I would check them:

1. **Do they ever submit?** Count `bar_claims` rows created in the last 7 days against 176.
   If claims were created and verification never happened, the leak is the email. If claims
   were never created, the leak is the page.
2. **Expired and abandoned claims.** The hourly sweep expires `awaiting_verification` after
   24h. How many fired in 7 days? Each one is an owner who started and did not finish.
3. **The email step.** A claim email that lands in spam, or whose button fails in a client
   we have not tested, looks exactly like this. Roundcube and Outlook were fixed in
   September; check what is being delivered now and whether anything bounced.
4. **The page itself.** Does the typeahead find their bar? A bar owner who searches their
   own name and gets nothing leaves. Test with real bars that have accented names, pipes in
   the name, or a city in the name.
5. **Mobile.** 390px, the whole flow, on a real viewport. Most of these people open an
   email on a phone.

Report what you find before proposing a fix. Do not redesign the page on a guess: a 6%
funnel could be one broken button or five separate small things, and those need different
answers.

## Owners are visiting their listing repeatedly and not claiming it

Pageviews per visitor, where a handful of people loaded the same page many times:

| Page | Visitors | Pageviews | pv/visitor |
|---|---|---|---|
| `/bars/bitter-and-twisted` | 4 | 32 | **8.0** |
| `/bars/pretty-penny` | 3 | 17 | 5.7 |
| `/bars/holiday` | 4 | 21 | 5.2 |
| `/bars/the-sackville-lounge` | 1 | 9 | 9.0 |
| `/bars/aldea` | 1 | 7 | 7.0 |

Bitter & Twisted, Pretty Penny and Highball are Phoenix bars that got an outreach email.
This is high intent with no conversion, and the same story as the funnel above. Cross-check
these slugs against `bar_claims` and against the outreach send log: if they were emailed,
opened their page five times and never claimed, that is the most useful sample of the leak
we will get. Name them in the report.

## A 404 catching real people

**`/ZmVhdHVyZS` had 4 visitors.** That string is base64 for `feature`. Something is emitting
a base64-encoded path instead of a URL, and four people followed it. Find the source: grep
the repo and the email templates for base64 encoding near a feature link, and check the
`send-upsell` and claim email templates. It is small, but it is a live broken link in
something we are sending.

## Two things that confirm work already queued

**`/best-bars/seoul` had 10 visitors and 17 pageviews with zero Search Console
impressions.** `/best-bars/shanghai` 8 visitors, `/best-bars/taipei` 3. The pages work and
people use them when they reach them internally. Google simply will not rank them. That is
independent confirmation of the H1 collision in task 83 section 1, from a completely
separate data source, and it raises the priority of that fix.

**`/bars` has the highest engagement on the site**, 67 visitors and 226 pageviews, 3.4 per
visitor. The directory is doing its job as a browse surface. Worth remembering before
anyone proposes changing it, and worth noting that its per-city children convert badly in
search for reasons that have nothing to do with how people use `/bars` itself.

## Priority against the other open tasks

This goes above tasks 80 to 83. Those grow the 18%; this one is 176 bar owners a week who
already arrived. It is also diagnosis only, so it costs nothing to look.

## Do not change anything yet

Read-only. No code, no schema, no emails. Report, then Roman decides. This file carries no
approval from him for anything beyond looking.

## Report

The funnel numbers from the database against the 176, what you believe the leak is and what
evidence says so, the named bars from the repeat-visit list and their claim status, the
source of the base64 link, and what you would try first. One recommendation, not a menu.
