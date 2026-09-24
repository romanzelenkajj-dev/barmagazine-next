# Task 129: owner photo upload, one interior photo

Date: 2026-09-24. Status: **merged and live** (PR #88, squashed as 27082ad). Verified on https://barmagazine.com/add-your-bar.

## The question asked first: is there a separate cocktail or signature-serve photo field?

No. There is one photo path for owners and nothing else:

- Every owner upload posts to `/api/owner/photos` as a `photos` field and lands in the bar's `photos` array (stored as a pending `photo_upload` submission until an admin approves it). There is no category, no second field, no signature-serve slot, and nothing named cocktail, drink or serve anywhere in the forms or the columns.
- Free and Top 10 bars are capped at one profile photo; Featured and Premium may upload several, which all go into the same gallery array. That cap is the only distinction the code makes between photos.
- The only other file input in the owner flow is the claim form's proof-of-ownership upload, which takes documents and images of documents, not bar photography.

So there was nowhere for a cocktail photo to belong, which is the heart of the problem: the copy told owners drink photos had a home, and the product has none.

## What the copy said, and why owners sent cocktails

Both upload screens carried the same sentence: "Drink and detail photos belong in the photo gallery, part of Featured." It reads as an invitation with a mild upsell, and it was the only sentence naming drink photos. Aperture sent five photos, five of them drinks. The sentence is now gone from both screens; nothing else in the owner flow invites a drink or cocktail photo.

## What is on the branch

One line above the upload box on all three surfaces, worded identically:

> One photo of your bar's interior: the room or the bar counter with seating, as a guest sees it. No drinks, bottles, logos or people.

Beside it, two small thumbnails: a room with a counter and stools carrying a green tick and the caption "Yes: the room", and a crossed-out cocktail glass carrying a red cross and "No: drinks".

| Surface | Where the line sits |
|---|---|
| /owner-dashboard/edit/[slug], Photos section | directly above the upload box; the old note below it is removed, the Featured gallery upsell stays |
| /add-your-bar, Interior Photo section | replaces the old hint; the file-format line is reduced to "JPG, PNG or WebP, max 5MB." |
| Claim confirmation email | a tinted block after the paragraph about keeping details up to date, thumbnails in a table so it survives Outlook |

The thumbnails are drawn line art in `public/photo-guide`, not photographs of a real bar. An example that shows someone else's room invites a copy of it, and it would have needed its own licence under the photo policy.

The wording lives once in `src/components/PhotoRuleNote.tsx` for the two screens, and is repeated in the email string, which a component cannot reach. `src/lib/owner-photo-rule.test.ts` asserts the three surfaces carry the same sentence and both examples, and fails if any owner surface invites a drink photo again.

## Checks

- tsc clean, lint clean, vitest 532 passed (4 new).
- Local, 1280 px: the rule sits above the upload box (1276 px against 1583 px), both thumbnails load at 80 by 60, captions in green and red, no horizontal overflow.
- Local, 375 px: the line wraps above the thumbnails, which stay side by side, no overflow.
- The claim email was rendered from the real template and read in the browser: block, wording and captions correct.

## Changes after Roman's review, before the merge

- The format line above the upload box on add-your-bar was a duplicate of the dropzone's own; it is gone and the dropzone keeps its "JPG, PNG, or WebP, Max 5MB".
- "Not sure? Start with Free — you can upgrade anytime" now ends in a period, as does "is already listed in our directory — pick a plan" on the same page. Both carried the em dash as a `\u2014` escape, which is why the em-dash test never saw them; the test reads source lines and matches the literal character.

## Verified live

The rule reads word for word on the public form, above the upload box, both thumbnails loading from barmagazine.com/photo-guide/. The drink invitation is gone, the duplicate format line is gone, and no em dash remains in that copy. The email thumbnails are absolute URLs, so they now resolve.

## Not done

The moderation screen still accepts whatever arrives; this is expectation-setting at the point of upload, not a filter. If cocktails keep coming after this, the next step is a rejection reason in the admin review that mails the owner the same sentence.
