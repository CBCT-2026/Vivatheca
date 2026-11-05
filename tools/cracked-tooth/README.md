# Cracked tooth series

Four 3D models of one lower right first molar (46): healthy (the matched normal), cracked (crack limited to the crown), the cracked tooth with a direct composite resin MOD filling, and the cracked tooth with a full-coverage crown. Each comes whole and cut in half buccolingually, and each has a looping "bite" animation (glTF morph target): the cracked and filled teeth tip apart about the bottom of the crack, the crowned and healthy teeth do not. Web page: `public/cracked-tooth/` (served at `/cracked-tooth/`). It reuses the model viewer, Draco decoder, style sheet and theme toggle from `public/development/`.

## Rebuild
Needs Python 3.11+ with `trimesh`, `rtree`, `scipy`, `scikit-image`, `fast-simplification`, and `npx` for Draco.

1. Base mesh: `mandible_lower_teeth_only.stl` from the smoothed Z-Anatomy head meshes (project files, `head-neck-recon/z-anatomy-base/`). Shell 3 of the right first molar is the outer tooth surface, shell 1 the pulp.
2. `python -I prep_tooth.py mandible_lower_teeth_only.stl tooth.npz`: tooth frame (z long axis, x mesial, y lingual, z = 0 at the CEJ, set 7.5 mm below the highest cusp tip) and signed distance fields on a 0.06 mm grid.
3. `python -I build.py tooth.npz out`: eight GLBs, four print zips (STL, 3x) and `print-notes.txt`.
4. `sh finish.sh out public/cracked-tooth`: Draco-compress the GLBs into `models/` and copy the zips into `downloads/`.

## Method and limits
All dimensions are constants at the top of `build.py` and are listed on the page ("For clinicians"). Crack width (0.24 mm) and the bite movement (6 degrees each side) are exaggerated so they can be seen. Cavity, crown preparation and enamel thickness are typical teaching values, not taken from one source. The crown and filling print parts are 0.08 mm (0.24 mm at 3x) smaller than their space so they lift out.

## Colours
Tooth: linear (0.770, 0.718, 0.648), the lighter tooth tint used with the wisdom tooth bone colour. Filling blue, crown grey-blue, pulp red, crack near-black brown, force arrows orange, crown "holds" arrows teal. Cut faces: enamel lighter, dentine darker.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
