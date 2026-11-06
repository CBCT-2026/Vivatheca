"""Segment jaws and teeth in open CT scans with TotalSegmentator (craniofacial_structures task).

  python3 tools/segment/segment.py /tmp/ct/dicom /tmp/ct/seg [--fast]

For every DICOM series folder under the input (collection/patient/series), converts it to NIfTI
(dicom2nifti), runs `TotalSegmentator -ta craniofacial_structures` (labels: mandible, teeth_lower,
skull, head, sinus_maxillary, sinus_frontal, teeth_upper; Apache-2.0 weights, no licence key needed),
and writes <out>/<collection>__<patient>/ with ct.nii.gz, the label volume and coverage.json
(whether the mandible touches the volume edge, i.e. is cut off).
"""
import json
import subprocess
import sys
from pathlib import Path

import nibabel as nib
import numpy as np

LABELS = {1: 'mandible', 2: 'teeth_lower', 3: 'skull', 4: 'head', 5: 'sinus_maxillary', 6: 'sinus_frontal', 7: 'teeth_upper'}


def convert(series_dir: Path, out: Path) -> Path | None:
    import dicom2nifti
    tmp = out / 'nifti_tmp'
    tmp.mkdir(parents=True, exist_ok=True)
    try:
        dicom2nifti.convert_directory(str(series_dir), str(tmp), compression=True, reorient=True)
    except Exception as e:  # noqa: BLE001
        print(f'  convert failed: {e}')
        return None
    files = sorted(tmp.glob('*.nii.gz'), key=lambda p: p.stat().st_size)
    if not files:
        return None
    ct = out / 'ct.nii.gz'
    files[-1].replace(ct)
    for f in tmp.glob('*'):
        f.unlink()
    tmp.rmdir()
    return ct


def coverage(label_path: Path) -> dict:
    img = nib.load(label_path)
    lab = np.asarray(img.dataobj).astype(np.uint8)
    vox_mm3 = float(np.prod(img.header.get_zooms()[:3]))
    out = {'voxel_mm': [round(float(z), 3) for z in img.header.get_zooms()[:3]], 'parts': {}}
    for idx, name in LABELS.items():
        m = lab == idx
        n = int(m.sum())
        if not n:
            out['parts'][name] = {'voxels': 0}
            continue
        zs = np.where(m.any(axis=(0, 1)))[0]
        touches = bool(zs.min() == 0 or zs.max() == lab.shape[2] - 1 or m[0].any() or m[-1].any() or m[:, 0].any() or m[:, -1].any())
        out['parts'][name] = {'voxels': n, 'cm3': round(n * vox_mm3 / 1000, 1), 'touches_edge': touches}
    return out


def main():
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    fast = '--fast' in sys.argv
    for series in sorted(p for p in src.glob('*/*/*') if p.is_dir()):
        name = f'{series.parts[-3]}__{series.parts[-2]}'
        out = dst / name
        out.mkdir(parents=True, exist_ok=True)
        if (out / 'labels.nii.gz').exists():
            print(f'{name}: done')
            continue
        print(f'{name}: converting')
        ct = convert(series, out)
        if not ct:
            continue
        print(f'{name}: segmenting')
        cmd = ['TotalSegmentator', '-i', str(ct), '-o', str(out / 'labels.nii.gz'), '-ta', 'craniofacial_structures', '--ml', '-d', 'cpu', '-q']
        if fast:
            cmd.append('--fast')
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode:
            print(f'  TotalSegmentator failed: {r.stderr[-800:]}')
            continue
        cov = coverage(out / 'labels.nii.gz')
        (out / 'coverage.json').write_text(json.dumps(cov, indent=1))
        print(f'  {json.dumps(cov["parts"].get("mandible"))}')


if __name__ == '__main__':
    main()
