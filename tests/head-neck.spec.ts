import { expect, test } from '@playwright/test';
import { chooseLanguage } from './language';

// The four condition pages each follow one published case (tools/head-neck/pages.py builds them).
const pages = [
  { slug: 'scc', h1: 'Mouth cancer in the lower jaw', ref: 'Vergier', ja: 'へんぺい上皮がん' },
  { slug: 'ameloblastoma', h1: 'Ameloblastoma in the lower jaw', ref: 'Sikri', ja: 'エナメル上皮腫' },
  { slug: 'okc', h1: 'Keratocyst in the lower jaw', ref: 'Abdelfadil', ja: '角化のう胞' },
  { slug: 'mec', h1: 'Cancer of a small spit gland', ref: 'Ellam', ja: 'だ液腺のがん' },
];

for (const p of pages) {
  test.describe(`head and neck: ${p.slug} page`, () => {
    test('shows the case, the model viewer, diagrams, disclaimer and sources', async ({ page }) => {
      await page.goto(`/head-neck/${p.slug}/index.html`);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(p.h1);
      await expect(page.locator('#viewer')).toHaveAttribute('data-model', `/head-neck/models/${p.slug}-case.glb`);
      await expect(page.locator('header a[href="/head-neck/"]')).toBeVisible();
      await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
      await expect(page.locator('#ref-1')).toContainText(p.ref);
      const diagrams = page.locator('figure.diagram img');
      expect(await diagrams.count()).toBeGreaterThan(0);
      for (const img of await diagrams.all()) {
        const ok = await img.evaluate(async (el: HTMLImageElement) => {
          el.loading = 'eager';
          if (!el.complete) await new Promise((r) => { el.onload = el.onerror = r; });
          return el.naturalWidth > 0;
        });
        expect(ok).toBe(true);
      }
      const glb = await page.request.get(`/head-neck/models/${p.slug}-case.glb`);
      expect(glb.ok()).toBeTruthy();
    });

    test('stage buttons change the caption', async ({ page }) => {
      await page.goto(`/head-neck/${p.slug}/index.html`);
      await expect(page.locator('#stage [data-for="pre"]')).toBeVisible();
      await page.locator('button[data-stage="recon"]').click();
      await expect(page.locator('#stage [data-for="recon"]')).toBeVisible();
      await expect(page.locator('#stage [data-for="pre"]')).toBeHidden();
      await expect(page.locator('button[data-stage="recon"]')).toHaveAttribute('aria-pressed', 'true');
    });

    test('switches to Japanese with furigana', async ({ page }) => {
      await page.goto(`/head-neck/${p.slug}/index.html`);
      await chooseLanguage(page, '日本語');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
      await expect(page.getByRole('heading', { level: 1 })).toContainText(p.ja.slice(0, 2));
      await expect(page.locator('h1 ruby').first()).toBeVisible();
    });
  });
}

test('the head and neck hub links to all four case pages', async ({ page }) => {
  await page.goto('/head-neck/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Head and neck');
  for (const p of pages) await expect(page.locator(`#cases a[href="/head-neck/${p.slug}/"]`)).toHaveCount(1);
});

test('old hub links to a moved case go to its new page', async ({ page }) => {
  await page.goto('/head-neck/index.html?case=okc');
  await expect(page).toHaveURL(/\/head-neck\/okc\/?$/);
});
