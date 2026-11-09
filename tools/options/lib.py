"""Shared helpers for the treatment options models (tools/options/*/build.py).

Each options build starts from the GLBs already on the site (public/<model>/models/*.glb), so the jaw, teeth and
colours match the model page the options page belongs to. The site GLBs are Draco compressed, which Python
cannot read, so `decoded()` writes an uncompressed copy with tools/glb/decode.mjs into build/options/dec/ first.
"""
import os
import subprocess

import manifold3d as m3
import numpy as np
import trimesh
from skimage import measure

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DEC = os.path.join(ROOT, 'build', 'options', 'dec')


def decoded(public_path):
    """Load public/<public_path> (Draco) as a trimesh Scene via an uncompressed copy."""
    os.makedirs(DEC, exist_ok=True)
    out = os.path.join(DEC, public_path.replace('/', '__'))
    src = os.path.join(ROOT, 'public', public_path)
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(src):
        subprocess.run(['node', os.path.join(ROOT, 'tools', 'glb', 'decode.mjs'), src, out], check=True, cwd=ROOT)
    return trimesh.load(out, force='scene')


def pbr(name, rgba, alpha=None):
    return trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=rgba, metallicFactor=0.0, roughnessFactor=0.7,
                                               doubleSided=True, alphaMode=alpha)


# Removed bone: the same see-through orange as the wisdom tooth options page (tools/wisdom-options/build.py).
MAT_REMOVED = pbr('removed-bone', [232, 120, 40, 150], 'BLEND')


def manifold(m):
    return m3.Manifold(m3.Mesh(np.asarray(m.vertices, dtype=np.float32), np.asarray(m.faces, dtype=np.uint32)))


def tri(mf):
    o = mf.to_mesh()
    return trimesh.Trimesh(np.asarray(o.vert_properties)[:, :3], np.asarray(o.tri_verts), process=True)


def split_plane(mesh, normal, point):
    """Cut a closed mesh by a plane; returns (part on the +normal side, part on the -normal side)."""
    n = np.asarray(normal, float) / np.linalg.norm(normal)
    a, b = manifold(mesh).split_by_plane(n.tolist(), float(n @ point))
    return tri(a), tri(b)


def components(mesh, min_faces=50):
    return [p for p in mesh.split(only_watertight=False) if len(p.faces) >= min_faces]


def near(mesh, point, radius):
    """Components of `mesh` whose centroid lies within `radius` of `point`."""
    return [p for p in components(mesh) if np.linalg.norm(p.centroid - np.asarray(point)) < radius]


def faces_where(mesh, mask):
    idx = np.where(mask)[0]
    return mesh.submesh([idx], append=True) if len(idx) else None


def shell_around(mesh, thickness, step, keep=None):
    """A closed shell `thickness` thick just outside the surface of `mesh` (marching cubes on its distance
    field), optionally reduced to the faces for which keep(face_centres, face_normals) is True."""
    lo = mesh.bounds[0] - 2 * thickness
    hi = mesh.bounds[1] + 2 * thickness
    xs, ys, zs = [np.arange(lo[i], hi[i] + step, step) for i in range(3)]
    P = np.stack(np.meshgrid(xs, ys, zs, indexing='ij'), -1).reshape(-1, 3)
    d = -trimesh.proximity.ProximityQuery(mesh).signed_distance(P).reshape(len(xs), len(ys), len(zs))  # + outside
    field = np.minimum(thickness - d, d + 0.1 * thickness)
    vs, fs, _, _ = measure.marching_cubes(field, 0.0, spacing=(step, step, step))
    shell = trimesh.Trimesh(vs + lo, fs, process=True)
    shell.fix_normals()
    if keep is not None:
        shell = faces_where(shell, keep(shell.triangles_center, shell.face_normals))
        parts = shell.split(only_watertight=False)
        shell = trimesh.util.concatenate([p for p in parts if len(p.faces) > 40])
    return shell


def recolour(mesh, material):
    m = mesh.copy()
    m.visual = trimesh.visual.TextureVisuals(material=material)
    return m


def export(path, parts):
    """parts: [(node name, mesh, material or None to keep the mesh's own)]. Node names must differ."""
    s = trimesh.Scene()
    seen = set()
    for node, mesh, material in parts:
        assert node not in seen, node
        seen.add(node)
        m = recolour(mesh, material) if material is not None else mesh
        s.add_geometry(m, node_name=node, geom_name=node)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    s.export(path)
    print('wrote', os.path.relpath(path, ROOT))


def sectioned(mesh, plane_z, body_material, cut_material, tol=0.02):
    """Split a mesh of a sectioned model into (faces on the section plane -> cut colour, the rest -> body colour)."""
    on = (np.abs(mesh.triangles_center[:, 2] - plane_z) < tol) & (np.abs(mesh.face_normals[:, 2]) > 0.99)
    out = []
    if (~on).any():
        out.append((faces_where(mesh, ~on), body_material))
    if on.any():
        out.append((faces_where(mesh, on), cut_material))
    return out
