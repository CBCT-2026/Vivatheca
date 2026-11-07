"""Build the cracked tooth series from tooth.npz (made by prep_tooth.py).

Usage: python build.py tooth.npz out_dir

States (each as a whole tooth and as a tooth cut in half, buccolingually, through the middle):
  healthy    sound lower first molar (the matched normal)
  cracked    the same tooth with a crack limited to the crown
  composite  the cracked tooth with a direct composite resin (MOD) filling, no cusp coverage
  crown      the cracked tooth with a full-coverage crown

Every GLB has a looping "bite" animation. Arrows show the biting force. In the cracked and
filled teeth the two halves of the crown tip apart (exaggerated, 6 degrees each side), which
opens the crack. In the crowned tooth the crown holds the cusps together and nothing opens.

Also writes STL print parts (scale 3x) for each state, whole tooth.

Geometry is built from signed distance fields on a 0.06 mm grid, then meshed with marching cubes.
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

# ---------------------------------------------------------------- parameters (mm, tooth frame)
CRACK_HALF_WIDTH = 0.12      # drawn 0.24 mm wide so it can be seen; real cracks are far thinner
CRACK_BOTTOM_MID = 2.6       # crack depth: bottom 2.6 mm above the CEJ in the middle of the tooth
CRACK_BOTTOM_END = 0.8       # ... and 0.8 mm above the CEJ at the marginal ridges: limited to the crown
PREP_ISTHMUS = 3.0           # MOD cavity: occlusal isthmus width
PREP_FLOOR = 3.6             # occlusal floor height above the CEJ
PREP_BOX = 4.2               # proximal box buccolingual width
PREP_BOX_DEPTH = 1.8         # proximal box mesiodistal depth
PREP_BOX_FLOOR = 1.4         # gingival floor height above the CEJ
CROWN_MARGIN = 0.5           # crown margin height above the CEJ
CROWN_AXIAL = 1.2            # axial reduction (thickness of the crown wall)
CROWN_MARGIN_W = 0.7         # chamfer width at the margin
CROWN_OCCLUSAL = 1.6         # occlusal reduction
TILT_DEG = 6.0               # exaggerated cusp tipping under load (real movement is microscopic)
PRINT_SCALE = 3.0
PRINT_GAP = 0.08             # crown and filling fit clearance at model scale (0.24 mm at 3x)
CEM_CERVICAL, CEM_APICAL = 0.30, 0.50  # DRAWN cementum thickness (cut view colour zone), about 2-3x real

COL = {
    'tooth': ([0.8963, 0.855, 0.7758, 1], 0.6, 0),
    'enamel_cut': (list(LINEAR['model.enamelCut']) + [1], 0.5, 0),
    'dentine_cut': (list(LINEAR['model.dentineCut']) + [1], 0.7, 0),
    'cementum': (list(LINEAR['model.cementum']) + [1], 0.8, 0),
    'cementum_cut': (list(LINEAR['model.cementum']) + [1], 0.8, 0),
    'pulp': ([0.60, 0.10, 0.10, 1], 0.6, 0),
    'crack': ([0.10, 0.045, 0.02, 1], 0.9, 0),
    'filling': ([0.16, 0.42, 0.85, 1], 0.35, 0),
    'crown': ([0.40, 0.45, 0.55, 1], 0.35, 0),
    'force': ([0.95, 0.38, 0.02, 1], 0.5, 0),
    'hold': ([0.0, 0.50, 0.55, 1], 0.5, 0),
}


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


class Field:
    def __init__(self, path):
        d = np.load(path)
        self.T, self.P = d['T'], d['P']
        self.xs, self.ys, self.zs = d['xs'], d['ys'], d['zs']
        self.pitch = self.xs[1] - self.xs[0]
        self.X, self.Y, self.Z = np.meshgrid(self.xs, self.ys, self.zs, indexing='ij', sparse=True)
        self.groove = self._groove()

    def _groove(self):
        """Central groove line y = g(x): lowest point of the occlusal surface across |y| < 2.5."""
        inside = self.T < 0
        has = inside.any(2)
        top = np.where(has, self.zs[len(self.zs) - 1 - np.argmax(inside[:, :, ::-1], axis=2)], np.nan)
        ys = self.ys
        band = np.abs(ys) < 2.5
        gx, gy = [], []
        for i, x in enumerate(self.xs):
            row = top[i, band]
            if np.isfinite(row).sum() > 20 and abs(x) < 4.5:
                gx.append(x)
                gy.append(ys[band][np.nanargmin(row)])
        c = np.polyfit(gx, gy, 2)
        print('groove poly', c)
        return np.poly1d(c)

    def crack_y(self, x, z):
        return self.groove(x) + 0.18 * np.sin(1.3 * x + 0.4) + 0.08 * np.sin(2.1 * z)

    def crack_bottom(self, x):
        t = np.clip((x / 5.2) ** 2, 0, 1)
        return CRACK_BOTTOM_END + (CRACK_BOTTOM_MID - CRACK_BOTTOM_END) * (1 - t)

    def crack(self):
        """SDF of the crack void (negative inside)."""
        X, Y, Z = self.X, self.Y, self.Z
        slab = np.abs(Y - self.crack_y(X, Z)) - CRACK_HALF_WIDTH * (0.35 + 0.65 * smoothstep(0, 1.2, Z - self.crack_bottom(X)))
        return np.maximum(slab, self.crack_bottom(X) - Z).astype(np.float32)

    def prep(self):
        """SDF of the MOD cavity for the composite filling."""
        X, Y, Z = self.X, self.Y, self.Z
        dy = np.abs(Y - self.groove(X))
        isthmus = np.maximum(dy - PREP_ISTHMUS / 2, PREP_FLOOR - Z)
        xh = self.half_length()
        box = np.maximum(np.maximum(dy - PREP_BOX / 2, PREP_BOX_FLOOR - Z), (xh - PREP_BOX_DEPTH) - np.abs(X))
        s = np.minimum(isthmus, box)
        return ndimage.gaussian_filter(s, 4).astype(np.float32)  # round the internal corners

    def half_length(self):
        inside = (self.T < 0)[:, :, self.zs > 2.5].any((1, 2))
        x = self.xs[inside]
        return (x.max() - x.min()) / 2

    def crown_core_offset(self):
        """How far the prepared core sits inside the original surface (crown thickness)."""
        Z = self.Z
        side = CROWN_MARGIN_W + (CROWN_AXIAL - CROWN_MARGIN_W) * smoothstep(CROWN_MARGIN, CROWN_MARGIN + 1.5, Z)
        occ = smoothstep(3.0, 5.0, Z) * (CROWN_OCCLUSAL - CROWN_AXIAL)
        return (side + occ).astype(np.float32)

    def half_space_z(self, z0, above=True):
        return ((z0 - self.Z) if above else (self.Z - z0)).astype(np.float32) + 0 * self.X + 0 * self.Y

    def cut(self):
        """Keep the distal half (x < 0): the cut face looks mesially."""
        return (self.X + 0 * self.Y + 0 * self.Z).astype(np.float32)


def isect(*fields):
    out = fields[0]
    for f in fields[1:]:
        out = np.maximum(out, f)
    return out


def mesh_solid(F, terms, target=60000):
    """terms: list of (label, sdf). Solid = intersection of all terms. Faces labelled by nearest term."""
    sdf = isect(*[t[1] for t in terms])
    if sdf.min() >= 0:
        return None
    pad = np.pad(sdf, 1, constant_values=1.0)
    v, f, _, _ = measure.marching_cubes(pad, 0.0, spacing=(F.pitch,) * 3)
    v = v - F.pitch + np.array([F.xs[0], F.ys[0], F.zs[0]])
    if len(f) > target:
        v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int32), 1 - target / len(f))
    m = trimesh.Trimesh(v, f, process=True)
    if m.volume < 0:  # make normals point outward
        m.invert()
    cen = m.triangles_center
    idx = (cen - [F.xs[0], F.ys[0], F.zs[0]]) / F.pitch
    vals = np.stack([ndimage.map_coordinates(t[1], idx.T, order=1, mode='nearest') for t in terms])
    lab = np.argmin(np.abs(vals), axis=0)
    return m, [terms[i][0] for i in lab]


# ---------------------------------------------------------------- loading (morph target)
def tilt_delta(F, v, angle_deg):
    """Displacement that tips the two halves of the crown apart about the bottom of the crack."""
    x, y, z = v.T
    zb = F.crack_bottom(x)
    yc = F.crack_y(x, zb)
    s = np.sign(y - F.crack_y(x, z))
    phi = np.radians(angle_deg) * s * smoothstep(zb - 0.4, zb + 0.6, z)
    dy, dz = y - yc, z - zb
    ny = yc + dy * np.cos(phi) + dz * np.sin(phi)
    nz = zb - dy * np.sin(phi) + dz * np.cos(phi)
    d = np.zeros_like(v)
    d[:, 1], d[:, 2] = ny - y, nz - z
    return d


# ---------------------------------------------------------------- arrows
def arrow(start, end, r=0.22, head=0.55):
    start, end = np.asarray(start, float), np.asarray(end, float)
    d = end - start
    L = np.linalg.norm(d)
    shaft = trimesh.creation.cylinder(r, L - head * 1.6, sections=24)
    shaft.apply_translation([0, 0, (L - head * 1.6) / 2])
    cone = trimesh.creation.cone(head, head * 1.6, sections=24)
    cone.apply_translation([0, 0, L - head * 1.6])
    a = trimesh.util.concatenate([shaft, cone])
    a.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], d / L))
    a.apply_translation(start)
    return a


def cusp_points(F):
    """Highest point of the crown on each side of the groove, near the middle of the tooth."""
    inside = F.T < 0
    top = np.where(inside.any(2), F.zs[len(F.zs) - 1 - np.argmax(inside[:, :, ::-1], axis=2)], -99)
    pts = []
    for side in (-1, 1):
        mask = (np.abs(F.xs)[:, None] < 2.5) & (side * (F.ys[None, :] - F.groove(F.xs)[:, None]) > 1.0)
        t = np.where(mask, top, -99)
        i, j = np.unravel_index(np.argmax(t), t.shape)
        pts.append(np.array([F.xs[i], F.ys[j], t[i, j]]))
    return pts


# ---------------------------------------------------------------- GLB writer
def to_gltf(a):
    """Tooth frame (z up) to glTF (y up): (x, y, z) -> (x, z, -y)."""
    a = np.asarray(a, np.float32)
    return np.ascontiguousarray(np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1))


class Glb:
    def __init__(self):
        self.bin = bytearray()
        self.j = {'asset': {'version': '2.0', 'generator': 'Vivatheca cracked-tooth build.py'},
                  'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [],
                  'accessors': [], 'bufferViews': [], 'buffers': [], 'animations': []}
        self.mat = {}

    def _view(self, arr, target=None):
        while len(self.bin) % 4:
            self.bin.append(0)
        off = len(self.bin)
        self.bin += arr.tobytes()
        bv = {'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes}
        if target:
            bv['target'] = target
        self.j['bufferViews'].append(bv)
        return len(self.j['bufferViews']) - 1

    def _acc(self, arr, kind, target=None, minmax=False):
        arr = np.ascontiguousarray(arr)
        ctype = 5126 if arr.dtype == np.float32 else 5125
        a = {'bufferView': self._view(arr, target), 'componentType': ctype, 'count': len(arr), 'type': kind}
        if minmax:
            a['min'] = arr.min(0).tolist()
            a['max'] = arr.max(0).tolist()
        self.j['accessors'].append(a)
        return len(self.j['accessors']) - 1

    def material(self, name):
        if name not in self.mat:
            c, rough, metal = COL[name]
            m = {'name': name, 'pbrMetallicRoughness': {'baseColorFactor': c, 'roughnessFactor': rough,
                                                        'metallicFactor': metal}}
            self.j['materials'].append(m)
            self.mat[name] = len(self.j['materials']) - 1
        return self.mat[name]

    def add_mesh(self, name, mesh, labels, delta=None):
        prims = []
        labels = np.array(labels)
        for lab in dict.fromkeys(labels):
            sub = mesh.submesh([np.nonzero(labels == lab)[0]], append=True)
            v = to_gltf(sub.vertices)
            n = to_gltf(sub.vertex_normals)
            p = {'attributes': {'POSITION': self._acc(v, 'VEC3', 34962, True),
                                'NORMAL': self._acc(n, 'VEC3', 34962)},
                 'indices': self._acc(sub.faces.astype(np.uint32).ravel(), 'SCALAR', 34963),
                 'material': self.material(lab)}
            if delta is not None:
                dv = to_gltf(delta(sub.vertices))
                p['targets'] = [{'POSITION': self._acc(dv, 'VEC3', 34962, True)}]
            prims.append(p)
        m = {'name': name, 'primitives': prims}
        if delta is not None:
            m['weights'] = [0.0]
        self.j['meshes'].append(m)
        self.j['nodes'].append({'name': name, 'mesh': len(self.j['meshes']) - 1})
        node = len(self.j['nodes']) - 1
        self.j['scenes'][0]['nodes'].append(node)
        return node

    def animate(self, morph_nodes, move_nodes, period=1.6):
        t = np.array([0, period * 0.4, period * 0.6, period], np.float32)
        w = np.array([0, 1, 1, 0], np.float32)
        tin = self._acc(t, 'SCALAR', None, True)
        samplers, channels = [], []
        if morph_nodes:
            samplers.append({'input': tin, 'output': self._acc(w, 'SCALAR'), 'interpolation': 'LINEAR'})
            for n in morph_nodes:
                channels.append({'sampler': len(samplers) - 1, 'target': {'node': n, 'path': 'weights'}})
        for n, drop in move_nodes:
            tr = to_gltf(np.array([[0, 0, 0], drop, drop, [0, 0, 0]], np.float32))
            samplers.append({'input': tin, 'output': self._acc(tr, 'VEC3'), 'interpolation': 'LINEAR'})
            channels.append({'sampler': len(samplers) - 1, 'target': {'node': n, 'path': 'translation'}})
        self.j['animations'].append({'name': 'bite', 'samplers': samplers, 'channels': channels})

    def save(self, path):
        while len(self.bin) % 4:
            self.bin.append(0)
        self.j['buffers'] = [{'byteLength': len(self.bin)}]
        js = json.dumps(self.j, separators=(',', ':')).encode()
        js += b' ' * (-len(js) % 4)
        out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(self.bin))
        out += struct.pack('<II', len(js), 0x4E4F534A) + js
        out += struct.pack('<II', len(self.bin), 0x004E4942) + bytes(self.bin)
        open(path, 'wb').write(out)


# ---------------------------------------------------------------- states
def build(F, out):
    T, Pu = F.T, F.P
    C = F.crack()
    neg = lambda a: -a
    prep = F.prep()
    off = F.crown_core_offset()
    core = T + off                                   # prepared core surface (negative inside)
    above_margin = (CROWN_MARGIN - F.Z + 0 * F.X + 0 * F.Y).astype(np.float32)  # <0 above margin
    crown_region = isect(T, above_margin, neg(core))  # the crown shell
    cut = F.cut()
    # enamel: none below the CEJ, about 1.5 mm thick on the cusps
    enamel_t = smoothstep(-0.1, 0.3, F.Z) * (0.15 + smoothstep(0.0, 4.0, F.Z) * 1.35)
    enamel_in = (T + enamel_t + 0 * F.X + 0 * F.Y).astype(np.float32)  # <0 = deeper than enamel
    # cementum: root surface below the CEJ, DRAWN 0.3 mm at the CEJ to 0.5 mm at the apex (about 2-3x real;
    # measured medians 0.10 / 0.16 / 0.22 mm cervical / middle / apical third: Birimisa et al. 2021)
    zmin = float(F.zs[np.nonzero((T < 0).any(axis=(0, 1)))[0][0]])
    cem_t = (CEM_CERVICAL + (CEM_APICAL - CEM_CERVICAL) * np.clip(F.Z / zmin, 0, 1)) * (F.Z < 0)
    cem_in = (T + cem_t + 0 * F.X + 0 * F.Y).astype(np.float32)  # <0 = deeper than cementum

    # Which parts each state has: list of (mesh name, terms, moves with the bite)
    states = {
        'healthy': dict(tooth=[('tooth', T)]),
        'cracked': dict(tooth=[('tooth', T), ('crack', neg(C))]),
        'composite': dict(tooth=[('tooth', T), ('crack', neg(C)), ('tooth', neg(prep))],
                          filling=[('filling', T), ('filling', prep)]),
        'crown': dict(tooth=[('tooth', T), ('crack', neg(C)), ('tooth', neg(crown_region))],
                      crown=[('crown', T), ('tooth', above_margin), ('crown', neg(core))]),
    }
    cusps = cusp_points(F)
    print('cusps', cusps)
    os.makedirs(out, exist_ok=True)
    prints = {}
    for name, parts in states.items():
        for variant in ('whole', 'cut'):
            g = Glb()
            morph = []
            for part, terms in parts.items():
                if variant == 'whole':
                    pieces = [(part, terms)]
                else:
                    t2 = [(lab if lab != 'tooth' or i == 0 else 'tooth', s) for i, (lab, s) in enumerate(terms)]
                    t2 = t2 + [('cutface', cut)]
                    if part == 'tooth':
                        tt = t2 + [('dentine_cut', neg(Pu))]
                        pieces = [('enamel', tt + [('enamel_cut', neg(enamel_in))]),
                                  ('cementum', tt + [('cementum_cut', neg(cem_in))]),
                                  ('dentine', tt + [('dentine_cut', enamel_in), ('dentine_cut', cem_in)]),
                                  ('pulp', [('pulp', Pu), ('pulp', cut)] + [(l, s) for l, s in terms[1:] if l == 'crack'])]
                    else:
                        pieces = [(part, t2)]
                for pname, pterms in pieces:
                    res = mesh_solid(F, pterms, 45000 if variant == 'whole' else 30000)
                    if res is None:
                        continue
                    m, labels = res
                    labels = [fix_label(l, pname, part) for l in labels]
                    zc = m.triangles_center[:, 2]
                    labels = ['cementum' if (l == 'tooth' and z < 0) else l for l, z in zip(labels, zc)]
                    delta = None
                    if name in ('cracked', 'composite'):
                        if part == 'filling':
                            delta = lambda v: np.tile([0, 0, -0.12], (len(v), 1))
                        else:
                            delta = lambda v: tilt_delta(F, v, TILT_DEG)
                    node = g.add_mesh(pname, m, labels, delta)
                    if delta is not None:
                        morph.append(node)
                    if variant == 'whole':
                        prints[(name, part)] = m
            moves = []
            for p in cusps:
                a = arrow(p + [0, 0, 4.2], p + [0, 0, 0.5])
                moves.append((g.add_mesh('force', a, ['force'] * len(a.faces)), [0, 0, -0.5]))
            for p in cusps:
                side = np.sign(p[1] - F.groove(p[0]))
                wall = side * (np.abs(F.ys).max() - 0.6)
                if name == 'crown':
                    a = arrow([p[0], wall + side * 3.2, 3.0], [p[0], wall + side * 0.4, 3.0], r=0.18, head=0.45)
                    g.add_mesh('hold', a, ['hold'] * len(a.faces))
                elif name in ('cracked', 'composite'):
                    a = arrow([p[0], wall + side * 0.6, p[2] - 1.0], [p[0], wall + side * 3.0, p[2] - 1.0], r=0.18, head=0.45)
                    moves.append((g.add_mesh('force', a, ['force'] * len(a.faces)), [0, side * 0.35, 0]))
            g.animate(morph, moves)
            g.save(os.path.join(out, f'{name}-{variant}.glb'))
            print(name, variant, os.path.getsize(os.path.join(out, f'{name}-{variant}.glb')) // 1024, 'KB')
    write_prints(F, states, out)


def fix_label(lab, piece, part):
    if lab == 'cutface':
        return {'enamel': 'enamel_cut', 'dentine': 'dentine_cut', 'cementum': 'cementum_cut', 'pulp': 'pulp'}.get(piece, part if part in COL else 'tooth')
    return lab


def write_prints(F, states, out):
    """STL parts at 3x. Fillings and crowns are made slightly smaller so they fit; print each in its own colour."""
    T, C = F.T, F.crack()
    prep = F.prep()
    core = T + F.crown_core_offset()
    above_margin = (CROWN_MARGIN - F.Z + 0 * F.X + 0 * F.Y).astype(np.float32)
    parts = {
        'healthy': {'tooth': [T]},
        'cracked': {'tooth': [T, -C]},
        'composite': {'tooth': [T, -C, -prep], 'filling': [T, prep + PRINT_GAP]},
        'crown': {'tooth': [T, -C, -isect(T, above_margin, -core)],
                  'crown': [T, above_margin, -(core + PRINT_GAP)]},
    }
    notes = open(os.path.join(out, 'print-notes.txt'), 'w')
    for name, ps in parts.items():
        zp = os.path.join(out, f'vivatheca-cracked-tooth-{name}-3x.zip')
        with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
            for part, fs in ps.items():
                for target in (80000, 150000, 10 ** 9):  # keep the part watertight
                    m = mesh_solid(F, [('x', f) for f in fs], target)[0]
                    if m.is_watertight:
                        break
                m.apply_scale(PRINT_SCALE)
                z.writestr(f'{name}-{part}.stl', m.export(file_type='stl'))
                notes.write(f'{name}/{part}: watertight={m.is_watertight} volume={m.volume:.0f} mm3 size={np.round(m.extents, 1).tolist()}\n')
            z.writestr('README.txt', README_PRINT)
    notes.close()


README_PRINT = """Vivatheca cracked tooth model, 3x life size, STL in millimetres.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
See https://vivatheca.com/disclaimer
Not yet clinically reviewed.
Parts: print the tooth in a tooth colour, the filling or crown in another colour. The filling and crown are 0.24 mm smaller than the space they fit, so they can be lifted out.
The crack is drawn about 0.7 mm wide at this size so it can be seen; real cracks are much thinner.
Licence: CC BY-SA 4.0. Made by Vivatheca from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (DBCLS, CC BY-SA 2.1 Japan).
"""


if __name__ == '__main__':
    build(Field(sys.argv[1]), sys.argv[2])
