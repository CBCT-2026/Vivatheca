## What changed

<!-- One or two sentences. Link the issue if there is one ("Closes #12"). -->

## Screenshots or renders

<!-- For model or page changes, add before/after images. GitHub shows image diffs for changed PNG/WebP files. -->

## Project rules

Tick what applies; delete lines that do not.

**Evidence**
- [ ] Every new fact and model design decision cites a high-quality source visibly on the page (author, year, title, DOI/link)
- [ ] Anatomy and dimensions come from cited clinical research, not self-chosen figures
- [ ] Simplifications and uncertain evidence are stated on the page

**Disclaimer and review status**
- [ ] Model pages and downloads show the review status, the model disclaimer and a link to /disclaimer (wording from `app/disclaimer-text.ts`, copied verbatim)

**Licences**
- [ ] Clinical images follow `docs/image-licensing.md` and are in `assets/clinical-images/manifest.json`
- [ ] New third-party files are covered in `REUSE.toml`; models built from Z-Anatomy stay CC BY-SA 4.0

**Text and languages**
- [ ] English and Japanese both updated (furigana on kanji); no hard-coded visible text
- [ ] Patient text passes `pnpm check:patient-text`
- [ ] Paragraph text stays justified

**Models**
- [ ] Teeth realistic white, inferior alveolar nerve yellow (development models: baby teeth blue, adult teeth yellow)
- [ ] New model is in `app/models/catalogue.ts`, the collection, and links to the homepage
- [ ] `pnpm check:glb` passes

**Checks**
- [ ] `pnpm lint`, relevant `pnpm test:e2e` specs and `pnpm build` pass
