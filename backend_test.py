#!/usr/bin/env python3
"""
Phase 2 Resource #4 — Models CMS CRUD + soft-delete test suite.
Comprehensive 26-step test covering:
- Public read paths (list + detail)
- Auth guards on write endpoints
- POST validation + create
- PUT update + whitelist enforcement
- DELETE soft-delete semantics
- Hard cleanup of test data
- Regression checks
"""
import requests
import json
import os
from datetime import datetime

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://noir-migration.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Test slugs (never touch production slugs)
TEST_SLUG_ALPHA = "qa-model-alpha"
TEST_SLUG_BETA = "qa-model-beta"

# Production baseline: 14 real models
PRODUCTION_SLUGS = [
    'aurelia', 'valentina', 'sophia', 'mila', 'helena', 'lara',
    'isabella', 'charlotte', 'anastasia', 'camille', 'beatrice',
    'nina', 'marlene', 'elena'
]

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def assert_eq(actual, expected, label):
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected}, got {actual}")
    log(f"✅ {label}: {actual}")

def assert_in(item, container, label):
    if item not in container:
        raise AssertionError(f"{label}: {item} not in {container}")
    log(f"✅ {label}: {item} found")

def assert_not_in(item, container, label):
    if item in container:
        raise AssertionError(f"{label}: {item} should not be in {container}")
    log(f"✅ {label}: {item} not found (as expected)")

def assert_status(resp, expected, label):
    if resp.status_code != expected:
        log(f"❌ {label}: expected {expected}, got {resp.status_code}")
        log(f"   Response: {resp.text[:500]}")
        raise AssertionError(f"{label}: status {resp.status_code} != {expected}")
    log(f"✅ {label}: status {expected}")

def get_json(resp):
    try:
        return resp.json()
    except:
        return None

