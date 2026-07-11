#!/usr/bin/env python3
"""
Phase 2 Resource #7 — Contacts Inbox Backend Testing
Comprehensive 25-step test plan for contacts CRUD + flags/notes management.
"""
import requests
import json
import sys
from typing import Dict, Any, Optional

BASE_URL = "https://noir-migration.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

class TestRunner:
    def __init__(self):
        self.session = requests.Session()
        self.test_id = None
        self.baseline_stats = None
        self.passed = 0
        self.failed = 0
        
    def log(self, msg: str):
        print(f"  {msg}")
    
    def assert_eq(self, actual, expected, msg: str):
        if actual == expected:
            self.passed += 1
            self.log(f"✅ {msg}")
            return True
        else:
            self.failed += 1
            self.log(f"❌ {msg}")
            self.log(f"   Expected: {expected}")
            self.log(f"   Actual: {actual}")
            return False
    
    def assert_true(self, condition: bool, msg: str):
        if condition:
            self.passed += 1
            self.log(f"✅ {msg}")
            return True
        else:
            self.failed += 1
            self.log(f"❌ {msg}")
            return False
    
    def assert_in(self, item, container, msg: str):
        if item in container:
            self.passed += 1
            self.log(f"✅ {msg}")
            return True
        else:
            self.failed += 1
            self.log(f"❌ {msg}")
            self.log(f"   Item: {item}")
            self.log(f"   Container: {container}")
            return False
    
    def assert_not_in(self, item, container, msg: str):
        if item not in container:
            self.passed += 1
            self.log(f"✅ {msg}")
            return True
        else:
            self.failed += 1
            self.log(f"❌ {msg}")
            return False

    def run_all_tests(self):
        print("\n" + "="*80)
        print("PHASE 2 CONTACTS INBOX — COMPREHENSIVE BACKEND TESTING")
        print("="*80 + "\n")
        
        try:
            # ===== Auth =====
            print("SECTION 1: AUTH GUARDS (5 tests)")
            print("-" * 80)
            self.test_01_get_contacts_no_auth()
            self.test_02_get_stats_no_auth()
            self.test_03_get_contact_detail_no_auth()
            self.test_04_patch_contact_no_auth()
            self.test_05_login_admin()
            
            # ===== Read =====
            print("\nSECTION 2: READ PATH (4 tests)")
            print("-" * 80)
            self.test_06_get_contacts_list()
            self.test_07_get_contacts_stats()
            self.test_08_get_contact_detail()
            self.test_09_get_contact_404()
            
            # ===== PATCH — mark as read =====
            print("\nSECTION 3: PATCH — MARK AS READ (3 tests)")
            print("-" * 80)
            self.test_10_patch_mark_read()
            self.test_11_verify_unread_decreased()
            self.test_12_patch_mark_unread()
            
            # ===== PATCH — starred / archived / notes =====
            print("\nSECTION 4: PATCH — STARRED / ARCHIVED / NOTES (5 tests)")
            print("-" * 80)
            self.test_13_patch_starred()
            self.test_14_patch_archived()
            self.test_15_verify_archived_filter()
            self.test_16_verify_starred_count()
            self.test_17_patch_notes_and_unarchive()
            
            # ===== Whitelist enforcement =====
            print("\nSECTION 5: WHITELIST ENFORCEMENT (2 tests)")
            print("-" * 80)
            self.test_18_whitelist_enforcement()
            self.test_19_no_password_hash()
            
            # ===== PUT alias =====
            print("\nSECTION 6: PUT ALIAS (1 test)")
            print("-" * 80)
            self.test_20_put_alias()
            
            # ===== 404 on PATCH =====
            print("\nSECTION 7: 404 HANDLING (1 test)")
            print("-" * 80)
            self.test_21_patch_404()
            
            # ===== CRITICAL — restore baseline =====
            print("\nSECTION 8: CRITICAL — RESTORE BASELINE (2 tests)")
            print("-" * 80)
            self.test_22_restore_baseline()
            self.test_23_verify_baseline_stats()
            
            # ===== Regression =====
            print("\nSECTION 9: REGRESSION CHECKS (2 tests)")
            print("-" * 80)
            self.test_24_regression_endpoints()
            self.test_25_verify_other_contacts_untouched()
            
        except Exception as e:
            print(f"\n❌ FATAL ERROR: {e}")
            import traceback
            traceback.print_exc()
            self.failed += 1
        
        # Summary
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"Total: {self.passed + self.failed}")
        
        if self.failed == 0:
            print("\n🎉 ALL TESTS PASSED!")
            return 0
        else:
            print(f"\n⚠️  {self.failed} TEST(S) FAILED")
            return 1
    
    # ===== SECTION 1: AUTH GUARDS =====
    
    def test_01_get_contacts_no_auth(self):
        """Step 1: GET /api/contacts without cookie → 401"""
        print("\n[Step 1] GET /api/contacts without cookie")
        r = requests.get(f"{BASE_URL}/contacts")
        self.assert_eq(r.status_code, 401, "Status 401 without auth")
        if r.status_code == 401:
            data = r.json()
            self.assert_in("detail", data, "Response has 'detail' field")
    
    def test_02_get_stats_no_auth(self):
        """Step 2: GET /api/contacts/stats without cookie → 401"""
        print("\n[Step 2] GET /api/contacts/stats without cookie")
        r = requests.get(f"{BASE_URL}/contacts/stats")
        self.assert_eq(r.status_code, 401, "Status 401 without auth")
    
    def test_03_get_contact_detail_no_auth(self):
        """Step 3: GET /api/contacts/{any-id} without cookie → 401"""
        print("\n[Step 3] GET /api/contacts/fake-id without cookie")
        r = requests.get(f"{BASE_URL}/contacts/fake-id")
        self.assert_eq(r.status_code, 401, "Status 401 without auth")
    
    def test_04_patch_contact_no_auth(self):
        """Step 4: PATCH /api/contacts/{any-id} without cookie → 401"""
        print("\n[Step 4] PATCH /api/contacts/fake-id without cookie")
        r = requests.patch(f"{BASE_URL}/contacts/fake-id", json={"read": True})
        self.assert_eq(r.status_code, 401, "Status 401 without auth")
    
    def test_05_login_admin(self):
        """Step 5: Login admin → cookie"""
        print("\n[Step 5] POST /api/auth/login with admin credentials")
        r = self.session.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.assert_eq(r.status_code, 200, "Login successful (200)")
        if r.status_code == 200:
            data = r.json()
            self.assert_in("user", data, "Response has 'user' field")
            self.assert_true("access_token" in r.cookies or "Set-Cookie" in r.headers, 
                           "access_token cookie set")
    
    # ===== SECTION 2: READ PATH =====
    
    def test_06_get_contacts_list(self):
        """Step 6: GET /api/contacts → 200 with array of exactly 80 items"""
        print("\n[Step 6] GET /api/contacts (authenticated)")
        r = self.session.get(f"{BASE_URL}/contacts")
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_true(isinstance(data, list), "Response is array")
            self.assert_eq(len(data), 80, "Exactly 80 contacts returned")
            if len(data) > 0:
                first = data[0]
                self.assert_in("id", first, "Contact has 'id' field")
                self.assert_in("name", first, "Contact has 'name' field")
                self.assert_in("email", first, "Contact has 'email' field")
                self.assert_in("message", first, "Contact has 'message' field")
                self.assert_in("created_at", first, "Contact has 'created_at' field")
                self.assert_not_in("_id", first, "No '_id' field in response")
                # Save first contact ID for later tests
                self.test_id = first["id"]
                self.log(f"   TEST_ID saved: {self.test_id}")
                # Verify sorted by created_at desc (newest first)
                if len(data) > 1:
                    first_date = first.get("created_at", "")
                    second_date = data[1].get("created_at", "")
                    self.assert_true(first_date >= second_date, 
                                   "Sorted by created_at desc (newest first)")
    
    def test_07_get_contacts_stats(self):
        """Step 7: GET /api/contacts/stats → 200 with {unread, total, archived, starred}"""
        print("\n[Step 7] GET /api/contacts/stats")
        r = self.session.get(f"{BASE_URL}/contacts/stats")
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_in("unread", data, "Has 'unread' field")
            self.assert_in("total", data, "Has 'total' field")
            self.assert_in("archived", data, "Has 'archived' field")
            self.assert_in("starred", data, "Has 'starred' field")
            # At the start: unread=80, total=80, archived=0, starred=0
            self.assert_eq(data["unread"], 80, "unread=80 (baseline)")
            self.assert_eq(data["total"], 80, "total=80 (baseline)")
            self.assert_eq(data["archived"], 0, "archived=0 (baseline)")
            self.assert_eq(data["starred"], 0, "starred=0 (baseline)")
            # Save baseline for later comparison
            self.baseline_stats = data
            self.log(f"   Baseline stats saved: {data}")
    
    def test_08_get_contact_detail(self):
        """Step 8: GET /api/contacts/{TEST_ID} → 200 with full doc"""
        print(f"\n[Step 8] GET /api/contacts/{self.test_id}")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.get(f"{BASE_URL}/contacts/{self.test_id}")
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("id"), self.test_id, f"id matches {self.test_id}")
            self.assert_not_in("_id", data, "No '_id' field in response")
    
    def test_09_get_contact_404(self):
        """Step 9: GET /api/contacts/not-a-real-uuid → 404"""
        print("\n[Step 9] GET /api/contacts/not-a-real-uuid")
        r = self.session.get(f"{BASE_URL}/contacts/not-a-real-uuid")
        self.assert_eq(r.status_code, 404, "Status 404")
        if r.status_code == 404:
            data = r.json()
            self.assert_eq(data.get("detail"), "Contact not found", 
                         "Error message: 'Contact not found'")
    
    # ===== SECTION 3: PATCH — MARK AS READ =====
    
    def test_10_patch_mark_read(self):
        """Step 10: PATCH /api/contacts/{TEST_ID} body {"read":true} → 200"""
        print(f"\n[Step 10] PATCH /api/contacts/{self.test_id} mark as read")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={"read": True})
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("read"), True, "read=true in response")
            self.assert_in("updated_at", data, "Has 'updated_at' field")
            self.assert_not_in("_id", data, "No '_id' field in response")
    
    def test_11_verify_unread_decreased(self):
        """Step 11: GET /api/contacts/stats → unread is now 79"""
        print("\n[Step 11] GET /api/contacts/stats (verify unread decreased)")
        r = self.session.get(f"{BASE_URL}/contacts/stats")
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data["unread"], 79, "unread=79 (one dropped)")
            self.assert_eq(data["total"], 80, "total still 80")
    
    def test_12_patch_mark_unread(self):
        """Step 12: PATCH again with {"read":false} → 200, stats back to 80 unread"""
        print(f"\n[Step 12] PATCH /api/contacts/{self.test_id} mark as unread")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={"read": False})
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("read"), False, "read=false in response")
        # Verify stats
        r2 = self.session.get(f"{BASE_URL}/contacts/stats")
        if r2.status_code == 200:
            stats = r2.json()
            self.assert_eq(stats["unread"], 80, "unread back to 80")
    
    # ===== SECTION 4: PATCH — STARRED / ARCHIVED / NOTES =====
    
    def test_13_patch_starred(self):
        """Step 13: PATCH {"starred":true} → 200, stats starred:1"""
        print(f"\n[Step 13] PATCH /api/contacts/{self.test_id} starred=true")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={"starred": True})
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("starred"), True, "starred=true in response")
        # Verify stats
        r2 = self.session.get(f"{BASE_URL}/contacts/stats")
        if r2.status_code == 200:
            stats = r2.json()
            self.assert_eq(stats["starred"], 1, "starred=1 in stats")
    
    def test_14_patch_archived(self):
        """Step 14: PATCH {"archived":true} → 200"""
        print(f"\n[Step 14] PATCH /api/contacts/{self.test_id} archived=true")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={"archived": True})
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("archived"), True, "archived=true in response")
    
    def test_15_verify_archived_filter(self):
        """Step 15: GET /api/contacts → 79 items, GET /api/contacts?archived=1 → 1 item"""
        print("\n[Step 15] Verify archived filter")
        # Default list (archived hidden)
        r1 = self.session.get(f"{BASE_URL}/contacts")
        self.assert_eq(r1.status_code, 200, "Status 200 for default list")
        if r1.status_code == 200:
            data1 = r1.json()
            self.assert_eq(len(data1), 79, "79 items (archived hidden from default view)")
        # Archived list
        r2 = self.session.get(f"{BASE_URL}/contacts?archived=1")
        self.assert_eq(r2.status_code, 200, "Status 200 for archived list")
        if r2.status_code == 200:
            data2 = r2.json()
            self.assert_eq(len(data2), 1, "1 item (the archived one)")
            if len(data2) > 0:
                self.assert_eq(data2[0].get("id"), self.test_id, 
                             "Archived item is TEST_ID")
    
    def test_16_verify_starred_count(self):
        """Step 16: GET /api/contacts/stats → archived:1, starred:0 or 1"""
        print("\n[Step 16] GET /api/contacts/stats (verify archived and starred)")
        r = self.session.get(f"{BASE_URL}/contacts/stats")
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            stats = r.json()
            self.assert_eq(stats["archived"], 1, "archived=1")
            # starred count filters archived != true, so should be 0
            # (starred=true AND archived=true is excluded from starred count)
            self.assert_eq(stats["starred"], 0, 
                         "starred=0 (starred+archived excluded from starred count)")
    
    def test_17_patch_notes_and_unarchive(self):
        """Step 17: PATCH notes + archived=false + starred=false → 200"""
        print(f"\n[Step 17] PATCH /api/contacts/{self.test_id} notes + unarchive + unstar")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        notes_text = "Called 12.02 — booking Fri dinner"
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={
            "notes": notes_text,
            "archived": False,
            "starred": False
        })
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("notes"), notes_text, f"notes='{notes_text}'")
            self.assert_eq(data.get("archived"), False, "archived=false")
            self.assert_eq(data.get("starred"), False, "starred=false")
        # Verify via GET
        r2 = self.session.get(f"{BASE_URL}/contacts/{self.test_id}")
        if r2.status_code == 200:
            data2 = r2.json()
            self.assert_eq(data2.get("notes"), notes_text, 
                         f"GET confirms notes='{notes_text}'")
            self.assert_eq(data2.get("archived"), False, "GET confirms archived=false")
            self.assert_eq(data2.get("starred"), False, "GET confirms starred=false")
    
    # ===== SECTION 5: WHITELIST ENFORCEMENT =====
    
    def test_18_whitelist_enforcement(self):
        """Step 18: PATCH with non-whitelisted fields → 200, fields ignored"""
        print(f"\n[Step 18] PATCH /api/contacts/{self.test_id} with forbidden fields")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        # Get current state
        r_before = self.session.get(f"{BASE_URL}/contacts/{self.test_id}")
        if r_before.status_code != 200:
            self.log("❌ Failed to get contact before PATCH")
            self.failed += 1
            return
        before = r_before.json()
        original_email = before.get("email")
        original_message = before.get("message")
        original_name = before.get("name")
        original_id = before.get("id")
        original_phone = before.get("phone")
        original_status = before.get("status")
        original_created_at = before.get("created_at")
        
        # Try to PATCH forbidden fields
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={
            "email": "HACK@example.com",
            "message": "HACK content",
            "name": "HACK NAME",
            "_id": "HACK",
            "id": "HACK",
            "phone": "HACK",
            "status": "HACK",
            "created_at": "1970-01-01"
        })
        self.assert_eq(r.status_code, 200, "Status 200 (ignored forbidden fields)")
        
        # Verify nothing changed
        r_after = self.session.get(f"{BASE_URL}/contacts/{self.test_id}")
        if r_after.status_code == 200:
            after = r_after.json()
            self.assert_eq(after.get("email"), original_email, 
                         "email UNCHANGED (not in whitelist)")
            self.assert_eq(after.get("message"), original_message, 
                         "message UNCHANGED (not in whitelist)")
            self.assert_eq(after.get("name"), original_name, 
                         "name UNCHANGED (not in whitelist)")
            self.assert_eq(after.get("id"), original_id, 
                         "id UNCHANGED (not in whitelist)")
            self.assert_eq(after.get("phone"), original_phone, 
                         "phone UNCHANGED (not in whitelist)")
            self.assert_eq(after.get("status"), original_status, 
                         "status UNCHANGED (not in whitelist)")
            self.assert_eq(after.get("created_at"), original_created_at, 
                         "created_at UNCHANGED (not in whitelist)")
    
    def test_19_no_password_hash(self):
        """Step 19: Verify no password_hash field appears in response"""
        print(f"\n[Step 19] Verify no password_hash in response")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.get(f"{BASE_URL}/contacts/{self.test_id}")
        if r.status_code == 200:
            data = r.json()
            self.assert_not_in("password_hash", data, "No 'password_hash' field")
    
    # ===== SECTION 6: PUT ALIAS =====
    
    def test_20_put_alias(self):
        """Step 20: PUT /api/contacts/{TEST_ID} {"read":true} → 200"""
        print(f"\n[Step 20] PUT /api/contacts/{self.test_id} (PUT also works)")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.put(f"{BASE_URL}/contacts/{self.test_id}", json={"read": True})
        self.assert_eq(r.status_code, 200, "Status 200 (PUT works)")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("read"), True, "read=true")
        # Verify via GET
        r2 = self.session.get(f"{BASE_URL}/contacts/{self.test_id}")
        if r2.status_code == 200:
            data2 = r2.json()
            self.assert_eq(data2.get("read"), True, "GET confirms read=true")
    
    # ===== SECTION 7: 404 HANDLING =====
    
    def test_21_patch_404(self):
        """Step 21: PATCH /api/contacts/does-not-exist → 404"""
        print("\n[Step 21] PATCH /api/contacts/does-not-exist")
        r = self.session.patch(f"{BASE_URL}/contacts/does-not-exist", json={"read": True})
        self.assert_eq(r.status_code, 404, "Status 404")
        if r.status_code == 404:
            data = r.json()
            self.assert_eq(data.get("detail"), "Contact not found", 
                         "Error message: 'Contact not found'")
    
    # ===== SECTION 8: CRITICAL — RESTORE BASELINE =====
    
    def test_22_restore_baseline(self):
        """Step 22: PATCH restore all flags to baseline → 200"""
        print(f"\n[Step 22] PATCH /api/contacts/{self.test_id} restore baseline")
        if not self.test_id:
            self.log("❌ TEST_ID not set, skipping")
            self.failed += 1
            return
        r = self.session.patch(f"{BASE_URL}/contacts/{self.test_id}", json={
            "read": False,
            "starred": False,
            "archived": False,
            "notes": ""
        })
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            data = r.json()
            self.assert_eq(data.get("read"), False, "read=false")
            self.assert_eq(data.get("starred"), False, "starred=false")
            self.assert_eq(data.get("archived"), False, "archived=false")
            self.assert_eq(data.get("notes"), "", "notes='' (empty)")
    
    def test_23_verify_baseline_stats(self):
        """Step 23: GET /api/contacts/stats → all back to baseline"""
        print("\n[Step 23] GET /api/contacts/stats (verify baseline restored)")
        r = self.session.get(f"{BASE_URL}/contacts/stats")
        self.assert_eq(r.status_code, 200, "Status 200")
        if r.status_code == 200:
            stats = r.json()
            self.assert_eq(stats["unread"], 80, "CRITICAL: unread=80 (baseline)")
            self.assert_eq(stats["total"], 80, "CRITICAL: total=80 (baseline)")
            self.assert_eq(stats["archived"], 0, "CRITICAL: archived=0 (baseline)")
            self.assert_eq(stats["starred"], 0, "CRITICAL: starred=0 (baseline)")
            if stats != self.baseline_stats:
                self.log("⚠️  CRITICAL: Stats differ from baseline!")
                self.log(f"   Baseline: {self.baseline_stats}")
                self.log(f"   Current:  {stats}")
    
    # ===== SECTION 9: REGRESSION =====
    
    def test_24_regression_endpoints(self):
        """Step 24: Verify other endpoints still work"""
        print("\n[Step 24] Regression checks on other endpoints")
        
        # GET /api/health
        r1 = self.session.get(f"{BASE_URL}/health")
        self.assert_eq(r1.status_code, 200, "GET /api/health → 200")
        
        # GET /api/auth/me
        r2 = self.session.get(f"{BASE_URL}/auth/me")
        self.assert_eq(r2.status_code, 200, "GET /api/auth/me → 200")
        
        # GET /api/service-content
        r3 = self.session.get(f"{BASE_URL}/service-content")
        self.assert_eq(r3.status_code, 200, "GET /api/service-content → 200")
        if r3.status_code == 200:
            data3 = r3.json()
            self.assert_eq(len(data3), 8, "8 service items")
        
        # GET /api/area-content
        r4 = self.session.get(f"{BASE_URL}/area-content")
        self.assert_eq(r4.status_code, 200, "GET /api/area-content → 200")
        if r4.status_code == 200:
            data4 = r4.json()
            self.assert_eq(len(data4), 18, "18 area items")
        
        # GET /api/models
        r5 = self.session.get(f"{BASE_URL}/models")
        self.assert_eq(r5.status_code, 200, "GET /api/models → 200")
        if r5.status_code == 200:
            data5 = r5.json()
            self.assert_eq(len(data5), 14, "14 models")
        
        # GET /api/blog
        r6 = self.session.get(f"{BASE_URL}/blog")
        self.assert_eq(r6.status_code, 200, "GET /api/blog → 200")
        if r6.status_code == 200:
            data6 = r6.json()
            self.assert_eq(len(data6), 13, "13 blog posts")
        
        # GET /api/pages
        r7 = self.session.get(f"{BASE_URL}/pages")
        self.assert_eq(r7.status_code, 200, "GET /api/pages → 200")
        if r7.status_code == 200:
            data7 = r7.json()
            self.assert_eq(len(data7), 3, "3 pages")
        
        # GET /api/settings
        r8 = self.session.get(f"{BASE_URL}/settings")
        self.assert_eq(r8.status_code, 200, "GET /api/settings → 200")
    
    def test_25_verify_other_contacts_untouched(self):
        """Step 25: Random-sample 5 other contacts, verify no flags set"""
        print("\n[Step 25] Verify other contacts untouched")
        # Get all contacts
        r = self.session.get(f"{BASE_URL}/contacts")
        if r.status_code != 200:
            self.log("❌ Failed to get contacts list")
            self.failed += 1
            return
        contacts = r.json()
        # Filter out TEST_ID
        other_contacts = [c for c in contacts if c.get("id") != self.test_id]
        # Sample 5 (or fewer if less than 5)
        import random
        sample_size = min(5, len(other_contacts))
        sample = random.sample(other_contacts, sample_size)
        
        self.log(f"   Sampling {sample_size} other contacts...")
        for contact in sample:
            contact_id = contact.get("id")
            r2 = self.session.get(f"{BASE_URL}/contacts/{contact_id}")
            if r2.status_code == 200:
                data = r2.json()
                # These fields should be absent or falsy (production hasn't touched them)
                read_val = data.get("read")
                starred_val = data.get("starred")
                archived_val = data.get("archived")
                notes_val = data.get("notes")
                
                # All should be falsy or absent
                is_clean = (not read_val) and (not starred_val) and (not archived_val) and (not notes_val)
                self.assert_true(is_clean, 
                               f"Contact {contact_id[:8]}... has no flags set")
            else:
                self.log(f"❌ Failed to GET contact {contact_id}")
                self.failed += 1

if __name__ == "__main__":
    runner = TestRunner()
    exit_code = runner.run_all_tests()
    sys.exit(exit_code)
