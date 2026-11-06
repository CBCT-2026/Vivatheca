# Fixation standard: plates and screws

Every Vivatheca model that shows bone held with plates and screws uses this component, so plates look real and sit where surgeons put them. The `/fixation/` page shows the standard to visitors: a seven-step 3D demonstration, three diagrams and the clinician table.

## Files

| File | What it does |
| --- | --- |
| `fixation.py` | The component: plate systems, hole layouts, flat plate (shapely outline, extruded, countersunk holes cut with manifold3d), screw mesh, bending onto bone, screw lengths. |
| `demo.py` | The seven GLBs on `/fixation/` (Z-Anatomy mandible from `tools/orthognathic` `parts.npz`). `python3 tools/fixation/demo.py parts.npz out && node tools/glb/finish.mjs out/*.glb --out public/fixation/models` |
| `diagrams.py` | Wordless numbered SVGs in `public/fixation/diagrams/` (plate and screw, placing steps, orthognathic plate positions). Text lives in the page captions (EN + JA). |
| `../head-neck/replate.py` | Re-plates an existing head and neck case GLB in place: finds the old plates and screw holes, rebuilds them with this component, then `tools/glb/replace-meshes.mjs` swaps the meshes. |

## Systems (all mm)

| System | Plate | Screws | Source |
| --- | --- | --- | --- |
| `MINI_2_0` | 1.0 thick; lobe (ring) 4.5 wide, bridge 1.9 wide (estimate); hole 2.15, countersink 3.3 | 2.0 thread, 1.5 core, dome head 3.1 × 1.3 with cross recess; monocortical 5 (shorter where the bone is thinner: `min(5, max(3, floor(depth - 1)))`) | AO 2014 (Mini Plate 2.0: 1.0–2.0 thick, 2.0 screws); Champy 1978; Worthington & Champy 1987 |
| `RECON_2_0` | 1.5 thick (estimate within 1.0–2.0), continuous bar with lobes, 6.5 hole pitch | 2.0, bicortical: `ceil(depth + seat + 1)` | AO 2014; Schiel 2013 (bicortical locking screws in reconstruction plates) |
| `RECON_2_4` | 2.5 thick | 2.4 locking, bicortical; at least 3–4 screws per segment | DePuy Synthes MatrixMANDIBLE IFU SE_530350 AE (2015); AO 2014 |

## Placement rules

- Miniplates on Champy's lines: monocortical, below the tooth apices, away from the inferior alveolar canal and the mental foramen.
- Le Fort I: four L-plates (`l_plate`), piriform aperture and zygomaticomaxillary buttress each side (Beyler 2021; two plates also stable).
- BSSO: one 4-hole extended miniplate (`straight(4, gap=9)`) each side across the buccal step (Oguz 2011); bicortical screws an equally stable alternative (Al-Moraissi & Ellis 2016).
- Genioplasty: one central pre-bent 4-hole chin plate (`chin_plate`), two screws in each segment (Gulsever 2025).
- Fibula flap: miniplates at every junction, at least two screws each side, matching the case radiograph; evidence on miniplates vs a reconstruction bar is mixed (Sobti 2022; Chang 2023).
- Rim resection or segmental defect: reconstruction plate along the lower border (`make_plate_along` for curved plates), bicortical screws, 3–4 per segment.
- At least two screws on each side of every cut. Never leave a hole on a cut line: merge holes closer than two lobe widths.

## Using it in a new model

```python
sys.path.insert(0, 'tools/fixation'); import fixation as fx
info = {}
plate, screws = fx.make_plate([bone_a, bone_b], centre, along, out, fx.straight(4, pitch=5.5, gap=9.0), fx.MINI_2_0, info=info)
# curved plate: fx.make_plate_along(bones, hole_points, out_vectors, fx.RECON_2_0, bicortical=True, info=info)
```

Meshes in mm. `centre` sits on the bone surface over the cut, `along` runs along the plate, `out` points away from the bone. The plate is bent onto a height map of the bone (ray cast; highest bone within 1.5 mm, then Gaussian-smoothed) so it bridges steps; screws run along the local normal. `info` collects screw lengths and positions for the build report. Material names: `plate`, `screw` (titanium grey, see the colour standard). Cite the placement source on the page, link to `/fixation/`, and record estimates as estimates.
