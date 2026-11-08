"""Make the alveolar bone graft (ABG) STL download zips from the web GLBs.

The web GLBs in public/models/abg/ are Draco-compressed (KHR_draco_mesh_compression) and have no node
transforms, so each part is decoded with DracoPy and written as its own STL in millimetres (1 m = 1000 mm). Each zip gets a README with the review status, model disclaimer, credit and licence.

Run: pip install DracoPy numpy && python3 tools/abg/make_print_zips.py
"""
import io
import json
import struct
import zipfile
from pathlib import Path

import DracoPy
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'public/models/abg'
PAGE = 'https://vivatheca.com/models/alveolar-bone-graft'
FIXED_TIME = (2026, 11, 6, 0, 0, 0)  # stable zips, so rebuilding does not change them

STAGES = [
    ('abg-1-pre-op', 'Stage 1, before the graft (about 9 to 10 years old): left alveolar cleft, no left lateral incisor, unerupted canine.'),
    ('abg-2-during-braces', 'Stage 2, after the graft (about 12 to 13 years old): bone graft in the cleft, canine erupted through it, braces.'),
    ('abg-3-long-term', 'Stage 3, long term (adult): healed graft. The option-* parts are the ways to fill the gap (empty space, implant, bridge, partial denture); print one at a time, as they overlap.'),
    ('abg-3b-substitution', 'Stage 3, long term (adult), canine substitution: the canine moved into the gap and reshaped.'),
]

CITATION = ('CBCT-2026 (Founder & Director). Vivatheca: Alveolar bone graft in cleft lip and palate, version 0.1. 2026. '
            f'{PAGE}. Licensed under CC BY-SA 4.0. Accessed [date].')

DISCLAIMER = (
    'Not yet clinically reviewed.\n'
    'Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. '
    'Not for diagnosis, treatment planning, surgical guides or use in or on the body.\n'
    'Full disclaimer: https://vivatheca.com/disclaimer\n'
)


def read_glb(path):
    data = path.read_bytes()
    offset, gltf, binary = 12, None, None
    while offset < len(data):
        length, kind = struct.unpack('<II', data[offset:offset + 8])
        chunk = data[offset + 8:offset + 8 + length]
        if kind == 0x4E4F534A:
            gltf = json.loads(chunk)
        elif kind == 0x004E4942:
            binary = chunk
        offset += 8 + length
    return gltf, binary


def binary_stl(name, vertices, faces):
    tri = vertices[faces]
    normals = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    lengths = np.linalg.norm(normals, axis=1, keepdims=True)
    normals = np.divide(normals, lengths, out=np.zeros_like(normals), where=lengths > 0)
    record = np.zeros(len(faces), dtype=[('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')])
    record['n'] = normals
    record['v'] = tri
    header = f'Vivatheca {name} (mm, CC BY-SA 4.0)'.encode()[:80].ljust(80, b' ')
    return header + struct.pack('<I', len(faces)) + record.tobytes()


def stage_parts(path):
    gltf, binary = read_glb(path)
    parts = []
    for node in gltf['nodes']:
        if 'mesh' not in node:
            continue
        assert not any(key in node for key in ('matrix', 'translation', 'rotation', 'scale')), 'node transforms not handled'
        verts, faces = [], []
        for prim in gltf['meshes'][node['mesh']]['primitives']:
            draco = prim['extensions']['KHR_draco_mesh_compression']
            view = gltf['bufferViews'][draco['bufferView']]
            start = view.get('byteOffset', 0)
            mesh = DracoPy.decode(binary[start:start + view['byteLength']])
            base = sum(len(v) for v in verts)
            verts.append(np.asarray(mesh.points, dtype=np.float64) * 1000.0)
            faces.append(np.asarray(mesh.faces, dtype=np.int64).reshape(-1, 3) + base)
        parts.append((node['name'], np.vstack(verts), np.vstack(faces)))
    return parts


def main():
    for stem, description in STAGES:
        parts = stage_parts(SRC / f'{stem}.glb')
        allv = np.vstack([v for _, v, _ in parts])
        size = allv.max(axis=0) - allv.min(axis=0)
        names = ', '.join(name for name, _, _ in parts)
        readme = (
            f'Vivatheca: alveolar bone graft in cleft lip and palate. {description}\n'
            f'One STL per part ({names}), in millimetres, about {size[0]:.0f} x {size[1]:.0f} x {size[2]:.0f} mm. Scale it in your slicer as you need. '
            'The parts are made from the web model, which is simplified for the screen: they are not checked as closed solids '
            'and have no print fittings (pegs or gaps), so repair them in your slicer before printing.\n\n'
            f'{DISCLAIMER}\n'
            f'What the model shows, what is simplified, and its sources: {PAGE}\n\n'
            'Made by CBCT-2026 (Founder & Director), Vivatheca, for a patient education research study. Licence: CC BY-SA 4.0 '
            '(https://creativecommons.org/licenses/by-sa/4.0/). If you share a changed version, share it under CC BY-SA 4.0.\n'
            f'How to credit: {CITATION}\n'
        )
        out = SRC / f'vivatheca-{stem}-stl.zip'
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
            for name, v, f in parts:
                info = zipfile.ZipInfo(f'{stem}-{name}.stl', FIXED_TIME)
                info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(info, binary_stl(f'{stem} {name}', v, f))
            info = zipfile.ZipInfo('README.txt', FIXED_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, readme)
        print(f'{out.relative_to(ROOT)}: {out.stat().st_size / 1e6:.1f} MB, size {size.round(1)} mm, parts {names}')


if __name__ == '__main__':
    main()
