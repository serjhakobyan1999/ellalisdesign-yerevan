const { chromium } = require('playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch({ args: ['--no-sandbox', '--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: url.startsWith('https') ? { server: process.env.HTTPS_PROXY } : undefined });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url, { waitUntil: 'load' });
  await p.mouse.move(700, 400); await p.mouse.wheel(0, 10); await sleep(8000);
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach(e => window.__lt.push(e.duration))).observe({ type: 'longtask' }); });
  for (let i = 0; i < 150; i++) { await p.mouse.wheel(0, 35); await sleep(16); }
  for (let i = 0; i < 80; i++) { await p.mouse.wheel(0, -50); await sleep(16); }
  await sleep(1000);
  const lt = await p.evaluate(() => window.__lt);
  console.log(url, 'long tasks:', lt.length, 'total ms:', Math.round(lt.reduce((a, b) => a + b, 0)), 'max:', Math.round(Math.max(0, ...lt)));
  await b.close();
})();
