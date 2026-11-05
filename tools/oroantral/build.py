"""Build the oroantral communication (OAC) / oroantral fistula (OAF) model series.

Input: voxel grids (0.25 mm) of the right maxilla, palatine bone, zygomatic bone and the right upper
first and second molars, made by vox.py from the Z-Anatomy skull (CC BY-SA 4.0).
Output: one GLB per stage plus labels.json (label anchor points in model coordinates).

Stages
  normal   matched normal: sinus floor about 3 mm above the first molar root tips
  risk     low sinus floor: root tips of both molars push about 4 mm up into the sinus, covered by
           a thin (0.5 mm) layer of bone
  oac      first molar extracted (risk anatomy): socket opens into the sinus
  oaf      weeks later, untreated: socket has healed around a narrow track lined by skin-like
           lining (epithelium); sinus lining thickened (sinusitis)
  clot     small opening: blood clot fills the socket and seals it
  flap     buccal advancement flap: cheek-side gum moved over the socket and stitched to the palate
  bfp      buccal fat pad flap: fat pad brought forward from behind the upper jaw to cover the socket

Simplifications are listed in tools/oroantral/README.md.
"""
import json, sys
import numpy as np
from scipy import ndimage
from skimage import measure
import trimesh, fast_simplification

P = 0.25
LO = np.array([-52., -72., 1526.])
W = sys.argv[1] if len(sys.argv) > 1 else 'work'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out'
import os; os.makedirs(OUT, exist_ok=True)

g = {n: np.load(f'{W}/{n}.npy') for n in ['max', 'pal', 'zyg', 'm1', 'm2']}
SH = g['max'].shape
ii, jj, kk = np.meshgrid(*[np.arange(s) for s in SH], indexing='ij', sparse=True)
X = LO[0] + P * (ii + .5); Y = LO[1] + P * (jj + .5); Z = LO[2] + P * (kk + .5)

def dil(m, mm):
    """Dilate a mask by mm (Euclidean)."""
    return ndimage.distance_transform_edt(~m, sampling=P) <= mm

# Crop: keep the part behind a cut through the middle of the first molar (y_cut), up to the orbit floor.
Y_CUT = -59.1
Z_TOP = 1590.
keep = (Y >= Y_CUT) & (Z <= Z_TOP)

# Bone body: maxilla + palatine + zygomatic, with the maxilla's small built-in cavity filled
# (slice-by-slice hole fill) so we can carve our own sinus.
maxf = np.zeros(SH, bool)
for i in range(SH[0]):
    maxf[i] = ndimage.binary_fill_holes(g['max'][i])
body = maxf | g['pal'] | g['zyg']
teeth = g['m1'] | g['m2']
body &= ~teeth

# Candidate sinus space: inside the maxilla body with at least 1.5 mm of wall,
# lateral to the nose (x < -13) and below the orbit floor.
inner = ndimage.distance_transform_edt(maxf, sampling=P)
S_cand = (inner > 1.5) & (X < -13) & (Z < 1584)
# The space must stay one piece: keep the largest component later.

def floor_z(base):
    """Sinus floor height (mm): lowest over the molars, rising toward the premolars,
    the tuberosity, the cheek and the nose (a bowl, like the alveolar recess)."""
    fy = np.where(Y < -60, ((Y + 60) / 6.) ** 2 * 3., np.where(Y > -47, ((Y + 47) / 5.) ** 2 * 3., 0.))
    fx = ((X + 24.) / 9.) ** 2 * 2.5
    return base + fx + fy

M1_APEX = 1555.6
def sinus_mask(base, coat):
    s = S_cand & (Z > floor_z(base))
    s &= ~dil(teeth, coat)
    lab, n = ndimage.label(s)
    if n > 1:
        sizes = ndimage.sum(s, lab, range(1, n + 1)); s = lab == (1 + int(np.argmax(sizes)))
    return s

S_normal = sinus_mask(M1_APEX + 3.0, 0.5)      # bone 3 mm thick between root tips and sinus
S_risk = sinus_mask(M1_APEX - 4.0, 0.5)        # roots 4 mm up into the sinus, 0.5 mm bone over them
S_open = sinus_mask(M1_APEX - 4.0, 0.0) | (S_risk)  # helper, not used directly

