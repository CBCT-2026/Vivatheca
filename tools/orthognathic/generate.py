"""Generate the orthognathic surgery series: normal, Class II and Class III jaws, before and after surgery.

Input: parts.npz from prep.py (Z-Anatomy, CC BY-SA 4.0; millimetres, Z up, front = -Y, x > 0 = one side).
Output: one GLB per state (millimetres scaled to metres, Y up for glTF) in OUT, plus build_report.json.
Run: python -I generate.py parts.npz out

Method (all simplifications are listed on the web page and in README.md):
- Normal (Class I): Z-Anatomy skull, mandible and teeth as they are.
- Class II (retrognathic mandible): the tooth-bearing part of the mandible is shifted back by MAND_II mm.
  The shift fades out over the front of the ramus, so the condyles and upper ramus stay where they are.
  This is how a short mandibular body is usually described; it is a smooth warp, not real growth.
- Class III (retrusive maxilla + prognathic mandible): the lower maxilla is shifted back by MAX_III mm
  (fading out above the Le Fort I level and towards the pterygoid plates) and the mandibular body
  forward by MAND_III mm.
- The before models show the mouth slightly open (rotation about the condyles) so the teeth do not pass
  through each other; the after models are in occlusion.
- After surgery: the before model is cut with simplified osteotomies, the tooth-bearing pieces are moved
  back to a Class I position, overlapping bone is trimmed, and titanium miniplates are added.
  Le Fort I: one plane, ~4 mm above the canine root tips, from the piriform aperture to the
  pterygomaxillary junction (pterygoid plates stay with the skull). Inferior conchae are not cut.
  BSSO (Obwegeser-Dal Pont type): medial horizontal cut above the lingula, sagittal split lateral to
  the tooth roots, vertical buccal cut between first and second molar. Plane-based approximation.
- Teeth always move rigidly with their bone.
- Chin: the Z-Anatomy chin is short (lower incisor edge to menton 33.3 mm; Class I adult mean 44.78 mm, Arruda
  et al. 2012). All models get a taller chin: bone below the lowest anterior root tip is stretched down so that
  Ii-Me = 44.78 mm at the midline, fading out sideways so the mental foramen ends 14.98 mm above the lower border
  (Class I normal-face mean, Bagheri et al. 2023). Teeth are not changed.
- Genioplasty (optional after models, '-genio'): sliding osteotomy of the chin along one plane below the
  anterior root tips and more than 9.12 mm below the mental foramen (the 99.99% safe distance of Lin et al. 2020),
  running down to the lower border at the premolars. Class II: chin
  advanced GENIO_II mm; Class III: chin set back GENIO_III mm (moved along the cut plane).
- Plates are miniplates: round screw holes joined by narrow bridges (L-plates at the Le Fort I cut,
  straight 4-hole plates with a gap across the BSSO, a 4-hole box plate across the genioplasty cut),
  each with screw heads. Shapes and sizes are illustrative (2.0 mm system scale).
"""
import json, sys
from pathlib import Path
import numpy as np, trimesh, manifold3d as mf

SRC = Path(sys.argv[1]); OUT = Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
P = np.load(SRC)
def part(n): return trimesh.Trimesh(P[n + '_v'].astype(float), P[n + '_f'], process=True)
NAMES = [k[:-2] for k in P.files if k.endswith('_v')]

# Planned movements (mm). Typical sizes from the literature (see page sources): Class II mandibular
# advancement ~5-7 mm; Class III bimaxillary: maxillary advancement ~3-5 mm with mandibular setback ~3-6 mm.
MAND_II = 6.0    # Class II: mandibular body sits 6 mm back; surgery: BSSO advancement 6 mm
MAX_III = 3.0    # Class III: maxilla 3 mm back; surgery: Le Fort I advancement 3 mm
MAND_III = 5.0   # Class III: mandibular body 5 mm forward; surgery: BSSO setback 5 mm

