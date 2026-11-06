"""Average jaws and teeth from several segmented CT scans into one mean shape (no single patient).

  python3 tools/segment/average.py /tmp/ct/seg tools/segment/out --min-scans 4

Method (documented in docs/averaged-anatomy.md):
 1. Keep scans whose mandible is complete (does not touch the volume edge) and large enough.
 2. Resample each label volume to isotropic 0.7 mm.
 3. Rigid alignment: the mandible of each scan is aligned to a reference by centroid and principal axes
    (PCA on mandible voxels), then refined with ICP (trimesh) on mandible surface points. The same
    transform moves the teeth labels, so the dentition keeps its position on the jaw.
 4. For each part, the aligned binary masks are averaged into a probability map; the mean shape is the
    0.5 iso-surface (majority of scans). Marching cubes -> Taubin smoothing -> decimation -> GLB.
 5. provenance.json lists every scan used (collection, DOI, licence, voxel size) and the counts.
The result is a statistical mean, not any one person's anatomy, and is released CC BY-SA 4.0
with attribution to the source collections (CC BY 4.0).
"""
import argparse
import json
import subprocess
from pathlib import Path

import nibabel as nib
import numpy as np
import trimesh
from scipy import ndimage
from skimage import measure

PARTS = {'mandible': 1, 'teeth_lower': 2, 'teeth_upper': 7, 'skull': 3}
ROOT = Path(__file__).resolve().parents[2]
FINISH = ROOT / 'tools' / 'glb' / 'finish.mjs'


def load_iso(path: Path, pitch: float):
    img = nib.load(path)
    lab = np.asarray(img.dataobj).astype(np.uint8)
    zoom = np.array(img.header.get_zooms()[:3]) / pitch
    # nearest-neighbour resample of labels to an isotropic grid, in RAS voxel order
    iso = ndimage.zoom(lab, zoom, order=0)
    # orient to RAS using the affine's axis directions
    ornt = nib.orientations.io_orientation(img.affine)
    iso = nib.orientations.apply_orientation(iso, ornt)
    return iso


def pca_frame(points):
    c = points.mean(0)
    _, _, vt = np.linalg.svd(points - c, full_matrices=False)
    axes = vt
    # Make the frame right-handed and with consistent signs (largest extent axis = x, pointing to +x of the data).
    for i in range(3):
        if axes[i] @ np.eye(3)[np.argmax(np.abs(axes[i]))] < 0:
            axes[i] *= -1
    if np.linalg.det(axes) < 0:
        axes[2] *= -1
    return c, axes


def surface_points(mask, pitch, n=4000):
    verts, faces, _, _ = measure.marching_cubes(mask.astype(np.uint8), level=0.5, spacing=(pitch,) * 3)
    m = trimesh.Trimesh(verts, faces, process=False)
    pts, _ = trimesh.sample.sample_surface(m, n)
    return m, pts


