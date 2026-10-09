import os
import re
import json
import sys
import requests

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "https://erpuma.pythonanywhere.com/api"
API_CLIENT_PATH = r"D:\UMA ERP\ERP-Test-1\src\lib\apiClient.ts"

with open(API_CLIENT_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Match endpoints in apiClient.ts: request<any>('/endpoint'), etc.
pattern = re.compile(r'request(?:<[^>]*>)?\([`\'"](/[^`\'"?$]+)')
found = pattern.findall(content)

# Clean and normalize base endpoints (strip IDs)
clean_endpoints = set()
for ep in found:
    # replace ${id} or similar dynamic path segments with base
    base = ep.split('${')[0].strip()
    if base.endswith('/'):
        clean_endpoints.add(base)
    else:
        # e.g. /leads/123/ -> /leads/
        parts = [p for p in base.split('/') if p]
        if parts:
            clean_endpoints.add(f"/{parts[0]}/")

endpoints = sorted(list(clean_endpoints))

print(f"Found {len(endpoints)} unique static base endpoints in apiClient.ts")

# 1. Authenticate with live backend
token = None
try:
    r_auth = requests.post(f"{BASE_URL}/auth/login/", json={"username": "admin", "password": "admin123"}, timeout=15)
    if r_auth.status_code == 200:
        token = r_auth.json().get('access')
        print(f"[AUTH] Successfully authenticated! JWT Token acquired.")
    else:
        print(f"[AUTH WARNING] Login returned status {r_auth.status_code}: {r_auth.text[:100]}")
except Exception as e:
    print(f"[AUTH ERROR] Failed to connect for authentication: {e}")

headers = {'Authorization': f'Bearer {token}'} if token else {}

results = []
missing_404 = []
errors_500 = []
healthy_200 = []

for idx, ep in enumerate(endpoints, 1):
    url = f"{BASE_URL}{ep}"
    if not url.endswith('/'):
        url += '/'
    
    try:
        r = requests.get(url, headers=headers, timeout=12)
        status = r.status_code
        is_json = 'json' in r.headers.get('Content-Type', '')
        item_count = None
        if status == 200 and is_json:
            try:
                data = r.json()
                if isinstance(data, list):
                    item_count = len(data)
                elif isinstance(data, dict):
                    if 'results' in data and isinstance(data['results'], list):
                        item_count = len(data['results'])
                    else:
                        item_count = len(data.keys())
            except Exception:
                pass

        record = {
            "endpoint": ep,
            "url": url,
            "status_code": status,
            "is_json": is_json,
            "item_count": item_count,
            "error": None if status in [200, 401] else r.text[:150]
        }
        results.append(record)

        if status == 200:
            healthy_200.append(ep)
            print(f"[{idx:02d}/{len(endpoints)}] 200 OK       {ep} (Items: {item_count})")
        elif status == 404:
            missing_404.append(ep)
            print(f"[{idx:02d}/{len(endpoints)}] 404 NOT FOUND {ep}")
        elif status == 401:
            print(f"[{idx:02d}/{len(endpoints)}] 401 AUTH REQ  {ep}")
        elif status >= 500:
            errors_500.append(ep)
            print(f"[{idx:02d}/{len(endpoints)}] {status} SERVER ERR {ep}")
        else:
            print(f"[{idx:02d}/{len(endpoints)}] {status} STATUS     {ep}")

    except Exception as e:
        results.append({
            "endpoint": ep,
            "url": url,
            "status_code": 0,
            "error": str(e)
        })
        print(f"[{idx:02d}/{len(endpoints)}] EXC           {ep} ({e})")

print("\n" + "=" * 70)
print(f"LIVE API AUDIT SUMMARY:")
print(f"Total Endpoints Tested: {len(endpoints)}")
print(f"Healthy (200 OK)      : {len(healthy_200)}")
print(f"Missing (404)         : {len(missing_404)}")
print(f"Server Errors (500)   : {len(errors_500)}")
print("=" * 70)

if missing_404:
    print("\nMISSING 404 ENDPOINTS:")
    for ep in missing_404:
        print(f"  - {ep}")

with open(r"D:\UMA ERP\ERP-Test-1\scripts\api_audit_results.json", "w", encoding="utf-8") as out:
    json.dump({
        "total": len(endpoints),
        "healthy_count": len(healthy_200),
        "missing_count": len(missing_404),
        "error_count": len(errors_500),
        "missing_endpoints": missing_404,
        "error_endpoints": errors_500,
        "results": results
    }, out, indent=2)
