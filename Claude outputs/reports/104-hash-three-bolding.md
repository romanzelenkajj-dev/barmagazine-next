# Task 104: the "#3" bolding

**Applied on `main`, code and data. The rule now changes exactly two tokens in the whole directory, both of them drinks-menu cases.**

---

# The bug

`highlightSegments` bolds rank tokens (`No. 12`, `#93`) only inside a sentence that reads as a
ranking context. The bare word "list" was one of the context words, so "The cocktail **list** runs
to … Aging Partiers #3" on Buddy Buddy's page passed the test, and a drink's name went bold as
though it were a placing.

# The two rules, as asked

1. **"list" is no longer a context word.** "ranked", "globally", "50 Best" and the award phrases
   remain. "on the 50 Best list" still qualifies, through "50 Best".
2. **A `#N` that directly follows a capitalised word is never bolded**, because that is a name
   (Aging Partiers #3, Studio #2). One refinement was needed to make it true: "Ranked #7 globally"
   opens with a capital only because it opens the sentence, so the few words that introduce a
   rank (Ranked, Rated, Placed, Listed, Named, Number, Position, Currently, Now, At) are exempt.
   Without that, the first test I wrote for the rule failed on its own positive control. Applied
   to `#N` only: "Bars No. 12" is a real ranking and "No. N" never appears as a name suffix in
   this directory.

Both cases are in the tests, plus the positive control and the "50 Best list" case, so the drink
cannot come back and the real ranking cannot be lost.

# What the scan found, before the rule was final

Every active description and excerpt was run through the **old** rule and the **new** rule side
by side, so the change can be stated exactly rather than estimated.

| | Tokens |
|---|---|
| `#N` or `No. N` still bold under the new rule | **447, across 300 bars** |
| Bold before, plain now (the effect of this task) | **2** |
| Plain before, bold now | 0 |
| Still bold with no ranking phrase anywhere in the full sentence | **0** |

The two that changed: **Buddy Buddy** (the target) and **Backbar, Boston**, whose "Time Out's Top
25 Bars in the World list" qualified only through "list". That one is a real ranking and is now
plain; it is the cost of dropping the word, and a fair one, since Time Out is not in the context
phrases and I did not add sources you have not named.

**Six rows carried stored HTML entities.** `&#8220;` and `&#8217;` in the excerpts of Cure, Rayo,
Superbueno, True Laurel, Himkok and The Wolves. Two effects: the rule was bolding `#8220` as a
placing, and the excerpts rendered the entities literally on the page. The six rows are decoded
in the data, and the rule now refuses a `#N` preceded by `&` so WordPress-sourced text cannot
reintroduce it. That is a fix you did not ask for; it came out of the grep you did ask for.

# The 22 that are plain under either rule

Not changed by this task, listed so nothing is hidden:

- **Real rankings with no context word**, plain before and after: Bar Snack ("Time Out named it
  the No. 1 bar"), Coa Shanghai, Cosmo Pony, Moebius, Tres Monos and The Bar in Front of the Bar
  (excerpts saying "No.7 in the world", "Europe's No.2"), Copitas ("30 Best Bars India #6"), and
  two excerpts reading "Named #1 Best Bar in Europe 2025". If you want these bold, the context
  list needs "in the world", "in Asia", "in Europe" and "Best Bar"; I have not added them.
- **The six-span cap**: Danico, Double Chicken Please, Handshake, Jewel of the South, Pacific
  Cocktail Haven, Superbueno, True Laurel. Each has more than six bold-worthy spans and the later
  rank loses. Working as designed.
- **Drinks and products, correctly plain**: Turf Club No. 2, No. 3 gin, No.17 Ruby tea, MO Bar's
  menu line, Public #1 through #5.

# The full list to eyeball

All 447 tokens that still bold, one row each, are in the table below.

| Bar | Token | Sentence |
|---|---|---|
| 14-de-la-rosa | No. 35 | It sits at No. 35 on Europe's 50 Best Bars 2026. |
| 1930 | No.22 | No.22 in Europe's 50 Best Bars 2026 and a World's 50 Best fixture since 2019. |
| 1930 | No. 43 | It currently stands at No. 43 on the World's 50 Best Bars 2025. |
| 28-hong-kong-street | No.21 | No.21 in the World's 50 Best Bars 2021. |
| 878-bar | No.25 | It entered the World's 50 Best Bars back in 2011 (No.25) and was twice named Argentina's best bar; the cigar-infused, Maradona-inspired Segurola y Habana is the |
| a-bar-with-shapes-for-a-name | No. 73 | Ranked No. 73 on the World's 50 Best Bars, this Kingsland Road bar proves that minimalism and warmth are not opposites. |
| above-board | No.44 | No.44 on the World's 50 Best Bars 2021 and back on the extended list at No.100 in 2024. |
| above-board | No.100 | No.44 on the World's 50 Best Bars 2021 and back on the extended list at No.100 in 2024. |
| aldea | No. 26 | It currently stands at No. 26 on Europe's 50 Best Bars 2026. |
| alice-cheongdam | No.13 | No.13 on Asia's 50 Best Bars in both 2025 and 2026. |
| allegory-dc | No.57 | Ranked No.57 on North America's 50 Best Bars 2026 and winner of World's Best Cocktail Menu at the 2026 Tales of the Cocktail Spirited Awards, creative director  |
| alma-prague | No. 25 | It sits at No. 25 on Europe's 50 Best Bars 2026. |
| alquimico | #11 | (excerpt) #11 on World's 50 Best Bars 2025. |
| angel-s-share | No. 31 | The bar holds No. 31 on North America's 50 Best Bars 2026. |
| angelita | No.45 | No.45 on Europe's 50 Best Bars 2026. |
| angelita | No. 51 | The bar holds No. 51 on the World's 50 Best Bars 2025. |
| aqua-bar | No. 48 | It sits at No. 48 on Asia's 50 Best Bars 2026. |
| arca | No. 77 | It sits at No. 77 on the World's 50 Best Bars 2025. |
| argo | No. 11 | The Four Seasons bar that launched Lorenzo Antinori's career continues to operate at an elite level under its current team, holding No. 11 on Asia's 50 Best and |
| argo | No. 56 | The Four Seasons bar that launched Lorenzo Antinori's career continues to operate at an elite level under its current team, holding No. 11 on Asia's 50 Best and |
| attaboy | No. 72 | No menu, no signage, and a front-door instruction that reads "Please Wait To Be Greeted." Sam Ross and Michael McIlroy opened this Eldridge Street bar in 2012 a |
| attaboy | No. 37 | It currently stands at No. 37 on North America's 50 Best Bars 2026. |
| atwater-cocktail-club | No. 36 | Ranked No. 36 on North America's 50 Best Bars 2025. |
| atwater-cocktail-club | No. 62 | The latest lists place it at No. 62 on North America's 50 Best Bars 2026. |
| atwater-cocktail-club | No. 3 | (excerpt) One of Montreal’s most charismatic bars, One of Montreal’s most charismatic bars, Atwater Cocktail Club ranks among North America’s 50 Best Bars and holds the p |
| baba-au-rum | No.27 | Eleven consecutive years on the World's 50 Best Bars list, sitting at No.27 in 2025. |
| baba-au-rum | No. 14 | It sits at No. 14 on Europe's 50 Best Bars 2026. |
| bagheera | No. 59 | It sits at No. 59 on North America's 50 Best Bars 2026. |
| baltra-bar | No. 20 | Ranked No. 20 on North America's 50 Best Bars, Baltra operates as the creative laboratory of León's expanding empire. |
| baltra-bar | No. 78 | The bar holds No. 78 on the World's 50 Best Bars 2025 and No. 48 on North America's 50 Best Bars 2026. |
| baltra-bar | No. 48 | The bar holds No. 78 on the World's 50 Best Bars 2025 and No. 48 on North America's 50 Best Bars 2026. |
| bandista | No. 47 | Known for inventive cocktails and rare spirits, it ranked No. 47 on North America's 50 Best Bars 2026 and has been billed as the No. 1 bar in Texas. |
| bandista | No. 1 | Known for inventive cocktails and rare spirits, it ranked No. 47 on North America's 50 Best Bars 2026 and has been billed as the No. 1 bar in Texas. |
| bar-bello | No. 75 | It currently stands at No. 75 on North America's 50 Best Bars 2026. |
| bar-benfiddich | No. 18 | Ranked No. 18 on the World's 50 Best and No. 9 on Asia's 50 Best Bars, earning Best Bar in Japan, Benfiddich operates as a farm-to-counter manifesto. |
| bar-benfiddich | No. 9 | Ranked No. 18 on the World's 50 Best and No. 9 on Asia's 50 Best Bars, earning Best Bar in Japan, Benfiddich operates as a farm-to-counter manifesto. |
| bar-benfiddich | No. 62 | It sits at No. 62 on Asia's 50 Best Bars 2026. |
| bar-bon-funk | No. 90 | The latest lists place it at No. 90 on Asia's 50 Best Bars 2026. |
| bar-carmen | No. 100 | The bar holds No. 100 on the World's 50 Best Bars 2025. |
| bar-cham | No.6 | No.6 on Asia's 50 Best Bars 2025. |
| bar-cham | No. 33 | It sits at No. 33 on Asia's 50 Best Bars 2026. |
| bar-contra | No.98 | No.98 in North America's 50 Best Bars 2025. |
| bar-de-vie | No.34 | No.34 in Europe's 50 Best Bars 2026 with the Ketel One Sustainable Bar Award, and winner of Best New International Cocktail Bar at the 2026 Tales of the Cocktai |
| bar-kaiju | No. 70 | The latest lists place it at No. 70 on North America's 50 Best Bars 2026. |
| bar-leather-apron | No. 81 | The bar holds No. 81 on North America's 50 Best Bars 2026. |
| bar-leone | No. 1 | Lorenzo Antinori left the Four Seasons' Argo to open a bar that channels Rome's neighborhood trattorias into Hong Kong's Central district, and the industry resp |
| bar-leone | #1 | (excerpt) #1 on World's 50 Best Bars 2025. |
| bar-libre | No. 49 | Yujiro Kiyosaki runs an Ikebukuro program built on advanced technique, liquid nitrogen, barrel ageing, centrifugal clarification, that entered Asia's 50 Best at |
| bar-libre | No. 39 | It currently stands at No. 39 on Asia's 50 Best Bars 2026. |
| bar-long-fong | No. 96 | It sits at No. 96 on Asia's 50 Best Bars 2026. |
| bar-madonna | No. 36 | The bar holds No. 36 on North America's 50 Best Bars 2026. |
| bar-mauro | No. 14 | At No. 14 on North America's 50 Best Bars and No. 54 on the World's 50 Best Bars as a new entry, Bar Mauro is built for the kind of repeat visits, two, three ti |
| bar-mauro | No. 54 | At No. 14 on North America's 50 Best Bars and No. 54 on the World's 50 Best Bars as a new entry, Bar Mauro is built for the kind of repeat visits, two, three ti |
| bar-mood | No.37 | On Asia's 50 Best Bars in 2019 to 2021 and 2024 to 2026 (No.37 in 2024), with the Ketel One Sustainable Bar Award in 2022; sibling MEET by BAR MOOD pours at the |
| bar-mood | No. 82 | It sits at No. 82 on Asia's 50 Best Bars 2026. |
| bar-mordecai | No. 94 | It currently stands at No. 94 on North America's 50 Best Bars 2026. |
| bar-mordecai | No. 40 | (excerpt) Ranked No. 40 in North America’s 50 Best Bars, this trendy Dundas Stree |
| bar-next-door | No. 100 | Located in the old office of Marilyn Monroe's talent agent on Sunset Boulevard, this dime-sized West Hollywood bar debuted at No. 100 on North America's 50 Best |
| bar-nouveau | No. 17 | At No. 17 on the World's 50 Best Bars, this Marais bar proves that constraint can be a creative accelerant. |
| bar-nouveau | No. 5 | The bar holds No. 5 on Europe's 50 Best Bars 2026. |
| bar-nouveau | #17 | (excerpt) #17 on World's 50 Best Bars 2025. |
| bar-orchard-ginza | No.28 | The fruit-first approach earned it No.28 on Asia's 50 Best Bars in 2019. |
| bar-outrigger | No. 51 | The bar holds No. 51 on Asia's 50 Best Bars 2026. |
| bar-pompette | No. 8 | It currently stands at No. 8 on North America's 50 Best Bars 2026 and No. 55 on the World's 50 Best Bars 2025. |
| bar-pompette | No. 55 | It currently stands at No. 8 on North America's 50 Best Bars 2026 and No. 55 on the World's 50 Best Bars 2025. |
| bar-sathorn | No.17 | No.17 in Asia's 50 Best Bars 2026. |
| bar-snack | No. 85 | At No. 85 on North America's 50 Best, Bar Snack delivers serious drinking disguised as a neighborhood hangout. |
| bar-spirit-forward | No. 30 | The bar holds No. 30 on Asia's 50 Best Bars 2026. |
| bar-trench | No. 94 | Ranked No. 94 on the World's 50 Best extended list, Bar Trench is a neighborhood room that draws regulars and pilgrims in equal measure, with signatures and cla |
| bar-trench | No. 53 | It currently stands at No. 53 on Asia's 50 Best Bars 2026. |
| bar-trigona | No.39 | No.39 on Asia's 50 Best Bars 2025. |
| bar-trigona | No. 38 | It currently stands at No. 38 on Asia's 50 Best Bars 2026. |
| bar-us | No.6 | No.6 in Asia's 50 Best Bars 2026 with the Ketel One Sustainable Bar Award. |
| bar-us | No. 15 | It sits at No. 15 on the World's 50 Best Bars 2025. |
| barro-negro | No.62 | Five consecutive years in the World's 50 Best top 100 (No.62 in 2025) and No.13 on Europe's 50 Best Bars 2026. |
| barro-negro | No.13 | Five consecutive years in the World's 50 Best top 100 (No.62 in 2025) and No.13 on Europe's 50 Best Bars 2026. |
| beachbum-berrys-latitude-29 | No. 80 | At No. 80 on North America's 50 Best extended list, the program resurrects lost recipes from Berry's decades of research alongside original creations and Chef J |
| best-intentions | No. 25 | Calvin and Chris Marty reopened this Armitage Avenue bar in 2023 after a three-year hiatus and climbed to No. 25 on North America's 50 Best Bars by refusing to  |
| between-the-sips | No. 73 | The latest lists place it at No. 73 on Asia's 50 Best Bars 2026. |
| bijou-drinkery-room | No. 34 | Hidden inside the Colegio Superior de Gastronomía with a password that requires only a smile, Bijou entered North America's 50 Best at No. 34 as a new entry in  |
| bird | No. 66 | Ranked No. 66 on The World's 50 Best Bars 2025 extended list. |
| bird | No. 24 | It currently stands at No. 24 on Europe's 50 Best Bars 2026. |
| bisous | No. 39 | Peter Vestinos, twenty-plus years behind bars at Sepia, NoMI, The Betty, and Sparrow, opened this 1960s Parisian-inspired cocktail lounge in January 2024 and de |
| bisous | No. 30 | The latest lists place it at No. 30 on North America's 50 Best Bars 2026. |
| bkk-social-club | No.49 | No.49 in the World's 50 Best Bars 2025 and No.20 in Asia's 50 Best 2026. |
| bkk-social-club | No.20 | No.49 in the World's 50 Best Bars 2025 and No.20 in Asia's 50 Best 2026. |
| black-pearl | No.30 | A Fitzroy institution since 2002, Black Pearl is the neighborhood bar with global reach, credited with fostering some of the best talent the Australian bar scen |
| boadas | No. 85 | At No. 85 on the World's 50 Best Bars, Boadas bridges nearly a century of Barcelona drinking history with a contemporary approach that respects the room's legac |
| boadas | No. 36 | It currently stands at No. 36 on Europe's 50 Best Bars 2026. |
| bon-vivants | No. 50 | The latest lists place it at No. 50 on North America's 50 Best Bars 2026. |
| bop | No. 52 | It currently stands at No. 52 on Asia's 50 Best Bars 2026. |
| botanist | No. 24 | Ranked No. 24 on North America's 50 Best Bars and No. 2 on Canada's 50 Best Bars. |
| botanist | No. 2 | Ranked No. 24 on North America's 50 Best Bars and No. 2 on Canada's 50 Best Bars. |
| botanist | No. 38 | The bar holds No. 38 on North America's 50 Best Bars 2026. |
| boutiq-bar | No. 42 | The bar cites a No. 42 placing on the World's 50 Best Bars list in 2012 and a Spirited Awards Top 10 honor for Best International Bar Team in 2020. |
| brujas | No. 65 | At No. 65 on North America's 50 Best extended list, Brujas represents a vital current in Mexico City's bar culture: feminist, ingredient-driven, and rooted in t |
| byrdi | No. 91 | The bar holds No. 91 on the World's 50 Best Bars 2025. |
| cafe-de-nadie | No. 60 | It currently stands at No. 60 on North America's 50 Best Bars 2026. |
| cafe-la-trova | No. 82 | At No. 82 on the World's extended list and No. 13 on North America's ranking, Café La Trova channels authentic Cuban drinking culture through a collaboration wi |
| cafe-la-trova | No. 13 | At No. 82 on the World's extended list and No. 13 on North America's ranking, Café La Trova channels authentic Cuban drinking culture through a collaboration wi |
| cafe-la-trova | No. 42 | The latest lists place it at No. 42 on North America's 50 Best Bars 2026. |
| camparino-in-galleria | No. 18 | It currently stands at No. 18 on Europe's 50 Best Bars 2026. |
| canon-seattle | No.79 | Boasting one of the largest whiskey collections in the Western Hemisphere, Canon at 928 12th Avenue has spent over a decade on every "best bars in America" list |
| caretaker-s-cottage | No.19 | No.19 on the World's 50 Best Bars 2025 and The Best Bar in Australasia. |
| carrots-bar | No. 21 | The bar holds No. 21 on Asia's 50 Best Bars 2026. |
| cat-bite-club | No. 44 | Ranked No. 44 on Asia's 50 Best Bars, Cat Bite Club occupies a niche that sounds narrow but drinks wide, drawing connections between distillation traditions sep |
| charles-h | No.7 | Twice named Best Bar in Korea by Asia's 50 Best (2019, 2021), peaking at No.7 in Asia in 2022. |
| charles-h | No. 87 | The latest lists place it at No. 87 on Asia's 50 Best Bars 2026. |
| citrus-cane | No. 87 | It sits at No. 87 on North America's 50 Best Bars 2026. |
| civil-liberties | No. 21 | Ranked No. 21 on North America's 50 Best Bars in 2024 and 2025. |
| civil-liberties | No. 54 | It sits at No. 54 on North America's 50 Best Bars 2026. |
| civil-works | No. 29 | Ranked No. 29 on North America's 50 Best Bars 2026, where its menu was named best in North America. |
| clemente-bar | No. 11 | At No. 11 on North America's 50 Best Bars with the Newcomer Award in its pocket, Clemente Bar sets an early benchmark for 2026. |
| cmyk | No. 27 | The latest lists place it at No. 27 on Asia's 50 Best Bars 2026. |
| coa | No. 38 | Three-time winner of the Best Bar in Asia title before Bar Leone's ascent, Coa sat at No. 38 on the 2025 World's 50 Best Bars list, still formidable after years |
| coa | No. 24 | The latest lists place it at No. 24 on Asia's 50 Best Bars 2026. |
| coa | #38 | (excerpt) #38 on World's 50 Best Bars 2025. |
| coa-shanghai | No.95 | No.95 on Asia 50 Best Bars 2026; sister to Hong Kong Coa, three times No.1 in Asia. |
| coa-shanghai | No.1 | No.95 on Asia 50 Best Bars 2026; sister to Hong Kong Coa, three times No.1 in Asia. |
| cochinchina | No.26 | No.26 on the World's 50 Best Bars 2025. |
| coley | No.27 | Best Bar in Malaysia and No.27 on Asia's 50 Best in 2019. |
| coley | No. 83 | The latest lists place it at No. 83 on Asia's 50 Best Bars 2026. |
| connaught-bar | No. 6 | The latest lists place it at No. 6 on the World's 50 Best Bars 2025 and No. 10 on Europe's 50 Best Bars 2026. |
| connaught-bar | No. 10 | The latest lists place it at No. 6 on the World's 50 Best Bars 2025 and No. 10 on Europe's 50 Best Bars 2026. |
| cosmo-pony | No.15 | No.15 on Asia's 50 Best Bars 2026. |
| coupette | No.18 | Awards came fast: Best New Opening at the World's 50 Best Bars 2018, No.18 that year and No.23 in 2019, plus Tales of the Cocktail's Best New International Cock |
| coupette | No.23 | Awards came fast: Best New Opening at the World's 50 Best Bars 2018, No.18 that year and No.23 in 2019, plus Tales of the Cocktail's Best New International Cock |
| cry-baby-gallery | No. 69 | It sits at No. 69 on North America's 50 Best Bars 2026. |
| cure | No. 50 | Beverage Director Abe Vucekovich, before departing for Chicago's Meadowlark, set the creative standard that the current team sustains at No. 50 on North America |
| cure | No. 21 | The bar holds No. 21 on North America's 50 Best Bars 2026. |
| cure | No. 47 | (excerpt) Cure, proudly positioned at No. 47 in “The World’s 50 Best Bars in North America,” is celebrated for its outstanding bar program and design. |
| daisy-margarita-bar | No. 44 | The latest lists place it at No. 44 on North America's 50 Best Bars 2026. |
| danico | No. 30 | Ranked No. 30 on the World's 50 Best Bars, the program carries the confidence of a venue that helped establish the city's reputation and continues to shape it. |
| danico | #30 | (excerpt) #30 on World's 50 Best Bars 2025. |
| dante | No.46 | No.46 in North America's 50 Best Bars 2025. |
| dante | No. 58 | The latest lists place it at No. 58 on North America's 50 Best Bars 2026. |
| doctors-office-seattle | No.76 | Ranked No.76 on North America's 50 Best Bars 2025, The Doctor's Office at 1631 E. |
| door-no-4 | No. 99 | The bar holds No. 99 on North America's 50 Best Bars 2026. |
| double-chicken-please | No.2 | No.2 in the World's 50 Best Bars 2023 and North America's No.1 that year; the hot honey chicken sandwich is mandatory. |
| double-chicken-please | No.1 | No.2 in the World's 50 Best Bars 2023 and North America's No.1 that year; the hot honey chicken sandwich is mandatory. |
| double-chicken-please | No. 41 | It sits at No. 41 on the World's 50 Best Bars 2025 and No. 35 on North America's 50 Best Bars 2026. |
| dr-stravinsky | No. 83 | An apothecary aesthetic frames a program centerd on in-house fermentation and distillation at No. 83 on the World's 50 Best Bars. |
| drink-kong | No.40 | No.40 on the World's 50 Best Bars 2025, No.32 in Europe 2026, and the 2019 Campari One To Watch. |
| drink-kong | No.32 | No.40 on the World's 50 Best Bars 2025, No.32 in Europe 2026, and the 2019 Campari One To Watch. |
| dry-wave-cocktail-studio | No.4 | Supawit 'Palm' Muttarattana's Thonglor studio opened in January 2024 and rocketed to No.4 in Asia's 50 Best Bars 2026, the Best Bar in Thailand. |
| dunlin | No. 50 | The bar holds No. 50 on Europe's 50 Best Bars 2026. |
| employees-only | No. 95 | Ranked No. 95 on the World's 50 Best Bars, EO endures not through reinvention but through stubborn, uncompromising consistency. |
| employees-only | No. 45 | It sits at No. 45 on North America's 50 Best Bars 2026. |
| employees-only | No. 15 | (excerpt) Ranked No. 15 on North America’s 50 Best Bars, this West Village institutio |
| epic | No.41 | In 2021 it became the first mainland-China bar to win the Campari One To Watch award and entered the World's 50 Best at No.41. |
| equal-measure-boston | No.81 | Ranked No.81 on North America's 50 Best Bars 2025, Equal Measure operates Wednesday through Saturday with a concise menu of originals that change seasonally and |
| eximia | No.61 | No.61 on the World's 50 Best Bars 2025; now above Restaurante Locale in Itaim Bibi. |
| father-forgive-me | No. 83 | The bar holds No. 83 on North America's 50 Best Bars 2026. |
| fifty-mils | No.4 | The Four Seasons Mexico City's cocktail flagship, Fifty Mils entered the World's 50 Best list in 2018 and was ranked No.4 among Food & Wine's Top 10 Internation |
| firefly | No.82 | No.82 in Asia's 50 Best Bars 2025. |
| firefly | No. 78 | It currently stands at No. 78 on Asia's 50 Best Bars 2026. |
| floreria-atlantico | No.30 | A World's 50 Best fixture for a decade (No.30 in 2023), with Giovannoni named the 2023 Industry Icon. |
| floreria-atlantico | No. 90 | It sits at No. 90 on the World's 50 Best Bars 2025. |
| foco | No. 89 | English bartenders Tom Godfrey and Theo Quinn entered the World's 50 Best at No. 89 as a new entry with a Gràcia bar built on a simple premise: updated classics |
| foco | No. 48 | It sits at No. 48 on Europe's 50 Best Bars 2026. |
| form-matter | No. 13 | It sits at No. 13 on North America's 50 Best Bars 2026. |
| freni-e-frizioni | No.31 | No.31 on Europe's 50 Best Bars 2026. |
| freni-e-frizioni | No. 58 | It sits at No. 58 on the World's 50 Best Bars 2025. |
| fura | No. 95 | Winner of Asia's 50 Best Sustainable Bar Award in 2024 and ranked No. 95 on the extended list, Fura demonstrates that sustainability and flavor are not competin |
| g-o-d | No.26 | No.26 in Asia's 50 Best Bars 2025. |
| g-o-d | No. 31 | The bar holds No. 31 on Asia's 50 Best Bars 2026. |
| gibson | No.15 | No.15 in Asia's 50 Best Bars 2019. |
| gokan | No. 70 | A new entry at No. 70 on the World's 50 Best Bars 51-100 list and No. 33 on Asia's 50 Best Bars, Gokan builds its program around the five senses, each cocktail  |
| gokan | No. 33 | A new entry at No. 70 on the World's 50 Best Bars 51-100 list and No. 33 on Asia's 50 Best Bars, Gokan builds its program around the five senses, each cocktail  |
| gokan | No. 22 | The latest lists place it at No. 22 on Asia's 50 Best Bars 2026. |
| gong-gan | No.63 | No.63 on Asia's 50 Best Bars 2025, No.74 in 2026. |
| gong-gan | No.74 | No.63 on Asia's 50 Best Bars 2025, No.74 in 2026. |
| gucci-giardino | No.29 | Part of the Gucci Osteria da Massimo Bottura family, it placed No.29 on Europe's 50 Best Bars 2026. |
| gucci-giardino | No. 99 | It sits at No. 99 on the World's 50 Best Bars 2025. |
| handshake-speakeasy | No. 1 | Eric van Beek, the 2018 Bacardi Legacy World Champion, operates a thirty-two-seat Art Deco speakeasy inside the NH Collection hotel that held No. 1 on North Ame |
| handshake-speakeasy | No. 2 | Eric van Beek, the 2018 Bacardi Legacy World Champion, operates a thirty-two-seat Art Deco speakeasy inside the NH Collection hotel that held No. 1 on North Ame |
| handshake-speakeasy | #2 | (excerpt) #2 on World's 50 Best Bars 2025. |
| hanky-panky | No. 13 | The Michter's Art of Hospitality Award in 2022 and a former No. 13 ranking on the World's 50 Best Bars confirm that Hanky Panky defined a format that the city's |
| happiness-forgets | No.40 | It reached No.40 in the World's 50 Best Bars 2019. |
| harrys-new-york-bar | No. 27 | It currently stands at No. 27 on Europe's 50 Best Bars 2026. |
| hecate-bar-boston | No.88 | Ranked No.88 on North America's 50 Best Bars 2026, the bar operates on a first-come, first-served basis with no reservations and no phone, only an email address |
| herbs-rye | No. 86 | At No. 86 on North America's 50 Best extended list, the bar delivers cocktails under twenty dollars inside a room of crushed red velvet wallpaper, black leather |
| hope-sesame | #29 | (excerpt) #29 on World's 50 Best Bars 2025. |
| humboldt-bar | No. 53 | The bar holds No. 53 on North America's 50 Best Bars 2026. |
| indulge-bistro | No.11 | No.11 on Asia's 50 Best Bars 2023 and No.21 in the world in 2019. |
| indulge-bistro | No.21 | No.11 on Asia's 50 Best Bars 2023 and No.21 in the world in 2019. |
| jerry-thomas-project | No. 98 | It sits at No. 98 on the World's 50 Best Bars 2025. |
| jewel-of-the-south | No. 4 | Bar Team at the 2024 Tales of the Cocktail Spirited Awards, and a third consecutive year as Best Bar in South USA at No. 4 on North America's 50 Best Bars, the  |
| jewel-of-the-south | No. 44 | It sits at No. 44 on the World's 50 Best Bars 2025 and No. 6 on North America's 50 Best Bars 2026. |
| jewel-of-the-south | #1 | (excerpt) Ranked #1 Bar in the South USA and #34 in The World’s 50 Best Bars, Jewel of the South is a true celebration of New Orleans culture and cocktail craftsmanship. |
| jewel-of-the-south | #34 | (excerpt) Ranked #1 Bar in the South USA and #34 in The World’s 50 Best Bars, Jewel of the South is a true celebration of New Orleans culture and cocktail craftsmanship. |
| jigger-pony | No. 9 | Creative Director Uno Jang, winner of the 2025 Altos Bartenders' Bartender Award, voted by peers across Asia, runs a research-driven program that held No. 9 glo |
| jigger-pony | No. 3 | Creative Director Uno Jang, winner of the 2025 Altos Bartenders' Bartender Award, voted by peers across Asia, runs a research-driven program that held No. 9 glo |
| jigger-pony | #9 | (excerpt) #9 on World's 50 Best Bars 2025. |
| julep | No. 84 | It sits at No. 84 on North America's 50 Best Bars 2026. |
| june-on-cambie | No. 17 | It entered North America's 50 Best Bars 2026 at No. 17. |
| jungle-bird | No.37 | Its Malaysiana concept takes inspiration from everything around it; No.37 on Asia's 50 Best Bars 2021. |
| kaito-del-valle | No.25 | No.25 on North America's 50 Best Bars 2026. |
| katana-kitten | No.27 | No.27 in the World's 50 Best Bars 2023 and No.12 in North America's 2024 list. |
| katana-kitten | No.12 | No.27 in the World's 50 Best Bars 2023 and No.12 in North America's 2024 list. |
| katana-kitten | No. 52 | The bar holds No. 52 on North America's 50 Best Bars 2026. |
| kol-mezcaleria | No.49 | The subterranean agave bar beneath KOL, Santiago Lastra's modern Mexican restaurant ranked No.49 in the World's 50 Best Restaurants 2025. |
| kumiko | No. 10 | Restaurant Bar at the Tales of the Cocktail Spirited Awards, the James Beard Outstanding Bar Award, and a third consecutive year as Best Bar in the Midwest at N |
| kumiko | No. 11 | It sits at No. 11 on North America's 50 Best Bars 2026. |
| kwant | No. 79 | Kwãnt runs an omakase-style five-course cocktail tasting through a Mayfair address that, at No. 79 on the World's 50 Best Bars, punches well above its age. |
| kyara | No. 5 | Monica Berg and Alex Kratena, the duo behind London's Tayēr + Elementary, No. 5 on the World's 50 Best Bars, opened their first Mediterranean venture at SLS Bar |
| la-sala-de-laura | No. 68 | It currently stands at No. 68 on the World's 50 Best Bars 2025. |
| lab | No. 99 | It sits at No. 99 on Asia's 50 Best Bars 2026. |
| lady-bee | #13 | (excerpt) #13 on World's 50 Best Bars 2025. |
| lair | No.8 | The Best Bar in India 2025, No.8 on Asia's 50 Best, the year's highest new entry, and No.96 in the world. |
| lair | No.96 | The Best Bar in India 2025, No.8 on Asia's 50 Best, the year's highest new entry, and No.96 in the world. |
| lamp-bar | No. 94 | The bar holds No. 94 on Asia's 50 Best Bars 2026. |
| laowai | No. 72 | It sits at No. 72 on North America's 50 Best Bars 2026. |
| late-bloomers | No. 44 | The bar holds No. 44 on Europe's 50 Best Bars 2026. |
| le-chamber | No.25 | No.25 on Asia's 50 Best Bars 2023; the Chamber Story arrives inside a book. |
| le-chamber | No. 88 | The bar holds No. 88 on Asia's 50 Best Bars 2026. |
| lemon | No. 62 | Opened in December 2023 and awarded the Campari One to Watch for North America alongside a No. 62 ranking on North America's 50 Best Bars, Lemon combines a meti |
| lennon-s | No.7 | No.7 in Asia's 50 Best Bars 2026, Highest New Entry. |
| library-bar-toronto | No. 19 | It ranks No. 19 on North America's 50 Best Bars 2026 and holds the list's Ketel One Sustainable Bar Award 2026. |
| licoreria-limantour | No. 9 | At No. 9 on North America's 50 Best Bars and No. 52 on the World's 50 Best Bars, Limantour is the foundation the rest of the scene stands on. |
| licoreria-limantour | No. 52 | At No. 9 on North America's 50 Best Bars and No. 52 on the World's 50 Best Bars, Limantour is the foundation the rest of the scene stands on. |
| licoreria-limantour | No. 20 | It currently stands at No. 20 on North America's 50 Best Bars 2026. |
| line | No. 8 | Named The Best Bar in Europe on Europe's 50 Best Bars 2026, and No. 8 on the World's 50 Best Bars in 2025, Line is the Kato Petralona project of Vasilis Kyritsi |
| locale-firenze | No.22 | No.22 on the World's 50 Best Bars 2025 and No.21 in Europe for 2026. |
| locale-firenze | No.21 | No.22 on the World's 50 Best Bars 2025 and No.21 in Europe for 2026. |
| lpm-dubai | No. 60 | The latest lists place it at No. 60 on the World's 50 Best Bars 2025. |
| lucy-s-flower-shop | No.49 | No.49 on the World's 50 Best Bars 2022; some seats always held for walk-ins. |
| lyaness | No.39 | Lyaness was the first bar awarded three PINs in The Pinnacle Guide and ranked No.39 in the World's 50 Best Bars 2019. |
| m-ms-bar | No. 42 | The bar holds No. 42 on Asia's 50 Best Bars 2026. |
| mahaniyom-cocktail-bar | No.19 | No.19 in the World's 50 Best Bars 2023; No.76 in Asia's 50 Best 2026. |
| mahaniyom-cocktail-bar | No.76 | No.19 in the World's 50 Best Bars 2023; No.76 in Asia's 50 Best 2026. |
| maison-premiere | No. 40 | The bar holds No. 40 on North America's 50 Best Bars 2026. |
| martinys | No. 15 | Ranked No. 15 on North America's 50 Best Bars, Martiny's treats every drink as a ceremony. |
| martinys | No. 23 | The latest lists place it at No. 23 on North America's 50 Best Bars 2026 and No. 75 on the World's 50 Best Bars 2025. |
| martinys | No. 75 | The latest lists place it at No. 23 on North America's 50 Best Bars 2026 and No. 75 on the World's 50 Best Bars 2025. |
| maybe-sammy | No. 42 | Seven consecutive years on the World's 50 Best Bars list, currently No. 42, make this The Rocks venue Australia's most internationally acclaimed bar of the last |
| maybe-sammy | #42 | (excerpt) #42 on World's 50 Best Bars 2025. |
| meadowlark | No. 38 | The 2024 Siete Misterios Best Cocktail Menu Award and No. 38 on North America's 50 Best Bars validate a program that treats every menu cycle as a publishing pro |
| meadowlark | No. 65 | The bar holds No. 65 on North America's 50 Best Bars 2026. |
| meadowlark | No. 37 | (excerpt) Ranked No. 37 in North America’s 50 Best Bars 2024, Meadowlark is a dimly lit, vintage Chicago-style cocktail haven, hidden behind an unmarked door in a back al |
| mecenas | No. 18 | It currently stands at No. 18 on North America's 50 Best Bars 2026. |
| meo | No. 64 | It sits at No. 64 on North America's 50 Best Bars 2026. |
| messengerservice | No.69 | Winner of the Best Bar Design Award, Asia's 50 Best Bars 2025; No.69 in 2026. |
| mimi-kakushi | No. 36 | It sits at No. 36 on the World's 50 Best Bars 2025. |
| mimi-kakushi | #36 | (excerpt) #36 on World's 50 Best Bars 2025. |
| mirate | No. 12 | Bar Director Max Reis and Chef Alan Sanz earned the Nikka Highest Climber Award after jumping thirty-four places to No. 12 on North America's 50 Best Bars, plus |
| mirate | No. 93 | Bar Director Max Reis and Chef Alan Sanz earned the Nikka Highest Climber Award after jumping thirty-four places to No. 12 on North America's 50 Best Bars, plus |
| mirror-bar | No. 25 | It sits at No. 25 on the World's 50 Best Bars 2025. |
| mirror-bar | #25 | (excerpt) #25 on World's 50 Best Bars 2025. |
| mo-bar | No.36 | No.36 in the World's 50 Best Bars 2021. |
| modernhaus | No.11 | The Best Bar in Indonesia 2026, No.11 on Asia's 50 Best, Modernhaus opened in May 2024 above French restaurant Bouchon on Senopati, founded by Mirwansyah 'Bule' |
| moebius-milano | No.7 | No.7 in the World's 50 Best Bars 2025. |
| moonrock | No. 67 | It sits at No. 67 on Asia's 50 Best Bars 2026. |
| mother | No. 22 | Ranked No. 22 on North America's 50 Best Bars 2026. |
| mount-pleasant-vintage-provisions | No. 91 | It currently stands at No. 91 on North America's 50 Best Bars 2026. |
| native | No. 45 | Ranked No. 45 on Asia's 50 Best Bars and No. 84 globally, Native sources regional spirits and foraged ingredients to produce drinks that taste like Southeast As |
| native | No. 84 | Ranked No. 45 on Asia's 50 Best Bars and No. 84 globally, Native sources regional spirits and foraged ingredients to produce drinks that taste like Southeast As |
| native | No. 80 | It currently stands at No. 80 on Asia's 50 Best Bars 2026. |
| nickel-city | No. 70 | Travis Tober’s sports bar, inspired by his Buffalo, New York roots, earned a position at No. 70 on North America’s 50 Best Bars by serving cold beer, boilermake |
| nickel-city | No. 96 | The bar holds No. 96 on North America's 50 Best Bars 2026. |
| night-hawk | No. 77 | Ranked No. 77 on Asia's 50 Best extended list. |
| nightjar | No.2 | A basement speakeasy on City Road that has spent fifteen years at the forefront of London's cocktail scene, peaking at No.2 in the World's 50 Best Bars 2013. |
| nine-bar | No. 89 | Lily Wang and Joe Briglio opened Chinatown's first speakeasy-style cocktail bar behind Moon Palace restaurant in 2022, and the room, neon-tinged, Blade Runner-i |
| nine-bar | No. 76 | The latest lists place it at No. 76 on North America's 50 Best Bars 2026. |
| no-sleep-club | No.8 | No.8 in Asia's 50 Best Bars 2021 and No.26 in the World's 50 Best that year. |
| no-sleep-club | No.26 | No.8 in Asia's 50 Best Bars 2021 and No.26 in the World's 50 Best that year. |
| no-vacancy | No. 82 | The bar holds No. 82 on North America's 50 Best Bars 2026. |
| nouvelle-vague | No. 86 | Its fourth signature menu, ORIGIN'AL, runs to 14 cocktails rooted in Albanian ingredients from mountain tea and quince to bee pollen and local raki, and the bar |
| nouvelle-vague | #28 | (excerpt) #28 on World's 50 Best Bars 2025. |
| nuss-bar | No.35 | The cocktail room of chef Thitid 'Ton' Tassanakhajohn's Nusara (No.35, World's 50 Best Restaurants 2025), named for his grandmother's nickname, a first-floor je |
| nutmeg-clove | No. 50 | The menu rotates weekly based on market availability, and the approach earned a No. 50 position on the World's 50 Best in 2025. |
| nutmeg-clove | No. 12 | The bar holds No. 12 on Asia's 50 Best Bars 2026. |
| nutmeg-clove | #50 | (excerpt) #50 on World's 50 Best Bars 2025. |
| obsidian-bar | No. 10 | The latest lists place it at No. 10 on Asia's 50 Best Bars 2026. |
| offtrack | No. 23 | Head Bartender Joash Conceicao and co-founders Dean Chew and Daniel O'Connor built a music-centric listening bar that rose to No. 23 on Asia's 50 Best, two plac |
| offtrack | No. 16 | It currently stands at No. 16 on Asia's 50 Best Bars 2026. |
| opium | No.25 | No.25 in Asia's 50 Best Bars 2026. |
| opium | No. 92 | It currently stands at No. 92 on the World's 50 Best Bars 2025. |
| origin-bar | No.43 | Ranked No.43 on Asia's 50 Best Bars 2026 and a Top 4 finalist for Best International Hotel Bar at the 2026 Tales of the Cocktail Spirited Awards. |
| overstory | No. 6 | Ranked No. 6 on North America's 50 Best, Overstory proves that a bar with a view can also be a bar with a point. |
| overstory | No. 33 | The bar holds No. 33 on North America's 50 Best Bars 2026. |
| overstory | No. 3 | (excerpt) Located on the 64th floor, Overstory is a contemporary cocktail bar in New York City’s Financial District, ranked as the No. 3 Best Bar in North America. |
| pacific-cocktail-haven | No. 16 | Kevin Diedrich, 2020 Best American Bartender at Tales of the Cocktail, built a program around Asian-Pacific ingredients that sits at No. 16 on North America's 5 |
| panda-sons | #34 | (excerpt) #34 on World's 50 Best Bars 2025. |
| pantja | No.27 | No.27 on Asia's 50 Best Bars 2024. |
| paradiso | No. 4 | Giacomo Giannotti's freezer-door speakeasy held at No. 4 on the World's 50 Best Bars after winning the World's Best Bar title in 2022, and the energy inside the |
| paradiso | #4 | (excerpt) #4 on World's 50 Best Bars 2025. |
| penicillin | No. 27 | Ranked No. 27 on Asia's 50 Best in 2025, Penicillin proves that environmental responsibility and world-class cocktail making strengthen rather than compromise e |
| penicillin | No. 49 | The bar holds No. 49 on Asia's 50 Best Bars 2026. |
| penrose | No.10 | Named The Best Bar in Malaysia and No.10 on Asia's 50 Best Bars 2025. |
| penrose | No. 64 | It currently stands at No. 64 on Asia's 50 Best Bars 2026. |
| pine-co | No.50 | No.50 on Asia's 50 Best Bars 2024; known for oddballs like the Ant Love Corn. |
| pony-up | No. 19 | The latest lists place it at No. 19 on Asia's 50 Best Bars 2026. |
| presidente-bar | No.21 | No.21 on the World's 50 Best Bars 2021. |
| press-club-dc | No. 34 | It currently stands at No. 34 on North America's 50 Best Bars 2026. |
| proof | No. 78 | It currently stands at No. 78 on North America's 50 Best Bars 2026. |
| punch-room-tokyo | No. 36 | A London gin palace concept transplanted to Ginza under the direction of Yasuhiro Kawakubo, Punch Room held No. 36 on Asia's 50 Best by centring its program on  |
| punch-room-tokyo | No. 23 | The bar holds No. 23 on Asia's 50 Best Bars 2026. |
| queen-mary-tavern | No. 63 | Dan Smith and Mony Bunni built a maritime-spirits drinking culture inside a Division Street tavern that reached No. 63 on North America's 50 Best Bars by specia |
| queen-mary-tavern | No. 80 | It sits at No. 80 on North America's 50 Best Bars 2026. |
| quinary | No. 91 | Ranked No. 91 on Asia's 50 Best Bars 51-100 list, the bar continues to innovate under a program that treats chemistry as a creative language rather than a marke |
| r-da-huset | No.35 | No.35 on the World's 50 Best Bars 2025. |
| r-da-huset | No. 43 | It sits at No. 43 on Europe's 50 Best Bars 2026. |
| ralph-s-bar | No. 28 | The latest lists place it at No. 28 on Asia's 50 Best Bars 2026. |
| rayo | No. 5 | The Soldado Medina layers tequila, chilli-infused liqueur, green herbal liqueur, Maraschino, cactus sorbet, and lime into a drink that functions as both narrati |
| realm-of-the-52-remedies | No. 93 | It sits at No. 93 on North America's 50 Best Bars 2026. |
| red-frog | No.40 | Named for Red Frog Island in Panama, it pours modernist takes on the classics with Portuguese ingredients; a five-time World's 50 Best entrant, peaking at No.40 |
| reka-bar | No.47 | No.47 on Asia's 50 Best Bars 2025. |
| reka-bar | No. 63 | It sits at No. 63 on Asia's 50 Best Bars 2026. |
| republic-bar | No.12 | No.12 in Asia's 50 Best Bars 2022. |
| rita | No.49 | No.49 in Europe's 50 Best Bars 2026. |
| ropewalk | No. 93 | It sits at No. 93 on Asia's 50 Best Bars 2026. |
| roquette-seattle | No.72 | Ranked No.72 on North America's 50 Best Bars 2025 and a 2025 James Beard Award semifinalist for Outstanding Bar, Roquette operates six nights a week with a focu |
| roquette-seattle | No. 89 | The bar holds No. 89 on North America's 50 Best Bars 2026. |
| sabina-sabe | No.20 | Down-to-earth and comfortable, it reached No.20 on North America's 50 Best Bars in 2022 and No.22 in 2023. |
| sabina-sabe | No.22 | Down-to-earth and comfortable, it reached No.20 on North America's 50 Best Bars in 2022 and No.22 in 2023. |
| sago-house | No. 56 | Founders Desiree Jane Silva, Jay Gray, and Abhishek C George relocated to Duxton Hill in October 2023 and continued the program that earned them No. 56 on Asia' |
| salmon-guru | No.37 | No.37 on the World's 50 Best Bars 2025, with sister bars in Dubai and Milan. |
| salmon-guru | No. 46 | It sits at No. 46 on Europe's 50 Best Bars 2026. |
| sastrer-a-martinez | No.33 | It placed No.33 on The World's 50 Best Bars 2025. |
| sastrer-a-martinez | #33 | (excerpt) #33 on World's 50 Best Bars 2025. |
| satans-whiskers | No. 21 | Named Best Bar in the UK by the Morning Advertiser and ranked No. 21 on the World's 50 Best Bars, this Bethnal Green stalwart doubled down in 2025 on precisely  |
| scarfes-bar | No. 31 | At No. 31 on the World's 50 Best, Scarfes operates in the sweet spot between establishment credibility and creative ambition. |
| scarfes-bar | No. 47 | It currently stands at No. 47 on Europe's 50 Best Bars 2026. |
| schmuck | No. 59 | Time Out ranked it among the five best cocktail bars in New York for 2025; the World's 50 Best placed it at No. 59. |
| scotch-lodge | No. 63 | It sits at No. 63 on North America's 50 Best Bars 2026. |
| seed-library-nyc | No. 66 | The bar holds No. 66 on North America's 50 Best Bars 2026. |
| selva-oaxaca-cocktail-bar | No.29 | No.29 on North America's 50 Best Bars 2025, No.43 in 2026. |
| selva-oaxaca-cocktail-bar | No.43 | No.29 on North America's 50 Best Bars 2025, No.43 in 2026. |
| service-bar-dc | No.23 | Ranked No.23 on North America's 50 Best Bars 2025, Service Bar pairs Chad Spangler and Glendon Hartley's meticulously built cocktail program with gloriously cri |
| shakerato | No. 2 | Shakerato is the Amsterdam bar from Eric van Beek and the team behind Handshake Speakeasy, No. 2 in the World's 50 Best Bars. |
| shelter | No. 98 | The latest lists place it at No. 98 on North America's 50 Best Bars 2026. |
| shinji-s | No.77 | No.77 in North America's 50 Best Bars 2026. |
| side-door | No. 53 | Bannie Kang, the 2021 Bartenders' Bartender Award winner, and chef-spouse Tryson Quek evolved a home supper club into this inconspicuous Neil Road neighborhood  |
| side-door | No. 57 | It currently stands at No. 57 on Asia's 50 Best Bars 2026. |
| sidecar | No.26 | It reached No.26 on the World's 50 Best Bars in 2022 and sits at No.62 in Asia for 2025. |
| sidecar | No.62 | It reached No.26 on the World's 50 Best Bars in 2022 and sits at No.62 in Asia for 2025. |
| silver-lyan-dc | No.55 | Ranked No.55 on North America's 50 Best Bars 2026. |
| sip-guzzle | No. 5 | At No. 5 on North America's 50 Best Bars, this is the most ambitious new opening the city has produced in years. |
| sip-guzzle | No. 1 | The bar holds No. 1 on North America's 50 Best Bars 2026. |
| sip-guzzle | #39 | (excerpt) #39 on World's 50 Best Bars 2025. |
| sips | No. 3 | Simone Caporale and Marc Álvarez hold the No. 3 position on the World's 50 Best Bars and the Best Bar in Europe title for a third straight year with a program t |
| sips | #3 | (excerpt) #3 on World's 50 Best Bars 2025. |
| slice-of-life | No. 90 | It currently stands at No. 90 on North America's 50 Best Bars 2026. |
| sober-company | No.42 | Its original incarnation (café, kitchen, cocktail society and the hidden Tipsy speakeasy) reached No.42 on the World's 50 Best Bars 2020 and No.5 in Asia 2021,  |
| sober-company | No.5 | Its original incarnation (café, kitchen, cocktail society and the hidden Tipsy speakeasy) reached No.42 on the World's 50 Best Bars 2020 and No.5 in Asia 2021,  |
| soko | No.46 | No.46 on Asia's 50 Best Bars 2023, still on the extended list in 2026. |
| sora | No. 100 | It currently stands at No. 100 on Asia's 50 Best Bars 2026. |
| speak-low | No.2 | Prohibition America is the theme; it reached No.2 on Asia's 50 Best Bars and No.10 in the world in 2017. |
| speak-low | No.10 | Prohibition America is the theme; it reached No.2 on Asia's 50 Best Bars and No.10 in the world in 2017. |
| star-bar | No.50 | The original of the STAR BAR group, it placed No.50 on Asia's 50 Best Bars in 2021. |
| stay-gold-flamingo | No.32 | No.32 in Asia's 50 Best Bars 2023. |
| stay-gold-flamingo | No. 97 | The bar holds No. 97 on Asia's 50 Best Bars 2026. |
| stir | No.58 | A fixture of Asia's 50 Best extended list five years running (No.58 in 2024, No.84 in 2026). |
| stir | No.84 | A fixture of Asia's 50 Best extended list five years running (No.58 in 2024, No.84 in 2026). |
| suite-115 | No. 74 | It sits at No. 74 on North America's 50 Best Bars 2026. |
| summer-experiment | No.77 | No.77 on Asia's 50 Best Bars 2021, and cocktails still average about four dollars. |
| super-lyan | No. 42 | No. 42 on Europe's 50 Best Bars 2026 and Best Bar in the Netherlands. |
| superbueno | No. 2 | Head Bartender Ignacio "Nacho" Jimenez built this neon-lit Mexican-American bar on First Avenue into the No. 2 spot on North America's 50 Best and No. 12 global |
| superbueno | No. 12 | Head Bartender Ignacio "Nacho" Jimenez built this neon-lit Mexican-American bar on First Avenue into the No. 2 spot on North America's 50 Best and No. 12 global |
| superbueno | No. 2 | (excerpt) Superbueno, ranked No. 2 in “The World’s 50 Best Bars” in North America, has also been honored as the Disaronno Highest New Entry and the Best Bar in Northeast  |
| svanen | No.32 | No.32 on the World's 50 Best Bars 2025. |
| svanen | #32 | (excerpt) #32 on World's 50 Best Bars 2025. |
| sweet-liberty | No. 21 | The late John Lermayer co-founded this Collins Park bar as a venue that could serve both industry professionals and tourists without compromising for either aud |
| swift | No.30 | Accolades include No.30 in the World's 50 Best Bars 2022 and Time Out London's No.1 Cocktail Bar 2018–19. |
| swift | No.1 | Accolades include No.30 in the World's 50 Best Bars 2022 and Time Out London's No.1 Cocktail Bar 2018–19. |
| swizzle-rum-bar-drinkery | No. 78 | Named Best Cocktail Bar in Florida for 2025 and ranked No. 78 on North America's 50 Best extended list, this Collins Avenue rum bar at The Stiles Hotel builds i |
| tag | No. 39 | Ranked No. 39 on Europe's 50 Best Bars 2026. |
| tan-tan | #24 | (excerpt) #24 on World's 50 Best Bars 2025. |
| tayer-elementary | No. 5 | The drinks land with the kind of quiet confidence that explains why this dual concept climbed to No. 5 on the World's 50 Best Bars in 2025. |
| tayer-elementary | No. 12 | It sits at No. 12 on Europe's 50 Best Bars 2026. |
| teens-of-thailand | No.27 | No.27 on Asia's 50 Best Bars in 2016. |
| tell-camellia | No.23 | No.23 in Asia's 50 Best Bars 2021. |
| tell-camellia | No. 81 | It currently stands at No. 81 on Asia's 50 Best Bars 2026. |
| the-aubrey | No.17 | No.17 in Asia's 50 Best Bars 2023. |
| the-bar-at-the-ritz-carlton-tokyo | No. 75 | The latest lists place it at No. 75 on Asia's 50 Best Bars 2026. |
| the-bar-in-front-of-the-bar | No.2 | What began in 2021 as a pop-up hatch covering a closed indoor bar became No.2 on Europe's 50 Best Bars 2026: a street-side, zero-waste stand with no indoor seat |
| the-bar-in-front-of-the-bar | No. 47 | 'Streets are the new family.' It sits at No. 47 on the World's 50 Best Bars 2025. |
| the-bellwood | No. 48 | Ranked No. 48 on the World's 50 Best, The Bellwood treats each sitting as a complete narrative: opening with something light and palate-cleansing, building thro |
| the-bellwood | No. 79 | It currently stands at No. 79 on Asia's 50 Best Bars 2026. |
| the-bellwood | #48 | (excerpt) #48 on World's 50 Best Bars 2025. |
| the-bombay-canteen | No.69 | No.69 on Asia's 50 Best Bars 2025. |
| the-cambridge-public-house | No. 20 | Hyacinthe Lescoët's upscale cocktail pub climbed nineteen places in 2025 to reach No. 20 on the World's 50 Best Bars, earning the Nikka Highest Climber Award an |
| the-cambridge-public-house | No. 7 | The latest lists place it at No. 7 on Europe's 50 Best Bars 2026. |
| the-cambridge-public-house | #20 | (excerpt) #20 on World's 50 Best Bars 2025. |
| the-clumsies | No.3 | Once No.3 in the world (2020), No.30 on Europe's 50 Best 2026; ask about The Room, the hidden fireplace-and-billiards space for six to ten. |
| the-clumsies | No.30 | Once No.3 in the world (2020), No.30 on Europe's 50 Best 2026; ask about The Room, the hidden fireplace-and-billiards space for six to ten. |
| the-cocktail-club | No.12 | Opened in 2021 above a bistro on Senopati, The Cocktail Club was named The Best Bar in Indonesia 2024 (No.12 on Asia's 50 Best) and won the Siete Misterios Best |
| the-coldroom | No. 97 | It sits at No. 97 on North America's 50 Best Bars 2026. |
| the-court | No.77 | The format is a curated tasting journey with a two-cocktail minimum per guest, and it reached the World's 50 Best Bars extended list in 2022 (No.77). |
| the-enigma-mansion | No.55 | No.55 on Asia's 50 Best Bars 2026. |
| the-golden-tooth | No.40 | The menu runs on flavor memory rather than technique, outside food is welcome (cup noodles, fried crickets offered), and the unhurried approach carried it to No |
| the-han-jia | No. 41 | It sits at No. 41 on Asia's 50 Best Bars 2026. |
| the-keefer-bar | No. 7 | It sits at No. 7 on North America's 50 Best Bars 2026. |
| the-old-man | No. 9 | Named after Hemingway's novella, this SoHo alleyway bar opened in 2017 and reached No. 9 on the World's 50 Best Bars at its peak, a performance that reshaped ho |
| the-old-man | No. 1 | In 2019 became even No. 1 on Asia's 50 Best Bars. |
| the-opposites | No. 54 | The latest lists place it at No. 54 on Asia's 50 Best Bars 2026. |
| the-pontiac | No. 33 | The bar ranked No. 33 on Asia's 50 Best Bars in 2022. |
| the-portrait-bar | No. 71 | It currently stands at No. 71 on North America's 50 Best Bars 2026. |
| the-public-house | No.40 | No.40 on Asia's 50 Best Bars 2025. |
| the-public-house | No. 92 | The latest lists place it at No. 92 on Asia's 50 Best Bars 2026. |
| the-savory-project | No. 32 | Ranked No. 32 on Asia’s 50 Best, this Staunton Street venue erases the boundary between kitchen and bar with a culinary cocktail program that treats ingredients |
| the-savory-project | No. 86 | It sits at No. 86 on the World's 50 Best Bars 2025 and No. 60 on Asia's 50 Best Bars 2026. |
| the-savory-project | No. 60 | It sits at No. 86 on the World's 50 Best Bars 2025 and No. 60 on Asia's 50 Best Bars 2026. |
| the-sg-club | No. 65 | Shingo Gokan's Shibuya flagship spent eight consecutive years on Asia's 50 Best list and held No. 65 on the World's extended ranking in 2025. |
| the-spirits-library | No. 98 | It currently stands at No. 98 on Asia's 50 Best Bars 2026. |
| the-st-regis-bar-jakarta | No.22 | No.22 on Asia's 50 Best Bars 2025. |
| the-wig-shop-boston | No.86 | Ranked No.86 on North America's 50 Best Bars 2026, the bar accepts reservations from 5 to 7pm Tuesday through Saturday and operates walk-in only after that, mai |
| three-sheets-dalston | No.16 | Brothers Max and Noel Venning opened this pared-back Kingsland Road original in 2016 and took it to No.16 in the World's 50 Best Bars 2019. |
| three-sheets-soho | No. 80 | The Soho edition debuted at No. 80 on the World's 50 Best Bars extended list, a first-year result that validated the expansion. |
| three-sheets-soho | No. 41 | It currently stands at No. 41 on Europe's 50 Best Bars 2026. |
| three-x-co | No.15 | No.15 on Asia's 50 Best Bars 2025, No.32 in 2026. |
| three-x-co | No.32 | No.15 on Asia's 50 Best Bars 2025, No.32 in 2026. |
| thunderbolt | No. 24 | Mike Capoferri built a laboratory-adjacent cocktail bar where most drinks require at least forty-eight hours of preparation, centrifuges, high-pressure nitrous, |
| thunderbolt | No. 92 | The latest lists place it at No. 92 on North America's 50 Best Bars 2026. |
| tiao | No. 50 | The bar holds No. 50 on Asia's 50 Best Bars 2026. |
| ticonderoga-club | No. 85 | It currently stands at No. 85 on North America's 50 Best Bars 2026. |
| tjoget | No.37 | The Best Bar in Sweden 2026 and No.37 on Europe's 50 Best, after seven straight years on the world list. |
| tjoget | No. 76 | It currently stands at No. 76 on the World's 50 Best Bars 2025. |
| tlecan | No. 3 | At No. 3 on North America's 50 Best Bars and No. 20 on the World's 50 Best Bars, Tlecān burns with conviction. |
| tlecan | No. 20 | At No. 3 on North America's 50 Best Bars and No. 20 on the World's 50 Best Bars, Tlecān burns with conviction. |
| to-infinity-beyond | No.35 | No.35 on Asia's 50 Best Bars 2026; the dumplings are, of course, Mars Spicy. |
| tokyo-confidential | No. 70 | Ranked No. 70 on Asia's 50 Best extended list, Tokyo Confidential channels Graham's editorial eye into cocktail curation: every drink tells a story, every ingre |
| tres-monos | No.10 | No.10 on the World's 50 Best Bars 2025 and Best Bar in South America. |
| trick-dog | No. 100 | It currently stands at No. 100 on North America's 50 Best Bars 2026. |
| true-laurel | No. 17 | At No. 17 on North America's 50 Best Bars, the bar changes its menu daily based on what arrives from local producers. |
| true-laurel | No. 30 | (excerpt) True Laurel, featured in “The World’s 50 Best Bars” at No. 30, showcases cocktails that highlight local and seasonal ingredients from the Bay Area. |
| two-schmucks | No. 11 | What Moe Aljaff and AJ co-founded reached No. 11 on the World's 50 Best Bars in 2021 and remains one of the most influential bar concepts of the decade. |
| under-lab | No.73 | No.73 on Asia's 50 Best Bars 2025 extended list; bartender Liu Guan-lin is a World Class Taiwan champion. |
| union-trading-company | No.31 | It reached No.31 on Asia's 50 Best Bars and No.47 in the world in 2021. |
| union-trading-company | No.47 | It reached No.31 on Asia's 50 Best Bars and No.47 in the world in 2021. |
| vesper | No.11 | Serious cocktails minus the pretentiousness: named after James Bond's martini, Vesper has held a place in Asia's 50 Best Bars every year since 2016 (peaking at  |
| vesper | No. 56 | It currently stands at No. 56 on Asia's 50 Best Bars 2026. |
| victor-audio-bar-buenos-aires | No. 87 | It currently stands at No. 87 on the World's 50 Best Bars 2025. |
| virtu | No. 45 | Head Bartender Keith Motsi runs the Four Seasons Tokyo's cocktail program at No. 45 globally, combining luxury hotel resources with a personal style shaped by y |
| virtu | No. 18 | Virtù won Tatler's bar award and sits at No. 18 on Asia's 50 Best. |
| waltz | No. 23 | It sits at No. 23 on Europe's 50 Best Bars 2026. |
| wax-on | No.17 | The Best Bar in Germany 2026, and No.17 on Europe's 50 Best, hides in plain sight on Weserstraße in Neukölln. |
| wax-on | No. 57 | The bar holds No. 57 on the World's 50 Best Bars 2025. |
| white-whale | No. 66 | Consulting partner Sam Ross, founder of Attaboy, No. 66 on North America's 50 Best Bars 2025, guided co-founder Daniel Yang and his team in building a kintsugi- |
| yacht-club-denver | No.41 | Williams Street is the bar that put Denver on the global cocktail map, ranked No.41 on North America's 50 Best Bars 2025 and No.67 on the 2026 extended list. |
| yacht-club-denver | No.67 | Williams Street is the bar that put Denver on the global cocktail map, ranked No.41 on North America's 50 Best Bars 2025 and No.67 on the 2026 extended list. |
| yakoboku | No. 59 | The bar holds No. 59 on Asia's 50 Best Bars 2026. |
| zapote-bar-playa-del-carmen | No. 95 | It sits at No. 95 on North America's 50 Best Bars 2026. |
| zest | No.2 | Korea's standard-bearer: No.2 on Asia's 50 Best Bars 2026, Best Bar in Korea four years running, and No.16 in the world in 2025. |
| zest | No.16 | Korea's standard-bearer: No.2 on Asia's 50 Best Bars 2026, Best Bar in Korea four years running, and No.16 in the world in 2025. |
| zuma | No. 17 | It was named the Best Bar in the Middle East and Africa in 2020 and ranked as high as No. 17 on The World's 50 Best Bars across a run from 2020 to 2022. |