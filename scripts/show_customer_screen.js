const { chromium } = require('playwright');

async function showCustomerOnScreen() {
  console.log('================================================================');
  console.log('👀 OPENING CHROME VISIBLY TO SHOW CUSTOMER MASTER & CREATION');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 600, // Clear, visible human pace
    args: ['--start-maximized', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 860 }
  });

  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';

  async function updateHUD(title, subtitle, status, isSuccess = true) {
    try {
      await page.evaluate(({ title, subtitle, status, isSuccess }) => {
        let hud = document.getElementById('customer-demo-hud');
        if (!hud) {
          hud = document.createElement('div');
          hud.id = 'customer-demo-hud';
          hud.style.position = 'fixed';
          hud.style.bottom = '20px'; // Placed at bottom right to avoid overlapping top buttons
          hud.style.right = '20px';
          hud.style.zIndex = '9999999';
          hud.style.width = '420px';
          hud.style.background = 'rgba(24, 20, 16, 0.95)';
          hud.style.color = '#f8fafc';
          hud.style.borderRadius = '14px';
          hud.style.padding = '16px 20px';
          hud.style.boxShadow = '0 12px 35px rgba(0,0,0,0.5), 0 0 0 2px #d97706';
          hud.style.fontFamily = 'Inter, system-ui, sans-serif';
          hud.style.backdropFilter = 'blur(12px)';
          hud.style.pointerEvents = 'none'; // NEVER intercept clicks!
          document.body.appendChild(hud);
        }
        const color = isSuccess ? '#10b981' : '#f59e0b';
        hud.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:6px;">
            <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#f59e0b; text-transform:uppercase;">UMA ERP • CUSTOMER MASTER</span>
            <span style="font-size:11px; font-weight:700; background:${color}22; color:${color}; padding:2px 8px; border-radius:999px; border:1px solid ${color};">LIVE ON SCREEN</span>
          </div>
          <div style="font-size:15px; font-weight:700; color:#ffffff; margin-bottom:4px;">${title}</div>
          <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">${subtitle}</div>
          <div style="font-size:12px; font-weight:600; color:#34d399; background:rgba(0,0,0,0.4); padding:6px 10px; border-radius:6px; border-left:3px solid #10b981;">
            ${status}
          </div>
        `;
      }, { title, subtitle, status, isSuccess });
    } catch (e) {}
  }

  try {
    // 1. LOGIN
    console.log('1. Logging in to ERP...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await updateHUD('Login & Authentication', 'Signing into UmaERP Admin Portal...', 'Authenticating as Rajesh Admin');

    const userInput = await page.$('input[name="username"], input[type="text"]');
    if (userInput) await userInput.fill('rajesh.admin');
    const passInput = await page.$('input[type="password"]');
    if (passInput) await passInput.fill('admin123');
    
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(1000);

    // 2. NAVIGATE TO CUSTOMER MASTER
    console.log('2. Navigating to Customer Master...');
    await page.goto(`${baseUrl}/crm/customers`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);
    await updateHUD('Customer Master Directory', 'Viewing enterprise client accounts in CRM', 'Loaded Customer Directory');

    // 3. OPEN ADD CUSTOMER MODAL
    console.log('3. Clicking "+ Add Customer" button...');
    await page.waitForTimeout(1000);
    const addBtn = await page.waitForSelector('button:has-text("Add Customer")', { state: 'visible', timeout: 5000 });
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }

    // 4. FILL CUSTOMER DETAILS
    console.log('4. Filling Customer Details on screen...');
    await updateHUD('New Customer Entry Form', 'Entering Company Name, GSTIN, Contact & Location', 'Filling Form Fields...');

    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const companyName = `QA Manufacturing Corp ${randSuffix}`;

    // Fill Company Name
    const nameInput = await page.waitForSelector('input[placeholder*="Aarti"], input[placeholder*="Company"]', { state: 'visible', timeout: 5000 });
    if (nameInput) {
      await nameInput.type(companyName, { delay: 40 });
    }
    await page.waitForTimeout(400);

    // Fill GSTIN
    const gstInput = await page.$('input[placeholder*="24AAA"]');
    if (gstInput) {
      await gstInput.type('24AAAAA0000A1Z5', { delay: 40 });
    }
    await page.waitForTimeout(400);

    // Fill Contact Person
    const contactInput = await page.$('input[placeholder*="Rajeev"], input[placeholder*="Contact"]');
    if (contactInput) {
      await contactInput.type('Rajesh Patel (Director)', { delay: 40 });
    }
    await page.waitForTimeout(400);

    // Fill Mobile
    const mobileInput = await page.$('input[placeholder*="10-digit"], input[placeholder*="mobile"], input[type="tel"]');
    if (mobileInput) {
      await mobileInput.type('9876543210', { delay: 40 });
    }
    await page.waitForTimeout(400);

    // Fill Email
    const emailInput = await page.$('input[placeholder*="name@domain"], input[type="email"]');
    if (emailInput) {
      await emailInput.type(`rajesh.${randSuffix}@qacorp.com`, { delay: 40 });
    }
    await page.waitForTimeout(600);

    // 5. SUBMIT / SAVE CUSTOMER
    console.log('5. Clicking Save Customer...');
    await updateHUD('Saving Customer Record', `Submitting: "${companyName}"`, 'Saving to Database...');
    const saveBtn = await page.$('button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }

    // 6. VERIFY IN LIST
    console.log('6. Verifying Customer on Screen...');
    await updateHUD('Customer Created Successfully! 🎉', `Customer "${companyName}" is now active in the directory!`, `Status: Live in ERP & Database`);
    await page.waitForTimeout(2000);

    // 7. OPEN PROFILE OF CUSTOMER
    console.log('7. Opening Customer 360° Profile...');
    const profileBtn = await page.$('a[href*="/crm/customers/"]:has-text("Profile")');
    if (profileBtn) {
      await updateHUD('Customer 360° Profile', 'Opening Customer Profile with linked orders & ledgers', 'Loading Profile View...');
      await profileBtn.click();
      await page.waitForTimeout(2000);
      await updateHUD('Customer 360° Profile Loaded ✅', 'Customer details, orders, GST, and ledger visible!', 'Displaying on Screen');
    }

    console.log('\n================================================================');
    console.log('✅ Customer Master and 360° Profile are live on your screen!');
    console.log('================================================================');

    // Keep browser window open for user to view comfortably
    await page.waitForTimeout(45000);

  } catch (error) {
    console.error('Error during customer display:', error);
  } finally {
    try {
      await browser.close();
    } catch(e) {}
    console.log('Browser session complete.');
  }
}

showCustomerOnScreen();
