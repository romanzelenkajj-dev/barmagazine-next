# Batch 12 dry-run - California two lanes (NOTHING SENT, NOT ARMED)

Pool: 50 active bars in San Diego / Los Angeles / San Francisco.
Target window per Roman: Friday 2026-09-11 09:00 PT (after wave 3b's 06:30 Europe send). Arming awaits approval of this report.

## LANE A - fresh sends (batch12-ca-fresh) - 1 ready, 3 pending a ruling, 13 parked/unreachable

17 bars never contacted. Every on-file email in this pool is a group or agency inbox (5x CH Projects, 4x Alt Strategies); all 16 with websites were harvested for venue-specific mailboxes (two-pass + curl retry for 308-redirect sites).

### Ready to send (1)
| bar | city | email | flag |
|---|---|---|---|
| big-bar | Los Angeles | info@alcovecafe.com | venue-adjacent inbox: Big Bar is Alcove Cafe's bar, same operation and site |

### Pending Roman's ruling: extend the CH venue-specific rule to Alt Strategies bars? (3)
Venue-specific addresses ARE published on these bars' own sites; only the agency address is on file today:
| bar | city | venue-specific address found |
|---|---|---|
| georges-at-the-cove-level2 | San Diego | info@georgesatthecove.com |
| shibuya-nights-at-cloak-petal | San Diego | info@cloakandpetal.com |
| the-smoking-gun | San Diego | randy@thesmokinggunsd.com |

### Parked (per rules)
- **CH Projects, all five** (noble-experiment, raised-by-wolves, young-blood, false-idol, polite-provisions): their own sites publish NO email at all - every contact funnels through the group's forms. Per Roman's rule ("if a bar's only published contact is the ch-projects domain, park that bar"), all five park. The group inbox stays guarded.
- **fonda-del-barrio**: only published contact is mark@altstrategies.com - agency-only, parked.
- **death-co-los-angeles**: form-only group site (deathandcompany.com); the DC location was already contacted in batch 8 with no reply. No venue-specific address published.
- **good-enough-cocktail-club**: no website on file - unharvestable.

### No published email (form/Instagram only)
bar-next-door, bar-lis, happy-medium, dan-sung-sa, tiki-ti

## LANE B - photo nudge (batch12-ca-photo-nudge) - 22 eligible, 12 recommended

New script scripts/send-photo-nudge.mjs: Roman's copy verbatim, wordmark band, standard opt-out footer, per-campaign duplicate guard (one nudge per bar ever; prior upsell contact does not block), same corporate + opt-out guards with no bypasses. Dry-run: 22/22 pass guards.

### Recommend holding (10): contacted only 2 days ago
bar-benjamin, bar-flores, spare-room, the-normandie-club, the-roger-room (LA), convoy-music-bar (SD), alchemist-bar-lounge, bar-iris, blindpig-speakeasy-lounge, bourbon-branch (SF) - all batch10-us-harvest, sent 2026-09-08. The copy opens "A few weeks ago we listed..." - for these it has been 48 hours. Suggest they roll into a later nudge wave.

### Recommended send (12) - contacted Aug 31 / Sep 2 (8-10 days ago)
| bar | city | email | first contact | flag |
|---|---|---|---|---|
| the-whaling-bar | San Diego | concierge@whalingbarlj.com | batch8 Sep 2 | |
| realm-of-the-52-remedies | San Diego | 52remedies@commontheorysd.com | batch8 Sep 2 | |
| abv | San Francisco | info@abvsf.com | batch8 Sep 2 | |
| bar-shoji | San Francisco | hello@shojisf.com | batch8 Sep 2 | FLAG: they DID respond - started a claim Sep 4 that expired unfinished. Nudge doubles as re-engagement, but "never replied" is not strictly true |
| bar-sprezzatura | San Francisco | press@barsprezzatura.com | batch8 Sep 2 | press@ mailbox |
| buena-vista-cafe | San Francisco | thebuenavista@comcast.net | batch8 Sep 2 | |
| jilli | San Francisco | jilli.sf25@gmail.com | batch8 Sep 2 | |
| pacific-cocktail-haven | San Francisco | info@pacificcocktailsf.com | batch8 Sep 2 | |
| smugglers-cove | San Francisco | info@smugglerscovesf.com | batch8 Sep 2 | |
| tommy-s | San Francisco | host@tommysmexican.com | batch-4 Aug 31 | |
| trick-dog | San Francisco | info@trickdogbar.com | batch8 Sep 2 | |
| wildhawk | San Francisco | wildhawk@plumpjack.com | batch-4 Aug 31 | venue-named mailbox on PlumpJack group domain |

Copy note: even for the 12, first contact was 8-10 days ago, not quite "a few weeks" - flagging the phrase for Roman's judgment ("last week"/"recently" would be literally true).

## NOT DONE PENDING APPROVAL
- No emails written to bars.email (big-bar + any Alt approvals would need writes)
- Nothing armed for the Friday 09:00 window
- Wave 3b (Europe, 42 bars) fires separately tomorrow 06:30 PT via launchd
