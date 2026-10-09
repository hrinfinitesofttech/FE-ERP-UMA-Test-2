import requests
import json
import time
from datetime import datetime

BASE_URL = "https://erpuma.pythonanywhere.com/api"
TIMESTAMP = int(time.time())
SUFFIX = str(TIMESTAMP)[-5:]

print(f"=== UMA ERP COMPLETE END-TO-END BUSINESS FLOW TEST ===")
print(f"Target Backend API: {BASE_URL}")
print(f"Run Suffix: {SUFFIX}")
print(f"Timestamp: {datetime.now().isoformat()}\n")

# Step 0: Authenticate
auth_resp = requests.post(f"{BASE_URL}/auth/login/", json={"username": "admin", "password": "admin123"}, timeout=15)
if auth_resp.status_code != 200:
    print(f"FATAL: Authentication failed! Status {auth_resp.status_code}: {auth_resp.text}")
    exit(1)

token = auth_resp.json().get('access')
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
print(f"[AUTH PASS] Authenticated successfully with live backend.\n")

records = {}
results = {}

def execute_step(step_name, method, url, payload=None, expected_status=[200, 201]):
    print(f"--- [STEP: {step_name}] ---")
    start_t = time.time()
    try:
        if method == "POST":
            r = requests.post(url, headers=headers, json=payload, timeout=20)
        elif method == "GET":
            r = requests.get(url, headers=headers, timeout=20)
        elif method == "PATCH":
            r = requests.patch(url, headers=headers, json=payload, timeout=20)
        
        elapsed = round((time.time() - start_t) * 1000, 2)
        if r.status_code in expected_status:
            print(f"  [HTTP {r.status_code} OK] {method} {url.replace(BASE_URL, '')} in {elapsed}ms")
            try:
                data = r.json()
                results[step_name] = {"status": "PASS", "code": r.status_code, "data": data, "latency_ms": elapsed}
                return data
            except Exception:
                results[step_name] = {"status": "PASS", "code": r.status_code, "data": r.text, "latency_ms": elapsed}
                return r.text
        else:
            print(f"  [HTTP {r.status_code} FAIL] {method} {url.replace(BASE_URL, '')}: {r.text[:200]}")
            results[step_name] = {"status": "FAIL", "code": r.status_code, "error": r.text, "latency_ms": elapsed}
            return None
    except Exception as e:
        print(f"  [EXC FAIL] {e}")
        results[step_name] = {"status": "ERROR", "error": str(e)}
        return None

# 1. CRM Lead
lead_no = f"LEAD-FE-E2E-{SUFFIX}"
lead_payload = {
    "leadNumber": lead_no,
    "lead_number": lead_no,
    "companyName": f"Gujarat Apex Refinery {SUFFIX}",
    "company_name": f"Gujarat Apex Refinery {SUFFIX}",
    "contactPerson": "Nitin Shah",
    "contact_person": "Nitin Shah",
    "email": f"apex{SUFFIX}@example.com",
    "phone": "9825012345",
    "source": "Website",
    "status": "Qualified",
    "industry": "Refinery & Petrochemicals",
    "estimatedValue": 1250000,
    "estimated_value": 1250000,
}
lead_res = execute_step("Lead", "POST", f"{BASE_URL}/leads/", lead_payload)
lead_id = lead_res.get('id') if lead_res else lead_no
records["Lead"] = lead_id

# Verify Lead Read
execute_step("Lead_Verify", "GET", f"{BASE_URL}/leads/{lead_id}/")

# Also ensure customer exists for downstream linkage
cust_no = f"CUST-FE-E2E-{SUFFIX}"
cust_payload = {
    "customerNumber": cust_no,
    "companyName": f"Gujarat Apex Refinery {SUFFIX}",
    "name": f"Gujarat Apex Refinery {SUFFIX}",
    "contactPerson": "Nitin Shah",
    "phone": "9825012345",
    "email": f"apex{SUFFIX}@example.com",
    "city": "Vadodara",
    "state": "Gujarat",
    "gstin": "24AABCA1234F1Z5"
}
cust_res = execute_step("Customer", "POST", f"{BASE_URL}/customers/", cust_payload)
cust_id = cust_res.get('id') if cust_res else cust_no
records["Customer"] = cust_id

