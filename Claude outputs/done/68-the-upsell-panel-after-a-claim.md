# The Featured panel on the post-claim page is a footnote. It should be the second thing they see

`src/app/owner-dashboard/page.tsx`, the "Your bars" page a bar lands on right after claiming. The page leads with a green tick and "Casa del Havana is yours." Below it sits the Featured offer: a pale pink panel, a maroon eyebrow in small caps, three small bullets and a small maroon button.

Roman: "that's not attractive enough. I don't like the color, I don't like the small font."

This is the highest-intent moment we have. A bar has just verified ownership, it is engaged, and it is looking at its own bar's name on our site. 134 people reached the claim page last week and 42 reached the pricing page. Two bars have ever paid. The panel is doing almost none of the work it could.

## 1. Colour and weight

The pink panel and the maroon eyebrow and button go. Use the gold from task 67, `#B08D3F` and `#C9A96A`, the same treatment so the two pages agree. Give the panel real weight: larger heading, body type at the size a person actually reads rather than fine print, a primary button the size of the "Go to your dashboard" button above it.

Task 67 is changing the same colours on `/feature-your-bar`. Land these together or one after the other, but they must end up matching. If 67 has not run yet, do it first.

## 2. Show, do not list

Replace the three feature bullets with the two bars that actually pay: `the-loft` in Santiago and `dangerous-water-palma-de-mallorca`. A thumbnail of each Featured page, the bar's name and city, and a link through to it. The pitch is "your page could look like this", so show the page rather than describing it.

Keep one short line of context above them and no more. The bullets are what make it read like fine print.

If a thumbnail is not practical, use each bar's own profile photo with the name and city under it. Do not invent a screenshot.

## 3. Pricing stays as it is, for now

Do not change any price, plan or billing term in this task. Roman is settling that next week: the direction is roughly $39 a month billed monthly, with 50% off for paying annually, and he has said $19.50 is too low. Nothing in this panel should hard-code a price that is about to change.

So: no number in the panel. The button says what it does, "See Featured plans", and the pricing page carries the numbers. That way next week's change is one page, not two.

## Context worth having when that decision comes

Yelp's Upgrade Package is $180 a month, billed monthly, cancel anytime, with no annual prepay offered. OpenTable runs $149 to $499 a month and charges monthly even inside a twelve month term. The industry does not ask a small venue for a year up front, and at $19.50 we are an order of magnitude under the market. The barrier has been the payment shape, not the price.

## Guards

Standing layout rule: the panel only. The green confirmation card above it, the bar list below it, the header and the dashboard link all stay exactly as they are at 390px and 1440px. The panel must not push the bar list below the fold on a phone.

## Report

The page before and after at both widths, contrast figures for the gold on the new panel background, and confirmation that no price appears anywhere in the panel.

## Do not deploy this

Build it, verify it, produce the screenshots, and stop at the working tree. Do not commit, do not push. Roman looks at the before and after first and gives the go. See the standing rule in SETUP.md.
