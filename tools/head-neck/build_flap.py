"""Replace the box-shaped free flap in acc.glb with a soft-tissue flap and its vessels.

The flap was a hard-edged block. This builds a rounded, cushion-shaped skin paddle on the
same footprint and level (so it still closes the same opening), with a domed upper side
that fills the space left in the sinus floor, and adds the flap's artery and vein running
back and down towards the neck, where free-flap vessels are joined to neck vessels.
Shape and vessel path are schematic: they are not traced from a case.

Usage: python3 tools/head-neck/build_flap.py public/head-neck/models/acc.glb
Needs numpy and shapely. glTF units are metres; numbers below are in millimetres.
"""
import json
import struct
import sys

import numpy as np
from shapely.geometry import LineString, MultiPoint, Point

N = 96            # points around the outline
EDGE_R = 2.5      # rounding of the flap edge (mm)
DOME_TOP = 3.0    # upper side bulges into the sinus floor gap (mm)
DOME_BOTTOM = 0.8 # oral side bulges slightly (mm)
SHRINK = 1.0      # pull the outline in a little from the old block (mm)
# Vessel path (x, y, z in mm, glTF axes: -X patient's right, +Y up, +Z front).
# Starts at the back outer corner of the flap, runs back under the cheekbone and down towards the neck.
PATH_FROM_CORNER = [(0, 0, 0), (-5, -2, -7), (-10, -7, -13), (-14, -18, -17), (-16, -32, -18)]
VESSELS = [('free_flap_artery', 1.2, (-1.4, 0, 0), [0.62, 0.06, 0.07, 1]),
           ('free_flap_vein', 1.6, (1.6, 0, 0), [0.10, 0.16, 0.48, 1])]


def read_glb(path):
    data = open(path, 'rb').read()
    jlen = struct.unpack('<I', data[12:16])[0]
    gltf = json.loads(data[20:20 + jlen])
    off = 20 + jlen
    blen = struct.unpack('<I', data[off:off + 4])[0]
    return gltf, bytearray(data[off + 8:off + 8 + blen])


def write_glb(path, gltf, binary):
    binary += b'\0' * (-len(binary) % 4)
    gltf['buffers'][0]['byteLength'] = len(binary)
    j = json.dumps(gltf, separators=(',', ':')).encode()
    j += b' ' * (-len(j) % 4)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 28 + len(j) + len(binary)))
        fh.write(struct.pack('<II', len(j), 0x4E4F534A) + j)
        fh.write(struct.pack('<II', len(binary), 0x004E4942) + bytes(binary))


def positions(gltf, binary, mesh):
    a = gltf['accessors'][gltf['meshes'][mesh]['primitives'][0]['attributes']['POSITION']]
    bv = gltf['bufferViews'][a['bufferView']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    return np.frombuffer(bytes(binary), np.float32, a['count'] * 3, start).reshape(-1, 3).astype(float)


def add_view(gltf, binary, arr, target):
    binary += b'\0' * (-len(binary) % 4)
    gltf['bufferViews'].append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': arr.nbytes, 'target': target})
    binary.extend(arr.tobytes())
    return len(gltf['bufferViews']) - 1


def add_primitive(gltf, binary, verts, faces, material):
    v = (np.asarray(verts) / 1000.0).astype(np.float32)
    f = np.asarray(faces, np.uint32).ravel()
    pv = add_view(gltf, binary, v, 34962)
    gltf['accessors'].append({'bufferView': pv, 'componentType': 5126, 'count': len(v), 'type': 'VEC3',
                              'min': v.min(0).tolist(), 'max': v.max(0).tolist()})
    iv = add_view(gltf, binary, f, 34963)
    gltf['accessors'].append({'bufferView': iv, 'componentType': 5125, 'count': int(f.size), 'type': 'SCALAR'})
    return {'attributes': {'POSITION': len(gltf['accessors']) - 2}, 'indices': len(gltf['accessors']) - 1, 'material': material}


def outline(xz):
    poly = MultiPoint([tuple(p) for p in xz]).convex_hull.buffer(-6).buffer(6 - SHRINK)
    c = np.array(poly.centroid.coords[0])
    pts = []
    for a in np.linspace(0, 2 * np.pi, N, endpoint=False):
        d = np.array([np.cos(a), np.sin(a)])
        hit = poly.exterior.intersection(LineString([c, c + d * 200]))
        q = np.array(hit.coords[0]) if hit.geom_type == 'Point' else np.array(min(hit.geoms, key=lambda g: Point(c).distance(g)).coords[0])
        pts.append(q)
    return c, np.array(pts)


def flap_mesh(c, ring, y_bot, y_top):
    rad = np.linalg.norm(ring - c, axis=1)
    dirs = (ring - c) / rad[:, None]
    rings = []
    def ring_at(inset, y):
        r = np.maximum(rad - inset, 0.05)
        p = c + dirs * r[:, None]
        return np.column_stack([p[:, 0], np.full(N, y) if np.isscalar(y) else y, p[:, 1]])
    # bottom cap, centre outwards
    for f in np.linspace(0.08, 0.92, 7):
        r = f * (rad - EDGE_R)
        p = c + dirs * r[:, None]
        y = y_bot - DOME_BOTTOM * (1 - f ** 2)
        rings.append(np.column_stack([p[:, 0], np.full(N, y), p[:, 1]]))
    # rounded side, bottom to top
    mid, half = (y_bot + y_top) / 2, (y_top - y_bot) / 2
    for t in np.linspace(-np.pi / 2, np.pi / 2, 11):
        inset = EDGE_R * (1 - np.cos(t))
        y = mid + half * np.sin(t)
        rings.append(ring_at(inset, y))
    # top cap, outside inwards (domed)
    for f in np.linspace(0.92, 0.08, 7):
        r = f * (rad - EDGE_R)
        p = c + dirs * r[:, None]
        y = y_top + DOME_TOP * (1 - f ** 2)
        rings.append(np.column_stack([p[:, 0], np.full(N, y), p[:, 1]]))
    verts = np.vstack(rings + [[c[0], y_bot - DOME_BOTTOM, c[1]], [c[0], y_top + DOME_TOP, c[1]]])
    faces = []
    for k in range(len(rings) - 1):
        for i in range(N):
            a, b = k * N + i, k * N + (i + 1) % N
            faces += [[a, b + N, b], [a, a + N, b + N]]
    bc, tc = len(verts) - 2, len(verts) - 1
    last = (len(rings) - 1) * N
    for i in range(N):
        faces.append([bc, i, (i + 1) % N])
        faces.append([tc, last + (i + 1) % N, last + i])
    return verts, faces


def catmull(points, per=16):
    p = np.array(points, float)
    p = np.vstack([p[0] * 2 - p[1], p, p[-1] * 2 - p[-2]])
    out = []
    for i in range(1, len(p) - 2):
        for s in np.linspace(0, 1, per, endpoint=False):
            p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (-p0 + 3 * p1 - 3 * p2 + p3) * s ** 3))
    out.append(p[-2])
    return np.array(out)


