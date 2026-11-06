// Validates every GLB under public/ with the Khronos glTF-Validator and prints a size report.
// Run: node tools/glb/validate.mjs [--max-mb 6]
// Exits 1 on any validator error or on a file over the size limit, so CI catches a broken
// or oversized model before it goes live. Warnings and infos are listed but do not fail.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { validateBytes } from 'gltf-validator';

const ROOT = path.resolve(import.meta.dirname, '../../public');
const maxMbArg = process.argv.indexOf('--max-mb');
const MAX_BYTES = (maxMbArg > -1 ? Number(process.argv[maxMbArg + 1]) : 6) * 1024 * 1024;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.glb')) yield full;
  }
}

let failed = 0;
let count = 0;
for await (const file of walk(ROOT)) {
  count++;
  const rel = path.relative(ROOT, file);
  const bytes = new Uint8Array(await readFile(file));
  const size = (await stat(file)).size;
  const report = await validateBytes(bytes, { uri: rel, maxIssues: 50 });
  const { numErrors, numWarnings, numInfos, messages } = report.issues;
  const mb = (size / 1048576).toFixed(2);
  const tooBig = size > MAX_BYTES;
  const status = numErrors || tooBig ? 'FAIL' : 'ok  ';
  console.log(`${status} ${rel}  ${mb} MB  errors=${numErrors} warnings=${numWarnings} infos=${numInfos}`);
  for (const m of messages.filter((x) => x.severity === 0)) console.log(`      error ${m.code}: ${m.message} (${m.pointer})`);
  if (tooBig) console.log(`      over the ${MAX_BYTES / 1048576} MB limit`);
  if (numErrors || tooBig) failed++;
}
console.log(`\n${count} GLB files checked, ${failed} failed.`);
if (!count) { console.error('No GLB files found under public/.'); process.exit(1); }
process.exit(failed ? 1 : 0);
