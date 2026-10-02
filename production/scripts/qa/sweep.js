const { chromium } = require('playwright');
const OUT = process.env.OUT_DIR || require('path').join(__dirname, '..', '..', 'qa', 'screenshots');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox', '--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const hero = new Set(); const errs = [];
  p.on('request', r => { const u = r.url(); if (u.includes('/assets/hero/')) hero.add(u.split('/assets/hero/')[1].split('/')[0]); });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto((process.env.BASE_URL || 'https://ellalisdesign.netlify.app/'), { waitUntil: 'load' });
  await p.mouse.move(900, 400); await p.mouse.wheel(0, 5); await sleep(9000);
  const H = await p.evaluate(() => document.querySelector('[data-hero]').offsetHeight);
  const files = [];
  for (let k = 0; k <= 11; k++) {
    await p.evaluate((y) => scrollTo(0, y), Math.round(H * k / 11 * 0.98));
    await sleep(1500);
    const f = `${OUT}/sweep_${String(k).padStart(2, '0')}.png`; files.push(f);
    await p.screenshot({ path: f, clip: { x: 540, y: 0, width: 900, height: 900 } });
  }
  console.log('hero folders requested:', [...hero], 'errors:', errs.length ? errs : 'none');
  await b.close();
})();
