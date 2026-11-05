import { expect, test } from '@playwright/test';

test.describe('stainless steel crown model page', () => {
  test('switches between the five stages and keeps the disclaimer and sources visible', async ({ page }) => {
    await page.goto('/stainless-steel-crown/index.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Stainless steel crown on a baby molar' })).toBeVisible();

    const viewer = page.locator('#mv');
    await expect(viewer).toHaveAttribute('src', 'models/healthy.glb');
    const stages = page.getByRole('group', { name: 'Choose a stage' }).getByRole('button');
    await expect(stages).toHaveCount(5);

    await page.getByRole('button', { name: /^Crown/ }).click();
    await expect(viewer).toHaveAttribute('src', 'models/crown.glb');
    await expect(page.locator('#stage h2')).toHaveText('Stainless steel crown');
    await expect(page.locator('#legend')).toContainText('Steel crown');

    await page.getByRole('button', { name: /^Filling/ }).click();
    await expect(viewer).toHaveAttribute('src', 'models/filling.glb');
    await expect(page).toHaveURL(/#filling$/);

    // Review status and model disclaimer beside the viewer, with a link to the full disclaimer.
    await expect(page.locator('.model-note')).toContainText('Not yet clinically reviewed.');
    await expect(page.locator('.model-note')).toContainText('Educational model only.');
    await expect(page.locator('.model-note a[href="/disclaimer"]')).toBeVisible();

    // Every cited source is listed.
    await expect(page.locator('.refs li')).toHaveCount(7);
    await page.locator('.cite a').first().click();
    await expect(page.locator('.refs details')).toHaveAttribute('open', '');
  });

  test('serves the models and the print download', async ({ request }) => {
    for (const name of ['healthy', 'decay', 'filling', 'prepared', 'crown']) {
      const res = await request.get(`/stainless-steel-crown/models/${name}.glb`);
      expect(res.status()).toBe(200);
    }
    const zip = await request.get('/stainless-steel-crown/downloads/vivatheca-stainless-steel-crown-2x.zip');
    expect(zip.status()).toBe(200);
  });
});
