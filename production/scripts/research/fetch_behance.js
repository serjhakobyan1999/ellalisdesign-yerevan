const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--ignore-certificate-errors-spki-list=PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0='], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: false, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', viewport: {width: 1400, height: 900} });
  const page = await ctx.newPage();
  const urls = process.argv.slice(2);
  for (const u of urls) {
    const id = u.match(/gallery\/(\d+)/)[1];
    await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    const html = await page.content();
    fs.writeFileSync(`p_${id}.html`, html);
    console.log(id, html.length);
  }
  await browser.close();
})();
