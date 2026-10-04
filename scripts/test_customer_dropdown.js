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

  console.log('Navigating to http://localhost:3000/maintenance/work-orders...');
  await page.goto('http://localhost:3000/maintenance/work-orders', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click "Create Service Work Order" button
  console.log('Opening Create Service Work Order modal...');
  const createBtn = page.locator('button:has-text("Create Service Work Order")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Inspect Customer dropdown options specifically
  const customerSelect = page.locator('div:has-text("Customer Name *") select').first();
  const options = await customerSelect.locator('option').allInnerTexts();
  console.log('Customer Dropdown Options:', options);

  // Take screenshot with modal open
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-swo-customer-dropdown.png', fullPage: true });

  // Select a customer
  if (options.length > 1) {
    await customerSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);
  }

  // Submit form
  console.log('Submitting Service Work Order form...');
  const submitBtn = page.locator('button:has-text("Generate Work Order")');
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // Take screenshot of list
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-swo-after-customer-select.png', fullPage: true });

  console.log(`Total actionable console errors: ${consoleErrors.length}`);
  await browser.close();

  if (options.length <= 1 || options[1].trim() === '') {
    console.error('FAILED: Customer dropdown was empty or blank!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Customer dropdown properly populated and functional!');
  }
})();
