"""Remove the shattered sphenoid from the palate GLBs in public/head-neck/models/.

Mesh decimation broke the Z-Anatomy sphenoid into about 390 loose specks (each under
3 mm across and 7 mm or more from the maxilla). In the viewer they float around the
palate as dust. No piece is anatomically useful, so the sphenoid and specimen_sphenoid
nodes and their meshes are removed. Everything else in the file is kept unchanged.

Usage: python3 tools/head-neck/drop_sphenoid.py public/head-neck/models/pa.glb [...]
"""
import json
import struct
import sys

DROP = ('sphenoid', 'specimen_sphenoid')


def read_glb(path):
    data = open(path, 'rb').read()
    jlen = struct.unpack('<I', data[12:16])[0]
    gltf = json.loads(data[20:20 + jlen])
    off = 20 + jlen
    blen = struct.unpack('<I', data[off:off + 4])[0]
    return gltf, data[off + 8:off + 8 + blen]


def write_glb(path, gltf, binary):
    j = json.dumps(gltf, separators=(',', ':')).encode()
    j += b' ' * (-len(j) % 4)
    binary = binary + b'\0' * (-len(binary) % 4)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 28 + len(j) + len(binary)))
        fh.write(struct.pack('<II', len(j), 0x4E4F534A) + j)
        fh.write(struct.pack('<II', len(binary), 0x004E4942) + binary)


def renumber(items, keep):
    remap = {old: new for new, old in enumerate(i for i in range(len(items)) if i in keep)}
    return [items[i] for i in range(len(items)) if i in keep], remap


def clean(path):
    gltf, binary = read_glb(path)
    drop_nodes = {i for i, n in enumerate(gltf['nodes']) if n.get('name') in DROP}
    if not drop_nodes:
        print(f'{path}: nothing to remove')
        return
    assert not any(gltf['nodes'][i].get('children') for i in drop_nodes)
    dropped_meshes = {gltf['nodes'][i]['mesh'] for i in drop_nodes if 'mesh' in gltf['nodes'][i]}

    # Nodes
    nodes, nmap = renumber(gltf['nodes'], set(range(len(gltf['nodes']))) - drop_nodes)
    for n in nodes:
        if 'children' in n:
            n['children'] = [nmap[c] for c in n['children'] if c in nmap]
    for s in gltf.get('scenes', []):
        s['nodes'] = [nmap[c] for c in s['nodes'] if c in nmap]
    gltf['nodes'] = nodes

    # Meshes still used by a node
    used_meshes = {n['mesh'] for n in nodes if 'mesh' in n}
    meshes, mmap = renumber(gltf['meshes'], used_meshes)
    for n in nodes:
        if 'mesh' in n:
            n['mesh'] = mmap[n['mesh']]
    gltf['meshes'] = meshes

    # Accessors still used by a mesh (or by animations and skins, kept as they are)
    used_acc = set()
    for m in meshes:
        for p in m['primitives']:
            used_acc |= set(p['attributes'].values())
            if 'indices' in p:
                used_acc.add(p['indices'])
            for t in p.get('targets', []):
                used_acc |= set(t.values())
    for a in gltf.get('animations', []):
        for smp in a['samplers']:
            used_acc |= {smp['input'], smp['output']}
    for sk in gltf.get('skins', []):
        if 'inverseBindMatrices' in sk:
            used_acc.add(sk['inverseBindMatrices'])
    accessors, amap = renumber(gltf['accessors'], used_acc)
    for m in meshes:
        for p in m['primitives']:
            p['attributes'] = {k: amap[v] for k, v in p['attributes'].items()}
            if 'indices' in p:
                p['indices'] = amap[p['indices']]
            if 'targets' in p:
                p['targets'] = [{k: amap[v] for k, v in t.items()} for t in p['targets']]
    for a in gltf.get('animations', []):
        for smp in a['samplers']:
            smp['input'], smp['output'] = amap[smp['input']], amap[smp['output']]
    for sk in gltf.get('skins', []):
        if 'inverseBindMatrices' in sk:
            sk['inverseBindMatrices'] = amap[sk['inverseBindMatrices']]
    gltf['accessors'] = accessors

    # Buffer views still used, packed into a new binary chunk
    used_bv = {a['bufferView'] for a in accessors if 'bufferView' in a}
    used_bv |= {im['bufferView'] for im in gltf.get('images', []) if 'bufferView' in im}
    out = bytearray()
    views, vmap = [], {}
    for i, bv in enumerate(gltf['bufferViews']):
        if i not in used_bv:
            continue
        out.extend(b'\0' * (-len(out) % 4))
        start = bv.get('byteOffset', 0)
        nbv = dict(bv, byteOffset=len(out))
        out.extend(binary[start:start + bv['byteLength']])
        vmap[i] = len(views)
        views.append(nbv)
    for a in accessors:
        if 'bufferView' in a:
            a['bufferView'] = vmap[a['bufferView']]
    for im in gltf.get('images', []):
        if 'bufferView' in im:
            im['bufferView'] = vmap[im['bufferView']]
    gltf['bufferViews'] = views
    out.extend(b'\0' * (-len(out) % 4))
    gltf['buffers'][0]['byteLength'] = len(out)
    write_glb(path, gltf, bytes(out))
    print(f'{path}: removed {len(drop_nodes)} node(s) and {len(dropped_meshes)} mesh(es)')


if __name__ == '__main__':
    for p in sys.argv[1:]:
        clean(p)