# 2. Enquiry
enq_no = f"ENQ-FE-E2E-{SUFFIX}"
enq_payload = {
    "enquiryNumber": enq_no,
    "enquiry_number": enq_no,
    "lead": lead_id,
    "customerId": cust_id,
    "customer": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "productName": "Heavy Duty 50KL Acid Storage Vessel",
    "requirement": "Stainless Steel SS-316L ASME Sec VIII Div 1 Vessel",
    "estimatedValue": 1250000,
    "status": "Open"
}
enq_res = execute_step("Enquiry", "POST", f"{BASE_URL}/enquiries/", enq_payload)
enq_id = enq_res.get('id') if enq_res else enq_no
records["Enquiry"] = enq_id

# 3. Quotation
quo_no = f"QUO-FE-E2E-{SUFFIX}"
quo_payload = {
    "quotationNumber": quo_no,
    "quotation_number": quo_no,
    "enquiryId": enq_id,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "subject": "Commercial Offer for 50KL Acid Storage Vessel",
    "subTotal": 1250000,
    "taxAmount": 225000,
    "grandTotal": 1475000,
    "grand_total": 1475000,
    "status": "Approved",
    "items": [
        {
            "itemCode": "VESSEL-50KL",
            "itemName": "50KL SS-316L Storage Vessel",
            "quantity": 1,
            "unitRate": 1250000,
            "totalAmount": 1250000
        }
    ]
}
quo_res = execute_step("Quotation", "POST", f"{BASE_URL}/quotations/", quo_payload)
quo_id = quo_res.get('id') if quo_res else quo_no
records["Quotation"] = quo_id

# 4. Customer PO
cpo_no = f"CPO-FE-E2E-{SUFFIX}"
cpo_payload = {
    "poNumber": cpo_no,
    "po_number": cpo_no,
    "quotationId": quo_id,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "poAmount": 1475000,
    "po_value": 1475000,
    "orderDate": datetime.now().date().isoformat(),
    "deliveryDate": datetime.now().date().isoformat(),
    "status": "Verified"
}
cpo_res = execute_step("Customer PO", "POST", f"{BASE_URL}/customer-pos/", cpo_payload)
cpo_id = cpo_res.get('id') if cpo_res else cpo_no
records["Customer PO"] = cpo_id

# 5. Sales Order
so_no = f"SO-FE-E2E-{SUFFIX}"
so_payload = {
    "salesOrderNumber": so_no,
    "sales_order_number": so_no,
    "customerPOId": cpo_id,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "grandTotal": 1475000,
    "grand_total": 1475000,
    "total_amount": 1475000,
    "status": "Approved"
}
so_res = execute_step("Sales Order", "POST", f"{BASE_URL}/sales-orders/", so_payload)
so_id = so_res.get('id') if so_res else so_no
records["Sales Order"] = so_id

# 6. Project / Job Master
prj_no = f"PRJ-FE-E2E-{SUFFIX}"
job_no = f"JOB-FE-E2E-{SUFFIX}"
prj_payload = {
    "projectNumber": prj_no,
    "project_number": prj_no,
    "jobNumber": job_no,
    "job_number": job_no,
    "salesOrderNumber": so_no,
    "sales_order_number": so_no,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "productName": "50KL SS-316L Acid Storage Vessel",
    "projectTitle": f"Acid Storage Tank Project {SUFFIX}",
    "status": "Active"
}
prj_res = execute_step("Project / Job", "POST", f"{BASE_URL}/projects/", prj_payload)
prj_id = prj_res.get('id') if prj_res else prj_no
records["Project / Job"] = prj_id

