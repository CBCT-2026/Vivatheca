import trimesh, numpy as np
from scipy import ndimage
import matplotlib
P=0.25
lo=np.array([-52.,-72.,1526.]); hi=np.array([-0.,-36.,1606.])
shape=np.ceil((hi-lo)/P).astype(int)
def vox(name):
    m=trimesh.load(f'work/{name}.stl')
    # inside test per z-slice via ray parity using trimesh contains (embree absent -> slow); use section-based fill
    g=np.zeros(shape,bool)
    xs=lo[0]+P*(np.arange(shape[0])+.5); ys=lo[1]+P*(np.arange(shape[1])+.5)
    X,Y=np.meshgrid(xs,ys,indexing='ij')
    for k in range(shape[2]):
        z=lo[2]+P*(k+.5)
        s=m.section(plane_origin=[0,0,z],plane_normal=[0,0,1])
        if s is None: continue
        pl,_=s.to_2D(to_2D=np.eye(4))
        from matplotlib.path import Path
        inside=np.zeros(X.shape,int)
        pts=np.c_[X.ravel(),Y.ravel()]
        for d in pl.discrete:
            inside ^= Path(d).contains_points(pts).reshape(X.shape)
        g[:,:,k]=inside.astype(bool)
    return g
import sys
for n in ['max','pal','m1','m2','zyg']:
    g=vox(n); np.save(f'work/{n}.npy',g); print(n,g.sum())
