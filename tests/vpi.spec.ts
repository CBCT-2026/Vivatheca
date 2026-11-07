import { expect, test } from '@playwright/test';

// Velopharyngeal insufficiency (/vpi/): normal closure (breathing, speaking), VPI after cleft palate repair and
// three operations, each with a side (cut) and from-above view. CC BY 4.0, built from BodyParts3D.
test('vpi page switches between normal closure, VPI and the operations, and views from above', async ({ page }) => {
  await page.goto('/vpi/index.html');
  const src = () => page.locator('#mv').evaluate((el) => (el as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('models/speech-cut.glb');
  await page.getByRole('button', { name: /Speaking with VPI/ }).click();
  await expect.poll(src).toContain('models/vpi-cut.glb');
  await expect(page.locator('.legend li', { hasText: 'Air escaping through the nose' })).toBeVisible();
  await expect(page.locator('#stage')).toContainText('Air leaks through the gap into the nose');
  await page.getByRole('button', { name: /Pharyngeal flap/ }).click();
  await expect.poll(src).toContain('models/flap-cut.glb');
  await expect(page.locator('.legend li', { hasText: 'Tissue moved in surgery' })).toBeVisible();
  await expect(page.locator('.legend li', { hasText: 'Air escaping through the nose' })).toBeHidden();
  await page.getByRole('button', { name: 'View from above' }).click();
  await expect.poll(src).toContain('models/flap-whole.glb');
});

test('vpi page explains the speech pathologist role, states its CC BY licence and the model disclaimer', async ({ page }) => {
  await page.goto('/vpi/index.html');
  await expect(page.getByRole('heading', { name: 'What the speech pathologist does' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why speech therapy alone cannot close the gap' })).toBeVisible();
  const credit = page.locator('.credit');
  await expect(credit).toContainText('BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International');
  await expect(credit.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '{}');
  expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/');
});

test('vpi page shows Vietnamese from vi.js', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/vpi/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thiểu năng vòm hầu');
  await expect(page.getByRole('button', { name: 'Nhìn từ trên xuống' })).toBeVisible();
  // every English block has a Vietnamese twin (the video is English-only; the site-wide "free to read" tag stays English)
  expect(await page.locator('main [lang="en"]:not(#video):not(.vt-oa):visible').count()).toBe(0);
});