def tube(path, radius, sides=14):
    t = np.gradient(path, axis=0)
    t /= np.linalg.norm(t, axis=1)[:, None]
    n = np.cross(t[0], [0, 0, 1.0])
    if np.linalg.norm(n) < 1e-6:
        n = np.cross(t[0], [1.0, 0, 0])
    n /= np.linalg.norm(n)
    verts, frames = [], []
    for i, p in enumerate(path):
        if i:
            n = n - t[i] * n.dot(t[i])
            n /= np.linalg.norm(n)
        b = np.cross(t[i], n)
        taper = 1.0 if i < len(path) - 6 else 0.6 + 0.4 * (len(path) - 1 - i) / 5
        for a in np.linspace(0, 2 * np.pi, sides, endpoint=False):
            verts.append(p + radius * taper * (np.cos(a) * n + np.sin(a) * b))
    faces = []
    for k in range(len(path) - 1):
        for i in range(sides):
            a, b = k * sides + i, k * sides + (i + 1) % sides
            faces += [[a, b, b + sides], [a, b + sides, a + sides]]
    s0, s1 = len(verts), len(verts) + 1
    verts += [path[0], path[-1]]
    last = (len(path) - 1) * sides
    for i in range(sides):
        faces.append([s0, (i + 1) % sides, i])
        faces.append([s1, last + i, last + (i + 1) % sides])
    return np.array(verts), faces


def main(path):
    gltf, binary = read_glb(path)
    node = next(n for n in gltf['nodes'] if n.get('name') == 'free_flap')
    old = positions(gltf, binary, node['mesh']) * 1000
    y_bot, y_top = old[:, 1].min(), old[:, 1].max()
    c, ring = outline(old[:, [0, 2]])
    verts, faces = flap_mesh(c, ring, y_bot, y_top)
    mat = gltf['meshes'][node['mesh']]['primitives'][0]['material']
    gltf['meshes'][node['mesh']]['primitives'] = [add_primitive(gltf, binary, verts, faces, mat)]

    # vessels leave from the back outer corner of the flap
    corner_i = np.argmin(ring[:, 1] * 1.0 + ring[:, 0] * 1.0)  # most posterior (-z) and lateral (-x)
    start = np.array([ring[corner_i, 0] + 3, (y_bot + y_top) / 2, ring[corner_i, 1] + 3])
    scene = gltf['scenes'][gltf.get('scene', 0)]
    for name, radius, offset, colour in VESSELS:
        if any(n.get('name') == name for n in gltf['nodes']):
            raise SystemExit(f'{path} already has {name}')
        pts = [start + np.array(offset) + np.array(p) for p in PATH_FROM_CORNER]
        pts[0] = pts[0] - np.array(offset) * 0.5
        tv, tf = tube(catmull(pts), radius)
        gltf['materials'].append({'name': name.replace('free_flap_', 'flap_'), 'pbrMetallicRoughness': {'baseColorFactor': colour, 'metallicFactor': 0, 'roughnessFactor': 0.5}})
        gltf['meshes'].append({'name': name, 'primitives': [add_primitive(gltf, binary, tv, tf, len(gltf['materials']) - 1)]})
        gltf['nodes'].append({'name': name, 'mesh': len(gltf['meshes']) - 1})
        scene['nodes'].append(len(gltf['nodes']) - 1)
    write_glb(path, gltf, binary)
    print(f'{path}: flap {len(verts)} verts, outline centre {c.round(1)}, thickness {y_top - y_bot:.1f} mm + dome')


if __name__ == '__main__':
    main(sys.argv[1])
