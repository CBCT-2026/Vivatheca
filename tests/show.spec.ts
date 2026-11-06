import { expect, test } from '@playwright/test';

test('a model opens full screen in one tap from the homepage, with the disclaimer on screen', async ({ page }) => {
  await page.goto('/');
  const quick = page.locator('#quick-show');
  await expect(quick.getByRole('heading', { name: 'Show a patient now' })).toBeVisible();
  await quick.getByRole('searchbox').fill('periodontitis');
  await expect(quick.locator('.quick-tile')).toHaveCount(1);
  await quick.locator('.quick-tile-link').first().click();
  await expect(page).toHaveURL(/\/show\?model=periodontitis$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Periodontitis');
  const src = () => page.locator('model-viewer').evaluate((el) => (el as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('/periodontitis/models/healthy.glb');
  await page.getByRole('button', { name: 'Stage III' }).click();
  await expect.poll(src).toContain('/periodontitis/models/stage-3.glb');
  await expect(page).toHaveURL(/view=stage-3/);
  const note = page.locator('.show-disclaimer');
  await expect(note).toContainText('Not yet clinically reviewed.');
  await expect(note).toContainText('Educational model only.');
  await expect(note.getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await expect(page.getByRole('link', { name: 'Full page' })).toHaveAttribute('href', '/periodontitis/');
  await expect(page.locator('header a[href="/"] img[alt="Vivatheca"]')).toHaveCount(1);
});

test('every show-mode model file exists', async ({ request }) => {
  const { showSpecs } = await import('../app/show/models');
  for (const [slug, spec] of Object.entries(showSpecs)) {
    for (const view of spec.views) {
      const res = await request.head(view.glb);
      expect(res.ok(), `${slug} ${view.id}: ${view.glb}`).toBeTruthy();
    }
  }
});

test('starred models appear in My models on the homepage, /models and /show, and stay after reload', async ({ page }) => {
  await page.goto('/models');
  await expect(page.locator('.my-models')).toHaveCount(0);
  const card = page.locator('.library-card', { hasText: 'Cracked mandibular first molar' });
  const star = card.getByRole('button', { name: /Add .* to My models/ });
  await star.click();
  await expect(card.getByRole('button', { name: /Remove .* from My models/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.my-models')).toContainText('Cracked mandibular first molar');
  expect(await page.evaluate(() => localStorage.getItem('vivatheca-favourites'))).toBe('["cracked-tooth"]');

  await page.goto('/');
  const mine = page.locator('.home-my-models .my-models');
  await expect(mine).toContainText('My models');
  await expect(mine.locator('.quick-tile-link')).toHaveAttribute('href', '/show?model=cracked-tooth');

  await page.goto('/show');
  await expect(page.locator('.my-models')).toContainText('Cracked mandibular first molar');

  // The static model page reads and writes the same list.
  await page.goto('/cracked-tooth/index.html');
  const pageStar = page.locator('.vt-fav');
  await expect(pageStar).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.vt-show a')).toHaveAttribute('href', '/show?model=cracked-tooth');
  await pageStar.click();
  expect(await page.evaluate(() => localStorage.getItem('vivatheca-favourites'))).toBe('[]');
  await page.goto('/');
  await expect(page.locator('.home-my-models .my-models')).toHaveCount(0);
});

test('head and neck tiles open the full page viewer', async ({ page }) => {
  await page.goto('/show');
  await expect(page.locator('.quick-tile-link', { hasText: 'Ameloblastoma' })).toHaveAttribute('href', '/head-neck/ameloblastoma/#viewer');
});
