import { expect, test } from '@playwright/test';

// Cross-section tool (public/head-neck/section.js) on the three.js head and neck viewers.
for (const path of ['/head-neck/scc/index.html', '/head-neck/index.html']) {
  test(`cut through the model on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator('.vt-parts')).toBeVisible({ timeout: 30_000 }); // model loaded
    const toggle = page.getByRole('button', { name: 'Cut through' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const coronal = page.getByRole('button', { name: 'Front to back (coronal)' });
    await coronal.click();
    await expect(coronal).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('Cut position').fill('30');
    const plane = await page.evaluate(() => {
      const box = document.getElementById('viewer') as HTMLElement & { vtSection: { state: { on: boolean; axis: string; t: number } } };
      return box.vtSection.state;
    });
    expect(plane).toMatchObject({ on: true, axis: 'z', t: 0.3 });
    await expect(page.locator('.vt-section-note')).toBeVisible();
    await toggle.click();
    await expect(page.locator('.vt-section-more')).toBeHidden();
    expect(errors).toEqual([]);
  });
}

test('cut-through words are in Japanese with furigana', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/head-neck/okc/index.html');
  const toggle = page.locator('#btn-section');
  await expect(toggle).toBeVisible({ timeout: 30_000 });
  await expect(toggle.locator('ruby')).toHaveCount(2);
});
