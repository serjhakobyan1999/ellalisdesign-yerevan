const { chromium } = require('playwright');
const OUT = process.env.OUT_DIR || require('path').join(__dirname, '..', '..', 'qa', 'screenshots');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const vps = { se: [375, 667, 2, true], ipad_p: [820, 1180, 2, true], ipad_l: [1180, 820, 2, true], laptop: [1280, 720, 1, false], fhd: [1920, 1080, 1, false] };
  for (const [name, [w, h, dpr, mobile]] of Object.entries(vps)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto((process.env.BASE_URL || 'https://ellalisdesign.netlify.app/'), { waitUntil: 'load' });
    await sleep(1500);
    await page.screenshot({ path: `${OUT}/bp_${name}_0.png` });
    const heroH = await page.evaluate(() => document.querySelector('[data-hero]').offsetHeight - document.querySelector('[data-hero-stage]').offsetHeight);
    await page.evaluate((y) => scrollTo(0, y), Math.round(heroH * 0.5)); await sleep(1500);
    await page.screenshot({ path: `${OUT}/bp_${name}_50.png` });
    await page.evaluate((y) => scrollTo(0, y), heroH); await sleep(2000);
    await page.screenshot({ path: `${OUT}/bp_${name}_100.png` });
    await page.evaluate(() => document.querySelector('#projects').scrollIntoView()); await sleep(1300);
    await page.screenshot({ path: `${OUT}/bp_${name}_proj.png` });
    const m = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth }));
    console.log(name, JSON.stringify(m), errors.length ? errors : 'no errors');
    await ctx.close();
  }
  await browser.close();
})();
