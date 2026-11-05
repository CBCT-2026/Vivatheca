# Export right-side teeth, right maxilla and mandible from Z-Anatomy as world-space vertex/face arrays (metres).
import bpy, sys, numpy as np
bpy.ops.wm.open_mainfile(filepath=sys.argv[-2], load_ui=False, use_scripts=False)
out=sys.argv[-1]; dg=bpy.context.evaluated_depsgraph_get(); O=bpy.data.objects
names={'Mandible':'mandible','Maxilla.r':'maxilla','Palatine bone.r':'palatine'}
T={'medial incisor':'I1','lateral incisor':'I2','canine':'C','first premolar':'PM1','second premolar':'PM2','first molar tooth':'M1','second molar tooth':'M2'}
for jaw in ('Upper','Lower'):
    for k,v in T.items(): names[f'{jaw} {k}.r']=f'{jaw.lower()}_{v}'
d={}
for n,key in names.items():
    o=O[n].evaluated_get(dg); me=o.to_mesh(); me=me.copy(); me.transform(O[n].matrix_world); me.calc_loop_triangles()
    v=np.array([x.co[:] for x in me.vertices]); f=np.array([t.vertices[:] for t in me.loop_triangles])
    d[key+'_v']=v; d[key+'_f']=f
np.savez(out,**d); print('ok',len(names))
