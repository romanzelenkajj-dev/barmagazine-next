# Task 124: home grid hydration mismatch

Status: preview ready, not merged. Draft PR #87 on `preview/124-home-grid-hydration`.
PR: https://github.com/romanzelenkajj-dev/barmagazine-next/pull/87
Preview: https://barmagazine-next-git-previ-47f39c-romanzelenkajj-7135s-projects.vercel.app

## Cause

The home category grid turned WordPress excerpts into text with a function that behaved differently on the two sides. In the browser it decoded entities with a DOM span, so `&#8217;` became a curly apostrophe. On the server there is no DOM, so a short replace list turned the same entity into a straight one. React compared "Martiny's" with "Martiny’s" and logged "Text content does not match server-rendered HTML" for every card whose excerpt held an entity, then re-rendered the whole document on the client.

## Fix

One pure decoder, `src/lib/html-text.ts`, used by the grid on both sides: strips tags, decodes decimal, hex and the common named entities without a DOM, straightens typographic quotes the way card titles already are, collapses whitespace. Same input, same output, wherever it runs. The client-side path used it too, so posts fetched after a category switch come out identical. Six tests in `html-text.test.ts`.

## Checks

- tsc clean, vitest 515 passed, lint unchanged.
- Local home page loaded in a fresh browser tab: no hydration error, only the pre-existing `fetchpriority` warning from an image link. The Martiny's card renders with a straight apostrophe on both sides.

## Seen in passing, not touched

An article card title on the Boadas profile reads "Line in Athens Tops Europe s 50 Best Bars 2026 List": the title path drops the apostrophe entity instead of decoding it. Different code from the grid; worth its own small task.
