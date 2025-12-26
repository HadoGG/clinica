#!/usr/bin/env python
import requests
import time

time.sleep(2)

try:
    # Get admin token
    r = requests.post('http://localhost:8000/api/auth/login/', json={'username': 'admin', 'password': 'Admin@1234'})
    token = r.json()['access']
    print('✓ Token obtained successfully')
    
    # Test Excel export
    print('\nTesting Excel export...')
    resp = requests.get('http://localhost:8000/api/settlements/export_excel/', headers={'Authorization': f'Bearer {token}'})
    if resp.status_code == 200:
        print(f'✓ Excel Status: {resp.status_code}')
        print(f'✓ Excel Size: {len(resp.content)} bytes')
    else:
        print(f'✗ Excel Status: {resp.status_code}')
        print(f'Error: {resp.text[:300]}')
    
    # Test PDF export
    print('\nTesting PDF export...')
    settlements_resp = requests.get('http://localhost:8000/api/settlements/', headers={'Authorization': f'Bearer {token}'})
    if settlements_resp.status_code == 200:
        results = settlements_resp.json().get('results', [])
        if len(results) > 0:
            settlement_id = results[0]['id']
            pdf_resp = requests.get(f'http://localhost:8000/api/settlements/{settlement_id}/export_pdf/', headers={'Authorization': f'Bearer {token}'})
            if pdf_resp.status_code == 200:
                print(f'✓ PDF Status: {pdf_resp.status_code}')
                print(f'✓ PDF Size: {len(pdf_resp.content)} bytes')
            else:
                print(f'✗ PDF Status: {pdf_resp.status_code}')
                print(f'Error: {pdf_resp.text[:300]}')
        else:
            print('No settlements found')
    else:
        print(f'✗ Failed to get settlements: {settlements_resp.status_code}')
        
except Exception as e:
    print(f'✗ Error: {str(e)}')
    import traceback
    traceback.print_exc()
