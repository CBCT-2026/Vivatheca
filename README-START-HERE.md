# Vivatheca streamlined working folder

This folder is a clean working copy of the Vivatheca platform and its key project documents, assembled on 27 August 2026.

## Main contents

- `app/` — platform pages, content, interactive components and styling.
- `assets/` and `public/` — source illustrations, provenance records and deployable media.
- `docs/` — hosting, provenance and supporting project documentation.
- `tests/` — user-facing automated tests.
- `output/pdf/` — current full-page reference export.
- `documents/presentations/` — finished Vivatheca presentation decks.
- `Vivatheca PRD.docx`, `PRODUCT.md`, `DESIGN.md` and `AGENTS.md` — core product, design and working guidance.
- `.openai/hosting.json` — existing Sites deployment identity; do not replace its `project_id`.

## Intentionally excluded

Dependency folders, build output, test output, local caches, temporary slide renders, debug logs, packaged deployment archives, environment files and Git internals were not copied. These can be regenerated or may contain machine-specific or sensitive data.

To work on the platform, install dependencies with `pnpm install`, then use the commands documented in `AGENTS.md`.