def mesh_from_prob(prob, pitch, smooth_iters=10, target_faces=40000):
    verts, faces, _, _ = measure.marching_cubes(prob, level=0.5, spacing=(pitch,) * 3)
    m = trimesh.Trimesh(verts, faces, process=True)
    m = max(m.split(only_watertight=False), key=lambda p: len(p.faces)) if len(m.faces) else m
    trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=smooth_iters)
    if len(m.faces) > target_faces:
        m = m.simplify_quadric_decimation(face_count=target_faces)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('seg_dir')
    ap.add_argument('out_dir')
    ap.add_argument('--pitch', type=float, default=0.7)
    ap.add_argument('--min-scans', type=int, default=4)
    ap.add_argument('--min-mandible-cm3', type=float, default=25.0)
    args = ap.parse_args()
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    scans = []
    for d in sorted(Path(args.seg_dir).iterdir()):
        cov_path, lab_path = d / 'coverage.json', d / 'labels.nii.gz'
        if not (cov_path.exists() and lab_path.exists()):
            continue
        cov = json.loads(cov_path.read_text())
        mand = cov['parts'].get('mandible', {})
        ok = mand.get('voxels', 0) and not mand.get('touches_edge') and mand.get('cm3', 0) >= args.min_mandible_cm3
        print(f'{d.name}: mandible {mand.get("cm3")} cm3, cut off={mand.get("touches_edge")} -> {"use" if ok else "skip"}')
        if ok:
            scans.append((d.name, lab_path, cov))
    if len(scans) < args.min_scans:
        raise SystemExit(f'only {len(scans)} usable scans (need {args.min_scans})')

    # Reference = the scan with the median mandible volume.
    vols = [s[2]['parts']['mandible']['cm3'] for s in scans]
    ref_i = int(np.argsort(vols)[len(vols) // 2])
    pitch = args.pitch
    labels = [load_iso(p, pitch) for _, p, _ in scans]
    ref = labels[ref_i]
    ref_pts = np.argwhere(ref == PARTS['mandible']) * pitch
    ref_c, ref_axes = pca_frame(ref_pts)
    ref_mesh, ref_surf = surface_points(ref == PARTS['mandible'], pitch)

    # Common grid: the reference grid padded by 20 mm.
    pad = int(20 / pitch)
    shape = tuple(int(s) + 2 * pad for s in ref.shape)
    sums = {p: np.zeros(shape, dtype=np.float32) for p in PARTS}
    used = []
    for (name, _, cov), lab in zip(scans, labels):
        pts = np.argwhere(lab == PARTS['mandible']) * pitch
        c, axes = pca_frame(pts)
        # map scan frame -> reference frame: x_ref = R (x - c) + ref_c, with R = ref_axes^T axes
        R = ref_axes.T @ axes
        T = np.eye(4)
        T[:3, :3] = R
        T[:3, 3] = ref_c - R @ c
        # ICP refinement on mandible surface points
        _, surf = surface_points(lab == PARTS['mandible'], pitch)
        moved = trimesh.transform_points(surf, T)
        icp_T, _, cost = trimesh.registration.icp(moved, ref_surf, initial=np.eye(4), max_iterations=60, threshold=1e-5, scale=False)
        T = icp_T @ T
        print(f'{name}: ICP mean distance {cost:.2f} mm')
        # Resample every part into the padded reference grid with the inverse transform.
        Tinv = np.linalg.inv(T)
        A = Tinv[:3, :3]
        offset = (Tinv[:3, 3] / pitch) - A @ np.array([pad, pad, pad])
        for part, idx in PARTS.items():
            m = (lab == idx).astype(np.float32)
            warped = ndimage.affine_transform(m, A, offset=offset, output_shape=shape, order=1, mode='constant', cval=0.0)
            sums[part] += warped
        used.append({'scan': name, 'icp_mean_mm': round(float(cost), 2), 'voxel_mm': cov['voxel_mm']})

    n = len(used)
    meshes = {}
    for part in PARTS:
        prob = sums[part] / n
        if (prob >= 0.5).sum() < 100:
            print(f'{part}: too little agreement, skipped')
            continue
        m = mesh_from_prob(prob, pitch, target_faces=60000 if part == 'skull' else 30000)
        m.apply_translation(-np.array([pad, pad, pad]) * pitch)
        meshes[part] = m
        nib.save(nib.Nifti1Image(prob, np.diag([pitch, pitch, pitch, 1])), out / f'{part}-probability.nii.gz')
        print(f'{part}: {len(m.faces)} faces, volume {m.volume / 1000:.1f} cm3')

    # One GLB, metres, Y-up like the other site models (R, A, S) -> (-x, y, z): x = -R, y = S, z = A.
    scene = trimesh.Scene()
    colours = {'mandible': [226, 220, 205, 255], 'skull': [226, 220, 205, 255], 'teeth_lower': [245, 243, 236, 255], 'teeth_upper': [245, 243, 236, 255]}
    centre = meshes['mandible'].bounds.mean(0) if 'mandible' in meshes else np.zeros(3)
    for part, m in meshes.items():
        v = (m.vertices - centre) / 1000.0
        v = np.stack([-v[:, 0], v[:, 2], v[:, 1]], axis=1)
        mm = trimesh.Trimesh(v, m.faces, process=False)
        mm.fix_normals()
        mm.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(baseColorFactor=colours[part], metallicFactor=0.0, roughnessFactor=0.75, name=part))
        scene.add_geometry(mm, node_name=part, geom_name=part)
    raw = out / 'averaged-jaw-raw.glb'
    scene.export(raw)
    final = out / 'averaged-jaw.glb'
    subprocess.run(['node', str(FINISH), str(raw), '--out', str(final)], check=True)
    raw.unlink()
    json.dump({'scans_used': used, 'n': n, 'pitch_mm': pitch, 'parts': {p: {'faces': len(m.faces), 'volume_cm3': round(m.volume / 1000, 1)} for p, m in meshes.items()}}, open(out / 'provenance.json', 'w'), indent=1)
    print(f'wrote {final} from {n} scans')


if __name__ == '__main__':
    main()
