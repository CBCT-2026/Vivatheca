"""Split the Z-Anatomy head meshes into named parts and make the bones that get cut watertight.

Input: the smoothed Z-Anatomy base meshes (millimetres, Z up, front = -Y) made for the head and neck
series: skull_cranium_with_upper_teeth.stl, mandible_bone_only.stl, mandible_lower_teeth_only.stl.
Output: parts.npz with, per part, <name>_v (float, mm) and <name>_f (int).
Run: python -I prep.py <z-anatomy-base dir> parts.npz   (Python 3.11 with bpy, trimesh, manifold3d, networkx)
"""
import sys
from pathlib import Path
import numpy as np, trimesh, bpy

SRC, OUT = Path(sys.argv[1]), sys.argv[2]

def remesh(m, voxel, decimate=None, smooth=2):
    """Blender voxel remesh -> watertight, then optional decimate (ratio)."""
    me = bpy.data.meshes.new('m'); me.from_pydata((m.vertices / 1000).tolist(), [], m.faces.tolist()); me.update()
    ob = bpy.data.objects.new('m', me); bpy.context.scene.collection.objects.link(ob)
    r = ob.modifiers.new('r', 'REMESH'); r.mode = 'VOXEL'; r.voxel_size = voxel / 1000
    if smooth:
        s = ob.modifiers.new('s', 'SMOOTH'); s.iterations = smooth; s.factor = 0.5
    if decimate:
        d = ob.modifiers.new('d', 'DECIMATE'); d.ratio = decimate
    dg = bpy.context.evaluated_depsgraph_get(); e = ob.evaluated_get(dg).to_mesh(); e.calc_loop_triangles()
    v = np.array([x.co[:] for x in e.vertices]) * 1000; f = np.array([t.vertices[:] for t in e.loop_triangles])
    bpy.data.objects.remove(ob)
    out = trimesh.Trimesh(v, f, process=True)
    return out

def decimate(m, ratio):
    me = bpy.data.meshes.new('m'); me.from_pydata((m.vertices / 1000).tolist(), [], m.faces.tolist()); me.update()
    ob = bpy.data.objects.new('m', me); bpy.context.scene.collection.objects.link(ob)
    d = ob.modifiers.new('d', 'DECIMATE'); d.ratio = ratio
    dg = bpy.context.evaluated_depsgraph_get(); e = ob.evaluated_get(dg).to_mesh(); e.calc_loop_triangles()
    v = np.array([x.co[:] for x in e.vertices]) * 1000; f = np.array([t.vertices[:] for t in e.loop_triangles])
    bpy.data.objects.remove(ob)
    return trimesh.Trimesh(v, f, process=True)

out = {}
def put(name, m):
    trimesh.repair.fix_normals(m, multibody=True)  # some Z-Anatomy shells are inside out
    out[name + '_v'] = np.asarray(m.vertices, np.float32); out[name + '_f'] = np.asarray(m.faces, np.int32)
    print(name, len(m.faces), m.is_watertight)

skull = trimesh.load(SRC / 'skull_cranium_with_upper_teeth.stl')
comps = [c for c in skull.split(only_watertight=False) if len(c.faces) > 100]
# Classify by position (see the component table in the README).
cut_parts, teeth, cranium = [], [], []
for c in comps:
    cx, cy, cz = c.bounds.mean(0); sx, sy, sz = c.bounds[1] - c.bounds[0]
    if cz < 1548 and sz < 34 and sx < 13: teeth.append(c)
    elif abs(cy + 67) < 3 and abs(abs(cx) - 22.9) < 3 and cz < 1575: cut_parts.append(('maxilla', c))
    elif abs(cy + 42.4) < 3 and abs(abs(cx) - 13.9) < 3 and cz < 1566: cut_parts.append(('palatine', c))
    elif abs(cy + 51.5) < 3 and abs(cx) < 1 and cz < 1571: cut_parts.append(('vomer', c))
    elif abs(cy + 58.1) < 3 and abs(abs(cx) - 9.7) < 3 and cz < 1566: cut_parts.append(('concha', c))
    else: cranium.append(c)
print('teeth', len(teeth), 'cut', [n for n, _ in cut_parts], 'cranium', len(cranium))
assert len(teeth) == 14 and len(cut_parts) == 7
put('upper_teeth', decimate(trimesh.util.concatenate(teeth), 0.35))
for i, (n, c) in enumerate(cut_parts):
    put(f'cut_{n}{i}', c if c.is_watertight else remesh(c, 0.3, smooth=1))
put('cranium', decimate(trimesh.util.concatenate(cranium), 0.25))
mand = trimesh.load(SRC / 'mandible_bone_only.stl')
put('mandible', remesh(mand, 0.35, decimate=0.3))
# Lower teeth: 14 teeth, some made of two shells; they all move together, so keep them as one part.
put('lower_teeth', decimate(trimesh.load(SRC / 'mandible_lower_teeth_only.stl'), 0.35))
np.savez_compressed(OUT, **out)
