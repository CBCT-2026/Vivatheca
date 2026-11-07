"""Velopharyngeal insufficiency (VPI): normal velopharyngeal closure, VPI after cleft palate repair, and three
operations for VPI. Built on BodyParts3D 4.0 (CC BY 4.0) bones, tongue and levator origins; the soft palate,
pharyngeal walls, flaps, levator sling and airflow arrows are hand-built from cited values.

Usage: python -I build.py <BodyParts3D isa obj folder> <out dir>

Base meshes (BodyParts3D 4.0 "isa" tree, DBCLS, CC BY 4.0): FJ3375/FJ3269 maxillae, FJ3379/FJ3273 palatine
bones, FJ3395 vomer, FJ3394 sphenoid, FJ3309 occipital, FJ3176 atlas, FJ3177 axis, FJ3161 C3, FJ3289 mandible,
FJ2772 hyoid, FJ3369/FJ3263 inferior nasal conchae, FJ2761 tongue, FJ2741/FJ2753 levator veli palatini (only
their skull-base origins are used: see SOURCES below and the page's clinician notes for why the BodyParts3D soft
palate muscles were not used as they are).

States (each as <state>-whole.glb and <state>-cut.glb, cut = left half kept, seen from the right):
  rest      normal anatomy, breathing: soft palate down, air through the nose
  speech    normal anatomy, speaking: soft palate lifted and touching the back of the throat
  vpi       repaired cleft palate with VPI, speaking: short soft palate, gap, air escaping through the nose
  furlow    after re-repair of the soft palate (Furlow double-opposing Z-plasty): longer palate, sling rebuilt
  flap      after a posterior pharyngeal flap: tissue bridge from the back wall to the palate, side ports
  sphincter after a sphincter pharyngoplasty: flaps from the side walls set into the back wall
Also writes report.json (every measured and cited value).
"""
import json
import os
import struct
import sys

import fast_simplification
import numpy as np
import trimesh
from scipy import ndimage
from scipy.spatial import cKDTree
from skimage import measure

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tokens'))
from colours import LINEAR  # noqa: E402  (tools/tokens/colours.py, built by `pnpm tokens`)

PITCH = 0.4
# ---------------------------------------------------------------- cited figures (mm)
# Adults (20 years and older, n = 81), midsagittal MRI: Haenssler, Fang & Perry 2020 (JSLHR 63:3586).
VELAR_LENGTH = 34.85          # PNS to the tip of the uvula, curvilinear
EFFECTIVE_VELAR_LENGTH = 13.72  # PNS to the point where the levator inserts into the velum
PHARYNGEAL_DEPTH = 20.92      # PNS to the posterior pharyngeal wall, along the palatal plane
# Velar thickness at the levator insertion: 8.78 mm, boys aged 9-10 (n = 1,670), Perry et al. 2023 (JSLHR 66:4828).
# No adult value with an open table was found; the child value is used and the page says so.
VELAR_THICKNESS = 8.78
# Prevertebral soft tissue: DRAWN values inside the adult upper limits of normal on CT
# (8.5 mm at C1, 6 mm at C2, 7 mm at C3): Rojas et al. 2009 (AJNR 30:136).
PVST = {'C1': 6.0, 'C2': 4.0, 'C3': 5.0}
# VPI after cleft palate repair: the velum is shorter, the effective velar length shorter and the levator often
# discontinuous (Sitzman et al. 2024, Plast Reconstr Surg 153:1155e). Their values were not openly available, so
# the VPI velum below is DRAWN to show a gap; the page says so.
VPI_VELAR_LENGTH = 27.0       # DRAWN
VPI_KNEE = 9.0                # DRAWN: PNS to the bend of the lifted VPI velum
LEVATOR_RADIUS = 2.2          # DRAWN
WALL = 4.0                    # DRAWN lateral pharyngeal wall thickness
FLAP_HALF_WIDTH = 6.0         # DRAWN pharyngeal flap half-width (leaves two side ports)
FLAP_THICK = 4.0              # DRAWN
AIR_R = 1.3                   # DRAWN arrow radius

