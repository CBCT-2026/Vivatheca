# Periodontitis series (healthy, Stages I to IV)

Five 3D models of the same adult lower jaw with 14 teeth: healthy, and periodontitis Stages I to IV from the 2017 World Workshop classification (Tonetti, Greenwell and Kornman 2018, doi:10.1002/JPER.18-0006). Web page: `public/periodontitis/` (served at `/periodontitis/`). All sources are listed on the page.

## Rebuild
Needs Python 3.11+ with `trimesh`, `scipy`, `scikit-image`, `rtree`, and `npx` (for `@gltf-transform/cli` 4.1.1: simplify and Draco).

1. Base meshes: the Z-Anatomy extraction in the project files (`head-neck-recon/z-anatomy-base/`, `mandible_bone_only.stl` and `mandible_lower_teeth_only.stl`, smoothed versions).
2. `python3 prep.py <z-anatomy-base dir> <work dir>`: splits the 14 teeth (FDI 31-37, 41-47) and voxelises the bone (0.25 mm, filled) to `bone_vox.npz`.
3. `python3 build.py <work dir> <out dir>`: one GLB per stage (bone, teeth, lost bone) and full-resolution STLs. Stage settings are in `stages.json`.
4. `python3 finish.py <out dir> public/periodontitis`: simplify, exact colours, Draco GLBs to `models/`, print zips (bone and teeth STL plus `print-readme.txt`) to `downloads/`.

## Method
- CEJ per tooth: cusp tip minus Wheeler's crown length for that tooth, scaled to the Z-Anatomy tooth's length (Nelson 2020).
- Healthy bone crest: 1.5 mm below the CEJ (Hausmann 1991: 0.4 to 1.9 mm in health), raised between teeth by Wheeler's CEJ curvature (incisors 2-3 mm, canine 1-2.5 mm, back teeth 0-1 mm). The crest is smoothed (1.5 mm) so neighbouring teeth join without steps, and rises away from the teeth so the jaw body and ramus are not cut.
- Each stage lowers the crest by a percentage of root length measured from the healthy crest: I 10%, II 25%, III 40%, IV 60% (inside the bone loss bands of Tonetti 2018 Table 2: <15%, 15-33%, middle third and beyond).
- Stage III adds two vertical defects (4 mm and 3.5 mm extra, about 2 mm wide) and opens the molar furcations through the 40% loss.
- Stage IV removes 36, 37, 46 and 41 (healed and lowered ridge), tips 47 forward by 15 degrees and adds two vertical defects.
- Lost bone = healthy bone minus stage bone (not counting the teeth), shown see-through red.

## Limits
Bone only: gum, attachment loss and probing depths are not modelled. Bone loss is generalised and even; real disease is uneven. Percentages are measured vertically. Print STLs are simplified and the bone may need a repair pass in the slicer.

## Colours
Bone: linear (0.6724, 0.5972, 0.4969), roughness 0.7, as the latest wisdom tooth model. Teeth: #E3DCD3, linear (0.768, 0.716, 0.651), slightly lighter than bone. Lost bone: linear (0.80, 0.16, 0.14), 35% opacity.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
