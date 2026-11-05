import { expect, test } from '@playwright/test';

test('homepage separates clinician and student use and links to the student hub', async ({ page }) => {
  await page.goto('/');
  const audiences = page.locator('#audiences');
  await expect(audiences.getByRole('heading', { name: 'Educate your patients' })).toBeVisible();
  await expect(audiences.getByRole('link', { name: /Go to student learning/ })).toHaveAttribute('href', '/learn');
});

test('student hub shows review status, model disclaimer and the clinician route', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByRole('heading', { name: 'Learn from the models', level: 1 })).toBeVisible();
  await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
  await expect(page.locator('.learn-model-disclaimer').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await expect(page.getByRole('link', { name: 'Go to the clinician pages' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Open the student guide' })).toHaveAttribute('href', '/learn/development');
});

test('development student guide cites every source it numbers', async ({ page }) => {
  await page.goto('/learn/development');
  await expect(page.getByRole('heading', { name: 'Staging tooth formation' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: /Demirjian/ })).toBeVisible();
  const cited = await page.locator('main .cite a').evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')))]);
  for (const href of cited) await expect(page.locator(href!)).toHaveCount(1);
  await expect(page.locator('.learn-model-box').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
});

test('student guide is translated into Japanese with furigana', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/learn/development');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1 rt').first()).toHaveText('は');
  await expect(page.locator('main')).toContainText('加生歯(かせいし)');
});
