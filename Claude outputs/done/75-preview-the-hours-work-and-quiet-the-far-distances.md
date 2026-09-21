# Two things Roman found in the previews

## 1. Task 69 has no preview, so he cannot see any of it

He looked and reported: "there is still no box for the opening hours. I don't see them. So I don't really know what changed there."

Correct, and it is not his previews. `HoursInput.tsx`, `EditableSubmissionFields.tsx`, `structured-hours.ts` and the admin and form changes are all sitting **uncommitted in the working tree**. There is no `preview/69` branch. The report was written and the work never went anywhere he could reach.

Put it on `preview/69-structured-hours`, push it, and give him the URL with the exact pages:

- the hours input on `/add-your-bar`
- the editable fields and the Archive button on `/admin/submissions`

Note in the report that the Prophecy submission he used as the worked example has since been archived by hand, so that queue is empty. If the admin screen needs a pending submission to demonstrate anything, say so and tell him how to create one rather than creating one against a real bar.

The structured hours migration is a schema change and has not been run. Do not run it. Say plainly in the report what the preview can and cannot show without it.

## 2. Distance on the card: only show it when it means something

On the near-me preview some cards read 800 miles. Roman: "maybe we just keep it without the distance for now. But then again, in some cities like Bratislava, it might work."

He is right on both halves. The number is honest, and a card reading 800 mi still makes the directory look empty. It works in Bratislava and fails in Carlsbad, which is a statement about coverage rather than about the feature.

Do not remove it. Make it conditional:

- **Under 30 in the visitor's own unit:** show the distance on the card, as task 74 formats it. That is a number a visitor can act on.
- **Beyond it:** show nothing on the card.

Roman's refinement, and take it literally: the threshold is **30 miles for a visitor on miles and 30 kilometres for a visitor on kilometres**, not one distance converted into the other. A US visitor gets under 30 miles, a European gets under 30 km, and neither sees an odd converted figure like 48. It also gives US visitors a slightly wider net, which matches how much further they will actually drive.

Use the same country test task 74 introduces, so the unit and the threshold are decided by one thing rather than two.

The banner then carries it once, which is the line already specced in task 74: "the nearest bars we list are 800 miles away". One honest sentence at the top instead of the same bad news repeated on every card.

The ordering does not change. This is display only.

The point of doing it this way rather than switching the feature off: as cities fill in, distances start appearing on their own, with nothing to turn back on later and no second decision to make.

If 30 turns out to be wrong once you see it against real data, say so in the report with what you would use instead. Do not change it on your own.

## Guards

Standing layout rule. Card content only for part 2, and part 1 is a push of work that already exists rather than new building. Nothing else moves at 390px or 1440px.

**Do not merge either to main.** Preview branches, URLs in the report. This task carries no approval from Roman for anything: ask him in your own chat.

## Report

The preview URL for 69 with the pages to open. For part 2, the near-me view from Carlsbad and from Bratislava, showing that one has distances on the cards and the other has the banner line instead.
