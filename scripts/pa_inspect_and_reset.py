import requests
import time
import sys

API_TOKEN = 'e023a655a10e258afcd2b8ff184bdc339fd4c30a'
USERNAME = 'erpUMA'
BASE_URL = f'https://www.pythonanywhere.com/api/v0/user/{USERNAME}'
headers = {'Authorization': f'Token {API_TOKEN}'}
CONSOLE_ID = 48520334

def run_bash(cmd, timeout=60):
    marker = f"__DONE_{int(time.time())}__"
    full_cmd = f"{cmd}; echo {marker} $?\n"
    print(f"\n>>> Running: {cmd}")
    
    # Drain existing output
    requests.get(f'{BASE_URL}/consoles/{CONSOLE_ID}/get_latest_output/', headers=headers)
    
    r = requests.post(f'{BASE_URL}/consoles/{CONSOLE_ID}/send_input/', headers=headers, json={'input': full_cmd})
    if r.status_code != 200:
        raise Exception(f"Failed to send input: {r.status_code} {r.text}")
    
    start_time = time.time()
    accumulated_output = ""
    
    while time.time() - start_time < timeout:
        time.sleep(2)
        r = requests.get(f'{BASE_URL}/consoles/{CONSOLE_ID}/get_latest_output/', headers=headers)
        if r.status_code == 200:
            out = r.json().get('output', '')
            if out:
                sys.stdout.write(out)
                sys.stdout.flush()
                accumulated_output += out
                if marker in accumulated_output:
                    parts = accumulated_output.split(marker)
                    exit_code_str = parts[-1].strip().split()[0] if parts[-1].strip() else "0"
                    print(f"\n[Finished with exit code: {exit_code_str}]")
                    return accumulated_output
    print("\n[Command timed out!]")
    return accumulated_output

if __name__ == '__main__':
    script = """/home/erpUMA/.virtualenvs/erp-venv/bin/python /home/erpUMA/BE-ERP-UMA/manage.py shell -c "from apps.authentication.models import User; print('EXISTING USERS:', [(u.username, u.email, u.is_superuser, u.is_active) for u in User.objects.all()]); u = User.objects.filter(username='admin').first(); (u.set_password('Admin@123456'), u.save(), print('SUCCESS: Admin password set to Admin@123456')) if u else (User.objects.create_superuser('admin', 'admin@example.com', 'Admin@123456'), print('SUCCESS: Admin created with Admin@123456'))" """
    run_bash(script)
