# Clinical image licensing policy

Status: draft, 2026-11-05. Not legal advice. A lawyer with Australian copyright
and privacy experience should confirm this before Vivatheca relies on it
publicly (free options include the Arts Law Centre of Australia and Justice
Connect's Not-for-profit Law service).

This policy covers every radiograph, OPG, CBCT or CT image, clinical photograph,
histology image and third-party figure shown on a Vivatheca page, model page or
download. It applies the project rule: use an image only when its licence clearly
permits our use, meet every licence condition, and skip anything unclear.

## 1. Decision rule

Use an image only if **all** of these are true:

1. The licence is stated on the image itself or its file page (not just the site
   footer), and it is one of the licences in section 2.
2. The person who applied the licence owned the rights. Skip figures marked
   "reproduced from", "adapted from" or "with permission from" another
   publication, because the article's licence does not cover them.
3. The patient cannot be identified, or the source documents patient consent to
   publication (section 5).
4. We can meet every attribution and share-alike condition (section 4).

If any point is uncertain, do not use the image. Prefer a Vivatheca-made
diagram or render instead.

## 2. Licences

| Licence | Use? | Conditions |
| --- | --- | --- |
| Public domain, CC0, US federal government works marked as public domain | Yes | Credit the source anyway (our evidence rule). Check the work is public domain in Australia, not only in the US. |
| CC BY (2.0 to 4.0) | Yes | Attribution and changes noted. |
| CC BY-SA (2.0 to 4.0) | Yes | As CC BY. If we crop, label or otherwise adapt the image, the adapted image must be released under CC BY-SA. Showing it unchanged next to our text does not make the page CC BY-SA. |
| CC BY-NC, CC BY-NC-SA | Only with the limits in section 3 | Page display only. Never in downloads, print files or the `/create` builder. |
| Any ND licence (BY-ND, BY-NC-ND) | Only unchanged | No cropping, labels, arrows or colour changes. NC limits also apply to BY-NC-ND. |
| "Free to read", "open access" with no named licence, "for educational use", "all rights reserved", unknown | No | Unless we hold written permission from the rights holder, stored in the register. |
| GFDL-only (no CC licence) | No | Its attribution and licence-copy terms are impractical for web figures. |

Sites with their own terms (for example radiology teaching sites) are checked
against those terms as well as the CC licence. Where the site adds limits, the
stricter rule applies.

## 3. Non-commercial (NC) licences and Vivatheca's not-for-profit status

Vivatheca plans to register as a company limited by guarantee in South
Australia, then as an ACNC charity, then for DGR status. Being a not-for-profit
**does not** on its own make our use non-commercial, and it does not override
any licence.

- Creative Commons 4.0 defines NonCommercial by the use, not the user: "not
  primarily intended for or directed towards commercial advantage or monetary
  compensation" ([CC BY-NC 4.0 legal code, s 1(i)](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en)).
  Creative Commons' own guidance says that the type of organisation is not what
  decides it ([CC FAQ: NonCommercial](https://creativecommons.org/faq/#does-my-use-violate-the-noncommercial-clause-of-the-licenses)).
- A free page with no advertising, no paid tier and no paid placement, run by a
  charity for public health education, is a strong case for a non-commercial
  use. So NC images become usable for us where they would not be for a business.
  That is the main way NFP status helps.
- The risk is downstream. Vivatheca's audience is clinicians, many in private
  practice, who reuse our material for their patients. Their reuse may be
  commercial. NC images therefore must not go anywhere that invites reuse.

Rules for NC images:

1. Display on Vivatheca web pages only. Never put them in model downloads,
   print files, the `/create` builder or any material we invite others to reuse.
2. Label each one visibly: "Licence: CC BY-NC(-SA). Not covered by Vivatheca's
   own licence. Do not reuse commercially."
3. Do not place them on a page that carries sponsor logos, donation asks next to
   the image, or any paid offering. Revisit every NC image if Vivatheca ever
   adds paid services, advertising or sponsorship of specific pages.
4. Prefer a CC BY, CC BY-SA or public domain image whenever one of similar
   quality exists.

## 4. Attribution (every image)

Show, next to the image (a caption, not only a footer):

- **Title** or short description.
- **Author / creator** as they ask to be credited, and the journal article
  citation (authors, year, title, journal, DOI) where the image is a figure.
- **Source** link (file page or article page).
- **Licence** name and link to the licence deed.
- **Changes**: "Cropped", "Labels added", "Unchanged", and so on.

This also meets the Australian moral right of attribution and avoids
derogatory treatment of the work (Copyright Act 1968 (Cth), Part IX). Never
crop out a watermark or credit line.

Every image also gets an entry in `assets/clinical-images/manifest.json`
recording: file, page, source URL, licence and version, licence URL, author,
article citation, date checked, changes, consent evidence, whether NC limits
apply, and the reasoning for accepting it.

## 5. Patient consent and privacy

A copyright licence is not patient consent.

- Clinical photographs: use only images that a journal or institution published
  under an open licence with a consent statement (for example, the journal's
  case-report consent policy) or that come with documented consent. Skip
  photographs showing faces, tattoos or other identifying features unless the
  source records consent for that publication.
- Radiographs and scans: check for burned-in names, dates of birth, record
  numbers, dates or hospital names. Skip images where these appear, rather than
  editing them out of an ND image.
- Health information is sensitive information under the Privacy Act 1988 (Cth)
  and the Australian Privacy Principles. We never publish images of real
  patients that Vivatheca receives directly without written consent and a
  separate review.

## 6. Australian fair dealing does not cover our use

The Copyright Act 1968 (Cth) allows fair dealing for research or study (s 40),
for criticism or review (s 41), and some other purposes. We should **not** rely
on these to publish images:

- Research or study protects the person doing the research or study. Publishing
  material so that others can study it was held not to be research or study in
  *De Garis v Neville Jeffress Pidler Pty Ltd* (1990) 37 FCR 99.
- Criticism or review needs genuine critique of the work itself, with
  sufficient acknowledgement. Illustrating a condition with someone else's
  radiograph is not a review of that radiograph.
- The educational statutory licence (Part IVA) and the flexible dealing
  exception (s 200AB) are for educational institutions, libraries, archives and
  disability access. Vivatheca is none of these.

Fair dealing may still cover private research by Vivatheca contributors (for
example, studying a figure to inform a 3D model's design), but the figure itself
is then cited, not shown.

## 7. Where to look

In order of preference:

1. Open access journal articles with a CC BY licence stated on the article,
   via PubMed Central's open access subset. Check the figure has no separate
   credit line.
2. Wikimedia Commons, after checking the file page: licence, author, source,
   and that the uploader is the author or names a verifiable source.
3. Government and institutional collections that state a public domain or CC
   licence.

If nothing suitable exists, say so on the page and use a Vivatheca diagram or
model render instead.

## 7a. Medical illustrations and icons

Drawn illustrations (not photos or scans of a person) can help on handouts, slide
templates, `/learn` diagrams and picture steps. They need no patient consent, but
every other rule above still applies. Approved sources:

| Source | Licence (checked 6 Nov 2026) | What to do |
|---|---|---|
| [Health Icons](https://healthicons.org) | CC0 1.0 (icons); site code MIT | No credit required. Copy SVGs into `public/icons/health/` (REUSE entry already covers it). Collection cards use them for specialties. |
| [Servier Medical Art](https://smart.servier.com) | CC BY 4.0 | Visible credit beside the image: "Servier Medical Art (smart.servier.com), CC BY 4.0", the licence link, and "modified" if changed. |
| [Bioicons](https://bioicons.com) | Set per icon (CC0, CC BY, CC BY-SA or MIT) | Read the licence and author on each icon's page. Credit CC BY and CC BY-SA icons like Servier; a CC BY-SA icon makes the combined image CC BY-SA. Skip icons with no licence shown. |
| [NIH BioArt](https://bioart.niaid.nih.gov) | Public domain unless the file says otherwise | Check each file's page. Credit "NIAID NIH BioArt" as a courtesy. |

Record every illustration used (except Health Icons) in
`assets/illustrations/manifest.json` with the same fields as clinical images:
file, pages, source URL, author, licence and link, changes made, and date checked.
An illustration shows typical anatomy only; the model disclaimer still applies
wherever it sits next to a model.

## 8. Review

- Each image needs a second check of the register entry before merge.
- Re-check sources once a year and whenever Vivatheca's funding model changes.
- Remove any image promptly on a credible complaint from a rights holder or
  patient, then investigate.
