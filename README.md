# Ellalis Design — website

Website for **Ellalis Design**, an interior & exterior design studio in Yerevan, Armenia.
A static site (HTML, CSS, vanilla JavaScript — no build step, no dependencies) with a scroll-driven
hero that builds a real Ellalis Design project from bare concrete to the finished interior.

Live: https://ellalisdesign.netlify.app

## Repository layout

```
site/                 ← the website. This is the ONLY folder that gets published.
  index.html
  404.html
  favicon.svg, robots.txt, sitemap.xml
  assets/
    css/main.css
    js/main.js
    fonts/            self-hosted Instrument Serif + Jost (latin)
    img/              portfolio images (responsive WebP, 640/1080/1600 w)
    hero/v3/          hero frame sequence: d/ (300 square frames), m/ (200 portrait frames),
                      final-d.webp / final-m.webp (the real finished project, full resolution)
    og-image.jpg, apple-touch-icon.png
netlify.toml          Netlify config: publish "site", caching + security headers
.github/workflows/    optional GitHub Pages deployment of site/
production/           everything used to make the site (NOT published) — see production/README.md
  research/           verified business facts + sources, original Behance & Instagram media
  hero/               Higgsfield keyframes, generated segments, 24/60 fps masters, previews
  scripts/            media pipeline (frame retiming, image processing), QA and research scripts
  qa/                 Lighthouse reports and test screenshots
```

## Deploying with Netlify from GitHub

`netlify.toml` already contains everything Netlify needs:

```toml
[build]
  publish = "site"
```

1. Netlify → *Add new project* (or open the existing **ellalisdesign** project) → *Import from Git* / *Link repository*.
2. Choose this repository and the branch you want to deploy.
3. Leave **Build command** empty. Netlify reads `publish = "site"` from `netlify.toml`
   (if the UI shows a publish directory field, it should be `site`).
4. Deploy. Every push to that branch redeploys automatically.

The site uses only relative paths, so it works the same at a domain root (Netlify, custom domain)
and under a sub-path (GitHub Pages project sites).

## Optional: GitHub Pages

`.github/workflows/pages.yml` publishes `site/` to GitHub Pages.
Enable it once: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**,
then run the workflow from the *Actions* tab (it is manual-only so it never fails while Pages is off).

## Running locally

```bash
cd site
python3 -m http.server 8080
# open http://localhost:8080
```

Any static server works. Opening `index.html` directly from disk (`file://`) is not recommended:
the hero loads its frames with `fetch()`, which browsers block for local files.

## Editing notes

- **Content** lives in `site/index.html`. Project galleries (lightbox) are defined in `site/assets/js/main.js` (`galleries`).
- **Canonical / social URLs** in `site/index.html`, `site/robots.txt` and `site/sitemap.xml` point to
  `https://ellalisdesign.netlify.app/`. If you move to a custom domain, update those URLs.
- **Rebuilding the hero frames**: see `production/README.md`. Always write a new version folder
  (e.g. `assets/hero/v4/`) and update the paths in `index.html` and `main.js`. The frames are cached
  as immutable, so reusing a folder name can make browsers mix old and new frames.
- **Armenian version**: the current fonts are latin-only; an Armenian-capable font will be needed.
