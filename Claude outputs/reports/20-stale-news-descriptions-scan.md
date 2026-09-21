# Report: 20-stale-news-descriptions-scan (2026-09-15, 19:52 to 19:55 PT)

## Method

Read 1348 active bars (is_active = true) from the Supabase REST endpoint with the service role key from .env.local, selecting id, slug, name, city, country, description, short_excerpt, website, instagram and wp_article_slug, ordered by slug. Paged explicitly in steps of 1000 with offset and limit: 2 pages, page sizes 1000 and 348, stopping when a page returned fewer than 1000 rows. Nothing was written. The scan ran with python3 and regular expressions only.

Important finding on the example. The Scarfes Bar blurb Roman quoted ("Scarfes Bar will mark International Women's Month ...") is NOT in the description column. It sits in short_excerpt, which for that row was copied from the WordPress news article scarfes-bar-hosts-international-womens-month-talks. The description column for Scarfes is a proper profile. Because of that, every rule was run twice, once over description (as asked) and once over short_excerpt. On the site, description is what the bar page renders (src/app/bars/[slug]/page.tsx uses bar.description or a generated fallback), while short_excerpt is used as the one-liner in nearby cards (src/lib/nearby.ts), as the JSON-LD description on best-bars city pages, and as the visible fallback text on best-bars and collections pages when description is empty.

Rules, applied to the trimmed text of each non-empty field:

- A. Opens with the bar name (case-insensitive, punctuation stripped, a leading "The" ignored on both sides) and within the next 6 words has one of: will, is set to, announces, has announced, is hosting, hosts, launches, is launching.
- B. Contains a weekday name followed by an optional comma and then either "Month D" or "D Month" (e.g. Tuesday, March 10 or Friday 3 May), or one of the whole-word phrases this month, this week, next week, tonight (case-insensitive).
- C. The trimmed text does not end in one of . ! ? " (closing curly quote) or ), i.e. it ends mid-word or without terminal punctuation.
- D. Fewer than 40 whitespace-separated words.

Known blind spot of rule C: Scarfes Bar's description is itself cut off ("... At No. ") but ends with a period, so C does not catch it. A cheap follow-up rule would be "ends with a capitalized token of 1 to 3 letters plus a period" (No., St., Mr.).

## Counts

### description column (the field the bar page renders)

- Rows read: 1348
- Empty or null description: 149 (not listed below)
- Rule A: 0
- Rule B: 0
- Rule C: 0
- Rule D: 157
- Rows hitting any rule: 157 (all of them hit D only; no description row hits A, B or C)

Inside the 157 rule-D rows there are two mechanical subgroups worth separating from the genuinely short but fine descriptions: 9 rows carry the placeholder sentence "Discover it on BarMagazine, the global bar directory." (all Dubai imports such as 1920, blind-tiger, gaba, galaxy-bar, honeycomb-hi-fi, lpm-dubai, mimi-kakushi, salmon-guru-dubai, clap-ongaku), and 27 rows are two-sentence stubs of the form "X is a cocktail bar located in City. Tag." (India and Bangkok imports such as 1q1, asia-today, harbour-bar, masque, tamasha, smalls). The remaining rows are mostly 24 to 39 word descriptions that read as real copy and only fail the length threshold.

### short_excerpt column (where the quoted news blurb actually lives)

- Empty or null short_excerpt: 869
- Rule A: 1
- Rule B: 1
- Rule C: 14
- Rule D: 479 (an excerpt is short by design, so D is not meaningful for this column and is reported only for completeness)
- Rows hitting A, B or C: 14

