"""Prosthodontic pair: a dentate lower jaw and the same jaw after all its teeth are lost, with a flat,
resorbed ridge (Cawood and Howell class V), with two options: a complete lower denture, or a denture held
by two implants (mandibular two-implant overdenture). Built on BodyParts3D 4.0 (CC BY 4.0).

Usage: python -I build.py <BodyParts3D isa obj folder> <out dir>

Base meshes (BodyParts3D 4.0, "isa" tree, DBCLS): FJ3289 mandible and the 14 lower permanent teeth
(FJ1254-FJ1260 left, FJ1268-FJ1274 right; no third molars in BodyParts3D). Hand-built from cited figures:
the resorbed ridge, the mucosa, the denture and the implants (see the constants below).
Geometry: signed distance fields on a 0.35 mm grid, meshed with marching cubes (helpers from tools/endo).

Outputs: dentate-, edentulous-, denture-, overdenture- {whole,cut}.glb, STL print zips (1x),
report.json (every measured and cited value).
"""
import json
import os
import sys
import zipfile

import numpy as np
import trimesh
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'endo'))
sys.path.insert(0, os.path.join(HERE, '..', 'tokens'))
import build as endo  # noqa: E402  (Grid, SDF helpers, mesher and GLB writer)
from colours import LINEAR  # noqa: E402

PITCH = endo.PITCH = 0.35
# ---------------------------------------------------------------- cited figures (mm)
# Cawood & Howell 1988: after tooth loss the alveolar process resorbs in a predictable pattern while the
# basal bone stays relatively stable; class V = flat ridge (alveolar process lost, inadequate height and
# width). The ridge is drawn at a set height above the lower border of the jaw:
H_SYMPHYSIS = 15.00 + 7.60   # midline, edentulous: crest to lingual canal 15.00 + canal to lower border 7.60
H_SYMPH_DENTATE = 20.79 + 8.49   # (dentate: 20.79 + 8.49), Fouda et al. 2020, CBCT
H_MOLAR = 12.8               # mean mandibular height of atrophic edentulous mandibles: Gerbino et al. 2018
# (Luhr et al. 1996 class II, 11-15 mm). The two heights come from different studies; the curve between
# them (straight line from the midline to the first molar) is drawn.
LUHR = {'I': (16, 20), 'II': (11, 15), 'III': (0, 10)}
MUCOSA = 1.63            # mean ridge mucosa thickness in completely edentulous patients: Bergmann et al. 2023
CREST_BELOW_CEJ = 1.5    # dentate alveolar crest below the CEJ (healthy, <= 2 mm): Anbiaee & Pahlavanzadeh 2024
# McGill consensus (Feine et al. 2002): two implants in the canine areas, holding a lower denture.
IMPLANT_R, IMPLANT_LEN = 2.05, 8.0  # 4.1 mm x 8 mm, as used for two-implant overdentures by Maniewicz et al. 2017
ABUT_R, BALL_R = 1.6, 1.25           # DRAWN ball abutment
BASE_THICK = 2.0                     # DRAWN denture base thickness over the mucosa
FLANGE = 4.0                         # DRAWN flange depth below the ridge top
PRINT_SCALE = 1.0

COL = {
    'teeth': (LINEAR['model.tooth'], 0.55), 'bone': (LINEAR['model.bone'], 0.8), 'gum': (LINEAR['model.gum'], 0.7),
    'denture': (LINEAR['model.dentureBase'], 0.45), 'denture_teeth': (LINEAR['model.tooth'], 0.4),
    'implant': (LINEAR['model.hardware'], 0.35), 'bone_cut': (LINEAR['model.boneCut'], 0.9),
    'tooth_cut': (LINEAR['model.dentineCut'], 0.7), 'gum_cut': (LINEAR['model.gum'], 0.9),
    'denture_cut': (LINEAR['model.dentureBase'], 0.8), 'implant_cut': (LINEAR['model.hardware'], 0.6),
    'enamel_cut': (LINEAR['model.enamelCut'], 0.5), 'cementum': (LINEAR['model.cementum'], 0.8),
    'cementum_cut': (LINEAR['model.cementum'], 0.8),
}
# /model-parts.js groups materials by name with a trailing _<n> removed, so cut faces hide with their part.
GLTF_NAME = {'bone_cut': 'bone_1', 'tooth_cut': 'teeth_1', 'gum_cut': 'gum_1', 'denture_cut': 'denture_1',
             'implant_cut': 'implant_1', 'denture_teeth': 'denture_2',
             # natural tooth layers as in tools/endo (endo.layer_labels)
             'enamel_cut': 'teeth_2', 'cementum': 'teeth_3', 'cementum_cut': 'teeth_4'}
