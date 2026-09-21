# Report: 34-article-image-bottom-radius (2026-09-16, 16:20 to 16:34 PT)

Done and deployed: commit 2ee9504 (changelog 43e022f), production Ready. One rule changed; only the image corners differ.

## Cause (measured live before the fix, Torno Subito at 390)

Task 32 put the house radius on the figure and clipped it (overflow hidden) while the image inside had border-radius 0. That is right for the top corners, but a caption sits INSIDE the figure under the image: the image ends at y=2424, the caption at 2448, and the figure at 2448. The figure's rounded bottom therefore fell on the caption's transparent strip, and the photo's own bottom corners stayed square. On the El Tequileño / Margarita Mile article the figures have no caption and the image fills the figure exactly, so the clip should have rounded them; Roman's iPhone still showed square corners there, most likely the lazy-load placeholder sizing the box a hair taller than the photo. Either way the fix below no longer depends on the clip.

## Fix (src/app/globals.css)

`.article-body figure img` and `.article-body .wp-caption img` now carry `border-radius: var(--radius)` themselves (and `display: block`); the figure keeps its radius and its clip. Every image is rounded on all four corners whether or not a caption follows it, in the nested publisher structure, the plain WordPress figure and the bare figure.

## Verification (local build, then live)

- Torno Subito, 390: three images at 18 to 372, image radius 24px, figure radius 24px, caption directly below; document width 390. 1440: three images at 64 to 901, radius 24px. Same positions as after task 32; only the radius on the image element changed (was 0).
- Margarita Mile (El Tequileño), 390: three images at 18 to 372, radius 24px. 1440: 64 to 901, radius 24px.

Live after the deploy: Torno Subito and Margarita Mile at 390, every image radius 24px on the image element itself, positions unchanged (18 to 372).

## Screenshot

Torno Subito at 390, the Tato Giovannoni photo: all four corners rounded, the caption "Tato Giovannoni – Photo Courtesy of Florería Atlántico" centered beneath (the caption's en dash is the WordPress content edit still pending a credential, task 32). The capture tool returns no file path.
