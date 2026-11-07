---
name: Vivatheca
description: Calm, trustworthy medical education centred on understandable 3D anatomy.
colors:
  consultation-navy: "#00244d"
  deep-theatre-navy: "#001a37"
  teaching-cyan: "#14c9d7"
  action-cyan: "#007f8b"
  teaching-film: "#dff7f9"
  quiet-aqua: "#effcfc"
  affected-coral: "#d55748"
  donor-amber: "#e4aa2b"
  translator-violet: "#a890e8"
  map-land: "#42667e"
  paper: "#f7fafb"
  white: "#ffffff"
  ink: "#06233f"
  muted-ink: "#4d6378"
  fine-rule: "#cfe1e7"
typography:
  display:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "clamp(3.4rem, 6.2vw, 5.6rem)"
    fontWeight: 780
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "clamp(2.35rem, 4.7vw, 4.5rem)"
    fontWeight: 760
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Manrope Variable, Manrope, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  control: "12px"
  surface: "16px"
  status: "999px"
spacing:
  control-gap: "12px"
  content: "24px"
  section: "clamp(5rem, 10vw, 9rem)"
components:
  button-primary:
    backgroundColor: "{colors.consultation-navy}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.consultation-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
    height: "50px"
  model-surface:
    backgroundColor: "{colors.deep-theatre-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.surface}"
---

# Design System: Vivatheca

## Overview

**Creative North Star: "The Consultation Light Table"**

The Vivatheca platform places understandable anatomy in an illuminated, calm working space: deep navy creates the viewing theatre, cyan marks interaction and teaching layers, warm paper carries explanatory content, and coral appears only when affected anatomy or an unresolved status needs attention. The identity feels like a generous clinical conversation, not a hospital portal or a generic charity campaign.

The system is spacious and editorial, with one dominant visual or interactive mechanism per section. Screenshots and renders of Vivatheca's own models provide the visual content; precise React, CSS, Material Symbols and WebGL provide the interface and interaction.

**Key Characteristics:**

- Working 3D anatomy is the focal product surface.
- Large, compact Manrope headings establish clarity without ornamental display type.
- Dark viewing fields alternate with warm-white reading fields.
- Cyan is used decisively for action and guidance, never as a decorative wash.
- Anatomy is shown only from Vivatheca's own models (screenshots or renders), never drawn by an image generator, because generated anatomy cannot be traced to a source.

## Colors

The palette is drawn from the supplied logo and extended with accessible tonal roles for reading, interaction, status and depth.

### Primary

- **Consultation Navy:** The brand anchor for headings, primary actions, footers and the model theatre.
- **Deep Theatre Navy:** The deeper viewing ground behind interactive 3D content.

### Secondary

- **Teaching Cyan:** The supplied logo accent, used for mission bands, active cues and selected guidance.
- **Action Cyan:** A darker cyan reserved for small text and icons where the brighter brand cyan does not meet contrast requirements.

### Tertiary

- **Affected Coral:** Marks affected anatomy, prototype status or high-salience focus. It is never a general decoration.
- **Donor Amber:** Identifies donor roles in maps and collaborator summaries.
- **Translator Violet:** Identifies translator roles in maps and collaborator summaries.

### Neutral

- **Paper:** The default page field.
- **Teaching Film and Quiet Aqua:** Layered educational surfaces and quiet section changes.
- **Map Land:** A muted blue-grey field that keeps geographic context legible without competing with role markers.
- **Ink and Muted Ink:** Primary and secondary reading colours.
- **Fine Rule:** Dividers and structural boundaries.

### Named Rules

**The Affected-Anatomy Rule.** Coral is rare and meaningful; use it for affected anatomy, warnings and unresolved states only.

**The Cyan Contrast Rule.** Bright cyan may carry dark text on broad surfaces; use Action Cyan for small foreground text on pale surfaces.

**The Labelled Map Role Rule.** Map roles never rely on colour alone: creator cyan, donor amber, reviewer coral and translator violet markers carry C, D, R or T and are paired with explicit legend and location labels.

