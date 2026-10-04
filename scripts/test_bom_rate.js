const { chromium } = require('playwright');

(async () => {
  console.log('Testing Master BOM Create with Est. Rates...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/designer/bom', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click Create New Master BOM
  await page.click('button:has-text("Create New Master BOM")');
  await page.waitForTimeout(500);

  // Fill in BOM Name
  await page.fill('input[placeholder="e.g. Steel Table BOM"]', 'Test Rate Table BOM');

  // Fill in rates for existing 4 rows
  const rateInputs = page.locator('table input[type="number"][min="0"]');
  const count = await rateInputs.count();
  console.log(`Found ${count} rate inputs in modal`);

  for (let i = 0; i < count; i++) {
    await rateInputs.nth(i).fill('10');
  }

  // Click Save & Release Master BOM
  await page.click('button:has-text("Save & Release Master BOM")');
  await page.waitForTimeout(1500);

  // Check if Est. Rate displays 10 in the main table
  const estRateTexts = await page.locator('table tbody tr td:nth-child(7)').allInnerTexts();
  console.log('Main Table Est. Rate values:', estRateTexts);

  const totalAmountTexts = await page.locator('table tbody tr td:nth-child(8)').allInnerTexts();
  console.log('Main Table Total Amount values:', totalAmountTexts);

  const headerTotalCost = await page.locator('text=ESTIMATED TOTAL BOM COST').locator('..').innerText();
  console.log('Header Total BOM Cost Card:', headerTotalCost.replace(/\n/g, ' '));

  const has10 = estRateTexts.some(t => t.includes('10'));
  console.log(`BOM Est. Rate Test: ${has10 ? 'SUCCESS! (Rate 10 correctly rendered)' : 'FAILED!'}`);

  await browser.close();
})();
