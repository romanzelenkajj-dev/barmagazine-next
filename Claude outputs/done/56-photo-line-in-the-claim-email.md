# One line in the claim email: a photo moves a listing up

The sort change that was in this task file is cancelled. Roman looked at the pages again and the interleaving is not bad enough to justify reordering every grid on the site. Do not change any ordering anywhere.

What survives is the incentive, which was the point.

## The change

`scripts/send-upsell.mjs`, the `TMPL` email. Add one sentence saying plainly that a listing with a photo ranks above a listing without one, and that adding a photo takes a minute once the profile is claimed.

One sentence, in the template's existing voice. No new section, no new block, no layout change, no styling change. The template renders correctly across clients today and that must not regress.

## Do not send

Prepare it, render it once to confirm nothing shifted, and report. Sends wait for Roman's confirmation in your own chat.

## Report

The diff, and a rendered screenshot of the email before and after so Roman can see the sentence sits where it should.