### Light and Dark Mode

The site opens in light mode for every visitor, whatever their system setting. The header's theme toggle switches to dark mode, and the choice is remembered in `localStorage` under `vivatheca-theme`, shared by the app pages and the static `/development/` pages. Dark mode keeps the core palette: Deep Navy (`#001a37`) page fields, Navy (`#00244d`) cards, white headings and bright brand cyan (`#14c9d7`) for accents and primary buttons. Style new components with the theme-aware tokens in `app/globals.css` (`--surface`, `--surface-alt`, `--surface-tint`, `--heading`, `--text-strong`, `--accent`, `--ink`, `--muted`, `--line`) rather than raw navy or white, so they follow the toggle. The toggle label is available in English and Japanese and follows the page's `lang`.

## Typography

**Display Font:** Manrope Variable (with Manrope and sans-serif fallbacks)

**Body Font:** Manrope Variable (with Manrope and sans-serif fallbacks)

**Character:** Manrope gives the Vivatheca platform a plain-spoken, contemporary and highly legible voice. Weight and scale—not font switching—create hierarchy.

### Hierarchy

- **Display** (780, responsive 3.4–5.6rem, 1.06): One normally oriented first-view headline. “Clinical models” is kept together above “made clear.” at wide viewports; its 46rem block exactly matches the hero introduction. Mobile may wrap naturally to avoid overflow.
- **Headline** (760, responsive 2.35–4.5rem, 1.06): Section ideas and major calls to action.
- **Title** (700–760, responsive 1.35–1.8rem): Model tour steps and content-path titles.
- **Body** (400, 1rem, 1.65): Explanations limited to roughly 62–65 characters where possible.
- **Label** (650–800, 0.72–0.92rem): Controls, states and navigation; sentence case only.

### Named Rules

**The Plain-Voice Rule.** Headings state the benefit directly; do not add a kicker, eyebrow or medical-jargon preface above them.

**The Justified-Paragraph Rule (Luke, 2026-11-06).** Every paragraph (`<p>` and long body copy) is justified, never left-aligned, on every page and in English and Japanese. The rule is global: `p` in `app/globals.css` for app pages and in `public/site-header.css`, which every static page loads. English uses `hyphens: auto` so gaps stay small; Japanese (`:lang(ja)`) uses `text-justify: inter-character`. Do not add per-page `text-align: left` on paragraphs, including on phones. Headings, buttons, navigation, labels, table cells, figure captions and deliberately centred callouts keep their own alignment. Since 2026-11-07 the same rule covers list items (`li`), definitions (`dd`) and quotes, so long bullet points and reference lists are justified too; link lists in `<nav>` and picture cards (`li` containing an image or video) stay ragged. Printed web addresses and DOIs carry `class="url"`, which lets them break at any character so they do not leave wide gaps. Line length is one rem width (46rem on app pages, the column width on static pages), not `ch`, so small print ends on the same right edge as the text above it. Running text in prose blocks gets a .75rem gap between paragraphs and lists. On screens 1000 px and wider, a model video sits beside its transcript.

## Layout

Desktop compositions use broad asymmetric splits, with content padded by responsive 5–7vw gutters. Sections alternate spacious editorial reading fields with immersive image or model fields. Repeated content is expressed as ruled lists and columns rather than a grid of floating cards.

At 1100px, the model and image/text pairs stack. At 760px, navigation becomes a labelled menu, content uses a single column, actions become full-width where helpful, and the hero image follows the copy. All controls keep at least a 44px hit area. Section spacing follows the shared responsive section token, while internal grouping uses 12px and 24px rhythms.

### Full-page Reference Export

The maintained landing-page PDF uses the 1190 x 912 desktop viewport and screen media styling, then captures the complete document as one continuous page. Fonts, images and the interactive mandible must finish loading before capture. The export preserves the full visual sequence from navigation through footer without print-media reflow, missing WebGL content, duplicated sections or clipped edges. Regenerate and visually inspect `output/pdf/vivatheca-landing-page-full-view.pdf` after every material landing-page update.

