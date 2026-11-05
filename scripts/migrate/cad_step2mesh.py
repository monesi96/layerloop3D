from OCP.XCAFDoc import XCAFDoc_DocumentTool
import sys, json, time, numpy as np
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.IFSelect import IFSelect_RetDone
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepBndLib import BRepBndLib
from OCP.Bnd import Bnd_Box
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID
from OCP.BRep import BRep_Tool
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS
from OCP.XCAFPrs import XCAFPrs_DocumentExplorer, XCAFPrs_DocumentNode
from OCP.TDataStd import TDataStd_Name
t0=time.time()
doc=TDocStd_Document(TCollection_ExtendedString('d'))
rd=STEPCAFControl_Reader();rd.SetColorMode(True);rd.SetNameMode(True)
st=rd.ReadFile('next200.step');print('read',st==IFSelect_RetDone,time.time()-t0,flush=True)
rd.Transfer(doc);print('transfer',time.time()-t0,flush=True)
shape_tool=XCAFDoc_DocumentTool.ShapeTool_s(doc.Main());color_tool=XCAFDoc_DocumentTool.ColorTool_s(doc.Main())
# esplora l'assieme con trasformazioni
flags=XCAFPrs_DocumentExplorer
from OCP.XCAFPrs import XCAFPrs_DocumentExplorerFlags_None
ex=XCAFPrs_DocumentExplorer(doc,XCAFPrs_DocumentExplorerFlags_None)
out=[]
n=0
while ex.More():
    node=ex.Current()
    lab=node.RefLabel
    if shape_tool.IsSimpleShape_s(lab) or (not shape_tool.IsAssembly_s(lab) and shape_tool.IsShape_s(lab) and not node.IsAssembly):
        pass
    if not node.IsAssembly:
        shp=XCAFDoc_DocumentTool.ShapeTool_s(doc.Main()).GetShape_s(node.RefLabel)
        loc=node.Location
        name=''
        a=TDataStd_Name()
        if node.RefLabel.FindAttribute(TDataStd_Name.GetID_s(),a): name=a.Get().ToExtString()
        try:
            col=node.Style.GetColorSurfRGBA() if node.Style.IsSetColorSurf() else None
            rgb=[col.GetRGB().Red(),col.GetRGB().Green(),col.GetRGB().Blue()] if col is not None else None
        except Exception:
            rgb=None
        out.append((name,shp,loc,rgb))
    ex.Next(); n+=1
print('nodes',n,'parti',len(out),time.time()-t0,flush=True)
import pickle
# bbox globale con trasformazione
def tri(shp,loc):
    # mesh della forma e raccolta triangoli (coordinate locali) + trasformazione
    pos=[];idx=[];off=0
    ex=TopExp_Explorer(shp,TopAbs_FACE)
    while ex.More():
        f=TopoDS.Face(ex.Current())
        l=TopLoc_Location()
        t=BRep_Tool.Triangulation_s(f,l)
        if t is not None:
            tr=l.Transformation()
            nn=t.NbNodes()
            pts=np.array([[t.Node(i+1).Transformed(tr).X(),t.Node(i+1).Transformed(tr).Y(),t.Node(i+1).Transformed(tr).Z()] for i in range(nn)])
            rev=(f.Orientation()==1)
            tris=[]
            for k in range(t.NbTriangles()):
                a,b,c=t.Triangle(k+1).Get()
                tris.append([a-1,c-1,b-1] if rev else [a-1,b-1,c-1])
            pos.append(pts);idx.append(np.array(tris)+off);off+=nn
        ex.Next()
    if not pos:return None,None
    P=np.vstack(pos);I=np.vstack(idx)
    T=loc.Transformation()
    M=np.array([[T.Value(r+1,c+1) for c in range(4)] for r in range(3)])
    P=P@M[:,:3].T+M[:,3]
    return P,I
res=[]
t1=time.time()
boxes=[]
for (name,shp,loc,rgb) in out:
    b=Bnd_Box();BRepBndLib.Add_s(shp,b)
    if b.IsVoid():boxes.append(None);continue
    pa,pb=b.CornerMin(),b.CornerMax()
    T=loc.Transformation()
    # bbox trasformata: uso i centri e la diagonale
    d=((pb.X()-pa.X())**2+(pb.Y()-pa.Y())**2+(pb.Z()-pa.Z())**2)**.5
    boxes.append(d)
big=max(d for d in boxes if d)
print('diag max parte',round(big),flush=True)
MINF=float(sys.argv[1]) if len(sys.argv)>1 else 0.03
import multiprocessing as mp
mp.set_start_method('fork')
def work(i,defl,q):
    name,shp,loc,rgb=out[i];d=boxes[i]
    BRepMesh_IncrementalMesh(shp,max(d*defl,0.2),False,0.6,True)
    P,I=tri(shp,loc)
    q.put(None if P is None else (P.astype(np.float32),I.astype(np.uint32)))
todo=[i for i in range(len(out)) if boxes[i] and boxes[i]>=big*MINF]
print('da meshare',len(todo),flush=True)
skipped=[]
def run(i,defl,tmo):
    q=mp.Queue();p=mp.Process(target=work,args=(i,defl,q));p.start()
    try:
        r=q.get(timeout=tmo)
    except Exception:
        r='timeout'
    p.join(2)
    if p.is_alive():p.kill()
    return r
for i in todo:
    name,shp,loc,rgb=out[i]
    r=run(i,0.008,25)
    if r=='timeout':
        r=run(i,0.04,25)
        if r=='timeout':skipped.append(name);print('SKIP',name,flush=True);continue
    if r is None:continue
    P,I=r
    res.append({'name':name,'rgb':rgb,'P':P,'I':I})
    print(i,name[:30],len(I),round(time.time()-t1),flush=True)
print('skipped',skipped)
print('mesh ok',len(res),sum(len(r['I']) for r in res),'triangoli',time.time()-t0,flush=True)
pickle.dump(res,open('parts.pkl','wb'))
