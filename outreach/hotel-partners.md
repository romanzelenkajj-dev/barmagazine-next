# Hotel partner tracker

One entry per GROUP, not per bar. That is the whole point of the file: a chain with nine bars
in the directory is one conversation with one company, not nine cold emails that all land in
the same corporate mailbox.

How this differs from the two files next to it:

- `parked.txt` is per bar, and records why an individual bar is not being mailed.
- `optout.txt` is per address, and is a promise to the recipient that cannot be reversed.
- **this file is per group**, and is a list of relationships worth having.

A group here should also appear in `CORPORATE_DOMAINS` in `scripts/send-upsell.mjs`, which is
the hard guard that stops any of its bars being swept into a blast. Being in this file is the
intent; being in that list is the enforcement. Check both.

---

## Four Seasons

**Added 2026-09-21 (Roman, task 99). 9 bars, one relationship.**

Found by the pass 2 harvest: **`guest.historian@fourseasons.com` is the only published address
for eight different Four Seasons bars on four continents**, and a ninth publishes only the
group's `info@`. Not one of the nine lists an address of its own. A single global alias
standing in for nine venues is the clearest possible signal that these are not nine prospects.

| Bar | City | Published address |
|---|---|---|
| Avra Bar | Athens, Greece | guest.historian@fourseasons.com |
| Caprice Bar | Hong Kong | guest.historian@fourseasons.com |
| Nautilus Bar | Jakarta, Indonesia | guest.historian@fourseasons.com |
| Bar Trigona | Kuala Lumpur, Malaysia | guest.historian@fourseasons.com |
| Fifty Mils | Mexico City, Mexico | guest.historian@fourseasons.com |
| One-Ninety Bar | Singapore | guest.historian@fourseasons.com |
| Charles H | Seoul, South Korea | guest.historian@fourseasons.com |
| BKK Social Club | Bangkok, Thailand | guest.historian@fourseasons.com |
| Saikindō | Abu Dhabi, UAE | info@fourseasons.com |

**Note the count.** The instruction said eight, which is the number sharing the
`guest.historian` alias. Saikindō is a ninth Four Seasons bar in the directory, reachable only
through the group's general inbox, so it belongs to the same relationship.

Status: **no approach made.** All nine are parked, and `fourseasons` is already in
`CORPORATE_DOMAINS`, so none of them can be swept into a batch by accident.

---

## Alt Strategies (San Diego agency): CLOSED

**Closed 2026-09-22 (Roman).** Mark Rogoff's hospitality agency represents several San Diego
venues. Outcome of the relationship: **they added photos to their bars' listings and declined
Featured.** No further outreach of any kind, including the photo nudge.

| Bar | Address on file | Contacted |
|---|---|---|
| Fonda del Barrio | mark@altstrategies.com | never; the only address is the agency's |
| Georges at the Cove | info@georgesatthecove.com | yes, earlier batch |
| Cloak & Petal (Shibuya Nights) | info@cloakandpetal.com | yes, earlier batch |
| The Smoking Gun | randy@thesmokinggunsd.com | yes, earlier batch |

All four parked with the reason "Alt Strategies, no further outreach". `altstrategies` is
already in `CORPORATE_DOMAINS`, which only covered the first; the other three use their own
domains, which is why parked.txt rather than the send guard is what closes this.

---

## Groups parked but not yet tracked as relationships

These have bars in the directory reachable only through a group inbox. They are parked and
guarded, but nobody has decided whether any is worth a conversation. Listed so the decision is
visible rather than implied.

Mandarin Oriental (5 bars; **declined the partnership 2026-09-14**, address in `optout.txt`),
Ritz-Carlton (4), Rosewood (5, already on the partner track in `CORPORATE_DOMAINS`),
Rocco Forte (3), Capella (2), Marriott and its brands (W, St Regis, Edition, Four Points,
Sheraton, Westin), Hilton and Waldorf Astoria, Hyatt and Andaz, IHG, Kempinski (2), Taj,
The Leela, Raffles, Bulgari, Pestana, Tugu, Shangri-La, Sukhothai, Accor, NH Hotels,
Morgans Originals, The Social Hub, Oberoi, Union Group Jakarta (2), CH Projects (5 San Diego
bars behind one inbox), Jose Andres group, Farmily Group.
