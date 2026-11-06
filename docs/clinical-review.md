# Clinical review sign-off

Every model page says "Not yet clinically reviewed" until a qualified clinician signs off its current version. The record lives in `app/models/reviews.ts`. It is shown on `/review`, on the model's card in `/models`, in the "Use this model" credit and embed bar on each model page (through `/api/models`), and in the JSON-LD (`creativeWorkStatus`, `reviewedBy`).

## Who can review

- A registered clinician in the model's specialty, such as a general dentist, an endodontist or an oral and maxillofacial surgeon.
- Translations can only be reviewed by someone fluent in the language. A translation review can be recorded separately.
- The reviewer must agree in writing (email is enough) to be named on the site, with the name and credentials exactly as they want them shown.

## Steps

1. Send the reviewer the model page link, its version number and the checklist below.
2. They reply with what they found.
3. Fix the errors, raise the model's `version` and `updated` in `app/models/catalogue.ts`, and send them the new version.
4. When they approve, add a record to `reviews` in `app/models/reviews.ts`. The record has:
   - `model`: the catalogue slug.
   - `version`: exactly the current catalogue version.
   - `date`: the date of their approval email.
   - `reviewer`, `credentials`, `country`.
   - `checked`: which items below they covered.
   - `outcome: 'approved'`.
   - `notes`: what was changed, or what was kept as a stated simplification.
   A review that asked for changes can be recorded with `outcome: 'changes-requested'`.
5. Keep the approval email in Vivatheca's mailbox. Never commit emails or patient details.
6. Static model pages (under `public/`) also have the words "Not yet clinically reviewed" written into their HTML beside the viewer. Update that line on the reviewed model's page in all languages, using the wording in `t.review.status`.

A record only counts while its `version` matches the catalogue. Raising a model's version puts it back to "Not yet clinically reviewed" until it is reviewed again.

## Checklist (the same as on /review)

- **Anatomy:** shapes, sizes and positions match normal anatomy and the cited sources.
- **Condition:** the disease or problem looks the way it typically does.
- **Treatment:** any treatment shown matches current practice.
- **Patient text:** correct, plain and not alarming.
- **Sources:** each figure on the page has a fitting, high-quality source.
- **Translation** (fluent reviewers only): the Japanese or Vietnamese text says the same as the English.

Clinical review checks educational accuracy only. It does not make a model suitable for clinical use, as the full disclaimer says.
