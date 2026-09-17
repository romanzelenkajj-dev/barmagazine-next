# Hong Kong / Macau country normalization

Some rows have `country = 'China'` for bars that are in Hong Kong or Macau (seen: Bar Leone and Argo, both Hong Kong). Directory cards, placeLine and city pages should show "Hong Kong" / "Macau", not "China".

1. Query all active bars where city is Hong Kong or Macau (any spelling: Hong Kong, Hongkong, HK, Macau, Macao) and report id, slug, name, city, country.
2. Set `country` to `Hong Kong` for Hong Kong rows and `Macau` for Macau rows, by id. Set `city` to the canonical spelling ("Hong Kong", "Macau").
3. Check `city-keys.ts` / `city-index.ts` produce one city page each (`/bars/hong-kong`, `/bars/macau`) and that no `china` page lists them any more. If any redirect is needed from an old city slug, add it through the generator, never by hand, and run the chain check.
4. Purge the city-index cache tag, run the sitemap count check, and report the rows changed plus the resulting city page URLs.

Do not touch any other country values in this task.
