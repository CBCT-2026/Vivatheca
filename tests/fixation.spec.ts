import { expect, test } from '@playwright/test';

test.describe('plates and screws demonstration', () => {
  test('steps through the placement and shows diagrams, disclaimer and sources', async ({ page }) => {
    await page.goto('/fixation/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('plates and screws');
    await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Full disclaimer' }).first()).toHaveAttribute('href', '/disclaimer');
    const viewer = page.locator('#mv');
    const src = () => viewer.evaluate((el) => (el as HTMLElement & { src: string }).src);
    await expect.poll(src).toContain('models/1-cut.glb');
    await expect(page.locator('#stage')).toContainText('Step 1');
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect.poll(src).toContain('models/2-lined-up.glb');
    await page.locator('[data-stage="4-drill"]').click();
    await expect.poll(src).toContain('models/4-drill.glb');
    await expect(page.locator('#stage')).toContainText('Drill the first hole');
    await expect(page.locator('[data-stage="4-drill"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('figure.diagram img')).toHaveCount(3);
    await expect(page.locator('.refs li')).toHaveCount(13);
  });

  test('model and diagram files are served', async ({ request }) => {
    for (const m of ['1-cut', '2-lined-up', '3-plate', '4-drill', '5-first-screw', '6-all-screws', '7-see-through']) {
      expect((await request.get(`/fixation/models/${m}.glb`)).ok(), m).toBeTruthy();
    }
    for (const d of ['plate-and-screw', 'placing-steps', 'orthognathic-plates']) {
      expect((await request.get(`/fixation/diagrams/${d}.svg`)).ok(), d).toBeTruthy();
    }
  });

  test('switches to Japanese with furigana', async ({ page, context }) => {
    await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
    await page.goto('/fixation/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('固定');
    await expect(page.locator('h1 ruby').first()).toBeVisible();
  });
});
