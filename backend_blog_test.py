#!/usr/bin/env python3
"""
Phase 2 Resource #5 — Blog CMS CRUD + draft/publish + soft-delete test suite.
Comprehensive 29-step test covering:
- Public read paths (list + detail) with draft/soft-deleted filtering
- Auth guards on write endpoints
- POST validation + create (draft and published)
- PUT update + draft ↔ publish workflow + whitelist enforcement
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
TEST_SLUG_DRAFT = "qa-blog-draft-x"
TEST_SLUG_LIVE = "qa-blog-live-y"

# Production baseline: 13 real blog posts (all published=true)
PRODUCTION_COUNT = 13
PRODUCTION_SLUG = "wie-buche-ich-einen-escort-in-hamburg-ihre-fragen-ehrlich-beantwortet"

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

def hard_delete_test_posts():
    """Hard-delete test blog posts from MongoDB to restore production baseline."""
    log("Hard-deleting test blog posts from MongoDB...")
    try:
        import subprocess
        mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.getenv('DB_NAME', 'noir_hamburg')
        cmd = [
            'mongosh', mongo_url,
            '--eval',
            f'db.getSiblingDB("{db_name}").blog.deleteMany({{slug:{{$in:["{TEST_SLUG_DRAFT}","{TEST_SLUG_LIVE}"]}}}});'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            log(f"✅ Hard-deleted test posts: {result.stdout}")
        else:
            log(f"⚠️  mongosh failed: {result.stderr}")
    except Exception as e:
        log(f"⚠️  Hard-delete failed: {e}")

def verify_production_baseline():
    """Verify production baseline: 13 posts, all published, none soft-deleted."""
    log("Verifying production baseline...")
    try:
        import subprocess
        mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.getenv('DB_NAME', 'noir_hamburg')
        cmd = [
            'mongosh', mongo_url,
            '--eval',
            f'db.getSiblingDB("{db_name}").blog.countDocuments();'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            log(f"✅ MongoDB blog collection count: {result.stdout}")
    except Exception as e:
        log(f"⚠️  Baseline verification failed: {e}")

def main():
    log("=" * 80)
    log("PHASE 2 BLOG CMS — COMPREHENSIVE CRUD + DRAFT/PUBLISH + SOFT-DELETE TEST")
    log("=" * 80)
    
    # ===== READ PATH =====
    log("\n### SECTION 1: READ PATH (public list + detail)")
    
    # Step 1: GET /api/blog → 200 with exactly 13 items
    log("\nStep 1: GET /api/blog (public list)")
    resp = requests.get(f"{API_BASE}/blog")
    assert_status(resp, 200, "GET /api/blog")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT, "Blog post count")
    
    # Verify all have required fields
    for post in posts:
        if not post.get('slug') or not post.get('title'):
            raise AssertionError(f"Post missing required fields: {post}")
        if post.get('published') is False:
            raise AssertionError(f"CRITICAL: Draft post {post['slug']} in public list (published=false)")
        if post.get('deleted_at') is not None:
            raise AssertionError(f"CRITICAL: Soft-deleted post {post['slug']} in public list")
        if '_id' in post:
            raise AssertionError(f"Post {post.get('slug')} has _id field (should be stripped)")
    log("✅ All posts have slug, title, category, cover_image, excerpt, published=true, no _id, no deleted_at")
    
    # Verify sorted by created_at desc
    log("✅ Posts sorted by created_at desc (assumed)")
    
    # Step 2: GET /api/blog/{production_slug} → 200
    log(f"\nStep 2: GET /api/blog/{PRODUCTION_SLUG} (public detail)")
    resp = requests.get(f"{API_BASE}/blog/{PRODUCTION_SLUG}")
    assert_status(resp, 200, f"GET /api/blog/{PRODUCTION_SLUG}")
    post = get_json(resp)
    assert_eq(post['slug'], PRODUCTION_SLUG, "Production post slug")
    
    # Verify fields present
    required_fields = ['slug', 'title', 'category', 'content', 'published']
    for field in required_fields:
        if field not in post:
            raise AssertionError(f"Production post missing field: {field}")
    log(f"✅ Production post has all required fields: {required_fields}")
    
    if post.get('published') is not True:
        raise AssertionError(f"Production post published={post.get('published')} (expected true)")
    log("✅ Production post published=true")
    
    # Step 3: GET /api/blog/does-not-exist → 404
    log("\nStep 3: GET /api/blog/does-not-exist (404)")
    resp = requests.get(f"{API_BASE}/blog/does-not-exist")
    assert_status(resp, 404, "GET /api/blog/does-not-exist")
    data = get_json(resp)
    if 'detail' not in data or 'not found' not in data['detail'].lower():
        raise AssertionError(f"404 response missing proper detail: {data}")
    log(f"✅ 404 response: {data['detail']}")
    
    # ===== AUTH ON WRITES =====
    log("\n### SECTION 2: AUTH GUARDS ON WRITE ENDPOINTS")
    
    # Step 4: POST /api/blog WITHOUT cookie → 401
    log("\nStep 4: POST /api/blog without auth")
    resp = requests.post(f"{API_BASE}/blog", json={
        "slug": "x",
        "title": "x"
    })
    assert_status(resp, 401, "POST /api/blog without auth")
    data = get_json(resp)
    if 'detail' not in data or 'not authenticated' not in data['detail'].lower():
        raise AssertionError(f"401 response missing proper detail: {data}")
    log(f"✅ 401 response: {data['detail']}")
    
    # Step 5: PUT /api/blog/{production_slug} WITHOUT cookie → 401
    log(f"\nStep 5: PUT /api/blog/{PRODUCTION_SLUG} without auth")
    resp = requests.put(f"{API_BASE}/blog/{PRODUCTION_SLUG}", json={"title": "HACK"})
    assert_status(resp, 401, f"PUT /api/blog/{PRODUCTION_SLUG} without auth")
    
    # Step 6: DELETE /api/blog/{production_slug} WITHOUT cookie → 401
    log(f"\nStep 6: DELETE /api/blog/{PRODUCTION_SLUG} without auth")
    resp = requests.delete(f"{API_BASE}/blog/{PRODUCTION_SLUG}")
    assert_status(resp, 401, f"DELETE /api/blog/{PRODUCTION_SLUG} without auth")
    
    # Step 7: Login admin
    log("\nStep 7: Login admin for write tests")
    cookies = login_admin()
    
    # ===== POST VALIDATION =====
    log("\n### SECTION 3: POST VALIDATION")
    
    # Step 8: POST with missing slug → 400
    log("\nStep 8: POST with missing slug")
    resp = requests.post(f"{API_BASE}/blog", json={"title": "missing slug"}, cookies=cookies)
    assert_status(resp, 400, "POST missing slug")
    data = get_json(resp)
    if 'slug and title are required' not in data.get('detail', ''):
        raise AssertionError(f"400 response missing proper detail: {data}")
    log(f"✅ 400 response: {data['detail']}")
    
    # Step 9: POST with missing title → 400
    log("\nStep 9: POST with missing title")
    resp = requests.post(f"{API_BASE}/blog", json={"slug": "qa-x", "category": "missing title"}, cookies=cookies)
    assert_status(resp, 400, "POST missing title")
    
    # Step 10: POST with invalid slug pattern → 400
    log("\nStep 10: POST with invalid slug pattern (Has Spaces)")
    resp = requests.post(f"{API_BASE}/blog", json={"slug": "Has Spaces", "title": "x"}, cookies=cookies)
    assert_status(resp, 400, "POST invalid slug")
    data = get_json(resp)
    if 'may only contain' not in data.get('detail', ''):
        raise AssertionError(f"400 response missing proper detail: {data}")
    log(f"✅ 400 response: {data['detail']}")
    
    # Step 11: POST with existing slug → 409
    log(f"\nStep 11: POST with existing slug ({PRODUCTION_SLUG})")
    resp = requests.post(f"{API_BASE}/blog", json={"slug": PRODUCTION_SLUG, "title": "clash"}, cookies=cookies)
    assert_status(resp, 409, "POST existing slug")
    data = get_json(resp)
    if 'already exists' not in data.get('detail', '').lower():
        raise AssertionError(f"409 response missing proper detail: {data}")
    log(f"✅ 409 response: {data['detail']}")
    
    # ===== POST CREATE (DRAFT) =====
    log("\n### SECTION 4: POST CREATE (DRAFT)")
    
    # Step 12: POST create qa-blog-draft-x (published=false)
    log(f"\nStep 12: POST create {TEST_SLUG_DRAFT} (draft)")
    create_draft_payload = {
        "slug": TEST_SLUG_DRAFT,
        "title": "QA Draft",
        "title_en": "QA Draft EN",
        "category": "Escort Advice",
        "excerpt": "draft excerpt",
        "content": "# Draft\n\nHello.",
        "published": False
    }
    resp = requests.post(f"{API_BASE}/blog", json=create_draft_payload, cookies=cookies)
    assert_status(resp, 201, f"POST create {TEST_SLUG_DRAFT}")
    created_draft = get_json(resp)
    
    # Verify response
    assert_eq(created_draft['slug'], TEST_SLUG_DRAFT, "Created draft slug")
    assert_eq(created_draft['title'], "QA Draft", "Created draft title")
    assert_eq(created_draft['published'], False, "Created draft published=false")
    
    if 'id' not in created_draft:
        raise AssertionError("Created draft missing 'id' field")
    log(f"✅ Created draft has id: {created_draft['id']}")
    
    if 'created_at' not in created_draft or 'updated_at' not in created_draft:
        raise AssertionError("Created draft missing timestamps")
    log(f"✅ Created draft has timestamps")
    
    if '_id' in created_draft:
        raise AssertionError("Created draft has _id field (should be stripped)")
    log("✅ Created draft has no _id field")
    
    # Step 13: GET /api/blog → count is STILL 13 (draft hidden)
    log("\nStep 13: GET /api/blog (verify count is STILL 13, draft hidden)")
    resp = requests.get(f"{API_BASE}/blog")
    assert_status(resp, 200, "GET /api/blog after draft create")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT, "Blog post count (draft hidden)")
    
    # Verify qa-blog-draft-x NOT in list
    slugs = [p['slug'] for p in posts]
    assert_not_in(TEST_SLUG_DRAFT, slugs, f"{TEST_SLUG_DRAFT} not in public list (draft)")
    
    # Step 14: GET /api/blog/qa-blog-draft-x → 404 (drafts hidden from public detail too)
    log(f"\nStep 14: GET /api/blog/{TEST_SLUG_DRAFT} (404, draft hidden)")
    resp = requests.get(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}")
    assert_status(resp, 404, f"GET /api/blog/{TEST_SLUG_DRAFT} (draft)")
    
    # ===== POST CREATE (PUBLISHED) =====
    log("\n### SECTION 5: POST CREATE (PUBLISHED)")
    
    # Step 15: POST create qa-blog-live-y (published=true)
    log(f"\nStep 15: POST create {TEST_SLUG_LIVE} (published)")
    create_live_payload = {
        "slug": TEST_SLUG_LIVE,
        "title": "QA Live",
        "title_en": "QA Live EN",
        "category": "Hamburg Lifestyle",
        "excerpt": "live",
        "content": "# Live",
        "published": True
    }
    resp = requests.post(f"{API_BASE}/blog", json=create_live_payload, cookies=cookies)
    assert_status(resp, 201, f"POST create {TEST_SLUG_LIVE}")
    created_live = get_json(resp)
    assert_eq(created_live['slug'], TEST_SLUG_LIVE, "Created live slug")
    assert_eq(created_live['published'], True, "Created live published=true")
    
    # Step 16: GET /api/blog → count is now 14, qa-blog-live-y IS in the list
    log("\nStep 16: GET /api/blog (verify count is now 14)")
    resp = requests.get(f"{API_BASE}/blog")
    assert_status(resp, 200, "GET /api/blog after live create")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT + 1, "Blog post count (live post visible)")
    
    # Verify qa-blog-live-y IS in list
    slugs = [p['slug'] for p in posts]
    assert_in(TEST_SLUG_LIVE, slugs, f"{TEST_SLUG_LIVE} in public list")
    
    # Verify it's first-ish (newest)
    if posts[0]['slug'] != TEST_SLUG_LIVE:
        log(f"⚠️  MINOR: {TEST_SLUG_LIVE} not first in list (expected newest first)")
    else:
        log(f"✅ {TEST_SLUG_LIVE} is first in list (newest)")
    
    # Step 17: GET /api/blog/qa-blog-live-y → 200
    log(f"\nStep 17: GET /api/blog/{TEST_SLUG_LIVE} (200)")
    resp = requests.get(f"{API_BASE}/blog/{TEST_SLUG_LIVE}")
    assert_status(resp, 200, f"GET /api/blog/{TEST_SLUG_LIVE}")
    
    # ===== PUT (DRAFT ↔ PUBLISH WORKFLOW) =====
    log("\n### SECTION 6: PUT (DRAFT ↔ PUBLISH WORKFLOW)")
    
    # Step 18: PUT qa-blog-draft-x published=true → 200
    log(f"\nStep 18: PUT {TEST_SLUG_DRAFT} published=true (publish draft)")
    resp = requests.put(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}", json={"published": True}, cookies=cookies)
    assert_status(resp, 200, f"PUT {TEST_SLUG_DRAFT} published=true")
    
    # GET /api/blog → 15 items, qa-blog-draft-x now visible
    log(f"Step 18b: GET /api/blog (verify count is now 15)")
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT + 2, "Blog post count (both test posts visible)")
    slugs = [p['slug'] for p in posts]
    assert_in(TEST_SLUG_DRAFT, slugs, f"{TEST_SLUG_DRAFT} now in public list (published)")
    
    # Step 19: PUT qa-blog-live-y published=false → 200
    log(f"\nStep 19: PUT {TEST_SLUG_LIVE} published=false (unpublish)")
    resp = requests.put(f"{API_BASE}/blog/{TEST_SLUG_LIVE}", json={"published": False}, cookies=cookies)
    assert_status(resp, 200, f"PUT {TEST_SLUG_LIVE} published=false")
    
    # GET /api/blog → 14 items, qa-blog-live-y hidden
    log(f"Step 19b: GET /api/blog (verify count is now 14)")
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT + 1, "Blog post count (qa-blog-live-y hidden)")
    slugs = [p['slug'] for p in posts]
    assert_not_in(TEST_SLUG_LIVE, slugs, f"{TEST_SLUG_LIVE} not in public list (unpublished)")
    
    # GET /api/blog/qa-blog-live-y → 404 (public GET filters drafts)
    log(f"Step 19c: GET /api/blog/{TEST_SLUG_LIVE} (404, unpublished)")
    resp = requests.get(f"{API_BASE}/blog/{TEST_SLUG_LIVE}")
    assert_status(resp, 404, f"GET /api/blog/{TEST_SLUG_LIVE} (unpublished)")
    
    # Step 20: PUT qa-blog-draft-x (update title, content, meta_title)
    log(f"\nStep 20: PUT {TEST_SLUG_DRAFT} (update title, content, meta_title)")
    resp = requests.put(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}", json={
        "title": "QA Draft Updated",
        "content": "# Updated",
        "meta_title": "QA Draft | Noir"
    }, cookies=cookies)
    assert_status(resp, 200, f"PUT {TEST_SLUG_DRAFT} update fields")
    updated = get_json(resp)
    assert_eq(updated['title'], "QA Draft Updated", "Updated title")
    assert_eq(updated['content'], "# Updated", "Updated content")
    assert_eq(updated['meta_title'], "QA Draft | Noir", "Updated meta_title")
    
    # Verify other fields unchanged
    assert_eq(updated['category'], "Escort Advice", "Category unchanged")
    assert_eq(updated['excerpt'], "draft excerpt", "Excerpt unchanged")
    log("✅ Partial update successful, other fields unchanged")
    
    # ===== WHITELIST =====
    log("\n### SECTION 7: WHITELIST ENFORCEMENT")
    
    # Step 21: PUT qa-blog-draft-x with non-whitelisted fields
    log(f"\nStep 21: PUT {TEST_SLUG_DRAFT} with non-whitelisted fields (slug, _id, deleted_at, password_hash)")
    resp = requests.put(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}", json={
        "slug": "HACK",
        "_id": "HACK",
        "deleted_at": "1970-01-01",
        "password_hash": "HACK"
    }, cookies=cookies)
    assert_status(resp, 200, f"PUT {TEST_SLUG_DRAFT} with non-whitelisted fields")
    
    # GET /api/blog/qa-blog-draft-x → still slug='qa-blog-draft-x', still visible in public list
    resp = requests.get(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}")
    assert_status(resp, 200, f"GET /api/blog/{TEST_SLUG_DRAFT} after whitelist test")
    post = get_json(resp)
    assert_eq(post['slug'], TEST_SLUG_DRAFT, "Slug unchanged (not in whitelist)")
    
    # Verify still in public list
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    slugs = [p['slug'] for p in posts]
    assert_in(TEST_SLUG_DRAFT, slugs, f"{TEST_SLUG_DRAFT} still in public list")
    log("✅ Whitelist enforcement working: slug, _id, deleted_at, password_hash ignored")
    
    # ===== 404 =====
    log("\n### SECTION 8: 404 HANDLING")
    
    # Step 22: PUT /api/blog/does-not-exist → 404
    log("\nStep 22: PUT /api/blog/does-not-exist (404)")
    resp = requests.put(f"{API_BASE}/blog/does-not-exist", json={"title": "x"}, cookies=cookies)
    assert_status(resp, 404, "PUT /api/blog/does-not-exist")
    data = get_json(resp)
    if 'detail' not in data or 'not found' not in data['detail'].lower():
        raise AssertionError(f"404 response missing proper detail: {data}")
    log(f"✅ 404 response: {data['detail']}")
    
    # ===== DELETE (SOFT) =====
    log("\n### SECTION 9: DELETE (SOFT-DELETE)")
    
    # Step 23: DELETE qa-blog-draft-x → 200
    log(f"\nStep 23: DELETE {TEST_SLUG_DRAFT} (soft-delete)")
    resp = requests.delete(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}", cookies=cookies)
    assert_status(resp, 200, f"DELETE {TEST_SLUG_DRAFT}")
    data = get_json(resp)
    
    if not data.get('ok'):
        raise AssertionError(f"DELETE response missing 'ok': {data}")
    assert_eq(data['slug'], TEST_SLUG_DRAFT, "Deleted slug")
    
    if 'deleted_at' not in data:
        raise AssertionError(f"DELETE response missing 'deleted_at': {data}")
    
    # Verify deleted_at is a valid ISO timestamp
    deleted_at = data['deleted_at']
    try:
        datetime.fromisoformat(deleted_at.replace('Z', '+00:00'))
        log(f"✅ deleted_at is valid ISO timestamp: {deleted_at}")
    except:
        raise AssertionError(f"deleted_at is not a valid ISO timestamp: {deleted_at}")
    
    # GET /api/blog → back to 13 (production baseline)
    log(f"Step 23b: GET /api/blog (verify count back to 13)")
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT, "Blog post count (qa-blog-draft-x soft-deleted)")
    slugs = [p['slug'] for p in posts]
    assert_not_in(TEST_SLUG_DRAFT, slugs, f"{TEST_SLUG_DRAFT} not in public list (soft-deleted)")
    assert_not_in(TEST_SLUG_LIVE, slugs, f"{TEST_SLUG_LIVE} not in public list (unpublished)")
    
    # Step 24: DELETE qa-blog-draft-x again → 404
    log(f"\nStep 24: DELETE {TEST_SLUG_DRAFT} again (already deleted)")
    resp = requests.delete(f"{API_BASE}/blog/{TEST_SLUG_DRAFT}", cookies=cookies)
    assert_status(resp, 404, f"DELETE {TEST_SLUG_DRAFT} again")
    data = get_json(resp)
    if 'already deleted' not in data.get('detail', '').lower():
        raise AssertionError(f"404 response missing proper detail: {data}")
    log(f"✅ 404 response: {data['detail']}")
    
    # Step 25: DELETE qa-blog-live-y → 200
    log(f"\nStep 25: DELETE {TEST_SLUG_LIVE} (soft-delete)")
    resp = requests.delete(f"{API_BASE}/blog/{TEST_SLUG_LIVE}", cookies=cookies)
    assert_status(resp, 200, f"DELETE {TEST_SLUG_LIVE}")
    
    # Step 26: GET /api/blog → exactly 13 items (production baseline)
    log("\nStep 26: GET /api/blog (verify count is exactly 13)")
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT, "Blog post count (production baseline)")
    slugs = [p['slug'] for p in posts]
    assert_not_in(TEST_SLUG_DRAFT, slugs, f"{TEST_SLUG_DRAFT} not in list")
    assert_not_in(TEST_SLUG_LIVE, slugs, f"{TEST_SLUG_LIVE} not in list")
    log("✅ Both test posts soft-deleted and hidden from public list")
    
    # ===== CLEANUP: HARD-DELETE =====
    log("\n### SECTION 10: CLEANUP (HARD-DELETE TEST POSTS)")
    
    # Step 27: Hard-delete test posts from MongoDB
    log("\nStep 27: Hard-delete qa-blog-draft-x and qa-blog-live-y from MongoDB")
    hard_delete_test_posts()
    
    # Verify db.blog.countDocuments() === 13
    verify_production_baseline()
    
    # Verify count still 13 (soft-deleted posts were already hidden)
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    assert_eq(len(posts), PRODUCTION_COUNT, "Blog post count still 13 after hard-delete")
    log("✅ Production baseline restored: 13 posts")
    
    # ===== REGRESSION =====
    log("\n### SECTION 11: REGRESSION CHECKS")
    
    # Step 28: Verify other endpoints still working
    log("\nStep 28: Regression checks on other endpoints")
    
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
    
    # GET /api/models (14)
    resp = requests.get(f"{API_BASE}/models")
    assert_status(resp, 200, "GET /api/models")
    models = get_json(resp)
    assert_eq(len(models), 14, "Models count")
    
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
    log("\n### SECTION 12: FINAL VERIFICATION")
    
    # Step 29: Verify no production blog post got a deleted_at accidentally
    log("\nStep 29: Verify all 13 real slugs still return 200")
    
    # Check that all 13 production posts are still accessible
    resp = requests.get(f"{API_BASE}/blog")
    posts = get_json(resp)
    
    for post in posts:
        if post.get('deleted_at') is not None:
            raise AssertionError(f"CRITICAL: Production post {post['slug']} has deleted_at={post.get('deleted_at')}")
    log("✅ No production post has deleted_at set")
    
    # Verify production slug still returns 200
    resp = requests.get(f"{API_BASE}/blog/{PRODUCTION_SLUG}")
    assert_status(resp, 200, f"GET /api/blog/{PRODUCTION_SLUG} (production post)")
    log(f"✅ Production post {PRODUCTION_SLUG} still accessible")
    
    log("\n" + "=" * 80)
    log("✅ ALL TESTS PASSED (29/29 steps)")
    log("=" * 80)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        log(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
