"""Palatally displaced upper canine vs normal canine eruption (age 10.5), for /ectopic-canine/.

Source: the right upper jaw of the Vivatheca dental development model at 10.5 years
(public/development/models/age-10-5.glb; Z-Anatomy, CC BY-SA 4.0, see tools/development/README.md),
so the bone, adult teeth (yellow) and baby teeth (blue) match that series exactly.

Run from the repository root:  python3 tools/canine/build.py [out_dir]   then tools/glb/finish.mjs.
Writes normal.raw.glb, palatal.raw.glb, extracted.raw.glb, report.json and downloads/*.zip;
then: node tools/glb/finish.mjs <out>/*.raw.glb --out <dir> and copy to public/ectopic-canine/models/<name>.glb.

Axes of the source (millimetres after scaling): +x towards the midline, +y up, +z forwards.

What changes in the palatal model, and why (all cited on the page):
- Only the permanent canine moves; its size and root development stay those of the series at 10.5 years.
- Angle of its long axis to the midline on a panoramic view (read in the plane of the arch at the
  canine): 25 degrees, between the 15 degrees used to define canines at risk in one trial and the
  30 degrees above which eruption was significantly less likely (Cobourne et al. 2025).
- It is then moved bodily towards the palate (perpendicular to the arch at the lateral incisor) until
  its cusp is palatal to the lateral incisor root at the same height and the whole tooth is at least
  CLEAR mm from the incisors and premolars (drawn). Most displaced canines are palatal (Ericson &
  Kurol 1987). The search stops before the cusp gets closer than 6 mm to the midsagittal plane, the
  cut-off below which canines needed surgical exposure despite extraction of the baby canine
  (Naoumova et al. 2015). Result: cusp 6.1 mm from the midline (report.json).
- Where the moved crown leaves the bone, a bony crypt wall of 1.73 mm is added, as the
  development series does (Bhattad et al. 2015).
- The baby canine stays (retained primary canine, a sign of a displaced canine: Cobourne et al. 2025).
  extracted.glb removes it: the interceptive extraction option.
"""
import json
import os
import struct
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import manifold3d as mf
import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.mkdtemp())
OUT.mkdir(parents=True, exist_ok=True)
ANGLE = float(os.environ.get('ANGLE', 25))   # degrees to the midline on a panoramic view
MIDLINE_MIN = 6.0                             # mm, cusp to the midsagittal plane (Naoumova et al. 2018 cut-off)
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


pivot = (apex + cusp) / 2          # turned about the middle of the tooth, then moved bodily (drawn)
d0 = cusp - apex
t = np.radians(ANGLE)
u = np.sin(t) * m - np.cos(t) * up
i2_pal = (i2.vertices @ b).min()
tree_post = trimesh.proximity.ProximityQuery(trimesh.util.concatenate(adult[:5]))
L = np.linalg.norm(d0)
# palatal direction at the lateral incisor (the arch turns between canine and incisors)
t2 = i1.centroid - canine.centroid
t2[1] = 0
t2 /= np.linalg.norm(t2)
p2 = np.cross(up, t2)
if p2[0] < 0:
    p2 = -p2
MID = bone.bounds[1][0]                         # midsagittal plane of the half maxilla
R = rot_between(d0, u * L)
best = None
for shift in np.arange(0, 14.01, 0.25):         # moved bodily towards the palate until clear of the incisor
    moved = canine.copy()
    moved.vertices = (canine.vertices - pivot) @ R.T + pivot + shift * p2
    tgt = (cusp - pivot) @ R.T + pivot + shift * p2
    band = i2.vertices[np.abs(i2.vertices[:, 1] - tgt[1]) < 3]
    if tgt @ p2 < (band @ p2).max():
        continue                                  # cusp not yet palatal to the lateral incisor at its level
    if MID - tgt[0] < MIDLINE_MIN:
        break
    gap = -tree_inc.signed_distance(moved.vertices[::2]).max()
    gp = -tree_post.signed_distance(moved.vertices[::2]).max()
    if gap >= CLEAR and gp >= CLEAR:
        best = (0.0, moved, tgt, gap, float(shift))
        break
assert best, 'no palatal position clear of the incisors'
back, moved, tgt, gap, shift = best
new_cusp = tgt
new_apex = (apex - pivot) @ R.T + pivot + shift * p2


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
write('extracted', [('bone', bone_p), ('teeth', teeth), ('canine', moved), ('baby-teeth', babies)])

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
    'cusp_to_midline_mm': round(float(MID - new_cusp[0]), 1),
    'gap_to_incisors_mm': round(float(gap), 2),
    'gap_to_premolars_molars_mm': round(gap_post, 2),
    'tooth_outside_bone_vertices': int(len(outside)),
    'crypt_wall_added_mm3': round(added, 0),
}
(OUT / 'report.json').write_text(json.dumps(rep, indent=1))
print(json.dumps(rep, indent=1))

# STL print parts, 1.5 times life size like the dental development series (child teeth are small)
MODEL_DISCLAIMER = __import__('re').search(r"modelDisclaimer =\s*'([^']+)'", (ROOT / 'app/disclaimer-text.ts').read_text()).group(1)
README = """Vivatheca palatally displaced upper canine model (age 10.5 years, right upper jaw), {what}, 1.5 times life size, STL in millimetres.

Not yet clinically reviewed.
{disclaimer}
Printed models are not sterile and must not be put in the mouth. Small parts are a choking hazard.
Full disclaimer: https://vivatheca.com/disclaimer

Parts: bone, adult teeth (print yellow) and baby teeth (print blue), so you can print them in different colours. The parts overlap; load them together as one object in your slicer.
Sources and how the model was made: https://vivatheca.com/ectopic-canine/

3D model made by Vivatheca from the Vivatheca dental development model at 10.5 years, itself made from Z-Anatomy (the libre 3D atlas of anatomy, CC BY-SA 4.0), which uses BodyParts3D (The Database Center for Life Science, CC BY-SA 2.1 Japan). Changed: {changed} Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
"""
DL = OUT / 'downloads'
DL.mkdir(exist_ok=True)
for name, what, changed, parts in [
        ('normal', 'canine erupting normally', 'none (as the development series).',
         {'bone': bone, 'adult-teeth': trimesh.util.concatenate(others + [canine]), 'baby-teeth': trimesh.util.concatenate(baby)}),
        ('palatal', 'canine displaced towards the palate, baby canine still in place', 'the adult canine turned and moved towards the palate, with a bony wall added over it.',
         {'bone': bone_p, 'adult-teeth': trimesh.util.concatenate(others + [moved]), 'baby-teeth': trimesh.util.concatenate(baby)})]:
    with zipfile.ZipFile(DL / f'vivatheca-ectopic-canine-{name}-1.5x.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for part, m in parts.items():
            mm = m.copy()
            mm.apply_scale(1.5)
            z.writestr(f'{name}-{part}.stl', mm.export(file_type='stl'))
        z.writestr('README.txt', README.format(what=what, disclaimer=MODEL_DISCLAIMER, changed=changed))
