"""Split the Z-Anatomy lower teeth (FDI 31-37, 41-47) and voxelise the mandible (0.25 mm, filled).
Run: python3 prep.py <z-anatomy-base dir> <work dir>"""
import sys
from pathlib import Path
import trimesh, numpy as np
from scipy import ndimage as nd
B = sys.argv[1].rstrip('/') + '/'; W = Path(sys.argv[2]); W.mkdir(parents=True, exist_ok=True)
t=trimesh.load(B+'mandible_lower_teeth_only.stl'); b=trimesh.load(B+'mandible_bone_only.stl')
groups=[]
for c in sorted(t.split(only_watertight=False),key=lambda c:-abs(c.volume)):
    for g in groups:
        if np.linalg.norm(g[0].centroid[:2]-c.centroid[:2])<3: g.append(c); break
    else: groups.append([c])
d={}
for side,sgn in (('4',-1),('3',1)):
    # keep the largest shell of each tooth (the first molars have nested inner shells); patient's right is -x
    gs=sorted([g[0] for g in groups if np.sign(g[0].centroid[0])==sgn], key=lambda m:m.centroid[1])  # front (-y) first
    for i,m in enumerate(gs):
        if m.volume<0: m.invert()
        d[f'{side}{i+1}_v']=m.vertices; d[f'{side}{i+1}_f']=m.faces
        print(side+str(i+1), np.round(m.centroid,1), round(m.volume))
np.savez(W / 'teeth.npz',**d)
P=0.25
vg=b.voxelized(P); f=nd.binary_fill_holes(vg.matrix)
np.savez_compressed(W / 'bone_vox.npz', m=f, T=vg.transform)
