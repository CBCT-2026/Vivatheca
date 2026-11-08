"""Build the 3D models for the wisdom tooth treatment options page (/models/impacted-wisdom-tooth/options/).

Usage: python3 tools/wisdom-options/build.py   (writes build/wisdom-options/*.glb, uncompressed)
then:  node tools/glb/finish.mjs build/wisdom-options/*.glb --out public/models/impacted-wisdom-tooth/options/models
then:  node tools/labels/anchors.mjs

Every model starts from public/models/impacted-molar.glb (the collection's impacted wisdom tooth, modelled from
scratch by Vivatheca; CC BY-SA 4.0). The jaw, the other teeth and the nerve are copied unchanged; only the
wisdom tooth is cut, moved or taken away, and a see-through orange shape marks the bone a surgeon removes.

The model is about 1.7 times life size (the impacted model's read-me: 166 mm long), so every cited distance in
millimetres is multiplied by SCALE before it is used. Every value and its source:

- Crown length of a lower third molar, 7.0 mm (crown 7.0 + root 11 mm; the model's tooth is 30.0 model mm long,
  17.6 mm life size). Nelson SJ. Wheeler's Dental Anatomy, Physiology and Occlusion. 11th ed. 2020.
  Used to place the cementoenamel junction (CEJ), where the crown is cut off.
- Surgical removal: a gum flap, removal of bone around the crown (ostectomy) and cutting the tooth into pieces
  (crown and root sectioning) with a bur. Sanchez-Torres A, et al. Eur J Dent Educ. 2025;29(2):266-276
  (doi:10.1111/eje.13066): in 174 impacted lower third molars, bone removal 78%, crown sectioning 63%,
  root sectioning 39%. Bone removed on the cheek side and behind the tooth ("vestibulo-distal ostectomy"):
  Pellegrini M, et al. Case Rep Dent. 2025;2025:8934034 (doi:10.1155/crid/8934034), Figure 7.
  The width of the removed bone (BONE_GUTTER mm around the crown) is DRAWN, not measured; no source gives one.
- Coronectomy: the whole crown and all the enamel are removed and the roots are left in place (FDS RCS England.
  Parameters of care for patients undergoing mandibular third molar surgery. 2020); the root surface is
  reduced to at least 3 mm below the crest of the bone (Pogrel MA, et al. J Oral Maxillofac Surg.
  2004;62(12):1447-1452, doi:10.1016/j.joms.2004.08.003). Here the cut is drawn perpendicular to the long axis,
  CORONECTOMY_BELOW_CEJ mm below the CEJ on the root side, which is lower than the 3 mm rule at every point
  (the build prints the check). Real cuts are often angled (about 25 degrees: Gaballah K, et al. Front Oral
  Health. 2024;5:1466076) - a simplification stated on the page.
- Root movement after coronectomy: mean 2.8 mm at 36 months, mostly in the first 12 months, then stopping
  (Leung YY, Cheung LK. J Oral Maxillofac Surg. 2012;70(7):1515-1522, doi:10.1016/j.joms.2011.12.029).
  Drawn as a straight move upwards (away from the nerve); real roots mostly also move forwards (Yeung AWK, et al.
  Int J Oral Maxillofac Surg. 2018;47(9):1145-1152).
"""
import os
import sys

import manifold3d as m3
import numpy as np
import trimesh
from scipy.cluster.vq import kmeans2
from skimage import measure

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'public', 'models', 'impacted-molar.glb')
OUT = os.path.join(ROOT, 'build', 'wisdom-options')

MM = 1.0 / 1000          # GLB units are metres
SCALE = 1.7              # model size / life size
CROWN = 7.0              # mm, Wheeler: mandibular third molar crown length
CORONECTOMY_BELOW_CEJ = 1.5   # mm below the CEJ on the root side (drawn; see the 3 mm check below)
CREST_RULE = 3.0         # mm, Pogrel 2004: roots at least 3 mm below the bone crest
BONE_GUTTER = 2.0        # mm of bone removed around the crown, cheek side and behind (DRAWN)
GAP = 2.0                # mm, gap drawn between the cut pieces so the cuts can be seen (drawn)
LIFT = 6.0               # mm, how far the cut-off crown is lifted out of the socket in the "during" views (drawn)
MIGRATE = 2.8            # mm, Leung and Cheung 2012: mean root movement at 36 months

np.random.seed(1)
os.makedirs(OUT, exist_ok=True)
scene = trimesh.load(SRC)
G = scene.geometry
mat = {n: g.visual.material for n, g in G.items()}
tooth_src = G['wisdom tooth'].copy()
tooth_src.merge_vertices()
assert tooth_src.is_watertight
MAT_TOOTH = mat['wisdom tooth']


def pbr(name, rgba, alpha=None):
    return trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=rgba, metallicFactor=0.0, roughnessFactor=0.7,
                                               doubleSided=True, alphaMode=alpha)


