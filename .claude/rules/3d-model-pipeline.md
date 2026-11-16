# New or rebuilt 3D models: use the model pipeline (from 16 Nov 2026)

Every new 3D model, and every rebuild of an existing one, follows the image-to-model pipeline proven on the impacted wisdom tooth. Do not improvise a new build loop.

- Use the account skills in this order: `vivatheca-new-3d-model` (intake, parts, tracing, locked spec), `vivatheca-fit-and-gate` (solver, checks, pairwise review), `vivatheca-review-page` (the two sign-off pages), then `vivatheca-new-model-page` (site wiring).
- Shared pipeline files: `/mnt/project-files/model-pipeline/` (parts library with `meta.yaml` per part, templates, review page, DentalSegmentator install). The wisdom tooth spec and gate: `/mnt/project-files/wisdom-tooth-3d/pipeline-2026-11-16/`.
- Ask the client only four things at intake (condition and site, one reference image, up to three teaching points, audience), then only at the two sign-offs or one escalation card. Never ask for dimensions or sources.
- Precedence: teaching point > anatomy > silhouette > style.
- Real CT-derived parts (for example the University of Dundee CC BY 4.0 teeth) are posed rigidly with uniform scale only. No bending or stretching.
- AI-generated images are targets or restyles only; never fit or ship AI-invented anatomy as fact.
- Builders never edit the locked spec or the checks. Changes go to the client as a change request.
- The solver picks the numbers, not the agent. Deterministic checks first; the review jury can veto or escalate but never override a failed check. Six passes per part at most, then escalate.
- Licences: shipped geometry must be CC BY 4.0, CC BY-SA 4.0 or CC0. Non-commercial data (ToothFairy, Open-Full-Jaw, DITTO, TotalSegmentator teeth output) is for measurements only and never enters a build or this repository.
- Never commit API tokens, the site password or personal emails.
