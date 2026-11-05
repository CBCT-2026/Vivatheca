"""Set exact material colours in the stage GLBs (trimesh rounds them to 8 bits), then Draco-compress.
Run: python3 finish_glb.py <in_dir> <out_dir>   (needs npx; uses @gltf-transform/cli 4.1.1 as the wisdom tooth site does)"""
import json, struct, subprocess, sys
from pathlib import Path
COL = {'bone': [0.6724, 0.5972, 0.4969, 1], 'adult': [0.6724, 0.5972, 0.4969, 1], 'baby': [0.1, 0.22, 0.62, 1]}
NAME = {'bone': 'bone', 'adult': 'teeth', 'baby': 'baby-teeth'}
src, dst = Path(sys.argv[1]), Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
for f in sorted(src.glob('age-*.glb')):
    if f.stem.endswith(('-upper', '-lower')): continue
    b = f.read_bytes(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]
    for m in j['materials']:
        k = m['name']; m['pbrMetallicRoughness']['baseColorFactor'] = COL[k]; m['name'] = NAME[k]
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest
    tmp = dst / ('raw-' + f.name); tmp.write_bytes(out)
    subprocess.run(['npx', '-y', '@gltf-transform/cli@4.1.1', 'draco', str(tmp), str(dst / f.name)], check=True, capture_output=True)
    tmp.unlink(); print(f.name, (dst / f.name).stat().st_size)
