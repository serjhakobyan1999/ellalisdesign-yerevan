"""Pick frames from the 60 fps master so each step shows equal visual change, then export
desktop (square) and mobile (9:16) WebP sequences. Prints where stage boundaries land."""
import subprocess, sys, os, json
import numpy as np

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'site', 'assets', 'hero', 'v3')
N_D, N_M = int(sys.argv[2]), int(sys.argv[3])
SEG_BOUNDS_S = [4.917, 9.583, 14.25]   # segment joins in the master timeline (s)

def probe(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                   'stream=width,height,r_frame_rate', '-of', 'json', path])
    s = json.loads(out)['streams'][0]
    num, den = map(int, s['r_frame_rate'].split('/'))
    return s['width'], s['height'], num / den

W, H, FPS = probe(SRC)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-vf', 'scale=192:192,format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
g = np.frombuffer(raw, np.uint8).reshape(-1, 192, 192).astype(np.float32)
n = len(g)
d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
d = np.convolve(d, np.ones(3) / 3, mode='same')              # tame single-frame spikes
w = d + 0.12 * np.median(d)                                    # holds still advance, just slowly
c = np.concatenate([[0], np.cumsum(w)]); c /= c[-1]

# Equal scroll share per stage; inside each stage, equal visual change per step
edges = [0] + [round(t * FPS) for t in SEG_BOUNDS_S] + [n - 1]
def pick(N):
    per = (N - 1) / (len(edges) - 1)
    out = []
    for k in range(len(edges) - 1):
        a, b = edges[k], edges[k + 1]
        lo, hi = c[a], c[b]
        m = round(per * (k + 1)) - round(per * k)
        targets = lo + (hi - lo) * np.arange(m) / m
        out.extend(np.searchsorted(c, targets).tolist())
    out.append(n - 1)
    idx = np.clip(np.array(out), 0, n - 1)
    return np.maximum.accumulate(idx)

print(f'source {W}x{H} @ {FPS:.2f} fps, {n} frames')
info = {}
for name, N in (('d', N_D), ('m', N_M)):
    idx = pick(N)
    os.makedirs(f'{OUT}/{name}', exist_ok=True)
    uniq = sorted(set(idx.tolist()))
    for f in os.listdir(f'{OUT}/{name}'):
        if f.endswith('.webp') and int(f[:3]) >= len(uniq):
            os.remove(f'{OUT}/{name}/{f}')
    sel = '+'.join(f'eq(n\\,{i})' for i in uniq)
    if name == 'd':
        vf = f"hqdn3d=1.5:1.5:6:6,select='{sel}',scale=1000:1000:flags=lanczos"
        q = '30'
    else:
        cw = round(W * 810 / 1440); cx = round(W * 344 / 1440)
        vf = f"hqdn3d=1.5:1.5:6:6,select='{sel}',crop={cw}:{H}:{cx}:0,scale=720:1280:flags=lanczos"
        q = '28'
    listfile = os.path.join(OUT, f'.select_{name}.txt')
    open(listfile, 'w').write(vf)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-filter_script:v', listfile, '-fps_mode', 'vfr',
                    '-c:v', 'libwebp', '-quality', q, '-compression_level', '6', '-preset', 'photo',
                    '-start_number', '0', f'{OUT}/{name}/%03d.webp'], check=True)
    count = len([f for f in os.listdir(f'{OUT}/{name}') if f.endswith('.webp')])
    # stage boundaries as fraction of the sequence (for syncing captions)
    u = np.array(uniq)
    bounds = [float(np.searchsorted(u, round(t * FPS)) / (len(u) - 1)) for t in SEG_BOUNDS_S]
    size = sum(os.path.getsize(f'{OUT}/{name}/{f}') for f in os.listdir(f'{OUT}/{name}')) / 1e6
    info[name] = dict(count=count, unique=len(set(idx.tolist())), mb=round(size, 2), bounds=[round(b, 3) for b in bounds])
    # step uniformity check on the chosen frames
    steps = np.diff(c[u]); info[name]['step_cv'] = round(float(steps.std() / steps.mean()), 3)
print(json.dumps(info, indent=1))
