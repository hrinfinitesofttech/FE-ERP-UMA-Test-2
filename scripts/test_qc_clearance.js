const { chromium } = require('playwright');

(async () => {
  console.log('Testing QC Clearance submission & Manual QC Entry...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Test URL param ?grn=GRN-2026-0003
    await page.goto('http://localhost:3000/store/qc-inspection?grn=GRN-2026-0003', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('1. Navigated with ?grn=GRN-2026-0003');

    await page.waitForTimeout(1000);

    const modalHeader = page.locator('text=Perform Quality Inspection Clearance');
    await modalHeader.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Modal opened automatically!');

    // Submit Clearance
    const submitBtn = page.locator('button:has-text("Submit Inspection Clearance")');
    await submitBtn.click();
    console.log('Clicked "Submit Inspection Clearance"');

    await modalHeader.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✓ Modal closed successfully!');

    // Verify Toast
    const toast = page.locator('text=cleared with result');
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Toast message verified!');

    // 2. Test Manual "+ Create QC Inspection"
    await page.waitForTimeout(1000);
    const createBtn = page.locator('#create-qc-button');
    await createBtn.click();
    console.log('2. Clicked "+ Create QC Inspection" button');

    const newModal = page.locator('text=Create New QC Inspection Entry');
    await newModal.waitFor({ state: 'visible', timeout: 5000 });

    // Fill Item Code & Description
    await page.fill('input[placeholder="e.g. BO-MOT-001"]', 'RAW-PLATE-01');
    await page.fill('input[placeholder="e.g. Flameproof Electric Induction Motor (15 HP)"]', 'MS Plate 12mm Grade E250');
    await page.click('button:has-text("Create Inspection Entry")');
    console.log('Clicked "Create Inspection Entry"');

    await newModal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✓ Manual creation modal closed!');

    // Check table
    await page.waitForSelector('text=RAW-PLATE-01', { timeout: 5000 });
    console.log('✓ New inspection entry verified in table!');

    console.log('ALL TESTS COMPLETED AND VERIFIED 100%!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
