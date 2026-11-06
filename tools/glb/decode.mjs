// Write an uncompressed copy of a GLB (Draco decoded), for Python tools that cannot read Draco.
// Usage: node tools/glb/decode.mjs <in.glb> <out.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('Usage: node tools/glb/decode.mjs <in.glb> <out.glb>'); process.exit(2); }
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
const doc = await io.read(src);
for (const ext of doc.getRoot().listExtensionsUsed()) if (ext.extensionName === 'KHR_draco_mesh_compression') ext.dispose();
await io.write(out, doc);
console.log(`decoded ${src} -> ${out}`);
