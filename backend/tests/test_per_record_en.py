"""
End-to-end tests for the per-record EN translation feature.

Validates that:
  - Admin can save bio_en/short_tagline_en on a Model
  - Admin can save title_en/excerpt_en/content_en on a BlogPost (with bleach
    XSS sanitization applied to content_en too)
  - SSR /en/models/:slug serves the English bio when present, German fallback
    + "EN preview" banner when absent
  - SSR /en/blog/:slug serves the English content when present, falls back
    otherwise
  - The "EN preview" banner is scoped per-record, not site-wide
"""
import os
import requests
import pytest

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://client-portal-385.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"
SSR = BASE_URL

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirAdmin2026!")


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.text}"
    return s


# ---------- Model EN fields ----------

def _create_test_model(session, name, *, bio="Test bio", bio_en="", short_tagline_en=""):
    payload = {
        "name": name,
        "age": 28,
        "bio": bio,
        "short_tagline": "DE tagline",
        "bio_en": bio_en,
        "short_tagline_en": short_tagline_en,
        "height_cm": 170,
        "languages": ["Deutsch", "Englisch"],
        "services": [],
        "locations": [],
        "available": True,
        "featured": False,
    }
    r = session.post(f"{API}/models", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()


def test_model_with_bio_en_serves_english_via_ssr(admin_session):
    import time
    m = _create_test_model(
        admin_session,
        name=f"SEC EN Test Aurelia {int(time.time())}",
        bio="Deutsche Originalbiografie für diesen Test.",
        bio_en="EN BIO MARKER 12345 — fully translated English biography.",
        short_tagline_en="EN TAGLINE MARKER",
    )
    slug = m["slug"]
    try:
        # Fresh slug → cold SSR cache → EN content served immediately
        html_en = requests.get(f"{SSR}/en/models/{slug}", timeout=15).text
        assert "EN BIO MARKER 12345" in html_en
        assert "EN TAGLINE MARKER" in html_en
        assert "EN preview" not in html_en, "Banner must not appear when bio_en is present"
        # DE route serves German
        html_de = requests.get(f"{SSR}/models/{slug}", timeout=15).text
        assert "Deutsche Originalbiografie" in html_de
        assert "EN BIO MARKER 12345" not in html_de
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)


def test_model_without_bio_en_shows_banner_and_german_fallback(admin_session):
    import time
    m = _create_test_model(
        admin_session,
        name=f"SEC EN Fallback Test {int(time.time())}",
        bio="Deutsche Bio als Fallback für EN-Seite.",
        bio_en="",
    )
    slug = m["slug"]
    try:
        html_en = requests.get(f"{SSR}/en/models/{slug}", timeout=15).text
        assert "EN preview" in html_en
        assert "Deutsche Bio als Fallback" in html_en
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)


# ---------- Blog EN fields ----------

def test_blog_with_content_en_serves_english_via_ssr(admin_session):
    payload = {
        "title": "EN BLOG TEST — DE title",
        "excerpt": "DE excerpt",
        "content": "<p>DE body content paragraph.</p>",
        "title_en": "EN BLOG TEST — EN title",
        "excerpt_en": "EN excerpt for the article",
        "content_en": "<p>EN BLOG CONTENT MARKER 67890 — fully translated English article body.</p>",
        "category": "Privacy",
        "published": True,
    }
    created = admin_session.post(f"{API}/blog", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        # EN route renders EN
        html_en = requests.get(f"{SSR}/en/blog/{slug}", timeout=15).text
        assert "EN BLOG CONTENT MARKER 67890" in html_en
        assert "EN BLOG TEST — EN title" in html_en
        assert "EN preview" not in html_en, "Banner must NOT appear when content_en is present"
        # DE route still renders DE
        html_de = requests.get(f"{SSR}/blog/{slug}", timeout=15).text
        assert "DE body content paragraph" in html_de
        assert "EN BLOG CONTENT MARKER" not in html_de
    finally:
        admin_session.delete(f"{API}/blog/{slug}", timeout=15)


def test_blog_content_en_is_bleach_sanitized(admin_session):
    payload = {
        "title": "EN sanitize test",
        "excerpt": "x",
        "content": "<p>de</p>",
        "title_en": "EN sanitize test",
        "excerpt_en": "x",
        "content_en": "<p>safe</p><script>alert(1)</script><img src=x onerror=alert(2)>",
        "category": "Privacy",
        "published": True,
    }
    created = admin_session.post(f"{API}/blog", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        c_en = created.json()["content_en"].lower()
        assert "<script" not in c_en, "<script> must be stripped from content_en"
        assert "onerror" not in c_en, "onerror= must be stripped from content_en"
    finally:
        admin_session.delete(f"{API}/blog/{slug}", timeout=15)


def test_blog_without_content_en_shows_banner_and_german_fallback(admin_session):
    payload = {
        "title": "EN fallback test",
        "excerpt": "german excerpt",
        "content": "<p>GERMAN BLOG BODY MARKER — original German content.</p>",
        "title_en": "",
        "excerpt_en": "",
        "content_en": "",
        "category": "Privacy",
        "published": True,
    }
    created = admin_session.post(f"{API}/blog", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        html_en = requests.get(f"{SSR}/en/blog/{slug}", timeout=15).text
        assert "EN preview" in html_en, "Banner must appear when content_en is empty"
        assert "GERMAN BLOG BODY MARKER" in html_en, "German content shown as fallback"
    finally:
        admin_session.delete(f"{API}/blog/{slug}", timeout=15)


# ---------- Site-wide layout no longer carries the banner ----------

def test_static_en_pages_have_no_banner():
    """EN preview banner must not appear on pages with full EN copy."""
    for path in ["/en", "/en/services", "/en/areas", "/en/faq", "/en/about", "/en/contact"]:
        html = requests.get(SSR + path, timeout=15).text
        assert "EN preview" not in html, f"{path} should not contain banner"
