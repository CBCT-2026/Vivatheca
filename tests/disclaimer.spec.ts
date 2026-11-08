import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { modelDisclaimer } from '../app/disclaimer-text';

test('every print download carries the review status, model disclaimer and licence', () => {
  const zips = readdirSync('public', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      try {
        return readdirSync(join('public', d.name, 'downloads')).filter((f) => f.endsWith('.zip')).map((f) => join('public', d.name, 'downloads', f));
      } catch {
        return [];
      }
    });
  expect(zips.length).toBeGreaterThan(0);
  for (const zip of zips) {
    const notes = execFileSync('unzip', ['-p', zip, '*.txt']).toString().replace(/\s+/g, ' ');
    expect(notes, zip).toContain('Not yet clinically reviewed');
    expect(notes, zip).toContain(modelDisclaimer);
    expect(notes, zip).toContain('vivatheca.com/disclaimer');
    // BodyParts3D-based models are CC BY 4.0 (with the BodyParts3D credit); the rest CC BY-SA 4.0.
    expect(notes, zip).toMatch(/CC BY-SA 4\.0|CC BY 4\.0[\s\S]*BodyParts3D/);
  }
});

test('disclaimer page and links are present on every main route', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-legal').getByText(/not medical advice/)).toBeVisible();
  // The interactive model and the show-a-patient picker each show the review status and model disclaimer.
  for (const section of ['#collection', '#quick-show']) {
    await expect(page.locator(`${section} .prototype-note`).getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
  }

  await page.goto('/development/index.html');
  await expect(page.locator('.disclaimer').getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');

  await page.goto('/disclaimer');
  await expect(page.getByRole('heading', { name: 'Disclaimer', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Not for clinical use' })).toBeVisible();
  await expect(page.getByText(/Australian Consumer Law/)).toBeVisible();
});
