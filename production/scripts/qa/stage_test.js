const { chromium, devices } = require('playwright');
const OUT = process.env.OUT_DIR || require('path').join(__dirname, '..', '..', 'qa', 'screenshots');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = []; const frames = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/assets/hero/')) frames.push([Date.now(), r.url().split('/assets/hero/')[1]]); });
  const t0 = Date.now();
  await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8080/'), { waitUntil: 'load' });
  await sleep(1200);
  console.log('hero requests before interaction:', frames.length, frames.map(f => f[1]).join(' '));
  // jump straight to the middle (fast scroll) and verify a frame is drawn
  const heroH = await page.evaluate(() => document.querySelector('[data-hero]').offsetHeight - innerHeight);
  await page.evaluate((y) => scrollTo(0, y), Math.round(heroH * 0.55));
  await sleep(250);
  await page.screenshot({ path: `${OUT}/stage_fast.png` });
  await sleep(4000);
  await page.screenshot({ path: `${OUT}/stage_settled.png` });
  console.log('hero requests after interaction:', frames.length);
  const blank = await page.evaluate(() => { const c = document.querySelector('[data-hero-canvas]'); const x = c.getContext('2d').getImageData(c.width/2, c.height/2, 1, 1).data; return Array.from(x); });
  console.log('canvas center pixel', blank, 'errors', errors.length ? errors : 'none');
  await browser.close();
})();
