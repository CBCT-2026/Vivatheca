import { expect, test } from '@playwright/test';

test('production metadata uses the vivatheca.com canonical origin', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://vivatheca.com');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://vivatheca.com');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://vivatheca.com/assets/og-image.jpg');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://vivatheca.com/assets/og-image.jpg');
});

test('visitor can reach and use the featured model explanation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Medical models made clear.' })).toBeVisible();
  await expect(page.locator('.hero-title .hero-line')).toHaveText(['Medical models', 'made clear.']);
  await expect(page.getByText('Open access', { exact: true })).toBeVisible();
  await expect(page.getByText('View digitally or print', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Try the 3D viewer/ }).click();
  await expect(page.getByRole('heading', { name: 'See the explanation from every angle.' })).toBeVisible();
  await expect(page.getByText('Interactive Example', { exact: true })).toBeVisible();
  const viewer = page.locator('model-viewer');
  // React sets src as a property on the custom element, not as an attribute.
  await expect.poll(() => viewer.evaluate((element) => (element as HTMLElement & { src: string }).src)).toContain('/models/impacted-molar.glb');
  await expect(viewer).toHaveAttribute('auto-rotate', '');
  await expect(viewer).toHaveAttribute('camera-orbit', '90deg 80deg auto');

  await page.getByRole('button', { name: 'Pause rotation' }).click();
  await expect(viewer).not.toHaveAttribute('auto-rotate');
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();
  await page.getByRole('button', { name: 'Clinician detail' }).click();
  await expect(page.getByText(/mesioangularly impacted left mandibular third molar/)).toBeVisible();
  await page.getByRole('button', { name: /Save impacted wisdom tooth/ }).click();
  await expect(page.getByRole('button', { name: /Remove impacted wisdom tooth/ })).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByRole('link', { name: 'Download GLB' })).toHaveAttribute('href', '/models/impacted-molar.glb');
  await expect(page.getByRole('link', { name: /Download STL/ }).first()).toHaveAttribute('href', '/models/impacted-molar.stl');
  await expect(page.getByText('Not yet clinically reviewed.', { exact: true })).toBeVisible();
});

test('homepage navigation, evidence and contribution paths', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primaryNavigation.getByRole('link')).toHaveText(['How it works', 'Model collection', 'Evidence', 'Create', 'Students', 'About']);
  await expect(primaryNavigation.getByRole('link', { name: 'Create', exact: true })).toHaveAttribute('href', '/create');
  await expect(primaryNavigation.getByRole('link', { name: 'Model collection', exact: true })).toHaveAttribute('href', '/models');

  const origin = page.locator('.origin-band');
  await expect(origin.getByText('Founded and operated in Australia.')).toBeVisible();
  await expect(origin.getByRole('img', { name: 'Australian National Flag' })).toBeVisible();

  const publications = page.locator('#publications');
  await expect(publications.getByRole('heading', { name: 'Evidence for seeing and holding anatomy.' })).toBeVisible();
  await expect(publications.getByRole('link', { name: /Read the peer-reviewed article/ })).toHaveCount(3);
  await expect(publications.getByText('AI-generated illustration.', { exact: true })).toHaveCount(0);

  const contribute = page.locator('#contribute');
  await expect(contribute.getByRole('heading', { name: 'Help build the collection.' })).toBeVisible();
  for (const pathway of ['Report an inaccuracy', 'Join clinical review', 'Request or submit a model']) {
    await expect(contribute.getByRole('heading', { name: pathway })).toBeVisible();
  }
});

test('trust section explains transparent and privacy-preserving clinical review', async ({ page }) => {
  await page.goto('/');
  const trust = page.locator('#trust');

  await expect(trust.getByRole('heading', { name: 'Trust should be visible, not implied.' })).toBeVisible();
  await expect(trust).toContainText('peer-reviewed sources');
  await expect(trust).toContainText('title, initials, occupation and country of practice');
  await expect(trust).toContainText('change log');
  await expect(trust).toContainText('Review status today');
  await expect(trust.getByRole('link', { name: 'Report an inaccuracy' })).toHaveAttribute('href', '/report');
  await expect(trust).toContainText('peer-reviewed research, specialty society guidelines');
});

test('print section offers the STL download and sponsorship contact', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'From the screen to something you can hold.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Download both STL files/ })).toHaveAttribute('href', '/models/impacted-wisdom-tooth');
  const sponsor = page.locator('#sponsor');
  await expect(sponsor.getByRole('heading', { name: 'Help a model travel further.' })).toBeVisible();
  await expect(sponsor.getByRole('link', { name: /Start a sponsorship conversation/ })).toHaveAttribute('href', /^mailto:hello@vivatheca\.com/);
});

test('landing-page images are model screenshots, not AI illustrations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('AI-generated illustration.', { exact: true })).toHaveCount(0);
  // Real clinical images carry their own source and licence credit; other figures are model screenshots.
  const sources = await page.locator('main figure:not(.clinical-figure) img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(sources.length).toBeGreaterThan(0);
  for (const src of sources) expect(src).toMatch(/^\/assets\/renders\//);
  const visibleCopy = await page.locator('body').innerText();
  expect(visibleCopy).not.toMatch(/Vivatheca (site|service)\b/i);
});

test('model rotation starts paused when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('model-viewer')).not.toHaveAttribute('auto-rotate');
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();
});

test('landing page remains usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobileNavigation).toBeVisible();
  await expect(mobileNavigation.getByRole('link', { name: 'Create patient information' })).toHaveAttribute('href', '/create');
  await mobileNavigation.getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One model. More ways to understand.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test('footer gives visitors clear ways to explore, participate and connect', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');

  await expect(footer.getByRole('navigation', { name: 'Explore' })).toBeVisible();
  await expect(footer.getByRole('navigation', { name: 'Participate' })).toBeVisible();
  await expect(footer.getByRole('navigation', { name: 'About' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Model library' })).toHaveAttribute('href', '/models');
  await expect(footer.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', 'mailto:hello@vivatheca.com');
  await expect(footer.getByRole('link', { name: 'Privacy', exact: true }).first()).toHaveAttribute('href', '/privacy');
  await expect(footer).toContainText('Vivatheca is for general education only. It is not medical advice');
  await expect(footer.getByRole('link', { name: 'Disclaimer', exact: true })).toHaveAttribute('href', '/disclaimer');
});

test('every page ends with a contact section for Instagram, X and email', async ({ page }) => {
  for (const path of ['/', '/create', '/disclaimer', '/models', '/about']) {
    await page.goto(path);
    const contact = page.getByRole('contentinfo').getByRole('region', { name: 'Contact us' });
    await expect(contact).toBeVisible();
    await expect(contact).toContainText('Instagram');
    await expect(contact).toContainText('X');
    await expect(contact.getByRole('link', { name: 'Contact Vivatheca by Email' })).toHaveAttribute('href', 'mailto:hello@vivatheca.com');
  }
});

test('static model pages end with the contact footer', async ({ page }) => {
  for (const path of ['/head-neck/index.html', '/head-neck/scc/index.html', '/oroantral/index.html', '/orthognathic/index.html', '/periodontitis/index.html']) {
    await page.goto(path);
    const contact = page.getByRole('contentinfo').filter({ hasText: 'Contact us' });
    await expect(contact).toContainText('Instagram');
    await expect(contact.getByRole('link', { name: /hello@vivatheca\.com/ })).toHaveAttribute('href', 'mailto:hello@vivatheca.com');
  }
});
