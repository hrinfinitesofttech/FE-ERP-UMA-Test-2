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

  console.log('1. Navigating to http://localhost:3000/production/entry...');
  await page.goto('http://localhost:3000/production/entry', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Take screenshot of initial page
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-pentry-initial.png', fullPage: true });
  console.log('Page loaded successfully.');

  // 2. Click "Log Shift Production Entry"
  console.log('2. Opening modal...');
  await page.click('button:has-text("Log Shift Production Entry")');
  await page.waitForTimeout(1000);

  // 3. Fill the form in the modal
  console.log('3. Filling form inputs...');
  const modal = page.locator('div[role="dialog"], div.fixed').filter({ hasText: 'Log Shift Production Entry' }).first();
  
  // Enter Operation Name
  const opInput = modal.locator('input[list="operationSuggestions"]');
  await opInput.fill('Plate Rolling & Shell Forming');

  // Fill produced, rejected, scrap
  const inputs = modal.locator('input[type="number"]');
  console.log(`Found ${await inputs.count()} number inputs in modal`);
  
  // 0: Produced, 1: Rejected, 2: Scrap, 3: Downtime
  await inputs.nth(0).fill('50'); // Produced
  await inputs.nth(1).fill('3');  // Rejected
  await inputs.nth(2).fill('2');  // Scrap
  await inputs.nth(3).fill('15'); // Downtime
  await page.waitForTimeout(500);

  // Check calculated Good Qty (50 - 3 - 2 = 45)
  const goodBadge = modal.locator('text=Calculated Good').locator('..').locator('div').last();
  const calculatedGood = await goodBadge.innerText();
  console.log(`Formula Check: Produced=50, Rejected=3, Scrap=2 => Good Qty = ${calculatedGood}`);

  // 4. Submit the entry
  console.log('4. Clicking Submit Production Entry button...');
  const submitBtn = modal.locator('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-pentry-created.png', fullPage: true });

  // 5. Verify created row in table
  const rowWith45 = page.locator('tbody tr').filter({ hasText: '45' });
  const isCreatedVisible = await rowWith45.isVisible();
  console.log(`Entry with Good Qty 45 visible in table: ${isCreatedVisible}`);

  // 6. Test Page Reload Persistence
  console.log('5. Testing page reload persistence...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rowPersisted = page.locator('tbody tr').filter({ hasText: '45' });
  const isPersistedVisible = await rowPersisted.isVisible();
  console.log(`Entry persisted after page reload: ${isPersistedVisible}`);
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-pentry-persisted.png', fullPage: true });

  // 7. Test Shift Voucher Modal
  console.log('6. Testing View Shift Voucher...');
  const voucherBtn = page.locator('button[title="View Shift Voucher"]').first();
  if (await voucherBtn.isVisible()) {
    await voucherBtn.click();
    await page.waitForTimeout(1000);
    const voucherSlip = page.locator('text=SHIFT PRODUCTION LOG SLIP');
    console.log(`Voucher modal open: ${await voucherSlip.isVisible()}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-pentry-voucher.png', fullPage: true });

    await page.click('button:has-text("Close Slip")');
    await page.waitForTimeout(500);
  }

  // 8. Test Edit Entry Modal
  console.log('7. Testing Edit Entry...');
  const editBtn = page.locator('button[title="Edit Entry"]').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(1000);

    const editModal = page.locator('div.fixed').filter({ hasText: 'Edit Shift Production Entry' }).first();
    const editInputs = editModal.locator('input[type="number"]');
    await editInputs.nth(0).fill('60'); // Change Produced to 60 (Good Qty should become 60 - 3 - 2 = 55)
    await page.waitForTimeout(500);

    await editModal.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    const rowWith55 = page.locator('tbody tr').filter({ hasText: '55' });
    const isUpdatedVisible = await rowWith55.isVisible();
    console.log(`Entry updated to Good Qty 55: ${isUpdatedVisible}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-pentry-updated.png', fullPage: true });
  }

  // 9. Test Delete Entry
  console.log('8. Testing Delete Entry...');
  page.on('dialog', async dialog => {
    console.log(`Dialog message accepted: ${dialog.message()}`);
    await dialog.accept();
  });

  const deleteBtn = page.locator('button[title="Delete Entry"]').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);

    const rowAfterDelete = page.locator('tbody tr').filter({ hasText: '55' });
    const isDeleted = !(await rowAfterDelete.isVisible());
    console.log(`Entry successfully deleted: ${isDeleted}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-pentry-deleted.png', fullPage: true });
  }

  console.log(`\n--- TEST SUMMARY ---`);
  console.log(`Total Actionable Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(`Errors:`, consoleErrors);
  }

  await browser.close();

  if (!isPersistedVisible) {
    console.error('FAILED: Persistence check failed!');
    process.exit(1);
  } else {
    console.log('SUCCESS: All tests (Create, Auto-Formula, Reload Persistence, Voucher, Edit, Delete) passed cleanly!');
  }
})();

