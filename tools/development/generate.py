"""Generate the dental development series (right side, ages 6.5 to 12.5).

Inputs (made from Z-Anatomy, CC BY-SA 4.0, by extract.py and prep_bone.py):
  parts.npz    right-side permanent teeth 1-7, upper and lower (metres, Z-Anatomy world space)
  bone_mm.npz  mandible, right maxilla, right palatine bone (watertight, millimetres)
Timing: timings.csv (typical ages; see its header). Jaw size: jaw_growth.csv.

Method, per stage age:
  - Permanent teeth: crown grows from the cusp tip down; then the root grows to full length.
    Before emerging, each tooth sits deeper along its long axis and rises over time.
  - Third molars: made from the second molar, scaled 0.9, placed behind it.
  - Baby teeth: made from the permanent teeth (incisors and canine from their successors, both
    baby molars from the permanent first molar), scaled to typical baby tooth widths and set side
    by side along the arch from the midline to the first permanent molar. Their roots shorten over
    the 3 years before they fall out.
  - Child jaw: shrunk to average child/adult ratios of ramus height and body length for each age
    (jaw_growth.csv: Riolo 1974 Michigan atlas, West and McNamara 1999 adults). The ramus is lowered and
    the part behind the first molar shortened front-to-back. Second and third molars move with it.
  - Cutaway: the cheek-side half of the bone around the teeth is removed, as in the classic chart.
Outputs per stage: GLB (web, metres, Y up, front +Z) and STL per print part (mm).
"""
import csv, json, sys
from pathlib import Path
import numpy as np, trimesh, manifold3d as mf
from shapely.geometry import Polygon

HERE = Path(__file__).resolve().parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/home/claude/work/za')
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / 'out'
AGES = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5]

# Colours: bone matches the wisdom tooth model (linear RGB, roughness 0.7). Adult teeth yellow and
# baby teeth blue, as on the Schour-Massler chart (Luke, 5 November 2026).
COL = {'bone': [0.6724, 0.5972, 0.4969, 1], 'adult': [0.768, 0.624, 0.102, 1], 'baby': [0.1, 0.22, 0.62, 1]}
CROWN_FRAC = {'I1': .42, 'I2': .42, 'C': .38, 'PM1': .40, 'PM2': .40, 'M1': .38, 'M2': .38, 'M3': .38}

def load_timings():
    rows = [r for r in csv.reader(l for l in open(HERE / 'timings.csv') if not l.startswith('#'))]
    head, rows = rows[0], rows[1:]
    t = {}
    for r in rows:
        d = dict(zip(head, r))
        t[(d['jaw'], d['tooth'])] = {k: float(v) for k, v in d.items() if k in ('ci', 'cc', 'e', 'rc', 'shed') and v}
    return t

P = np.load(SRC / 'parts.npz'); B = np.load(SRC / 'bone_mm.npz')
def tooth_mesh(jaw, t):
    return trimesh.Trimesh(P[f'{jaw}_{t}_v'] * 1000, P[f'{jaw}_{t}_f'], process=True)

def axis_of(m, jaw):
    """Long axis (unit, root tip -> crown tip), crown tip point, root tip point, length.
    Taken from the ends of the tooth in the up-down direction, so wide molars get an upright axis."""
    v = m.vertices; z = v[:, 2] if jaw == 'lower' else -v[:, 2]  # larger z = towards the biting surface
    lo, hi = np.quantile(z, [0.12, 0.88])
    a = v[z >= hi].mean(0) - v[z <= lo].mean(0); a /= np.linalg.norm(a)
    s = v @ a; c = v.mean(0)
    return a, c + a * (s.max() - c @ a), c + a * (s.min() - c @ a), s.max() - s.min()

def clip(m, origin, normal):
    """Keep the part of m on the side normal points to, capped (watertight)."""
    M = mf.Manifold(mf.Mesh(m.vertices.astype(np.float32), m.faces.astype(np.uint32)))
    n = np.asarray(normal, float); n /= np.linalg.norm(n)
    K = M.trim_by_plane(n.tolist(), float(n @ origin))
    mm = K.to_mesh()
    return trimesh.Trimesh(mm.vert_properties[:, :3], mm.tri_verts) if mm.tri_verts.size else None

