"""Generate the stainless steel crown (SSC) series: one lower baby molar in five stages.

Input: mandible_lower_teeth_only.stl (Z-Anatomy, CC BY-SA 4.0; see tools/ssc/README.md).
Run:   python3 generate.py <mandible_lower_teeth_only.stl> <out_dir>

Stages (same tooth, gum and bone in each):
  healthy   matched normal: a sound lower second baby molar (tooth "E", FDI 75)
  decay     large decay on the biting surface and both sides that touch the neighbouring teeth
  filling   the same decay replaced by a large filling (what a crown is compared with)
  prepared  decay removed, the top and both touching sides trimmed for a crown
  crown     stainless steel crown cemented over the trimmed tooth, edge just under the gum

Method:
  - The baby molar is the Z-Anatomy permanent lower left first molar (with its pulp), scaled to
    typical lower second baby molar size (Wheeler: crown 9.9 mm front-to-back, 8.7 mm cheek-to-
    tongue, crown height 5.5 mm, root 9.8 mm). Roots are spread apart with depth, as baby molar
    roots flare to make room for the premolar growing between them.
  - The second premolar (Z-Anatomy permanent lower left second premolar) is shown as a partly
    formed crown (top 26 % of the tooth) in its bony crypt below the roots, as at about 4 to 5 years.
  - Gum and bone are simple rounded blocks (a sectional teaching model), not Z-Anatomy shapes.
  - Decay, filling and trimming depths are illustrative (see README); they are not measurements.
  - Crown: outer surface = original tooth surface pushed out by CROWN_T, inner surface = original
    tooth surface; cement fills the space between the crown and the trimmed tooth.
Outputs: <stage>.glb (metres, Y up, cheek side +Z) and print STLs (mm) in out/print/.
"""
import sys, json
from pathlib import Path
import numpy as np, trimesh, manifold3d as mf
from scipy import ndimage
from skimage import measure

SRC = Path(sys.argv[1]); OUT = Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)

# Wheeler's dental anatomy (after G. V. Black): lower second primary molar, mm.
E = dict(crown_md=9.9, crown_bl=8.7, crown_h=5.5, root=9.8)
CROWN_FRAC = 0.38      # share of the permanent first molar's length that is crown (as in tools/development)
ROOT_FLARE = 3.5       # each root tip moves up to 3.5 mm further out (front or back)
OCC_RED = 1.5          # illustrative occlusal reduction, mm
PROX_RED = 1.0         # illustrative slice off each touching side, mm
CROWN_T = 0.35         # crown wall thickness (thicker than a real crown so it can be printed at 2x)
MARGIN_BELOW_CEJ = 0.5  # crown edge, mm below the enamel-root junction
GUM_ABOVE_CEJ = 1.0    # gum edge, mm above the enamel-root junction
CREST_BELOW_CEJ = 1.5  # bone crest, mm below the enamel-root junction

# Colours (linear RGB, glTF). Bone and tooth: the wisdom tooth model's colours (Luke, 5 Nov 2026).
MAT = {
    'bone':    dict(c=[0.6724, 0.5972, 0.4969, 1], r=0.7, m=0.0),
    'teeth':   dict(c=[0.770, 0.718, 0.648, 1], r=0.7, m=0.0),
    'pulp':    dict(c=[0.576, 0.031, 0.043, 1], r=0.5, m=0.0),   # nerve red of the wisdom tooth model
    'gum':     dict(c=[0.62, 0.20, 0.22, 1], r=0.55, m=0.0),
    'decay':   dict(c=[0.13, 0.065, 0.025, 1], r=0.8, m=0.0),
    'filling': dict(c=[0.42, 0.32, 0.72, 1], r=0.35, m=0.0),  # lilac, so it stands out from tooth
    'cement':  dict(c=[0.93, 0.90, 0.80, 1], r=0.6, m=0.0),
    'steel':   dict(c=[0.75, 0.75, 0.77, 1], r=0.28, m=1.0),
    'premolar': dict(c=[0.770, 0.718, 0.648, 1], r=0.7, m=0.0),
}

