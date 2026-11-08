import { expect, test } from '@playwright/test';

test('model library lists each model with its pairing and review status', async ({ page }) => {
  await page.goto('/models');
  await expect(page.getByRole('heading', { name: 'Models with a normal to compare', level: 1 })).toBeVisible();
  const cards = page.getByRole('list', { name: 'Models' }).getByRole('listitem').filter({ has: page.getByRole('heading', { level: 2 }) });
  await expect(cards).toHaveCount(21);
  await expect(page.locator('.library-grid .library-card-link', { hasText: 'Mesioangular impacted mandibular third molar' })).toHaveAttribute('href', '/models/impacted-wisdom-tooth');
  await expect(page.locator('.library-grid .library-card-link', { hasText: 'Mixed dentition: development and eruption of the permanent teeth, 6.5 to 12.5 years' })).toHaveAttribute('href', '/development/');
  await expect(page.getByText('Not yet clinically reviewed', { exact: true })).toHaveCount(21);
  // BodyParts3D-based models carry their own licence (CC BY 4.0); the rest show the site licence.
  await expect(cards.filter({ hasText: 'Pulp necrosis with chronic apical abscess' }).getByText('CC BY 4.0', { exact: true })).toBeVisible();
  await expect(cards.filter({ hasText: 'Cracked mandibular first molar' }).getByText('CC BY-SA 4.0', { exact: true })).toBeVisible();
  await expect(page.locator('.info-intro .prototype-note').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
});

test('wisdom tooth page compares impacted and normal models with downloads and details', async ({ page }) => {
  await page.goto('/models/impacted-wisdom-tooth');
  await expect(page.getByRole('heading', { name: 'Mesioangular impacted mandibular third molar', level: 1 })).toBeVisible();
  const viewers = page.locator('model-viewer');
  await expect(viewers).toHaveCount(2);
  await expect.poll(() => viewers.nth(1).evaluate((element) => (element as HTMLElement & { src: string }).src), { timeout: 20_000 }).toContain('/models/wisdom-tooth-normal.glb');

  await page.getByRole('button', { name: 'Normal', exact: true }).click();
  await expect(page.locator('.compare').getByText('Impacted (mesioangular)', { exact: true })).toBeHidden();
  await expect(page.locator('.compare').getByText('Matched normal (erupted)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Side by side' }).click();
  await expect(page.getByRole('checkbox', { name: 'Turn both together' })).toBeChecked();

  for (const href of ['/models/impacted-molar.glb', '/models/vivatheca-wisdom-tooth-impacted-stl.zip', '/models/wisdom-tooth-normal.glb', '/models/vivatheca-wisdom-tooth-normal-stl.zip']) {
    await expect(page.locator(`a[href="${href}"][download]`)).toHaveCount(1);
    const response = await page.request.get(href);
    expect(response.status()).toBe(200);
  }
  await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
  for (const heading of ['What it shows', 'How the normal was made', 'What is simplified', 'Published sources', 'Change log', 'How to credit']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await expect(page.locator('.source-list li')).toHaveCount(10);
  await expect(page.locator('a[href="#src-6"]').first()).toBeVisible();
  await expect(page.locator('.model-disclaimer')).toContainText('Not yet clinically reviewed.');
  await expect(page.locator('.model-disclaimer').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await expect(page.locator('.report-band a')).toHaveAttribute('href', '/report?model=impacted-wisdom-tooth');
});

test('report form builds an email with the chosen model and requires a description', async ({ page }) => {
  await page.goto('/report?model=dental-development');
  await expect(page.getByLabel('Model')).toHaveValue('dental-development');
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toContainText('Please describe what is wrong');
});

test('about and privacy pages explain who runs Vivatheca and what is collected', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Who runs it' })).toBeVisible();
  await expect(page.getByText(/Founder & Director/)).toBeVisible();
  await expect(page.getByText(/Neither step is complete yet/)).toBeVisible();
  await expect(page.locator('.prototype-note').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'No accounts, no tracking cookies' })).toBeVisible();
});

test('new pages have no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ['/models', '/models/impacted-wisdom-tooth', '/about', '/privacy', '/report']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), route).toBe(false);
  }
});

