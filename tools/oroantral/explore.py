import trimesh, numpy as np, sys
from scipy import ndimage
m=trimesh.load('/mnt/project-files/head-neck-recon/z-anatomy-base/skull_cranium_with_upper_teeth.stl')
parts=m.split(only_watertight=False)
print(len(parts))
def find(b):
    for p in parts:
        if np.allclose(p.bounds,b,atol=1.5): return p
raw={'max':[[-46.0,-93.9,1537.4],[0.2,-40.1,1605.2]],'pal':[[-27.0,-60.0,1544.0],[-0.8,-24.8,1584.1]],
 'm1':[[-29.8,-64.8,1531.7],[-18.5,-53.5,1555.7]],'m2':[[-29.5,-55.5,1535.2],[-17.9,-45.9,1557.3]],'pm2':[[-27.6,-71.6,1529.7],[-18.5,-64.1,1555.0]],'zyg':[[-62.3,-71.7,1553.7],[-31.6,-32.7,1608.5]]}
out={}
for k,b in raw.items():
    p=find(np.array(b)); print(k, p is not None, None if p is None else (np.round(p.bounds,1).tolist(), len(p.faces), p.is_watertight))
    out[k]=p
    p.export(f'work/{k}.stl')
