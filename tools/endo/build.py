"""Endodontic pair: a sound lower right first molar (46) and the same tooth with pulp necrosis and a
chronic apical abscess. First Vivatheca model built on BodyParts3D 4.0 (CC BY 4.0), the base-mesh pilot.

Usage: python -I build.py <BodyParts3D obj folder> <out dir> [--zanatomy <mandible_lower_teeth_only.stl>]

Base meshes (BodyParts3D 4.0, "isa" tree, DBCLS): FJ1268 right lower first molar, FJ1269 right lower
second premolar, FJ1270 right lower second molar, FJ3289 mandible. Hand-built from cited figures:
pulp chamber and root canals, decay, the periapical lesions and the sinus tract (see SOURCES below).
Geometry: signed distance fields on a 0.1 mm grid, meshed with marching cubes.

Outputs: sound-whole.glb, sound-cut.glb, abscess-whole.glb, abscess-cut.glb, STL print zips (2x),
report.json (every measured and cited value) and, with --zanatomy, compare-zanatomy.json.
"""
import json
import os
import struct
import sys
import zipfile

import fast_simplification
import numpy as np
import trimesh
from scipy import ndimage
from skimage import measure

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tokens'))
from colours import LINEAR  # noqa: E402  (tools/tokens/colours.py, built by `pnpm tokens`)

PITCH = 0.1
# ---------------------------------------------------------------- cited figures (mm)
CUSP_TO_ROOF = 6.36      # buccal cusp tip to pulp chamber roof, mandibular molars: Deutsch & Musikant 2004
ROOF_WIDTH = 4.92        # pulp chamber mesiodistal width at the roof, mandibular first molar: Ba-Hattab et al. 2025
FLOOR_WIDTH = 4.09       # ... at the floor: Ba-Hattab et al. 2025
CHAMBER_HEIGHT = 1.92    # pulp chamber height (middle), mandibular first molar: Ba-Hattab et al. 2025
# Canals: three (mesiobuccal, mesiolingual, distal); mesial root Vertucci type IV, distal type I: de Pablo et al. 2010
CANAL_R_TOP, CANAL_R_APEX = 0.45, 0.22   # DRAWN radius, enlarged so the canals can be seen (not a measured size)
CREST_BELOW_CEJ = 1.5    # alveolar crest below the CEJ, within the healthy range (<= 2 mm): Anbiaee & Pahlavanzadeh 2024
# The CEJ is taken at the pulp chamber roof: the roof was at CEJ level in 97% of mandibular molars (Deutsch & Musikant 2004).
LESION_MESIAL = 5.0      # periapical lesion diameter: CBCTPAI score 4 (>4-8 mm), Estrela et al. 2008
LESION_DISTAL = 3.5      # CBCTPAI score 3 (>2-4 mm), Estrela et al. 2008
TRACT_R = 0.5            # DRAWN sinus tract radius (no measured value used)
# Tooth layers (cut view). The CEJ is at the pulp chamber roof (above).
ENAMEL = 1.3             # enamel thickness on the crown, tapering to 0 at the CEJ over ENAMEL_TAPER. Mandibular M1
ENAMEL_TAPER = 2.5       # cusp-tip means 1.16-1.30 mm, lateral 1.43-1.67 mm, average 0.97-1.10 mm: Mahoney 2010
CEM_CERVICAL, CEM_APICAL = 0.30, 0.50  # DRAWN cementum thickness, about 2-3x real so it can be seen. Measured
# medians 0.10 mm cervical, 0.16 mm middle, 0.22 mm apical third: Birimisa et al. 2021
# Soft tissue (gingiva and the lining mucosa over the jaw), a removable layer in the viewer.
GINGIVA = 1.0            # gum thickness. Mean mid-buccal and mid-lingual gingival thickness 0.99 mm (ultrasound):
# Müller et al. 1999. Mandibular means by tooth 0.8 mm (canines) to 1.5 mm (second molars): Eger et al. 1996.
GUM_TAPER = 1.0          # DRAWN: the free gingiva thins to 0.3 mm at the margin over its top 1 mm
SULCUS, EPI_ATTACH, CT_ATTACH = 0.69, 0.97, 1.07  # sulcus depth, epithelial and connective tissue attachment:
# Gargiulo et al. 1961. Gingival margin = alveolar crest + 0.69 + 0.97 + 1.07 = 2.73 mm.
PARULIS_R = 1.2          # DRAWN radius of the small lump (parulis) at the sinus tract opening; buccal site: Slutzky-Goldberg et al. 2009
PRINT_SCALE = 2.0

