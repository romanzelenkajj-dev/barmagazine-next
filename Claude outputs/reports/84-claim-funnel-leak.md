# Task 84: the claim funnel, diagnosed before tonight's send

Read-only. Nothing changed, nothing sent.

---

# STOP THE SEND, OR ARM IT AGAIN: 19 OF TONIGHT'S 22 BARS HAVE NO EMAIL

This is not what you asked me to check, and it is the thing that matters most before 21:00.

`send-upsell.mjs` line 316 reads `bar.email` and skips a bar without one:

```js
if (!to) { console.error(`SKIP ${slug}: no email on file`); continue; }
```

It logs to **stderr** and moves on, so the batch looks like it ran.

I checked all 22 armed slugs against the database. **Three have an email. Nineteen do not.**

**Would send:**

| Bar | Email |
|---|---|
| Bourke's | info@bourkeshk.com |
| Milli | contact@millisingapore.com |
| Live Twice | info@livetwice.sg |

**Silently skipped:** Pony Up, Penicillin, The Savory Project, Atlas, FURA, Native, Offtrack,
1920, LPM Dubai, **Bar Leone**, **Coa**, **Quinary**, Canopy Lounge, Cat Bite Club, **Jigger &
Pony**, Nutmeg & Clove, Nuss Bar, Galaxy Bar, Mimi Kakushi.

Every headline name you listed is in the skipped group. Tonight sends **3 emails, not 22**.

None of the 22 is already claimed, none is inactive, and none is missing from the directory, so
the only blocker is the missing address. This is the same failure that hit 15 staged bars on
18 September, where a harvest merged emails in memory and never wrote them.

**This is your call and I have touched nothing.** The options are to let it fire and reach
three bars, or to disarm, harvest the nineteen addresses, and re-arm.

---

# Your two checks

## 1. Are claims being created at all? YES, and the rate is healthy

| | Last 7 days |
|---|---|
| Claims created | **29** |
| Approved | **25** |
| Expired | 4 |
| Stuck awaiting verification right now | **0** |

## 2. Is the email delivering and does the button work? YES, emphatically

This is the strongest evidence in the report, and it is not an opinion:

| | |
|---|---|
| Median time from claim created to verified | **0.6 minutes** |
| Fastest | 0.2 min |
| Verified within 10 minutes | **23 of 25** |

**A claim verifies 36 seconds after it is created.** That is only possible if the email lands
in the inbox immediately and the button works on the first tap. An email in spam produces long
tails or silence; a broken button produces expired claims, not 36-second ones.

**The email step converts at 86%.** It is the healthiest part of the whole funnel.

**The send is safe on both of your checks.** The problem is the addresses, not the machinery.

---

# So where is the leak? The page, not the email

| Step | Count | Conversion |
|---|---|---|
| Arrive at `/claim-your-bar` | 176 | |
| **Submit a claim** | **29** | **16.5%** |
| Verify by clicking the email | 25 | **86%** |

**147 of 176 arrive and never submit.** Everything after the submit button works well.

Your `176 → 34 → 11` reading had the right shape and the wrong culprit. The 34 at
`/claim-your-bar/verify` matches the 29 claims closely, so that step is real. The 11 at
`/owner-dashboard` is a red herring: **approval does not require visiting the dashboard**,
which is why 25 claims were approved while 11 people loaded a dashboard.

---

# The repeat-visit bars: the task's premise is wrong, and it is good news

You read these as "high intent with no conversion". **Four of the five are claimed and
approved.**

| Bar | Emailed | Claim | Status |
|---|---|---|---|
| Bitter & Twisted, Phoenix | yes | ross@bitterandtwistedaz.com | **approved** 15 Sep |
| Pretty Penny, Phoenix | yes | brenon@thosepourbastards.com | **approved** 15 Sep |
| Holiday, Austin | yes | hello@holidayon7th.com | **approved** 15 Sep |
| Aldea, Barcelona | no | info@aldeabar.com | **approved** 12 Sep |
| The Sackville Lounge, Dublin | **no** | none | unclaimed |

Those repeat pageviews are **owners looking at a listing they already own**, which is what you
want them doing. The only unclaimed one was never emailed.

So the most vivid evidence in the task file for a leak is actually evidence the funnel works
when someone reaches it.

---

# The base64 link: not ours

`/ZmVhdHVyZS` truncates `ZmVhdHVyZS15b3VyLWJhcg==`, which is base64 for **"feature-your-bar"**.

I searched the whole repo and both email templates. **The only base64 in the codebase decodes an
uploaded image** in `api/bar-submission/route.ts`. The string appears nowhere as a literal.
Every link in the claim email and in `send-upsell.mjs` is a plain `https://barmagazine.com/...`
URL, including `{{CLAIM_URL}}` = `https://barmagazine.com/claim-your-bar?bar=<slug>`.

It is almost certainly an email security gateway (SafeLinks, Proofpoint, Mimecast) or a scanner
rewriting a URL and something following the mangled form. **Nothing to fix before tonight, and
nothing we emit.**

---

# What I would try first: one recommendation

**Find out what the 147 see, by instrumenting the claim page before redesigning it.**

I am not going to tell you the page is broken, because I have not seen evidence that it is, and
the prefill logic is genuinely well built: `?bar=<slug>` resolves the bar and skips the search
entirely, with a comment saying it exists precisely because making an owner search again is the
step most likely to lose them. That is the right instinct and it is already implemented.

What I cannot tell from here is which of four things happens to the 147:

1. they arrive without `?bar=` and cannot find themselves in the typeahead,
2. they arrive, see their bar, and stall at the email field,
3. they bounce before interacting at all, having only wanted to see the listing,
4. they are not owners: a share, a forward, a crawler.

**Four is more likely than the task assumes.** The email's first and most prominent button is
**SEE YOUR PROFILE**, not the claim button, and the claim CTA sits below two paragraphs. A
proportion of the 176 may be people who clicked "claim" out of curiosity and were never going to
submit.

Three events on the existing analytics answers it: claim page viewed with and without a
resolved bar, typeahead searched with zero results, and submit attempted. That is a day's work,
it is reversible, and it turns a guess into a number.

**Do not redesign the page first.** A 16.5% page conversion could be one broken thing or four
small ones, and the email half of this funnel already proves the plumbing is sound.

---

# What I did not check, and why

The page at 390px, the typeahead against accented and piped names, and the expired-claim sweep.
You told me the page polish can wait and to prioritise the two send-blocking checks, so I spent
the time on those and on the armed batch. Those three are worth doing and none of them can stop
tonight.
