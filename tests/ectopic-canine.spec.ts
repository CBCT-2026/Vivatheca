import { expect, test } from '@playwright/test';

// Ectopic canine (/ectopic-canine/): the right upper jaw at 10.5 years from the dental development series, with the
// adult canine on its normal path, displaced towards the palate, and after the baby canine is taken out. CC BY-SA 4.0
// (Z-Anatomy). vinext start serves the static page at /ectopic-canine/index.html.
test('ectopic canine page switches between normal, palatal and baby tooth out', async ({ page }) => {
  await page.goto('/ectopic-canine/index.html');
  const src = () => page.locator('#mv').evaluate((el) => (el as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('models/normal.glb');
  await page.getByRole('button', { name: /^Palate side/ }).first().click();
  await expect.poll(src).toContain('models/palatal.glb');
  await expect(page.locator('#stage')).toContainText('towards the palate');
  await page.getByRole('button', { name: /^Baby tooth out/ }).click();
  await expect.poll(src).toContain('models/extracted.glb');
  const xray = page.getByRole('button', { name: 'See through the bone' });
  await expect(xray).toHaveAttribute('aria-pressed', 'true');
  await xray.click();
  await expect(xray).toHaveAttribute('aria-pressed', 'false');
});

test('ectopic canine page states its CC BY-SA licence, the Z-Anatomy credit and the model disclaimer', async ({ page }) => {
  await page.goto('/ectopic-canine/index.html');
  const credit = page.locator('.credit');
  await expect(credit).toContainText('Z-Anatomy');
  await expect(credit.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '{}');
  expect(ld.license).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
});

test('ectopic canine page shows Vietnamese from vi.js', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/ectopic-canine/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Răng nanh hàm trên');
  await expect(page.getByRole('button', { name: 'Nhìn xuyên xương' })).toBeVisible();
  expect(await page.locator('main [lang="en"]:not(#video):not(.vt-oa):visible').count()).toBe(0);
});
