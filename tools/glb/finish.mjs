// Shared last step for every model build: tidy a GLB and Draco-compress it for the site.
// Usage: node tools/glb/finish.mjs <in.glb> [<in2.glb> ...] --out <dir>
//        node tools/glb/finish.mjs <in.glb> --out <out.glb>      (one file, renamed)
//
// Replaces the per-model `npx -y @gltf-transform/cli draco` calls, so every model is finished the
// same way with the pinned glTF-Transform version from package.json (no network fetch at build time):
//   dedup  - share identical accessors/materials
//   prune  - drop unused nodes, materials, accessors
//   weld   - merge exactly duplicate vertices (tolerance 0, so hard edges are kept)
//   draco  - KHR_draco_mesh_compression (every viewer on the site has the Draco decoder)
// then validates the result with the Khronos glTF-Validator and prints sizes.
//
// Measured on 6 Nov 2026 (tools/glb/README.md): Draco beats meshopt on these models, and re-encoding an
// already-Draco file is lossy and does not shrink it, so run this on the uncompressed build output only.
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, prune, weld } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { validateBytes } from 'gltf-validator';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
if (outIdx < 0 || args.length < 2) {
  console.error('Usage: node tools/glb/finish.mjs <in.glb> [...] --out <dir>');
  process.exit(2);
}
const outArg = args[outIdx + 1];
const inputs = args.filter((a, i) => i !== outIdx && i !== outIdx + 1);
const singleFile = outArg.endsWith('.glb');
if (singleFile && inputs.length !== 1) { console.error('--out <file.glb> takes exactly one input'); process.exit(2); }
await mkdir(singleFile ? path.dirname(outArg) : outArg, { recursive: true });

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

let failed = 0;
for (const input of inputs) {
  const document = await io.read(input);
  const before = (await stat(input)).size;
  if (document.getRoot().listExtensionsUsed().some((e) => e.extensionName === 'KHR_draco_mesh_compression')) {
    console.warn(`warn ${path.basename(input)} is already Draco-compressed; re-encoding is lossy. Pass the uncompressed build output instead.`);
  }
  await document.transform(dedup(), prune(), weld(), draco({ method: 'edgebreaker' }));
  const bytes = await io.writeBinary(document);
  const out = singleFile ? outArg : path.join(outArg, path.basename(input));
  await writeFile(out, bytes);
  const report = await validateBytes(new Uint8Array(await readFile(out)), { uri: path.basename(out), maxIssues: 20 });
  const errors = report.issues.messages.filter((m) => m.severity === 0);
  for (const m of errors) console.error(`  error ${m.code}: ${m.message} (${m.pointer})`);
  if (errors.length) failed++;
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${path.basename(input)}  ${(before / 1048576).toFixed(2)} MB -> ${(bytes.byteLength / 1048576).toFixed(2)} MB`);
}
process.exit(failed ? 1 : 0);
