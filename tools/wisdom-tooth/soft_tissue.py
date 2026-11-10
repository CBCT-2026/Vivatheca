"""Add removable soft tissue layers (gum and lining mucosa) to the two wisdom tooth models.

Usage: python3 -I tools/wisdom-tooth/soft_tissue.py public/models/impacted-molar.glb public/models/wisdom-tooth-normal.glb

Each GLB gets two new meshes with their own materials, so the viewer's "take the model apart" panel can hide
them one at a time:
  gum    - free and attached gingiva (keratinised), from the gum margin down to the mucogingival junction
  mucosa - alveolar (lining) mucosa below the mucogingival junction
The hard tissue (bone, teeth, nerve) is not changed. Run it on the original files only once: it skips a file
that already has a gum mesh.

Method: the bone and teeth are voxelised on a 0.4 mm grid (model units), the bone window and the gaps between
teeth are closed (morphological closing), and the soft tissue is the shell of the given thickness outside that
closed surface, between the gum margin and the lower edge of each band. Meshed with marching cubes, smoothed
and simplified.

Scale: the wisdom tooth models are about 1.7 times life size (tools/wisdom-tooth/make_print_zips.py), so every
real size below is multiplied by SCALE.
"""
import json
import os
import sys

import fast_simplification
import numpy as np
import trimesh
from scipy import ndimage
from skimage import measure

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tokens'))
from colours import LINEAR  # noqa: E402

SCALE = 1.7
PITCH = 0.4                      # grid step in model mm (0.24 mm real)
# ---------------------------------------------------------------- cited figures (real mm)
GINGIVA = 0.99      # mean mid-buccal and mid-lingual gingival thickness (ultrasound): Müller et al. 1999 (reference only)
# Gum thickness by tooth, front to back, mandible (ultrasound). Measured: central incisor 0.7 (Müller et al. 2000),
# canine 0.8 and second molar 1.5 (Eger et al. 1996), third molar 2.3 (Müller et al. 2000).
# DRAWN: lateral incisor,
# premolars and first molar are straight-line steps between those measured teeth (no per-tooth value used).
GUM_BY_TOOTH = [0.7, 0.75, 0.8, 0.975, 1.15, 1.325, 1.5, 2.3]   # incisor 1, 2, canine, PM1, PM2, M1, M2, M3
RETROMOLAR_T = 4.0  # retromolar mucosa thickness, "more than 4 mm on average": Müller et al. 2000
SUPRACRESTAL = 0.69 + 0.97 + 1.07  # sulcus + epithelial + connective tissue attachment: Gargiulo et al. 1961
CREST_BELOW_CEJ = 1.5   # healthy alveolar crest below the CEJ, inside 0.4-1.9 mm in health: Hausmann et al. 1991
KTW = 4.59          # mean width of the gum (keratinised gingiva), incisors to first molars: Lee et al. 2018
# Crown length (cusp tip or incisal edge to CEJ), mandibular teeth, front to back: Nelson 2020 (Wheeler's).
CROWN = [9.0, 9.5, 11.0, 8.5, 8.0, 7.5, 7.0]
CROWN_M3 = 7.0      # mandibular third molar crown length: Nelson 2020 (Wheeler's), same as the second molar
# The gum margin follows the CEJ, which curves up between teeth: incisors 2-3 mm, canine 1-2.5 mm, back teeth
# 0-1 mm (Nelson 2020, Wheeler's), so the gum rises into a papilla between neighbouring teeth.
CURVE = [2.5, 2.5, 1.75, 1.0, 1.0, 1.0, 1.0]
CURVE_M3 = 1.0
# ---------------------------------------------------------------- drawn (no measured value used)
MUCOSA = 0.8        # DRAWN: lining mucosa thinner than the gum (Papapetros et al. 2025 found the tissue thins from
                    # the gum towards and past the mucogingival junction, but gave no single mucosa value we can use)
