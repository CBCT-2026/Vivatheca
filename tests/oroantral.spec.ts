import { expect, test } from '@playwright/test';

test.describe('oroantral communication model page', () => {
  test('shows the model, review status, disclaimer and sources', async ({ page }) => {
    await page.goto('/oroantral/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OAC and OAF');
    await expect(page.locator('model-viewer')).toHaveAttribute('src', 'models/normal.glb');
    await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Full disclaimer' }).first()).toHaveAttribute('href', '/disclaimer');
    await expect(page.locator('#ref-1')).toContainText('Parvini');
  });

  test('stage buttons swap the model and the caption', async ({ page }) => {
    await page.goto('/oroantral/index.html');
    const src = () => page.locator('model-viewer').evaluate((el) => (el as HTMLElement & { src: string }).src);
    await page.getByRole('button', { name: /4 OAF/ }).click();
    await expect.poll(src).toContain('models/oaf.glb');
    await expect(page.locator('#stage h2')).toHaveText('Oroantral fistula (OAF)');
    await page.getByRole('button', { name: /Fat pad/ }).click();
    await expect.poll(src).toContain('models/bfp.glb');
  });

  test('switches to Japanese with furigana, shared with the site language cookie', async ({ page }) => {
    await page.goto('/oroantral/index.html');
    await page.getByRole('button', { name: '日本語' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('h1 ruby').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ダークモード' })).toBeVisible();
    await expect(page.locator('#stage h2 ruby').first()).toBeVisible();
    // Same cookie as the rest of the site, so the choice carries over after a reload.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await page.getByRole('button', { name: 'ふりがな' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-furigana', 'off');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
