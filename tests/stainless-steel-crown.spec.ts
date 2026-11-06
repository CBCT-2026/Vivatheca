import { expect, test } from '@playwright/test';
import { chooseLanguage, languageButton } from './language';

test.describe('stainless steel crown model page', () => {
  test('switches between the five stages and keeps the disclaimer and sources visible', async ({ page }) => {
    await page.goto('/stainless-steel-crown/index.html');
    await expect(page.getByRole('heading', { level: 1, name: "Steel crown on a child's back tooth" })).toBeVisible();

    const viewer = page.locator('#mv');
    await expect(viewer).toHaveAttribute('src', 'models/healthy.glb');
    const stages = page.getByRole('group', { name: 'Choose a stage' }).getByRole('button');
    await expect(stages).toHaveCount(5);

    await stages.filter({ hasText: /^Crown/ }).click();
    await expect(viewer).toHaveAttribute('src', 'models/crown.glb');
    await expect(page.locator('#stage h2')).toHaveText('Steel crown');
    await expect(page.locator('#legend')).toContainText('Steel crown');

    await stages.filter({ hasText: /^Filling/ }).click();
    await expect(viewer).toHaveAttribute('src', 'models/filling.glb');
    await expect(page).toHaveURL(/#filling$/);

    // Review status and model disclaimer beside the viewer, with a link to the full disclaimer.
    const note = page.locator('#mv + p');
    await expect(note).toContainText('Not yet clinically reviewed.');
    await expect(note).toContainText('Educational model only.');
    await expect(note.locator('a[href="/disclaimer"]').first()).toBeVisible();

    // Every cited source is listed.
    await expect(page.locator('.refs li')).toHaveCount(7);
    await page.locator('.cite a').first().click();
    await expect(page.locator('.refs details')).toHaveAttribute('open', '');
  });

  test('shows the Japanese version with furigana', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: baseURL! }]);
    await page.goto('/stainless-steel-crown/index.html#crown');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('h1')).toContainText('かぶせ');
    await expect(page.locator('#stage h2')).toContainText('かぶせ');
    await expect(page.locator('#stage ruby').first()).toBeVisible();
    await expect(languageButton(page)).toHaveAccessibleName('言語: 日本語');
    await chooseLanguage(page, 'English');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(languageButton(page)).toHaveAccessibleName('Language: English');
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