MUCOSA_BAND = 6.0   # DRAWN: how far the lining mucosa runs down the jaw below the gum before the model stops
MARGIN_TAPER = 1.0  # DRAWN: the gum thins to 30% at its margin over its top 1 mm (as /endodontic/)
CLOSE_R = 4.0       # DRAWN (model mm): radius that closes the bone window and gaps so the gum lies smooth
RETROMOLAR = 8.0    # DRAWN: soft tissue continues this far (real mm) behind the last tooth
END_TAPER = 5.0     # DRAWN: and thins to nothing over its last 5 mm (real), so it has no cut edge

# PROVISIONAL finish until the colour check (Gemini brief 2026-11-10; IOP-Compass colour sampling if Luke downloads it)
ROUGH = {'gum': 0.65, 'mucosa': 0.45}
GUM_RGB = LINEAR['model.gum']
MUCOSA_RGB = LINEAR['model.mucosa']


def mm(scene):
    """Meshes by node name, in model millimetres (the GLBs are in metres)."""
    out = {}
    for g in scene.dump(concatenate=False):
        m = g.copy()
        m.apply_scale(1000.0)
        out[g.metadata['name']] = m
    return out


def voxel_wall(meshes, origin, shape):
    """Voxels touched by the surface of any mesh (dense surface samples)."""
    wall = np.zeros(shape, bool)
    for m in meshes:
        n = int(max(2e5, m.area / (PITCH * 0.35) ** 2))
        pts, _ = trimesh.sample.sample_surface(m, n, seed=1)
        pts = np.vstack([pts, m.vertices])
        ijk = np.floor((pts - origin) / PITCH).astype(int)
        ok = np.all((ijk >= 0) & (ijk < np.array(shape)), axis=1)
        ijk = ijk[ok]
        wall[ijk[:, 0], ijk[:, 1], ijk[:, 2]] = True
    return wall


def solid_from_wall(wall):
    """Inside = not reachable from the grid border without crossing the wall."""
    free = ~ndimage.binary_dilation(wall, iterations=1)
    lab, _ = ndimage.label(free)
    border = np.unique(np.concatenate([lab[0].ravel(), lab[-1].ravel(), lab[:, 0].ravel(), lab[:, -1].ravel(),
                                       lab[:, :, 0].ravel(), lab[:, :, -1].ravel()]))
    outside = np.isin(lab, border[border > 0])
    return ~outside


def split_along(m, f):
    """Cut every triangle that the field f (one value per vertex) changes sign across, along f = 0 (as
    tools/endo/build.py), so a colour boundary follows a smooth curve."""
    V, F = m.vertices, m.faces
    s = f >= 0
    cross = np.nonzero(s[F].any(1) & ~s[F].all(1))[0]
    if len(cross) == 0:
        return m
    newv, cache = [], {}

    def pt(a, b):
        k = (a, b) if a < b else (b, a)
        if k not in cache:
            u = f[a] / (f[a] - f[b])
            cache[k] = len(V) + len(newv)
            newv.append(V[a] + (V[b] - V[a]) * u)
        return cache[k]
    tris = []
    for fi in cross:
        a, b, c = F[fi]
        if s[b] != s[a] and s[b] != s[c]:
            a, b, c = b, c, a
        elif s[c] != s[a] and s[c] != s[b]:
            a, b, c = c, a, b
        ab, ac = pt(a, b), pt(a, c)
        tris += [(a, ab, ac), (ab, b, c), (ab, c, ac)]
    keep = np.ones(len(F), bool)
    keep[cross] = False
    return trimesh.Trimesh(np.vstack([V, newv]), np.vstack([F[keep], tris]), process=False)


def ball(r):
    n = int(np.ceil(r / PITCH))
    g = np.mgrid[-n:n + 1, -n:n + 1, -n:n + 1] * PITCH
    return (g ** 2).sum(0) <= r * r