# Landmark-based cut positions on this skull (see README for how they were measured).
Z_OCC_M2 = 1535.0         # occlusal plane at the lower second molar
Z_MEDIAL = 1540.0         # BSSO medial horizontal cut, ~5 mm above the occlusal plane (above the lingula)
Y_BUCCAL = -50.0          # BSSO buccal vertical cut, between lower first and second molar
SPLIT = ((31.0, -50.0), (38.5, -25.0))  # (x, y) points of the sagittal split line on the x > 0 side
Q_POST = ((-22.0, Z_MEDIAL), (-30.0, 1500.0))  # (y, z): medial split runs from behind the lingula down to the lower border, in front of the angle
LEFORT = ((-85.0, 1562.0), (-40.0, 1565.0))  # (y, z) of the Le Fort I plane, ~4 mm above the canine apex
GENIO = ((-80.0, 1496.0), (-62.0, 1493.0))  # (y, z) of the genioplasty plane: 6.4 mm below the canine root tip, ~16 mm below the mental foramen
GENIO_II = 5.0            # Class II: advancement genioplasty 5 mm
GENIO_III = 4.0           # Class III: reduction (setback) genioplasty 4 mm

def smooth(t):
    t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)

def ramp(x, x1, x0):
    """1 at x1, 0 at x0, smooth in between."""
    return smooth((x - x0) / (x1 - x0))

def mand_weight(v):
    return ramp(v[:, 1], -42.0, -20.0) * ramp(v[:, 2], 1538.0, 1550.0)

def max_weight(v):
    return ramp(v[:, 2], 1560.0, 1572.0) * ramp(v[:, 1], -45.0, -35.0)

def warp(m, w, dy):
    m = m.copy(); v = m.vertices.copy(); v[:, 1] += dy * w(v); m.vertices = v; return m

def shift(m, dy, dz=0.0):
    m = m.copy(); m.apply_translation([0, dy, dz]); return m

# Chin height from published norms (see docstring and the page):
II_ME = 44.78        # lower incisor edge (Ii) to menton (Me), mm: mean of 60 Class I adults (Arruda et al. 2012)
MF_BORDER = 14.98    # mental foramen to the lower border, mm: Class I, normal face (Bagheri et al. 2023)
MF = np.array([21.0, -67.6, 1510.7])  # mental foramen centre on this mandible (x > 0 side; found by ray casting)
Z_TOP = 1502.0       # stretching starts just below the lowest anterior root tip (canine 1501.7)

def _border_map(v):
    """Lowest bone z per 2 mm column (x, y), smoothed: the local lower border."""
    from scipy.interpolate import griddata
    from scipy.ndimage import grey_erosion, gaussian_filter
    xs = np.arange(-56, 57, 2.0); ys = np.arange(-90, 4, 2.0)
    zb = np.full((len(xs), len(ys)), np.nan)
    ix = np.clip(((v[:, 0] + 56) / 2).astype(int), 0, len(xs) - 1); iy = np.clip(((v[:, 1] + 90) / 2).astype(int), 0, len(ys) - 1)
    for a, b, z in zip(ix, iy, v[:, 2]):
        if not z >= zb[a, b]: zb[a, b] = z
    ok = ~np.isnan(zb); X, Y = np.meshgrid(xs, ys, indexing='ij')
    zb = griddata((X[ok], Y[ok]), zb[ok], (X, Y), method='nearest')
    zb = gaussian_filter(grey_erosion(zb, size=3), 1.0)
    from scipy.interpolate import RegularGridInterpolator
    return RegularGridInterpolator((xs, ys), zb, bounds_error=False, fill_value=None)

def _chin_warp(v, D, r1, zb):
    """Lower the bone below Z_TOP by D at the midline, fading out sideways (|x| 4 -> r1 mm)."""
    w = smooth((r1 - np.abs(v[:, 0])) / (r1 - 4.0))
    base = zb(v[:, :2])
    t = np.clip((Z_TOP - v[:, 2]) / np.maximum(Z_TOP - base, 0.5), 0, 1)
    out = v.copy(); out[:, 2] -= D * w * t; return out

def _fit_chin(m, teeth):
    """Choose D (midline drop) and r1 (side fade) so Ii-Me = II_ME and foramen-border = MF_BORDER."""
    v = m.vertices; zb = _border_map(v)
    tv = teeth.vertices; inc = tv[(np.abs(tv[:, 0]) < 6.5) & (tv[:, 1] < -70)]; Ii = inc[inc[:, 2].argmax()]
    mf_border0 = MF[2] - float(zb([[MF[0] - 2.0, MF[1]]])[0])  # border under the foramen (2 mm medial: rounded edge)
    need_mf = MF_BORDER - mf_border0
    def ii_me(D, r1):
        w = _chin_warp(v, D, r1, zb); mid = w[np.abs(w[:, 0]) < 2]; Me = mid[mid[:, 2].argmin()]
        return float(np.linalg.norm(Ii - Me))
    def r1_for(D):  # fade so the drop under the foramen is need_mf
        lo, hi = MF[0] + 0.1, 60.0
        for _ in range(40):
            r1 = (lo + hi) / 2
            if D * smooth((r1 - (MF[0] - 2.0)) / (r1 - 4.0)) > need_mf: hi = r1
            else: lo = r1
        return r1
    lo, hi = 0.0, 25.0
    for _ in range(30):
        D = (lo + hi) / 2
        if ii_me(D, r1_for(D)) > II_ME: hi = D
        else: lo = D
    return D, r1_for(D), zb, {'ii_me_before': round(ii_me(0, 30), 2), 'ii_me_after': round(ii_me(D, r1_for(D)), 2),
                             'mf_border_before': round(mf_border0, 2), 'mf_border_after': round(mf_border0 + need_mf, 2),
                             'midline_drop_mm': round(D, 2), 'fade_to_x_mm': round(r1_for(D), 2)}

