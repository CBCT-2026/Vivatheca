"""Print-file helpers built on manifold3d (https://github.com/elalish/manifold, Apache-2.0).

Manifold guarantees that every boolean result is a closed, watertight mesh, which is what a slicer
needs. trimesh's own boolean backends can leave open edges on complex bone meshes.

Functions (all take and return trimesh.Trimesh, in millimetres):
  to_manifold(mesh)                      -> manifold3d.Manifold (raises if the mesh is not closed)
  drop_fragments(mesh, min_faces=16)     -> mesh without tiny loose components
  magnet_pockets(mesh, centres, normals, diameter=6.2, depth=2.2)
                                         -> mesh with cylindrical pockets cut in (for 6 x 2 mm magnets,
                                            0.2 mm clearance; matches mandible-modular-v0)
  split_by_plane(mesh, point, normal)    -> (keep side, other side), both watertight
  scaled(mesh, factor)                   -> scaled copy (1.0x life size, 1.5x teaching size, ...)

Run `python3 tools/print/manifold_tools.py` for a self-test on a generated shape.
"""
from __future__ import annotations

import numpy as np
import trimesh

try:
    import manifold3d as mf
except ImportError as e:  # pragma: no cover
    raise SystemExit('pip install manifold3d trimesh numpy') from e


def to_manifold(mesh: trimesh.Trimesh) -> mf.Manifold:
    m = mf.Manifold(mf.Mesh(np.asarray(mesh.vertices, dtype=np.float32), np.asarray(mesh.faces, dtype=np.uint32)))
    if m.status() != mf.Error.NoError:
        raise ValueError(f'mesh is not a closed manifold: {m.status()}')
    return m


def from_manifold(m: mf.Manifold) -> trimesh.Trimesh:
    mm = m.to_mesh()
    return trimesh.Trimesh(np.asarray(mm.vert_properties)[:, :3], np.asarray(mm.tri_verts), process=False)


def drop_fragments(mesh: trimesh.Trimesh, min_faces: int = 16) -> trimesh.Trimesh:
    """Remove connected components with fewer than min_faces triangles (decimation/boolean slivers)."""
    parts = mesh.split(only_watertight=False, repair=False)
    if not len(parts):
        return mesh
    keep = [p for p in parts if len(p.faces) >= min_faces]
    if not keep:
        return mesh
    return trimesh.util.concatenate(keep)


def magnet_pockets(mesh: trimesh.Trimesh, centres, normals, diameter: float = 6.2, depth: float = 2.2) -> trimesh.Trimesh:
    """Cut a cylindrical pocket at each centre, opening towards its normal (normal points out of the surface)."""
    body = to_manifold(mesh)
    for c, n in zip(np.asarray(centres, float), np.asarray(normals, float)):
        n = n / np.linalg.norm(n)
        # Cylinder along +Z from z=0, then rotate +Z onto -n (pocket goes into the part) and move its mouth to c.
        cyl = mf.Manifold.cylinder(depth + 1.0, diameter / 2, diameter / 2, 64)
        t = trimesh.geometry.align_vectors([0, 0, 1], -n)
        rot = trimesh.transformations.euler_from_matrix(t, 'sxyz')
        cyl = cyl.rotate(np.degrees(rot)).translate(c + n * 1.0)
        body = body - cyl
    return from_manifold(body)


def split_by_plane(mesh: trimesh.Trimesh, point, normal):
    """Split a closed mesh by a plane; returns (part on the normal side, other part), both closed."""
    body = to_manifold(mesh)
    n = np.asarray(normal, float); n = n / np.linalg.norm(n)
    offset = float(np.dot(n, np.asarray(point, float)))
    top, bottom = body.split_by_plane(n.tolist(), offset)
    return from_manifold(top), from_manifold(bottom)


def scaled(mesh: trimesh.Trimesh, factor: float) -> trimesh.Trimesh:
    out = mesh.copy()
    out.apply_scale(factor)
    return out


def _self_test():
    box = trimesh.creation.box((40, 20, 10))
    ball = trimesh.creation.icosphere(subdivisions=2, radius=10)  # 320 faces
    sliver = trimesh.creation.box((0.1, 0.1, 0.1)).apply_translation((60, 0, 0))  # 12 faces
    cleaned = drop_fragments(trimesh.util.concatenate([ball, sliver]), min_faces=16)
    assert len(cleaned.faces) == len(ball.faces), 'fragment not removed'
    pocketed = magnet_pockets(box, [(10, 0, 5), (-10, 0, 5)], [(0, 0, 1), (0, 0, 1)])
    assert pocketed.is_watertight, 'pocketed mesh not watertight'
    assert box.volume - pocketed.volume > 2 * np.pi * 3.1 ** 2 * 2.2 * 0.95, 'pockets too small'
    a, b = split_by_plane(box, (5, 0, 0), (1, 0, 0))
    assert a.is_watertight and b.is_watertight and abs(a.volume + b.volume - box.volume) < 1e-3
    assert abs(scaled(box, 1.5).volume - box.volume * 1.5 ** 3) < 1e-3
    print('manifold_tools self-test ok')


if __name__ == '__main__':
    _self_test()
