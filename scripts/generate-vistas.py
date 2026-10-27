"""Generate original, license-free SVG illustrated fallback vistas for the five worlds.

No external assets or requests. Runtime uses these only when the WebGL canvas
has not mounted. This intentionally avoids misrepresenting artwork as live 3D.
"""
from pathlib import Path
import random
from html import escape
BASE = Path(__file__).resolve().parent.parent/'public/assets/vistas'
BASE.mkdir(parents=True, exist_ok=True)
W,H=1600,900

def svg(body, accent, secondary, sky1,sky2,seed):
    rng=random.Random(seed)
    stars=[]
    for _ in range(150):
        x=rng.randint(460,1580);y=rng.randint(25,640);r=round(rng.choice([.5,.7,.9,1.3,1.7]),1)
        a=round(rng.uniform(.13,.68),2)
        stars.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{secondary}" opacity="{a}"/>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="Original illustrated science-fantasy world scene">
<defs>
 <linearGradient id="sky" x1="0" x2=".8" y1="1" y2="0"><stop stop-color="{sky1}"/><stop offset=".58" stop-color="{sky2}"/><stop offset="1" stop-color="{sky1}"/></linearGradient>
 <radialGradient id="halo"><stop stop-color="{accent}" stop-opacity=".33"/><stop offset=".46" stop-color="{secondary}" stop-opacity=".11"/><stop offset="1" stop-color="{secondary}" stop-opacity="0"/></radialGradient>
 <radialGradient id="lamp"><stop stop-color="{secondary}" stop-opacity=".86"/><stop offset=".24" stop-color="{accent}" stop-opacity=".23"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient>
 <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{secondary}" stop-opacity=".14"/><stop offset=".4" stop-color="{accent}" stop-opacity=".024"/><stop offset="1" stop-color="{accent}" stop-opacity=".12"/></linearGradient>
 <linearGradient id="fade"><stop stop-color="{sky1}" stop-opacity="1"/><stop offset=".2" stop-color="{sky1}" stop-opacity=".9"/><stop offset=".52" stop-color="{sky1}" stop-opacity=".36"/><stop offset=".75" stop-color="{sky1}" stop-opacity=".03"/></linearGradient>
 <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="{sky2}" stop-opacity=".72"/><stop offset="1" stop-color="#02070c"/></linearGradient>
 <filter id="blur"><feGaussianBlur stdDeviation="22"/></filter>
 <filter id="glow"><feGaussianBlur stdDeviation="5"/></filter>
 <pattern id="grit" width="140" height="100" patternUnits="userSpaceOnUse"><circle cx="19" cy="34" r=".6" fill="white" opacity=".12"/><circle cx="85" cy="81" r=".5" fill="white" opacity=".08"/></pattern>
