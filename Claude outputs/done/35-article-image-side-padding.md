# Article images: side padding differs between articles (Roman, low priority)

On phones some articles show images with a wider side gap than others. Roman wants the narrower one everywhere. Most likely: the publisher's nested structure (figure > p > figure) picks up the paragraph's side margin/padding on top of the figure's, while a plain WordPress figure does not (or vice versa). Measure at 390 on the Torno Subito, The Pontiac, El Tequileño/drinks99 and one 2025 article: left edge of the image versus the left edge of the body text. Make every article image inset by the same amount as the narrower case (aligned with the text column, or the current narrow value if that is what the narrow case does), regardless of how the image was inserted. Standing layout rule; only image width/inset changes. Report the before/after px per article and the commit.

## Roman's reference screenshots (390px)
- NARROW = wanted: Torno Subito article (tato-giovannoni-floreria-atlantico-torno-subito-miami), the Tato Giovannoni photo: image runs to about 16px from the screen edge, wider than the text column.
- WIDE = not wanted: 1986 Steak House / Tres Monos article (1986-steak-house-miami-coconut-grove-tres-monos), the Stefano Cremasco photo: image aligned with the text column, about 36px from the edge.
Target: every article image at the narrow inset (the Torno Subito value) on phones. On desktop keep the current column width.
