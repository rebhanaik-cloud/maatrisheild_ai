import os
import sys
import time
import json
import threading
import urllib.request
import urllib.error
import uvicorn

# Set test environment
os.environ['DATABASE_URL'] = 'sqlite:///./test_maatrishield.db'
os.environ['MAATRISHIELD_SECRET_KEY'] = 'test-secret-key-32-chars-long-for-tests-only'

from main import app

def run_server(server):
    server.run()

def api_request(base_url, path, method="GET", data=None, token=None):
    url = f"{base_url}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            code = resp.getcode()
            content = resp.read().decode("utf-8")
            return code, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        return e.code, json.loads(content) if content else {}

def main():
    config = uvicorn.Config(app, host="127.0.0.1", port=8005, log_level="warning")
    server = uvicorn.Server(config)
    t = threading.Thread(target=run_server, args=(server,), daemon=True)
    t.start()
    time.sleep(1.5)

    base = "http://127.0.0.1:8005"
    print("Testing backend endpoints against real HTTP server...")

    # 1. Health check
    code, res = api_request(base, "/api/health")
    assert code == 200, f"Health check failed: {code} {res}"
    assert res.get("status") == "ok", f"Health status not ok: {res}"
    print("✔ Health endpoint OK:", res)

    # 2. Register short password (should fail 400)
    code, res = api_request(base, "/api/auth/register", "POST", {"email": "short@example.com", "password": "123"})
    assert code == 422 or code == 400, f"Expected 400/422 for short password, got {code}"
    print("✔ Short password validation OK")

    # 3. Register user
    test_email = f"test_{int(time.time())}@example.com"
    code, res = api_request(base, "/api/auth/register", "POST", {"email": test_email, "password": "securepassword123"})
    assert code == 201, f"Register failed: {code} {res}"
    token = res["access_token"]
    assert token, "Token missing from register response"
    print("✔ Registration OK, token received")

    # 4. Duplicate registration (should fail 409)
    code, res = api_request(base, "/api/auth/register", "POST", {"email": test_email, "password": "securepassword123"})
    assert code == 409, f"Expected 409 for duplicate, got {code}"
    print("✔ Duplicate registration rejected with 409")

    # 5. Login wrong password (should fail 401)
    code, res = api_request(base, "/api/auth/login", "POST", {"email": test_email, "password": "wrongpassword"})
    assert code == 401, f"Expected 401 for bad password, got {code}"
    print("✔ Bad login rejected with 401")

    # 6. Login correct password
    code, res = api_request(base, "/api/auth/login", "POST", {"email": test_email, "password": "securepassword123"})
    assert code == 200, f"Login failed: {code} {res}"
    token = res["access_token"]
    print("✔ Login succeeded, token received")

    # 7. Get /api/me
    code, res = api_request(base, "/api/me", "GET", token=token)
    assert code == 200, f"Get /api/me failed: {code} {res}"
    assert res["email"] == test_email, f"Email mismatch: {res}"
    print("✔ /api/me returned current user:", res["email"])

    # 8. Save and Get Profile
    profile_data = {"name": "Test User", "ivf": True, "stage": "treatment", "completed": True}
    code, res = api_request(base, "/api/profile", "PUT", data=profile_data, token=token)
    assert code == 200, f"Save profile failed: {code} {res}"
    assert res["name"] == "Test User" and res["stage"] == "treatment"
    print("✔ Profile PUT succeeded:", res)

    code, res = api_request(base, "/api/profile", "GET", token=token)
    assert code == 200 and res["name"] == "Test User"
    print("✔ Profile GET verified:", res)

    # 9. Appointments: Past date rejected, then Create, List, Delete
    past_app = {"title": "Checkup", "appointment_at": "2020-01-01", "notes": "Past test"}
    code, res = api_request(base, "/api/appointments", "POST", data=past_app, token=token)
    assert code == 400, f"Expected 400 for past date, got {code}: {res}"
    print("✔ Past appointment date rejected with 400")

    app_data = {"title": "Fertility Consultation", "appointment_at": "2026-11-01", "notes": "Discuss bloodwork"}
    code, res = api_request(base, "/api/appointments", "POST", data=app_data, token=token)
    assert code == 201, f"Create appointment failed: {code} {res}"
    app_id = res["id"]
    print("✔ Appointment created with ID:", app_id)

    code, res = api_request(base, "/api/appointments", "GET", token=token)
    assert code == 200 and len(res) >= 1
    print("✔ Appointments listed:", len(res), "records")

    code, res = api_request(base, f"/api/appointments/{app_id}", "DELETE", token=token)
    assert code == 204
    print("✔ Appointment deleted successfully")

    # 10. Health Notes: Create, List, Delete
    note_data = {"category": "mood", "content": "Feeling optimistic today after check-in."}
    code, res = api_request(base, "/api/notes", "POST", data=note_data, token=token)
    assert code == 201, f"Create note failed: {code} {res}"
    note_id = res["id"]
    print("✔ Health note created with ID:", note_id)

    code, res = api_request(base, "/api/notes", "GET", token=token)
    assert code == 200 and len(res) >= 1
    print("✔ Health notes listed:", len(res), "records")

    code, res = api_request(base, f"/api/notes/{note_id}", "DELETE", token=token)
    assert code == 204
    print("✔ Health note deleted successfully")

    # 11. Assistant endpoint (general and urgent)
    code, res = api_request(base, "/api/assistant", "POST", data={"content": "What questions should I ask about IVF injections?"}, token=token)
    assert code == 200, f"Assistant failed: {code} {res}"
    assert "answer" in res and "clinical_disclaimer" in res
    print("✔ Assistant responded with guidance:", res["answer"][:60], "...")

    code, res = api_request(base, "/api/assistant", "POST", data={"content": "I have heavy bleeding and severe pain"}, token=token)
    assert code == 200
    assert "URGENT" in res["answer"]
    print("✔ Assistant detected urgent symptoms and prioritized emergency guidance")

    server.should_exit = True
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    main()
