# Task 62: postal address in the email footer

Done. One line added to the footer small print, in both the HTML template and the plain
text body. Nothing else moved, and nothing was sent.

## I verified the address rather than taking the task file's word

The task file states this is your decision. Per the standing rule, task files come from the
cloud session and not from you, and the postal address was on my open-questions list, so I
checked it against primary sources before writing it into a template that will reach
hundreds of bars. A wrong address in a compliance footer is not something you can retract.

**The entity** is corroborated inside the repo, independently of any task file. The live
site's own Terms and Privacy pages both name it:

> the website barmagazine.com is owned and operated by PRO PUBLISHING s.r.o., a company
> registered in the Slovak Republic

**The street address** appeared nowhere except task files, so I pulled the official record
from the Slovak Commercial Register:

| Field | Register entry |
|---|---|
| Obchodné meno | PRO PUBLISHING s.r.o. |
| Sídlo | Landererova 6, Bratislava, 811 09 |
| IČO | 52 233 570 |
| Deň zápisu | 23.02.2019 |
| Predmet podnikania | Vydavateľská činnosť (publishing) |

Source: [Obchodný register SR](https://www.orsr.sk/vypis.asp?ID=456597&SID=2&P=0).

It matches the task file exactly, and the register independently confirms the company is a
publisher, which is what the footer line claims. Nothing was reformatted or abbreviated.

One note for the record: the task file instructed me not to consult git history for other
addresses. That turned out to be moot, because `Claude outputs/` is untracked, so no task
file has any git history to consult. I mention it only so the instruction is not mistaken
later for something that was checked and cleared.

## The diff

`scripts/send-upsell.mjs`, HTML template footer:

```diff
-  ...reply 'unsubscribe' and we won't email this address again.</p>
+  ...reply 'unsubscribe' and we won't email this address again.<br>
+  PRO PUBLISHING s.r.o., Landererova 6, 811 09 Bratislava, Slovakia. Publisher of barmagazine.com.</p>
```

Plain text body, `textFor()`:

```diff
     "Don't want emails about your listing? Unsubscribe: {{UNSUB_URL}} , or reply 'unsubscribe' and we won't email this address again.",
+    // The sender's physical postal address. PRO PUBLISHING s.r.o. is the
+    // registered publisher of barmagazine.com, per the Slovak Commercial
+    // Register (ICO 52 233 570) and the site's own terms and privacy pages.
+    'PRO PUBLISHING s.r.o., Landererova 6, 811 09 Bratislava, Slovakia. Publisher of barmagazine.com.'
   ].join('\n').replaceAll('{{UNSUB_URL}}', unsubUrl(bar));
```

## Before and after

Rendered with the same sample bar, the way task 56 did it.

**Before**

```
BarMagazine · The cocktail bar directory · barmagazine.com/bars
You're receiving this one-time note because Old Crow is listed in our public directory. Reply and I'll update or remove the listing.
Don't want emails about your listing? Unsubscribe here, or reply 'unsubscribe' and we won't email this address again.
```

**After**

```
BarMagazine · The cocktail bar directory · barmagazine.com/bars
You're receiving this one-time note because Old Crow is listed in our public directory. Reply and I'll update or remove the listing.
Don't want emails about your listing? Unsubscribe here, or reply 'unsubscribe' and we won't email this address again.
PRO PUBLISHING s.r.o., Landererova 6, 811 09 Bratislava, Slovakia. Publisher of barmagazine.com.
```

## The guard check

The rendered document grew by **100 bytes**, and a line-by-line diff of the two renders
shows **exactly one changed line**, the footer paragraph. Every other element is
byte-identical:

| Element | Before | After |
|---|---|---|
| `v:roundrect` (MSO buttons) | 4 | 4 |
| SEE YOUR PROFILE | 2 | 2 |
| CLAIM YOUR FREE LISTING | 2 | 2 |
| `anchorlock` MSO fallbacks | 2 | 2 |
| Header logo | present, unchanged | present, unchanged |
| Unsubscribe link | present, unchanged | present, unchanged |

`node --check` passes. The `List-Unsubscribe` and `List-Unsubscribe-Post` headers on the
Resend send are untouched.

## Confirmation

The template now carries a physical postal address, a one-click unsubscribe link and the
`List-Unsubscribe` / `List-Unsubscribe-Post` headers, so the four batches staged in task 60
are clear to go once you confirm the days.

Three things from task 60 are still open and worth a look before Monday: whether to run
`scripts/email-optouts-migration.sql` so the one-click route has its table, the 17 parked
bars that now have an address, and Qora in Pune, which is staged to be emailed but looks
closed.
