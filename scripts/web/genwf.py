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
# ---- AUTO
car=[ "M50 252 L50 222 Q56 204 110 198 L190 132 Q206 118 236 116 L398 116 Q428 118 446 138 L500 192 Q566 198 584 222 L590 252",
 "M50 252 H132 M202 252 H418 M488 252 H590",
 "M132 252 A35 35 0 0 1 202 252","M418 252 A35 35 0 0 1 488 252",
 "M206 198 L246 136 H334 V198 Z","M348 136 V198 H452 L410 136 Z",
 ("M50 232 H590","f"),("M50 244 H590","f"),("M110 198 H500","f"),
 ("M236 116 V198","f"),("M398 116 L410 136","f"),("M60 222 Q320 214 580 222","f"),
 ("M90 198 V252","f"),("M260 200 V252","f"),("M340 198 V252","f"),("M380 198 V252","f"),("M540 200 V252","f"),
 (circ(167,252,30),"a w"),(circ(167,252,13),"w"),(circ(453,252,30),"a w"),(circ(453,252,13),"w"),
 ("M60 282 H580","g"),("M90 298 H550","g"),("M130 314 H510","g"),("M170 330 H470","g")]
out['automotive']=mk(car)
# ---- NAVE
ship=["M36 232 H604 L566 296 H86 Z",
 "M170 232 V190 H372 L412 232","M240 190 V150 H340 L362 190","M300 150 V64 L336 80 L300 96",
 ("M36 246 H592","f"),("M44 260 H580","f"),("M56 276 H570","f"),
 ("M120 232 L106 296","f"),("M200 232 L190 296","f"),("M280 232 L276 296","f"),("M360 232 L362 296","f"),("M440 232 L448 296","f"),("M520 232 L534 296","f"),
 ("M196 204 H212 V218 H196 Z","a"),("M232 204 H248 V218 H232 Z","a"),("M268 204 H284 V218 H268 Z","a"),("M304 204 H320 V218 H304 Z","a"),("M340 204 H356 V218 H340 Z","a"),
 ("M256 160 H284 V176 H256 Z","a"),("M296 160 H324 V176 H296 Z","a"),
 ("M20 316 Q55 302 90 316 T160 316 T230 316 T300 316 T370 316 T440 316 T510 316 T580 316 T640 316","g w2"),
 ("M0 336 Q35 322 70 336 T140 336 T210 336 T280 336 T350 336 T420 336 T490 336 T560 336 T630 336","g w2")]
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
open('lib/wireframes.ts','w').write('// Disegni al tratto per la sezione Settori (generati da scripts/web/genwf.py)\nexport const WF: Record<string, string> = '+json.dumps(out)+'\n')
print({k:len(v) for k,v in out.items()})
