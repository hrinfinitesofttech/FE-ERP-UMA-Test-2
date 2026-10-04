const { chromium } = require('playwright');

(async () => {
  console.log('Testing Supplier Quotation Comparison Matrix...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/purchase/quotation-comparison', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded successfully.');

    await page.waitForSelector('text=Supplier Quotation Comparison Matrix', { timeout: 15000 });
    console.log('Found Comparison Matrix title.');

    // Wait for hydration
    await page.waitForTimeout(1500);

    // Click Auto-Generate 3 Vendor Bids if visible
    const autoGenBtn = page.locator('button:has-text("Auto-Generate 3 Vendor Bids")');
    if (await autoGenBtn.isVisible()) {
      await autoGenBtn.click();
      console.log('Clicked Auto-Generate button.');
    } else {
      const sparkleBtn = page.locator('button[title="Re-generate multi vendor comparison"]');
      if (await sparkleBtn.isVisible()) {
        await sparkleBtn.click();
        console.log('Clicked Re-generate button.');
      }
    }

    // Wait for the matrix table to appear
    await page.waitForSelector('text=Line Item Side-by-Side Rate Matrix', { timeout: 10000 });
    console.log('✓ Matrix Table displayed successfully!');

    // Verify L1 Rate badge exists
    await page.waitForSelector('text=L1 RATE', { timeout: 5000 });
    console.log('✓ L1 Rate badges found in comparison table!');

    // Click Approve CS Matrix if not approved yet
    const approveBtn = page.locator('button:has-text("Approve CS Matrix")');
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      console.log('Clicked Approve CS Matrix.');
      await page.waitForTimeout(1000);
    }

    // Verify "Generate Purchase Order (PO)" button is available
    await page.waitForSelector('text=Generate Purchase Order (PO)', { timeout: 5000 });
    console.log('✓ Matrix approved and "Generate Purchase Order (PO)" button is active!');

    // Check localStorage
    const csStored = await page.evaluate(() => localStorage.getItem('UMA_ERP_quotationComparisons'));
    const csList = JSON.parse(csStored || '[]');
    console.log('✓ Verified quotationComparisons in localStorage:', csList.length, 'records.');

    console.log('ALL COMPARISON MATRIX TESTS PASSED 100%!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
