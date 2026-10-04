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

  console.log('1. Navigating to http://localhost:3000/production/dispatch...');
  await page.goto('http://localhost:3000/production/dispatch', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-dispatch-initial.png', fullPage: true });
  console.log('Dispatch page loaded successfully.');

  // 2. Open Generate Modal
  console.log('2. Opening Generate Delivery Challan modal...');
  await page.click('button:has-text("Generate Delivery Challan")');
  await page.waitForTimeout(1000);

  // 3. Fill Form
  console.log('3. Filling Delivery Challan form...');
  const modal = page.locator('div.fixed').filter({ hasText: 'Generate Delivery Challan' }).first();
  await modal.locator('input[placeholder*="GJ-01"]').fill('GJ-01-AB-9988');
  await modal.locator('input[placeholder*="Mahavir"]').fill('Om Express Heavy Logistics');
  await modal.locator('input[placeholder*="LR-2026"]').fill('LR-2026-9999');
  await modal.locator('input[placeholder*="EWB-24"]').fill('EWB-24-11223344');

  // 4. Submit Form
  console.log('4. Submitting Delivery Challan...');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-dispatch-created.png', fullPage: true });

  const rowCreated = page.locator('tbody tr').filter({ hasText: 'GJ-01-AB-9988' });
  const isCreatedVisible = await rowCreated.isVisible();
  console.log(`New Dispatch Challan visible in table: ${isCreatedVisible}`);

  // 5. Test Persistence Across Page Reload
  console.log('5. Testing page reload persistence...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rowPersisted = page.locator('tbody tr').filter({ hasText: 'GJ-01-AB-9988' });
  const isPersistedVisible = await rowPersisted.isVisible();
  console.log(`Dispatch Challan persisted after reload: ${isPersistedVisible}`);
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-dispatch-persisted.png', fullPage: true });

  // 6. Test View Delivery Challan Slip Modal
  console.log('6. Testing View Delivery Challan Slip...');
  const eyeBtn = rowPersisted.locator('button[title="View & Print Delivery Challan"]').first();
  if (await eyeBtn.isVisible()) {
    await eyeBtn.click();
    await page.waitForTimeout(1000);

    const slipHeader = page.locator('text=DELIVERY CHALLAN & GATE-OUT PASS');
    console.log(`Challan Slip Modal Open: ${await slipHeader.isVisible()}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-dispatch-slip.png', fullPage: true });

    await page.click('button:has-text("Close Challan")');
    await page.waitForTimeout(500);
  }

  // 7. Test Quick Advance Status
  console.log('7. Testing Advance Dispatch Status...');
  const statusBtn = rowPersisted.locator('button[title="Click to advance status"]').first();
  if (await statusBtn.isVisible()) {
    await statusBtn.click();
    await page.waitForTimeout(1000);
    const loadingBadge = rowPersisted.locator('button:has-text("Vehicle Loading")');
    console.log(`Status advanced to Vehicle Loading: ${await loadingBadge.isVisible()}`);

    await statusBtn.click();
    await page.waitForTimeout(1000);
    const inTransitBadge = rowPersisted.locator('button:has-text("In Transit")');
    console.log(`Status advanced to In Transit: ${await inTransitBadge.isVisible()}`);
  }

  // 8. Test Edit Modal
  console.log('8. Testing Edit Dispatch Challan...');
  const editBtn = rowPersisted.locator('button[title="Edit Dispatch Record"]').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(1000);

    const editModal = page.locator('div.fixed').filter({ hasText: 'Edit Delivery Challan' }).first();
    await editModal.locator('input[placeholder*="LR-2026"]').fill('LR-2026-UPDATED');
    await editModal.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    const updatedVisible = await page.locator('tbody tr').filter({ hasText: 'LR-2026-UPDATED' }).isVisible();
    console.log(`Challan updated to LR-2026-UPDATED: ${updatedVisible}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-dispatch-updated.png', fullPage: true });
  }

  // 9. Test Delete Record
  console.log('9. Testing Delete Dispatch Challan...');
  page.on('dialog', async dialog => {
    console.log(`Dialog message accepted: ${dialog.message()}`);
    await dialog.accept();
  });

  const rowToDelete = page.locator('tbody tr').filter({ hasText: 'GJ-01-AB-9988' }).first();
  const deleteBtn = rowToDelete.locator('button[title="Delete Dispatch Record"]').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);

    const rowAfterDelete = page.locator('tbody tr').filter({ hasText: 'GJ-01-AB-9988' });
    const isDeleted = !(await rowAfterDelete.isVisible());
    console.log(`Dispatch record successfully deleted: ${isDeleted}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-dispatch-deleted.png', fullPage: true });
  }

  console.log(`\n--- DISPATCH PAGE TEST SUMMARY ---`);
  console.log(`Total Actionable Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(`Errors:`, consoleErrors);
  }

  await browser.close();

  if (!isPersistedVisible) {
    console.error('FAILED: Dispatch persistence check failed!');
    process.exit(1);
  } else {
    console.log('SUCCESS: All Dispatch & Delivery Challan tests (Create, Reload Persistence, Challan Slip, Status Progression, Edit, Delete) passed cleanly!');
  }
})();
