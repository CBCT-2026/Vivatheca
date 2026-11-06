"""Set exact material colours in the stage GLBs (trimesh rounds them to 8 bits), then Draco-compress.
Run: python3 finish_glb.py <in_dir> <out_dir>   (needs npx; @gltf-transform/cli 4.1.1, as tools/development)"""
import json, struct, subprocess, sys, runpy
from pathlib import Path
MAT = {
    'bone': [0.6724, 0.5972, 0.4969, 1], 'teeth': [0.8963, 0.855, 0.7758, 1], 'premolar': [0.8963, 0.855, 0.7758, 1],
    'pulp': [0.576, 0.031, 0.043, 1], 'gum': [0.62, 0.20, 0.22, 1], 'decay': [0.13, 0.065, 0.025, 1],
    'filling': [0.42, 0.32, 0.72, 1], 'cement': [0.93, 0.90, 0.80, 1], 'steel': [0.75, 0.75, 0.77, 1],
}
src, dst = Path(sys.argv[1]), Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
for name in ('healthy', 'decay', 'filling', 'prepared', 'crown'):
    f = src / f'{name}.glb'
    b = f.read_bytes(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]
    for m in j['materials']:
        m['pbrMetallicRoughness']['baseColorFactor'] = MAT[m['name']]
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest
    tmp = dst / ('raw-' + f.name); tmp.write_bytes(out)
    subprocess.run(['npx', '-y', '@gltf-transform/cli@4.1.1', 'draco', str(tmp), str(dst / f.name)], check=True, capture_output=True)
    tmp.unlink(); print(f.name, (dst / f.name).stat().st_size)
