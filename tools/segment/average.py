"""Average jaws and teeth from several segmented CT scans into one mean shape (no single patient).

  python3 tools/segment/average.py /tmp/ct/seg tools/segment/out --min-scans 4

Method (documented in docs/averaged-anatomy.md):
 1. Keep scans whose mandible is complete (does not touch the volume edge). Each part is reduced to its
    largest connected piece; a scan whose mandible is much smaller than the median of the set is left out.
 2. Resample each label volume to isotropic 0.7 mm in RAS orientation.
 3. Rigid alignment: the mandible of each scan is moved onto a reference (the median-volume scan) by
    centroid translation, then refined with ICP (trimesh) on mandible surface points. The same transform
    moves the teeth and skull labels, so the dentition keeps its position on the jaw.
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
from scipy.spatial import cKDTree
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
    # Keep only the largest connected piece of each part: TotalSegmentator leaves small stray islands
    # (e.g. bits of skull base labelled as mandible) that would otherwise be averaged in.
    clean = np.zeros_like(iso)
    for idx in PARTS.values():
        m = iso == idx
        if not m.any():
            continue
        cc, k = ndimage.label(m)
        if k > 1:
            sizes = ndimage.sum(m, cc, range(1, k + 1))
            m = cc == (int(np.argmax(sizes)) + 1)
        clean[m] = idx
    return clean



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
    ap.add_argument('--min-fraction', type=float, default=0.6, help='keep scans whose mandible volume is at least this fraction of the median')
    ap.add_argument('--selection', help='selection.json from the fetch step, to record collection, patient ID, DOI and licence per scan')
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
        print(f'{d.name}: mandible {mand.get("cm3")} cm3, cut off={mand.get("touches_edge")} -> {"candidate" if ok else "skip"}')
        if ok:
            scans.append((d.name, lab_path, cov))

    # Volume of the largest connected mandible piece, after cleaning. A scan whose mandible is much smaller than
    # the others (e.g. the rami labelled as skull, or a scan stopping at the condyles) is left out; the cut-off is
    # relative to this set of scans, not a figure chosen by hand.
    pitch = args.pitch
    labels = [load_iso(p, pitch) for _, p, _ in scans]
    vols = [float((lab == PARTS['mandible']).sum()) * pitch ** 3 / 1000 for lab in labels]
    median = float(np.median(vols)) if vols else 0.0
    keep = [i for i, v in enumerate(vols) if v >= args.min_fraction * median]
    for (name, _, _), v, in zip(scans, vols):
        print(f'{name}: largest mandible piece {v:.1f} cm3 (median {median:.1f}) -> {"use" if v >= args.min_fraction * median else "skip"}')
    scans = [scans[i] for i in keep]
    labels = [labels[i] for i in keep]
    vols = [vols[i] for i in keep]
    if len(scans) < args.min_scans:
        raise SystemExit(f'only {len(scans)} usable scans (need {args.min_scans})')

    meta = {}
    if args.selection:
        for row in json.load(open(args.selection)):
            key = f"{row['collection_id']}__{row['PatientID']}"
            meta[key] = {k: row.get(k) for k in ('collection_id', 'PatientID', 'PatientAge', 'PatientSex', 'SeriesDescription', 'source_DOI', 'license_short_name')}

    # Reference = the scan with the median mandible volume.
    ref_i = int(np.argsort(vols)[len(vols) // 2])
    ref = labels[ref_i]
    ref_pts = np.argwhere(ref == PARTS['mandible']) * pitch
    ref_c = ref_pts.mean(0)
    ref_mesh, ref_surf = surface_points(ref == PARTS['mandible'], pitch)

    # Common grid: the reference grid padded by 20 mm.
    pad = int(20 / pitch)
    shape = tuple(int(s) + 2 * pad for s in ref.shape)
    sums = {p: np.zeros(shape, dtype=np.float32) for p in PARTS}
    used = []
    for (name, _, cov), lab in zip(scans, labels):
        pts = np.argwhere(lab == PARTS['mandible']) * pitch
        c = pts.mean(0)
        # Every volume is already in RAS and patients lie supine, head first, so the initial alignment is a
        # pure translation of mandible centroids; ICP then refines rotation and translation. (A PCA frame was
        # tried first but its axis signs flip between scans on a near-symmetric mandible and ICP cannot recover.)
        T = np.eye(4)
        T[:3, 3] = ref_c - c
        # ICP refinement on mandible surface points
        _, surf = surface_points(lab == PARTS['mandible'], pitch)
        moved = trimesh.transform_points(surf, T)
        icp_T, aligned, _ = trimesh.registration.icp(moved, ref_surf, initial=np.eye(4), max_iterations=60, threshold=1e-5, scale=False)
        T = icp_T @ T
        cost = float(cKDTree(ref_surf).query(aligned)[0].mean())  # mean surface-to-surface distance after ICP
        print(f'{name}: ICP mean distance {cost:.2f} mm')
        # Resample every part into the padded reference grid with the inverse transform.
        Tinv = np.linalg.inv(T)
        A = Tinv[:3, :3]
        offset = (Tinv[:3, 3] / pitch) - A @ np.array([pad, pad, pad])
        for part, idx in PARTS.items():
            m = (lab == idx).astype(np.float32)
            warped = ndimage.affine_transform(m, A, offset=offset, output_shape=shape, order=1, mode='constant', cval=0.0)
            sums[part] += warped
        used.append({'scan': name, 'icp_mean_mm': round(float(cost), 2), 'voxel_mm': cov['voxel_mm'], 'mandible_cm3': round(vols[len(used)], 1), **meta.get(name, {})})

    n = len(used)
    meshes = {}
    for part in PARTS:
        prob = sums[part] / n
        if (prob > 0.5).sum() < 100:  # strictly above, so the iso-surface at 0.5 always exists
            print(f'{part}: too little agreement, skipped')
            continue
        m = mesh_from_prob(prob, pitch, target_faces=60000 if part == 'skull' else 30000)
        m.apply_translation(-np.array([pad, pad, pad]) * pitch)
        meshes[part] = m
        nib.save(nib.Nifti1Image(prob, np.diag([pitch, pitch, pitch, 1])), out / f'{part}-probability.nii.gz')
        print(f'{part}: {len(m.faces)} faces, volume {m.volume / 1000:.1f} cm3')

    # One GLB, metres, Y-up like the other site models (R, A, S) -> (-x, y, z): x = -R, y = S, z = A.
    scene = trimesh.Scene()
    # Slightly different colours per part, so tools/glb/finish.mjs does not merge the materials (each part is hidden/shown by its material).
    colours = {'mandible': [226, 220, 205, 255], 'skull': [222, 215, 200, 255], 'teeth_lower': [245, 243, 236, 255], 'teeth_upper': [244, 242, 235, 255]}
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
    stl = out / 'averaged-jaw-mandible.stl'
    if 'mandible' in meshes:
        mm = meshes['mandible'].copy()
        mm.apply_translation(-centre)
        mm.export(stl)  # millimetres, for printing
    size = lambda p: f'{p.stat().st_size / 1e6:.1f} MB' if p.exists() else '0 MB'
    json.dump({'scans_used': used, 'n': n, 'pitch_mm': pitch, 'parts': {p: {'faces': len(m.faces), 'volume_cm3': round(m.volume / 1000, 1)} for p, m in meshes.items()}, 'files': {'glb': size(final), 'stl': size(stl)}}, open(out / 'provenance.json', 'w'), indent=1)
    print(f'wrote {final} from {n} scans')


if __name__ == '__main__':
    main()
