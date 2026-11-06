import { expect, test } from '@playwright/test';

test('homepage, footer and collection link to the contribute page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contribute').getByRole('link', { name: 'Open the form' }).last()).toHaveAttribute('href', '/contribute');
  await expect(page.locator('footer').getByRole('link', { name: 'Contribute a model' })).toHaveAttribute('href', '/contribute');
  await page.goto('/models');
  await expect(page.locator('.library-next a')).toHaveAttribute('href', '/contribute');
});

test('submission needs files, sources and all three confirmations', async ({ page }) => {
  await page.goto('/contribute');
  await expect(page.getByRole('heading', { level: 1, name: 'Submit or request a model' })).toBeVisible();
  await expect(page.getByText('Educational model only.').first()).toBeVisible();
  await expect(page.locator('#src-1')).toContainText('N Engl J Med');

  await page.getByLabel('Condition or anatomy').fill('Periapical abscess, lower first molar');
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toHaveText('Please add a link to the model files.');

  await page.getByLabel('Link to the files').fill('https://example.org/model.glb');
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toHaveText('Please list the sources the model is based on.');

  await page.getByLabel('Sources for the design').fill('doi:10.1000/example');
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toHaveText('Please tick all three boxes before you send.');

  for (const box of await page.locator('.contribute-confirm input[type=checkbox]').all()) await box.check();
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('request mode only needs the condition and hides submission fields', async ({ page }) => {
  await page.goto('/contribute?kind=request');
  await expect(page.getByLabel('Request a model')).toBeChecked();
  await expect(page.getByLabel('Link to the files')).toHaveCount(0);
  await expect(page.locator('.contribute-confirm')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open in my email app' }).click();
  await expect(page.getByRole('alert')).toHaveText('Please say which condition or anatomy the model shows.');
});

test('contribute page reads in Japanese', async ({ page }) => {
  await page.goto('/contribute?lang=ja');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('投稿');
});
