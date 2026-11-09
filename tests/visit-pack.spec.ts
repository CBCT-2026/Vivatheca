import { expect, test } from '@playwright/test';

// Chairside pen and visit pack (anatomy apps review #7 and #8, 8 Nov 2026): wisdom tooth first, every model since 9 Nov 2026.
// The pen draws on a still of the current view; views go to sessionStorage (this tab only) and
// /visit-pack lays them out with the take-home text, a QR code and the disclaimers.

const modelsLoaded = (page: import('@playwright/test').Page) =>
  page.waitForFunction(() => [...document.querySelectorAll('model-viewer')].every((m) => (m as unknown as { loaded: boolean }).loaded), null, { timeout: 60_000 });

test('the chairside pen draws on the wisdom tooth view and adds it to a visit pack', async ({ page }) => {
  await page.goto('/models/impacted-wisdom-tooth');
  const panel = page.locator('.vt-share');
  await expect(panel.getByRole('button', { name: 'Draw on it' })).toBeVisible({ timeout: 30_000 });
  await modelsLoaded(page);

  await panel.getByRole('button', { name: 'Add view to visit pack' }).click();
  await expect(panel.locator('.vt-status')).toHaveText('Added to the visit pack (1 of 4).', { timeout: 20_000 });

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
  await expect(pen.locator('.vt-status')).toHaveText('Added to the visit pack (2 of 4).', { timeout: 20_000 });
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
  // The three questions cite the last source of this model's list.
  const wisdom = sheet.locator('[data-vp-model="impacted-wisdom-tooth"]');
  await expect(wisdom.locator('.vp-sources li')).toHaveCount(5);
  await expect(wisdom.getByRole('link', { name: 'Source 5' })).toHaveAttribute('href', '#src-impacted-wisdom-tooth-5');

  await page.getByRole('button', { name: 'Remove view 1' }).click();
  await expect(page.locator('.vp-count')).toHaveText('1 of 4 views');
  await page.getByRole('button', { name: 'Empty the visit pack' }).click();
  await expect(page.getByText('The visit pack is empty.')).toBeVisible();
});

test('an empty visit pack explains how to start', async ({ page }) => {
  await page.goto('/visit-pack');
  await expect(page.getByRole('heading', { level: 1, name: 'Visit pack' })).toBeVisible();
  await expect(page.getByText('The visit pack is empty.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Choose a model' })).toHaveAttribute('href', '/models');
  await expect(page.locator('.vp-sheet')).toBeHidden();
});

test('a static model page (periodontitis) and an app page (bone graft) both add views, and the sheet shows one section per model', async ({ page }) => {
  // Static page with model-viewer.
  await page.goto('/periodontitis/index.html');
  const panel = page.locator('.vt-share');
  await expect(panel.getByRole('button', { name: 'Draw on it' })).toBeVisible({ timeout: 30_000 });
  await modelsLoaded(page);
  await panel.getByRole('button', { name: 'Add view to visit pack' }).click();
  await expect(panel.locator('.vt-status')).toHaveText('Added to the visit pack (1 of 4).', { timeout: 20_000 });
  await expect(panel.getByRole('link', { name: /Open visit pack \(1\)/ })).toBeVisible();

  // App page (React) with model-viewer, same tab so the pack carries over.
  await page.goto('/models/alveolar-bone-graft');
  await expect(panel.getByRole('button', { name: 'Draw on it' })).toBeVisible({ timeout: 30_000 });
  await modelsLoaded(page);
  await panel.getByRole('button', { name: 'Draw on it' }).click();
  const pen = page.getByRole('dialog', { name: 'Draw on the model' });
  await expect(pen).toBeVisible();
  await pen.getByRole('button', { name: 'Circle' }).click();
  const box = (await pen.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 5 });
  await page.mouse.up();
  await pen.getByRole('button', { name: 'Add to visit pack' }).click();
  await expect(pen.locator('.vt-status')).toHaveText('Added to the visit pack (2 of 4).', { timeout: 20_000 });
  await page.keyboard.press('Escape');

  await panel.getByRole('link', { name: /Open visit pack \(2\)/ }).click();
  await expect(page).toHaveURL(/\/visit-pack$/);
  const sheet = page.locator('.vp-sheet');
  await expect(sheet.locator('.vp-pictures img')).toHaveCount(2);
  await expect(sheet.getByRole('heading', { name: 'Your gums and the bone around your teeth' })).toBeVisible();
  await expect(sheet.getByRole('heading', { name: 'A bone graft for the cleft in the upper jaw' })).toBeVisible();
  await expect(sheet.locator('.vp-model:visible')).toHaveCount(2);
  await expect(sheet.locator('.vp-qr-code svg')).toHaveCount(2);
  // Each section carries its own licence line (periodontitis is CC BY-SA, like the site) and source links stay unique.
  await expect(sheet.locator('[data-vp-model="periodontitis"]')).toContainText('CC BY-SA 4.0');
  await expect(sheet.locator('[data-vp-model="alveolar-bone-graft"] .vp-sources li').first()).toHaveAttribute('id', 'src-alveolar-bone-graft-1');
  await expect(sheet.locator('[data-vp-model="periodontitis"]').getByRole('link', { name: 'Source 1' }).first()).toHaveAttribute('href', '#src-periodontitis-1');
  await expect(sheet.locator('.vp-model:visible .vp-url')).toHaveText(['vivatheca.com/periodontitis/', 'vivatheca.com/models/alveolar-bone-graft']);
  await page.getByRole('button', { name: 'Empty the visit pack' }).click();
});