# Cut faces in dentine colour (as the cut views of the other models), removed bone see-through orange.
MAT_CUT = pbr('cut', [236, 215, 174, 255])
MAT_REMOVED = pbr('removed-bone', [232, 120, 40, 150], 'BLEND')

# ---- Tooth axes
c = tooth_src.centroid
v = tooth_src.vertices - c
w, V = np.linalg.eigh(np.cov(v.T))
axis = V[:, 2]
if (v @ axis)[np.argmin(tooth_src.vertices[:, 1])] < 0:
    axis = -axis          # crown -> root (the root tips are the lowest point of this tooth)
proj = v @ axis
tip = proj.min()
cej = tip + CROWN * SCALE * MM
length = np.ptp(proj) / MM / SCALE
print('wisdom tooth length %.1f mm life size (Wheeler 18 mm); CEJ %.1f model mm from the cusp tip' % (length, CROWN * SCALE))


def manifold(m):
    return m3.Manifold(m3.Mesh(np.asarray(m.vertices, dtype=np.float32), np.asarray(m.faces, dtype=np.uint32)))


def tri(mf):
    o = mf.to_mesh()
    return trimesh.Trimesh(np.asarray(o.vert_properties)[:, :3], np.asarray(o.tri_verts), process=True)


def split_plane(mesh, normal, point):
    """Cut a closed mesh by a plane; returns (part on the +normal side, part on the -normal side)."""
    n = np.asarray(normal, float) / np.linalg.norm(normal)
    a, b = manifold(mesh).split_by_plane(n.tolist(), float(n @ point))
    return tri(a), tri(b)


def with_cut(mesh, planes):
    """Give the faces that lie on a cut plane the cut (dentine) colour. Returns [(mesh, material), ...]."""
    fc = mesh.triangles_center
    on = np.zeros(len(fc), bool)
    for n, p in planes:
        n = np.asarray(n, float) / np.linalg.norm(n)
        on |= (np.abs((fc - p) @ n) < 0.02 * MM) & (np.abs(mesh.face_normals @ n) > 0.999)
    out = []
    if (~on).any():
        out.append((mesh.submesh([np.where(~on)[0]], append=True), MAT_TOOTH))
    if on.any():
        out.append((mesh.submesh([np.where(on)[0]], append=True), MAT_CUT))
    return out


# ---- Crown off at the CEJ (surgical removal) and the two roots apart (root sectioning)
cej_pt = c + axis * cej
roots, crown = split_plane(tooth_src, axis, cej_pt)
rv = roots.vertices - c
rr = rv - np.outer(rv @ axis, axis)
far = (rv @ axis) > cej + 4 * SCALE * MM
cent, lab = kmeans2(rr[far], 2, seed=1, minit='++')
sep = cent[1] - cent[0]
sep -= axis * (sep @ axis)
mid = c + (cent[0] + cent[1]) / 2
root_b, root_a = split_plane(roots, sep, mid)
print('root sectioning: root centres %.1f mm apart (life size)' % (np.linalg.norm(cent[1] - cent[0]) / MM / SCALE))

# ---- Coronectomy cut: CORONECTOMY_BELOW_CEJ mm below the CEJ, perpendicular to the long axis
cor_pt = c + axis * (cej + CORONECTOMY_BELOW_CEJ * SCALE * MM)
retained, cor_crown = split_plane(tooth_src, axis, cor_pt)
bone = G['model.009']
bv = bone.vertices
top = retained.vertices[np.argmax(retained.vertices[:, 1])]
near = np.hypot(bv[:, 0] - top[0], bv[:, 2] - top[2]) < 4 * SCALE * MM
crest = bv[near][:, 1].max()
below = (crest - retained.vertices[:, 1].max()) / MM / SCALE
print('coronectomy: highest point of the roots %.1f mm below the local bone crest (rule: at least %.0f mm)' % (below, CREST_RULE))
if below < CREST_RULE:
    sys.exit('coronectomy cut is not deep enough; raise CORONECTOMY_BELOW_CEJ')
nerve = G['model.024_1']
q = trimesh.proximity.ProximityQuery(retained)
nd = -q.signed_distance(nerve.vertices).max() / MM / SCALE
print('closest nerve point to the kept roots: %.2f mm (life size; negative = touching, as in the source model)' % nd)


