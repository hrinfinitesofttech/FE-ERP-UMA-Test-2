import os

path = r'D:\UMA ERP\ERP-Test-1\src\app\store\material-issue\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Form State
old_form_state = """  // Form State
  const [jobId, setJobId] = useState('JOB-2026-001');
  const [woNo, setWoNo] = useState('WO-2026-001-A');
  const [bomNo, setBomNo] = useState('BOM-2026-001');
  const [bomRev, setBomRev] = useState('Rev-01');
  const [stage, setStage] = useState('Shell & Dish End Cutting / Rolling');
  const [itemId, setItemId] = useState(itemMasters[0]?.id || 'ITEM-001');
  const [issueQty, setIssueQty] = useState(3200);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [requestedBy, setRequestedBy] = useState('Bhavin Shah (Production Head)');
  const [issuedBy, setIssuedBy] = useState('Hitesh Rawal (Store Incharge)');
  const [batchLot, setBatchLot] = useState('HEAT-98421');
  const [remarks, setRemarks] = useState('Issued SS 316L plates for main vessel shell rolling as per approved drawing.');

  const defaultItem = {
    id: 'ITEM-001',
    itemCode: 'RAW-SS316L-PL-10',
    itemName: 'SS 316L Stainless Steel Plate 10mm',
    uom: 'KG',
    standardCost: 150,
  };
  const defaultWh = {
    id: 'WH-001',
    warehouseName: 'Raw Material Yard & Plate Store',
    warehouseCode: 'STORE-BAY-01',
  };

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0] || defaultItem;
  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0] || defaultWh;
  const selectedJob = projectJobs.find((j) => j.jobNumber === jobId || j.id === jobId) || projectJobs[0] || {
    id: 'PRJ-2026-0001',
    jobNumber: 'JOB-2026-001',
    customerName: 'Reliance Industries',
    productName: 'Chemical Reactor Vessel 10KL',
  };

  // Find live stock balance for selected item
  const currentStock = stockBalances.find((s) => s.itemId === itemId || s.itemCode === selectedItem?.itemCode);
  const availableUsableQty = currentStock?.usableQty ?? currentStock?.availableQty ?? 15000;"""

new_form_state = """  // Form State
  const [jobId, setJobId] = useState(projectJobs[0]?.jobNumber || projectJobs[0]?.id || '');
  const [woNo, setWoNo] = useState(workOrders[0]?.workOrderNumber || workOrders[0]?.id || '');
  const [bomNo, setBomNo] = useState('');
  const [bomRev, setBomRev] = useState('Rev-01');
  const [stage, setStage] = useState('Shell & Dish End Cutting / Rolling');
  const [itemId, setItemId] = useState(itemMasters[0]?.id || '');
  const [issueQty, setIssueQty] = useState(0);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [requestedBy, setRequestedBy] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [batchLot, setBatchLot] = useState('');
  const [remarks, setRemarks] = useState('');

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0] || null;
  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0] || null;
  const selectedJob = projectJobs.find((j) => j.jobNumber === jobId || j.id === jobId) || projectJobs[0] || null;

  // Find live stock balance for selected item
  const currentStock = stockBalances.find((s) => s.itemId === itemId || s.itemCode === selectedItem?.itemCode);
  const availableUsableQty = currentStock?.usableQty ?? currentStock?.availableQty ?? 0;"""

c = c.replace(old_form_state, new_form_state)

# Replace table row fallbacks
c = c.replace(
    "const jobCode = i.jobId || (i as any).job_number || (i as any).jobNumber || 'JOB-2026-001';",
    "const jobCode = i.jobId || (i as any).job_number || (i as any).jobNumber || '—';"
)
c = c.replace(
    "const custName = (i as any).customerName || matchedJob?.customerName || 'Reliance Industries';",
    "const custName = (i as any).customerName || matchedJob?.customerName || '—';"
)
c = c.replace(
    "const woCode = i.workOrderNumber || (i as any).work_order_number || 'WO-2026-001-A';",
    "const woCode = i.workOrderNumber || (i as any).work_order_number || '—';"
)
c = c.replace(
    "const bomCode = i.bomNumber || (i as any).bom_number || 'BOM-2026-001';",
    "const bomCode = i.bomNumber || (i as any).bom_number || '—';"
)
c = c.replace(
    "const bomRevVal = i.bomRevision || (i as any).bom_revision || 'Rev-01';",
    "const bomRevVal = i.bomRevision || (i as any).bom_revision || '—';"
)
c = c.replace(
    "const reqBy = i.requestedBy || (i as any).requested_by || (i as any).issued_to || 'Bhavin Shah (Production Head)';",
    "const reqBy = i.requestedBy || (i as any).requested_by || (i as any).issued_to || '—';"
)

# Voucher modal fallbacks
c = c.replace("{viewVoucher.jobId || 'JOB-2026-001'}", "{viewVoucher.jobId || '—'}")
c = c.replace("{viewVoucher.workOrderNumber || 'WO-2026-001-A'}", "{viewVoucher.workOrderNumber || '—'}")
c = c.replace("{viewVoucher.bomNumber || 'BOM-2026-001'}", "{viewVoucher.bomNumber || '—'}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("material-issue fallbacks purged successfully")
