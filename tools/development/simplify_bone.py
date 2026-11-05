"""Reduce the remeshed bone to a web-friendly size while keeping it watertight; converts to millimetres.
Run: python simplify_bone.py bone.npz bone_mm.npz"""
import sys, numpy as np, trimesh, manifold3d as mf
d = np.load(sys.argv[1]); out = {}
for k in ('mandible', 'maxilla', 'palatine'):
    M = mf.Manifold(mf.Mesh((d[k + '_v'] * 1000).astype(np.float32), d[k + '_f'].astype(np.uint32))).simplify(0.04)
    mm = M.to_mesh(); out[k + '_v'] = mm.vert_properties[:, :3]; out[k + '_f'] = mm.tri_verts
np.savez(sys.argv[2], **out)
