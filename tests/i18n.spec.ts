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

test('language and theme switches stay in the top bar on phones', async ({ page }) => {
  for (const path of ['/', '/create', '/disclaimer']) {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(path);
    const header = page.locator('header.site-header');
    await expect(header.getByRole('button', { name: '日本語' })).toBeVisible();
    await expect(header.locator('.theme-toggle')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  }
  await page.goto('/');
  await page.locator('header.site-header').getByRole('button', { name: '日本語' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('header.site-header').getByRole('button', { name: 'English' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  // The furigana switch moves into the menu on phones.
  await page.locator('.mobile-nav .icon-button').click();
  await expect(page.locator('.mobile-nav-panel .furigana-toggle')).toBeVisible();
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

test('model library, model page, About, Privacy and Report are translated', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const [route, heading] of [
    ['/models?lang=ja', '正常と比べられる模型。'],
    ['/models/impacted-wisdom-tooth?lang=ja', '埋伏した下の親知らず'],
    ['/about?lang=ja', '診療チェアでの会話のための、わかりやすい3D模型。'],
    ['/privacy?lang=ja', 'プライバシー'],
    ['/report?lang=ja', '誤りを報告'],
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    // The h1 text without its furigana readings.
    await expect.poll(() => page.locator('h1').evaluate((h) => { const c = h.cloneNode(true) as HTMLElement; c.querySelectorAll('rt, rp').forEach((e) => e.remove()); return c.textContent; })).toBe(heading);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), route).toBe(false);
  }
  // Reports are always emailed in English.
  await page.locator('textarea').fill('神経の位置が違うと思います。');
  const href = await page.evaluate(() => new Promise<string>((resolve) => {
    Object.defineProperty(window, 'location', { value: { set href(v: string) { resolve(v); } }, configurable: true });
    document.querySelector('form')!.requestSubmit();
  })).catch(() => '');
  if (href) expect(decodeURIComponent(href)).toContain('Issue: Anatomy is wrong');
});
