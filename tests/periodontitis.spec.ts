import { expect, test } from '@playwright/test';

test.describe('Periodontitis stages page', () => {
  test('shows review status, disclaimer and sources, and switches stage', async ({ page }) => {
    await page.goto('/periodontitis/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stages I to IV');
    await expect(page.locator('.review')).toContainText('Not yet clinically reviewed.');
    await expect(page.locator('.review')).toContainText('Not for diagnosis, treatment planning, surgical guides or use in or on the body.');
    await expect(page.locator('.review a[href="/disclaimer"]')).toBeVisible();
    await expect(page.locator('#ref-1')).toContainText('10.1002/JPER.18-0006');

    await page.getByRole('button', { name: /Stage III/ }).click();
    await expect.poll(() => page.locator('#mv').evaluate((el) => (el as HTMLElement & { src: string }).src)).toContain('models/stage-3.glb');
    await expect(page.locator('#stage')).toContainText('Stage III');
    await expect(page.locator('#download')).toHaveAttribute('href', 'downloads/vivatheca-periodontitis-stage-3-1.0x.zip');
  });
});
