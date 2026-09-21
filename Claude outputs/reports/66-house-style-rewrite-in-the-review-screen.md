# Task 66: a house-style rewrite beside the owner's text

Built and verified. Four files: a new `src/lib/house-style.ts`, a new
`src/components/DescriptionReview.tsx`, the admin submissions screen, and the submission
form. Plus one grid rule in `globals.css`.

**Nothing is committed.** Say the word and it goes.

## The number first, because it decides whether this was worth building

**3 of the last 10 submitted descriptions come out publishable with no editing.**

| bar | owner | rewrite | verdict | why it still needs you |
|---|---:|---:|---|---|
| The Sackville Lounge | 96w | 52w | edit | under 90 after cutting |
| THE OLD HOUSE | 1503w | 104w | **publish** | |
| Dangerous Water | 7w | 7w | edit | under 90 |
| Dangerous Water | 10w | 10w | edit | under 90 |
| Furtivo Speakeasy | 104w | 64w | edit | under 90 after cutting |
| Dangerous Water | 88w | 90w | edit | first person survived |
| Customs House Bar | 112w | 112w | **publish** | |
| De Tiger Bar | 44w | 22w | edit | under 90 |
| The Cocktail Office | 55w | 55w | edit | under 90 |
| Customs House Bar | 115w | 100w | **publish** | |

**3 of 10 sounds thin until you read why the other 7 fail: 6 of them fail on one thing, and
it is not a rewriting problem.** They come out under 90 words because the owner did not send
90 words of fact. Dangerous Water sent 7 words. De Tiger sent 44, half of it a call to
action. No rewriting tool can fix that without inventing, which is the one thing it must
never do.

So the honest read is: **the rewrite reliably fixes everything except length-under, and
length-under is an input problem.** That is precisely what part 3 of this task addresses, and
it is the part most likely to move the number. Every submission that arrived long enough
(THE OLD HOUSE at 1503 words, both Customs House at 112 and 115) came out publishable.

Only one failed on the rewrite's own limits: Dangerous Water's 88-worder uses a first-person
verb the conversion table does not carry, so it says so rather than guessing.

## 1. The review screen

The owner's text and the rewrite sit side by side, each with its word count, the owner's side
listing what breaks house style and the rewrite's side listing what it did and what it could
not do. Three actions underneath: **Use the rewrite**, **Edit it first**, **Keep the owner's
text**.

**Nothing writes until one is chosen**, and I verified that at the network layer rather than
by reading the code:

| Reviewer action | What the Approve request carries |
|---|---|
| Nothing chosen | `{action, submissionId}`, no `description` key at all |
| Use the rewrite | `description` = the rewrite |
| Keep the owner's text | no `description` key |

With no `description` key the API path is byte-for-byte what it was before this task, so a
reviewer who ignores the panel entirely gets exactly the old behaviour.

**The owner's original always survives.** The API writes the chosen text onto the bar and
never touches `bar_submissions.description`. That is by construction, not by convention, and
the code says so at the point of the override.

### A bug I introduced and caught

I first kept the choice in the panel's own state. Approving refreshes the list, which
remounts the panel, which reset it to "nothing chosen" **while the parent still held the
rewrite**. So the line telling you what was about to publish could disagree with what
actually would. On the one screen where a mis-click writes to a live profile, that is the bug
that matters, so the panel is now controlled by the parent's record and the two cannot drift.
Re-verified: after a refresh the line still reads "Approve will publish: the house-style
rewrite" and the request still carries it.

## 2. House style, written down

`src/lib/house-style.ts` holds the rules as data (`HOUSE_STYLE_RULES`), one prose summary,
the form's help line, the rewrite, and `checkHouseStyle()` as the hook for any future
automated check. Both the rewrite and the check read the same constants, so the style moves
in one place.

**The rewrite is deterministic on purpose, and has no model behind it.** "No claim that is not
in the source text" is the rule that matters most, and the cheapest way to guarantee it is to
make adding a claim *impossible* rather than unlikely. It can delete, reorder and substitute
known equivalents. It cannot infer an opening year, a neighbourhood or a specialty, because
it has nothing to infer from.