# Crest level and the first molar socket.
m1 = g['m1']
CEJ = 1540.8                                   # about where bone meets the first molar
m1_root = m1 & (Z > CEJ)
socket_core = dil(m1, 0.15) & (Z > CEJ - 0.5)  # space the tooth leaves
crest = 1541.4

def gum_mask(bone, tooth):
    """Gum / mouth lining: up to 2.25 mm thick over bone on the mouth side, not above the
    cheek fold (crest + 11 mm) and not over the nose side."""
    near = dil(bone, 2.25) & ~bone & ~dil(tooth, 0.0) if tooth is not None else dil(bone, 2.25) & ~bone
    # 'Mouth side': no bone directly below the voxel in its column.
    below = np.cumsum(bone, axis=2) > 0          # some bone at or below this z in the column
    mouth = ~below
    return near & mouth & (Z < crest + 11) & (X < -1)

def mesh(mask, target, smooth=8):
    m = np.pad(mask & keep, 1)
    if m.sum() == 0: return None
    # Smooth the voxel field (not the mesh) so thin layers keep their thickness and nothing explodes.
    v, f, _, _ = measure.marching_cubes(ndimage.gaussian_filter(m.astype(np.float32), 0.8), 0.5)
    v = (v - 1 + .5) * P + LO
    tm = trimesh.Trimesh(v, f[:, ::-1], process=True)
    if len(tm.faces) > target:
        vv, ff = fast_simplification.simplify(tm.vertices, tm.faces, 1 - target / len(tm.faces))
        tm = trimesh.Trimesh(vv, ff)
    tm.fix_normals()
    return tm

# Materials: linear RGBA. Bone = latest wisdom tooth model colour; teeth slightly lighter.
MAT = {
    'bone': ([0.6724, 0.5972, 0.4969, 1], 0.7),
    'teeth': ([0.768, 0.716, 0.651, 1], 0.45),
    'gum': ([0.70, 0.25, 0.28, 1], 0.6),
    'sinus': ([0.18, 0.48, 0.86, 0.38], 0.3),
    'lining': ([0.80, 0.22, 0.16, 0.85], 0.6),
    'tract': ([0.62, 0.05, 0.10, 1], 0.5),
    'clot': ([0.26, 0.015, 0.02, 1], 0.35),
    'flap': ([0.95, 0.52, 0.42, 1], 0.6),
    'fat': ([0.93, 0.62, 0.08, 1], 0.55),
}

def export(name, parts):
    scene = trimesh.Scene()
    for key, mask, target in parts:
        tm = mesh(mask, target)
        if tm is None: continue
        col, rough = MAT[key]
        mat = trimesh.visual.material.PBRMaterial(name=key, baseColorFactor=[int(round(c * 255)) for c in col],
                                                  metallicFactor=0.0, roughnessFactor=rough,
                                                  alphaMode='BLEND' if col[3] < 1 else 'OPAQUE', doubleSided=False)
        tm.visual = trimesh.visual.TextureVisuals(material=mat)
        # Z-up mm (Blender) -> glTF Y-up metres, centred.
        v = tm.vertices.copy() - CENTRE
        tm.vertices = np.c_[v[:, 0], v[:, 2], -v[:, 1]] / 1000.
        scene.add_geometry(tm, node_name=key, geom_name=key)
    scene.export(f'{OUT}/{name}.glb')
    print(name, {k: int(m.sum()) for k, m, _ in parts})

body_k = body & keep
bb = np.argwhere(body_k); CENTRE = LO + P * ((bb.min(0) + bb.max(0)) / 2 + .5)
print('centre', CENTRE)

# --- normal
bone_n = body & ~S_normal
gum_n = gum_mask(bone_n, teeth)
export('normal', [('bone', bone_n, 60000), ('teeth', teeth, 30000), ('gum', gum_n, 20000), ('sinus', S_normal, 15000)])

# --- risk
bone_r = body & ~S_risk
gum_r = gum_mask(bone_r, teeth)
export('risk', [('bone', bone_r, 60000), ('teeth', teeth, 30000), ('gum', gum_r, 20000), ('sinus', S_risk, 15000)])

