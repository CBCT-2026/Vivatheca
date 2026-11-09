"""Build the 3D models for the endodontic (tooth abscess) treatment options page (/endodontic/options/).

The "Before" step of each option uses the parent model page's own GLB, so no before.glb is written.

Usage: python3 tools/options/endo/build.py          (writes build/options/endo/*.glb, uncompressed)
then:  node tools/glb/finish.mjs build/options/endo/*.glb --out public/endodontic/options/models
then:  node tools/labels/anchors.mjs

Every model starts from the site's endodontic model (public/endodontic/models/abscess-cut.glb, built by
tools/endo/build.py from BodyParts3D, CC BY 4.0; millimetre units): a lower right first molar (46) with decay, a
dead pulp and a chronic abscess at the root tips, sectioned through the tooth. The jaw, gum and the other tooth
are copied unchanged; only the first molar, its pulp space, the decay and the abscess change. Nothing is moved or
resized except the tooth lifted out of its socket in the extraction "during" step (LIFT, drawn).

Clinical steps shown, and their sources:
- Root canal treatment: decay removed and an opening made into the pulp chamber, the dead pulp removed and the
  canals cleaned, shaped and filled with gutta-percha and sealer, the opening filled, usually followed by a crown;
  the abscess heals over months. European Society of Endodontology S3 guideline: Duncan HF, et al. Int Endod J.
  2023;56(11):1313-1332 (doi:10.1111/iej.13974). Crown after treatment: Ng YL, et al. Int Endod J.
  2010;43(3):171-189 (doi:10.1111/j.1365-2591.2009.01671.x). Healing of the abscess: Ng YL, et al. Int Endod J.
  2007;40(12):921-939 (doi:10.1111/j.1365-2591.2007.01322.x).
- Extraction: the tooth is removed with the dead pulp; the abscess tissue is cleaned out of the socket; the socket
  fills with bone and the ridge shrinks over the following months. Tan WL, et al. Clin Oral Implants Res.
  2012;23 Suppl 5:1-21 (doi:10.1111/j.1600-0501.2011.02375.x): mean 3.79 mm horizontal and 1.24 mm vertical ridge
  loss at 6 months (the shrinkage is NOT drawn here; stated on the page).

Colours: gutta-percha root filling and the composite filling are the site's tokens (tools/tokens/colours.py:
model.filling); the crown is model.crown; new bone is the model's bone colour.
"""
import os
import sys

import numpy as np
import trimesh

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from lib import ROOT, decoded, export, pbr  # noqa: E402

OUT = os.path.join(ROOT, 'build', 'options', 'endo')
LIFT = np.array([0.0, 9.0, 3.0])     # mm, where the extracted tooth is drawn (drawn)
X46 = -6.3                           # mm, everything with its centre to the right of this is the first molar (46)

cut = decoded('endodontic/models/abscess-cut.glb').geometry
MAT_BONE = cut['bone'].visual.material
MAT_BONE_CUT = cut['bone_1'].visual.material
MAT_GP = pbr('root-filling', [222, 128, 96, 255])        # gutta-percha (pink-orange)
MAT_FILL = pbr('filling', [127, 167, 196, 255])          # model.filling #7FA7C4
MAT_CROWN = pbr('crown', [217, 214, 207, 255])           # model.crown #D9D6CF
MAT_NEW = pbr('new-bone', [196, 166, 118, 255])
MAT_NEW_CUT = pbr('new-bone-cut', [92, 41, 26, 255])

FIXED = ['bone', 'bone_1', 'gum', 'gum_1']
TOOTH_GEOMS = [n for n in cut if n not in FIXED and n not in ('lesion', 'pulp', 'decay')]
mat_of = lambda n: cut[n].visual.material

m1, others = {}, {}
for n in TOOTH_GEOMS:
    parts = [p for p in cut[n].split(only_watertight=False) if len(p.faces) >= 30]
    a = [p for p in parts if p.centroid[0] > X46]
    b = [p for p in parts if p.centroid[0] <= X46]
    if a:
        m1[n] = trimesh.util.concatenate(a)
    if b:
        others[n] = trimesh.util.concatenate(b)