CHIN = None
def lengthen_chin(m):
    """Make the chin as tall as the published norms (all models; see docstring). Teeth are not changed."""
    global CHIN
    if CHIN is None: CHIN = _fit_chin(m, part('lower_teeth'))
    D, r1, zb, _ = CHIN
    m = m.copy(); m.vertices = _chin_warp(m.vertices, D, r1, zb); return m

# Hinge axis through the two condyle tops (for opening the mouth slightly in the before models).
_mv = lengthen_chin(part('mandible')).vertices
CONDYLES = [ _mv[(_mv[:, 2] > _mv[:, 2].max() - 6) & (s * _mv[:, 0] > 0)].mean(0) for s in (1, -1)]
def open_mouth(m, deg):
    a = CONDYLES[0] - CONDYLES[1]; a /= np.linalg.norm(a)
    T = trimesh.transformations.rotation_matrix(np.radians(deg), a, (CONDYLES[0] + CONDYLES[1]) / 2)
    m = m.copy(); m.apply_transform(T); return m

# ---- manifold helpers
def to_mf(m): return mf.Manifold(mf.Mesh(np.asarray(m.vertices, np.float32), np.asarray(m.faces, np.uint32)))
def from_mf(M):
    mm = M.to_mesh()
    return trimesh.Trimesh(mm.vert_properties[:, :3].astype(float), mm.tri_verts, process=True) if mm.tri_verts.size else None
def keep(M, n, p):
    """Part of M on the side the normal n points to, through point p."""
    n = np.asarray(n, float); n /= np.linalg.norm(n); return M.trim_by_plane(n.tolist(), float(n @ np.asarray(p, float)))

PLANES = []  # (normal, point) of every cut, for colouring cut faces
def plane(n, p):
    n = np.asarray(n, float); n /= np.linalg.norm(n); PLANES.append((n, np.asarray(p, float))); return n, np.asarray(p, float)

def lefort_plane():
    (y0, z0), (y1, z1) = LEFORT
    t = np.array([0, y1 - y0, z1 - z0]); n = np.cross([1, 0, 0], t)
    if n[2] < 0: n = -n
    return plane(n, [0, y0, z0])  # n points up

def genio_plane():
    (y0, z0), (y1, z1) = GENIO
    t = np.array([0, y1 - y0, z1 - z0]); n = np.cross([1, 0, 0], t)
    if n[2] < 0: n = -n
    return plane(n, [0, y0, z0]), t / np.linalg.norm(t)  # n points up; t points backwards along the cut

def bsso_planes(s):
    """Planes for side s (+1: x > 0, -1: x < 0). Normals point into the proximal piece."""
    (x0, y0), (x1, y1) = SPLIT
    t = np.array([s * (x1 - x0), y1 - y0, 0]); n_split = np.cross(t, [0, 0, 1])
    if n_split[0] * s < 0: n_split = -n_split  # lateral
    split = plane(n_split, [s * x0, y0, 0])
    medial = plane([0, 0, 1], [0, 0, Z_MEDIAL])
    buccal = plane([0, 1, 0], [0, Y_BUCCAL, 0])
    (qy0, qz0), (qy1, qz1) = Q_POST
    tq = np.array([0, qy1 - qy0, qz1 - qz0]); nq = np.cross([1, 0, 0], tq)
    if nq[1] < 0: nq = -nq  # posterior
    post = plane(nq, [0, qy0, qz0])
    return split, medial, buccal, post