COL = {
    'bone': (LINEAR['model.bone'], 0.8), 'soft': (LINEAR['model.gum'], 0.6), 'soft_cut': (tuple(c * 0.7 for c in LINEAR['model.gum']), 0.75),
    'mucosa': (LINEAR['model.lining'], 0.7), 'mucosa_cut': (tuple(c * 0.7 for c in LINEAR['model.lining']), 0.8),
    'flap': (LINEAR['model.clot'], 0.6), 'flap_cut': (LINEAR['model.clot'], 0.8),
    'muscle': (LINEAR['model.muscle'], 0.6), 'tongue': (LINEAR['model.lining'], 0.7),
    'air': (LINEAR['model.airflow'], 0.4), 'leak': (LINEAR['model.airLeak'], 0.4),
}
# /model-parts.js groups materials by name with a trailing _<n> removed: cut faces hide with their part.
GLTF_NAME = {'soft_cut': 'soft_1', 'flap_cut': 'flap_1', 'mucosa_cut': 'mucosa_1'}

BONES_MID = ['FJ3395', 'FJ3394', 'FJ3309', 'FJ3176', 'FJ3177', 'FJ3161', 'FJ3289', 'FJ2772']
BONES_L = ['FJ3269', 'FJ3273', 'FJ3263']   # left maxilla, palatine, inferior concha (BodyParts3D +x = left)
BONES_R = ['FJ3375', 'FJ3379', 'FJ3369']
ABOVE = {'FJ3395', 'FJ3394', 'FJ3309', 'FJ3263', 'FJ3369', 'FJ3375', 'FJ3269'}   # left out of the whole view so the port shows from above
# Bones are trimmed to this box (y, z in mm, BodyParts3D frame) so the velopharynx stays the subject.
BOX = {'y': (-200, -70), 'z': (1425, 1512)}


def load(folder, fj):
    m = trimesh.load(os.path.join(folder, fj + '.obj'), force='mesh', process=True)
    m.merge_vertices()
    return m


def midline_profile(m, half=2.0):
    v = m.vertices[np.abs(m.vertices[:, 0]) < half]
    return v[:, 1:]


def front_at(pts, z, band=1.5):
    s = pts[np.abs(pts[:, 1] - z) < band]
    return None if len(s) == 0 else s[:, 0].min()


def polyline_resample(p, step=0.2):
    p = np.asarray(p, float)
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    t = np.arange(0, s[-1] + 1e-9, step)
    return np.stack([np.interp(t, s, p[:, k]) for k in range(p.shape[1])], 1), t


def walk(start, direction_fn, length, step=0.2):
    pts = [np.array(start, float)]
    for _ in range(int(length / step)):
        d = direction_fn(pts[-1])
        pts.append(pts[-1] + step * d / np.linalg.norm(d))
    return np.array(pts)


class Grid:
    def __init__(self, lo, hi):
        self.xs, self.ys, self.zs = (np.arange(lo[k], hi[k], PITCH, dtype=np.float32) for k in range(3))
        self.shape = (len(self.xs), len(self.ys), len(self.zs))
        self.origin = np.array([self.xs[0], self.ys[0], self.zs[0]])
        Y2, Z2 = np.meshgrid(self.ys, self.zs, indexing='ij')
        self.yz = np.stack([Y2.ravel(), Z2.ravel()], 1)
        self.Y2, self.Z2 = Y2, Z2
        self.X = self.xs[:, None, None]

    def sweep(self, centre, half_thick, half_width, cap_round=True):
        """Plate swept along a sagittal centreline (y, z), half thickness per point, half width in x per point."""
        c, s = polyline_resample(centre)
        ht = np.interp(s, np.linspace(0, s[-1], len(half_thick)), half_thick)
        hw = np.interp(s, np.linspace(0, s[-1], len(half_width)), half_width)
        d, i = cKDTree(c).query(self.yz)
        d = d.reshape(self.Y2.shape).astype(np.float32)
        i = i.reshape(self.Y2.shape)
        a = (d - ht[i])[None]
        b = np.abs(self.X) - hw[i][None]
        out = np.sqrt(np.maximum(a, 0) ** 2 + np.maximum(b, 0) ** 2) + np.minimum(np.maximum(a, b), 0)
        return out.astype(np.float32)

    def tube(self, pts, radii):
        p, s = polyline_resample(pts, 0.15)
        r = np.interp(s, np.linspace(0, s[-1], len(radii)), radii)
        P = np.stack(np.meshgrid(self.xs, self.ys, self.zs, indexing='ij'), -1).reshape(-1, 3)
        d, i = cKDTree(p).query(P, distance_upper_bound=12)
        d = np.where(np.isinf(d), 12, d)
        i = np.minimum(i, len(p) - 1)
        return (d - r[i]).reshape(self.shape).astype(np.float32)

    def region2d(self, inside2d):
        """Signed distance (in x, y, z) of a 2-D sagittal region extruded across all x."""
        m = inside2d
        out = ndimage.distance_transform_edt(~m) * PITCH
        inn = ndimage.distance_transform_edt(m) * PITCH
        return np.where(m, -inn, out).astype(np.float32)[None]


