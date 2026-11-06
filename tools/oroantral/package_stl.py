"""Zip the STL parts from build.py (out/stl/<stage>/) into print downloads, each with a README.
Run: python3 package_stl.py out/stl <out_dir> <scale>   e.g. scale 1.0 for public/oroantral/downloads,
1.5 for the larger copies kept in project files. Needs trimesh for scales other than 1.0."""
import sys, zipfile
from pathlib import Path

NAMES = {
    'normal': 'Stage 1, normal (for comparison)', 'risk': 'Stage 2, at risk: root tips in the sinus',
    'oac': 'Stage 3, oroantral communication (OAC)', 'oaf': 'Stage 4, oroantral fistula (OAF)',
    'clot': 'Repair: blood clot', 'flap': 'Repair: buccal advancement flap',
    'bfp': 'Repair: buccal fat pad', 'palatal': 'Repair: palatal rotation flap',
}
PARTS = {'bone': 'bone', 'teeth': 'teeth', 'gum': 'gum', 'clot': 'blood clot', 'flap': 'gum flap',
         'fat': 'fat pad', 'lining': 'swollen sinus lining', 'tract': 'fistula lining'}
src, dst, scale = Path(sys.argv[1]), Path(sys.argv[2]), float(sys.argv[3])
dst.mkdir(parents=True, exist_ok=True)
tag = f'{scale:.1f}x'
for stage, title in NAMES.items():
    files = sorted((src / stage).glob('*.stl'))
    parts = ', '.join(PARTS[f.stem.split('-', 1)[1]] for f in files)
    readme = f"""Vivatheca oroantral communication series: {title}.
Right upper jaw, cut through the middle of the upper first molar. Scale {tag} ({'life size' if scale == 1 else f'{scale:g} times life size'}), millimetres.

Not yet clinically reviewed.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
Full disclaimer: https://vivatheca.com/disclaimer

Parts ({parts}) are separate STL files, so you can print them in different colours. Load them together as one object in your slicer. The sinus air space is not included; it shows as the hollow inside the bone.
Print notes: some layers are thin. The bone over the root tips in the at-risk stage is 0.5 mm, and the fistula lining is 0.6 mm. Print at 1.5x, or with a 0.2 mm nozzle, if they do not come out. Most slicers will add supports under the palate and the cut overhangs.
Sources and how the model was made: https://vivatheca.com/oroantral/

3D model made by Vivatheca from Z-Anatomy (the libre 3D atlas of anatomy, CC BY-SA 4.0), which uses BodyParts3D (The Database Center for Life Science, CC BY-SA 2.1 Japan). Changed: right maxilla, palatine and zygomatic bones and the right upper first and second molars extracted, cut, voxel-remeshed; sinus, gum, clot, flaps, fat pad and fistula added. Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
"""
    z = dst / f'vivatheca-oroantral-{stage}-{tag}.zip'
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for f in files:
            if scale == 1:
                zf.write(f, f.name)
            else:
                import trimesh
                m = trimesh.load(f); m.apply_scale(scale)
                zf.writestr(f.name, m.export(file_type='stl'))
        zf.writestr('README.txt', readme)
    print(z.name, z.stat().st_size)
