import math,json
out={}
def mk(items):
    s='';i=0
    for it in items:
        cls='';
        if isinstance(it,tuple): d,cls=it
        else: d=it
        tr=''
        if '|' in d: d,tr=d.split('|')
        s+=f'<path pathLength="1" class="{cls}" style="--i:{i}" d="{d}"'+(f' transform="{tr}"' if tr else '')+'/>'
        i+=1
    return s
def circ(cx,cy,r):
    return f'M{cx-r} {cy} a{r} {r} 0 1 0 {2*r} 0 a{r} {r} 0 1 0 {-2*r} 0'

def cr(pts,n=14):
    """Catmull-Rom: restituisce polilinea campionata che passa per pts"""
    P=[pts[0]]+pts+[pts[-1]];out=[]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        for k in range(n):
            t=k/n;t2=t*t;t3=t2*t
            out.append(tuple(.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3) for j in (0,1)))
    out.append(pts[-1]);return out
def poly(pl,close=False):
    d='M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in pl)
    return d+(' Z' if close else '')
def at(pl,x):
    for (x0,y0),(x1,y1) in zip(pl,pl[1:]):
        if (x0<=x<=x1) or (x1<=x<=x0):
            return y0 if x1==x0 else y0+(y1-y0)*(x-x0)/(x1-x0)
    return pl[-1][1]
def mesh(U,L,x0,x1,step,wl=(.25,.5,.75)):
    r=[]
    x=x0
    while x<=x1:
        r.append((f"M{x:.1f} {at(U,x):.1f} L{x:.1f} {at(L,x):.1f}","f"));x+=step
    for t in wl:
        pts=[];xx=x0
        while xx<=x1:
            pts.append((xx,at(U,xx)*(1-t)+at(L,xx)*t));xx+=6
        r.append((poly(pts),"f"))
    return r
def wheel(cx,cy,r):
    w=[(circ(cx,cy,r),"a w"),(circ(cx,cy,r*.74),"w"),(circ(cx,cy,r*.22),"a w")]
    for i in range(5):
        a=i*2*math.pi/5
        w.append((f"M{cx+r*.22*math.cos(a):.1f} {cy+r*.22*math.sin(a):.1f} L{cx+r*.72*math.cos(a):.1f} {cy+r*.72*math.sin(a):.1f}","w"))
    return w
# ---- AUTO
Up=cr([(64,262),(70,236),(96,214),(160,198),(232,178),(300,146),(372,124),(432,122),(488,140),(548,176),(620,200),(690,214),(722,236),(728,262)],12)
Lo=[]
for x in range(64,729,4):
    y=268.0
    for cx in (196,572):
        dx=x-cx
        if abs(dx)<56: y=min(y,cy_:=0) if False else min(y,(262-math.sqrt(max(0,56*56-dx*dx))))
    Lo.append((x,y))
car=[poly(Up),poly(Lo),f"M64 262 L64 268 L{Lo[0][0]} {Lo[0][1]}",f"M728 262 L728 268",
 ("M236 196 L304 150 L370 134 L434 134 L486 152 L526 196 Z","a"),("M370 134 L372 196","a"),("M236 196 H620","a"),
 ("M96 214 Q150 226 232 222","f"),("M548 176 L586 198 L700 218","f"),
 ("M120 244 H690","g"),("M644 214 L668 232 L720 238","a"),("M92 250 L120 262","a")]
car+=mesh(Up,Lo,84,712,22)
car+=wheel(196,262,42)+wheel(572,262,42)
car+=[("M40 296 H740","g"),("M80 312 H700","g"),("M130 328 H640","g")]
out['automotive']=mk(car)
# ---- NAVE
Deck=cr([(40,226),(160,234),(330,238),(520,232),(650,218),(722,190)],12)
Keel=cr([(40,226),(64,276),(140,304),(330,312),(520,302),(640,274),(722,190)],12)
ship=[poly(Deck),poly(Keel),
 ("M200 238 V190 H340 L376 238","a"),("M248 190 V150 H336 L356 190","a"),("M292 150 V74 L330 92 L292 108","a"),("M270 150 L330 150","a"),
 ("M170 238 V206 H200","a"),("M376 238 V212 H440 V238","a"),
 ("M214 206 H228 V220 H214 Z","a"),("M244 206 H258 V220 H244 Z","a"),("M274 206 H288 V220 H274 Z","a"),("M304 206 H318 V220 H304 Z","a"),("M334 206 H348 V220 H334 Z","a"),
 ("M262 164 H280 V178 H262 Z","a"),("M300 164 H318 V178 H300 Z","a"),("M268 90 L316 90","f"),("M280 120 L336 120","f"),
 ("M480 238 V206 H560 V238","f"),("M500 206 V186 H540 V206","f")]
