# Contributing to Vivatheca

Vivatheca is a not-for-profit library of free 3D models of oral and maxillofacial conditions, each with matching normal anatomy, for clinicians making patient education materials and for students. Help is welcome, especially from clinicians.

Vivatheca is for general education only. It is not medical advice and must not be used for diagnosis, treatment planning or surgical guidance. See [vivatheca.com/disclaimer](https://vivatheca.com/disclaimer).

## Never share patient information

Issues and pull requests are public. Never post patient names, photos, scans, records or any detail that could identify a person. Vivatheca does not accept models made from a real patient's scan.

## Report an error

If a model or page is wrong, out of date or unclear:

1. Open a [Report an error](../../issues/new?template=error-report.yml) issue, or use [vivatheca.com/report](https://vivatheca.com/report) if you prefer email.
2. Say which page or model, what it shows now and what it should show.
3. **For anatomy or clinical errors, give a source:** a peer-reviewed paper, systematic review, specialty society guideline or government resource (author, year, title, DOI or link). Clinical content changes only with a high-quality source; blogs and AI-generated text are not accepted as evidence.

Each report is checked against the source. If the change is accepted, the model's change log on its page records it.

## Request a model

Open a [Request a model](../../issues/new?template=model-request.yml) issue, vote on the [request board](https://vivatheca.com/requests), or use [vivatheca.com/contribute](https://vivatheca.com/contribute?kind=request). Every pathology model is built with a matched normal model to compare with.

## Submit a model, review or translate

- **Models:** see [vivatheca.com/contribute](https://vivatheca.com/contribute) and the review checklist in [`docs/model-submissions.md`](docs/model-submissions.md). Submitted models are licensed CC BY-SA 4.0.
- **Clinical review:** reviewers check that a model is a fair educational picture of typical anatomy or disease. Email vivatheca@gmail.com.
- **Translation:** every translation, and the disclaimer in particular, needs review by a fluent speaker. Email vivatheca@gmail.com.

## Code and content changes

The rules for pull requests are in [`AGENTS.md`](AGENTS.md) and the pull request template. In short: cite sources visibly, keep the disclaimer and review status on every model, record licences, update English and Japanese together, and run `pnpm lint`, the relevant Playwright tests and `pnpm build`.

Website code is MIT licensed; models, print files and renders are CC BY-SA 4.0; clinical images keep their own licences (see `REUSE.toml`).
