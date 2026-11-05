# Patient text check (patient-education-toolkit)

Every text-based patient education material on Vivatheca is checked with the
[patient-education-toolkit](https://github.com/CBCT-2026/patient-education-toolkit) (`pitk`):
reading level, sentence length, jargon, talking to the reader, risk numbers, Japanese kanji level and more.
The rules come from the NHS content guide, CDC Clear Communication Index, PEMAT, IPDAS, ISO 24495-1 and
やさしい日本語 guidance (see the toolkit's `docs/guidelines.md`). The checks are a first filter, not proof of quality.

## Run it

```
pip install "setuptools<81" "patient-education-toolkit[ja] @ git+https://github.com/CBCT-2026/patient-education-toolkit"
pnpm install
node tools/patient-text/snapshot.mjs   # writes .pitk/ (git-ignored)
pitk check                              # or: pnpm check:patient-text
```

`setuptools<81` is needed because textstat 0.7.3 imports `pkg_resources`. Set `PW_CHROMIUM` to a Chromium
binary if Playwright's own browser is not installed. CI runs the same steps (`.github/workflows/patient-text.yml`)
on every pull request and fails on any error.

## What is checked

`snapshot.mjs` writes the text a visitor actually sees, so the checker reads the same words as patients:

- **Static model pages** (`public/*/index.html`, found automatically, so new pages are covered): rendered in
  Chromium in English and, where the page has a translation, in Japanese (cookie `vivatheca-lang=ja`).
  Hidden elements are dropped and the caption of every stage, age, bite or before/after button is added,
  because `viewer.js` writes those captions at runtime.
- **App routes**: the plain-language tour of the homepage model (`model.tour` in `app/i18n/dictionaries`).
  The rest of the homepage, `/create` and `/disclaimer` are written for clinicians or are fixed legal wording.
- **Patient information builder** (`/create`): drafts are checked in the browser by `app/create/checker.ts`,
  a TypeScript port of the same rules with the same limits. Exported Markdown can also be checked with
  `pitk check draft.md`.

`.patient-info.json` (repository root) sets the rules. What it leaves out, and why:

| Left out | Why |
| --- | --- |
| `sup.cite`, `.refs`, "Sources" | Citations and reference lists |
| `.status`, `.review`, `.disclaimer`, "About this/these model(s)" | Review status and the disclaimer, which must be copied verbatim from `app/disclaimer-text.ts` |
| `.clin`, "For clinicians…" sections | Technical detail for clinicians, kept in a closed `<details class="clin">` or a section headed "For clinicians" |
| `.small`, `.credit`, "3D printing" | Method notes, licences and print instructions |
| `rt`, `rp` | Furigana readings (the kanji are checked) |
| `.pitk-skip` | Escape hatch. Do not use it for patient text |

Other settings: Japanese kanji are limited to the 2,136 jouyou kanji (`ja_kanji: "jouyou"`) rather than
the toolkit's default grade 1 to 6 list, because every kanji on the site carries furigana and Japanese dental
terms must stay accurate. `jargon_allow` holds 上顎洞 and 上顎 (explained where first used; 上顎 is listed
because the checker also matches it inside 上顎洞) and the Roman numerals II, III and IV used for stages and
classes. Add a term only when every page that uses it explains it.

Warnings do not fail CI. Most remaining warnings are Japanese kanji share and sentence length, and percentages
that describe bone loss (not risks). Fix them when you edit the text.
