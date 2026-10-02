const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', viewport: {width: 1280, height: 1600}, locale: 'en-US' });
  const page = await ctx.newPage();
  for (const u of process.argv.slice(2)) {
    try {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(7000);
      const txt = await page.evaluate(() => document.body.innerText);
      console.log('=== ', u, '\n', txt.slice(0, 3000));
    } catch(e) { console.log(u, 'ERR', e.message.slice(0,100)); }
  }
  await browser.close();
})();