test('a three.js page (head and neck case) captures its view and a CC BY model keeps its own licence', async ({ page }) => {
  await page.goto('/head-neck/scc/index.html');
  const panel = page.locator('.vt-share');
  await expect(panel.getByRole('button', { name: 'Draw on it' })).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(() => !!(document.querySelector('#viewer') as unknown as { vtView?: unknown } | null)?.vtView, null, { timeout: 60_000 });
  await panel.getByRole('button', { name: 'Add view to visit pack' }).click();
  await expect(panel.locator('.vt-status')).toHaveText('Added to the visit pack (1 of 4).', { timeout: 20_000 });

  await page.goto('/endodontic/index.html');
  await expect(panel.getByRole('button', { name: 'Draw on it' })).toBeVisible({ timeout: 30_000 });
  await modelsLoaded(page);
  await panel.getByRole('button', { name: 'Add view to visit pack' }).click();
  await expect(panel.locator('.vt-status')).toHaveText('Added to the visit pack (2 of 4).', { timeout: 20_000 });

  await page.goto('/visit-pack');
  const sheet = page.locator('.vp-sheet');
  await expect(sheet.locator('.vp-pictures img')).toHaveCount(2);
  await expect(sheet.getByRole('heading', { name: 'Cancer of the gum and jaw bone' })).toBeVisible();
  await expect(sheet.locator('[data-vp-model="endodontic"]')).toContainText('CC BY 4.0');
  await expect(sheet.locator('[data-vp-model="endodontic"]')).not.toContainText('CC BY-SA');
  await page.getByRole('button', { name: 'Empty the visit pack' }).click();
});

test('every catalogue model shows the pen and adds a view to the pack', async ({ page }) => {
  test.setTimeout(240_000);
  const models: { slug: string; href: string }[] = (await (await page.request.get('/api/models')).json()).models;
  expect(models.length).toBeGreaterThanOrEqual(21);
  const panel = page.locator('.vt-share');
  for (const [i, m] of models.entries()) {
    // The local server answers a static folder only at /index.html (production serves the folder itself).
    await page.goto(m.href.endsWith('/') ? `${m.href}index.html` : m.href);
    await expect(panel.getByRole('button', { name: 'Draw on it' }), m.slug).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByRole('button', { name: 'Add view to visit pack' }), m.slug).toBeVisible();
    if (i >= 4) continue; // the pack holds four views; the buttons are what every model must have
    await page.waitForFunction(() => {
      const mvs = [...document.querySelectorAll('model-viewer')];
      if (mvs.length) return mvs.every((x) => (x as unknown as { loaded: boolean }).loaded);
      return !!(document.querySelector('#viewer') as unknown as { vtView?: unknown } | null)?.vtView;
    }, null, { timeout: 60_000 });
    await panel.getByRole('button', { name: 'Add view to visit pack' }).click();
    await expect(panel.locator('.vt-status'), m.slug).toHaveText(`Added to the visit pack (${i + 1} of 4).`, { timeout: 20_000 });
  }
  await page.goto('/visit-pack');
  await expect(page.locator('.vp-pictures img')).toHaveCount(4);
  await expect(page.locator('.vp-model:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Empty the visit pack' }).click();
});
