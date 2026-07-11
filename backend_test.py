#!/usr/bin/env python3
"""
Phase 2 Chunk A Backend Testing
Tests JWT auth + production data parity for Noir Hamburg migration
"""
import os
import requests
import json
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://noir-migration.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Admin credentials (real, restored from production dump)
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Test results tracking
test_results = []

def log_test(section: str, test_num: int, description: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} | Section {section} | Test {test_num}: {description}"
    if details:
        result += f"\n    Details: {details}"
    test_results.append((passed, result))
    print(result)

def check_no_id_field(data: Any, path: str = "") -> bool:
    """Recursively check that no _id field exists in response"""
    if isinstance(data, dict):
        if '_id' in data:
            return False
        return all(check_no_id_field(v, f"{path}.{k}") for k, v in data.items())
    elif isinstance(data, list):
        return all(check_no_id_field(item, f"{path}[{i}]") for i, item in enumerate(data))
    return True

def check_cookie_header(response: requests.Response, cookie_name: str, should_exist: bool = True) -> tuple[bool, str]:
    """Check if Set-Cookie header is present and valid"""
    set_cookie = response.headers.get('Set-Cookie', '')
    if should_exist:
        if cookie_name not in set_cookie:
            return False, f"Set-Cookie header missing {cookie_name}"
        if 'HttpOnly' not in set_cookie:
            return False, "Set-Cookie missing HttpOnly flag"
        if 'Path=/' not in set_cookie:
            return False, "Set-Cookie missing Path=/"
        if 'Max-Age' not in set_cookie:
            return False, "Set-Cookie missing Max-Age"
        return True, "Cookie header valid"
    else:
        # Should not set cookie
        if cookie_name in set_cookie and 'Max-Age=0' not in set_cookie:
            return False, f"Unexpected Set-Cookie for {cookie_name}"
        return True, "No cookie set as expected"

print("="*80)
print("PHASE 2 CHUNK A BACKEND TESTING")
print(f"Base URL: {BASE_URL}")
print(f"API Base: {API_BASE}")
print("="*80)

# ===== Section 1: Data-parity (verify production dump is loaded via the API) =====
print("\n" + "="*80)
print("SECTION 1: DATA-PARITY (Production Dump Verification)")
print("="*80)

