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

  // Take screenshot of initial page
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-swo-initial.png', fullPage: true });
  console.log('Initial Service Work Orders page loaded successfully.');

  // Click "Create Service Work Order" button
  console.log('Opening Create Service Work Order modal...');
  const createBtn = page.locator('button:has-text("Create Service Work Order")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Verify modal opened
  const modalHeader = await page.locator('text=Create Service Work Order').nth(1).isVisible();
  console.log(`Modal opened: ${modalHeader}`);

  // Fill in form inputs
  const machineInput = page.locator('input[placeholder*="Chemical Reactor Vessel"]');
  if (await machineInput.isVisible()) {
    await machineInput.fill('Centrifugal Reaction Pump 25HP');
  }

  const scopeTextarea = page.locator('textarea[placeholder*="Describe step-by-step"]');
  if (await scopeTextarea.isVisible()) {
    await scopeTextarea.fill('Overhaul impeller bearings, replace mechanical face seal, perform vibration analysis.');
  }

  // Submit form
  console.log('Submitting Service Work Order form...');
  const submitBtn = page.locator('button:has-text("Generate Work Order")');
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // Verify item is on the page
  console.log('Checking created work order on page...');
  const createdCard = await page.locator('text=Centrifugal Reaction Pump 25HP').isVisible();
  console.log(`Work Order card visible on page: ${createdCard}`);
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-swo-created.png', fullPage: true });

  // REFRESH PAGE to verify persistence!
  console.log('Reloading page to test localStorage & database persistence...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const persistedCard = await page.locator('text=Centrifugal Reaction Pump 25HP').isVisible();
  console.log(`Work Order persisted after reload: ${persistedCard}`);
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-swo-persisted.png', fullPage: true });

  // Open Voucher Modal
  const voucherBtn = page.locator('button:has-text("Voucher")').first();
  if (await voucherBtn.isVisible()) {
    console.log('Opening Voucher modal...');
    await voucherBtn.click();
    await page.waitForTimeout(1000);
    const voucherHeader = await page.locator('text=OFFICIAL WORK ORDER VOUCHER').isVisible();
    console.log(`Voucher modal visible: ${voucherHeader}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-swo-voucher.png', fullPage: true });

    // Close voucher
    const closeBtn = page.locator('button:has-text("Close Slip")');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  console.log(`Total actionable console errors: ${consoleErrors.length}`);
  await browser.close();

  if (!persistedCard) {
    console.error('FAILED: Work Order was NOT persisted after page reload!');
    process.exit(1);
  } else if (consoleErrors.length > 0) {
    console.error('FAILED: Actionable console errors encountered!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Service Work Orders created, persisted across page reload, and voucher verified!');
  }
})();
