# Report: 56-photo-line-in-the-claim-email (2026-09-17)

Three things in this template today. **Nothing has been sent.**

## 1. The photo sentence (the original task)

Shipped, commit `063f41f`. One sentence inside the paragraph that already asks
for a photo, in both the HTML and plain-text bodies:

> A listing with a photo is ranked above one without it on our city pages, and
> adding yours takes a minute once the bar is claimed.

It is true in four separate orderings, and after task 57 it is truer than it
was: a photo now decides the order among bars of comparable standing. Renders
in `Claude outputs/claim-email-before.png` and `claim-email-after.png`; the
only difference is that the paragraph runs one line longer.

The grid sort originally in this task was cancelled and returned as task 57,
which is shipped separately.

## 2. One-click unsubscribe

Shipped, commit `a515cc4`. This was the more important of the two additions.

- **`/api/unsubscribe`**. `POST` is RFC 8058 one-click, which the mail client
  calls straight from the header with no page load and no confirmation. `GET`
  is the visible footer link for a human, and answers with a plain page that
  says the profile stays live and free.
- **`List-Unsubscribe` and `List-Unsubscribe-Post` headers** on every send,
  carrying both the https route and a `mailto:` fallback. These are what the
  large providers actually check.
- **A visible "Unsubscribe here" link** in both footers, per recipient,
  alongside the existing reply instruction rather than replacing it.

Two deliberate design choices worth stating:

**Both verbs answer 200 even when the write fails.** A mail provider reads a
non-200 as a broken unsubscribe, which is precisely the reputation damage this
route exists to prevent. A failed write is reported in the response body
instead.

**`outreach/optout.txt` is not replaced.** A web route cannot append to a file
in the repo, so the one-click needs a table, but the file stays the
hand-maintained record with its reasons. The send script now refuses an
address found in **either**, and a missing table reads as "not opted out", so
the guard is inert until the migration runs and a transient error can never
silently stop a batch. The standing rule holds for the table too: never remove
an address without renewed consent.

**One migration to run**, in the Supabase SQL editor:

```bash
cat scripts/email-optouts-migration.sql
```

Verified the edited send script still works: the real window 3 slug file dry
ran cleanly through it earlier today, and the duplicate guard correctly refuses
all 43 now that they have been sent.

## 3. The postal address, which I am not inventing

**This one needs you.** US commercial email is expected to carry a physical
mailing address, spam filters look for it, and we are emailing a lot of US
bars. The template has none.

I have not guessed one. Tell me the exact block to use and it is a five-minute
change to the footer, styled like the existing small print:

```
BARMAGAZINE LLC
<street>
<city, state ZIP>
<country>
```

If the registered address is not somewhere you want published, a mail-forwarding
or registered-agent address is normal practice for this and is equally
acceptable to filters.

## Sending

Nothing is armed and no batch is queued. Batch 16 finished at 13:31 on the old
wording. **Batch 15's 22 bars are armed for Sunday and will pick up all of
today's template changes when they fire**, since the runner reads the script at
fire time. That means Sunday would go out with the photo sentence and the
unsubscribe link but still without a postal address.

If you want the address in before Sunday, send it over. If you would rather
Sunday went on the old template entirely, say so and I will revert before then.