def to_manifold(m):
    return mf.Manifold(mf.Mesh(np.asarray(m.vertices, np.float32), np.asarray(m.faces, np.uint32)))

def from_manifold(M):
    mm = M.to_mesh(); return trimesh.Trimesh(mm.vert_properties[:, :3], mm.tri_verts)

def rot_z(theta, about):
    T = trimesh.transformations.rotation_matrix(theta, [0, 0, 1], about); return T

def lerp(a, b, t):
    return a + (b - a) * min(max(t, 0), 1)

T = load_timings()
PERM = ['I1', 'I2', 'C', 'PM1', 'PM2', 'M1', 'M2']
base = {}
for jaw in ('upper', 'lower'):
    for t in PERM:
        m = tooth_mesh(jaw, t); a, tip, apex, L = axis_of(m, jaw)
        base[(jaw, t)] = dict(mesh=m, axis=a, tip=tip, L=L)
    # third molar: second molar scaled 0.9 about its tip, moved distally by its own length along the arch
    m2 = base[(jaw, 'M2')]; m1 = base[(jaw, 'M1')]
    d = m2['mesh'].centroid - m1['mesh'].centroid; d[2] = 0; step = np.linalg.norm(d) * 0.95
    m3 = m2['mesh'].copy(); m3.apply_transform(trimesh.transformations.scale_matrix(0.9, m2['tip']))
    m3.apply_translation(d / np.linalg.norm(d) * step)
    a, tip, apex, L = axis_of(m3, jaw); base[(jaw, 'M3')] = dict(mesh=m3, axis=a, tip=tip, L=L)

OCC = {j: np.mean([base[(j, t)]['tip'][2] for t in PERM]) for j in ('upper', 'lower')}
PIVOT_Y = max(base[('lower', 'M1')]['mesh'].bounds[1][1], base[('upper', 'M1')]['mesh'].bounds[1][1])  # distal edge of first molars

def load_growth():
    """Child/adult ratios of ramus height and body length at each stage age, boys and girls averaged."""
    rows = list(csv.DictReader(l for l in open(HERE / 'jaw_growth.csv') if not l.startswith('#')))
    adult = next(r for r in rows if r['age'] == 'adult'); kids = {float(r['age']): r for r in rows if r['age'] != 'adult'}
    enl = 1.08 / 1.1292  # Riolo films (12.92% enlargement) -> West and McNamara adult values (8%)
    def ratio(age, key):
        lo, hi = kids[np.floor(age)], kids[np.ceil(age)]  # half-year stages: mean of the two neighbouring years
        return np.mean([(float(lo[f'{key}_{s}']) + float(hi[f'{key}_{s}'])) / 2 * enl / float(adult[f'{key}_{s}'])
                        for s in 'mf'])
    return {a: (ratio(a, 'go_pg'), ratio(a, 'co_go')) for a in AGES}
GROWTH = load_growth()

# Landmarks on the adult (Z-Anatomy) mandible, measured side-on (y-z) like a cephalogram.
_mv = B['mandible_v']; _r = _mv[_mv[:, 0] <= 0]
_mid = _mv[np.abs(_mv[:, 0]) < 2]; POGONION = _mid[np.argmin(_mid[:, 1])]
GONION = _r[np.argmax(_r[:, 1] - _r[:, 2])]                      # furthest back-and-down point of the angle
_post = _r[_r[:, 1] > _r[:, 1].max() - 15]; CONDYLION = _post[np.argmax(_post[:, 2])]
side = lambda a, b: float(np.linalg.norm(np.asarray(a)[1:] - np.asarray(b)[1:]))
ADULT_GO_PG = side(GONION, POGONION)

def grow(age):
    """Child shape factors: front-to-back scale behind the first molar (kp) and ramus height scale (kr).
    Body length: the whole shortfall from adult gonion-pogonion length is taken from behind the first molar,
    where the mandible lengthens in childhood (the front of the ramus resorbs as the retromolar space grows).
    Ramus height: scaled to the child/adult condylion-gonion ratio."""
    rb, rr = GROWTH[age]
    kp = 1 - (1 - rb) * ADULT_GO_PG / (GONION[1] - PIVOT_Y)
    return kp, rr