ship+=mesh(Deck,Keel,60,700,26,(.2,.4,.6,.8))
ship+=[("M10 330 Q45 316 80 330 T150 330 T220 330 T290 330 T360 330 T430 330 T500 330 T570 330 T640 330 T710 330 T780 330","g w2"),("M0 348 Q35 334 70 348 T140 348 T210 348 T280 348 T350 348 T420 348 T490 348 T560 348 T630 348 T700 348","g w2")]
out['nautical']=mk(ship)
# ---- INSOLE
foot="M300 40 C360 36 380 80 372 140 C366 190 380 240 360 290 C346 330 300 340 270 320 C240 300 236 240 244 190 C250 140 236 80 300 40 Z"
ins=[foot]
for k,sc in enumerate([.86,.72,.58,.44,.3]):
    ins.append((foot+f"|translate({310*(1-sc):.1f} {190*(1-sc):.1f}) scale({sc})","f"))
ins+= ["M246 190 C280 168 340 170 372 150","M240 230 C280 212 340 214 368 196",("M262 60 C268 90 300 96 330 74","a"),
 (circ(268,68,12),"a"),(circ(300,52,10),"a"),(circ(330,56,9),"a"),(circ(352,76,8),"a"),
 ("M310 40 V334","g"),("M236 190 H382","g"),("M246 120 H372","g"),("M256 260 H366","g")]
out['medical']=mk(ins)
# ---- GEAR
def gear(cx,cy,ro,ri,n):
    pts=[];s=2*math.pi/n
    for i in range(n):
        a=i*s
        for da,r in [(-.30,ri),(-.17,ro),(.17,ro),(.30,ri)]:
            pts.append((cx+r*math.cos(a+da*s*1.6),cy+r*math.sin(a+da*s*1.6)))
    return 'M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in pts)+' Z'
g=[(gear(262,160,82,66,14),"a gear"),(circ(262,160,50),"f gear"),(circ(262,160,16),"gear"),(circ(262,160,6),"a")]
for i in range(6):
    a=i*math.pi/3
    g.append((f"M{262+16*math.cos(a):.1f} {160+16*math.sin(a):.1f} L{262+50*math.cos(a):.1f} {160+50*math.sin(a):.1f}","f gear"))
g+=[(gear(410,214,54,42,10),"gear2"),(circ(410,214,26),"f gear2"),(circ(410,214,8),"a")]
g+=["M60 300 H580","M60 330 H580",("M60 300 A15 15 0 0 0 60 330","a"),("M580 300 A15 15 0 0 1 580 330","a")]
for x in range(100,560,60): g.append((f"M{x} 300 V330","g"))
out['manufacturing']=mk(g)
# ---- FLASK
fl=["M290 50 H350 V130 L420 268 Q432 302 400 306 H240 Q208 302 220 268 L290 130 Z",
 "M282 50 H358","M290 84 H350",
 ("M246 238 Q276 226 306 238 T366 238 T426 238","a w2"),
 ("M232 262 H410","f"),("M240 282 H402","f"),("M264 210 L376 210","f"),
 (circ(316,200,7),"a"),(circ(346,176,5),"a"),(circ(330,150,4),"a"),(circ(300,170,3),"a"),
 "M470 150 V292 H570 V150","M462 150 H578",
 ("M470 200 H570","f"),("M470 236 H570","f"),("M470 268 H570","f"),
 ("M60 318 H580","g"),("M100 334 H540","g")]
out['r-d']=mk(fl)
# ---- SHOE
sh=["M80 270 H560","M80 236 H552","M560 270 Q574 252 552 236","M80 270 Q68 252 80 236",
 "M80 236 L84 170 Q86 150 108 146 L176 142 Q216 134 246 108 L270 90 Q300 80 322 96 L360 120 L440 152 Q520 172 552 236",
 "M176 142 Q190 120 246 108",
 ("M300 100 L282 132","a"),("M326 112 L306 142","a"),("M352 124 L332 152","a"),("M378 136 L358 160","a"),
 ("M96 176 Q200 190 330 176","f"),("M92 206 Q220 214 440 190","f")]
for x in range(92,540,28):
    sh.append((f"M{x} 236 L{x+28} 270","f")); sh.append((f"M{x+28} 236 L{x} 270","f"))
out['custom-production']=mk(sh)
open('/home/user/layerloop3D/web/lib/wireframes.ts','w').write('// Disegni al tratto per la sezione Settori (generati da scripts/web/genwf.py)\nexport const WF: Record<string, string> = '+json.dumps(out)+'\n')
print({k:len(v) for k,v in out.items()})
