# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js-compatible Vinext with TypeScript and React, packaged for Cloudflare Sites. The project uses pnpm and targets modern browsers.

## Users

Primary users are clinicians and medical educators explaining anatomy, conditions, and procedures during consultations or teaching. Patients, families, and carers revisit shared explanations afterward. Supporting audiences include students, model designers, researchers, clinical reviewers, translators, donors, clinics, printers, and institutional partners.

## Product Purpose

The Vivatheca platform is a non-profit, open-source library of free browser-based 3D medical models. It makes patient-centred visual explanation available without an account, subscription, or dedicated application and supports guided viewing, AR, sharing, downloads, and physical printing.

## Positioning

The Vivatheca platform joins interactive 3D anatomy with plain-language explanation, clinical-governance records, multilingual review, and a pathway from browser viewing to printable or sponsored physical models.

## Operating Context

The product is used in clinical conversations, classrooms, independent patient review, contributor appraisal, translation and review workflows, local 3D printing, and sponsored distribution to resource-poor healthcare organisations.

## Capabilities and Constraints

- The landing experience must lead visitors into the collection and demonstrate an impacted wisdom tooth model using the supplied GLB.
- Core model experiences require keyboard-accessible 3D controls, text alternatives, guided tours, full-screen presentation, QR sharing, AR where compatible, plain-language and clinician-detail views, teach-back prompts, downloads, and known-limitations information.
- Favourites and prototype roadmap votes are stored only on the current device.
- Production submissions need secure storage, moderation, and notification; the prototype must not imply that placeholder workflows are production-ready.
- No patient-identifying information may be collected.
- Medical claims, reviewers, dates, translations, licences, DOIs, and download files remain clearly identified as placeholders until verified.
- The interface must support responsive layouts, right-to-left languages, reduced motion, semantic structure, visible focus, and graceful 3D/AR fallbacks.
- The homepage identifies the platform as founded and operated in Australia with an official, complete Australian National Flag image.
- Peer-reviewed research remains externally cited and independently verifiable; accompanying generated visuals are disclosed as interpretive AI-generated illustrations rather than journal figures.
- Sustainable-printing content may describe investigation into recycling retired or failed prints, supports, prime towers, purge material, empty spools, and packaging, but must remain explicitly exploratory until programmes and partners are verified.
- The global access visualization combines a disclosed generated cartographic base with accessible, independently rendered demonstration markers, legend text, prototype disclosure, location labels, summaries, and feed controls.
- The contribution area distinguishes five paths: model submission, printed-model donation, 3D-printing resource donation, clinical review, and translation. Resource donations may include filament, printing hardware, and related equipment.
- The translation roadmap lists 24 targets alphabetically by English name—Arabic, Bengali, Cantonese Chinese, Dutch, English, Farsi, French, German, Hindi, Italian, Japanese, Javanese, Korean, Mandarin Chinese, Portuguese, Punjabi, Russian, Spanish, Swahili, Tamil, Telugu, Turkish, Urdu and Vietnamese—alongside native names and regional flags. Dutch is presented as “Nederlands” with the Netherlands flag. No translation may be presented as published until expert review is verified.
- The language roadmap uses a compact 8/6/4/3/2-column responsive grid so the full roadmap remains scannable without unnecessary vertical space.
- The compact illustrative impacted-molar review record retains its prototype approval metrics and reviewer attribution. Its generated anatomy removes the tooth directly above the impaction and depicts the left inferior alveolar nerve below the roots and exiting through the left mental foramen; it must not be treated as clinically verified anatomy.
- Model records are designed to disclose clinical approval state, model rating and whether clinician review is recommended. Reviewer eligibility is verified privately; public attribution is limited to title, initials, occupation and country of practice.
- Clinical reviewers approve or reject only whether a model reflects a named condition or procedure well enough for patient education. They are not required to provide medical advice or explanatory condition or procedure content.
- The trust area includes a clearly labelled illustrative impacted-molar review example showing `Dr AB, Oral & Maxillofacial Surgeon, Australia` as the most recent approving reviewer, 23 total reviews, 96% approval and one negative review. The example is prototype data, not a verified endorsement.
- Featured disciplines are Cardiology, Dentistry, Ear, Nose and Throat Surgery, Ophthalmology, Oral and Maxillofacial Surgery, and Orthopaedics, presented alphabetically.
- Associated condition and procedure information must come from appropriately licensed public government health-service advice, with source attribution and directions to further information.
- Instagram and Facebook controls must use recognizable symbols and remain visibly disabled until exact official profile URLs are supplied or independently verified.
- User-facing copy uses “platform” rather than “site” or “service” when describing Vivatheca.
- Every material landing-page release includes an updated, visually verified single-page desktop PDF reference and synchronized `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, PRD, asset provenance, and relevant testing records.
- The canonical production origin is `https://vivatheca.com`; canonical and social metadata must never identify the temporary `chatgpt.site` hostname as the public origin.
- During private preview, access is enforced at the hosting edge with an owner-only or explicit identity allowlist. No reusable password, access token or authorization decision may be embedded in client code or committed to the repository.
- Adding the custom apex domain must not change the platform’s appearance, responsive behavior, 3D interaction, downloads or accessibility. DNS, certificate and authentication checks are release gates before the domain is declared active.

- The `/create` patient information builder helps clinicians draft, check and export leaflets, A4 sheets, consent sections and narration scripts that match a Vivatheca model. Users must accept that AI drafts can be wrong and are not guaranteed before using it; every export says it is an unverified AI-assisted draft until the clinician completes the check list; no patient information is accepted or stored. Without an API key it works in a free copy-prompt mode.

## Brand Commitments

Use the Vivatheca name and supplied logo without redrawing or distorting it. The visual system is anchored in the logo's deep navy `#00244D` and cyan `#14C9D7`, with Manrope as the interface font. The voice is calm, plain, trustworthy, collaborative, and never promotional about unverified clinical claims. The platform is founded and operated in Australia.

## Evidence on Hand

- `Vivatheca PRD.docx` supplied as product source material.
- Primary logo and symbol SVG files supplied by the user.
- `impacted-molar-3D-model.glb` supplied for the impacted wisdom tooth demonstration.
- No verified reviewer identities, clinical review dates, licences, DOIs, translations, testimonials, usage statistics, or partner logos were supplied; these must not be fabricated.

## Product Principles

- Understanding before complexity: make the model and explanation useful within seconds.
- Trust through transparency: show review state, evidence, limitations, and version status plainly.
- Access without barriers: no account wall, mobile-friendly interaction, and graceful alternatives.
- Clinical detail without excluding patients: pair plain language with optional professional depth.
- Open participation with safeguards: welcome contribution while separating prototypes from verified production records.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Provide keyboard access, meaningful alternatives for visual/3D content, 44px minimum touch targets, visible focus, reduced-motion support, readable text, non-colour status cues, and robust right-to-left layout support.
