// Label anchors for every 3D model: one spot on the surface of each named part (node or material), its surface
// normal, and from which directions the spot can be seen. public/model-labels.js pins a label to that spot in
// model-viewer (glTF scene coordinates) and in the three.js head and neck viewers.
// How the spots are chosen: candidates are spread over the part (plus a few near its middle on the outward side);
// up to three are kept per part, each adding the most of 48 view directions from which no spot was seen yet, so a
// label can show from whichever side the model is turned to. For each direction the file stores -1 (spot faces
// away), 0 (clear view) or a bitmask of the materials in the way, so the label can show when the page hides those
// parts or makes them see-through. Parts seen from no direction (inside another part, e.g. the pulp) get in: 1.
// Also stores 400 outline samples (shape) so labels can sit in the empty space around the model.
// Usage: node tools/labels/anchors.mjs   (writes public/model-labels/<same path as the GLB>.json)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const ROOT = 'public';
const SKIP = /\/(vendor|print)\//;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const base = (n) => (n || '').replace(/[._]\d+$/, '').replace(/^(upper|lower)_teeth$/, '$1-teeth');

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.glb') && !SKIP.test('/' + p + '/')) out.push(p);
  }
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// View directions: a Fibonacci sphere (public/model-labels.js makes the same list).
const DIRS = Array.from({ length: 48 }, (_, i) => {
  const y = 1 - (2 * i + 1) / 48, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(a) * r, y, Math.sin(a) * r];
});
const FRONT = norm([0, 0.3, 1]);
const xf = (m, v, w) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + w * m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + w * m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + w * m[14]];

