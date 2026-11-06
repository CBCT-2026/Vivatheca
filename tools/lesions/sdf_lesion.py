"""Smooth lesion shapes (cysts, tumours) from signed distance functions.

Idea from fogleman/sdf (MIT): describe a shape as a distance field, blend parts smoothly, then mesh
it with marching cubes. Written here with numpy + scikit-image so it needs no extra package.

Shapes:
  unilocular    one smooth ellipsoid (e.g. a radicular or dentigerous cyst outline)
  multilocular  a main ellipsoid plus smaller locules blended onto its surface, giving the
                scalloped "soap bubble" outline described for ameloblastoma and some OKCs

The finished shape (locules included) is scaled to the sourced length, width and height, so the
reported size matches the paper. The lesion is subtracted from bone in each model's own build script (manifold3d), not here.

Evidence rule (AGENTS.md, Anatomy rule): every dimension in the spec needs a "source" (author,
year, title, DOI or link) from published research. A value without one must say "estimate": true
and a reason; the script then refuses to write anywhere under public/ and the report marks it
unverified. The blend radius is a drawing choice and is reported as such.

Usage:
  python3 tools/lesions/sdf_lesion.py SPEC.json OUT_DIR
Writes OUT_DIR/<name>.stl, OUT_DIR/<name>.glb and OUT_DIR/<name>-report.json (sources, estimates,
size of the finished mesh).
"""
import json
import math
import os
import sys

import numpy as np
import trimesh
from skimage.measure import marching_cubes


def ellipsoid(p, centre, radii):
    # Approximate signed distance to an ellipsoid (Inigo Quilez's bound), good for smooth shapes.
    q = (p - centre) / radii
    k0 = np.linalg.norm(q, axis=-1)
    k1 = np.linalg.norm(q / radii, axis=-1)
    return np.where(k1 > 0, k0 * (k0 - 1.0) / np.maximum(k1, 1e-9), -radii.min())


def smooth_union(a, b, k):
    # Polynomial smooth minimum: blends two shapes with a fillet of about k mm.
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def fibonacci_directions(n, seed_turn):
    # Even, repeatable spread of n directions over the upper and side surface.
    out = []
    golden = math.pi * (3 - math.sqrt(5))
    for i in range(n):
        z = 1 - (i + 0.5) / n * 1.4  # keep locules off the lowest pole
        r = math.sqrt(max(0.0, 1 - z * z))
        t = golden * i + seed_turn
        out.append((r * math.cos(t), r * math.sin(t), z))
    return np.array(out)


def value(entry, key, sources, estimates):
    if not isinstance(entry, dict) or 'value' not in entry:
        sys.exit(f'Spec error: "{key}" must be {{"value": ..., "source": ...}}')
    if entry.get('source'):
        sources.append({'field': key, 'value': entry['value'], 'source': entry['source']})
    elif entry.get('estimate') is True and entry.get('reason'):
        estimates.append({'field': key, 'value': entry['value'], 'reason': entry['reason']})
    else:
        sys.exit(f'Spec error: "{key}" needs a published "source", or "estimate": true with a "reason".')
    return entry['value']


def build(spec):
    sources, estimates = [], []
    size = spec['size_mm']
    length = value(size['length'], 'size_mm.length', sources, estimates)
    height = value(size['height'], 'size_mm.height', sources, estimates)
    width = value(size['width'], 'size_mm.width', sources, estimates)
    radii = np.array([length, width, height], dtype=float) / 2
    centre = np.zeros(3)
    blend = float(spec.get('blend_mm', 1.0))

    locules = []
    if spec['kind'] == 'multilocular':
        loc = spec['locules']
        count = int(value(loc['count'], 'locules.count', sources, estimates))
        dmin = value(loc['diameter_min_mm'], 'locules.diameter_min_mm', sources, estimates)
        dmax = value(loc['diameter_max_mm'], 'locules.diameter_max_mm', sources, estimates)
        rng = np.random.default_rng(int(spec.get('seed', 1)))
        for d in fibonacci_directions(count, float(spec.get('seed', 1))):
            r = rng.uniform(dmin, dmax) / 2
            # Sit each locule half out of the main body, on the ellipsoid surface.
            surface = d * radii / np.linalg.norm(d)
            locules.append((surface + d * r * 0.15, r))
    elif spec['kind'] != 'unilocular':
        sys.exit('Spec error: kind must be "unilocular" or "multilocular"')

    reach = radii.max() + (max((r for _, r in locules), default=0) * 2) + blend + 2
    step = float(spec.get('resolution_mm', 0.25))
    axis = np.arange(-reach, reach + step, step)
    grid = np.stack(np.meshgrid(axis, axis, axis, indexing='ij'), axis=-1)
    field = ellipsoid(grid, centre, radii)
    for c, r in locules:
        field = smooth_union(field, np.linalg.norm(grid - c, axis=-1) - r, blend)

    verts, faces, _, _ = marching_cubes(field, level=0.0, spacing=(step, step, step))
    verts -= reach
    mesh = trimesh.Trimesh(verts, faces, process=True)
    mesh.fix_normals()
    # Papers report the whole lesion's size, so scale the finished shape (locules included) to it.
    target = np.array([length, width, height], dtype=float)
    mesh.apply_translation(-mesh.bounds.mean(axis=0))
    mesh.apply_scale(1.0)  # keep trimesh caches in step
    mesh.vertices = mesh.vertices * (target / mesh.extents)
    return mesh, sources, estimates, blend


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    spec_path, out_dir = sys.argv[1], sys.argv[2]
    spec = json.load(open(spec_path))
    mesh, sources, estimates, blend = build(spec)
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    if estimates and os.path.abspath(out_dir).startswith(os.path.join(root, 'public')):
        sys.exit('Refused: this spec contains estimates, so its shape cannot go on the site. Replace each '
                 'estimate with a published source first.')
    os.makedirs(out_dir, exist_ok=True)
    name = spec['name']
    mesh.export(os.path.join(out_dir, name + '.stl'))
    scene = trimesh.Scene()
    colour = spec.get('colour', '#D55748')
    rgba = [int(colour[i:i + 2], 16) for i in (1, 3, 5)] + [255]
    mesh.visual = trimesh.visual.ColorVisuals(mesh, face_colors=np.tile(rgba, (len(mesh.faces), 1)))
    scene.add_geometry(mesh, geom_name=spec.get('material', 'lesion'))
    scene.export(os.path.join(out_dir, name + '.glb'))
    ext = mesh.extents
    report = {
        'name': name,
        'kind': spec['kind'],
        'finished_size_mm': {'x': round(float(ext[0]), 2), 'y': round(float(ext[1]), 2), 'z': round(float(ext[2]), 2)},
        'watertight': bool(mesh.is_watertight),
        'volume_ml': round(float(mesh.volume) / 1000, 3),
        'sources': sources,
        'estimates': estimates,
        'drawing_choices': [{'field': 'blend_mm', 'value': blend, 'note': 'Smoothing between locules; a drawing choice, not a measured value.'}],
        'status': 'UNVERIFIED: contains estimates, not for the site' if estimates else 'All dimensions sourced',
        'method': 'Signed distance functions (idea from fogleman/sdf, MIT), marching cubes (scikit-image).',
    }
    json.dump(report, open(os.path.join(out_dir, name + '-report.json'), 'w'), indent=1)
    print(json.dumps({k: report[k] for k in ('finished_size_mm', 'watertight', 'status')}))


if __name__ == '__main__':
    main()