Of those 14, two are dated news copied from WordPress articles: scarfes-bar (International Women's Month talks, "Tuesday, March 10", cut mid-word) and himkok ("Himkok is turning 10 ... From April 4-6 ... will host a landmark three-day celebration", cut mid-sentence, wp_article_slug himkok-turns-10-with-global-bar-takeovers). The other 12 are marketing paragraphs that were cut at 200 characters mid-sentence (rule C), mostly North America's 50 Best entries with HTML entities such as &#8220; still in the text (cure, rayo, superbueno, true-laurel, the-wolves, himkok). atwater-cocktail-club also has its opening clause duplicated ("One of Montreal's most charismatic bars, One of Montreal's most charismatic bars, ...").

## Flagged rows, description column

Sorted by number of rules hit (descending), then slug. All 157 rows hit exactly one rule (D), so the order is alphabetical by slug. Words column added for convenience.

| slug | city | rules hit | words | first 120 chars of description |
|---|---|---|---|---|
| 1920 | Dubai | D | 16 | 1920 is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| 1q1 | Bengaluru | D | 9 | 1Q1 is a speakeasy located in Bengaluru. Speakeasy concept. |
| 9-below | Dublin | D | 38 | A basement cocktail bar beneath the historic Stephen's Green Hibernian Club, spread across four intimate rooms. It speci |
| alenka-cocktail-bar-prague | Prague | D | 32 | An Alice in Wonderland-themed cocktail bar in Prague's Malá Strana, where drinks are framed as experiences and rituals b |
| alto-rooftop | Cervia | D | 36 | Alto Rooftop sits on top of the Villa del Mare Spa Resort in Cervia, a rooftop cocktail bar and restaurant with a pool o |
| ananasa-tri | Belgrade | D | 29 | A tropical-themed cocktail bar on Vlajkovićeva street in central Belgrade, focused on craft mixology. The bar hosts gues |
| anonymous-bar | Prague | D | 38 | A conspiracy-themed cocktail bar in Prague's Old Town inspired by the 1605 Gunpowder Plot, V for Vendetta and the hacker |
| apotheke-los-angeles | Los Angeles | D | 36 | The Los Angeles outpost of New York's Apothéke, set in Chinatown on North Spring Street. The bar applies the group's apo |
| asia-today | Bangkok | D | 11 | Asia Today is a cocktail bar located in Bangkok. Asia's 51-100. |
| backroom-bar | Buenos Aires | D | 27 | Backroom calls itself a 'bar de autores', artisanal cocktails, Mediterranean tapas and live jazz in Palermo, open until |
| bar-1912 | Phoenix | D | 21 | Bar 1912 is the bar at Valentine in Phoenix's Melrose District, pouring cocktails alongside one of the neighborhood's mo |
| bar-americano | Melbourne | D | 38 | A very small standing-room-only bar in a laneway off Howey Place, serving only classic cocktails. The venue is styled af |
| bar-bellamy | Melbourne | D | 38 | A neighborhood bistro and cocktail bar on Rathdowne Street in Carlton. Both the food and drinks menus change seasonally, |
| bar-carmen | Medellín | D | 35 | Located within the celebrated Carmen restaurant in Medellín's El Poblado neighborhood, Bar Carmen offers a vibrant cockt |
| bar-hommage | Stockholm | D | 39 | A restaurant and bar on Krukmakargatan on Södermalm. The bar opens earlier than the dining room and operates as a separa |
| bar-lis | Los Angeles | D | 34 | A rooftop lounge styled after the Côte d'Azur, sitting atop the Hollywood Grande hotel (formerly Thompson Hollywood) on |
| bar-maaya-toronto | Toronto | D | 38 | An upscale cocktail bar in Toronto's Entertainment District pairing Eastern flavors with Western technique in its hand-c |
| bar-madonna | New York | D | 37 | An Italian-American inspired cocktail bar in Williamsburg, Brooklyn, opened in 2024. The bar pairs an avant-garde cockta |
| bar-raval | Toronto | D | 33 | Grant van Gameren's Spanish-style bar in Little Italy, known for its undulating Gaudí-esque carved mahogany interior and |
| bar-twentyseven | Amsterdam | D | 39 | A luxury cocktail bar inside Hotel TwentySeven, overlooking Dam Square in central Amsterdam. Bartenders craft bespoke co |
| barcoa-agaveria | Phoenix | D | 26 | Barcoa Agaveria is Phoenix's temple to agave, a street-level cantina over a basement bar pouring craft cocktails and fli |
| behind-bar | Buenos Aires | D | 31 | 'Sin etiquetas. Con intensidad.' Behind is Palermo's no-labels party bar, energy, emotion and real connection on Costa R |
| beyond-the-bar | Prague | D | 36 | A craft cocktail bar in Prague's Old Town serving signature Asian-inspired drinks built on inventive ingredients like cl |
| bitter-and-twisted | Phoenix | D | 39 | Bitter & Twisted pours award-winning cocktails inside downtown's historic Luhrs Building, once home to the Arizona Prohi |
| bitter-bar | Florence | D | 33 | Bitter Bar calls itself the only bar in Florence inspired by the 1920s, a Sant'Ambrogio room of relaxed atmosphere, good |
| blind-tiger | Dubai | D | 17 | Blind Tiger is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| bob-s-bar | Bengaluru | D | 12 | Bob's Bar is a cocktail bar located in Bengaluru. India bar awards. |
| botanero | Rotterdam | D | 39 | Botanero brings the Latin American mix of bar, restaurant, cantina, and tasting room to Rotterdam, serving cocktails, bo |
| byg-brewski-brewing-company | Bengaluru | D | 13 | Byg Brewski Brewing Company is a brewery located in Bengaluru. India's largest microbrewery. |
| byrdi | Melbourne | D | 33 | Byrdi is a bar that is uniquely Australian, where the local environment informs the drinks. Led by award-winning bartend |
| cafe-bar-pilotu | Prague | D | 29 | A neighborhood cocktail bar in Prague's Vršovice district whose own tagline is cocktails, spirits, wine, street food & j |
| cilim-bar | Belgrade | D | 36 | A cocktail and wine bar at Kapetan Mišina 5 in Belgrade's Stari Grad, open every day from 6pm. Its Ćilim Shift guest nig |
| clap-ongaku | Dubai | D | 18 | Ongaku by Clap is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| cobbler-crew | Pune | D | 22 | Cobbler & Crew is a cocktail bar in Kalyani Nagar with a global bar food program and a trivia night every Thursday. |
| cocktails-dreams | New Delhi | D | 15 | Cocktails & Dreams is a cocktail bar located in New Delhi. 30 Best Bars India. |
| copitas | Bengaluru | D | 13 | Copitas is a cocktail bar located in Bengaluru. 30 Best Bars India #6. |
| craftroom | Osaka | D | 37 | Craftroom is a six-seat counter bar in the basement of the Osaka Ekimae Daiichi Building in Umeda, behind a concealed en |
| damn-the-weather | Seattle | D | 24 | A Pioneer Square fixture, Damn the Weather pairs a serious cocktail list with a proper kitchen, stays open late, and kee |
| dark-room | Seattle | D | 26 | Dark Room is Greenwood's craft cocktail bar, run by bartender Matthew Gomez and chef Amy Beaumier, with a Golden Hour ea |
| don-woods-say-when | Phoenix | D | 35 | Don Woods' Say When is the rooftop bar at the Rise Uptown Hotel, an intimate lounge with views over Camelback Road and d |
| door-74 | Amsterdam | D | 39 | A hidden speakeasy on Reguliersdwarsstraat and one of the Netherlands' oldest and most prolific cocktail bars, with over |
| drink-art-gallery | Rome | D | 31 | On Piazza del Fico, Drink Art Gallery recreates the 1930s atmosphere of American bars, cocktails and fine spirits alongs |
| druid-bar | Belgrade | D | 22 | A speakeasy-style cocktail bar in Belgrade's Stari Grad district, an intimate, rustic space serving carefully crafted co |
| ek-bar | New Delhi | D | 13 | Ek Bar is a cocktail bar located in New Delhi. Indian ingredients focus. |
| el-primo-sanchez | Sydney | D | 28 | El Primo Sanchez is The Maybe Group's Mexican cocktail bar in Surry Hills, a Crown Street sibling of Maybe Sammy with ag |
| elephant-and-co | Pune | D | 32 | Elephant & Co. is the Kalyani Nagar original of a group that has since added a second Pune room in Baner and one in Goa. |
| eleven11 | Nashville | D | 34 | Eleven11 describes itself as a cocktail bar, discotheque and restaurant under one roof on Dickerson Pike in Nashville. T |
| erin-rose | New Orleans | D | 29 | A French Quarter neighborhood bar known for its frozen Irish coffee. Food is served inside the bar by Killer Poboys. The |
| find-the-locker-room | Bangkok | D | 13 | Find The Locker Room is a speakeasy located in Bangkok. Hidden bar concept. |
| fitzs-bar | Amsterdam | D | 39 | Fitz's Bar brings the 1920s cocktail scene to life at Oosterpark, pairing classic drinks with modern techniques. Named C |
| fonda-del-barrio | San Diego | D | 20 | Fonda del Barrio's cocktail program is curated by Partner/Lead Bartender Rudy Corona, focusing on Mexican spirits of teq |
| four-walls | Nashville | D | 33 | Four Walls calls itself an intimate bar for the cocktail enthusiast, hidden within The Joseph hotel in SoBro. The list i |
| franks-bar-kuala-lumpur | Kuala Lumpur | D | 36 | A speakeasy on Level 3 of Avenue K, opposite KLCC, Frank's channels the Prohibition era and Frank Sinatra's golden age o |
| friends-of-friends | Chicago | D | 36 | Friends of Friends is a neighborhood cocktail bar in West Town with an emphasis on classic, distinct flavors. The room r |
| gaba | Dubai | D | 16 | GABA is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| gaia-cocktails | Copenhagen | D | 38 | A story-driven cocktail bar in Copenhagen's Latin Quarter built around an Alice in Wonderland theme, branded #GaiaWonder |
| galaxy-bar | Dubai | D | 17 | Galaxy Bar is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| guarita-bar | São Paulo | D | 35 | A 'good time bar' in Pinheiros where the drinks are boozy but expertly made, Guarita crosses boteco informality with ser |
| harbour-bar | Mumbai | D | 13 | Harbour Bar is a hotel bar located in Mumbai. India's oldest licensed bar. |
| highball-phoenix | Phoenix | D | 22 | Highball is downtown Phoenix's cozy, elevated neighborhood cocktail bar and lounge, celebrated for its deep spirits coll |
| himkok | Oslo | D | 39 | Himkok, Norwegian for moonshine, is an Oslo institution built around its own working distillery, producing the aquavit, |
| honeycomb-hi-fi | Dubai | D | 17 | Honeycomb Hi-Fi is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| identidad | San Juan | D | 39 | Identidad calls itself the meeting point of flavor, creativity and Caribbean culture, an intimate room on Calle Cerra in |
| isabel-speakeasy | Belgrade | D | 24 | A hidden speakeasy-style cocktail bar on Njegoševa street in central Belgrade, presenting itself as a Belgrade Confident |
| jewel-box | Portland | D | 39 | Jewel Box is a cocktail bar on Congress Street in Portland, Maine, open from six in the evening until one, with alcohol- |
| juju | Pune | D | 31 | Juju is a Mexican tapas bar in Kalyani Nagar, built on agave in a market where that focus is still rare. It opens throug |
| juniper-bar | New Delhi | D | 12 | Juniper Bar is a hotel bar located in New Delhi. Botanical cocktails. |
| kaona-room | Miami | D | 38 | A hidden 45-seat "speaky-tiki" tucked inside The Leinster Irish Pub near Miami Worldcenter, blending Polynesian traditio |
| killer-whale-sex-club | Phoenix | D | 36 | All killer, no filler is the house line at Killer Whale Sex Club, the Pour Bastards Hospitality cocktail bar on Roosevel |
| kultura-bar | Belgrade | D | 29 | An all-day café and cocktail bar on Kralja Milutina in Belgrade's Vračar district, open from morning until midnight and |
| kumandra | Kragujevac | D | 34 | An all-day lounge and cocktail bar in Kragujevac known for creative signature cocktails, open daily from morning until m |
| la-drogheria | Turin | D | 38 | Spicing life since 2002, La Drogheria on Turin's Piazza Vittorio Veneto mixes cocktails, food, and a bazar of goods in a |
| la-menagere-rome | Rome | D | 29 | The Roman outpost of Florence's La Ménagère concept space sits in the Colonna district, in a Baroque building that was h |
| la-sala-de-laura | Bogotá | D | 35 | An urban space with a sophisticated ambience above Leo Restaurante in Bogotá, drawing inspiration from Colombia's biodiv |
| last-word | Singapore | D | 38 | A cocktail bar and restaurant from the team behind Nutmeg & Clove, named after the classic Last Word cocktail. The progr |
| le-mal-necessaire | Montreal | D | 38 | A tiki-leaning cocktail bar that relocated from its original Chinatown basement to Montreal's International District, wh |
| lfleur | Prague | D | 39 | An Old Town bar where cocktails and wine, champagne in particular, are given equal prominence. The room pairs exposed br |
| library-bar | Bengaluru | D | 39 | The lobby-level bar of The Leela Palace Bengaluru, styled after a colonial-era library with leather armchairs, dark wood |
| lobster-bar | Hong Kong | D | 34 | One of the bars and restaurants of the Island Shangri-La hotel at Pacific Place. It is listed among the hotel's current |
| lola-bar | Miami | D | 31 | A cocktail bar in Suite 118 of Bayside Marketplace on Biscayne Boulevard, pouring classic and signature cocktails alongs |
| lounge-bohemia | London | D | 30 | An unsigned, reservation-only subterranean cocktail lounge near Shoreditch High Street station, one of London's original |
| lpm-dubai | Dubai | D | 32 | LPM Dubai is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. The latest lists place |
| mad-souls-spirits | Florence | D | 31 | Mad, Souls & Spirits keeps San Frediano supplied with drinks every night of the week: good music, fresh cocktails and a |
| malaka-spice | Pune | D | 31 | Malaka Spice has served South East Asian cooking in Pune for close to three decades. This listing is the Koregaon Park o |
| manolito | New Orleans | D | 31 | A Cuban-inspired cocktail bar and restaurant in the French Quarter serving daiquiris and other rum-based drinks. It oper |
| marea-cocktailbar | Zurich | D | 29 | A cocktail bar on Zurich's Limmatquai with a seasonally changing menu of creative craft cocktails. It operates walk-in o |
| masque | Mumbai | D | 11 | Masque is a restaurant bar located in Mumbai. Progressive Indian, farm-to-table. |
| mercy-brown | Kraków | D | 35 | Mercy Brown is Krakow's unsigned cocktail bar, established in 2015 on Straszewskiego street, pairing composed drinks wit |
| millys | New York | D | 31 | Milly's is a neighborhood cocktail bar with live music on Greene Avenue in Bed-Stuy, named a Regional Top 10 Honoree for |
| mimi-kakushi | Dubai | D | 29 | Mimi Kakushi is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. It sits at No. 36 on |
| miss-t | Mumbai | D | 11 | Miss T is a cocktail bar located in Mumbai. Southeast Asian-inspired. |
| never | Barcelona | D | 24 | Never is a Raval neighborhood bar that puts its pitch simply: cocktails, good wines, snacks, and, in its own words, a sp |
| old-glory | Nashville | D | 27 | Old Glory is an unsigned room in Edgehill, reached by finding the golden triangle off Edgehill Avenue. It takes reservat |
| old-pal | Belgrade | D | 29 | A craft cocktail bar in Belgrade's Dorćol quarter, billing itself simply as a cocktail bar with expertly crafted drinks. |
| ounce-taipei | Taipei | D | 38 | One of the bars that brought the speakeasy to Taipei, Ounce channels 1920s Prohibition style at its Dunhua South Road ho |
| pearl-diver | Nashville | D | 28 | Pearl Diver is a tropical cocktail bar and restaurant in East Nashville with a planted patio and cabanas, pouring throug |
| piano-35-lounge-bar | Turin | D | 39 | Piano 35 is Turin's highest bar, a lounge and restaurant 167 meters up the Intesa Sanpaolo skyscraper with a bioclimatic |
| picco | São Paulo | D | 37 | Picco runs on four elements, cocktails, pizza, music and art: classic-leaning drinks and Neapolitan-style pies in a stre |
| prankster | New Delhi | D | 12 | Prankster is a cocktail bar located in New Delhi. Modern cocktail bar. |
| pretty-penny | Phoenix | D | 29 | Pretty Penny is a neighborhood restaurant and cocktail bar on Roosevelt Street serving internationally inspired small pl |
| prost-brew-pub | Bengaluru | D | 10 | Prost Brew Pub is a brewpub located in Bengaluru. German-style. |
| q-bar | Belgrade | D | 29 | A cocktail bar at Milutina Bojića 2 in central Belgrade, where the team introduces house creations such as the Q*Driver |
| qora | Pune | D | 24 | Qora is a cocktail bar and kitchen on Lane 8 in Koregaon Park, pairing what it calls an elevated cocktail experience wit |
| rabbit-hole | Bangkok | D | 11 | Rabbit Hole is a speakeasy located in Bangkok. Bangkok speakeasy scene. |
| rasputin | Florence | D | 28 | Rasputin is Florence's secret bar: 'somewhere in Santo Spirito' is all the address it publishes, the exact location reve |
| real-charmer | Los Angeles | D | 35 | Real Charmer is a cocktail bar in Virgil Village that the Spirited Awards named a Regional Top 10 Honoree for Best New U |
| revolucion-cocktail | Shanghai | D | 30 | Part of the Latin party-bar brand Revolucion Cocktail, 'Drinks, Music and Shows!', known for themed parties from beach t |
| rita-s-tiki-room | Milan | D | 28 | Rita's tiki sibling on the Ripa di Porta Ticinese, cocktails and food under the banner of tiki and the pop culture of th |
| rob-roy-seattle | Seattle | D | 34 | 'A CLASSIC COCKTAIL BAR', says Rob Roy of itself, and the Belltown room lives up to it, open until 2am seven nights, 21- |
| rosa-sky | Miami | D | 32 | A 22nd-floor rooftop lounge in Brickell with panoramic views of the Miami skyline. The bar serves handcrafted cocktails |
| saikindo | Abu Dhabi | D | 39 | Saikindō is a Japanese hi-fi listening bar at Four Seasons Hotel Abu Dhabi on Al Maryah Island, opened in November 2025. |
| salmon-guru-dubai | Dubai | D | 17 | Salmon Guru is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory. |
| scotch-lodge | Portland | D | 39 | A below-ground whisky and cocktail bar in Portland, open nightly from Wednesday to Sunday. Its back bar is built around |
| shakerato | Amsterdam | D | 38 | Shakerato is the Amsterdam bar from Eric van Beek and the team behind Handshake Speakeasy, No. 2 in the World's 50 Best |
| sins-of-sal | Amsterdam | D | 35 | Sins of Sal is a Latin cocktail bar in Amsterdam's Jordaan, serving hyper-creative drinks and Latin street food late int |
| sky-bar-bratislava | Bratislava | D | 35 | A two-floor rooftop bar and restaurant above Hviezdoslavovo námestie with panoramic views over the city center. The prog |
| sky-leme-rooftop-lounge | Rio de Janeiro | D | 38 | The rooftop of the Novotel Rio de Janeiro Leme looks down the full crescent of Leme and Copacabana beaches, a relaxed po |
| sly-granny | New Delhi | D | 12 | Sly Granny is a cocktail bar located in New Delhi. Contemporary Indian. |
| small-victory | Austin | D | 39 | A cocktail bar in downtown Austin focused on classic cocktails, with a food offering built around charcuterie boards. Th |
| smalls | Bangkok | D | 11 | Smalls is a jazz bar located in Bangkok. Jazz and cocktails. |
| sunken-harbor-club | New York | D | 36 | A tiki and tropical cocktail bar on the second floor above the historic restaurant Gage & Tollner in Downtown Brooklyn. |
| super-lyan | Amsterdam | D | 34 | Super Lyan is Mr Lyan's colorful Amsterdam cocktail bar in a 17th-century canal house, serving playful reinventions of t |
| tales-bar | Zurich | D | 37 | Self-described as Das Cocktail-Wohnzimmer, the cocktail living room of Zurich, a late-night cocktail bar run by hosts Mi |
| tamasha | New Delhi | D | 10 | Tamasha is a cocktail bar located in New Delhi. Theater-themed. |
| techo | Austin | D | 36 | Techo is a mezcal and tequila bar on Manor Road in East Austin, in a speakeasy setting with a patio above a Tex-Mex rest |
| teens-of-thailand | Bangkok | D | 14 | Teens of Thailand is a cocktail bar located in Bangkok. #42 Asia's 50 Best. |
| tep-bar | Bangkok | D | 14 | Tep Bar is a cultural bar located in Bangkok. Thai music and herbalist traditions. |
| tesouro | Mumbai | D | 12 | Tesouro is a cocktail bar located in Mumbai. 30 Best Bars India. |
| the-bar-with-no-name | London | D | 36 | An intimate hidden cocktail bar in Islington known as The Bar With No Name, serving expertly crafted cocktails, aperitif |
| the-blue-bar | New Delhi | D | 38 | The Taj Palace's poolside bar does moody lighting and a chilled evening pace, international cocktails, vintage wines and |
| the-blue-pub | São Paulo | D | 38 | An authentic English pub off Avenida Paulista since January 2008, The Blue Pub gathers foreigners and locals over intern |
| the-brick-space | Rome | D | 37 | An all-day bar and café on Piazza Vittorio Emanuele II in Rome's Esquilino district, near Termini. It runs from morning |
| the-cocktail-trading-company | London | D | 38 | An award-winning cocktail bar created by three experienced bartenders, just off Brick Lane in Shoreditch. The menu puts |
| the-fox-bar-cocktail-club | Nashville | D | 34 | The Fox Bar & Cocktail Club sits on Gallatin Pike in East Nashville, a few doors from Tiger Bar on the same stretch, and |
| the-living-room | New Delhi | D | 13 | The Living Room is a hotel bar located in New Delhi. Luxury cocktails. |
| the-london-edition-lobby-bar | London | D | 39 | An all-day bar in the lobby of The London EDITION hotel on Berners Street, designed for both work and play, with tufted |
| the-long-island-bar | New York | D | 38 | A restored mid-century corner bar and restaurant on Atlantic Avenue at the edge of Cobble Hill, a Brooklyn landmark serv |
| the-normandie-club | Los Angeles | D | 35 | A neighborhood cocktail bar inside the 1926 Hotel Normandie in Koreatown, operating since 2015. The drink program spans |
| the-permit-room | Bengaluru | D | 12 | The Permit Room is a cocktail bar located in Bengaluru. South Indian-inspired. |
| the-piano-man-jazz-club | New Delhi | D | 17 | The Piano Man Jazz Club is a jazz bar located in New Delhi. Live jazz + cocktails. |
| the-spirit | Milan | D | 39 | A Porta Romana cocktail bar surrounded by rare spirits from all over the world, unusual mixed ingredients in a room buil |
| the-sun-tavern | London | D | 38 | A neighborhood bar on Bethnal Green Road serving classically inspired cocktails alongside local craft beers, London's la |
| the-white-elephant-cocktail-bar | Miami | D | 38 | A Wynwood cocktail bar built around bold design, lush greenery and a playful, dressed-up atmosphere. The drinks program |
| thyme-bar | New York | D | 25 | An underground speakeasy-style cocktail lounge set in a historic pre-war cellar beneath 23rd Street in the Flatiron Dist |
| ticonderoga-club | Atlanta | D | 38 | A cocktail bar and restaurant located in Krog Street Market in Atlanta, serving cocktails alongside a food menu. It is o |
| ticuchi | Mexico City | D | 37 | Enrique Olvera's dark, cave-like agave den in Polanco: an atmospheric room around an open kitchen, an extensive mezcal l |
| tiger-bar | Nashville | D | 30 | Tiger Bar describes itself as a 1930s sideshow inspired gin joint, on the East Nashville stretch of Gallatin Pike. It op |
| tiki-bar-athens | Athens | D | 35 | 'The Original Exotica Bar since 2007', Athens' first tiki bar sits in Makrygianni near the Acropolis, pouring Mai Tais, |
| time-social-bar | Venice | D | 34 | TiME Social Bar pours natural wines and artisanal cocktails alongside traditional and modern cicchetti in the heart of V |
| tipsy-flamingo-cocktail-bar | Miami | D | 38 | A Downtown Miami cocktail bar trading in bold drinks and a laid-back tropical mood, open until the small hours seven nig |
| toast-tonic | Mumbai | D | 11 | Toast & Tonic is a cocktail bar located in Bengaluru. Farm-to-bar. |
| tropezon-miami | Miami | D | 35 | A Spanish-inspired gin bar and tapas restaurant on Miami Beach's historic Española Way. The kitchen turns out paella and |
| viajero-oaxaca-rooftop-bar | Oaxaca | D | 35 | The rooftop restobar of the Viajero Oaxaca hostel claims 'the best view of the historic center', a traveler-and-local ga |
| windmills-craftworks | Bengaluru | D | 11 | Windmills Craftworks is a brewpub located in Bengaluru. Craft beer pioneer. |
| wing-lei-bar | Macau | D | 34 | At the heart of Wynn Palace, Wing Lei Bar is a crossroads where East meets West. Home to the Asia's 50 Best Bars 2025 ce |
| woodside-inn | Mumbai | D | 12 | Woodside Inn is a pub located in Mumbai. Craft beer + cocktails. |
| xaman-bar | Mexico City | D | 32 | A subterranean den in Juárez, Xaman draws on pre-Hispanic Mexico, shamanic ritual as the mood, plant-based ingredients a |

## Flagged rows, short_excerpt column (A, B or C only)

| slug | city | rules hit | wp_article_slug | first 120 chars of short_excerpt |
|---|---|---|---|---|
| scarfes-bar | London | ABCD | scarfes-bar-hosts-international-womens-month-talks | Scarfes Bar will mark International Women’s Month with a dedicated afternoon of talks and networking on Tuesday, March 1 |
| atwater-cocktail-club | Montreal | CD |  | One of Montreal’s most charismatic bars, One of Montreal’s most charismatic bars, Atwater Cocktail Club ranks among Nort |
| bar-mordecai | Toronto | CD |  | Inspired by the whimsical charm of Wes Anderson’s films, Bar Mordecai captures the timeless essence of classic hotel lob |
| cure | New Orleans | CD |  | Cure, proudly positioned at No. 47 in "The World's 50 Best Bars in North America," is celebrated for i |
| employees-only | New York | CD |  | Employees Only is one of New York City’s most renowned speakeasies, blending Art Deco elegance with world-class hospital |
| himkok | Oslo | CD | himkok-turns-10-with-global-bar-takeovers | Acclaimed Norwegian cocktail bar and distillery Himkok is turning 10, and it's celebrating in style. From April 4- |
| jewel-of-the-south | New Orleans | CD |  | Ranked #1 Bar in the South USA and #34 in The World’s 50 Best Bars, Jewel of the South is a true celebration of New Orle |
| meadowlark | Chicago | CD |  | Ranked No. 37 in North America’s 50 Best Bars 2024, Meadowlark is a dimly lit, vintage Chicago-style cocktail haven, hid |
| melange-by-cali-sober | New Orleans | CD |  | Mélange by Cali Sober sits above Bamboula’s on Frenchmen Street, but it feels like a preview of where nightlife is headi |
| overstory | New York | CD |  | Located on the 64th floor, Overstory is a contemporary cocktail bar in New York City’s Financial District, ranked as the |
| rayo | Mexico City | CD |  | Ranked 5th among "The World's 50 Best Bars in North America," Rayo skillfully combines ancient Mayan i |
| superbueno | New York | CD |  | Superbueno, ranked No. 2 in "The World's 50 Best Bars" in North America, has also been honored as the |
| the-wolves | Los Angeles | CD |  | Located in the historic Alexandria Hotel, The Wolves is celebrated as one of Downtown LA's most distinct cocktail |
| true-laurel | San Francisco | CD |  | True Laurel, featured in "The World's 50 Best Bars" at No. 30, showcases cocktails that highlight loca |

## Proposed replacements, first 10 rows of the description list

Each paragraph is written only from the bar's own website fetched today. Where the site had too little, or there was no site, it says so and no paragraph is given. Word counts are 60 to 110 where a paragraph exists.

### 1. 1920 (Dubai, United Arab Emirates)

Current description: "1920 is a cocktail bar in Dubai, UAE. Discover it on BarMagazine, the global bar directory."

Proposed (103 words):

1920 is a Prohibition-themed speakeasy on the 51st and 52nd floors of ICD Brookfield Place in Dubai's DIFC. The room leans on Art Deco styling and on its position high above the city, with views over the Dubai skyline. The drinks list is built around Twenties-inspired cocktails alongside a selection of rare labels, with cigars also offered, and the kitchen sends out what the bar calls speakeasy bites with a modern twist. Music is part of the concept: sunset sessions lead into live performances and vinyl DJ sets that run late into the night. The site does not name an owner or operator.

Source: https://1920.ae

### 2. 1Q1 (Bengaluru, India)

Current description: "1Q1 is a speakeasy located in Bengaluru. Speakeasy concept."

No website and no Instagram handle on the row, so there was no primary source to fetch. No paragraph.

### 3. 9 Below (Dublin, Ireland)

Current description: "A basement cocktail bar beneath the historic Stephen's Green Hibernian Club, spread across four intimate rooms. It specializes in craft cocktails with menus drawing on surrealist art and color theory, and also operates as a private events space."

Proposed (101 words):

9 Below is a cocktail bar and lounge in the former basement of the Stephen's Green Hibernian Club at 9 St Stephen's Green in Dublin city center. The bar describes itself as a chic little speakeasy spread across four intimate rooms. Its concept draws on surrealism, which the site calls the art of the unexpected, and on Salvador Dali's idea of synesthesia: the bartenders build cocktails around color combinations meant to work as emotional triggers. Beyond regular service, the rooms are used for private events such as press launches, receptions, team drinks and birthdays. The site does not name the owners.

Source: https://9below.ie

### 4. Alenka Cocktail Bar (Prague, Czech Republic)

Current description: "An Alice in Wonderland-themed cocktail bar in Prague's Malá Strana, where drinks are framed as experiences and rituals blending fantasy with reality. The bar operates walk-in only and does not take reservations."

Proposed (103 words):

Alenka is an Alice in Wonderland-themed cocktail bar at Trziste 3 in Prague's Mala Strana, operated by the company The Alice s.r.o. The concept rests on the idea that a cocktail should be more than a drink: the bar frames each one as an experience, a game, a piece of magic and a small ritual, in a room where, in its own words, time slows down and the real world disappears. Secret entrances and hidden details are part of the design. Alenka does not take reservations and works on a walk-in basis, and it also hosts birthdays, corporate events and other private gatherings.

Source: https://alenkacocktailbar.cz

### 5. Alto Rooftop (Cervia, Italy)

Current description: "Alto Rooftop sits on top of the Villa del Mare Spa Resort in Cervia, a rooftop cocktail bar and restaurant with a pool overlooking the Romagna coast. The venue also hosts its own annual cocktail festival."

Proposed (79 words):

Alto Rooftop is a rooftop cocktail bar and restaurant with a pool on top of the Villa del Mare Spa Resort in Cervia, on the Romagna coast of Italy. The venue is run by Ama Hospitality and is presented on its site in two parts, Il Cocktail Bar and Il Ristorante, under the tagline of a unique experience of Italian hospitality. It also hosts its own event, the Alto Cocktail Festival, with a 2026 edition announced on the site.

Source: https://www.altorooftop.com

Note: The site is thin (taglines and navigation, the cocktail bar subpage returned 404), so this paragraph is close to the existing description and adds little. Roman may prefer to leave the current text.

### 6. Ananasa Tri (Belgrade, Serbia)

Current description: "A tropical-themed cocktail bar on Vlajkovićeva street in central Belgrade, focused on craft mixology. The bar hosts guest-bartender events, including international guest shifts, with reservations via the provedi.se platform."

No website on the row. The Instagram fallback (instagram.com/ananasatri) returned only a login wall with no bio text. No paragraph.

### 7. AnonymouS Bar (Prague, Czech Republic)

Current description: "A conspiracy-themed cocktail bar in Prague's Old Town inspired by the 1605 Gunpowder Plot, V for Vendetta and the hacker collective Anonymous. Its self-styled Cocktail Revolution menu features signature drinks such as Remember, Remember and Beneath the Mask."

Proposed (95 words):

AnonymouS Bar is a cocktail bar at Michalska 12 in Prague's Old Town, run by AnonymouS Concept s.r.o. with Jaroslav Modlik listed as responsible manager; the same group operates Bulletproof Bar and Shrink's Office. The concept draws on three sources, the 1605 Gunpowder Plot, the graphic novel V for Vendetta and the hacker collective Anonymous, and visual references to all three run through the room. The bar bills its menu as a Cocktail Revolution, a list of roughly twenty signature drinks with names such as Remember, Remember, V's Dagger, Beneath the Mask and Shadow Gallery.

Source: https://anonymousbar.cz

### 8. Apothéke (Los Angeles, United States)

Current description: "The Los Angeles outpost of New York's Apothéke, set in Chinatown on North Spring Street. The bar applies the group's apothecary-inspired "medicinal mixology" approach, building botanical craft cocktails in a design-led lounge recognized for its interiors."

Fetched https://www.apothekemixology.com/la/ and https://www.apothekemixology.com; both are navigation hubs that state only "Botanical Cocktail Lounge" and "Award-Winning Cocktail Apothecary", with no address, founder, drinks detail or design copy. https://www.apothekemixology.com/la/about returned 404. Too little to write from. No paragraph.

### 9. Asia Today (Bangkok, Thailand)

Current description: "Asia Today is a cocktail bar located in Bangkok. Asia's 51-100."

No website and no Instagram handle on the row, so there was no primary source to fetch. No paragraph.

### 10. Backroom Bar (Buenos Aires, Argentina)

Current description: "Backroom calls itself a 'bar de autores', artisanal cocktails, Mediterranean tapas and live jazz in Palermo, open until five in the morning every day of the week."

Proposed (99 words):

Backroom is a bar in Palermo, Buenos Aires, at Jorge Luis Borges 1975, that describes itself as a bar de autores, an authors' bar of drinks. It presents itself as more than a bar and restaurant, a fusion of flavors, music and hospitality, and its tagline invites guests to write their next story. The offer centers on artisanal cocktails and Mediterranean tapas, with live jazz as a regular part of the evening. The site also sells branded merchandise and recruits staff under a stated philosophy of shared leadership, integrity, humility and excellence. No owner is named on the site.

Source: https://backroom-bar.com

### Bonus: Scarfes Bar short_excerpt (the row that prompted the scan)

Not one of the ten above (its description passes every rule), but since it is the example, here is a replacement for the short_excerpt written from the bar's own site. Roman may want to cut it to one sentence for the one-liner use.

Proposed (104 words):

Scarfes Bar is the cocktail and live jazz bar of the Rosewood London hotel at 252 High Holborn. The room is known for its art as much as its drinks: the walls carry work by the caricaturist Gerald Scarfe, and live jazz is a regular fixture. The current menu, Heroes and Villains, looks at which drinks the cocktail world has celebrated and which it has condemned, setting elegant classics against flavors the bar calls nostalgic, louder and intentionally excessive. The site lists a No. 31 placing in The World's 50 Best Bars 2025 and Best International Hotel Bar at Tales of the Cocktail 2024.

Source: https://scarfesbar.com

Also worth fixing on that row: the description column ends "At No. " (cut mid-sentence), and the first photo is the news article image scarfes-bar-hosts-international-womens-month-talks.jpg.

## Closing

Nothing was written to the database, no email was sent and no source file was changed. This is a read-only scan and a set of proposals; Roman decides what, if anything, to apply.