def deform_points(p, age, jaw):
    kp, kr = grow(age); p = np.array(p, float)
    behind = p[..., 1] - PIVOT_Y
    w = np.clip(behind / 12.0, 0, 1)  # blend in over 12 mm behind the first molars
    w = w * w * (3 - 2 * w)
    p[..., 1] = np.where(behind > 0, PIVOT_Y + behind * kp, p[..., 1])
    if jaw == 'lower':
        z0 = OCC['lower']
        p[..., 2] = z0 + (p[..., 2] - z0) * (1 - (1 - kr) * w)
    return p

def eruption_offset(age, e):
    """How far (mm) the tooth sits below its final place, along its long axis."""
    if age >= e + 1.5: return 0.0
    if age >= e: return lerp(7.0, 0.0, (age - e) / 1.5)
    return min(7.0 + (e - age) * 3.0, 20.0)

def perm_tooth(jaw, t, age):
    tm = T[(jaw, t)]; b = base[(jaw, t)]
    if age < tm['ci']: return None
    a, tip, L = b['axis'], b['tip'], b['L']
    crown = CROWN_FRAC[t] * L
    if age < tm['cc']: keep = crown * max((age - tm['ci']) / (tm['cc'] - tm['ci']), 0.12)
    elif age < tm['rc']: keep = crown + (L - crown) * (age - tm['cc']) / (tm['rc'] - tm['cc'])
    else: keep = L + 1
    m = b['mesh'] if keep > L else clip(b['mesh'], tip - a * keep, a)
    if m is None: return None
    m = m.copy(); m.apply_translation(-a * eruption_offset(age, tm['e']))
    if t in ('M2', 'M3'):  # rides with the growing back of the jaw
        c = m.centroid; m.apply_translation(deform_points(c, age, jaw) - c)
    return m

def arch(jaw):
    """Arch line through the permanent tooth centres at occlusal level, starting at the midline."""
    pts = [base[(jaw, t)]['mesh'].centroid[:2] for t in PERM]
    pts = [np.array([0.0, pts[0][1] - 1.0])] + pts
    pts = np.array(pts); seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    return pts, np.concatenate([[0], np.cumsum(seg)])

def at_arc(jaw, s):
    pts, cum = arch(jaw); i = min(np.searchsorted(cum, s) - 1, len(pts) - 2); i = max(i, 0)
    f = (s - cum[i]) / (cum[i + 1] - cum[i]); p = pts[i] + (pts[i + 1] - pts[i]) * f
    d = pts[i + 1] - pts[i]; return p, np.arctan2(d[1], d[0])

def arc_of(jaw, p):
    pts, cum = arch(jaw); best = (1e9, 0, 0)
    for i in range(len(pts) - 1):
        d = pts[i + 1] - pts[i]; f = np.clip((p - pts[i]) @ d / (d @ d), 0, 1)
        q = pts[i] + d * f; dist = np.linalg.norm(p - q)
        if dist < best[0]: best = (dist, cum[i] + f * np.linalg.norm(d), np.arctan2(d[1], d[0]))
    return best[1], best[2]

BABY = [('i1', 'I1'), ('i2', 'I2'), ('c', 'C'), ('m1', 'M1'), ('m2', 'M1')]
SLOT = {'i1': 'I1', 'i2': 'I2', 'c': 'C', 'm1': 'PM1', 'm2': 'PM2'}  # the permanent tooth that replaces each baby tooth
# Typical baby tooth crown widths front-to-back along the arch (mm; Wheeler's dental anatomy averages).
BABY_MD = {'upper': {'i1': 6.5, 'i2': 5.1, 'c': 7.0, 'm1': 7.3, 'm2': 8.2},
           'lower': {'i1': 4.2, 'i2': 4.7, 'c': 5.8, 'm1': 7.7, 'm2': 9.9}}
# Typical overall baby tooth lengths, crown tip to root tip (mm; same source).
BABY_LEN = {'upper': {'i1': 16.0, 'i2': 15.8, 'c': 19.0, 'm1': 15.2, 'm2': 17.5},
            'lower': {'i1': 14.0, 'i2': 15.0, 'c': 17.5, 'm1': 15.8, 'm2': 18.8}}
