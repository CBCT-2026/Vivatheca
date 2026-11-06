import { expect, test } from '@playwright/test';

// Clinical images with a labels.json get an "Explore with labels" button that opens a zoomable
// viewer (OpenSeadragon + Annotorious) with numbered labels that can be switched off.
test('SCC page: the after-surgery X-ray opens with labels, in English and Japanese', async ({ page, context }) => {
  await page.goto('/head-neck/scc/index.html');
  const figure = page.locator('#img-2');
  await figure.scrollIntoViewIfNeeded();
  await figure.getByRole('button', { name: 'Explore with labels' }).click();
  const dialog = page.locator('dialog.clinical-zoom');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.cz-list li')).toHaveCount(7);
  await expect(dialog.locator('.cz-list li').first()).toContainText('Fibula segment up the right side');
  await expect(dialog.locator('.cz-list li').first()).toContainText('Label source');
  // shapes are drawn on the image and can be hidden
  await expect(dialog.locator('.cz-viewer canvas.a9s-gl-canvas')).toHaveCount(1);
  await expect(dialog.locator('.cz-viewer .cz-badge')).toHaveCount(7);
  await dialog.getByRole('checkbox').uncheck();
  await expect(dialog.locator('.cz-viewer .cz-badge').first()).toBeHidden();
  await dialog.locator('.cz-list li').nth(2).getByRole('button').click();
  await expect(dialog.locator('.cz-list li').nth(2)).toHaveClass(/active/);
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toHaveCount(0);

  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.reload();
  await page.locator('#img-1').getByRole('button', { name: /説明/ }).click();
  await expect(page.locator('dialog.clinical-zoom .cz-list li')).toHaveCount(4);
  await expect(page.locator('dialog.clinical-zoom .cz-list li').first()).toContainText('右下');
  await expect(page.locator('dialog.clinical-zoom ruby rt').first()).toBeAttached();
});

test('pages without labels get no button', async ({ page }) => {
  await page.goto('/head-neck/okc/index.html');
  await expect(page.locator('.cz-open')).toHaveCount(0);
});
