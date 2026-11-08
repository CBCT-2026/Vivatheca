// Collection card still of the endodontic pair: sound tooth (left) and abscess (right), both cut open, seen
// from the cheek side, on the site's light card background (#eefcfc). The gum stays on (pink strip at the crest).
// Usage: PW_CHROMIUM=<optional chromium path> node tools/endo/render-card.mjs
// Writes public/assets/renders/endodontic.webp (1200 x 800).
import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = await import('@playwright/test')); } catch { ({ chromium } = require('playwright')); }

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const pub = join(root, 'public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const mv = (src) => `<model-viewer src="/endodontic/models/${src}" style="width:50vw;height:100vh;background:#eefcfc"
  environment-image="neutral" shadow-intensity="0.8" exposure="0.9" camera-orbit="0deg 88deg 95%" field-of-view="30deg"
  interpolation-decay="1"></model-viewer>`;
const PAGE = `<!doctype html><html><body style="margin:0;background:#eefcfc;display:flex">
<style>model-viewer::part(default-progress-bar){display:none}</style>
<script>self.ModelViewerElement={dracoDecoderLocation:location.origin+'/development/vendor/draco/'}</script>
<script type="module" src="/development/vendor/model-viewer/model-viewer.min.js"></script>
${mv('sound-cut.glb')}${mv('abscess-cut.glb')}</body></html>`;

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (path === '/render.html') return res.writeHead(200, { 'content-type': 'text/html' }).end(PAGE);
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }).end(await readFile(join(pub, path)));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 600, height: 400 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${server.address().port}/render.html`);
await page.waitForFunction(() => [...document.querySelectorAll('model-viewer')].every((m) => m.loaded), null, { timeout: 60000 });
await page.evaluate(async () => { document.querySelectorAll('model-viewer').forEach((m) => m.jumpCameraToGoal()); await new Promise((r) => setTimeout(r, 1500)); });
const png = join(pub, 'assets', 'renders', 'endodontic.png');
await page.screenshot({ path: png });
await browser.close();
server.close();
execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(png.replace(/png$/, 'webp'))}, quality=82)`]);
await rm(png);
console.log('wrote endodontic.webp');
