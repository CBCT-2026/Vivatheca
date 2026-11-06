import { expect, test } from '@playwright/test';

test('production metadata uses the vivatheca.com canonical origin', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://vivatheca.com');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://vivatheca.com');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://vivatheca.com/assets/og-image.jpg');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://vivatheca.com/assets/og-image.jpg');
});

test('visitor can reach and use the featured model explanation', async ({ page }) => {
  // Three Draco models render in software WebGL here, which is slow on CI machines.
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Clinical models made clear.' })).toBeVisible();
  await expect(page.locator('.hero-title .hero-line')).toHaveText(['Clinical models', 'made clear.']);
  await expect(page.getByText('Open access', { exact: true })).toBeVisible();
  await expect(page.getByText('View digitally or print', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Try the 3D viewer/ }).click();
  await expect(page.getByRole('heading', { name: 'See the explanation from every angle.' })).toBeVisible();
  await expect(page.getByText('Interactive Example', { exact: true })).toBeVisible();
  const viewer = page.locator('model-viewer');
  // The interactive section shows the alveolar bone graft series; React sets src as a property, not an attribute.
  const src = () => viewer.evaluate((element) => (element as HTMLElement & { src: string }).src);
  await expect.poll(src).toContain('/models/abg/abg-1-pre-op.glb');
  // Reduced motion (set below) keeps the model still: continuous rotation in software WebGL starves the page on CI.
  await expect(viewer).not.toHaveAttribute('auto-rotate');
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();

  // The gum part comes off once the Draco model has loaded from this site.
  await page.getByRole('button', { name: 'Take off the gum' }).click();
  await expect(page.getByRole('button', { name: 'Put the gum back' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Clinician detail' }).click();
  await expect(page.getByText(/^Left unilateral alveolar cleft in the mixed dentition/)).toBeVisible();
  await page.getByText('Sources and how this model was made').click();
  await expect(page.locator('#model-ref-10')).toContainText('Kokich');
  await expect(page.locator('#collection').getByText('Not yet clinically reviewed.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'After the graft' }).click();
  await expect.poll(src).toContain('/models/abg/abg-2-during-braces.glb');
  await page.getByRole('button', { name: 'Years later' }).click();
  await expect.poll(src).toContain('/models/abg/abg-3b-substitution.glb');
  await expect(page.getByText(/^Late adolescence after orthodontic space closure with canine substitution/)).toBeVisible();

  // The wisdom tooth stays the hero; a mix of other models, including dental development, follows.
  await expect(page.locator('.hero-visual img')).toHaveAttribute('src', '/assets/renders/wisdom-tooth-hero.webp');
  const showcase = page.locator('#showcase');
  await expect(showcase.getByRole('link', { name: /Dental development, ages 6 to 12/ })).toHaveAttribute('href', '/development/');
  await expect(showcase.locator('.library-card')).toHaveCount(6);
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
  await expect(sponsor.getByRole('link', { name: /Start a sponsorship conversation/ })).toHaveAttribute('href', /^mailto:vivatheca@gmail\.com/);
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
  await expect(mobileNavigation.getByRole('link', { name: 'Create', exact: true })).toHaveAttribute('href', '/create');
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
  await expect(footer.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', 'mailto:vivatheca@gmail.com');
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
    await expect(contact.getByRole('link', { name: 'Contact Vivatheca by Email' })).toHaveAttribute('href', 'mailto:vivatheca@gmail.com');
  }
});

test('static model pages end with the contact footer', async ({ page }) => {
  for (const path of ['/head-neck/index.html', '/head-neck/scc/index.html', '/oroantral/index.html', '/orthognathic/index.html', '/periodontitis/index.html']) {
    await page.goto(path);
    const contact = page.getByRole('contentinfo').filter({ hasText: 'Contact us' });
    await expect(contact).toContainText('Instagram');
    await expect(contact.getByRole('link', { name: /vivatheca@gmail\.com/ })).toHaveAttribute('href', 'mailto:vivatheca@gmail.com');
  }
});
