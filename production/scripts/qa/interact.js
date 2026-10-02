const { chromium, devices } = require('playwright');
const OUT = process.env.OUT_DIR || require('path').join(__dirname, '..', '..', 'qa', 'screenshots');
const BASE = process.argv[2] || (process.env.BASE_URL || 'http://127.0.0.1:8080/');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: BASE.startsWith('https') ? { server: process.env.HTTPS_PROXY } : undefined });
  const errors = [];
  // 1) Mobile menu
  let ctx = await browser.newContext({ ...devices['iPhone 13'] });
  let page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE, { waitUntil: 'load' });
  await sleep(1200);
  await page.click('[data-menu-toggle]');
  await sleep(900);
  await page.screenshot({ path: `${OUT}/m_menu.png` });
  console.log('menu expanded:', await page.getAttribute('[data-menu-toggle]', 'aria-expanded'));
  await page.click('.mobile-menu a[href="#projects"]');
  await sleep(1500);
  console.log('menu closed:', await page.getAttribute('[data-menu-toggle]', 'aria-expanded'), 'scrollY', await page.evaluate(() => Math.round(scrollY)), 'projectsTop', await page.evaluate(() => Math.round(document.querySelector('#projects').getBoundingClientRect().top)));
  // 2) Lightbox on mobile
  await page.click('[data-gallery="two-storey"]');
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/m_lightbox.png` });
  console.log('lightbox open:', await page.evaluate(() => document.querySelector('[data-lightbox]').open), await page.textContent('[data-lightbox-counter]'));
  await page.keyboard.press('ArrowRight'); await sleep(500);
  console.log('after ArrowRight:', await page.textContent('[data-lightbox-counter]'));
  await page.keyboard.press('Escape'); await sleep(500);
  console.log('lightbox closed:', !(await page.evaluate(() => document.querySelector('[data-lightbox]').open)), 'focus on:', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-gallery')));
  await ctx.close();

  // 3) Desktop lightbox + keyboard skip link
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  console.log('first tab focus:', await page.evaluate(() => document.activeElement.className + ' ' + document.activeElement.textContent.trim()));
  await page.evaluate(() => document.querySelector('#projects').scrollIntoView());
  await sleep(800);
  await page.click('[data-gallery="courtyard"]');
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/d_lightbox.png` });
  await page.keyboard.press('Escape');
  // hero -> next section handoff: scroll to exact end of hero and slightly beyond
  const end = await page.evaluate(() => { const h = document.querySelector('[data-hero]'); return h.offsetTop + h.offsetHeight - innerHeight; });
  for (const [k, dy] of [['end', 0], ['plus300', 300], ['plus700', 700]]) {
    await page.evaluate((y) => scrollTo(0, y), end + dy);
    await sleep(1400);
    await page.screenshot({ path: `${OUT}/d_handoff_${k}.png` });
  }
  await ctx.close();

  // 4) Reduced motion
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(BASE, { waitUntil: 'load' });
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/d_reduced.png` });
  console.log('reduced: hero height', await page.evaluate(() => document.querySelector('[data-hero]').offsetHeight));
  await ctx.close();
  ctx = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/m_reduced.png` });
  await ctx.close();
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
