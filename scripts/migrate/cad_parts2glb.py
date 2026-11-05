import pickle, numpy as np, trimesh, sys
from trimesh.visual.material import PBRMaterial
parts=pickle.load(open('parts.pkl','rb'))
allP=np.vstack([p['P'] for p in parts])
mn,mx=allP.min(0),allP.max(0)
print('dim mm',np.round(mx-mn),'parts',len(parts),'tri',sum(len(p['I']) for p in parts))
cx,cy,cz=(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,mn[2]
groups={}
for p in parts:
    rgb=p['rgb'] or [.58,.59,.6]
    k=tuple(round(float(c),2) for c in rgb)
    groups.setdefault(k,[]).append(p)
sc=trimesh.Scene()
for k,ps in groups.items():
    V=[];F=[];off=0
    for p in ps:
        P=p['P'].astype(np.float64)
        P=np.c_[(P[:,0]-cx),(P[:,2]-cz),-(P[:,1]-cy)]/1000.0   # Z-up mm -> Y-up m
        P=np.c_[P[:,0],(mx[2]-mn[2])/1000.0-P[:,1],-P[:,2]]     # capovolgo (rotazione di 180° attorno a X): il modello STEP è orientato con la base in alto
        V.append(P);F.append(p['I'].astype(np.int64)+off);off+=len(P)
    m=trimesh.Trimesh(np.vstack(V),np.vstack(F),process=False)
    m.visual=trimesh.visual.TextureVisuals(material=PBRMaterial(baseColorFactor=[int(k[0]*255),int(k[1]*255),int(k[2]*255),255],metallicFactor=0.4,roughnessFactor=0.5,doubleSided=True))
    sc.add_geometry(m,node_name='mat_%d_%d_%d'%tuple(int(c*255) for c in k))
sc.export('next_raw.glb')
import os;print('raw glb MB',os.path.getsize('next_raw.glb')/1048576)
