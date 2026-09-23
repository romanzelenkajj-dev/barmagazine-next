# Task 113: 50 Best media-pack photos on the 2026 51-100 profiles, 2026-09-23

## Pack

`~/Downloads/Bars Imagery/` (98 files, two per bar, plus a few loose copies in `~/Downloads`)
copied to `outreach/photos-incoming/50best-2026/`, one file per bar named by slug (46 bars). The
"(1)" file was taken as the primary where it was under the 4.5MB Vercel request limit, else the
smaller of the two; Boilermaker's pack files are both over 5MB, so its 379KB copy from
`~/Downloads` was used. Coa, CoChinChina and Double Chicken Please have no pack file under the
limit, and all three already carry photos, so nothing was needed. The pack has no file for Baba
au Rum, which also has a photo. The folder stays untracked like the rest of photos-incoming.

## Uploaded: 23 profiles, every one that had no photo

Through `/api/admin/upload-photo` (appends to `photos`, revalidates the profile), then
`photo_credit` set. None of the 23 was claimed or carried an owner photo; the script refuses any
row whose `photos` is non-empty, so a bar- or owner-supplied photo can never be replaced by it.

Bar Gabriel, Bar Trench, Boadas, Boilermaker, Form + Matter, Freni e Frizioni, Front/Back, G.O.D,
Gucci Giardino, Kumiko, La Borracha, Mius, MO Bar Shenzhen, Naked, Opium, Otro Bar, Röda Huset,
The Bellwood, The SG Club, Three Horses, Tjoget, Vender, Vesper.

## Left alone: 27, all with a photo already

Tjoget aside, the rest of the 50 had photos before today: 1930, Arca, Baba au Rum, Bar 1661, Bar
Cham, Coa, CoChinChina, Double Chicken Please, Drink Kong, Employees Only, Foco, Jewel of the
South, La Sala de Laura, Licorería Limantour, Little Red Door, LPM Dubai, Maybe Sammy, Offtrack,
Panda & Sons, Penicillin, Salmon Guru, Scarfes Bar, Smoke & Bitters, Superbueno, Svanen, The
Savory Project, Three Sheets. Their pack files sit in the folder if you ever want a second image
on any of them.

## Credit

The profile has a credit line under the hero (`bars.photo_credit`, rendered as "Photo: <credit>"),
so no field or template change was needed. Stored as `courtesy of The 50 Best Bars`, which the
template prints as **"Photo: courtesy of The 50 Best Bars"**; storing your exact wording would
have printed "Photo: Photo courtesy of...". If you want the line to read exactly "Photo courtesy
of The 50 Best Bars", that is a one-line template change on a preview branch; say so.

## Still without a photo on the 2026 51-100 list

None. All 50 profiles now carry at least one photo.

## Follow-up (same day): interiors only, and the credit inside the hero

### 1. Photo choice, all 23 reviewed against both pack files

Rule applied: bar interiors only, never a cocktail close-up or a portrait. Every "(2)" file in the
pack turned out to be the interior where the "(1)" was a drink, so no profile had to lose its
photo.

**Replaced, 15** (drink shot deleted from storage, interior uploaded, `photo_credit` unchanged):
Bar Gabriel, Form + Matter, Freni e Frizioni, Front/Back, Gucci Giardino, La Borracha, Mius, MO
Bar Shenzhen, Otro Bar, Röda Huset, The Bellwood, The SG Club, Three Horses, Tjoget, Vesper.

**Kept, 8** (the current pick is already the room): Bar Trench, Boilermaker, G.O.D, Kumiko, Naked,
Opium, Vender, and Boadas. Boadas is the one to look at: its pick is a close-up of the bar stools,
which is neither a drink nor a portrait, and the pack's other file is a drink, so there is no wide
interior to swap in. Say the word and it goes without a photo.

**Removed with no interior available: none.**

The interior files sit next to the originals as `outreach/photos-incoming/50best-2026/<slug>-interior.*`;
four (Bar Gabriel, Form + Matter, Freni e Frizioni, Front/Back) were over the 4.5MB request limit
and were resized to 2,400px on the long side before upload. The before/after contact sheet was
posted in chat. Each swapped row was checked to hold exactly one photo, the new URL, afterwards.

### 2. Credit inside the hero: branch `preview/113-photo-credit`, draft PR #78, NOT merged

Preview (Vercel SSO): https://barmagazine-next-git-previ-07eda8-romanzelenkajj-7135s-projects.vercel.app/bars/front-back

The credit line leaves the flow under the hero and sits inside it, bottom-right, 12px inset,
11.5px, white at 70%, soft text shadow, the same rule as the article hero caption from task 111.
Capped at 60% width and right-aligned so it stays clear of the badges at bottom-left. Measured on
the branch: desktop insets 12/12, credit 197px wide next to a badge ending at 146; on a 390px phone
one line, 12/12 insets, badge ends at 122, credit starts at 181, no overlap, no horizontal
scroll. Nothing outside the hero moved: the chips row and the info card lose the 10px credit gap
that used to sit between them and the hero, that is all.

Files: `src/app/bars/[slug]/page.tsx` (the `<span>` moves inside `.bar-v2-hero`),
`src/app/globals.css` (`.bar-v2-photo-credit` rewritten; its mobile padding rule is gone).
