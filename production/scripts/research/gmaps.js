const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', viewport: {width: 1280, height: 1000}, locale: 'en-US' });
  const page = await ctx.newPage();
  for (const q of process.argv.slice(2)) {
    await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=en', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(12000);
    const txt = await page.evaluate(() => document.body.innerText);
    console.log('=== ', q, '\nURL:', page.url().slice(0, 300), '\n', txt.slice(0, 2500));
    await page.screenshot({ path: 'gm_' + q.replace(/\W+/g,'_') + '.png' });
  }
  await browser.close();
})();
