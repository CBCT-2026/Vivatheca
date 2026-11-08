import { expect, test } from '@playwright/test';

// Chairside pen and visit pack (anatomy apps review #7 and #8, 8 Nov 2026): wisdom tooth first.
// The pen draws on a still of the current view; views go to sessionStorage (this tab only) and
// /visit-pack lays them out with the take-home text, a QR code and the disclaimers.

test('the chairside pen draws on the wisdom tooth view and adds it to a visit pack', async ({ page }) => {
  await page.goto('/models/impacted-wisdom-tooth');
  const panel = page.locator('.vt-share');
  await expect(panel.getByRole('button', { name: 'Draw on it' })).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(() => [...document.querySelectorAll('model-viewer')].every((m) => (m as unknown as { loaded: boolean }).loaded), null, { timeout: 60_000 });

  await panel.getByRole('button', { name: 'Add view to visit pack' }).click();
  await expect(panel.locator('.vt-status')).toHaveText('Added to the visit pack (1 of 4).');

  await panel.getByRole('button', { name: 'Draw on it' }).click();
  const pen = page.getByRole('dialog', { name: 'Draw on the model' });
  await expect(pen).toBeVisible();
  await pen.getByRole('button', { name: 'Arrow' }).click();
  await expect(pen.getByRole('button', { name: 'Arrow' })).toHaveAttribute('aria-pressed', 'true');
  const box = (await pen.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 5 });
  await page.mouse.up();
  await pen.getByRole('button', { name: 'Add to visit pack' }).click();
  await expect(pen.locator('.vt-status')).toHaveText('Added to the visit pack (2 of 4).');
  await page.keyboard.press('Escape');
  await expect(pen).toBeHidden();

  await panel.getByRole('link', { name: /Open visit pack \(2\)/ }).click();
  await expect(page).toHaveURL(/\/visit-pack$/);
  const sheet = page.locator('.vp-sheet');
  await expect(sheet.locator('.vp-pictures img')).toHaveCount(2);
  await expect(sheet.locator('.vp-caption').nth(1)).toContainText('with drawing');
  await expect(sheet.getByRole('heading', { name: 'Your lower wisdom tooth' })).toBeVisible();
  await expect(sheet.locator('.vp-qr-code svg')).toBeVisible();
  await expect(sheet).toContainText('Not yet clinically reviewed.');
  await expect(sheet).toContainText('Not for diagnosis, treatment planning, surgical guides or use in or on the body.');
  await expect(sheet.getByRole('link', { name: 'vivatheca.com/disclaimer' })).toBeVisible();

  await page.getByRole('button', { name: 'Remove view 1' }).click();
  await expect(page.locator('.vp-count')).toHaveText('1 of 4 views');
  await page.getByRole('button', { name: 'Empty the visit pack' }).click();
  await expect(page.getByText('The visit pack is empty.')).toBeVisible();
});

test('an empty visit pack explains how to start', async ({ page }) => {
  await page.goto('/visit-pack');
  await expect(page.getByRole('heading', { level: 1, name: 'Visit pack' })).toBeVisible();
  await expect(page.getByText('The visit pack is empty.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the wisdom tooth model' })).toHaveAttribute('href', '/models/impacted-wisdom-tooth');
  await expect(page.locator('.vp-sheet')).toBeHidden();
});

test('other models do not show the pen yet', async ({ page }) => {
  await page.goto('/periodontitis/index.html');
  await expect(page.locator('.vt-share h2')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.vt-share').getByRole('button', { name: 'Draw on it' })).toHaveCount(0);
});
