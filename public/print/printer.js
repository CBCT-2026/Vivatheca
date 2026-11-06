// /print: ready-to-print 3MF files and a simple print customiser (ideas from MakerWorld print profiles
// and the Thingiverse Customizer). Everything runs in the browser:
// - reads the model's STL zip (the same files as the download links on the model pages);
// - shows a 3D preview (three.js r147, already served for the head and neck viewers);
// - scales the model, adds a base plate with a raised label and blind holes for magnets;
// - writes a 3MF (parts named and coloured, one filament slot per colour for Bambu Studio's AMS)
//   or one binary STL.
// Words come from the page (data-text, from t.printing in the dictionaries).
(function () {
  const root = document.getElementById('vt-printer');
  if (!root) return;
  const T = JSON.parse(root.dataset.text);
  const TITLES = JSON.parse(root.dataset.titles);
  const LANG = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const ruby = (s) => String(s).replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => String(s).replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const xml = (s) => esc(s);

  // ---- colours by part name (shared colour standard: white teeth, yellow nerve; development: blue baby, yellow adult teeth) ----
  // Values come from the shared colour tokens (tokens/model.json, built to /tokens/colours.js by `pnpm tokens`).
  let M = {};
  const loadTokens = () => new Promise((res) => {
    if (window.VT_COLOURS) return res();
    const sc = document.createElement('script'); sc.src = '/tokens/colours.js';
    sc.onload = sc.onerror = () => res(); document.head.appendChild(sc);
  }).then(() => { M = (window.VT_COLOURS && window.VT_COLOURS.model) || {}; });
  const COLOURS = () => [
    [/baby-teeth/, M.babyTeeth], [/adult-teeth/, M.adultTeeth],
    [/decay-part|decay$/, M.decay], [/filling|prepared-base/, M.filling], [/crown-steel|steel/, M.steel], [/cement/, M.cement],
    [/crown-crown/, M.crown], [/braces|implant|option-(bridge|denture)/, M.hardware], [/option-none/, M.gum],
    [/nerve/, M.nerve], [/clot|tract/, M.clot], [/fat/, M.fat], [/lining/, M.lining], [/flap|gum|soft-tissue/, M.gum],
    [/graft/, M.graft], [/bone/, M.bone], [/teeth|tooth|molar|canine|crown/, M.tooth],
  ];
  const colourOf = (name) => { const n = name.replace(/\.stl$/i, ''); const c = COLOURS().find(([re]) => re.test(n)); return (c && c[1]) || M.bone || '#E3D3B5'; };
  const baseColour = () => M.printBase || '#00244D', labelColour = () => M.printLabel || '#FFFFFF';

  // ---- zip reading (stored or deflated entries) ----
  async function inflate(bytes) {
    const ds = new DecompressionStream('deflate-raw');
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer());
  }
  async function unzip(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf);
    let eocd = buf.byteLength - 22;
    while (eocd >= 0 && dv.getUint32(eocd, true) !== 0x06054b50) eocd--;
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const out = {};
    for (let i = 0; i < count; i++) {
      const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), local = dv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen));
      const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
      const data = u8.subarray(start, start + size);
      out[name] = method === 0 ? data : await inflate(data);
      p += 46 + nlen + elen + clen;
    }
    return out;
  }

  // ---- STL ----
  function parseStl(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const n = bytes.byteLength >= 84 ? dv.getUint32(80, true) : 0;
    if (84 + n * 50 === bytes.byteLength) {
      const pos = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) { const o = 84 + i * 50 + 12; for (let k = 0; k < 9; k++) pos[i * 9 + k] = dv.getFloat32(o + k * 4, true); }
      return pos;
    }
    const text = new TextDecoder().decode(bytes), v = [];
    const re = /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g; let m;
    while ((m = re.exec(text))) v.push(+m[1], +m[2], +m[3]);
    return new Float32Array(v);
  }
  function stlBinary(parts) {
    const tris = parts.reduce((s, p) => s + p.pos.length / 9, 0);
    const buf = new ArrayBuffer(84 + tris * 50), dv = new DataView(buf);
    const head = 'Vivatheca model, CC BY-SA 4.0, vivatheca.com';
    for (let i = 0; i < head.length; i++) dv.setUint8(i, head.charCodeAt(i));
    dv.setUint32(80, tris, true);
    let o = 84;
    parts.forEach((p) => { for (let i = 0; i < p.pos.length; i += 9) { o += 12; for (let k = 0; k < 9; k++) { dv.setFloat32(o, p.pos[i + k], true); o += 4; } o += 2; } });
    return new Uint8Array(buf);
  }

  // ---- 3MF ----
  function meshXml(pos) {
    const map = new Map(), verts = [], tris = [];
    const key = (i) => pos[i].toFixed(3) + ',' + pos[i + 1].toFixed(3) + ',' + pos[i + 2].toFixed(3);
    const idx = (i) => { const k = key(i); let j = map.get(k); if (j === undefined) { j = verts.length; map.set(k, j); verts.push('<vertex x="' + pos[i].toFixed(3) + '" y="' + pos[i + 1].toFixed(3) + '" z="' + pos[i + 2].toFixed(3) + '"/>'); } return j; };
    for (let i = 0; i < pos.length; i += 9) { const a = idx(i), b = idx(i + 3), c = idx(i + 6); if (a !== b && b !== c && a !== c) tris.push('<triangle v1="' + a + '" v2="' + b + '" v3="' + c + '"/>'); }
    return '<mesh><vertices>' + verts.join('') + '</vertices><triangles>' + tris.join('') + '</triangles></mesh>';
  }
  function threeMf(parts, title, note) {
    const colours = [...new Set(parts.map((p) => p.colour))];
    const asm = parts.length + 2;
    const model = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">',
      '<metadata name="Title">' + xml(title) + '</metadata><metadata name="Designer">Vivatheca (vivatheca.com)</metadata>',
      '<metadata name="License">CC BY-SA 4.0</metadata><metadata name="Description">' + xml(note) + '</metadata>',
      '<resources><basematerials id="1">' + colours.map((c, i) => '<base name="colour ' + (i + 1) + '" displaycolor="' + c + 'FF"/>').join('') + '</basematerials>',
      ...parts.map((p, i) => '<object id="' + (i + 2) + '" type="model" name="' + xml(p.name) + '" pid="1" pindex="' + colours.indexOf(p.colour) + '">' + meshXml(p.pos) + '</object>'),
      '<object id="' + asm + '" type="model" name="' + xml(title) + '"><components>' + parts.map((p, i) => '<component objectid="' + (i + 2) + '"/>').join('') + '</components></object>',
      '</resources><build><item objectid="' + asm + '" transform="1 0 0 0 1 0 0 0 1 128 128 0"/></build></model>'].join('\n');
    // Bambu Studio and OrcaSlicer read part names and filament slots from this file; other slicers ignore it.
    const settings = ['<?xml version="1.0" encoding="UTF-8"?>', '<config>', '  <object id="' + asm + '">', '    <metadata key="name" value="' + xml(title) + '"/>', '    <metadata key="extruder" value="1"/>',
      ...parts.map((p, i) => '    <part id="' + (i + 2) + '" subtype="normal_part">\n      <metadata key="name" value="' + xml(p.name) + '"/>\n      <metadata key="extruder" value="' + (colours.indexOf(p.colour) + 1) + '"/>\n    </part>'),
      '  </object>', '</config>'].join('\n');
    const types = '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/><Default Extension="config" ContentType="text/xml"/><Default Extension="txt" ContentType="text/plain"/></Types>';
    const rels = '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';
    const readme = note + '\n\nColours / filament slots:\n' + colours.map((c, i) => '  ' + (i + 1) + ': ' + c + ' - ' + parts.filter((p) => p.colour === c).map((p) => p.name).join(', ')).join('\n') + '\n';
    return zip([['[Content_Types].xml', types], ['_rels/.rels', rels], ['3D/3dmodel.model', model], ['Metadata/model_settings.config', settings], ['Metadata/Vivatheca-README.txt', readme]]);
  }

  // ---- zip writing (deflate) ----
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const DOS_DATE = (() => { const d = new Date(); return ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(); })();
  async function zip(entries) {
    const enc = new TextEncoder(), chunks = [], central = [];
    let offset = 0;
    for (const [name, text] of entries) {
      const data = enc.encode(text), nameB = enc.encode(name), crc = crc32(data);
      const comp = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 8, true); h.setUint16(12, DOS_DATE, true); h.setUint32(14, crc, true); h.setUint32(18, comp.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nameB.length, true);
      chunks.push(new Uint8Array(h.buffer), nameB, comp);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(10, 8, true); c.setUint16(14, DOS_DATE, true); c.setUint32(16, crc, true); c.setUint32(20, comp.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nameB.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), nameB);
      offset += 30 + nameB.length + comp.length;
    }
    const size = central.reduce((s, x) => s + x.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, size, true); e.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, new Uint8Array(e.buffer)], { type: 'model/3mf' });
  }

  // ---- base plate, label and magnet holes (three.js shapes; no boolean operations needed) ----
  function roundedRect(x0, y0, x1, y1, r) {
    const s = new THREE.Shape();
    s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
    s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
    return s;
  }
  const flat = (g) => (g.index ? g.toNonIndexed() : g).attributes.position.array;
  let font = null;
  async function getFont() {
    if (font) return font;
    const json = await (await fetch('/vendor/three-extras/helvetiker_bold.typeface.json')).json();
    font = new THREE.FontLoader().parse(json);
    return font;
  }

  // ---- state and page ----
  let SETS = {}, current = null, renderer, scene, camera, controls, group;
  const opts = { pct: 100, base: false, label: '', magnets: false, magnet: '6x2', off: new Set() };

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function status(key, v) { const s = root.querySelector('.pr-status'); s.innerHTML = key ? (v ? esc(fill(plain(T[key]), v)) : ruby(T[key])) : ''; }

  async function loadScripts() {
    const list = ['/head-neck/vendor/three/three.min.js', '/head-neck/vendor/three/OrbitControls.js', '/vendor/three-extras/FontLoader.js', '/vendor/three-extras/TextGeometry.js'];
    for (const src of list) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }

  function setupView(box) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
    box.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', plain(T.preview));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 1, 5000);
    controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 0.8));
    const k = new THREE.DirectionalLight(0xffffff, 0.7); k.position.set(-1, 2, 1.5); scene.add(k);
    const k2 = new THREE.DirectionalLight(0xffffff, 0.35); k2.position.set(1, -1, 1); scene.add(k2);
    const resize = () => { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(box); resize();
    (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
  }

  // The print as plain triangles (millimetres, Z up, sitting on z = 0).
  async function buildParts() {
    const k = opts.pct / 100;
    const parts = current.parts.filter((p) => !opts.off.has(p.name)).map((p) => {
      const pos = new Float32Array(p.pos.length); for (let i = 0; i < pos.length; i++) pos[i] = p.pos[i] * k;
      return { name: p.name.replace(/\.stl$/i, ''), colour: p.colour, pos };
    });
    if (!parts.length) return parts;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    parts.forEach((p) => { for (let i = 0; i < p.pos.length; i += 3) for (let a = 0; a < 3; a++) { const v = p.pos[i + a]; if (v < min[a]) min[a] = v; if (v > max[a]) max[a] = v; } });
    const cx = (min[0] + max[0]) / 2, cy = (min[1] + max[1]) / 2;
    const [md, mh] = opts.magnet.split('x').map(Number);
    const top = 1.6, bottom = opts.magnets ? mh + 0.2 : 0, T0 = opts.base ? Math.max(3, top + bottom) : 0;
    const sink = opts.base ? 0.6 : 0;
    parts.forEach((p) => { for (let i = 0; i < p.pos.length; i += 3) { p.pos[i] -= cx; p.pos[i + 1] -= cy; p.pos[i + 2] += T0 - sink - min[2]; } });
    if (opts.base) {
      const m = 5, hw = (max[0] - min[0]) / 2 + m, hd = (max[1] - min[1]) / 2 + m, strip = opts.label ? 12 : 0;
      const x0 = -hw, x1 = hw, y0 = -hd - strip, y1 = hd, r = 3;
      const extrude = (shape, depth, z) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, z); return flat(g); };
      if (opts.magnets) {
        const lower = roundedRect(x0, y0, x1, y1, r), rad = md / 2 + 0.15, cyH = (y0 + y1) / 2 + strip / 2;
        const xs = (x1 - x0) > 4 * rad + 16 ? [x0 + m + rad + 3, x1 - m - rad - 3] : [0];
        xs.forEach((x) => { const h = new THREE.Path(); h.absarc(x, cyH, rad, 0, Math.PI * 2, true); lower.holes.push(h); });
        parts.push({ name: 'base (magnet layer)', colour: baseColour(), pos: extrude(lower, bottom, 0) });
        parts.push({ name: 'base', colour: baseColour(), pos: extrude(roundedRect(x0, y0, x1, y1, r), T0 - bottom, bottom) });
      } else {
        parts.push({ name: 'base', colour: baseColour(), pos: extrude(roundedRect(x0, y0, x1, y1, r), T0, 0) });
      }
      const text = opts.label.replace(/[^\x20-\x7e]/g, '').trim().slice(0, 32);
      if (text) {
        const f = await getFont();
        let size = 6;
        let g = new THREE.TextGeometry(text, { font: f, size, height: 1, curveSegments: 4, bevelEnabled: false });
        g.computeBoundingBox();
        const w = g.boundingBox.max.x - g.boundingBox.min.x;
        if (w > (x1 - x0) - 8) { size *= ((x1 - x0) - 8) / w; g = new THREE.TextGeometry(text, { font: f, size, height: 1, curveSegments: 4, bevelEnabled: false }); g.computeBoundingBox(); }
        const bb = g.boundingBox;
        g.translate(-(bb.min.x + bb.max.x) / 2, y0 + strip / 2 - (bb.min.y + bb.max.y) / 2, T0 - 0.2);
        parts.push({ name: 'label', colour: labelColour(), pos: flat(g) });
      }
    }
    return parts;
  }

  let token = 0;
  async function refresh() {
    const my = ++token;
    const parts = await buildParts();
    if (my !== token) return;
    if (group) { scene.remove(group); group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    group = new THREE.Group(); group.rotation.x = -Math.PI / 2;
    parts.forEach((p) => {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p.pos, 3)); g.computeVertexNormals();
      group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: new THREE.Color(p.colour).convertSRGBToLinear(), roughness: 0.6, side: THREE.DoubleSide })));
    });
    scene.add(group);
    const box = new THREE.Box3().setFromObject(group), size = box.getSize(new THREE.Vector3()).length() || 50, c = box.getCenter(new THREE.Vector3());
    if (!refresh.framed) { camera.position.copy(c).add(new THREE.Vector3(0.45, 0.55, 0.7).normalize().multiplyScalar(size * 1.5)); controls.target.copy(c); refresh.framed = true; }
    camera.near = size / 100; camera.far = size * 20; camera.updateProjectionMatrix();
    renderLegend();
  }

  function renderLegend() {
    const cols = [...new Set(current.parts.filter((p) => !opts.off.has(p.name)).map((p) => p.colour).concat(opts.base ? [baseColour()] : []).concat(opts.base && opts.label.trim() ? [labelColour()] : []))];
    root.querySelector('.pr-parts').innerHTML = current.parts.map((p) => '<label class="pr-check"><input type="checkbox" data-part="' + esc(p.name) + '"' + (opts.off.has(p.name) ? '' : ' checked') + '> <span class="pr-dot" style="background:' + p.colour + '" aria-hidden="true"></span>' + esc(p.name.replace(/\.stl$/i, '')) + (opts.off.has(p.name) ? '' : ' <small>(' + esc(fill(plain(T.slot), { n: cols.indexOf(p.colour) + 1 })) + ')</small>') + '</label>').join('');
    root.querySelectorAll('[data-part]').forEach((c) => c.addEventListener('change', () => { if (c.checked) opts.off.delete(c.dataset.part); else opts.off.add(c.dataset.part); refresh(); }));
    const life = (current.scale * opts.pct / 100);
    root.querySelector('.pr-size-hint').innerHTML = esc(fill(plain(T.sizeHint), { pct: opts.pct, life: (+life.toFixed(2)) + '×' }));
  }

  async function loadSet(slug, setId) {
    const set = (SETS[slug] || []).find((s) => s.id === setId) || (SETS[slug] || [])[0];
    if (!set) return;
    status('loading');
    try {
      const files = await unzip(await (await fetch(set.zip)).arrayBuffer());
      // Part names without the stage prefix ("stage-3-bone.stl" -> "bone").
      const short = (f) => f.replace(/\.stl$/i, '').replace(new RegExp('^' + set.id.replace(/[-]/g, '[-]') + '-'), '').replace(/^abg-\d+b?-[a-z-]+?-(bone|teeth|canine|soft-tissue|braces|graft|option-[a-z]+)$/, '$1');
      current = { slug, set, scale: set.scale, parts: set.files.filter((f) => files[f]).map((f) => ({ name: short(f), colour: colourOf(f), pos: parseStl(files[f]) })) };
      opts.off.clear();
      root.querySelector('.pr-filescale').innerHTML = esc(fill(plain(T.fileScale), { scale: set.scale + '×' }));
      refresh.framed = false;
      await refresh();
      status('');
    } catch (e) { status('loadFailed'); }
  }

  function save(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    try { fetch('/api/stats/hit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: current.slug, kind: 'print' }) }).catch(() => {}); } catch (e) { /* optional */ }
  }
  async function exportFile(kind) {
    status('building');
    await new Promise((r) => setTimeout(r, 30));
    try {
      const parts = await buildParts();
      const title = plain(TITLES[current.slug] || current.slug) + ' - ' + plain(current.set.label[LANG]);
      const name = 'vivatheca-' + current.slug + '-' + current.set.id + '-' + opts.pct + 'pct';
      const note = plain(fill(T.credit, { title: plain(TITLES[current.slug] || current.slug) })) + ' ' + root.dataset.status + ' ' + root.dataset.disclaimer + ' https://vivatheca.com/disclaimer';
      if (kind === '3mf') save(await threeMf(parts, title, note), name + '.3mf');
      else save(new Blob([stlBinary(parts)], { type: 'model/stl' }), name + '.stl');
      status('done');
    } catch (e) { status('failed'); }
  }

  async function start() {
    await loadTokens();
    root.innerHTML = '';
    root.appendChild(el('<div class="pr-grid">' +
      '<div class="pr-view" aria-busy="false"></div>' +
      '<form class="report-form pr-form" onsubmit="return false">' +
      '<label>' + ruby(T.model) + '<select class="pr-model"></select></label>' +
      '<label>' + ruby(T.set) + '<select class="pr-set"></select></label>' +
      '<p class="detail-note pr-filescale"></p>' +
      '<label>' + ruby(T.size) + '<input class="pr-pct" type="number" min="25" max="300" step="5" value="100" inputmode="numeric"></label>' +
      '<p class="detail-note pr-size-hint"></p>' +
      '<fieldset class="pr-fieldset"><legend>' + ruby(T.parts) + '</legend><div class="pr-parts"></div></fieldset>' +
      '<label class="check-row"><input type="checkbox" class="pr-base"> <span>' + ruby(T.base) + '</span></label>' +
      '<label class="pr-label-row" hidden>' + ruby(T.label) + '<input class="pr-label" maxlength="32" placeholder="' + esc(plain(T.labelPlaceholder)) + '"></label>' +
      '<label class="check-row pr-mag-row" hidden><input type="checkbox" class="pr-mag"> <span>' + ruby(T.magnets) + '</span></label>' +
      '<label class="pr-magsize-row" hidden>' + ruby(T.magnetSize) + '<select class="pr-magsize"><option value="6x2">6 × 2 mm</option><option value="8x3">8 × 3 mm</option><option value="10x3">10 × 3 mm</option><option value="12x3">12 × 3 mm</option></select></label>' +
      '<div class="form-actions"><button type="button" class="button pr-3mf">' + ruby(T.download3mf) + '</button><button type="button" class="button button-secondary pr-stl">' + ruby(T.downloadStl) + '</button></div>' +
      '<p class="form-ok pr-status" role="status" aria-live="polite"></p>' +
      '</form></div>'));
    try { await loadScripts(); SETS = await (await fetch('/print/sets.json')).json(); } catch (e) { status('loadFailed'); return; }
    setupView(root.querySelector('.pr-view'));
    const mSel = root.querySelector('.pr-model'), sSel = root.querySelector('.pr-set');
    const slugs = Object.keys(SETS).filter((s) => SETS[s].length);
    mSel.innerHTML = slugs.map((s) => '<option value="' + s + '">' + esc(plain(TITLES[s] || s)) + '</option>').join('');
    const want = new URLSearchParams(location.search).get('model');
    mSel.value = slugs.includes(want) ? want : slugs[0];
    if (want && !slugs.includes(want) && TITLES[want]) status('noFiles');
    const fillSets = () => { sSel.innerHTML = SETS[mSel.value].map((s) => '<option value="' + s.id + '">' + esc(plain(s.label[LANG])) + '</option>').join(''); };
    fillSets();
    mSel.addEventListener('change', () => { fillSets(); loadSet(mSel.value, sSel.value); history.replaceState(null, '', '?model=' + mSel.value); });
    sSel.addEventListener('change', () => loadSet(mSel.value, sSel.value));
    const pct = root.querySelector('.pr-pct');
    pct.addEventListener('change', () => { opts.pct = Math.max(25, Math.min(300, Math.round(+pct.value || 100))); pct.value = opts.pct; refresh(); });
    const base = root.querySelector('.pr-base'), label = root.querySelector('.pr-label'), mag = root.querySelector('.pr-mag'), msize = root.querySelector('.pr-magsize');
    const rows = () => { root.querySelector('.pr-label-row').hidden = !opts.base; root.querySelector('.pr-mag-row').hidden = !opts.base; root.querySelector('.pr-magsize-row').hidden = !(opts.base && opts.magnets); };
    base.addEventListener('change', () => { opts.base = base.checked; rows(); refresh(); });
    let typing; label.addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => { opts.label = label.value; refresh(); }, 350); });
    mag.addEventListener('change', () => { opts.magnets = mag.checked; rows(); refresh(); });
    msize.addEventListener('change', () => { opts.magnet = msize.value; refresh(); });
    root.querySelector('.pr-3mf').addEventListener('click', () => exportFile('3mf'));
    root.querySelector('.pr-stl').addEventListener('click', () => exportFile('stl'));
    await loadSet(mSel.value, sSel.value);
  }
  start();
})();
