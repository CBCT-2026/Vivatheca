import { expect, test } from '@playwright/test';

// Clinical review sign-off (/review): every catalogue model appears in the record, with its version
// and status; the footer and homepage link here instead of opening an email straight away.
test('review page lists every model with its status and how review works', async ({ page, request }) => {
  await page.goto('/review');
  await expect(page.getByRole('heading', { name: 'Clinical review of the models', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What a reviewer checks' })).toBeVisible();
  const rows = page.locator('.review-table tbody tr');
  const api = (await (await request.get('/api/models')).json()) as { models: { slug: string; version: string; review: unknown }[] };
  await expect(rows).toHaveCount(api.models.length);
  for (const m of api.models) {
    const row = page.locator(`#review-${m.slug}`);
    await expect(row.locator('td').first()).toHaveText(m.version);
    if (!m.review) await expect(row).toContainText('Not yet clinically reviewed');
  }
  await expect(page.getByText(/Clinical review checks educational accuracy only/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email to join clinical review' })).toHaveAttribute('href', /^mailto:vivatheca@gmail\.com/);
});

test('footer and homepage link to the review page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/review"]')).toBeVisible();
  await expect(page.locator('#contribute a[href="/review"]')).toHaveCount(1);
});

test('review page works in Japanese', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/review');
  await expect(page.locator('h1')).toContainText('レビュー');
  await expect(page.locator('.review-table tbody tr').first()).toContainText('未');
});
