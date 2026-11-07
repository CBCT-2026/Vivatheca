import { expect, test } from '@playwright/test';

// Dentigerous cyst pair (/dentigerous-cyst/): unerupted lower third molar with a normal follicle vs the same tooth
// with a dentigerous cyst. Built from BodyParts3D (CC BY 4.0). vinext start serves the static page at
// /dentigerous-cyst/index.html.
test('dentigerous cyst page switches between the normal sac and the cyst, and cuts them open', async ({ page }) => {
  await page.goto('/dentigerous-cyst/index.html');
  const src = () => page.locator('#mv').evaluate((el) => (el as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('models/normal-whole.glb');
  await page.getByRole('button', { name: /^Cyst/ }).click();
  await expect.poll(src).toContain('models/cyst-whole.glb');
  await expect(page.locator('.legend li', { hasText: 'Cyst' })).toBeVisible();
  await page.getByRole('button', { name: 'Cut open' }).click();
  await expect.poll(src).toContain('models/cyst-cut.glb');
  await expect(page.locator('#stage')).toContainText('dentigerous cyst');
});

test('dentigerous cyst page states its CC BY licence, the BodyParts3D credit and the model disclaimer', async ({ page }) => {
  await page.goto('/dentigerous-cyst/index.html');
  const credit = page.locator('p.credit');
  await expect(credit).toContainText('BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International');
  await expect(credit.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '{}');
  expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/');
});

test('dentigerous cyst page shows Vietnamese from vi.js', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/dentigerous-cyst/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nang thân răng');
  await expect(page.getByRole('button', { name: 'Cắt mở' })).toBeVisible();
  expect(await page.locator('main [lang="en"]:not(#video):not(.vt-oa):visible').count()).toBe(0);
});
