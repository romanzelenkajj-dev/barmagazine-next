# Profile actions column: cap the width, three-line ownership note, restore the Claim button

Follow-up to reports/05 after Roman saw it live on Bitter & Twisted (1440px): the stacked buttons in the right column are about 480px wide, too wide, and the ownership note runs on one long line.

1. Cap the actions column: max-width about 300px (the value that lets "Is this your bar? Claim it" fit as a pill with its padding). At >= 1100px the grid becomes `minmax(0, 1fr) <cap>` rather than 3fr 2fr; the text column takes everything else. Buttons fill the column width, never more.
2. Ownership note under the buttons, same muted style, exactly these three lines with explicit line breaks:
   This listing is managed by its owner.
   For ownership changes:
   contact office@barmagazine.com.
   ("For ownership changes:" replaces "Ownership changes:". Email stays a mailto link.)
3. Revert the claim prompt to the outlined pill button it was before 05 ("Is this your bar? Claim it", .bar-v2-btn--claim is still in the CSS). It sits in the actions column as the last button on unclaimed bars. Roman: the claim call to action stays a button.
4. Below 1100px keep the single-column stacking from 05 unchanged; on phones the note can wrap naturally.

Test at 1000 and 1440 on Bitter & Twisted (claimed, 3 buttons), Daisy Margarita Bar (claimed), Captain Foxheart's (unclaimed). Deploy and report the commit with screenshots of Bitter & Twisted at 1440 and Captain Foxheart's at 1440.
