import bpy, numpy as np, sys
d=dict(np.load(sys.argv[-2])); out={}
for key in ('mandible','maxilla','palatine'):
    v=d[key+'_v']; f=d[key+'_f']
    me=bpy.data.meshes.new(key); me.from_pydata(v.tolist(),[],f.tolist()); me.update()
    ob=bpy.data.objects.new(key,me); bpy.context.scene.collection.objects.link(ob)
    m=ob.modifiers.new('r','REMESH'); m.mode='VOXEL'; m.voxel_size=0.00035; m.use_smooth_shade=True
    s=ob.modifiers.new('s','SMOOTH'); s.iterations=2; s.factor=0.5
    dg=bpy.context.evaluated_depsgraph_get(); e=ob.evaluated_get(dg).to_mesh(); e.calc_loop_triangles()
    out[key+'_v']=np.array([x.co[:] for x in e.vertices]); out[key+'_f']=np.array([t.vertices[:] for t in e.loop_triangles])
    print(key, len(out[key+'_v']))
np.savez(sys.argv[-1],**out)
