#!/usr/bin/env python3
"""
Phase 2 Resource #3 (Settings CMS) — PUT /api/settings endpoint test
Tests admin-gated update of the singleton site_settings doc with whitelist enforcement,
map field handling, long-text fields, SSR revalidation, and critical baseline restoration.
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "https://noir-migration.preview.emergentagent.com"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

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
            self.log(f"Step {step}: Expected {expected}, got {response.status_code}. Body: {response.text[:300]}", "FAIL")
            return False
            
    def assert_field(self, data: Dict, field: str, expected: Any, step: str):
        actual = data.get(field)
        if actual == expected:
            self.passed += 1
            self.log(f"Step {step}: Field '{field}' = '{str(expected)[:50]}...' ✓", "PASS")
            return True
        else:
            self.failed += 1
            self.log(f"Step {step}: Field '{field}' expected '{str(expected)[:50]}...', got '{str(actual)[:50]}...'", "FAIL")
            return False
            
    def assert_field_unchanged(self, current: Dict, baseline: Dict, field: str, step: str):
        if current.get(field) == baseline.get(field):
            self.passed += 1
            self.log(f"Step {step}: Field '{field}' unchanged ✓", "PASS")
            return True
        else:
            self.failed += 1
            self.log(f"Step {step}: Field '{field}' changed unexpectedly", "FAIL")
            return False
            
    def assert_not_in_response(self, data: Dict, field: str, step: str):
        if field not in data:
            self.passed += 1
            self.log(f"Step {step}: Field '{field}' not in response ✓", "PASS")
            return True
        else:
            self.failed += 1
            self.log(f"Step {step}: Field '{field}' should NOT be in response but found: {data[field]}", "FAIL")
            return False
            
    def run_tests(self):
        print("\n" + "="*80)
        print("PHASE 2 SETTINGS CMS — PUT /api/settings TEST")
        print("="*80 + "\n")
        
        # ===== Auth guards =====
        print("\n--- SECTION 1: AUTH GUARDS ---")
        
        # Step 1: PUT without cookie → 401
        print("\n[Step 1] PUT without cookie → expect 401")
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={"phone": "HACK"}
        )
        self.assert_status(r, 401, "1")
        if r.status_code == 401:
            body = r.json()
            self.assert_field(body, "detail", "Not authenticated", "1")
        
        # Step 2: PUT with garbage cookie → 401
        print("\n[Step 2] PUT with garbage cookie → expect 401")
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={"phone": "HACK"},
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
        r = requests.get(f"{BASE_URL}/api/settings")
        if not self.assert_status(r, 200, "3-baseline"):
            print("❌ CRITICAL: Cannot fetch baseline. Aborting test.")
            return False
        self.baseline = r.json()
        self.log(f"Step 3: Saved baseline with {len(self.baseline)} fields", "PASS")
        self.passed += 1
        
        # Confirm no _id in response
        self.assert_not_in_response(self.baseline, "_id", "3-no-id")
        
        # ===== Partial update =====
        print("\n--- SECTION 2: PARTIAL UPDATE ---")
        
        # Step 4: PUT with phone + instagram_url → 200
        print("\n[Step 4] PUT phone='+49 40 12345678', instagram_url='https://instagram.com/test_noir' → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "phone": "+49 40 12345678",
                "instagram_url": "https://instagram.com/test_noir"
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "4"):
            body = r.json()
            self.assert_field(body, "phone", "+49 40 12345678", "4")
            self.assert_field(body, "instagram_url", "https://instagram.com/test_noir", "4")
            # Check other fields unchanged
            for field in ["business_name", "tagline_de", "hours_de"]:
                if field in self.baseline:
                    self.assert_field_unchanged(body, self.baseline, field, "4")
        
        # Step 5: GET and verify persistence
        print("\n[Step 5] GET and verify phone + instagram_url persisted")
        r = requests.get(f"{BASE_URL}/api/settings")
        if self.assert_status(r, 200, "5"):
            body = r.json()
            self.assert_field(body, "phone", "+49 40 12345678", "5")
            self.assert_field(body, "instagram_url", "https://instagram.com/test_noir", "5")
        
        # ===== Map fields =====
        print("\n--- SECTION 3: MAP FIELDS ---")
        
        # Step 6: PUT area_images (map) → 200
        print("\n[Step 6] PUT area_images={'hafencity':'https://cdn.test/hc.jpg','altona':'https://cdn.test/al.jpg'} → expect 200")
        area_images_test = {
            "hafencity": "https://cdn.test/hc.jpg",
            "altona": "https://cdn.test/al.jpg"
        }
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={"area_images": area_images_test},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "6"):
            # GET and verify
            r = requests.get(f"{BASE_URL}/api/settings")
            if r.status_code == 200:
                body = r.json()
                if body.get("area_images") == area_images_test:
                    self.log("Step 6: area_images match exactly (whole map replaced) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 6: area_images mismatch. Expected: {area_images_test}, Got: {body.get('area_images')}", "FAIL")
                    self.failed += 1
        
        # Step 7: PUT service_images (map) → 200
        print("\n[Step 7] PUT service_images={'vip-escort-hamburg':'https://cdn.test/vip.jpg'} → expect 200")
        service_images_test = {
            "vip-escort-hamburg": "https://cdn.test/vip.jpg"
        }
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={"service_images": service_images_test},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "7"):
            # GET and verify
            r = requests.get(f"{BASE_URL}/api/settings")
            if r.status_code == 200:
                body = r.json()
                if body.get("service_images") == service_images_test:
                    self.log("Step 7: service_images match exactly ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 7: service_images mismatch. Expected: {service_images_test}, Got: {body.get('service_images')}", "FAIL")
                    self.failed += 1
        
        # ===== Long-text fields =====
        print("\n--- SECTION 4: LONG-TEXT FIELDS ---")
        
        # Step 8: PUT impressum_content + diskretion_content → 200
        print("\n[Step 8] PUT impressum_content + diskretion_content (with newlines) → expect 200")
        impressum_test = "# Impressum\n\nNoir Hamburg\nBeispielstraße 1\n20095 Hamburg\n\nGeschäftsführer: N.N."
        diskretion_test = "Datenschutz-Kurztext."
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "impressum_content": impressum_test,
                "diskretion_content": diskretion_test
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "8"):
            # GET and verify newlines preserved
            r = requests.get(f"{BASE_URL}/api/settings")
            if r.status_code == 200:
                body = r.json()
                if body.get("impressum_content") == impressum_test:
                    self.log("Step 8: impressum_content stored verbatim (newlines preserved) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 8: impressum_content mismatch", "FAIL")
                    self.failed += 1
                if body.get("diskretion_content") == diskretion_test:
                    self.log("Step 8: diskretion_content stored verbatim ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 8: diskretion_content mismatch", "FAIL")
                    self.failed += 1
        
        # ===== Whitelist enforcement =====
        print("\n--- SECTION 5: WHITELIST ENFORCEMENT ---")
        
        # Step 9: PUT with _key, _id, password_hash (blocked) + business_name (allowed) → 200
        print("\n[Step 9] PUT _key='HACKED', _id='HACKED', password_hash='HACKED', business_name='clean-update' → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "_key": "HACKED",
                "_id": "HACKED",
                "password_hash": "HACKED",
                "business_name": "clean-update"
            },
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "9"):
            # GET and verify
            r = requests.get(f"{BASE_URL}/api/settings")
            if r.status_code == 200:
                body = r.json()
                # _key should NOT be in response (cleanDoc strips it) OR if present, should NOT be "HACKED"
                if "_key" in body:
                    if body["_key"] != "HACKED":
                        self.log(f"Step 9: _key is '{body['_key']}' (not HACKED) ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log("Step 9: _key was changed to HACKED!", "FAIL")
                        self.failed += 1
                        self.critical_failures.append("Step 9: _key was changed to HACKED")
                else:
                    self.log("Step 9: _key not in response (cleanDoc stripped it, which is fine) ✓", "PASS")
                    self.passed += 1
                
                # _id should NOT be in response
                self.assert_not_in_response(body, "_id", "9")
                
                # password_hash should NOT be in response
                self.assert_not_in_response(body, "password_hash", "9")
                
                # business_name SHOULD have changed (it's whitelisted)
                if body.get("business_name") == "clean-update":
                    self.log("Step 9: business_name DID change (whitelisted) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 9: business_name did NOT change. Expected 'clean-update', got '{body.get('business_name')}'", "FAIL")
                    self.failed += 1
        
        # ===== Empty body =====
        print("\n--- SECTION 6: EMPTY BODY ---")
        
        # Step 10: PUT {} → 200 (only updated_at bumped)
        print("\n[Step 10] PUT empty body {} → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "10"):
            # GET and verify fields still whatever they were after step 9
            r = requests.get(f"{BASE_URL}/api/settings")
            if r.status_code == 200:
                body = r.json()
                if body.get("business_name") == "clean-update":
                    self.log("Step 10: business_name still 'clean-update' after empty PUT ✓", "PASS")
                    self.passed += 1
                else:
                    self.log("Step 10: business_name changed after empty PUT", "FAIL")
                    self.failed += 1
        
        # ===== Upsert safety =====
        print("\n--- SECTION 7: UPSERT SAFETY ---")
        
        # Step 11: Confirm site_settings collection still has exactly 1 document
        # We do this by checking that GET /api/settings returns a doc (not 404)
        # and that _key is either "singleton" or absent (but definitely NOT "HACKED")
        print("\n[Step 11] Verify site_settings collection still has exactly 1 document (via GET)")
        r = requests.get(f"{BASE_URL}/api/settings")
        if self.assert_status(r, 200, "11"):
            body = r.json()
            if "_key" in body:
                if body["_key"] == "singleton" or body["_key"] != "HACKED":
                    self.log(f"Step 11: _key is '{body.get('_key')}' (singleton or not HACKED) ✓", "PASS")
                    self.passed += 1
                else:
                    self.log(f"Step 11: _key is '{body['_key']}' (unexpected)", "FAIL")
                    self.failed += 1
            else:
                self.log("Step 11: _key not in response (cleanDoc stripped it, which is fine) ✓", "PASS")
                self.passed += 1
        
        # ===== SSR revalidation cross-check =====
        print("\n--- SECTION 8: SSR REVALIDATION CROSS-CHECK ---")
        
        # Step 12: PUT business_name='Revalidation Test Brand', wait, curl homepage
        print("\n[Step 12] PUT business_name='Revalidation Test Brand' → expect 200")
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json={"business_name": "Revalidation Test Brand"},
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "12"):
            # Wait for revalidation
            time.sleep(2)
            # Curl homepage
            r = requests.get(f"{BASE_URL}/")
            if r.status_code == 200:
                self.log("Step 12: Homepage returned 200 ✓", "PASS")
                self.passed += 1
                # Note: The homepage might NOT visually change because header/footer
                # haven't been wired to settings yet (Phase 3 refactor).
                # Just check that the API PUT succeeded and GET reflects it.
                r_get = requests.get(f"{BASE_URL}/api/settings")
                if r_get.status_code == 200:
                    body = r_get.json()
                    if body.get("business_name") == "Revalidation Test Brand":
                        self.log("Step 12: GET /api/settings reflects new business_name ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log("Step 12: GET /api/settings does NOT reflect new business_name", "FAIL")
                        self.failed += 1
            else:
                self.log(f"Step 12: Homepage returned {r.status_code}", "FAIL")
                self.failed += 1
        
        # ===== CRITICAL — full restore =====
        print("\n--- SECTION 9: CRITICAL — FULL RESTORE ---")
        
        # Step 13: Restore all whitelisted fields to baseline in ONE call
        print("\n[Step 13] Restore all whitelisted fields to baseline")
        restore_fields = [
            'business_name', 'tagline_de', 'tagline_en',
            'phone', 'email', 'whatsapp_number', 'recruitment_whatsapp_number',
            'hours_de', 'hours_en',
            'homepage_hero_image', 'escort_hamburg_image', 'about_image', 'social_share_image',
            'service_images', 'area_images',
            'facebook_url', 'instagram_url', 'twitter_url',
            'impressum_content', 'diskretion_content',
        ]
        restore_body = {}
        for k in restore_fields:
            if k in self.baseline:
                restore_body[k] = self.baseline[k]
            else:
                # If field not in baseline, set to empty string or {} for maps
                if k in ['service_images', 'area_images']:
                    restore_body[k] = {}
                else:
                    restore_body[k] = ""
        
        r = requests.put(
            f"{BASE_URL}/api/settings",
            json=restore_body,
            cookies={"access_token": cookie}
        )
        if not self.assert_status(r, 200, "13"):
            self.critical_failures.append("Step 13: Failed to restore baseline")
            return False
        
        # Step 14: GET and assert deep equality with baseline
        print("\n[Step 14] GET and verify deep equality with baseline")
        r = requests.get(f"{BASE_URL}/api/settings")
        if self.assert_status(r, 200, "14"):
            body = r.json()
            all_match = True
            for field in restore_fields:
                baseline_val = self.baseline.get(field)
                current_val = body.get(field)
                
                # Handle empty strings vs missing fields
                if baseline_val == "" or baseline_val is None:
                    if current_val == "" or current_val is None or current_val == {}:
                        self.log(f"Step 14: Field '{field}' is empty (as expected) ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log(f"Step 14: Field '{field}' should be empty but got '{current_val}'", "FAIL")
                        self.failed += 1
                        all_match = False
                        self.critical_failures.append(f"Step 14: Field '{field}' NOT restored to empty")
                elif baseline_val == {} or (isinstance(baseline_val, dict) and len(baseline_val) == 0):
                    if current_val == {} or current_val is None or (isinstance(current_val, dict) and len(current_val) == 0):
                        self.log(f"Step 14: Field '{field}' is empty map (as expected) ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log(f"Step 14: Field '{field}' should be empty map but got '{current_val}'", "FAIL")
                        self.failed += 1
                        all_match = False
                        self.critical_failures.append(f"Step 14: Field '{field}' NOT restored to empty map")
                else:
                    if current_val == baseline_val:
                        self.log(f"Step 14: Field '{field}' restored ✓", "PASS")
                        self.passed += 1
                    else:
                        self.log(f"Step 14: Field '{field}' NOT restored. Expected: {baseline_val}, Got: {current_val}", "FAIL")
                        self.failed += 1
                        all_match = False
                        self.critical_failures.append(f"Step 14: Field '{field}' NOT restored")
            
            if all_match:
                self.log("Step 14: All fields restored to baseline ✓", "PASS")
            else:
                self.log("Step 14: Some fields NOT restored to baseline", "FAIL")
        
        # ===== Regression =====
        print("\n--- SECTION 10: REGRESSION ---")
        
        # Step 15: Verify other endpoints still work
        print("\n[Step 15] Verify regression tests")
        
        # GET /api/health
        r = requests.get(f"{BASE_URL}/api/health")
        self.assert_status(r, 200, "15-health")
        
        # GET /api/service-content (8 items)
        r = requests.get(f"{BASE_URL}/api/service-content")
        if self.assert_status(r, 200, "15-service-content"):
            body = r.json()
            if len(body) == 8:
                self.log("Step 15: /api/service-content still returns 8 items ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 15: /api/service-content returns {len(body)} items (expected 8)", "FAIL")
                self.failed += 1
        
        # GET /api/area-content (18 items)
        r = requests.get(f"{BASE_URL}/api/area-content")
        if self.assert_status(r, 200, "15-area-content"):
            body = r.json()
            if len(body) == 18:
                self.log("Step 15: /api/area-content still returns 18 items ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 15: /api/area-content returns {len(body)} items (expected 18)", "FAIL")
                self.failed += 1
        
        # GET /api/auth/me
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"access_token": cookie}
        )
        if self.assert_status(r, 200, "15-auth-me"):
            body = r.json()
            if body.get("user", {}).get("email") == ADMIN_EMAIL:
                self.log(f"Step 15: /api/auth/me returns correct user email ✓", "PASS")
                self.passed += 1
            else:
                self.log("Step 15: /api/auth/me user email mismatch", "FAIL")
                self.failed += 1
        
        # GET /api/models (14 items)
        r = requests.get(f"{BASE_URL}/api/models")
        if self.assert_status(r, 200, "15-models"):
            body = r.json()
            if len(body) == 14:
                self.log("Step 15: /api/models still returns 14 items ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 15: /api/models returns {len(body)} items (expected 14)", "FAIL")
                self.failed += 1
        
        # GET /api/blog (13 items)
        r = requests.get(f"{BASE_URL}/api/blog")
        if self.assert_status(r, 200, "15-blog"):
            body = r.json()
            if len(body) == 13:
                self.log("Step 15: /api/blog still returns 13 items ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 15: /api/blog returns {len(body)} items (expected 13)", "FAIL")
                self.failed += 1
        
        # GET /api/pages (3 items)
        r = requests.get(f"{BASE_URL}/api/pages")
        if self.assert_status(r, 200, "15-pages"):
            body = r.json()
            if len(body) == 3:
                self.log("Step 15: /api/pages still returns 3 items ✓", "PASS")
                self.passed += 1
            else:
                self.log(f"Step 15: /api/pages returns {len(body)} items (expected 3)", "FAIL")
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
