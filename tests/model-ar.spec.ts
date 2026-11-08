import { expect, test, type Page } from '@playwright/test';

// "View on your desk" phone AR (public/model-ar.js). Test browsers have no AR, so the page is told it has:
// model-viewer's canActivateAR returns true and activateAR records what it was asked to open; for the
// three.js viewers, navigator.xr says immersive AR is supported.
async function fakeAR(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __ar: { scale: string | null; modes: string | null; src: string }[] };
    w.__ar = [];
    Object.defineProperty(navigator, 'xr', { configurable: true, value: { isSessionSupported: () => Promise.resolve(true) } });
    customElements.whenDefined('model-viewer').then(() => {
      const C = customElements.get('model-viewer') as unknown as { prototype: Record<string, unknown> };
      Object.defineProperty(C.prototype, 'canActivateAR', { configurable: true, get: () => true });
      C.prototype.activateAR = function (this: HTMLElement & { src: string }) {
        w.__ar.push({ scale: this.getAttribute('scale'), modes: this.getAttribute('ar-modes'), src: this.src });
        return Promise.resolve();
      };
    });
  });
}
const calls = (page: Page) => page.evaluate(() => (window as unknown as { __ar: { scale: string | null; modes: string | null; src: string }[] }).__ar);

test('no AR button where the browser cannot open AR', async ({ page }) => {
  await page.goto('/periodontitis/index.html');
  await expect(page.locator('model-viewer')).toHaveAttribute('ar', '', { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await expect(page.locator('.vt-ar-btn')).toBeHidden();
});

test('model in metres: disclaimer first, then AR with Scene Viewer allowed', async ({ page }) => {
  await fakeAR(page);
  await page.goto('/periodontitis/index.html');
  const btn = page.locator('model-viewer .vt-ar-btn');
  await expect(btn).toBeVisible({ timeout: 30_000 });
  await expect(btn).toHaveText('View on your desk');
  await btn.click();
  const dlg = page.locator('dialog.vt-ar-dlg');
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText('Not yet clinically reviewed.');
  await expect(dlg).toContainText('Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.');
  await expect(dlg.locator('a[href="/disclaimer"]')).toBeVisible();
  expect(await calls(page)).toHaveLength(0);
  await dlg.getByRole('button', { name: 'Open the camera' }).click();
  await expect(dlg).toBeHidden();
  const c = await calls(page);
  expect(c).toHaveLength(1);
  expect(c[0].modes).toBe('webxr scene-viewer quick-look');
  expect(c[0].scale).toBeNull();
  // The disclaimer stays on screen during WebXR (model-viewer is the DOM overlay).
  await expect(page.locator('model-viewer .vt-ar-note')).toContainText('Not yet clinically reviewed.');
});

test('model in millimetres is scaled to metres for AR only, without Scene Viewer', async ({ page }) => {
  await fakeAR(page);
  await page.goto('/endodontic/index.html');
  const mv = page.locator('model-viewer').first();
  const btn = mv.locator('.vt-ar-btn');
  await expect(btn).toBeVisible({ timeout: 30_000 });
  await btn.click();
  await page.getByRole('button', { name: 'Open the camera' }).click();
  const c = await calls(page);
  expect(c[0].scale).toBe('0.001 0.001 0.001');
  expect(c[0].modes).toBe('webxr quick-look');
  await expect(mv).not.toHaveAttribute('scale', /./);
});

test('cancel closes the box without opening AR', async ({ page }) => {
  await fakeAR(page);
  await page.goto('/tmd/index.html');
  await page.locator('model-viewer .vt-ar-btn').click({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('dialog.vt-ar-dlg')).toBeHidden();
  expect(await calls(page)).toHaveLength(0);
});

test('Japanese button and disclaimer with furigana', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await fakeAR(page);
  await page.goto('/periodontitis/index.html');
  const btn = page.locator('model-viewer .vt-ar-btn');
  await expect(btn.locator('ruby').first()).toContainText('机', { timeout: 30_000 });
  await btn.click();
  await expect(page.locator('dialog.vt-ar-dlg')).toContainText('レビュー');
});

test('head and neck three.js viewer opens the parts on show in a hidden model-viewer', async ({ page }) => {
  await fakeAR(page);
  await page.goto('/head-neck/scc/index.html');
  await expect(page.locator('#viewer .vt-callout').first()).toBeVisible({ timeout: 30_000 });
  const btn = page.locator('#viewer .vt-ar-btn');
  await expect(btn).toBeVisible();
  await btn.click();
  const go = page.getByRole('button', { name: 'Open the camera' });
  await expect(go).toBeEnabled({ timeout: 30_000 });
  await go.click();
  await expect.poll(async () => (await calls(page)).length, { timeout: 10_000 }).toBe(1);
  const c = await calls(page);
  expect(c[0].src).toMatch(/^blob:/);
  expect(c[0].modes).toBe('webxr quick-look');
});

test('app page viewer (wisdom tooth compare) gets the AR button', async ({ page }) => {
  await fakeAR(page);
  await page.goto('/models/impacted-wisdom-tooth');
  await page.locator('model-viewer').first().scrollIntoViewIfNeeded();
  await expect(page.locator('model-viewer .vt-ar-btn').first()).toBeVisible({ timeout: 30_000 });
});
