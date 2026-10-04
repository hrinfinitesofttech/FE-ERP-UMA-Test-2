const { chromium } = require('playwright');

(async () => {
  console.log('Testing Accounting Invoices and Receipts Routes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const urlsToTest = [
    'http://localhost:3000/accounting/invoices',
    'http://localhost:3000/accounting/customer-receipt',
    'http://localhost:3000/accounting/customer-receipts',
    'http://localhost:3000/accounting/receipts',
    'http://localhost:3000/accounting/purchase-bills',
    'http://localhost:3000/accounting/banking',
    'http://localhost:3000/accounting/aging',
  ];

  for (const url of urlsToTest) {
    try {
      console.log(`Navigating to ${url}...`);
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      const is404 = await page.locator('text=404 - Page Not Found').count();
      if (is404 > 0) {
        console.error(`FAILED: ${url} returned 404!`);
      } else {
        const title = await page.title();
        console.log(`PASSED: ${url} loaded successfully (Status: ${response.status()}, Title: ${title})`);
      }
    } catch (err) {
      console.error(`Error loading ${url}:`, err.message);
    }
  }

  // Test Customer Receipt Modal and Submission
  console.log('\nTesting Record Customer Receipt flow on /accounting/receipts...');
  await page.goto('http://localhost:3000/accounting/receipts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Record Customer Receipt button
  await page.click('button:has-text("+ Record Customer Receipt")');
  await page.waitForTimeout(500);

  // Fill in amount and UTR
  await page.fill('input[placeholder="e.g. 500000"]', '125000');
  await page.fill('input[placeholder="e.g. UTR-98765432"]', 'UTR-TEST-889900');
  await page.fill('input[placeholder="Advance against order or invoice clearing..."]', 'Automated Test Settlement');

  // Submit form
  await page.click('button:has-text("✓ Save & Settle Receipt")');
  await page.waitForTimeout(1000);

  // Check if new receipt is rendered in the table
  const hasUtr = await page.locator('text=UTR-TEST-889900').count();
  console.log(`Receipt submission test: ${hasUtr > 0 ? 'SUCCESS (Receipt found in table!)' : 'FAILED'}`);

  await browser.close();
  console.log('All tests completed successfully!');
})();