## Elevation & Depth

Depth is ambient and structural. Large focal surfaces use a low-offset, wide-blur navy shadow; ordinary content remains flat and is separated by tonal fields or fine rules. Translucency is used only for the sticky navigation and model status layer where it explains physical layering.

### Shadow Vocabulary

- **Quiet Lift** (`0 8px 24px rgba(0, 36, 77, 0.08)`): Selected segmented controls and light floating elements.
- **Viewing Surface** (`0 28px 72px rgba(0, 26, 55, 0.18)`): The model theatre and decisive editorial imagery.

### Named Rules

**The Flat-Until-Focal Rule.** Use shadows only when an element must sit physically above the reading field; dividers and tonal shifts carry ordinary structure.

## Shapes

Controls use gently curved 12px corners; immersive product surfaces use 16px corners. Pills are limited to compact status labels. The hero image uses one large asymmetric anatomical arc that leads into the page; this silhouette is specific to visual storytelling and must not become a generic container shape.

## Components

### Buttons

- **Shape:** Confident rectangular controls with a 12px radius and 50px standard height.
- **Primary:** Consultation Navy with white text and an optional trailing Material Symbol.
- **Hover / Focus:** Navy deepens on hover; keyboard focus uses a 3px coral outline with a 4px offset.
- **Secondary:** Transparent with a navy border; hover changes the field to Teaching Film.

### Chips

- **Style:** Status-only pill with translucent white over the dark model field.
- **State:** A coral dot plus explicit text communicates prototype status; colour never stands alone.

### Cards / Containers

- **Corner Style:** 16px only for a meaningful bounded experience such as the model theatre.
- **Background:** Use Paper, Teaching Film or the navy model field according to content role.
- **Shadow Strategy:** Reserve Viewing Surface elevation for the main interactive or editorial focal point.
- **Border:** Use Fine Rule for lists and segmentation; do not combine a visible border with a large shadow.

### Navigation

Navigation is centred 1rem Manrope on desktop with five evenly spaced destinations, then collapses behind a labelled 44px control below 1100px. The supplied logo remains intact and uses a tightened viewBox only to remove unused canvas; its path geometry and colours are unchanged.

### Consultation Light Table

The signature model component pairs a deep-navy 3D viewing field with a Teaching Film explanation panel. The supplied GLB loads directly into a poster-free live stage after a text loading state, using a close default orbit that makes the anatomy immediately legible. The explanation panel gives its toggle, step label, title, body and action links a comfortably readable scale rather than treating guidance as secondary metadata. Auto-rotation starts only when motion is allowed, remains immediately interruptible through a labelled pause/resume control, and defaults off when reduced motion is requested. The component also includes visible prototype status, a plain/clinical explanation toggle, guided steps, local favourite state, fullscreen action, download and an AR availability note.

### Impact Map

The impact map is a labelled data visualization on a deep-navy field. A public-domain map (for example Natural Earth) supplies cartographic context beneath independently rendered HTML markers. Creator, donor, reviewer and translator roles use cyan, amber, coral and violet respectively, while letters, legend text and a location list repeat the meaning without colour.

### Origin and Mission Strips

Two independent horizontal strips sit beneath the hero. The upper paper strip left-aligns a 56px-wide complete official flag with 1rem origin copy. The cyan strip beneath uses slightly enlarged mission copy and carries the three access modes. The strips must remain visually separate.

### Research Records

Each peer-reviewed record is a ruled editorial row of citation copy, finding and DOI, with no illustration: a picture beside a citation reads as a figure from that study. The paper link remains the primary verification path.

### Sustainable Printing Commitment

The commitment follows the global access map and uses a two-column editorial layout led by a large sustainability heading and, if an image is used, a real photograph of Vivatheca's own prints. It names retired or failed prints, supports, prime towers, purge material, empty spools and packaging as areas under investigation. An explicit exploratory note prevents the design from implying an established programme or partner.

### Translation Aims