# --- oac: first molar out. Socket = tooth space + the thin bone over its root tips (broken away).
sock = (dil(m1_root, 0.6) & (Z > CEJ - 0.5)) | socket_core
bone_o = body & ~S_risk & ~sock
S_o = (S_risk | (sock & (Z > floor_z(M1_APEX - 4.0)))) & ~bone_o
gum_o = gum_r & ~dil(m1, 0.4)
teeth_o = g['m2']
export('oac', [('bone', bone_o, 60000), ('teeth', teeth_o, 20000), ('gum', gum_o, 20000), ('sinus', S_o, 15000)])

# Opening (where socket meets sinus): for labels.
opening = sock & dil(S_risk, 0.8) & ~S_risk

# --- clot: blood clot fills the socket up to the sinus floor and plugs the opening.
clot = sock & ~bone_o & (Z < floor_z(M1_APEX - 4.0) + 1.0) & (Z > crest - 1.2)
S_c = S_o & ~clot
export('clot', [('bone', bone_o, 60000), ('teeth', teeth_o, 20000), ('gum', gum_o, 20000), ('sinus', S_c, 15000), ('clot', clot, 12000)])

# Footprint of the socket in the ridge (columns), used for flap and fat pad.
foot2d = (sock & (Z < crest + 2)).any(axis=2)
def cols(mask2d): return mask2d[:, :, None] & np.ones((1, 1, SH[2]), bool)

# --- buccal advancement flap: 2.2 mm sheet over the socket from the cheek side to the palate,
# continuous with the cheek-side gum next to the socket (that gum is the flap).
cover2d = ndimage.binary_dilation(foot2d, iterations=int(2.0 / P))
flap_top = cols(cover2d) & (Z <= crest + 0.3) & (Z > crest - 2.2) & ~teeth_o & ~bone_o
buccal_part = gum_o & (X < -27.5) & (Y < -53.5)          # cheek-side gum in front of the second molar
flap = (flap_top | buccal_part) & ~dil(teeth_o, 0.1)
gum_f = gum_o & ~flap
clot_f = sock & ~bone_o & (Z < floor_z(M1_APEX - 4.0) + 1.0) & ~flap
S_f = S_o & ~clot_f
export('flap', [('bone', bone_o, 60000), ('teeth', teeth_o, 20000), ('gum', gum_f, 20000), ('sinus', S_f, 15000),
                ('clot', clot_f, 12000), ('flap', flap, 15000)])

# --- buccal fat pad: lobulated tube from behind the cheek-side of the upper jaw (pedicle) to a
# flat pad over the socket, stitched to the palatal gum.
def bez(pts, t):
    pts = np.asarray(pts, float); n = len(pts) - 1
    from math import comb
    return sum(comb(n, i) * (1 - t) ** (n - i) * t ** i * pts[i] for i in range(n + 1))
ctrl = [(-45, -40, 1566), (-40, -45, 1553), (-34.5, -55, 1543), (-27, -58.5, 1539.4), (-17, -58.5, 1539.6)]
rng = np.random.default_rng(3)
fat = np.zeros(SH, bool)
for t in np.linspace(0, 1, 90):
    c = bez(ctrl, t)
    # radius: 3.6 mm at the pedicle, a wide flat pad (6 mm across, 1.4 mm half-thickness) over the socket
    rxy = 3.6 + 2.6 * max(0, t - 0.55) / 0.45
    rz = 3.4 - 2.0 * max(0, t - 0.55) / 0.45
    rxy *= 1 + 0.08 * rng.standard_normal(); rz *= 1 + 0.08 * rng.standard_normal()
    d = ((X - c[0]) / rxy) ** 2 + ((Y - c[1]) / rxy) ** 2 + ((Z - c[2]) / rz) ** 2
    fat |= d <= 1
fat &= ~bone_o & ~teeth_o
fat = ndimage.binary_opening(fat, iterations=2)
clot_b = clot_f & ~fat
gum_b = gum_o & ~fat
S_b = S_o & ~clot_b & ~fat
export('bfp', [('bone', bone_o, 60000), ('teeth', teeth_o, 20000), ('gum', gum_b, 20000), ('sinus', S_b, 15000),
               ('clot', clot_b, 12000), ('fat', fat, 15000)])

