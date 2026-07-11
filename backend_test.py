#!/usr/bin/env python3
"""
Phase 2 Resource #1 (Services CMS) — PUT /api/admin/service-content/{slug} endpoint test
Tests admin-gated update of service SEO content with SSR revalidation verification.
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "https://noir-migration.preview.emergentagent.com"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"
TEST_SLUG = "vip-escort-hamburg"

class TestRunner:
    def __init__(self):
        self.session = requests.Session()
        self.baseline = None
        self.passed = 0
        self.failed = 0
        self.critical_failures = []
        
    def log(self, msg: str, level: str = "INFO"):
        prefix = "✅" if level == "PASS" else "❌" if level == "FAIL" else "ℹ️"
        print(f"{prefix} {msg}")
        
    def assert_status(self, response: requests.Response, expected: int, step: str):
        if response.status_code == expected:
            self.passed += 1
            self.log(f"Step {step}: Status {expected} ✓", "PASS")
            return True
        else:
            self.failed += 1
            self.log(f"Step {step}: Expected {expected}, got {response.status_code}. Body: {response.text[:200]}", "FAIL")
            return False
            
    def assert_field(self, data: Dict, field: str, expected: Any, step: str):
        actual = data.get(field)
        if actual == expected:
            self.passed += 1
            self.log(f"Step {step}: Field '{field}' = '{expected}' ✓", "PASS")
            return True
        else:
            self.failed += 1
            self.log(f"Step {step}: Field '{field}' expected '{expected}', got '{actual}'", "FAIL")
            return False
            
    def assert_in_html(self, html: str, substring: str, step: str, critical: bool = False):
        if substring in html:
            self.passed += 1
            self.log(f"Step {step}: Found '{substring[:50]}...' in HTML ✓", "PASS")
            return True
        else:
            self.failed += 1
            msg = f"Step {step}: Expected substring '{substring[:50]}...' NOT found in HTML"
            self.log(msg, "FAIL")
            if critical:
                self.critical_failures.append(msg)
            return False
            
    def run_tests(self):
        print("\n" + "="*80)
        print("PHASE 2 SERVICES CMS — PUT /api/admin/service-content/{slug} TEST")
        print("="*80 + "\n")
        
        # ===== Auth guards =====
        print("\n--- SECTION 1: AUTH GUARDS ---")
        
        # Step 1: PUT without cookie → 401
        print("\n[Step 1] PUT without cookie → expect 401")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"meta_title": "x"}
        )
        self.assert_status(r, 401, "1")
        if r.status_code == 401:
            body = r.json()
            self.assert_field(body, "detail", "Not authenticated", "1")
        
        # Step 2: PUT with garbage cookie → 401
        print("\n[Step 2] PUT with garbage cookie → expect 401")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"meta_title": "x"},
            cookies={"access_token": "notavalidjwt"}
        )
        self.assert_status(r, 401, "2")
        
        # Step 3: Login as admin and save baseline
        print("\n[Step 3] Login as admin and save baseline")
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if not self.assert_status(r, 200, "3-login"):
            print("❌ CRITICAL: Cannot login. Aborting test.")
            return
        
        # Extract cookie
        cookie = r.cookies.get("access_token")
        if not cookie:
            self.log("Step 3: No access_token cookie received", "FAIL")
            self.failed += 1
            return
        self.log(f"Step 3: Got access_token cookie", "PASS")
        self.passed += 1
        
        # Get baseline
        r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
        if not self.assert_status(r, 200, "3-baseline"):
            print("❌ CRITICAL: Cannot fetch baseline. Aborting test.")
            return
        self.baseline = r.json()
        self.log(f"Step 3: Saved baseline with {len(self.baseline)} fields", "PASS")
        self.passed += 1
        
        # ===== Happy path — partial update =====
        print("\n--- SECTION 2: HAPPY PATH — PARTIAL UPDATE ---")
        
        # Step 4: PUT with cookie, body {"meta_title":"Test title 1"} → 200
        print("\n[Step 4] PUT meta_title='Test title 1' → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"meta_title": "Test title 1"},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "4"):
            body = r.json()
            self.assert_field(body, "meta_title", "Test title 1", "4")
            if "updated_at" in body:
                self.log(f"Step 4: updated_at field present: {body['updated_at']}", "PASS")
                self.passed += 1
            else:
                self.log("Step 4: updated_at field missing", "FAIL")
                self.failed += 1
        
        # Step 5: GET and verify meta_title changed, other fields unchanged
        print("\n[Step 5] GET and verify meta_title='Test title 1', other fields unchanged")
        r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
        if self.assert_status(r, 200, "5"):
            body = r.json()
            self.assert_field(body, "meta_title", "Test title 1", "5")
            # Check a few other fields are unchanged
            for field in ["h1", "tagline", "description"]:
                if field in self.baseline:
                    if body.get(field) == self.baseline.get(field):
                        self.log(f"Step 5: Field '{field}' unchanged ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log(f"Step 5: Field '{field}' changed unexpectedly", "FAIL")
                        self.failed += 1
        
        # Step 6: Curl public SSR page and verify <title> reflects new meta_title
        print("\n[Step 6] Curl public page and verify <title> reflects 'Test title 1'")
        time.sleep(2)  # Wait for revalidation
        r = requests.get(f"{BASE_URL}/services/{TEST_SLUG}")
        if self.assert_status(r, 200, "6"):
            html = r.text
            # Look for <title>Test title 1</title>
            if "<title>Test title 1</title>" in html:
                self.log("Step 6: <title> tag reflects new meta_title (revalidatePath worked) ✓", "PASS")
                self.passed += 1
            else:
                self.log("Step 6: <title> tag does NOT reflect new meta_title (revalidatePath may have failed)", "FAIL")
                self.failed += 1
        
        # ===== Complex-field updates =====
        print("\n--- SECTION 3: COMPLEX-FIELD UPDATES ---")
        
        # Step 7: PUT with new sections array
        print("\n[Step 7] PUT with new sections array (2 sections) → expect 200")
        new_sections = [
            {
                "h2": "Test Section 1",
                "h2_en": "Test Section 1 EN",
                "body": ["Body paragraph 1", "Body paragraph 2"],
                "body_en": ["Body paragraph 1 EN", "Body paragraph 2 EN"]
            },
            {
                "h2": "Test Section 2",
                "h2_en": "Test Section 2 EN",
                "body": ["Body paragraph 3"],
                "body_en": ["Body paragraph 3 EN"]
            }
        ]
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"sections": new_sections},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "7"):
            # GET and verify
            r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                if body.get("sections") == new_sections:
                    self.log("Step 7: sections match what was sent ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 7: sections do NOT match", "FAIL")
                    self.failed += 1
        
        # Step 8: PUT with new faqs
        print("\n[Step 8] PUT with new faqs (1 FAQ) → expect 200")
        new_faqs = [
            {
                "q": "Test question?",
                "q_en": "Test question EN?",
                "a": "Test answer.",
                "a_en": "Test answer EN."
            }
        ]
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"faqs": new_faqs},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "8"):
            r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                if body.get("faqs") == new_faqs:
                    self.log("Step 8: faqs match what was sent ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 8: faqs do NOT match", "FAIL")
                    self.failed += 1
        
        # Step 9: PUT with new keypoints
        print("\n[Step 9] PUT with new keypoints and keypoints_en → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={
                "keypoints": ["kp1", "kp2", "kp3"],
                "keypoints_en": ["kp1en", "kp2en"]
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "9"):
            r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                if body.get("keypoints") == ["kp1", "kp2", "kp3"] and body.get("keypoints_en") == ["kp1en", "kp2en"]:
                    self.log("Step 9: keypoints arrays match ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 9: keypoints arrays do NOT match", "FAIL")
                    self.failed += 1
        
        # Step 10: PUT with related_services
        print("\n[Step 10] PUT with related_services → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"related_services": ["luxury-escort-hamburg", "business-escort-hamburg"]},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "10"):
            r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                if body.get("related_services") == ["luxury-escort-hamburg", "business-escort-hamburg"]:
                    self.log("Step 10: related_services match ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 10: related_services do NOT match", "FAIL")
                    self.failed += 1
        
        # ===== Whitelist enforcement =====
        print("\n--- SECTION 4: WHITELIST ENFORCEMENT ---")
        
        # Step 11: PUT with non-whitelisted fields → 200 but fields ignored
        print("\n[Step 11] PUT with non-whitelisted fields (slug, _id, created_at, password_hash) → expect 200, fields ignored")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={
                "slug": "HACKED",
                "_id": "HACKED",
                "created_at": "1970-01-01",
                "password_hash": "HACKED"
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "11"):
            r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                if body.get("slug") == TEST_SLUG:
                    self.log("Step 11: slug still 'vip-escort-hamburg' (not HACKED) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 11: slug was changed to HACKED!", "FAIL")
                    self.failed += 1
                if "password_hash" not in body:
                    self.log("Step 11: password_hash not injected ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 11: password_hash was injected!", "FAIL")
                    self.failed += 1
        
        # Step 12: PUT with empty body → 200 (only updates updated_at)
        print("\n[Step 12] PUT with empty body {} → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "12"):
            r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                # Check that baseline fields are still intact (e.g., slug)
                if body.get("slug") == TEST_SLUG:
                    self.log("Step 12: baseline fields intact after empty PUT ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 12: baseline fields changed after empty PUT", "FAIL")
                    self.failed += 1
        
        # ===== 404 =====
        print("\n--- SECTION 5: 404 ---")
        
        # Step 13: PUT to non-existent slug → 404
        print("\n[Step 13] PUT to /api/admin/service-content/does-not-exist → expect 404")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/does-not-exist",
            json={"meta_title": "x"},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 404, "13"):
            body = r.json()
            self.assert_field(body, "detail", "Service not found", "13")
        
        # ===== SSR revalidation cross-check =====
        print("\n--- SECTION 6: SSR REVALIDATION CROSS-CHECK ---")
        
        # Step 14: PUT h1, wait, curl public page, verify <h1> updated
        print("\n[Step 14] PUT h1='RevalidationCheck H1' → expect 200, then verify in HTML")
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json={"h1": "RevalidationCheck H1"},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "14"):
            time.sleep(2)
            r = requests.get(f"{BASE_URL}/services/{TEST_SLUG}")
            if r.status_code == 200:
                html = r.text
                self.assert_in_html(html, "RevalidationCheck H1", "14")
        
        # ===== CRITICAL — restore baseline =====
        print("\n--- SECTION 7: CRITICAL — RESTORE BASELINE ---")
        
        # Step 15: Restore all editable fields to baseline in ONE call
        print("\n[Step 15] Restore all editable fields to baseline")
        restore_fields = [
            'meta_title', 'meta_title_en', 'meta_description', 'meta_description_en',
            'h1', 'title', 'short_label', 'tagline', 'tagline_en',
            'description', 'description_en', 'long_copy', 'long_copy_en',
            'image', 'image_alt', 'image_alt_en',
            'keypoints', 'keypoints_en', 'related_services',
            'sections', 'faqs'
        ]
        restore_body = {k: self.baseline[k] for k in restore_fields if k in self.baseline}
        r = requests.put(
            f"{BASE_URL}/api/admin/service-content/{TEST_SLUG}",
            json=restore_body,
            cookies={"access_token": cookie}
        )
        if not self.assert_status(r, 200, "15"):
            self.critical_failures.append("Step 15: Failed to restore baseline")
        
        # Step 16: GET and assert deep equality with baseline
        print("\n[Step 16] GET and verify deep equality with baseline")
        r = requests.get(f"{BASE_URL}/api/service-content/{TEST_SLUG}")
        if self.assert_status(r, 200, "16"):
            body = r.json()
            all_match = True
            for field in restore_fields:
                if field in self.baseline:
                    if body.get(field) == self.baseline.get(field):
                        self.log(f"Step 16: Field '{field}' restored ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log(f"Step 16: Field '{field}' NOT restored. Expected: {self.baseline.get(field)}, Got: {body.get(field)}", "FAIL")
                        self.failed += 1
                        all_match = False
                        self.critical_failures.append(f"Step 16: Field '{field}' NOT restored")
            if all_match:
                self.log("Step 16: All fields restored to baseline ✓", "PASS")
        
        # Step 17: Curl public page and verify <title>, <h1>, JSON-LD match baseline
        print("\n[Step 17] Curl public page and verify <title>, <h1>, JSON-LD match baseline")
        time.sleep(2)
        r = requests.get(f"{BASE_URL}/services/{TEST_SLUG}")
        if self.assert_status(r, 200, "17"):
            html = r.text
            # Check <title>
            baseline_title = self.baseline.get("meta_title", "")
            self.assert_in_html(html, f"<title>{baseline_title}</title>", "17-title", critical=True)
            # Check <h1>
            baseline_h1 = self.baseline.get("h1", "")
            self.assert_in_html(html, baseline_h1, "17-h1", critical=True)
            # Check JSON-LD Service block (just verify it exists)
            self.assert_in_html(html, '"@type":"Service"', "17-jsonld", critical=True)
        
        # ===== Regression =====
        print("\n--- SECTION 8: REGRESSION ---")
        
        # Step 18: Verify other endpoints still work
        print("\n[Step 18] Verify GET /api/health, /api/service-content, /api/settings still work")
        r = requests.get(f"{BASE_URL}/api/health")
        self.assert_status(r, 200, "18-health")
        
        r = requests.get(f"{BASE_URL}/api/service-content")
        if self.assert_status(r, 200, "18-service-content"):
            body = r.json()
            if len(body) == 8:
                self.log("Step 18: /api/service-content still returns 8 items ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 18: /api/service-content returns {len(body)} items (expected 8)", "FAIL")
                self.failed += 1
        
        r = requests.get(f"{BASE_URL}/api/settings")
        self.assert_status(r, 200, "18-settings")
        
        # Step 19: Verify GET /api/auth/me still works with same cookie
        print("\n[Step 19] Verify GET /api/auth/me still returns 200 with same cookie")
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "19"):
            body = r.json()
            if body.get("user", {}).get("email") == ADMIN_EMAIL:
                self.log(f"Step 19: /api/auth/me returns correct user email ✓", "PASS")
                self.passed += 1
            else:
                self.log("Step 19: /api/auth/me user email mismatch", "FAIL")
                self.failed += 1
        
        # ===== Summary =====
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✅ PASSED: {self.passed}")
        print(f"❌ FAILED: {self.failed}")
        if self.critical_failures:
            print(f"\n🚨 CRITICAL FAILURES ({len(self.critical_failures)}):")
            for cf in self.critical_failures:
                print(f"   - {cf}")
        print("="*80 + "\n")
        
        return self.failed == 0

if __name__ == "__main__":
    runner = TestRunner()
    success = runner.run_tests()
    exit(0 if success else 1)
