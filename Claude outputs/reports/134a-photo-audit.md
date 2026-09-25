# Task 134a, photo audit (own-website photos)

Status: done (Roman, typed go, 2026-09-25). The 28 failing live photos are removed from their profiles and their photo_credit cleared (each profile held only that one photo, so no owner, admin, agency or 50 Best pack photo was touched). The 17 passing 133 candidates are live, credited "Photo: <Bar name>". BEUYS and the other staged 133 files are deleted and staging is cleared. Sources of every published photo: 134-published-photo-sources.md.

## Scope

122 photos taken from a bar's own website: 4 live Heidelberg photos, 45 live from task 130, 34 live from task 131, and the 39 approved 133 candidates (Roman's picks, excluding stage-bar and imperial-rooftop). Owner-supplied, agency-supplied and 50 Best pack photos were left out, as instructed.

## Method

1. Re-downloaded each original from its recorded source URL (not our resized copy).
2. Read EXIF (Artist, Copyright, XPAuthor, ImageDescription), IPTC (By-line, Credit, Source, Copyright, Writer) and XMP (dc:creator, dc:rights, photoshop:Credit, Iptc4xmpCore) with PIL and a raw XMP scan.
3. Checked the file name and the source page's text, alt and title attributes for photographer credits ("photo by", "foto", "credit", "©" with a name). Footer "©" lines naming the venue or hotel group were not treated as photographer credits.
4. For German and Austrian sites, read the Impressum (Bildnachweis, Bildquellen, Fotonachweis, Fotos, Fotografie) and looked for a press or media-kit page.
5. Viewed every remaining image at full size for a watermark or signature. None found in the 72 that passed the metadata and page checks (Stranger's "Stranger × Stranger" plate is a screwed metal sign in the room, not an overlay).

## Summary

| Group | Checked | Kept / passes | Removed / dropped |
|---|---|---|---|
| Heidelberg (live) | 4 | 0 | 4 (Germany, no press page) |
| 130 (live) | 45 | 35 | 10 (photographer named) |
| 131 (live) | 34 | 20 | 14 (photographer named) |
| 133 candidates | 39 | 17 | 22 (3 photographer named, 19 Germany/Austria) |
| Total | 122 | 72 | 50 |

No German or Austrian image came from a press or media-kit page, so all 23 fail the rule; 7 of them also name a photographer (Adlers, BEUYS, Blaue Brigitte, Boothby's, Felix, Mayday, The Paris Club) and Cohibar credits stock libraries.

## What happens on go

1. Remove the 28 live photos (DELETE /api/admin/upload-photo per photo URL) and clear photo_credit on those 28 rows. Each profile falls back to no photo; they join the task 134 backfill pool with the audit applied.
2. Publish the 17 passing 133 candidates, one per bar, credited "Photo: <Bar name>": champagne-suzy-ljubljana, delano-nice, herbary-riga, herno-gin-bar-goteborg, junimperium-baar-tallinn, le-bar-du-couvent-nice, makonis-riga (01), montana-seville (01), neboticnik-ljubljana, neringa-lobby-bar-vilnius (01), phi-cocktail-bar-sofia, skybar-vilnius, skyline-bar-riga (02), sputnik-cocktail-bar-sofia (02), stranger-goteborg (01), the-cocktail-bar-sofia, varsovia-valencia (01).
3. Drop the other 24 staged bars (22 failing plus stage-bar and imperial-rooftop), including BEUYS, delete every unchosen file and clear outreach/photos-staged.
4. Keep this audit (source URL, page, finding) as the record for every photo.

Note: the-cocktail-bar-sofia's own photo has a strongly blurred background by design; it passes the audit but is the softest image in the set.

## Per-photo table

### Fails the audit (50)

| Group | Slug | Country | Result | What was found, and where |
|---|---|---|---|---|
| Heidelberg | 15-high-heidelberg | Germany | removed | Germany/Austria, not from a press or media-kit page. no credit found; source page not recorded at upload and no press page on the site |
| Heidelberg | bent-bar-heidelberg | Germany | removed | Germany/Austria, not from a press or media-kit page. no credit found; source page not recorded at upload and no press page on the site |
| Heidelberg | cocktail-cafe-regie-heidelberg | Germany | removed | Germany/Austria, not from a press or media-kit page. no credit found; source page not recorded at upload and no press page on the site |
| Heidelberg | schilling-roofbar-heidelberg | Germany | removed | Germany/Austria, not from a press or media-kit page. no credit found; source page not recorded at upload and no press page on the site |
| 130 | confessions-brussels | Belgium | removed | IPTC/XMP By-line and Copyright: Antonin Weber / Hans Lucas |
| 130 | under-the-stairs-brussels | Belgium | removed | EXIF/IPTC/XMP Artist: Jonathan Maloney for What The Fox Studio; filename "whatthefox" |
| 130 | esplanade-1925-lounge-cocktail-bar-zagreb | Croatia | removed | XMP dc:creator: Rajan Milosevic; Copyright: LEVEL52 |
| 130 | sauvage-lyon | France | removed | source page footer: "Photos by Nicolas Villion" |
| 130 | galgo-guadalajara | Mexico | removed | EXIF/IPTC/XMP Copyright: MaritzaDemon |
| 130 | 17-bar-porto | Portugal | removed | EXIF/IPTC/XMP Artist and creator: Helder Sousa |
| 130 | rivage-cafe-geneva | Switzerland | removed | EXIF/IPTC/XMP: Guillaume Cottancin (Artist), Guillaume Cottancin-Photographie (Copyright) |
| 130 | writers-bar-istanbul | Turkey | removed | EXIF/IPTC/XMP Copyright: www.fevziondu.com (photographer Fevzi Ondu) |
| 130 | hidden-bar-abu-dhabi | United Arab Emirates | removed | filename "..._HiddenBar_WhatTheFox-0096" (What The Fox Studio, photographers) |
| 130 | cloud-23-manchester | United Kingdom | removed | EXIF/IPTC/XMP: Chris Hanley Photography (Artist, Copyright, creator) |
| 131 | apothecary-lounge-albuquerque | United States | removed | filename "hotel-parq-central-photos-by-viewlio" |
| 131 | batch-tucson | United States | removed | IPTC/XMP By-line, Copyright and creator: NateCooper |
| 131 | daydream-rum-bar-albuquerque | United States | removed | EXIF/IPTC/XMP Artist, Credit and Copyright: Elizabeth Wells Photography |
| 131 | good-for-a-few-oklahoma-city | United States | removed | EXIF/XMP Artist and creator: Payton Marie Photography |
| 131 | hap-hap-lounge-boise | United States | removed | source page (Instagram feed embed): "Cover photo: @deca__gon" |
| 131 | hu-roof-memphis | United States | removed | filename "Garrett-Sweet-Hu.-Interiors-01" (photographer Garrett Sweet) |
| 131 | japps-cincinnati | United States | removed | EXIF/IPTC/XMP Artist: Amy Elisabeth Spasoff for ACBJ; Copyright: Cincinnati Business Courier |
| 131 | little-jumbo-asheville | United States | removed | source page footer: "Art & Photography by Wade Asa" |
| 131 | lucky-day-whiskey-bar-buffalo | United States | removed | IPTC/XMP Copyright and creator: Aaron Ingrao; name also in filename |
| 131 | podmore-honolulu | United States | removed | source page: "Olivier Koning ... Photo Credits" |
| 131 | somerset-cincinnati | United States | removed | IPTC/XMP By-line and Copyright: Catherine Grace Photography; filename "CGPHOTO" |
| 131 | the-jasper-richmond | United States | removed | source page (Instagram embed): "photos @thaddymedia took" |
| 131 | the-moons-daughters-san-antonio | United States | removed | EXIF/IPTC/XMP Artist: Al Argueta, AuthorsPosition: Photographer |
| 131 | thick-as-thieves-boise | United States | removed | XMP dc:rights: ©Byron Mason Photography |
| 133 candidate | adlers-bar-innsbruck | Austria | dropped | Germany/Austria, not from a press or media-kit page. EXIF none; file names on page carry ©mikerabensteiner and ©flomitteregger; Impressum Bildquellen names Mike Rabensteiner |
| 133 candidate | blaue-brigitte-innsbruck | Austria | dropped | Germany/Austria, not from a press or media-kit page. EXIF/IPTC/XMP: Alex Filz Photography |
| 133 candidate | cohibar-graz | Austria | dropped | Germany/Austria, not from a press or media-kit page. Impressum Bildnachweis: iStock and stock-photo credits; no press page |
| 133 candidate | liquid-diary-innsbruck | Austria | dropped | Germany/Austria, not from a press or media-kit page. no credit found; no press or media-kit page on the site |
| 133 candidate | mayday-bar-salzburg | Austria | dropped | Germany/Austria, not from a press or media-kit page. IPTC: Helge Kirchberger Photography / Red Bull Content Pool |
| 133 candidate | pepe-cocktailbar-salzburg | Austria | dropped | Germany/Austria, not from a press or media-kit page. no credit found; no press or media-kit page on the site |
| 133 candidate | sacher-bar-salzburg | Austria | dropped | Germany/Austria, not from a press or media-kit page. no credit found; image from the hotel gallery, not its press area |
| 133 candidate | sketch-bar-lounge-salzburg | Austria | dropped | Germany/Austria, not from a press or media-kit page. no credit found; image from the hotel gallery, not its press area |
| 133 candidate | le-1913-nice | France | dropped | filename "Le-Negresco-Le-bar-c-Gregoire-Gardette" (© Grégoire Gardette) |
| 133 candidate | bar-le-grand-leipzig | Germany | dropped | Germany/Austria, not from a press or media-kit page. no metadata credit; image from the gallery, no press or media-kit page on the site |
| 133 candidate | beuys-bar-dusseldorf | Germany | dropped | Germany/Austria, not from a press or media-kit page. file name "Foto-by-Sascha-Perrone"; signature in the image; dropped as instructed |
| 133 candidate | boothbys-bar-dusseldorf | Germany | dropped | Germany/Austria, not from a press or media-kit page. Impressum: "Weitere Fotografie: Kels Design & Partner" |
| 133 candidate | die-rote-bar-nuremberg | Germany | dropped | Germany/Austria, not from a press or media-kit page. no credit found; no press or media-kit page on the site |
| 133 candidate | falco-the-heavenly-bar-leipzig | Germany | dropped | Germany/Austria, not from a press or media-kit page. no credit found; hotel site has no press or media-kit page for the bar |
| 133 candidate | felix-rooftop-bar-leipzig | Germany | dropped | Germany/Austria, not from a press or media-kit page. EXIF Copyright: filmeuphorie (production company) |
| 133 candidate | gin-house-dresden | Germany | dropped | Germany/Austria, not from a press or media-kit page. no credit found; no press or media-kit page on the site |
| 133 candidate | hideaway-dusseldorf | Germany | dropped | Germany/Austria, not from a press or media-kit page. no credit found; no press or media-kit page on the site |
| 133 candidate | stallwache-westwerk-leipzig | Germany | dropped | Germany/Austria, not from a press or media-kit page. no credit found; no press or media-kit page on the site |
| 133 candidate | the-paris-club-dusseldorf | Germany | dropped | Germany/Austria, not from a press or media-kit page. EXIF/IPTC/XMP Copyright: Kristof Puller |
| 133 candidate | twist-bar-dresden | Germany | dropped | Germany/Austria, not from a press or media-kit page. no credit found (page 403 to scripts, read in browser); hotel gallery, not press area |
| 133 candidate | gimlet-nordic-cocktail-bar-riga | Latvia | dropped | IPTC/XMP By-line and creator: Arturs Vanags |
| 133 candidate | b-bar-ljubljana | Slovenia | dropped | EXIF/IPTC/XMP Artist: Will Pryce; Copyright: "may only be used after agreement of fees with Will Pryce" |

### Passes the audit (72)

| Group | Slug | Country | Result | What was found, and where |
|---|---|---|---|---|
| 130 | chemistry-and-botanics-brussels | Belgium | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | la-pharmacie-anglaise-brussels | Belgium | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | the-modern-alchemist-brussels | Belgium | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | alcove-shenzhen | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | dsk-cocktail-club-guangzhou | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | liang-guangzhou | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 130 | long-bar-shenzhen | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | mo-bar-beijing | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 130 | the-loft-guangzhou | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 130 | too-high-guangzhou | China | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | el-coro-lounge-bar-cartagena | Colombia | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | bar-casa-bordeaux | France | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | le-comptoir-de-la-bourse-lyon | France | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | point-rouge-bordeaux | France | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | azotea-turin | Italy | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | bidder-bar-naples | Italy | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | d-one-turin | Italy | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | smile-tree-turin | Italy | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | dom-whisky-cocktail-bar-gdansk | Poland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | dom-whisky-cocktail-bar-wroclaw | Poland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | eliksir-gdansk | Poland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | high-5-terrace-bar-gdansk | Poland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | papa-bar-wroclaw | Poland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | szkocka-cocktail-bar-wroclaw | Poland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | big-bad-bank-bar-porto | Portugal | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | onterrace-porto | Portugal | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page; page 403 to scripts, read in browser: no credit |
| 130 | mo-bar-geneva | Switzerland | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 130 | dragons-tooth-abu-dhabi | United Arab Emirates | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | perlage-abu-dhabi | United Arab Emirates | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | the-st-regis-bar-abu-dhabi | United Arab Emirates | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | arcane-manchester | United Kingdom | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 130 | tabac-glasgow | United Kingdom | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | the-daisy-manchester | United Kingdom | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | the-locale-glasgow | United Kingdom | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 130 | angelina-hanoi | Vietnam | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | bar-1919-san-antonio | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | bar-dkdc-memphis | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | character-study-asheville | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | eleven-honolulu | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | ep-bar-honolulu | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 131 | fanboy-richmond | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | high-violet-buffalo | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | longfellow-cincinnati | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | mathers-social-gathering-orlando | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | nowhere-special-indianapolis | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | o-bar-oklahoma-city | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | owls-club-tucson | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | saint-neri-buffalo | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | solaire-rooftop-richmond | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 131 | sternewirth-san-antonio | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | tenfold-rooftop-san-antonio | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | the-dame-memphis | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | the-vault-at-the-national-oklahoma-city | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page (footer © is the venue or hotel group, not a photographer) |
| 131 | the-vault-indy-indianapolis | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 131 | vue-rooftop-lounge-buffalo | United States | kept | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | phi-cocktail-bar-sofia | Bulgaria | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page; second download succeeded: no metadata; page clean |
| 133 candidate | sputnik-cocktail-bar-sofia | Bulgaria | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | the-cocktail-bar-sofia | Bulgaria | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | junimperium-baar-tallinn | Estonia | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | delano-nice | France | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | le-bar-du-couvent-nice | France | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | herbary-riga | Latvia | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | makonis-riga | Latvia | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | skyline-bar-riga | Latvia | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | neringa-lobby-bar-vilnius | Lithuania | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | skybar-vilnius | Lithuania | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page; page 403 to scripts, read in browser: only the hotel group © |
| 133 candidate | champagne-suzy-ljubljana | Slovenia | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | neboticnik-ljubljana | Slovenia | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | montana-seville | Spain | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | varsovia-valencia | Spain | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | herno-gin-bar-goteborg | Sweden | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |
| 133 candidate | stranger-goteborg | Sweden | passes | no Artist/Creator/Copyright/Credit in EXIF, IPTC or XMP; no watermark or signature; no photographer credit on the page |