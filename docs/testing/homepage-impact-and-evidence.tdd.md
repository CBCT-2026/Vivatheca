# Homepage impact and evidence: TDD record

## Behaviour contract

- The hero uses the annotated copy and exposes digital/print access.
- The featured GLB loads without a poster and auto-rotates in the interactive viewer.
- Desktop navigation includes Publications and About.
- The evidence section links three independently verifiable peer-reviewed articles without implying Vivatheca authorship.
- The contribution section exposes four distinct paths.
- The sponsorship experience labels its sample records as illustrative, shows map/stat/role data, and provides pause and next controls for the demonstration feed.

## RED

`pnpm test:e2e --grep "visitor can reach|peer-reviewed evidence|sponsorship map"`

All six desktop/mobile runs failed against the previous homepage because the annotated copy, publications, contribution paths, map, feed and model attributes were not present.

## GREEN

`pnpm test:e2e`

All 12 Playwright runs passed across desktop Chromium and Pixel 7 emulation, including explicit pause/resume and reduced-motion coverage for model rotation. The runner's Windows web-server child required manual teardown after reporting all passes; no test assertion failed.

`pnpm lint` completed with no errors. `pnpm build` completed successfully.
