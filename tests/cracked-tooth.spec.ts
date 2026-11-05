import { expect, test } from '@playwright/test';

test.describe('cracked tooth models', () => {
  test('switches tooth, bite and cut views, and shows the model disclaimer', async ({ page }) => {
    await page.goto('/cracked-tooth/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cracked tooth');
    await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Full disclaimer' }).first()).toHaveAttribute('href', '/disclaimer');
    const viewer = page.locator('#mv');
    const src = () => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src);
    await expect.poll(src).toContain('models/healthy-whole.glb');
    await expect(page.getByRole('button', { name: 'See-through crown' })).toBeHidden();

    await page.getByRole('button', { name: /^Filling/ }).click();
    await expect.poll(src).toContain('models/composite-whole.glb');
    await page.getByRole('button', { name: 'Bite down' }).click();
    await expect(page.locator('#stage')).toContainText('does not hold the cusps together');
    await page.getByRole('button', { name: 'Cut in half' }).click();
    await expect.poll(src).toContain('models/composite-cut.glb');

    await page.getByRole('button', { name: /^Crown/ }).click();
    await expect.poll(src).toContain('models/crown-cut.glb');
    await expect(page.getByRole('button', { name: 'See-through crown' })).toBeVisible();
    await expect(page.locator('.refs li')).toHaveCount(11);
  });

  test('model and print files are served', async ({ request }) => {
    for (const s of ['healthy', 'cracked', 'composite', 'crown']) {
      for (const v of ['whole', 'cut']) {
        expect((await request.get(`/cracked-tooth/models/${s}-${v}.glb`)).status()).toBe(200);
      }
      expect((await request.get(`/cracked-tooth/downloads/vivatheca-cracked-tooth-${s}-3x.zip`)).status()).toBe(200);
    }
  });
});
