# Noindex city pages with fewer than four bars, until they fill

From the coverage audit: 200 city pages, 117 of them carry one or two bars. A "Best Cocktail Bars in X" page with one bar is thin, competes with our own stronger pages and reads badly to anyone who lands on it.

Add `robots: { index: false, follow: true }` to /bars/city/<slug> when the city has fewer than 4 active bars, and drop those URLs from the sitemap. Keep the pages live and linked for navigation and for the crawler to follow through to the profiles. The moment a city reaches 4, it becomes indexable again with no further action, so make the rule live and count-driven, never a hand-kept list.

Do the same for /best-bars/<city> if that route has no minimum, matching whatever threshold it uses today (the region pages use MIN_REGION_BARS = 6; say in the report what the city routes use).

Report: how many city pages are noindexed by this rule, the list, the sitemap count before and after, and confirmation that a city crossing the threshold flips back automatically.
