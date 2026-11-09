"""Build the 3D models for the dentigerous cyst treatment options page (/dentigerous-cyst/options/).

The "Before" step of each option uses the parent model page's own GLB, so no before.glb is written.

Usage: python3 tools/options/cyst/build.py          (writes build/options/cyst/*.glb, uncompressed)
then:  node tools/glb/finish.mjs build/options/cyst/*.glb --out public/dentigerous-cyst/options/models
then:  node tools/labels/anchors.mjs

Every model starts from the site's dentigerous cyst model (public/dentigerous-cyst/models/cyst-cut.glb and
cyst-whole.glb, built by tools/cyst/build.py from BodyParts3D, CC BY 4.0; millimetre units). The cut model is a
section through the jaw seen from the cheek side: the jaw, the other teeth and the section colours are copied
unchanged. Only the cyst, the unerupted third molar (38) and a window in the bone above the cyst change.

Clinical steps shown, and their sources:
- Enucleation: the whole cyst lining is removed in one piece, here together with the third molar, through a bone
  window; the cavity fills with bone over the following months. Pogrel MA, Jordan RC. J Oral Maxillofac Surg.
  2004;62(6):651-655 (doi:10.1016/j.joms.2003.08.029); Wushou A, et al. BMC Oral Health. 2024;24(1):39
  (doi:10.1186/s12903-023-03673-w): bone fill of the cavity seen on the 6-month radiograph (the "Later" step).
- Marsupialisation: a smaller window is made into the cyst and kept open, so the cyst slowly shrinks and new bone
  forms around it; in adults the third molar is usually removed later, with the remaining lining. Abu-Mostafa N,
  et al. Cureus. 2022;14(4):e23772 (doi:10.7759/cureus.23772): window behind the second molar, shrinkage at 4 and
  8 months, tooth moved "a few millimetres", extraction and lining removal at 8 months, bone healed 14-15 months
  later. Cobo-Vazquez CM, et al. J Stomatol Oral Maxillofac Surg. 2024;125(5S2):102115
  (doi:10.1016/j.jormas.2024.102115): systematic review of the three approaches.

Values that are DRAWN (no source gives a figure; stated on the page): window radius (ENUC_R, MARSUP_R), where the
window sits on the ridge behind the second molar, the lift of the removed piece, the shrinkage of the cyst at
8 months (SHRINK, linear) and the 3 mm the tooth has moved (Abu-Mostafa: "a few millimetres").
"""
import os
import sys

import numpy as np
import trimesh

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from lib import ROOT, MAT_REMOVED, decoded, export, faces_where, manifold, near, pbr, split_plane, tri  # noqa: E402

OUT = os.path.join(ROOT, 'build', 'options', 'cyst')
ENUC_R = 6.0       # mm, radius of the bone window for enucleation (drawn)
MARSUP_R = 3.5     # mm, radius of the marsupialisation window (drawn)
LIFT = np.array([-2.0, 12.0, 5.0])   # mm, where the removed cyst and tooth are drawn (up and out of the window)
SHRINK = 0.55      # linear scale of the cyst at about 8 months of marsupialisation (drawn)
TOOTH_MOVE = np.array([0.0, 3.0, 0.0])  # mm, Abu-Mostafa 2022: the tooth moved a few millimetres

cut = decoded('dentigerous-cyst/models/cyst-cut.glb').geometry
whole = decoded('dentigerous-cyst/models/cyst-whole.glb').geometry
bone_whole = whole['bone']
assert bone_whole.is_watertight
CUT_Z = cut['bone'].bounds[1][2]      # the section plane (everything on the cheek side of it is cut away)
cyst_body, cyst_cap = cut['cyst_1'], cut['cyst']
cyst_c = whole['cyst'].centroid

MAT_BONE = cut['bone'].visual.material
MAT_BONE_CUT = cut['bone_1'].visual.material
MAT_NEW = pbr('new-bone', [196, 166, 118, 255])          # same colour as bone, its own part for the label
MAT_NEW_CUT = pbr('new-bone-cut', [92, 41, 26, 255])

# ---- Which pieces are the third molar: the components of each tooth geometry that lie inside the cyst
R38 = 16.0


def split38(name):
    parts = [p for p in cut[name].split(only_watertight=False) if len(p.faces) >= 50]
    inside = [p for p in parts if np.linalg.norm(p.centroid - cyst_c) < R38]
    rest = [p for p in parts if np.linalg.norm(p.centroid - cyst_c) >= R38]
    return (trimesh.util.concatenate(inside) if inside else None, trimesh.util.concatenate(rest) if rest else None)


crown38, teeth_rest = split38('teeth')
roots38, roots_rest = split38('teeth_1')
caps38 = {n: split38(n) for n in ('teeth_2', 'teeth_3', 'teeth_4')}
assert crown38 is not None and roots38 is not None
crown_c = crown38.centroid
print('third molar crown centre %s mm, cyst centre %s mm, section plane z=%.2f' % (np.round(crown_c, 1), np.round(cyst_c, 1), CUT_Z))


def tooth38(shift=np.zeros(3), material=None, cap_material=None):
    out = [('third molar crown', crown38.copy().apply_translation(shift), material),
           ('third molar roots', roots38.copy().apply_translation(shift), material)]
    for n, (cap, _) in caps38.items():
        if cap is not None:
            out.append(('third molar cut ' + n[-1], cap.copy().apply_translation(shift), cap_material))
    return out


