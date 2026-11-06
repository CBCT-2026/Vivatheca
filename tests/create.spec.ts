import { expect, test } from '@playwright/test';

const sampleDraft = `# Having a wisdom tooth taken out

## What is it?

Your wisdom tooth is stuck under the gum. The medical name is an impacted third molar.

## What are the risks?

About 7 in 100 people get some numbness of the lip [1].
Postoperative analgesia is administered to patients in order to facilitate an uncomplicated recovery period.
Lasting tongue numbness happens in about 2 in 1,000 people [CHECK: source].

## Sources

[1] Example source.
`;

test('the builder asks users to accept the AI limits first', async ({ page }) => {
  await page.goto('/create');
  await expect(page.getByRole('heading', { name: 'Create patient information' })).toBeVisible();
  await expect(page.getByText('AI can make mistakes', { exact: false }).first()).toBeVisible();
  const continueButton = page.getByRole('button', { name: 'Continue to the builder' });
  await expect(continueButton).toBeDisabled();
  await page.getByLabel('I understand and accept these limits.').check();
  await continueButton.click();
  await expect(page.getByRole('heading', { name: '1 Brief' })).toBeVisible();
});

test('without an API key the builder offers the copy-prompt mode and checks a pasted draft', async ({ page }) => {
  await page.goto('/create');
  await page.getByLabel('I understand and accept these limits.').check();
  await page.getByRole('button', { name: 'Continue to the builder' }).click();

  await expect(page.getByRole('button', { name: 'Copy prompt for your own AI chat' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Draft with AI' })).toHaveCount(0);

  await page.getByLabel('Draft (Markdown)').fill(sampleDraft);
  const checks = page.locator('.builder-checks');
  await expect(checks).toContainText('analgesia');
  await expect(checks).toContainText('to patients');
  await expect(checks).toContainText('[CHECK]');
  await expect(checks).toContainText('different denominators');

  const footer = page.locator('.builder-footer');
  await expect(footer).toContainText('DRAFT: AI-assisted, not clinically verified');
  for (const box of await page.locator('.builder-verify input[type=checkbox]').all()) await box.check();
  await expect(footer).toContainText('Checked by the treating clinician');

  // Editing the draft clears the clinician check.
  await page.getByLabel('Draft (Markdown)').press('End');
  await page.getByLabel('Draft (Markdown)').type(' Extra.');
  await expect(footer).toContainText('DRAFT');
});

test('patient details in the brief block AI and copy actions', async ({ page }) => {
  await page.goto('/create');
  await page.getByLabel('I understand and accept these limits.').check();
  await page.getByRole('button', { name: 'Continue to the builder' }).click();
  await page.getByLabel(/Key points to cover/).fill('Mrs Smith, DOB 02/03/1960, needs her tooth out');
  await expect(page.getByRole('alert')).toContainText('patient details');
  await expect(page.getByRole('button', { name: 'Copy prompt for your own AI chat' })).toBeDisabled();
});

test('the AI route reports that drafting is off without a key', async ({ request }) => {
  const status = await request.get('/api/generate');
  expect(await status.json()).toMatchObject({ enabled: false });
  const post = await request.post('/api/generate', { data: { action: 'draft', brief: {} } });
  expect(post.status()).toBe(503);
});

test('a model page link preselects its model, and every model page links to the builder', async ({ page }) => {
  await page.goto('/create?model=periodontitis');
  await page.getByLabel('I understand and accept these limits.').check();
  await page.getByRole('button', { name: 'Continue to the builder' }).click();
  const select = page.getByLabel('Vivatheca model');
  await expect(select).toHaveValue('periodontitis');
  await expect(select.locator('option')).toHaveCount(16);

  await page.goto('/periodontitis/index.html');
  await expect(page.locator('.vt-create a')).toHaveAttribute('href', '/create?model=periodontitis');
  await page.goto('/head-neck/okc/index.html');
  await expect(page.locator('.vt-create a')).toHaveAttribute('href', '/create?model=head-neck-okc');
});

test('exports are blocked while the draft looks like it has patient details', async ({ page }) => {
  await page.goto('/create');
  await page.getByLabel('I understand and accept these limits.').check();
  await page.getByRole('button', { name: 'Continue to the builder' }).click();
  const draft = page.getByLabel('Draft (Markdown)');
  await draft.fill('# Wisdom tooth\n\nYou were born 12/03/1980 and your Medicare number is 1234 56789 1.');
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeDisabled();
  await expect(page.getByText('Export is blocked', { exact: false })).toBeVisible();
  await draft.fill('# Wisdom tooth\n\nIn some cases the lip feels numb after surgery.');
  await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeEnabled();
  await expect(page.locator('.builder-findings')).toContainText('"In some cases" without a number');
});
