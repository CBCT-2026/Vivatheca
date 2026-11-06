"""Set every model's tooth materials to the shared tooth white (Luke, 2026-11-06).

The wisdom tooth model (v1.3) set the standard: teeth sRGB #F3EEE4 (linear 0.8963, 0.855,
0.7758), slightly lighter than bone (linear 0.6724, 0.5972, 0.4969). This changes only tooth
materials that still carry the old shared tooth colour (linear ~0.768, 0.716, 0.651), so
development models (blue baby / yellow adult teeth), ABG and cut faces are left alone.

Usage: python3 tools/recolour_teeth.py public/**/*.glb
"""
import json
import os
import struct
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'tokens'))
from colours import LINEAR  # shared colour tokens (tokens/model.json, `pnpm tokens`)

TOOTH = list(LINEAR['model.tooth']) + [1]
OLD = (0.769, 0.717, 0.65)
NAMES = {'teeth', 'tooth', 'premolar', 'wisdom tooth'}

for path in sys.argv[1:]:
    data = open(path, 'rb').read()
    jlen = struct.unpack('<I', data[12:16])[0]
    gltf = json.loads(data[20:20 + jlen])
    rest = data[20 + jlen:]
    hits = []
    for m in gltf.get('materials', []):
        c = m.get('pbrMetallicRoughness', {}).get('baseColorFactor')
        if m.get('name') in NAMES and c and all(abs(a - b) < 0.005 for a, b in zip(c[:3], OLD)):
            m['pbrMetallicRoughness']['baseColorFactor'] = TOOTH[:3] + [c[3] if len(c) > 3 else 1]
            hits.append(m['name'])
    if not hits:
        continue
    j = json.dumps(gltf, separators=(',', ':')).encode()
    j += b' ' * (-len(j) % 4)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 20 + len(j) + len(rest)))
        fh.write(struct.pack('<II', len(j), 0x4E4F534A) + j + rest)
    print(path, ', '.join(hits))