</defs>
<rect width="1600" height="900" fill="url(#sky)"/>
<g>{''.join(stars)}</g>
{body}
<rect x="0" y="0" width="1450" height="900" fill="url(#fade)"/>
<rect width="1600" height="900" fill="url(#grit)"/>
</svg>'''

def dark_city(seed, levels=2, low='#101923', glow='#96dadb'):
    rng=random.Random(seed); parts=[]
    for level in range(levels):
        ybase=645+level*68
        for i in range(24):
            x=530+i*50+rng.randint(-16,15)
            width=rng.choice([27,34,43,51]); ht=rng.randint(85,250) if level else rng.randint(70,180)
            col=rng.choice(['#0c1a23','#12222b','#1c2e36']) if level else '#152331'
            parts.append(f'<rect x="{x}" y="{ybase-ht}" width="{width}" height="{ht}" fill="{col}"/>')
            for j in range(4):
                wx=x+6+(j%2)*12;wy=ybase-ht+16+j*27
                if wy<ybase-7 and rng.random()<.56:parts.append(f'<rect x="{wx}" y="{wy}" width="2" height="8" fill="{glow}" opacity="{rng.uniform(.12,.55):.2f}"/>')
    return '<g>'+''.join(parts)+'</g>'

self_scene='''
<ellipse cx="1120" cy="325" rx="480" ry="440" fill="url(#halo)"/>
<rect x="760" y="104" width="734" height="580" rx="248" stroke="#a88b69" stroke-width="12" opacity=".27" fill="#091622"/>
<rect x="789" y="134" width="677" height="520" rx="216" fill="url(#glass)" stroke="#d2bd94" stroke-opacity=".27" stroke-width="2"/>
<circle cx="1216" cy="267" r="104" fill="#d9c4a2" opacity=".1"/><circle cx="1216" cy="267" r="77" fill="#eedbc5" opacity=".83"/>
<circle cx="1216" cy="267" r="104" fill="#e8d3ac" opacity=".1" filter="url(#blur)"/>
''' + dark_city(24,2,'#172c33','#d4c39e')+'''
<g opacity=".34" stroke="#b5c4bd" stroke-width="1">''' + ''.join(f'<path d="M{x} 118 l-38 551"/>' for x in range(970,1470,27)) + '''</g>
<rect x="716" y="668" width="881" height="232" fill="url(#floor)"/>
<path d="M691 681 L1580 681" stroke="#8d8374" stroke-width="5" opacity=".45"/>
<path d="M700 824 L1580 703" stroke="#ceb38f" opacity=".13" stroke-width="3"/>
<ellipse cx="1220" cy="745" rx="420" ry="49" fill="#020407" opacity=".8" filter="url(#blur)"/>
<path d="M1265 657 q-39 -45 -96 -15 l-13 111 148 -2z" fill="#11191d" stroke="#8d776a" stroke-width="2"/>
<path d="M1169 653 l-48 15 -19 137 h174 l-4 -84 -36 -59z" fill="#151b1f"/>
<ellipse cx="1192" cy="573" rx="35" ry="42" fill="#172024"/><path d="M1160 570 q5 -54 42 -51 q27 4 32 37 l-8 -13 -33 7 -31 26z" fill="#0a141a"/>
<path d="M1162 622 q-44 12 -55 78 l-18 71 38 4 43 -84z" fill="#20272b"/><path d="M1193 648 q69 4 83 91 l33 33 -44 15 -46 -74z" fill="#121b20"/>
<path d="M1022 684 l94 0 17 61 -20 8 -42 -45 -53 13z" fill="#1e2326"/><path d="M1052 743 l-20 84 -15 0 16 -89z" fill="#aa8562"/>
<path d="M966 705 q44 -42 117 0 l-8 37 h-121z" fill="#352c28" stroke="#ad8972" stroke-width="2"/>
<path d="M1076 721 l35 30 72 -10" stroke="#dab793" stroke-width="3" opacity=".6"/>
<ellipse cx="1020" cy="816" rx="95" ry="13" fill="#080b0c" opacity=".7"/>
<rect x="877" y="690" width="194" height="15" rx="5" fill="#5a4235"/><path d="M905 705 l-12 118" stroke="#69513f" stroke-width="8"/><path d="M1047 705 l14 118" stroke="#69513f" stroke-width="8"/>
<rect x="909" y="654" width="18" height="37" fill="#644f3b"/><circle cx="918" cy="641" r="18" fill="#d9b785"/><circle cx="918" cy="641" r="66" fill="url(#lamp)"/>
<path d="M1375 689 q-31 -45 -17 -81 q31 12 40 63 q4 -57 42 -78 q8 70 -20 101" fill="#223f3a" stroke="#62917c" stroke-opacity=".42" stroke-width="3"/><rect x="1374" y="691" width="59" height="63" rx="5" fill="#655e4a"/>
<path d="M811 123 V664 M1453 123 V664" stroke="#c2a77e" stroke-opacity=".12" stroke-width="19"/>
'''

future='''
<ellipse cx="1150" cy="352" rx="620" ry="470" fill="url(#halo)"/>
<circle cx="1192" cy="295" r="194" stroke="#a8f1e7" stroke-width="12" stroke-opacity=".28" fill="none"/>
<circle cx="1192" cy="295" r="176" stroke="#8beccf" stroke-width="1" stroke-opacity=".46" fill="none"/>
<circle cx="1192" cy="295" r="151" fill="#c5fff0" opacity=".08"/>
<path d="M670 680 L990 200 L1080 688" fill="#1b3742" opacity=".75"/>
<path d="M905 685 L1180 126 L1399 692" fill="#1b3541" opacity=".5"/>
<path d="M1201 698 L1480 221 L1574 698" fill="#1e3b43" opacity=".6"/>
''' + dark_city(45,2,glow='#8ef2df')+'''
<path d="M902 721 L1269 721 1389 648" fill="none" stroke="#76d8cc" stroke-width="9" opacity=".3"/>
<path d="M730 753 Q1049 596 1570 677" fill="none" stroke="#79d7d0" stroke-width="4" opacity=".2"/>
<path d="M1255 190 V663 M1312 309 V677 M994 342 V670" stroke="#bcfff5" stroke-opacity=".18" stroke-width="3"/>
<g fill="#adf8f0" opacity=".8"><path d="m1000 321 l37 -14 28 12 -33 11z"/><path d="m1410 403 l35 -12 21 11 -32 12z"/></g>
<path d="M0 710 L1600 710 1600 900 0 900Z" fill="url(#floor)"/>
<path d="M510 805 Q970 702 1592 781" fill="none" stroke="#79e1df" stroke-width="1.5" opacity=".5"/>
<g opacity=".35" fill="#67cdb3"><path d="M880 674 l28 -65 12 66z"/><path d="M878 675 l-10 -49 16 21z"/><path d="M1470 675 l-21 -67 32 42z"/></g>
'''
past='''
<ellipse cx="1090" cy="340" rx="540" ry="470" fill="url(#halo)"/>
<path d="M842 705 V232 Q840 106 973 105 H1435 Q1579 105 1579 247 V700" fill="#170e15" stroke="#a57745" stroke-width="23" opacity=".95"/>
<path d="M877 689 V251 Q877 143 991 142 H1418 Q1546 143 1546 260 V685" fill="url(#glass)" stroke="#d1a165" stroke-opacity=".5" stroke-width="3"/>
<circle cx="1272" cy="280" r="132" fill="#c99d66" opacity=".09"/><circle cx="1272" cy="280" r="74" fill="#f3cc8c" opacity=".52"/>
''' + dark_city(2,1,glow='#ffc98a')+'''
<path d="M844 689 V224 M1540 689 V228 M1210 147 V687" stroke="#ad824f" stroke-width="13" opacity=".3"/>
<path d="M0 721 H1600 V900 H0Z" fill="url(#floor)"/>
<g fill="none" stroke="#ae8355" opacity=".65"><circle cx="1185" cy="517" r="122" stroke-width="13"/><circle cx="1185" cy="517" r="78" stroke-width="7"/><circle cx="1185" cy="517" r="24" stroke-width="5"/>
<path d="M1185 378 V656 M1046 517 H1324 M1086 419 L1284 615 M1284 419 L1086 615" stroke-width="4"/></g>
<rect x="895" y="674" width="504" height="28" rx="4" fill="#583521" stroke="#bc8952" stroke-opacity=".7" stroke-width="4"/>
<path d="M936 697 l-30 161 M1362 697 l24 161" stroke="#754528" stroke-width="17"/>
<path d="M938 635 l100 -32 74 34 0 36 -172 -4z" fill="#c29154" stroke="#6d492f" stroke-width="3"/>
<path d="M964 624 l76 -34 40 28 -64 24z" fill="#e5c790" opacity=".5"/>
<ellipse cx="1010" cy="652" rx="29" ry="18" fill="#523327" stroke="#d09b5f" stroke-width="3"/>
<rect x="1220" y="639" width="44" height="36" fill="#67452f"/><ellipse cx="1242" cy="636" rx="32" ry="11" fill="#e9a95c"/><circle cx="1242" cy="630" r="55" fill="url(#lamp)"/>
<path d="M1418 679 v-178" stroke="#7c5b40" stroke-width="10"/><path d="M1383 514 q34 -70 70 0" fill="none" stroke="#a87a4a" stroke-width="13"/>
'''
dungeon='''
<ellipse cx="1162" cy="364" rx="660" ry="525" fill="url(#halo)"/>
<path d="M588 900 L756 330 890 448 1005 130 1136 359 1321 155 1520 360 1600 900Z" fill="#151728"/>
<path d="M811 900 L902 320 1003 485 1093 197 1193 420 1335 216 1519 900Z" fill="#272139"/>
<path d="M870 788 Q888 195 1171 156 Q1479 195 1484 788" fill="#0b0a1b" stroke="#62567d" stroke-width="29"/>
<path d="M916 762 Q926 246 1171 205 Q1415 243 1441 762" fill="#16142a" stroke="#b09bf7" stroke-width="3" opacity=".6"/>
<ellipse cx="1169" cy="480" rx="236" ry="236" fill="url(#halo)"/>
<circle cx="1169" cy="476" r="187" fill="none" stroke="#baa6ff" stroke-opacity=".29" stroke-width="4"/>
<circle cx="1169" cy="476" r="154" fill="none" stroke="#d5b5ff" stroke-opacity=".38" stroke-width="2"/>
<path d="M1170 298 l23 75 -23 58 -23 -58z M1317 480 l-75 22 -60 -22 60 -22z M1170 653 l-23 -75 23 -59 23 59z M1012 480 l75 -22 60 22 -60 22z" fill="#b89dff" opacity=".76"/>
<path d="M0 736 H1600 V900 H0" fill="url(#floor)"/>
<path d="M685 897 L946 726 H1384 L1650 897" fill="#28243a" stroke="#71628a" stroke-width="4"/>
<path d="M836 900 l207 -164 M973 900 l130 -164 M1141 900 l-22 -164 M1392 900 l-194 -164" stroke="#8c70c4" stroke-opacity=".23" stroke-width="3"/>
<path d="M733 740 l40 -212 55 54 -32 162z M1462 767 l-27 -173 51 -73 62 248z" fill="#272239" stroke="#766490" stroke-width="3"/>
<path d="M1182 562 q-68 -43 -36 -108 l31 -37 37 37 q24 74 -32 108Z" fill="#281e45" stroke="#cbb2ff" stroke-opacity=".3" stroke-width="3"/>
'''
mech='''
<ellipse cx="1148" cy="337" rx="690" ry="510" fill="url(#halo)"/>
<path d="M747 0 H1583 V864" fill="none" stroke="#34414c" stroke-width="42" opacity=".8"/>
<path d="M814 0 V789 M969 0 V797 M1445 0 V776 M1570 0 V795" stroke="#314047" stroke-width="29" opacity=".6"/>
<path d="M760 690 L1555 690" stroke="#92aab0" stroke-width="20" opacity=".22"/>
<path d="M686 862 l109 -190 h733 l88 190" fill="url(#floor)" stroke="#b77f5b" stroke-opacity=".3" stroke-width="8"/>
<path d="M901 843 l81 -190 M1317 843 l-64 -190" stroke="#b8835e" stroke-opacity=".28" stroke-width="5"/>
<g fill="#26313a" stroke="#76909c" stroke-opacity=".45" stroke-width="5">
 <path d="M1000 554 l-41 -173 82 -76 78 98 -17 202 -56 42z"/><path d="M1253 558 l42 -177 -83 -75 -78 100 14 200 61 39z"/>
 <path d="M1036 439 l-36 -112 110 -50 71 35 46 -26 96 72 -40 142 -68 62 -123 -23z"/>
 <path d="M1105 278 l12 -82 72 -26 69 35 6 76 -47 51 -76 0z"/>
 <path d="M1062 608 l106 13 -13 178 -98 37 -54 -46z"/><path d="M1181 623 l105 -15 67 170 -54 49 -103 -24z"/>
 <path d="M1087 386 l157 1 -20 148 -113 1z"/>
