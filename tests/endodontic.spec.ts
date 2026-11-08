import { expect, test } from '@playwright/test';

// Endodontic pair (/endodontic/): sound tooth vs pulp necrosis with chronic apical abscess, the first
// CC BY 4.0 model (built from BodyParts3D). vinext start serves the static page at /endodontic/index.html.
test('endodontic page switches between the sound tooth and the abscess and cuts them open', async ({ page }) => {
  await page.goto('/endodontic/index.html');
  const src = () => page.locator('#mv').evaluate((el) => (el as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('models/sound-whole.glb');
  await page.getByRole('button', { name: /Abscess/ }).click();
  await expect.poll(src).toContain('models/abscess-whole.glb');
  await expect(page.locator('.legend li', { hasText: 'Drainage channel' })).toBeVisible();
  await page.getByRole('button', { name: 'Cut open' }).click();
  await expect.poll(src).toContain('models/abscess-cut.glb');
  await expect(page.locator('#stage')).toContainText('infection around both root tips');
});

test('endodontic page states its CC BY licence, the BodyParts3D credit and the model disclaimer', async ({ page }) => {
  await page.goto('/endodontic/index.html');
  const credit = page.locator('p.credit'); // the clinical image caption also has a .credit span
  await expect(credit).toContainText('BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International');
  await expect(credit.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '{}');
  expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/');
});

test('endodontic page shows Vietnamese from vi.js', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/endodontic/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hoại tử tủy');
  await expect(page.getByRole('button', { name: 'Cắt mở' })).toBeVisible();
  // every English block on the page has a Vietnamese twin (the video is English-only, and says so)
  expect(await page.locator('main [lang="en"]:not(#video):visible').count()).toBe(0);
});

test('endodontic models have a removable gum layer with the gum boil on the abscess', async ({ page }) => {
  await page.goto('/endodontic/index.html');
  await expect(page.locator('.legend li', { hasText: 'Gum (soft tissue)' })).toBeVisible();
  const off = page.getByRole('button', { name: 'Take off the gum' });
  await expect(off).toBeVisible({ timeout: 20_000 }); // the parts panel appears once the model has loaded
  await off.click();
  await expect(page.getByRole('button', { name: 'Put the gum back' })).toBeVisible();
  await page.getByRole('button', { name: /Abscess/ }).click();
  await expect(page.locator('.legend li', { hasText: 'Drainage channel and gum boil' })).toBeVisible();
  await expect(page.locator('#stage')).toContainText('gum boil');
});
