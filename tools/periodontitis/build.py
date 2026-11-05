"""Build the periodontitis series: healthy, Stage I-IV lower jaws (see tools/periodontitis/README.md)."""
import json, sys
from pathlib import Path
import numpy as np, trimesh
from scipy import ndimage as nd
from skimage import measure
import fast_simplification as fs

SRC = Path(sys.argv[1]); OUT = Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
STAGES = json.load(open(Path(__file__).with_name('stages.json')))
T = np.load(SRC / 'teeth.npz'); V = np.load(SRC / 'bone_vox.npz')
BONE0 = V['m']; A = V['T']; P = float(A[0, 0]); O = A[:3, 3]
NX, NY, NZ = BONE0.shape
GX = O[0] + P * np.arange(NX); GY = O[1] + P * np.arange(NY); GZ = O[2] + P * np.arange(NZ)
XX, YY = np.meshgrid(GX, GY, indexing='ij')

# Wheeler's Dental Anatomy (Nelson 2020), mandibular teeth: crown length and overall length (mm).
WHEELER = {'1': (9.0, 21.5), '2': (9.5, 23.5), '3': (11.0, 27.0), '4': (8.5, 22.5), '5': (8.0, 22.5), '6': (7.5, 21.5), '7': (7.0, 20.0)}
HEALTHY_GAP = 1.5  # mm from CEJ to bone crest in health

KEYS = [s + str(i) for s in '43' for i in range(1, 8)]
teeth = {}
for k in KEYS:
    m = trimesh.Trimesh(T[k + '_v'], T[k + '_f'])
    vv, ff = fs.simplify(m.vertices.astype(np.float32), m.faces.astype(np.int32), target_reduction=0.55)
    m = trimesh.Trimesh(vv, ff, process=True); trimesh.repair.fix_normals(m)
    v = m.vertices; tip = v[:, 2].max(); apex = v[:, 2].min(); L = tip - apex
    crown, total = WHEELER[k[1]]
    cej = tip - crown * L / total
    band = v[np.abs(v[:, 2] - cej) < 1.0]
    c = band[:, :2].mean(0); ext = band[:, :2].max(0) - band[:, :2].min(0)
    teeth[k] = dict(mesh=m, tip=tip, apex=apex, cej=cej, root=cej - apex, c=c, r0=ext.max() / 2 + 3.5)

def tooth_mask(m):
    tv = m.voxelized(P); tm = nd.binary_fill_holes(tv.matrix)
    pts = np.argwhere(tm) * P + tv.transform[:3, 3]
    bi = np.round((pts - O) / P).astype(int); bi = bi[np.all((bi >= 0) & (bi < BONE0.shape), 1)]
    g = np.zeros(BONE0.shape, bool); g[tuple(bi.T)] = True
    return g

def ramp(d, r0):
    e = np.maximum(d - r0, 0); return 1.2 * e * e

def crest_map(st):
    """Bone crest height (z, mm) over the grid: the lowest of each tooth's crest, rising away from the teeth."""
    crest = np.full(XX.shape, 1e9)
    for k, t in teeth.items():
        f = st['loss'].get(k[1], st['loss']['default']) if isinstance(st['loss'], dict) else st['loss']
        z = t['cej'] - HEALTHY_GAP - f * (t['root'] - HEALTHY_GAP)
        dx, dy = XX - t['c'][0], YY - t['c'][1]
        if k[1] == '7':  # behind the last molar the ramus rises: keep the cut out of it
            u = t['c'] - teeth[k[0] + '6']['c']; u /= np.linalg.norm(u)
            a = dx * u[0] + dy * u[1]; b = -dx * u[1] + dy * u[0]
            d = np.hypot(np.where(a > 0, a * 2.5, a), b)
        else:
            d = np.hypot(dx, dy)
        crest = np.minimum(crest, z + ramp(d, t['r0']))
    # smooth the steps where neighbouring teeth have their CEJ at different heights (sigma 1.5 mm)
    crest = nd.gaussian_filter(np.minimum(crest, GZ[-1] + 5), 1.5 / P)
    crest = scallop(crest)
    for df in st.get('defects', []):  # vertical (angular) defects beside a root
        t = teeth[df['tooth']]; nb = teeth[df['toward']]
        u = nb['c'] - t['c']; u /= np.linalg.norm(u)
        p = t['c'] + u * df['offset']
        f = st['loss'].get(df['tooth'][1], st['loss']['default'])
        z = t['cej'] - HEALTHY_GAP - f * (t['root'] - HEALTHY_GAP) - df['extra']
        d = np.hypot(XX - p[0], YY - p[1])
        crest = np.minimum(crest, z + 2.0 * np.maximum(d - df['radius'], 0) ** 2)
    return crest

# Wheeler: curvature of the cervical line (CEJ) on the mesial and distal sides of mandibular teeth (mm).
# Between teeth the CEJ, and so the bone crest, sits higher than on the cheek and tongue sides.
CEJ_CURVE = {'1': (3.0, 2.0), '2': (3.0, 2.0), '3': (2.5, 1.0), '4': (1.0, 0.0), '5': (1.0, 0.0), '6': (1.0, 0.0), '7': (1.0, 0.0)}
CONTACTS = []
for s in '43':
    for i in range(1, 7):
        a, b = teeth[s + str(i)], teeth[s + str(i + 1)]
        CONTACTS.append(((a['c'] + b['c']) / 2, (CEJ_CURVE[str(i)][1] + CEJ_CURVE[str(i + 1)][0]) / 2))
