"""TMD and jaw muscle pain: the jaw joints (TMJ), the articular discs and the four muscles of mastication,
with animated, evidence-based jaw exercises. Built on BodyParts3D 4.0 (CC BY 4.0).

Usage: python -I build.py <BodyParts3D obj folder> <out dir>

Base meshes (BodyParts3D 4.0 "isa" tree, DBCLS, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/): the skull bones
(frontal FJ3200, parietal FJ3274/FJ3380, occipital FJ3309, temporal FJ3281/FJ3386, sphenoid FJ3394, ethmoid FJ3199,
zygomatic FJ3287/FJ3392, maxillae FJ3269/FJ3375, palatine FJ3273/FJ3379, nasal FJ3272/FJ3378, lacrimal FJ3265/FJ3371,
inferior conchae FJ3263/FJ3369), the mandible FJ3289 and the 28 permanent teeth FJ1254-FJ1281.

BodyParts3D 4.0 has no muscles of mastication and no TMJ disc, so these are hand-built (the model stays CC BY 4.0,
see AGENTS.md "Base meshes and model licences"):
- Each muscle is a bundle of straight fibres between its origin and insertion, found on the BodyParts3D bones from the
  attachments in Gray's Anatomy (Standring 2020) and van Eijden et al. 1997. The bundle is meshed from a signed distance
  field (union of tapered capsules). Masseter and temporalis thickness come from ultrasound (Koruyucu and Asantogrol
  2024); pterygoid thickness is DRAWN to fill the space between their attachments (no measured value used).
- The disc is a shell over the top of each condyle. Thickness from Savignat et al. 2025 (posterior band 1.67 mm,
  intermediate zone 0.94 mm, anterior band 1.04 mm; middle > medial > lateral); band positions on the condyle from
  Yang et al. 2015 (posterior band at 12 o'clock, anterior band at about 1 o'clock, 28 degrees).

Movements (one glTF animation each; skinning moves each muscle with the jaw by how far a point is along its fibre):
- Rest: teeth apart by the freeway space, 1.40 mm (Campillo et al. 2017).
- Full opening: 46.6 mm between the incisors with 11.9 mm of condylar travel (Travers et al. 2000). The condyle
  follows the BodyParts3D articular eminence. Smaller openings scale the condylar travel in proportion (a
  simplification: Travers found incisal opening and condylar travel were not correlated).
- Tongue-up opening: 20 mm, DRAWN amplitude for a controlled opening; rotation only (simplification: Mapelli et al.
  2009 found opening is never pure rotation).
- Side to side: 7.54 mm at the incisors; forward: 8.44 mm (Campillo et al. 2017).

Outputs: tmd.glb (all animations), report.json (every measured and cited value).
"""
import json
import os
import struct
import sys

import fast_simplification
import numpy as np
import trimesh
from scipy import ndimage
from scipy.spatial.transform import Rotation, Slerp
from skimage import measure

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tokens'))
from colours import LINEAR  # noqa: E402  (tools/tokens/colours.py, built by `pnpm tokens`)

# ---------------------------------------------------------------- cited figures (mm)
FREEWAY = 1.40           # interocclusal rest distance: Campillo et al. 2017
OPEN_MAX = 46.6          # incisor straight-line opening at maximum: Travers et al. 2000
CONDYLE_MAX = 11.9       # condylar straight-line travel at maximum opening: Travers et al. 2000
LATERAL = 7.54           # lateral excursion at the incisors: Campillo et al. 2017
PROTRUSION = 8.44        # protrusion: Campillo et al. 2017
OPEN_TONGUE_UP = 20.0    # DRAWN amplitude for the tongue-up (controlled) opening exercise
MASSETER_T = 10.9        # masseter thickness at rest, ultrasound: Koruyucu & Asantogrol 2024
TEMPORALIS_T = 8.8       # temporalis thickness at rest, ultrasound: Koruyucu & Asantogrol 2024
PTERYGOID_T = 7.0        # DRAWN: pterygoid thickness (no measured value used)
# Disc thickness by band (Savignat et al. 2025, caliper means over 44 discs) and position on the condyle in degrees
# forward of vertical (Yang et al. 2015: posterior band at 12 o'clock, anterior band at 28 degrees).
DISC_BANDS = [(-40, 0.25), (-22, 0.9), (0, 1.67), (14, 0.94), (28, 1.04), (44, 0.55), (56, 0.2)]
DISC_ML = {'lateral': 0.99, 'middle': 1.38, 'medial': 1.27}  # mediolateral means: Savignat et al. 2025
SKULL = ['FJ3200', 'FJ3274', 'FJ3380', 'FJ3309', 'FJ3281', 'FJ3386', 'FJ3394', 'FJ3199', 'FJ3287', 'FJ3392',
         'FJ3269', 'FJ3375', 'FJ3273', 'FJ3379', 'FJ3272', 'FJ3378', 'FJ3265', 'FJ3371', 'FJ3263', 'FJ3369']
UPPER = [1261, 1262, 1263, 1264, 1265, 1266, 1267, 1275, 1276, 1277, 1278, 1279, 1280, 1281]
LOWER = [1254, 1255, 1256, 1257, 1258, 1259, 1260, 1268, 1269, 1270, 1271, 1272, 1273, 1274]
PITCH = 0.5

