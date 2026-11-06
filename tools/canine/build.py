"""Palatally displaced upper canine vs normal canine eruption (age 10.5), for /ectopic-canine/.

Source: the right upper jaw of the Vivatheca dental development model at 10.5 years
(public/development/models/age-10-5.glb; Z-Anatomy, CC BY-SA 4.0, see tools/development/README.md),
so the bone, adult teeth (yellow) and baby teeth (blue) match that series exactly.

Run from the repository root:  python3 tools/canine/build.py [out_dir]   then tools/glb/finish.mjs.
Writes normal.glb, palatal.glb, palatal-extracted.glb and report.json.

Axes of the source (millimetres after scaling): +x towards the midline, +y up, +z forwards.

What changes in the palatal model, and why (all cited on the page):
- Only the permanent canine moves. It is turned about its root tip, so tooth length and root
  development stay those of the development series at 10.5 years.
- Angle of its long axis to the midline on a front-on view: 30 degrees. Eruption is significantly
  less likely at 30 degrees or more (Cobourne et al. 2025 re-analysis).
- Its crown is moved towards the palate until the whole tooth is behind (palatal to) the lateral
  incisor root, with at least CLEAR mm between them: most displaced canines are palatal
  (Ericson & Kurol 1987); the cusp then lies over the lateral incisor root on a panoramic view
  (sector 3 or more, Cobourne et al. 2025).
- Where the moved crown leaves the bone, a bony crypt wall of 1.73 mm is added, as the
  development series does (Bhattad et al. 2015).
- The baby canine stays (retained primary canine, a sign of a displaced canine: Cobourne et al. 2025).
  palatal-extracted.glb removes it: the interceptive extraction option.
"""
import json
import os
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

import manifold3d as mf
import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.mkdtemp())
OUT.mkdir(parents=True, exist_ok=True)
ANGLE = float(os.environ.get('ANGLE', 30))   # degrees to the midline, front-on view
CLEAR = 0.5                                   # mm between canine and incisor roots (drawn)
CRYPT = 1.73                                  # mm, Bhattad et al. 2015 (as the development series)
COL = {'bone': [0.6724, 0.5972, 0.4969, 1], 'teeth': [0.768, 0.624, 0.102, 1],
       'canine': [0.768, 0.624, 0.102, 1], 'baby-teeth': [0.1, 0.22, 0.62, 1], 'baby-canine': [0.1, 0.22, 0.62, 1]}

src = OUT / 'src.glb'
subprocess.run([str(ROOT / 'node_modules/.bin/gltf-transform'), 'copy',
                str(ROOT / 'public/development/models/age-10-5.glb'), str(src)], check=True, capture_output=True)
scene = trimesh.load(src)


def part(name):
    g = scene.geometry[name].copy()
    g.apply_transform(scene.graph.get(name)[0])
    g.apply_scale(1000.0)
    return g


bone = part('upper-bone')
adult = sorted(part('upper-adult-teeth').split(only_watertight=False), key=lambda m: m.centroid[2])
baby = sorted(part('upper-baby-teeth').split(only_watertight=False), key=lambda m: m.centroid[2])
# back to front: M3 M2 M1 PM2 PM1 C I2 I1 ; baby m2 m1 c
assert len(adult) == 8 and len(baby) == 3, (len(adult), len(baby))
canine, i2, i1 = adult[5], adult[6], adult[7]
others = adult[:5] + [i2, i1]
bcanine = baby[2]

# long axis of the canine (first principal axis), pointing from root tip to cusp (downwards)
v = canine.vertices
c0 = v.mean(0)
ax = np.linalg.svd(v - c0)[2][0]
ax = ax if ax[1] < 0 else -ax
proj = (v - c0) @ ax
apex = v[np.argmin(proj)]
cusp = v[np.argmax(proj)]
length = float(proj.max() - proj.min())


def frontal_angle(d):
    """angle to the vertical (midline) seen from the front: x-y plane"""
    return float(np.degrees(np.arctan2(d[0], -d[1])))


def rot_between(a, b):
    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
    k = np.cross(a, b)
    s, c = np.linalg.norm(k), float(a @ b)
    if s < 1e-9:
        return np.eye(3)
    k /= s
    K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    return np.eye(3) + np.sin(np.arccos(c)) * K + (1 - c) * K @ K


tree_inc = trimesh.proximity.ProximityQuery(trimesh.util.concatenate([i2, i1]))
i2_root_back = i2.bounds[0][2]
# Panoramic angles and sectors are read in the plane of the arch at the canine: the mesial direction m
# (first premolar to lateral incisor, horizontal) and the vertical; b points to the cheek (buccal).
pm1 = adult[4]
m = i2.centroid - pm1.centroid
m[1] = 0
m /= np.linalg.norm(m)
up = np.array([0.0, 1.0, 0.0])
b = -np.cross(m, up)
if (canine.centroid - bone.centroid) @ b < 0:
    b = -b


def pano_angle(d):
    return float(np.degrees(np.arctan2(d @ m, -(d @ up))))