def build(path):
    scene = trimesh.load(path)
    names = [g.metadata['name'] for g in scene.dump(concatenate=False)]
    if any(n in ('gum', 'mucosa') for n in names):
        print(path, 'already has soft tissue, skipped')
        return None
    M = mm(scene)
    teeth = sorted(M['model.021_1'].split(only_watertight=False), key=lambda c: -c.centroid[2])
    wisdom = [m for n, m in M.items() if n.startswith('wisdom tooth')][0]
    bone = [m for n, m in M.items() if m.visual.material.name == 'bone']

    # Gum margin per tooth: CEJ = crown top - crown length; margin = CEJ - crest depth + supracrestal tissue.
    rise = (SUPRACRESTAL - CREST_BELOW_CEJ) * SCALE
    tooth_list = [(t, CROWN[i]) for i, t in enumerate(teeth)] + [(wisdom, CROWN_M3)]
    curves = CURVE[:len(teeth)] + [CURVE_M3]
    gums = GUM_BY_TOOTH[:len(teeth)] + [GUM_BY_TOOTH[-1]]
    margins = []
    for t, crown in tooth_list:
        top = t.vertices[:, 1].max()
        margins.append(top - crown * SCALE + rise)

    allteeth = trimesh.util.concatenate([t for t, _ in tooth_list])
    lo = allteeth.bounds[0] - [14, 0, 0]
    hi = allteeth.bounds[1] + [14, 0, 6]
    lo[1] = min(margins) - (KTW + MUCOSA_BAND) * SCALE - 6
    hi[1] = max(t.vertices[:, 1].max() for t, _ in tooth_list) + 2
    back = min(t.bounds[0][2] for t, _ in tooth_list) - RETROMOLAR * SCALE
    lo[2] = back - 6
    origin = lo
    shape = tuple(np.ceil((hi - lo) / PITCH).astype(int) + 1)
    print(path, 'grid', shape)

    wall = voxel_wall(bone + [t for t, _ in tooth_list], origin, shape)
    solid = solid_from_wall(wall) | wall
    solid = ndimage.binary_closing(np.pad(solid, 12), structure=ball(CLOSE_R))[12:-12, 12:-12, 12:-12]
    dist = ndimage.distance_transform_edt(~solid) * PITCH   # model mm outside the closed hard tissue

    # Margin height field: each column takes the margin of the nearest tooth crown (horizontal distance), smoothed.
    X = origin[0] + np.arange(shape[0]) * PITCH
    Z = origin[2] + np.arange(shape[2]) * PITCH
    XX, ZZ = np.meshgrid(X, Z, indexing='ij')
    from scipy.spatial import cKDTree
    D = []
    for t, _ in tooth_list:
        v = t.vertices[::3]
        d, _ = cKDTree(v[:, [0, 2]]).query(np.c_[XX.ravel(), ZZ.ravel()], workers=-1)
        D.append(d.reshape(XX.shape))
    D = np.array(D)
    order = np.argsort(D, axis=0)
    first, second = order[0], order[1]
    d1 = np.take_along_axis(D, first[None], 0)[0]
    d2 = np.take_along_axis(D, second[None], 0)[0]
    margin = np.array(margins)[first]
    gum_mm = ndimage.gaussian_filter(np.array(gums)[first], 3.0 / PITCH)
    # Papilla: where two teeth are about equally near (between them), the margin rises by the CEJ curvature.
    between = np.clip(1 - (d2 - d1) / (3.0 * SCALE), 0, 1) * np.exp(-d1 / (4.0 * SCALE))
    margin = margin + between * np.minimum(np.array(curves)[first], np.array(curves)[second]) * SCALE
    margin = ndimage.gaussian_filter(margin, 1.2 / PITCH)
    Y = origin[1] + np.arange(shape[1]) * PITCH
    H = margin[:, None, :] - Y[None, :, None]          # model mm below the gum margin (positive = below)
    zmask = (Z >= back)[None, None, :]

    end = np.clip((Z - back) / (END_TAPER * SCALE), 0, 1)[None, None, :]
    # One continuous soft tissue sheet: gum thickness down to the mucogingival junction, easing to the thinner
    # lining mucosa over 1 mm (real). It is meshed once, then each face is coloured by which band it lies in,
    # so gum and mucosa meet without a gap or step.
    # Behind the last tooth the gum thickens towards the retromolar pad.
    last = min(t.bounds[0][2] for t, _ in tooth_list)
    pad = np.clip((last - Z) / (RETROMOLAR * SCALE * 0.6), 0, 1)[None, :]
    gum_mm = gum_mm * (1 - pad) + RETROMOLAR_T * pad
    gum_t = gum_mm[:, None, :] * SCALE * np.clip(0.3 + 0.7 * H / (MARGIN_TAPER * SCALE), 0.3, 1.0)
    k = np.clip((H - KTW * SCALE) / (1.0 * SCALE), 0, 1)
    thick = (gum_t * (1 - k) + MUCOSA * SCALE * k) * end
    vox = (dist > 0) & (dist <= thick) & (H >= 0) & (H <= (KTW + MUCOSA_BAND) * SCALE) & zmask
    # Keep only the part touching the jaw (drop stray bits from the grid edges).
    lab, n = ndimage.label(vox)
    if n > 1:
        sizes = ndimage.sum(vox, lab, range(1, n + 1))
        vox = np.isin(lab, 1 + np.nonzero(sizes > 0.02 * sizes.max())[0])
    f = ndimage.gaussian_filter(vox.astype(np.float32), 1.1)
    v, fc, _, _ = measure.marching_cubes(np.pad(f, 1), 0.5, spacing=(PITCH,) * 3)
    m = trimesh.Trimesh(v - PITCH + origin, fc, process=True)
    trimesh.smoothing.filter_taubin(m, iterations=30)
    target = 1 - min(1.0, 45000 / max(1, len(m.faces)))
    if target > 0:
        vv, ff = fast_simplification.simplify(m.vertices.astype(np.float32), m.faces.astype(np.int32), target)
        m = trimesh.Trimesh(vv, ff, process=True)
    m.fix_normals()
    # Colour boundary (mucogingival junction): cut the triangles along it so it is a smooth line, not a
    # saw-tooth of whole triangles, then colour each face by the band it lies in.
    def band(p):
        mg = ndimage.map_coordinates(margin, ((p[:, 0] - origin[0]) / PITCH, (p[:, 2] - origin[2]) / PITCH), order=1, mode='nearest')
        return (mg - p[:, 1]) - KTW * SCALE
    m = split_along(m, band(m.vertices))
    is_gum = band(m.triangles_center) <= 0
    out = {}
    for name, sel, rgb in (('gum', is_gum, GUM_RGB), ('mucosa', ~is_gum, MUCOSA_RGB)):
        part = m.submesh([np.nonzero(sel)[0]], append=True)
        out[name] = (part, rgb)
        print(' ', name, len(part.faces), 'faces')
    return scene, out


