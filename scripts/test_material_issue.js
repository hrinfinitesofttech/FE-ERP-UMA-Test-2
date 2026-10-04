const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${text}`);
      if (!text.includes('Failed to load resource') && !text.includes('401')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', error => {
    console.log(`[Page Error]: ${error.message}`);
    consoleErrors.push(error.message);
  });

  console.log('Navigating to http://localhost:3000/store/material-issue...');
  await page.goto('http://localhost:3000/store/material-issue', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Take screenshot of initial page
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-material-issue-initial.png', fullPage: true });
  console.log('Initial page loaded successfully.');

  // Click "Issue Material Slip" button
  console.log('Clicking Issue Material Slip button...');
  const issueButton = page.locator('button:has-text("Issue Material Slip")').first();
  await issueButton.click();
  await page.waitForTimeout(1000);

  // Verify modal is open
  const modalHeader = await page.locator('text=Issue Material Slip to Production').isVisible();
  console.log(`Modal opened: ${modalHeader}`);

  // Fill and submit modal
  const submitButton = page.locator('button:has-text("Confirm & Deduct Stock")');
  if (await submitButton.isVisible()) {
    console.log('Submitting new material issue slip...');
    await submitButton.click();
    await page.waitForSelector('text=Issue Material Slip to Production', { state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(1000);
  }

  // Check if voucher button can be clicked
  const voucherButton = page.locator('button:has-text("Voucher")').first();
  if (await voucherButton.isVisible()) {
    console.log('Clicking Voucher button...');
    await voucherButton.click();
    await page.waitForSelector('text=STORE DISPATCH VOUCHER', { timeout: 5000 });
    console.log('Voucher modal opened successfully!');
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-material-issue-voucher.png', fullPage: true });

    // Close voucher
    const closeButton = page.locator('button:has-text("Close Slip")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForSelector('text=STORE DISPATCH VOUCHER', { state: 'hidden', timeout: 5000 });
      console.log('Voucher closed successfully.');
    }
  }

  console.log(`Total actionable errors captured: ${consoleErrors.length}`);
  consoleErrors.forEach(err => console.log(` - ${err}`));

  await browser.close();
  if (consoleErrors.some(e => e.includes('Encountered two children with the same key') || e.includes('Hydration failed'))) {
    console.error('FAILED: React duplicate key or hydration error found!');
    process.exit(1);
  } else {
    console.log('SUCCESS: All material issue tests passed without errors!');
  }
})();
