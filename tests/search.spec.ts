import { expect, test } from '@playwright/test';

// Site search (Pagefind index in public/pagefind, built by tools/search/build-index.mjs).
test('search finds the SCC case page in English and Japanese', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Search' }).first().click();
  await expect(page).toHaveURL(/\/search$/);
  const input = page.getByRole('searchbox').or(page.locator('.search-ui input'));
  await input.first().fill('verrucous leukoplakia');
  const results = page.locator('.pagefind-ui__result');
  await expect(results.first()).toBeVisible();
  await expect(page.locator('.pagefind-ui__result-link[href="/head-neck/scc/"]').first()).toBeVisible();

  await context.addCookies([{ name: 'vivatheca-lang', value: 'ja', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/search');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page.locator('.search-ui input').first().fill('白板症');
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
  await expect(page.locator('.pagefind-ui__result-link[href="/head-neck/scc/?lang=ja"]').first()).toBeVisible();
});

test('static pages have the search link in the top bar', async ({ page }) => {
  await page.goto('/periodontitis/index.html');
  await expect(page.locator('header .search-link')).toHaveAttribute('href', '/search');
});
