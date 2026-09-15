# Batch 14 dry-run - Asia and India from the enrichment apply (NOTHING SENT, NOT ARMED)

Target: Thursday 2026-09-17, two windows by region, label batch14-asia-enriched.
Pool: the Asia and India rows among the 14 emails stored in the 2026-09-14
enrichment apply. Of the 14, only three are in Asia; the rest are the
Americas, Europe, the Caribbean and Kenya and belong to a later batch.
Standard template, net-preflight, all guards.

Excluded by instruction and by the guards:
- mo-bar-shenzhen: moszn-mobar@mohg.com is in outreach/optout.txt, and mohg
  is in CORPORATE_DOMAINS. The script prints EXCLUDED, opted out, no bypass.
- the-st-regis-bar and vender: addresses deliberately not stored; the
  script prints SKIP, no email on file.
- soka (Bengaluru): the only India row in the apply, and it published no
  email. Not sendable.

## Window 1 - 21:00 PT Thursday (04:00 UTC Friday) - 1

| bar | city | local time at send | email | flag |
|---|---|---|---|---|
| the-hudson-rooms | Hanoi (UTC+7) | 11:00 | hudsonrooms.hanoi@capellahotels.com | venue-named mailbox on the hotel group's domain (Capella). Capella is not in CORPORATE_DOMAINS; the address is venue-specific, the Wildhawk/PlumpJack precedent. EYEBALL |

## Window 2 - 23:00 PT Thursday (06:00 UTC Friday) - 2

| bar | city | local time at send | email | flag |
|---|---|---|---|---|
| smoke-bitters | Hiriketiya, Sri Lanka (UTC+5:30) | 11:30 | smoke.bitters@gmail.com | venue-named gmail; the site says bookings by WhatsApp only, this is the published contact |
| barc | Kathmandu (UTC+5:45) | 11:45 | barc.cocktails@gmail.com | venue-named gmail |

## Totals

3 emails. Small because the enrichment file was mostly outside Asia;
the eleven other stored addresses (missys, alquimico, panda-sons,
library-by-the-sea, lady-bee, mamba-negra, hero-bar, gorilla,
aruba-day-drink, tan-tan, and the Americas/Europe rest) are a separate
batch when Roman wants one.

## NOT DONE PENDING APPROVAL
- Nothing armed for either Thursday window.
- No bars.email writes.
