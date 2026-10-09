"""
MASTER INDEPENDENT PRODUCTION AUDIT RUNNER FOR UMAERP
Phase 1 through Phase 6 Ground-Truth Verification
"""

import sys
import os
import json
import time
import uuid
import sqlite3
import concurrent.futures
from datetime import datetime, timezone
import requests

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

BASE_URL = "https://erpuma.pythonanywhere.com/api"
LOCAL_DB_PATH = r"D:\UMA ERP\BE-ERP-UMA\db.sqlite3"
AUDIT_ID = f"FINAL-AUDIT-2026-{uuid.uuid4().hex[:6].upper()}"

results = {
    "audit_id": AUDIT_ID,
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "base_url": BASE_URL,
    "sections": {}
}

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# ---------------------------------------------------------
# 1. AUTHENTICATION & TOKEN ACQUISITION
# ---------------------------------------------------------
log("=== PHASE 1: AUTHENTICATION AUDIT ===")
auth_results = {}

# Test normal login
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "admin", "password": ""}, timeout=15)
auth_results["empty_password_bypass_status"] = login_res.status_code
auth_results["empty_password_bypass_vulnerable"] = (login_res.status_code == 200)

if login_res.status_code == 200:
    TOKEN = login_res.json().get("access")
    HEADERS = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    auth_results["token_obtained"] = True
    auth_results["token_length"] = len(TOKEN) if TOKEN else 0
else:
    auth_results["token_obtained"] = False
    log(f"FATAL: Could not obtain token: {login_res.status_code} {login_res.text}")
    sys.exit(1)

# Test unauthorized access to protected route
unauth_res = requests.get(f"{BASE_URL}/leads/", timeout=15)
auth_results["unauthorized_leads_status"] = unauth_res.status_code
auth_results["unauthorized_protection_active"] = (unauth_res.status_code in [401, 403])

# Test invalid token
bad_auth_res = requests.get(f"{BASE_URL}/leads/", headers={"Authorization": "Bearer invalid_token_xyz"}, timeout=15)
auth_results["invalid_token_status"] = bad_auth_res.status_code
auth_results["invalid_token_rejected"] = (bad_auth_res.status_code in [401, 403])

results["sections"]["authentication"] = auth_results
log(f"Auth Audit Complete. Empty Password Bypass Vulnerability: {auth_results['empty_password_bypass_vulnerable']}")

