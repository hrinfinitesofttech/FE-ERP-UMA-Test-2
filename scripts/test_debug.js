const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err.message));

  await page.goto('http://localhost:3000/purchase/quotation-comparison', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const btns = await page.$$eval('button', els => els.map(e => e.innerText));
  console.log('BUTTONS FOUND:', btns);

  const autoBtn = page.locator('button:has-text("Auto-Generate 3 Vendor Bids")');
  console.log('Auto btn visible:', await autoBtn.isVisible());

  if (await autoBtn.isVisible()) {
    console.log('Clicking Auto-Generate button...');
    await autoBtn.click();
    await page.waitForTimeout(2000);

    const hasTable = await page.locator('text=Line Item Side-by-Side Rate Matrix').isVisible();
    console.log('Table visible after click:', hasTable);

    const textAfter = await page.innerText('body');
    console.log('PAGE TEXT SNIPPET:\n', textAfter.slice(0, 700));
  } else {
    console.log('Auto btn was not visible. Full page text:', await page.innerText('body'));
  }

  await browser.close();
})();
