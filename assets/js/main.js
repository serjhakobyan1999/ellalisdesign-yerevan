(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header state ---------- */
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('[data-hero]');

  const updateHeader = () => {
    const threshold = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.92 : 40;
    header.classList.toggle('is-solid', window.scrollY > Math.max(threshold, 40));
  };

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  let menuOpen = false;

  const setMenu = (open) => {
    if (open === menuOpen) return;
    menuOpen = open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    if (open) {
      mobileMenu.hidden = false;
      requestAnimationFrame(() => root.classList.add('menu-open'));
    } else {
      root.classList.remove('menu-open');
      window.setTimeout(() => { if (!menuOpen) mobileMenu.hidden = true; }, 450);
    }
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => setMenu(!menuOpen));
    mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); menuToggle.focus(); }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotionQuery.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Count-up facts ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotionQuery.matches) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
          const t = clamp((now - start) / duration);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  /* ---------- Drag to scroll (mouse only; touch scrolls natively) ---------- */
  document.querySelectorAll('[data-drag-scroll]').forEach((track) => {
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        track.classList.add('is-dragging');
        track.setPointerCapture(e.pointerId);
      }
      if (moved) track.scrollLeft = startScroll - dx;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
    };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = track.querySelector('.detail').getBoundingClientRect().width + 16;
        track.scrollBy({ left: e.key === 'ArrowRight' ? step : -step, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------- Project galleries ---------- */
  const img = (name, alt, max = 1600) => ({
    src: `/assets/img/${name}-${max}.webp`,
    srcset: max > 1080 ? `/assets/img/${name}-1080.webp 1080w, /assets/img/${name}-${max}.webp ${max}w` : '',
    alt
  });
  const galleries = {
    'two-storey': {
      title: 'Two-Storey Restaurant',
      items: [
        img('ts-window-lounge', 'Lounge with a terracotta ribbon ceiling, red boucle armchairs and a tall arched window'),
        img('ts-arch-lounge', 'Terracotta arched wall with concentric ribs, woven pendant lamps and sculptural lounge chairs'),
        img('ts-lounge-wide', 'Lounge with slatted walls traced by warm light, a sculpted stone ceiling and terracotta arch'),
        img('ts-entrance', 'Entrance hall with a golden net ceiling and illuminated cracks in the walls'),
        img('ts-ribbon-ceiling', 'Terracotta ribbon ceiling installation above a sofa and red armchairs'),
        img('ts-water-table', 'Curved stone table with a water surface beside red boucle armchairs'),
        img('ts-column-window', 'Tall windows onto bare trees with a sculpted column and clay vessel'),
        img('ts-balcony-chairs', 'Cream lounge chairs and a blue glass table along a glazed balcony'),
        img('ts-washroom-mirror', 'Dark washroom with an organic backlit mirror and a sculpted red basin')
      ]
    },
    'first-floor': {
      title: 'From Kindergarten to Restaurant',
      items: [
        img('rf-dining-relief', 'Ivory dining room with sculpted relief walls, flowing tulle and brass chandeliers'),
        img('rf-bar', 'Round marble bar beneath a brass ring chandelier and a classical statue'),
        img('rf-tulle-lounge', 'Lounge of tall arched niches with sculpted figures and flowing tulle'),
        img('rf-relief-table', 'Dining table set before a sculpted plaster relief wall with white hydrangeas'),
        img('rf-stone-wall', 'Dark stone wall with a golden fissure of light and floating pendant lights', 1490),
        img('rf-fire-table', 'Fire table on a stone base beside ivory boucle lounge chairs'),
        img('rf-bar-counter', 'Bar counter in deep blue with brass stools and a backlit arched bottle display')
      ]
    },
    courtyard: {
      title: 'Restaurant Courtyard',
      items: [
        img('cy-canopy-dining', 'Courtyard dining under a light tulle canopy with stone walls and a wall waterfall'),
        img('cy-wide', 'Wide view of the 308 m² restaurant courtyard with lounge seating and woven pendants'),
        img('cy-seating', 'Rounded sofas, woven poufs and dining tables beneath the tulle canopy'),
        img('cy-water-stairs', 'Illuminated stone staircase with water flowing beneath glass'),
        img('cy-zen-garden', 'Raked-sand garden with a stream, sculpted stones and a bonsai before a round screen'),
        img('cy-waterfall-sofa', 'Curved ivory sofa beside a wall waterfall and a planter of red foliage')
      ]
    },
    'nor-nork': {
      title: 'Apartment in Nor Nork',
      items: [
        img('nn-kitchen-living', 'Open kitchen and living room with marble island, fluted cabinetry and oak floor', 1080),
        img('nn-kitchen', 'Kitchen with veined marble island, bronze-framed glass cabinets and a sculptural pendant', 1080),
        img('nn-entry', 'Entry with panelled wardrobe, walnut console and boucle stools', 1080),
        img('nn-hallway', 'Hallway with walnut wall panels, mirrored doors and soft cove lighting', 1080)
      ]
    }
  };

  const lightbox = document.querySelector('[data-lightbox]');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const lbImg = lightbox.querySelector('[data-lightbox-img]');
    const lbTitle = lightbox.querySelector('[data-lightbox-title]');
    const lbCaption = lightbox.querySelector('[data-lightbox-caption]');
    const lbCounter = lightbox.querySelector('[data-lightbox-counter]');
    let current = null;
    let index = 0;

    const show = (i) => {
      const items = current.items;
      index = (i + items.length) % items.length;
      const item = items[index];
      lbImg.srcset = item.srcset;
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbCaption.textContent = item.alt;
      lbCounter.textContent = `${index + 1} / ${items.length}`;
      const upcoming = items[(index + 1) % items.length];
      const next = new Image();
      next.sizes = lbImg.sizes;
      next.srcset = upcoming.srcset;
      next.src = upcoming.src;
    };

    document.querySelectorAll('[data-gallery]').forEach((btn) => {
      btn.addEventListener('click', () => {
        current = galleries[btn.dataset.gallery];
        if (!current) return;
        lbTitle.textContent = current.title;
        show(0);
        lightbox.showModal();
        root.style.overflow = 'hidden';
      });
    });

    lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
    lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('close', () => { root.style.overflow = ''; lbImg.removeAttribute('srcset'); lbImg.removeAttribute('src'); });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });

    let touchX = null;
    lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Hero: scroll-driven build sequence ---------- */
  const initHero = () => {
    if (!hero || reduceMotionQuery.matches) return;

    const stage = hero.querySelector('[data-hero-stage]');
    const canvas = hero.querySelector('[data-hero-canvas]');
    const ctx = canvas.getContext('2d', { alpha: false });
    const phases = Array.from(hero.querySelectorAll('[data-phase]'));
    const railSteps = Array.from(hero.querySelectorAll('.hero__rail [data-step]'));
    const railBar = hero.querySelector('[data-hero-bar]');
    const cue = hero.querySelector('[data-scroll-cue]');

    // Two frame sets cut from the same Higgsfield sequence: square and 9:16.
    const SETS = {
      d: { path: '/assets/hero/d/', count: 100, final: '/assets/hero/final-d.webp', fx: 0.52, fy: 0.5 },
      m: { path: '/assets/hero/m/', count: 100, final: '/assets/hero/final-m.webp', fx: 0.5, fy: 0.5 }
    };
    // Scroll timeline (0..1 across the pinned hero)
    const SEQ_START = 0.05;
    const SEQ_END = 0.87;
    const FINAL_IN = [0.85, 0.9];
    const RAIL = [0.09, 0.26, 0.47, 0.68];
    const FADE = 0.035;

    let set = null;
    let frames = [];
    let finalImg = null;
    let target = 0;
    let progress = 0;
    let rafId = 0;
    let lastTime = 0;
    let cw = 0;
    let ch = 0;
    let visible = true;

    const pad = (n) => String(n).padStart(3, '0');

    const loadImage = (src) => new Promise((resolve) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(() => resolve(im));
      };
      im.onerror = () => resolve(null);
      im.src = src;
    });

    // Frames load in stages so they never compete with the first paint: a coarse pass once
    // the page has loaded, then the full set on the first interaction (or after a short idle).
    const pageLoaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    let releaseFull;
    const fullRequested = new Promise((resolve) => { releaseFull = resolve; });
    ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((type) => {
      window.addEventListener(type, () => releaseFull(), { once: true, passive: true });
    });
    pageLoaded.then(() => window.setTimeout(() => releaseFull(), 3500));

    const currentIndex = () => Math.round(clamp((progress - SEQ_START) / (SEQ_END - SEQ_START)) * (set.count - 1));

    const loadSet = (s) => {
      frames = new Array(s.count).fill(null);
      finalImg = null;
      const token = s;
      const coarse = [];
      const seen = new Set();
      for (let i = 0; i < s.count; i += 11) { coarse.push(i); seen.add(i); }
      if (!seen.has(s.count - 1)) { coarse.push(s.count - 1); seen.add(s.count - 1); }
      const fine = [];
      [6, 3, 2, 1].forEach((step) => {
        for (let i = 0; i < s.count; i += step) {
          if (!seen.has(i)) { seen.add(i); fine.push(i); }
        }
      });

      const run = (order, workers) => {
        let cursor = 0;
        const worker = async () => {
          while (cursor < order.length && set === token) {
            const i = order[cursor++];
            const im = await loadImage(`${s.path}${pad(i)}.webp`);
            if (set !== token) return;
            frames[i] = im;
            if (i === 0) hero.classList.add('is-ready');
            // Redraw only when the new frame is the one on screen (or its neighbour)
            if (Math.abs(i - currentIndex()) <= 1) requestRender(true);
          }
        };
        return Promise.all(Array.from({ length: workers }, worker));
      };

      pageLoaded
        .then(() => run(coarse, 3))
        .then(() => loadImage(s.final))
        .then((im) => { if (set === token) { finalImg = im; requestRender(true); } })
        .then(() => fullRequested)
        .then(() => run(fine, 4));
    };

    const nearestFrame = (i) => {
      if (frames[i]) return frames[i];
      for (let d = 1; d < frames.length; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    const resize = () => {
      const r = stage.getBoundingClientRect();
      const media = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.round(media.width * dpr);
      ch = Math.round(media.height * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      // Portrait screens get the 9:16 set, everything else the square set
      const next = r.width / r.height < 1 ? SETS.m : SETS.d;
      if (next !== set) {
        set = next;
        loadSet(set);
      }
      requestRender(true);
    };

    const drawCover = (im, zoom, alpha) => {
      if (!im) return;
      const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight) * zoom;
      const dw = im.naturalWidth * s;
      const dh = im.naturalHeight * s;
      const dx = (cw - dw) * set.fx;
      const dy = (ch - dh) * set.fy;
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, dx, dy, dw, dh);
    };

    const render = () => {
      const p = progress;
      const seq = clamp((p - SEQ_START) / (SEQ_END - SEQ_START));
      const zoom = 1 + 0.075 * easeInOut(clamp(p / 0.95));

      // Frames: blend neighbours for smooth scrubbing between keyframes
      const f = seq * (set.count - 1);
      const i0 = Math.floor(f);
      const i1 = Math.min(i0 + 1, set.count - 1);
      const t = f - i0;
      const a = nearestFrame(i0);
      const b = frames[i1];
      if (a) {
        drawCover(a, zoom, 1);
        if (b && t > 0.01 && b !== a) drawCover(b, zoom, t);
      }
      // Land on the real, full-resolution photograph of the finished project
      const finalAlpha = clamp((p - FINAL_IN[0]) / (FINAL_IN[1] - FINAL_IN[0]));
      if (finalImg && finalAlpha > 0) drawCover(finalImg, zoom, finalAlpha);
      ctx.globalAlpha = 1;

      // Copy phases
      phases.forEach((el) => {
        const inAt = Number(el.dataset.in);
        const outAt = Number(el.dataset.out);
        let o;
        if (inAt === 0) o = clamp((outAt + FADE - p) / FADE);
        else o = Math.min(clamp((p - (inAt - FADE)) / FADE), clamp((outAt + FADE - p) / FADE));
        const entering = p < inAt;
        const shift = (1 - o) * 26 * (entering ? 1 : -1);
        el.style.opacity = o.toFixed(3);
        el.style.transform = o < 1 ? `translate3d(0, ${shift.toFixed(1)}px, 0)` : '';
        el.style.filter = o < 1 && o > 0 ? `blur(${((1 - o) * 6).toFixed(1)}px)` : '';
        el.classList.toggle('is-visible', o > 0.01);
      });

      // Progress rail
      let step = 0;
      RAIL.forEach((edge, k) => { if (p >= edge) step = k + 1; });
      railSteps.forEach((el, k) => el.classList.toggle('is-active', k === step));
      if (railBar) railBar.style.transform = `scaleY(${p.toFixed(4)})`;
      if (cue) cue.style.opacity = String(clamp(1 - p / 0.03));
    };

    const measure = () => {
      const rect = hero.getBoundingClientRect();
      const total = hero.offsetHeight - stage.offsetHeight;
      target = total > 0 ? clamp(-rect.top / total) : 0;
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const loop = (now) => {
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.7;
      lastTime = now;
      const k = 1 - Math.pow(1 - 0.16, dt / 16.7);
      progress += (target - progress) * k;
      if (Math.abs(target - progress) < 0.00015) progress = target;
      render();
      if (progress !== target) rafId = requestAnimationFrame(loop);
      else { rafId = 0; lastTime = 0; }
    };

    function requestRender(force) {
      if (!visible && !force) return;
      if (!rafId) rafId = requestAnimationFrame(loop);
    }

    const onScroll = () => {
      measure();
      requestRender();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); resize(); });

    measure();
    progress = target;
    resize();
  };

  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  reduceMotionQuery.addEventListener('change', () => window.location.reload());
  updateHeader();
  initHero();
})();
