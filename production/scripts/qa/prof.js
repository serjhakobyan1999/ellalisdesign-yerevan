const { chromium } = require('playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8080/'), { waitUntil: 'load' });
  await p.mouse.move(700, 400); await p.mouse.wheel(0, 10); await sleep(6000);
  await p.evaluate(() => { window.__t = []; let last = performance.now(); const f = (t) => { window.__t.push(t - last); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  for (let i = 0; i < 120; i++) { await p.mouse.wheel(0, 40); await sleep(16); } await sleep(300); for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, -60); await sleep(16); }
  await sleep(1000);
  const r = await p.evaluate(() => { const t = window.__t.slice(5); t.sort((a,b)=>a-b); return { n: t.length, p50: t[Math.floor(t.length*0.5)], p95: t[Math.floor(t.length*0.95)], max: t[t.length-1], over20: t.filter(x=>x>20).length }; });
  console.log(JSON.stringify(r));
  await b.close();
})();
