import { existsSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Model picture checks: one fixed view of every model in the collection. CI takes these pictures on
// the base branch, then on the pull request, on the same machine, and fails if a model changed
// (shape, colour, missing part). See .github/workflows/model-pictures.yml and
// playwright.pictures.config.ts. A failure is not always a bug: if the change was meant, say so in
// the PR and attach the new picture from the CI artifacts.

type Shot = { name: string; path: string; kind: 'model-viewer' | 'three' };

const SHOTS: Shot[] = [
  { name: 'impacted-wisdom-tooth', path: '/models/impacted-wisdom-tooth', kind: 'model-viewer' },
  { name: 'alveolar-bone-graft', path: '/models/alveolar-bone-graft', kind: 'model-viewer' },
  { name: 'dental-development', path: '/development/index.html', kind: 'model-viewer' },
  { name: 'periodontitis', path: '/periodontitis/index.html', kind: 'model-viewer' },
  { name: 'oroantral', path: '/oroantral/index.html', kind: 'model-viewer' },
  { name: 'cracked-tooth', path: '/cracked-tooth/index.html', kind: 'model-viewer' },
  { name: 'endodontic', path: '/endodontic/index.html', kind: 'model-viewer' },
  { name: 'vpi', path: '/vpi/index.html', kind: 'model-viewer' },
  { name: 'prosthodontic', path: '/prosthodontic/index.html', kind: 'model-viewer' },
  { name: 'tmd', path: '/tmd/index.html', kind: 'model-viewer' },
  { name: 'ectopic-canine', path: '/ectopic-canine/index.html', kind: 'model-viewer' },
  { name: 'dentigerous-cyst', path: '/dentigerous-cyst/index.html', kind: 'model-viewer' },
  { name: 'stainless-steel-crown', path: '/stainless-steel-crown/index.html', kind: 'model-viewer' },
  { name: 'orthognathic', path: '/orthognathic/index.html', kind: 'model-viewer' },
  { name: 'head-neck-scc', path: '/head-neck/scc/index.html', kind: 'three' },
  { name: 'head-neck-ameloblastoma', path: '/head-neck/ameloblastoma/index.html', kind: 'three' },
  { name: 'head-neck-okc', path: '/head-neck/okc/index.html', kind: 'three' },
  { name: 'head-neck-mec', path: '/head-neck/mec/index.html', kind: 'three' },
];

async function steadyModelViewer(page: Page) {
  await page.waitForFunction(() => {
    const all = [...document.querySelectorAll('model-viewer')] as (HTMLElement & { loaded?: boolean })[];
    return all.length > 0 && all.every((m) => m.loaded);
  }, null, { timeout: 90_000 });
  // Stop motion so every run sees the same frame.
  await page.evaluate(() => {
    for (const m of document.querySelectorAll('model-viewer') as NodeListOf<HTMLElement & { jumpCameraToGoal?: () => void; pause?: () => void; currentTime?: number }>) {
      m.removeAttribute('auto-rotate');
      m.setAttribute('interaction-prompt', 'none');
      m.pause?.();
      if ('currentTime' in m) m.currentTime = 0;
      m.jumpCameraToGoal?.();
    }
  });
}

for (const shot of SHOTS) {
  test(shot.name, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    const res = await page.goto(shot.path, { waitUntil: 'load' });
    // A model added by this PR has no page on the base branch, so there is no "before" picture.
    test.skip(!res?.ok(), `${shot.path} is not on this branch (new model)`);
    test.skip(testInfo.config.updateSnapshots !== 'all' && !existsSync(testInfo.snapshotPath(`${shot.name}.png`)), 'no base-branch picture to compare (new model)');
    let target;
    if (shot.kind === 'model-viewer') {
      await steadyModelViewer(page);
      target = page.locator('model-viewer').first();
    } else {
      await page.waitForFunction(() => {
        const box = document.querySelector('.viewer') as (HTMLElement & { vtParts?: unknown }) | null;
        return !!box?.vtParts;
      }, null, { timeout: 90_000 });
      target = page.locator('.viewer canvas').first();
    }
    // Pin the viewer to one fixed size, so a page layout change (a wider text column, a different
    // breakpoint) does not read as a model change. The check is about the model, not the page.
    const box = shot.kind === 'model-viewer' ? target : page.locator('.viewer').first();
    await box.evaluate((el: HTMLElement) => {
      Object.assign(el.style, { width: '960px', height: '600px', maxWidth: 'none', maxHeight: 'none', minHeight: '0', marginLeft: '0' });
    });
    // Hide everything drawn over or beside the model (labels, buttons, a side panel), so page text and
    // layout changes don't count either. Only the model itself and its background stay visible.
    await box.evaluate((keep: HTMLElement) => {
      const style = document.createElement('style');
      style.textContent = '[data-pictures-hide]{visibility:hidden!important}';
      document.head.append(style);
      for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
        if (el === keep || el.contains(keep) || (keep.contains(el) && el.tagName === 'CANVAS')) continue;
        el.setAttribute('data-pictures-hide', '');
      }
      keep.setAttribute('data-pictures-keep', '');
      style.textContent += '[data-pictures-keep]{visibility:visible!important}[data-pictures-keep] [data-pictures-hide]{visibility:hidden!important}';
    });
    await page.waitForTimeout(500);
    await target.scrollIntoViewIfNeeded();
    // Snap the model to whole pixels. Text above it (a longer title, an extra line) can leave it at a
    // fractional offset, which shifts every edge by part of a pixel and reads as a model change.
    await target.evaluate((el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${Math.round(r.left) - r.left}px, ${Math.round(r.top) - r.top}px)`;
    });
    await page.waitForTimeout(1500);
    await expect(target).toHaveScreenshot(`${shot.name}.png`);
  });
}
