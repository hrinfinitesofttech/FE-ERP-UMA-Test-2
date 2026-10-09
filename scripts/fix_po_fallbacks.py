import os

path = r'D:\UMA ERP\ERP-Test-1\src\app\purchase\po\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. directJobId, directProjectId initial state
c = c.replace(
    "const [directJobId, setDirectJobId] = useState(projectJobs[0]?.id || 'JOB-2026-001');\n  const [directProjectId, setDirectProjectId] = useState(projectJobs[0]?.projectId || 'PRJ-2026-0001');",
    "const [directJobId, setDirectJobId] = useState(projectJobs[0]?.id || projectJobs[0]?.jobNumber || '');\n  const [directProjectId, setDirectProjectId] = useState(projectJobs[0]?.projectId || '');"
)

# 2. Quotation mode fallbacks
c = c.replace("projectId: sqObj.projectId || 'PRJ-2026-0001',", "projectId: sqObj.projectId || '',")
c = c.replace("jobId: sqObj.jobId || 'JOB-2026-001',", "jobId: sqObj.jobId || '',")
c = c.replace("supplierId: sqObj.supplierId || 'SUP-001',", "supplierId: sqObj.supplierId || '',")
c = c.replace("supplierGstin: (sqObj as any).supplierGstin || '24AAAAA0000A1Z5',", "supplierGstin: (sqObj as any).supplierGstin || '',")

# 3. Direct mode supplier
c = c.replace(
    "const supplierName = supplierObj ? (supplierObj.name || supplierObj.supplierName || 'Selected Supplier') : 'Apex Steel Fabricators';",
    "const supplierName = supplierObj ? (supplierObj.name || supplierObj.supplierName || (supplierObj as any).vendorName || 'Supplier') : '';"
)
c = c.replace("const supplierGstin = supplierObj?.gstin || '24AAACU1234F1Z9';", "const supplierGstin = supplierObj?.gstin || '';")
c = c.replace("const supplierId = supplierObj?.id || 'SUP-001';", "const supplierId = supplierObj?.id || '';")
c = c.replace("projectId: directProjectId || 'PRJ-2026-0001',", "projectId: directProjectId || '',")
c = c.replace("jobId: directJobId || 'JOB-2026-001',", "jobId: directJobId || '',")

# 4. Table view fallbacks
c = c.replace("{po.jobId || (po as any).job_code || 'JOB-2026-001'}", "{po.jobId || (po as any).job_code || '—'}")
c = c.replace("{po.projectId || (po as any).project_id || 'PRJ-2026-0001'}", "{po.projectId || (po as any).project_id || '—'}")
c = c.replace("{viewPO.projectId || 'PRJ-2026-0001'}", "{viewPO.projectId || '—'}")
c = c.replace("{viewPO.jobId || 'JOB-2026-001'}", "{viewPO.jobId || '—'}")

# 5. Form options and placeholders
c = c.replace('<option value="SUP-001">Apex Steel Fabricators (SUP-001)</option>', '<option value="">No suppliers available</option>')
c = c.replace('placeholder="JOB-2026-001"', 'placeholder="e.g. JOB-2026-001"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("PO page fallbacks successfully purged")
