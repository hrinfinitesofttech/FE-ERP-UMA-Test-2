import os

prod_dir = r'D:\UMA ERP\ERP-Test-1\src\app\production'

for root, _, files in os.walk(prod_dir):
    for f in files:
        if not f.endswith(('.ts', '.tsx')):
            continue
        filepath = os.path.join(root, f)
        with open(filepath, 'r', encoding='utf-8') as fp:
            c = fp.read()
        
        orig = c
        # Clean fallbacks
        c = c.replace("|| 'JOB-2026-001'", "|| ''")
        c = c.replace("|| 'WO-2026-001-A'", "|| ''")
        c = c.replace("|| 'WO-2026-001'", "|| ''")
        c = c.replace("useState('JOB-2026-001')", "useState('')")
        c = c.replace("useState('WO-2026-001-A')", "useState('')")
        c = c.replace("useState('WO-2026-001')", "useState('')")
        c = c.replace("const defaultJob = workOrders[0]?.jobNumber || 'JOB-2026-001';", "const defaultJob = workOrders[0]?.jobNumber || '';")
        c = c.replace("const defaultWo = workOrders[0]?.workOrderNumber || 'WO-2026-001-A';", "const defaultWo = workOrders[0]?.workOrderNumber || '';")
        c = c.replace("<option value=\"JOB-2026-001\">JOB-2026-001 - Heavy SS Reactor</option>", "<option value=\"\">Select Job</option>")
        c = c.replace("<option value=\"WO-2026-001-A\">WO-2026-001-A — JOB-2026-001 (Chemical Reactor Vessel 10KL)</option>", "<option value=\"\">Select Work Order</option>")
        c = c.replace("<option value=\"WO-2026-001-A\">WO-2026-001-A — JOB-2026-001</option>", "<option value=\"\">Select Work Order</option>")
        c = c.replace("<option value=\"WO-2026-001-A\">WO-2026-001-A (General)</option>", "<option value=\"\">Select Work Order</option>")
        c = c.replace("<option value=\"WO-2026-001-A\">WO-2026-001-A (Main Assembly)</option>", "<option value=\"\">Select Work Order</option>")
        c = c.replace("<option value=\"WO-2026-001-A\">WO-2026-001-A (Default)</option>", "<option value=\"\">Select Work Order</option>")
        c = c.replace("map.set('JOB-2026-001', 'JOB-2026-001 — Reactor Vessel 50KL');\n", "")
        c = c.replace("openJobModal('JOB-2026-001')", "openJobModal(allJobs[0]?.jobNumber || '')")

        if c != orig:
            with open(filepath, 'w', encoding='utf-8') as fp:
                fp.write(c)
            print(f"Cleaned {f}")

print("Production fallbacks purge complete.")
