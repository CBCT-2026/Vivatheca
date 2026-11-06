# Repository Guidelines

## Project Structure & Module Organization

The Vivatheca platform is a TypeScript/React application built with Next.js-compatible Vinext and packaged for Cloudflare Sites.

- `app/page.tsx` defines the homepage.
- `app/models/` holds the model library (`/models`), `catalogue.ts` (every model's card data, files, sources, simplifications, change log and citation) and one page per model (e.g. `/models/impacted-wisdom-tooth`, with `compare.tsx` showing the pathology beside its matched normal). Add each new model to `catalogue.ts`; every pathology model needs a matched normal.
- `app/about/`, `app/privacy/` and `app/report/` (report-an-inaccuracy form that opens a pre-filled email) are plain info pages using `PageHeader` and `SiteFooter` from `app/site-chrome.tsx`.
- `app/ui.tsx` contains interactive client components, including the homepage 3D viewer (`ModelExperience`).
- Homepage model layout (Luke, 2026-11-06): the impacted wisdom tooth is the hero image at the top; the interactive section (`#collection`) shows the alveolar bone graft series in three stages (models from CBCT-2026/ABG in `public/models/abg/`, own colours kept; collection page `/models/alveolar-bone-graft` reuses the same viewer, Draco decoder from `public/development/vendor/draco/`; stage words in `t.abg`, sources in `app/abg.ts`); `#showcase` shows a mix of other models from `catalogue.ts` (list in `app/page.tsx`, includes dental development); the wisdom tooth X-rays and scans sit under the print section so they stay next to the matching model.
- `app/data.ts` contains reusable catalogue and navigation content.
- `app/globals.css` contains the design tokens and shared styles.
- [`assets/`](./assets/) stores generated landing-page illustrations and [`assets/manifest.json`](./assets/manifest.json) records their purpose, alternative text, and generation provenance.
- `public/development/` and `public/orthognathic/` are static model pages (model-viewer, Draco). Their build scripts and method notes are in `tools/development/` and `tools/orthognathic/`. The orthognathic page reuses the viewer, Draco decoder, `style.css` and `theme.js` from `public/development/`, so keep those paths stable.
- `public/` stores deployable logos, favicon media, Material Symbols, and the supplied GLB.
- `output/pdf/vivatheca-landing-page-full-view.pdf` is the current full-length desktop reference export of the landing page.
- `.openai/hosting.json` identifies a Sites deployment when present. Never replace an existing `project_id`.
- `docs/hosting/vivatheca-com-cutover.md` records the pending apex-domain DNS values, private-access policy and activation checks for `vivatheca.com`.
- `Vivatheca PRD.docx` is the evolving product specification and must remain aligned with material homepage, content, governance, provenance, and sustainability changes.

Do not edit generated directories: `dist/`, `.vinext/`, `.wrangler/`, `.next/`, or `node_modules/`.

## Build, Test, and Development Commands

Use pnpm with Node.js 22.13 or newer.

- `pnpm dev` starts the local Vinext development server.
- `pnpm lint` checks TypeScript and React code with ESLint.
- `pnpm build` creates and validates the production bundle in `dist/`.
- `pnpm test:e2e` runs Playwright's critical browser journeys.
- `pnpm start` serves an existing production build locally.

Run lint, the relevant Playwright tests, and the production build before submitting changes.

After every material landing-page change, update `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, `Vivatheca PRD.docx`, and any affected asset or testing records. Then regenerate `output/pdf/vivatheca-landing-page-full-view.pdf` from the validated desktop experience and visually inspect the rendered PDF before delivery.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, and single-quoted imports. Write React function components in PascalCase, variables and hooks in camelCase, and route folders in lowercase kebab-case. Reuse the semantic colour and spacing tokens in `:root` rather than adding isolated values. Use the theme-aware tokens (`--surface`, `--heading`, `--accent` and the rest listed in `DESIGN.md`) for light surfaces and text so new pages work in both light and dark mode; light is the default.

Guard client-only APIs such as `localStorage`, Fullscreen, and Clipboard for server rendering. Keep interactive controls keyboard accessible and provide text alternatives for 3D content.

## UI/UX Direction

For interface work, use the installed `ui-ux-pro-max` and `impeccable` skills together with `DESIGN.md`. Base decisions on the Vivatheca platform's brand, content, existing tokens, and user needs. Avoid generic AI layouts, excessive cards, decorative gradients, glassmorphism, generic SaaS palettes, unverified proof, and placeholder stock imagery. Every design choice must serve a product-specific purpose.

## Landing Page Assets

Since 5 November 2026 the site shows screenshots of its own 3D models (`public/assets/renders/`) instead of AI illustrations. The rules below apply only if AI illustrations are ever reintroduced.

Use [`assets/`](./assets/) as the source of truth for landing-page illustrations and related media. Replace stock imagery with original, content-specific illustrations generated with ImageGen, keep a consistent visual language, record prompt provenance in the manifest, and integrate every meaningful image with useful alternative text. Copy optimised shipping versions to `public/assets/`; do not reference files outside the repository. Every AI-generated image must carry the visible, subtle disclosure “AI-generated illustration.” Research illustrations are interpretive companions and must never be implied to be figures from a cited paper.

The translation roadmap uses accurate, licensed vector flags from the MIT-licensed `flag-icons` collection, retained in `assets/flags/` with a shipping copy in `public/flags/` and its licence alongside both. Flags support recognition but never replace the centred English and native-language labels. Preserve correct `lang`, `dir` and bidirectional-isolation markup.

The current 24-language roadmap replaces Indonesian with Dutch (`Nederlands`) and remains alphabetical by English name. Its responsive grid uses 8, 6, 4, 3 and 2 columns as the viewport narrows so labels remain readable while excess vertical space is avoided.

Keep global-access data markers, legends and location labels as accessible HTML layered over the generated cartographic base. Social badges may use official platform symbols, but account links remain disabled until the organisation supplies or independently verifies the exact profile URLs.

## Languages (English and Japanese)

The platform is translated into English (default) and Japanese; the structure is ready for more languages. `app/i18n/config.ts` lists the locales and the cookies (`vivatheca-lang`, `vivatheca-furigana`); `app/i18n/dictionaries/en.ts` is the source text and every other dictionary must match its shape (TypeScript enforces this). Server components call `getI18n()` from `app/i18n/server.ts`; client components use `useI18n()`. Never hard-code visible text in components: add it to `en.ts` and `ja.ts`. `?lang=ja` on any URL sets the cookie and redirects (worker/index.ts).

Japanese text carries furigana for every kanji word, written inline as `{漢字|かんじ}` and rendered by `<Ruby>` (`app/i18n/ruby.tsx`) as `<ruby>` with `aria-hidden` readings. Use `plain()` for attributes (alt, aria-label, placeholders, metadata). Visitors can hide furigana. Use standard Japanese dental terminology with dental readings (下顎 = かがく, 下歯槽神経 = かしそうしんけい, 智歯 = ちし) and everyday words first in plain-language text (親知らず). The static `/development` page reads the same cookie through `public/development/i18n.js` (`data-i18n` keys). Japanese translations need review by a native-speaking clinician before launch. Until then, every Japanese page says so: `t.disclaimer.translationNote` in the app footers and `.vt-translation-note` from `public/contact.js` on static pages (static pages must load `/contact.js`). In Japanese mode, show the Japanese disclaimer and review status only, and mark the verbatim English versions `lang="en"` so they hide, as on every other page.

## Student pages (/learn)

The site has two audiences, kept on separate pages: clinicians educating patients (homepage, model pages, `/create`) and dental and medical students (`/learn`). The homepage `#audiences` section and the "Students" nav link route between them. Never mix student-level text into patient pages; link instead. `app/learn/page.tsx` is the hub, `app/learn/development/page.tsx` the first student guide, `app/learn/chrome.tsx` the shared header, footer and `<Cited>` helper (`[n]` markers in dictionary text become numbered links to `#src-n`), and `app/learn/sources.ts` the guide's checked sources. Student text lives in `t.learn`, `t.learnDev`, `t.learnCracked`, `t.learnPerio`, `t.learnOrtho`, `t.learnOac`, `t.learnSsc` and `t.learnHn` in both dictionaries; `/learn/periodontitis`, `/learn/orthognathic`, `/learn/oroantral`, `/learn/steel-crown` and `/learn/head-neck` reuse the cracked-tooth guide layout. `public/model-page.js` (loaded on every static model page) adds a link to the page's student guide when it has none, a link to `/create?model=<id>` for clinicians, a skip link and 24 px citation targets: add new model pages to its maps. Every student guide shows the review status, the model disclaimer and a link to `/disclaimer`, and says where the model simplifies the evidence. When a model page's method changes, check the matching student guide still agrees.

## Patient Information Builder

`app/create/` holds the `/create` builder: `briefs.ts` (model briefs with label names, material types and the system prompt condensed from the patient-education-toolkit skills), `checker.ts` (TypeScript port of the toolkit's deterministic checks), `markdown.ts` (safe Markdown rendering) and `builder.tsx` (UI). `app/api/generate/route.ts` calls Claude (`claude-opus-5-5`) only when the `ANTHROPIC_API_KEY` secret is set; otherwise the builder runs in copy-prompt mode. Keep the AI-limits acknowledgement, the persistent warning banner, the patient-details check and the DRAFT export notice. Never store briefs or drafts on the server. When a new model ships, add its brief (label names exactly as on the model) to `modelBriefs`.

## Testing Guidelines

Use Playwright for user-visible guarantees and semantic locators. Verify affected routes, mobile layouts, keyboard controls, language direction, model fallbacks, and locally stored favourites. Keep tests independent and place them under `tests/` as `*.spec.ts`.

## Evidence and transparency (required for everything)

This is a standing project rule. It applies to every page, model, download, text and generated material, whether or not a task restates it.

- Use only high-quality sources: peer-reviewed literature, systematic reviews, specialty society guidelines (for example AAP/EFP, AAPD, AAE, AAOMS, NCCN) and government or formally approved resources. Never use unsourced claims, blogs or AI-generated content as evidence.
- Every factual statement in page text and every model design decision must cite its source visibly on the page: author, year, title or organisation, and a link (DOI or official URL) where one exists. Use numbered superscript citations with a "Sources" list on the same page.
- Say plainly where a model simplifies or departs from the evidence, and which values are estimates rather than sourced.
- When evidence is uncertain or conflicting, say so on the page.
- If no good source can be found, remove the claim or label it clearly as unverified. Do not invent or guess references; check each one (for example on PubMed) before citing it.
- Operational or organisational statements (what Vivatheca plans or offers) are not health claims, but must not imply evidence or verification that does not exist.

## Patient education text (required)

This is a standing project rule. Every text-based patient education material on Vivatheca (model pages, stage captions, tours, leaflets, builder drafts and exports, in every language) must follow the [patient-education-toolkit](https://github.com/CBCT-2026/patient-education-toolkit) (`pitk`) rules and pass its checker with no errors.

- Run `node tools/patient-text/snapshot.mjs` then `pitk check` (or `pnpm check:patient-text`) before submitting any change to patient-facing text. CI (`.github/workflows/patient-text.yml`) runs the same check on every pull request. Setup and what is left out: `tools/patient-text/README.md`.
- New static pages under `public/` are found automatically. New patient-facing app text must be added to `tools/patient-text/snapshot.mjs`.
- Write for patients: speak to the reader ("you"), short sentences (20 words or fewer; Japanese 50 characters or fewer), active voice, plain words first with the medical name in brackets ("the big upper back tooth (first molar)"), risks as "X in 100" with the same denominator. Japanese uses やさしい日本語 with furigana, jouyou kanji only.
- Put technical detail for clinicians in a closed `<details class="clin">` or a section headed "For clinicians"; the checker leaves those out. Do not hide patient text from the checker with `.small` or `.pitk-skip`.
- Plain-language rewrites must keep every citation and must not change what the source says. The evidence, disclaimer and language rules still apply; the disclaimer wording stays verbatim.
- The `/create` builder applies the same rules in the browser (`app/create/checker.ts`, `briefs.ts`). When the toolkit changes, update the port, the pinned commit in the workflow, and this section.
- For judgement the checker cannot make (PEMAT, CDC Clear Communication Index, risk wording), use the toolkit's skills, and test materials with people from the audience.

## Clinical images (required for all conditions and cases)

Follow [`docs/image-licensing.md`](docs/image-licensing.md) for every radiograph, scan, clinical photograph or third-party figure: accepted licences, the limits on non-commercial (NC) images, full visible attribution, patient consent, and the register entry in `assets/clinical-images/manifest.json`. Skip any image whose licence or consent is unclear. Not-for-profit status never overrides a licence, and Australian fair dealing does not cover publishing these images.

## Disclaimer (required everywhere)

`app/disclaimer-text.ts` is the single source of the disclaimer wording; `/disclaimer` (`app/disclaimer/page.tsx`) shows the full version. Every page must show `siteDisclaimer` (the footer does this) or a link to `/disclaimer`. Every model viewer, model page and download must show its review status, `modelDisclaimer` and a link to `/disclaimer`. Static pages under `public/` copy the model wording verbatim. Generated or exported materials keep the AI and DRAFT notices. Never describe a model as suitable for diagnosis, treatment planning, surgical guides or use in or on the body. Translations of the disclaimer must be reviewed by a fluent speaker before release.

## Security & Clinical Content

Never commit credentials, patient information, private form submissions, or `.env` files. Medical claims, reviewer records, licences, translations, and model limitations require verification before being presented as final. Clearly label prototype content and unavailable production workflows. Describe Vivatheca as a platform, not a site or service. Treat Australian operation as user-supplied organisational information; source official flag media from the Australian Government. Present recycling and recovery work as exploratory until a verified programme or partner exists.

`https://vivatheca.com` is the canonical production origin. During the private-preview period, preserve the hosted project’s owner-only access policy and keep authentication at the edge. Never implement a client-side password gate or commit a shared password. Use explicit identity allowlists with Cloudflare Access or the existing Sites access policy; an unauthenticated visitor must not receive protected HTML, the GLB or generated assets.

Contribution copy must distinguish model submissions, printed-model donations, 3D-printing resource donations, clinical review, and translation. Clinical-review records must expose approval state, ratings and review recommendations without exposing more than a verified reviewer’s title, initials, occupation and country of practice. Reviewers assess educational model fidelity only; condition and procedure information must cite high-quality sources visibly (see Evidence and transparency).

The impacted-molar review example is explicitly illustrative prototype data. Its generated anatomy shows no erupted tooth directly above the impaction and depicts the left inferior alveolar nerve below the tooth roots, emerging through the left mental foramen; clinical accuracy must still be independently verified. Keep the review example compact, cap it at 1280px on wide screens, and stack the image and review data below 900px.

Illustrative review examples must be unmistakably labelled as prototype data and must not imply that a displayed clinician or approval record has been verified. The current impacted-molar example uses a generated anatomical interface base with accessible HTML for reviewer attribution and review totals.