The contribution section includes a full-width ruled roadmap showing all 24 current translation targets alphabetically by English name: Arabic, Bengali, Cantonese Chinese, Dutch, English, Farsi, French, German, Hindi, Italian, Japanese, Javanese, Korean, Mandarin Chinese, Portuguese, Punjabi, Russian, Spanish, Swahili, Tamil, Telugu, Turkish, Urdu and Vietnamese. Each entry centres an accurate vector flag, an English label and its native name; Dutch uses “Nederlands” and the Netherlands flag. Correct `lang`, `dir` and bidirectional isolation preserve pronunciation and right-to-left reading behavior. The compact roadmap uses eight columns on very wide screens, six below 1700px, four below 1200px, three below 760px and two below 360px. Cells retain readable labels and roughly 100–112px content-driven height rather than using oversized fixed rows. Expert review remains required before publication.

The illustrative impacted-molar review record is capped at 1280px and uses a 520–720px fluid desktop frame to keep the model and review summary visually connected without excess blank space. Below 900px, the visual and accessible HTML review data stack vertically. The viewer shows a screenshot of the real impacted-molar model, never generated anatomy.

## Production domain and access boundary

The canonical visual experience is unchanged at `https://vivatheca.com`. Temporary access protection lives before the application at the hosting edge; do not add an in-page password modal, branded splash screen or alternate private-preview layout. Authorized visitors receive the same responsive, accessible platform experience. Unauthenticated visitors receive the hosting provider’s secure authentication challenge before any Vivatheca content or media is delivered.

### Contribution Paths

Five editorial rows present the distinct ways to help: submit a model, donate a printed model, donate filament, printing hardware or related equipment, review clinical accuracy, and translate health content. The resource-donation path is separate from sponsoring a finished print so visitors can understand what kind of contribution is being requested.

### Clinical Review Transparency

The trust section uses a restrained two-column editorial introduction followed by a full-width, realistic impacted-molar review-interface example. A screenshot of the real model viewer anchors the left side while accessible HTML on the right presents an unmistakably illustrative record: the most recent reviewer, approval state, total reviews, approval percentage, negative count and reviewer stack. Its ruled records explain private eligibility verification; limited public attribution to title, initials, occupation and country of practice; and the narrow approve-or-reject assessment of educational fidelity. Supporting condition and procedure content points to appropriately licensed public government health-service information and a route to further information. Prototype governance remains visibly labelled until the workflow is operational and verified.

The featured disciplines are ordered alphabetically: Cardiology, Dentistry, Ear, Nose and Throat Surgery, Ophthalmology, Oral and Maxillofacial Surgery, and Orthopaedics. The ruled list uses three columns on wide screens, two at intermediate widths and one on mobile.

### Social Profile Badges

Instagram and Facebook use recognizable monochrome SVG brand symbols. A badge remains visibly disabled and labelled “Verified profile link pending” until an official Vivatheca URL is supplied; the interface never guesses a social handle.

## Do's and Don'ts

### Do:

- **Do** lead with the working anatomy or the people using it.
- **Do** pair every interactive visual or image with a useful alternative and a text explanation.
- **Do** take anatomy only from Vivatheca's own models. If a non-anatomical AI image is ever used (people, rooms, objects), place the visible “AI-generated illustration.” disclosure immediately below it and record its prompt in `assets/manifest.json`.
- **Do** describe Vivatheca as a platform in user-facing copy.
- **Do** label placeholder clinical, governance and translation content plainly.
- **Do** use the supplied logo colours and the single rounded Material Symbols family consistently.
- **Do** preserve generous reading space and a clear, one-action hierarchy.

### Don't:

- **Don't** fabricate reviewer identities, partner logos, usage statistics, licences, DOIs or medical proof.
- **Don't** use stock medical photography, decorative gradients, glassmorphism, emoji icons or generic SaaS card grids.
- **Don't** use cyan or coral as low-contrast body text.
- **Don't** add visual effects that compete with the 3D model or the model renders.
- **Don't** use an image generator to draw teeth, bone, nerves or any other anatomy.
- **Don't** present the educational model as diagnosis or treatment advice.