def bsso(mand):
    """Split the mandible: returns (distal, [proximal right, proximal left])."""
    M = to_mf(mand); prox = []
    for s in (1, -1):
        split, medial, buccal, post = bsso_planes(s)
        side = keep(M, [s, 0, 0], [0, 0, 0])
        r1 = keep(side, medial[0], medial[1])
        low = keep(side, -medial[0], medial[1])
        r2 = keep(keep(low, buccal[0], buccal[1]), split[0], split[1])
        r3 = keep(low, post[0], post[1])
        prox.append(r1 + r2 + r3)
    distal = M - prox[0] - prox[1]
    return distal, prox

def lefort(parts):
    n, p = lefort_plane(); up, down = [], []
    for m in parts:
        M = to_mf(m)
        a, b = from_mf(keep(M, n, p)), from_mf(keep(M, -n, p))
        if a is not None: up.append(a)
        if b is not None: down.append(b)
    return up, down

def cut_faces(m, tol=0.03):
    """Mask of faces lying on any cut plane (these were made by the cuts)."""
    tri = m.triangles; mask = np.zeros(len(tri), bool)
    for n, p in PLANES:
        d = np.abs((tri - p) @ n); mask |= (d < tol).all(1)
    return mask

# ---- plates (titanium miniplates) and screws
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
from scipy.ndimage import gaussian_filter
from scipy.interpolate import RegularGridInterpolator

def miniplate(bones, centre, along, out, holes, links, ring=2.0, hole=1.05, bridge=1.5, thick=0.8):
    """A miniplate lying on the bone: round rings around the screw holes joined by narrow bridges.
    holes: (u, v) in mm (u along `along`, v sideways); links: pairs of hole indices joined by a bridge.
    The flat outline is extruded, then bent onto a smoothed height map of the bone (ray casting along -out),
    as a plate bent to the bone would be. A screw head sits in every hole."""
    along = np.asarray(along, float); along /= np.linalg.norm(along)
    out = np.asarray(out, float); out -= along * (out @ along); out /= np.linalg.norm(out)
    side = np.cross(out, along); centre = np.asarray(centre, float)
    shape = unary_union([Point(h).buffer(ring, 10) for h in holes] +
                        [LineString([holes[a], holes[b]]).buffer(bridge / 2, cap_style=2) for a, b in links])
    shape = shape.difference(unary_union([Point(h).buffer(hole, 8) for h in holes]))
    pl = trimesh.creation.extrude_polygon(shape, thick)
    v, f = trimesh.remesh.subdivide_to_size(pl.vertices, pl.faces, 0.8)
    # height map of the bone under the plate
    target = trimesh.util.concatenate(bones)
    u0, v0, u1, v1 = shape.bounds
    us = np.arange(u0 - 1.5, u1 + 1.6, 0.4); vs = np.arange(v0 - 1.5, v1 + 1.6, 0.4)
    U, V = np.meshgrid(us, vs, indexing='ij')
    base = centre + U[..., None] * along + V[..., None] * side
    origins = base.reshape(-1, 3) + out * 15
    loc, idx, _ = target.ray.intersects_location(origins, np.repeat([-out], len(origins), 0), multiple_hits=False)
    h = np.full(len(origins), np.nan); h[idx] = (loc - base.reshape(-1, 3)[idx]) @ out
    if np.isnan(h).any():
        miss = np.isnan(h); cp = trimesh.proximity.closest_point(target, base.reshape(-1, 3)[miss])[0]
        h[miss] = (cp - base.reshape(-1, 3)[miss]) @ out
    h = gaussian_filter(h.reshape(U.shape), 2.0, mode='nearest')
    H = RegularGridInterpolator((us, vs), h)
    def place(uvz):
        return centre + uvz[:, :1] * along + uvz[:, 1:2] * side + out * (H(uvz[:, :2])[:, None] + 0.12 + uvz[:, 2:3])
    plate_m = trimesh.Trimesh(place(v), f, process=True); trimesh.repair.fix_normals(plate_m)
    screws = []
    for hu, hv in holes:
        top = place(np.array([[hu, hv, thick]]))[0]
        head = trimesh.creation.cylinder(radius=hole - 0.08, height=0.55, sections=24)
        head.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], out)); head.apply_translation(top - out * 0.12)
        screws.append(head)
    return plate_m, screws

def l_plate(foot):
    """4-hole L-plate: three holes in a line across the cut (gap at the cut), one foot hole sideways."""
    return [(10.0, 0.0), (4.5, 0.0), (-4.0, 0.0), (-4.0, foot)], [(0, 1), (1, 2), (2, 3)]

