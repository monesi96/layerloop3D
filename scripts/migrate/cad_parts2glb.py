import pickle, numpy as np, trimesh, re, os, json
from trimesh.visual.material import PBRMaterial
from PIL import Image
from scipy.ndimage import gaussian_filter
parts=pickle.load(open('parts.pkl','rb'))
for i,p in enumerate(parts): p['i']=i
allP=np.vstack([p['P'] for p in parts]); mn,mx=allP.min(0),allP.max(0)
cx,cy=(mn[0]+mx[0])/2,(mn[1]+mx[1])/2
# ---------- banco/cabinet sotto la macchina + tappeto (nel sistema CAD: Z verso il basso, mm) ----------
CAB_H=720.0
def box(name,x0,x1,y0,y1,z0,z1):
    b=trimesh.creation.box(extents=[x1-x0,y1-y0,z1-z0]);b.apply_translation([(x0+x1)/2,(y0+y1)/2,(z0+z1)/2])
    return {'name':name,'P':np.asarray(b.vertices,float),'I':np.asarray(b.faces,int),'i':-1}
zb=52.0
def cyl(name,cx_,cy_,z0,z1,r):
    c=trimesh.creation.cylinder(radius=r,height=abs(z1-z0),sections=18);c.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[1,0,0]))
    c.apply_translation([cx_,cy_,(z0+z1)/2]);return {'name':name,'P':np.asarray(c.vertices,float),'I':np.asarray(c.faces,int),'i':-1}
CB=zb+CAB_H-62  # sopra le ruote
cab=[box('CAB_corpo',-30,752,-214,214,zb+22,CB),
     box('CAB_top',-34,756,-218,218,zb,zb+22),
     box('CAB_zoccolo',-14,740,-200,200,CB,CB+14)]
for xx in (20,700):
    for yy in (-175,175): cab.append(cyl('CAB_ruota',xx,yy,CB+14,zb+CAB_H,26))
cab.append({'name':'CAB_logo','P':np.array([[753,110,zb+300],[753,-110,zb+300],[753,-110,zb+300+114],[753,110,zb+300+114]],float),'I':np.array([[0,1,2],[0,2,3]]),'i':-1,'uv':np.array([[0,1],[1,1],[1,0],[0,0]],float)})
# tappeto (nastro) attorno ai due rulli
def stadium(xa,xb,zc,R,n=64):
    pts=[]
    for k in range(n+1): a=-np.pi/2+np.pi*k/n; pts.append((xb+R*np.cos(a),zc+R*np.sin(a)))
    for k in range(n+1): a=np.pi/2+np.pi*k/n; pts.append((xa+R*np.cos(a),zc+R*np.sin(a)))
    return np.array(pts)
def belt(xa,xb,zc,R,t,y0,y1):
    o=stadium(xa,xb,zc,R);i=stadium(xa,xb,zc,R-t);m=len(o);V=[];F=[]
    def ring(r,y):
        s=len(V);[V.append((x,y,z)) for x,z in r];return s
    so0,so1,si0,si1=ring(o,y0),ring(o,y1),ring(i,y0),ring(i,y1)
    for k in range(m):
        k2=(k+1)%m
        for a,b in ((so0,so1),(si0,si1)):
            F+= [(a+k,a+k2,b+k),(a+k2,b+k2,b+k)]
        for a,b in ((so0,si0),(so1,si1)):
            F+= [(a+k,a+k2,b+k),(a+k2,b+k2,b+k)]
    return {'name':'TAPPETO','P':np.array(V,float),'I':np.array(F,int),'i':-1}
cab.append(belt(165,597,-64,42,3.0,-140,140))
parts+=cab
allP=np.vstack([p['P'] for p in parts]); mn,mx=allP.min(0),allP.max(0)
H=(mx[2]-mn[2])/1000.0
def tf(P):
    P=np.asarray(P,float);X=(P[:,0]-cx)/1000.0;Y=(mx[2]-P[:,2])/1000.0;Z=(P[:,1]-cy)/1000.0
    return np.c_[X,Y,Z]
