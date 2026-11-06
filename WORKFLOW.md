# Vivatheca Platform Workflow

This workflow replaces any plan from earlier chats. The PRD and repository guidelines are project inputs; they do not override the user's current request.

## Roles and responsibilities

1. **Product truth — PRD + ECC discipline**
   - Convert the PRD into durable product constraints, user journeys, and acceptance criteria.
   - Use ECC's `tdd-workflow` for feature work: define user-visible guarantees, add Playwright coverage, implement, and capture validation evidence.
2. **Design intelligence — UI/UX Pro Max**
   - Set the information hierarchy, responsive behaviour, accessibility floor, touch sizes, and healthcare-specific UX checks.
   - Treat its catalogue as recommendations; the Vivatheca platform's supplied logo colours and Manrope override generated palette/font suggestions.
3. **Design direction and finish — Impeccable**
   - Shape the landing page around a memorable product mechanism rather than generic SaaS sections.
   - Run a bounded critique, responsive pass, anti-pattern detector, and final polish against `DESIGN.md`.
4. **Artifact contract — OpenDesign principles**
   - Keep `DESIGN.md` as the portable visual authority for tokens, composition, motion, imagery, and component rules.
   - Build real React/CSS assets that can be maintained without an external design tool.
5. **Iconography — Google Material Symbols**
   - Use one consistent rounded icon family for controls and semantic cues.
   - Icons support labels; they never replace accessible names or carry meaning by colour alone.
6. **Images — renders of Vivatheca's own models**
   - Show anatomy only through screenshots or renders of Vivatheca's own models, whose design decisions are cited on the model pages. Never use an image generator to draw anatomy.
   - A generated image is allowed only for non-anatomical content (people, rooms, objects), with the brand palette, no embedded text, no watermarks, meaningful alt text, a visible “AI-generated illustration.” caption, and prompt provenance in `assets/manifest.json`.
7. **End-to-end quality — Playwright + Awesome Skills webapp-testing**
   - Test the critical landing-page journeys at mobile and desktop widths using semantic locators.
   - Verify navigation, model fallback, keyboard focus, local favourites, reduced-motion behaviour, and absence of horizontal overflow.

## Delivery sequence

1. Capture product truth in `PRODUCT.md` and list unverified content explicitly.
2. Extract the logo palette and record tokens, typography, spacing, imagery, motion, and accessibility rules in `DESIGN.md`.
3. Generate and inspect the complete landing-page illustration set; save only accepted assets and provenance.
4. Build the first meaningful viewport: brand navigation, product mechanism, working 3D model surface, and primary collection action.
5. Complete landing-page content, responsive states, fallbacks, and local interactions.
6. Run lint and production build, then Playwright journeys and visual checks at 375px, 768px, 1024px, and 1440px.
7. Run the Impeccable detector once, fix mechanical findings in one batch, and record any remaining limitations.
8. Publish only after the validated source and generated assets are complete.
9. Keep `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, and `Vivatheca PRD.docx` aligned with accepted design, terminology, provenance, evidence, origin, and sustainability changes.