# 7. Design Job / Engineering Technical Doc
tdoc_no = f"TDOC-FE-E2E-{SUFFIX}"
des_job_no = f"DES-FE-E2E-{SUFFIX}"
des_payload = {
    "documentNumber": tdoc_no,
    "document_number": tdoc_no,
    "job_number": job_no,
    "jobNumber": job_no,
    "projectId": prj_id,
    "documentTitle": "General Assembly Drawing GA-50KL-REV0",
    "revision": "R0",
    "status": "Approved"
}
des_res = execute_step("Design", "POST", f"{BASE_URL}/technical-documents/", des_payload)
des_id = des_res.get('id') if des_res else tdoc_no
records["Design"] = des_id

# 8. BOM (Bill of Materials)
bom_no = f"BOM-FE-E2E-{SUFFIX}"
bom_payload = {
    "bomNumber": bom_no,
    "bom_number": bom_no,
    "jobNumber": job_no,
    "job_number": job_no,
    "bomName": f"BOM for 50KL Vessel {SUFFIX}",
    "status": "approved",
    "approvalStatus": "approved",
    "totalEstimatedCost": 420000,
    "items": [
        {
            "itemCode": f"RM-SS-PLT-{SUFFIX}",
            "partNumber": f"RM-SS-PLT-{SUFFIX}",
            "itemName": "SS-316L Plates 12mm Thk",
            "quantity": 10,
            "unit": "NOS",
            "estimatedRate": 35000,
            "totalAmount": 350000
        },
        {
            "itemCode": f"RM-FLANGE-{SUFFIX}",
            "partNumber": f"RM-FLANGE-{SUFFIX}",
            "itemName": "ANSI Class 150 100NB Flanges",
            "quantity": 4,
            "unit": "NOS",
            "estimatedRate": 17500,
            "totalAmount": 70000
        }
    ]
}
bom_res = execute_step("BOM", "POST", f"{BASE_URL}/designer/boms/", bom_payload)
bom_id = bom_res.get('id') if bom_res else bom_no
records["BOM"] = bom_id

# 9. MRP (Material Requirements Planning)
mrp_no = f"MRP-FE-E2E-{SUFFIX}"
mrp_payload = {
    "requirementNumber": mrp_no,
    "requirement_number": mrp_no,
    "jobId": job_no,
    "bomId": bom_id,
    "itemCode": f"RM-SS-PLT-{SUFFIX}",
    "itemName": "SS-316L Plates 12mm Thk",
    "requiredQuantity": 10,
    "availableStock": 2,
    "shortageQuantity": 8,
    "procurementStatus": "Shortage Action Required"
}
mrp_res = execute_step("MRP", "POST", f"{BASE_URL}/material-requirements/", mrp_payload)
mrp_id = mrp_res.get('id') if mrp_res else mrp_no
records["MRP"] = mrp_id

# 10. Purchase Order (Procurement)
# Ensure supplier exists
sup_no = f"SUP-FE-E2E-{SUFFIX}"
sup_payload = {
    "supplierNumber": sup_no,
    "vendorName": f"Stainless Steels India Ltd {SUFFIX}",
    "name": f"Stainless Steels India Ltd {SUFFIX}",
    "gstin": "24AABCS9876E1Z2",
    "paymentTerms": "30 Days Credit"
}
sup_res = execute_step("Supplier", "POST", f"{BASE_URL}/suppliers/", sup_payload)
sup_id = sup_res.get('id') if sup_res else sup_no

