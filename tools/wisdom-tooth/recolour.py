"""Set the wisdom tooth GLBs' tooth and nerve colours.

Luke (2026-11-06): teeth in a realistic white tooth colour, the inferior alveolar nerve
in yellow, every other structure unchanged. Bone stays linear (0.6724, 0.5972, 0.4969),
so teeth (sRGB #F3EEE4, slightly warm white) stay a little lighter than bone. The nerve
material is renamed from "nerve red" to "nerve". Only material colours change.

Usage: python3 tools/wisdom-tooth/recolour.py public/models/impacted-molar.glb public/models/wisdom-tooth-normal.glb
"""
import json
import struct
import sys

TOOTH = [0.8963, 0.855, 0.7758, 1]   # sRGB #F3EEE4 in linear
NERVE = [0.8879, 0.5395, 0.0296, 1]  # sRGB #F2C230 in linear

for path in sys.argv[1:]:
    data = open(path, 'rb').read()
    jlen = struct.unpack('<I', data[12:16])[0]
    gltf = json.loads(data[20:20 + jlen])
    rest = data[20 + jlen:]
    for m in gltf['materials']:
        if m.get('name') in ('teeth', 'wisdom tooth'):
            m['pbrMetallicRoughness']['baseColorFactor'] = TOOTH
        elif m.get('name') in ('nerve red', 'nerve'):
            m['name'] = 'nerve'
            m['pbrMetallicRoughness']['baseColorFactor'] = NERVE
    j = json.dumps(gltf, separators=(',', ':')).encode()
    j += b' ' * (-len(j) % 4)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 20 + len(j) + len(rest)))
        fh.write(struct.pack('<II', len(j), 0x4E4F534A) + j + rest)
    print(path, 'teeth and nerve recoloured')