def smooth(f, blur=1.0):
    return ndimage.gaussian_filter(f, blur).astype(np.float32)


def mesh(G, field, labels_fields, target=40000):
    """Mesh the zero level of `field`; label each face by the nearest-to-zero of labels_fields."""
    if field.min() >= 0:
        return None
    pad = np.pad(field, 1, constant_values=1.0)
    v, f, _, _ = measure.marching_cubes(pad, 0.0, spacing=(PITCH,) * 3)
    v = v - PITCH + G.origin
    if len(f) > target:
        v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int32), 1 - target / len(f))
    m = trimesh.Trimesh(v, f, process=True)
    if m.volume < 0:
        m.invert()
    if len(labels_fields) == 1:
        return m, [labels_fields[0][0]] * len(m.faces)
    idx = (m.triangles_center - G.origin) / PITCH
    vals = np.stack([ndimage.map_coordinates(t[1], idx.T, order=1, mode='nearest') for t in labels_fields])
    lab = np.argmin(np.abs(vals), axis=0)
    return m, [labels_fields[i][0] for i in lab]


class Glb:
    def __init__(self, centre):
        self.c = np.asarray(centre, np.float32)
        self.bin = bytearray()
        self.j = {'asset': {'version': '2.0', 'generator': 'Vivatheca tools/vpi/build.py'}, 'scene': 0,
                  'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [], 'accessors': [],
                  'bufferViews': [], 'buffers': []}
        self.mat = {}

    def g(self, a):
        a = np.asarray(a, np.float32) - self.c
        return np.ascontiguousarray(np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1))

    def _acc(self, arr, kind, target, minmax=False):
        arr = np.ascontiguousarray(arr)
        while len(self.bin) % 4:
            self.bin.append(0)
        off = len(self.bin)
        self.bin += arr.tobytes()
        self.j['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes, 'target': target})
        a = {'bufferView': len(self.j['bufferViews']) - 1, 'componentType': 5126 if arr.dtype == np.float32 else 5125,
             'count': len(arr), 'type': kind}
        if minmax:
            a['min'], a['max'] = arr.min(0).tolist(), arr.max(0).tolist()
        self.j['accessors'].append(a)
        return len(self.j['accessors']) - 1

    def material(self, name, double=False):
        key = (name, double)
        if key not in self.mat:
            c, rough = COL[name]
            mat = {'name': GLTF_NAME.get(name, name), 'pbrMetallicRoughness': {
                'baseColorFactor': list(c) + [1.0], 'roughnessFactor': rough, 'metallicFactor': 0}}
            if double:
                mat['doubleSided'] = True
            self.j['materials'].append(mat)
            self.mat[key] = len(self.j['materials']) - 1
        return self.mat[key]

    def add(self, name, m, labels, double=False):
        labels = np.array(labels)
        prims = []
        for lab in dict.fromkeys(labels):
            sub = m.submesh([np.nonzero(labels == lab)[0]], append=True)
            prims.append({'attributes': {'POSITION': self._acc(self.g(sub.vertices), 'VEC3', 34962, True),
                                         'NORMAL': self._acc(np.ascontiguousarray(np.stack([sub.vertex_normals[:, 0], sub.vertex_normals[:, 2], -sub.vertex_normals[:, 1]], -1).astype(np.float32)), 'VEC3', 34962)},
                          'indices': self._acc(sub.faces.astype(np.uint32).ravel(), 'SCALAR', 34963),
                          'material': self.material(lab, double)})
        self.j['meshes'].append({'name': name, 'primitives': prims})
        self.j['nodes'].append({'name': name, 'mesh': len(self.j['meshes']) - 1})
        self.j['scenes'][0]['nodes'].append(len(self.j['nodes']) - 1)

    def save(self, path):
        while len(self.bin) % 4:
            self.bin.append(0)
        self.j['buffers'] = [{'byteLength': len(self.bin)}]
        js = json.dumps(self.j, separators=(',', ':')).encode()
        js += b' ' * (-len(js) % 4)
        out = struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(self.bin))
        out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(self.bin), 0x004E4942) + bytes(self.bin)
        open(path, 'wb').write(out)


