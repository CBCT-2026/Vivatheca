# Orthognathic surgery series

Five 3D models of one adult skull: normal bite (Class I), Class II before and after a bilateral sagittal split osteotomy (BSSO) advancement, and Class III before and after bimaxillary surgery (Le Fort I advancement + BSSO setback). Web page: `public/orthognathic/` (served at `/orthognathic/`). It reuses the model viewer, Draco decoder, style sheet and theme toggle from `public/development/`.

## Rebuild
Needs Python 3.11 with `bpy` (Blender 5 as a module), `trimesh`, `manifold3d`, `networkx`, `rtree`, `scipy`, and `npx` for Draco.

1. Base meshes: the smoothed Z-Anatomy head meshes made for the head and neck series (`skull_cranium_with_upper_teeth.stl`, `mandible_bone_only.stl`, `mandible_lower_teeth_only.stl`, millimetres, Z up, front = -Y). In the project files at `head-neck-recon/z-anatomy-base/`.
2. `python -I prep.py <z-anatomy-base dir> parts.npz`: splits the skull into cranium, upper teeth and the bones the Le Fort I cut goes through (maxillae, palatine bones, vomer; inferior conchae kept apart and not cut), voxel-remeshes the mandible so it is watertight, fixes inside-out shells and decimates for the web.
3. `python -I generate.py parts.npz out`: the five GLBs and `build_report.json`.
4. `python3 finish_glb.py out public/orthognathic/models`: exact material values, then Draco.

## Method and limits
See the docstring at the top of `generate.py` and the "For clinicians" section of the page. In short:
- Deformities are smooth warps of the normal skull (Class II: mandibular body 6 mm back; Class III: maxilla 3 mm back, mandibular body 5 mm forward). Teeth move rigidly. Before models open the mouth about the condyles until upper and lower teeth stop intersecting (Class III: 2.75 degrees; Class II: 0).
- Surgery reverses the deformity exactly, so after models are in the normal occlusion. Cuts are planes placed from measurements on this skull (constants at the top of `generate.py`): Le Fort I ~4 mm above the upper canine apex (z 1562 at the front, 1565 at the back); BSSO medial cut 5 mm above the occlusal plane at the second molar, sagittal split lateral to the roots, buccal cut between lower first and second molar, short lingual split (Hunsuck) to the lower border in front of the angle.
- Setback: the proximal segment is trimmed where the moved distal segment overlaps it.
- Cut surfaces plus a 0.8 mm band of outer surface along each cut are coloured red; specks under 3 mm2 are dropped.
- Plates: 4-hole strips, contoured by ray casting onto the bone (Le Fort I: piriform rim and zygomatic buttress each side; BSSO: one across the buccal step each side). Shapes are illustrative.
- Genioplasty was left out: the Z-Anatomy symphysis is ~25 mm tall and the lower canine apex sits ~5 mm above the lower border, so a cut "below the apices" is not possible on this mandible.
- Not modelled: soft tissue, inferior alveolar nerve, condylar seating, occlusal plane rotation, vertical changes, asymmetry.

## Materials (glTF names)
`bone` and `moved` (same colour; the page can tint `moved`), linear (0.6724, 0.5972, 0.4969), roughness 0.7, as the latest wisdom tooth model; `teeth` slightly lighter (0.7682, 0.7157, 0.6514), as the head and neck series; `cut` red; `plate`, `screw` titanium grey; `before` = the moved pieces in their pre-surgery position, see-through blue, alpha 0 until the page shows it.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