# ---------------------------------------------------------
# 2. ENDPOINT COVERAGE & HEALTH CHECK (127+ Endpoints)
# ---------------------------------------------------------
log("=== PHASE 2: LIVE API ROUTE COVERAGE AUDIT ===")
endpoints_to_test = [
    # Core & Org
    ("departments", "GET"),
    ("roles", "GET"),
    ("employees", "GET"),
    ("numbering", "GET"),
    ("audit-logs", "GET"),
    ("notifications", "GET"),
    ("company", "GET"),
    ("system/health", "GET"),
    
    # CRM
    ("leads", "GET"),
    ("customers", "GET"),
    ("contacts", "GET"),
    ("enquiries", "GET"),
    ("opportunities", "GET"),
    ("followups", "GET"),
    ("visits", "GET"),
    ("exhibitions", "GET"),
    ("quotations", "GET"),
    ("customer-pos", "GET"),
    ("sales-orders", "GET"),
    ("activities", "GET"),
    
    # Projects
    ("projects", "GET"),
    ("project-jobs", "GET"),
    ("planning-stages", "GET"),
    ("project-milestones", "GET"),
    ("project-tasks", "GET"),
    ("project-issues", "GET"),
    ("project-delays", "GET"),
    ("change-requests", "GET"),
    ("project-documents", "GET"),
    ("documents", "GET"),
    ("department-assignments", "GET"),
    ("project-costs", "GET"),
    
    # Design
    ("design-jobs", "GET"),
    ("design-tasks", "GET"),
    ("design-requirements", "GET"),
    ("customer-requirements", "GET"),
    ("drawings-2d", "GET"),
    ("models-3d", "GET"),
    ("assembly-drawings", "GET"),
    ("boms", "GET"),
    ("bom-headers", "GET"),
    ("design-revisions", "GET"),
    ("technical-documents", "GET"),
    ("design-documents", "GET"),
    
    # Purchase
    ("material-requirements", "GET"),
    ("mrp", "GET"),
    ("suppliers", "GET"),
    ("supplier-contacts", "GET"),
    ("purchase-requisitions", "GET"),
    ("indents", "GET"),
    ("rfqs", "GET"),
    ("supplier-quotations", "GET"),
    ("quotation-comparisons", "GET"),
    ("purchase-orders", "GET"),
    ("purchase-returns", "GET"),
    
    # Store
    ("item-categories", "GET"),
    ("uoms", "GET"),
    ("items", "GET"),
    ("warehouses", "GET"),
    ("warehouse-locations", "GET"),
    ("grns", "GET"),
    ("goods-receipt-notes", "GET"),
    ("qc-inspections", "GET"),
    ("stock", "GET"),
    ("stock-reservations", "GET"),
    ("material-issues", "GET"),
    ("material-returns", "GET"),
    ("stock-transfers", "GET"),
    ("stock-adjustments", "GET"),
    ("stock-ledger", "GET"),
    ("scrap", "GET"),
    
    # Production
    ("manufacturing-jobs", "GET"),
    ("production-plans", "GET"),
    ("work-centers", "GET"),
    ("routing-operations", "GET"),
    ("work-orders", "GET"),
    ("production-orders", "GET"),
    ("production-schedules", "GET"),
    ("production-entries", "GET"),
    ("wip-records", "GET"),
    ("production-holds", "GET"),
    ("rework-orders", "GET"),
    ("production-scraps", "GET"),
    ("finished-goods", "GET"),
    ("production-material-requests", "GET"),
    ("dispatch-orders", "GET"),
    ("dispatch", "GET"),
    ("packing-orders", "GET"),
    ("packing", "GET"),
    
    # Maintenance
    ("internal-assets", "GET"),
    ("customer-machines", "GET"),
    ("installations", "GET"),
    ("service-requests", "GET"),
    ("pm-plans", "GET"),
    ("breakdowns", "GET"),
    ("service-visits", "GET"),
    ("amc-contracts", "GET"),
    ("service-work-orders", "GET"),
    ("service-part-issues", "GET"),
    ("service-part-returns", "GET"),
    ("service-reports", "GET"),
    ("warranty-records", "GET"),
    ("service-contracts", "GET"),
    ("downtime-records", "GET"),
    
    # HR
    ("designations", "GET"),
    ("employee-documents", "GET"),
    ("shifts", "GET"),
    ("attendance-records", "GET"),
    ("leave-requests", "GET"),
    ("wfh-requests", "GET"),
    ("missed-punches", "GET"),
    ("regularizations", "GET"),
    ("overtime-records", "GET"),
    ("early-checkouts", "GET"),
    ("salary-components", "GET"),
    ("salary-structures", "GET"),
    ("payroll-records", "GET"),
    ("advance-loans", "GET"),
    ("reimbursements", "GET"),
    ("holidays", "GET"),
    ("employee-onboardings", "GET"),
    ("employee-transfers", "GET"),
    ("employee-promotions", "GET"),
    ("employee-exits", "GET"),
    ("employee-appraisals", "GET"),
    
    # Accounting
    ("financial-years", "GET"),
    ("chart-of-accounts", "GET"),
    ("taxes", "GET"),
    ("cost-centers", "GET"),
    ("sales-invoices", "GET"),
    ("purchase-invoices", "GET"),
    ("customer-receipts", "GET"),
    ("supplier-payments", "GET"),
    ("journal-entries", "GET"),
    ("job-costings", "GET"),
    ("credit-notes", "GET"),
    ("debit-notes", "GET"),
    ("bank-accounts", "GET"),
    ("contra-entries", "GET"),
    ("expenses", "GET"),
    ("fixed-assets", "GET"),
    
    # Integration
    ("approvals", "GET"),
    ("alerts", "GET"),
]

endpoint_results = []
unexpected_404 = 0
unexpected_500 = 0
unexpected_403 = 0
latencies = []

for ep, method in endpoints_to_test:
    url = f"{BASE_URL}/{ep}/"
    t0 = time.time()
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        dt = round((time.time() - t0) * 1000, 2)
        latencies.append(dt)
        status_ok = r.status_code in [200, 204]
        if r.status_code == 404:
            unexpected_404 += 1
        elif r.status_code >= 500:
            unexpected_500 += 1
        elif r.status_code == 403:
            unexpected_403 += 1
            
        endpoint_results.append({
            "endpoint": ep,
            "method": method,
            "status_code": r.status_code,
            "latency_ms": dt,
            "ok": status_ok,
            "record_count": len(r.json().get("results", r.json())) if status_ok and isinstance(r.json(), (list, dict)) else 0
        })
    except Exception as ex:
        endpoint_results.append({
            "endpoint": ep,
            "method": method,
            "status_code": "ERROR",
            "error": str(ex),
            "ok": False
        })
        unexpected_500 += 1

avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0
p95_latency = round(sorted(latencies)[int(len(latencies) * 0.95)], 2) if latencies else 0

results["sections"]["endpoint_coverage"] = {
    "total_tested": len(endpoints_to_test),
    "passed": sum(1 for e in endpoint_results if e.get("ok")),
    "failed": sum(1 for e in endpoint_results if not e.get("ok")),
    "unexpected_404": unexpected_404,
    "unexpected_500": unexpected_500,
    "unexpected_403": unexpected_403,
    "avg_latency_ms": avg_latency,
    "p95_latency_ms": p95_latency,
    "details": endpoint_results
}
log(f"Endpoint Coverage: {results['sections']['endpoint_coverage']['passed']}/{len(endpoints_to_test)} passed. 404: {unexpected_404}, 500: {unexpected_500}, 403: {unexpected_403}, Avg Latency: {avg_latency}ms")

# Save initial results
with open(r"D:\UMA ERP\ERP-Test-1\scripts\audit_run_checkpoint.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

log("Initial checkpoint saved.")
