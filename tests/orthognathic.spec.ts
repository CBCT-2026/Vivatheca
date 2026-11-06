import { expect, test } from '@playwright/test';

test.describe('orthognathic surgery models', () => {
  test('switches bite and before/after, and shows the model disclaimer', async ({ page }) => {
    await page.goto('/orthognathic/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('orthognathic surgery');
    await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Full disclaimer' }).first()).toHaveAttribute('href', '/disclaimer');
    const viewer = page.locator('#mv');
    await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src)).toContain('models/normal.glb');
    await expect(page.getByRole('button', { name: 'After surgery' })).toBeHidden();

    await page.getByRole('button', { name: /Class III/ }).click();
    await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src)).toContain('models/class3-before.glb');
    await page.getByRole('button', { name: 'After surgery' }).click();
    await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src)).toContain('models/class3-after.glb');
    await expect(page.getByRole('button', { name: 'Show jaw before surgery' })).toBeVisible();
    await expect(page.locator('#stage')).toContainText('Le Fort I');

    await page.getByRole('button', { name: 'With chin surgery (genioplasty)' }).click();
    await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src)).toContain('models/class3-after-genio.glb');
    await expect(page.locator('#stage')).toContainText('genioplasty');
    await page.getByRole('button', { name: /Class II/ }).first().click();
    await expect.poll(() => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src)).toContain('models/class2-after-genio.glb');
    await page.getByRole('button', { name: 'Before surgery', exact: true }).click();
    await expect(page.getByRole('button', { name: 'With chin surgery (genioplasty)' })).toBeHidden();
  });

  test('model files are served', async ({ request }) => {
    for (const m of ['normal', 'class2-before', 'class2-after', 'class2-after-genio', 'class3-before', 'class3-after', 'class3-after-genio']) {
      const res = await request.get(`/orthognathic/models/${m}.glb`);
      expect(res.status()).toBe(200);
    }
  });
});
