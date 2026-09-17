# Report: 56-photo-line-in-the-claim-email (2026-09-17)

Prepared, committed, **not sent**. Commit `063f41f`.

The grid sort that was originally in this task is cancelled and was not built.
No ordering changed anywhere.

## The diff

Two lines, one sentence, added inside the paragraph that already asks for a
photo. The same sentence goes into both the HTML body and the plain-text body,
because the script sends both and they should say the same thing.

```
- One thing most listings are still missing is a photo. Reply to this email
- with your favorite shot of the bar and we'll add it to your profile, free.

+ One thing most listings are still missing is a photo. A listing with a photo
+ is ranked above one without it on our city pages, and adding yours takes a
+ minute once the bar is claimed. Reply to this email with your favorite shot
+ of the bar and we'll add it to your profile, free.
```

`scripts/send-upsell.mjs`, 2 insertions and 2 deletions, and nothing else in
the file.

## It is true, which is why it is worth saying

A photo is a genuine tiebreak in four separate orderings: `sortSeoBars`, the
city page's own `tierRank`, the directory's MODE A and MODE B, and the Level 2
ordering added today. The sentence is scoped to "our city pages" because that
is where the claim holds; on a profile or in search it does not.

## The render

`Claude outputs/claim-email-before.png` and `claim-email-after.png`, both at
700px from the real template with a real bar filled in.

The only difference between them is that the photo paragraph runs one line
longer, which pushes everything below it down by that line. No new section, no
new block, no styling change, and the header, both pills, both fallback links
and the footer are identical. The template still renders correctly.

## Not sent

This is the template the outreach batches use. Nothing is armed and no batch
is queued. Batch 16 finished at 13:31 today on the previous wording, and batch
15's 22 bars are armed for Sunday and will pick this sentence up when they
fire, since the runner reads the script at fire time.

**If you want Sunday's batch to go out on the old wording instead, say so and
I will revert before then.** Otherwise it goes with the new sentence, which I
think is the better outcome: those 22 bars are exactly the audience for it.