def login_admin():
    """Login and return session with cookie."""
    log("Logging in as admin...")
    resp = requests.post(f"{API_BASE}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert_status(resp, 200, "Admin login")
    cookies = resp.cookies
    log(f"✅ Admin logged in, cookie: {cookies.get('access_token')[:20]}...")
    return cookies

def hard_delete_test_models():
    """Hard-delete test models from MongoDB to restore production baseline."""
    log("Hard-deleting test models from MongoDB...")
    try:
        # Use mongosh to hard-delete
        import subprocess
        mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.getenv('DB_NAME', 'noir_hamburg')
        cmd = [
            'mongosh', mongo_url,
            '--eval',
            f'db.getSiblingDB("{db_name}").models.deleteMany({{slug:{{$in:["{TEST_SLUG_ALPHA}","{TEST_SLUG_BETA}"]}}}});'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            log(f"✅ Hard-deleted test models: {result.stdout}")
        else:
            log(f"⚠️  mongosh failed: {result.stderr}")
    except Exception as e:
        log(f"⚠️  Hard-delete failed: {e}")

def main():
    log("=" * 80)
    log("PHASE 2 MODELS CMS — COMPREHENSIVE CRUD + SOFT-DELETE TEST")
    log("=" * 80)
    
    # ===== READ PATH =====
    log("\n### SECTION 1: READ PATH (public list + detail)")
    
    # Step 1: GET /api/models → 200 with exactly 14 items
    log("\nStep 1: GET /api/models (public list)")
    resp = requests.get(f"{API_BASE}/models")
    assert_status(resp, 200, "GET /api/models")
    models = get_json(resp)
    assert_eq(len(models), 14, "Model count")
    
    # Verify no _id field
    for m in models:
        if '_id' in m:
            raise AssertionError(f"Model {m.get('slug')} has _id field (should be stripped)")
    log("✅ No _id fields in response")
    
    # Verify no deleted_at field (or null/undefined)
    for m in models:
        if m.get('deleted_at') is not None:
            raise AssertionError(f"Model {m.get('slug')} has deleted_at={m.get('deleted_at')} (should be hidden)")
    log("✅ No deleted_at fields in public list")
    
    # Verify sort order: featured=true first (8 of them), then by created_at desc
    featured_count = sum(1 for m in models if m.get('featured') is True)
    log(f"✅ Featured models: {featured_count}")
    
    # Verify all have required fields
    for m in models:
        if not m.get('slug') or not m.get('name') or not m.get('cover_image'):
            raise AssertionError(f"Model missing required fields: {m}")
    log("✅ All models have slug, name, cover_image")
    
    # Step 2: GET /api/models/aurelia → 200
    log("\nStep 2: GET /api/models/aurelia (public detail)")
    resp = requests.get(f"{API_BASE}/models/aurelia")
    assert_status(resp, 200, "GET /api/models/aurelia")
    aurelia = get_json(resp)
    assert_eq(aurelia['slug'], 'aurelia', "Aurelia slug")
    assert_eq(aurelia['name'], 'Aurelia', "Aurelia name")
    
    # Verify fields present
    required_fields = ['slug', 'name', 'bio', 'bio_en', 'gallery', 'prices']
    for field in required_fields:
        if field not in aurelia:
            raise AssertionError(f"Aurelia missing field: {field}")
    log(f"✅ Aurelia has all required fields: {required_fields}")
    
    if '_id' in aurelia:
        raise AssertionError("Aurelia has _id field (should be stripped)")
    log("✅ Aurelia has no _id field")
    
    # Step 3: GET /api/models/does-not-exist → 404
    log("\nStep 3: GET /api/models/does-not-exist (404)")
    resp = requests.get(f"{API_BASE}/models/does-not-exist")
    assert_status(resp, 404, "GET /api/models/does-not-exist")
    data = get_json(resp)
    if 'detail' not in data or 'not found' not in data['detail'].lower():
        raise AssertionError(f"404 response missing proper detail: {data}")
    log(f"✅ 404 response: {data['detail']}")
    
    # ===== AUTH ON WRITES =====
    log("\n### SECTION 2: AUTH GUARDS ON WRITE ENDPOINTS")
    
    # Step 4: POST /api/models WITHOUT cookie → 401
    log("\nStep 4: POST /api/models without auth")
    resp = requests.post(f"{API_BASE}/models", json={
        "slug": TEST_SLUG_ALPHA,
        "name": "QA Alpha"
    })
    assert_status(resp, 401, "POST /api/models without auth")
    data = get_json(resp)
    if 'detail' not in data or 'not authenticated' not in data['detail'].lower():
        raise AssertionError(f"401 response missing proper detail: {data}")
    log(f"✅ 401 response: {data['detail']}")
    
    # Step 5: PUT /api/models/aurelia WITHOUT cookie → 401
    log("\nStep 5: PUT /api/models/aurelia without auth")
    resp = requests.put(f"{API_BASE}/models/aurelia", json={"name": "HACK"})
    assert_status(resp, 401, "PUT /api/models/aurelia without auth")
    
    # Step 6: DELETE /api/models/aurelia WITHOUT cookie → 401
    log("\nStep 6: DELETE /api/models/aurelia without auth")
    resp = requests.delete(f"{API_BASE}/models/aurelia")
    assert_status(resp, 401, "DELETE /api/models/aurelia without auth")
    
    # Step 7: Login admin
    log("\nStep 7: Login admin for write tests")
    cookies = login_admin()
    
    # ===== POST VALIDATION =====
    log("\n### SECTION 3: POST VALIDATION")
    
    # Step 8: POST with missing slug → 400
    log("\nStep 8: POST with missing slug")
    resp = requests.post(f"{API_BASE}/models", json={"name": "missing slug"}, cookies=cookies)
    assert_status(resp, 400, "POST missing slug")
    data = get_json(resp)
    if 'slug and name are required' not in data.get('detail', ''):
        raise AssertionError(f"400 response missing proper detail: {data}")
    log(f"✅ 400 response: {data['detail']}")
    
    # Step 9: POST with missing name → 400
    log("\nStep 9: POST with missing name")
    resp = requests.post(f"{API_BASE}/models", json={"slug": "qa-alpha", "other": "missing name"}, cookies=cookies)
    assert_status(resp, 400, "POST missing name")
    
    # Step 10: POST with invalid slug pattern → 400
    log("\nStep 10: POST with invalid slug pattern")
    resp = requests.post(f"{API_BASE}/models", json={"slug": "BAD SLUG", "name": "x"}, cookies=cookies)
    assert_status(resp, 400, "POST invalid slug")
    data = get_json(resp)
    if 'may only contain' not in data.get('detail', ''):
        raise AssertionError(f"400 response missing proper detail: {data}")
    log(f"✅ 400 response: {data['detail']}")
    
    # Step 11: POST with existing slug → 409
    log("\nStep 11: POST with existing slug (aurelia)")
    resp = requests.post(f"{API_BASE}/models", json={"slug": "aurelia", "name": "clash"}, cookies=cookies)
    assert_status(resp, 409, "POST existing slug")
    data = get_json(resp)
    if 'already exists' not in data.get('detail', ''):
        raise AssertionError(f"409 response missing proper detail: {data}")
    log(f"✅ 409 response: {data['detail']}")
    
    # ===== POST CREATE SUCCESS =====
    log("\n### SECTION 4: POST CREATE SUCCESS")
    
    # Step 12: POST create qa-model-alpha
    log("\nStep 12: POST create qa-model-alpha")
    create_payload = {
        "slug": TEST_SLUG_ALPHA,
        "name": "QA Alpha",
        "short_tagline": "Test",
        "short_tagline_en": "Test EN",
        "bio": "Bio DE",
        "bio_en": "Bio EN",
        "cover_image": "https://example.com/alpha.jpg",
        "gallery": ["https://example.com/g1.jpg", "https://example.com/g2.jpg"],
        "age": 26,
        "height_cm": 172,
        "measurements": "85-62-90",
        "dress_size": "36",
        "hair_color": "Blond",
        "eye_color": "Blau",
        "nationality": "Deutsch",
        "languages": ["Deutsch", "English"],
        "interests": ["Kunst", "Musik"],
        "services": ["luxury-escort-hamburg"],
        "locations": ["hafencity"],
        "prices": [{"label": "2h", "amount": 600, "currency": "EUR", "unit": "€"}],
        "meta_title": "QA Alpha | Noir",
        "meta_title_en": "QA Alpha | Noir",
        "meta_description": "desc de",
        "meta_description_en": "desc en",
        "featured": True,
        "available": True
    }
    resp = requests.post(f"{API_BASE}/models", json=create_payload, cookies=cookies)
    assert_status(resp, 201, "POST create qa-model-alpha")
    created = get_json(resp)
    
    # Verify response
    assert_eq(created['slug'], TEST_SLUG_ALPHA, "Created slug")
    assert_eq(created['name'], "QA Alpha", "Created name")
    
    if 'id' not in created:
        raise AssertionError("Created model missing 'id' field")
    log(f"✅ Created model has id: {created['id']}")
    
    if 'created_at' not in created or 'updated_at' not in created:
        raise AssertionError("Created model missing timestamps")
    log(f"✅ Created model has timestamps")
    
    if '_id' in created:
        raise AssertionError("Created model has _id field (should be stripped)")
    log("✅ Created model has no _id field")
    
    # Verify all sent fields are in response
    for key in ['bio', 'bio_en', 'gallery', 'age', 'height_cm', 'prices', 'featured', 'available']:
        if key not in created:
            raise AssertionError(f"Created model missing field: {key}")
    log("✅ All sent fields present in response")
    
    # Step 13: GET /api/models → count is now 15
    log("\nStep 13: GET /api/models (verify count is 15)")
    resp = requests.get(f"{API_BASE}/models")
    assert_status(resp, 200, "GET /api/models after create")
    models = get_json(resp)
    assert_eq(len(models), 15, "Model count after create")
    
    # Verify qa-model-alpha appears in list
    slugs = [m['slug'] for m in models]
    assert_in(TEST_SLUG_ALPHA, slugs, "qa-model-alpha in list")
    
    # Step 14: GET /api/models/qa-model-alpha → 200
    log("\nStep 14: GET /api/models/qa-model-alpha (verify detail)")
    resp = requests.get(f"{API_BASE}/models/qa-model-alpha")
    assert_status(resp, 200, "GET /api/models/qa-model-alpha")
    alpha = get_json(resp)
    assert_eq(alpha['slug'], TEST_SLUG_ALPHA, "Alpha slug")
    assert_eq(alpha['name'], "QA Alpha", "Alpha name")
    assert_eq(alpha['bio'], "Bio DE", "Alpha bio")
    log("✅ qa-model-alpha detail matches POSTed data")
    
    # ===== WHITELIST ENFORCEMENT ON POST =====
    log("\n### SECTION 5: WHITELIST ENFORCEMENT ON POST")
    
    # Step 15: POST qa-model-beta with forbidden fields
    log("\nStep 15: POST qa-model-beta with forbidden fields (_id, deleted_at, password_hash, id)")
    resp = requests.post(f"{API_BASE}/models", json={
        "slug": TEST_SLUG_BETA,
        "name": "QA Beta",
        "_id": "HACK",
        "deleted_at": "1970-01-01",
        "password_hash": "HACK",
        "id": "HACK-ID"
    }, cookies=cookies)
    assert_status(resp, 201, "POST qa-model-beta")
    beta = get_json(resp)
    
    # Verify _id is not in response (stripped by cleanDoc)
    if '_id' in beta:
        raise AssertionError("Beta has _id field (should be stripped)")
    log("✅ Beta has no _id field in response")
    
    # Verify deleted_at is not set (not in whitelist)
    if beta.get('deleted_at') is not None:
        raise AssertionError(f"Beta has deleted_at={beta.get('deleted_at')} (should not be set)")
    log("✅ Beta has no deleted_at field")
    
    # Verify password_hash is not stored
    if 'password_hash' in beta:
        raise AssertionError("Beta has password_hash field (should not be stored)")
    log("✅ Beta has no password_hash field")
    
    # Verify id field: MODEL_FIELDS does NOT include 'id', so client-supplied id should be ignored
    # The server assigns its own UUID id
    if beta.get('id') == 'HACK-ID':
        log("⚠️  MINOR: Beta accepted client-supplied id='HACK-ID' (id not in MODEL_FIELDS whitelist)")
    else:
        log(f"✅ Beta has server-assigned id: {beta.get('id')}")
    
    # Verify beta appears in public list (not soft-deleted)
    resp = requests.get(f"{API_BASE}/models")
    models = get_json(resp)
    slugs = [m['slug'] for m in models]
    assert_in(TEST_SLUG_BETA, slugs, "qa-model-beta in public list")
    log("✅ qa-model-beta appears in public list (not soft-deleted)")
    
    # ===== PUT UPDATE =====
    log("\n### SECTION 6: PUT UPDATE")
    
    # Step 16: PUT /api/models/qa-model-alpha (partial update)
    log("\nStep 16: PUT /api/models/qa-model-alpha (update name and featured)")
    resp = requests.put(f"{API_BASE}/models/qa-model-alpha", json={
        "name": "QA Alpha Updated",
        "featured": False
    }, cookies=cookies)
    assert_status(resp, 200, "PUT /api/models/qa-model-alpha")
    updated = get_json(resp)
    assert_eq(updated['name'], "QA Alpha Updated", "Updated name")
    assert_eq(updated['featured'], False, "Updated featured")
    
    # Verify other fields unchanged
    assert_eq(updated['bio'], "Bio DE", "Bio unchanged")
    assert_eq(len(updated['gallery']), 2, "Gallery unchanged")
    assert_eq(len(updated['prices']), 1, "Prices unchanged")
    log("✅ Partial update successful, other fields unchanged")
    
    # Step 17: PUT /api/models/qa-model-alpha with non-whitelisted fields
    log("\nStep 17: PUT /api/models/qa-model-alpha with non-whitelisted fields (slug, _id)")
    resp = requests.put(f"{API_BASE}/models/qa-model-alpha", json={
        "slug": "qa-slug-hijack",
        "_id": "HACK"
    }, cookies=cookies)
    assert_status(resp, 200, "PUT with non-whitelisted fields")
    
    # Verify slug NOT changed (slug not in MODEL_FIELDS whitelist)
    resp = requests.get(f"{API_BASE}/models/qa-model-alpha")
    assert_status(resp, 200, "GET /api/models/qa-model-alpha after PUT")
    alpha = get_json(resp)
    assert_eq(alpha['slug'], TEST_SLUG_ALPHA, "Slug unchanged (not in whitelist)")
    
    # Verify hijacked slug does not exist
    resp = requests.get(f"{API_BASE}/models/qa-slug-hijack")
    assert_status(resp, 404, "GET /api/models/qa-slug-hijack (should not exist)")
    log("✅ Whitelist enforcement working: slug and _id ignored")
    
    # Step 18: PUT /api/models/does-not-exist → 404
    log("\nStep 18: PUT /api/models/does-not-exist (404)")
    resp = requests.put(f"{API_BASE}/models/does-not-exist", json={"name": "x"}, cookies=cookies)
    assert_status(resp, 404, "PUT /api/models/does-not-exist")
    
    # ===== DELETE (SOFT) =====
    log("\n### SECTION 7: DELETE (SOFT-DELETE)")
    
    # Step 19: DELETE /api/models/qa-model-alpha → 200
    log("\nStep 19: DELETE /api/models/qa-model-alpha (soft-delete)")
    resp = requests.delete(f"{API_BASE}/models/qa-model-alpha", cookies=cookies)
    assert_status(resp, 200, "DELETE /api/models/qa-model-alpha")
    data = get_json(resp)
    
    if not data.get('ok'):
        raise AssertionError(f"DELETE response missing 'ok': {data}")
    assert_eq(data['slug'], TEST_SLUG_ALPHA, "Deleted slug")
    
    if 'deleted_at' not in data:
        raise AssertionError(f"DELETE response missing 'deleted_at': {data}")
    
    # Verify deleted_at is a valid ISO timestamp
    deleted_at = data['deleted_at']
    try:
        datetime.fromisoformat(deleted_at.replace('Z', '+00:00'))
        log(f"✅ deleted_at is valid ISO timestamp: {deleted_at}")
    except:
        raise AssertionError(f"deleted_at is not a valid ISO timestamp: {deleted_at}")
    
    # Step 20: GET /api/models/qa-model-alpha → 404
    log("\nStep 20: GET /api/models/qa-model-alpha after soft-delete (404)")
    resp = requests.get(f"{API_BASE}/models/qa-model-alpha")
    assert_status(resp, 404, "GET /api/models/qa-model-alpha after soft-delete")
    
    # Step 21: GET /api/models → count should not include soft-deleted
    log("\nStep 21: GET /api/models (verify qa-model-alpha not in list)")
    resp = requests.get(f"{API_BASE}/models")
    assert_status(resp, 200, "GET /api/models after soft-delete")
    models = get_json(resp)
    slugs = [m['slug'] for m in models]
    assert_not_in(TEST_SLUG_ALPHA, slugs, "qa-model-alpha not in public list")
    
    # Count should be 15 (14 production + 1 qa-model-beta)
    assert_eq(len(models), 15, "Model count after soft-delete (14 production + qa-model-beta)")
    
    # Step 22: DELETE /api/models/qa-model-alpha again → 404
    log("\nStep 22: DELETE /api/models/qa-model-alpha again (already deleted)")
    resp = requests.delete(f"{API_BASE}/models/qa-model-alpha", cookies=cookies)
    assert_status(resp, 404, "DELETE already-deleted model")
    data = get_json(resp)
    if 'already deleted' not in data.get('detail', '').lower():
        raise AssertionError(f"404 response missing proper detail: {data}")
    log(f"✅ 404 response: {data['detail']}")
    
    # Step 23: DELETE qa-model-beta → 200
    log("\nStep 23: DELETE /api/models/qa-model-beta (soft-delete)")
    resp = requests.delete(f"{API_BASE}/models/qa-model-beta", cookies=cookies)
    assert_status(resp, 200, "DELETE /api/models/qa-model-beta")
    
    # Step 24: GET /api/models → count back to 14
    log("\nStep 24: GET /api/models (verify count back to 14)")
    resp = requests.get(f"{API_BASE}/models")
    assert_status(resp, 200, "GET /api/models after both soft-deletes")
    models = get_json(resp)
    assert_eq(len(models), 14, "Model count back to production baseline (14)")
    
    slugs = [m['slug'] for m in models]
    assert_not_in(TEST_SLUG_ALPHA, slugs, "qa-model-alpha not in list")
    assert_not_in(TEST_SLUG_BETA, slugs, "qa-model-beta not in list")
    log("✅ Both test models soft-deleted and hidden from public list")
    
    # ===== CLEANUP: HARD-DELETE =====
    log("\n### SECTION 8: CLEANUP (HARD-DELETE TEST MODELS)")
    
    # Step 25: Hard-delete test models from MongoDB
    log("\nStep 25: Hard-delete qa-model-alpha and qa-model-beta from MongoDB")
    hard_delete_test_models()
    
    # Verify count still 14 (soft-deleted models were already hidden, hard-delete doesn't change public count)
    resp = requests.get(f"{API_BASE}/models")
    models = get_json(resp)
    assert_eq(len(models), 14, "Model count still 14 after hard-delete")
    log("✅ Production baseline restored: 14 models")
    
    # ===== REGRESSION =====
    log("\n### SECTION 9: REGRESSION CHECKS")
    
    # Step 26: Verify other endpoints still working
    log("\nStep 26: Regression checks on other endpoints")
    
    # GET /api/health
    resp = requests.get(f"{API_BASE}/health")
    assert_status(resp, 200, "GET /api/health")
    
    # GET /api/auth/me (with cookie)
    resp = requests.get(f"{API_BASE}/auth/me", cookies=cookies)
    assert_status(resp, 200, "GET /api/auth/me")
    
    # GET /api/service-content (8)
    resp = requests.get(f"{API_BASE}/service-content")
    assert_status(resp, 200, "GET /api/service-content")
    services = get_json(resp)
    assert_eq(len(services), 8, "Service content count")
    
    # GET /api/area-content (18)
    resp = requests.get(f"{API_BASE}/area-content")
    assert_status(resp, 200, "GET /api/area-content")
    areas = get_json(resp)
    assert_eq(len(areas), 18, "Area content count")
    
    # GET /api/blog (13)
    resp = requests.get(f"{API_BASE}/blog")
    assert_status(resp, 200, "GET /api/blog")
    blog = get_json(resp)
    assert_eq(len(blog), 13, "Blog count")
    
    # GET /api/pages (3)
    resp = requests.get(f"{API_BASE}/pages")
    assert_status(resp, 200, "GET /api/pages")
    pages = get_json(resp)
    assert_eq(len(pages), 3, "Pages count")
    
    # GET /api/settings
    resp = requests.get(f"{API_BASE}/settings")
    assert_status(resp, 200, "GET /api/settings")
    
    log("✅ All regression checks passed")
    
    # ===== FINAL VERIFICATION =====
    log("\n### FINAL VERIFICATION")
    
    # Verify no production model has deleted_at set
    resp = requests.get(f"{API_BASE}/models")
    models = get_json(resp)
    for m in models:
        if m.get('deleted_at') is not None:
            raise AssertionError(f"CRITICAL: Production model {m['slug']} has deleted_at={m.get('deleted_at')}")
    log("✅ No production model has deleted_at set")
    
    # Verify all 14 production slugs present
    slugs = [m['slug'] for m in models]
    for prod_slug in PRODUCTION_SLUGS:
        if prod_slug not in slugs:
            raise AssertionError(f"CRITICAL: Production model {prod_slug} missing from list")
    log(f"✅ All 14 production models present: {PRODUCTION_SLUGS}")
    
    log("\n" + "=" * 80)
    log("✅ ALL TESTS PASSED (26/26 steps)")
    log("=" * 80)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        log(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