# Roughness differs slightly between parts that share a colour, so the GLB optimiser (dedup) keeps their
# materials apart and each part can be hidden on its own (public/model-parts.js finds parts by material name).
COL = {
    'bone': (LINEAR['model.bone'], 0.8), 'skull': (LINEAR['model.bone'], 0.81), 'teeth': (LINEAR['model.tooth'], 0.55),
    'disc': (LINEAR['model.disc'], 0.5),
    'masseter': (LINEAR['model.muscle'], 0.7), 'temporalis': (LINEAR['model.muscle'], 0.71),
    'lateral_pterygoid': (LINEAR['model.muscleDeep'], 0.7), 'medial_pterygoid': (LINEAR['model.muscleDeep'], 0.71),
}


def load(folder, fj):
    m = trimesh.load(os.path.join(folder, fj + '.obj'), force='mesh', process=True)
    m.merge_vertices()
    return m


def smooth(m, it=6):
    m = m.copy()
    trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=it)
    return m


# ---------------------------------------------------------------- landmarks on the BodyParts3D bones (BP3D frame:
# x = towards the patient's left, y = backwards, z = up; millimetres)
def side_pts(v, sg, lo=20):
    return v[v[:, 0] * sg > lo]


def landmarks(mand, temporal, zyg, sphenoid, maxilla, sg):
    v = mand.vertices
    s = side_pts(v, sg)
    post = s[s[:, 1] > -115]
    cond = post[np.argmax(post[:, 2])]
    ant = s[(s[:, 1] < -112) & (s[:, 1] > -140)]
    cor = ant[np.argmax(ant[:, 2])]
    L = {'condyle_top': cond, 'coronoid': cor}
    L['condyle_centre'] = cond - [0, 0, 4.0]
    # Lower border of the mandible (lateral half) and posterior border of the ramus.
    lower = []
    for y in np.arange(-132, -98, 2.0):
        b = s[(np.abs(s[:, 1] - y) < 1.0) & (s[:, 0] * sg > 30)]
        if len(b):
            lower.append(b[np.argmin(b[:, 2])])
    L['lower_border'] = np.array(lower)
    gon = s[np.argmin(s[:, 2] - (s[:, 1] + 100))]
    L['gonion'] = gon
    back = []
    for z in np.arange(gon[2] + 2, cond[2] - 14, 2.0):
        b = s[(np.abs(s[:, 2] - z) < 1.0) & (s[:, 0] * sg > 30)]
        if len(b):
            back.append(b[np.argmax(b[:, 1])])
    L['posterior_border'] = np.array(back)
    # Lateral and medial ramus surface at a point (most / least lateral vertex near y, z).
    L['ramus_x'] = lambda y, z, lateral=True: _surf_x(s, y, z, sg, lateral)
    # Zygomatic arch lower border, from the zygomatic bone forward to the articular tubercle.
    arch_v = np.vstack([zyg.vertices, temporal.vertices])
    arch_v = arch_v[arch_v[:, 0] * sg > 50]
    arch = []
    for y in np.arange(-152, -100, 2.0):
        b = arch_v[np.abs(arch_v[:, 1] - y) < 1.0]
        b = b[b[:, 2] < 1505]
        if len(b):
            arch.append(b[np.argmin(b[:, 2])])
    L['arch'] = np.array(arch)
    inner = []
    for p in arch:
        b = arch_v[(np.abs(arch_v[:, 1] - p[1]) < 1.5) & (arch_v[:, 2] < p[2] + 9)]
        inner.append(b[np.argmin(b[:, 0] * sg)][0] if len(b) else p[0])
    L['arch_inner_x'] = np.array(inner)
    # Lateral pterygoid plate: lateral surface of the sphenoid's lower part.
    sp = sphenoid.vertices
    sp = sp[(sp[:, 0] * sg > 8) & (sp[:, 2] < 1492) & (sp[:, 1] > -140) & (sp[:, 1] < -110)]
    plate = []
    for z in np.arange(1468, 1492, 2.0):
        for y in np.arange(-132, -114, 3.0):
            b = sp[(np.abs(sp[:, 2] - z) < 1.0) & (np.abs(sp[:, 1] - y) < 1.5)]
            if len(b):
                plate.append(b[np.argmax(b[:, 0] * sg)])
                plate.append(b[np.argmin(b[:, 0] * sg)])
    plate = np.array(plate)
    L['plate_lateral'] = plate[0::2]
    L['plate_medial'] = plate[1::2]
    # Infratemporal surface of the greater wing (superior head of the lateral pterygoid).
    gw = sphenoid.vertices
    gw = gw[(gw[:, 0] * sg > 25) & (np.abs(gw[:, 2] - 1497) < 4) & (gw[:, 1] > -130) & (gw[:, 1] < -108)]
    L['greater_wing'] = gw
    # Maxillary tuberosity: the most posterior, lowest part of the maxilla on this side.
    mx = maxilla.vertices
    mx = mx[(mx[:, 0] * sg > 15) & (mx[:, 2] < 1480)]
    L['tuberosity'] = mx[np.argmax(mx[:, 1] - 0.3 * mx[:, 2])]
    return L


