import { defineConfig, devices } from '@playwright/test';

// Model picture checks (tests/pictures). Pictures are kept outside git in .model-pictures/ because
// WebGL output depends on the machine: CI takes the "before" pictures on the base branch and the
// "after" pictures on the PR in one job (.github/workflows/model-pictures.yml).
// Locally: on main run `pnpm test:pictures --update-snapshots=all`, switch to your branch, rebuild,
// then run `pnpm test:pictures`.
export default defineConfig({
  testDir: './tests/pictures',
  snapshotPathTemplate: '.model-pictures/{arg}{ext}',
  fullyParallel: false,
  workers: 2,
  retries: 0,
  timeout: 120_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'model-pictures-report' }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.003, threshold: 0.2, animations: 'disabled' } },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : undefined,
  },
  webServer: { command: 'pnpm start', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, timeout: 120_000 },
  projects: [{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } }],
});
