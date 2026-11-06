import { expect, test } from '@playwright/test';
import { chooseLanguage } from './language';

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
    await expect(page.locator('#stage h2')).toHaveText('A lasting, lined tunnel (OAF)');
    await page.getByRole('button', { name: /Fat pad/ }).click();
    await expect.poll(src).toContain('models/bfp.glb');
    await page.getByRole('button', { name: /Palate flap/ }).click();
    await expect.poll(src).toContain('models/palatal.glb');
    await expect(page.locator('#stage h2')).toContainText('palatal rotation flap');
  });

  test('offers 3D print files for the chosen stage, with the disclaimer', async ({ page, request }) => {
    await page.goto('/oroantral/index.html');
    const link = page.locator('#download');
    await expect(link).toHaveAttribute('href', 'downloads/vivatheca-oroantral-normal-1.0x.zip');
    await page.getByRole('button', { name: /3 OAC/ }).click();
    await expect(link).toHaveAttribute('href', 'downloads/vivatheca-oroantral-oac-1.0x.zip');
    await expect(page.locator('#print')).toContainText('Not yet clinically reviewed.');
    await expect(page.locator('#print a[href="/disclaimer"]').first()).toBeVisible();
    const res = await request.get('/oroantral/downloads/vivatheca-oroantral-oac-1.0x.zip');
    expect(res.ok()).toBeTruthy();
  });

  test('switches to Japanese with furigana, shared with the site language cookie', async ({ page }) => {
    await page.goto('/oroantral/index.html');
    await chooseLanguage(page, '日本語');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('h1 ruby').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ダークモード' })).toBeVisible();
    await expect(page.locator('#stage h2 ruby').first()).toBeVisible();
    // Same cookie as the rest of the site, so the choice carries over after a reload.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await page.getByRole('button', { name: 'ふりがな' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-furigana', 'off');
    await chooseLanguage(page, 'English');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