po_no = f"PO-FE-E2E-{SUFFIX}"
po_payload = {
    "poNumber": po_no,
    "po_number": po_no,
    "supplierId": sup_id,
    "supplierName": f"Stainless Steels India Ltd {SUFFIX}",
    "jobId": job_no,
    "orderDate": datetime.now().date().isoformat(),
    "grandTotal": 280000,
    "grand_total": 280000,
    "status": "Approved",
    "items": [
        {
            "itemCode": f"RM-SS-PLT-{SUFFIX}",
            "itemName": "SS-316L Plates 12mm Thk",
            "quantity": 8,
            "unitPrice": 35000,
            "totalPrice": 280000
        }
    ]
}
po_res = execute_step("Purchase", "POST", f"{BASE_URL}/purchase-orders/", po_payload)
po_id = po_res.get('id') if po_res else po_no
records["Purchase"] = po_id

# 11. GRN (Goods Receipt Note)
grn_no = f"GRN-FE-E2E-{SUFFIX}"
grn_payload = {
    "grnNumber": grn_no,
    "grn_number": grn_no,
    "poId": po_id,
    "purchaseOrderNumber": po_no,
    "supplierId": sup_id,
    "supplierName": f"Stainless Steels India Ltd {SUFFIX}",
    "receiptDate": datetime.now().date().isoformat(),
    "status": "Received",
    "items": [
        {
            "itemCode": f"RM-SS-PLT-{SUFFIX}",
            "itemName": "SS-316L Plates 12mm Thk",
            "receivedQuantity": 8,
            "acceptedQuantity": 8,
            "rejectedQuantity": 0
        }
    ]
}
grn_res = execute_step("GRN", "POST", f"{BASE_URL}/grns/", grn_payload)
grn_id = grn_res.get('id') if grn_res else grn_no
records["GRN"] = grn_id

# 12. Material Issue (Store to Production)
iss_no = f"ISS-FE-E2E-{SUFFIX}"
iss_payload = {
    "issueNumber": iss_no,
    "issue_number": iss_no,
    "jobNumber": job_no,
    "issuedTo": "Fabrication Bay 2",
    "issueDate": datetime.now().date().isoformat(),
    "status": "Issued",
    "items": [
        {
            "itemCode": f"RM-SS-PLT-{SUFFIX}",
            "itemName": "SS-316L Plates 12mm Thk",
            "issuedQuantity": 8
        }
    ]
}
iss_res = execute_step("Material Issue", "POST", f"{BASE_URL}/material-issues/", iss_payload)
iss_id = iss_res.get('id') if iss_res else iss_no
records["Material Issue"] = iss_id

# 13. Production (Work Order / Manufacturing)
wo_no = f"WO-FE-E2E-{SUFFIX}"
wo_payload = {
    "workOrderNumber": wo_no,
    "work_order_number": wo_no,
    "jobNumber": job_no,
    "productName": "50KL SS-316L Acid Storage Vessel",
    "quantity": 1,
    "targetDate": datetime.now().date().isoformat(),
    "status": "Completed"
}
wo_res = execute_step("Production", "POST", f"{BASE_URL}/work-orders/", wo_payload)
wo_id = wo_res.get('id') if wo_res else wo_no
records["Production"] = wo_id

# 14. QC Inspection
qc_no = f"QC-FE-E2E-{SUFFIX}"
qc_payload = {
    "inspectionNumber": qc_no,
    "inspection_number": qc_no,
    "jobNumber": job_no,
    "referenceType": "Production",
    "referenceNumber": wo_no,
    "inspectorName": "QC Inspector",
    "result": "Passed",
    "status": "Approved"
}
qc_res = execute_step("QC", "POST", f"{BASE_URL}/qc-inspections/", qc_payload)
qc_id = qc_res.get('id') if qc_res else qc_no
records["QC"] = qc_id

# 15. Packing Order
pack_no = f"PACK-FE-E2E-{SUFFIX}"
pack_payload = {
    "packingNumber": pack_no,
    "packing_number": pack_no,
    "job_number": job_no,
    "jobNumber": job_no,
    "sales_order_number": so_no,
    "customer_name": f"Gujarat Apex Refinery {SUFFIX}",
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "product_name": "50KL SS-316L Acid Storage Vessel",
    "productName": "50KL SS-316L Acid Storage Vessel",
    "status": "Packed"
}
pack_res = execute_step("Packing", "POST", f"{BASE_URL}/packing-orders/", pack_payload)
pack_id = pack_res.get('id') if pack_res else pack_no
records["Packing"] = pack_id