STRAIGHT_GAP = ([(-10.0, 0.0), (-4.5, 0.0), (4.5, 0.0), (10.0, 0.0)], [(0, 1), (1, 2), (2, 3)])  # 4-hole, longer middle bridge
CHIN_BOX = ([(4.2, -4.5), (4.2, 4.5), (-4.8, -4.5), (-4.8, 4.5)], [(0, 1), (2, 3), (0, 2), (1, 3)])  # 4-hole box plate across the chin cut

# ---- states
mand0, lt0, ut0, cran0 = lengthen_chin(part('mandible')), part('lower_teeth'), part('upper_teeth'), part('cranium')
max_parts0 = [part(n) for n in NAMES if n.startswith('cut_') and 'concha' not in n]
conchae = [part(n) for n in NAMES if 'concha' in n]

def overlap(a_list, b_list):
    A = to_mf(trimesh.util.concatenate(a_list)); B = to_mf(trimesh.util.concatenate(b_list))
    return (A ^ B).volume()

def find_open(mand_t, lt_t, ut_t):
    """Smallest opening (0.25 degree steps) at which upper and lower teeth no longer intersect."""
    for k in range(0, 41):
        deg = k * 0.25
        if overlap([open_mouth(lt_t, deg)], [ut_t]) < 0.05: return deg
    return 10.0

def make(state):
    mand, lt, ut, maxp = mand0, lt0, ut0, max_parts0
    if state.startswith('class2'):
        mand = warp(mand, mand_weight, MAND_II); lt = shift(lt, MAND_II)
    if state.startswith('class3'):
        mand = warp(mand, mand_weight, -MAND_III); lt = shift(lt, -MAND_III)
        maxp = [warp(m, max_weight, MAX_III) for m in maxp]; ut = shift(ut, MAX_III)
    out = {'bone': [cran0] + conchae, 'teeth': [], 'moved': [], 'cut': [], 'plate': [], 'screw': [], 'before': []}
    info = {'state': state}
    if state in ('normal', 'class2-before', 'class3-before'):
        deg = 0.0 if state == 'normal' else find_open(mand, lt, ut)
        info['mouth_open_deg'] = deg
        out['bone'] += maxp + [open_mouth(mand, deg)]
        out['teeth'] += [ut, open_mouth(lt, deg)]
        return out, info
    PLANES.clear()
    distal, prox = bsso(mand)
    dy = -MAND_II if state.startswith('class2') else MAND_III
    distal_m = from_mf(distal.translate([0, dy, 0]))
    lt_m = shift(lt, dy)
    genio = None
    if state.endswith('-genio'):
        (gn, gp), back = genio_plane()
        D = to_mf(distal_m); seg = keep(D, -gn, gp)
        gmove = back * (-GENIO_II if state.startswith('class2') else GENIO_III)
        info['genio_move_mm'] = [round(float(x), 2) for x in gmove]
        info['genio_segment_cm3'] = round(seg.volume() / 1000, 2)
        distal_m = from_mf(keep(D, gn, gp)); genio = from_mf(seg.translate(gmove.tolist()))
    proximal = [from_mf(p - distal.translate([0, dy, 0])) for p in prox]  # trim overlap (setback)
    info['bsso_move_mm'] = dy
    out['before'] += [from_mf(distal), lt]
    if state.startswith('class3-after'):
        up, down = lefort(maxp)
        down_m = [shift(m, -MAX_III) for m in down]
        ut_m = shift(ut, -MAX_III)
        out['bone'] += up; out['moved'] += down_m; out['teeth'] += [ut_m]
        out['before'] += down + [ut]
        info['lefort_move_mm'] = -MAX_III
        # Le Fort I plates: piriform rim and zygomatic buttress, each side
        for s in (1, -1):
            # centres on the bone surface at the cut (measured by ray casting on this maxilla)
            for x, y, z, o in ((16.0, -79.8, 1562.0, (0.3, -1.0, 0)), (43.0, -60.0, 1562.0, (1.0, -0.5, 0))):
                c = np.array([s * x, y, z]); o = np.array([s * o[0], o[1], o[2]])
                pl, sc = miniplate(up + down_m, c, [0, 0, 1], o, *l_plate(-s * 5.5))
                out['plate'].append(pl); out['screw'] += sc
    else:
        out['bone'] += maxp; out['teeth'] += [ut]
    out['bone'] += proximal; out['moved'] += [distal_m] + ([genio] if genio is not None else []); out['teeth'] += [lt_m]
    if genio is not None:  # chin plate across the genioplasty cut, on the midline
        (gn, gp), _ = genio_plane()
        front = distal_m.vertices[np.abs(distal_m.vertices[:, 0]) < 2]
        yf = front[np.abs(front[:, 2] - gp[2]) < 2][:, 1].min()
        pl, sc = miniplate([distal_m, genio], [0, yf, gp[2]], [0, 0.15, 1], [0, -1, 0], *CHIN_BOX)
        out['plate'].append(pl); out['screw'] += sc
    # BSSO plate on the outer surface, across the buccal step, each side
    for s in (1, -1):
        c = np.array([s * 34.0, Y_BUCCAL + 1.0, 1520.0])
        pl, sc = miniplate(proximal + [distal_m], c, [0, 1, -0.05], [s, 0, 0], *STRAIGHT_GAP)
        out['plate'].append(pl); out['screw'] += sc
    # colour cut faces, plus a thin band of the outer surface along each cut so the cut line shows
    from scipy.spatial import cKDTree
    cut_bits = []
    caps = [m.vertices[np.unique(m.faces[cut_faces(m)])] for k in ('bone', 'moved') for m in out[k]]
    caps = np.concatenate([c for c in caps if len(c)])
    tree = cKDTree(caps)
    for key in ('bone', 'moved'):
        new = []
        for m in out[key]:
            mask = cut_faces(m) | (tree.query(m.triangles_center, distance_upper_bound=0.8)[0] < 0.8)
            if mask.any():  # drop specks (faces that only touch a cut plane by chance)
                sub = np.where(mask)[0]
                labels = trimesh.graph.connected_component_labels(m.face_adjacency, node_count=len(m.faces))
                area = np.bincount(labels[sub], weights=m.area_faces[sub], minlength=labels.max() + 1)
                mask[sub[area[labels[sub]] < 3.0]] = False
            if mask.any():
                cut_bits.append(m.submesh([np.where(mask)[0]], append=True))
                m = m.submesh([np.where(~mask)[0]], append=True)
            new.append(m)
        out[key] = new
    out['cut'] = cut_bits
    return out, info

