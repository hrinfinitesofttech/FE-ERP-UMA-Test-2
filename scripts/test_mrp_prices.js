const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/purchase/mrp...');
  try {
    await page.goto('http://localhost:3000/purchase/mrp', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('Falling back to domcontentloaded...');
    await page.goto('http://localhost:3000/purchase/mrp', { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: 'mrp_verified_screen.png', fullPage: true });
  console.log('Saved mrp_verified_screen.png');

  // Check headers and rows
  const headers = await page.$$eval('table thead th', ths => ths.map(t => t.textContent.trim()));
  console.log('Table Headers:', headers);

  const rows = await page.$$eval('table tbody tr', trs => trs.map(r => {
    const tds = Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim().replace(/\s+/g, ' '));
    return tds;
  }));

  console.log(`Found ${rows.length} rows in MRP Table:`);
  rows.slice(0, 5).forEach((r, idx) => {
    console.log(`Row ${idx + 1}:`, r);
  });

  await browser.close();
  console.log('Test completed successfully.');
})();
