# Annotated landing refinements — TDD evidence

## Source and journeys

The journeys were derived from the browser annotations supplied on 26 August 2026.

- As a visitor, the opening message should scan as a deliberate two-line headline with a justified introduction and a closer interactive model.
- As a visitor, the origin, mission and navigation bands should remain readable at wide and mobile viewports.
- As a prospective contributor, the four pathways, mature technology-focused collaboration scene and native-script translation aims should be immediately understandable.
- As a sponsor, the map, demonstration records and sustainability commitment should remain transparent, accessible and visually credible.
- As a visitor seeking Vivatheca on social media, recognizable Instagram and Facebook symbols should appear without guessing unverified account URLs.

## Task report

| Stage | Command | Evidence |
|---|---|---|
| RED | `pnpm test:e2e -- --project=desktop-chromium tests/landing.spec.ts` | 5 focused failures and 2 unaffected passes. Failures named the missing two-line title, scaled strips/navigation, generated map and sustainability image, translation aims, disclosures and social badges. |
| GREEN | `pnpm test:e2e -- --project=desktop-chromium tests/landing.spec.ts` | 7 of 7 focused journeys passed after implementation. |
| Review RED | `pnpm test:e2e -- --project=desktop-chromium tests/landing.spec.ts` | 3 focused failures reproduced the language-button availability, reduced-motion feed state and social-profile status findings from the independent finish review. |
| Final GREEN | `pnpm test:e2e` | 14 of 14 journeys passed across desktop and mobile after the review fixes. |
| Build | `pnpm lint` and `pnpm build` | ESLint completed with no errors; Vinext produced a production bundle. Existing `img` optimization and bundle-size notices remain warnings. |

## Test specification

| # | What is guaranteed | Test target | Type | Result |
|---|---|---|---|---|
| 1 | The hero uses two authored lines, a justified introduction, equal text-block widths, enlarged model explanation and a closer default camera orbit. | `tests/landing.spec.ts: visitor can reach and use the featured model explanation` | E2E | PASS |
| 2 | The Australian strip, mission strip and five-item desktop navigation meet the new scale and alignment requirements. | `tests/landing.spec.ts: homepage presents peer-reviewed evidence and four contribution paths` | E2E | PASS |
| 3 | The contributor scene and six native-script translation aims are visible and semantically grouped. | Same homepage test | E2E | PASS |
| 4 | The map uses the new generated base while retaining prototype disclosure, markers, summaries and live-ready controls; sustainability has its own generated image. | `tests/landing.spec.ts: sponsorship map labels demonstration data and exposes live-ready controls` | E2E | PASS |
| 5 | Every generated landing illustration has a visible disclosure and Vivatheca is described as a platform. | `tests/landing.spec.ts: generated landing-page illustrations carry visible disclosure and platform terminology` | E2E | PASS |
| 6 | The page remains usable without horizontal overflow on mobile and with reduced motion. | Mobile and reduced-motion tests | E2E | PASS |
| 7 | Footer social badges use Instagram and Facebook symbols while their unverified profile state remains explicit and non-interactive. | `tests/landing.spec.ts: footer gives visitors clear ways to explore, participate and connect` | E2E | PASS |

## Coverage and known gaps

This repository has no instrumented unit-coverage command; user-visible guarantees are covered through the full Playwright landing suite instead. Exact official Instagram and Facebook URLs remain intentionally absent because public search did not verify a Vivatheca account. The controls can become links once those URLs are supplied.

## Release artifact verification

The updated landing page was captured at the documented 1190 x 912 desktop viewport after fonts and the interactive mandible finished loading. The maintained PDF is one continuous 892.5 x 7788 pt page derived from the complete 1190 x 10384 px screen experience. Poppler re-rendering and visual inspection confirmed that the navigation, model, research records, contribution image, impact map, sustainability content and footer are present without duplicated sections, clipping or a blank WebGL viewer.

## Merge evidence

- RED checkpoint: `157da1c test: define annotated landing refinements`
- GREEN checkpoint: recorded in the implementation commit after the full desktop and mobile suite passes.