def cyst(shift=np.zeros(3), material=None, cap_material=None, scale=1.0, about=None, hole=None):
    body, cap = cyst_body.copy(), cyst_cap.copy()
    if hole is not None:
        cx, cz, r = hole
        for m in (body, cap):
            fc = m.triangles_center
            keep = ~((np.hypot(fc[:, 0] - cx, fc[:, 2] - cz) < r) & (fc[:, 1] > cyst_c[1]))
            m.update_faces(keep)
            m.remove_unreferenced_vertices()
    if scale != 1.0:
        for m in (body, cap):
            m.apply_translation(-about)
            m.apply_scale(scale)
            m.apply_translation(about)
    body.apply_translation(shift)
    cap.apply_translation(shift)
    return [('cyst', body, material), ('cyst cut', cap, cap_material)]


def base(bone_mesh, bone_cap):
    """Everything that never changes: jaw (given), other teeth with their section caps."""
    out = [('bone', bone_mesh, MAT_BONE), ('bone cut', bone_cap, MAT_BONE_CUT), ('teeth', teeth_rest, None), ('teeth roots', roots_rest, None)]
    for n, (_, rest) in caps38.items():
        if rest is not None:
            out.append(('teeth cut ' + n[-1], rest, None))
    return out


def window(cx, r):
    """Bone with a round window cut from the ridge down into the cyst, sectioned like the base model.
    Returns (bone, bone cap faces, removed bone piece) - all on the kept side of the section plane."""
    cz = CUT_Z - 1.0                      # the window straddles the section plane so the section shows it
    cyl = trimesh.creation.cylinder(radius=r, height=40.0, sections=64)
    cyl.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))   # along y
    cyl.apply_translation([cx, cyst_c[1] + 20.0, cz])        # from the cyst centre up through the ridge
    b = manifold(bone_whole)
    c = manifold(cyl)
    kept, _ = split_plane(tri(b - c), [0, 0, -1], [0, 0, CUT_Z])
    removed, _ = split_plane(tri(b ^ c), [0, 0, -1], [0, 0, CUT_Z])
    on = (np.abs(kept.triangles_center[:, 2] - CUT_Z) < 0.02) & (np.abs(kept.face_normals[:, 2]) > 0.999)
    return faces_where(kept, ~on), faces_where(kept, on), removed, (cx, cz, r)


os.makedirs(OUT, exist_ok=True)
bone0, cap0 = cut['bone'], cut['bone_1']

# ---- Option 1: enucleation (cyst and tooth removed together)
bone_e, cap_e, removed_e, hole_e = window(crown_c[0] + 1.0, ENUC_R)
print('enucleation window: radius %.1f mm, removed bone %d faces' % (ENUC_R, len(removed_e.faces)))
export(os.path.join(OUT, 'enucleation-during.glb'),
       base(bone_e, cap_e) + [('removed bone', removed_e, MAT_REMOVED)] + cyst(LIFT) + tooth38(LIFT))
export(os.path.join(OUT, 'enucleation-after.glb'), base(bone_e, cap_e) + [('removed bone', removed_e, MAT_REMOVED)])
BACK = np.array([0, 0, -0.1])


def healed(removed):
    """The cyst cavity, the tooth socket and the window filled with bone (the tooth bodies a hair behind the section)."""
    fill = trimesh.util.concatenate([cyst_body, crown38.copy().apply_translation(BACK), roots38.copy().apply_translation(BACK), removed])
    caps = trimesh.util.concatenate([cyst_cap] + [c for c, _ in caps38.values() if c is not None])
    return [('new bone', fill, MAT_NEW), ('new bone cut', caps, MAT_NEW_CUT)]


export(os.path.join(OUT, 'enucleation-later.glb'), base(bone_e, cap_e) + healed(removed_e))

# ---- Option 2: marsupialisation (window kept open; the cyst shrinks; tooth and lining removed later)
bone_m, cap_m, removed_m, hole_m = window(crown_c[0] - 1.0, MARSUP_R)
print('marsupialisation window: radius %.1f mm' % MARSUP_R)
export(os.path.join(OUT, 'marsup-during.glb'),
       base(bone_m, cap_m) + [('removed bone', removed_m, MAT_REMOVED)] + cyst(hole=hole_m) + tooth38())
# About 8 months later: the cyst has shrunk around the crown and bone has formed where it was; the tooth moved up.
# The small cyst and the tooth sit inside the new bone, so their section faces are set a hair in front of it.
EPS = np.array([0, 0, 0.04])
export(os.path.join(OUT, 'marsup-later.glb'),
       base(bone_m, cap_m) + [('new bone', cyst_body, MAT_NEW), ('new bone cut', cyst_cap, MAT_NEW_CUT)]
       + cyst(TOOTH_MOVE + EPS, scale=SHRINK, about=crown_c, hole=hole_m) + tooth38(TOOTH_MOVE + EPS))
# Then: the tooth and the rest of the lining are removed and the bone heals over (as enucleation-later).
export(os.path.join(OUT, 'marsup-after.glb'), base(bone_m, cap_m) + healed(removed_m))