baby_base = {}
for jaw in ('upper', 'lower'):
    # Fill the arch from the midline to the front of the first permanent molar, spaces shared out evenly.
    m1 = base[(jaw, 'M1')]; s1, th = arc_of(jaw, m1['mesh'].centroid[:2])
    m1_front = s1 - np.ptp(m1['mesh'].vertices @ np.array([np.cos(th), np.sin(th), 0])) / 2
    gap = max(m1_front - sum(BABY_MD[jaw].values()), 0) / len(BABY)
    s = 0.0; ks = {}
    for name, src in BABY:
        b = base[(jaw, src)]; m = b['mesh'].copy()
        s0, th0 = arc_of(jaw, m.centroid[:2])
        dirv = np.array([np.cos(th0), np.sin(th0), 0])
        k = BABY_MD[jaw][name] / np.ptp(m.vertices @ dirv)  # scale the permanent tooth to the baby tooth's width
        kh = BABY_LEN[jaw][name] / b['L']  # and to the baby tooth's length along its long axis
        S = np.eye(4); S[:3, :3] = k * np.eye(3) + (kh - k) * np.outer(b['axis'], b['axis'])
        S[:3, 3] = b['tip'] - S[:3, :3] @ b['tip']
        m.apply_transform(S)
        w = BABY_MD[jaw][name]
        target, th1 = at_arc(jaw, s + gap / 2 + w / 2); s += w + gap
        z = m.centroid[2]
        m.apply_translation(-m.centroid); m.apply_transform(rot_z(th1 - th0, [0, 0, 0]))
        m.apply_translation([target[0], target[1], z])
        a, tip, apex, L = axis_of(m, jaw)
        # crown tip at the biting level of the permanent tooth that later takes its place
        dz = base[(jaw, SLOT[name])]['tip'][2] - tip[2]
        m.apply_translation([0, 0, dz]); tip = tip + [0, 0, dz]
        baby_base[(jaw, name)] = dict(mesh=m, axis=a, tip=tip, L=L, crown=CROWN_FRAC[src] * L); ks[name] = round(float(k), 2)
    print(jaw, 'baby scales', ks, 'space per tooth', round(gap, 2), 'mm')

def baby_tooth(jaw, name, age):
    shed = T[(jaw, name)]['shed']
    if age >= shed: return None
    b = baby_base[(jaw, name)]
    if age <= shed - 3: return b['mesh']
    root = b['L'] - b['crown']; keep = b['crown'] + root * (shed - age) / 3.0
    return clip(b['mesh'], b['tip'] - b['axis'] * keep, b['axis'])

def bone(jaw, age):
    if jaw == 'lower':
        m = trimesh.Trimesh(B['mandible_v'], B['mandible_f'], process=False)
    else:
        m = trimesh.util.concatenate([trimesh.Trimesh(B['maxilla_v'], B['maxilla_f'], process=False),
                                      trimesh.Trimesh(B['palatine_v'], B['palatine_f'], process=False)])
    v = deform_points(m.vertices, age, jaw)
    M = to_manifold(trimesh.Trimesh(v, m.faces, process=False))
    if jaw == 'lower':
        M = M.trim_by_plane([-1, 0, 0], -0.0)  # keep the right half (x <= 0)
    # cutaway: remove the cheek-side half of the bone over the teeth, from the midline to behind the third molar
    pts, _ = arch(jaw)
    m3 = deform_points(base[(jaw, 'M3')]['mesh'].centroid, age, jaw)[:2]
    line = np.vstack([pts, m3])
    nrm = []
    for i in range(len(line)):
        d = line[min(i + 1, len(line) - 1)] - line[max(i - 1, 0)]; n = np.array([d[1], -d[0]]); n /= np.linalg.norm(n)
        centre = np.array([0.0, base[(jaw, 'M1')]['mesh'].centroid[1]])
        if n @ (line[i] - centre) < 0: n = -n  # point outwards, to the cheek and lips
        nrm.append(n)
    nrm = np.array(nrm)
    outer = line + nrm * 30
    poly = Polygon(np.vstack([line + nrm * 1.5, outer[::-1]])).buffer(0)  # leave 1.5 mm of bone on the cheek side of the tooth centres
    if jaw == 'lower':
        z0, z1 = OCC['lower'] - 40, OCC['lower'] + 12
        floor = B['mandible_v'][:, 2].min()
        z0 = max(z0, floor + 7)  # keep the lower border of the jaw
    else:
        z0, z1 = OCC['upper'] - 12, OCC['upper'] + 26
    cut = trimesh.creation.extrude_polygon(poly, z1 - z0); cut.apply_translation([0, 0, z0])
    M = M - to_manifold(cut)
    return from_manifold(M)

