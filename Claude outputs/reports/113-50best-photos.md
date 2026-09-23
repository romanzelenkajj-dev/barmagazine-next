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
