# The email footer still has no postal address. Use the Slovak publisher

Task 56 shipped the photo sentence and the one-click unsubscribe, and correctly left the postal address out because it was not settled. It is settled now.

Roman's decision: use the Slovak address alone. PRO PUBLISHING s.r.o. owns and publishes barmagazine.com, so it is a valid physical postal address of the sender, which is what is required. There is no US address to add. Roman is getting a PO box separately and may add one later, but nothing waits on it.

## The change

Add one line to the footer small print in `scripts/send-upsell.mjs`, in both the HTML `TMPL` and the plain-text body, styled like the existing footer lines:

PRO PUBLISHING s.r.o., Landererova 6, 811 09 Bratislava, Slovakia. Publisher of barmagazine.com.

The country is included because these go worldwide. The role is named so it is obvious why that entity appears rather than BarMagazine. Do not abbreviate, do not reformat, and do not add any other address from anywhere in the repo, the git history or a previous version of a task file. There is no US address to find and anything that looks like one is withdrawn.

## Guards

Footer small print only. The header, both buttons, the MSO fallbacks and the unsubscribe link all stay exactly as they render today, and the template must still pass the render check unchanged above the footer.

## Report

The diff, and the before and after renders the way task 56 produced them, so Roman can see the footer grew by one line and nothing else moved.

Then confirm in one line that the template now carries a postal address, a one-click unsubscribe and a List-Unsubscribe header, so the outreach batches in task 60 are clear to go once Roman confirms the days.
