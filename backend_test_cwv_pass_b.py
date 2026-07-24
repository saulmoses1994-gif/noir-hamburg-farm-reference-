#!/usr/bin/env python3
"""
CWV Pass B — Backend Testing
Tests the new /api/revalidate-all endpoint and verifies no regressions.
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from .env
BASE_URL = "https://noir-migration.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Admin credentials
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Test results tracking
results = {
    "priority_1": [],
    "priority_2": [],
    "priority_3": [],
    "priority_4": [],
    "total_passed": 0,
    "total_failed": 0
}

def log_test(priority, test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = {
        "test": test_name,
        "passed": passed,
        "details": details
    }
    results[priority].append(result)
    
    if passed:
        results["total_passed"] += 1
    else:
        results["total_failed"] += 1
    
    print(f"{status} - {test_name}")
    if details:
        print(f"  Details: {details}")
    print()

def admin_login():
    """Login as admin and return session cookie"""
    print("=" * 80)
    print("ADMIN LOGIN")
    print("=" * 80)
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            },
            timeout=10
        )
        
        if response.status_code == 200:
            cookies = response.cookies
            if 'access_token' in cookies:
                print(f"✅ Admin login successful")
                print(f"   Cookie: {cookies.get('access_token')[:20]}...")
                print()
                return cookies
            else:
                print(f"❌ No access_token cookie in response")
                print(f"   Cookies: {dict(cookies)}")
                return None
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Login exception: {str(e)}")
        return None

def test_priority_1():
    """Priority 1: New revalidate-all endpoint"""
    print("=" * 80)
    print("PRIORITY 1: NEW REVALIDATE-ALL ENDPOINT")
    print("=" * 80)
    print()
    
    # Test 1: POST without auth → expect 401
    print("TEST 1.1: POST /api/revalidate-all WITHOUT auth cookie")
    try:
        response = requests.post(f"{API_BASE}/revalidate-all", timeout=10)
        passed = response.status_code == 401
        log_test(
            "priority_1",
            "POST /api/revalidate-all without auth → 401",
            passed,
            f"Status: {response.status_code}, Expected: 401"
        )
    except Exception as e:
        log_test("priority_1", "POST /api/revalidate-all without auth → 401", False, f"Exception: {str(e)}")
    
    # Test 2: Login and POST with auth → expect 200 with correct structure
    print("TEST 1.2: Login as admin and POST /api/revalidate-all")
    admin_cookies = admin_login()
    
    if admin_cookies:
        try:
            response = requests.post(
                f"{API_BASE}/revalidate-all",
                cookies=admin_cookies,
                timeout=30
            )
            
            status_ok = response.status_code == 200
            
            if status_ok:
                try:
                    data = response.json()
                    
                    # Check structure
                    has_ok = "ok" in data and data["ok"] is True
                    has_revalidated = "revalidated" in data and isinstance(data["revalidated"], list)
                    has_at = "at" in data and isinstance(data["at"], str)
                    
                    # Check for expected paths
                    expected_paths = [
                        "/ (layout)", "/en (layout)", "/", "/en",
                        "/models", "/en/models",
                        "/services", "/en/services",
                        "/blog", "/en/blog",
                        "/areas", "/en/areas",
                        "/sitemap.xml", "/robots.txt"
                    ]
                    
                    revalidated_paths = data.get("revalidated", [])
                    missing_paths = [p for p in expected_paths if p not in revalidated_paths]
                    has_failed = any("FAILED" in str(item) for item in revalidated_paths)
                    
                    all_checks_passed = (
                        has_ok and 
                        has_revalidated and 
                        has_at and 
                        len(missing_paths) == 0 and 
                        not has_failed
                    )
                    
                    details = f"Status: 200, ok: {data.get('ok')}, revalidated count: {len(revalidated_paths)}"
                    if missing_paths:
                        details += f", Missing paths: {missing_paths}"
                    if has_failed:
                        details += f", Has FAILED entries"
                    
                    # Print the full revalidated array for inspection
                    print(f"   Revalidated paths ({len(revalidated_paths)}):")
                    for path in revalidated_paths:
                        print(f"     - {path}")
                    print()
                    
                    log_test(
                        "priority_1",
                        "POST /api/revalidate-all with auth → 200 with correct structure",
                        all_checks_passed,
                        details
                    )
                    
                except json.JSONDecodeError:
                    log_test(
                        "priority_1",
                        "POST /api/revalidate-all with auth → 200 with correct structure",
                        False,
                        f"Status: 200 but invalid JSON response"
                    )
            else:
                log_test(
                    "priority_1",
                    "POST /api/revalidate-all with auth → 200 with correct structure",
                    False,
                    f"Status: {response.status_code}, Expected: 200. Response: {response.text[:200]}"
                )
        except Exception as e:
            log_test(
                "priority_1",
                "POST /api/revalidate-all with auth → 200 with correct structure",
                False,
                f"Exception: {str(e)}"
            )
    else:
        log_test(
            "priority_1",
            "POST /api/revalidate-all with auth → 200 with correct structure",
            False,
            "Could not obtain admin session"
        )

def test_priority_2():
    """Priority 2: Regression — existing endpoints"""
    print("=" * 80)
    print("PRIORITY 2: REGRESSION - EXISTING ENDPOINTS")
    print("=" * 80)
    print()
    
    endpoints = [
        ("/health", "GET /api/health → 200 with {status:'ok'}", lambda r: r.status_code == 200 and r.json().get("status") == "ok"),
        ("/blog", "GET /api/blog → 200, list of blog posts", lambda r: r.status_code == 200 and isinstance(r.json(), list)),
        ("/models", "GET /api/models → 200, list of models", lambda r: r.status_code == 200 and isinstance(r.json(), list)),
        ("/settings", "GET /api/settings → 200 with settings data", lambda r: r.status_code == 200 and isinstance(r.json(), dict)),
        ("/service-content", "GET /api/service-content → 200, list of 8 services", lambda r: r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) >= 8),
    ]
    
    for endpoint, test_name, validator in endpoints:
        try:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
            passed = validator(response)
            details = f"Status: {response.status_code}"
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        details += f", Count: {len(data)}"
                    elif isinstance(data, dict):
                        details += f", Keys: {list(data.keys())[:5]}"
                except:
                    pass
            log_test("priority_2", test_name, passed, details)
        except Exception as e:
            log_test("priority_2", test_name, False, f"Exception: {str(e)}")
    
    # Test specific blog post
    print("TEST 2.6: GET /api/blog/hamburg-bei-nacht-ein-eleganter-leitfaden-durch-die-stadt")
    try:
        response = requests.get(
            f"{API_BASE}/blog/hamburg-bei-nacht-ein-eleganter-leitfaden-durch-die-stadt",
            timeout=10
        )
        passed = response.status_code == 200 and isinstance(response.json(), dict)
        details = f"Status: {response.status_code}"
        if passed:
            data = response.json()
            details += f", Has title: {'title' in data}, Has content: {'content' in data}"
        log_test(
            "priority_2",
            "GET /api/blog/hamburg-bei-nacht... → 200 with full post data",
            passed,
            details
        )
    except Exception as e:
        log_test(
            "priority_2",
            "GET /api/blog/hamburg-bei-nacht... → 200 with full post data",
            False,
            f"Exception: {str(e)}"
        )
    
    # Test wrong password login
    print("TEST 2.7: POST /api/auth/login with wrong password → 401")
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": "WrongPassword123!"
            },
            timeout=10
        )
        passed = response.status_code == 401
        log_test(
            "priority_2",
            "POST /api/auth/login with wrong password → 401",
            passed,
            f"Status: {response.status_code}, Expected: 401"
        )
    except Exception as e:
        log_test(
            "priority_2",
            "POST /api/auth/login with wrong password → 401",
            False,
            f"Exception: {str(e)}"
        )

def test_priority_3():
    """Priority 3: Auth-gated regression"""
    print("=" * 80)
    print("PRIORITY 3: AUTH-GATED REGRESSION")
    print("=" * 80)
    print()
    
    admin_cookies = admin_login()
    
    if not admin_cookies:
        log_test("priority_3", "Auth-gated tests", False, "Could not obtain admin session")
        return
    
    # Test 3.1: PUT /api/settings with empty body
    print("TEST 3.1: PUT /api/settings with empty body → 200")
    try:
        response = requests.put(
            f"{API_BASE}/settings",
            json={},
            cookies=admin_cookies,
            timeout=10
        )
        passed = response.status_code == 200
        log_test(
            "priority_3",
            "PUT /api/settings with empty body → 200",
            passed,
            f"Status: {response.status_code}, Expected: 200"
        )
    except Exception as e:
        log_test(
            "priority_3",
            "PUT /api/settings with empty body → 200",
            False,
            f"Exception: {str(e)}"
        )
    
    # Test 3.2: POST /api/blog/migrate-en-slugs (idempotent migration)
    print("TEST 3.2: POST /api/blog/migrate-en-slugs → 200 (idempotent)")
    try:
        response = requests.post(
            f"{API_BASE}/blog/migrate-en-slugs",
            cookies=admin_cookies,
            timeout=10
        )
        passed = response.status_code == 200
        details = f"Status: {response.status_code}"
        if passed:
            try:
                data = response.json()
                details += f", Response: {json.dumps(data)}"
            except:
                pass
        log_test(
            "priority_3",
            "POST /api/blog/migrate-en-slugs → 200 (idempotent)",
            passed,
            details
        )
    except Exception as e:
        log_test(
            "priority_3",
            "POST /api/blog/migrate-en-slugs → 200 (idempotent)",
            False,
            f"Exception: {str(e)}"
        )

def test_priority_4():
    """Priority 4: Frontend visual smoke"""
    print("=" * 80)
    print("PRIORITY 4: FRONTEND VISUAL SMOKE")
    print("=" * 80)
    print()
    
    print("TEST 4.1: GET / → 200 with expected content")
    try:
        response = requests.get(BASE_URL, timeout=10)
        passed = (
            response.status_code == 200 and
            "Noir Hamburg" in response.text and
            "Premium Escort Hamburg" in response.text
        )
        details = f"Status: {response.status_code}"
        if response.status_code == 200:
            has_noir = "Noir Hamburg" in response.text
            has_premium = "Premium Escort Hamburg" in response.text
            details += f", Has 'Noir Hamburg': {has_noir}, Has 'Premium Escort Hamburg': {has_premium}"
        log_test(
            "priority_4",
            "GET / → 200 with 'Noir Hamburg' and 'Premium Escort Hamburg'",
            passed,
            details
        )
    except Exception as e:
        log_test(
            "priority_4",
            "GET / → 200 with 'Noir Hamburg' and 'Premium Escort Hamburg'",
            False,
            f"Exception: {str(e)}"
        )

def print_summary():
    """Print test summary"""
    print("\n")
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print()
    
    total = results["total_passed"] + results["total_failed"]
    pass_rate = (results["total_passed"] / total * 100) if total > 0 else 0
    
    print(f"Total Tests: {total}")
    print(f"Passed: {results['total_passed']} ({pass_rate:.1f}%)")
    print(f"Failed: {results['total_failed']}")
    print()
    
    for priority in ["priority_1", "priority_2", "priority_3", "priority_4"]:
        priority_results = results[priority]
        if priority_results:
            priority_name = priority.replace("_", " ").upper()
            print(f"\n{priority_name}:")
            for result in priority_results:
                status = "✅" if result["passed"] else "❌"
                print(f"  {status} {result['test']}")
                if not result["passed"] and result["details"]:
                    print(f"     {result['details']}")
    
    print("\n")
    print("=" * 80)
    print("PREVIEW URL USED: " + BASE_URL)
    print("=" * 80)
    print()
    
    return results["total_failed"] == 0

if __name__ == "__main__":
    print("\n")
    print("=" * 80)
    print("CWV PASS B - BACKEND TESTING")
    print("Testing against: " + BASE_URL)
    print("=" * 80)
    print("\n")
    
    test_priority_1()
    test_priority_2()
    test_priority_3()
    test_priority_4()
    
    all_passed = print_summary()
    
    sys.exit(0 if all_passed else 1)
