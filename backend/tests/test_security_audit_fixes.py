"""
Security regression tests for the Feb 2026 audit findings.

SEC-001: anonymous read of unpublished blog/page drafts by slug must 404.
SEC-002: bleach must strip <script>, <iframe>, javascript: URLs, on*= handlers
         from admin-authored rich-text on both create and update paths.
         SSR responses must carry CSP + X-Frame-Options + nosniff + Referrer-Policy.
"""
import os
import requests
import pytest

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://client-portal-385.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"
SSR_BASE = BASE_URL  # SSR is fronted by the same ingress

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirAdmin2026!")


@pytest.fixture(scope="module")
def admin_session():
    """Logged-in session carrying httpOnly access_token cookie."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.text}"
    return s


# ---------- SEC-001 — draft visibility ----------

def test_draft_blog_post_is_hidden_from_anonymous_get_by_slug(admin_session):
    payload = {
        "title": "SEC-001 regression — draft hidden",
        "excerpt": "x",
        "content": "<p>secret draft body</p>",
        "category": "Privacy",
        "published": False,
    }
    created = admin_session.post(f"{API}/blog", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        # Anonymous: must 404
        anon = requests.get(f"{API}/blog/{slug}", timeout=15)
        assert anon.status_code == 404, "anonymous user should NOT see drafts"
        # SSR fall-through: must 404 too
        ssr = requests.get(f"{SSR_BASE}/blog/{slug}", timeout=15)
        assert ssr.status_code == 404
        # Admin: preview must work
        admin = admin_session.get(f"{API}/blog/{slug}", timeout=15)
        assert admin.status_code == 200, "admin should still see drafts"
    finally:
        admin_session.delete(f"{API}/blog/{slug}", timeout=15)


def test_draft_page_is_hidden_from_anonymous_get_by_slug(admin_session):
    payload = {
        "title": "SEC-001 regression — page draft hidden",
        "content": "<p>draft</p>",
        "published": False,
    }
    created = admin_session.post(f"{API}/pages", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        anon = requests.get(f"{API}/pages/{slug}", timeout=15)
        assert anon.status_code == 404
        admin = admin_session.get(f"{API}/pages/{slug}", timeout=15)
        assert admin.status_code == 200
    finally:
        admin_session.delete(f"{API}/pages/{slug}", timeout=15)


# ---------- SEC-002 — bleach sanitization ----------

XSS_PAYLOAD = (
    "<p>safe paragraph</p>"
    "<script>alert(1)</script>"
    "<img src=x onerror=alert(2)>"
    "<a href=\"javascript:alert(3)\">click</a>"
    "<iframe src=\"https://evil.example\"></iframe>"
    "<style>body{display:none}</style>"
)


def _assert_sanitized(content: str):
    lc = content.lower()
    assert "<script" not in lc, f"<script> not stripped: {content!r}"
    assert "onerror" not in lc, f"onerror= not stripped: {content!r}"
    assert "javascript:" not in lc, f"javascript: not stripped: {content!r}"
    assert "<iframe" not in lc, f"<iframe> not stripped: {content!r}"
    assert "<style" not in lc, f"<style> not stripped: {content!r}"


def test_bleach_strips_dangerous_html_on_blog_create(admin_session):
    payload = {
        "title": "SEC-002 regression — blog create",
        "excerpt": "x",
        "content": XSS_PAYLOAD,
        "category": "Privacy",
        "published": True,
    }
    created = admin_session.post(f"{API}/blog", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        _assert_sanitized(created.json()["content"])
        rt = requests.get(f"{API}/blog/{slug}", timeout=15).json()
        _assert_sanitized(rt["content"])
    finally:
        admin_session.delete(f"{API}/blog/{slug}", timeout=15)


def test_bleach_strips_dangerous_html_on_blog_update(admin_session):
    created = admin_session.post(
        f"{API}/blog",
        json={"title": "SEC-002 regression — blog update", "excerpt": "x",
              "content": "<p>ok</p>", "category": "Privacy", "published": True},
        timeout=15,
    )
    slug = created.json()["slug"]
    try:
        updated = admin_session.put(
            f"{API}/blog/{slug}",
            json={"title": "x", "excerpt": "x", "content": XSS_PAYLOAD,
                  "category": "Privacy", "published": True},
            timeout=15,
        )
        assert updated.status_code == 200
        _assert_sanitized(updated.json()["content"])
    finally:
        admin_session.delete(f"{API}/blog/{slug}", timeout=15)


def test_bleach_strips_dangerous_html_on_page_create(admin_session):
    payload = {
        "title": "SEC-002 regression — page create",
        "content": XSS_PAYLOAD,
        "published": True,
    }
    created = admin_session.post(f"{API}/pages", json=payload, timeout=15)
    assert created.status_code == 200
    slug = created.json()["slug"]
    try:
        _assert_sanitized(created.json()["content"])
    finally:
        admin_session.delete(f"{API}/pages/{slug}", timeout=15)


# ---------- SEC-002 — SSR security headers ----------

SECURITY_HEADERS = [
    ("Content-Security-Policy", "object-src 'none'"),
    ("X-Frame-Options", "DENY"),
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "strict-origin-when-cross-origin"),
    ("Permissions-Policy", "geolocation=()"),
]


@pytest.mark.parametrize("path", ["/", "/models", "/en", "/en/models", "/services", "/blog"])
def test_ssr_routes_emit_security_headers(path):
    r = requests.get(SSR_BASE + path, timeout=15)
    assert r.status_code == 200
    for header, substring in SECURITY_HEADERS:
        value = r.headers.get(header, "")
        assert substring in value, f"{path} missing/weak {header}: got {value!r}"


def test_csp_blocks_object_and_frame_ancestors():
    r = requests.get(SSR_BASE + "/", timeout=15)
    csp = r.headers.get("Content-Security-Policy", "")
    assert "object-src 'none'" in csp
    assert "frame-ancestors 'none'" in csp
    assert "base-uri 'self'" in csp
