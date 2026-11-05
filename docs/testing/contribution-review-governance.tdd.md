# Contribution and Review Governance — TDD Evidence

## User journeys

- A prospective contributor can distinguish five paths, including donations of filament, printing hardware and related equipment.
- A translator can review all six current PRD language targets in alphabetical order, with English and native-script names.
- A visitor can understand planned model approval states, ratings, clinician-review recommendations, reviewer privacy, the limited scope of clinician assessment and the provenance of supporting health information.

## RED

Commit `549967f` added the browser guarantees before implementation. The focused desktop run failed because the previous page exposed four contribution paths, did not provide the required ordered language labels and did not include the expanded review-governance copy.

## GREEN

Commit `283225e` implemented the fifth contribution path, the responsive six-language ruled grid and the transparent, privacy-preserving clinical review workflow. The focused desktop Playwright run passed both new journeys.

## Automated coverage

- `homepage presents peer-reviewed evidence and five contribution paths` checks the heading, all five paths and the exact accessible order of the six language targets.
- `trust section explains transparent and privacy-preserving clinical review` checks approval and rating visibility, restricted reviewer attribution, the approve-or-reject educational assessment, and licensed public government health-service sourcing.
- The complete Playwright suite remains the release regression gate on desktop and mobile Chromium.

Final release result: `16 passed` across desktop and mobile Chromium. ESLint completed with no errors after temporary export tooling was removed; the 13 existing `no-img-element` optimisation advisories remain unchanged.

## Visual review

Full-page desktop and mobile captures were inspected after the green implementation. The fifth row, 3×2 desktop language grid, 2×3 mobile language grid, and detailed trust records remain readable without clipping or status-card clutter.

The maintained desktop PDF was regenerated from the validated 1190 × 10971 px browser experience as one 892.5 × 8228.25 pt page. Poppler re-rendering and visual inspection confirmed a continuous page with the interactive model visible and no repeated, clipped or blank sections.