test('/collection opens the model library', async ({ page }) => {
  await page.goto('/collection');
  await expect(page).toHaveURL(/\/models$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('every static model page links home and back to the library', async ({ page }) => {
  for (const route of ['/development/', '/periodontitis/', '/oroantral/', '/orthognathic/', '/head-neck/', '/head-neck/scc/', '/head-neck/ameloblastoma/', '/head-neck/okc/', '/head-neck/mec/', '/cracked-tooth/', '/stainless-steel-crown/', '/endodontic/', '/tmd/', '/prosthodontic/', '/vpi/', '/fixation/', '/dentigerous-cyst/', '/ectopic-canine/']) {
    // vinext start does not serve a folder's index.html by its trailing-slash URL; Cloudflare does.
    await page.goto(`${route}index.html`);
    await expect(page.locator('header a[href="/"]').first(), route).toBeVisible();
    await expect(page.locator('header a[href="/models"]:visible').first(), route).toBeVisible();
    await page.goto('/models');
    await expect(page.locator(`.library-card a[href="${route}"]`), route).toHaveCount(1);
  }
});

test('bone graft page is in the collection and shows the staged model with its disclaimer', async ({ page }) => {
  await page.goto('/models');
  await expect(page.locator('.library-grid .library-card-link', { hasText: 'Secondary alveolar bone grafting of a unilateral alveolar cleft' })).toHaveAttribute('href', '/models/alveolar-bone-graft');
  await page.goto('/models/alveolar-bone-graft');
  await expect(page.getByRole('heading', { name: 'Secondary alveolar bone grafting of a unilateral alveolar cleft', level: 1 })).toBeVisible();
  await expect(page.locator('header a[href="/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/models"]:visible').first()).toBeVisible();
  await expect.poll(() => page.locator('model-viewer').evaluate((element) => (element as HTMLElement & { src: string }).src)).toContain('/models/abg/abg-1-pre-op.glb');
  await expect(page.getByText('Not yet clinically reviewed.', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.prototype-note').getByRole('link', { name: 'Full disclaimer' }).first()).toHaveAttribute('href', '/disclaimer');
});

test('bone graft page offers CC BY-SA downloads with the review status and credit', async ({ page, request }) => {
  await page.goto('/models/alveolar-bone-graft');
  const downloads = page.getByRole('region', { name: 'Download' });
  await expect(downloads.locator('a[download]')).toHaveCount(8);
  await expect(downloads.getByRole('link', { name: /Stage 1 · Before the graft · STL/ })).toHaveAttribute('href', '/models/abg/vivatheca-abg-1-pre-op-stl.zip');
  await expect(downloads.getByText('Not yet clinically reviewed.', { exact: true })).toBeVisible();
  await expect(downloads.getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await expect(downloads.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
  await expect(downloads).toContainText('Modelled by CBCT-2026 (Founder & Director), Vivatheca.');
  for (const href of await downloads.locator('a[download]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) {
    expect((await request.head(href)).status(), href).toBe(200);
  }
  await page.goto('/');
  await expect(page.locator('.licence-note').getByRole('link', { name: 'Downloads and licence' })).toHaveAttribute('href', '/models/alveolar-bone-graft#downloads');
});

test('collection and homepage showcase are sorted by specialty, then title', async ({ page }) => {
  const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true, ignorePunctuation: true });
  for (const [route, grid, heading] of [['/models', '.library-grid:not(.showcase-grid)', 'h2'], ['/', '.showcase-grid', 'h3']] as const) {
    await page.goto(route);
    const rows = await page.locator(`${grid} > .library-card`).evaluateAll((cards, h) => cards.map((card) => [card.querySelector('.library-meta')?.textContent?.trim() ?? '', card.querySelector(h)?.textContent?.trim() ?? '']), heading);
    expect(rows.length, route).toBeGreaterThan(1);
    const sorted = [...rows].sort((a, b) => collator.compare(a[0], b[0]) || collator.compare(a[1], b[1]));
    expect(rows, route).toEqual(sorted);
  }
});
