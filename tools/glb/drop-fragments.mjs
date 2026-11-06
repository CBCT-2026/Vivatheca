// Remove tiny loose fragments (slivers left by decimation and booleans) from every mesh in a GLB,
// keeping materials, names, node transforms and extras exactly as they are, then re-finish (dedup,
// prune, weld, Draco). Usage:
//   node tools/glb/drop-fragments.mjs <in.glb> --out <out.glb> [--min-faces 16] [--dry-run]
//
// A fragment is a connected component (triangles joined by shared vertex indices) with fewer than
// --min-faces triangles. Legitimate small parts on the site (screws, plate holes) have 44 to 52
// triangles each, so the default of 16 only removes 1 to 8 triangle slivers. A mesh whose largest
// component is itself under the limit is left alone.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, prune, weld } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { validateBytes } from 'gltf-validator';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : fallback; };
const input = args[0];
const out = opt('--out');
const minFaces = Number(opt('--min-faces', '16'));
const dryRun = args.includes('--dry-run');
if (!input || (!out && !dryRun)) { console.error('Usage: node tools/glb/drop-fragments.mjs <in.glb> --out <out.glb> [--min-faces 16] [--dry-run]'); process.exit(2); }

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const document = await io.read(input);

function components(indices, vertexCount) {
  const parent = new Uint32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  for (let t = 0; t < indices.length; t += 3) { union(indices[t], indices[t + 1]); union(indices[t + 1], indices[t + 2]); }
  const faceRoot = new Uint32Array(indices.length / 3);
  const sizes = new Map();
  for (let f = 0; f < faceRoot.length; f++) { const r = find(indices[f * 3]); faceRoot[f] = r; sizes.set(r, (sizes.get(r) || 0) + 1); }
  return { faceRoot, sizes };
}

let removedTotal = 0;
for (const mesh of document.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const indexAcc = prim.getIndices();
    const posAcc = prim.getAttribute('POSITION');
    if (!indexAcc || !posAcc || prim.getMode() !== 4) continue;
    const indices = indexAcc.getArray();
    const { faceRoot, sizes } = components(indices, posAcc.getCount());
    const largest = Math.max(...sizes.values());
    if (largest < minFaces) continue;
    const keepFace = Array.from(faceRoot, (r) => sizes.get(r) >= minFaces);
    const removed = keepFace.filter((k) => !k).length;
    const fragments = [...sizes.values()].filter((s) => s < minFaces).length;
    if (!removed) continue;
    removedTotal += removed;
    console.log(`  ${mesh.getName().padEnd(24)} components=${sizes.size} fragments=${fragments} triangles removed=${removed}`);
    if (dryRun) continue;
    // Rebuild the index buffer with only the kept faces and compact the vertex attributes to those still used.
    const newIndex = [];
    const remap = new Map();
    for (let f = 0; f < keepFace.length; f++) {
      if (!keepFace[f]) continue;
      for (let k = 0; k < 3; k++) {
        const v = indices[f * 3 + k];
        if (!remap.has(v)) remap.set(v, remap.size);
        newIndex.push(remap.get(v));
      }
    }
    const order = [...remap.keys()];
    for (const name of prim.listSemantics()) {
      const acc = prim.getAttribute(name);
      const size = acc.getElementSize();
      const src = acc.getArray();
      const dst = new src.constructor(order.length * size);
      order.forEach((old, i) => { for (let c = 0; c < size; c++) dst[i * size + c] = src[old * size + c]; });
      acc.setArray(dst);
    }
    const IndexArray = order.length > 65535 ? Uint32Array : Uint16Array;
    indexAcc.setArray(new IndexArray(newIndex));
  }
}
console.log(`${path.basename(input)}: ${removedTotal} sliver triangles removed${dryRun ? ' (dry run, nothing written)' : ''}`);
if (dryRun) process.exit(0);

await document.transform(dedup(), prune(), weld(), draco({ method: 'edgebreaker' }));
const bytes = await io.writeBinary(document);
await writeFile(out, bytes);
const report = await validateBytes(new Uint8Array(await readFile(out)), { uri: path.basename(out), maxIssues: 20 });
const errors = report.issues.messages.filter((m) => m.severity === 0);
for (const m of errors) console.error(`  error ${m.code}: ${m.message} (${m.pointer})`);
console.log(`${errors.length ? 'FAIL' : 'ok  '} ${out}  ${(bytes.byteLength / 1048576).toFixed(2)} MB`);
process.exit(errors.length ? 1 : 0);
