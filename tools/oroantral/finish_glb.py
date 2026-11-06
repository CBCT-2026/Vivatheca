"""Set exact material colours in the stage GLBs (trimesh rounds them to 8 bits), then Draco-compress.
Run: python3 finish_glb.py <in_dir> <out_dir>   (needs npx; uses @gltf-transform/cli 4.1.1 as the other model pages do)"""
import json, struct, subprocess, sys
from pathlib import Path
COL = {
    'bone': [0.6724, 0.5972, 0.4969, 1], 'teeth': [0.8963, 0.855, 0.7758, 1], 'gum': [0.70, 0.25, 0.28, 1],
    'sinus': [0.18, 0.48, 0.86, 0.38], 'lining': [0.80, 0.22, 0.16, 0.85], 'tract': [0.62, 0.05, 0.10, 1],
    'clot': [0.26, 0.015, 0.02, 1], 'flap': [0.95, 0.52, 0.42, 1], 'fat': [0.93, 0.62, 0.08, 1],
}
src, dst = Path(sys.argv[1]), Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
for f in sorted(src.glob('*.glb')):
    b = f.read_bytes(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]
    for m in j['materials']:
        m['pbrMetallicRoughness']['baseColorFactor'] = COL[m['name']]
        if COL[m['name']][3] < 1: m['alphaMode'] = 'BLEND'
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest
    tmp = dst / ('raw-' + f.name); tmp.write_bytes(out)
    subprocess.run(['npx', '-y', '@gltf-transform/cli@4.1.1', 'draco', str(tmp), str(dst / f.name)], check=True, capture_output=True)
    tmp.unlink(); print(f.name, (dst / f.name).stat().st_size)
