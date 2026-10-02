const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', viewport: {width: 1280, height: 1600}, locale: 'en-US' });
  const pairs = process.argv.slice(2);
  for (let i = 0; i < pairs.length; i += 2) {
    const page = await ctx.newPage();
    try {
      const r = await page.goto(pairs[i], { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(6000);
      fs.writeFileSync(pairs[i+1] + '.html', await page.content());
      await page.screenshot({ path: pairs[i+1] + '.png' });
      console.log(pairs[i], r && r.status(), (await page.title()).slice(0,100));
    } catch (e) { console.log(pairs[i], 'ERR', e.message.slice(0,150)); }
    await page.close();
  }
  await browser.close();
})();