</g>
<path d="M1138 233 l79 0 -6 35 -63 0z" fill="#a4eee5" opacity=".69"/>
<circle cx="1167" cy="445" r="56" fill="#65c6d3" opacity=".12"/><circle cx="1167" cy="445" r="36" fill="none" stroke="#91fcf4" stroke-width="12" opacity=".78"/><circle cx="1167" cy="445" r="20" fill="#bafff9" opacity=".75"/>
<path d="M1079 444 l-39 18 M1271 454 l-39 -18" stroke="#a9f4e5" stroke-opacity=".7" stroke-width="6"/>
<path d="M1123 271 l-43 84 M1238 270 l44 89" stroke="#ecaa76" stroke-width="8"/>
<g stroke="#f4b881" stroke-opacity=".58" stroke-width="4"><path d="M938 213 l-69 90 M1453 312 l-73 98 M906 496 l-76 48"/></g>
<path d="M0 760 H1600 V900 H0Z" fill="url(#floor)"/>
'''
worlds={
 'self':(self_scene,'#caa07a','#f3d0aa','#080f18','#183343',91),
 'future':(future,'#56cfd0','#b6fff5','#08121d','#193342',13),
 'past':(past,'#f5aa64','#ebc18f','#171018','#382c2b',23),
 'dungeon':(dungeon,'#a887ff','#cabdff','#0b0b1c','#232039',17),
 'mech':(mech,'#e9a27b','#81e9e5','#0b111b','#3b2831',29),
}
for name,params in worlds.items():
    text=svg(*params)
    (BASE/f'{name}.svg').write_text(text,encoding='utf-8')
    print(name,len(text))