# --- OAF: weeks later. The socket has filled in (shown as bone) except a 3.2 mm track through the
# middle of the socket from mouth to sinus. The track is lined (epithelium, 0.6 mm). The gum has
# grown over the ridge except at the track. The sinus lining is thickened (sinusitis).
cx, cy = -24.0, -59.0
r = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
heal = sock & (Z < floor_z(M1_APEX - 4.0) + 0.5)             # socket fills in below the sinus floor
bone_f = (bone_o | heal)
ridge_gum = cols(cover2d) & (Z <= crest + 0.3) & (Z > crest - 2.2) & ~teeth_o & ~bone_f
gum_fis = (gum_o | ridge_gum)
track_z = (Z > crest - 2.2) & (Z < floor_z(M1_APEX - 4.0) + 1.0)
hole = (r < 1.6) & track_z
tract = (r >= 1.6) & (r < 2.2) & track_z
bone_f &= ~hole & ~tract
gum_fis &= ~hole & ~tract
S_f2 = S_o & ~bone_f & ~tract
# Thickened lining: sinus voxels within 3 mm of the floor/walls in the lower half of the sinus.
lin = S_f2 & (ndimage.distance_transform_edt(S_f2, sampling=P) <= 3.0) & (Z < floor_z(M1_APEX - 4.0) + 12) & ~(hole)
S_air = S_f2 & ~lin
export('oaf', [('bone', bone_f, 60000), ('teeth', teeth_o, 20000), ('gum', gum_fis, 20000), ('sinus', S_air, 15000),
               ('lining', lin, 20000), ('tract', tract, 8000)])

# Label anchors (glTF metres) per stage.
def to_gl(p):
    v = np.asarray(p, float) - CENTRE
    return [round(v[0] / 1000, 5), round(v[2] / 1000, 5), round(-v[1] / 1000, 5)]
def centroid(mask):
    idx = np.argwhere(mask & keep); return (LO + P * (idx.mean(0) + .5)).tolist()
def lowest(mask):
    idx = np.argwhere(mask & keep); k = idx[np.argmin(idx[:, 2])]; return (LO + P * (k + .5)).tolist()
def surf_point(mask, x, y, side):
    """First voxel of mask in column (x,y) from below ('below') or above."""
    i = int((x - LO[0]) / P); j = int((y - LO[1]) / P); col = np.nonzero(mask[i, j])[0]
    k = col.min() if side == 'below' else col.max(); return [x, y, LO[2] + P * (k + .5)]
lab = {
    'sinus': to_gl(centroid(S_normal)),
    'm1root_normal': to_gl([-24.0, Y_CUT + 0.2, M1_APEX - 1]),
    'floor_normal': to_gl(surf_point(S_normal, -24.0, Y_CUT + 0.6, 'below')),
    'm1root_risk': to_gl([-24.0, Y_CUT + 0.2, M1_APEX - 1]),
    'm2': to_gl([-29.5, -50.5, 1540.0]),
    'opening': to_gl(centroid(opening)),
    'socket': to_gl([-24.0, Y_CUT + 0.3, 1545.0]),
    'clot': to_gl([-24.0, Y_CUT + 0.3, 1545.0]),
    'flap': to_gl(centroid(flap & (Z < crest + 0.3) & (Z > crest - 2.2) & cols(foot2d))),
    'flap_buccal': to_gl(centroid(buccal_part)),
    'fat_pad': to_gl(centroid(fat & (Y > -50))),
    'fat_cover': to_gl(centroid(fat & cols(foot2d))),
    'tract': to_gl([cx - 2.0, Y_CUT + 0.3, 1546.0]),
    'tract_mouth': to_gl([cx, cy, crest - 2.0]),
    'lining': to_gl(centroid(lin & (X < -30))),
    'gum': to_gl(centroid(gum_n & (X < -30) & (Y < -52))),
}
json.dump(lab, open(f'{OUT}/labels.json', 'w'), indent=1)
print('labels', lab)
