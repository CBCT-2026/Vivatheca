// Render one model video: frames with Chromium (three.js), joined with the narration by ffmpeg.
// Usage: node tools/video/render.mjs <slug> en|ja [--fps 24] [--still 3,12.5]
// Needs Playwright, ffmpeg, and tools/video/build/<slug>/<lang>/timeline.json + narration.wav from tts.py.
// Writes public/videos/<slug>/<slug>-<lang>.mp4, .vtt and poster-<lang>.jpg.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..', '..');
const PUB = path.join(ROOT, 'public');
const HERE = __dirname;
const [slug, lang] = process.argv.slice(2);
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const fps = Number(arg('--fps', 24));
const still = arg('--still');
const build = path.join(HERE, 'build', slug, lang);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm', '.woff2': 'font/woff2' };

// /tools/video/... serves this folder; everything else serves public/ (so model paths match the site).
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = url.startsWith('/tools/video/') ? path.join(HERE, url.slice('/tools/video/'.length)) : path.join(PUB, url);
  if (!(file.startsWith(HERE) || file.startsWith(PUB)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  // 540 × 960 CSS pixels at 4/3 = a 720 × 1280 portrait video (9:16).
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 4 / 3 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`${base}/tools/video/render.html`);
  const duration = await page.evaluate(([s, t]) => window.init(s, t),
    [`${base}/tools/video/scripts/${slug}.json`, `${base}/tools/video/build/${slug}/${lang}/timeline.json`]);

  if (still !== undefined) {
    for (const t of still.split(',').map(Number)) {
      await page.evaluate(t => window.setFrame(t), t);
      await page.screenshot({ path: path.join(build, `still-${t}.png`) });
    }
    await browser.close(); server.close(); return;
  }

  const frames = path.join(build, 'frames');
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  const n = Math.ceil(duration * fps);
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.setFrame(t), f / fps);
    await page.screenshot({ path: path.join(frames, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 });
    if (f % 240 === 0) console.log(`${slug} ${lang}: frame ${f}/${n}`);
  }
  await browser.close(); server.close();

  const outDir = path.join(PUB, 'videos', slug);
  fs.mkdirSync(outDir, { recursive: true });
  const mp4 = path.join(outDir, `${slug}-${lang}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(frames, '%05d.jpg'),
    '-i', path.join(build, 'narration.wav'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.0', '-c:a', 'aac', '-b:a', '96k', '-ac', '1', '-shortest', '-movflags', '+faststart', mp4]);
  fs.copyFileSync(path.join(build, `${slug}-${lang}.vtt`), path.join(outDir, `${slug}-${lang}.vtt`));
  // Poster: a frame from the middle of the first scene, with its labels showing.
  const posterFrame = Math.min(n - 1, Math.round(Math.min(3, duration / 4) * fps));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(frames, `${String(posterFrame).padStart(5, '0')}.jpg`),
    '-q:v', '5', path.join(outDir, `poster-${lang}.jpg`)]);
  fs.rmSync(frames, { recursive: true, force: true });
  console.log(`${slug} ${lang}: ${duration.toFixed(1)} s -> public/videos/${slug}/${slug}-${lang}.mp4`);
})();
