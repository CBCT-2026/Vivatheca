import { expect, test } from '@playwright/test';

// Prosthodontic pair (/prosthodontic/): dentate mandible vs atrophic edentulous mandible, with complete denture
// and two-implant overdenture options. Built from BodyParts3D (CC BY 4.0). vinext start serves the static page
// at /prosthodontic/index.html.
test('prosthodontic page switches between the jaws and the two dentures, and cuts them open', async ({ page }) => {
  await page.goto('/prosthodontic/index.html');
  const src = () => page.locator('#mv').evaluate((el) => (el as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('models/dentate-whole.glb');
  await page.getByRole('button', { name: /No teeth/ }).click();
  await expect.poll(src).toContain('models/edentulous-whole.glb');
  await page.getByRole('button', { name: /Implant denture/ }).click();
  await expect.poll(src).toContain('models/overdenture-whole.glb');
  await expect(page.locator('.legend li', { hasText: 'Implants' })).toBeVisible();
  await page.getByRole('button', { name: 'Cut open' }).click();
  await expect.poll(src).toContain('models/overdenture-cut.glb');
  await expect(page.locator('#stage')).toContainText('Denture held by two implants');
});

test('prosthodontic page states its CC BY licence, the BodyParts3D credit and the model disclaimer', async ({ page }) => {
  await page.goto('/prosthodontic/index.html');
  const credit = page.locator('p.credit');
  await expect(credit).toContainText('BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International');
  await expect(credit.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '{}');
  expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/');
});

test('prosthodontic page shows Vietnamese from vi.js', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/prosthodontic/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hàm dưới mất răng');
  await expect(page.getByRole('button', { name: 'Cắt mở' })).toBeVisible();
  expect(await page.locator('main [lang="en"]:not(#video):visible').count()).toBe(0);
});
