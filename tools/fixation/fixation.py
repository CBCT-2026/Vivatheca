"""Realistic titanium plates and screws for every Vivatheca model that shows bone fixation.

Use this module for every new model with plates (orthognathic, head and neck, trauma, cleft ...),
so all models share one look and one set of sourced sizes. See README.md in this folder for the
standard (where plates go, how many screws, sources) and the reasons behind each number.

Units: millimetres. Works on trimesh meshes in any axis convention: you pass the plate centre,
the direction the plate runs along (`along`) and the direction away from the bone (`out`).

    import sys; sys.path.insert(0, 'tools/fixation'); import fixation as fx
    plate, screws = fx.make_plate(bone_meshes, centre, along, out, fx.straight(4, gap=9.0), fx.MINI_2_0)

What it builds
- Plate: the flat outline (a round lobe around each hole, narrow bridges between holes, or a
  continuous bar with lobes for a reconstruction plate) is extruded to the system's thickness, each
  hole is cut with a countersink, then the plate is bent onto a smoothed height map of the bone
  (ray casting), as a surgeon bends a plate to the bone with bending pliers.
- Screws: a low dome head with a cross-shaped recess that sits in the countersink, and a threaded
  shank along the local bone normal. Monocortical screws stop inside the bone; bicortical screws
  are as long as the bone is thick (measured along the screw) plus 1 mm, rounded up to a 1 mm step.
- Holes listed in `empty` get no screw (as on case photos where some holes are left empty).
"""
from dataclasses import dataclass, replace
import numpy as np
import trimesh
import manifold3d as mf
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
from scipy.ndimage import gaussian_filter, maximum_filter
from scipy.interpolate import RegularGridInterpolator


@dataclass(frozen=True)
class System:
    """One plate-and-screw system. Sizes in mm. Sources in README.md."""
    name: str
    thick: float      # plate thickness
    lobe: float       # radius of the round lobe around each hole
    bridge: float     # width of the bridge between lobes (or bar width for a reconstruction plate)
    hole: float       # through-hole diameter (screw outer diameter + clearance)
    sink: float       # countersink diameter at the top of the hole
    screw: float      # screw outer (thread) diameter
    core: float       # screw core diameter
    head: float       # screw head diameter
    head_h: float     # head height (part above the plate top is about a third of this)
    mono_len: float   # standard monocortical screw length
    bar: bool = False  # True: continuous bar with lobes (reconstruction plate)


# 2.0 mm miniplate system (Champy type): 1.0 mm plate, 2.0 mm screws (AO Foundation 2014; Oguz 2010).
MINI_2_0 = System('mini-2.0', thick=1.0, lobe=2.25, bridge=1.9, hole=2.15, sink=3.3, screw=2.0, core=1.5,
                  head=3.1, head_h=1.3, mono_len=5.0)
# 2.0 mm reconstruction-type plate (stronger 2.0 plate, e.g. Sikri 2026 ameloblastoma case): AO lists
# 2.0 plates from 1.0 to 2.0 mm thick; 1.5 mm is used here (estimate within that range).
RECON_2_0 = System('recon-2.0', thick=1.5, lobe=2.6, bridge=3.6, hole=2.15, sink=3.4, screw=2.0, core=1.5,
                   head=3.2, head_h=1.5, mono_len=6.0, bar=True)
# 2.4 mm locking reconstruction plate: 2.5 mm thick, 2.4 mm locking screws, at least 3-4 screws in each
# native bone segment (DePuy Synthes MatrixMANDIBLE IFU; AO Foundation 2014).
RECON_2_4 = System('recon-2.4', thick=2.5, lobe=3.2, bridge=4.6, hole=2.6, sink=3.9, screw=2.4, core=1.9,
                   head=3.7, head_h=2.0, mono_len=6.0, bar=True)


# ---- plate layouts: (holes as (u, v) in mm, links as pairs of hole indices)
def straight(n, pitch=5.5, gap=None):
    """n holes in a line. gap: distance between the two middle holes (an 'extended' plate bridging a cut)."""
    us = [i * pitch for i in range(n)]
    if gap is not None and n % 2 == 0:
        k = n // 2
        us = [u + (gap - pitch if i >= k else 0) for i, u in enumerate(us)]
    c = (us[0] + us[-1]) / 2
    return [(u - c, 0.0) for u in us], [(i, i + 1) for i in range(n - 1)]


def l_plate(foot=5.5, pitch=5.5, gap=8.5):
    """4-hole L-plate: three holes in a line across the cut (wider gap at the cut), one foot hole sideways
    from the end hole. Used at the piriform rim and zygomatic buttress after Le Fort I."""
    holes = [(gap / 2 + pitch, 0.0), (gap / 2, 0.0), (-gap / 2, 0.0), (-gap / 2, foot)]
    return holes, [(0, 1), (1, 2), (2, 3)]


