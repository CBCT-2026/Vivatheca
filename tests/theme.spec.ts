import { expect, test } from '@playwright/test';

test.describe('light/dark mode', () => {
  test('starts in light mode even when the system prefers dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Dark mode' })).toBeVisible();
  });

  test('toggle switches to dark, is remembered across pages and can switch back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(0, 26, 55)');

    await page.goto('/create');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.goto('/development/index.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /Light mode/ })).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: 'Light mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  });

  test('shows a Japanese label on Japanese pages', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { document.documentElement.lang = 'ja'; });
    await expect(page.getByRole('button', { name: 'ダークモード' })).toBeVisible();
  });
});
