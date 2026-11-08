"""Oral pathology pair: an unerupted lower left third molar (38) with a normal dental follicle, and the same
tooth with a dentigerous cyst. Built on BodyParts3D 4.0 (CC BY 4.0).

Usage: python -I build.py <BodyParts3D isa obj folder> <out dir>

Base meshes (BodyParts3D 4.0, "isa" tree, DBCLS): FJ3289 mandible, FJ1257 (35), FJ1254 (36), FJ1256 (37), and
the other lower teeth only to find the occlusal plane. BodyParts3D has no third molars, so 38 is the
BodyParts3D 37 shape moved behind 37 and down into the bone (a stated simplification: real third molars vary
more in shape and are often smaller). Hand-built from cited figures: the follicle and the cyst (constants below).
Geometry: signed distance fields on a 0.25 mm grid, meshed with marching cubes (helpers from tools/endo).

Outputs: normal-{whole,cut}.glb, cyst-{whole,cut}.glb, STL print zips (1x), report.json.
"""
import json
import os
import sys
import zipfile

import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'endo'))
sys.path.insert(0, os.path.join(HERE, '..', 'tokens'))
import build as endo  # noqa: E402  (Grid, SDF helpers, mesher and GLB writer)
from colours import LINEAR  # noqa: E402

PITCH = endo.PITCH = 0.3
# ---------------------------------------------------------------- cited figures (mm, mm3)
# Position: Pell & Gregory (1933) position C = the highest part of the third molar lies below the cervical line
# (CEJ) of the second molar. Vertical (upright) angulation; vertical impactions were more often dentigerous cysts
# than mesioangular ones (Telcioglu et al. 2026). Depth inside class C is DRAWN:
ANGLE = float(os.environ.get('ANGLE', 0))     # crown tilt towards 37; 0 = vertical (Winter classification: Juodzbalys & Daugela 2013)
POSITION = os.environ.get('POSITION', 'B')  # Pell & Gregory: B = top between the occlusal plane and the CEJ of 37
# Third molar smaller than the second molar (mean crown width and tooth length, Wheeler's Dental Anatomy):
MD37, MD38 = 10.5, 10.0
LEN37, LEN38 = 20.5, 18.0
BELOW_CEJ7 = 0.5          # DRAWN: top of 38 this far below the CEJ of 37 (any value > 0 is position C)
CREST_BELOW_CEJ = 1.5     # alveolar crest below the CEJ (healthy, <= 2 mm): Anbiaee & Pahlavanzadeh 2024
# CEJ of each tooth: anatomic crown length and root length (Wheeler's Dental Anatomy measurement table, Nelson
# 2020). The CEJ is put at crown / (crown + root) of the BodyParts3D tooth's own height below its cusp tip, so
# enamel covers the crown and cementum only the root, whatever the size of the base mesh.
CROWN_ROOT = {35: (8.0, 14.5), 36: (7.5, 14.0), 37: (7.5, 13.0), 38: (7.0, 11.0)}
# Follicle: a pericoronal radiolucency >= 2.5 mm wide was associated with a dentigerous cyst (Telcioglu et al. 2026);
# the normal follicle is DRAWN narrower than that.
FOLLICLE = 1.0            # DRAWN normal follicle width around the crown (< 2.5 mm)
# Cyst size: mean volume of jaw cysts measured on CT, 5,800 mm3 (Kauke et al. 2018; dentigerous and radicular
# cysts pooled). The ellipsoid proportions are DRAWN: longest front to back, extending behind the tooth.
CYST_VOLUME = 5800.0
CYST_AXES = np.array([14.0, 9.0, 11.0])   # semi-axes (front-back, cheek-tongue, up-down); volume checked below
SHELL = 1.0               # DRAWN thin expanded bone over the cyst
PRINT_SCALE = 1.0

