"""Step-by-step 3D demonstration of placing a miniplate and screws (the /fixation/ page).

One adult mandible (Z-Anatomy via tools/orthognathic/prep.py parts.npz; CC BY-SA 4.0), left side of the body
around the first and second molars, cut by one vertical plane between the first and second molar (the same
position as the buccal cut of the BSSO models). A 4-hole extended 2.0 mm miniplate crosses the cut at the
height of the orthognathic BSSO plate, with monocortical 2.0 mm screws (tools/fixation). The steps follow the
order in the DePuy Synthes MatrixMANDIBLE instructions for use (2015): line up the bone, contour and position
the plate, drill the first hole at a right angle to the plate, measure, insert the screw, then drill and place
the others.

Run: python3 tools/fixation/demo.py parts.npz out   then   node tools/glb/finish.mjs out/*.glb --out public/fixation/models
"""
import json, sys
from pathlib import Path
import numpy as np, trimesh, manifold3d as mf
sys.path.insert(0, str(Path(__file__).resolve().parent))
import fixation as fx

P = np.load(sys.argv[1]); OUT = Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
part = lambda n: trimesh.Trimesh(P[n + '_v'].astype(float), P[n + '_f'], process=True)
to_mf, from_mf = fx._to_mf, fx._from_mf

def crop(m):
    M = to_mf(m)
    for n, d in (((1, 0, 0), 12.0), ((0, 1, 0), -74.0), ((0, -1, 0), 30.0), ((0, 0, -1), -1545.0)):
        M = M.trim_by_plane(list(n), d)  # keep x > 12, -74 < y < -30, z < 1545 (no ramus)
    return from_mf(M)

Y_CUT = -50.0  # between the lower first and second molar (as Y_BUCCAL in tools/orthognathic/generate.py)
bone, teeth = crop(part('mandible')), crop(part('lower_teeth'))
Bm, Tm = to_mf(bone), to_mf(teeth)
front_b, back_b = from_mf(Bm.trim_by_plane([0, -1, 0], -Y_CUT)), from_mf(Bm.trim_by_plane([0, 1, 0], Y_CUT))
front_t, back_t = from_mf(Tm.trim_by_plane([0, -1, 0], -Y_CUT)), from_mf(Tm.trim_by_plane([0, 1, 0], Y_CUT))

def split_cut(m):
    """Faces on the cut plane -> 'cut' (red)."""
    tri = m.triangles; on = (np.abs(tri[:, :, 1] - Y_CUT) < 0.03).all(1)
    return m.submesh([np.where(~on)[0]], append=True), (m.submesh([np.where(on)[0]], append=True) if on.any() else None)

CENTRE = np.array([34.0, Y_CUT + 1.0, 1520.0]); ALONG = [0, 1, -0.05]; OUTV = [1, 0, 0]
info = {}
plate, screws = fx.make_plate([front_b, back_b], CENTRE, ALONG, OUTV, fx.straight(4, pitch=5.5, gap=9.0), fx.MINI_2_0, info=info)
holes = fx.straight(4, pitch=5.5, gap=9.0)[0]
order = [1, 2, 0, 3]  # first screw next to the cut, then across the cut, then the outer holes

def drill_at(k):
    """A 1.5 mm twist drill (pilot hole for a 2.0 mm screw) at a right angle to the plate in hole k."""
    s = screws[k]; ax = s.vertices.mean(0)  # screw centroid
    head_top = s.vertices[s.vertices[:, 0].argmax()]
    n = np.array(OUTV, float)
    d = trimesh.creation.cylinder(radius=0.75, height=30, sections=16)
    d.apply_translation([0, 0, 15 - 4.0]); d.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], n))
    tip = ax.copy(); tip[0] = head_top[0]
    d.apply_translation(tip); return d

def pilot(k, depth=5.0):
    s = screws[k]; c = s.vertices.mean(0); n = np.array(OUTV, float)
    h = trimesh.creation.cylinder(radius=0.8, height=depth, sections=16)
    h.apply_transform(trimesh.geometry.align_vectors([0, 0, 1], n)); top = c.copy(); top[0] = s.vertices[:, 0].max() - 1.0
    h.apply_translation(top - n * depth / 2); return h

GAP = 3.0
steps = {
    '1-cut': dict(shift=GAP),
    '2-lined-up': dict(),
    '3-plate': dict(plate=True),
    '4-drill': dict(plate=True, drill=[order[0]], pilots=[order[0]]),
    '5-first-screw': dict(plate=True, screws=[order[0]]),
    '6-all-screws': dict(plate=True, screws=order),
    '7-see-through': dict(plate=True, screws=order, clear=True),
}
COL = {'bone': ([0.6724, 0.5972, 0.4969, 1], 0.7, 0.0), 'teeth': ([0.8963, 0.855, 0.7758, 1], 0.45, 0.0),
       'cut': ([0.62, 0.08, 0.06, 1], 0.6, 0.0), 'plate': ([0.72, 0.74, 0.77, 1], 0.3, 0.6),
       'screw': ([0.45, 0.47, 0.5, 1], 0.35, 0.6), 'drill': ([0.55, 0.57, 0.6, 1], 0.25, 0.9),
       'hole': ([0.08, 0.06, 0.05, 1], 0.9, 0.0)}
Y_UP = np.array([[1, 0, 0, 0], [0, 0, 1, 0], [0, -1, 0, 0], [0, 0, 0, 1]], float)
CEN = np.array([34.0, Y_CUT, 1522.0])
for name, st in steps.items():
    out = {k: [] for k in COL}
    sh = st.get('shift', 0.0)
    move = [0, sh, -sh * 0.3]  # step 1: the back piece sits apart (and a little low) from the front piece
    for bm, tm, moved in ((front_b, front_t, False), (back_b, back_t, True)):
        body, cut = split_cut(bm); tm = tm.copy()
        if moved and sh:
            for m in (body, cut, tm):
                if m is not None: m.apply_translation(move)
        out['bone'].append(body); out['cut'].append(cut); out['teeth'].append(tm)
    if st.get('plate'): out['plate'].append(plate)
    for k in st.get('screws', []): out['screw'].append(screws[k])
    for k in st.get('drill', []): out['drill'].append(drill_at(k))
    for k in st.get('pilots', []): out['hole'].append(pilot(k))
    scene = trimesh.Scene()
    for key, ms in out.items():
        ms = [m for m in ms if m is not None and len(m.faces)]
        if not ms: continue
        m = trimesh.util.concatenate(ms); m.apply_translation(-CEN); m.apply_scale(0.001); m.apply_transform(Y_UP)
        c, r, mt = COL[key]
        clear = st.get('clear') and key in ('bone', 'teeth', 'cut')
        mat = trimesh.visual.material.PBRMaterial(name=key, baseColorFactor=[*c[:3], 0.28 if clear else 1.0], roughnessFactor=r,
                                                  metallicFactor=mt, alphaMode='BLEND' if clear else 'OPAQUE', doubleSided=bool(clear))
        m.visual = trimesh.visual.TextureVisuals(material=mat)
        scene.add_geometry(m, node_name=key, geom_name=key)
    scene.export(OUT / f'{name}.glb')
info['steps'] = list(steps)
json.dump(info, open(OUT / 'demo_report.json', 'w'), indent=1)
print(json.dumps(info))
