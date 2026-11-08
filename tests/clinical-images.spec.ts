import { expect, test } from '@playwright/test';

// Every real clinical image must show its source and licence next to it (docs/image-licensing.md).
const pages = ['/', '/periodontitis/index.html', '/oroantral/index.html', '/orthognathic/index.html', '/development/index.html', '/cracked-tooth/index.html', '/head-neck/scc/index.html', '/head-neck/ameloblastoma/index.html', '/head-neck/okc/index.html', '/head-neck/mec/index.html', '/ectopic-canine/index.html', '/dentigerous-cyst/index.html', '/prosthodontic/index.html', '/stainless-steel-crown/index.html', '/vpi/index.html', '/tmd/index.html', '/endodontic/index.html'];
const licence = /creativecommons\.org\/(licenses|publicdomain)\//;

for (const path of pages) {
  test(`clinical images on ${path} load and carry a credit and licence`, async ({ page }) => {
    await page.goto(path);
    // Surgical photos sit behind a click-to-show warning; open them so their images load.
    await page.locator('details.surgical').evaluateAll((items) => items.forEach((d) => d.setAttribute('open', '')));
    const figures = page.locator('figure.clin-fig, figure.clinical-figure');
    const count = await figures.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const figure = figures.nth(i);
      const img = figure.locator('img');
      await expect(img).toHaveAttribute('alt', /.{20,}/);
      const credit = figure.locator('.credit, .clinical-credit');
      await expect(credit).toHaveCount(1);
      await expect(credit).toContainText(/Changes/);
      const hrefs = await credit.locator('a').evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
      expect(hrefs.some((href) => licence.test(href))).toBe(true);
      const loaded = await img.evaluate(async (el: HTMLImageElement) => {
        el.loading = 'eager';
        if (!el.complete) await new Promise((resolve) => { el.onload = el.onerror = resolve; });
        return el.naturalWidth > 0;
      });
      expect(loaded).toBe(true);
    }
  });
}
