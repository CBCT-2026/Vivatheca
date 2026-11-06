// Stills of the TMD model for the collection card and the patient sheet.
// Usage: node tools/tmd/render.mjs   (after tools/glb/finish.mjs has written public/tmd/models/tmd.glb)
// Writes PNGs to build/tmd/ (convert to WebP with tools/tmd/stills.py).
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const pub = join(root, 'public');
const out = join(root, 'build', 'tmd');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const PAGE = `<!doctype html><html><body style="margin:0;background:#fff">
<script>self.ModelViewerElement={dracoDecoderLocation:location.origin+'/development/vendor/draco/'}</script>
<script type="module" src="/development/vendor/model-viewer/model-viewer.min.js"></script>
<model-viewer id="mv" src="/tmd/models/tmd.glb" style="width:100vw;height:100vh" exposure="1" shadow-intensity="0" interpolation-decay="1"></model-viewer></body></html>`;

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
const base = `http://127.0.0.1:${server.address().port}`;

// [file, width, height, camera orbit, animation, time (s), materials to hide]
const SHOTS = [
  ['card-closed', 600, 800, '-80deg 82deg 105%', 'rest', 0, []],
  ['card-open', 600, 800, '-80deg 82deg 105%', 'opening-stretch', 4.5, []],
  // Exercise stills: framed on the lower half of the head (target dropped by 0.3 of the model height).
  ['ex-rest', 640, 480, '-80deg 85deg LOW', 'rest', 3, []],
  ['ex-tongue-up-opening', 640, 480, '-80deg 85deg LOW', 'tongue-up-opening', 3.2, []],
  ['ex-opening-stretch', 640, 480, '-80deg 85deg LOW', 'opening-stretch', 4.5, []],
  ['ex-side-to-side', 640, 480, '0deg 88deg LOW', 'side-to-side', 2.7, []],
  ['ex-forward', 640, 480, '-80deg 85deg LOW', 'forward', 3.2, []],
  ['anatomy-deep', 640, 480, '-80deg 95deg LOW', 'rest', 0, ['masseter', 'skull']],
];

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
await mkdir(out, { recursive: true });
for (const [name, w, h, orbit, anim, time, hide] of SHOTS) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(`${base}/render.html`);
  await page.waitForFunction(() => document.querySelector('#mv').loaded, null, { timeout: 60000 });
  await page.evaluate(async ([orbit, anim, time, hide]) => {
    const mv = document.querySelector('#mv');
    for (const m of mv.model.materials) {
      if (hide.includes(m.name)) { m.setAlphaMode('BLEND'); m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]); }
    }
    mv.animationName = anim; mv.play(); await new Promise((r) => setTimeout(r, 100)); mv.pause(); mv.currentTime = time;
    if (orbit.endsWith('LOW')) {
      const c = mv.getBoundingBoxCenter(), d = mv.getDimensions();
      mv.cameraTarget = `${c.x}m ${c.y - d.y * 0.3}m ${c.z}m`;
      orbit = orbit.replace('LOW', `${d.y * 1.3}m`);
    }
    mv.cameraOrbit = orbit; mv.jumpCameraToGoal();
    await new Promise((r) => setTimeout(r, 1000));
  }, [orbit, anim, time, hide]);
  await page.screenshot({ path: join(out, `${name}.png`) });
  await page.close();
  console.log('wrote', name);
}
await browser.close();
server.close();