def _surf_x(s, y, z, sg, lateral):
    b = s[(np.abs(s[:, 1] - y) < 2.0) & (np.abs(s[:, 2] - z) < 2.0) & (s[:, 0] * sg > 28)]
    if not len(b):
        return None
    return b[np.argmax(b[:, 0] * sg)] if lateral else b[np.argmin(b[:, 0] * sg)]


def temporal_fossa(skull_v, sg):
    """Origin of temporalis: the most lateral skull surface per (y, z) cell inside the temporal fossa outline."""
    v = skull_v[skull_v[:, 0] * sg > 30]
    pts = []
    for z in np.arange(1504, 1566, 3.0):
        for y in np.arange(-150, -74, 3.0):
            # Fossa outline: an ellipse (centre y -104, z 1514; half-axes 28 and 46 mm) above the infratemporal crest,
            # kept behind the frontal process of the zygomatic bone (the orbit lies in front of y -132).
            if ((y + 104) / 28) ** 2 + ((z - 1514) / 46) ** 2 > 1:
                continue
            b = v[(np.abs(v[:, 1] - y) < 1.5) & (np.abs(v[:, 2] - z) < 1.5)]
            if len(b):
                pts.append(b[np.argmax(b[:, 0] * sg)])
    return np.array(pts)


# ---------------------------------------------------------------- muscle fibres -> mesh
class Fibres:
    """Fibres are polylines (origin first). Radius goes r_end at the origin, r_mid in the middle, r_end2 at the insertion."""

    def __init__(self):
        self.lines, self.r0, self.r1, self.rm = [], [], [], []

    def add(self, a, b, r_end, r_mid, r_end2=None, via=None):
        pts = [np.asarray(a, float)] + ([np.asarray(p, float) for p in via] if via is not None else []) + [np.asarray(b, float)]
        self.lines.append(np.array(pts))
        self.r0.append(r_end); self.r1.append(r_end if r_end2 is None else r_end2); self.rm.append(r_mid)

    @property
    def a(self):
        return [ln[0] for ln in self.lines]

    @property
    def b(self):
        return [ln[-1] for ln in self.lines]

    def sdf(self, P):
        """Smooth union of tapered tubes. Returns distance and fibre parameter t (0 origin, 1 insertion)."""
        best = np.full(len(P), np.inf); tbest = np.zeros(len(P)); acc = np.zeros(len(P))
        k = 1.5
        for i, ln in enumerate(self.lines):
            seg = np.linalg.norm(np.diff(ln, axis=0), axis=1)
            cum = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()
            rmax = max(self.r0[i], self.r1[i], self.rm[i]) + 12  # beyond this a fibre adds < exp(-8) to the blend
            box = np.all((P > ln.min(0) - rmax) & (P < ln.max(0) + rmax), axis=1)
            idx = np.nonzero(box)[0]
            Q = P[idx]
            for j in range(len(ln) - 1):
                A, ab = ln[j], ln[j + 1] - ln[j]
                u = np.clip(((Q - A) @ ab) / (ab @ ab), 0, 1)
                d = np.linalg.norm(Q - (A + u[:, None] * ab), axis=1)
                t = cum[j] + (cum[j + 1] - cum[j]) * u
                r = np.where(t < 0.5, self.r0[i] + (self.rm[i] - self.r0[i]) * np.sin(np.pi * t),
                             self.r1[i] + (self.rm[i] - self.r1[i]) * np.sin(np.pi * t))
                di = d - r
                acc[idx] += np.exp(-np.clip(di, -50, 50) / k)
                closer = di < best[idx]
                best[idx] = np.where(closer, di, best[idx]); tbest[idx] = np.where(closer, t, tbest[idx])
        return -k * np.log(np.maximum(acc, 1e-30)), tbest


def fibre_mesh(F, target):
    allp = np.vstack(F.lines)
    r = max(max(F.rm), max(F.r0)) + 3
    lo = allp.min(0) - r
    hi = allp.max(0) + r
    xs, ys, zs = (np.arange(lo[k], hi[k], PITCH) for k in range(3))
    X, Y, Z = np.meshgrid(xs, ys, zs, indexing='ij')
    P = np.column_stack([X.ravel(), Y.ravel(), Z.ravel()])
    d, _ = F.sdf(P)
    d = ndimage.gaussian_filter(d.reshape(X.shape), 2.0)
    v, f, _, _ = measure.marching_cubes(np.pad(d, 1, constant_values=5.0), 0.0, spacing=(PITCH,) * 3)
    v = v - PITCH + lo
    if len(f) > target:
        v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int32), 1 - target / len(f))
    m = trimesh.Trimesh(v, f, process=True)
    keep = max(m.split(only_watertight=False), key=lambda c: len(c.faces))
    m = smooth(keep, 4)
    if m.volume < 0:
        m.invert()
    _, t = F.sdf(m.vertices)
    return m, t


def out_dir(p, centre):
    """Unit vector from a centre to a point."""
    d = p - centre
    return d / np.linalg.norm(d)


