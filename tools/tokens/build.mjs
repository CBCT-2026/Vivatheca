// One source for brand and model colours (tokens/*.json, W3C design-token format), built with
// Style Dictionary (Apache-2.0) into files each part of the project can read:
//   public/tokens/colours.js      window.VT_COLOURS for static pages and tools (e.g. /print)
//   app/tokens.generated.ts       for the app
//   tools/tokens/colours.py       for Python/Blender build scripts (hex and linear RGB)
// Run `pnpm tokens` after changing a colour. CI fails if the built files are out of date.
import StyleDictionary from 'style-dictionary';

const HEADER = 'Built from tokens/*.json by tools/tokens/build.mjs (pnpm tokens). Do not edit by hand.';
const nest = (tokens) => {
  const out = {};
  for (const t of tokens) {
    const [group, name] = t.path;
    (out[group] ??= {})[name] = String(t.$value ?? t.value).toUpperCase();
  }
  return out;
};
const linear = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [16, 8, 0].map((s) => {
    const c = ((n >> s) & 255) / 255;
    return Number((c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).toFixed(4));
  });
};

StyleDictionary.registerFormat({
  name: 'vt/browser-js',
  format: ({ dictionary }) => `// ${HEADER}\nwindow.VT_COLOURS = ${JSON.stringify(nest(dictionary.allTokens), null, 2)};\n`,
});
StyleDictionary.registerFormat({
  name: 'vt/ts',
  format: ({ dictionary }) => `// ${HEADER}\nexport const colours = ${JSON.stringify(nest(dictionary.allTokens), null, 2)} as const;\n`,
});
StyleDictionary.registerFormat({
  name: 'vt/python',
  format: ({ dictionary }) => {
    const n = nest(dictionary.allTokens);
    const lines = [`"""${HEADER}"""`, '', 'HEX = {'];
    for (const [g, v] of Object.entries(n)) for (const [k, hex] of Object.entries(v)) lines.push(`    '${g}.${k}': '${hex}',`);
    lines.push('}', '', '# Linear RGB (0-1), as glTF baseColorFactor expects', 'LINEAR = {');
    for (const [g, v] of Object.entries(n)) for (const [k, hex] of Object.entries(v)) lines.push(`    '${g}.${k}': (${linear(hex).join(', ')}),`);
    lines.push('}', '');
    return lines.join('\n');
  },
});

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  log: { verbosity: 'silent' },
  platforms: {
    browser: { buildPath: 'public/tokens/', files: [{ destination: 'colours.js', format: 'vt/browser-js' }] },
    app: { buildPath: 'app/', files: [{ destination: 'tokens.generated.ts', format: 'vt/ts' }] },
    python: { buildPath: 'tools/tokens/', files: [{ destination: 'colours.py', format: 'vt/python' }] },
  },
});
await sd.buildAllPlatforms();
console.log('Colour tokens built.');
