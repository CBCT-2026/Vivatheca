// Collection card still of the averaged jaw, on the site's light card background (#eefcfc).
// Usage: node tools/segment/render-card.mjs   (after public/models/averaged-jaw/averaged-jaw.glb exists)
// Writes public/assets/renders/averaged-jaw.png; convert with:
//   python3 -c "from PIL import Image; Image.open('public/assets/renders/averaged-jaw.png').convert('RGB').save('public/assets/renders/averaged-jaw.webp', quality=82)"
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = await import('@playwright/test')); } catch { ({ chromium } = require('playwright')); }

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const pub = join(root, 'public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const PAGE = `<!doctype html><html><body style="margin:0;background:#eefcfc">
<script>self.ModelViewerElement={dracoDecoderLocation:location.origin+'/development/vendor/draco/'}</script>
<script type="module" src="/development/vendor/model-viewer/model-viewer.min.js"></script>
<model-viewer id="mv" src="/models/averaged-jaw/averaged-jaw.glb" style="width:100vw;height:100vh;background:#eefcfc"
  environment-image="neutral" shadow-intensity="1" shadow-softness="0.6" exposure="0.7" tone-mapping="neutral" camera-orbit="35deg 75deg 92%" field-of-view="30deg" interpolation-decay="1"></model-viewer></body></html>`;

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
await page.waitForFunction(() => document.querySelector('#mv').loaded, null, { timeout: 60000 });
await page.evaluate(async () => { document.querySelector('#mv').jumpCameraToGoal(); await new Promise((r) => setTimeout(r, 1500)); });
await page.screenshot({ path: join(pub, 'assets', 'renders', 'averaged-jaw.png') });
await browser.close();
server.close();
console.log('wrote averaged-jaw.png');
