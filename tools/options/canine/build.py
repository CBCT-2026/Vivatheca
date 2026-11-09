"""Build the 3D models for the ectopic canine treatment options page (/ectopic-canine/options/).

The "Before" step of each option uses the parent model page's own GLB, so no before.glb is written.

Usage: python3 tools/options/canine/build.py        (writes build/options/canine/*.glb, uncompressed)
then:  node tools/glb/finish.mjs build/options/canine/*.glb --out public/ectopic-canine/options/models
then:  node tools/labels/anchors.mjs

Every model starts from the site's ectopic canine models (public/ectopic-canine/models/palatal.glb and
normal.glb, built by tools/canine/build.py on the development series, CC BY-SA 4.0; metre units): the right
upper jaw at about 10.5 years with the adult canine displaced towards the palate. The jaw, the other teeth and
their colours are copied unchanged. The canine's normal position is taken from normal.glb (the same mesh, so the
move is a rigid transform; the half-way position is its interpolation). The bone is see-through (alpha 0.3), as on
the ectopic canine page, because the canine sits inside it.

Clinical steps shown, and their sources:
- Exposure and orthodontic alignment: the gum and bone over the crown are removed (open or closed exposure), an
  attachment with a chain is bonded to the crown, and braces pull the canine into the arch over 2-3 years; the
  baby canine is removed. Parkin NA, et al. Cochrane Database Syst Rev. 2017;8:CD006966
  (doi:10.1002/14651858.CD006966.pub3); Husain J, et al. Br Dent J. 2012;213(4):171-176
  (doi:10.1038/sj.bdj.2012.726), the FDS RCS England guideline.
- Removal of the displaced canine: a window is made and the canine taken out; the baby canine may be kept for a
  while, and the space is later closed with braces or filled with a bridge or an implant once growth has finished
  (Husain 2012; Bedoya MM, Park JH. J Am Dent Assoc. 2009;140(12):1485-1493, doi:10.14219/jada.archive.2009.0099).

Values that are DRAWN (no source gives a figure; stated on the page): the window is the bone within WINDOW of the
crown (the lower CROWN_FRACTION of the tooth) on the palatal side; the attachment is a 3 mm button with a 0.5 mm
chain to the arch; the canine is lifted LIFT out through the window in the removal step.
"""
import os
import sys

import numpy as np
import trimesh
from scipy.spatial.transform import Rotation, Slerp
from skimage import measure

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from lib import ROOT, MAT_REMOVED, decoded, export, manifold, pbr, tri  # noqa: E402

OUT = os.path.join(ROOT, 'build', 'options', 'canine')
MM = 0.001
WINDOW = 1.5 * MM          # bone removed this far around the palatal side of the crown (drawn)
CROWN_FRACTION = 0.42      # the crown is about this part of the tooth length (crown 10, root 17 mm: Wheeler's Dental Anatomy)
LIFT = np.array([8.0, -6.0, 0.0]) * MM   # removal: out towards the palate and down (drawn)
BUTTON_R, BUTTON_H, CHAIN_R = 1.5 * MM, 1.0 * MM, 0.25 * MM

pal = decoded('ectopic-canine/models/palatal.glb').geometry
nor = decoded('ectopic-canine/models/normal.glb').geometry
bone, teeth, canine, baby, babyc = pal['bone'], pal['teeth'], pal['canine'], pal['baby-teeth'], pal['baby-canine']
assert bone.is_watertight and canine.is_watertight
M, _, cost = trimesh.registration.procrustes(canine.vertices, nor['canine'].vertices, reflection=False, scale=False)
assert cost < 1e-9, cost
R0, R1 = Rotation.identity(), Rotation.from_matrix(M[:3, :3])
print('canine moves %.1f mm and turns %.0f degrees to its normal place' % (np.linalg.norm(M[:3, 3]) / MM, np.degrees(R1.magnitude())))


def canine_at(t):
    """The canine part-way (t in 0..1) from the palatal to the normal position (rotation slerp + linear shift)."""
    r = Slerp([0, 1], Rotation.concatenate([R0, R1]))(t)
    T = np.eye(4)
    T[:3, :3] = r.as_matrix()
    c = canine.centroid
    T[:3, 3] = (1 - t) * c + t * (M[:3, :3] @ c + M[:3, 3]) - T[:3, :3] @ c
    return canine.copy().apply_transform(T), T


