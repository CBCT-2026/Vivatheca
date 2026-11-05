import { expect, test } from '@playwright/test';


// textContent includes each reading as 漢字(かんじ), from the <rp> fallback brackets.
test('the site opens in English and switches to Japanese with furigana', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('button', { name: '日本語' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page).toHaveTitle(/医療模型をわかりやすく/);
  // Kanji carry readings as ruby; the readings are hidden from assistive technology.
  const ruby = page.locator('.hero-title ruby').first();
  await expect(ruby.locator('rt')).toHaveText('いりょう');
  await expect(ruby.locator('rt')).toHaveAttribute('aria-hidden', 'true');
  await expect(ruby.locator('rt')).toBeVisible();

  // Furigana can be hidden, and the choice persists.
  await page.getByRole('button', { name: 'ふりがな' }).click();
  await expect(ruby.locator('rt')).toBeHidden();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-furigana', 'off');

  // The clinical tour uses Japanese dental terms.
  // Retry until the page has hydrated after the reload.
  const clinician = page.locator('.segmented button').nth(1);
  await expect(async () => {
    await clinician.click();
    await expect(clinician).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
  }).toPass();
  await expect(page.locator('.model-copy')).toContainText('下顎(かがく)第三(だいさん)大臼歯(だいきゅうし)が近心(きんしん)傾斜(けいしゃ)して埋伏(まいふく)');

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Medical models made clear.' })).toBeVisible();
});

test('?lang=ja makes a shareable Japanese link', async ({ page }) => {
  await page.goto('/create?lang=ja');
  await expect(page).toHaveURL(/\/create$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toHaveText('患者(かんじゃ)説明(せつめい)資料(しりょう)をつくる');
});

test('the language menu is reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: '日本語' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test('the dental development page follows the chosen language', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/development/index.html#age-12.5');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toContainText('子(こ)どもの歯(は)の育(そだ)ち方(かた)');
  await expect(page.locator('#stage')).toContainText('第二(だいに)大臼歯(だいきゅうし)');
  await expect(page.locator('#download')).toContainText('12歳(さい)ごろ');
});

test('the disclaimer is translated, with a note that the English version prevails', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/disclaimer');
  await expect(page.locator('h1')).toHaveText('免責(めんせき)事項(じこう)');
  await expect(page.locator('main')).toContainText('英語(えいご)版(ばん)が優先(ゆうせん)します');
  await page.goto('/');
  await expect(page.locator('.prototype-note')).toContainText('臨床(りんしょう)レビュー未実施(みじっし)');
});
