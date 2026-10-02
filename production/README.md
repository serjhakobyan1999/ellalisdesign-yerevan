# Production files

Everything used to research, generate and test the Ellalis Design website. Nothing in this folder
is published — the live site is `../site/` only.

```
research/
  RESEARCH.md             verified business facts, sources, and what could not be found
  behance/images/         58 original Behance renders (1800 px) from the 3 restaurant projects
  behance/data/           Behance profile + project data (descriptions, tags, tools, image lists)
  instagram/videos/       the two latest Instagram reels (site supervision, full-service promo)
  instagram/images/       latest Instagram posts (Nor Nork apartment), profile picture
  instagram/video-stills/ frames used on the site (designer portrait, on-site supervision)
  instagram/data/         post data (captions) from the public Instagram embeds
  screens/                screenshots taken during research
hero/
  1-source/               the real finished project (Two-Storey Restaurant, Behance) and the
                          1800 px square crop used as the final hero frame
  2-keyframes/            s0–s3: construction stages generated from the real image (Higgsfield)
  3-segments/             seg0–seg3: 4 × 5 s transitions between keyframes (Higgsfield)
  4-masters/              master-24fps-joins-blended.mp4  → segments joined with 0.25 s blends
                          master-60fps-higgsfield-interpolated.mp4 → Higgsfield 60 fps version (source of the live hero)
  5-previews/             v1 (first sequence) and v3 (current sequence) previews
  analysis/               contact sheets, alignment overlays, crop studies
scripts/
  media/retime.py         builds the live hero frames (v3) from the 60 fps master
  media/build_frames.sh   legacy v1/v2 frame builder (kept for reference)
  media/process_images.py builds the responsive portfolio images in site/assets/img
  qa/                     Playwright tests (visual, interaction, breakpoints, scroll performance)
  research/               scripts used to read Behance / Instagram / Google Maps pages
qa/
  lighthouse/             final Lighthouse reports (mobile 97 / desktop 99 performance; 100 accessibility, best practices, SEO)
  screenshots/            desktop, tablet and mobile screenshots of the live site
```

## How the hero was made (Higgsfield)

Concept: the same room, same camera, progressively built — bare shell → architectural forms →
materials → lighting → furniture — ending on the real finished design.

**1. Final frame (real project).** `hero/1-source/twostorey_04-original.jpg` is the Behance render
"Two-Storey Restaurant Project" by Ellalis Design. Cropped to an 1800 × 1800 square (y offset 280)
so one sequence serves both desktop (square panel) and mobile (9:16 column).

**2. Keyframes** — model `nano_banana_pro`, 2K, 1:1, each generated directly from the real image
(never chained, to keep geometry locked):

| file | job id | stage |
|---|---|---|
| s0.png | 830fe710-db39-4848-b731-0e1716d765af | raw concrete shell — no finishes, fixtures, furniture |
| s1.png | 1bdd28da-df48-461e-8cc8-b361c6183302 | architectural forms in raw grey plaster (ribbed arch, rock ceiling, slats) |
| s2.png | 3b4ed70b-f1cc-42ce-8765-eb3d0038a783 | all finishes (terracotta, bronze slats, polished floor), no lights/furniture |
| s3.png | 5589d36a-5cf6-4a5f-bcb6-26e5b9658a25 | finishes + every light fixture lit, no furniture/décor |

Uploaded real image media id: `1c896ea1-db1d-4c92-bb4f-819b859d4d1e`.

**3. Segments** — model `minimax_h3`, 2K (1440 × 1440), 5 s, 24 fps, start + end frame,
locked-off static camera:

| file | job id | start → end |
|---|---|---|
| seg0.mp4 | 559d9362-d237-4e8e-9e6c-ba69ce1b7094 | s0 → s1 (forms are built) |
| seg1.mp4 | 13790f45-fa36-4b06-a47f-fa181d52c94b | s1 → s2 (materials) |
| seg2.mp4 | d5662cd4-2fc6-411f-80e8-3ddbf7eb71cc | s2 → s3 (lighting) |
| seg3.mp4 | 72e8b540-b8bb-4098-b5c3-df4e9d4d6565 | s3 → real final image (furniture, décor) |

Note: MiniMax H3 accepts about 2 concurrent jobs per account; a batch of 4 fails with a rate limit.

**4. Smoothing.** The raw segments have uneven motion (frozen frames followed by jumps) and small
pops at the joins. Fix:
- joins blended with 0.25 s crossfades → `4-masters/master-24fps-joins-blended.mp4`
- uploaded to Higgsfield (media id `3d95ed38-c87a-4805-8eb9-e5e49030ef7c`) and interpolated with
  `bytedance_video_upscale` (fps 60, preset `aigc`, model `pro`), job
  `0e1e2931-2b20-4f09-9d5b-bbab83142b3e` → `4-masters/master-60fps-higgsfield-interpolated.mp4`
  (1163 frames)
- `scripts/media/retime.py` picks frames so every scroll step shows an even amount of change
  (each of the 4 stages keeps an equal share of the scroll, so captions stay in sync), applies a
  light temporal denoise, and exports WebP:
  - desktop: 300 frames, 1000 × 1000 → `site/assets/hero/v3/d/`
  - mobile: 200 frames, 720 × 1280 (centre column on the arch) → `site/assets/hero/v3/m/`

Rebuild (writes into `site/assets/hero/v3/`; for a new version, change the folder in the script,
`site/index.html` and `site/assets/js/main.js`):

```bash
pip install -r scripts/requirements.txt          # numpy; ffmpeg must be installed
python3 scripts/media/retime.py hero/4-masters/master-60fps-higgsfield-interpolated.mp4 300 200
```

`final-d.webp` (1600²) and `final-m.webp` (900 × 1600) are made from `hero/1-source/final-real-twostorey_04-square.jpg`
(mobile: crop 1012 × 1800 at x = 430, then resize).

## Portfolio images

```bash
python3 scripts/media/process_images.py   # → site/assets/img (WebP 640/1080/1600 w)
```

The two people photos (`designer-portrait-720.webp`, `site-supervision-720.webp`) are crops of
`research/instagram/video-stills/designer_18.png` (crop 720×1040+0+170) and `site_30.png` (crop 720×900+0+350).

## QA

```bash
cd scripts && npm install && npx playwright install chromium
# serve ../../site first (python3 -m http.server 8080), then:
BASE_URL=http://127.0.0.1:8080/ npm run qa:visual
BASE_URL=http://127.0.0.1:8080/ npm run qa:interact
npm run qa:breakpoints        # runs against the live site
```
