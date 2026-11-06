import { expect, test } from '@playwright/test';

// Ideas borrowed from other services (6 Nov 2026): the "Use this model" panel (public/share-tools.js),
// embeds, the request board, "used it" posts, usage counts, templates and the print tool.
// The shared store (worker/store.ts) has no binding under `vinext start`, so its pages show their fallback.

test('model pages offer a link to the view, a picture, a tour, the credit and an embed', async ({ page }) => {
  await page.goto('/periodontitis/index.html');
  const panel = page.locator('.vt-share');
  await expect(panel.getByRole('heading', { name: 'Use this model' })).toBeVisible({ timeout: 30_000 });
  for (const name of ['Copy link to this view', 'QR code', 'Save picture (PNG)', 'Guided tour', 'Picture steps (no words)', 'Credit and citation', 'Embed on a website']) {
    await expect(panel.getByRole('button', { name })).toBeVisible();
  }
  await panel.getByRole('button', { name: 'Credit and citation' }).click();
  await expect(panel.locator('textarea')).toHaveValue(/CC BY-SA 4\.0.*Not for diagnosis/);
  await panel.getByRole('button', { name: 'Cite: Vancouver' }).click();
  await expect(panel.locator('.vt-credit textarea')).toHaveValue(/^Vivatheca\. .+ \[3D model on the Internet\]\. Version 0\.\d+\. .*Available from: https:\/\/vivatheca\.com\/periodontitis\/$/);
  await panel.getByRole('button', { name: 'RIS (EndNote, Zotero)' }).click();
  await expect(panel.locator('.vt-credit textarea')).toHaveValue(/^TY {2}- DATA[\s\S]*ET {2}- 0\.\d+[\s\S]*ER {2}- $/);
  await panel.getByRole('button', { name: 'Embed on a website' }).click();
  await expect(panel.locator('.vt-embedbox textarea')).toHaveValue(/<iframe src="[^"]*embed=1/);
  await expect(panel.getByRole('link', { name: /3D print/ })).toHaveAttribute('href', '/print?model=periodontitis');
});

test('a shared view link opens the same stage', async ({ page }) => {
  const view = Buffer.from(JSON.stringify({ s: [['data-stage', 'stage-3']], g: [], c: [] })).toString('base64url');
  await page.goto('/periodontitis/index.html?view=' + view);
  await expect(page.locator('[data-stage="stage-3"]')).toHaveAttribute('aria-pressed', 'true', { timeout: 30_000 });
});

test('the guided tour steps through the stages', async ({ page }) => {
  await page.goto('/oroantral/index.html');
  await page.locator('.vt-share').getByRole('button', { name: 'Guided tour' }).click({ timeout: 30_000 });
  const bar = page.locator('.vt-tourbar');
  await expect(bar).toContainText('Step 1 of', { timeout: 20_000 });
  await bar.getByRole('button', { name: 'Next' }).click();
  await expect(bar).toContainText('Step 2 of', { timeout: 20_000 });
  await bar.getByRole('button', { name: 'End tour' }).click();
  await expect(bar).toHaveCount(0);
});

test('embedded view keeps the viewer, disclaimer and credit, and hides the site', async ({ page }) => {
  await page.goto('/periodontitis/index.html?embed=1');
  const bar = page.locator('.vt-embedbar');
  await expect(bar).toContainText('Not yet clinically reviewed', { timeout: 30_000 });
  await expect(bar).toContainText('Not for diagnosis');
  await expect(bar.getByRole('link', { name: 'CC BY-SA 4.0' })).toBeVisible();
  await expect(page.locator('model-viewer')).toBeVisible();
  await expect(page.locator('footer').first()).toBeHidden();
  await expect(page.locator('.vt-share')).toHaveCount(0);
});

test('React model pages get the panel too', async ({ page }) => {
  await page.goto('/models/alveolar-bone-graft');
  await expect(page.locator('.vt-share').getByRole('button', { name: 'Guided tour' })).toBeVisible({ timeout: 30_000 });
});

test('request board, posts and counts pages work without the store', async ({ page }) => {
  await page.goto('/requests');
  await expect(page.getByRole('heading', { name: 'Which model should Vivatheca make next?' })).toBeVisible();
  await expect(page.getByText('Infection at the root tip')).toBeVisible();
  await expect(page.getByText(/not switched on yet/)).toBeVisible();
  await page.goto('/used?model=periodontitis');
  await expect(page.getByRole('heading', { name: 'How people use Vivatheca models' })).toBeVisible();
  await expect(page.getByText(/not switched on yet/)).toBeVisible();
  await page.goto('/impact');
  await expect(page.getByText('Counts are not available yet.')).toBeVisible();
});

test('templates page links to every template file', async ({ page, request }) => {
  await page.goto('/templates');
  const links = page.locator('a[href^="/templates/"][href$=".pptx"]');
  expect(await links.count()).toBeGreaterThanOrEqual(40);
  const res = await request.get((await links.first().getAttribute('href'))!);
  expect(res.status()).toBe(200);
});

test('print page builds a 3MF with a base and label', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/print?model=cracked-tooth');
  await expect(page.locator('.pr-parts input').first()).toBeVisible({ timeout: 60_000 });
  await page.locator('.pr-base').check();
  await page.locator('.pr-label').fill('Crown');
  const download = page.waitForEvent('download', { timeout: 90_000 });
  await page.getByRole('button', { name: 'Download 3MF' }).click();
  expect((await download).suggestedFilename()).toMatch(/^vivatheca-cracked-tooth-.*\.3mf$/);
});