CONTACTS.append(((teeth['41']['c'] + teeth['31']['c']) / 2, CEJ_CURVE['1'][0]))

def scallop(crest):
    bump = np.zeros(XX.shape)
    for p, a in CONTACTS:
        bump = np.maximum(bump, a * np.exp(-((XX - p[0]) ** 2 + (YY - p[1]) ** 2) / 1.8 ** 2))
    return crest + bump

def apply_crest(bone, crest):
    return bone & (GZ[None, None, :] <= crest[:, :, None])

def mesh_from(mask, faces, sigma=1.5, step=1):
    f = nd.gaussian_filter(mask.astype(np.float32), sigma)
    v, fc, _, _ = measure.marching_cubes(np.pad(f, 1), 0.5, step_size=step)
    v = (v - 1) * P + O
    m = trimesh.Trimesh(v, fc[:, ::-1], process=True)
    v0 = m.vertices.copy()
    trimesh.smoothing.filter_taubin(m, iterations=30)
    far = np.linalg.norm(m.vertices - v0, axis=1) > 1.0  # Taubin can fling a degenerate vertex: put it back
    if far.any(): v = m.vertices.copy(); v[far] = v0[far]; m.vertices = v; print('  restored', int(far.sum()))
    print('  faces', len(m.faces), m.is_watertight)
    keep = [c for c in m.split(only_watertight=False) if abs(c.volume) > 2.0]
    m = trimesh.util.concatenate(keep)
    trimesh.repair.fix_normals(m)
    return m

TM = {k: tooth_mask(t['mesh']) for k, t in teeth.items()}
ALLT = np.zeros(BONE0.shape, bool)
for g in TM.values(): ALLT |= g

def to_gltf(m):  # Z-Anatomy mm, Z up, front -Y  ->  glTF metres, Y up, front +Z
    m = m.copy(); v = m.vertices - CENTER
    m.vertices = np.c_[v[:, 0], v[:, 2], -v[:, 1]] / 1000; return m

healthy = apply_crest(BONE0, crest_map(STAGES[0]))
CENTER = np.array([0, (O[1] + NY * P / 2), O[2] + NZ * P / 2])
report = {}
for st in STAGES:
    bone = BONE0.copy()
    missing = set(st.get('missing', []))
    for k in missing:  # healed sockets: fill the socket with bone
        bone |= nd.binary_dilation(TM[k], iterations=2) & (GZ[None, None, :] < teeth[k]['cej'] - 3)
    bone = apply_crest(bone, crest_map(st))
    if missing:  # ridge lowers where teeth were lost
        for k in missing:
            t = teeth[k]; d = np.hypot(XX - t['c'][0], YY - t['c'][1])
            f = st['loss']['default']
            z = t['cej'] - HEALTHY_GAP - f * (t['root'] - HEALTHY_GAP) - st.get('ridge_extra', 0) * np.clip(1 - d / t['r0'], 0, 1)
            bone &= GZ[None, None, :] <= np.maximum(z, -1e9)[:, :, None] + (d[:, :, None] > t['r0']) * 1e9
    parts = {'bone': mesh_from(bone, 70000)}
    present = np.zeros(BONE0.shape, bool)
    for k, g in TM.items():
        if k not in missing: present |= g
    lost = healthy & ~bone & ~present
    lost = nd.binary_opening(lost, iterations=1)
    if lost.sum() > 200: parts['lost'] = mesh_from(lost, 30000, sigma=1.0, step=2)
    tl = []
    for k, t in teeth.items():
        if k in missing: continue
        m = t['mesh'].copy()
        tilt = st.get('tilt', {}).get(k)
        if tilt:  # tip the crown toward the front (mesial drift into a gap)
            R = trimesh.transformations.rotation_matrix(np.radians(tilt), [1, 0, 0], [t['c'][0], t['c'][1], t['apex']])
            m.apply_transform(R)
        tl.append(m)
    parts['teeth'] = trimesh.util.concatenate(tl)
    name = st['id']
    sc = trimesh.Scene()
    for k, m in parts.items():
        g = to_gltf(m)
        g.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(name=k, baseColorFactor=[200, 200, 200, 255], roughnessFactor=0.7, metallicFactor=0.0))
        sc.add_geometry(g, node_name=k, geom_name=k)
    sc.export(OUT / f'{name}.glb')
    stl = OUT / 'stl' / name; stl.mkdir(parents=True, exist_ok=True)
    parts['bone'].export(stl / f'{name}-bone.stl'); parts['teeth'].export(stl / f'{name}-teeth.stl')
    report[name] = {k: len(m.faces) for k, m in parts.items()}
    report[name]['lost_bone_cm3'] = round(float(lost.sum()) * P ** 3 / 1000, 2)
    print(name, report[name], flush=True)
json.dump({'teeth': {k: {x: round(float(t[x]), 2) for x in ('tip', 'apex', 'cej', 'root')} for k, t in teeth.items()}, 'stages': report}, open(OUT / 'build_report.json', 'w'), indent=1)