endo.COL, endo.GLTF_NAME = COL, GLTF_NAME

LEFT = ['FJ1254', 'FJ1255', 'FJ1256', 'FJ1257', 'FJ1258', 'FJ1259', 'FJ1260']
RIGHT = ['FJ1268', 'FJ1269', 'FJ1270', 'FJ1271', 'FJ1272', 'FJ1273', 'FJ1274']
FDI = {'FJ1254': 36, 'FJ1255': 34, 'FJ1256': 37, 'FJ1257': 35, 'FJ1258': 31, 'FJ1259': 32, 'FJ1260': 33,
       'FJ1268': 46, 'FJ1269': 44, 'FJ1270': 47, 'FJ1271': 45, 'FJ1272': 41, 'FJ1273': 42, 'FJ1274': 43}
ARCH = [47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37]


def occlusal_frame(teeth):
    """z = normal of the occlusal plane (least-squares plane through the highest point of each crown),
    y = front to back along the midline, x = to the patient's left. Origin: centre of the crown tips."""
    tips = np.array([t.vertices[np.argmax(t.vertices[:, 2])] for t in teeth.values()])
    c = tips.mean(0)
    w, u = np.linalg.eigh(np.cov((tips - c).T))
    z = u[:, 0] if u[2, 0] > 0 else -u[:, 0]
    front = (teeth[31].centroid + teeth[41].centroid) / 2 - (teeth[36].centroid + teeth[46].centroid) / 2
    y = -front - z * (-front @ z)
    y /= np.linalg.norm(y)
    x = np.cross(y, z)
    return np.array([x, y, z]), c


def arch_coords(G, pts, ext=7.0):
    """For every (x, y) column: arc-length position t along the dental arch (tooth centres, extended
    `ext` mm distally at both ends) and the lateral distance d from it."""
    poly = arch_polyline(pts, ext)
    seg = np.diff(poly, axis=0)
    cum = np.concatenate([[0], np.cumsum(np.linalg.norm(seg, axis=1))])
    X, Y = np.meshgrid(G.xs, G.ys, indexing='ij')
    q = np.stack([X, Y], -1)
    best_d = np.full(X.shape, np.inf)
    best_t = np.zeros(X.shape)
    for i, (a, s) in enumerate(zip(poly[:-1], seg)):
        u = np.clip(((q - a) @ s) / (s @ s), 0, 1)
        d = np.linalg.norm(q - (a + u[..., None] * s), axis=-1)
        m = d < best_d
        best_d[m] = d[m]
        best_t[m] = cum[i] + u[m] * np.linalg.norm(s)
    return best_t, best_d, cum


def arch_polyline(pts, ext=7.0):
    p = np.asarray(pts, float)
    a0 = p[0] + (p[0] - p[1]) / np.linalg.norm(p[0] - p[1]) * ext
    a1 = p[-1] + (p[-1] - p[-2]) / np.linalg.norm(p[-1] - p[-2]) * ext
    return np.vstack([a0, p, a1])


def column_top(mask, zs):
    """Highest z inside the mask per (x, y) column (-inf where empty)."""
    any_ = mask.any(2)
    k = len(zs) - 1 - np.argmax(mask[:, :, ::-1], axis=2)
    return np.where(any_, zs[k], -np.inf)


def column_height(mask, zs, i, j):
    col = np.nonzero(mask[i, j])[0]
    return float(zs[col.max()] - zs[col.min()]) if len(col) else 0.0