# 16. Dispatch Order
dsp_no = f"DSP-FE-E2E-{SUFFIX}"
dsp_payload = {
    "dispatchNumber": dsp_no,
    "dispatch_number": dsp_no,
    "jobNumber": job_no,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "vehicleNumber": "GJ-06-AX-4422",
    "transporterName": "VRL Logistics",
    "dispatchDate": datetime.now().date().isoformat(),
    "status": "Dispatched"
}
dsp_res = execute_step("Dispatch", "POST", f"{BASE_URL}/dispatch-orders/", dsp_payload)
dsp_id = dsp_res.get('id') if dsp_res else dsp_no
records["Dispatch"] = dsp_id

# 17. Installation / Customer Machine
inst_no = f"INST-FE-E2E-{SUFFIX}"
inst_payload = {
    "machineName": "50KL Acid Storage Vessel Unit 1",
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "serialNumber": f"SN-{SUFFIX}-50KL",
    "installationDate": datetime.now().date().isoformat(),
    "commissioningDate": datetime.now().date().isoformat(),
    "status": "Commissioned"
}
inst_res = execute_step("Installation", "POST", f"{BASE_URL}/installations/", inst_payload)
inst_id = inst_res.get('id') if inst_res else inst_no
records["Installation"] = inst_id

# 18. Sales Invoice
inv_no = f"INV-FE-E2E-{SUFFIX}"
inv_payload = {
    "invoiceNumber": inv_no,
    "invoice_number": inv_no,
    "salesOrderNumber": so_no,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "invoiceDate": datetime.now().date().isoformat(),
    "dueDate": datetime.now().date().isoformat(),
    "subTotal": 1250000,
    "taxAmount": 225000,
    "totalAmount": 1475000,
    "grand_total": 1475000,
    "status": "Sent",
    "paymentStatus": "Partially_Paid"
}
inv_res = execute_step("Invoice", "POST", f"{BASE_URL}/sales-invoices/", inv_payload)
inv_id = inv_res.get('id') if inv_res else inv_no
records["Invoice"] = inv_id

# 19. Payment Receipt
pay_no = f"PAY-FE-E2E-{SUFFIX}"
pay_payload = {
    "receiptNumber": pay_no,
    "receipt_number": pay_no,
    "invoiceId": inv_id,
    "customerId": cust_id,
    "customerName": f"Gujarat Apex Refinery {SUFFIX}",
    "receiptDate": datetime.now().date().isoformat(),
    "amount": 750000,
    "paymentMode": "RTGS",
    "referenceNumber": f"RTGS-BARB-HDFC-{SUFFIX}",
    "status": "Approved"
}
pay_res = execute_step("Payment", "POST", f"{BASE_URL}/customer-receipts/", pay_payload)
pay_id = pay_res.get('id') if pay_res else pay_no
records["Payment"] = pay_id

print("\n" + "=" * 70)
print("E2E COMPLETE WORKFLOW EXECUTION SUMMARY:")
print("=" * 70)
all_pass = True
for step, rec_id in records.items():
    step_st = results.get(step, {}).get("status", "FAIL")
    if step_st != "PASS":
        all_pass = False
    print(f"{step:<16} : {rec_id:<26} [{step_st}]")

print("=" * 70)
print(f"FINAL E2E RESULT: {'100% PASS' if all_pass else 'FAILURES DETECTED'}")
print("=" * 70)

with open(r"D:\UMA ERP\ERP-Test-1\scripts\e2e_execution_report.json", "w", encoding="utf-8") as out:
    json.dump({
        "timestamp": datetime.now().isoformat(),
        "all_pass": all_pass,
        "records": records,
        "results": results
    }, out, indent=2)