The consequence is that it is a **draft**, not an answer. Where it cannot convert cleanly it
says so and leaves the sentence, rather than producing "the bar gos" in a live profile.

## The worked example: The Sackville Lounge

**Owner's text, 96 words.** The panel flags four things: first person, a dash, a call to
action, an award in the description.

> The Sackville Lounge is familiar but new, an intimate venue evoking a time when pubs were
> full of life and the night was young. Expect exceptional drinks, a sense of occasion, and a
> bit of old school glamour at this chic city bar. We stay true to Dublin's true character -
> our "Beloved Dirt" in all its grit, glamour and charm. Come for the cocktails. Stay for the
> vibe. No reservation required. Late night DJs on Friday and Saturdays. Newcomer of the Year
> 2026 (Bar of the Year Awards). From the award-winning team behind BAR 1661.

**Rewrite, 52 words.**

> The Sackville Lounge is familiar but new, an intimate venue evoking a time when pubs were
> full of life and the night was young. The bar stays true to Dublin's true character, its
> "Beloved Dirt" in all its grit, glamour and charm. No reservation required. Late night DJs
> on Friday and Saturdays.

What it reports doing: replaced dashes with commas, removed 3 calls to action, removed 2
sentences naming an award, converted first person to third.

What it reports it cannot do: **"52 words, under the 90 minimum. Nothing can be added without
inventing a fact the owner did not supply."**

**The most useful thing here is not the tidier prose, it is the extraction.** Sackville's
submission ends with "Newcomer of the Year 2026 (Bar of the Year Awards)". Published as
written, that accolade would have lived forever as a sentence in a description and never been
recorded in the accolades field, so it would never have rendered as a credentials line and
never counted in ranking. The rewrite pulls it out and the note tells you where it belongs.
Furtivo Speakeasy is the same story at greater length: 40 words of Condé Nast, OpenTable and
Pinnacle Guide recognition sitting in prose.

I checked both award removals by hand to be sure they were not false positives. They were not.

## 3. The submission form

The description hint now reads:

> Describe the bar plainly: what it is, what you pour, when you are open. We edit submissions
> into our house style before publishing.

It is imported from `house-style.ts`, so the form and the reviewer are reading the same
sentence. The placeholder changed from "Tell us about your bar — concept, specialty
cocktails, atmosphere..." to "What the bar is, what you pour, when you are open..." — which
also removes an em dash that was sitting in user-visible copy against the site-wide rule.

## Guards

| Guard | Result |
|---|---|
| Review screen gains one panel and one row of actions | Yes. The old read-only paragraph still renders unchanged on the Approved and Rejected tabs |
| Form gains one line of help text | Yes, replacing the existing hint in the same element |
| Nothing else moves at 390 or 1440 | Two columns at 1440, one at 390, no horizontal overflow at either |
| No change to what publishes on Approve except the reviewer's choice | Verified at the network layer, table above |
| Whitespace normalization untouched | `normalizeBarFields` and its trigger are not touched |
| No new breakpoints | The grid rule reuses the existing 768 |
| No regex lookbehind in src/ | The sentence splitter is written as a scan, not a lookbehind split |
| Build | `next build` exits 0 |

**One thing that is not literally one row:** at 390 the three action buttons wrap to two
rows, because three labels do not fit in 328px. I left them readable rather than shrinking
them to fit, since this is an admin screen used by one person on a desktop. Say if you would
rather they were full-width and stacked.

**A lint error worth recording:** the first build failed on `prefer-const` in the new module.
It only surfaced because I grep for "Failed to compile" rather than "Compiled successfully",
which Next prints before type-checking. That habit has now caught two real breakages.

## Still flagged, not fixed

Three em dashes remain in user-visible copy on the submission form, outside the one line this
task named:

- "/mo — 50% off first year)"
- "Not sure? Start with Free — you can upgrade anytime."
- "Your profile photo should show the room — an interior shot is what makes readers want to
  visit."

Same pattern as the near-me banner: I am not touching copy this task did not name. They are
three one-character fixes whenever you want them.