async function anchors(file) {
  const doc = await io.read(file);
  const groups = new Map(); // name -> { mat, verts: [[p, n]], tris: [] }
  const tris = []; // [a, b, c, group, material index]
  const mats = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const m = node.getWorldMatrix();
    const name = base(node.getName() || mesh.getName());
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION'); if (!pos) continue;
      const nor = prim.getAttribute('NORMAL');
      const mat = base(prim.getMaterial()?.getName() || name);
      if (!mats.includes(mat)) mats.push(mat);
      const mi = mats.indexOf(mat);
      // Each primitive counts for its node (e.g. upper-bone, canine) and for its material (e.g. crack, enamel_cut),
      // so a label can point at either; a material named like a node is left to the node.
      for (const k of ['n:' + name, 'm:' + mat]) if (!groups.has(k)) groups.set(k, { mat, verts: [] });
      const gs = [groups.get('n:' + name), groups.get('m:' + mat)];
      const P = [], N = [];
      for (let i = 0; i < pos.getCount(); i++) {
        P.push(xf(m, pos.getElement(i, []), 1));
        N.push(nor ? norm(xf(m, nor.getElement(i, []), 0)) : null);
      }
      const idx = prim.getIndices();
      const I = idx ? Array.from(idx.getArray()) : P.map((_, i) => i);
      for (let i = 0; i + 2 < I.length; i += 3) {
        const a = P[I[i]], b = P[I[i + 1]], c = P[I[i + 2]];
        tris.push([a, b, c, name, mi]);
        if (!nor) { const fn = norm(cross(sub(b, a), sub(c, a))); for (const k of [I[i], I[i + 1], I[i + 2]]) N[k] = N[k] || fn; }
      }
      P.forEach((p, i) => gs.forEach((g) => g.verts.push([p, N[i] || [0, 0, 1]])));
    }
  }
  if (!tris.length) return null;
  // Uniform grid over the whole model for the ray tests.
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const t of tris) for (const v of t.slice(0, 3)) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], v[k]); hi[k] = Math.max(hi[k], v[k]); }
  const size = sub(hi, lo), diag = len(size), centre = lo.map((v, k) => v + size[k] / 2);
  const R = 48, cell = size.map((s) => Math.max(s, 1e-9) / R), minCell = Math.min(...cell);
  const grid = new Map();
  const ci = (v, k) => Math.max(0, Math.min(R - 1, Math.floor((v - lo[k]) / cell[k])));
  tris.forEach((t, ti) => {
    const a = [0, 1, 2].map((k) => ci(Math.min(t[0][k], t[1][k], t[2][k]), k)), b = [0, 1, 2].map((k) => ci(Math.max(t[0][k], t[1][k], t[2][k]), k));
    for (let x = a[0]; x <= b[0]; x++) for (let y = a[1]; y <= b[1]; y++) for (let z = a[2]; z <= b[2]; z++) {
      const key = (x * R + y) * R + z; let l = grid.get(key); if (!l) grid.set(key, (l = [])); l.push(ti);
    }
  });
  // Which materials does a ray from o along d pass through? Bitmask of material indices (0 = clear view).
  function hits(o, d) {
    const seen = new Set(), step = minCell / 2;
    let mask = 0;
    for (let s = 0; s < diag * 1.2; s += step) {
      const q = [o[0] + d[0] * s, o[1] + d[1] * s, o[2] + d[2] * s];
      if (q.some((v, k) => v < lo[k] - cell[k] || v > hi[k] + cell[k])) break;
      const l = grid.get((ci(q[0], 0) * R + ci(q[1], 1)) * R + ci(q[2], 2)); if (!l) continue;
      for (const ti of l) {
        if (seen.has(ti)) continue; seen.add(ti);
        const [a, b, c, , mi] = tris[ti];
        if (mask & (1 << mi)) continue;
        const e1 = sub(b, a), e2 = sub(c, a), p = cross(d, e2), det = dot(e1, p);
        if (Math.abs(det) < 1e-14) continue;
        const tv = sub(o, a), u = dot(tv, p) / det; if (u < 0 || u > 1) continue;
        const qv = cross(tv, e1), v = dot(d, qv) / det; if (v < 0 || u + v > 1) continue;
        if (dot(e2, qv) / det > diag * 2e-3) mask |= 1 << mi;
      }
    }
    return mask;
  }
  // For each of the DIRS view directions: -1 = the spot faces away, 0 = clear view, else the materials in the way.
  const view = (p, nn) => {
    const o = [0, 1, 2].map((k) => p[k] + nn[k] * diag * 1e-3);
    return DIRS.map((d) => (dot(d, nn) < 0.1 ? -1 : hits(o, d)));
  };
  const out = { mats, dirs: DIRS.length, parts: {} };
  const nodeNames = new Set([...groups.keys()].filter((k) => k.startsWith('n:')).map((k) => k.slice(2)));
  for (const [gk, g] of groups) {
    const name = gk.slice(2);
    if (gk.startsWith('m:') && nodeNames.has(name)) continue;
    const n = g.verts.length; if (!n) continue;
    const c = [0, 1, 2].map((k) => g.verts.reduce((s, v) => s + v[0][k], 0) / n);
    const r = g.verts.reduce((mx, v) => Math.max(mx, len(sub(v[0], c))), 0) || 1;
    // Candidates: spots spread over the whole part, plus the ones nearest its middle on the outward side.
    const out0 = sub(c, centre);
    const d = len(out0) < diag * 0.08 ? FRONT : norm(norm(out0).map((x, k) => x + FRONT[k] * 0.4));
    const geo = ([p, nn]) => { const rel = sub(p, c), along = dot(rel, d); return dot(nn, d) * 0.3 + 0.3 * along / r - len(sub(rel, d.map((x) => x * along))) / r; };
    const spread = [];
    const stride = Math.max(1, Math.floor(n / 70));
    for (let i = 0; i < n; i += stride) spread.push(g.verts[i]);
    const middle = g.verts.filter((_, i) => i % Math.max(1, Math.floor(n / 3000)) === 0).sort((a, b) => geo(b) - geo(a)).slice(0, 10);
    const cands = [...middle, ...spread].map(([p, nn]) => {
      const v = view(p, nn);
      // A blocked direction counts a little if few parts are in the way (they may be hidden or see-through).
      const worth = v.map((m) => (m === 0 ? 1 : m > 0 ? 0.25 / (m.toString(2).split('1').length - 1) : 0));
      return { p, nn, v, worth, geo: geo([p, nn]) };
    });
    // Up to three spots per part, so a label can show from whichever side the model is turned to:
    // each next spot is the one that adds the most directions not yet covered (middle-of-part spots win ties).
    const chosen = [], cover = DIRS.map(() => 0);
    for (let round = 0; round < 3; round++) {
      let best = null;
      for (const cd of cands) {
        const gain = cd.worth.reduce((s, w, k) => s + Math.max(0, w - cover[k]) * (1 + 0.5 * Math.max(0, dot(DIRS[k], FRONT))), 0);
        const total = gain + 0.6 * cd.geo;
        if (!best || total > best.total) best = { ...cd, total, gain };
      }
      if (!best || (chosen.length && best.gain < 3)) break;
      chosen.push(best);
      best.worth.forEach((w, k) => { cover[k] = Math.max(cover[k], w); });
    }
    const f = (v) => v.map((x) => +x.toFixed(5));
    out.parts[name] = { m: g.mat, at: chosen.map((cd) => ({ p: f(cd.p), n: f(norm(cd.nn)), v: cd.v.join(',') })) };
    if (!chosen.some((cd) => cd.v.includes(0))) out.parts[name].in = 1;
  }
  // Outline samples: 400 points spread over the surface by area (triangle middles), [x, y, z, material index, ...],
  // so the page can see where the model is on screen and put labels in the empty space around it.
  const areas = tris.map(([a, b, c]) => len(cross(sub(b, a), sub(c, a))) / 2);
  const total = areas.reduce((s, x) => s + x, 0);
  out.shape = [];
  if (total > 0) {
    const N = 400; let acc = 0, k = 0;
    tris.forEach((t, ti) => {
      acc += areas[ti];
      while (k < N && (k + 0.5) / N * total <= acc) {
        const m = [0, 1, 2].map((j) => (t[0][j] + t[1][j] + t[2][j]) / 3);
        out.shape.push(...m.map((x) => +x.toFixed(4)), t[4]);
        k++;
      }
    });
  }
  return out;
}

for (const file of walk(ROOT).sort()) {
  const key = '/' + relative(ROOT, file).split('\\').join('/');
  const a = await anchors(file);
  if (!a) continue;
  const out = join(ROOT, 'model-labels', key.replace(/\.glb$/, '.json'));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(a) + '\n');
  console.log(key, Object.keys(a.parts).map((k) => k + (a.parts[k].in ? '*' : '')).join(' '));
}
