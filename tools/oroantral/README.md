# Oroantral communication (OAC) and fistula (OAF) model

Seven 3D stages of the right upper jaw, life size, cut front to back through the middle of the upper first molar. Web page: `public/oroantral/` (served at `/oroantral/`). It shares the model viewer, Draco decoder and stylesheet with `public/development/`.

| Stage | File | What it shows |
| --- | --- | --- |
| 1 Normal | `normal.glb` | Matched normal: 3 mm of bone between the first molar root tips and the sinus |
| 2 At risk | `risk.glb` | Low sinus floor: first and second molar root tips 4 mm inside the sinus, under 0.5 mm of bone |
| 3 OAC | `oac.glb` | First molar removed with the thin bone over its roots: socket opens into the sinus |
| 4 OAF | `oaf.glb` | Weeks later, untreated: socket filled in around a 3.2 mm tunnel lined with epithelium (0.6 mm); swollen sinus lining |
| Blood clot | `clot.glb` | Clot fills the socket and plugs the opening (small openings) |
| Cheek flap | `flap.glb` | Buccal advancement flap: cheek-side gum over the socket, clot underneath |
| Fat pad | `bfp.glb` | Buccal fat pad pedicled from behind the maxilla, spread over the socket |

## Rebuild
Needs Python 3.11 with `trimesh`, `scipy`, `scikit-image`, `fast-simplification`, `matplotlib`, and `npx` for Draco.

1. `python -I explore.py`: splits `skull_cranium_with_upper_teeth.stl` (project files, `head-neck-recon/z-anatomy-base/`, smoothed version) into the right maxilla, palatine and zygomatic bones and the right upper first and second molars (`work/*.stl`).
2. `python -I vox.py`: voxelises them at 0.25 mm (`work/*.npy`).
3. `python -I build.py work out`: builds the stages as GLB and `labels.json` (label anchor points, copied into `public/oroantral/viewer.js`).
4. `python3 finish_glb.py out public/oroantral/models`: exact colours, then Draco.

## Method and limits
- The Z-Anatomy (BodyParts3D) maxilla has only a small cavity, so the sinus is carved inside the maxilla with a 1.5 mm wall, lateral to the nose and below the orbit floor. Its floor is a bowl, lowest over the molars.
- Sinus floor heights were set by hand within published ranges (mean root tip to floor distances of about 0 to 4 mm at the molars; Eberhardt 1992, Kwak 2004, Estrela 2016).
- The gum is a 2.25 mm layer on the mouth side of the bone, up to 11 mm above the crest.
- The opening, tunnel, clot, flap and fat pad are illustrations, not measurements. Every post-extraction stage uses the same socket so they can be compared, although in practice small openings are the ones that heal with a clot.
- Surfaces come from a lightly blurred voxel field (marching cubes), then simplified.
- Labels in `viewer.js` face the cut face (`data-normal 0 0 1`), except the fat pad stalk, which faces the cheek.

## Colours (linear RGB)
Bone 0.6724, 0.5972, 0.4969 (latest wisdom tooth model). Teeth 0.768, 0.716, 0.651 (slightly lighter, as in the head and neck series). Gum 0.70, 0.25, 0.28. Sinus air 0.18, 0.48, 0.86 at 38% opacity. Swollen lining 0.80, 0.22, 0.16. Fistula lining 0.62, 0.05, 0.10. Clot 0.26, 0.015, 0.02. Flap 0.95, 0.52, 0.42. Fat 0.93, 0.62, 0.08.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
