# Task 100: the claim funnel in GA4

Read-only. Nothing on the claim page changed, and I am not proposing a page change yet, for a
reason the numbers make plain below.

---

# There is not a week of data, there are two days

The four events shipped on 2026-09-20 (task 91). Today is 2026-09-22. GA4's report window is the
last 28 days, but the claim events exist only for the last two of them, so everything below about
the funnel is a two-day sample.

| Event | Count | Users |
|---|---|---|
| `claim_page_view` | 35 | 26 |
| `claim_submit_attempt` | 5 | 5 |
| `claim_submit_result` | 5 | 5 |
| `claim_search_no_results` | 1 | 1 |

**26 people opened the claim page; 5 pressed submit; 5 got a result.** That is 19%, against the
16.5% (29 of 176) the Vercel numbers gave in task 84, so the two systems agree on the shape.

# Where the drop-off is, and where it is not

**It is not the search.** The task-84 hypothesis was that visitors could not find their bar in the
typeahead. In two days, one person out of 26 hit a search that returned nothing. Twenty-one people
loaded the page and never submitted, and twenty of them never had a failed search. Whatever the
friction is, it is not that.

**It is between loading the page and pressing the button.** Every attempt that was made produced a
result (5 of 5), so the form does not break once used. The leak is people who arrive and leave
without using it.

The 28-day page view baseline says the same thing from the other side: `/claim-your-bar` had
**1,014 views from 980 users, 1.03 views per user.** Nobody comes back. One visit, one decision.

# What the events cannot yet tell me, and why

Each event carries parameters written exactly for this question: `claim_page_view` sends
`bar_in_link` and `resolved` (did they arrive from an email link, and did the bar pre-fill), and
`claim_submit_result` sends `outcome` and `status`. **None of them is readable in GA4 today.** The
event detail card shows "PARAMETER NAME: No data available", because a custom parameter only
appears in reports once it is registered as a custom dimension in the property's Admin.

That split is the whole diagnosis. If the 21 who leave mostly arrived cold (`bar_in_link=false`),
the problem is discovery and the fix is on the search. If they mostly arrived from an upsell email
with the bar already resolved, the problem is the form itself, which asks for an email at the bar
(required), a name, a role and an optional note, and the fix is what it asks or how it asks.

# The proposal

1. **Register the four parameters as event-scoped custom dimensions** in GA4 Admin, Custom
   definitions: `bar_in_link`, `resolved`, `outcome`, `status`. This is a property setting, not
   code, so it is yours to do; it takes a minute and starts filling from that moment, not
   retroactively.
2. **Read again after seven days of registered data.** Batch 18 fires on the 28th and batch 19 on
   the 29th and 30th, which will put two or three hundred email-link arrivals through the page in
   one week, exactly the population the split is for.
3. **Then decide the page change.** Whichever half of the split carries the leak gets the preview
   branch. Building one now would be building on a guess with a sample of 26.

# What I did not do

I did not change GA4 Admin. Registering dimensions is an account-settings change, and the standing
rule puts those with you.
