import { expect, test } from '@playwright/test';

test('production metadata uses the vivatheca.com canonical origin', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://vivatheca.com');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://vivatheca.com');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://vivatheca.com/assets/consultation-hero.webp');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://vivatheca.com/assets/consultation-hero.webp');
});

test('visitor can reach and use the featured model explanation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Medical models made clear.' })).toBeVisible();
  await expect(page.getByText('The Vivatheca platform is a non-profit, open-source library for exploring, explaining, sharing and printing medical models. Browser-based access keeps the first step simple; transparent review and known limitations keep trust visible.')).toBeVisible();
  const titleBox = await page.locator('.hero-title').boundingBox();
  const ledeBox = await page.locator('.hero-lede').boundingBox();
  expect(titleBox).not.toBeNull();
  expect(ledeBox).not.toBeNull();
  expect(Math.abs((titleBox?.width ?? 0) - (ledeBox?.width ?? 0))).toBeLessThan(2);
  await expect(page.locator('.hero-title .hero-line')).toHaveCount(2);
  await expect(page.locator('.hero-title .hero-line').first()).toHaveText('Medical models');
  await expect(page.locator('.hero-title .hero-line').last()).toHaveText('made clear.');
  await expect(page.locator('.hero-lede')).toHaveCSS('text-align', 'justify');
  await expect(page.getByText('Open access', { exact: true })).toBeVisible();
  await expect(page.getByText('View digitally or print', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Explore the collection/ }).click();
  await expect(page.getByRole('heading', { name: 'See the explanation from every angle.' })).toBeVisible();
  await expect(page.getByText('Interactive Example', { exact: true })).toBeVisible();
  const viewer = page.locator('model-viewer');
  await expect(viewer).toHaveAttribute('auto-rotate', '');
  await expect(viewer).toHaveAttribute('camera-orbit', '8deg 78deg 74%');
  await expect(viewer).not.toHaveAttribute('poster');
  expect(Number.parseFloat(await page.locator('.model-copy h3').evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(28);
  await page.getByRole('button', { name: 'Pause rotation' }).click();
  await expect(viewer).not.toHaveAttribute('auto-rotate');
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();
  await page.getByRole('button', { name: 'Clinician detail' }).click();
  await expect(page.getByText(/mesioangularly impacted mandibular third molar/)).toBeVisible();
  await page.getByRole('button', { name: /Save impacted wisdom tooth/ }).click();
  await expect(page.getByRole('button', { name: /Remove impacted wisdom tooth/ })).toHaveAttribute('aria-pressed', 'true');
});

