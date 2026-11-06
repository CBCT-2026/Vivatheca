import { expect, test } from '@playwright/test';

// Clinician survey (/survey): the form checks its own answers, starts on the model from ?model=,
// and says plainly when the store is off (as under `pnpm start`, which has no STORE binding).
test('survey form checks answers and reports when the store is off', async ({ page }) => {
  await page.goto('/survey?model=endodontic');
  await expect(page.getByRole('heading', { name: 'Would you use these models with your patients?' })).toBeVisible();
  await expect(page.getByLabel('Which model did you look at most?')).toHaveValue('endodontic');
  const send = page.getByRole('button', { name: 'Send answers' });
  await send.click();
  await expect(page.getByRole('alert')).toHaveText('Please choose your role.');
  await page.getByLabel('Your role').selectOption({ index: 1 });
  await send.click();
  await expect(page.getByRole('alert')).toHaveText('Please answer all five statements.');
  for (const group of await page.locator('fieldset.survey-item').all()) await group.getByText('Agree', { exact: true }).click();
  await send.click();
  await expect(page.getByRole('alert')).toHaveText('Please tick both boxes before sending.');
  await page.getByLabel(/My answers contain no patient names/).check();
  await page.getByLabel(/I agree that my answers/).check();
  await send.click();
  await expect(page.getByRole('alert')).toContainText('not switched on yet');
});

test('survey API refuses answers without both ticks, and admin results need the key', async ({ request }) => {
  const res = await request.post('/api/survey', { data: { role: 'Dentist', accurate: 4, normal: 4, use: 4, sources: 4, easy: 4 } });
  expect([400, 503]).toContain(res.status());
  const admin = await request.get('/api/admin/survey');
  expect([401, 503]).toContain(admin.status());
});

test('survey is linked from the footer and the model share panel', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/survey"]')).toBeVisible();
  await page.goto('/periodontitis/index.html');
  await expect(page.locator('.vt-share a[href="/survey?model=periodontitis"]')).toBeVisible({ timeout: 30_000 });
});

test('survey page works in Japanese and Vietnamese', async ({ page, context }) => {
  for (const [lang, heading] of [['ja', /アンケート|患者/], ['vi', /bệnh nhân/]] as const) {
    await context.addCookies([{ name: 'vivatheca-lang', value: lang, url: 'http://127.0.0.1:3000' }]);
    await page.goto('/survey');
    await expect(page.locator('h1')).toContainText(heading);
  }
});
