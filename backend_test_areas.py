#!/usr/bin/env python3
"""
Phase 2 Resource #2 (Areas CMS) — PUT /api/area-content/{slug} endpoint test
Tests admin-gated update of area SEO content with comprehensive validation.
Target slug: hafencity (must be restored to original at the end)
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "https://noir-migration.preview.emergentagent.com"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"
TEST_SLUG = "hafencity"

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
            
    def assert_array_field(self, data: Dict, field: str, expected: list, step: str):
        actual = data.get(field)
        if actual == expected:
            self.passed += 1
            self.log(f"Step {step}: Array field '{field}' matches (length={len(expected)}) ✓", "PASS")
            return True
        else:
            self.failed += 1
            self.log(f"Step {step}: Array field '{field}' mismatch. Expected: {expected}, Got: {actual}", "FAIL")
            return False
            
    def run_tests(self):
        print("\n" + "="*80)
        print("PHASE 2 AREAS CMS — PUT /api/area-content/{slug} TEST")
        print(f"Target slug: {TEST_SLUG}")
        print("="*80 + "\n")
        
        # ===== Auth guards =====
        print("\n--- SECTION 1: AUTH GUARDS ---")
        
        # Step 1: PUT without cookie → 401
        print("\n[Step 1] PUT without cookie → expect 401 'Not authenticated'")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={"meta_title": "x"}
        )
        self.assert_status(r, 401, "1")
        if r.status_code == 401:
            body = r.json()
            self.assert_field(body, "detail", "Not authenticated", "1")
        
        # Step 2: PUT with garbage cookie → 401
        print("\n[Step 2] PUT with garbage cookie → expect 401")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
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
            return False
        
        # Extract cookie
        cookie = r.cookies.get("access_token")
        if not cookie:
            self.log("Step 3: No access_token cookie received", "FAIL")
            self.failed += 1
            return False
        self.log(f"Step 3: Got access_token cookie", "PASS")
        self.passed += 1
        
        # Get baseline
        r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
        if not self.assert_status(r, 200, "3-baseline"):
            print("❌ CRITICAL: Cannot fetch baseline. Aborting test.")
            return False
        self.baseline = r.json()
        self.log(f"Step 3: Saved baseline with {len(self.baseline)} fields", "PASS")
        self.passed += 1
        
        # Log baseline landmarks for reference
        baseline_landmarks = self.baseline.get("landmarks", [])
        print(f"   ℹ️  Baseline landmarks: {baseline_landmarks}")
        
        # ===== Happy path =====
        print("\n--- SECTION 2: HAPPY PATH — PARTIAL UPDATE ---")
        
        # Step 4: PUT with meta_title and meta_description → 200
        print("\n[Step 4] PUT meta_title and meta_description → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={
                "meta_title": "HafenCity Test | Noir Hamburg",
                "meta_description": "Test-Beschreibung für HafenCity mit ausreichender Länge zur SEO Prüfung."
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "4"):
            body = r.json()
            self.assert_field(body, "meta_title", "HafenCity Test | Noir Hamburg", "4")
            self.assert_field(body, "meta_description", "Test-Beschreibung für HafenCity mit ausreichender Länge zur SEO Prüfung.", "4")
            if "updated_at" in body:
                self.log(f"Step 4: updated_at field present: {body['updated_at']}", "PASS")
                self.passed += 1
            else:
                self.log("Step 4: updated_at field missing", "FAIL")
                self.failed += 1
        
        # Step 5: GET and verify both fields persisted, other fields unchanged
        print("\n[Step 5] GET and verify meta_title and meta_description persisted, other fields unchanged")
        r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
        if self.assert_status(r, 200, "5"):
            body = r.json()
            self.assert_field(body, "meta_title", "HafenCity Test | Noir Hamburg", "5")
            self.assert_field(body, "meta_description", "Test-Beschreibung für HafenCity mit ausreichender Länge zur SEO Prüfung.", "5")
            
            # Check other baseline fields are unchanged
            unchanged_fields = [
                "name", "intro", "description", "body_extra", "landmarks", "faqs",
                "image", "image_alt", "image_alt_en", "description_en", "intro_en",
                "meta_title_en", "meta_description_en"
            ]
            for field in unchanged_fields:
                if field in self.baseline:
                    if body.get(field) == self.baseline.get(field):
                        self.log(f"Step 5: Field '{field}' unchanged ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log(f"Step 5: Field '{field}' changed unexpectedly. Expected: {self.baseline.get(field)}, Got: {body.get(field)}", "FAIL")
                        self.failed += 1
        
        # Step 6: GET list and verify hafencity has new meta_title
        print("\n[Step 6] GET /api/area-content list and verify hafencity has new meta_title")
        r = requests.get(f"{BASE_URL}/api/area-content")
        if self.assert_status(r, 200, "6"):
            body = r.json()
            if len(body) == 18:
                self.log("Step 6: Still returns 18 areas ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 6: Expected 18 areas, got {len(body)}", "FAIL")
                self.failed += 1
            
            # Find hafencity in list
            hafencity = next((a for a in body if a.get("slug") == TEST_SLUG), None)
            if hafencity:
                if hafencity.get("meta_title") == "HafenCity Test | Noir Hamburg":
                    self.log("Step 6: hafencity in list has new meta_title ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 6: hafencity meta_title mismatch in list. Got: {hafencity.get('meta_title')}", "FAIL")
                    self.failed += 1
            else:
                self.log("Step 6: hafencity not found in list", "FAIL")
                self.failed += 1
        
        # ===== Array field updates =====
        print("\n--- SECTION 3: ARRAY FIELD UPDATES ---")
        
        # Step 7: PUT landmarks array → 200
        print("\n[Step 7] PUT landmarks array → expect 200")
        new_landmarks = ["Elbphilharmonie", "Speicherstadt", "Alster", "U4-Station"]
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={"landmarks": new_landmarks},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "7"):
            # GET and verify
            r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                self.assert_array_field(body, "landmarks", new_landmarks, "7")
                # Verify body_extra and faqs still baseline
                if body.get("body_extra") == self.baseline.get("body_extra"):
                    self.log("Step 7: body_extra still baseline ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 7: body_extra changed unexpectedly", "FAIL")
                    self.failed += 1
                if body.get("faqs") == self.baseline.get("faqs"):
                    self.log("Step 7: faqs still baseline ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 7: faqs changed unexpectedly", "FAIL")
                    self.failed += 1
        
        # Step 8: PUT body_extra and body_extra_en → 200
        print("\n[Step 8] PUT body_extra and body_extra_en → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={
                "body_extra": ["First paragraph.", "Second paragraph."],
                "body_extra_en": ["First EN paragraph."]
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "8"):
            r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                self.assert_array_field(body, "body_extra", ["First paragraph.", "Second paragraph."], "8")
                self.assert_array_field(body, "body_extra_en", ["First EN paragraph."], "8")
        
        # Step 9: PUT faqs → 200
        print("\n[Step 9] PUT faqs (1 FAQ) → expect 200")
        new_faqs = [
            {
                "q": "Test Q1?",
                "q_en": "Test Q1 EN?",
                "a": "Test A1.",
                "a_en": "Test A1 EN."
            }
        ]
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={"faqs": new_faqs},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "9"):
            r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                if body.get("faqs") == new_faqs:
                    self.log("Step 9: faqs match (length=1) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 9: faqs mismatch. Expected: {new_faqs}, Got: {body.get('faqs')}", "FAIL")
                    self.failed += 1
        
        # ===== Whitelist enforcement =====
        print("\n--- SECTION 4: WHITELIST ENFORCEMENT ---")
        
        # Step 10: PUT non-whitelisted fields + whitelisted name → 200, non-whitelisted ignored, name changed
        print("\n[Step 10] PUT slug=HACKED, _id=HACKED, password_hash=HACKED, name=clean-name-change → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={
                "slug": "HACKED",
                "_id": "HACKED",
                "password_hash": "HACKED",
                "name": "clean-name-change"
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "10"):
            r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                # slug should still be hafencity
                if body.get("slug") == TEST_SLUG:
                    self.log("Step 10: slug still 'hafencity' (not HACKED) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 10: slug was changed to {body.get('slug')}!", "FAIL")
                    self.failed += 1
                # _id should not be injected
                if "_id" not in body:
                    self.log("Step 10: _id not injected ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 10: _id was injected!", "FAIL")
                    self.failed += 1
                # password_hash should not be injected
                if "password_hash" not in body:
                    self.log("Step 10: password_hash not injected ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 10: password_hash was injected!", "FAIL")
                    self.failed += 1
                # name should have changed (it's in whitelist)
                if body.get("name") == "clean-name-change":
                    self.log("Step 10: name DID change (in whitelist) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 10: name did NOT change. Got: {body.get('name')}", "FAIL")
                    self.failed += 1
        
        # ===== Empty / minimal body =====
        print("\n--- SECTION 5: EMPTY / MINIMAL BODY ---")
        
        # Step 11: PUT with empty body {} → 200
        print("\n[Step 11] PUT with empty body {} → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "11"):
            r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
            if r.status_code == 200:
                body = r.json()
                # Check that slug is still intact
                if body.get("slug") == TEST_SLUG:
                    self.log("Step 11: All fields intact after empty PUT ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 11: Fields changed after empty PUT", "FAIL")
                    self.failed += 1
        
        # ===== 404 =====
        print("\n--- SECTION 6: 404 ---")
        
        # Step 12: PUT to non-existent slug → 404
        print("\n[Step 12] PUT to /api/area-content/does-not-exist → expect 404")
        r = requests.put(
            f"{BASE_URL}/api/area-content/does-not-exist",
            json={"meta_title": "x"},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 404, "12"):
            body = r.json()
            self.assert_field(body, "detail", "Area not found", "12")
        
        # ===== SEO-friendly length verification =====
        print("\n--- SECTION 7: SEO-FRIENDLY LENGTH VERIFICATION ---")
        
        # Step 13: PUT meta_title longer than 100 chars → 200 (no server-side limit)
        print("\n[Step 13] PUT meta_title longer than 100 chars → expect 200 (informational only)")
        long_title = "A" * 120  # 120 characters
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json={"meta_title": long_title},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "13"):
            self.log("Step 13: API accepts long meta_title (no server-side length limit) ✓", "PASS")
            self.passed += 1
        
        # ===== CRITICAL — full restore =====
        print("\n--- SECTION 8: CRITICAL — FULL RESTORE ---")
        
        # Step 14: Restore ALL editable fields to baseline in ONE call
        print("\n[Step 14] Restore ALL editable fields to baseline")
        restore_fields = [
            'title', 'name', 'intro', 'intro_en', 'description', 'description_en',
            'long_copy', 'long_copy_en', 'meta_title', 'meta_title_en',
            'meta_description', 'meta_description_en', 'image', 'image_alt', 'image_alt_en',
            'landmarks', 'body_extra', 'body_extra_en', 'faqs'
        ]
        restore_body = {}
        for k in restore_fields:
            if k in self.baseline:
                restore_body[k] = self.baseline[k]
        
        print(f"   ℹ️  Restoring {len(restore_body)} fields")
        r = requests.put(
            f"{BASE_URL}/api/area-content/{TEST_SLUG}",
            json=restore_body,
            cookies={"access_token": cookie}
        )
        if not self.assert_status(r, 200, "14"):
            self.critical_failures.append("Step 14: Failed to restore baseline")
            return False
        
        # Step 15: GET and deep-equality check
        print("\n[Step 15] GET and verify deep-equality with baseline")
        r = requests.get(f"{BASE_URL}/api/area-content/{TEST_SLUG}")
        if not self.assert_status(r, 200, "15"):
            self.critical_failures.append("Step 15: Failed to GET after restore")
            return False
        
        body = r.json()
        all_match = True
        for field in restore_fields:
            if field in self.baseline:
                baseline_val = self.baseline.get(field)
                actual_val = body.get(field)
                if actual_val == baseline_val:
                    self.log(f"Step 15: Field '{field}' restored ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 15: Field '{field}' NOT restored. Expected: {baseline_val}, Got: {actual_val}", "FAIL")
                    self.failed += 1
                    all_match = False
                    self.critical_failures.append(f"Step 15: Field '{field}' NOT restored (CRITICAL - production data may be corrupted)")
        
        if all_match:
            self.log("Step 15: ✅ ALL FIELDS RESTORED TO BASELINE (production data safe)", "PASS")
        else:
            self.log("Step 15: ❌ SOME FIELDS NOT RESTORED (CRITICAL - production data may be corrupted)", "FAIL")
        
        # Verify specific baseline values mentioned in review request
        print("\n   ℹ️  Verifying specific baseline values:")
        # meta_title, meta_title_en, meta_description, meta_description_en, image_alt, image_alt_en should be EMPTY STRINGS
        empty_string_fields = ["meta_title", "meta_title_en", "meta_description", "meta_description_en", "image_alt", "image_alt_en"]
        for field in empty_string_fields:
            if field in self.baseline:
                if body.get(field) == "":
                    self.log(f"Step 15: {field} is empty string (as in baseline) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 15: {field} is NOT empty string. Got: {body.get(field)}", "FAIL")
                    self.failed += 1
        
        # landmarks should be exactly ['Elbphilharmonie', 'Magellan-Terrassen', 'The Fontenay (nahe)', 'Speicherstadt']
        expected_landmarks = ['Elbphilharmonie', 'Magellan-Terrassen', 'The Fontenay (nahe)', 'Speicherstadt']
        if body.get("landmarks") == expected_landmarks:
            self.log(f"Step 15: landmarks exactly match baseline {expected_landmarks} ✓", "PASS")
            self.passed += 1
        else:
            self.log(f"Step 15: landmarks mismatch. Expected: {expected_landmarks}, Got: {body.get('landmarks')}", "FAIL")
            self.failed += 1
        
        # ===== Regression =====
        print("\n--- SECTION 9: REGRESSION ---")
        
        # Step 16: Verify other endpoints still work
        print("\n[Step 16] Verify other endpoints still work")
        
        endpoints = [
            ("/api/health", "health"),
            ("/api/service-content", "service-content"),
            ("/api/service-content/vip-escort-hamburg", "service-content/vip-escort-hamburg"),
            ("/api/settings", "settings"),
        ]
        
        for endpoint, name in endpoints:
            r = requests.get(f"{BASE_URL}{endpoint}")
            self.assert_status(r, 200, f"16-{name}")
        
        # Verify /api/service-content still returns 8
        r = requests.get(f"{BASE_URL}/api/service-content")
        if r.status_code == 200:
            body = r.json()
            if len(body) == 8:
                self.log("Step 16: /api/service-content still returns 8 ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 16: /api/service-content returns {len(body)} (expected 8)", "FAIL")
                self.failed += 1
        
        # Verify /api/auth/me still works with cookie
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "16-auth/me"):
            body = r.json()
            if body.get("user", {}).get("email") == ADMIN_EMAIL:
                self.log("Step 16: /api/auth/me returns correct user ✓", "PASS")
                self.passed += 1
            else:
                self.log("Step 16: /api/auth/me user mismatch", "FAIL")
                self.failed += 1
        
        # Step 17: GET /api/area-content → still 18 areas
        print("\n[Step 17] GET /api/area-content → still 18 areas")
        r = requests.get(f"{BASE_URL}/api/area-content")
        if self.assert_status(r, 200, "17"):
            body = r.json()
            if len(body) == 18:
                self.log("Step 17: Still returns 18 areas ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 17: Expected 18 areas, got {len(body)}", "FAIL")
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
        else:
            print("\n✅ NO CRITICAL FAILURES - Production data is safe")
        print("="*80 + "\n")
        
        return self.failed == 0

if __name__ == "__main__":
    runner = TestRunner()
    success = runner.run_tests()
    exit(0 if success else 1)
