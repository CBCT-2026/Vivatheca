"""Extract the lower right first molar (46) and its pulp from the Z-Anatomy lower teeth,
put it in a tooth frame and save signed distance fields on a voxel grid.

Usage: python prep_tooth.py mandible_lower_teeth_only.stl tooth.npz

Tooth frame (mm): z = long axis (crown up), z = 0 at the cementoenamel junction (CEJ),
x = mesiodistal (+x mesial), y = buccolingual (+y lingual). Origin at the crown centre.
SDF sign: negative inside.
"""
import sys
import numpy as np
import trimesh
from scipy import ndimage

PITCH = 0.06
CROWN_HEIGHT = 7.5  # lower first molar crown length, mm (Wheeler's Dental Anatomy, 10th ed.)


def frame(teeth):
    parts = sorted(teeth.split(only_watertight=False), key=lambda c: c.centroid[0])
    # Right side (world x < 0), from the back: 0 = second molar (47), 1..3 = first molar shells, 4 = 45.
    # Shell 3 is the outer tooth surface, shell 1 the pulp (chamber and canals).
    for p in parts:
        if p.volume < 0:
            p.invert()
    tooth, pulp, pm, m2 = parts[3], parts[1], parts[4], parts[0]
    v = tooth.vertices - tooth.centroid
    w, u = np.linalg.eigh(np.cov(v.T))
    z = u[:, 2] if u[2, 2] > 0 else -u[:, 2]  # crown points up in world z
    x = pm.centroid - m2.centroid
    x -= z * (x @ z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    R = np.array([x, y, z])
    return tooth, pulp, R


def inside_mask(mesh, xs, ys, zs):
    """Parity fill: one ray per (x, y) column."""
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
        hz = hz[np.concatenate([[True], np.diff(hz) > 1e-5])]  # drop duplicate hits on shared edges
        i, j = divmod(r, len(ys))
        for a, b in zip(hz[0::2], hz[1::2]):
            mask[i, j, (zs > a) & (zs < b)] = True
    return mask


def sdf_from_mask(mask):
    out = ndimage.distance_transform_edt(~mask) - 0.5
    inn = ndimage.distance_transform_edt(mask) - 0.5
    d = np.where(mask, -inn, out) * PITCH
    return ndimage.gaussian_filter(d, 1.0).astype(np.float32)


def main(src, dst):
    tooth, pulp, R = frame(trimesh.load(src))
    c = tooth.centroid
    for m in (tooth, pulp):
        m.vertices = (m.vertices - c) @ R.T
    top = tooth.vertices[:, 2].max()
    cej = top - CROWN_HEIGHT
    lo, hi = tooth.bounds
    cx, cy = (lo[:2] + hi[:2]) / 2
    shift = np.array([cx, cy, cej])
    for m in (tooth, pulp):
        m.vertices -= shift
    lo, hi = tooth.bounds - [[1.2] * 3, [-1.2] * 3]
    xs, ys, zs = (np.arange(lo[k], hi[k], PITCH) for k in range(3))
    print('grid', len(xs), len(ys), len(zs))
    T = sdf_from_mask(inside_mask(tooth, xs, ys, zs))
    Pp = sdf_from_mask(inside_mask(pulp, xs, ys, zs))
    np.savez_compressed(dst, T=T, P=Pp, xs=xs, ys=ys, zs=zs, R=R, centre=c, shift=shift,
                        tooth_v=tooth.vertices, tooth_f=tooth.faces)
    print('tooth extents', tooth.extents, 'top above CEJ', top - cej)


if __name__ == '__main__':
    main(*sys.argv[1:3])