COL = {
    'teeth': (LINEAR['model.tooth'], 0.55), 'bone': (LINEAR['model.bone'], 0.8),
    'follicle': (LINEAR['model.lining'], 0.7), 'cyst': (LINEAR['model.cyst'], 0.45),
    'bone_cut': (LINEAR['model.boneCut'], 0.9), 'tooth_cut': (LINEAR['model.dentineCut'], 0.7),
    'follicle_cut': (LINEAR['model.lining'], 0.9), 'cyst_cut': (LINEAR['model.cyst'], 0.8),
    'enamel_cut': (LINEAR['model.enamelCut'], 0.5), 'cementum': (LINEAR['model.cementum'], 0.8),
    'cementum_cut': (LINEAR['model.cementum'], 0.8),
}
# Tooth layers as in tools/endo (endo.layer_labels): teeth = enamel surface, teeth_1 = dentine cut,
# teeth_2 = enamel cut, teeth_3 = cementum surface, teeth_4 = cementum cut.
GLTF_NAME = {'bone_cut': 'bone_1', 'tooth_cut': 'teeth_1', 'follicle_cut': 'follicle_1', 'cyst_cut': 'cyst_1',
             'enamel_cut': 'teeth_2', 'cementum': 'teeth_3', 'cementum_cut': 'teeth_4'}
endo.COL, endo.GLTF_NAME = COL, GLTF_NAME

FDI = {'FJ1254': 36, 'FJ1255': 34, 'FJ1256': 37, 'FJ1257': 35, 'FJ1258': 31, 'FJ1259': 32, 'FJ1260': 33,
       'FJ1268': 46, 'FJ1269': 44, 'FJ1270': 47, 'FJ1271': 45, 'FJ1272': 41, 'FJ1273': 42, 'FJ1274': 43}


def occlusal_frame(teeth):
    tips = np.array([t.vertices[np.argmax(t.vertices[:, 2])] for t in teeth.values()])
    c = tips.mean(0)
    w, u = np.linalg.eigh(np.cov((tips - c).T))
    z = u[:, 0] if u[2, 0] > 0 else -u[:, 0]
    front = (teeth[31].centroid + teeth[41].centroid) / 2 - (teeth[36].centroid + teeth[46].centroid) / 2
    y = -front - z * (-front @ z)
    y /= np.linalg.norm(y)
    x = np.cross(y, z)
    return np.array([x, y, z]), c


def column_top(mask, zs):
    any_ = mask.any(2)
    k = len(zs) - 1 - np.argmax(mask[:, :, ::-1], axis=2)
    return np.where(any_, zs[k], -np.inf)