def muscles(L, skull_v, sg, mand):
    out = {}
    lateral = np.array([sg, 0, 0.0])
    # Masseter. Superficial part: anterior two thirds of the arch -> angle and lower lateral ramus.
    # Deep part: posterior third of the arch -> upper lateral ramus. Fibres lie on the lateral surface.
    F = Fibres()
    arch = L['arch']
    ins = np.vstack([L['lower_border'][::-1], L['posterior_border']])  # from the front of the angle round and up
    ins = ins[(ins[:, 1] > -126)]
    sup_o = arch[arch[:, 1] < -118]
    n = 14
    oi = np.linspace(0, len(sup_o) - 1, n).round().astype(int)
    ii = np.linspace(0, len(ins) * 0.75, n).round().astype(int)
    R = MASSETER_T / 2
    for a, b in zip(sup_o[oi], ins[ii]):
        a = a + lateral * 1.0 - [0, 0, R * 0.6]
        b = b + lateral * (R * 0.9) + [0, 0, 1.5]
        F.add(a, b, 3.5, R, 2.5)
    deep_o = arch[(arch[:, 1] >= -118)]
    for k, a in enumerate(deep_o[::2]):
        y = a[1] - 8
        z = L['condyle_top'][2] - 22 - k * 1.5
        s = L['ramus_x'](y, z)
        if s is None:
            continue
        F.add(a + lateral * 0.0 - [0, 0, 2.5], s + lateral * (R * 0.7), 2.0, R * 0.7)
    out['masseter'] = F
    # Temporalis: temporal fossa -> coronoid process and anterior border of the ramus. Fans from the fossa.
    F = Fibres()
    fossa = temporal_fossa(skull_v, sg)
    cor = L['coronoid']
    insp = [cor + [0, 0, -1.0]]
    for dz in (6, 12, 18, 24):  # anterior border of the coronoid / ramus, below the tip
        p = mand.vertices
        p = p[(p[:, 0] * sg > 30) & (np.abs(p[:, 2] - (cor[2] - dz)) < 1.0) & (p[:, 1] < -110)]
        if len(p):
            insp.append(p[np.argmin(p[:, 1])])
    insp = np.array(insp)
    Rt = TEMPORALIS_T / 2
    centre = np.array([0, -110, 1500.0])
    arch = L['arch']
    for a in fossa[::2]:
        # Anterior fibres (front of the fossa) insert lower on the anterior border; posterior fibres at the tip.
        u = np.clip((-(a[1] + 110)) / 38, -1, 1)  # +1 front, -1 back
        j = int(round((u + 1) / 2 * (len(insp) - 1)))
        b = insp[j]
        a2 = a + out_dir(a, centre) * 1.2
        # Pass deep to the zygomatic arch: waypoint just above the arch, medial to its inner surface.
        y = np.clip(a[1] * 0.4 + b[1] * 0.6, arch[:, 1].min(), arch[:, 1].max())
        k = np.argmin(np.abs(arch[:, 1] - y))
        xin = L['arch_inner_x'][k] - sg * (Rt + 1.5)
        w = np.array([xin, y, arch[k][2] + 10])
        F.add(a2, b + lateral * 0.5, 2.0, Rt, 2.6, via=[w])
    out['temporalis'] = F
    # Lateral pterygoid: inferior head from the lateral pterygoid plate, superior head from the greater wing,
    # both to the condylar neck (pterygoid fovea) and the front of the disc.
    F = Fibres()
    ct = L['condyle_top']
    fovea = ct + [-sg * 2.0, -4.0, -7.0]
    disc_front = ct + [-sg * 2.0, -4.5, -1.5]
    Rp = PTERYGOID_T / 2
    pl = L['plate_lateral']
    for a in pl[::max(1, len(pl) // 8)]:
        F.add(a + lateral * 1.5, fovea, 2.0, Rp, 2.0)
    gw = L['greater_wing']
    for a in gw[::max(1, len(gw) // 5)]:
        F.add(a - [0, 0, 1.5], disc_front, 1.8, Rp * 0.7, 1.4)
    out['lateral_pterygoid'] = F
    # Medial pterygoid: deep head from the medial surface of the lateral pterygoid plate, superficial head from the
    # maxillary tuberosity, to the medial surface of the ramus and angle.
    F = Fibres()
    pm = L['plate_medial']
    targets = []
    g = L['gonion']
    for dy, dz in ((-2, 6), (-6, 4), (-10, 8), (-4, 12), (-8, 14), (0, 10)):
        s = L['ramus_x'](g[1] + dy, g[2] + dz, lateral=False)
        if s is not None:
            targets.append(s - lateral * Rp * 0.8)
    targets = np.array(targets)
    src = np.vstack([pm[::max(1, len(pm) // 6)], [L['tuberosity']]])
    for k, a in enumerate(src):
        F.add(a - lateral * 0.5, targets[k % len(targets)], 2.0, Rp, 2.5)
    out['medial_pterygoid'] = F
    return out


# ---------------------------------------------------------------- disc
def disc(mand, L, sg):
    ct, cc = L['condyle_top'], L['condyle_centre']
    m = mand.copy()
    fc = m.triangles_center
    sel = (np.linalg.norm(fc - ct, axis=1) < 13) & (fc[:, 2] > ct[2] - 6) & (m.face_normals[:, 2] > 0.15)
    patch = m.submesh([np.nonzero(sel)[0]], append=True)
    patch = max(patch.split(only_watertight=False), key=lambda c: len(c.faces))
    for _ in range(2):
        patch = patch.subdivide()
    patch = smooth(patch, 3)
    v, n = patch.vertices, patch.vertex_normals
    rel = v - cc
    theta = np.degrees(np.arctan2(-rel[:, 1], rel[:, 2]))  # forward of vertical (y points backwards)
    keep_v = (theta > DISC_BANDS[0][0]) & (theta < DISC_BANDS[-1][0])
    faces = patch.faces[keep_v[patch.faces].all(1)]
    ang, thk = zip(*DISC_BANDS)
    t = np.interp(theta, ang, thk)
    # Mediolateral factor: lateral thinnest, middle thickest (Savignat et al. 2025).
    ml = (rel[:, 0] * sg) / 9.0  # +1 lateral pole, -1 medial pole (condyle about 18 mm wide)
    mean = np.mean(list(DISC_ML.values()))
    f = np.interp(ml, [-1, 0, 1], [DISC_ML['medial'], DISC_ML['middle'], DISC_ML['lateral']]) / mean
    t = t * f
    edge = np.clip(1 - np.abs(ml) ** 6, 0.15, 1)
    t = t * edge
    inner = v + n * 0.1
    outer = v + n * (0.1 + t[:, None])
    nv = len(v)
    F = np.vstack([faces + nv, faces[:, ::-1]])
    tm = trimesh.Trimesh(np.vstack([inner, outer]), F, process=False)
    # Close the rim.
    edges = trimesh.grouping.group_rows(np.sort(faces[:, [0, 1, 1, 2, 2, 0]].reshape(-1, 2), axis=1), require_count=1)
    e = np.sort(faces[:, [0, 1, 1, 2, 2, 0]].reshape(-1, 2), axis=1)[edges]
    oriented = faces[:, [0, 1, 1, 2, 2, 0]].reshape(-1, 2)[edges]
    side = []
    for a, b in oriented:
        side += [[a, b, b + nv], [a, b + nv, a + nv]]
    tm = trimesh.Trimesh(np.vstack([inner, outer]), np.vstack([F, np.array(side)]), process=True)
    tm.remove_unreferenced_vertices()
    trimesh.repair.fix_normals(tm)
    return tm, {'theta_range': [float(theta[keep_v].min()), float(theta[keep_v].max())],
                'max_thickness': float(t[keep_v].max())}


# ---------------------------------------------------------------- jaw movements
def rot_about(R, p, centre):
    return (p - centre) @ R.T + centre


class Jaw:
    """Pose = rotation R about the condyle midpoint plus translation T, in the BP3D frame."""

    def __init__(self, L_r, L_l, temporal_r, upper_incisors, lower_incisors):
        self.cr, self.cl = L_r['condyle_centre'], L_l['condyle_centre']
        self.mid = (self.cr + self.cl) / 2
        self.axis = (self.cl - self.cr) / np.linalg.norm(self.cl - self.cr)
        self.up_tip = upper_incisors
        self.lo_tip = lower_incisors
        self.path = self.eminence(temporal_r, L_r)

    def eminence(self, temporal, L):
        """Path of the condyle top along the articular eminence, keeping its starting clearance (BP3D shape)."""
        ct = L['condyle_top']
        ys = np.arange(ct[1], ct[1] - 22, -0.5)
        zs = []
        for y in ys:
            o = np.array([[ct[0] + dx, y, ct[2] - 25] for dx in (-3, 0, 3)])
            loc, ray, _ = temporal.ray.intersects_location(o, np.tile([0, 0, 1.0], (3, 1)), multiple_hits=True)
            hz = loc[:, 2][loc[:, 2] > ct[2] - 14]
            zs.append(hz.min() if len(hz) else np.nan)
        zs = np.array(zs)
        ok = ~np.isnan(zs)
        zs = np.interp(ys, ys[ok][::-1], zs[ok][::-1]) if ok.any() else np.full_like(ys, ct[2] + 1.5)
        zs = ndimage.gaussian_filter1d(zs, 3)
        clear = zs[0] - ct[2]
        path = np.column_stack([np.zeros_like(ys), ys - ct[1], zs - clear - ct[2]])
        # Never let the path climb (the condyle runs down the posterior slope of the eminence).
        path[:, 2] = np.minimum.accumulate(path[:, 2])
        s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))])
        return s, path

    def along(self, dist):
        """Translation for a straight-line condylar travel of `dist` mm."""
        s, path = self.path
        straight = np.linalg.norm(path, axis=1)
        return np.array([np.interp(dist, straight, path[:, k]) for k in range(3)])

    def incisal_gap(self, R, T):
        lo = rot_about(R, self.lo_tip, self.mid) + T
        return np.linalg.norm(lo - self.up_tip)

    def opening(self, gap, condyle_scale=1.0, rotation_only=False):
        best = None
        for deg in np.arange(0, 45, 0.02):
            R = Rotation.from_rotvec(self.axis * np.radians(deg)).as_matrix()
            frac = 0 if rotation_only else condyle_scale * CONDYLE_MAX * min(1, gap / OPEN_MAX)
            T = self.along(frac)
            g = self.incisal_gap(R, T) - self.gap0
            if g >= gap:
                best = (R, T, deg)
                break
        return best

    def _lateral(self, to_right, psi, open_deg):
        work = self.cr if to_right else self.cl
        bal = self.cl if to_right else self.cr
        sgn = 1 if to_right else -1
        # Chin to the patient's right is towards -x: rotate about the vertical axis through the working condyle.
        Rz = Rotation.from_rotvec([0, 0, sgn * psi]).as_matrix()
        Ro = Rotation.from_rotvec(self.axis * np.radians(open_deg)).as_matrix()
        R = Rz @ Ro
        moved = rot_about(R, bal, work)
        fwd = -(moved[1] - bal[1])
        drop = self.along(max(fwd, 0))[2]  # balancing condyle runs down its eminence
        width = np.linalg.norm(self.cl - self.cr)
        Rt = Rotation.from_rotvec([0, -sgn * np.arcsin(np.clip(-drop / width, -1, 1)), 0]).as_matrix()
        R = Rt @ R
        T = work - rot_about(R, work, self.mid)
        return R, T

    def lateral(self, to_right, amount, open_deg=2.0):
        """Working condyle rotates about a vertical axis; balancing condyle moves forward and down the eminence.
        Solved so the lower incisor point moves `amount` mm sideways. Teeth drawn 2 degrees apart (not measured)."""
        for psi in np.radians(np.arange(0, 15, 0.01)):
            R, T = self._lateral(to_right, psi, open_deg)
            dx = (rot_about(R, self.lo_tip, self.mid) + T - self.lo_tip)[0]
            if abs(dx) >= amount:
                return R, T
        raise ValueError('lateral excursion not reached')

    def protrusion(self, amount, open_deg=1.0):
        """Both condyles slide down the eminence until the lower incisor point is `amount` mm forward."""
        R = Rotation.from_rotvec(self.axis * np.radians(open_deg)).as_matrix()
        for d in np.arange(0, 20, 0.02):
            T = self.along(d)
            fwd = -(rot_about(R, self.lo_tip, self.mid) + T - self.lo_tip)[1]
            if fwd >= amount:
                return R, T
        raise ValueError('protrusion not reached')


def to_gltf(a):
    """BP3D (x left, y back, z up, mm) -> glTF (x patient's left, y up, z forward, metres)."""
    a = np.asarray(a, np.float64)
    return np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1) * 0.001


def mat_gltf(R):
    """Rotation matrix in BP3D axes -> glTF axes."""
    P = np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0.0]])
    return P @ R @ P.T


