"""Cut closing-wedge osteotomies into the fibula flap of the SCC case model.

The fibula in scc-case.glb was one continuous bent solid, so the three segments the page describes
could not be seen. A fibula free flap is shaped with closing-wedge osteotomies: at each bend a wedge
of bone is removed so the two segment faces meet flush on the plane that bisects the bend (the method
used by the open-source Slicer BoneReconstructionPlanner, BSD-3, Maisi et al. 2023,
doi 10.1016/j.stlm.2023.100109, and in the standard fibula flap technique, Hidalgo 1989).

This script:
  1. fits a three-segment polyline (condyle end -> angle -> parasymphysis -> anterior cut) to the
     existing fibula mesh, so the segments stay where the published OPG put them;
  2. voxel-remeshes the (non-watertight) web mesh so it can be cut cleanly;
  3. splits it on the two bisector planes with a 0.6 mm gap (the cut faces stay visible);
  4. decimates each piece and writes fibula.glb (metres), to be swapped into scc-case.glb with
     tools/glb/replace-mesh.mjs.

Run: python3 -I tools/head-neck/fibula_osteotomies.py public/head-neck/models/scc-case.glb <out dir>
Needs: trimesh DracoPy numpy scipy scikit-image manifold3d fast_simplification
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy.optimize import minimize

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'print'))
from manifold_tools import split_by_plane  # noqa: E402

GAP_MM = 0.6          # distance between the cut faces (BRP's default is a touching fit; a small gap keeps the cut visible)
PITCH_MM = 0.3        # voxel size for the remesh
TARGET_FACES = 15000  # total for the three pieces (the old mesh had 13 816)

src, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)
scene = trimesh.load(src, force='scene', process=False)
fib = scene.geometry['right_fibula.001']
V = fib.vertices * 1000.0

# End points: condylar end (highest point of the posterior limb) and the anterior cut (most medial point).
A = V[np.argmax(V[:, 1] - 10 * np.abs(V[:, 0] + 47))]
D = V[np.argmax(V[:, 0])]


def dist_to_polyline(P, pts):
    best = np.full(len(P), np.inf)
    for p, q in zip(pts[:-1], pts[1:]):
        d = q - p
        t = np.clip(((P - p) @ d) / (d @ d), 0, 1)
        best = np.minimum(best, np.linalg.norm(P - (p + t[:, None] * d), axis=1))
    return best


def cost(x):
    r = dist_to_polyline(V, np.array([A, x[:3], x[3:], D]))
    return r.var() + 1e-3 * max(0.0, r.max() - 12) ** 2


res = minimize(cost, np.array([-24, 1505, 62, -10, 1501, 72.0]), method='Nelder-Mead', options=dict(maxiter=4000, xatol=1e-3, fatol=1e-7))
B, C = res.x[:3], res.x[3:]
axes = [(B - A), (C - B), (D - C)]
axes = [a / np.linalg.norm(a) for a in axes]
bisectors = [(axes[0] + axes[1]), (axes[1] + axes[2])]
bisectors = [b / np.linalg.norm(b) for b in bisectors]  # bisector plane normal = mean of the two axis directions
angles = [float(np.degrees(np.arccos(np.clip(axes[i] @ axes[i + 1], -1, 1)))) for i in range(2)]

vox = fib.voxelized(pitch=PITCH_MM / 1000).fill()
remesh = vox.marching_cubes.apply_transform(vox.transform)  # marching cubes returns voxel-index space
remesh = trimesh.smoothing.filter_taubin(remesh, iterations=8)
remesh.vertices *= 1000.0  # mm for the cuts
assert remesh.is_watertight, 'remesh is not watertight'

pieces = []
rest = remesh
for corner, n in ((B, bisectors[0]), (C, bisectors[1])):
    before, after = split_by_plane(rest, corner - n * GAP_MM / 2, -n)   # 'before' = proximal side of the gap
    _, rest = split_by_plane(after, corner + n * GAP_MM / 2, -n)        # drop the slab, keep the distal remainder
    pieces.append(before)
pieces.append(rest)
# keep only the main body of each piece (the slab split can leave slivers)
pieces = [max(p.split(only_watertight=False, repair=False), key=lambda m: len(m.faces)) for p in pieces]
total = sum(len(p.faces) for p in pieces)
for p in pieces:
    p_simpl = p.simplify_quadric_decimation(face_count=max(500, int(TARGET_FACES * len(p.faces) / total)))
    p.vertices, p.faces = p_simpl.vertices, p_simpl.faces
merged = trimesh.util.concatenate(pieces)
merged.vertices /= 1000.0  # back to metres (glTF)
merged.visual = trimesh.visual.ColorVisuals(merged)
out = trimesh.Scene({'right_fibula.001': merged})
out.export(out_dir / 'fibula.glb')

report = {
    'corners_mm': {'condyle_end': A.round(2).tolist(), 'angle': B.round(2).tolist(), 'parasymphysis': C.round(2).tolist(), 'anterior_cut': D.round(2).tolist()},
    'segment_lengths_mm': [round(float(np.linalg.norm(b - a)), 1) for a, b in ((A, B), (B, C), (C, D))],
    'bend_angles_deg': [round(a, 1) for a in angles],
    'gap_mm': GAP_MM, 'pieces_faces': [len(p.faces) for p in pieces], 'pieces_watertight': [bool(p.is_watertight) for p in pieces],
    'fit_radius_mm_mean_std': [round(float(dist_to_polyline(V, np.array([A, B, C, D])).mean()), 2), round(float(dist_to_polyline(V, np.array([A, B, C, D])).std()), 2)],
}
(out_dir / 'fibula_report.json').write_text(json.dumps(report, indent=1))
print(json.dumps(report, indent=1))
