# Task 91: instrument the claim page

**Merged** (`9bf7e7d`) and **verified on live production**, 2026-09-20. Analytics only, nothing a
visitor sees.

## What shipped

Four GA4 events, and the whole funnel now computes inside one system.

| Event | Fires | Params |
|---|---|---|
| `claim_page_view` | once per claim-page visit | `bar_in_link`, `resolved` |
| `claim_search_no_results` | a settled typeahead search that returned nothing | `query` |
| `claim_submit_attempt` | the submit handler ran | none |
| `claim_submit_result` | that attempt ended | `outcome`, `status` |

New file `src/lib/ga-event.ts` holds `gaEvent()` and the four names. It is silent on every path
where `gtag` is absent (server render, local, preview, ad blocker) and swallows its own errors,
because an analytics call must never break the page it is measuring.

## Why the denominator moved into GA4, in your words

The 176 arrivals came from **Vercel Analytics**. Counting events in GA4 against a Vercel
denominator compares two populations with different coverage, and the resulting ratio is wrong in
a direction nobody can estimate. So `claim_page_view` is the denominator and it lives beside the
other three. The reasoning is written into the top of `ga-event.ts` so the next person does not
undo it.

The absolute arrival count will read **lower** than Vercel's 176. That is expected and does not
matter: anything that drops a visitor drops their page view and their submit together, so the
ratio survives.

## The bug in my own first version

`claim_page_view` fired **twice** on a `?bar=` link: once on mount, once when the lookup
resolved. Every inbound link from an upsell email carries `?bar=`, so the denominator would have
roughly doubled on exactly the traffic we care about, and the funnel would have read at half its
true conversion with nothing to suggest anything was wrong.

It is one `viewSent` ref now. When `?bar=` is present the page view is **deferred** to the
resolution so `resolved` is truthful, and fires exactly once either way.

## Production verification, driven live after merge

You asked for a real attempt against the production host, since GA4 does not fire on previews.

| Check | Result |
|---|---|
| All four names present in the production JS bundle | yes |
| Bare visit | `claim_page_view {bar_in_link: false}`, **count 1** |
| Search "zzzznotabarzzzz" | `claim_search_no_results {query: "zzzznotabarzzzz"}` |
| `?bar=mirror-bar` | `{bar_in_link: true, resolved: true}`, **count 1** |
| `?bar=this-slug-does-not-exist` | `{bar_in_link: true, resolved: false}`, **count 1** |
| Submit | `claim_submit_attempt {}` then `claim_submit_result {outcome: "error", status: 400}` |

The two `count 1` rows are the double-fire fix confirmed on the live bundle, not on my machine.

**The submit test wrote nothing.** I used an over-length but validly formatted address so the
route's shape check (`email.length > 320`) returns 400 **before** `createAdminClient()` is
reached. Confirmed afterwards: newest three claims are all from 19 and 20 September and belong to
real owners, and zero rows carry an `example.com` address. No claim row, no email.

## The consent-decline rate you asked for

**It does not reduce coverage here, so there is no figure to report.** `GoogleAnalytics.tsx` sets
`analytics_storage: 'granted'` by default and a decline downgrades to Consent Mode v2 cookieless
pings. A visitor who rejects cookies still sends all four events, just without a persistent
identifier. What actually costs coverage is the production-host guard and ad blockers, and GA4
cannot measure the second one.

## Notes

`BarSearchTypeahead` gained one optional prop, `onNoResults?: (query: string) => void`. The shared
component takes no analytics import; the claim page passes the callback and the other two hosts
(`add-your-bar`, `BarDirectoryMap`) are untouched.

Build clean, all tests pass.

## First numbers

Nothing to read yet. GA4 custom events take a few hours to populate the reports, and the funnel
needs a few days of claim traffic before the 16.5% figure from task 84 can be confirmed or
replaced with a real one measured end to end.
