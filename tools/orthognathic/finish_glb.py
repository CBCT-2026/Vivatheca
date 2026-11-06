"""Set exact material values in the GLBs (trimesh rounds colours to 8 bits), then Draco-compress.
Run: python3 finish_glb.py <in_dir> <out_dir>   (needs npx; @gltf-transform/cli 4.1.1, as the development series)"""
import json, struct, subprocess, sys
from pathlib import Path
FINISH = Path(__file__).resolve().parents[2] / 'tools' / 'glb' / 'finish.mjs'  # shared tidy + Draco step
COL = {  # keep in step with COL in generate.py
    'bone': ([0.6724, 0.5972, 0.4969, 1], 0.7, 0.0), 'moved': ([0.6724, 0.5972, 0.4969, 1], 0.7, 0.0),
    'teeth': ([0.8963, 0.855, 0.7758, 1], 0.45, 0.0), 'cut': ([0.62, 0.08, 0.06, 1], 0.6, 0.0),
    'plate': ([0.72, 0.74, 0.77, 1], 0.3, 0.6), 'screw': ([0.45, 0.47, 0.5, 1], 0.35, 0.6),
    'before': ([0.12, 0.45, 0.85, 0.0], 0.6, 0.0)}
src, dst = Path(sys.argv[1]), Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
for f in sorted(src.glob('*.glb')):
    b = f.read_bytes(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]
    for m in j['materials']:
        c, r, mt = COL[m['name']]
        m['pbrMetallicRoughness'] = {'baseColorFactor': c, 'roughnessFactor': r, 'metallicFactor': mt}
        if m['name'] == 'before': m['alphaMode'] = 'BLEND'
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest
    tmp = dst / ('raw-' + f.name); tmp.write_bytes(out)
    subprocess.run(['node', str(FINISH), str(tmp), '--out', str(dst / f.name)], check=True)
    tmp.unlink(); print(f.name, (dst / f.name).stat().st_size)
