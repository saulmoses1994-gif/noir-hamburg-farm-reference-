#!/usr/bin/env python3
"""
Phase 2 Resource #6 — Pages CMS CRUD + draft/publish + soft-delete
Comprehensive 30-step test plan
"""
import os
import sys
import requests
from datetime import datetime

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://noir-migration.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Production baseline: 3 pages, all published=true, none soft-deleted
PRODUCTION_SLUGS = [
    "diskretion-und-datenschutz-noir-hamburg",
    "professionelle-standards-noir-hamburg",
    "so-funktioniert-eine-buchung-noir-hamburg"
]

# Test slugs (destructive, will be hard-deleted at end)
TEST_SLUGS = ["qa-page-draft", "qa-page-live"]

session = requests.Session()
cookie_jar = {}

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_get(path, expected_status=200, description=""):
    url = f"{API_BASE}{path}"
    log(f"GET {path} — {description}")
    try:
        r = session.get(url, cookies=cookie_jar, timeout=10)
        log(f"  → {r.status_code}")
        if r.status_code != expected_status:
            log(f"  ❌ Expected {expected_status}, got {r.status_code}")
            log(f"  Response: {r.text[:500]}")
            return None
        return r.json() if r.status_code != 204 else {}
    except Exception as e:
        log(f"  ❌ Exception: {e}")
        return None

def test_post(path, payload, expected_status=200, description=""):
    url = f"{API_BASE}{path}"
    log(f"POST {path} — {description}")
    try:
        r = session.post(url, json=payload, cookies=cookie_jar, timeout=10)
        log(f"  → {r.status_code}")
        if r.status_code != expected_status:
            log(f"  ❌ Expected {expected_status}, got {r.status_code}")
            log(f"  Response: {r.text[:500]}")
            return None
        return r.json() if r.status_code != 204 else {}
    except Exception as e:
        log(f"  ❌ Exception: {e}")
        return None

def test_put(path, payload, expected_status=200, description=""):
    url = f"{API_BASE}{path}"
    log(f"PUT {path} — {description}")
    try:
        r = session.put(url, json=payload, cookies=cookie_jar, timeout=10)
        log(f"  → {r.status_code}")
        if r.status_code != expected_status:
            log(f"  ❌ Expected {expected_status}, got {r.status_code}")
            log(f"  Response: {r.text[:500]}")
            return None
        return r.json() if r.status_code != 204 else {}
    except Exception as e:
        log(f"  ❌ Exception: {e}")
        return None

def test_delete(path, expected_status=200, description=""):
    url = f"{API_BASE}{path}"
    log(f"DELETE {path} — {description}")
    try:
        r = session.delete(url, cookies=cookie_jar, timeout=10)
        log(f"  → {r.status_code}")
        if r.status_code != expected_status:
            log(f"  ❌ Expected {expected_status}, got {r.status_code}")
            log(f"  Response: {r.text[:500]}")
            return None
        return r.json() if r.status_code != 204 else {}
    except Exception as e:
        log(f"  ❌ Exception: {e}")
        return None

def login_admin():
    log("=== LOGIN AS ADMIN ===")
    r = session.post(f"{API_BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    if r.status_code != 200:
        log(f"❌ Login failed: {r.status_code} {r.text}")
        sys.exit(1)
    # Extract access_token cookie
    if 'access_token' in r.cookies:
        cookie_jar['access_token'] = r.cookies['access_token']
        log(f"✅ Logged in, access_token cookie set")
    else:
        log(f"❌ No access_token cookie in response")
        sys.exit(1)

def hard_delete_test_pages():
    """Hard-delete test pages from MongoDB"""
    log("=== CLEANUP: HARD-DELETE TEST PAGES ===")
    try:
        from pymongo import MongoClient
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'noir_hamburg')
        client = MongoClient(mongo_url)
        db = client[db_name]
        result = db.pages.delete_many({'slug': {'$in': TEST_SLUGS}})
        log(f"✅ Hard-deleted {result.deleted_count} test pages from MongoDB")
        # Verify count
        count = db.pages.count_documents({})
        log(f"✅ MongoDB pages collection count: {count}")
        if count != 3:
            log(f"⚠️  Expected 3 pages, got {count}")
        client.close()
    except Exception as e:
        log(f"❌ Hard-delete failed: {e}")

