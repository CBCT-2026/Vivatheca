import { expect, test } from '@playwright/test';

// Labels on the models (public/model-labels.js): pinned terms on every viewer, a button to hide them and the
// list of where the label names come from.
test('static model page shows labels with sources, and the button hides them', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/periodontitis/index.html');
  await expect(page.locator('model-viewer .vt-hotspot[data-key="teethLower"]')).toHaveAttribute('data-show', 'true', { timeout: 30_000 });
  await expect(page.locator('model-viewer .vt-hotspot[data-key="teethLower"]')).toContainText('Mandibular teeth');
  const sources = page.locator('.vt-label-sources');
  await sources.locator('summary').click();
  await expect(sources).toContainText('Terminologia Anatomica');
  const toggle = page.locator('model-viewer .vt-label-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('model-viewer .vt-hotspot').first()).toBeHidden();
});

test('labels follow the language, in Japanese with furigana', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/tmd/index.html');
  await expect(page.locator('model-viewer .vt-hotspot[data-key="masseter"] ruby').first()).toContainText('咬筋', { timeout: 30_000 });
});

test('head and neck case viewer labels the disease', async ({ page }) => {
  await page.goto('/head-neck/scc/index.html');
  await expect(page.locator('#viewer .vt-hotspot[data-key="scc"]')).toContainText('Squamous cell carcinoma', { timeout: 30_000 });
});

test('wisdom tooth compare viewer labels the nerve on both models', async ({ page }) => {
  await page.goto('/models/impacted-wisdom-tooth');
  await page.locator('model-viewer').first().scrollIntoViewIfNeeded();
  await expect(page.locator('model-viewer .vt-hotspot[data-key="ian"]')).toHaveCount(2, { timeout: 30_000 });
});
