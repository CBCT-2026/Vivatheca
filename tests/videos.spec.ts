import { expect, test } from '@playwright/test';
import { catalogue } from '../app/models/catalogue';
import { videos } from '../app/videos';

// Every model in the collection has a narrated video of at most 45 seconds (tools/video),
// shown on its page with the review status, the model disclaimer and the video's sources.
test('every model in the collection has a video of 45 seconds or less', () => {
  for (const model of catalogue) {
    const v = videos[model.slug];
    expect(v, model.slug).toBeTruthy();
    for (const lang of ['en', 'ja'] as const) {
      expect(v[lang].seconds, `${model.slug} ${lang}`).toBeLessThanOrEqual(45);
      expect(v[lang].lines.length).toBeGreaterThan(0);
      for (const line of v[lang].lines) for (const n of line.cite) expect(n).toBeLessThanOrEqual(v.sources.length);
    }
  }
});

test('the collection marks each model with a video and links to it', async ({ page }) => {
  await page.goto('/models');
  await expect(page.locator('.library-video-badge')).toHaveCount(catalogue.length);
  const links = page.locator('.library-video-link');
  await expect(links).toHaveCount(catalogue.length);
  await expect(links.first()).toHaveAttribute('href', /#video$/);
});

for (const model of catalogue) {
  test(`${model.slug} page shows its video with disclaimer and sources`, async ({ page }) => {
    await page.goto(`${model.href}#video`);
    const box = page.locator('#video');
    await expect(box).toBeVisible();
    const video = box.locator('video');
    await expect(video).toHaveCount(1);
    const src = await video.locator('source').getAttribute('src');
    expect(src).toBe(`/videos/${model.slug}/${model.slug}-en.mp4`);
    expect((await page.request.head(src!)).status()).toBe(200);
    expect((await page.request.get(await video.locator('track').getAttribute('src') as string)).status()).toBe(200);
    await expect(box).toContainText('Not yet clinically reviewed.');
    await expect(box).toContainText('Not for diagnosis, treatment planning, surgical guides or use in or on the body.');
    await expect(box.getByRole('link', { name: 'Full disclaimer' })).toHaveAttribute('href', '/disclaimer');
    await expect(box.locator('li[id^="vsrc-"]')).toHaveCount(videos[model.slug].sources.length);
  });
}