test('homepage presents peer-reviewed evidence and five contribution paths', async ({ page }) => {
  await page.setViewportSize({ width: 1190, height: 912 });
  await page.goto('/');

  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primaryNavigation.getByRole('link', { name: 'Publications' })).toBeVisible();
  await expect(primaryNavigation.getByRole('link', { name: 'About' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Choose language' })).toBeDisabled();
  await expect(page.getByText('Additional languages are not yet available.', { exact: true })).toHaveClass(/visually-hidden/);

  const origin = page.locator('.origin-band');
  await expect(origin.getByText('Founded and operated in Australia.')).toBeVisible();
  await expect(origin.getByRole('img', { name: 'Australian National Flag' })).toBeVisible();
  const originBox = await origin.boundingBox();
  const originCopyBox = await origin.getByText('Founded and operated in Australia.').boundingBox();
  expect(originCopyBox?.x ?? Infinity).toBeLessThan((originBox?.width ?? 0) / 2);
  expect(await origin.getByRole('img', { name: 'Australian National Flag' }).evaluate((image) => image.getBoundingClientRect().width)).toBeGreaterThanOrEqual(52);
  expect(Number.parseFloat(await origin.getByText('Founded and operated in Australia.').evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);

  expect(Number.parseFloat(await page.locator('.mission-band > p').evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(17);
  expect(Number.parseFloat(await primaryNavigation.getByRole('link').first().evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);

  const publications = page.locator('#publications');
  await expect(publications.getByRole('heading', { name: 'Evidence for seeing and holding anatomy.' })).toBeVisible();
  await expect(publications.getByText(/Independent, peer-reviewed research/)).toBeVisible();
  await expect(publications.getByRole('link', { name: /Read the peer-reviewed article/ })).toHaveCount(3);
  await expect(publications.locator('.publication-visual > img')).toHaveCount(3);
  await expect(publications.getByText('AI-generated illustration.', { exact: true })).toHaveCount(3);

  await expect(page.locator('#about')).toHaveCount(0);

  const contribute = page.locator('#contribute');
  await expect(contribute.getByRole('heading', { name: 'Five ways to move a model forward.' })).toBeVisible();
  for (const pathway of ['Submit a model', 'Donate a printed model', 'Donate 3D printing resources', 'Review clinical accuracy', 'Translate health content']) {
    await expect(contribute.getByRole('heading', { name: pathway })).toBeVisible();
  }
  await expect(contribute.getByRole('img', { name: /experienced clinicians, biomedical engineers, model creators and translators/i })).toBeVisible();
  const languages = contribute.getByRole('group', { name: 'Initial translation aims' });
  const expectedLanguages = [
    'Arabic العربية',
    'Bengali বাংলা',
    'Cantonese Chinese 粵語',
    'Dutch Nederlands',
    'English English',
    'Farsi فارسی',
    'French Français',
    'German Deutsch',
    'Hindi हिन्दी',
    'Italian Italiano',
    'Japanese 日本語',
    'Javanese Basa Jawa',
    'Korean 한국어',
    'Mandarin Chinese 普通话',
    'Portuguese Português',
    'Punjabi پنجابی',
    'Russian Русский',
    'Spanish Español',
    'Swahili Kiswahili',
    'Tamil தமிழ்',
    'Telugu తెలుగు',
    'Turkish Türkçe',
    'Urdu اردو',
    'Vietnamese Tiếng Việt',
  ];
  for (const language of expectedLanguages) {
    await expect(languages.getByRole('listitem', { name: language })).toBeVisible();
  }
  await expect(languages.locator('li')).toHaveCount(24);
  await expect(languages.locator('.language-name')).toHaveText(expectedLanguages.map((language) => language.split(' ').slice(0, language.startsWith('Cantonese') || language.startsWith('Mandarin') ? 2 : 1).join(' ')));
  await expect(languages.locator('.language-flag')).toHaveCount(24);
  await expect(languages.locator('.language-flag').nth(3)).toHaveAttribute('src', '/flags/nl.svg');
  expect((await languages.locator('ul').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length))).toBe(4);
  expect((await languages.boundingBox())?.height ?? Infinity).toBeLessThan(760);
});

test('trust section explains transparent and privacy-preserving clinical review', async ({ page }) => {
  await page.setViewportSize({ width: 2092, height: 1361 });
  await page.goto('/');
  const trust = page.locator('#trust');

  await expect(trust).toContainText('approved, rejected or awaiting clinical review');
  await expect(trust).toContainText('model rating');
  await expect(trust).toContainText('recommended for review by clinicians');
  await expect(trust).toContainText('verified privately');
  await expect(trust).toContainText('title, initials, occupation and country of practice');
  await expect(trust).toContainText('not asked to provide medical or health advice');
  await expect(trust).toContainText('approve or reject whether the model reflects the named condition or procedure well enough for patient education');
  await expect(trust).toContainText('appropriately licensed public government health-service information');
  await expect(trust).toContainText('where to access further information');
  const example = trust.getByRole('group', { name: 'Illustrative impacted molar clinical review record' });
  await expect(example.getByText('Illustrative prototype data', { exact: true })).toBeVisible();
  await expect(example.getByText('Dr AB, Oral & Maxillofacial Surgeon, Australia', { exact: true })).toBeVisible();
  await expect(example.getByText('Most recent review', { exact: true })).toBeVisible();
  await expect(example.getByText('Approved', { exact: true })).toBeVisible();
  await expect(example.getByText('23 reviews', { exact: true })).toBeVisible();
  await expect(example.getByText('96% approval', { exact: true })).toBeVisible();
  await expect(example.getByText('1 negative review', { exact: true })).toBeVisible();
  await expect(example.getByText('+19 other reviewers', { exact: true })).toBeVisible();
  await expect(example.getByRole('img', { name: /impacted lower wisdom tooth model with the left inferior alveolar nerve in a clinical review interface/i })).toHaveAttribute('src', '/assets/impacted-molar-review-interface-v2.png');
  const reviewBox = await example.boundingBox();
  expect(reviewBox?.width ?? Infinity).toBeLessThanOrEqual(1280);
  expect(reviewBox?.height ?? Infinity).toBeLessThan(900);
});

test('sponsorship map labels demonstration data and exposes live-ready controls', async ({ page }) => {
  await page.goto('/');
  const sponsor = page.locator('#sponsor');

  await expect(sponsor.getByText('Illustrative prototype data — not verified delivery records.')).toBeVisible();
  await expect(sponsor.getByRole('img', { name: 'Detailed world map beneath demonstration model deliveries and collaborator locations' })).toHaveAttribute('src', '/assets/global-access-map.png');
  await expect(sponsor.getByText('18', { exact: true })).toBeVisible();
  await expect(sponsor.getByText('Kenya · 7', { exact: true })).toBeVisible();
  await expect(sponsor.getByText('Model deliveries: Nairobi, Kathmandu and Lima')).toBeVisible();
  for (const role of ['Creators', 'Donors', 'Reviewers', 'Translators']) {
    await expect(sponsor.getByText(role, { exact: true })).toBeVisible();
  }

  await expect(sponsor.getByText('Community hospital demonstration — Nairobi')).toBeVisible();
  await sponsor.getByRole('button', { name: 'Show next demonstration update' }).click();
  await expect(sponsor.getByText('Regional clinic demonstration — Kathmandu')).toBeVisible();
  await expect(sponsor.getByRole('button', { name: 'Pause demonstration updates' })).toBeVisible();
  await expect(sponsor.getByRole('heading', { name: 'Sustainability for physical models.' })).toBeVisible();
  await expect(sponsor.getByRole('img', { name: /sorting retired anatomical teaching prints/i })).toHaveAttribute('src', '/assets/sustainable-printing.png');
  await expect(sponsor).toContainText('supports, prime towers, purge material and empty filament spools');
  await expect(sponsor).toContainText('Exploratory commitment');
  const sustainabilityLeadBox = await sponsor.locator('.sustainability-lead').boundingBox();
  const sustainabilityCopyBox = await sponsor.locator('.sustainability-copy').boundingBox();
  expect(sustainabilityLeadBox).not.toBeNull();
  expect(sustainabilityCopyBox).not.toBeNull();
  expect(sustainabilityCopyBox?.height ?? 0).toBeGreaterThanOrEqual((sustainabilityLeadBox?.height ?? 0) * 0.9);
});

test('generated landing-page illustrations carry visible disclosure and platform terminology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('AI-generated illustration.', { exact: true })).toHaveCount(9);
  const visibleCopy = await page.locator('body').innerText();
  expect(visibleCopy).not.toMatch(/Vivatheca (site|service)\b/i);
});

test('model rotation starts paused when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('model-viewer')).not.toHaveAttribute('auto-rotate');
  await expect(page.getByRole('button', { name: 'Resume rotation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Automatic updates paused for reduced motion' })).toBeDisabled();
});

test('landing page remains usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobileNavigation).toBeVisible();
  await mobileNavigation.getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One model. More ways to understand.' })).toBeVisible();
  expect((await page.locator('.language-aims ul').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length))).toBe(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test('footer gives visitors clear ways to explore, participate and connect', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');

  await expect(footer.getByRole('navigation', { name: 'Explore' })).toBeVisible();
  await expect(footer.getByRole('navigation', { name: 'Participate' })).toBeVisible();
  await expect(footer.getByRole('navigation', { name: 'Connect' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Browse the featured model' })).toHaveAttribute('href', '#collection');
  await expect(footer.getByRole('link', { name: 'Contact Vivatheca' })).toHaveAttribute('href', 'mailto:hello@vivatheca.com');
  await expect(footer.getByText('Instagram', { exact: true })).toBeVisible();
  await expect(footer.getByText('Facebook', { exact: true })).toBeVisible();
  await expect(footer.locator('.social-badge[aria-disabled="true"]')).toHaveCount(2);
  await expect(footer.getByText('Verified profile links pending.', { exact: true })).toBeVisible();
  await expect(footer.locator('.social-badge img[src="/icons/instagram.svg"]')).toHaveCount(1);
  await expect(footer.locator('.social-badge img[src="/icons/facebook.svg"]')).toHaveCount(1);

  await footer.getByText('Featured clinical disciplines', { exact: true }).click();
  await expect(footer.getByRole('list', { name: 'Clinical disciplines' }).getByRole('link')).toHaveText([
    'Cardiology',
    'Dentistry',
    'Ear, Nose and Throat Surgery',
    'Ophthalmology',
    'Oral and Maxillofacial Surgery',
    'Orthopaedics',
  ]);
  await expect(footer).toContainText('Educational information only—not a substitute for professional medical advice.');
});