pivot = (apex + cusp) / 2          # turned about the middle of the tooth (drawn choice, see the page)
d0 = cusp - apex
t = np.radians(ANGLE)
u = np.sin(t) * m - np.cos(t) * up
i2_pal = (i2.vertices @ b).min()
tree_post = trimesh.proximity.ProximityQuery(trimesh.util.concatenate(adult[:5]))
L = np.linalg.norm(d0)
best = None
for shift in np.arange(0, 8.01, 0.5):            # whole tooth moved towards the palate (mm)
    for phi in np.arange(0, -45.01, -2.5):        # crown tilted towards the palate (degrees)
        f = np.radians(phi)
        d = np.cos(f) * u + np.sin(f) * b
        R = rot_between(d0, d * L)
        moved = canine.copy()
        moved.vertices = (canine.vertices - pivot) @ R.T + pivot - shift * b
        tgt = (cusp - pivot) @ R.T + pivot - shift * b
        crown = moved.vertices[((moved.vertices - tgt) @ (d)) > -0.4 * L]
        if (crown @ b).max() > i2_pal:
            continue                              # crown not yet wholly palatal to the lateral incisor
        gap = -tree_inc.signed_distance(moved.vertices[::2]).max()
        gp = -tree_post.signed_distance(moved.vertices[::2]).max()
        if gap >= CLEAR and gp >= CLEAR:
            best = (float(phi), moved, tgt, gap, float(shift))
            break
    if best:
        break
assert best, 'no palatal position clear of the incisors'
back, moved, tgt, gap, shift = best
new_cusp = tgt
new_apex = moved.vertices[np.argmin((moved.vertices - tgt) @ (tgt - pivot))]


def man(m):
    return mf.Manifold(mf.Mesh(vert_properties=np.asarray(m.vertices, np.float32), tri_verts=np.asarray(m.faces, np.uint32)))


def tri(M):
    me = M.to_mesh()
    return trimesh.Trimesh(me.vert_properties[:, :3], me.tri_verts, process=True)


# crypt wall where the moved canine is outside bone
bq = trimesh.proximity.ProximityQuery(bone)
sd = bq.signed_distance(moved.vertices)            # >0 inside bone
outside = moved.vertices[sd < 0]
added = 0.0
bone_p = bone
if len(outside):
    dirs = trimesh.creation.icosphere(1).vertices
    pts = (moved.vertices[:, None, :] + CRYPT * dirs[None]).reshape(-1, 3)
    shell = trimesh.convex.convex_hull(pts)
    # keep the wall only where the tooth leaves the bone: hull minus (bone grown inwards is not needed)
    nb = man(bone) + man(shell)
    bone_p = tri(nb)
    added = float(bone_p.volume - bone.volume)

# second check: overlap with the other teeth (premolars) after moving
tq = trimesh.proximity.ProximityQuery(trimesh.util.concatenate(adult[:5]))
gap_post = float(-tq.signed_distance(moved.vertices[::2]).max())


def write(name, parts):
    s = trimesh.Scene()
    for nm, m in parts:
        mm = m.copy()
        mm.apply_scale(0.001)
        mm.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            name=nm, baseColorFactor=[int(c * 255) for c in COL[nm]], roughnessFactor=0.7, metallicFactor=0.0))
        s.add_geometry(mm, node_name=nm, geom_name=nm)
    p = OUT / (name + '.raw.glb')
    s.export(p)
    b = p.read_bytes()
    n = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + n])
    rest = b[20 + n:]
    for m in j['materials']:
        m['pbrMetallicRoughness']['baseColorFactor'] = COL[m['name']]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    p.write_bytes(b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest)


teeth = trimesh.util.concatenate(others)
babies = trimesh.util.concatenate(baby[:2])
write('normal', [('bone', bone), ('teeth', teeth), ('canine', canine), ('baby-teeth', babies), ('baby-canine', bcanine)])
write('palatal', [('bone', bone_p), ('teeth', teeth), ('canine', moved), ('baby-teeth', babies), ('baby-canine', bcanine)])
write('palatal-extracted', [('bone', bone_p), ('teeth', teeth), ('canine', moved), ('baby-teeth', babies)])

rel = (new_cusp @ m - (i2.vertices @ m).min()) / np.ptp(i2.vertices @ m)   # 0 = distal edge, 1 = mesial edge of I2
rep = {
    'canine_length_mm': round(length, 1),
    'normal_pano_angle_deg': round(pano_angle(cusp - apex), 1),
    'palatal_pano_angle_deg': round(pano_angle(new_cusp - new_apex), 1),
    'apex_shift_mm': [round(float(x), 1) for x in new_apex - apex],
    'palatal_tilt_deg': back,
    'palatal_shift_mm': shift,
    'cusp_shift_mm': [round(float(x), 1) for x in new_cusp - cusp],
    'cusp_across_lateral_incisor_0distal_1mesial': round(float(rel), 2),
    'cusp_to_bone_midline_mm': round(float(bone.bounds[1][0] - new_cusp[0]), 1),
    'gap_to_incisors_mm': round(float(gap), 2),
    'gap_to_premolars_molars_mm': round(gap_post, 2),
    'tooth_outside_bone_vertices': int(len(outside)),
    'crypt_wall_added_mm3': round(added, 0),
}
(OUT / 'report.json').write_text(json.dumps(rep, indent=1))
print(json.dumps(rep, indent=1))
