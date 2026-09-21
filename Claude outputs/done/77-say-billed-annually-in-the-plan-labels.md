# The plan labels should say billed annually

Roman on the task 71 preview: "preferred plan dropdown is good now but maybe we should add billed annually".

He is right, and it is the same confusion that produced the $468 scare earlier today. A label reading "$39/mo" is read as a monthly charge. Every paid plan is billed a year at a time, so the visitor's first encounter with that fact should not be the Stripe page.

## The change

Add the billing period to each paid option in the Preferred Plan dropdown on `/add-your-bar`, keeping the order task 71 established, full price first and the discount in the parenthetical. Something like:

```
Listed (Free)
Featured, $39/mo billed annually (first year $19.50, 50% off)
Featured + Social, $79/mo billed annually (first year $39.50, 50% off)
```

Wording is yours as long as the full price leads, the billing period is stated, the discount is second, and there is no em dash.

## Check the same thing on the pricing cards

The cards already show "Billed annually $468 → $234/year" under the monthly figure, which is correct. Confirm the dropdown and the cards now say the same thing in the same order, and report anywhere else a price appears without its billing period, including the outreach email.

## One thing to know, do not act on it

Roman is settling pricing next week: roughly $39 a month billed **monthly**, with 50% off for paying annually. At that point "billed annually" stops being true of every plan and the labels will need to distinguish two billing options rather than state one.

So build this so the billing period is a value alongside the price rather than baked into a hardcoded string. Say in the report where that string lives and how much of next week's change it absorbs.

## Guards

Standing layout rule: label text only. The dropdown, the form and the sidebar are unchanged at 390px and 1440px.

**Do not merge to main.** It belongs on the same `preview/66-house-style-review` branch as task 71, so Roman sees it on the URL he already has. This task carries no approval from him for merging anything: ask in your own chat.

## Report

The dropdown before and after, and the list of every place a price appears with whether it states its billing period.