def M(m):
    m = trimesh.Trimesh(m.vertices, m.faces, process=True)
    if m.volume < 0: m.invert()
    return mf.Manifold(mf.Mesh(np.asarray(m.vertices, np.float32), np.asarray(m.faces, np.uint32)))

def T(Mn):
    mm = Mn.to_mesh(); t = trimesh.Trimesh(mm.vert_properties[:, :3].astype(float), mm.tri_verts, process=True)
    parts = [p for p in t.split(only_watertight=False) if abs(p.volume) > 0.05]  # drop zero-volume slivers
    return trimesh.util.concatenate(parts) if len(parts) > 1 else (parts[0] if parts else t)

def ball_hull(pts, r):
    return mf.Manifold.batch_hull([mf.Manifold.sphere(r, 32).translate(list(map(float, p))) for p in pts])

def halfspace_above(z, big=60.0):
    return mf.Manifold.cube([big, big, big], True).translate([0, 0, z + big / 2])

# ---------------------------------------------------------------- source teeth
parts = trimesh.load(SRC).split(only_watertight=False)
def pick(cx, cy, vol_min, vol_max):
    best = [p for p in parts if abs(p.centroid[0] - cx) < 1.5 and abs(p.centroid[1] - cy) < 1.5 and vol_min < abs(p.volume) < vol_max]
    assert best, (cx, cy); return best[0]
molar = pick(-23.2, -56.9, 1000, 1500)      # permanent lower left first molar (outer surface)
pulp = pick(-23.8, -56.2, 50, 200)          # its pulp
pm2 = pick(-20.4, -64.5, 400, 800)          # permanent lower left second premolar
m2 = pick(-26.9, -46.3, 900, 1300)          # second molar, only for the arch direction

# Local frame: x front-to-back (+x = towards the front of the mouth), y cheek-to-tongue (+y = tongue), z up.
md = pm2.centroid[:2] - m2.centroid[:2]; md /= np.linalg.norm(md)
bl = np.array([-md[1], md[0]])
if bl @ (np.array([0.0, molar.centroid[1]]) - molar.centroid[:2]) < 0: bl = -bl  # tongue = towards midline (x = 0)
R = np.eye(4); R[0, :2] = md; R[1, :2] = bl; R[2, 2] = 1
c0 = molar.centroid.copy()
def local(m):
    m = m.copy(); m.apply_translation(-c0); m.apply_transform(R); return m
molar, pulp, pm2 = local(molar), local(pulp), local(pm2)

zt, zb = molar.bounds[1, 2], molar.bounds[0, 2]
cej = zt - CROWN_FRAC * (zt - zb)
crown_v = molar.vertices[molar.vertices[:, 2] > cej]
cx, cy = (crown_v[:, 0].max() + crown_v[:, 0].min()) / 2, (crown_v[:, 1].max() + crown_v[:, 1].min()) / 2
sx = E['crown_md'] / np.ptp(crown_v[:, 0]); sy = E['crown_bl'] / np.ptp(crown_v[:, 1])
sz_c = E['crown_h'] / (zt - cej); sz_r = E['root'] / (cej - zb)

rv = molar.vertices[molar.vertices[:, 2] < cej]
tilt = np.polyfit(rv[:, 2] - cej, rv[:, 0] - cx, 1)[0]  # the roots lean backwards; straighten them first
def to_baby(v):
    v = v.copy(); v[:, 0] -= cx; v[:, 1] -= cy; z = v[:, 2] - cej
    v[:, 0] -= tilt * np.clip(z, None, 0)
    depth = np.clip(-z, 0, None) / (cej - zb)
    v[:, 0] = v[:, 0] * sx + ROOT_FLARE * depth ** 1.5 * np.tanh(v[:, 0] * sx / 0.8)
    v[:, 1] *= sy
    v[:, 2] = np.where(z > 0, z * sz_c, z * sz_r)   # CEJ at z = 0
    return v
tooth = trimesh.Trimesh(to_baby(molar.vertices), molar.faces)
pulp = trimesh.Trimesh(to_baby(pulp.vertices), pulp.faces)
TOP, BOT = tooth.bounds[1, 2], tooth.bounds[0, 2]
XMIN, XMAX = tooth.bounds[0, 0], tooth.bounds[1, 0]
Mt, Mp = M(tooth), M(pulp)
print('baby molar extents (mm):', np.round(tooth.extents, 2), 'crown top', round(TOP, 2), 'apex', round(BOT, 2))