def anchor(m, bone_m, jaw, others):
    """Printing needs every tooth joined to something. If a tooth barely touches the bone, nudge it
    towards the tongue side (at most 3 mm), then deeper into the jaw (at most 4 mm), until it sits in
    bone or touches a neighbour. Returns the moved tooth and the move, or None if nothing worked."""
    centre = np.array([0.0, base[(jaw, 'M1')]['mesh'].centroid[1], m.centroid[2]])
    inward = centre - m.centroid; inward[2] = 0; inward /= np.linalg.norm(inward)
    up = np.array([0, 0, -1.0 if jaw == 'lower' else 1.0])
    for deep in np.arange(0, 4.01, 1.0):
        for step in np.arange(0, 3.01, 0.5):
            k = m.copy(); k.apply_translation(inward * step + up * deep); K = to_manifold(k)
            if (K ^ bone_m).volume() >= 2.0 or any((K ^ o).volume() >= 2.0 for o in others):
                return k, (step, deep)
    return m, None

LOG = []
def stage(age):
    parts = {}
    for jaw in ('upper', 'lower'):
        b = bone(jaw, age); bm = to_manifold(b)
        adult = [x for t in PERM + ['M3'] if (x := perm_tooth(jaw, t, age)) is not None]
        baby = []
        for n, _ in BABY:
            x = baby_tooth(jaw, n, age)
            if x is None: continue
            others = [to_manifold(o) for o in adult + baby]
            x, step = anchor(x, bm, jaw, others)
            if step and any(step): LOG.append(f'{age} {jaw} {n}: moved {step[0]} mm towards the tongue and {step[1]} mm deeper to join the bone')
            if step is None: LOG.append(f'{age} {jaw} {n}: NOT joined to bone or teeth (check before printing)')
            baby.append(x)
        parts[f'{jaw}-bone'] = b
        parts[f'{jaw}-adult-teeth'] = trimesh.util.concatenate(adult)
        if baby: parts[f'{jaw}-baby-teeth'] = trimesh.util.concatenate(baby)
    return parts

def to_web(m):
    """mm, z up, front -y  ->  metres, y up, front +z."""
    m = m.copy(); v = m.vertices.copy()
    m.vertices = np.column_stack([v[:, 0], v[:, 2], -v[:, 1]]) / 1000.0
    return m

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    centre = None
    summary = {}
    for age in AGES:
        kp, kr = grow(age); rb, rr = GROWTH[age]
        co, go, pg = (deform_points(x, age, 'lower') for x in (CONDYLION, GONION, POGONION))
        LOG.append(f'{age}: target body {rb:.3f} ramus {rr:.3f}; kp {kp:.3f} kr {kr:.3f}; model gives body '
                   f'{side(go, pg) / ADULT_GO_PG:.3f} ramus {side(co, go) / side(CONDYLION, GONION):.3f}')
        parts = stage(age)
        if centre is None:
            allv = np.vstack([p.vertices for p in parts.values()]); centre = (allv.min(0) + allv.max(0)) / 2
        tag = f'age-{str(age).replace(".", "-")}'
        scene = trimesh.Scene()
        for name, m in parts.items():
            m = m.copy(); m.apply_translation(-centre)
            kind = 'bone' if 'bone' in name else ('baby' if 'baby' in name else 'adult')
            for scale in (1.0, 1.5):
                sm = m.copy(); sm.apply_scale(scale)
                (OUT / 'print' / f'{scale:.1f}x' / tag).mkdir(parents=True, exist_ok=True)
                sm.export(OUT / 'print' / f'{scale:.1f}x' / tag / f'{name}.stl')
            w = to_web(m)
            w.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
                name=kind, baseColorFactor=COL[kind], roughnessFactor=0.7, metallicFactor=0.0))
            scene.add_geometry(w, node_name=name, geom_name=name)
        scene.export(OUT / f'{tag}.glb')
        summary[tag] = {n: len(m.faces) for n, m in parts.items()}
        print(tag, summary[tag])
    json.dump(summary, open(OUT / 'summary.json', 'w'), indent=1)
    (OUT / 'print-notes.txt').write_text('\n'.join(LOG) + '\n'); print('\n'.join(LOG))