def build(folder, out):
    os.makedirs(out, exist_ok=True)
    mand = endo.load(folder, 'FJ3289')
    teeth = {FDI[f]: endo.load(folder, f) for f in LEFT + RIGHT}
    R, c = occlusal_frame(teeth)
    for m in [mand] + list(teeth.values()):
        m.vertices = (m.vertices - c) @ R.T
    lo, hi = mand.bounds
    G = endo.Grid(lo - 3.0, hi + 3.0)
    print('grid', G.shape)
    Bm = endo.inside_mask(mand, G.xs, G.ys, G.zs)
    Tm = {n: endo.inside_mask(t, G.xs, G.ys, G.zs) for n, t in teeth.items()}
    Tall = np.zeros(G.shape, bool)
    for m in Tm.values():
        Tall |= m
    B = endo.sdf(Bm, 2.0)
    T = endo.sdf(Tall, 1.5)

    # Arch, root tips and CEJ per tooth.
    cen = [teeth[n].centroid[:2] for n in ARCH]
    t, d, cum = arch_coords(G, cen)
    tooth_t = cum[1:-1]
    apex = np.array([teeth[n].bounds[0][2] for n in ARCH])
    bone_top = column_top(Bm & ~Tall, G.zs)
    cej = []
    for n in ARCH:
        foot = ndimage.binary_dilation(Tm[n].any(2), iterations=int(1.5 / PITCH))
        crest = np.percentile(bone_top[foot & np.isfinite(bone_top)], 90)
        cej.append(crest + CREST_BELOW_CEJ)
    cej = np.array(cej)
    half_w = []
    for n in ARCH:  # buccolingual half-width of each crown, measured on the BodyParts3D tooth
        v = teeth[n].vertices
        k = ARCH.index(n)
        a, b = (cen[max(k - 1, 0)], cen[min(k + 1, len(cen) - 1)])
        tang = (np.asarray(b) - np.asarray(a)); tang /= np.linalg.norm(tang)
        nrm = np.array([-tang[1], tang[0]])
        half_w.append(np.ptp((v[:, :2] - cen[k]) @ nrm) / 2)
    half_w = np.array(half_w)

    # Resorbed ridge along the arch: H(t) above the lower border of the jaw under the arch line, from
    # H_SYMPHYSIS at the midline to H_MOLAR at the first molars and behind, rising smoothly into the
    # retromolar area and ramus beyond the last molar (the ramus is not resorbed).
    tmid = (tooth_t[6] + tooth_t[7]) / 2
    t6 = (tooth_t[1], tooth_t[-2])
    ts = np.linspace(cum[0], cum[-1], 400)
    Hs = np.where(ts < tmid, np.interp(ts, [t6[0], tmid], [H_MOLAR, H_SYMPHYSIS]),
                  np.interp(ts, [tmid, t6[1]], [H_SYMPHYSIS, H_MOLAR]))
    # lower border under each arch point
    bottom_col = -column_top(Bm[:, :, ::-1], -G.zs[::-1])  # lowest z inside per column
    poly = arch_polyline(cen)
    pts = np.array([np.interp(ts, cum, poly[:, k]) for k in range(2)]).T
    bot = []
    for p in pts:
        i = np.argmin(np.abs(G.xs - p[0])); j = np.argmin(np.abs(G.ys - p[1]))
        win = bottom_col[max(i - 3, 0):i + 4, max(j - 3, 0):j + 4]
        win = win[np.isfinite(win)]
        bot.append(win.min() if len(win) else np.nan)
    bot = ndimage.gaussian_filter1d(np.nan_to_num(np.array(bot), nan=np.nanmedian(bot)), 6)
    L = np.interp(t, ts, bot + Hs)
    e = np.maximum(tooth_t[0] - t, t - tooth_t[-1])
    L = L + np.where(e > 0, 0.35 * e ** 2, 0)
    zone = d < 13.0
    L = np.where(zone, L, np.inf)
    Lf = np.where(np.isfinite(L), L, 200)
    Lf = ndimage.gaussian_filter(Lf, 1.5 / PITCH)
    Lcut = G.full(G.Z - Lf[:, :, None])
    Bfull = endo.union(B, T)
    Be = ndimage.gaussian_filter(endo.isect(Bfull, Lcut), 3.0)  # rounded crest
    Be_mask = Be < 0

    # Implants (option): canine areas, upright, top at the bone surface of their column.
    def ridge_top_at(xy):
        i = np.argmin(np.abs(G.xs - xy[0])); j = np.argmin(np.abs(G.ys - xy[1]))
        return float(column_top(Be_mask[i:i + 1, j:j + 1], G.zs)[0, 0])
    impl, abut = [], []
    for n in (33, 43):
        xy = teeth[n].centroid[:2]
        top = ridge_top_at(xy)
        rr = np.sqrt((G.X - xy[0]) ** 2 + (G.Y - xy[1]) ** 2)
        body = np.maximum(rr - IMPLANT_R, np.maximum(G.Z - top, (top - IMPLANT_LEN) - G.Z))
        tip = np.sqrt(rr ** 2 + (G.Z - (top - IMPLANT_LEN + IMPLANT_R)) ** 2) - IMPLANT_R
        body = np.minimum(np.maximum(body, (top - IMPLANT_LEN + IMPLANT_R) - G.Z), tip)
        impl.append(G.full(body))
        stem = np.maximum(rr - ABUT_R, np.maximum(G.Z - (top + MUCOSA + 1.2), top - 0.2 - G.Z))
        ball = np.sqrt(rr ** 2 + (G.Z - (top + MUCOSA + 1.2 + BALL_R * 0.8)) ** 2) - BALL_R
        abut.append(G.full(np.minimum(stem, ball)))
    I = endo.union(*impl)
    A = endo.union(*abut)

    # Mucosa: a 1.63 mm layer over the bone of the ridge, down to 4 mm below the ridge top (drawn limit),
    # between the last molar positions. Limits are smooth fields so the edges stay clean.
    lim2d = ndimage.gaussian_filter(np.maximum.reduce([d - 12.0, tooth_t[0] - 2.0 - t, t - (tooth_t[-1] + 2.0)]), 1.0 / PITCH)
    zoneZ = endo.isect(G.full(lim2d[:, :, None]), G.full((Lf - 4.0)[:, :, None] - G.Z))
    Me = ndimage.gaussian_filter(endo.isect(Be - MUCOSA, -Be, zoneZ), 1.0)
    # Dentate gum: same thickness (drawn), a band within 3 mm of the teeth, above the old root level.
    near = ndimage.gaussian_filter(T - 3.0, 2.0)
    Md = ndimage.gaussian_filter(endo.isect(B - MUCOSA, -B, -T, near, G.full((np.interp(t, tooth_t, cej) - 7.0)[:, :, None] - G.Z)), 1.0)
    Bd = endo.isect(B, -T)

    # Denture: a base following the arch (crown half-width + 1 mm), from FLANGE below the ridge top up to
    # the old CEJ level, sitting on the mucosa; denture teeth are the BodyParts3D crowns above the CEJ.
    W = np.interp(t, tooth_t, half_w + 1.0)
    W = np.where(np.isfinite(L) & (t >= tooth_t[0] - 4) & (t <= tooth_t[-1] + 4), W, -5)
    Zc = np.interp(t, tooth_t, cej)
    Apz = np.interp(t, tooth_t, apex)
    lat = G.full((d - W)[:, :, None])
    top_base = G.full(G.Z - (Zc + 0.8)[:, :, None])
    bot_base = G.full((Lf - FLANGE)[:, :, None] - G.Z)
    ends = G.full(np.maximum(tooth_t[0] - 3.5 - t, t - (tooth_t[-1] + 3.5))[:, :, None])
    slab = ndimage.gaussian_filter(endo.isect(lat, top_base, bot_base, ends), 5.0) + 0.3
    crowns = endo.isect(T, G.full((Zc - 0.5)[:, :, None] - G.Z))
    Dbase = endo.isect(slab, -(Be - MUCOSA), -crowns)
    Dteeth = crowns

    states = {
        'dentate': {'bone': [('bone', Bd)], 'teeth': [('teeth', T)], 'gum': [('gum', Md)]},
        'edentulous': {'bone': [('bone', Be)], 'gum': [('gum', Me)]},
        'denture': {'bone': [('bone', Be)], 'gum': [('gum', Me)],
                    'denture': [('denture', Dbase)], 'denture_teeth': [('denture_teeth', Dteeth)]},
        'overdenture': {'bone': [('bone', Be), ('bone', -I)], 'gum': [('gum', Me), ('gum', -A), ('gum', -I)],
                        'implant': [('implant', endo.union(I, A))],
                        'denture': [('denture', Dbase), ('denture', -(A - 0.3))],
                        'denture_teeth': [('denture_teeth', Dteeth)]},
    }
    # Cut view: a cross-section through the left first molar area, removing the left side in front of it,
    # so the face shows the height of the jaw where a back tooth stands (or stood).
    y36 = teeth[36].centroid[1]
    # keep > 0 where the model stays: everything except the left side behind the cut (x > 0, y > y36).
    keep = G.full(np.maximum(-G.X, y36 - G.Y))
    cutlab = {'bone': 'bone_cut', 'teeth': 'tooth_cut', 'gum': 'gum_cut', 'denture': 'denture_cut',
              'denture_teeth': 'denture_cut', 'implant': 'implant_cut'}
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
                    # enamel / dentine / cementum, with each tooth's own CEJ and apex (nearest along the arch)
                    ij = ((m.triangles_center[:, :2] - G.origin[:2]) / PITCH).T
                    cej_f = ndimage.map_coordinates(Zc, ij, order=1, mode='nearest')
                    apex_f = ndimage.map_coordinates(Apz, ij, order=1, mode='nearest')
                    labels = endo.layer_labels(G, m, labels, T, cej_f, apex_f, outer=False)
                    # outer=False: the estimated CEJ sits just above the drawn gum margin, so a cementum band would
                    # look like gum recession; the outer surface stays tooth white and only the cut face is layered.
                g.add(part, m, labels)
            g.save(os.path.join(out, f'{st}-{variant}.glb'))
            print(st, variant, os.path.getsize(os.path.join(out, f'{st}-{variant}.glb')) // 1024, 'KB')
        write_print(G, st, parts, out)

    # Measurements on the result: crest (or ridge top) to the lower border, straight down the occlusal axis.
    bottom_at = lambda xy: float(bottom_col[np.argmin(np.abs(G.xs - xy[0])), np.argmin(np.abs(G.ys - xy[1]))])
    def ridge_h(xy):
        return ridge_top_at(xy) - bottom_at(xy)
    def dent_h(n):
        return cej[ARCH.index(n)] - CREST_BELOW_CEJ - bottom_at(teeth[n].centroid[:2])
    midxy = (teeth[31].centroid[:2] + teeth[41].centroid[:2]) / 2
    midcrest = max(cej[6], cej[7]) - CREST_BELOW_CEJ
    report = {
        'base': 'BodyParts3D 4.0 (DBCLS), FJ3289 + FJ1254-FJ1260 + FJ1268-FJ1274, CC BY 4.0',
        'teeth_fdi': ARCH,
        'apex_z_mm': dict(zip(map(str, ARCH), np.round(apex, 2).tolist())),
        'cej_z_mm': dict(zip(map(str, ARCH), np.round(cej, 2).tolist())),
        'height_mm': {
            'dentate_at_36': round(float(dent_h(36)), 1), 'dentate_at_46': round(dent_h(46), 1),
            'dentate_symphysis': round(midcrest - bottom_at(midxy), 1),
            'edentulous_at_36': round(ridge_h(teeth[36].centroid[:2]), 1), 'edentulous_at_46': round(ridge_h(teeth[46].centroid[:2]), 1),
            'edentulous_at_34': round(ridge_h(teeth[34].centroid[:2]), 1),
            'edentulous_symphysis': round(ridge_h(midxy), 1),
            'targets': {'symphysis_edentulous': H_SYMPHYSIS, 'symphysis_dentate_reference': H_SYMPH_DENTATE, 'molar_edentulous': H_MOLAR},
        },
        'luhr_classes_mm': LUHR, 'mucosa_mm': MUCOSA, 'crest_below_cej_mm': CREST_BELOW_CEJ,
        'implant_drawn_mm': {'diameter': 2 * IMPLANT_R, 'length': IMPLANT_LEN},
        'denture_drawn_mm': {'base_thickness_note': 'base fills from the mucosa to the old CEJ level', 'flange': FLANGE},
    }
    json.dump(report, open(os.path.join(out, 'report.json'), 'w'), indent=1, default=float)
    print(json.dumps(report, indent=1, default=float))


def write_print(G, st, parts, out):
    zp = os.path.join(out, f'vivatheca-prosthodontic-{st}-1x.zip')
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


README_PRINT = """Vivatheca prosthodontic model (lower jaw with teeth, and without teeth), life size, STL in millimetres.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
See https://vivatheca.com/disclaimer
Not yet clinically reviewed.
The denture, implants and gum are drawn shapes, not copies of a real denture or implant system.
Licence: CC BY 4.0. Made by Vivatheca from BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution 4.0 International.
"""

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
