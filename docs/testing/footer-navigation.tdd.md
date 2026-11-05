# Footer navigation TDD evidence

## Source

No implementation plan was supplied. The journey and acceptance criteria were derived from the user's request and footer reference image.

## User journey

As a Vivatheca visitor, I want clear ways to explore the collection, participate in the project, connect with the organisation, and inspect the featured clinical disciplines so that I can continue from the end of the landing page without guessing where to go.

## Task report

The footer was expanded with a brand and mission block, three semantic navigation groups, honest in-page and email destinations, a native disciplines disclosure, and a compact educational/legal row. The finish review then raised the footer's link targets to 44px and renamed the partial taxonomy to “Featured clinical disciplines.”

- **RED command:** `pnpm test:e2e -- --project=desktop-chromium --grep "footer gives visitors"`
- **RED evidence:** the new footer journey executed and failed because the `Explore`, `Participate`, and `Connect` navigation regions did not exist.
- **RED checkpoint:** `3920ea8 test: add footer navigation journey`
- **GREEN command:** `pnpm test:e2e -- --project=desktop-chromium --grep "footer gives visitors"`
- **GREEN evidence:** `1 passed` after the footer implementation.
- **GREEN checkpoint:** `64b4390 feat: add expanded Vivatheca footer`
- **Regression command:** `pnpm test:e2e`
- **Regression evidence:** `6 passed` across desktop and mobile Chromium after the review fixes.
- **Build command:** `pnpm build`
- **Build evidence:** production bundle completed successfully.
- **Lint command:** `pnpm lint`
- **Lint evidence:** zero errors; seven existing advisory notices for deliberate pre-optimised image elements.

## Test specification

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | The footer exposes labelled Explore, Participate, and Connect navigation regions. | `tests/landing.spec.ts: footer gives visitors clear ways to explore, participate and connect` | E2E | PASS |
| 2 | The featured-model and contact destinations use real section and email links. | Same test | E2E | PASS |
| 3 | The featured disciplines disclosure opens and contains Dentistry. | Same test | E2E | PASS |
| 4 | The educational disclaimer remains visible in the footer. | Same test | E2E | PASS |
| 5 | The landing page still has no horizontal overflow at 412px. | `tests/landing.spec.ts: landing page remains usable on mobile` | E2E | PASS |
| 6 | The existing featured-model journey remains operational. | `tests/landing.spec.ts: visitor can reach and use the featured model explanation` | E2E | PASS |

## Coverage and known gaps

The project currently has no instrumented JavaScript line-coverage command, so an 80% numerical coverage claim cannot be made. The changed user-visible behavior is exercised in both configured browser projects, including the footer disclosure, destinations, mobile layout, and existing critical model journey. No tests are skipped or disabled.

## Merge evidence

RED and GREEN are preserved as separate, reachable commits on the active branch. The final review fixes and regression evidence are recorded in the follow-up task commit.
