// Swap the geometry of one named mesh in a GLB for the first mesh of another GLB, keeping the target's
// material, node, name and extras. Then re-finish (dedup, prune, weld, Draco, validate).
// Usage: node tools/glb/replace-mesh.mjs <target.glb> <mesh name> <source.glb> --out <out.glb>
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, prune, weld } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { validateBytes } from 'gltf-validator';

const [target, meshName, source] = process.argv.slice(2);
const outIdx = process.argv.indexOf('--out');
const out = outIdx > -1 ? process.argv[outIdx + 1] : null;
if (!target || !meshName || !source || !out) { console.error('Usage: node tools/glb/replace-mesh.mjs <target.glb> <mesh name> <source.glb> --out <out.glb>'); process.exit(2); }

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const doc = await io.read(target);
const srcDoc = await io.read(source);
const mesh = doc.getRoot().listMeshes().find((m) => m.getName() === meshName);
if (!mesh) { console.error(`mesh "${meshName}" not found; meshes: ${doc.getRoot().listMeshes().map((m) => m.getName()).join(', ')}`); process.exit(1); }
const srcPrim = srcDoc.getRoot().listMeshes()[0].listPrimitives()[0];
const prim = mesh.listPrimitives()[0];
const buffer = doc.getRoot().listBuffers()[0];
const copy = (acc) => doc.createAccessor().setType(acc.getType()).setArray(acc.getArray().slice()).setBuffer(buffer);
prim.setIndices(copy(srcPrim.getIndices()));
for (const semantic of prim.listSemantics()) prim.setAttribute(semantic, null);
for (const semantic of srcPrim.listSemantics()) prim.setAttribute(semantic, copy(srcPrim.getAttribute(semantic)));
for (const extra of mesh.listPrimitives().slice(1)) extra.dispose();
console.log(`${meshName}: ${srcPrim.getAttribute('POSITION').getCount()} vertices, ${srcPrim.getIndices().getCount() / 3} triangles from ${path.basename(source)}`);

await doc.transform(dedup(), prune(), weld(), draco({ method: 'edgebreaker' }));
const bytes = await io.writeBinary(doc);
await writeFile(out, bytes);
const report = await validateBytes(new Uint8Array(await readFile(out)), { uri: path.basename(out), maxIssues: 20 });
const errors = report.issues.messages.filter((m) => m.severity === 0);
for (const m of errors) console.error(`  error ${m.code}: ${m.message} (${m.pointer})`);
console.log(`${errors.length ? 'FAIL' : 'ok  '} ${out}  ${(bytes.byteLength / 1048576).toFixed(2)} MB`);
process.exit(errors.length ? 1 : 0);
