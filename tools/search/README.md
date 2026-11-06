# Site search

`/search` uses [Pagefind](https://github.com/Pagefind/pagefind) (MIT): a static index in `public/pagefind/`
that the browser loads in small chunks, so there is no search server and no cost.

- `pnpm search:index` renders every app route and static page in Chromium, in English and Japanese
  (the static model pages swap their text in at run time), and writes one index per language.
  The search page picks the index for the visitor's language and rewrites result links
  (Japanese results get `?lang=ja`, which the worker turns into the language cookie).
- The index is committed, so deploys need no browser. CI (`models-and-licences.yml`, job `search-index`)
  rebuilds it and fails when a page was added or removed without re-indexing (Pagefind's output and a few
  viewer captions are not byte-for-byte reproducible, so changed text is not detected: after changing page
  text, run `pnpm build`, `pnpm start`, then `pnpm search:index` and commit `public/pagefind/`).
  `public/pagefind/vivatheca-pages.json` lists every indexed URL with a hash of its text.
- Not indexed: `/search`, `/report`, `/api`, headers, footers, navigation, citation superscripts.
- Japanese has no stemming in Pagefind; whole-word matches still work.
