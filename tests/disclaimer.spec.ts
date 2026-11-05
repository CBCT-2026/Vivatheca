import { expect, test } from '@playwright/test';

test('disclaimer page and links are present on every main route', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-legal').getByText(/not medical advice/)).toBeVisible();
  await expect(page.locator('.prototype-note').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');

  await page.goto('/development/index.html');
  await expect(page.locator('.disclaimer').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');

  await page.goto('/disclaimer');
  await expect(page.getByRole('heading', { name: 'Disclaimer', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Not for clinical use' })).toBeVisible();
  await expect(page.getByText(/Australian Consumer Law/)).toBeVisible();
});
