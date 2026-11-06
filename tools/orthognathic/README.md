# Orthognathic surgery series

Seven 3D models of one adult skull: normal bite (Class I), Class II before and after a bilateral sagittal split osteotomy (BSSO) advancement, and Class III before and after bimaxillary surgery (Le Fort I advancement + BSSO setback). Each after model also has a version with a genioplasty (`*-after-genio.glb`: Class II advancement 5 mm, Class III setback 4 mm). Web page: `public/orthognathic/` (served at `/orthognathic/`). It reuses the model viewer, Draco decoder, style sheet and theme toggle from `public/development/`.

## Rebuild
Needs Python 3.11 with `bpy` (Blender 5 as a module), `trimesh`, `manifold3d`, `networkx`, `rtree`, `scipy`, and `npx` for Draco.

1. Base meshes: the smoothed Z-Anatomy head meshes made for the head and neck series (`skull_cranium_with_upper_teeth.stl`, `mandible_bone_only.stl`, `mandible_lower_teeth_only.stl`, millimetres, Z up, front = -Y). In the project files at `head-neck-recon/z-anatomy-base/`.
2. `python -I prep.py <z-anatomy-base dir> parts.npz`: splits the skull into cranium, upper teeth and the bones the Le Fort I cut goes through (maxillae, palatine bones, vomer; inferior conchae kept apart and not cut), voxel-remeshes the mandible so it is watertight, fixes inside-out shells and decimates for the web.
3. `python -I generate.py parts.npz out`: the seven GLBs (also needs `shapely` and `mapbox_earcut` for the plates) and `build_report.json`.
4. `python3 finish_glb.py out public/orthognathic/models`: exact material values, then Draco.

## Method and limits
See the docstring at the top of `generate.py` and the "For clinicians" section of the page. In short:
- Deformities are smooth warps of the normal skull (Class II: mandibular body 6 mm back; Class III: maxilla 3 mm back, mandibular body 5 mm forward). Teeth move rigidly. Before models open the mouth about the condyles until upper and lower teeth stop intersecting (Class III: 2.75 degrees; Class II: 0).
- Surgery reverses the deformity exactly, so after models are in the normal occlusion. Cuts are planes placed from measurements on this skull (constants at the top of `generate.py`): Le Fort I ~4 mm above the upper canine apex (z 1562 at the front, 1565 at the back); BSSO medial cut 5 mm above the occlusal plane at the second molar, sagittal split lateral to the roots, buccal cut between lower first and second molar, short lingual split (Hunsuck) to the lower border in front of the angle.
- Setback: the proximal segment is trimmed where the moved distal segment overlaps it.
- Cut surfaces plus a 0.8 mm band of outer surface along each cut are coloured red; specks under 3 mm2 are dropped.
- Chin height from published CBCT norms (all models): the Z-Anatomy mental foramen sits 11.1 mm above the lower border (Class I normal-face CBCT mean 14.98 ± 0.63 mm, Bagheri et al. 2023, doi 10.1186/s12903-023-03719-z). `lengthen_chin` lowers the bottom of the mandible (bone below z 1502, and always the lowest 3 mm band) by one even amount D for |x| <= 24 mm, fading to 0 at |x| 40 mm and towards the ramus; D = 3.9 mm puts the foramen at 14.98 mm. The script then checks ANS-Me / N-Me against the Class I normal-face CBCT controls of He et al. 2025 (53.77 ± 0.82 %, doi 10.1186/s12903-025-06845-y): 54.3 % (was 52.7 %). Nasion and ANS are fixed points measured on this skull by ray casting (constants in `generate.py`). Version 0.2 instead stretched the midline 12.5 mm to reach Ii-Me 44.78 mm (Arruda et al. 2012), which on this skull gave ANS-Me / N-Me 57.6 % (long face) and a pointed chin. See `chin` in build_report.json.
- Genioplasty: one plane 4 mm below the lower canine apex (Mohammad et al. 2010: 4-5 mm, doi 10.4103/0975-5950.69147; Kim et al. 2014: 5 mm, doi 10.1097/GOX.0000000000000169), sloping down backwards 3 mm over 18 mm so it exits the lower border at the premolars; 13.3 mm below the mental foramen (Lin et al. 2020 safe distance 9.12 mm at 0.0005% risk; Hwang et al. 2005: canal loop 4.5 mm below the foramen). Segment ~1.2 cm3, about 5.7 mm tall at the midline (the Z-Anatomy lower front roots reach close to the border), moved along the plane (Class II 5 mm forward, Class III 4 mm back). The chin plate's lower holes sit 3 mm below the cut so the screws stay in this short segment.
- Plates and screws: built with the shared fixation component (`tools/fixation/`, see its README for sizes and sources): 2.0 mm miniplates 1.0 mm thick with countersunk holes and cross-head monocortical screws, bent onto a smoothed height map of the bone. Le Fort I: four L-plates (piriform rim and zygomaticomaxillary buttress each side; Beyler 2021); BSSO: one 4-hole extended plate each side across the buccal step (Oguz 2011); genioplasty: one central 4-hole chin plate, two screws in each segment (Gulsever 2025). Screw lengths and positions are in `build_report.json`.
- Not modelled: soft tissue, inferior alveolar and mental nerves, condylar seating, occlusal plane rotation, vertical changes, asymmetry.

## Materials (glTF names)
`bone` and `moved` (same colour; the page can tint `moved`), linear (0.6724, 0.5972, 0.4969), roughness 0.7, as the latest wisdom tooth model; `teeth` slightly lighter (0.7682, 0.7157, 0.6514), as the head and neck series; `cut` red; `plate`, `screw` titanium grey; `before` = the moved pieces in their pre-surgery position, see-through blue, alpha 0 until the page shows it.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
