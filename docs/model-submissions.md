# Model submissions and requests

Visitors send models and requests from `/contribute` (`app/contribute/`). The form builds an email to vivatheca@gmail.com; nothing is uploaded to or stored by Vivatheca. Files arrive as a share link. `/contribute?kind=request` opens the form on "Request a model".

## Review checklist for a submitted model

Work through every item before a submitted model goes on the site. Record the outcome in the model's change log.

1. **Rights and licence.** The contributor ticked all three boxes. The model and every part it uses can be shared under CC BY-SA 4.0 (Z-Anatomy-based work must be). Note any third-party source and its licence.
2. **No patient data.** The model is not made from a real patient's scan, photo or record. If there is any doubt, decline it. Do not keep files that turn out to contain patient data: delete them and tell the contributor.
3. **Evidence.** Every design decision (size, position, stage, colour meaning) has a high-quality source (see AGENTS.md, Evidence and transparency). Check each reference exists (PubMed or DOI). Write down what the model simplifies.
4. **Matched normal.** A pathology model needs a matched normal. Build one if the contributor could not.
5. **Files.** Opens in the viewer, is watertight for printing, sensible size for the web (Draco GLB), parts named as materials for the "Take the model apart" tools, colours follow the collection standard.
6. **Case images.** Any clinical images follow `docs/image-licensing.md` and match the model (same site, side and extent).
7. **Site steps.** Add to `app/models/catalogue.ts`, `library.items` in `en.ts` and `ja.ts`, a render in `public/assets/renders/`, and the usual header links. Patient text passes `pnpm check:patient-text`.
8. **Status and credit.** Publish as "Not yet clinically reviewed" with the model disclaimer and a link to `/disclaimer`. Credit the contributor by the name they gave (or "Anonymous contributor").
9. **Reply.** Tell the contributor the outcome. If declining or asking for changes, say why.

## Requests

Add requested conditions to the list of models to build, with the requester's sources. Requests do not change the evidence rules: a requested model still needs published sources before it is built.
