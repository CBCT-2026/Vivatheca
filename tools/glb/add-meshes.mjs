// Add every mesh node of one or more GLBs to a target GLB, with their own materials, leaving every existing node,
// mesh and material of the target as it was. Used by tools/wisdom-tooth/soft_tissue.py to add the soft tissue layers.
// Usage: node tools/glb/add-meshes.mjs <target.glb> <source.glb> [<source.glb> ...] --out <out.glb>
import { readFile } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, unpartition } from '@gltf-transform/functions';
import { validateBytes } from 'gltf-validator';

const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const out = oi >= 0 ? args[oi + 1] : null;
const files = args.filter((a, i) => a !== '--out' && i !== oi + 1);
const [target, ...sources] = files;
if (!target || !out || !sources.length) { console.error('Usage: node tools/glb/add-meshes.mjs <target.glb> <source.glb> [...] --out <out.glb>'); process.exit(2); }

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(target);
const scene = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
for (const source of sources) {
  const src = await io.read(source);
  const map = mergeDocuments(doc, src);
  for (const s of src.getRoot().listScenes()) {
    const copy = map.get(s);
    for (const node of copy.listChildren()) scene.addChild(node);
    copy.dispose();
  }
}
await doc.transform(unpartition());
await io.write(out, doc);
const report = await validateBytes(new Uint8Array(await readFile(out)));
const errors = report.issues.numErrors;
console.log(`${out}: ${doc.getRoot().listMeshes().map((m) => m.getName()).join(', ')}; validator errors ${errors}`);
if (errors) process.exit(1);
