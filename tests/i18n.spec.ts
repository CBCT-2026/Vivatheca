import { expect, test } from '@playwright/test';
import { chooseLanguage, languageButton } from './language';


// textContent includes each reading as 漢字(かんじ), from the <rp> fallback brackets.
test('the site opens in English and switches to Japanese with furigana', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await chooseLanguage(page, '日本語');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page).toHaveTitle(/臨床模型をわかりやすく/);
  // Kanji carry readings as ruby; the readings are hidden from assistive technology.
  const ruby = page.locator('.hero-title ruby').first();
  await expect(ruby.locator('rt')).toHaveText('りんしょう');
  await expect(ruby.locator('rt')).toHaveAttribute('aria-hidden', 'true');
  await expect(ruby.locator('rt')).toBeVisible();

  // Furigana can be hidden, and the choice persists.
  await page.getByRole('button', { name: 'ふりがな' }).click();
  await expect(ruby.locator('rt')).toBeHidden();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-furigana', 'off');

  // The clinical tour uses Japanese dental terms.
  // Retry until the page has hydrated after the reload.
  const clinician = page.locator('.model-copy .segmented:not(.segmented-stages) button').nth(1);
  await expect(async () => {
    await clinician.click();
    await expect(clinician).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
  }).toPass();
  await expect(page.locator('.model-copy')).toContainText('左側(ひだりがわ)片側性(へんそくせい)顎裂(がくれつ)');

  await chooseLanguage(page, 'English');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Clinical models made clear.' })).toBeVisible();
});

test('the language switch lists four languages with flags; Chinese is coming soon', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about');
  await expect(languageButton(page)).toHaveAccessibleName('Language: English');
  await languageButton(page).click();
  const langs = page.locator('header .lang-panel button');
  await expect(langs.locator('.lang-name')).toHaveText(['中文', 'English', '日本語', 'Tiếng Việt']);
  await expect(langs.locator('img.lang-flag')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Tiếng Việt', exact: true })).not.toHaveAttribute('aria-disabled', 'true');
  const zh = page.getByRole('button', { name: '中文 Coming soon' });
  await expect(zh).toHaveAttribute('aria-disabled', 'true');
  await zh.click({ force: true }); // does nothing: not translated yet
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.keyboard.press('Escape');
  await expect(page.locator('header .lang-panel')).toBeHidden();
});

test('?lang=ja makes a shareable Japanese link', async ({ page }) => {
  await page.goto('/create?lang=ja');
  await expect(page).toHaveURL(/\/create$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toHaveText('患者(かんじゃ)説明(せつめい)資料(しりょう)をつくる');
});

test('language and theme switches stay in the top bar on phones', async ({ page, context }) => {
  for (const path of ['/', '/create', '/disclaimer', '/models', '/about', '/report']) {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(path);
    const header = page.locator('header.site-header');
    await expect(languageButton(page)).toBeVisible();
    await expect(header.locator('.theme-toggle')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  }
  await page.goto('/');
  await chooseLanguage(page, '日本語');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(languageButton(page)).toHaveAccessibleName('言語: 日本語');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  // The furigana switch moves into the menu on phones.
  await page.locator('.mobile-nav .icon-button').click();
  await expect(page.locator('.mobile-nav-panel .furigana-toggle')).toBeVisible();
});

test('the dental development page follows the chosen language', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/development/index.html#age-12.5');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toContainText('混合(こんごう)歯列(しれつ)期(き)');
  await expect(page.locator('#stage')).toContainText('第二(だいに)大臼歯(だいきゅうし)');
  await expect(page.locator('#download')).toContainText('12歳(さい)ごろ');
});

test('the disclaimer is translated, with a note that the English version prevails', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/disclaimer');
  await expect(page.locator('h1')).toHaveText('免責(めんせき)事項(じこう)');
  await expect(page.locator('main')).toContainText('英語(えいご)版(ばん)が優先(ゆうせん)します');
  await page.goto('/');
  await expect(page.locator('#quick-show .prototype-note')).toContainText('臨床(りんしょう)レビュー未実施(みじっし)');
});

test('model library, model page, About, Privacy and Report are translated', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const [route, heading] of [
    ['/models?lang=ja', '正常と比べられる模型'],
    ['/models/impacted-wisdom-tooth?lang=ja', '下顎第三大臼歯の近心傾斜埋伏'],
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

test('sub-page headers fit a phone in Japanese', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of ['/about', '/models', '/create', '/privacy']) {
    await page.goto(path);
    await expect(page.locator('header.site-header .theme-toggle')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  }
});

test('orthognathic and periodontitis pages switch to Japanese with furigana', async ({ page, context }) => {
  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  for (const [path, h1] of [['/orthognathic/index.html', '顎矯正'], ['/periodontitis/index.html', '歯周炎']]) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('h1')).toContainText(h1);
    await expect(page.locator('h1 rt').first()).toBeAttached();
    await expect(languageButton(page)).toBeVisible();
    await expect(page.locator('#stage')).toContainText(/[ぁ-ん]/);
  }
});

test('Japanese pages say the translation is not yet reviewed; English pages do not', async ({ page, context }) => {
  await page.goto('/models');
  await expect(page.locator('.footer-legal')).not.toContainText('日本語');
  await page.goto('/oroantral/index.html');
  await expect(page.locator('.vt-translation-note[lang="ja"]')).toBeHidden();

  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/models');
  await expect(page.locator('.footer-legal .disclaimer')).toContainText('確認');
  await page.goto('/oroantral/index.html');
  await expect(page.locator('.vt-translation-note[lang="ja"]')).toBeVisible();
  // The model disclaimer shows in Japanese only.
  await expect(page.getByText('Educational model only.').first()).toBeHidden();
});

// A first-time visitor whose browser asks for English (here New Zealand) must get English on every
// kind of page, even straight after someone else on the same server chose Japanese: the language
// comes only from the visitor's own cookie, and pages are never stored in a shared cache.
test('a first-time English-speaking visitor always gets English', async ({ browser, baseURL }) => {
  const japanese = await browser.newContext({ locale: 'ja-JP' });
  await japanese.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: baseURL! }]);
  const jaPage = await japanese.newPage();
  await jaPage.goto('/');
  await expect(jaPage.locator('html')).toHaveAttribute('lang', 'ja');
  await japanese.close();

  const fresh = await browser.newContext({ locale: 'en-NZ', timezoneId: 'Pacific/Auckland', extraHTTPHeaders: { 'Accept-Language': 'en-NZ,en;q=0.9' } });
  const page = await fresh.newPage();
  // Server-rendered pages: English, and marked so no shared cache keeps a copy.
  for (const path of ['/', '/models', '/show', '/disclaimer']) {
    const response = await page.goto(path);
    await expect(page.locator('html'), path).toHaveAttribute('lang', 'en');
    expect(response?.headers()['cache-control'], path).toContain('no-store');
  }
  // Static model pages (translated in the browser from the same cookie).
  for (const path of ['/development/', '/head-neck/', '/oroantral/']) {
    await page.goto(path);
    await expect(page.locator('html'), path).toHaveAttribute('lang', 'en');
  }
  expect(await fresh.cookies()).toEqual([]);
  await fresh.close();
});
