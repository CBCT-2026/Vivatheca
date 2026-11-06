"""Rebuild the plates and screws in a head and neck case model with the shared fixation component.

The case models were built with simple box plates and disc screws. This keeps every hole where it was
(each was placed to match the case's own radiograph or photo), and rebuilds the plate and screws around
those holes with tools/fixation (realistic plate outline, countersunk holes, cross-recess screws along
the bone normal, plate bent onto the bone). Holes that the case left empty stay empty.

Usage:
  node tools/glb/decode.mjs public/head-neck/models/scc-case.glb /tmp/scc.raw.glb
  python3 tools/head-neck/replate.py /tmp/scc.raw.glb scc /tmp/scc-parts
  node tools/glb/replace-meshes.mjs public/head-neck/models/scc-case.glb --set plate=/tmp/scc-parts/plate.glb \
       --set screws=/tmp/scc-parts/screws.glb [--drop plate_holes] --out public/head-neck/models/scc-case.glb
Case settings (plate system, bone parts, screw type) are in CASES below, with their sources.
Units in these GLBs are metres (converted to mm here and back); glTF axes: +Y up, +Z front, -X the patient's right.
"""
import json, sys
from pathlib import Path
import numpy as np, trimesh
from scipy.sparse.csgraph import minimum_spanning_tree
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'fixation'))
import fixation as fx

CASES = {
    # Vergier 2024 (CC BY): the post-operative OPG shows miniplates at each junction -> 2.0 mm miniplates,
    # monocortical screws (Champy 1978; miniplate fixation of fibula flaps: Sobti 2022, Chang 2022).
    'scc': dict(system=fx.MINI_2_0, bones=['bone', 'fibula'], bicortical=False),
    # Sikri 2026 (CC BY): 2.0 mm, 9-hole titanium reconstruction plate along the lower border, six screws
    # (three at each end), middle holes empty. Reconstruction plates take bicortical screws (Schiel 2013).
    'ameloblastoma': dict(system=fx.RECON_2_0, bones=['bone'], bicortical=True, curved=True),
}


def node_meshes(scene):
    out = {}
    for node in scene.graph.nodes_geometry:
        T, g = scene.graph[node]
        m = scene.geometry[g].copy(); m.apply_transform(T); m.apply_scale(1000.0); out[node] = m
    return out


def main(src, case, outdir):
    cfg = CASES[case]; outdir = Path(outdir); outdir.mkdir(parents=True, exist_ok=True)
    nodes = node_meshes(trimesh.load(src))
    bones = [nodes[n] for n in cfg['bones']]
    bone_all = trimesh.util.concatenate(bones)
    # screws: each old screw is a head disc and a shank, two separate components
    comps = nodes['screws'].split(only_watertight=False)
    cen = np.array([c.centroid for c in comps])
    def elong(k):
        sv = np.linalg.svd(comps[k].vertices - cen[k], compute_uv=False); return sv[0] / sv[1]
    is_shank = np.array([elong(k) > 2.0 for k in range(len(comps))])  # shank: long and thin; head: flat disc
    heads, holes = np.where(~is_shank)[0], []
    for k in np.where(is_shank)[0]:
        axis = np.linalg.svd(comps[k].vertices - cen[k])[2][0]
        # the head on this shank: nearest head centre to the shank's axis line
        rel = cen[heads] - cen[k]; off = np.linalg.norm(rel - np.outer(rel @ axis, axis), axis=1)
        h = heads[int(np.argmin(off + 0.1 * np.abs(rel @ axis)))]
        if axis @ (cen[h] - cen[k]) < 0: axis = -axis
        holes.append((cen[h], axis, False))
    if 'plate_holes' in nodes:
        for c in nodes['plate_holes'].split(only_watertight=False):
            holes.append((c.centroid, None, True))
    # group holes by the old plate they sit on
    plates_old = nodes['plate'].split(only_watertight=False)
    groups = {}
    for p, ax, empty in holes:
        k = int(np.argmin([trimesh.proximity.closest_point(pl, [p])[1][0] for pl in plates_old]))
        groups.setdefault(k, []).append((p, ax, empty))
    info, plates, screws = {'case': case, 'system': cfg['system'].name, 'merged_holes': 0}, [], []
    for k in sorted(groups):
        g = groups[k]
        # two old holes closer than one lobe (overlapping rings, e.g. the corner of an L-plate) become one hole
        keep_ = []
        for h in g:
            if any(np.linalg.norm(h[0] - q[0]) < 2 * cfg['system'].lobe for q in keep_): info['merged_holes'] += 1; continue
            keep_.append(h)
        g = keep_
        P = np.array([h[0] for h in g])
        axes = [h[1] for h in g if h[1] is not None]
        out = np.mean(axes, 0); out /= np.linalg.norm(out)
        centre = P.mean(0)
        Q = P - centre; Q -= np.outer(Q @ out, out)
        along = np.linalg.svd(Q)[2][0]
        along, out_, side = fx._frame(along, out)
        uv = [(float(q @ along), float(q @ side)) for q in Q]
        D = np.linalg.norm(P[:, None] - P[None], axis=2)
        mst = minimum_spanning_tree(D).tocoo()
        links = [(int(a), int(b)) for a, b in zip(mst.row, mst.col)]
        empty = {i for i, h in enumerate(g) if h[2]}
        if cfg.get('curved'):  # one chain of holes following the jaw: order along the chain, bend along it
            order = [int(np.argmin(Q @ along))]
            while len(order) < len(g):
                d = D[order[-1]].copy(); d[order] = np.inf; order.append(int(d.argmin()))
            ax = [g[i][1] if g[i][1] is not None else out for i in order]
            pts = [trimesh.proximity.closest_point(bone_all, [P[i]])[0][0] for i in order]
            emp = {j for j, i in enumerate(order) if i in empty}
            pl, sc = fx.make_plate_along(bones, pts, ax, cfg['system'], empty=emp, bicortical=cfg['bicortical'], info=info)
            plates.append(pl); screws += sc; continue
        # the old disc screws sat ~1 mm above the bone: put the plate centre on the bone surface
        centre = trimesh.proximity.closest_point(bone_all, [centre])[0][0]
        pl, sc = fx.make_plate(bones, centre, along, out_, (uv, links), cfg['system'], empty=empty,
                               bicortical=cfg['bicortical'], info=info)
        plates.append(pl); screws += sc
    for name, meshes in (('plate', plates), ('screws', screws)):
        m = trimesh.util.concatenate(meshes); m.apply_scale(0.001)
        trimesh.Scene({name: m}).export(outdir / f'{name}.glb')
    info['faces'] = {'plate': int(sum(len(p.faces) for p in plates)), 'screws': int(sum(len(s.faces) for s in screws))}
    (outdir / 'report.json').write_text(json.dumps(info, indent=1))
    print(json.dumps(info))


if __name__ == '__main__':
    main(*sys.argv[1:4])
