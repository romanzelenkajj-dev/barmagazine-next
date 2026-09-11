# Opening hours: storage format vs display convention

Since 2026-09-11, `bars.opening_hours` stays free text in house format and
the DISPLAY converts per country at render time. Enrichment keeps writing
house-format strings exactly as before; do not pre-convert for the
country, and never rewrite stored hours to change the clock convention.

## What enrichment writes (unchanged)

Whatever the primary source publishes, in house shape:
`Daily 6pm-2am`, `Mon-Thu 10:00-01:00, Fri-Sun 10:00-02:00`,
`Mon-Sat 18:00-02:00` + newline + `Sun closed`, parenthetical notes
allowed (`Daily 5pm-12am (kitchen until 11pm)`). No hours published means
leave the field empty and note it. Avoid non-house clock shapes like
`18h30` (one legacy row was hand-fixed to `18:30`).

## What display does

`formatHoursForCountry()` in `src/lib/format-hours.ts` (wired on the bar
profile and /best-bars pages) converts unambiguous time tokens only:

- 24-hour rendering for most of the world: `6pm` becomes `18:00`.
- 12-hour (am/pm) for the TWELVE_HOUR_COUNTRIES set in that file:
  United States, United Kingdom, Ireland, Canada, Australia,
  New Zealand, Philippines, India (UK/Ireland confirmed by Roman
  2026-09-11: venues there post their own hours am/pm).
- Day words, punctuation and note text pass through untouched; bare
  integers are never converted; a string with no recognizable time
  tokens renders exactly as stored.

Dry run at rollout: 821 active hours strings, 89.9% handled cleanly
(42.6% converted, 47.3% already in target format), 10.1% no-time strings
("Tue-Sat evenings") rendering as stored, zero partial conversions.

Owner dashboard and admin editors deliberately show the stored string,
not the converted one - what you edit is what is stored.
