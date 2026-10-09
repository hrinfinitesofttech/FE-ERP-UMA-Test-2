import requests
import time
import sys

API_TOKEN = 'e023a655a10e258afcd2b8ff184bdc339fd4c30a'
USERNAME = 'erpUMA'
BASE_URL = f'https://www.pythonanywhere.com/api/v0/user/{USERNAME}'
headers = {'Authorization': f'Token {API_TOKEN}'}
CONSOLE_ID = 48520334

cmd = """/home/erpUMA/.virtualenvs/erp-venv/bin/python -c "from apps.authentication.models import User; u = User.objects.filter(username='admin').first(); 
if u:
    u.set_password('Admin@123456')
    u.save()
    print('ADMIN PASSWORD RESET SUCCESS!')
else:
    u = User.objects.create_superuser('admin', 'admin@example.com', 'Admin@123456')
    print('ADMIN CREATED SUCCESS!')
"
"""

requests.get(f'{BASE_URL}/consoles/{CONSOLE_ID}/get_latest_output/', headers=headers)
r = requests.post(f'{BASE_URL}/consoles/{CONSOLE_ID}/send_input/', headers=headers, json={'input': cmd})
print("Sent command, waiting 5s...")
time.sleep(5)
res = requests.get(f'{BASE_URL}/consoles/{CONSOLE_ID}/get_latest_output/', headers=headers)
print("CONSOLE OUTPUT:\n", res.json().get('output', ''))
