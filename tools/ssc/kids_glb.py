"""Child-friendly copies of the stainless steel crown models for /stainless-steel-crown/kids/.
Only the colours change: the baby tooth is blue and the adult tooth yellow, the Vivatheca colour
standard for development and paediatric models (same values as tools/development/generate.py,
after the Schour-Massler chart colours). Geometry and Draco compression are untouched.
Run: python3 tools/ssc/kids_glb.py public/stainless-steel-crown/models public/stainless-steel-crown/kids/models"""
import json, struct, sys
from pathlib import Path
COL = {'teeth': [0.1, 0.22, 0.62, 1], 'premolar': [0.768, 0.624, 0.102, 1]}
STAGES = ('healthy', 'decay', 'prepared', 'crown')
src, dst = Path(sys.argv[1]), Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
for name in STAGES:
    b = (src / f'{name}.glb').read_bytes()
    n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]
    for m in j['materials']:
        if m['name'] in COL: m['pbrMetallicRoughness']['baseColorFactor'] = COL[m['name']]
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest
    (dst / f'{name}.glb').write_bytes(out)
    print(name, [m['name'] for m in j['materials']], len(out))
