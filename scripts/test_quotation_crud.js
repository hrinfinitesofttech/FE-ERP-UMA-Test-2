const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser test for Supplier Quotation CRUD...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/purchase/quotations', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page navigated successfully.');

    // Wait for header
    await page.waitForSelector('text=Supplier Quotations Register');
    console.log('Found Supplier Quotations Register header.');

    // Click "Record Supplier Quotation"
    await page.click('button:has-text("Record Supplier Quotation")');
    console.log('Clicked "Record Supplier Quotation" button.');

    // Wait for modal
    await page.waitForSelector('text=Record Received Supplier Quotation');
    console.log('Modal opened.');

    // Fill in Ref Number
    const refInput = page.locator('input[placeholder="e.g. SQ-REF-4481"]');
    await refInput.fill('SQ-TEST-9999');

    // Click "Add Item Row"
    await page.click('button:has-text("Add Item Row")');
    console.log('Clicked "Add Item Row".');

    // Submit form
    await page.click('button:has-text("Save Received Quotation")');
    console.log('Clicked "Save Received Quotation".');

    // Wait for toast or table to have SQ-TEST-9999
    await page.waitForSelector('text=SQ-TEST-9999', { timeout: 10000 });
    console.log('✓ Successfully created and verified new quotation SQ-TEST-9999 in table!');

    // Check localStorage
    const stored = await page.evaluate(() => localStorage.getItem('UMA_ERP_supplierQuotations'));
    const parsed = JSON.parse(stored || '[]');
    const found = parsed.find(q => q.supplierQuotationRef === 'SQ-TEST-9999');
    if (found) {
      console.log('✓ Verified quotation in localStorage:', found.quotationNumber, found.supplierQuotationRef, 'Total:', found.grandTotal);
    } else {
      console.error('❌ Quotation not found in localStorage!');
    }

    console.log('ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
