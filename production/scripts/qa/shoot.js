// Visual test: screenshot hero at several scroll progress points + full sections, collect console errors.
const { chromium, devices } = require('playwright');
const OUT = process.env.OUT_DIR || require('path').join(__dirname, '..', '..', 'qa', 'screenshots');
const BASE = process.argv[2] || (process.env.BASE_URL || 'http://127.0.0.1:8080/');
const which = process.argv[3] || 'all';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: BASE.startsWith('https') ? { server: process.env.HTTPS_PROXY } : undefined });
  const configs = {
    desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    mobile: { ...devices['iPhone 13'] },
  };
  for (const [name, cfg] of Object.entries(configs)) {
    if (which !== 'all' && which !== name) continue;
    const ctx = await browser.newContext(cfg);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(`${m.type()}: ${m.text()}`); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', r => errors.push('requestfailed: ' + r.url() + ' ' + (r.failure() && r.failure().errorText)));
    page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
    await page.goto(BASE, { waitUntil: 'load', timeout: 90000 });
    await sleep(2500);
    const heroH = await page.evaluate(() => { const h = document.querySelector('[data-hero]'); return h.offsetHeight - document.querySelector('[data-hero-stage]').offsetHeight; });
    for (const p of [0, 0.15, 0.36, 0.56, 0.76, 0.95, 1.0]) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(heroH * p));
      await sleep(1600);
      await page.screenshot({ path: `${OUT}/${name}_hero_${String(Math.round(p * 100)).padStart(3, '0')}.png` });
    }
    // Sections
    const sections = ['#studio', '#services', '#projects', '#process', '.details', '#contact', '.final-cta', '.site-footer'];
    for (const sel of sections) {
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), sel);
      await sleep(1300);
      await page.screenshot({ path: `${OUT}/${name}_sec_${sel.replace(/[#.]/g, '')}.png` });
    }
    const metrics = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth, winW: window.innerWidth,
      overflow: Array.from(document.querySelectorAll('body *')).filter(el => { const r = el.getBoundingClientRect(); return r.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.details__track') && !el.closest('dialog'); }).slice(0, 10).map(el => el.tagName + '.' + el.className + ' ' + Math.round(el.getBoundingClientRect().right)),
    }));
    console.log(name, JSON.stringify(metrics));
    console.log(name, 'errors:', errors.length ? errors.join('\n') : 'none');
    await ctx.close();
  }
  await browser.close();
})();