COL = {  # linear RGB; bone and teeth as the wisdom tooth model (teeth lightened, see project colour rule)
    'bone': ([0.6724, 0.5972, 0.4969, 1], 0.7, 0.0),
    'moved': ([0.6724, 0.5972, 0.4969, 1], 0.7, 0.0),
    'teeth': ([0.8963, 0.855, 0.7758, 1], 0.45, 0.0),
    'cut': ([0.62, 0.08, 0.06, 1], 0.6, 0.0),
    'plate': ([0.72, 0.74, 0.77, 1], 0.3, 0.6),
    'screw': ([0.45, 0.47, 0.5, 1], 0.35, 0.6),
    'before': ([0.12, 0.45, 0.85, 0.0], 0.6, 0.0),
}
Y_UP = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, -1, 0, 0], [0, 0, 0, 1]], float)  # Z up, -Y front -> glTF Y up, +Z front

def export(out, path, centre):
    scene = trimesh.Scene()
    for key, meshes in out.items():
        meshes = [m for m in meshes if m is not None and len(m.faces)]
        if not meshes: continue
        m = trimesh.util.concatenate(meshes); m.apply_translation(-centre); m.apply_scale(0.001); m.apply_transform(Y_UP)
        c, r, mt = COL[key]
        m.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            name=key, baseColorFactor=c, roughnessFactor=r, metallicFactor=mt, doubleSided=False,
            alphaMode='BLEND' if key == 'before' else 'OPAQUE'))
        scene.add_geometry(m, node_name=key, geom_name=key)
    scene.export(path)

STATES = ['normal', 'class2-before', 'class2-after', 'class2-after-genio', 'class3-before', 'class3-after', 'class3-after-genio']
want = sys.argv[3:] or STATES
centre = np.array([0.0, -45.0, 1550.0])
report = []
for st in want:
    out, info = make(st)
    info['faces'] = {k: int(sum(len(m.faces) for m in v if m is not None)) for k, v in out.items()}
    export(out, OUT / f'{st}.glb', centre)
    print(json.dumps(info)); report.append(info)
json.dump({'states': report, 'chin': CHIN[3], 'moves_mm': {'MAND_II': MAND_II, 'MAX_III': MAX_III, 'MAND_III': MAND_III,
                                          'GENIO_II': GENIO_II, 'GENIO_III': GENIO_III}},
          open(OUT / 'build_report.json', 'w'), indent=1)
