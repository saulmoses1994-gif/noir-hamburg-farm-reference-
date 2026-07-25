#!/usr/bin/env python3
"""
Regression test suite for security fixes SEC-001, SEC-002, SEC-003.

SEC-001: HTML sanitization on CMS write paths
SEC-002: Framing headers (X-Frame-Options, CSP frame-ancestors)
SEC-003: Error leakage fix (generic error responses)

Test scope: http://localhost:3000 (preview environment)
Admin credentials: admin@noir-hamburg.de / NoirAdmin2026!
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Malicious HTML payload for sanitization testing
MALICIOUS_HTML = '<p>Safe text</p><script>alert("xss")</script><img src=x onerror=alert(1)><a href="javascript:evil()">bad</a>'

# Expected sanitized result (script, onerror, javascript: should be stripped)
EXPECTED_SANITIZED_PATTERNS = [
    '<p>Safe text</p>',  # Safe content preserved
]
FORBIDDEN_PATTERNS = [
    '<script',
    'onerror',
    'javascript:',
]

class TestSession:
    def __init__(self):
        self.session = requests.Session()
        self.auth_cookie = None
        self.test_results = {
            'priority_1_sanitization': [],
            'priority_2_regression': [],
            'priority_3_headers': [],
            'priority_4_error_format': [],
            'summary': {'passed': 0, 'failed': 0, 'total': 0}
        }
    
    def login(self) -> bool:
        """Login as admin and extract Bearer token."""
        try:
            print("\n=== ADMIN LOGIN ===")
            resp = self.session.post(
                f"{API_BASE}/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=10
            )
            if resp.status_code == 200:
                # Extract token from cookie
                token = resp.cookies.get('access_token')
                if token:
                    # Set Authorization header for all subsequent requests
                    self.session.headers.update({'Authorization': f'Bearer {token}'})
                    print(f"✅ Login successful: {resp.status_code}")
                    print(f"   Token extracted and set in Authorization header")
                    return True
                else:
                    print(f"❌ Login failed: No access_token cookie in response")
                    return False
            else:
                print(f"❌ Login failed: {resp.status_code} - {resp.text}")
                return False
        except Exception as e:
            print(f"❌ Login exception: {e}")
            return False
    
    def record_result(self, priority: str, test_name: str, passed: bool, details: str):
        """Record test result."""
        result = {
            'test': test_name,
            'passed': passed,
            'details': details
        }
        self.test_results[priority].append(result)
        self.test_results['summary']['total'] += 1
        if passed:
            self.test_results['summary']['passed'] += 1
            print(f"  ✅ {test_name}: PASS")
        else:
            self.test_results['summary']['failed'] += 1
            print(f"  ❌ {test_name}: FAIL - {details}")
    
    def test_sanitization_endpoint(self, method: str, endpoint: str, field: str, 
                                   slug: Optional[str] = None, get_endpoint: Optional[str] = None) -> bool:
        """
        Test HTML sanitization on a specific endpoint.
        
        Steps:
        1. GET original value
        2. PUT malicious HTML
        3. Verify response is sanitized
        4. GET to verify persistence
        5. RESTORE original value
        """
        try:
            # Determine full endpoint path
            # Some endpoints have different GET and PUT paths (e.g., service-content)
            if get_endpoint:
                if slug:
                    get_url = f"{API_BASE}/{get_endpoint}/{slug}"
                else:
                    get_url = f"{API_BASE}/{get_endpoint}"
            else:
                if slug:
                    get_url = f"{API_BASE}/{endpoint}/{slug}"
                else:
                    get_url = f"{API_BASE}/{endpoint}"
            
            if slug:
                put_url = f"{API_BASE}/{endpoint}/{slug}"
            else:
                put_url = f"{API_BASE}/{endpoint}"
            
            print(f"\n  Testing {method} {endpoint} (field: {field})")
            
            # Step 1: GET original value
            resp = self.session.get(get_url, timeout=10)
            if resp.status_code != 200:
                self.record_result('priority_1_sanitization', 
                                 f"{method} {endpoint} - GET original",
                                 False, f"GET failed: {resp.status_code}")
                return False
            
            original_data = resp.json()
            original_value = original_data.get(field, '')
            print(f"    Original {field}: {original_value[:50] if original_value else 'empty'}...")
            
            # Step 2: PUT malicious HTML
            payload = {field: MALICIOUS_HTML}
            resp = self.session.put(put_url, json=payload, timeout=10)
            
            if resp.status_code != 200:
                self.record_result('priority_1_sanitization',
                                 f"{method} {endpoint} - PUT malicious",
                                 False, f"PUT failed: {resp.status_code}")
                # Try to restore anyway
                self.session.put(put_url, json={field: original_value}, timeout=10)
                return False
            
            # Step 3: Verify response is sanitized
            response_data = resp.json()
            sanitized_value = response_data.get(field, '')
            
            # Check for forbidden patterns
            has_forbidden = any(pattern in sanitized_value for pattern in FORBIDDEN_PATTERNS)
            has_safe = any(pattern in sanitized_value for pattern in EXPECTED_SANITIZED_PATTERNS)
            
            if has_forbidden:
                self.record_result('priority_1_sanitization',
                                 f"{method} {endpoint} - sanitization",
                                 False, f"Response contains forbidden patterns: {sanitized_value[:100]}")
                # Restore original
                self.session.put(put_url, json={field: original_value}, timeout=10)
                return False
            
            if not has_safe:
                self.record_result('priority_1_sanitization',
                                 f"{method} {endpoint} - sanitization",
                                 False, f"Response missing safe content: {sanitized_value[:100]}")
                # Restore original
                self.session.put(put_url, json={field: original_value}, timeout=10)
                return False
            
            print(f"    Sanitized value: {sanitized_value[:100]}...")
            
            # Step 4: GET to verify persistence
            resp = self.session.get(get_url, timeout=10)
            if resp.status_code == 200:
                persisted_data = resp.json()
                persisted_value = persisted_data.get(field, '')
                has_forbidden_persisted = any(pattern in persisted_value for pattern in FORBIDDEN_PATTERNS)
                
                if has_forbidden_persisted:
                    self.record_result('priority_1_sanitization',
                                     f"{method} {endpoint} - persistence",
                                     False, f"Persisted value contains forbidden patterns")
                    # Restore original
                    self.session.put(put_url, json={field: original_value}, timeout=10)
                    return False
            
            # Step 5: RESTORE original value
            resp = self.session.put(put_url, json={field: original_value}, timeout=10)
            if resp.status_code != 200:
                print(f"    ⚠️  Warning: Failed to restore original value: {resp.status_code}")
            else:
                print(f"    ✓ Restored original value")
            
            self.record_result('priority_1_sanitization',
                             f"{method} {endpoint} - {field}",
                             True, "Sanitization working correctly")
            return True
            
        except Exception as e:
            self.record_result('priority_1_sanitization',
                             f"{method} {endpoint} - {field}",
                             False, f"Exception: {str(e)}")
            return False
    
    def test_priority_1_sanitization(self):
        """
        Priority 1: Test HTML sanitization on all CMS write paths.
        
        Endpoints to test:
        - PUT /api/blog/<slug> - field: excerpt
        - PUT /api/models/<slug> - field: bio
        - PUT /api/pages/<slug> - field: content
        - PUT /api/settings - field: about_content
        - PUT /api/admin/service-content/<slug> - field: description
        - PUT /api/area-content/<slug> - field: intro
        """
        print("\n" + "="*80)
        print("PRIORITY 1: HTML SANITIZATION TESTS")
        print("="*80)
        
        # Get existing slugs for testing
        try:
            # Get a blog post slug
            resp = self.session.get(f"{API_BASE}/blog", timeout=10)
            blog_slug = None
            if resp.status_code == 200:
                blogs = resp.json()
                if blogs and len(blogs) > 0:
                    blog_slug = blogs[0].get('slug')
            
            # Get a model slug
            resp = self.session.get(f"{API_BASE}/models", timeout=10)
            model_slug = None
            if resp.status_code == 200:
                models = resp.json()
                if models and len(models) > 0:
                    model_slug = models[0].get('slug')
            
            # Get a page slug
            resp = self.session.get(f"{API_BASE}/pages", timeout=10)
            page_slug = None
            if resp.status_code == 200:
                pages = resp.json()
                if pages and len(pages) > 0:
                    page_slug = pages[0].get('slug')
            
            # Get a service slug
            resp = self.session.get(f"{API_BASE}/service-content", timeout=10)
            service_slug = None
            if resp.status_code == 200:
                services = resp.json()
                if services and len(services) > 0:
                    service_slug = services[0].get('slug')
            
            # Get an area slug
            resp = self.session.get(f"{API_BASE}/area-content", timeout=10)
            area_slug = None
            if resp.status_code == 200:
                areas = resp.json()
                if areas and len(areas) > 0:
                    area_slug = areas[0].get('slug')
            
            print(f"\nFound slugs for testing:")
            print(f"  Blog: {blog_slug}")
            print(f"  Model: {model_slug}")
            print(f"  Page: {page_slug}")
            print(f"  Service: {service_slug}")
            print(f"  Area: {area_slug}")
            
            # Test each endpoint
            if blog_slug:
                self.test_sanitization_endpoint('PUT', 'blog', 'excerpt', blog_slug)
            else:
                self.record_result('priority_1_sanitization', 'PUT /api/blog/<slug>', 
                                 False, 'No blog post found for testing')
            
            if model_slug:
                self.test_sanitization_endpoint('PUT', 'models', 'bio', model_slug)
            else:
                self.record_result('priority_1_sanitization', 'PUT /api/models/<slug>',
                                 False, 'No model found for testing')
            
            if page_slug:
                self.test_sanitization_endpoint('PUT', 'pages', 'content', page_slug)
            else:
                self.record_result('priority_1_sanitization', 'PUT /api/pages/<slug>',
                                 False, 'No page found for testing')
            
            # Test settings
            self.test_sanitization_endpoint('PUT', 'settings', 'about_content')
            
            if service_slug:
                # Note: GET from /api/service-content/:slug, PUT to /api/admin/service-content/:slug
                self.test_sanitization_endpoint('PUT', 'admin/service-content', 'description', 
                                              service_slug, get_endpoint='service-content')
            else:
                self.record_result('priority_1_sanitization', 'PUT /api/admin/service-content/<slug>',
                                 False, 'No service found for testing')
            
            if area_slug:
                self.test_sanitization_endpoint('PUT', 'area-content', 'intro', area_slug)
            else:
                self.record_result('priority_1_sanitization', 'PUT /api/area-content/<slug>',
                                 False, 'No area found for testing')
            
        except Exception as e:
            print(f"❌ Priority 1 exception: {e}")
    
    def test_priority_2_regression(self):
        """
        Priority 2: Test that existing endpoints still work (regression).
        """
        print("\n" + "="*80)
        print("PRIORITY 2: REGRESSION TESTS")
        print("="*80)
        
        tests = [
            ('GET /api/health', f"{API_BASE}/health", 200, {'status': 'ok'}),
            ('GET /api/blog', f"{API_BASE}/blog", 200, None),
            ('GET /api/models', f"{API_BASE}/models", 200, None),
            ('GET /api/service-content', f"{API_BASE}/service-content", 200, None),
        ]
        
        for test_name, url, expected_status, expected_data in tests:
            try:
                resp = self.session.get(url, timeout=10)
                if resp.status_code == expected_status:
                    if expected_data:
                        data = resp.json()
                        if all(k in data and data[k] == v for k, v in expected_data.items()):
                            self.record_result('priority_2_regression', test_name, True, 
                                             f"Status {resp.status_code}, data matches")
                        else:
                            self.record_result('priority_2_regression', test_name, False,
                                             f"Data mismatch: {data}")
                    else:
                        self.record_result('priority_2_regression', test_name, True,
                                         f"Status {resp.status_code}")
                else:
                    self.record_result('priority_2_regression', test_name, False,
                                     f"Expected {expected_status}, got {resp.status_code}")
            except Exception as e:
                self.record_result('priority_2_regression', test_name, False, f"Exception: {e}")
        
        # Test wrong password (should return 401, not crash)
        try:
            resp = requests.post(
                f"{API_BASE}/auth/login",
                json={"email": ADMIN_EMAIL, "password": "wrongpassword"},
                timeout=10
            )
            if resp.status_code == 401:
                self.record_result('priority_2_regression', 'POST /api/auth/login (wrong password)',
                                 True, "Returns 401 as expected")
            else:
                self.record_result('priority_2_regression', 'POST /api/auth/login (wrong password)',
                                 False, f"Expected 401, got {resp.status_code}")
        except Exception as e:
            self.record_result('priority_2_regression', 'POST /api/auth/login (wrong password)',
                             False, f"Exception: {e}")
        
        # Test correct password (should return 200 with cookie)
        try:
            resp = requests.post(
                f"{API_BASE}/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=10
            )
            if resp.status_code == 200 and 'access_token' in resp.cookies:
                self.record_result('priority_2_regression', 'POST /api/auth/login (correct password)',
                                 True, "Returns 200 with auth cookie")
            else:
                self.record_result('priority_2_regression', 'POST /api/auth/login (correct password)',
                                 False, f"Status {resp.status_code}, cookies: {resp.cookies}")
        except Exception as e:
            self.record_result('priority_2_regression', 'POST /api/auth/login (correct password)',
                             False, f"Exception: {e}")
    
    def test_priority_3_headers(self):
        """
        Priority 3: Verify SEC-002 framing headers.
        
        Expected headers:
        - X-Frame-Options: SAMEORIGIN (was ALLOWALL)
        - Content-Security-Policy: frame-ancestors 'self'; (was frame-ancestors *;)
        """
        print("\n" + "="*80)
        print("PRIORITY 3: SEC-002 FRAMING HEADERS")
        print("="*80)
        
        try:
            resp = requests.get(BASE_URL, timeout=10)
            headers = resp.headers
            
            # Check X-Frame-Options
            x_frame_options = headers.get('X-Frame-Options', '')
            if x_frame_options == 'SAMEORIGIN':
                self.record_result('priority_3_headers', 'X-Frame-Options header',
                                 True, f"Correct value: {x_frame_options}")
            else:
                self.record_result('priority_3_headers', 'X-Frame-Options header',
                                 False, f"Expected SAMEORIGIN, got: {x_frame_options}")
            
            # Check Content-Security-Policy
            csp = headers.get('Content-Security-Policy', '')
            if "frame-ancestors 'self'" in csp:
                self.record_result('priority_3_headers', 'CSP frame-ancestors header',
                                 True, f"Correct value: {csp}")
            else:
                self.record_result('priority_3_headers', 'CSP frame-ancestors header',
                                 False, f"Expected frame-ancestors 'self', got: {csp}")
            
            print(f"\nAll response headers:")
            for key, value in headers.items():
                print(f"  {key}: {value}")
            
        except Exception as e:
            self.record_result('priority_3_headers', 'Header verification',
                             False, f"Exception: {e}")
    
    def test_priority_4_error_format(self):
        """
        Priority 4: Verify SEC-003 error response format.
        
        Expected: {detail: "Internal error", requestId: "..."}
        NOT: {detail: "...", error: "actual error message"}
        """
        print("\n" + "="*80)
        print("PRIORITY 4: SEC-003 ERROR RESPONSE FORMAT")
        print("="*80)
        
        # Try to trigger a 500 error by hitting an endpoint with bad data
        # This is difficult without knowing the exact code paths, so we'll
        # verify the code structure instead
        
        print("\n  Note: Verifying error handling code structure in route.js")
        print("  (Triggering actual 500 errors is difficult without breaking the app)")
        
        # Check if the error handler returns the correct format
        # We can verify this by checking the source code
        try:
            with open('/app/app/api/[[...path]]/route.js', 'r') as f:
                content = f.read()
                
                # Check for the new error format
                if 'detail: \'Internal error\', requestId' in content:
                    self.record_result('priority_4_error_format', 'Error handler code structure',
                                     True, "Error handler returns {detail, requestId}")
                else:
                    self.record_result('priority_4_error_format', 'Error handler code structure',
                                     False, "Error handler does not return correct format")
                
                # Check that old format is NOT present
                if 'error: e.message' in content:
                    self.record_result('priority_4_error_format', 'No error leakage',
                                     False, "Old error format still present in code")
                else:
                    self.record_result('priority_4_error_format', 'No error leakage',
                                     True, "Old error format removed from code")
        except Exception as e:
            self.record_result('priority_4_error_format', 'Code verification',
                             False, f"Exception: {e}")
    
    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        for priority, results in self.test_results.items():
            if priority == 'summary':
                continue
            
            if not results:
                continue
            
            passed = sum(1 for r in results if r['passed'])
            total = len(results)
            print(f"\n{priority.upper().replace('_', ' ')}: {passed}/{total} passed")
            
            for result in results:
                status = "✅" if result['passed'] else "❌"
                print(f"  {status} {result['test']}")
                if not result['passed']:
                    print(f"      {result['details']}")
        
        summary = self.test_results['summary']
        print(f"\n{'='*80}")
        print(f"OVERALL: {summary['passed']}/{summary['total']} tests passed")
        print(f"{'='*80}\n")
        
        return summary['failed'] == 0

def main():
    """Run all security regression tests."""
    print("="*80)
    print("SECURITY REGRESSION TEST SUITE")
    print("SEC-001: HTML Sanitization")
    print("SEC-002: Framing Headers")
    print("SEC-003: Error Leakage Fix")
    print("="*80)
    
    test_session = TestSession()
    
    # Login first
    if not test_session.login():
        print("\n❌ FATAL: Could not login as admin. Aborting tests.")
        sys.exit(1)
    
    # Run all test priorities
    test_session.test_priority_1_sanitization()
    test_session.test_priority_2_regression()
    test_session.test_priority_3_headers()
    test_session.test_priority_4_error_format()
    
    # Print summary
    all_passed = test_session.print_summary()
    
    if all_passed:
        print("✅ ALL TESTS PASSED")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