# ---------------------------------------------------------------- premolar crown in its crypt
pz_t, pz_b = pm2.bounds[1, 2], pm2.bounds[0, 2]
pm_crown = T(M(pm2).trim_by_plane([0, 0, 1], float(pz_t - 0.26 * (pz_t - pz_b))))
pm_crown.apply_translation([-pm_crown.centroid[0], -pm_crown.centroid[1], 0])
pm_crown.apply_scale(0.92)  # typical second premolar crown is a little smaller than this adult mesh
rc = tooth.vertices[tooth.vertices[:, 2] < -3]
pm_crown.apply_translation([0.0, float(rc[:, 1].mean()), 0])
furc_z = -2.5  # baby molar root trunk is short: furcation ~2.5 mm below the CEJ
drop = (furc_z - 0.8) - pm_crown.bounds[1, 2]
pm_crown.apply_translation([0, 0, drop])
for _ in range(40):  # lower until it does not overlap the roots
    if (M(pm_crown) ^ Mt).volume() < 1e-3:
        break
    pm_crown.apply_translation([0, 0, -0.2])
Mpm = M(pm_crown)
print('premolar crown overlap with molar (mm3):', round((Mpm ^ Mt).volume(), 4), 'top z', round(pm_crown.bounds[1, 2], 2))

# ---------------------------------------------------------------- decay, filling, preparation
a = E['crown_md'] / 2; zc = TOP
cav = mf.Manifold.batch_boolean([
    ball_hull([[-0.35 * a, 0.2, zc - 0.9], [0.35 * a, 0.2, zc - 0.9]], 1.15),           # central groove
    ball_hull([[a + 0.2, 0.3, zc - 1.6], [a + 0.2, 0.3, zc - 3.0], [0.45 * a, 0.2, zc - 1.0]], 1.45),  # front (mesial)
    ball_hull([[-a - 0.2, 0.3, zc - 1.8], [-a - 0.2, 0.3, zc - 3.0], [-0.45 * a, 0.2, zc - 1.0]], 1.25),  # back (distal)
], mf.OpType.Add)
cav_big = mf.Manifold.batch_boolean([
    ball_hull([[-0.35 * a, 0.2, zc - 0.9], [0.35 * a, 0.2, zc - 0.9]], 1.55),
    ball_hull([[a + 0.2, 0.3, zc - 1.6], [a + 0.2, 0.3, zc - 3.0], [0.45 * a, 0.2, zc - 1.0]], 1.8),
    ball_hull([[-a - 0.2, 0.3, zc - 1.8], [-a - 0.2, 0.3, zc - 3.0], [-0.45 * a, 0.2, zc - 1.0]], 1.65),
], mf.OpType.Add)
near_pulp = (cav_big ^ M(pulp).scale([1.0] * 3)).volume()
gap = float(np.min(np.abs(trimesh.proximity.signed_distance(T(cav_big), pulp.vertices[pulp.vertices[:, 2] > -2]))))
print('decay to pulp: overlap', round(near_pulp, 4), 'mm3, closest', round(gap, 2), 'mm')
assert near_pulp < 1e-3 and gap > 0.5, 'decay too close to the pulp (this model shows a crown without nerve treatment)'
sound = Mt - cav_big
decay = (Mt ^ cav_big) - cav
filling = Mt ^ cav_big

margin = -MARGIN_BELOW_CEJ
def reduction_envelope():
    """The trimmed tooth outline: the top OCC_RED mm removed following the cusps, and PROX_RED mm sliced off the
    front and back above the crown edge. Built from the intact tooth so the trimming does not follow the decay."""
    out = (Mt - halfspace_above(2.0)) + (Mt ^ Mt.translate([0, 0, -OCC_RED]))
    big = 40.0
    for sgn, xe in ((1, XMAX), (-1, XMIN)):
        out = out - mf.Manifold.cube([big, big, big], True).translate([xe - sgn * PROX_RED + sgn * big / 2, 0, margin + big / 2])
    return out
