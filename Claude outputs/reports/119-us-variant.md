# Task 119: US variant of the upsell email, A/B on batch 20. Test approved, ARMED, 2026-09-23

## The variant

`scripts/send-upsell.mjs` gained `--variant auto|old|us` (default auto). Auto picks the US variant
for a United States bar whose city has a live /best-bars page and the directory template for
everyone else. The city page and its bar count come from the live site: the bar's own profile
links to the city guide it belongs to (metro rollups included), and that page's ItemList JSON-LD
carries `numberOfItems`, the number its H1 shows. Any failure on that path reads as "no city
page" and the bar gets the old template, never a wrong number.

Copy as given. The photo paragraph renders only when `photos` is empty. Same machinery: Resend,
the bulletproof VML button, RFC 8058 one-click unsubscribe headers, the sent-log guard, the
corporate and opt-out screens. Subject: "[Bar] is on our Best Bars in [City] page".

Footer rule, both templates: US bars get "BarMagazine LLC, 6605 Agave Circle, Carlsbad, CA 92011.
Publisher of barmagazine.com."; every other country keeps PRO PUBLISHING s.r.o., Bratislava. The
directory template's count is now 1,700+ (HTML and plain text).

## Test send

Lazy Tiger, St. Louis (US, no photo, 5 bars on /best-bars/st-louis) sent to romanzelenkajj@gmail.com
with `--to`, Resend id 01a0cfd8-c0d9-7633-88f7-503f1a6ae5a6. Not sent to the bar, not in the
sent-log (the --to path never records). The rendered HTML was also posted in chat.

## The split (files written, NOTHING re-armed)

`scripts/ab-split.mjs outreach/batch20-americas.slugs batch20-americas`: 54 US bars shuffled with a
seed (reproducible) into 27 A and 27 B; the three Santiago bars ride with A and are excluded from
the comparison.

- A, `outreach/batch20-americas-a.slugs` (30): directory template, `--variant old --batch batch20-americas`.
- B, `outreach/batch20-americas-b.slugs` (27): `--variant us --batch batch20-americas`. The sender
  logs each bar under the template it actually got: `batch20-americas-us` for the variant, the
  plain label for a fallback. One B bar falls back: Alley Twenty Six, Durham has no best-bars
  page, so it gets the old template and counts in A.

Dry runs of both halves posted in chat: A 30 to send, all [old]; B 27 to send, 26 [us] with the
city page and count for each, 1 [old].

`scripts/ab-report.mjs batch20-americas` reports per arm, US bars only: sent, claimed (owner set
or claimed_at on or after the send date), photo added (profile now carries a photo, whatever the
route). Empty today.

`outreach/arm-window.sh` now passes anything after the slugs file to the sender, so the two arms
arm as two windows:

    outreach/arm-window.sh batch20-americas w1 09 29 09 00 outreach/batch20-americas-a.slugs --variant old
    outreach/arm-window.sh batch20-americas w2 09 29 09 05 outreach/batch20-americas-b.slugs --variant us

The full-list one-shot armed earlier today (`com.barmagazine.batch20-americas-w1`, old template,
57 bars) is STILL LOADED and must be unloaded before the two arms are armed, or the whole batch
goes out under the old template at 09:00 and the arms find everything already sent. Waiting for
Roman's OK on the test send and the split before touching it.

## Armed (Roman's go in chat, 2026-09-23 afternoon)

Resend reported the test as delivered; Roman found it in Gmail's Promotions tab and approved.

The full-list one-shot (`com.barmagazine.batch20-americas-w1`, 57 bars, old template) was booted
out and its plist deleted first. Then:

- `com.barmagazine.batch20-americas-w1`: Tuesday 2026-09-29 09:00 PT, 30 recipients,
  `--variant old --batch batch20-americas`, outreach/batch20-americas-a.slugs.
- `com.barmagazine.batch20-americas-w2`: Tuesday 2026-09-29 09:05 PT, 27 recipients,
  `--variant us --batch batch20-americas`, outreach/batch20-americas-b.slugs.

Both runners carry the retry loop (three attempts, 10 then 30 minutes apart) and delete their plist
before unloading. `launchctl list` shows both loaded. After the send, `node scripts/ab-report.mjs
batch20-americas` gives claims and photos per arm.
