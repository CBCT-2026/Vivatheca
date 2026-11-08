# Volunteer roles: section editors and language leads

Public page: `/standards` (sections `#editors` and `#language-leads`). Role data: `app/standards/roles.ts`. Words: `t.standards`.

Decided by Luke on 8 November 2026 (anatomy apps and nonprofits review, items #9 and #10):

- **Language leads:** one volunteer clinician per language (Japanese and Vietnamese first, Chinese later). Plan how to source translators. **No financial reimbursement.**
- **Section editors:** set the roles up now and show "Pending specialist involvement" until specialists join.

All roles are unpaid. Vivatheca pays no fees, wages or honoraria and does not reimburse expenses. Do not offer anything of money value (gift cards, paid conference places, free products) in exchange for review work.

## What each role does

| Role | Who | Does | Signs off |
|---|---|---|---|
| Section editor (one per discipline in `app/models/disciplines.ts`) | Registered clinician; specialist preferred for specialist topics | Reviews new models and changes in the section against the sources and the clinical review checklist (`docs/clinical-review.md`); triages error reports | Model versions in that section (recorded in `app/models/reviews.ts`) |
| Editorial board | Two or three senior clinicians, once there are section editors | Oversees editors, settles disagreements, reviews this policy | Changes to the content standards |
| Language lead (one per language) | Registered dentist, doctor or oral health professional, fluent in the language and in English | Reads each page beside the English; fixes meaning, clinical terms and tone; approves other volunteer translators | Translations, recorded with `pnpm i18n:status --mark-reviewed --by "Name"` (see `docs/translation-status.md`) |
| Volunteer translator | Fluent speaker; a clinical background is preferred but not required | Drafts or corrects text under a language lead | Nothing: their work is signed off by the language lead |

## How to find language leads and translators

In this order. Each step is free.

1. **People who already offered.** Check the mailbox for "Join clinical review", survey free-text answers and `/used` posts from clinicians who work in Japan or Vietnam, or in another country but speak Japanese or Vietnamese.
2. **Dental and medical schools.** Email faculty in oral surgery, paediatric dentistry, dental public health or dental education departments in Japan and Vietnam with the role description (copy the `/standards` text) and the two-line summary below. Ask whether a staff member or postgraduate would take the role, or would pass it on. Teaching staff are the best fit because the work also suits student teaching (`/learn`).
3. **Bilingual clinicians in Australia.** Overseas-trained dentists and doctors in Australia often keep both languages. Ask Australian dental and medical alumni networks and the professional associations' member noticeboards whether a volunteer notice can be posted.
4. **Professional societies in each country.** National dental associations and specialty societies sometimes share volunteer or education notices with members. Ask once; do not chase.
5. **Supervised students.** Bilingual dental or medical students may draft or correct text, but only a language lead signs it off.

Not used: paid translation agencies, machine translation as a final version, or anyone who would sign off clinical wording without a clinical registration.

Two-line summary for emails:

> Vivatheca is a free, not-for-profit library of 3D dental and oral and maxillofacial models for patient education. We are looking for a volunteer (unpaid) clinician fluent in [language] to check and sign off our [language] translation; credit on the site if you wish. Details: https://vivatheca.com/standards#language-leads

## Before someone starts

1. **Check registration** on the public register where they practise (for Australia, the Ahpra register of practitioners). Record the register name and date checked, not a screenshot.
2. **Declaration of interests** by email, using the ICMJE categories: payments, shares, paid speaking or consulting for companies, and non-financial interests such as a strong professional stake in one treatment. "None" must be stated, not assumed.
3. **Written agreement** (email is enough) to: the role description; publishing their corrections under the page or model's licence; and whether and how they want to be named (name and credentials exactly as shown).
4. Add them to `app/standards/roles.ts` with `name`, `credentials`, `since` (month and year) and `interests` (their declaration, short). Keep the emails in the Vivatheca mailbox; never commit emails or personal details beyond what they agreed to show.

## Translation sign-off steps

Based on the ISPOR principles of good translation practice (Wild et al. 2005, doi:10.1111/j.1524-4733.2005.04054.x):

1. The current Japanese and Vietnamese text is a forward translation (drafted by AI from the glossary). Treat it as a first draft only.
2. The language lead reviews it against the English, page by page, and fixes it.
3. A second fluent reader checks the disclaimer (`disclaimer.*`) and any safety wording. This can be another clinician or a fluent non-clinician.
4. The language lead records sign-off with `pnpm i18n:status --mark-reviewed --by "Name" --prefix <keys>` or `--page <static page>`.
5. Text changed after sign-off shows as "changed since review" in `docs/translation-status.md` and goes back to the lead.

## Recognition (no money)

Following the National Standards for Volunteer Involvement (Volunteering Australia 2015), recognition is non-financial: credit on `/standards` and the reviewed pages if they agree, and on request a short letter confirming the role, dates and what they reviewed.

## Conflicts of interest

Everyone in these roles follows the funding and conflict-of-interest policy on `/standards#funding`: declare interests, and step aside from any decision where they have one (NHMRC Guidelines for Guidelines; ACNC Governance Standard 5 once Vivatheca Ltd is registered). A section editor who works for, or is paid by, a company whose product is shown or compared in a model does not sign off that model.