# ---- Crown: the lower CROWN_FRACTION of the tooth along its long axis (the cusp points down, towards the arch)
v = canine.vertices - canine.centroid
w, V = np.linalg.eigh(np.cov(v.T))
axis = V[:, 2]
if axis[1] > 0:
    axis = -axis                    # pointing towards the cusp (downwards)
proj = v @ axis
crown_mask = proj > proj.max() - CROWN_FRACTION * np.ptp(proj)
crown = canine.submesh([np.where(crown_mask[canine.faces].all(1))[0]], append=True)
palatal = np.array([1.0, 0, 0])      # +x is the palate side in these models (tools/canine/build.py)

# Solid "dilated crown" on the palatal side, for the bone window (marching cubes of the distance field)
step = 0.4 * MM
lo, hi = crown.bounds[0] - 3 * WINDOW, crown.bounds[1] + 3 * WINDOW
xs, ys, zs = [np.arange(lo[i], hi[i] + step, step) for i in range(3)]
P = np.stack(np.meshgrid(xs, ys, zs, indexing='ij'), -1).reshape(-1, 3)
d = -trimesh.proximity.ProximityQuery(crown).signed_distance(P).reshape(len(xs), len(ys), len(zs))
field = np.minimum(WINDOW - d, (P[:, 0] - crown.centroid[0] + 0.5 * MM).reshape(d.shape))   # d < WINDOW and palatal half
vs, fs, _, _ = measure.marching_cubes(field, 0.0, spacing=(step, step, step))
dil = trimesh.Trimesh(vs + lo, fs, process=True)
dil.fix_normals()
B, D = manifold(bone), manifold(dil)
bone_window = tri(B - D)
removed = tri(B ^ D)
print('bone window: %d faces removed-bone piece, %.1f mm3' % (len(removed.faces), removed.volume / MM ** 3))

# ---- Attachment: a button on the most palatal point of the crown, and a chain to the arch
MAT_BONE = pbr('bone', [171, 152, 127, 77], 'BLEND')     # the model's bone colour, see-through
MAT_ATTACH = pbr('attachment', [200, 200, 205, 255])
i = np.argmax(crown.vertices[:, 0])
anchor = crown.vertices[i]
chain_end = nor['canine'].centroid + np.array([3.0, -6.0, 0]) * MM   # near the arch where the canine will go (drawn)


def attachment(T):
    a = trimesh.transform_points([anchor], T)[0]
    n = trimesh.transform_points([anchor + palatal * MM], T)[0] - a
    n /= np.linalg.norm(n)
    button = trimesh.creation.cylinder(radius=BUTTON_R, height=BUTTON_H, sections=32)
    button.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], n))
    button.apply_translation(a + n * BUTTON_H / 2)
    seg = np.array([a + n * BUTTON_H, chain_end])
    chain = trimesh.creation.cylinder(radius=CHAIN_R, segment=seg, sections=12)
    return [('attachment', trimesh.util.concatenate([button, chain]), MAT_ATTACH)]


def base(b, with_babyc=True):
    out = [('bone', b, MAT_BONE), ('teeth', teeth, None), ('baby-teeth', baby, None)]
    if with_babyc:
        out.append(('baby-canine', babyc, None))
    return out


os.makedirs(OUT, exist_ok=True)
I = np.eye(4)
# ---- Option 1: exposure and orthodontic alignment
export(os.path.join(OUT, 'ortho-during.glb'), base(bone_window) + [('removed bone', removed, MAT_REMOVED), ('canine', canine, None)] + attachment(I))
half, Th = canine_at(0.5)
export(os.path.join(OUT, 'ortho-later.glb'), base(bone_window, with_babyc=False) + [('canine', half, None)] + attachment(Th))
final, _ = canine_at(1.0)
export(os.path.join(OUT, 'ortho-after.glb'), base(bone, with_babyc=False) + [('canine', final, None)])

# ---- Option 2: removal of the displaced canine
export(os.path.join(OUT, 'removal-during.glb'), base(bone_window) + [('removed bone', removed, MAT_REMOVED), ('canine', canine.copy().apply_translation(LIFT), None)])
export(os.path.join(OUT, 'removal-after.glb'), base(bone_window) + [('removed bone', removed, MAT_REMOVED)])
# Later: bone healed; the baby canine has been lost too, leaving a space for braces, a bridge or an implant.
export(os.path.join(OUT, 'removal-later.glb'), base(bone, with_babyc=False))
