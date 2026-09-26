# Task 136, listing check

Status: research done, read-only. The instruction arrived as pasted text, so no row has been changed yet; the edits below run on a typed go.

Evidence: each bar's own site or Instagram where readable, and its Google Business profile (read in Chrome on 2026-09-25). Full URLs and dates: scratch findings.json.

| Bar | Finding | Evidence | Proposed change |
|---|---|---|---|
| American Bonded (Denver) | Open, renamed | bondedbar.com ("Bonded Denver. A Pouring With Heart Bar"), still uses info@americanbonded.com; Instagram @bonded_bar ("Bonded", posts to 2026-09-21); Google Business "Bonded", 2706 Larimer St, website bondedbar.com. Rename around Feb 2025 (web archive). | name "Bonded Denver" as instructed (Google and Instagram say "Bonded"; say if you prefer that), website https://www.bondedbar.com/, instagram bonded_bar, hours Mon 6pm-2am, Tue-Fri 5pm-2am, Sat 3pm-2am, Sun 5pm-2am. Slug stays american-bonded-denver unless you want a new slug with a 301. The row has no description, so nothing to rewrite. |
| The Family Jones Spirit House (Denver) | Closed 1 May 2026 | Google Business: "Permanently closed". thefamilyjones.co is now a bottled-spirits brand site, /tastings/ 404. Westword and Hoodline (April 2026) reported the owners' announcement. | is_active false |
| B&GC (Denver) | Open | bandgcdenver.com is its own site, linked from the Halcyon menu; the hotel advertises a B&GC class on 5 Oct; Instagram @bandgcdenver (posts to 2026-09-24, "7 days a week"). No official hours. | website https://bandgcdenver.com/, instagram bandgcdenver (row has bgcdenver) |
| Better Days (Miami) | Open | Google Business: Cocktail bar, 75 SE 6th St, "Open, closes 5 AM", live popular times, no website listed. betterdaysmiami.com does not resolve; betterdays305.com is an unpublished Wix page; @betterdaysmia dormant since 2017, @betterdays305 now points to the group's other bar. | website cleared (null); keep active; instagram left as is for now (neither handle is clearly current) |
| Daiquiris & Daisies (Boston) | Closed around 1 May 2026 | Google Business: "Permanently closed". Gone from the High Street Place vendor list, its page 404s; Boston Restaurant Talk (11 May) and NBC Boston reported it. | is_active false |
| The Spy Bar (London) | Open | raffles.com/london/dining/ lists it: Tue-Sat 17:00-01:00, invitation only, undercover.london@raffles.com; The OWO /dine/ page still mentions it. Its own page /the-spy-bar now redirects. | website https://www.raffles.com/london/dining/ |
| Bar Tonique (New Orleans) | Open | bartonique.com forwards to the bar's own Adobe Express page: name, 820 N Rampart St, "Open daily 12pm-2am", its own socials; Instagram @bartonique posts to 2026-08-06 (18th anniversary). | none (bartonique.com stays; it is the bar's domain) |

Both closed bars are top10-tier rows. Marking them inactive removes them from their city pages and best-bars lists; Denver and Boston counts are checked after the change.

Also seen in batch 2 research (not part of 136): Snail Bar (Oakland), snailbaroakland.com does not resolve.

## Done (Roman, typed go, 2026-09-25)

Applied through the admin API and read back:
- American Bonded: renamed Bonded Denver; website https://www.bondedbar.com/, instagram bonded_bar, hours Mon 6pm-2am, Tue-Fri 5pm-2am, Sat 3pm-2am, Sun 5pm-2am. Slug unchanged.
- The Family Jones Spirit House: inactive.
- B&GC: website https://bandgcdenver.com/, instagram bandgcdenver.
- Better Days: website cleared, still active.
- Daiquiris & Daisies: inactive.
- The Spy Bar: website https://www.raffles.com/london/dining/.
- Bar Tonique: no change.

### Added by Roman: four more

| Bar | Finding | Evidence | Change |
|---|---|---|---|
| Snail Bar (Oakland) | Open | Google Business: Wine bar, 4935 Shattuck Ave, "Opens 5 PM", Resy booking. snailbaroakland.com is registered to 2027 but has no DNS records, so the site is down. | website cleared |
| No Sleep Club (Singapore) | Closed | Google Business: "Permanently closed". nosleepclub.sg is an expired Squarespace site. | inactive |
| Redacted Basement Drink Parlor (Atlanta) | Open | Google Business: Cocktail bar, 63 Georgia Ave SE, open to 1 AM. The homepage itself reads normally (hours, address, the Reed Street door). The spam sits in its WordPress media library only. | none; the compromised media library is the bar's problem to fix (not contacted) |
| The Bank Bar (Vienna) | Open | Google Business: "The Bank Brasserie & Bar", Park Hyatt Vienna, website restaurant-thebank.at, updated by the business 9 weeks ago. The site blocks scripts (403), not visitors. | none |
