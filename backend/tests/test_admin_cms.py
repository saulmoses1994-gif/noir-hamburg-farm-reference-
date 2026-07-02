"""Regression tests for the admin CMS enhancements:
    - GET/PUT /api/settings
    - POST /api/auth/change-password (with revert)
    - GET/DELETE /api/media
    - GET /api/sitemap/status
    - Model SEO meta overrides (bio_en fallback + auto/override rendering)
"""
import os
import time

import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://client-portal-385.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"
SSR = BASE
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirAdmin2026!")


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return s


# --------------------------------------------------------------------------- #
# Site Settings
# --------------------------------------------------------------------------- #
def test_settings_public_get_returns_defaults():
    """GET /api/settings is public and always returns a full settings object."""
    r = requests.get(f"{API}/settings", timeout=10)
    assert r.status_code == 200
    d = r.json()
    for key in ("business_name", "tagline_de", "tagline_en", "phone", "email",
                "whatsapp_number", "hours_de", "hours_en"):
        assert key in d, f"missing {key}"
        assert d[key], f"{key} is empty"


def test_settings_put_requires_admin():
    r = requests.put(f"{API}/settings", json={"business_name": "x"}, timeout=10)
    assert r.status_code in (401, 422)


def test_settings_round_trip(admin_session):
    """PUT then GET returns the same values (settings persist)."""
    original = requests.get(f"{API}/settings", timeout=10).json()
    try:
        patched = {**original, "phone": "+49 40 9999 8888", "hours_de": "Mo–Fr · 09–20 Uhr"}
        r = admin_session.put(f"{API}/settings", json=patched, timeout=15)
        assert r.status_code == 200
        assert r.json()["phone"] == "+49 40 9999 8888"
        # Public GET reflects the change immediately.
        assert requests.get(f"{API}/settings", timeout=10).json()["phone"] == "+49 40 9999 8888"
    finally:
        admin_session.put(f"{API}/settings", json=original, timeout=15)


# --------------------------------------------------------------------------- #
# Password change
# --------------------------------------------------------------------------- #
def test_change_password_wrong_current_fails(admin_session):
    r = admin_session.post(f"{API}/auth/change-password",
                           json={"current_password": "not-the-real-one", "new_password": "SomethingLongEnough1"},
                           timeout=15)
    assert r.status_code == 401


def test_change_password_short_new_rejected(admin_session):
    r = admin_session.post(f"{API}/auth/change-password",
                           json={"current_password": ADMIN_PASSWORD, "new_password": "short"},
                           timeout=15)
    # Pydantic validation → 422
    assert r.status_code == 422


def test_change_password_round_trip():
    """Change password to a temporary value, then revert; both must succeed
    AND the temporary value must actually authenticate.

    Skipped under pytest-xdist to prevent races with other tests that log in
    as the same admin during the (brief) rotation window."""
    if os.environ.get("PYTEST_XDIST_WORKER") is not None:
        pytest.skip("destructive: shares global admin password with other workers")

    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200

    temp = "TempRotationPw!2026"
    try:
        # 1) rotate
        r = s.post(f"{API}/auth/change-password",
                   json={"current_password": ADMIN_PASSWORD, "new_password": temp},
                   timeout=15)
        assert r.status_code == 200, r.text
        # 2) old password no longer works
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 401
        # 3) new password works
        s2 = requests.Session()
        r = s2.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": temp}, timeout=15)
        assert r.status_code == 200
    finally:
        # revert so subsequent tests + real admin login keep working
        s3 = requests.Session()
        s3.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": temp}, timeout=15)
        s3.post(f"{API}/auth/change-password",
                json={"current_password": temp, "new_password": ADMIN_PASSWORD}, timeout=15)


# --------------------------------------------------------------------------- #
# Media library
# --------------------------------------------------------------------------- #
def test_media_list_requires_admin():
    r = requests.get(f"{API}/media", timeout=10)
    assert r.status_code == 401


def test_media_list_returns_items(admin_session):
    r = admin_session.get(f"{API}/media", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    # Should have at least the seeded upload from earlier sessions.
    for it in items:
        assert "id" in it and "url" in it and "storage_path" in it


def test_media_delete_requires_admin():
    r = requests.delete(f"{API}/media/does-not-exist", timeout=10)
    assert r.status_code == 401


def test_media_delete_missing_returns_404(admin_session):
    r = admin_session.delete(f"{API}/media/definitely-not-a-real-file-id", timeout=15)
    assert r.status_code == 404


# --------------------------------------------------------------------------- #
# Sitemap dashboard widget
# --------------------------------------------------------------------------- #
def test_sitemap_status_requires_admin():
    r = requests.get(f"{API}/sitemap/status", timeout=10)
    assert r.status_code == 401


def test_sitemap_status_counts_match(admin_session):
    r = admin_session.get(f"{API}/sitemap/status", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["services"] == 8
    assert d["locations"] == 18
    assert d["static"] == 9
    assert d["models"] >= 14
    # Total is the sum of the parts
    assert d["total"] == d["static"] + d["services"] + d["locations"] + d["models"] + d["blog_posts"] + d["pages"]
    assert d["sitemap_url"] == "/api/sitemap.xml"


# --------------------------------------------------------------------------- #
# Model SEO meta overrides
# --------------------------------------------------------------------------- #
def test_model_seo_meta_override_ssr(admin_session):
    """When meta_title is set, SSR renders it instead of the auto-generated one."""
    # Seed a temporary model with an explicit meta_title
    payload = {
        "name": f"SEO Meta Test {int(time.time())}",
        "age": 27, "bio": "test bio", "short_tagline": "test",
        "height_cm": 170, "languages": ["Deutsch"], "services": [], "locations": [],
        "available": True, "featured": False,
        "meta_title": "Custom SEO Title Regression",
        "meta_description": "Custom SEO description regression body.",
        "meta_title_en": "Custom EN Title Regression",
        "meta_description_en": "Custom EN description regression body.",
    }
    r = admin_session.post(f"{API}/models", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    slug = r.json()["slug"]
    try:
        html_de = requests.get(f"{SSR}/models/{slug}", timeout=15).text
        assert "<title>Custom SEO Title Regression</title>" in html_de
        assert 'content="Custom SEO description regression body."' in html_de

        html_en = requests.get(f"{SSR}/en/models/{slug}", timeout=15).text
        assert "<title>Custom EN Title Regression</title>" in html_en
        assert 'content="Custom EN description regression body."' in html_en
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)