ENV = reduction_envelope()
def prep(Mx):
    return Mx ^ ENV
prep_tooth = prep(sound)                 # remaining tooth
prep_base = prep(filling) - prep_tooth   # where decay was removed: filled with a glass ionomer base
crown_zone = Mt ^ halfspace_above(margin)
cement = crown_zone - prep(Mt)

# Crown: outer = tooth pushed out by CROWN_T (signed distance field), cut at the crown edge.
pitch = 0.05
vox = T(Mt ^ halfspace_above(margin - 1.5)).voxelized(pitch).fill()
inside = np.pad(vox.matrix, 12)
lo = vox.transform[:3, 3] - 12 * pitch
sdf = (ndimage.distance_transform_edt(~inside) - ndimage.distance_transform_edt(inside)) * pitch
sdf = ndimage.gaussian_filter(sdf, 1.0)  # smooth the voxel steps; keeps the surface watertight
verts, faces, _, _ = measure.marching_cubes(sdf, level=CROWN_T, spacing=(pitch,) * 3, allow_degenerate=False)
outer = trimesh.Trimesh(verts + lo, faces, process=True)
assert outer.is_watertight
Mouter = M(outer).simplify(0.004)
crown = (Mouter ^ halfspace_above(margin)) - Mt
print('crown volume', round(crown.volume(), 2), 'cement', round(cement.volume(), 2))

# ---------------------------------------------------------------- gum and bone (a sectional block)
# Cross-section (cheek-to-tongue y, height z) of a child's lower jaw around the tooth, extruded front-to-back.
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient
crest = -CREST_BELOW_CEJ; gtop = GUM_ABOVE_CEJ
bbot = min(BOT, pm_crown.bounds[0, 2]) - 2.5
neck = tooth.section([0, 0, 1], [0, 0, 0.2]).bounds  # tooth outline at the neck
ymid = float((neck[0, 1] + neck[1, 1]) / 2); hn = float((neck[1, 1] - neck[0, 1]) / 2)
hw = max(hn + 1.6, float(np.abs(np.r_[tooth.bounds[:, 1], pm_crown.bounds[:, 1]] - ymid).max()) + 1.4)
bone_prof = Polygon(
                    [(ymid - hn - 0.9, crest), (ymid - hw, crest - 3.0), (ymid - hw - 0.2, bbot + 3.0), (ymid - hw + 2.5, bbot),
                     (ymid + hw - 2.5, bbot), (ymid + hw + 0.2, bbot + 3.0), (ymid + hw, crest - 3.0), (ymid + hn + 0.9, crest)])
bone_prof = bone_prof.buffer(-2.0, join_style=1).buffer(2.0, join_style=1)  # round the corners
# Gum: thin where it meets the bone side, thicker over the crest, sloping up to a collar at the neck of the tooth.
def half_width(z):
    from shapely.geometry import LineString
    seg = bone_prof.intersection(LineString([(-50, z), (50, z)])).bounds
    return (seg[2] - seg[0]) / 2, (seg[2] + seg[0]) / 2
zb_g = crest - 3.5
w0, m0 = half_width(zb_g); w1, m1 = half_width(crest - 0.6)
left = [(m0 - w0, zb_g), (m1 - w1 - 0.8, crest - 0.6), (ymid - hn - 0.9, crest + 1.0), (ymid - hn - 0.2, gtop - 0.3), (ymid - hn + 1.0, gtop)]
right = [(m0 + w0, zb_g), (m1 + w1 + 0.8, crest - 0.6), (ymid + hn + 0.9, crest + 1.0), (ymid + hn + 0.2, gtop - 0.3), (ymid + hn - 1.0, gtop)]
gum_outline = Polygon(left + right[::-1])
gum_prof = gum_outline.buffer(0.6, join_style=1).buffer(-0.6, join_style=1).difference(bone_prof)
gum_prof = gum_prof.intersection(Polygon([(-50, zb_g), (50, zb_g), (50, gtop), (-50, gtop)]))
gum_prof = max(getattr(gum_prof, 'geoms', [gum_prof]), key=lambda p: p.area)
x0 = min(tooth.bounds[0, 0], pm_crown.bounds[0, 0]) - 1.2; x1 = max(tooth.bounds[1, 0], pm_crown.bounds[1, 0]) + 1.2
def extrude(poly):
    cs = mf.CrossSection([np.asarray(orient(poly, 1).exterior.coords)[:-1].tolist()])
    m = cs.extrude(float(x1 - x0))  # (u, v, w) -> (x = w + x0, y = u, z = v): a proper rotation
    return m.transform([[0, 0, 1, float(x0)], [1, 0, 0, 0], [0, 1, 0, 0]])
