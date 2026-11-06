import { expect, test } from '@playwright/test';

// TMD (/tmd/): jaw joints and chewing muscles with five animated jaw exercises, built from BodyParts3D
// (CC BY 4.0), and a printable patient sheet at /tmd/sheet/. vinext start serves the static pages at index.html.
test('tmd page plays each exercise and shows its steps and evidence', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/tmd/index.html');
  await expect(page.locator('#stage')).toContainText('The jaw and its muscles');
  await page.waitForFunction(() => (document.querySelector('#mv') as HTMLElement & { loaded?: boolean }).loaded, null, { timeout: 90_000 });
  const anim = () => page.locator('#mv').evaluate((el) => (el as HTMLElement & { animationName: string }).animationName);
  for (const [name, anim_] of [['3. Opening stretch', 'opening-stretch'], ['4. Side to side', 'side-to-side'], ['2. Tongue-up opening', 'tongue-up-opening']]) {
    await page.getByRole('button', { name: new RegExp(name.replace('.', '\\.')) }).click();
    await expect(page.locator('#stage h2')).toHaveText(name);
    await expect(page.locator('#stage .evidence')).toContainText('How sure are we?');
    await expect.poll(anim).toBe(anim_);
  }
  await expect(page.locator('#stage .evidence')).toContainText('We are not very sure');
});

test('tmd page states its CC BY licence, the disclaimer and links the patient sheet', async ({ page }) => {
  await page.goto('/tmd/index.html');
  await expect(page.locator('.credit')).toContainText('BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International');
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
  await expect(page.getByText('Not yet clinically reviewed.').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the sheet' })).toHaveAttribute('href', 'sheet/');
  // vinext start does not serve a folder's index.html by its trailing-slash URL; Cloudflare does.
  await page.goto('/tmd/sheet/index.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Jaw pain (TMD): exercises and care');
  await expect(page.locator('.ex')).toHaveCount(5);
  await expect(page.getByText('Educational model only. It shows typical anatomy or disease, not any real patient').first()).toBeVisible();
});

test('tmd page and sheet show Vietnamese from vi.js', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'vi', url: 'http://127.0.0.1:3000' }]);
  for (const path of ['/tmd/index.html', '/tmd/sheet/index.html']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Rối loạn thái dương hàm|Đau hàm/);
    expect(await page.locator('main [lang="en"]:visible').count(), path).toBe(0);
  }
});
