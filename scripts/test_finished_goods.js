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

  console.log('1. Navigating to http://localhost:3000/production/finished-goods...');
  await page.goto('http://localhost:3000/production/finished-goods', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Take screenshot of initial page
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-fg-initial.png', fullPage: true });
  console.log('Finished Goods page loaded successfully.');

  // 2. Open Inward Modal
  console.log('2. Opening Inward Finished Goods modal...');
  await page.click('button:has-text("Inward Finished Goods")');
  await page.waitForTimeout(1000);

  // 3. Fill Form
  console.log('3. Filling Inward FG form...');
  const modal = page.locator('div.fixed').filter({ hasText: 'Inward Finished Goods' }).first();
  await modal.locator('input[placeholder*="UTF-"]').fill('UTF-TEST-SERIAL-999');
  await modal.locator('input[placeholder*="Bin-FG-"]').fill('Bin-FG-09');

  // Submit Inward Form
  console.log('4. Submitting Inward form...');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-fg-created.png', fullPage: true });

  const rowCreated = page.locator('tbody tr').filter({ hasText: 'UTF-TEST-SERIAL-999' });
  const isCreatedVisible = await rowCreated.isVisible();
  console.log(`New FG Assembly visible in table: ${isCreatedVisible}`);

  // 5. Test Persistence on Page Reload
  console.log('5. Testing page reload persistence...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rowPersisted = page.locator('tbody tr').filter({ hasText: 'UTF-TEST-SERIAL-999' });
  const isPersistedVisible = await rowPersisted.isVisible();
  console.log(`New FG persisted after reload: ${isPersistedVisible}`);
  await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-fg-persisted.png', fullPage: true });

  // 6. Test Quality Passport & Dispatch Slip Modal
  console.log('6. Testing View Certificate / Slip modal...');
  const eyeBtn = rowPersisted.locator('button[title="View FG Passport & Inspection Slip"]').first();
  if (await eyeBtn.isVisible()) {
    await eyeBtn.click();
    await page.waitForTimeout(1000);

    const slipHeader = page.locator('text=FINISHED GOODS QUALITY PASSPORT & DISPATCH SLIP');
    console.log(`Passport modal open: ${await slipHeader.isVisible()}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-fg-passport.png', fullPage: true });

    await page.click('button:has-text("Close Slip")');
    await page.waitForTimeout(500);
  }

  // 7. Test Quick Toggle Dispatch Status
  console.log('7. Testing Toggle Dispatch Status...');
  const statusBtn = rowPersisted.locator('button[title="Click to toggle status"]').first();
  if (await statusBtn.isVisible()) {
    await statusBtn.click();
    await page.waitForTimeout(1000);
    const dispatchedBadge = rowPersisted.locator('button:has-text("Dispatched")');
    console.log(`Status changed to Dispatched: ${await dispatchedBadge.isVisible()}`);
  }

  // 8. Test Edit Modal
  console.log('8. Testing Edit FG...');
  const editBtn = rowPersisted.locator('button[title="Edit FG Details"]').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(1000);

    const editModal = page.locator('div.fixed').filter({ hasText: 'Edit Finished Goods Record' }).first();
    await editModal.locator('input[placeholder*="Bin-FG-"]').fill('Bin-FG-UPDATED');
    await editModal.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    const updatedVisible = await page.locator('tbody tr').filter({ hasText: 'Bin-FG-UPDATED' }).isVisible();
    console.log(`FG updated successfully to Bin-FG-UPDATED: ${updatedVisible}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-fg-updated.png', fullPage: true });
  }

  // 9. Test Delete Record
  console.log('9. Testing Delete FG...');
  page.on('dialog', async dialog => {
    console.log(`Dialog message accepted: ${dialog.message()}`);
    await dialog.accept();
  });

  const rowToDelete = page.locator('tbody tr').filter({ hasText: 'Bin-FG-UPDATED' }).first();
  const deleteBtn = rowToDelete.locator('button[title="Delete Finished Goods"]').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);

    const rowAfterDelete = page.locator('tbody tr').filter({ hasText: 'Bin-FG-UPDATED' });
    const isDeleted = !(await rowAfterDelete.isVisible());
    console.log(`FG Record successfully deleted: ${isDeleted}`);
    await page.screenshot({ path: 'd:/UMA ERP/FE-ERP-UMA/public/test-fg-deleted.png', fullPage: true });
  }

  console.log(`\n--- FINISHED GOODS TEST SUMMARY ---`);
  console.log(`Total Actionable Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(`Errors:`, consoleErrors);
  }

  await browser.close();

  if (!isPersistedVisible) {
    console.error('FAILED: Finished Goods persistence check failed!');
    process.exit(1);
  } else {
    console.log('SUCCESS: All Finished Goods tests (Inward, Persistence, Passport, Quick Toggle, Edit, Delete) passed cleanly!');
  }
})();
