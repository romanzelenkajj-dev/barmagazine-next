# A house-style rewrite beside the owner's text in the review screen

The Sackville Lounge submission arrived as the bar's own marketing: first person, two calls to action, a dash, and adjectives that assert rather than describe. That is normal. Owners send marketing copy because nothing has told them not to, and today Roman rewrites every one of them by hand.

Nothing in the pipeline rewrites text. A submission is stored as proposed values and publishes exactly as written on Approve. The only automatic processing is the whitespace normalization that stops "Ireland " and "Ireland" becoming two country facets.

**Do not make rewriting automatic.** Silently changing an owner's words publishes a factual error in their voice, and they notice. The decision stays human. What changes is that Roman stops typing.

## 1. The review screen

In the admin review of a submitted or edited description, show the owner's text and a house-style rewrite side by side, with three actions: use the rewrite, edit it first, or keep the owner's text. Nothing is written until one is chosen, and the owner's original is kept on the submission row either way, so we can always show them what they sent.

Make it obvious which one is about to publish. This is the one place a mis-click writes to a live profile.

## 2. What house style means, written down

It is not written down anywhere, which is why it lives in Roman's head and mine. Put it in `src/lib/house-style.ts` as the single source both the rewrite and any future check read from:

Third person, never first. 90 to 120 words. Plain description over assertion: what the bar is, what it pours, when it is open, what makes it itself. No calls to action. No dashes, use periods, commas or colons. No em dashes anywhere. No food negation, a description never says a bar has no kitchen or serves no food. Awards never appear in the description, they belong in the accolades field and render as their own credentials line. US English. No claim that is not in the source text.

That last rule is the important one. The rewrite reorganises and cuts. It never adds a fact the owner did not supply, and never infers an opening year, a neighbourhood or a specialty from context.

## 3. The submission form

Add one line under the description field telling owners what is wanted and that we edit: something like "Describe the bar plainly: what it is, what you pour, when you are open. We edit submissions into our house style before publishing." Most of the rewriting work disappears if the input arrives closer to the target, and it removes the surprise when they see the published version.

## Guards

Standing layout rule. The review screen gains one panel and one row of actions, the form gains one line of help text. Nothing else moves at 390px or 1440px. No change to what publishes on Approve except that the reviewer now chooses which text. Do not touch the whitespace normalization or the trigger behind it.

## Report

The review screen before and after at both widths, with The Sackville Lounge text as the worked example: the owner's version, the rewrite, and the three actions. Confirm the owner's original survives on the row after a rewrite is published, and that nothing writes to a bar until an action is chosen.

Then one thing worth knowing: run the rewrite over the last ten submitted descriptions we hold and say how many you would publish unedited. That number decides whether this saves Roman real time or just moves the work.
