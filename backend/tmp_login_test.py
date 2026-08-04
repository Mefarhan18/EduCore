import requests
payload = {"username": "admin", "password": "admin123"}
resp = requests.post('http://localhost:8080/api/auth/login', json=payload, timeout=10)
print(resp.status_code)
print(resp.text)