COL = {
    'teeth': (LINEAR['model.tooth'], 0.55), 'bone': (LINEAR['model.bone'], 0.8), 'pulp': (LINEAR['model.pulp'], 0.6),
    'necrotic': (LINEAR['model.necroticPulp'], 0.8), 'decay': (LINEAR['model.decay'], 0.9), 'lesion': (LINEAR['model.abscess'], 0.7),
    'tract': (LINEAR['model.clot'], 0.7), 'tooth_cut': (LINEAR['model.dentineCut'], 0.7), 'bone_cut': (LINEAR['model.boneCut'], 0.9),
    'enamel_cut': (LINEAR['model.enamelCut'], 0.5), 'cementum': (LINEAR['model.cementum'], 0.8),
    'cementum_cut': (LINEAR['model.cementum'], 0.8),
    'gum': (LINEAR['model.gum'], 0.7), 'gum_cut': (LINEAR['model.gum'], 0.9),
}

# Material names in the GLB. /model-parts.js groups materials by name with a trailing _<n> removed, so the
# cut faces hide with their part and the dead pulp shares the "Nerve (pulp)" button.
# Tooth layers: teeth = enamel (crown surface), teeth_1 = dentine (cut), teeth_2 = enamel (cut),
# teeth_3 = cementum (root surface), teeth_4 = cementum (cut).
GLTF_NAME = {'necrotic': 'pulp_1', 'tooth_cut': 'teeth_1', 'bone_cut': 'bone_1', 'enamel_cut': 'teeth_2',
             'cementum': 'teeth_3', 'cementum_cut': 'teeth_4', 'gum_cut': 'gum_1'}


def split_along(m, f):
    """Cut every triangle that the field f (one value per vertex) changes sign across, along f = 0 (linear on each
    edge), so a colour boundary follows a smooth curve instead of the saw-tooth edge of whole triangles."""
    V, F = m.vertices, m.faces
    s = f >= 0
    cross = np.nonzero(s[F].any(1) & ~s[F].all(1))[0]
    if len(cross) == 0:
        return m
    newv, cache = [], {}

    def pt(a, b):
        k = (a, b) if a < b else (b, a)
        if k not in cache:
            t = f[a] / (f[a] - f[b])
            cache[k] = len(V) + len(newv)
            newv.append(V[a] + (V[b] - V[a]) * t)
        return cache[k]
    tris = []
    for fi in cross:
        a, b, c = F[fi]
        # rotate so a is the vertex alone on its side
        if s[b] != s[a] and s[b] != s[c]:
            a, b, c = b, c, a
        elif s[c] != s[a] and s[c] != s[b]:
            a, b, c = c, a, b
        ab, ac = pt(a, b), pt(a, c)
        tris += [(a, ab, ac), (ab, b, c), (ab, c, ac)]
    keep = np.ones(len(F), bool)
    keep[cross] = False
    return trimesh.Trimesh(np.vstack([V, newv]), np.vstack([F[keep], tris]), process=False)


def field_at(G, a, p):
    return ndimage.map_coordinates(a, ((p - G.origin) / PITCH).T, order=1, mode='nearest')


_DEPTH = {}


def surface_depth(G, S):
    """Depth below the outer surface of the uncut tooth (the S = 0 surface): exact distance to a dense sample
    of that surface, positive inside. Smoother than reading S off the grid, so thin layers (enamel, cementum)
    get clean, even edges on a cut face."""
    if id(S) not in _DEPTH:
        from scipy.spatial import cKDTree
        pad = np.pad(S, 1, constant_values=1.0)
        v, f, _, _ = measure.marching_cubes(pad, 0.0, spacing=(PITCH,) * 3)
        surf = trimesh.Trimesh(v - PITCH + G.origin, f, process=False)
        n = int(min(4e6, surf.area / 0.02 ** 2))
        pts, _ = trimesh.sample.sample_surface(surf, n)
        _DEPTH[id(S)] = (S, cKDTree(np.vstack([pts, surf.vertices])))
    tree = _DEPTH[id(S)][1]
    return lambda p: tree.query(p, workers=-1)[0] * np.where(field_at(G, S, p) < 0, 1.0, -1.0)