def chin_plate(width=9.0, up=5.0, down=5.0):
    """4-hole pre-bent genioplasty plate (double-Y): two holes above the cut, two below, joined by a central
    bar (Gulsever et al. 2025: one central 4-hole pre-bent plate, two screws in each segment).
    u runs up across the cut, v sideways."""
    w = width / 2
    holes = [(up, -w), (up, w), (-down, -w), (-down, w), (up - 2.2, 0.0), (-down + 2.2, 0.0)]  # last two: Y joints
    return holes, [(0, 4), (1, 4), (4, 5), (5, 2), (5, 3)], 4


def recon(n, pitch=6.5):
    """Reconstruction plate: n holes on a continuous bar."""
    return straight(n, pitch)


# ---- geometry helpers
def _to_mf(m):
    return mf.Manifold(mf.Mesh(np.asarray(m.vertices, np.float32), np.asarray(m.faces, np.uint32)))


def _from_mf(M):
    mm = M.to_mesh()
    return trimesh.Trimesh(mm.vert_properties[:, :3].astype(float), mm.tri_verts, process=True)


def _outline(holes, links, sysm, n_holes):
    lobes = [Point(h).buffer(sysm.lobe, 24) for h in holes[:n_holes]]
    width = sysm.bridge
    bars = [LineString([holes[a], holes[b]]).buffer(width / 2, cap_style=2, resolution=8) for a, b in links]
    joints = [Point(h).buffer(sysm.bridge * 0.75, 12) for h in holes[n_holes:]]
    return unary_union(lobes + bars + joints)


def flat_plate(holes, links, sysm, n_holes=None):
    """The flat plate (z from 0 to thick) with countersunk holes, as a trimesh."""
    n_holes = len(holes) if n_holes is None else n_holes
    shape = _outline(holes, links, sysm, n_holes)
    body = _to_mf(trimesh.creation.extrude_polygon(shape, sysm.thick))
    cut = None
    for h in holes[:n_holes]:
        cyl = mf.Manifold.cylinder(sysm.thick * 3, sysm.hole / 2, sysm.hole / 2, 32).translate([h[0], h[1], -sysm.thick])
        depth = min(sysm.thick * 0.55, (sysm.sink - sysm.hole) / 2)
        cone = mf.Manifold.cylinder(depth + 0.01, sysm.hole / 2, sysm.sink / 2, 32).translate([h[0], h[1], sysm.thick - depth])
        top = mf.Manifold.cylinder(1.0, sysm.sink / 2, sysm.sink / 2, 32).translate([h[0], h[1], sysm.thick])
        c = cyl + cone + top
        cut = c if cut is None else cut + c
    return _from_mf(body - cut), shape


def screw_mesh(sysm, length, sections=20):
    """Screw along -Z with the head's seat (underside) at z = 0: dome head with a cross recess above,
    threaded shank and a tapered tip below."""
    r_h, h_h = sysm.head / 2, sysm.head_h
    # head: countersunk underside (cone from shank to head radius over 40% of the height), then a low dome
    prof = [(0.0, 0.0), (sysm.core / 2, 0.0), (r_h, h_h * 0.4)]
    for t in np.linspace(0, 1, 7)[1:]:
        prof.append((r_h * np.cos(t * np.pi / 2) ** 0.6, h_h * 0.4 + h_h * 0.6 * np.sin(t * np.pi / 2)))
    prof[-1] = (0.0, h_h)
    head = trimesh.creation.revolve(np.array(prof), sections=sections * 2)
    slot_w, slot_d = sysm.head * 0.2, h_h * 0.45
    cross = (mf.Manifold.cube([sysm.head * 0.78, slot_w, slot_d * 2], True)
             + mf.Manifold.cube([slot_w, sysm.head * 0.78, slot_d * 2], True)).translate([0, 0, h_h])
    H = _to_mf(head) - cross
    # threaded shank: alternating outer/core rings at 0.6 mm pitch (a stack of short cones)
    pitch = 0.6; n = max(2, int((length - 1.0) / pitch))
    prof = [(0.0, 0.0), (sysm.core / 2, 0.0)]
    z = 0.0
    for i in range(n):
        prof += [(sysm.screw / 2, -(z + pitch * 0.35)), (sysm.core / 2, -(z + pitch))]
        z += pitch
    prof += [(sysm.core / 2 * 0.5, -length), (0.0, -length)]
    shank = trimesh.creation.revolve(np.array(prof)[::-1], sections=sections)
    try:
        return _from_mf(H + _to_mf(shank))
    except Exception:
        return trimesh.util.concatenate([_from_mf(H), shank])


