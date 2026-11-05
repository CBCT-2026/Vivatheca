# Dental development series (ages 6 to 12)

Seven 3D models of the right side of a child's upper and lower jaw, at 6.5, 7.5 ... 12.5 years, with the cheek side of the bone cut away to show baby teeth and growing adult teeth (the layout of the Schour–Massler chart). Web page: `public/development/` (served at `/development/`).

## Rebuild
Needs Python 3.11 with `bpy` (Blender 5.0 as a module), `trimesh`, `manifold3d`, `shapely`, `scipy`, and `npx` for Draco.

1. Get `Startup.blend` from Z-Anatomy (github.com/Z-Anatomy/Models-of-human-anatomy, inside `Z-Anatomy.zip`).
2. `python -I extract.py Startup.blend parts.npz`: right-side teeth 1-7, mandible, right maxilla and palatine bone.
3. `python -I prep_bone.py parts.npz bone.npz`: voxel remesh (0.35 mm) so the bone is watertight.
4. `python simplify_bone.py bone.npz bone_mm.npz`.
5. `python generate.py <dir with parts.npz and bone_mm.npz> out`: GLB per age plus STL print parts at 1.0x and 1.5x, and `print-notes.txt`.
6. `python3 finish_glb.py out public/development/models`: exact colours, then Draco.

## Method and limits
See the docstring at the top of `generate.py`. In short:
- Timings: `timings.csv`, typical textbook ages. **Not yet checked against the London Atlas tables** (AlQahtani 2010), which could not be downloaded from the build machine.
- Baby teeth are permanent teeth resized to typical baby tooth widths and lengths (Wheeler averages), placed side by side along the arch.
- Child jaw: the part behind the first molars is shorter (0.80 at 6.5 to 0.92 at 12.5) and the ramus lower (0.85 to 0.94). Values are estimates, to be checked against growth norms.
- For printing, any baby tooth that did not touch bone was nudged up to 3 mm towards the tongue and up to 4 mm deeper; see `print-notes.txt`.

## Colours
Bone: linear (0.6724, 0.5972, 0.4969), roughness 0.7, the same as the latest wisdom tooth model. Adult teeth: yellow (0.768, 0.624, 0.102). Baby teeth: blue (0.10, 0.22, 0.62). Yellow and blue follow the Schour–Massler chart.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