def layer_labels(G, m, labels, S, cej, apex_z, outer=True):
    """Colour a tooth mesh by tissue. Outer surface: enamel above the CEJ, cementum below. Cut face: enamel or
    cementum within their thickness of the outer surface (depth from the uncropped tooth SDF S), dentine elsewhere.
    cej and apex_z are numbers or functions of position. The mesh is first cut along every tissue boundary
    (split_along), so it returns a new mesh with its labels: (mesh, labels)."""
    as_fn = lambda v: v if callable(v) else (lambda p: np.full(len(p), float(v)))
    cej_fn, apex_fn = as_fn(cej), as_fn(apex_z)
    lab0 = np.array(labels, dtype=object)
    depth = surface_depth(G, S)

    def fields(p):
        z = p[:, 2]
        c, ap = cej_fn(p), apex_fn(p)
        d = depth(p)
        te = ENAMEL * np.clip((z - c) / ENAMEL_TAPER, 0, 1)
        tc = CEM_CERVICAL + (CEM_APICAL - CEM_CERVICAL) * np.clip((c - z) / np.maximum(c - ap, 1e-3), 0, 1)
        return z - c, d - 0.15, d - te, d - tc
    # mesh() already cut along the surface / cut-face boundary; each face keeps its label through the splits.
    for k in range(4):
        n0 = len(m.faces)
        m2 = split_along(m, fields(m.vertices)[k])
        if len(m2.faces) != n0:
            V, F = m.vertices, m.faces
            s = fields(V)[k] >= 0
            cross = s[F].any(1) & ~s[F].all(1)
            lab0 = np.concatenate([lab0[~cross], np.repeat(lab0[cross], 3)])
        m = m2
    # Label by the mean of the vertex values: after the splits every face lies on one side of each boundary,
    # so this agrees with the cut lines (a centre sample can fall on the other side on long thin faces).
    fz, fn, fe, fc = (f[m.faces].mean(1) for f in fields(m.vertices))
    out = []
    for lab, zc, dn, de, dc in zip(lab0, fz, fn, fe, fc):
        if lab == 'teeth' and dn > 0:  # crop face of a neighbour tooth (inside the uncropped tooth): a cut
            lab = 'tooth_cut'
        if lab == 'teeth' and outer:  # outer=False keeps the whole outer surface tooth white (cut faces only)
            lab = 'teeth' if zc >= 0 else 'cementum'
        elif lab == 'tooth_cut':
            lab = 'enamel_cut' if (zc >= 0 and de < 0) else 'cementum_cut' if (zc < 0 and dc < 0) else 'tooth_cut'
        out.append(lab)
    return m, out


def load(folder, fj):
    m = trimesh.load(os.path.join(folder, fj + '.obj'), force='mesh', process=True)
    m.merge_vertices()
    trimesh.repair.fill_holes(m)
    trimesh.repair.fix_normals(m)
    assert m.is_watertight, fj
    return m


