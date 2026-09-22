# Task 98: the map opens on the filtered city

**Merged, PR #72.** Roman checked both paths on the preview first.

---

# The prescribed fix did not work, and that mattered

The task named a cause and a fix. I implemented it, forced a London IP to reproduce, and
**the map still opened on London** with the filter set to another city. So the diagnosis was
wrong, not the implementation.

The real cause was one step earlier, in how `BarDirectoryMap` chooses its opening centre. The
geolocated position was winning over the active filter because the filter was never consulted
at that point at all. The map was not ignoring the city; it had no idea a city had been
chosen.

The fix is the priority order, in `src/components/BarDirectoryMap.tsx`:

```ts
const filterCenter = hasLocationFilter ? barsCenter : null;
const initialCenter: [number, number] = filterCenter ? filterCenter
  : activeCityCoords ? activeCityCoords : ... ;
const initialZoom = filterCenter ? barsZoom : activeCityCoords ? 11 : ...;
```

**The centre comes from the bars in the filter, not from a city lookup table.** That is the
part worth keeping: a filter that returns bars always has a defensible centre, even for a city
the table has never heard of, and the zoom follows the same bounds rather than a fixed 11.

---

# A second path, found while reproducing the first

My first reproduction used the **country** dropdown rather than the city one and still showed
the bug. Macau is both a city and a country in the data, which is what made it visible.

Both dropdowns set a location filter, so both are fixed by the same change, but I would not
have known the country path existed if the first attempt had not accidentally used it. Roman
confirmed both paths on the preview before merging.

---

# Gate

`npm run verify`: tests passed, build clean.

---

*Written after the fact. The work and the merge happened on 2026-09-21; the report file was
missed at the time and reconstructed here so the reports directory matches the done queue.*