# ---------------------------------------------------------------- GLB writer with skinning and animation
class Glb:
    def __init__(self):
        self.bin = bytearray()
        self.j = {'asset': {'version': '2.0', 'generator': 'Vivatheca tools/tmd/build.py'}, 'scene': 0,
                  'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [], 'accessors': [],
                  'bufferViews': [], 'buffers': [], 'skins': [], 'animations': []}
        self.mat = {}

    def _acc(self, arr, kind, target=None, minmax=False, ctype=None):
        arr = np.ascontiguousarray(arr)
        while len(self.bin) % 4:
            self.bin.append(0)
        off = len(self.bin)
        self.bin += arr.tobytes()
        bv = {'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes}
        if target:
            bv['target'] = target
        self.j['bufferViews'].append(bv)
        ct = ctype or {np.dtype(np.float32): 5126, np.dtype(np.uint32): 5125, np.dtype(np.uint16): 5123,
                       np.dtype(np.uint8): 5121}[arr.dtype]
        a = {'bufferView': len(self.j['bufferViews']) - 1, 'componentType': ct, 'count': len(arr), 'type': kind}
        if minmax:
            a['min'], a['max'] = arr.min(0).tolist() if arr.ndim > 1 else [float(arr.min())], \
                arr.max(0).tolist() if arr.ndim > 1 else [float(arr.max())]
        self.j['accessors'].append(a)
        return len(self.j['accessors']) - 1

    def material(self, name):
        if name not in self.mat:
            c, rough = COL[name]
            self.j['materials'].append({'name': name, 'pbrMetallicRoughness': {
                'baseColorFactor': list(c) + [1.0], 'roughnessFactor': rough, 'metallicFactor': 0}})
            self.mat[name] = len(self.j['materials']) - 1
        return self.mat[name]

    def node(self, d, root=False):
        self.j['nodes'].append(d)
        i = len(self.j['nodes']) - 1
        if root:
            self.j['scenes'][0]['nodes'].append(i)
        return i

    def mesh(self, name, m, mat, joints=None, weights=None, origin=None):
        v = to_gltf(m.vertices)
        if origin is not None:
            v = v - origin
        prim = {'attributes': {'POSITION': self._acc(v.astype(np.float32), 'VEC3', 34962, True),
                               'NORMAL': self._acc(to_gltf(m.vertex_normals).astype(np.float32) * 1000, 'VEC3', 34962)},
                'indices': self._acc(m.faces.astype(np.uint32).ravel(), 'SCALAR', 34963), 'material': self.material(mat)}
        if joints is not None:
            prim['attributes']['JOINTS_0'] = self._acc(joints.astype(np.uint8), 'VEC4', 34962)
            prim['attributes']['WEIGHTS_0'] = self._acc(weights.astype(np.float32), 'VEC4', 34962)
        self.j['meshes'].append({'name': name, 'primitives': [prim]})
        return len(self.j['meshes']) - 1

    def save(self, path):
        while len(self.bin) % 4:
            self.bin.append(0)
        self.j['buffers'] = [{'byteLength': len(self.bin)}]
        js = json.dumps(self.j, separators=(',', ':')).encode()
        js += b' ' * (-len(js) % 4)
        out = struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(self.bin))
        out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(self.bin), 0x004E4942) + bytes(self.bin)
        open(path, 'wb').write(out)