def frame(tooth, pm, m2, mandible):
    """z = long axis (crown up), x = mesial, y = right-handed. Origin at the tooth centroid."""
    v = tooth.vertices - tooth.centroid
    w, u = np.linalg.eigh(np.cov(v.T))
    z = u[:, 2] if u[2, 2] > 0 else -u[:, 2]
    x = pm.centroid - m2.centroid
    x -= z * (x @ z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    # Which side of y is lingual: towards the middle of the mandible.
    lingual = np.sign((mandible.centroid - tooth.centroid) @ y)
    return np.array([x, y, z]), tooth.centroid.copy(), lingual


def inside_mask(mesh, xs, ys, zs):
    """Parity fill along z, one ray per (x, y) column."""
    X, Y = np.meshgrid(xs, ys, indexing='ij')
    org = np.column_stack([X.ravel(), Y.ravel(), np.full(X.size, zs[0] - 1.0)])
    d = np.tile([0, 0, 1.0], (len(org), 1))
    loc, ray, _ = mesh.ray.intersects_location(org, d, multiple_hits=True)
    mask = np.zeros((len(xs), len(ys), len(zs)), bool)
    order = np.lexsort((loc[:, 2], ray))
    loc, ray = loc[order], ray[order]
    starts = np.searchsorted(ray, np.arange(len(org)))
    ends = np.searchsorted(ray, np.arange(len(org)), side='right')
    for r in np.nonzero(ends > starts)[0]:
        hz = loc[starts[r]:ends[r], 2]
        hz = hz[np.concatenate([[True], np.diff(hz) > 1e-5])]
        i, j = divmod(r, len(ys))
        for a, b in zip(hz[0::2], hz[1::2]):
            mask[i, j, (zs > a) & (zs < b)] = True
    return mask


def sdf(mask, blur=1.5):
    out = ndimage.distance_transform_edt(~mask) - 0.5
    inn = ndimage.distance_transform_edt(mask) - 0.5
    d = np.where(mask, -inn, out) * PITCH
    return ndimage.gaussian_filter(d, blur).astype(np.float32)  # smooths BodyParts3D's low-poly facets


def isect(*f):
    out = f[0]
    for g in f[1:]:
        out = np.maximum(out, g)
    return out


def union(*f):
    out = f[0]
    for g in f[1:]:
        out = np.minimum(out, g)
    return out


class Grid:
    def __init__(self, lo, hi):
        self.xs, self.ys, self.zs = (np.arange(lo[k], hi[k], PITCH, dtype=np.float32) for k in range(3))
        self.X, self.Y, self.Z = np.meshgrid(self.xs, self.ys, self.zs, indexing='ij', sparse=True)
        self.shape = (len(self.xs), len(self.ys), len(self.zs))
        self.origin = np.array([self.xs[0], self.ys[0], self.zs[0]])

    def full(self, a):
        return np.broadcast_to(a, self.shape).astype(np.float32)

    def ellipsoid(self, c, r):
        X, Y, Z = self.X, self.Y, self.Z
        k = np.sqrt(((X - c[0]) / r[0]) ** 2 + ((Y - c[1]) / r[1]) ** 2 + ((Z - c[2]) / r[2]) ** 2)
        return self.full((k - 1) * min(r))

    def tube(self, pts, radii):
        """SDF of a tube along a polyline with a radius per point (distance transform of the path)."""
        mask = np.ones(self.shape, bool)
        rad = np.zeros(self.shape, np.float32)
        dense, dr = [], []
        for (a, ra), (b, rb) in zip(zip(pts[:-1], radii[:-1]), zip(pts[1:], radii[1:])):
            n = max(2, int(np.linalg.norm(b - a) / (PITCH * 0.5)))
            for t in np.linspace(0, 1, n):
                dense.append(a + (b - a) * t)
                dr.append(ra + (rb - ra) * t)
        idx = np.round((np.array(dense) - self.origin) / PITCH).astype(int)
        ok = np.all((idx >= 0) & (idx < self.shape), axis=1)
        idx, dr = idx[ok], np.array(dr)[ok]
        mask[tuple(idx.T)] = False
        rad[tuple(idx.T)] = dr
        dist, near = ndimage.distance_transform_edt(mask, return_indices=True)
        r = rad[tuple(near)]
        return (dist * PITCH - r).astype(np.float32)


def mesh(G, terms, target=50000):
    s = isect(*[t[1] for t in terms])
    if s.min() >= 0:
        return None
    pad = np.pad(s, 1, constant_values=1.0)
    v, f, _, _ = measure.marching_cubes(pad, 0.0, spacing=(PITCH,) * 3)
    v = v - PITCH + G.origin
    if len(f) > target:
        v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int32), 1 - target / len(f))
    m = trimesh.Trimesh(v, f, process=True)
    if m.volume < 0:
        m.invert()
    vals = lambda p: np.abs(np.stack([field_at(G, t[1], p) for t in terms]))
    if len(terms) > 1:
        # Snap the vertices of the cut face onto the cut surface, so it is truly flat and its rim is a sharp
        # crease (marching cubes and simplification leave a rounded, streaky rim there).
        V = m.vertices.copy()
        flab = np.argmin(vals(m.triangles_center), axis=0)
        h = PITCH * 0.5
        for k in [k for k, t in enumerate(terms) if t[0] == 'cut']:
            vk = np.unique(m.faces[flab == k])
            p = V[vk]
            for _ in range(3):
                f = field_at(G, terms[k][1], p)
                g = np.stack([(field_at(G, terms[k][1], p + h * e) - field_at(G, terms[k][1], p - h * e)) / (2 * h)
                              for e in np.eye(3)], 1)
                p = p - (f / np.maximum((g * g).sum(1), 1e-6))[:, None] * g
            mv = p - V[vk]
            n = np.linalg.norm(mv, axis=1, keepdims=True)
            V[vk] = V[vk] + mv * np.minimum(1, PITCH / np.maximum(n, 1e-9))   # never more than one voxel
        m = trimesh.Trimesh(V, m.faces, process=False)
        # Cut along the boundary between the terms (where two of them are equally near the surface) so the
        # boundary between, say, a tooth's surface and its cut face is a clean line, then label by face centre.
        for k in range(len(terms)):
            v = vals(m.vertices)
            m = split_along(m, v[k] - np.delete(v, k, axis=0).min(0))
    lab = np.argmin(vals(m.vertices)[:, m.faces].mean(2), axis=0) if len(terms) > 1 else np.zeros(len(m.faces), int)
    return m, [terms[i][0] for i in lab]


def group_normals(m, labels):
    """Vertex normals, area-weighted (so the tiny slivers left by split_along do not tilt them) and smoothed
    separately over cut faces and outer surfaces: smooth across a colour boundary on one surface, sharp where a
    cut meets the outer surface."""
    cut = np.array([str(l).endswith('cut') or str(l) == 'cutface' for l in labels])
    N = np.zeros_like(m.vertices)
    V = m.vertices
    for grp in (cut, ~cut):
        F = m.faces[grp]
        if len(F) == 0:
            continue
        fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
        acc = np.zeros_like(V)
        for k in range(3):
            np.add.at(acc, F[:, k], fn)
        u = np.unique(F)
        N[u] = acc[u] / np.maximum(np.linalg.norm(acc[u], axis=1, keepdims=True), 1e-12)
    return N


