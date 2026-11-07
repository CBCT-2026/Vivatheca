import { expect, test } from '@playwright/test';
import { chooseLanguage, languageButton } from './language';

test.describe('stainless steel crown model page', () => {
  test('switches between the five stages and keeps the disclaimer and sources visible', async ({ page }) => {
    await page.goto('/stainless-steel-crown/index.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Preformed metal (stainless steel) crown on a mandibular second primary molar' })).toBeVisible();

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
    await expect(page.locator('h1')).toContainText('ステンレススチールクラウン');
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

  test('kids view: friendly 4-step story linked both ways, blue baby tooth models, disclaimer and sources', async ({ page }) => {
    await page.goto('/stainless-steel-crown/index.html');
    // The local server needs index.html spelled out; production serves /stainless-steel-crown/kids/.
    await expect(page.getByRole('link', { name: 'For kids: a simple, friendly page' })).toHaveAttribute('href', '/stainless-steel-crown/kids/');
    await page.goto('/stainless-steel-crown/kids/index.html');
    await expect(page.getByRole('heading', { level: 1, name: 'A shiny crown for a baby tooth' })).toBeVisible();

    const viewer = page.locator('#mv');
    await expect(viewer).toHaveAttribute('src', '/stainless-steel-crown/kids/models/healthy.glb');
    const steps = page.getByRole('group', { name: 'Choose a step' }).getByRole('button');
    await expect(steps).toHaveCount(4);
    await expect(page.locator('#stage .count')).toHaveText('Step 1 of 4');
    await expect(page.locator('#prev')).toBeDisabled();
    await page.locator('#next').click();
    await expect(viewer).toHaveAttribute('src', '/stainless-steel-crown/kids/models/decay.glb');
    await expect(page.locator('#stage h2')).toHaveText('A tooth with holes');
    await steps.filter({ hasText: 'Crown on' }).click();
    await expect(page.locator('#stage .count')).toHaveText('Step 4 of 4');
    await expect(page.locator('#next')).toBeDisabled();
    await expect(page).toHaveURL(/#crown$/);

    const note = page.locator('#mv + p');
    await expect(note).toContainText('Not yet clinically reviewed.');
    await expect(note).toContainText('Educational model only.');
    await expect(note.locator('a[href="/disclaimer"]').first()).toBeVisible();
    await expect(page.locator('.refs li')).toHaveCount(7);
    await expect(page.locator('main a[href="/stainless-steel-crown/"]').first()).toBeVisible();
  });

  test('kids view in Japanese and Vietnamese', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: baseURL! }]);
    await page.goto('/stainless-steel-crown/kids/index.html#prepared');
    await expect(page.locator('h1')).toContainText('ぴかぴか');
    await expect(page.locator('#stage .count')).toHaveText('4つのうち3つめ');
    await expect(page.locator('#stage ruby').first()).toBeVisible();
    await expect(page.getByText('For kids and their grown-ups')).toBeHidden();
    await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: baseURL! }]);
    await page.goto('/stainless-steel-crown/kids/index.html');
    await expect(page.locator('h1 [lang="vi"]')).toHaveText('Mão răng sáng bóng cho răng sữa');
    await expect(page.locator('h1 [lang="vi"]')).toBeVisible();
    await expect(page.locator('h1 [lang="en"]')).toBeHidden();
    await expect(page.locator('#stage .count')).toHaveText('Bước 1 / 4');
  });

  test('serves the kids models (blue baby tooth, yellow adult tooth)', async ({ request }) => {
    for (const name of ['healthy', 'decay', 'prepared', 'crown']) {
      const res = await request.get(`/stainless-steel-crown/kids/models/${name}.glb`);
      expect(res.status()).toBe(200);
      const buf = Buffer.from(await res.body());
      const json = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString());
      const colour = (n: string) => json.materials.find((m: { name: string }) => m.name === n).pbrMetallicRoughness.baseColorFactor;
      expect(colour('teeth')).toEqual([0.1, 0.22, 0.62, 1]);
      expect(colour('premolar')).toEqual([0.768, 0.624, 0.102, 1]);
    }
  });
});
