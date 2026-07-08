"""SSR verification tests — raw HTTP GET (no JS) for every public route.

The goal is to ensure Googlebot / non-JS clients see real HTML content
(title, h1, body, internal links) instead of the placeholder
'You need to enable JavaScript to run this app.'
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Read the frontend public URL from frontend/.env if backend env has internal URL
if not BASE_URL or "localhost" in BASE_URL or "8001" in BASE_URL:
    try:
        with open("/app/frontend/.env") as fh:
            for line in fh:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

JS_PLACEHOLDER = "You need to enable JavaScript to run this app"
JS_PLACEHOLDER_DE = "Sie müssen JavaScript"


def _get(path):
    r = requests.get(f"{BASE_URL}{path}", timeout=30, headers={"User-Agent": "Mozilla/5.0 (Googlebot)"})
    return r


def _assert_no_js_placeholder(body):
    # The placeholder may exist inside <noscript> block in the SPA shell.
    # For SSR pages, it must NOT be the only content. We check that the SSR
    # `<div id="seo-content">` exists and contains real content.
    assert "seo-content" in body, "SSR seo-content div not present"
    assert "<h1" in body, "No <h1> tag in SSR output"


def _assert_seo_basics(body, expected_title_substr=None, expected_h1_substr=None):
    assert "<title>" in body
    if expected_title_substr:
        title = re.search(r"<title>(.*?)</title>", body, re.S).group(1)
        assert expected_title_substr.lower() in title.lower(), f"title='{title}'"
    assert '<meta name="description"' in body
    assert '<link rel="canonical"' in body
    assert '<script type="application/ld+json">' in body
    if expected_h1_substr:
        m = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
        assert m, "no <h1> found"
        assert expected_h1_substr.lower() in m.group(1).lower(), f"h1='{m.group(1)}'"


class TestSSRHomepage:
    def test_home_html(self):
        r = _get("/")
        assert r.status_code == 200
        assert "text/html" in r.headers.get("content-type", "")
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Luxus Escort Hamburg", "Luxus Escort Hamburg")
        # internal links
        for href in ["/models", "/services/", "/escort/", "/blog", "/faq", "/kontakt"]:
            assert href in r.text, f"missing link: {href}"


class TestSSRModels:
    def test_models_list(self):
        r = _get("/models")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Models", "Unsere Models")
        # Should have at least one model link
        assert re.search(r'href="/models/[a-z0-9\-]+"', r.text), "no model detail links"

    def test_models_aurelia_detail(self):
        r = _get("/models/aurelia")
        if r.status_code == 404:
            pytest.skip("aurelia not seeded")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Aurelia", "Aurelia")
        # Person schema present
        assert '"@type": "Person"' in r.text or '"@type":"Person"' in r.text


class TestSSRServices:
    def test_services_list(self):
        r = _get("/services")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Escort Services", "Escort Services Hamburg")
        # 8 services
        count = len(re.findall(r'href="/services/[a-z0-9\-]+"', r.text))
        assert count >= 8, f"expected >=8 service links, got {count}"

    def test_service_luxury(self):
        r = _get("/services/luxury-escort-hamburg")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Luxus", "Luxus Escort Hamburg")
        assert '"@type": "Service"' in r.text or '"@type":"Service"' in r.text

    def test_service_vip(self):
        r = _get("/services/vip-escort-hamburg")
        assert r.status_code == 200
        _assert_seo_basics(r.text, "VIP", None)
        assert '<script type="application/ld+json">' in r.text


class TestSSRAreas:
    def test_areas_list(self):
        r = _get("/areas")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Hamburg Areas", "Hamburg Areas")
        count = len(re.findall(r'href="/escort/[a-z0-9\-]+"', r.text))
        assert count >= 18, f"expected >=18 area links, got {count}"

    def test_area_hafencity(self):
        r = _get("/escort/hafencity")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "HafenCity", "HafenCity")

    def test_escort_hamburg_landing(self):
        r = _get("/escort-hamburg")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Escort Hamburg", "Escort Hamburg")


class TestSSRBlog:
    def test_blog_list(self):
        r = _get("/blog")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, "Magazin", "Noir Magazin")

    def test_blog_detail(self):
        # find any blog link from /blog
        list_r = _get("/blog")
        slugs = re.findall(r'href="/blog/([a-z0-9\-]+)"', list_r.text)
        if not slugs:
            pytest.skip("no blog posts seeded")
        r = _get(f"/blog/{slugs[0]}")
        assert r.status_code == 200
        _assert_no_js_placeholder(r.text)
        _assert_seo_basics(r.text, None, None)
        assert '"@type": "Article"' in r.text or '"@type":"Article"' in r.text


class TestSSRStatic:
    def test_faq(self):
        r = _get("/faq")
        assert r.status_code == 200
        _assert_seo_basics(r.text, "FAQ", "Häufig gestellte Fragen")
        assert '"@type": "FAQPage"' in r.text or '"@type":"FAQPage"' in r.text

    def test_ueber_uns(self):
        r = _get("/ueber-uns")
        assert r.status_code == 200
        _assert_seo_basics(r.text, "Über uns", "Über uns")

    def test_kontakt(self):
        r = _get("/kontakt")
        assert r.status_code == 200
        _assert_seo_basics(r.text, "Kontakt", "Kontakt")

    def test_sitemap_xml(self):
        r = _get("/sitemap.xml")
        assert r.status_code == 200
        assert "xml" in r.headers.get("content-type", "").lower()
        assert "<urlset" in r.text or "<sitemapindex" in r.text
        # Check it contains expected URL categories
        assert "/models/" in r.text or "/models<" in r.text
        assert "/services/" in r.text
        assert "/escort/" in r.text

    def test_robots_txt(self):
        r = _get("/robots.txt")
        assert r.status_code == 200


class TestAdminFallthrough:
    def test_admin_login_serves_spa_shell(self):
        # /admin routes should NOT be SSR'd; they fall back to the React shell.
        # But the shell should still load (with JS placeholder is OK here, since
        # SPA needs JS for admin).
        r = _get("/admin/login")
        assert r.status_code == 200
        # Either contains React SPA root or seo-content with admin content
        assert '<div id="root"' in r.text or "seo-content" in r.text