# ---------------------------------------------------------------- GLB writer (tooth frame z up -> glTF y up)
def to_gltf(a):
    a = np.asarray(a, np.float32)
    return np.ascontiguousarray(np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1))


class Glb:
    def __init__(self):
        self.bin = bytearray()
        self.j = {'asset': {'version': '2.0', 'generator': 'Vivatheca tools/endo/build.py'}, 'scene': 0,
                  'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [], 'accessors': [],
                  'bufferViews': [], 'buffers': []}
        self.mat = {}

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

    def material(self, name):
        if name not in self.mat:
            c, rough = COL[name]
            self.j['materials'].append({'name': GLTF_NAME.get(name, name), 'pbrMetallicRoughness': {
                'baseColorFactor': list(c) + [1.0], 'roughnessFactor': rough, 'metallicFactor': 0}})
            self.mat[name] = len(self.j['materials']) - 1
        return self.mat[name]

    def add(self, name, m, labels):
        labels = np.array(labels)
        # Normals are smoothed across colour boundaries on the same surface (enamel to cementum, dentine to
        # enamel on a cut face) so no shading seam shows there, but not across the crease where a cut meets
        # the outer surface.
        N = group_normals(m, labels)
        prims = []
        for lab in dict.fromkeys(labels):
            u, inv = np.unique(m.faces[labels == lab], return_inverse=True)
            prims.append({'attributes': {'POSITION': self._acc(to_gltf(m.vertices[u]), 'VEC3', 34962, True),
                                         'NORMAL': self._acc(to_gltf(N[u]), 'VEC3', 34962)},
                          'indices': self._acc(inv.reshape(-1).astype(np.uint32), 'SCALAR', 34963),
                          'material': self.material(lab)})
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


# ---------------------------------------------------------------- anatomy from the grid
def canal_paths(G, T, z_floor, lingual):
    """Centre lines of the three canals, from the chamber floor to each root tip, following the roots."""
    inside = T < 0
    paths = {'mb': [], 'ml': [], 'd': []}
    for k in range(len(G.zs) - 1, -1, -1):
        z = G.zs[k]
        if z > z_floor + 0.2:
            continue
        lab, n = ndimage.label(inside[:, :, k])
        comps = []
        for c in range(1, n + 1):
            ii, jj = np.nonzero(lab == c)
            if len(ii) < 20:
                continue
            comps.append((G.xs[ii], G.ys[jj]))
        if not comps:
            continue
        xs = np.concatenate([c[0] for c in comps]); ys = np.concatenate([c[1] for c in comps])
        mes = [c for c in comps if c[0].mean() > 0] if len(comps) > 1 else [(xs[xs > 0], ys[xs > 0])]
        dis = [c for c in comps if c[0].mean() <= 0] if len(comps) > 1 else [(xs[xs <= 0], ys[xs <= 0])]
        if mes and len(mes[0][0]) > 10:
            mx, my = np.concatenate([c[0] for c in mes]), np.concatenate([c[1] for c in mes])
            yc, h = my.mean(), (np.percentile(my, 95) - np.percentile(my, 5))
            paths['mb'].append([mx.mean(), yc - lingual * 0.25 * h, z]); paths['ml'].append([mx.mean(), yc + lingual * 0.25 * h, z])
        if dis and len(dis[0][0]) > 10:
            dx, dy = np.concatenate([c[0] for c in dis]), np.concatenate([c[1] for c in dis])
            paths['d'].append([dx.mean(), dy.mean(), z])
    out = {}
    for k, p in paths.items():
        p = np.array(p)
        p[:, :2] = ndimage.gaussian_filter1d(p[:, :2], 6, axis=0, mode='nearest')
        out[k] = p[::5]
    return out