def _height_map(target, centre, along, side, out, bounds, step=0.35, sigma=1.6):
    u0, v0, u1, v1 = bounds
    us = np.arange(u0 - 2.0, u1 + 2.01, step); vs = np.arange(v0 - 2.0, v1 + 2.01, step)
    U, V = np.meshgrid(us, vs, indexing='ij')
    base = (centre + U[..., None] * along + V[..., None] * side).reshape(-1, 3)
    origins = base + out * 20
    loc, idx, _ = target.ray.intersects_location(origins, np.repeat([-out], len(origins), 0), multiple_hits=False)
    h = np.full(len(origins), np.nan)
    if len(idx): h[idx] = (np.asarray(loc).reshape(-1, 3) - base[idx]) @ out
    if np.isnan(h).any():
        miss = np.isnan(h); cp = trimesh.proximity.closest_point(target, base[miss])[0]
        h[miss] = (cp - base[miss]) @ out
    # highest bone within ~1.5 mm, then smoothed: the plate bridges steps and dips instead of sinking into them
    h = maximum_filter(h.reshape(U.shape), size=int(round(3.0 / step)) | 1, mode='nearest')
    h = gaussian_filter(h, sigma / step, mode='nearest')
    return RegularGridInterpolator((us, vs), h, bounds_error=False, fill_value=None)


def _frame(along, out):
    along = np.asarray(along, float); along /= np.linalg.norm(along)
    out = np.asarray(out, float); out = out - along * (out @ along); out /= np.linalg.norm(out)
    return along, out, np.cross(out, along)


def bone_depth(target, p, d, max_len=40.0):
    """Distance from p along d to where the ray leaves the bone (last exit within max_len)."""
    loc, _, _ = target.ray.intersects_location([p + d * 0.05], [d], multiple_hits=True)
    if not len(loc): return None
    t = (loc - p) @ d; t = t[(t > 0.2) & (t < max_len)]
    return float(t.max()) if len(t) else None


def make_plate(bones, centre, along, out, layout, sysm=MINI_2_0, empty=(), bicortical=False, gap=0.12,
               n_holes=None, screw_len=None, info=None):
    """Plate bent onto `bones` (list of trimesh) with a screw in every hole except those in `empty`.
    Returns (plate mesh, list of screw meshes). `info` (dict) receives screw lengths and positions."""
    holes, links = layout[0], layout[1]
    if n_holes is None:  # a layout may give a third item: how many of its points are holes (rest are joints)
        n_holes = layout[2] if len(layout) > 2 else len(holes)
    along, out, side = _frame(along, out)
    centre = np.asarray(centre, float)
    target = trimesh.util.concatenate(bones)
    flat, shape = flat_plate(holes, links, sysm, n_holes)
    H = _height_map(target, centre, along, side, out, shape.bounds)

    def place(uvw):
        uv = uvw[:, :2]
        return centre + uv[:, :1] * along + uv[:, 1:2] * side + out * (H(uv)[:, None] + gap + uvw[:, 2:3])

    v, f = trimesh.remesh.subdivide_to_size(flat.vertices, flat.faces, 0.9)
    plate = trimesh.Trimesh(place(v), f, process=True)
    trimesh.repair.fix_normals(plate)
    screws, lengths = [], []
    for k, (hu, hv) in enumerate(holes[:n_holes]):
        if k in empty: continue
        e = 0.05
        p0 = place(np.array([[hu, hv, 0.0]]))[0]
        du = place(np.array([[hu + e, hv, 0.0]]))[0] - place(np.array([[hu - e, hv, 0.0]]))[0]
        dv = place(np.array([[hu, hv + e, 0.0]]))[0] - place(np.array([[hu, hv - e, 0.0]]))[0]
        n = np.cross(du, dv); n /= np.linalg.norm(n)
        if n @ out < 0: n = -n
        depth_seat = sysm.thick - min(sysm.thick * 0.55, (sysm.sink - sysm.hole) / 2)  # countersink bottom
        seat = p0 + n * (depth_seat - 0.05)
        if screw_len is not None:
            L = screw_len
        else:
            thick_bone = bone_depth(target, p0 + n * gap * 0.5, -n)
            if bicortical and thick_bone:
                L = float(np.ceil(thick_bone + depth_seat + 1.0))
            else:
                L = sysm.mono_len if thick_bone is None else float(min(sysm.mono_len, max(3.0, np.floor(thick_bone - 1.0))))
        s = screw_mesh(sysm, L)
        T = trimesh.geometry.align_vectors([0, 0, 1], n)
        s.apply_transform(T); s.apply_translation(seat)
        screws.append(s); lengths.append(L)
    if info is not None:
        info.setdefault('plates', []).append({'system': sysm.name, 'holes': n_holes, 'screws': len(screws),
                                              'screw_len_mm': lengths, 'centre': [round(float(x), 2) for x in centre]})
    return plate, screws