def save(path, layers):
    """Write the layers to a temporary GLB and add them to the original with tools/glb/add-meshes.mjs, so the
    original nodes, meshes and materials are kept exactly."""
    import subprocess
    import tempfile
    scene = trimesh.Scene()
    for name, (m, rgb) in layers.items():
        mat = trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=[*rgb, 1.0], metallicFactor=0.0,
                                                  roughnessFactor=ROUGH[name], doubleSided=True)
        m = m.copy()
        m.apply_scale(0.001)
        m.visual = trimesh.visual.TextureVisuals(material=mat)
        scene.add_geometry(m, node_name=name, geom_name=name)
    with tempfile.TemporaryDirectory() as tmp:
        soft = os.path.join(tmp, 'soft.glb')
        scene.export(soft)
        root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
        subprocess.run(['node', os.path.join(root, 'tools', 'glb', 'add-meshes.mjs'), path, soft, '--out', path], check=True)


if __name__ == '__main__':
    report = {'scale': SCALE, 'gum_by_tooth_mm': GUM_BY_TOOTH, 'retromolar_mm': RETROMOLAR_T, 'supracrestal_mm': SUPRACRESTAL, 'ktw_mm': KTW,
              'mucosa_mm_drawn': MUCOSA, 'mucosa_band_mm_drawn': MUCOSA_BAND}
    for p in sys.argv[1:]:
        r = build(p)
        if r:
            save(p, r[1])
    print(json.dumps(report))