def ease(x):
    return 0.5 - 0.5 * np.cos(np.pi * np.clip(x, 0, 1))


def build(folder, out):
    os.makedirs(out, exist_ok=True)
    skull_parts = [load(folder, f) for f in SKULL]
    mand = load(folder, 'FJ3289')
    up = [load(folder, 'FJ%d' % i) for i in UPPER]
    lo = [load(folder, 'FJ%d' % i) for i in LOWER]
    by = dict(zip(SKULL, skull_parts))
    skull_v = np.vstack([m.vertices for m in skull_parts])
    LR = landmarks(mand, by['FJ3386'], by['FJ3392'], by['FJ3394'], by['FJ3375'], -1)
    LL = landmarks(mand, by['FJ3281'], by['FJ3287'], by['FJ3394'], by['FJ3269'], 1)
    # Incisal edge points: lowest point of the upper central incisors, highest of the lower central incisors.
    upc = np.vstack([load(folder, 'FJ%d' % i).vertices for i in (1265, 1279)])
    loc_ = np.vstack([load(folder, 'FJ%d' % i).vertices for i in (1258, 1259)])
    up_tip = upc[np.argmin(upc[:, 2])]
    lo_tip = loc_[np.argmax(loc_[:, 2])]
    jaw = Jaw(LR, LL, by['FJ3386'], up_tip, lo_tip)
    jaw.gap0 = np.linalg.norm(lo_tip - up_tip)

    report = {'landmarks_right': {k: np.round(v, 2).tolist() for k, v in LR.items() if isinstance(v, np.ndarray) and v.ndim == 1}}
    # Muscles and discs for both sides.
    parts = {}
    for side, L, sg in (('right', LR, -1), ('left', LL, 1)):
        for name, F in muscles(L, skull_v, sg, mand).items():
            m, t = fibre_mesh(F, 9000)
            parts[f'{name}_{side}'] = (name, m, t)
            report[f'{name}_{side}'] = {'fibres': len(F.a), 'volume_cm3': round(m.volume / 1000, 1), 'faces': len(m.faces)}
        d, info = disc(mand, L, sg)
        parts[f'disc_{side}'] = ('disc', d, None)
        report[f'disc_{side}'] = info
    print(json.dumps({k: v for k, v in report.items() if k != 'landmarks_right'}, indent=1))

    # Poses (R, T) in the BP3D frame; disc translation follows the condyle top without rotating.
    poses = {'closed': (np.eye(3), np.zeros(3))}
    R, T, deg = jaw.opening(FREEWAY, rotation_only=True)
    poses['rest'] = (R, T)
    R, T, deg_full = jaw.opening(OPEN_MAX)
    poses['open_full'] = (R, T)
    R, T, deg_tu = jaw.opening(OPEN_TONGUE_UP, rotation_only=True)
    poses['open_tongue_up'] = (R, T)
    poses['right'] = jaw.lateral(True, LATERAL)
    poses['left'] = jaw.lateral(False, LATERAL)
    poses['forward'] = jaw.protrusion(PROTRUSION)
    chk = {}
    for k, (R, T) in poses.items():
        lo_ = rot_about(R, lo_tip, jaw.mid) + T
        chk[k] = {'incisor_move_mm': np.round(lo_ - lo_tip, 2).tolist(), 'incisal_gap_change_mm': round(float(np.linalg.norm(lo_ - up_tip) - jaw.gap0), 2),
                  'condyle_R_move_mm': np.round(rot_about(R, LR['condyle_top'], jaw.mid) + T - LR['condyle_top'], 2).tolist(),
                  'condyle_L_move_mm': np.round(rot_about(R, LL['condyle_top'], jaw.mid) + T - LL['condyle_top'], 2).tolist()}
    report['poses'] = chk
    print(json.dumps(chk, indent=1))

    # Exercises: (name, [(time s, pose)]) with eased transitions between keys; each loops.
    ex = {
        'rest': [(0, 'closed'), (1.5, 'rest'), (4.5, 'rest'), (6, 'closed')],
        'tongue-up-opening': [(0, 'rest'), (2.5, 'open_tongue_up'), (4.0, 'open_tongue_up'), (6.5, 'rest')],
        'opening-stretch': [(0, 'rest'), (3.0, 'open_full'), (6.0, 'open_full'), (9.0, 'rest')],
        'side-to-side': [(0, 'rest'), (2.0, 'right'), (3.5, 'right'), (5.5, 'rest'), (7.5, 'left'), (9.0, 'left'), (11.0, 'rest')],
        'forward': [(0, 'rest'), (2.5, 'forward'), (4.0, 'forward'), (6.5, 'rest')],
    }

    g = Glb()
    mid_g = to_gltf(jaw.mid)
    root = g.node({'name': 'skull'}, root=True)
    jaw_node = g.node({'name': 'mandible_joint', 'translation': mid_g.tolist()})
    g.j['nodes'][root]['children'] = [jaw_node]
    ct = {'right': LR['condyle_top'], 'left': LL['condyle_top']}
    disc_nodes = {}
    for side in ('right', 'left'):
        disc_nodes[side] = g.node({'name': f'disc_joint_{side}', 'translation': [0, 0, 0]})
        g.j['nodes'][root]['children'].append(disc_nodes[side])
    # Static skull (bones + upper teeth).
    skull_m = trimesh.util.concatenate([smooth(m, 3) for m in skull_parts])
    upper_m = trimesh.util.concatenate([smooth(m, 2) for m in up])
    for name, m, mat in (('skull', skull_m, 'skull'), ('upper_teeth', upper_m, 'teeth')):
        i = g.mesh(name, m, mat)
        g.j['nodes'][root].setdefault('children', []).append(g.node({'name': name, 'mesh': i}))
    # Mandible and lower teeth: children of the jaw joint (rigid).
    for name, m, mat in (('mandible', smooth(mand, 3), 'bone'), ('lower_teeth', trimesh.util.concatenate([smooth(m, 2) for m in lo]), 'teeth')):
        i = g.mesh(name, m, mat, origin=mid_g)
        g.j['nodes'][jaw_node].setdefault('children', []).append(g.node({'name': name, 'mesh': i}))
    # Discs: children of their own joints (translate with the condyle).
    for side in ('right', 'left'):
        _, m, _ = parts[f'disc_{side}']
        i = g.mesh(f'disc_{side}', m, 'disc')
        g.j['nodes'][disc_nodes[side]]['children'] = [g.node({'name': f'disc_{side}', 'mesh': i})]
    # Skinned muscles: joint 0 = skull, joint 1 = mandible.
    ibm = np.stack([np.eye(4), np.eye(4)]).astype(np.float32)
    ibm[1][:3, 3] = 0
    ibm[1] = np.linalg.inv(np.block([[np.eye(3), mid_g[:, None]], [np.zeros((1, 3)), np.ones((1, 1))]]))
    ibm_acc = g._acc(np.ascontiguousarray(np.transpose(ibm, (0, 2, 1)).reshape(2, 16)).astype(np.float32), 'MAT4')
    g.j['skins'].append({'name': 'jaw', 'joints': [root, jaw_node], 'skeleton': root, 'inverseBindMatrices': ibm_acc})
    for key, (name, m, t) in parts.items():
        if name == 'disc':
            continue
        w = ease((t - 0.08) / 0.84)
        J = np.zeros((len(t), 4), np.uint8); J[:, 1] = 1
        W = np.zeros((len(t), 4), np.float32); W[:, 0] = 1 - w; W[:, 1] = w
        i = g.mesh(key, m, name, joints=J, weights=W)
        g.node({'name': key, 'mesh': i, 'skin': 0}, root=True)

    # Animations.
    def pose_trs(p):
        R, T = poses[p]
        Rg = mat_gltf(R)
        # Node rotates about its own origin (jaw.mid), so translation = mid + T.
        q = Rotation.from_matrix(Rg).as_quat()  # x, y, z, w
        tr = mid_g + to_gltf(T)
        dt = {s: to_gltf(rot_about(R, ct[s], jaw.mid) + T - ct[s]) for s in ct}
        return q, tr, dt

    for name, keys in ex.items():
        times, rots, trs, dts = [], [], [], {'right': [], 'left': []}
        for (t0, p0), (t1, p1) in zip(keys[:-1], keys[1:]):
            q0, tr0, d0 = pose_trs(p0)
            q1, tr1, d1 = pose_trs(p1)
            sl = Slerp([0, 1], Rotation.from_quat([q0, q1]))
            for u in np.linspace(0, 1, 13)[:-1]:
                e = ease(u)
                times.append(t0 + (t1 - t0) * u)
                rots.append(sl([e]).as_quat()[0])
                trs.append(tr0 + (tr1 - tr0) * e)
                for s in dts:
                    dts[s].append(d0[s] + (d1[s] - d0[s]) * e)
        q, tr, d = pose_trs(keys[-1][1])
        times.append(keys[-1][0]); rots.append(q); trs.append(tr)
        for s in dts:
            dts[s].append(d[s])
        ti = g._acc(np.array(times, np.float32), 'SCALAR', minmax=True)
        samplers = [{'input': ti, 'output': g._acc(np.array(rots, np.float32), 'VEC4'), 'interpolation': 'LINEAR'},
                    {'input': ti, 'output': g._acc(np.array(trs, np.float32), 'VEC3'), 'interpolation': 'LINEAR'}]
        channels = [{'sampler': 0, 'target': {'node': jaw_node, 'path': 'rotation'}},
                    {'sampler': 1, 'target': {'node': jaw_node, 'path': 'translation'}}]
        for s in ('right', 'left'):
            samplers.append({'input': ti, 'output': g._acc(np.array(dts[s], np.float32), 'VEC3'), 'interpolation': 'LINEAR'})
            channels.append({'sampler': len(samplers) - 1, 'target': {'node': disc_nodes[s], 'path': 'translation'}})
        g.j['animations'].append({'name': name, 'samplers': samplers, 'channels': channels})
    g.save(os.path.join(out, 'tmd.glb'))
    report['opening_degrees'] = {'full': round(float(deg_full), 1), 'tongue_up': round(float(deg_tu), 1)}
    report['eminence_path_mm'] = np.round(jaw.path[1][::4], 2).tolist()
    json.dump(report, open(os.path.join(out, 'report.json'), 'w'), indent=1)
    print('wrote', os.path.join(out, 'tmd.glb'))


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
