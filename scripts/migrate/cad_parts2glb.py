import pickle, numpy as np, trimesh, sys
from trimesh.visual.material import PBRMaterial
parts=pickle.load(open('parts.pkl','rb'))
allP=np.vstack([p['P'] for p in parts])
mn,mx=allP.min(0),allP.max(0)
print('dim mm',np.round(mx-mn),'parts',len(parts),'tri',sum(len(p['I']) for p in parts))
cx,cy,cz=(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,mn[2]
import re
def mat_of(name,rgb):
    n=name.lower()
    if re.search(r'plexy|vetro|glass',n): return ('glass',(.62,.78,.85),0.0,.05)
    if re.search(r'tappeto|cinghia|belt',n): return ('belt',(.03,.03,.035),0.1,.9)
    if re.search(r'stelo|rullo|vite|screw|cuscinetto|bearing|lead screw|albero',n): return ('steel',(.62,.63,.65),1.0,.3)
    if re.search(r'profile|mgn|binario|guida|staffa|supporto|slide|ventol|hotend|estrusore|carter',n): return ('alu',(.55,.58,.64),.8,.42)
    if re.search(r'fianc|semicorpo|chiusura|sportello|cover|lamier|collant|omega|separatore|pianale|base|rinf',n): return ('silver',(.74,.75,.76),.9,.34)
    if re.search(r'guscio|corpo|telaio|ang',n): return ('black',(.075,.075,.08),.35,.5)
    return ('misc',(.36,.37,.4),.6,.5)
groups={}
for p in parts:
    k=mat_of(p['name'],p['rgb']);groups.setdefault(k,[]).append(p)
sc=trimesh.Scene()
for k,ps in groups.items():
    V=[];F=[];off=0
    for p in ps:
        P=p['P'].astype(np.float64)
        P=np.c_[(P[:,0]-cx),(P[:,2]-cz),-(P[:,1]-cy)]/1000.0
        P=np.c_[P[:,0],(mx[2]-mn[2])/1000.0-P[:,1],-P[:,2]]
        V.append(P);F.append(p['I'].astype(np.int64)+off);off+=len(P)
    m=trimesh.Trimesh(np.vstack(V),np.vstack(F),process=False)
    nm,col,met,rough=k
    c=[int(col[0]*255),int(col[1]*255),int(col[2]*255),255 if nm!='glass' else 110]
    m.visual=trimesh.visual.TextureVisuals(material=PBRMaterial(name=nm,baseColorFactor=c,metallicFactor=met,roughnessFactor=rough,doubleSided=True,alphaMode='BLEND' if nm=='glass' else 'OPAQUE'))
    sc.add_geometry(m,node_name='part_'+nm)
sc.export('next_raw.glb')
import os;print('raw glb MB',os.path.getsize('next_raw.glb')/1048576)
