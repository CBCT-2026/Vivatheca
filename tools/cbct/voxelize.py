"""Virtual CBCT: voxelise a Vivatheca GLB model into a NIfTI volume with CT-like intensities.

The result is a scan of the *model*, not of any patient: every voxel comes from the mesh parts
(bone, teeth, nerve, plates ...), each given a representative Hounsfield-style value so the slices
look like a CBCT and window/level behaves as clinicians expect. It is what /learn/slices shows.

  python3 tools/cbct/voxelize.py public/models/impacted-molar.glb public/slices/wisdom-tooth.nvol --pitch 0.4
  python3 tools/cbct/voxelize.py public/head-neck/models/scc-case.glb public/slices/scc-after.nvol --only bone,teeth,fibula,plate,screws

Meshes are in metres (glTF); the volume is written in millimetres with an RAS affine.
"""
import argparse
import os
import re
import sys

import nibabel as nib
import numpy as np
import trimesh

# Approximate CT numbers (HU) by tissue, from Schneider U, Pedroni E, Lomax A. Phys Med Biol 1996;41:111-124
# (soft tissue 0-100, cortical bone ~1000-1500) and dental enamel/metal values well above that.
DEFAULT_HU = {
    'tooth': 2200, 'teeth': 2200, 'enamel': 2800, 'dentine': 1800, 'crown': 2200,
    'bone': 1200, 'mandible': 1200, 'maxilla': 1200, 'fibula': 1100, 'specimen_bone': 1200, 'specimen_teeth': 2200,
    'plate': 3000, 'screw': 3000, 'screws': 3000,
    'nerve': 150, 'lesion': 60, 'margin': 60, 'tumour': 60, 'soft': 40, 'gum': 40, 'sinus': -900,
}
BACKGROUND = -1000  # air


def hu_for(name: str, overrides: dict) -> int:
    key = re.sub(r'[\s_.\-]*\d+$', '', name).strip().lower()
    for k, v in overrides.items():
        if k in key:
            return v
    for k, v in DEFAULT_HU.items():
        if k in key:
            return v
    return 300  # unknown part: soft-tissue-ish but visible


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('glb')
    ap.add_argument('out')
    ap.add_argument('--pitch', type=float, default=0.4, help='voxel size in mm')
    ap.add_argument('--only', help='comma list of node names to include (substring match)')
    ap.add_argument('--skip', help='comma list of node names to leave out (substring match)')
    ap.add_argument('--hu', action='append', default=[], help='name=value override, e.g. --hu lesion=80')
    ap.add_argument('--pad', type=float, default=6.0, help='air margin around the model in mm')
    args = ap.parse_args()
    overrides = {k: int(v) for k, v in (s.split('=') for s in args.hu)}
    only = [s.strip().lower() for s in args.only.split(',')] if args.only else None
    skip = [s.strip().lower() for s in args.skip.split(',')] if args.skip else []

    scene = trimesh.load(args.glb, force='scene')
    parts = []
    for node in scene.graph.nodes_geometry:
        transform, geom = scene.graph[node]
        name = node.lower()
        if only and not any(o in name for o in only):
            continue
        if any(s in name for s in skip):
            continue
        mesh = scene.geometry[geom].copy()
        mesh.apply_transform(transform)
        mesh.apply_scale(1000.0)  # m -> mm
        parts.append((node, mesh))
    if not parts:
        sys.exit('no parts selected')

    lo = np.min([m.bounds[0] for _, m in parts], axis=0) - args.pad
    hi = np.max([m.bounds[1] for _, m in parts], axis=0) + args.pad
    shape = np.ceil((hi - lo) / args.pitch).astype(int) + 1
    vol = np.full(shape, BACKGROUND, dtype=np.int16)
    # Soft tissue first (lowest HU) so denser parts written later win inside overlaps.
    for node, mesh in sorted(parts, key=lambda p: hu_for(p[0], overrides)):
        hu = hu_for(node, overrides)
        vox = mesh.voxelized(args.pitch)
        # Watertight parts are flood-filled; open meshes (the hand-sculpted mandible) are filled where
        # a voxel is enclosed along every axis, which closes thin shells without leaking through gaps.
        vox = vox.fill() if mesh.is_watertight else vox.fill(method='orthographic')
        pts = vox.points  # centres in mm
        idx = np.round((pts - lo) / args.pitch).astype(int)
        ok = np.all((idx >= 0) & (idx < shape), axis=1)
        vol[idx[ok, 0], idx[ok, 1], idx[ok, 2]] = hu
        print(f'{node}: {len(pts)} voxels at {hu} HU')

    # glTF is Y-up. In the site's models -x is the patient's right, +z anterior and +y superior
    # (checked against the resected right side of the SCC case and the left wisdom tooth), so
    # (R, A, S) = (-x, z, y) gives a NIfTI in RAS orientation.
    vol = np.transpose(vol, (0, 2, 1))[::-1, :, :]
    affine = np.diag([args.pitch, args.pitch, args.pitch, 1.0])
    affine[:3, 3] = [-(hi[0]), lo[2], lo[1]]
    img = nib.Nifti1Image(vol, affine)
    img.header.set_xyzt_units('mm')
    img.header['descrip'] = b'Vivatheca virtual CBCT of a model, CC BY-SA 4.0'
    # .nvol = a gzipped NIfTI with a neutral extension: the site's static server treats *.gz as a
    # precompressed variant of another file and will not serve it, and NiiVue is told the real name.
    if args.out.endswith('.nvol'):
        tmp = args.out[:-5] + '.nii.gz'
        nib.save(img, tmp)
        os.replace(tmp, args.out)
    else:
        nib.save(img, args.out)
    print(f'{args.out}: shape {vol.shape}, pitch {args.pitch} mm')


if __name__ == '__main__':
    main()
