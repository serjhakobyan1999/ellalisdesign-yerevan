import subprocess, json, os
import os
HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(HERE, '..', '..', 'research')
OUT = os.path.join(HERE, '..', '..', '..', 'site', 'assets', 'img')
sel = {
 # two-storey restaurant
 'ts-window-lounge': f'{R}/behance/images/twostorey_08.jpg',
 'ts-arch-lounge': f'{R}/behance/images/twostorey_04.jpg',
 'ts-lounge-wide': f'{R}/behance/images/twostorey_05.jpg',
 'ts-entrance': f'{R}/behance/images/twostorey_00.jpg',
 'ts-ribbon-ceiling': f'{R}/behance/images/twostorey_09.jpg',
 'ts-water-table': f'{R}/behance/images/twostorey_11.jpg',
 'ts-column-window': f'{R}/behance/images/twostorey_14.jpg',
 'ts-balcony-chairs': f'{R}/behance/images/twostorey_15.jpg',
 'ts-washroom-mirror': f'{R}/behance/images/twostorey_19.jpg',
 'ts-stone-basins': f'{R}/behance/images/twostorey_22.jpg',
 # first floor restaurant
 'rf-dining-relief': f'{R}/behance/images/restaurant_08.jpg',
 'rf-bar': f'{R}/behance/images/restaurant_00.jpg',
 'rf-tulle-lounge': f'{R}/behance/images/restaurant_04.jpg',
 'rf-relief-table': f'{R}/behance/images/restaurant_07.jpg',
 'rf-stone-wall': f'{R}/behance/images/restaurant_10.jpg',
 'rf-fire-table': f'{R}/behance/images/restaurant_15.jpg',
 'rf-bar-counter': f'{R}/behance/images/restaurant_03.jpg',
 # courtyard
 'cy-wide': f'{R}/behance/images/courtyard_10.jpg',
 'cy-canopy-dining': f'{R}/behance/images/courtyard_03.jpg',
 'cy-seating': f'{R}/behance/images/courtyard_06.jpg',
 'cy-water-stairs': f'{R}/behance/images/courtyard_08.jpg',
 'cy-zen-garden': f'{R}/behance/images/courtyard_00.jpg',
 'cy-waterfall-sofa': f'{R}/behance/images/courtyard_07.jpg',
 # residential nor nork
 'nn-kitchen-living': f'{R}/instagram/images/grid_03.jpg',
 'nn-kitchen': f'{R}/instagram/images/grid_02.jpg',
 'nn-entry': f'{R}/instagram/images/grid_04.jpg',
 'nn-hallway': f'{R}/instagram/images/grid_06.jpg',
}
meta={}
for name,src in sel.items():
    w,h=map(int,subprocess.check_output(['identify','-format','%w %h',src]).decode().split())
    widths=[x for x in (640,1080,1600) if x<w] + ([w] if w<=1600 else [])
    widths=sorted(set(min(x,1600) for x in widths))
    outs=[]
    for tw in widths:
        fn=f'{OUT}/{name}-{tw}.webp'
        subprocess.run(['convert',src,'-strip','-resize',f'{tw}x','-quality','74','-define','webp:method=6',fn],check=True)
        outs.append(tw)
    th=round(h*widths[-1]/w)
    meta[name]={'w':w,'h':h,'widths':outs,'ratio':round(w/h,4)}
json.dump(meta, open(os.path.join(HERE, 'img_meta.json'), 'w'), indent=1)
print(json.dumps(meta))
