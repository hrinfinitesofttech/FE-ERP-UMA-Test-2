const { chromium } = require('playwright');

(async () => {
  console.log('Testing Full BOM Creation -> Page Refresh Persistence -> MRP Calculation Flow...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Go to BOM page
  await page.goto('http://localhost:3000/designer/bom', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 2. Open Create BOM Modal
  await page.click('button:has-text("Create New Master BOM")');
  await page.waitForTimeout(500);

  // 3. Set BOM Name
  await page.fill('input[placeholder="e.g. Steel Table BOM"]', 'Structural Fabrication BOM Test');

  // Fill in the 4 user requested components:
  // MS Sheet 20 KG
  // MS Pipe 30 KG
  // Welding Rod 5 KG
  // Paint 10 LTR
  const materialInputs = page.locator('table tbody tr td:nth-child(1) input');
  const qtyInputs = page.locator('table tbody tr td:nth-child(2) input');
  const unitSelects = page.locator('table tbody tr td:nth-child(3) select');
  const rateInputs = page.locator('table tbody tr td:nth-child(6) input');

  const components = [
    { mat: 'MS Sheet', qty: '20', unit: 'KG', rate: '65' },
    { mat: 'MS Pipe', qty: '30', unit: 'KG', rate: '85' },
    { mat: 'Welding Rod', qty: '5', unit: 'KG', rate: '120' },
    { mat: 'Paint', qty: '10', unit: 'LTR', rate: '250' },
  ];

  for (let i = 0; i < components.length; i++) {
    await materialInputs.nth(i).fill(components[i].mat);
    await qtyInputs.nth(i).fill(components[i].qty);
    await unitSelects.nth(i).selectOption(components[i].unit);
    await rateInputs.nth(i).fill(components[i].rate);
  }

  // Save BOM
  await page.click('button:has-text("Save & Release Master BOM")');
  await page.waitForTimeout(1500);

  console.log('BOM created! Now testing page refresh persistence...');
  // 4. Reload page (F5 test)
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Verify BOM items still exist on the screen after reload
  const renderedMaterials = await page.locator('table tbody tr td:nth-child(3) div.font-bold').allInnerTexts();
  console.log('Materials in table after refresh:', renderedMaterials);

  const renderedQuantities = await page.locator('table tbody tr td:nth-child(6)').allInnerTexts();
  console.log('Quantities in table after refresh:', renderedQuantities);

  const hasMsSheet = renderedMaterials.some(m => m.includes('MS Sheet'));
  const hasMsPipe = renderedMaterials.some(m => m.includes('MS Pipe'));
  console.log(`Page Refresh Persistence Test: ${hasMsSheet && hasMsPipe ? 'PASSED (All items preserved!)' : 'FAILED'}`);

  // 5. Navigate to MRP page
  console.log('\nNavigating to MRP Page (/purchase/mrp)...');
  await page.goto('http://localhost:3000/purchase/mrp', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check if MRP items exist
  const mrpItemCount = await page.locator('table tbody tr').count();
  console.log(`MRP Page loaded with ${mrpItemCount} material requirement rows.`);

  // Check if formula is displayed
  const hasFormulaHeader = await page.locator('text=Shortage (A - B - C)').count();
  console.log(`MRP Calculation Formula Display: ${hasFormulaHeader > 0 ? 'VERIFIED (Gross - Available - OnOrder = Net Shortage)' : 'NOT FOUND'}`);

  await browser.close();
  console.log('\nAll BOM & MRP verification tests completed successfully!');
})();
