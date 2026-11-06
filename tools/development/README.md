# Dental development series (ages 6 to 12)

Seven 3D models of the right side of a child's upper and lower jaw, at 6.5, 7.5 ... 12.5 years, with the cheek side of the bone cut away to show baby teeth and growing adult teeth (the layout of the Schour–Massler chart). Web page: `public/development/` (served at `/development/`).

## Rebuild
Needs Python 3.11 with `bpy` (Blender 5.0 as a module), `trimesh`, `manifold3d`, `shapely`, `scipy`, and `npx` for Draco.

1. Get `Startup.blend` from Z-Anatomy (github.com/Z-Anatomy/Models-of-human-anatomy, inside `Z-Anatomy.zip`).
2. `python -I extract.py Startup.blend parts.npz`: right-side teeth 1-7, mandible, right maxilla and palatine bone.
3. `python -I prep_bone.py parts.npz bone.npz`: voxel remesh (0.35 mm) so the bone is watertight.
4. `python simplify_bone.py bone.npz bone_mm.npz`.
5. `python generate.py <dir with parts.npz and bone_mm.npz> out`: GLB per age plus STL print parts at 1.0x and 1.5x, `print-notes.txt` and `tooth-positions.txt` (copy it here). Needs `rtree` too. About 1 minute.
6. `python3 finish_glb.py out public/development/models`: exact colours, then Draco.

## Method and limits
See the docstring at the top of `generate.py`. In short:
- Timings: `timings.csv`, typical ages, checked 5 Nov 2026 against the ADA eruption charts, the AAPD chronology table and the AlQahtani 2010 London Atlas paper (see the CSV header). The QMUL atlas diagrams themselves were not viewed.
- Baby teeth are permanent teeth resized to typical baby tooth widths and lengths (Wheeler averages), placed side by side along the arch.
- Child jaw: `jaw_growth.csv` holds yearly mean ramus height (Co-Go) and body length (Go-Pg) for boys and girls from Riolo et al. 1974 (Michigan atlas, read from the atlas data files at github.com/MU-CGCS/Riolo_CF_Growth_Data; printed tables not checked) and adult values at about 17 years from West & McNamara 1999 (doi 10.1016/s0889-5406(99)70274-x). Child values are converted from 12.92% to 8% radiographic enlargement to match the adult values; half-year stages average the neighbouring years; boys and girls are averaged. Ratios: ramus 0.756 (6.5) to 0.891 (12.5), body 0.803 to 0.936. The ramus is scaled in height to its ratio; the body length shortfall (measured on the Z-Anatomy mandible, side-on) is all taken from behind the first molar, where the retromolar space grows (Nguyen et al. 2022, doi 10.1016/j.archoralbio.2022.105547). `print-notes.txt` logs target and achieved ratios per age. The upper jaw behind the first molar is shortened by the same factor (estimate). Kelly et al. 2017 (doi 10.1016/j.archoralbio.2017.01.018) supports the later, mostly pubertal growth of the ramus.
- Growing adult teeth (since 6 Nov 2026): every unerupted tooth stays fully inside the jaw. The jaw for this check is the Z-Anatomy bone with the adult tooth sockets filled. While its crown forms, a tooth sits in the shallowest place along its long axis (moved at most 3 mm towards the tongue) where it is fully inside bone and clear of the baby teeth; eruptive movement starts with root formation (Marks & Schroeder 1996, doi 10.1002/(SICI)1097-0185(199606)245:2<374::AID-AR18>3.0.CO;2-M), the tip reaches the bone crest at age e - 1 (London Atlas alveolar emergence) and is 2.73 mm above the crest at gum emergence (Gargiulo et al. 1961, doi 10.1902/jop.1961.32.3.261). Successors lie on the tongue side of / between the roots of their baby teeth (Schour & Massler 1941; Nanci, Ten Cate's Oral Histology 2018). Where the adult jaw is too thin, a 1 mm crypt wall (estimate) is added over the tooth; it shows as a bulge (cf. Ericson & Kurol 1986, doi 10.1111/j.1600-0528.1986.tb01526.x). Lower front teeth are kept at least 0.3 mm off the midline cut. Gum emergence to biting level takes 1.5 years (estimate). All depths per age: `tooth-positions.txt` (copied from the build output).
- For printing, any baby tooth that did not touch bone was nudged up to 3 mm towards the tongue and up to 4 mm deeper; see `print-notes.txt`.

## Colours
Bone: linear (0.6724, 0.5972, 0.4969), roughness 0.7, the same as the latest wisdom tooth model. Adult teeth: yellow (0.768, 0.624, 0.102). Baby teeth: blue (0.10, 0.22, 0.62). Yellow and blue follow the Schour–Massler chart.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.
