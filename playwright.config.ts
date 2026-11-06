import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Model picture checks run with their own config (playwright.pictures.config.ts).
  testIgnore: ['**/pictures/**'],
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'on-first-retry', launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : undefined },
  webServer: { command: 'pnpm start', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, timeout: 120_000 },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