def build(folder, out, zanatomy=None):
    os.makedirs(out, exist_ok=True)
    t46, t45, t47, mand = (load(folder, f) for f in ('FJ1268', 'FJ1269', 'FJ1270', 'FJ3289'))
    R, c, lingual = frame(t46, t45, t47, mand)
    for m in (t46, t45, t47, mand):
        m.vertices = (m.vertices - c) @ R.T
    lo, hi = t46.bounds
    top = hi[2]
    G = Grid([lo[0] - 6.5, -11, lo[2] - 5.5], [hi[0] + 6.5, 11, top + 1.0])
    print('grid', G.shape)
    T = sdf(inside_mask(t46, G.xs, G.ys, G.zs))
    N = sdf(inside_mask(t45, G.xs, G.ys, G.zs) | inside_mask(t47, G.xs, G.ys, G.zs))
    Bm = inside_mask(mand, G.xs, G.ys, G.zs)
    # BodyParts3D's tooth sockets are wider than its teeth, which left the roots in an empty gap between the
    # buccal and lingual bone plates. Fill each buccolingual line between its outer plates so the roots sit in
    # solid bone (the teeth are cut back out below), as in a real jaw.
    Bm = np.maximum.accumulate(Bm, axis=1) & np.maximum.accumulate(Bm[:, ::-1], axis=1)[:, ::-1]
    B = sdf(Bm, 2.0)
    box = G.full(np.abs(G.X - (lo[0] + hi[0]) / 2) - ((hi[0] - lo[0]) / 2 + 5.5))  # crop mesiodistally
    B = isect(B, box, -T, -N)
    N_full = N
    N = isect(N, box)

    # Pulp chamber: roof CUSP_TO_ROOF below the buccal cusp tip; width shrinks from roof to floor.
    tmask = T < 0
    topz = np.where(tmask.any(2), G.zs[len(G.zs) - 1 - np.argmax(tmask[:, :, ::-1], axis=2)], -99)
    buccal = (-lingual * G.ys[None, :]) > 0
    buccal_cusp = np.where(buccal, topz, -99).max()
    roof = buccal_cusp - CUSP_TO_ROOF
    floor = roof - CHAMBER_HEIGHT
    kz = np.argmin(np.abs(G.zs - roof))
    ii, jj = np.nonzero(tmask[:, :, kz])
    cx, cy = G.xs[ii].mean(), G.ys[jj].mean()
    md, bl = np.ptp(G.xs[ii]), np.ptp(G.ys[jj])
    t = np.clip((roof - G.Z) / CHAMBER_HEIGHT, 0, 1)
    a = (ROOF_WIDTH + (FLOOR_WIDTH - ROOF_WIDTH) * t) / 2
    b = a * bl / md  # buccolingual width follows the tooth's own proportions (no measured value used)
    ell = np.sqrt(((G.X - cx) / a) ** 2 + ((G.Y - cy) / b) ** 2) - 1
    chamber = G.full(np.maximum(ell * np.minimum(a, b), np.maximum(G.Z - roof, floor - G.Z)))
    chamber = ndimage.gaussian_filter(chamber, 2.0)
    crest = roof - CREST_BELOW_CEJ
    B = isect(B, G.full(G.Z - crest))
    canals = canal_paths(G, T, floor, lingual)
    tubes = []
    for k, p in list(canals.items()):
        p = np.vstack([[cx + (p[0, 0] - cx) * 0.6, cy + (p[0, 1] - cy) * 0.6, floor + 0.9], [cx + (p[0, 0] - cx) * 0.85, cy + (p[0, 1] - cy) * 0.85, floor - 0.2], p])
        canals[k] = p
        r = np.linspace(CANAL_R_TOP, CANAL_R_APEX, len(p))
        tubes.append(G.tube(p, r))
    P = isect(union(chamber, *tubes), T + 0.05)  # pulp stays inside the tooth

    # Root apices and furcation (measured on the BodyParts3D tooth).
    apex = {k: p[-1] for k, p in canals.items()}
    apex_z = float(min(p[2] for p in apex.values()))
    lab_any = [k for k in range(len(G.zs)) if G.zs[k] < floor and ndimage.label(tmask[:, :, k])[1] >= 2]
    furcation = float(G.zs[max(lab_any)]) if lab_any else None

    # Abscess state: lesion around each apex, decay from the distal-occlusal surface into the pulp.
    am = (apex['mb'] + apex['ml']) / 2
    Lm = G.ellipsoid(am - [0, 0, 0.6], [LESION_MESIAL / 2] * 3)
    Ld = G.ellipsoid(apex['d'] - [0, 0, 0.4], [LESION_DISTAL / 2] * 3)
    Lsn = isect(union(Lm, Ld), -T)
    xd = lo[0] + 2.6
    D = G.ellipsoid([xd, cy, roof + 2.6], [2.8, 2.3, 3.3])
    cavity = isect(D, -(T + 0.9))                # outer 0.9 mm of the decayed area has broken away
    exit_pt = am + [0, -lingual * 9.0, 4.5]      # buccal and towards the gum
    tract_pts = np.array([am, am + [0, -lingual * 3.5, 2.0], exit_pt])

    # Soft tissue: gum and lining mucosa, GINGIVA thick over the bone and the tooth necks, up to the gingival
    # margin (crest + supracrestal tissue, Gargiulo et al. 1961), thinning to an edge over its top GUM_TAPER.
    margin = crest + SULCUS + EPI_ATTACH + CT_ATTACH
    U = union(B, T, N)
    thick = G.full(GINGIVA * np.clip((margin - G.Z) / GUM_TAPER, 0.3, 1.0))
    gum_out = ndimage.gaussian_filter(isect(U - thick, G.full(G.Z - margin)), 1.0)
    # Sinus tract: carry the tract on along its last leg until it comes out of the gum; a small lump there.
    d = (tract_pts[-1] - tract_pts[-2]) / np.linalg.norm(tract_pts[-1] - tract_pts[-2])
    probe = [tract_pts[-2] + d * s for s in np.arange(0, 20, PITCH)]
    val = ndimage.map_coordinates(gum_out, ((np.array(probe) - G.origin) / PITCH).T, order=1, mode='nearest')
    opening = probe[int(np.argmax((val > 0) & (np.arange(len(val)) > 0)))]
    tract_ext = G.tube(np.vstack([tract_pts[:-1], opening + d * 0.6]), np.full(len(tract_pts), TRACT_R))
    parulis = G.ellipsoid(opening - d * 0.4, [PARULIS_R] * 3)
    gum_out_ab = union(gum_out, isect(parulis, G.full(G.Z - margin)))
    gum_sound = [('gum', gum_out), ('gum', -U), ('gum', box)]
    gum_ab = [('gum', gum_out_ab), ('gum', -U), ('gum', box), ('gum', -tract_ext)]
    tract = isect(tract_ext, -Lsn, -T, gum_out_ab)

    states = {
        'sound': {'bone': [('bone', B)], 'teeth': [('teeth', N)], 'tooth': [('teeth', T), ('tooth_cut', -P)],
                  'pulp': [('pulp', P)], 'gum': gum_sound},
        'abscess': {'bone': [('bone', B), ('bone', -Lsn), ('bone', -tract)], 'teeth': [('teeth', N)],
                    'tooth': [('teeth', T), ('tooth_cut', -P), ('decay', -D)],
                    'decay': [('decay', D), ('decay', T), ('decay', -cavity), ('decay', -P)],
                    'pulp': [('necrotic', P)], 'lesion': [('lesion', Lsn), ('lesion', box)],
                    'tract': [('tract', tract), ('tract', box)], 'gum': gum_ab},
    }
    # Cut view: a curved vertical cut that runs along the distal canal in the distal half and the
    # mesiolingual canal in the mesial half, keeping the lingual side, so the cut face looks buccal and
    # shows the canals of both roots (like a periapical radiograph, but in 3D).
    def along(p):
        zz = p[:, 2][::-1]
        return lambda z: np.interp(z, zz, p[:, 1][::-1])
    yd, ym = along(canals['d']), along(canals['ml'])
    zc = np.clip(G.zs, min(canals['d'][-1][2], canals['ml'][-1][2]), floor + 0.9)
    w = np.clip((G.xs + 1.5) / 3.0, 0, 1)
    w = w * w * (3 - 2 * w)
    ycut = (1 - w)[:, None] * yd(zc)[None, :] + w[:, None] * ym(zc)[None, :]   # (x, z)
    keep = G.full(lingual * (G.Y - ycut[:, None, :]) - 0.05)
    names = {'tooth': 'teeth'}
    for st, parts in states.items():
        for variant in ('whole', 'cut'):
            g = Glb()
            for part, terms in parts.items():
                tt = terms + ([('cut', -keep)] if variant == 'cut' else [])
                res = mesh(G, tt, 60000 if part in ('bone', 'tooth', 'gum') else 25000)
                if part == 'gum':
                    res = drop_slivers(res)
                if res is None:
                    continue
                m, labels = res
                cutlab = {'bone': 'bone_cut', 'tooth': 'tooth_cut', 'teeth': 'tooth_cut', 'gum': 'gum_cut'}.get(part, terms[0][0])
                labels = [cutlab if l == 'cut' else l for l in labels]
                if part in ('tooth', 'teeth'):
                    m, labels = layer_labels(G, m, labels, T if part == 'tooth' else N_full, roof, apex_z)
                g.add(names.get(part, part), m, labels)
            g.save(os.path.join(out, f'{st}-{variant}.glb'))
            print(st, variant, os.path.getsize(os.path.join(out, f'{st}-{variant}.glb')) // 1024, 'KB')
        write_print(G, st, parts, out)

    report = {
        'base': 'BodyParts3D 4.0 (DBCLS), FJ1268/FJ1269/FJ1270/FJ3289, CC BY 4.0',
        'tooth_extents_mm': np.round(t46.extents, 2).tolist(),
        'tooth_length_mm': round(float(top - min(p[-1][2] for p in canals.values())), 2),
        'buccal_cusp_to_roof_mm': CUSP_TO_ROOF, 'chamber_height_mm': CHAMBER_HEIGHT,
        'roof_width_mm': ROOF_WIDTH, 'floor_width_mm': FLOOR_WIDTH,
        'chamber_buccolingual_scale': round(float(bl / md), 3),
        'floor_to_furcation_mm': round(float(floor - furcation), 2) if furcation is not None else None,
        'lesion_mm': {'mesial': LESION_MESIAL, 'distal': LESION_DISTAL},
        'canal_radius_drawn_mm': [CANAL_R_TOP, CANAL_R_APEX],
        'gingiva_mm': GINGIVA, 'gingival_margin_above_crest_mm': round(SULCUS + EPI_ATTACH + CT_ATTACH, 2),
        'gingival_margin_above_cej_mm': round(SULCUS + EPI_ATTACH + CT_ATTACH - CREST_BELOW_CEJ, 2),
        'sinus_tract_opening_above_apex_mm': round(float(opening[2] - am[2]), 2), 'parulis_radius_drawn_mm': PARULIS_R,
        'enamel_mm': ENAMEL, 'enamel_taper_mm': ENAMEL_TAPER, 'cementum_drawn_mm': [CEM_CERVICAL, CEM_APICAL],
    }
    json.dump(report, open(os.path.join(out, 'report.json'), 'w'), indent=1)
    print(json.dumps(report, indent=1))
    if zanatomy:
        compare(zanatomy, t46, R, c, out)


def drop_slivers(res, min_faces=50):
    """Drop loose bits of a few triangles that decimation leaves where the thin gum edge meets itself."""
    if res is None:
        return None
    m, labels = res
    comp = trimesh.graph.connected_component_labels(m.face_adjacency, node_count=len(m.faces))
    keep = np.isin(comp, np.nonzero(np.bincount(comp) >= min_faces)[0])
    if keep.all():
        return res
    sub = m.submesh([np.nonzero(keep)[0]], append=True)
    return sub, [l for l, k in zip(labels, keep) if k]


def write_print(G, st, parts, out):
    zp = os.path.join(out, f'vivatheca-endodontic-{st}-2x.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for part, terms in parts.items():
            for target in (80000, 160000, 10 ** 9):
                res = mesh(G, terms, target)
                if part == 'gum':
                    res = drop_slivers(res)
                    if res is not None and not res[0].is_watertight:
                        trimesh.repair.fill_holes(res[0])
                    # The abscess gum keeps a few open edges where the drainage channel leaves it at every
                    # resolution; slicers close those, and the full-resolution mesh would be ~36 MB, so stop here.
                    break
                if res is None or res[0].is_watertight:
                    break
            if res is None:
                continue
            m = res[0]
            m.apply_scale(PRINT_SCALE)
            z.writestr(f'{st}-{part}.stl', m.export(file_type='stl'))
        z.writestr('README.txt', README_PRINT)


def compare(path, t46, R, c, out):
    """Z-Anatomy's lower right first molar beside the BodyParts3D one: size, detail and surface distance
    after rigid alignment (Z-Anatomy sits elsewhere in space, so its tooth is moved onto ours by ICP)."""
    za = trimesh.load(path)
    parts = sorted(za.split(only_watertight=False), key=lambda p: p.centroid[0])
    best = parts[3]  # outer surface of 46, as in tools/cracked-tooth/prep_tooth.py
    bp = t46.copy()
    bp.vertices = bp.vertices @ R + c  # back to world
    init = np.eye(4)
    init[:3, 3] = bp.centroid - best.centroid
    M, _, _ = trimesh.registration.icp(best.sample(4000), bp, initial=init, max_iterations=60, scale=False)
    zb = best.copy()
    zb.apply_transform(M)
    d1 = np.abs(trimesh.proximity.signed_distance(bp, zb.sample(5000)))
    res = {'zanatomy_extents_mm': np.round(sorted(best.extents), 2).tolist(), 'bodyparts3d_extents_mm': np.round(sorted(bp.extents), 2).tolist(),
           'zanatomy_volume_mm3': round(float(abs(best.volume)), 1), 'bodyparts3d_volume_mm3': round(float(bp.volume), 1),
           'zanatomy_faces': int(len(best.faces)), 'bodyparts3d_faces': int(len(bp.faces)),
           'mean_surface_distance_mm': round(float(d1.mean()), 3), 'p95_surface_distance_mm': round(float(np.percentile(d1, 95)), 3)}
    json.dump(res, open(os.path.join(out, 'compare-zanatomy.json'), 'w'), indent=1)
    print('Z-Anatomy comparison', res)


README_PRINT = """Vivatheca endodontic model, 2x life size, STL in millimetres.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
See https://vivatheca.com/disclaimer
Not yet clinically reviewed.
Root canals and the drainage channel are drawn wider than real so they can be seen and printed.
The gum (soft tissue) is a separate STL; leave it off to see the bone and roots.
Licence: CC BY 4.0. Made by Vivatheca from BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution 4.0 International.
"""

if __name__ == '__main__':
    args = sys.argv[1:]
    za = args[args.index('--zanatomy') + 1] if '--zanatomy' in args else None
    build(args[0], args[1], za)
