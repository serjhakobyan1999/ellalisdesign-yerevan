const { chromium } = require('playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const stats = (t) => { t = t.slice(5).sort((a,b)=>a-b); return { n: t.length, p50: +t[Math.floor(t.length*0.5)].toFixed(1), p95: +t[Math.floor(t.length*0.95)].toFixed(1), over20: t.filter(x=>x>20).length }; };
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8080/'), { waitUntil: 'load' });
  await p.mouse.move(700, 400); await p.mouse.wheel(0, 10); await sleep(6000);
  const run = async (fromSel) => {
    if (fromSel) await p.evaluate((s) => document.querySelector(s).scrollIntoView(), fromSel); else await p.evaluate(() => scrollTo(0, 0));
    await sleep(800);
    await p.evaluate(() => { window.__t = []; window.__r = []; let last = performance.now(); const f = (t) => { window.__t.push(t - last); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
    for (let i = 0; i < 100; i++) { await p.mouse.wheel(0, 30); await sleep(16); }
    await sleep(800);
    return p.evaluate(() => window.__t);
  };
  console.log('baseline (sections, no hero):', JSON.stringify(stats(await run('#studio'))));
  console.log('hero:', JSON.stringify(stats(await run(null))));
  await b.close();
})();