print('first molar pieces:', {n: len(m.faces) for n, m in m1.items()})
decay = trimesh.util.concatenate([cut['decay']] + [m1.pop(n) for n in list(m1) if mat_of(n).name == 'decay'])
enamel = [n for n in m1 if mat_of(n).name in ('teeth', 'teeth_2')]       # enamel and its section face
pulp, lesion = cut['pulp'], cut['lesion']
CUT_Z = cut['bone'].bounds[1][2]


def base():
    out = [(n, cut[n], None) for n in FIXED]
    out += [('teeth ' + n, m, None) for n, m in others.items()]
    return out


def molar(shift=np.zeros(3), crown=False, skip=()):
    out = []
    for n, m in m1.items():
        if n in skip:
            continue
        out.append(('first molar ' + n, m.copy().apply_translation(shift), MAT_CROWN if crown and n in enamel else None))
    return out


os.makedirs(OUT, exist_ok=True)
# ---- Option 1: root canal treatment
# During: decay drilled out, opening into the pulp chamber, dead pulp removed, canals cleaned (empty).
export(os.path.join(OUT, 'rct-during.glb'), base() + molar() + [('abscess', lesion, None)])
# After: canals filled with gutta-percha, the opening filled; the abscess is still there (it heals over months).
export(os.path.join(OUT, 'rct-after.glb'), base() + molar() + [('root filling', pulp, MAT_GP), ('filling', decay, MAT_FILL), ('abscess', lesion, None)])
# Later: the abscess has healed (bone), and the tooth has a crown.
# A fill sits inside the socket or the abscess cavity, so only its front faces show, through the opening in the bone's
# section face. The bone's section is not one flat plane here (the tooth is sectioned 0.23 mm behind the bone), so the
# whole fill takes the cut-face colour, which is what the front of a filled cavity looks like in a sectioned model.
new_bone = lambda m: [('new bone', m, MAT_NEW_CUT)]
export(os.path.join(OUT, 'rct-later.glb'), base() + molar(crown=True) + [('root filling', pulp, MAT_GP), ('crown', decay, MAT_CROWN)] + new_bone(lesion))

# ---- Option 2: extraction
export(os.path.join(OUT, 'ext-during.glb'), base() + molar(LIFT) + [('decay', decay.copy().apply_translation(LIFT), None), ('pulp', pulp.copy().apply_translation(LIFT), None), ('abscess', lesion, None)])
# After: empty socket; the abscess tissue has been cleaned out.
export(os.path.join(OUT, 'ext-after.glb'), base())
# Later: the socket and the abscess cavity have filled with bone (the ridge also shrinks; not drawn).
# The socket is the tooth-shaped hole in the bone and gum, so the fill is the whole tooth (with pulp and lesion)
# clipped at the bone crest (below: bone) and at the gum surface (between: gum), both taken as flat planes at the
# heights of the bone and gum next to the socket.
socket = trimesh.util.concatenate(list(m1.values()) + [pulp, lesion])
cx = socket.centroid[0]
near = lambda m: m.vertices[(np.abs(m.vertices[:, 0] - cx) < 4) & (m.vertices[:, 2] > CUT_Z - 4)]
CREST_Y, GUM_Y = near(cut['bone'])[:, 1].max(), near(cut['gum'])[:, 1].max()
print('bone crest y %.2f, gum surface y %.2f' % (CREST_Y, GUM_Y))
slice_ = lambda m, ny, y: trimesh.intersections.slice_mesh_plane(m, plane_normal=[0, ny, 0], plane_origin=[0, y, 0], cap=False)
fill_bone = slice_(socket, -1, CREST_Y)
fill_gum = slice_(slice_(socket, 1, CREST_Y), -1, GUM_Y)
new_gum = [('new gum', fill_gum, cut['gum_1'].visual.material)]
export(os.path.join(OUT, 'ext-later.glb'), base() + new_bone(fill_bone) + new_gum)
