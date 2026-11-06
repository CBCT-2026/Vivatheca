import { expect, test } from '@playwright/test';

// "Take the model apart" panel (public/model-parts.js) on the static model pages: soft tissue and removable parts,
// the same tools as the CBCT-2026/ABG viewer.
test('static model pages let visitors take off the gum and hide parts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/stainless-steel-crown/index.html');
  const panel = page.locator('.vt-parts');
  await expect(panel.getByRole('heading', { name: 'Take the model apart' })).toBeVisible({ timeout: 30_000 });
  await panel.getByRole('button', { name: 'Take off the gum' }).click();
  await expect(panel.getByRole('button', { name: 'Put the gum back' })).toHaveAttribute('aria-pressed', 'true');
  const bone = panel.getByRole('button', { name: 'Bone', exact: true });
  await bone.click();
  await expect(bone).toHaveAttribute('aria-pressed', 'false');
  await panel.getByRole('button', { name: 'Show all parts' }).click();
  await expect(bone).toHaveAttribute('aria-pressed', 'true');
});

test('development page lets visitors take out the baby teeth, in Japanese too', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/development/index.html');
  const panel = page.locator('.vt-parts');
  const baby = panel.getByRole('button', { name: /乳歯/ });
  await expect(baby).toBeVisible({ timeout: 30_000 });
  await baby.click();
  await expect(baby).toHaveAttribute('aria-pressed', 'false');
});

test('head and neck case viewer lists its parts', async ({ page }) => {
  await page.goto('/head-neck/mec/index.html');
  const panel = page.locator('.vt-parts');
  await expect(panel.getByRole('button', { name: 'Take off the lining' })).toBeVisible({ timeout: 30_000 });
  await panel.getByRole('button', { name: 'Teeth' }).click();
  await expect(panel.getByRole('button', { name: 'Teeth' })).toHaveAttribute('aria-pressed', 'false');
});

test('wisdom tooth compare viewer hides a part on both models', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/models/impacted-wisdom-tooth');
  const parts = page.locator('.compare-parts');
  await expect(parts.getByRole('button', { name: 'Bone', exact: true })).toBeVisible({ timeout: 30_000 });
  await parts.getByRole('button', { name: 'Bone', exact: true }).click();
  await expect(parts.getByRole('button', { name: 'Bone', exact: true })).toHaveAttribute('aria-pressed', 'false');
});
