# Hero photo credit aligned with the pills

Status: merged (PR #95, Roman, 2026-09-25) and live; the production CSS carries right 28px / bottom 20px for both the profile credit and the article caption.

- Profiles: the credit stays plain text (no pill), 28px from the right edge and 20px from the bottom, its text centred on the badges' line. The badges sit 16px up and are 22px tall, so their centre is 27px up; the credit's 14px line box rests at 20px and centres there too. Measured on the preview (/bars/connaught-bar, 1453px wide): right 28, bottom 20, pill centre 27, text centre 27. Locally the same at 1280px and 375px.
- Articles: the caption is back in the bottom-right corner with the same insets, 28px right and 20px bottom (the earlier top-right move is reverted).
- Best-bars: no photo hero, nothing to change.
- Nothing else on the heroes changed.

Preview: https://barmagazine-next-git-previ-87c956-romanzelenkajj-7135s-projects.vercel.app/bars/connaught-bar (Vercel login).
