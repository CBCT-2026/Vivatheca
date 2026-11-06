"""Simplify, colour and Draco-compress the stage GLBs; write print STLs and zips.
Run: python3 finish.py <build_out> <site_dir>   (needs npx; @gltf-transform/cli 4.1.1 as the development series)"""
import json, struct, subprocess, sys, zipfile
from pathlib import Path
import numpy as np, trimesh
# Linear RGB. Bone: latest wisdom tooth model. Teeth: #E3DCD3, slightly lighter than bone (Luke, 5 Nov 2026).
COL = {'bone': [0.6724, 0.5972, 0.4969, 1], 'teeth': [0.8963, 0.855, 0.7758, 1], 'lost': [0.80, 0.16, 0.14, 0.35]}
NAME = {'bone': 'bone', 'teeth': 'teeth', 'lost': 'lost-bone'}
src, site = Path(sys.argv[1]), Path(sys.argv[2])
models = site / 'models'; dl = site / 'downloads'; models.mkdir(parents=True, exist_ok=True); dl.mkdir(parents=True, exist_ok=True)
tmp = src / 'tmp'; tmp.mkdir(exist_ok=True)
README = (Path(__file__).with_name('print-readme.txt')).read_text()
GT = ['npx', '-y', '@gltf-transform/cli@4.1.1']
def glb_json(b):
    n = struct.unpack('<I', b[12:16])[0]; return json.loads(b[20:20 + n]), b[20 + n:]
def glb_pack(j, rest):
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    return b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest
for f in sorted(src.glob('*.glb')):
    s = tmp / ('s-' + f.name)
    subprocess.run(GT + ['simplify', str(f), str(s), '--ratio', '0.15', '--error', '0.0002'], check=True, capture_output=True)
    j, rest = glb_json(s.read_bytes())
    for m in j['materials']:
        k = m['name']; pm = m.setdefault('pbrMetallicRoughness', {})
        pm['baseColorFactor'] = COL[k]; pm['roughnessFactor'] = 0.7; pm['metallicFactor'] = 0.0; m['name'] = NAME[k]
        if k == 'lost': m['alphaMode'] = 'BLEND'; m['doubleSided'] = True
    c = tmp / ('c-' + f.name); c.write_bytes(glb_pack(j, rest))
    subprocess.run(GT + ['draco', str(c), str(models / f.name)], check=True, capture_output=True)
    # print parts from the simplified mesh: back to millimetres, Z up
    sc = trimesh.load(s); z = zipfile.ZipFile(dl / f'vivatheca-periodontitis-{f.stem}-1.0x.zip', 'w', zipfile.ZIP_DEFLATED)
    for name, g in sc.geometry.items():
        if name not in ('bone', 'teeth'): continue
        v = g.vertices * 1000; g = trimesh.Trimesh(np.c_[v[:, 0], -v[:, 2], v[:, 1]], g.faces)
        z.writestr(f'{f.stem}-{name}.stl', g.export(file_type='stl'))
        print(f.stem, name, len(g.faces), 'watertight' if g.is_watertight else 'NOT watertight')
    z.writestr('README.txt', README); z.close()
    print(f.name, (models / f.name).stat().st_size, (dl / z.filename.split('/')[-1]).stat().st_size)
