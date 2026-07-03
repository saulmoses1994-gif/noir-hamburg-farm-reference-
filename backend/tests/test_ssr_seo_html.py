"""
SSR SEO HTML validation tests.

Validates raw HTML returned from preview URL (no JS execution) contains:
- Proper H1/H2 SEO sections
- JSON-LD schemas (Organization, WebSite, LocalBusiness, Service, Article, Person, FAQPage)
- Canonical tags
- Unique title / meta description
- Internal links
"""
import os
import re
import pytest
import requests

BASE_URL = "https://client-portal-385.preview.emergentagent.com"


def fetch(path):
    r = requests.get(f"{BASE_URL}{path}", timeout=30, headers={"User-Agent": "Googlebot/2.1"})
    return r


def extract_title(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None


def extract_meta_desc(html):
    m = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if not m:
        m = re.search(r'<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
    return m.group(1).strip() if m else None


def extract_canonical(html):
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', html, re.IGNORECASE)
    return m.group(1) if m else None


class TestHomepage:
    def setup_method(self):
        self.r = fetch("/")
        self.html = self.r.text

    def test_status_and_size(self):
        assert self.r.status_code == 200
        assert len(self.html) >= 20000, f"Response too small ({len(self.html)}), SSR likely broken"

    def test_h1_present(self):
        assert "Luxus Escort Hamburg" in self.html
        assert re.search(r"<h1[^>]*>.*?Luxus Escort Hamburg.*?Exklusive Begleitung mit Stil.*?</h1>", self.html, re.DOTALL | re.IGNORECASE), "H1 not fully present in raw HTML"

    def test_h2_sections(self):
        expected = [
            "Warum eine professionelle Escort Agentur",
            "Luxus Escort Service in Hamburg",
            "Diskretion",
            "Warum Kunden uns vertrauen",
            "Unsere exklusiven Escort Models",
            "Begleitung für Business",
            "Escort Service in Hamburg",
            "Häufig gestellte Fragen",
        ]
        missing = [e for e in expected if e not in self.html]
        assert not missing, f"Missing H2 sections: {missing}"

    def test_jsonld_schemas(self):
        for t in ['"@type":"Organization"', '"@type":"WebSite"', '"@type":"LocalBusiness"']:
            # allow whitespace variance
            pattern = t.replace('"', r'\s*"').replace(":", r"\s*:\s*")
            assert re.search(pattern, self.html), f"Missing schema {t}"

    def test_internal_links(self):
        assert re.search(r'href=["\'][^"\']*/services/luxury-escort-hamburg', self.html), "Missing service link"
        assert re.search(r'href=["\'][^"\']*/escort/hamburg', self.html), "Missing hamburg area link"
        assert re.search(r'href=["\'][^"\']*/models/aurelia', self.html), "Missing model link"
        assert re.search(r'href=["\'][^"\']*/blog/', self.html), "Missing blog link"

    def test_title_and_desc(self):
        assert extract_title(self.html), "No <title>"
        assert extract_meta_desc(self.html), "No meta description"


class TestServiceDetail:
    def setup_method(self):
        self.r = fetch("/services/luxury-escort-hamburg")
        self.html = self.r.text

    def test_status(self):
        assert self.r.status_code == 200

    def test_h1_canonical_schema(self):
        assert re.search(r"<h1[^>]*>.*?</h1>", self.html, re.DOTALL), "Missing h1"
        assert extract_canonical(self.html), "Missing canonical"
        assert re.search(r'"@type"\s*:\s*"Service"', self.html), "Missing Service schema"


class TestAreaDetail:
    def setup_method(self):
        self.r = fetch("/escort/hamburg")
        self.html = self.r.text

    def test_status(self):
        assert self.r.status_code == 200

    def test_h1_canonical_schema(self):
        assert re.search(r"<h1[^>]*>.*?</h1>", self.html, re.DOTALL), "Missing h1"
        assert extract_canonical(self.html), "Missing canonical"
        assert re.search(r'"@type"\s*:\s*"(Place|LocalBusiness)"', self.html), "Missing Place/LocalBusiness schema"


class TestBlogArticle:
    def setup_method(self):
        self.r = fetch("/blog/hamburg-bei-nacht-ein-eleganter-leitfaden-durch-die-stadt")
        self.html = self.r.text

    def test_status(self):
        assert self.r.status_code == 200

    def test_h1_article_schema(self):
        assert re.search(r"<h1[^>]*>.*?</h1>", self.html, re.DOTALL), "Missing h1"
        assert re.search(r'"@type"\s*:\s*"Article"', self.html), "Missing Article schema"


class TestModelDetail:
    def setup_method(self):
        self.r = fetch("/models/aurelia")
        self.html = self.r.text

    def test_status(self):
        assert self.r.status_code == 200

    def test_h1_aurelia(self):
        assert re.search(r"<h1[^>]*>\s*Aurelia\s*</h1>", self.html, re.IGNORECASE), "Missing <h1>Aurelia</h1>"

    def test_person_and_faq_schemas(self):
        assert re.search(r'"@type"\s*:\s*"Person"', self.html), "Missing Person schema"
        assert re.search(r'"@type"\s*:\s*"FAQPage"', self.html), "Missing FAQPage schema"


class TestUniqueMetadata:
    def test_all_pages_unique(self):
        paths = [
            "/",
            "/services/luxury-escort-hamburg",
            "/escort/hamburg",
            "/blog/hamburg-bei-nacht-ein-eleganter-leitfaden-durch-die-stadt",
            "/models/aurelia",
        ]
        titles = {}
        descs = {}
        for p in paths:
            html = fetch(p).text
            t = extract_title(html)
            d = extract_meta_desc(html)
            assert t, f"No title for {p}"
            assert d, f"No meta description for {p}"
            titles[p] = t
            descs[p] = d
        assert len(set(titles.values())) == len(paths), f"Duplicate titles: {titles}"
        assert len(set(descs.values())) == len(paths), f"Duplicate descriptions: {descs}"


class TestEnglishRoutes:
    def test_en_home(self):
        r = fetch("/en/")
        assert r.status_code == 200
        assert re.search(r"<h1[^>]*>.*?Luxury Escort Hamburg.*?</h1>", r.text, re.DOTALL | re.IGNORECASE), "Missing English H1"


class TestSelfHealing:
    def test_full_html_served(self):
        r = fetch("/")
        assert r.status_code == 200
        assert len(r.text) >= 20000
        # Ensure not raw CRA shell (which has this and nothing else meaningful)
        # noscript text can exist, but full SSR body must include H1
        assert "Luxus Escort Hamburg" in r.text