# ---------- texture: alluminio spazzolato (normal map piastrellabile) ----------
rng=np.random.default_rng(3);h=rng.random((256,256))
h=gaussian_filter(h,(0.6,10),mode='wrap');h=(h-h.min())/(h.max()-h.min())
gx=np.gradient(h,axis=1)*6;gy=np.gradient(h,axis=0)*60
n=np.dstack([-gx,-gy,np.ones_like(h)]);n/=np.linalg.norm(n,axis=2,keepdims=True)
brushed=Image.fromarray(((n*.5+.5)*255).astype(np.uint8))
# ---------- materiali ----------
def mat_of(p):
    n=p['name'].lower();i=p['i']
    if n.startswith('cab_'):
        if n=='cab_logo': return 'cablogo'
        if n=='cab_ruota': return 'black'
        if 'manig' in n: return 'chrome'
        if n=='cab_zoccolo': return 'shell'
        return 'outer'
    if n=='tappeto': return 'belt'
    if re.search(r'partic',n): return 'glass'
    if re.search(r'^fianc',n): return 'smoke'
    if re.search(r'plexy opalino',n): return 'logo'
    if re.search(r'adesivo cromato',n): return 'chrome'
    if i==128: return 'brass'
    if i==139: return 'motor'
    if re.search(r'board pogopin',n): return 'pcb'
    if re.search(r'carter estrusore|cover hotend|convogliatore|supporto ventole|bracket probe',n): return 'accent'
    if re.search(r'e3d|dissipatore',n): return 'alu'
    if re.search(r'fan|guarnizione|raccordo|switch|nema|soffietto',n): return 'black'
    if re.search(r'cinghia|gt2|blocco cinghia',n): return 'belt'
    if re.search(r'piano|lamierino distaccante|parte1',n): return 'steel'
    if re.search(r'stelo|rullo|screw|vite|lead|nut|coupler|lm8|bearing|perno|tappo|cuscinetto$|8mm',n): return 'steel'
    if re.search(r'profile|mgn|binario|piastra|supporto cuscinetto|slide',n): return 'alu'
    if re.search(r'corpo telaio|staff|supporto|carter|puleggia',n): return 'frame'
    if re.search(r'guscio|lamierino post',n): return 'shell'
    if re.search(r'fianc|semicorpo|chiusura|sportello|cover|collant|omega|separatore|base|rinf|battura',n): return 'outer'
    return 'frame'
M={ # nome:(rgb,metal,rough,extra)
 'outer':((.56,.545,.50),.8,.5,{}),
 'smoke':((.55,.58,.60),.0,.25,{'alpha':120}),
 'cabinet':((.085,.09,.10),.55,.5,{}),
 'door':((.12,.125,.14),.55,.42,{}),
 'shell':((.07,.07,.08),.3,.5,{}),
 'frame':((.13,.135,.15),.75,.38,{}),
 'alu':((.70,.72,.76),.95,.32,{'tex':1}),
 'steel':((.58,.60,.63),1.0,.26,{'tex':1}),
 'black':((.035,.035,.04),.4,.55,{}),
 'motor':((.06,.06,.07),.7,.45,{}),
 'belt':((.025,.025,.03),.0,.88,{}),
 'brass':((.80,.62,.28),1.0,.28,{}),
 'accent':((.14,.74,.70),.1,.5,{}),
 'pcb':((.04,.30,.20),.2,.45,{}),
 'chrome':((.9,.9,.92),1.0,.1,{}),
 'logo':((.85,.97,.96),.0,.3,{'emis':(.25,.95,.88)}),
 'led':((.26,.79,.75),.0,.3,{'emis':(.26,.9,.85)}),
 'glass':((.50,.72,.80),.0,.06,{'alpha':95}),
 'cablogo':((1,1,1),.0,.5,{'logo':1}),
}
groups={}
for p in parts: groups.setdefault(mat_of(p),[]).append(p)
sc=trimesh.Scene()
for nm,ps in groups.items():
    V=[];F=[];off=0
    for p in ps:
        P=tf(p['P']);V.append(P);F.append(p['I'].astype(np.int64)+off);off+=len(P)
    V=np.vstack(V);F=np.vstack(F)
    m=trimesh.Trimesh(V,F,process=False)
    col,met,rough,ex=M[nm]
    kw=dict(name=nm,baseColorFactor=[int(c*255) for c in col]+[ex.get('alpha',255)],metallicFactor=met,roughnessFactor=rough,doubleSided=True,alphaMode='BLEND' if nm in('glass','outer','smoke') else 'OPAQUE')
    if 'emis' in ex: kw['emissiveFactor']=list(ex['emis'])
    if ex.get('tex'):
        kw['normalTexture']=brushed
    if ex.get('logo'):
        lg=Image.open('logo.png').convert('RGBA');kw['baseColorTexture']=lg;kw['alphaMode']='BLEND'
    mat=PBRMaterial(**kw)
    uv=np.c_[(V[:,0]+V[:,2])*3.0,V[:,1]*3.0] if ex.get('tex') else (np.vstack([p['uv'] for p in ps]) if ex.get('logo') else None)
    m.visual=trimesh.visual.TextureVisuals(uv=uv,material=mat) if uv is not None else trimesh.visual.TextureVisuals(material=mat)
    sc.add_geometry(m,node_name='part_'+nm)
sc.export('next_raw2.glb');print('raw MB',os.path.getsize('next_raw2.glb')/1048576,'H(m)',H)
# punti notevoli per le camere (m, sistema del GLB)
def bb(idx):
    P=tf(np.vstack([parts[i]['P'] for i in idx]));return [round(float(x),3) for x in (P.min(0)+P.max(0))/2],[round(float(x),3) for x in (P.max(0)-P.min(0))]
pts={'head':bb(range(113,133)),'extruder_all':bb(range(113,133)),'bed':bb([138,144,134,136]),'belt':bb([len(parts)-1]),'frame':bb([105]),'cabinet':bb(range(len(parts)-9,len(parts)-1)),'xaxis':bb([72,74,78,84,90]),'incl':bb([81,82]),'all':bb(range(len(parts)))}
json.dump(pts,open('pts.json','w'),indent=1);print(json.dumps(pts))