# ---- Removed bone (surgical removal): a shell BONE_GUTTER mm around the crown, cheek side and behind only
def removed_bone():
    lo = crown.bounds[0] - 4 * SCALE * MM
    hi = crown.bounds[1] + 4 * SCALE * MM
    step = 0.7 * MM
    xs, ys, zs = [np.arange(lo[i], hi[i], step) for i in range(3)]
    P = np.stack(np.meshgrid(xs, ys, zs, indexing='ij'), -1).reshape(-1, 3)
    d = -trimesh.proximity.ProximityQuery(crown).signed_distance(P).reshape(len(xs), len(ys), len(zs))  # + outside
    r = BONE_GUTTER * SCALE * MM
    field = np.minimum(r - d, d + 0.15 * MM)        # inside the shell: 0 < d < r (a hair off the crown surface)
    vs, fs, _, _ = measure.marching_cubes(field, 0.0, spacing=(step, step, step))
    shell = trimesh.Trimesh(vs + lo, fs, process=True)
    shell.fix_normals()
    # Keep the cheek side and the back of the crown. Cheek side: away from the tongue (the bone's lingual plate
    # is the bone nearest the tooth). Back: away from the second molar (towards the ramus).
    teeth = G['model.021_1'].vertices
    m2 = teeth[np.argsort(np.linalg.norm(teeth - c, axis=1))[:400]].mean(0)   # nearest part of the second molar
    back = c - m2
    back[1] = 0
    back /= np.linalg.norm(back)
    lingual_pts = bv[np.linalg.norm(bv - c, axis=1) < 12 * SCALE * MM]
    tongue = lingual_pts.mean(0) - c
    tongue[1] = 0
    tongue -= back * (tongue @ back)
    tongue /= np.linalg.norm(tongue)
    fc = shell.triangles_center - c
    keep = ((fc @ -tongue) > -1.0 * SCALE * MM) | ((fc @ back) > 1.0 * SCALE * MM)
    keep &= (shell.triangles_center - cej_pt) @ axis < 1.0 * SCALE * MM     # down to 1 mm below the CEJ
    keep &= ((fc @ tongue) < 3.0 * SCALE * MM)
    shell = shell.submesh([np.where(keep)[0]], append=True)
    # Not inside the second molar
    tq = trimesh.proximity.ProximityQuery(G['model.021_1'])
    inside = tq.signed_distance(shell.triangles_center) > 0
    shell = shell.submesh([np.where(~inside)[0]], append=True)
    parts = shell.split(only_watertight=False)
    shell = trimesh.util.concatenate([p for p in parts if len(p.faces) > 40])
    print('removed bone shell: %d faces, cheek-side direction %s' % (len(shell.faces), np.round(-tongue, 2)))
    return shell, -tongue


KEEP = [('mandible left', 'model.009'), ('teeth_1', 'model.021'), ('teeth_2', 'model.021_1'), ('nerve_1', 'model.024'), ('nerve_2', 'model.024_1')]


def build(name, extra):
    s = trimesh.Scene()
    for node, g in KEEP:
        s.add_geometry(G[g], node_name=node, geom_name=g)
    for node, mesh, material in extra:
        m = mesh.copy()
        m.visual = trimesh.visual.TextureVisuals(material=material)
        s.add_geometry(m, node_name=node, geom_name=node)
    path = os.path.join(OUT, name + '.glb')
    s.export(path)
    print('wrote', os.path.relpath(path, ROOT))


def pieces(node, mesh, planes, shift):
    return [(node + ('' if m is MAT_TOOTH else ' cut'), part.apply_translation(shift), m) for part, m in with_cut(mesh.copy(), planes)]


up = np.array([0, 1, 0.0])
gap = GAP * SCALE * MM
sepn = sep / np.linalg.norm(sep)
shell, cheek = removed_bone()
# Name each root (node names must differ, or the second replaces the first): the one nearer the second molar is mesial.
_m2 = G['model.021_1'].vertices
_near = lambda r: np.linalg.norm(_m2 - r.centroid, axis=1).min()
names = ['wisdom tooth mesial root', 'wisdom tooth distal root'] if _near(root_a) < _near(root_b) else ['wisdom tooth distal root', 'wisdom tooth mesial root']
lift = up + 0.6 * cheek
lift /= np.linalg.norm(lift)     # pieces come out upwards and towards the cheek (drawn)

# 1. Surgical removal, during: bone removed around the crown, crown cut off and lifted, roots cut apart.
build('removal-during', [('removed bone', shell, MAT_REMOVED)]
      + pieces('wisdom tooth crown', crown, [(axis, cej_pt)], lift * (LIFT * SCALE * MM))
      + pieces(names[0], root_a, [(axis, cej_pt), (sepn, mid)], -sepn * gap / 2 + lift * gap)
      + pieces(names[1], root_b, [(axis, cej_pt), (sepn, mid)], sepn * gap / 2 + lift * gap))
# 2. Surgical removal, after: the whole tooth is out; the removed bone is still marked.
build('removal-after', [('removed bone', shell, MAT_REMOVED)])
# 3. Coronectomy, during: the crown (with all the enamel) is cut off and lifted out; the roots stay.
build('coronectomy-during', pieces('wisdom tooth crown', cor_crown, [(axis, cor_pt)], lift * (LIFT * SCALE * MM))
      + pieces('wisdom tooth roots', retained, [(axis, cor_pt)], np.zeros(3)))
# 4. Coronectomy, after: only the roots are left, below the bone crest, next to the nerve.
build('coronectomy-after', pieces('wisdom tooth roots', retained, [(axis, cor_pt)], np.zeros(3)))
# 5. Coronectomy, about 3 years later: the roots have moved up, away from the nerve.
build('coronectomy-later', pieces('wisdom tooth roots', retained, [(axis, cor_pt)], up * (MIGRATE * SCALE * MM)))