def build(folder, out):
    os.makedirs(out, exist_ok=True)
    mand = endo.load(folder, 'FJ3289')
    teeth = {FDI[f]: endo.load(folder, f) for f in FDI}
    R, c = occlusal_frame(teeth)
    for m in [mand] + list(teeth.values()):
        m.vertices = (m.vertices - c) @ R.T
    # Local frame at 37: X = distal along the arch (36 -> 37), Z = occlusal normal, Y = X cross Z.
    o = teeth[37].centroid.copy()
    u = teeth[37].centroid[:2] - teeth[36].centroid[:2]
    u = np.array([u[0], u[1], 0.0]) / np.linalg.norm(u)
    v = np.cross([0, 0, 1.0], u)
    L = np.array([u, v, [0, 0, 1.0]])
    for m in [mand] + list(teeth.values()):
        m.vertices = (m.vertices - o) @ L.T
    mid = (np.zeros(3) - o) @ L.T                   # centre of the crown tips, near the midline
    lingual = float(np.sign(mid[1]))                # the midline is on the lingual (tongue) side

    t37 = teeth[37]
    md37 = float(np.ptp(t37.vertices[:, 0]))
    top37 = float(t37.vertices[:, 2].max())
    x_lo = teeth[35].bounds[0][0] - 1.0
    x_hi = t37.bounds[1][0] + md37 + 2 * CYST_AXES[0] + 18.0   # far enough back that the ramus joins the body
    sel = mand.vertices[(mand.vertices[:, 0] > x_lo) & (mand.vertices[:, 0] < x_hi) & (np.abs(mand.vertices[:, 1]) < 25)]   # this side only
    lo = np.array([x_lo, sel[:, 1].min() - 3.0, sel[:, 2].min() - 2.0])
    hi = np.array([x_hi, sel[:, 1].max() + 3.0, top37 + 24.0])
    G = endo.Grid(lo, hi)
    print('grid', G.shape)
    Bm = endo.inside_mask(mand, G.xs, G.ys, G.zs)
    near = [35, 36, 37]
    Tm = np.zeros(G.shape, bool)
    for n in near:
        Tm |= endo.inside_mask(teeth[n], G.xs, G.ys, G.zs)
    T = endo.sdf(Tm, 1.5)
    B = endo.sdf(Bm, 2.0)

    # CEJ of each tooth from Wheeler's crown : root proportions (CROWN_ROOT), measured along the occlusal axis.
    frac = {n: cr / (cr + rt) for n, (cr, rt) in CROWN_ROOT.items()}
    cej = {n: float(teeth[n].vertices[:, 2].max() - frac[n] * np.ptp(teeth[n].vertices[:, 2])) for n in near}
    apex = {n: float(teeth[n].vertices[:, 2].min()) for n in near}
    cej37 = cej[37]
    crown_h = top37 - cej37
    # Healthy alveolar crest CREST_BELOW_CEJ below each tooth's CEJ: BodyParts3D bone reaches higher up the
    # crowns, so it is lowered around 35-37 (a smooth cap, 3 mm around each tooth, easing out over ~3 mm).
    cap = np.full(G.shape[:2], np.inf)
    for n in near:
        foot = ndimage.binary_dilation(endo.inside_mask(teeth[n], G.xs, G.ys, G.zs).any(2), iterations=int(3.0 / PITCH))
        cap[foot] = np.minimum(cap[foot], cej[n] - CREST_BELOW_CEJ)
    far = ~np.isfinite(cap)
    cap = np.where(far, G.zs[-1] + 5.0, cap)
    cap = ndimage.grey_erosion(cap, size=int(2.0 / PITCH))      # keep the cap flat right around the teeth
    cap = ndimage.gaussian_filter(cap, 1.0 / PITCH)
    crest_cap = G.full(G.Z - cap[:, :, None])

    # 38: the 37 shape, moved distally until its follicle clears 37, top BELOW_CEJ7 below the CEJ of 37.
    # Tip the crown towards 37 by ANGLE (rotation about the cheek-tongue axis through the tooth's centre).
    th = np.radians(ANGLE)
    Ry = np.array([[np.cos(th), 0, -np.sin(th)], [0, 1, 0], [np.sin(th), 0, np.cos(th)]])
    shrink = np.array([MD38 / MD37, MD38 / MD37, LEN38 / LEN37])
    base = ((t37.vertices - t37.centroid) * shrink) @ Ry.T + t37.centroid
    target_top = (top37 + cej37) / 2 if POSITION == 'B' else cej37 - BELOW_CEJ7
    dz = target_top - base[:, 2].max()
    from scipy.spatial import cKDTree
    nb = cKDTree(np.vstack([teeth[n].sample(30000) for n in near]))
    own = t37.sample(20000)
    own = ((own - t37.centroid) * shrink) @ Ry.T + t37.centroid
    dx = 0.0
    # Follow the jaw: behind 37 the body curves towards the ramus, so 38 is centred cheek-to-tongue in the bone
    # (bone between the CEJ level of 37 and 15 mm below it, in a 6 mm slab at the tooth's position).
    zsel = (G.zs > cej37 - 15) & (G.zs < cej37)
    def centre_y(x):
        xsel = np.abs(G.xs - x) < 3
        ysel = np.abs(G.ys - c0[1]) < 9.0          # the jaw body near the line of the teeth, not the ramus
        m = Bm[xsel][:, :, zsel] & ysel[None, :, None]
        jj = np.nonzero(m.any(axis=(0, 2)))[0]
        w = m.sum(axis=(0, 2))[jj]
        return float((G.ys[jj] * w).sum() / w.sum())
    c0 = own.mean(0)
    dx = 0.5 * md37
    dy = 0.0
    while True:
        dy = centre_y(c0[0] + dx) - c0[1]
        if nb.query(own + [dx, dy, dz])[0].min() >= FOLLICLE + 0.3:
            break
        dx += 0.1
    t38 = t37.copy()
    t38.vertices = base + [dx, dy, dz]
    m38 = endo.inside_mask(t38, G.xs, G.ys, G.zs)
    T38 = endo.sdf(m38, 1.5)
    top38 = float(t38.vertices[:, 2].max())
    crown_dir = Ry @ [0, 0, 1.0]
    c38 = t38.centroid
    sv = (t38.vertices - c38) @ crown_dir
    s_cej = float(sv.max()) - frac[38] * float(np.ptp(sv))   # the CEJ, measured along the tooth's own axis
    pc = c38 + crown_dir * s_cej                  # centre of the tooth at the CEJ
    S = G.full((G.X - c38[0]) * crown_dir[0] + (G.Y - c38[1]) * crown_dir[1] + (G.Z - c38[2]) * crown_dir[2])
    cej38 = float(pc[2])
    apex38 = float(t38.vertices[:, 2].min())
    Tall = endo.union(T, T38)
    Tn = {n: endo.sdf(endo.inside_mask(teeth[n], G.xs, G.ys, G.zs), 1.5) for n in near}
    Tn[38] = T38
    cej[38], apex[38] = cej38, apex38
    order = list(Tn)

    def nearest(p, vals):
        d = np.stack([endo.field_at(G, Tn[n], p) for n in order])
        return np.array([vals[n] for n in order])[np.argmin(d, axis=0)]

    # Crop: the posterior body and the lower ramus, with a smooth front cut in front of 35.
    box = G.full(np.maximum(x_lo + 1.5 - G.X, G.X - (x_hi - 1.5)))
    B = endo.isect(B, box, crest_cap)

    # Normal: a thin follicle over the crown, attached at the CEJ (Daley & Wysocki 1995).
    crownzone = s_cej - S
    F = ndimage.gaussian_filter(endo.isect(T38 - FOLLICLE, -T38, crownzone), 1.0)
    F = endo.isect(F, -T38)
    Fsp = endo.isect(T38 - FOLLICLE, crownzone)
    Bn = endo.isect(B, -T, -T38, -Fsp)

    # Cyst: an ellipsoid with its lower pole just below the CEJ of 38 and its centre behind the crown, so the
    # crown points into it (the lining attaches at the CEJ: Soluk-Tekkesin & Wright 2022).
    a = CYST_AXES
    vol = 4 / 3 * np.pi * a.prod()
    cc = np.array([pc[0] + 0.25 * a[0], pc[1], pc[2] + 0.45 * a[2]])   # DRAWN placement: around the crown, more behind it
    C = G.ellipsoid(cc, a)
    C = endo.isect(C, -(T - 0.6))                  # stops short of the neighbouring roots
    K = endo.isect(C, -T38)
    Bc = endo.isect(endo.union(B, endo.isect(C - SHELL, box)), -C, -T, -T38)

    bottom = -column_top(Bm[:, :, ::-1], -G.zs[::-1])
    ap = t38.vertices[np.argmin(t38.vertices[:, 2])]
    i = np.argmin(np.abs(G.xs - ap[0])); j = np.argmin(np.abs(G.ys - ap[1]))
    win = bottom[max(i - 2, 0):i + 3, max(j - 2, 0):j + 3]
    lower_border = float(win[np.isfinite(win)].max()) if np.isfinite(win).any() else float("nan")
    report = {
        'base': 'BodyParts3D 4.0 (DBCLS), FJ3289 + FJ1254 (36), FJ1256 (37), FJ1257 (35); 38 = copy of 37; CC BY 4.0',
        'lingual_sign': lingual,
        'crest_below_cej_mm': CREST_BELOW_CEJ, 'crown_height_37_mm': round(crown_h, 2),
        'tooth_height_mm': {n: round(float(np.ptp(teeth[n].vertices[:, 2])), 2) for n in near},
        'crown_root_wheeler_mm': CROWN_ROOT,
        'pell_gregory_position': POSITION, 'angle_deg': ANGLE, 'shrink_md_len': [MD38 / MD37, LEN38 / LEN37], 'distal_offset_38_mm': round(dx, 2), 'lateral_offset_38_mm': round(dy, 2), 'md_width_37_mm': round(md37, 2),
        'apex38_above_lower_border_mm': round(apex38 - lower_border, 2),
        'tooth38_outside_jaw_mm3': round(float((m38 & ~Bm).sum()) * PITCH ** 3, 1),
        'follicle_drawn_mm': FOLLICLE, 'follicle_cyst_threshold_mm': 2.5,
        'cyst_semi_axes_mm': a.tolist(), 'cyst_ellipsoid_volume_mm3': round(vol), 'cyst_target_mm3': CYST_VOLUME,
        'cyst_lumen_volume_mm3': round(float((K < 0).sum()) * PITCH ** 3),
        'cyst_shell_drawn_mm': SHELL,
    }
    print(json.dumps(report, indent=1, default=float))
    if os.environ.get('DRY'):
        from PIL import Image
        j = int(np.argmin(np.abs(G.ys - c38[1])))
        img = np.full((len(G.zs), len(G.xs), 3), 255, np.uint8)
        sl = lambda m: m[:, j, :].T[::-1]
        img[sl(Bm)] = (225, 205, 165); img[sl(Tm)] = (220, 40, 40); img[sl(m38)] = (200, 0, 200)
        img[sl((C < 0) & ~m38)] = np.minimum(img[sl((C < 0) & ~m38)], 255) // 2 + (110, 100, 30)
        Image.fromarray(img).resize((len(G.xs) * 2, len(G.zs) * 2)).save(os.environ['DRY'])
        return
    states = {
        'normal': {'bone': [('bone', Bn)], 'teeth': [('teeth', endo.union(T, T38))], 'follicle': [('follicle', F)]},
        'cyst': {'bone': [('bone', Bc)], 'teeth': [('teeth', endo.union(T, T38))], 'cyst': [('cyst', K)]},
    }
    # Cut view: a front-to-back cut through the middle of 38, keeping the tongue side (like a panoramic view in 3D).
    keep = G.full(lingual * (G.Y - c38[1]))
    cutlab = {'bone': 'bone_cut', 'teeth': 'tooth_cut', 'follicle': 'follicle_cut', 'cyst': 'cyst_cut'}
    for st, parts in states.items():
        for variant in ('whole', 'cut'):
            g = endo.Glb()
            for part, terms in parts.items():
                tt = terms + ([('cut', -keep)] if variant == 'cut' else [])
                res = endo.mesh(G, tt, 70000 if part == 'bone' else 30000)
                if res is None:
                    continue
                m, labels = res
                labels = [cutlab[part] if l == 'cut' else l for l in labels]
                if part == 'teeth':
                    # enamel / dentine / cementum by tooth: 38 has its own CEJ and apex
                    m, labels = endo.layer_labels(G, m, labels, Tall, lambda p: nearest(p, cej), lambda p: nearest(p, apex))
                g.add(part, m, labels)
            g.save(os.path.join(out, f'{st}-{variant}.glb'))
            print(st, variant, os.path.getsize(os.path.join(out, f'{st}-{variant}.glb')) // 1024, 'KB')
        write_print(G, st, parts, out)

    json.dump(report, open(os.path.join(out, 'report.json'), 'w'), indent=1, default=float)


def write_print(G, st, parts, out):
    zp = os.path.join(out, f'vivatheca-dentigerous-cyst-{st}-1x.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for part, terms in parts.items():
            res = None
            for target in (200000, 400000, 10 ** 9):
                res = endo.mesh(G, terms, target)
                if res is None or res[0].is_watertight:
                    break
            if res is None:
                continue
            m = res[0]
            m.apply_scale(PRINT_SCALE)
            z.writestr(f'{st}-{part}.stl', m.export(file_type='stl'))
        z.writestr('README.txt', README_PRINT)


README_PRINT = """Vivatheca dentigerous cyst model (unerupted lower wisdom tooth, normal and with a cyst), life size, STL in millimetres.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
See https://vivatheca.com/disclaimer
Not yet clinically reviewed.
The wisdom tooth is a copy of the second molar shape, and the follicle and cyst are drawn shapes sized from published figures.
Licence: CC BY 4.0. Made by Vivatheca from BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution 4.0 International.
"""

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
