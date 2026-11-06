import { expect, test } from '@playwright/test';

// Virtual CBCT slice viewer (/learn/slices): NiiVue over volumes voxelised from the site's models.
test('slice viewer loads a virtual scan, switches view and window, and is linked from the hub', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByRole('link', { name: 'Open the slice viewer' })).toHaveAttribute('href', '/learn/slices');
  await page.goto('/learn/slices');
  await expect(page.getByRole('heading', { name: 'Read slices against the model', level: 1 })).toBeVisible();
  await expect(page.getByText('These scans are not of any person.')).toBeVisible();
  await expect(page.locator('.slices-canvas')).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
  await expect(page.locator('.slices-status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sagittal' }).click();
  await expect(page.getByRole('button', { name: 'Sagittal' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Metal' }).click();
  await page.getByRole('combobox', { name: 'Scan' }).selectOption('scc-after');
  await expect(page.locator('.slices-canvas')).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
  await expect(page.locator('.slices-position a')).toHaveAttribute('href', '/head-neck/scc/');
  const cited = await page.locator('main .cite a').evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')))]);
  expect(cited.length).toBe(6);
  for (const href of cited) await expect(page.locator(href!)).toHaveCount(1);
});

test('slice viewer is translated into Japanese', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/learn/slices');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toContainText('見比');
  await expect(page.getByRole('button', { name: '矢状' })).toBeVisible();
});