bone_block = extrude(bone_prof)
fc = np.array(pm_crown.centroid); follicle = Mpm.scale([1.12] * 3).translate(list(map(float, fc - 1.12 * fc)))
bone = bone_block - Mt - follicle
gum = extrude(gum_prof) - Mt - Mouter
gum = max(gum.decompose(), key=lambda p: p.volume())  # drop slivers  # the gum hugs the tooth; a small sulcus remains around non-crown stages

def clean(Mx, min_vol=0.05):
    """Drop slivers left where boolean surfaces touch."""
    keep = [p for p in Mx.decompose() if p.volume() > min_vol]
    return mf.Manifold.batch_boolean(keep, mf.OpType.Add) if keep else Mx
prep_tooth, prep_base, cement, crown, decay, filling, sound = map(clean, (prep_tooth, prep_base, cement, crown, decay, filling, sound))

STAGES = {
    'healthy':  {'teeth': Mt, 'pulp': Mp},
    'decay':    {'teeth': sound, 'decay': decay, 'pulp': Mp},
    'filling':  {'teeth': sound, 'filling': filling, 'pulp': Mp},
    'prepared': {'teeth': prep_tooth, 'filling': prep_base, 'pulp': Mp},
    'crown':    {'teeth': prep_tooth, 'filling': prep_base, 'cement': cement, 'steel': crown, 'pulp': Mp},
}
COMMON = {'gum': gum, 'bone': bone, 'premolar': Mpm}

def glb(parts, path):
    sc = trimesh.Scene()
    to_gltf = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, -1, 0, 0], [0, 0, 0, 1]], float)  # z up -> y up; tongue (+y) -> -z
    S = trimesh.transformations.scale_matrix(0.001)
    for name, Mx in parts.items():
        tm = T(Mx)
        if len(tm.faces) == 0: continue
        tm.apply_transform(S @ to_gltf)
        k = MAT[name]
        mat = trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=[int(round(v * 255)) for v in k['c']],
                                                  metallicFactor=k['m'], roughnessFactor=k['r'])
        tm.visual = trimesh.visual.TextureVisuals(material=mat)
        sc.add_geometry(tm, node_name=name, geom_name=name)
    sc.export(path)

print_dir = OUT / 'print'; print_dir.mkdir(exist_ok=True)
report = {}
for st, parts_ in STAGES.items():
    glb({**COMMON, **parts_}, OUT / f'{st}.glb')
    report[st] = {k: round(v.volume(), 2) for k, v in {**COMMON, **parts_}.items()}
# Print parts at 2x: base (bone + gum with socket), one tooth per stage, crown and cement.
S2 = 2.0
def stl(Mx, name):
    tm = T(Mx.scale([S2] * 3))
    if not tm.is_watertight: tm.fill_holes()
    tm.export(print_dir / f'{name}.stl'); return len(tm.faces), tm.is_watertight
prints = {
    'base-bone': bone, 'base-gum': gum, 'premolar-crown': Mpm,
    'tooth-healthy': Mt, 'tooth-decay-sound-part': sound, 'tooth-decay-decay-part': decay,
    'tooth-filling-tooth-part': sound, 'tooth-filling-filling-part': filling,
    'tooth-prepared': prep_tooth, 'tooth-prepared-base': prep_base, 'crown-steel': crown, 'crown-cement': cement,
}
report['print'] = {k: stl(v, k) for k, v in prints.items()}
(OUT / 'build_report.json').write_text(json.dumps(report, indent=1))
print(json.dumps(report, indent=1))