# Test 1: GET /api/settings
try:
    resp = requests.get(f"{API_BASE}/settings", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        required_fields = ['business_name', 'phone', 'email', 'hours_de', 'hours_en', 
                          'homepage_hero_image', 'area_images', 'about_image', 'escort_hamburg_image']
        missing = [f for f in required_fields if f not in data]
        has_correct_email = data.get('email') == 'kontakt@noir-hamburg.de'
        no_id = check_no_id_field(data)
        
        if missing:
            passed = False
            details = f"Missing fields: {missing}"
        elif not has_correct_email:
            passed = False
            details = f"Wrong email: {data.get('email')} (expected kontakt@noir-hamburg.de)"
        elif not no_id:
            passed = False
            details = "_id field found in response"
        else:
            details = f"All fields present, email={data.get('email')}, no _id"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("1", 1, "GET /api/settings → 200 with real production fields", passed, details)
except Exception as e:
    log_test("1", 1, "GET /api/settings", False, f"Exception: {str(e)}")

# Test 2: GET /api/models
try:
    resp = requests.get(f"{API_BASE}/models", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        count = len(data)
        if count != 14:
            passed = False
            details = f"Expected 14 models, got {count}"
        else:
            # Check structure
            required_fields = ['slug', 'name', 'age', 'height_cm', 'cover_image', 'gallery']
            sample = data[0] if data else {}
            missing = [f for f in required_fields if f not in sample]
            has_aurelia = any(m.get('slug') == 'aurelia' for m in data)
            no_id = all(check_no_id_field(m) for m in data)
            
            if missing:
                passed = False
                details = f"Missing fields in model: {missing}"
            elif not has_aurelia:
                passed = False
                details = "Expected model with slug='aurelia' not found"
            elif not no_id:
                passed = False
                details = "_id field found in models"
            else:
                details = f"14 models, all fields present, aurelia found, no _id"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("1", 2, "GET /api/models → 200 with exactly 14 models", passed, details)
except Exception as e:
    log_test("1", 2, "GET /api/models", False, f"Exception: {str(e)}")

# Test 3: GET /api/blog
try:
    resp = requests.get(f"{API_BASE}/blog", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        count = len(data)
        if count != 13:
            passed = False
            details = f"Expected 13 posts, got {count}"
        else:
            required_fields = ['slug', 'category', 'cover_image', 'excerpt', 'content', 'published']
            sample = data[0] if data else {}
            missing = [f for f in required_fields if f not in sample]
            all_published = all(m.get('published') == True for m in data)
            no_id = all(check_no_id_field(m) for m in data)
            
            if missing:
                passed = False
                details = f"Missing fields in post: {missing}"
            elif not all_published:
                passed = False
                details = "Not all posts have published=true"
            elif not no_id:
                passed = False
                details = "_id field found in posts"
            else:
                details = f"13 posts, all fields present, all published=true, no _id"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("1", 3, "GET /api/blog → 200 with exactly 13 posts", passed, details)
except Exception as e:
    log_test("1", 3, "GET /api/blog", False, f"Exception: {str(e)}")

# Test 4: GET /api/pages
try:
    resp = requests.get(f"{API_BASE}/pages", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        count = len(data)
        if count != 3:
            passed = False
            details = f"Expected 3 pages, got {count}"
        else:
            expected_slugs = [
                'diskretion-und-datenschutz-noir-hamburg',
                'professionelle-standards-noir-hamburg',
                'so-funktioniert-eine-buchung-noir-hamburg'
            ]
            actual_slugs = [p.get('slug') for p in data]
            missing_slugs = [s for s in expected_slugs if s not in actual_slugs]
            no_id = all(check_no_id_field(p) for p in data)
            
            if missing_slugs:
                passed = False
                details = f"Missing expected slugs: {missing_slugs}"
            elif not no_id:
                passed = False
                details = "_id field found in pages"
            else:
                details = f"3 pages with expected slugs, no _id"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("1", 4, "GET /api/pages → 200 with exactly 3 pages", passed, details)
except Exception as e:
    log_test("1", 4, "GET /api/pages", False, f"Exception: {str(e)}")

# Test 5: GET /api/service-content and /api/area-content counts
try:
    resp_svc = requests.get(f"{API_BASE}/service-content", timeout=10)
    resp_area = requests.get(f"{API_BASE}/area-content", timeout=10)
    
    passed = resp_svc.status_code == 200 and resp_area.status_code == 200
    if passed:
        svc_data = resp_svc.json()
        area_data = resp_area.json()
        svc_count = len(svc_data)
        area_count = len(area_data)
        
        if svc_count != 8:
            passed = False
            details = f"Expected 8 services, got {svc_count}"
        elif area_count != 18:
            passed = False
            details = f"Expected 18 areas, got {area_count}"
        else:
            details = f"service-content: 8, area-content: 18"
    else:
        details = f"service-content: {resp_svc.status_code}, area-content: {resp_area.status_code}"
    log_test("1", 5, "GET /api/service-content and /api/area-content → 8 and 18", passed, details)
except Exception as e:
    log_test("1", 5, "GET /api/service-content and /api/area-content", False, f"Exception: {str(e)}")

# ===== Section 2: Auth happy path =====
print("\n" + "="*80)
print("SECTION 2: AUTH HAPPY PATH")
print("="*80)

session = requests.Session()

# Test 6: POST /api/auth/login with correct credentials
try:
    resp = session.post(f"{API_BASE}/auth/login", 
                       json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                       timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        user = data.get('user', {})
        
        # Check user fields
        has_email = user.get('email') == ADMIN_EMAIL
        has_role = user.get('role') == 'admin'
        has_name = 'name' in user
        has_password_hash = 'password_hash' in user
        
        # Check cookie
        cookie_ok, cookie_msg = check_cookie_header(resp, 'access_token', should_exist=True)
        
        if not has_email:
            passed = False
            details = f"Wrong email in response: {user.get('email')}"
        elif not has_role:
            passed = False
            details = f"Wrong role: {user.get('role')}"
        elif has_password_hash:
            passed = False
            details = "password_hash field present in response (should be excluded)"
        elif not cookie_ok:
            passed = False
            details = cookie_msg
        else:
            details = f"Login successful, user={user.get('email')}, role={user.get('role')}, cookie set"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("2", 6, "POST /api/auth/login with correct credentials → 200 + cookie", passed, details)
except Exception as e:
    log_test("2", 6, "POST /api/auth/login", False, f"Exception: {str(e)}")

# Test 7: GET /api/auth/me with cookie
try:
    resp = session.get(f"{API_BASE}/auth/me", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        user = data.get('user', {})
        has_email = user.get('email') == ADMIN_EMAIL
        has_password_hash = 'password_hash' in user
        
        if not has_email:
            passed = False
            details = f"Wrong email: {user.get('email')}"
        elif has_password_hash:
            passed = False
            details = "password_hash field present (should be excluded)"
        else:
            details = f"User retrieved: {user.get('email')}, role={user.get('role')}"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("2", 7, "GET /api/auth/me with cookie → 200", passed, details)
except Exception as e:
    log_test("2", 7, "GET /api/auth/me", False, f"Exception: {str(e)}")

# Test 8: POST /api/auth/logout
try:
    resp = session.post(f"{API_BASE}/auth/logout", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        has_ok = data.get('ok') == True
        
        # Check cookie is cleared
        set_cookie = resp.headers.get('Set-Cookie', '')
        cookie_cleared = 'access_token' in set_cookie and 'Max-Age=0' in set_cookie
        
        if not has_ok:
            passed = False
            details = f"Response missing ok:true"
        elif not cookie_cleared:
            passed = False
            details = "Cookie not cleared (Max-Age=0 not found)"
        else:
            details = "Logout successful, cookie cleared"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("2", 8, "POST /api/auth/logout → 200 + cookie cleared", passed, details)
except Exception as e:
    log_test("2", 8, "POST /api/auth/logout", False, f"Exception: {str(e)}")

# Test 9: GET /api/auth/me after logout (should fail)
try:
    resp = session.get(f"{API_BASE}/auth/me", timeout=10)
    passed = resp.status_code == 401
    if passed:
        data = resp.json()
        has_detail = 'detail' in data
        correct_msg = data.get('detail') == 'Not authenticated'
        if not correct_msg:
            passed = False
            details = f"Wrong error message: {data.get('detail')}"
        else:
            details = "401 with 'Not authenticated' as expected"
    else:
        details = f"Expected 401, got {resp.status_code}: {resp.text[:200]}"
    log_test("2", 9, "GET /api/auth/me after logout → 401", passed, details)
except Exception as e:
    log_test("2", 9, "GET /api/auth/me after logout", False, f"Exception: {str(e)}")

# ===== Section 3: Auth failures =====
print("\n" + "="*80)
print("SECTION 3: AUTH FAILURES")
print("="*80)

# Test 10: POST /api/auth/login with wrong password
try:
    resp = requests.post(f"{API_BASE}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": "WrongPassword123!"},
                        timeout=10)
    passed = resp.status_code == 401
    if passed:
        data = resp.json()
        correct_msg = data.get('detail') == 'Invalid credentials'
        
        # Check no cookie is set
        set_cookie = resp.headers.get('Set-Cookie', '')
        no_cookie = 'access_token' not in set_cookie or 'Max-Age=0' in set_cookie
        
        if not correct_msg:
            passed = False
            details = f"Wrong error message: {data.get('detail')}"
        elif not no_cookie:
            passed = False
            details = "Cookie was set (should not be)"
        else:
            details = "401 with 'Invalid credentials', no cookie set"
    else:
        details = f"Expected 401, got {resp.status_code}: {resp.text[:200]}"
    log_test("3", 10, "POST /api/auth/login with wrong password → 401", passed, details)
except Exception as e:
    log_test("3", 10, "POST /api/auth/login wrong password", False, f"Exception: {str(e)}")

# Test 11: POST /api/auth/login with unknown email
try:
    resp = requests.post(f"{API_BASE}/auth/login",
                        json={"email": "unknown@example.com", "password": "SomePassword123!"},
                        timeout=10)
    passed = resp.status_code == 401
    if passed:
        data = resp.json()
        correct_msg = data.get('detail') == 'Invalid credentials'
        
        if not correct_msg:
            passed = False
            details = f"Wrong error message: {data.get('detail')} (should be 'Invalid credentials' to prevent user enumeration)"
        else:
            details = "401 with 'Invalid credentials' (no user enumeration)"
    else:
        details = f"Expected 401, got {resp.status_code}: {resp.text[:200]}"
    log_test("3", 11, "POST /api/auth/login with unknown email → 401", passed, details)
except Exception as e:
    log_test("3", 11, "POST /api/auth/login unknown email", False, f"Exception: {str(e)}")

# Test 12: POST /api/auth/login with missing fields
try:
    resp = requests.post(f"{API_BASE}/auth/login", json={}, timeout=10)
    passed = resp.status_code == 400
    if passed:
        data = resp.json()
        correct_msg = data.get('detail') == 'Email and password required'
        
        if not correct_msg:
            passed = False
            details = f"Wrong error message: {data.get('detail')}"
        else:
            details = "400 with 'Email and password required'"
    else:
        details = f"Expected 400, got {resp.status_code}: {resp.text[:200]}"
    log_test("3", 12, "POST /api/auth/login with missing fields → 400", passed, details)
except Exception as e:
    log_test("3", 12, "POST /api/auth/login missing fields", False, f"Exception: {str(e)}")

# Test 13: GET /api/auth/me without cookie
try:
    resp = requests.get(f"{API_BASE}/auth/me", timeout=10)
    passed = resp.status_code == 401
    if passed:
        details = "401 as expected"
    else:
        details = f"Expected 401, got {resp.status_code}: {resp.text[:200]}"
    log_test("3", 13, "GET /api/auth/me without cookie → 401", passed, details)
except Exception as e:
    log_test("3", 13, "GET /api/auth/me without cookie", False, f"Exception: {str(e)}")

# Test 14: GET /api/auth/me with garbage cookie
try:
    resp = requests.get(f"{API_BASE}/auth/me", 
                       cookies={"access_token": "notavalidjwt"},
                       timeout=10)
    passed = resp.status_code == 401
    if passed:
        details = "401 as expected"
    else:
        details = f"Expected 401, got {resp.status_code}: {resp.text[:200]}"
    log_test("3", 14, "GET /api/auth/me with garbage cookie → 401", passed, details)
except Exception as e:
    log_test("3", 14, "GET /api/auth/me garbage cookie", False, f"Exception: {str(e)}")

# ===== Section 4: change-password (destructive — must rotate back) =====
print("\n" + "="*80)
print("SECTION 4: CHANGE-PASSWORD (Destructive - Must Rotate Back)")
print("="*80)

# Test 15: Login again (fresh cookie)
session2 = requests.Session()
try:
    resp = session2.post(f"{API_BASE}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                        timeout=10)
    passed = resp.status_code == 200
    if passed:
        details = "Fresh login successful"
    else:
        details = f"Login failed: {resp.status_code}: {resp.text[:200]}"
    log_test("4", 15, "Login again (fresh cookie)", passed, details)
except Exception as e:
    log_test("4", 15, "Login again", False, f"Exception: {str(e)}")

# Test 16: POST /api/auth/change-password without cookie
try:
    resp = requests.post(f"{API_BASE}/auth/change-password",
                        json={"current_password": ADMIN_PASSWORD, "new_password": "NewPass123!"},
                        timeout=10)
    passed = resp.status_code == 401
    if passed:
        data = resp.json()
        correct_msg = data.get('detail') == 'Not authenticated'
        if not correct_msg:
            passed = False
            details = f"Wrong error message: {data.get('detail')}"
        else:
            details = "401 with 'Not authenticated'"
    else:
        details = f"Expected 401, got {resp.status_code}: {resp.text[:200]}"
    log_test("4", 16, "POST /api/auth/change-password without cookie → 401", passed, details)
except Exception as e:
    log_test("4", 16, "POST /api/auth/change-password without cookie", False, f"Exception: {str(e)}")

# Test 17: POST /api/auth/change-password with wrong current_password
try:
    resp = session2.post(f"{API_BASE}/auth/change-password",
                         json={"current_password": "WrongCurrent123!", "new_password": "NewPass123!"},
                         timeout=10)
    passed = resp.status_code == 400
    if passed:
        data = resp.json()
        correct_msg = data.get('detail') == 'Current password is incorrect'
        if not correct_msg:
            passed = False
            details = f"Wrong error message: {data.get('detail')}"
        else:
            details = "400 with 'Current password is incorrect'"
    else:
        details = f"Expected 400, got {resp.status_code}: {resp.text[:200]}"
    log_test("4", 17, "POST /api/auth/change-password with wrong current_password → 400", passed, details)
except Exception as e:
    log_test("4", 17, "POST /api/auth/change-password wrong current", False, f"Exception: {str(e)}")

# Test 18: POST /api/auth/change-password with new_password too short
try:
    resp = session2.post(f"{API_BASE}/auth/change-password",
                         json={"current_password": ADMIN_PASSWORD, "new_password": "short"},
                         timeout=10)
    passed = resp.status_code == 400
    if passed:
        data = resp.json()
        has_detail = 'detail' in data
        mentions_short = 'short' in data.get('detail', '').lower() or '8' in data.get('detail', '')
        if not mentions_short:
            passed = False
            details = f"Error message doesn't mention length: {data.get('detail')}"
        else:
            details = f"400 with length validation: {data.get('detail')}"
    else:
        details = f"Expected 400, got {resp.status_code}: {resp.text[:200]}"
    log_test("4", 18, "POST /api/auth/change-password with short password → 400", passed, details)
except Exception as e:
    log_test("4", 18, "POST /api/auth/change-password short password", False, f"Exception: {str(e)}")

# Test 19: POST /api/auth/change-password valid rotation to TestingRotation2026!
TEMP_PASSWORD = "TestingRotation2026!"
try:
    resp = session2.post(f"{API_BASE}/auth/change-password",
                         json={"current_password": ADMIN_PASSWORD, "new_password": TEMP_PASSWORD},
                         timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        has_ok = data.get('ok') == True
        if not has_ok:
            passed = False
            details = "Response missing ok:true"
        else:
            details = f"Password changed to {TEMP_PASSWORD}"
    else:
        details = f"Expected 200, got {resp.status_code}: {resp.text[:200]}"
    log_test("4", 19, "POST /api/auth/change-password valid rotation → 200", passed, details)
except Exception as e:
    log_test("4", 19, "POST /api/auth/change-password valid rotation", False, f"Exception: {str(e)}")

# Test 20: POST /api/auth/login with TestingRotation2026!
try:
    resp = requests.post(f"{API_BASE}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": TEMP_PASSWORD},
                        timeout=10)
    passed = resp.status_code == 200
    if passed:
        details = "Login with new password successful (rotation persisted)"
    else:
        details = f"Login failed: {resp.status_code}: {resp.text[:200]}"
    log_test("4", 20, "POST /api/auth/login with TestingRotation2026! → 200", passed, details)
    
    # Store session for rotation back
    if passed:
        session3 = requests.Session()
        session3.cookies.update(resp.cookies)
except Exception as e:
    log_test("4", 20, "POST /api/auth/login with new password", False, f"Exception: {str(e)}")

# Test 21: CRITICAL — rotate back to NoirAdmin2026!
try:
    # Use session3 from test 20
    resp = session3.post(f"{API_BASE}/auth/change-password",
                         json={"current_password": TEMP_PASSWORD, "new_password": ADMIN_PASSWORD},
                         timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        has_ok = data.get('ok') == True
        if not has_ok:
            passed = False
            details = "⚠️ CRITICAL: Response missing ok:true - password may not be restored!"
        else:
            details = f"✅ CRITICAL: Password restored to {ADMIN_PASSWORD}"
    else:
        details = f"⚠️ CRITICAL: Failed to restore password! Status {resp.status_code}: {resp.text[:200]}"
    log_test("4", 21, "CRITICAL: Rotate back to NoirAdmin2026! → 200", passed, details)
except Exception as e:
    log_test("4", 21, "CRITICAL: Rotate back", False, f"⚠️ CRITICAL EXCEPTION: {str(e)}")

# Test 22: Final verification: POST /api/auth/login with NoirAdmin2026!
try:
    resp = requests.post(f"{API_BASE}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                        timeout=10)
    passed = resp.status_code == 200
    if passed:
        details = "✅ CRITICAL: Login with original password successful - NOT LOCKED OUT"
    else:
        details = f"⚠️⚠️⚠️ CRITICAL FAILURE: LOCKED OUT! Status {resp.status_code}: {resp.text[:200]}"
    log_test("4", 22, "CRITICAL: Final verification login with NoirAdmin2026! → 200", passed, details)
except Exception as e:
    log_test("4", 22, "CRITICAL: Final verification", False, f"⚠️⚠️⚠️ CRITICAL EXCEPTION: {str(e)}")

# ===== Section 5: Regression on Phase 1 endpoints =====
print("\n" + "="*80)
print("SECTION 5: REGRESSION ON PHASE 1 ENDPOINTS")
print("="*80)

# Test 23: GET /api/health, /api/service-content, /api/service-content/vip-escort-hamburg
try:
    resp_health = requests.get(f"{API_BASE}/health", timeout=10)
    resp_svc_list = requests.get(f"{API_BASE}/service-content", timeout=10)
    resp_svc_single = requests.get(f"{API_BASE}/service-content/vip-escort-hamburg", timeout=10)
    
    passed = (resp_health.status_code == 200 and 
              resp_svc_list.status_code == 200 and 
              resp_svc_single.status_code == 200)
    
    if passed:
        health_data = resp_health.json()
        svc_list_data = resp_svc_list.json()
        svc_single_data = resp_svc_single.json()
        
        health_ok = health_data.get('status') == 'ok'
        svc_list_ok = len(svc_list_data) == 8
        svc_single_ok = svc_single_data.get('slug') == 'vip-escort-hamburg'
        
        if not health_ok:
            passed = False
            details = f"Health check failed: {health_data}"
        elif not svc_list_ok:
            passed = False
            details = f"Service list wrong count: {len(svc_list_data)}"
        elif not svc_single_ok:
            passed = False
            details = f"Service single wrong slug: {svc_single_data.get('slug')}"
        else:
            details = "All Phase 1 endpoints still working"
    else:
        details = f"Status codes: health={resp_health.status_code}, svc_list={resp_svc_list.status_code}, svc_single={resp_svc_single.status_code}"
    log_test("5", 23, "Phase 1 endpoints regression check → all 200", passed, details)
except Exception as e:
    log_test("5", 23, "Phase 1 endpoints regression", False, f"Exception: {str(e)}")

# Test 24: GET /sitemap.xml and /robots.txt
try:
    resp_sitemap = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
    resp_robots = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
    
    passed = resp_sitemap.status_code == 200 and resp_robots.status_code == 200
    
    if passed:
        sitemap_valid = '<?xml' in resp_sitemap.text and '<urlset' in resp_sitemap.text
        robots_valid = 'Allow: /' in resp_robots.text and 'Disallow: /admin' in resp_robots.text
        
        if not sitemap_valid:
            passed = False
            details = "Sitemap XML invalid"
        elif not robots_valid:
            passed = False
            details = "Robots.txt invalid"
        else:
            details = "Sitemap and robots.txt still valid"
    else:
        details = f"Status codes: sitemap={resp_sitemap.status_code}, robots={resp_robots.status_code}"
    log_test("5", 24, "GET /sitemap.xml and /robots.txt → still valid", passed, details)
except Exception as e:
    log_test("5", 24, "Sitemap and robots.txt", False, f"Exception: {str(e)}")

# Test 25: GET /api/sitemap/status
try:
    resp = requests.get(f"{API_BASE}/sitemap/status", timeout=10)
    passed = resp.status_code == 200
    if passed:
        data = resp.json()
        expected = {'services': 8, 'areas': 18, 'models': 14, 'blog': 13, 'pages': 3}
        matches = all(data.get(k) == v for k, v in expected.items())
        
        if not matches:
            passed = False
            details = f"Counts mismatch. Expected {expected}, got {data}"
        else:
            details = f"All counts correct: {data}"
    else:
        details = f"Status {resp.status_code}: {resp.text[:200]}"
    log_test("5", 25, "GET /api/sitemap/status → correct counts", passed, details)
except Exception as e:
    log_test("5", 25, "GET /api/sitemap/status", False, f"Exception: {str(e)}")

# ===== Summary =====
print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)

total = len(test_results)
passed = sum(1 for p, _ in test_results if p)
failed = total - passed

print(f"\nTotal Tests: {total}")
print(f"Passed: {passed}")
print(f"Failed: {failed}")
print(f"Success Rate: {passed/total*100:.1f}%")

if failed > 0:
    print("\n" + "="*80)
    print("FAILED TESTS:")
    print("="*80)
    for p, result in test_results:
        if not p:
            print(result)

print("\n" + "="*80)
print("ALL TEST RESULTS:")
print("="*80)
for p, result in test_results:
    print(result)

print("\n" + "="*80)
print("TESTING COMPLETE")
print("="*80)
