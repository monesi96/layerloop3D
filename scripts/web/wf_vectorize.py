import sys, json, numpy as np, cv2
from skimage.morphology import skeletonize
src,out=sys.argv[1],sys.argv[2]
W=int(sys.argv[3]) if len(sys.argv)>3 else 1600
im=cv2.imread(src); h,w=im.shape[:2]; s=W/w
im=cv2.resize(im,(W,int(h*s)),interpolation=cv2.INTER_AREA)
g=im.max(2).astype(np.uint8)
g=cv2.GaussianBlur(g,(0,0),0.8)
from skimage.filters import apply_hysteresis_threshold
LO,HI=int(sys.argv[4]),int(sys.argv[5]);MINL=float(sys.argv[6])
th=(apply_hysteresis_threshold(g,LO,HI)*255).astype(np.uint8)
th=cv2.morphologyEx(th,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))
sk=skeletonize(th>0)
H,Wd=sk.shape
ys,xs=np.nonzero(sk)
nb=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
pix=set(zip(ys.tolist(),xs.tolist()))
def nbrs(p):
    return [(p[0]+a,p[1]+b) for a,b in nb if (p[0]+a,p[1]+b) in pix]
deg={p:len(nbrs(p)) for p in pix}
visited_edges=set()
paths=[]
def walk(start,nxt):
    path=[start,nxt];visited_edges.add((start,nxt));visited_edges.add((nxt,start))
    prev,cur=start,nxt
    while deg[cur]==2:
        c=[q for q in nbrs(cur) if q!=prev and (cur,q) not in visited_edges]
        if not c: break
        q=c[0];visited_edges.add((cur,q));visited_edges.add((q,cur))
        path.append(q);prev,cur=cur,q
    return path
nodes=[p for p in pix if deg[p]!=2]
for p in nodes:
    for q in nbrs(p):
        if (p,q) not in visited_edges: paths.append(walk(p,q))
for p in pix:  # anelli chiusi
    for q in nbrs(p):
        if (p,q) not in visited_edges: paths.append(walk(p,q))
res=[]
for pa in paths:
    if len(pa)<6: continue
    a=np.array([(x,y) for y,x in pa],np.float32).reshape(-1,1,2)
    ap=cv2.approxPolyDP(a,0.9,False).reshape(-1,2)
    if len(ap)<2: continue
    L=float(np.sum(np.hypot(*np.diff(ap,axis=0).T)))
    if L<MINL: continue
    res.append((ap,L))
print('paths',len(res),'pts',sum(len(a) for a,_ in res),'len',int(sum(L for _,L in res)))
json.dump({'w':W,'h':int(h*s),'paths':[{'p':[[round(float(x),1),round(float(y),1)] for x,y in a],'l':round(L,1)} for a,L in res]},open(out,'w'))