def main():
    log("=" * 80)
    log("PHASE 2 RESOURCE #6 — PAGES CMS CRUD + DRAFT/PUBLISH + SOFT-DELETE")
    log("=" * 80)
    
    passed = 0
    failed = 0
    
    # ===== READ =====
    log("\n=== SECTION 1: READ PATH (3 tests) ===")
    
    # 1. GET /api/pages → 200, exactly 3 items
    data = test_get("/pages", 200, "Public list, hide drafts AND soft-deleted")
    if data is not None:
        if len(data) == 3:
            log(f"  ✅ Exactly 3 items")
            # Check each has required fields
            for item in data:
                if not all(k in item for k in ['slug', 'title', 'h1', 'intro', 'content', 'published']):
                    log(f"  ❌ Missing required fields in item: {item.get('slug', 'unknown')}")
                    failed += 1
                    break
                if item.get('published') != True:
                    log(f"  ❌ Item {item['slug']} has published={item.get('published')}, expected True")
                    failed += 1
                    break
                if '_id' in item:
                    log(f"  ❌ Item {item['slug']} has _id field (should be stripped)")
                    failed += 1
                    break
            else:
                log(f"  ✅ All items have required fields, published=true, no _id")
                passed += 1
        else:
            log(f"  ❌ Expected 3 items, got {len(data)}")
            failed += 1
    else:
        failed += 1
    
    # 2. GET /api/pages/diskretion-und-datenschutz-noir-hamburg → 200
    data = test_get("/pages/diskretion-und-datenschutz-noir-hamburg", 200, "Public detail for production page")
    if data is not None:
        if data.get('slug') == 'diskretion-und-datenschutz-noir-hamburg':
            if data.get('meta_title') == 'Diskretion & Datenschutz — Noir Hamburg Premium Escort':
                if 'content' in data and len(data['content']) > 100:
                    log(f"  ✅ Has content (long HTML), meta_title correct")
                    passed += 1
                else:
                    log(f"  ❌ Content too short or missing")
                    failed += 1
            else:
                log(f"  ❌ meta_title mismatch: {data.get('meta_title')}")
                failed += 1
        else:
            log(f"  ❌ Slug mismatch")
            failed += 1
    else:
        failed += 1
    
    # 3. GET /api/pages/does-not-exist → 404
    data = test_get("/pages/does-not-exist", 404, "404 on non-existent slug")
    if data is not None:
        if data.get('detail') == 'Page not found':
            log(f"  ✅ 404 with correct detail message")
            passed += 1
        else:
            log(f"  ❌ Wrong detail message: {data.get('detail')}")
            failed += 1
    else:
        failed += 1
    
    # ===== AUTH =====
    log("\n=== SECTION 2: AUTH GUARDS (4 tests) ===")
    
    # 4. POST /api/pages no cookie → 401
    data = test_post("/pages", {"slug": "test", "title": "test"}, 401, "POST without cookie")
    if data is not None:
        log(f"  ✅ 401 without cookie")
        passed += 1
    else:
        failed += 1
    
    # 5. PUT no cookie → 401
    data = test_put("/pages/test", {"title": "test"}, 401, "PUT without cookie")
    if data is not None:
        log(f"  ✅ 401 without cookie")
        passed += 1
    else:
        failed += 1
    
    # 6. DELETE no cookie → 401
    data = test_delete("/pages/test", 401, "DELETE without cookie")
    if data is not None:
        log(f"  ✅ 401 without cookie")
        passed += 1
    else:
        failed += 1
    
    # 7. Login admin
    login_admin()
    passed += 1
    
    # ===== POST VALIDATION =====
    log("\n=== SECTION 3: POST VALIDATION (4 tests) ===")
    
    # 8. POST missing slug → 400
    data = test_post("/pages", {"title": "missing slug"}, 400, "POST missing slug")
    if data is not None:
        if 'slug and title are required' in data.get('detail', ''):
            log(f"  ✅ 400 with correct detail")
            passed += 1
        else:
            log(f"  ❌ Wrong detail: {data.get('detail')}")
            failed += 1
    else:
        failed += 1
    
    # 9. POST missing title → 400
    data = test_post("/pages", {"slug": "missing-title"}, 400, "POST missing title")
    if data is not None:
        if 'slug and title are required' in data.get('detail', ''):
            log(f"  ✅ 400 with correct detail")
            passed += 1
        else:
            log(f"  ❌ Wrong detail: {data.get('detail')}")
            failed += 1
    else:
        failed += 1
    
    # 10. POST invalid slug pattern → 400
    data = test_post("/pages", {"slug": "Has Spaces", "title": "x"}, 400, "POST invalid slug pattern")
    if data is not None:
        if 'may only contain a-z, 0-9 and hyphens' in data.get('detail', ''):
            log(f"  ✅ 400 with slug-regex detail")
            passed += 1
        else:
            log(f"  ❌ Wrong detail: {data.get('detail')}")
            failed += 1
    else:
        failed += 1
    
    # 11. POST existing slug → 409
    data = test_post("/pages", {"slug": "diskretion-und-datenschutz-noir-hamburg", "title": "clash"}, 409, "POST existing slug")
    if data is not None:
        log(f"  ✅ 409 conflict")
        passed += 1
    else:
        failed += 1
    
    # ===== POST + PUT + DELETE FLOW =====
    log("\n=== SECTION 4: POST + PUT + DELETE FLOW (16 tests) ===")
    
    # 12. POST qa-page-draft (published=false) → 201
    payload = {
        "slug": "qa-page-draft",
        "title": "QA Draft",
        "h1": "QA",
        "intro": "i",
        "content": "# hi",
        "published": False
    }
    data = test_post("/pages", payload, 201, "Create draft page")
    if data is not None:
        if data.get('slug') == 'qa-page-draft' and data.get('published') == False:
            if 'id' in data and len(data['id']) == 36:  # UUID
                if '_id' not in data:
                    log(f"  ✅ Created draft with UUID id, published=false, no _id")
                    passed += 1
                else:
                    log(f"  ❌ Response has _id field")
                    failed += 1
            else:
                log(f"  ❌ No UUID id in response")
                failed += 1
        else:
            log(f"  ❌ Slug or published mismatch")
            failed += 1
    else:
        failed += 1
    
    # 13. GET /api/pages → still 3 items (draft hidden)
    data = test_get("/pages", 200, "Public list should still be 3 (draft hidden)")
    if data is not None:
        if len(data) == 3:
            log(f"  ✅ Still 3 items (draft hidden)")
            passed += 1
        else:
            log(f"  ❌ Expected 3 items, got {len(data)}")
            failed += 1
    else:
        failed += 1
    
    # 14. GET /api/pages/qa-page-draft → 404 (draft hidden)
    data = test_get("/pages/qa-page-draft", 404, "Draft hidden from public detail")
    if data is not None:
        log(f"  ✅ 404 on draft")
        passed += 1
    else:
        failed += 1
    
    # 15. POST qa-page-live (published=true) → 201
    payload = {
        "slug": "qa-page-live",
        "title": "QA Live",
        "h1": "QA",
        "content": "live",
        "published": True
    }
    data = test_post("/pages", payload, 201, "Create published page")
    if data is not None:
        if data.get('slug') == 'qa-page-live' and data.get('published') == True:
            log(f"  ✅ Created published page")
            passed += 1
        else:
            log(f"  ❌ Slug or published mismatch")
            failed += 1
    else:
        failed += 1
    
    # 16. GET /api/pages → 4 items now
    data = test_get("/pages", 200, "Public list should be 4 now")
    if data is not None:
        if len(data) == 4:
            if any(p['slug'] == 'qa-page-live' for p in data):
                log(f"  ✅ 4 items, includes qa-page-live")
                passed += 1
            else:
                log(f"  ❌ qa-page-live not in list")
                failed += 1
        else:
            log(f"  ❌ Expected 4 items, got {len(data)}")
            failed += 1
    else:
        failed += 1
    
    # 17. GET /api/pages/qa-page-live → 200
    data = test_get("/pages/qa-page-live", 200, "Published page accessible")
    if data is not None:
        if data.get('slug') == 'qa-page-live':
            log(f"  ✅ Published page accessible")
            passed += 1
        else:
            log(f"  ❌ Slug mismatch")
            failed += 1
    else:
        failed += 1
    
    # 18. PUT qa-page-draft published=true → 200, list → 5 items
    data = test_put("/pages/qa-page-draft", {"published": True}, 200, "Publish draft")
    if data is not None:
        if data.get('published') == True:
            log(f"  ✅ Draft published")
            # Check list
            list_data = test_get("/pages", 200, "List should be 5 now")
            if list_data is not None and len(list_data) == 5:
                log(f"  ✅ List now has 5 items")
                passed += 1
            else:
                log(f"  ❌ Expected 5 items, got {len(list_data) if list_data else 'None'}")
                failed += 1
        else:
            log(f"  ❌ published not True")
            failed += 1
    else:
        failed += 1
    
    # 19. PUT qa-page-live published=false → 200, list → 4 items
    data = test_put("/pages/qa-page-live", {"published": False}, 200, "Unpublish qa-page-live")
    if data is not None:
        if data.get('published') == False:
            log(f"  ✅ Page unpublished")
            # Check list
            list_data = test_get("/pages", 200, "List should be 4 now")
            if list_data is not None and len(list_data) == 4:
                # qa-page-live should be gone, qa-page-draft should be there
                slugs = [p['slug'] for p in list_data]
                if 'qa-page-draft' in slugs and 'qa-page-live' not in slugs:
                    log(f"  ✅ List has 4 items, qa-page-live gone, qa-page-draft present")
                    passed += 1
                else:
                    log(f"  ❌ Unexpected slugs in list: {slugs}")
                    failed += 1
            else:
                log(f"  ❌ Expected 4 items, got {len(list_data) if list_data else 'None'}")
                failed += 1
        else:
            log(f"  ❌ published not False")
            failed += 1
    else:
        failed += 1
    
    # 20. PUT qa-page-draft (update title, h1, meta_title) → 200
    payload = {
        "title": "QA Updated",
        "h1": "QA H1 Updated",
        "meta_title": "QA | Noir"
    }
    data = test_put("/pages/qa-page-draft", payload, 200, "Partial update")
    if data is not None:
        if data.get('title') == 'QA Updated' and data.get('h1') == 'QA H1 Updated' and data.get('meta_title') == 'QA | Noir':
            log(f"  ✅ All three fields updated")
            passed += 1
        else:
            log(f"  ❌ Fields not updated correctly")
            failed += 1
    else:
        failed += 1
    
    # ===== WHITELIST =====
    log("\n=== SECTION 5: WHITELIST ENFORCEMENT (1 test) ===")
    
    # 21. PUT with forbidden fields → 200, fields ignored
    payload = {
        "slug": "HACK",
        "_id": "HACK",
        "deleted_at": "1970-01-01"
    }
    data = test_put("/pages/qa-page-draft", payload, 200, "PUT with forbidden fields")
    if data is not None:
        # Verify slug still qa-page-draft
        detail_data = test_get("/pages/qa-page-draft", 200, "Verify slug unchanged")
        if detail_data is not None:
            if detail_data.get('slug') == 'qa-page-draft':
                log(f"  ✅ Slug still qa-page-draft (forbidden fields ignored)")
                passed += 1
            else:
                log(f"  ❌ Slug changed to {detail_data.get('slug')}")
                failed += 1
        else:
            failed += 1
    else:
        failed += 1
    
    # ===== 404 =====
    log("\n=== SECTION 6: 404 HANDLING (1 test) ===")
    
    # 22. PUT /api/pages/does-not-exist → 404
    data = test_put("/pages/does-not-exist", {"title": "test"}, 404, "PUT non-existent slug")
    if data is not None:
        if data.get('detail') == 'Page not found':
            log(f"  ✅ 404 with correct detail")
            passed += 1
        else:
            log(f"  ❌ Wrong detail: {data.get('detail')}")
            failed += 1
    else:
        failed += 1
    
    # ===== DELETE =====
    log("\n=== SECTION 7: DELETE (SOFT-DELETE) (5 tests) ===")
    
    # 23. DELETE qa-page-draft → 200
    data = test_delete("/pages/qa-page-draft", 200, "Soft-delete qa-page-draft")
    if data is not None:
        if data.get('ok') == True and data.get('slug') == 'qa-page-draft' and 'deleted_at' in data:
            log(f"  ✅ Soft-deleted with deleted_at: {data.get('deleted_at')}")
            passed += 1
        else:
            log(f"  ❌ Response missing ok/slug/deleted_at")
            failed += 1
    else:
        failed += 1
    
    # 24. GET /api/pages/qa-page-draft → 404
    data = test_get("/pages/qa-page-draft", 404, "Soft-deleted page hidden")
    if data is not None:
        log(f"  ✅ 404 on soft-deleted page")
        passed += 1
    else:
        failed += 1
    
    # 25. DELETE qa-page-draft again → 404
    data = test_delete("/pages/qa-page-draft", 404, "DELETE already-deleted")
    if data is not None:
        if 'Page not found or already deleted' in data.get('detail', ''):
            log(f"  ✅ 404 with correct detail")
            passed += 1
        else:
            log(f"  ❌ Wrong detail: {data.get('detail')}")
            failed += 1
    else:
        failed += 1
    
    # 26. DELETE qa-page-live → 200
    data = test_delete("/pages/qa-page-live", 200, "Soft-delete qa-page-live")
    if data is not None:
        if data.get('ok') == True:
            log(f"  ✅ Soft-deleted qa-page-live")
            passed += 1
        else:
            log(f"  ❌ Response missing ok")
            failed += 1
    else:
        failed += 1
    
    # 27. GET /api/pages → exactly 3 items (production baseline)
    data = test_get("/pages", 200, "List back to 3 (production baseline)")
    if data is not None:
        if len(data) == 3:
            log(f"  ✅ Exactly 3 items (production baseline restored)")
            passed += 1
        else:
            log(f"  ❌ Expected 3 items, got {len(data)}")
            failed += 1
    else:
        failed += 1
    
    # ===== CLEANUP =====
    log("\n=== SECTION 8: CLEANUP (1 test) ===")
    
    # 28. Hard-delete test pages
    hard_delete_test_pages()
    passed += 1
    
    # ===== REGRESSION =====
    log("\n=== SECTION 9: REGRESSION CHECKS (2 tests) ===")
    
    # 29. Regression checks
    endpoints = [
        ("/health", "health"),
        ("/auth/me", "auth/me"),
        ("/service-content", "service-content (8)"),
        ("/area-content", "area-content (18)"),
        ("/models", "models (14)"),
        ("/blog", "blog (13)"),
        ("/settings", "settings")
    ]
    
    all_ok = True
    for path, desc in endpoints:
        data = test_get(path, 200, f"Regression: {desc}")
        if data is None:
            all_ok = False
            break
        # Verify counts
        if path == "/service-content" and len(data) != 8:
            log(f"  ❌ Expected 8 service-content, got {len(data)}")
            all_ok = False
            break
        if path == "/area-content" and len(data) != 18:
            log(f"  ❌ Expected 18 area-content, got {len(data)}")
            all_ok = False
            break
        if path == "/models" and len(data) != 14:
            log(f"  ❌ Expected 14 models, got {len(data)}")
            all_ok = False
            break
        if path == "/blog" and len(data) != 13:
            log(f"  ❌ Expected 13 blog, got {len(data)}")
            all_ok = False
            break
    
    if all_ok:
        log(f"  ✅ All regression checks passed")
        passed += 1
    else:
        failed += 1
    
    # 30. Verify all 3 production pages still return 200
    all_ok = True
    for slug in PRODUCTION_SLUGS:
        data = test_get(f"/pages/{slug}", 200, f"Production page: {slug}")
        if data is None:
            all_ok = False
            break
        if 'deleted_at' in data:
            log(f"  ❌ Production page {slug} has deleted_at field")
            all_ok = False
            break
        # Verify specific titles
        if slug == "diskretion-und-datenschutz-noir-hamburg":
            if data.get('meta_title') != 'Diskretion & Datenschutz — Noir Hamburg Premium Escort':
                log(f"  ❌ meta_title mismatch for {slug}")
                all_ok = False
                break
    
    if all_ok:
        log(f"  ✅ All 3 production pages accessible with correct titles, no deleted_at")
        passed += 1
    else:
        failed += 1
    
    # ===== SUMMARY =====
    log("\n" + "=" * 80)
    log(f"PAGES CMS TESTING COMPLETE")
    log(f"PASSED: {passed}/30")
    log(f"FAILED: {failed}/30")
    log("=" * 80)
    
    if failed == 0:
        log("✅ ALL TESTS PASSED")
        return 0
    else:
        log(f"❌ {failed} TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())