def make_plate_along(bones, points, axes, sysm=RECON_2_0, empty=(), bicortical=False, gap=0.12, info=None):
    """A straight-chain plate that follows a curved bone (e.g. a reconstruction plate around the chin and
    along the body of the mandible). points: hole centres in order along the plate; axes: the direction
    away from the bone at each hole. The plate runs along a smooth curve through the holes; at each point
    of the curve it is dropped onto the bone along the local `out` direction, so it can wrap round the jaw."""
    from scipy.interpolate import CubicSpline
    P = np.asarray(points, float); A = np.asarray(axes, float)
    A = A / np.linalg.norm(A, axis=1)[:, None]
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    cP = CubicSpline(s, P, bc_type='natural'); cA = CubicSpline(s, A, bc_type='natural')
    holes = [(float(x - s[-1] / 2), 0.0) for x in s]
    links = [(i, i + 1) for i in range(len(holes) - 1)]
    target = trimesh.util.concatenate(bones)
    flat, shape = flat_plate(holes, links, sysm)

    def frame(u):
        t = np.clip(u + s[-1] / 2, 0, s[-1])
        c = cP(t); tan = cP(t, 1); tan /= np.linalg.norm(tan, axis=-1, keepdims=True)
        o = cA(t); o = o - tan * np.sum(o * tan, -1, keepdims=True); o /= np.linalg.norm(o, axis=-1, keepdims=True)
        ext = (u + s[-1] / 2) - t  # beyond the end holes: continue straight
        return c + tan * ext[..., None], tan, o, np.cross(o, tan)
    u0, v0, u1, v1 = shape.bounds; step = 0.35
    us = np.arange(u0 - 1.0, u1 + 1.01, step); vs = np.arange(v0 - 1.0, v1 + 1.01, step)
    U, V = np.meshgrid(us, vs, indexing='ij')
    c, tan, o, side = frame(U.ravel())
    base = c + side * V.ravel()[:, None]
    loc, idx, _ = target.ray.intersects_location(base + o * 15, -o, multiple_hits=False)
    h = np.full(len(base), np.nan)
    if len(idx): h[idx] = np.sum((np.asarray(loc).reshape(-1, 3) - base[idx]) * o[idx], 1)
    if np.isnan(h).any():
        miss = np.isnan(h); cp = trimesh.proximity.closest_point(target, base[miss])[0]
        h[miss] = np.sum((cp - base[miss]) * o[miss], 1)
    h = maximum_filter(h.reshape(U.shape), size=int(round(3.0 / step)) | 1, mode='nearest')
    H = RegularGridInterpolator((us, vs), gaussian_filter(h, 1.6 / step, mode='nearest'), bounds_error=False, fill_value=None)

    def place(uvw):
        c, tan, o, side = frame(uvw[:, 0])
        return c + side * uvw[:, 1:2] + o * (H(uvw[:, :2])[:, None] + gap + uvw[:, 2:3])

    v, f = trimesh.remesh.subdivide_to_size(flat.vertices, flat.faces, 0.9)
    plate = trimesh.Trimesh(place(v), f, process=True); trimesh.repair.fix_normals(plate)
    screws, lengths = [], []
    depth_seat = sysm.thick - min(sysm.thick * 0.55, (sysm.sink - sysm.hole) / 2)
    for k, (hu, hv) in enumerate(holes):
        if k in empty: continue
        e = 0.05
        p0 = place(np.array([[hu, hv, 0.0]]))[0]
        du = place(np.array([[hu + e, hv, 0.0]]))[0] - place(np.array([[hu - e, hv, 0.0]]))[0]
        dv = place(np.array([[hu, hv + e, 0.0]]))[0] - place(np.array([[hu, hv - e, 0.0]]))[0]
        n = np.cross(du, dv); n /= np.linalg.norm(n)
        if n @ frame(np.array([hu]))[2][0] < 0: n = -n
        thick_bone = bone_depth(target, p0 + n * gap * 0.5, -n)
        if bicortical and thick_bone: L = float(np.ceil(thick_bone + depth_seat + 1.0))
        else: L = sysm.mono_len if thick_bone is None else float(min(sysm.mono_len, max(3.0, np.floor(thick_bone - 1.0))))
        sc = screw_mesh(sysm, L); sc.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], n))
        sc.apply_translation(p0 + n * (depth_seat - 0.05)); screws.append(sc); lengths.append(L)
    if info is not None:
        info.setdefault('plates', []).append({'system': sysm.name, 'holes': len(holes), 'screws': len(screws),
                                              'screw_len_mm': lengths, 'follows_curve': True})
    return plate, screws
