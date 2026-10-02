const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', viewport: {width: 1200, height: 2400}, locale: 'en-US' });
  const page = await ctx.newPage();
  const responses = [];
  page.on('response', async r => {
    const u = r.url();
    if (/instagram\.com\/(graphql|api|ajax)/.test(u)) {
      try { const t = await r.text(); responses.push({u, status: r.status(), t}); } catch(e) {}
    }
  });
  await page.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  fs.writeFileSync(process.argv[3] + '.html', await page.content());
  await page.screenshot({ path: process.argv[3] + '.png', fullPage: false });
  fs.writeFileSync(process.argv[3] + '_resp.json', JSON.stringify(responses, null, 1));
  console.log('responses', responses.length, responses.map(r => r.status + ' ' + r.u.slice(0,120)).join('\n'));
  await browser.close();
})();
