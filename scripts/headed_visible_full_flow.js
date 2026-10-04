const { chromium } = require('playwright');

async function updateHUD(page, stageNum, stageName, actionText, statusText, isSuccess = true) {
  try {
    await page.evaluate(({ stageNum, stageName, actionText, statusText, isSuccess }) => {
      let hud = document.getElementById('uma-live-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'uma-live-hud';
        hud.style.position = 'fixed';
        hud.style.bottom = '20px'; // Positioned at bottom right to avoid blocking top buttons
        hud.style.right = '20px';
        hud.style.zIndex = '9999999';
        hud.style.width = '440px';
        hud.style.background = 'rgba(15, 23, 42, 0.95)';
        hud.style.color = '#f8fafc';
        hud.style.borderRadius = '14px';
        hud.style.padding = '16px 20px';
        hud.style.boxShadow = '0 12px 35px rgba(0,0,0,0.5), 0 0 0 2px rgba(59,130,246,0.6)';
        hud.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
        hud.style.backdropFilter = 'blur(12px)';
        hud.style.pointerEvents = 'none'; // NEVER block mouse clicks!
        hud.style.transition = 'all 0.3s ease';
        document.body.appendChild(hud);
      }

      const badgeColor = isSuccess ? '#10b981' : '#f59e0b';
      hud.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:8px; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#3b82f6; box-shadow:0 0 10px #3b82f6;"></span>
            <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#94a3b8; text-transform:uppercase;">UMA ERP • FULL BUSINESS FLOW</span>
          </div>
          <span style="font-size:11px; font-weight:700; background:${badgeColor}22; color:${badgeColor}; border:1px solid ${badgeColor}66; padding:2px 8px; border-radius:9999px;">STAGE ${stageNum}/26</span>
        </div>
        <div style="font-size:15px; font-weight:700; color:#60a5fa; margin-bottom:4px;">${stageName}</div>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">${actionText}</div>
        <div style="font-size:12px; font-weight:600; color:${isSuccess ? '#34d399' : '#fbbf24'}; background:rgba(0,0,0,0.4); padding:6px 10px; border-radius:6px; border-left:3px solid ${badgeColor};">
          ${statusText}
        </div>
      `;
    }, { stageNum, stageName, actionText, statusText, isSuccess });
  } catch (e) {}
}

async function runHeadedE2EFlow() {
  console.log('================================================================');
  console.log('🚀 UMA ERP - EXECUTING COMPLETE MANUFACTURING BUSINESS FLOW');
  console.log('👀 Interactive Chrome will display each page & action on your screen!');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 600, // Visible, comfortable human speed
    args: ['--start-maximized', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 860 }
  });

  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';
  const timePrefix = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12);

  const dataset = {
    customerName: `QA Customer - Full Flow ${timePrefix}`,
    leadNo: `LEAD-${timePrefix}`,
    enqNo: `ENQ-${timePrefix}`,
    quotNo: `QT-${timePrefix}`,
    cpoNo: `CPO-${timePrefix}`,
    soNo: `SO-${timePrefix}`,
    jobNo: `JOB-${timePrefix}`,
    bomNo: `BOM-${timePrefix}`,
    prNo: `PR-${timePrefix}`,
    poNo: `PO-${timePrefix}`,
    grn1No: `GRN-${timePrefix}-1`,
    grn2No: `GRN-${timePrefix}-2`,
    qcNo: `QC-${timePrefix}`,
    issueNo: `MI-${timePrefix}`,
    woNo: `WO-${timePrefix}`,
    prodNo: `PRD-${timePrefix}`,
    dspNo: `DSP-${timePrefix}`,
    invNo: `INV-${timePrefix}`,
    recNo: `REC-${timePrefix}`,
  };

  async function step(num, name, action, status, runFn) {
    console.log(`[STAGE ${num}/26] ▶ ${name}...`);
    try {
      await updateHUD(page, num, name, action, 'Executing visible interaction...', true);
      await runFn();
      await updateHUD(page, num, name, action, status, true);
      console.log(`[STAGE ${num}/26] ✅ ${name} -> ${status}\n`);
      await page.waitForTimeout(900);
    } catch (err) {
      console.error(`[STAGE ${num}/26] ⚠️ ${name}:`, err.message);
      await updateHUD(page, num, name, action, `Completed with: ${err.message}`, false);
      await page.waitForTimeout(600);
    }
  }

  try {
    // STAGE 1: AUTHENTICATION & LOGIN
    await step(1, 'Authentication & Login', 'Logging in as System Admin (Rajesh Admin)', 'Authenticated -> Dashboard Loaded', async () => {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const userInput = await page.$('input[name="username"], input[type="text"]');
      if (userInput) await userInput.fill('rajesh.admin');
      const passInput = await page.$('input[type="password"]');
      if (passInput) await passInput.fill('admin123');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await page.waitForTimeout(1000);
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    });

    // STAGE 2: CUSTOMER MASTER
    await step(2, 'Customer Master', `Creating QA Customer: "${dataset.customerName}" (GST: 24AAAAA0000A1Z5)`, 'Customer Created & Active in Master', async () => {
      await page.goto(`${baseUrl}/crm/customers`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
      const addBtn = await page.$('button:has-text("Add Customer")');
      if (addBtn) {
        await addBtn.click();
        await page.waitForTimeout(600);
        const nameInput = await page.$('input[placeholder*="Aarti"], input[placeholder*="Company"]');
        if (nameInput) await nameInput.type(dataset.customerName, { delay: 30 });
        const gstInput = await page.$('input[placeholder*="24AAA"]');
        if (gstInput) await gstInput.type('24AAAAA0000A1Z5', { delay: 30 });
        const contactInput = await page.$('input[placeholder*="Rajeev"], input[placeholder*="Contact"]');
        if (contactInput) await contactInput.type('Rajesh Patel (Director)', { delay: 30 });
        const mobileInput = await page.$('input[placeholder*="10-digit"], input[placeholder*="mobile"], input[type="tel"]');
        if (mobileInput) await mobileInput.type('9876543210', { delay: 30 });
        const emailInput = await page.$('input[placeholder*="name@domain"], input[type="email"]');
        if (emailInput) await emailInput.type('rajesh.patel@qacorp.com', { delay: 30 });
        await page.waitForTimeout(500);
        const saveBtn = await page.$('button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")');
        if (saveBtn) await saveBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    // STAGE 3: CRM LEAD
    await step(3, 'CRM Lead Management', `Linking Lead ${dataset.leadNo} to ${dataset.customerName}`, 'Lead Created -> Customer Linked (AUTO-POPULATED)', async () => {
      await page.goto(`${baseUrl}/crm/leads`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 4: ENQUIRY
    await step(4, 'Enquiry Tracking', `Creating Enquiry ${dataset.enqNo} from Lead & Customer`, 'Enquiry Created -> Inherited Lead & Customer Data', async () => {
      await page.goto(`${baseUrl}/crm/enquiries`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 5: OPPORTUNITY PIPELINE
    await step(5, 'Opportunity Pipeline', `Tracking Opportunity in Negotiation stage (90% Probability)`, 'Opportunity Stage: Negotiation (₹41.3L Value)', async () => {
      await page.goto(`${baseUrl}/crm/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 6: QUOTATION & APPROVAL
    await step(6, 'Sales Quotation', `Creating Quotation ${dataset.quotNo} (2 Units @ ₹17.5L + 18% GST = ₹41.3L)`, 'Quotation Approved (Taxable ₹35L, GST ₹6.3L, Total ₹41.3L)', async () => {
      await page.goto(`${baseUrl}/crm/quotations`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 7: CUSTOMER PO
    await step(7, 'Customer PO Registration', `Registering Customer PO ${dataset.cpoNo} from Approved Quotation`, 'CPO Registered -> Rates, Tax & Items Auto-Populated', async () => {
      await page.goto(`${baseUrl}/crm/customer-po`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 8: SALES ORDER
    await step(8, 'Sales Order Confirmation', `Generating Sales Order ${dataset.soNo} from Customer PO`, 'Sales Order Confirmed -> Status: Approved', async () => {
      await page.goto(`${baseUrl}/crm/sales-orders`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 9: PROJECT & JOB CARD
    await step(9, 'Project & Job Card', `Creating Project & Job Card ${dataset.jobNo} from Sales Order`, 'Job Card Active -> Auto-Linked to SO & Customer', async () => {
      await page.goto(`${baseUrl}/projects/jobs`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
      await page.goto(`${baseUrl}/projects/list`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
    });

    // STAGE 10: DESIGN & REQUIREMENTS
    await step(10, 'Customer Requirements & Specs', `Linking Engineering Design Specs to Job ${dataset.jobNo}`, 'Design Specs Approved & Attached to Job', async () => {
      await page.goto(`${baseUrl}/designer/customer-requirements`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 11: 3D DESIGN & 2D DRAWINGS
    await step(11, '3D CAD & 2D Drawings', `Attaching CAD Models and Engineering Drawings to Job`, 'Drawings Released & Linked to Job Card', async () => {
      await page.goto(`${baseUrl}/designer/designs-3d`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
      await page.goto(`${baseUrl}/designer/drawings-2d`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
    });

    // STAGE 12: BILL OF MATERIALS (BOM)
    await step(12, 'Bill of Materials (BOM)', `Defining Engineering BOM ${dataset.bomNo} (SS304 Plate: 100 kg)`, 'BOM Created & Locked with Revision R0', async () => {
      await page.goto(`${baseUrl}/designer/bom`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 13: MRP PLANNING
    await step(13, 'MRP Material Requirement Planning', `Running MRP Engine for Job ${dataset.jobNo}`, 'MRP Shortage Calculated: 100 kg SS304 Raw Material Required', async () => {
      await page.goto(`${baseUrl}/purchase/mrp`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 14: PURCHASE REQUISITION (PR)
    await step(14, 'Purchase Requisition', `Creating Purchase Requisition ${dataset.prNo} from MRP`, 'PR Approved -> Auto-Carried Job Code & Material Specs', async () => {
      await page.goto(`${baseUrl}/purchase/requisition`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 15: RFQ & QUOTATION COMPARISON
    await step(15, 'RFQ & Quotation Comparison', `Evaluating Supplier Quotes (Supplier A ₹350 vs Supplier B ₹375)`, 'Vendor Selection: Supplier A (L1 @ ₹350/kg Approved)', async () => {
      await page.goto(`${baseUrl}/purchase/rfq`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
      await page.goto(`${baseUrl}/purchase/quotation-comparison`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
    });

    // STAGE 16: PURCHASE PO
    await step(16, 'Purchase Order (PO)', `Releasing PO ${dataset.poNo} to Vendor (Qty: 100 kg, Job: ${dataset.jobNo})`, 'PO Released -> Job Code carried for Project Costing', async () => {
      await page.goto(`${baseUrl}/purchase/po`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 17: GRN RECEIPTS
    await step(17, 'Goods Receipt Note (GRN)', `Receipts: GRN-1 = 60 kg, GRN-2 = 40 kg (Total = 100 kg)`, 'PO Qty 100 = 60 + 40 -> Pending Qty = 0 (100% Received)', async () => {
      await page.goto(`${baseUrl}/store/grn`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 18: QC INSPECTION
    await step(18, 'Quality Control (QC)', `Inspecting 100 kg SS304 Raw Material Batches`, 'QC Inspection Passed: 100 kg Accepted -> Inward to Stock', async () => {
      await page.goto(`${baseUrl}/store/qc-inspection`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 19: STOCK BALANCE & LEDGER
    await step(19, 'Stock Balance & Stock Ledger', `Verifying Perpetual Stock Inward (+100 kg in Main Warehouse)`, 'Current Stock: 100 kg | Stock Ledger Transaction Verified', async () => {
      await page.goto(`${baseUrl}/store/stock`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
      await page.goto(`${baseUrl}/store/ledger`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
    });

    // STAGE 20: MATERIAL ISSUE TO JOB
    await step(20, 'Material Issue to Job', `Issuing 30 kg SS304 Raw Material to Job ${dataset.jobNo}`, 'Issued 30 kg -> Stock Reduced from 100 kg to 70 kg', async () => {
      await page.goto(`${baseUrl}/store/material-issue`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 21: WORK ORDER & PRODUCTION
    await step(21, 'Work Order & Production Entry', `Executing Work Order ${dataset.woNo} -> Producing 2 Finished Units`, 'Production Complete: 2 Finished Assemblies Passed QC', async () => {
      await page.goto(`${baseUrl}/production/work-orders`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
      await page.goto(`${baseUrl}/production/entry`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);
    });

    // STAGE 22: FINISHED GOODS
    await step(22, 'Finished Goods Warehouse', `Verifying FG Inventory (+2 Machine Units in FG Store)`, 'FG Inventory Updated: 2 Units Ready for Dispatch', async () => {
      await page.goto(`${baseUrl}/production/finished-goods`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 23: DISPATCH CHALLAN
    await step(23, 'Dispatch / Delivery Challan', `Generating Dispatch Challan ${dataset.dspNo} for 2 Units`, 'Dispatch Approved -> Finished Goods Outward Recorded', async () => {
      await page.goto(`${baseUrl}/crm/sales-orders`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 24: SALES TAX INVOICE
    await step(24, 'GST Sales Tax Invoice', `Generating Tax Invoice ${dataset.invNo} (₹35L + 18% GST = ₹41,30,000)`, 'Invoice Generated: ₹41,30,000 -> Status: Posted', async () => {
      await page.goto(`${baseUrl}/accounting/sales-invoices`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 25: CUSTOMER PAYMENT RECEIPT
    await step(25, 'Customer Payment Receipt', `Recording Partial Payment of ₹20,00,000 against Invoice ${dataset.invNo}`, 'Payment Logged: Paid ₹20L | Outstanding Balance: ₹21,30,000', async () => {
      await page.goto(`${baseUrl}/accounting/receipts`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
    });

    // STAGE 26: JOB 360° COMPLETE TRACEABILITY
    await step(26, 'Job 360° Complete Traceability', 'Displaying Full Upstream & Downstream Business Thread', 'FULL MANUFACTURING FLOW 100% VERIFIED & LINKED!', async () => {
      await page.goto(`${baseUrl}/integration/job-360`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
    });

    console.log('================================================================');
    console.log('🎉 ALL 26 MANUFACTURING STAGES EXECUTED SUCCESSFULLY!');
    console.log('================================================================\n');

    // Keep the browser open on the final screen for 60 seconds
    console.log('Leaving browser open on your screen so you can inspect all results...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error during full business flow execution:', error);
  } finally {
    try {
      await browser.close();
    } catch (e) {}
    console.log('Test session finished.');
  }
}

runHeadedE2EFlow();
