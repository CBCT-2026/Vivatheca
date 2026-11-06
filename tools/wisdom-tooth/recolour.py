"""Give the wisdom tooth GLBs' teeth the shared tooth colour, slightly lighter than bone.

The site copies of impacted-molar.glb and wisdom-tooth-normal.glb had teeth and the
wisdom tooth in the bone colour. Every other Vivatheca model uses bone linear
(0.6724, 0.5972, 0.4969) and teeth linear (0.768, 0.716, 0.651), and the colour standard
asks for teeth and bone in slightly different colours. Only material colours change.

Usage: python3 tools/wisdom-tooth/recolour.py public/models/impacted-molar.glb public/models/wisdom-tooth-normal.glb
"""
import json
import struct
import sys

TOOTH = [0.768, 0.716, 0.651, 1]

for path in sys.argv[1:]:
    data = open(path, 'rb').read()
    jlen = struct.unpack('<I', data[12:16])[0]
    gltf = json.loads(data[20:20 + jlen])
    rest = data[20 + jlen:]
    for m in gltf['materials']:
        if m.get('name') in ('teeth', 'wisdom tooth'):
            m['pbrMetallicRoughness']['baseColorFactor'] = TOOTH
    j = json.dumps(gltf, separators=(',', ':')).encode()
    j += b' ' * (-len(j) % 4)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 20 + len(j) + len(rest)))
        fh.write(struct.pack('<II', len(j), 0x4E4F534A) + j + rest)
    print(path, 'teeth recoloured')
