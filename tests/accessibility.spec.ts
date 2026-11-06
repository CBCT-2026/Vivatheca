import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Automatic WCAG 2.1 A/AA check (axe-core) of the main page types, in English and Japanese,
// light and dark. axe finds only part of what a manual audit would, so a pass here is a floor,
// not proof. 3D canvases are skipped (axe cannot read WebGL content).

const pages = [
  '/',
  '/models',
  '/learn',
  '/about',
  '/disclaimer',
  '/contribute',
  '/report',
  '/create',
  '/models/impacted-wisdom-tooth',
  '/models/alveolar-bone-graft',
  '/periodontitis/index.html',
  '/development/index.html',
  '/head-neck/index.html',
  '/head-neck/scc/index.html',
  '/orthognathic/index.html',
  '/fixation/index.html',
  '/learn/periodontitis',
  '/learn/slices',
];

const variants: { name: string; lang: 'en' | 'ja'; theme: 'light' | 'dark' }[] = [
  { name: 'English light', lang: 'en', theme: 'light' },
  { name: 'Japanese dark', lang: 'ja', theme: 'dark' },
];

for (const variant of variants) {
  test.describe(`axe: ${variant.name}`, () => {
    test.use({ locale: variant.lang === 'ja' ? 'ja-JP' : 'en-AU' });
    for (const url of pages) {
      test(url, async ({ page, context }) => {
        await context.addCookies([{ name: 'vivatheca-lang', value: variant.lang, url: 'http://127.0.0.1:3000' }]);
        await page.addInitScript((theme) => { localStorage.setItem('vivatheca-theme', theme); }, variant.theme);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('canvas')
          .exclude('model-viewer')
          .analyze();
        const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`).join('\n');
        expect(results.violations, summary).toEqual([]);
      });
    }
  });
}
