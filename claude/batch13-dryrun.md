# Batch 13 dry-run - US wave 4, three lanes (NOTHING SENT, NOT ARMED)

Target window per Roman: Wednesday 2026-09-16 09:00 PT, one runner firing the
three lanes in sequence, each under its own batch label. Standard upsell
template (send-upsell.mjs), net-preflight, opt-out list, corporate guard,
parked list, and the new claimed-bar guard (owner_id on file = not sent).
Dry-runs below are the script's own output; every row is currently
unclaimed and none has a sent-log entry.

Arming awaits Roman's eyeball of this report.

## LANE 1 - batch13-phoenix - 10 ready

The ten harvested Phoenix addresses; Coabana excluded as form-only (the
script also skips it: no email on file).

| bar | email | flag |
|---|---|---|
| bar-1912 | info@1912phx.com | |
| barcoa-agaveria | hola@barcoaphx.com | |
| bitter-and-twisted | info@bitterandtwistedaz.com | info@ from the venue's own site source (the precedent) |
| century-grand | events@bartershake.com | operator inbox: Barter & Shake runs Century Grand, and the harvest found no venue-domain address. EYEBALL: operator-named events@ rather than a venue mailbox |
| don-woods-say-when | reservations@riseuptownhotel.com | EYEBALL: a hotel's general reservations inbox, the same class the-cruise-room was PARKED for in wave 1. Harvested by Roman, so listed as ready, but the precedent says park |
| highball-phoenix | info@highballphx.com | |
| killer-whale-sex-club | info@killerwhalesexclub.com | |
| little-rituals | info@littleritualsbar.com | |
| pretty-penny | PrettyPenny@InTasteWeTrust.com | venue-named mailbox on the operator's domain (In Taste We Trust), the Wildhawk/PlumpJack precedent |
| upstairs-at-flint | hello@flintbybaltaire.com | host-venue inbox: the bar operates inside Flint (the Cloak & Petal precedent) |

## LANE 2 - batch13-nashville - 6 ready, 2 parked

| bar | email | flag |
|---|---|---|
| the-patterson-house | Info@ThePattersonNashville.com | |
| old-glory | info@oldglorynashville.com | |
| tiger-bar | tigerbarnashville@gmail.com | venue-named gmail |
| bastion | info@bastionnashville.com | |
| pearl-diver | pearldiverbar@gmail.com | venue-named gmail |
| attaboy-nashville | info@attaboynashville.com | |

Parked (now in outreach/parked.txt, the script prints PARKED for both):
the-fox-bar-cocktail-club (press@ only), four-walls (the Joseph's general
inbox only).

## LANE 3 - batch13-metro1 - 12 ready, 4 parked, 4 no email

The wave 1 file's sendable rows, honoring parked.txt.

| bar | city | email | flag |
|---|---|---|---|
| double-fun | Chicago | hello@doublefunchicago.com | |
| friends-of-friends | Chicago | info@fofchicago.com | Heisler Hospitality operator, but venue-specific address on the venue's own domain: KEEP per the CH Projects / Alt Strategies precedent |
| moneygun | Chicago | info@moneygunchicago.com | |
| sportsmans-club | Chicago | info@drinkingandgathering.com | Heisler, venue's own domain: KEEP, same precedent |
| junebug | New Orleans | hello@junebugnola.com | |
| the-elysian-bar | New Orleans | info@hotelpeterandpaul.com | EYEBALL (as the wave 1 file asked): single boutique property inbox on the bar's own listed domain, DUKES/Widder/Sanders precedent |
| holiday | Austin | hello@holidayon7th.com | |
| lady-jane | Denver | info@ladyjanedenver.com | |
| the-peach-crease-club | Denver | howdy@peachcreaseclub.com | |
| eleven11 | Nashville | info@eleven11nashville.com | |
| white-limozeen | Nashville | info@whitelimozeennash.com | displayed address used, not the underlying mailto (per the file) |
| midnight-rambler | Dallas | info@midnightramblerbar.com | info@ in the venue's own JSON-LD, Bitter & Twisted precedent |

Parked (script prints PARKED): bar-tre-dita, the-sazerac-bar,
the-cruise-room, catbird. No email on file (script prints SKIP):
charis-listening-bar, chandelier-bar, the-roost-bar, bar-fino.

## Totals

28 emails across three labels: 10 + 6 + 12. Two rows carry an EYEBALL
flag on the address class (don-woods-say-when, the-elysian-bar) and one on
the mailbox name (century-grand). Zero guard hits beyond the intended
parks and skips.

## NOT DONE PENDING APPROVAL
- Nothing armed for the Wednesday 09:00 window.
- No bars.email writes; every address above is already on its row.
