import { expect, test } from '@playwright/test';

// schema.org JSON-LD (app/models/jsonld.ts): app and static model pages, the collection and the homepage.
async function jsonLd(page: import('@playwright/test').Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b));
}

for (const [path, mesh] of [['/models/impacted-wisdom-tooth', 'D014095'], ['/head-neck/scc/index.html', 'D000077195'], ['/oroantral/index.html', 'D009957']] as const) {
  test(`model JSON-LD on ${path}`, async ({ page }) => {
    await page.goto(path);
    const [data] = await jsonLd(page);
    expect(data['@type']).toEqual(['3DModel', 'LearningResource']);
    expect(data.license).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
    expect(data.creativeWorkStatus).toBe('Not yet clinically reviewed');
    expect(data.about.map((a: { termCode?: string }) => a.termCode)).toContain(mesh);
    expect(data.about.some((a: { identifier?: string }) => a.identifier?.startsWith('UBERON:'))).toBe(true);
  });
}

test('collection and homepage JSON-LD', async ({ page }) => {
  await page.goto('/models');
  const [list] = await jsonLd(page);
  expect(list['@type']).toBe('CollectionPage');
  expect(list.mainEntity.itemListElement.length).toBeGreaterThan(10);
  await page.goto('/');
  const [site] = await jsonLd(page);
  expect(site['@graph'][0].name).toBe('Vivatheca');
});
