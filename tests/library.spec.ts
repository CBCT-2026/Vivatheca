import { expect, test } from '@playwright/test';

test('model library lists each model with its pairing and review status', async ({ page }) => {
  await page.goto('/models');
  await expect(page.getByRole('heading', { name: 'Models with a normal to compare.', level: 1 })).toBeVisible();
  const cards = page.getByRole('list', { name: 'Models' }).getByRole('listitem').filter({ has: page.getByRole('heading', { level: 2 }) });
  await expect(cards).toHaveCount(2);
  await expect(page.locator('.library-grid').getByRole('link', { name: /Impacted lower wisdom tooth/ })).toHaveAttribute('href', '/models/impacted-wisdom-tooth');
  await expect(page.locator('.library-grid').getByRole('link', { name: /Dental development, ages 6 to 12/ })).toHaveAttribute('href', '/development/');
  await expect(page.getByText('Not yet clinically reviewed', { exact: true })).toHaveCount(2);
  await expect(page.locator('.info-intro .prototype-note').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
});

test('wisdom tooth page compares impacted and normal models with downloads and details', async ({ page }) => {
  await page.goto('/models/impacted-wisdom-tooth');
  await expect(page.getByRole('heading', { name: 'Impacted lower wisdom tooth', level: 1 })).toBeVisible();
  const viewers = page.locator('model-viewer');
  await expect(viewers).toHaveCount(2);
  await expect.poll(() => viewers.nth(1).evaluate((element) => (element as HTMLElement & { src: string }).src)).toContain('/models/wisdom-tooth-normal.glb');

  await page.getByRole('button', { name: 'Normal', exact: true }).click();
  await expect(page.locator('.compare').getByText('Impacted (mesioangular)', { exact: true })).toBeHidden();
  await expect(page.locator('.compare').getByText('Matched normal (erupted)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Side by side' }).click();
  await expect(page.getByRole('checkbox', { name: 'Turn both together' })).toBeChecked();

  for (const href of ['/models/impacted-molar.glb', '/models/impacted-molar.stl', '/models/wisdom-tooth-normal.glb', '/models/wisdom-tooth-normal.stl']) {
    await expect(page.locator(`a[href="${href}"][download]`)).toHaveCount(1);
    const response = await page.request.get(href);
    expect(response.status()).toBe(200);
  }
  await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
  for (const heading of ['What it shows', 'How the normal was made', 'What is simplified', 'Published sources', 'Change log', 'How to credit']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await expect(page.locator('.source-list li')).toHaveCount(6);
  await expect(page.locator('.model-disclaimer')).toContainText('Not yet clinically reviewed.');
  await expect(page.locator('.model-disclaimer').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await expect(page.locator('.report-band a')).toHaveAttribute('href', '/report?model=impacted-wisdom-tooth');
});

test('report form builds an email with the chosen model and requires a description', async ({ page }) => {
  await page.goto('/report?model=dental-development');
  await expect(page.getByLabel('Model')).toHaveValue('dental-development');
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toContainText('Please describe what is wrong');
});

test('about and privacy pages explain who runs Vivatheca and what is collected', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Who runs it' })).toBeVisible();
  await expect(page.getByText(/Founder & Director/)).toBeVisible();
  await expect(page.getByText(/Neither step is complete yet/)).toBeVisible();
  await expect(page.locator('.prototype-note').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'No accounts, no tracking cookies' })).toBeVisible();
});

test('new pages have no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ['/models', '/models/impacted-wisdom-tooth', '/about', '/privacy', '/report']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), route).toBe(false);
  }
});

test('/collection opens the model library', async ({ page }) => {
  await page.goto('/collection');
  await expect(page).toHaveURL(/\/models$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