def build(folder, out):
    os.makedirs(out, exist_ok=True)
    L = {fj: load(folder, fj) for fj in BONES_MID + BONES_L + BONES_R + ['FJ2761', 'FJ2741', 'FJ2753', 'FJ2762']}

    # ---------------- landmarks from BodyParts3D (y: anterior is negative; z up; x: + is the body's left)
    pal = trimesh.util.concatenate([L['FJ3379'], L['FJ3273']])
    w = pal.vertices[np.abs(pal.vertices[:, 0]) < 3]
    low = w[w[:, 2] < w[:, 2].min() + 8]
    pns = low[np.argmax(low[:, 1])][1:]
    mx = trimesh.util.concatenate([L['FJ3375'], L['FJ3269']])
    w = mx.vertices[np.abs(mx.vertices[:, 0]) < 3]
    ans = w[np.argmin(w[:, 1])][1:]
    u = (pns - ans) / np.linalg.norm(pns - ans)              # palatal plane, pointing backwards
    n_up = np.array([-u[1], u[0]]) if u[0] > 0 else np.array([u[1], -u[0]])   # palatal plane normal, upwards
    ppw_pp = pns + PHARYNGEAL_DEPTH * u                       # posterior pharyngeal wall at the palatal plane
    vomer = L['FJ3395'].vertices
    choana_top = vomer[np.argmax(vomer[:, 1])][1:]
    # chooanal half-width: medial pterygoid plates of the sphenoid, around the PNS level
    s = L['FJ3394'].vertices
    band = s[(s[:, 1] > pns[0] - 3) & (s[:, 1] < pns[0] + 18) & (s[:, 2] > pns[1]) & (s[:, 2] < pns[1] + 20) & (np.abs(s[:, 0]) > 2)]
    w_in = float(np.abs(band[:, 0]).min())

    spine = {k: midline_profile(L[f]) for k, f in [('C1', 'FJ3176'), ('C2', 'FJ3177'), ('C3', 'FJ3161'), ('occ', 'FJ3309')]}
    sph = midline_profile(L['FJ3394'])
    tongue = L['FJ2761']
    tsec = tongue.section(plane_origin=[0, 0, 0], plane_normal=[1, 0, 0]).vertices[:, 1:]
    zr = np.arange(1430, pns[1] - 9, 1.0)
    tongue_back = np.array([[tsec[np.abs(tsec[:, 1] - z) < 1.2][:, 0].max(), z] for z in zr if (np.abs(tsec[:, 1] - z) < 1.2).any()])

    # ---------------- posterior pharyngeal wall P(z): y of the wall surface at height z
    def body_front(f):
        v = L[f].vertices[np.abs(L[f].vertices[:, 0]) < 6]
        return v[np.argmin(v[:, 1])][1:]
    c1_front, c2_front, c3_front = body_front('FJ3176'), body_front('FJ3177'), body_front('FJ3161')
    roof_bone = min(sph[(sph[:, 0] > choana_top[0]) & (sph[:, 0] < ppw_pp[0] + 10)][:, 1].min(), 1e9)
    roof = roof_bone - 3.0                                     # DRAWN 3 mm mucosa under the sphenoid body
    P_pts = np.array([
        [c3_front[0] - PVST['C3'], c3_front[1]],
        [c2_front[0] - PVST['C2'], c2_front[1]],
        [c1_front[0] - PVST['C1'], c1_front[1]],
        ppw_pp,                                                # cited: pharyngeal depth along the palatal plane
        [ppw_pp[0] + 2.0, (ppw_pp[1] + roof) / 2],            # DRAWN: wall curves into the roof
        [choana_top[0] + 4.0, roof],
    ])
    P_pts = P_pts[np.argsort(P_pts[:, 1])]
    zz = np.arange(P_pts[0, 1] - 6, roof + 0.01, 0.2)
    P = lambda z: np.interp(z, P_pts[:, 1], P_pts[:, 0])
    Pc = np.stack([P(zz), zz], 1)
    from scipy.ndimage import gaussian_filter1d
    Pc[:, 0] = gaussian_filter1d(Pc[:, 0], 8)
    Pf = lambda z: np.interp(z, Pc[:, 1], Pc[:, 0])

    lo = np.array([-(w_in + WALL + 3), min(ans[0] + 5, -185), zz[0] - 2])
    hi = np.array([w_in + WALL + 3, max(c1_front[0], c2_front[0]) + 4, roof + 6])
    G = Grid(lo, hi)
    Y2, Z2 = G.Y2, G.Z2

    # ---------------- soft palate centrelines
    th = VELAR_THICKNESS / 2
    tb = tongue_back[np.argsort(tongue_back[:, 1])]
    tb = tb[tb[:, 0] > tb[-1, 0] - 3]   # back of the tongue only (sections low down also cut the tip)
    tb_y = lambda z: np.interp(z, tb[:, 1], tb[:, 0])

    # DRAWN: the resting velum hangs down and back from the PNS in a gentle curve (no cited resting angle was
    # used); the curve is a quadratic Bezier scaled so its length is the cited velar length.
    def bezier(p0, p1, p2, n=400):
        t = np.linspace(0, 1, n)[:, None]
        return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2
    down = -n_up
    for k in np.linspace(0.5, 1.5, 201):
        rest = bezier(pns, pns + 14 * k * u, pns + 14 * k * u + 24 * k * (0.25 * u + down))
        if np.sum(np.linalg.norm(np.diff(rest, axis=0), axis=1)) >= VELAR_LENGTH:
            break
    # Lifted velum (speech): along the palatal plane to the knee, so the back of the knee meets the wall at the
    # cited pharyngeal depth, then down along the wall.
    knee = pns + (PHARYNGEAL_DEPTH - th) * u

    def tail(start, length):
        def dirf(p):
            ty = Pf(p[1]) - th + 0.4
            return np.array([(ty - p[0]) * 0.8, -1.0])
        return walk(start, dirf, length)[1:]
    first = walk(pns, lambda p: u, PHARYNGEAL_DEPTH - th)
    speech = np.vstack([first, tail(first[-1], VELAR_LENGTH - (PHARYNGEAL_DEPTH - th))])
    vfirst = walk(pns, lambda p: u + 0.1 * n_up, VPI_KNEE)

    def vtail(start, length):
        return walk(start, lambda p: np.array([0.12, -1.0]), length)[1:]
    vpi = np.vstack([vfirst, vtail(vfirst[-1], VPI_VELAR_LENGTH - VPI_KNEE)])
    gap = float(ppw_pp[0] - (vfirst[-1][0] + th))

    def taper(c, end=0.45):
        n = len(c)
        return np.concatenate([np.full(int(n * 0.6), th), np.linspace(th, th * end, n - int(n * 0.6))])
    vel_w = w_in + 1.5

    def velum(c):
        return G.sweep(c, taper(c), np.concatenate([np.full(len(c) - 20, vel_w), np.linspace(vel_w, 4.0, 20)]))

    # ---------------- pharyngeal walls (posterior wall reaches back to the bone; side walls; roof)
    bone_front = lambda z: np.interp(z, [c3_front[1], c2_front[1], c1_front[1], ppw_pp[1], roof + 3],
                                     [c3_front[0], c2_front[0], c1_front[0], c1_front[0] - 6, ppw_pp[0] + 9])

    def walls(win_fn, ridge=None, sides=True, roof_on=True):
        Pz = Pf(Z2)
        if ridge is not None:
            zc, h, depth = ridge
            Pz = Pz - depth * np.exp(-((Z2 - zc) / h) ** 2)
        post = (Y2 >= Pz) & (Y2 <= bone_front(Z2) + 1.5) & (Z2 <= (roof + 3 if roof_on else roof))
        roof_r = (Z2 >= roof) & (Z2 <= roof + 3) & (Y2 >= choana_top[0] - 2) & (Y2 <= Pz + 1) & roof_on
        fpost = G.region2d(post | roof_r)
        f = np.maximum(fpost, np.abs(G.X) - (w_in + WALL))
        # side walls: from the front limit (choana above the palate, back of the tongue below) to the back wall
        ant = np.where(Z2 > pns[1], pns[0] + (choana_top[0] - pns[0]) * np.clip((Z2 - pns[1]) / max(choana_top[1] - pns[1], 1), 0, 1),
                       tb_y(np.clip(Z2, tb[:, 1].min(), tb[:, 1].max())) - 1.0)
        side2d = (Y2 >= ant) & (Y2 <= Pz + 1) & (Z2 <= roof + 1)
        fside = G.region2d(side2d)
        win = win_fn(Z2)[None]
        fs = np.maximum(fside, np.maximum(win - np.abs(G.X), np.abs(G.X) - (w_in + WALL)))
        return np.minimum(f, fs) if sides else f

    win_normal = lambda z: np.full_like(z, w_in)

    def win_narrow(to):
        zc = ppw_pp[1] + 2
        return lambda z: w_in - (w_in - to) * np.exp(-((z - zc) / 6.0) ** 2)

    # ---------------- levator veli palatini: origins from BodyParts3D, sling hand-built
    origins = []
    for f in ('FJ2741', 'FJ2753'):
        v = L[f].vertices
        origins.append(v[np.argmax(v[:, 2])])

    def sling(c, at, split=False, overlap=False):
        cc, s = polyline_resample(c)
        p = cc[np.argmin(np.abs(s - at))]
        tubes = []
        for o in origins:
            sx = np.sign(o[0])
            ins = np.array([sx * (vel_w - 3), p[0], p[1]])
            mid = np.array([sx * (2.0 if split else 0.0), p[0] + (1.5 * sx if overlap else 0), p[1] + (0.8 * sx if overlap else 0)])
            if split:   # cleft-type: fibres run forwards to the back edge of the hard palate, no midline sling
                mid = np.array([sx * 6.0, pns[0] + 1.0, pns[1] + 0.5])
                ins = np.array([sx * (vel_w - 3), (p[0] + pns[0]) / 2, (p[1] + pns[1]) / 2])
            if overlap:  # Furlow: each muscle crosses the midline, overlapping the other
                mid = np.array([-sx * 4.0, p[0] + 0.9 * sx, p[1] + 0.9])
            tubes.append(G.tube([o, (o + ins) / 2 + np.array([0, 0, -2]), ins, mid], [LEVATOR_RADIUS] * 4))
        return np.minimum(*tubes)

    # ---------------- airflow arrows (centred in the airway; DRAWN)
    pal_low = midline_profile(mx)
    oral_top = lambda y: pal_low[np.abs(pal_low[:, 0] - y) < 1.5][:, 1].min() if (np.abs(pal_low[:, 0] - y) < 1.5).any() else pns[1] - 4
    tsec_top = lambda y: tsec[np.abs(tsec[:, 0] - y) < 1.5][:, 1].max() if (np.abs(tsec[:, 0] - y) < 1.5).any() else pns[1] - 12
    low_z = zz[0] + 4
    lower = [np.array([0, Pf(low_z) - 4.0, low_z]), np.array([0, Pf(low_z + 10) - 4.5, low_z + 10])]
    oral = [np.array([0, y, (oral_top(y) + tsec_top(y)) / 2]) for y in np.arange(tb[np.argmax(tb[:, 1]), 0] - 6, ans[0] + 8, -6)]
    nasal_z = pns[1] + 9
    nasal = [np.array([0, y, nasal_z]) for y in np.arange(pns[0] - 4, ans[0] - 6, -8)]

    def arrow(points):
        pts = np.array(points)
        r = [AIR_R] * (len(pts) - 1) + [AIR_R]
        body = G.tube(pts[:-1].tolist() + [pts[-1] - 3.5 * (pts[-1] - pts[-2]) / np.linalg.norm(pts[-1] - pts[-2])], r)
        d = (pts[-1] - pts[-2]) / np.linalg.norm(pts[-1] - pts[-2])
        head = G.tube([pts[-1] - 4.0 * d, pts[-1] - 3.99 * d, pts[-1]], [AIR_R * 2.3, AIR_R * 2.3, 0.05])
        return np.minimum(body, head)

    # breathing: up the airway 3 mm in front of the back wall (behind the resting soft palate), then forward through the nose
    behind = [np.array([0, Pf(z) - 3.5, z]) for z in np.arange(low_z + 14, ppw_pp[1] + 4, 4)]
    breath = arrow([lower[0]] + behind + [np.array([0, ppw_pp[0] - 6, nasal_z - 1])] + nasal)
    under = [np.array([0, Pf(pns[1] - 22) - 5, pns[1] - 22]), np.array([0, pns[0] + 16, pns[1] - 12]), np.array([0, pns[0] + 4, pns[1] - 9])]
    speak = arrow(lower + under + oral)
    leak_start = np.array([0, vfirst[-1][0] + th + gap / 2, vfirst[-1][1] - 6])
    leak = arrow([leak_start, np.array([0, leak_start[1], nasal_z - 2])] + nasal)

    # ---------------- flaps
    flap_base_z = ppw_pp[1] + 4.0     # at or above the palatal plane: a base below it goes with persistent VPI (Sitzman 2024)
    flap_c = [np.array([Pf(flap_base_z) + 1.5, flap_base_z]), np.array([vfirst[-1][0] + 1.0, vfirst[-1][1] + th - 0.5])]
    flap = G.sweep(flap_c, [FLAP_THICK / 2] * 2, [FLAP_HALF_WIDTH] * 2)

    states = {
        'rest': dict(velum=rest, win=win_normal, sling=(rest, EFFECTIVE_VELAR_LENGTH, {}), air=[('air', breath)]),
        'speech': dict(velum=speech, win=win_normal, sling=(speech, PHARYNGEAL_DEPTH - th, {}), air=[('air', speak)]),
        'vpi': dict(velum=vpi, win=win_normal, sling=(vpi, 5.0, {'split': True}), air=[('air', speak), ('leak', leak)]),
        'furlow': dict(velum=speech, win=win_normal, sling=(speech, PHARYNGEAL_DEPTH - th, {'overlap': True}), air=[('air', speak)]),
        'flap': dict(velum=vpi, win=win_narrow(FLAP_HALF_WIDTH), sling=(vpi, 5.0, {'split': True}), air=[('air', speak)], flap=flap),
        'sphincter': dict(velum=vpi, win=win_narrow(4.0), sling=(vpi, 5.0, {'split': True}), air=[('air', speak)],
                          ridge=(ppw_pp[1] + 1.0, 4.0, gap + 0.8)),
    }

    bones = {f: L[f] for f in BONES_MID + BONES_L + BONES_R}
    centre = np.array([0.0, (pns[0] + ppw_pp[0]) / 2, pns[1] - 4])
    tongue_mesh = L['FJ2761']
    if os.environ.get('VPI_DEBUG'):
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        fig, axs = plt.subplots(2, 3, figsize=(15, 10))
        i0 = int(np.argmin(np.abs(G.xs - 0.2)))
        for ax, (st, cfg) in zip(axs.ravel(), states.items()):
            V = velum(cfg['velum'])[i0]
            W = walls(cfg['win'], cfg.get('ridge'), sides=False)[i0]
            ax.contour(G.ys, G.zs, V.T, [0], colors='r')
            ax.contour(G.ys, G.zs, W.T, [0], colors='m')
            if 'flap' in cfg:
                ax.contour(G.ys, G.zs, cfg['flap'][i0].T, [0], colors='k')
            for nm, f in cfg['air']:
                ax.contour(G.ys, G.zs, f[i0].T, [0], colors='b' if nm == 'air' else 'orange')
            ax.contour(G.ys, G.zs, sling(cfg['sling'][0], cfg['sling'][1], **cfg['sling'][2]).min(0).T, [0], colors='brown')
            ax.plot(tsec[:, 0], tsec[:, 1], 'g.', ms=1)
            ax.plot(pal_low[:, 0], pal_low[:, 1], 'y.', ms=1)
            for k in spine:
                ax.plot(spine[k][:, 0], spine[k][:, 1], 'k.', ms=1)
            ax.plot(*pns, 'ko'); ax.plot(*ppw_pp, 'kx'); ax.plot(Pc[:, 0], Pc[:, 1], 'c-', lw=0.8)
            ax.set_xlim(G.ys[0], G.ys[-1]); ax.set_ylim(G.zs[0], G.zs[-1]); ax.set_aspect('equal'); ax.set_title(st)
        fig.savefig(os.environ['VPI_DEBUG'], dpi=70)
        sys.exit(0)

    def crop(m, cut):
        for o, nrm in (([0, BOX['y'][0], 0], [0, 1, 0]), ([0, BOX['y'][1], 0], [0, -1, 0]),
                       ([0, 0, BOX['z'][0]], [0, 0, 1]), ([0, 0, BOX['z'][1]], [0, 0, -1])) + ((([0, 0, 0], [1, 0, 0]),) if cut else ()):
            m = m.slice_plane(o, nrm)
        return m

    for st, cfg in states.items():
        V = smooth(velum(cfg['velum']), 0.8)
        mus = sling(cfg['sling'][0], cfg['sling'][1], **cfg['sling'][2])
        for variant in ('whole', 'cut'):
            cut = variant == 'cut'
            # whole: side walls on, roof off (the port is seen from above, as on nasendoscopy);
            # cut: midline section like a lateral MRI, so the side walls would only hide the palate.
            W0 = walls(cfg['win'], None, sides=not cut, roof_on=cut)
            W = smooth(W0, 0.8)
            parts = [('soft', V), ('mucosa', W), ('muscle', mus)]
            if 'flap' in cfg:
                parts.append(('flap', smooth(cfg['flap'], 0.6)))
            if cfg.get('ridge'):   # the sphincter flaps: the raised band on the back wall, coloured as moved tissue
                Wr = walls(cfg['win'], cfg['ridge'], sides=not cut, roof_on=cut)
                parts.append(('flap', smooth(np.maximum(Wr, -W0 - 0.3), 0.6)))
            parts += cfg['air']
            g = Glb(centre)
            keep = np.broadcast_to(-G.X, G.shape).astype(np.float32)   # x >= 0 kept (left half)
            for name, f in parts:
                if cut and name == 'muscle':   # only the part beside the palate shows, behind the cut face
                    res = mesh(G, np.maximum(f, keep + 0.6), [(name, f)], 15000)
                elif cut and name in ('soft', 'flap', 'mucosa'):
                    res = mesh(G, np.maximum(f, keep), [(name, f), (name + '_cut', keep)], 50000)
                else:
                    res = mesh(G, f, [(name, f)], 50000 if name in ('soft', 'mucosa') else 15000)
                if res:
                    g.add(name, res[0], res[1])
            for fj, m in bones.items():
                if (not cut and fj in ABOVE) or (cut and fj in BONES_R):
                    continue
                mm = crop(m, cut and fj in BONES_MID)
                if not cut and fj in ('FJ3273', 'FJ3379'):   # palatine bones: keep the hard palate, drop the plates above it
                    mm = mm.slice_plane([0, 0, pns[1] + 2.0], [0, 0, -1])
                if len(mm.faces):
                    g.add('bone', mm, ['bone'] * len(mm.faces), double=cut)
            tm = crop(tongue_mesh, cut)
            g.add('tongue', tm, ['tongue'] * len(tm.faces), double=cut)
            path = os.path.join(out, f'{st}-{variant}.glb')
            g.save(path)
            print(st, variant, os.path.getsize(path) // 1024, 'KB', flush=True)

    cc, s = polyline_resample(speech)
    report = {
        'base': 'BodyParts3D 4.0 (DBCLS), CC BY 4.0: ' + ', '.join(BONES_MID + BONES_L + BONES_R + ['FJ2761', 'FJ2741 (origin)', 'FJ2753 (origin)']),
        'pns_yz': np.round(pns, 2).tolist(), 'ans_yz': np.round(ans, 2).tolist(),
        'palatal_length_ans_pns_mm': round(float(np.linalg.norm(pns - ans)), 2),
        'velar_length_mm': VELAR_LENGTH, 'effective_velar_length_mm': EFFECTIVE_VELAR_LENGTH,
        'pharyngeal_depth_mm': PHARYNGEAL_DEPTH, 'velar_thickness_mm': VELAR_THICKNESS,
        'vp_ratio_model': round(VELAR_LENGTH / PHARYNGEAL_DEPTH, 2),
        'bony_pns_to_atlas_mm': round(float(c1_front[0] - pns[0]), 2),
        'pvst_drawn_mm': PVST, 'choanal_half_width_from_pterygoid_plates_mm': round(w_in, 2),
        'vpi_velar_length_drawn_mm': VPI_VELAR_LENGTH, 'vpi_gap_mm': round(gap, 2),
        'bp3d_uvular_muscle_behind_pns_mm': [round(float(L['FJ2762'].vertices[:, 1].min() - pns[0]), 2), round(float(L['FJ2762'].vertices[:, 1].max() - pns[0]), 2)],
        'levator_length_model_mm': round(float(np.linalg.norm(origins[0][1:] - knee) ), 2),
        'flap_half_width_drawn_mm': FLAP_HALF_WIDTH, 'flap_base_above_palatal_plane_mm': 4.0,
    }
    json.dump(report, open(os.path.join(out, 'report.json'), 'w'), indent=1)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
