# Instrument the claim page before anyone redesigns it

Follow-on from your 84 report. You recommended three events rather than a redesign, and that
is the right call, so this is that job.

The number: **176 arrive at `/claim-your-bar`, 29 submit, 25 verify.** Everything after the
submit button converts at 86% and the email plumbing is proven. 147 people arrive and never
submit, and nobody knows which of your four explanations applies:

1. they arrive without `?bar=` and cannot find themselves in the typeahead,
2. they arrive, see their bar, and stall at the email field,
3. they bounce before interacting, having only wanted to see the listing,
4. they are not owners at all: a share, a forward, a crawler.

Your point that four is likelier than the task assumed is well made, and it is exactly why
this gets measured rather than guessed at. The email leads with SEE YOUR PROFILE, not the
claim button, so some of the 176 were never going to submit and counting them as a leak
would send us redesigning a page that is working.

## The three events, as you specified them

- **claim page viewed**, with a flag for whether a bar resolved from `?bar=`
- **typeahead searched with zero results**, carrying the query string
- **submit attempted**, whether or not it succeeded

Use the analytics already in place. Do not add a vendor, do not add a cookie banner
obligation, and do not send anything that identifies a person: the query string on a
zero-result search is the bar's name, which is fine, but nothing about who typed it.

If the existing analytics cannot carry a custom event, say so and stop rather than
installing something. That is a decision for Roman, not a workaround.

## What the numbers will settle

Once a week of data is in, the four explanations separate cleanly:

- Many views **without** a resolved bar means the link is losing its `?bar=` somewhere, and
  that is a link problem, not a page problem. Check the email templates and whether a
  security gateway is rewriting the URL. The base64 `/ZmVhdHVyZS` you traced is evidence
  something out there is mangling our links already.
- Many **zero-result searches** means the typeahead cannot find bars by the names their
  owners type. Collect the queries; they will name the bars.
- Views with a resolved bar and **no submit attempt** is the email field or the page copy,
  and only then is a redesign the answer.
- Views with no interaction at all is explanation three or four, and the honest conclusion is
  that 16.5% is closer to the real ceiling than we thought.

**Report the numbers and what they mean. Do not propose a redesign in the same report.**

## The three things you flagged and could not do

Worth doing alongside, since they are small and one may be part of the answer:

- **The page at 390px.** Most of these people open an email on a phone.
- **The typeahead against awkward names.** Accented names, names with a pipe, names carrying
  a city. FREYM, Häktet Vänster, Garagiste Wine Room | Merchant and Bar Leone are the obvious
  test cases. A bar owner who searches their own name and gets nothing leaves, and that is
  explanation one with a specific cause.
- **The expired-claim sweep.** Four expired in the last seven days. Confirm they expired for
  the documented reason and not something new.

## Constraints

Analytics events only. No change to the claim logic, the email templates or the page copy in
this task. Anything a visitor sees stays on a preview branch.

## Report

The events you added and where they fire, a plain statement of what each of the four
explanations would look like in the data, the three checks above, and nothing about a
redesign until the data is in.
