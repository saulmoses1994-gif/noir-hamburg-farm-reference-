#!/usr/bin/env python3
"""
Phase 3 chunk d6 — Public /faq (+ /en/faq) SSR read-path smoke test.
Curl-based, NO writes, NO auth.
"""

import requests
import json
import re
from html.parser import HTMLParser
from urllib.parse import urljoin

# Base URL from env
BASE_URL = "https://noir-migration.preview.emergentagent.com"

class MetaExtractor(HTMLParser):
    """Extract meta tags, title, canonical, hreflang, JSON-LD, and other elements."""
    def __init__(self):
        super().__init__()
        self.title = None
        self.meta_description = None
        self.canonical = None
        self.hreflang = []
        self.json_ld_blocks = []
        self.html_lang = None
        self.details_elements = []
        self.h1_text = ""
        self.cta_href = None
        self.in_h1 = False
        self.in_body = False
        self.visible_text = []
        self.in_script = False
        self.in_style = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'html':
            self.html_lang = attrs_dict.get('lang')
        elif tag == 'title':
            self.title = ""
        elif tag == 'meta':
            if attrs_dict.get('name') == 'description':
                self.meta_description = attrs_dict.get('content', '')
        elif tag == 'link':
            if attrs_dict.get('rel') == 'canonical':
                self.canonical = attrs_dict.get('href')
            elif attrs_dict.get('rel') == 'alternate':
                hreflang = attrs_dict.get('hreflang')
                href = attrs_dict.get('href')
                if hreflang:
                    self.hreflang.append({'hreflang': hreflang, 'href': href})
        elif tag == 'script':
            if attrs_dict.get('type') == 'application/ld+json':
                self.json_ld_blocks.append("")
            else:
                self.in_script = True
        elif tag == 'style':
            self.in_style = True
        elif tag == 'body':
            self.in_body = True
        elif tag == 'h1':
            self.in_h1 = True
        elif tag == 'details':
            testid = attrs_dict.get('data-testid', '')
            open_attr = 'open' in [a[0] for a in attrs]
            self.details_elements.append({'testid': testid, 'open': open_attr})
        elif tag == 'a':
            testid = attrs_dict.get('data-testid', '')
            if testid == 'faq-cta':
                self.cta_href = attrs_dict.get('href')
    
    def handle_endtag(self, tag):
        if tag == 'h1':
            self.in_h1 = False
        elif tag == 'script':
            self.in_script = False
        elif tag == 'style':
            self.in_style = False
    
    def handle_data(self, data):
        if self.title is not None and not isinstance(self.title, str):
            pass
        elif hasattr(self, '_current_tag') and self._current_tag == 'title':
            self.title = data
        elif self.json_ld_blocks and isinstance(self.json_ld_blocks[-1], str) and self.json_ld_blocks[-1] == "":
            self.json_ld_blocks[-1] = data
        elif self.in_h1:
            self.h1_text += data
        
        # Collect visible text (excluding scripts and styles)
        if self.in_body and not self.in_script and not self.in_style:
            self.visible_text.append(data)
    
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

def extract_html_metadata(html):
    """Parse HTML and extract metadata."""
    parser = MetaExtractor()
    
    # Extract title manually (HTMLParser can be tricky with title)
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if title_match:
        # Decode HTML entities
        title_text = title_match.group(1).strip()
        title_text = title_text.replace('&mdash;', '—').replace('&#x2014;', '—')
        title_text = title_text.replace('&auml;', 'ä').replace('&#228;', 'ä')
        title_text = title_text.replace('&uuml;', 'ü').replace('&#252;', 'ü')
        parser.title = title_text
    
    # Extract meta description
    meta_desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if meta_desc_match:
        parser.meta_description = meta_desc_match.group(1)
    
    # Extract canonical
    canonical_match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if canonical_match:
        parser.canonical = canonical_match.group(1)
    
    # Extract hreflang
    hreflang_pattern = r'<link[^>]*rel=["\']alternate["\'][^>]*hreflang=["\']([^"\']*)["\'][^>]*href=["\']([^"\']*)["\']'
    hreflang_matches = re.findall(hreflang_pattern, html, re.IGNORECASE)
    parser.hreflang = [{'hreflang': h[0], 'href': h[1]} for h in hreflang_matches]
    
    # Extract JSON-LD blocks manually
    json_ld_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
    json_ld_matches = re.findall(json_ld_pattern, html, re.IGNORECASE | re.DOTALL)
    parser.json_ld_blocks = [m.strip() for m in json_ld_matches]
    
    return parser

def count_occurrences(html, pattern):
    """Count occurrences of a pattern in HTML."""
    return len(re.findall(pattern, html, re.IGNORECASE))

def test_faq_de():
    """Test 1: GET /faq (DE)"""
    print("\n" + "="*80)
    print("TEST 1: GET /faq (DE) — SSR + SEO checks")
    print("="*80)
    
    url = f"{BASE_URL}/faq"
    resp = requests.get(url, timeout=30)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print(f"✓ Status: {resp.status_code}")
    
    html = resp.text
    
    # Check exactly one <html lang="de">
    html_lang_count = count_occurrences(html, r'<html[^>]*lang=["\']de["\']')
    assert html_lang_count == 1, f"Expected exactly 1 <html lang='de'>, found {html_lang_count}"
    print(f"✓ Exactly one <html lang='de'>")
    
    # Extract metadata
    meta = extract_html_metadata(html)
    
    # Check title
    expected_title = "FAQ — Häufige Fragen | Noir Hamburg Premium Escort"
    # Allow HTML entities
    title_normalized = meta.title.replace('&#x2014;', '—').replace('&mdash;', '—')
    assert expected_title in title_normalized or meta.title == expected_title, \
        f"Expected title '{expected_title}', got '{meta.title}'"
    print(f"✓ Title: {meta.title}")
    
    # Check meta description
    assert meta.meta_description, "Meta description is empty"
    assert "Noir Hamburg" in meta.meta_description, "Meta description doesn't contain 'Noir Hamburg'"
    print(f"✓ Meta description: {meta.meta_description[:80]}...")
    
    # Check canonical
    assert meta.canonical, "No canonical link found"
    assert meta.canonical.endswith('/faq'), f"Canonical should end with /faq, got {meta.canonical}"
    print(f"✓ Canonical: {meta.canonical}")
    
    # Check hreflang alternates (3 expected: de-DE, en, x-default)
    hreflang_values = [h['hreflang'].lower() for h in meta.hreflang]
    assert 'de-de' in hreflang_values or 'de' in hreflang_values, "Missing de-DE hreflang"
    assert 'en' in hreflang_values, "Missing en hreflang"
    assert 'x-default' in hreflang_values, "Missing x-default hreflang"
    print(f"✓ hreflang alternates: {', '.join(hreflang_values)}")
    
    # Check JSON-LD blocks (exactly 2 in <body>)
    # First, check they're in body
    body_match = re.search(r'<body[^>]*>(.*)</body>', html, re.IGNORECASE | re.DOTALL)
    assert body_match, "No <body> tag found"
    body_html = body_match.group(1)
    
    json_ld_in_body = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', 
                                   body_html, re.IGNORECASE | re.DOTALL)
    assert len(json_ld_in_body) == 2, f"Expected exactly 2 JSON-LD blocks in <body>, found {len(json_ld_in_body)}"
    print(f"✓ Exactly 2 JSON-LD blocks in <body>")
    
    # Parse and validate JSON-LD blocks
    schemas = []
    for i, block in enumerate(json_ld_in_body):
        try:
            schema = json.loads(block.strip())
            schemas.append(schema)
            print(f"  ✓ JSON-LD block {i+1} parses as valid JSON")
        except json.JSONDecodeError as e:
            raise AssertionError(f"JSON-LD block {i+1} is not valid JSON: {e}")
    
    # Check FAQPage schema
    faq_schema = next((s for s in schemas if s.get('@type') == 'FAQPage'), None)
    assert faq_schema, "No FAQPage schema found"
    assert faq_schema.get('inLanguage') == 'de-DE', f"FAQPage inLanguage should be 'de-DE', got {faq_schema.get('inLanguage')}"
    
    main_entity = faq_schema.get('mainEntity', [])
    assert isinstance(main_entity, list), "mainEntity should be an array"
    assert len(main_entity) == 6, f"Expected 6 questions in mainEntity, got {len(main_entity)}"
    
    # Check each question
    de_keywords = ["Diskretion", "Buchung", "Sprachen", "reisen", "voraus", "Zahlungs"]
    for i, q in enumerate(main_entity):
        assert q.get('@type') == 'Question', f"Question {i} should have @type='Question'"
        assert q.get('name'), f"Question {i} has empty name"
        
        answer = q.get('acceptedAnswer', {})
        assert answer.get('@type') == 'Answer', f"Question {i} answer should have @type='Answer'"
        assert answer.get('text'), f"Question {i} answer has empty text"
        
        # Check for DE keywords
        name_text = q.get('name', '') + answer.get('text', '')
        has_keyword = any(kw in name_text for kw in de_keywords)
        if not has_keyword:
            print(f"  Warning: Question {i} doesn't contain expected DE keywords: {name_text[:50]}...")
    
    print(f"✓ FAQPage schema: @type='FAQPage', inLanguage='de-DE', 6 Questions with DE content")
    
    # Check BreadcrumbList schema
    breadcrumb_schema = next((s for s in schemas if s.get('@type') == 'BreadcrumbList'), None)
    assert breadcrumb_schema, "No BreadcrumbList schema found"
    items = breadcrumb_schema.get('itemListElement', [])
    assert len(items) == 2, f"Expected 2 breadcrumb items, got {len(items)}"
    assert items[1].get('name') == 'FAQ', f"Second breadcrumb should be 'FAQ', got {items[1].get('name')}"
    print(f"✓ BreadcrumbList schema: 2 items, second name='FAQ'")
    
    # Check <details> elements (6 expected, first open)
    details_pattern = r'<details[^>]*data-testid=["\']faq-item-(\d+)["\'][^>]*>'
    details_matches = re.findall(details_pattern, html)
    assert len(details_matches) == 6, f"Expected 6 <details> elements, found {len(details_matches)}"
    
    # Check first is open
    first_details = re.search(r'<details[^>]*data-testid=["\']faq-item-0["\'][^>]*>', html)
    assert first_details, "First <details> element not found"
    assert 'open' in first_details.group(0), "First <details> should have 'open' attribute"
    print(f"✓ 6 <details> elements (faq-item-0 through faq-item-5), first is open")
    
    # Check CTA href
    cta_match = re.search(r'<a[^>]*data-testid=["\']faq-cta["\'][^>]*href=["\']([^"\']+)["\']', html)
    assert cta_match, "CTA link not found"
    cta_href = cta_match.group(1)
    assert cta_href == '/kontakt', f"CTA href should be '/kontakt', got '{cta_href}'"
    print(f"✓ Bottom CTA href='/kontakt'")
    
    # Check H1 contains German words
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
    assert h1_match, "No H1 found"
    h1_text = h1_match.group(1)
    assert "Häufige" in h1_text or "H&auml;ufige" in h1_text, "H1 should contain 'Häufige'"
    assert "Fragen" in h1_text, "H1 should contain 'Fragen'"
    print(f"✓ H1 contains 'Häufige' and 'Fragen'")
    
    print("\n✅ TEST 1 PASSED: /faq (DE) SSR + SEO checks complete")
    return True

def test_faq_en():
    """Test 2: GET /en/faq (EN)"""
    print("\n" + "="*80)
    print("TEST 2: GET /en/faq (EN) — SSR + SEO checks")
    print("="*80)
    
    url = f"{BASE_URL}/en/faq"
    resp = requests.get(url, timeout=30)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print(f"✓ Status: {resp.status_code}")
    
    html = resp.text
    
    # Check <html lang="en">
    html_lang_count = count_occurrences(html, r'<html[^>]*lang=["\']en["\']')
    assert html_lang_count == 1, f"Expected exactly 1 <html lang='en'>, found {html_lang_count}"
    print(f"✓ <html lang='en'>")
    
    # Extract metadata
    meta = extract_html_metadata(html)
    
    # Check title
    expected_title = "FAQ — Frequently Asked Questions | Noir Hamburg Premium Escort"
    title_normalized = meta.title.replace('&#x2014;', '—').replace('&mdash;', '—')
    assert expected_title in title_normalized or meta.title == expected_title, \
        f"Expected title '{expected_title}', got '{meta.title}'"
    print(f"✓ Title: {meta.title}")
    
    # Check canonical
    assert meta.canonical, "No canonical link found"
    assert meta.canonical.endswith('/en/faq'), f"Canonical should end with /en/faq, got {meta.canonical}"
    print(f"✓ Canonical: {meta.canonical}")
    
    # Check hreflang alternates
    hreflang_values = [h['hreflang'].lower() for h in meta.hreflang]
    assert 'de-de' in hreflang_values or 'de' in hreflang_values, "Missing de-DE hreflang"
    assert 'en' in hreflang_values, "Missing en hreflang"
    assert 'x-default' in hreflang_values, "Missing x-default hreflang"
    print(f"✓ hreflang alternates present")
    
    # Check JSON-LD blocks (2 in body)
    body_match = re.search(r'<body[^>]*>(.*)</body>', html, re.IGNORECASE | re.DOTALL)
    assert body_match, "No <body> tag found"
    body_html = body_match.group(1)
    
    json_ld_in_body = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', 
                                   body_html, re.IGNORECASE | re.DOTALL)
    assert len(json_ld_in_body) == 2, f"Expected exactly 2 JSON-LD blocks in <body>, found {len(json_ld_in_body)}"
    print(f"✓ 2 JSON-LD blocks in <body>")
    
    # Parse and validate JSON-LD blocks
    schemas = []
    for i, block in enumerate(json_ld_in_body):
        try:
            schema = json.loads(block.strip())
            schemas.append(schema)
        except json.JSONDecodeError as e:
            raise AssertionError(f"JSON-LD block {i+1} is not valid JSON: {e}")
    
    # Check FAQPage schema with EN content
    faq_schema = next((s for s in schemas if s.get('@type') == 'FAQPage'), None)
    assert faq_schema, "No FAQPage schema found"
    assert faq_schema.get('inLanguage') == 'en', f"FAQPage inLanguage should be 'en', got {faq_schema.get('inLanguage')}"
    
    main_entity = faq_schema.get('mainEntity', [])
    assert len(main_entity) == 6, f"Expected 6 questions in mainEntity, got {len(main_entity)}"
    
    # Check for EN keywords
    en_keywords = ["discretion", "booking", "languages", "travel", "advance", "payment"]
    for i, q in enumerate(main_entity):
        name_text = (q.get('name', '') + q.get('acceptedAnswer', {}).get('text', '')).lower()
        has_keyword = any(kw in name_text for kw in en_keywords)
        if not has_keyword:
            print(f"  Warning: Question {i} doesn't contain expected EN keywords: {name_text[:50]}...")
    
    print(f"✓ FAQPage schema: inLanguage='en', 6 Questions with EN content")
    
    # Check BreadcrumbList
    breadcrumb_schema = next((s for s in schemas if s.get('@type') == 'BreadcrumbList'), None)
    assert breadcrumb_schema, "No BreadcrumbList schema found"
    print(f"✓ BreadcrumbList schema present")
    
    # Check 6 <details> elements, first open
    details_pattern = r'<details[^>]*data-testid=["\']faq-item-(\d+)["\'][^>]*>'
    details_matches = re.findall(details_pattern, html)
    assert len(details_matches) == 6, f"Expected 6 <details> elements, found {len(details_matches)}"
    
    first_details = re.search(r'<details[^>]*data-testid=["\']faq-item-0["\'][^>]*>', html)
    assert first_details and 'open' in first_details.group(0), "First <details> should be open"
    print(f"✓ 6 <details> elements, first is open")
    
    # Check CTA href
    cta_match = re.search(r'<a[^>]*data-testid=["\']faq-cta["\'][^>]*href=["\']([^"\']+)["\']', html)
    assert cta_match, "CTA link not found"
    cta_href = cta_match.group(1)
    assert cta_href == '/en/contact', f"CTA href should be '/en/contact', got '{cta_href}'"
    print(f"✓ CTA href='/en/contact'")
    
    # Check H1 contains English words
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
    assert h1_match, "No H1 found"
    h1_text = h1_match.group(1)
    assert "Frequently" in h1_text, "H1 should contain 'Frequently'"
    assert "Asked" in h1_text, "H1 should contain 'Asked'"
    print(f"✓ H1 contains 'Frequently' and 'Asked'")
    
    print("\n✅ TEST 2 PASSED: /en/faq (EN) SSR + SEO checks complete")
    return True

def test_en_zero_leak():
    """Test 3: EN 0-leak scan"""
    print("\n" + "="*80)
    print("TEST 3: EN 0-leak scan — /en/faq should not contain German UI strings")
    print("="*80)
    
    url = f"{BASE_URL}/en/faq"
    resp = requests.get(url, timeout=30)
    html = resp.text
    
    # Strip all <script> and <style> tags
    html_no_script = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.IGNORECASE | re.DOTALL)
    html_no_style = re.sub(r'<style[^>]*>.*?</style>', '', html_no_script, flags=re.IGNORECASE | re.DOTALL)
    
    # Strip all HTML tags to get visible text
    visible_text = re.sub(r'<[^>]+>', ' ', html_no_style)
    
    # German strings that should NOT appear (standalone)
    forbidden_strings = [
        "Startseite",
        "Über uns",
        "Häufige",
        "Wissenswertes",
        r"\bTermin\b",  # standalone
        "Kategorien",
        "Anfrage senden",
        "Kontakt aufnehmen",
        "Verfügbarkeit",
        "Buchungsprozess",
        "persönlich",
        "pünktlich",
    ]
    
    found_leaks = []
    for forbidden in forbidden_strings:
        # Use word boundary for standalone check
        if r"\b" in forbidden:
            pattern = forbidden
        else:
            pattern = re.escape(forbidden)
        
        if re.search(pattern, visible_text, re.IGNORECASE):
            found_leaks.append(forbidden)
    
    # Check that email is allowed
    assert "kontakt@noir-hamburg.de" in visible_text or "kontakt@noir-hamburg.de" in html, \
        "Email address should be present"
    print(f"✓ Email address 'kontakt@noir-hamburg.de' is allowed and present")
    
    if found_leaks:
        raise AssertionError(f"Found German UI string leaks in EN page: {', '.join(found_leaks)}")
    
    print(f"✓ No German UI string leaks found in visible text")
    print("\n✅ TEST 3 PASSED: EN 0-leak scan complete")
    return True

def test_sitemap_regression():
    """Test 4: Sitemap regression"""
    print("\n" + "="*80)
    print("TEST 4: Sitemap regression — /sitemap.xml should include /faq entries")
    print("="*80)
    
    url = f"{BASE_URL}/sitemap.xml"
    resp = requests.get(url, timeout=30)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print(f"✓ Status: {resp.status_code}")
    
    xml = resp.text
    
    # Check for /faq <loc>
    faq_loc_pattern = r'<loc>[^<]*\/faq</loc>'
    faq_loc_matches = re.findall(faq_loc_pattern, xml)
    assert len(faq_loc_matches) >= 1, f"Expected at least 1 <loc> for /faq, found {len(faq_loc_matches)}"
    print(f"✓ Found <loc> for /faq")
    
    # Check for EN hreflang alternate
    en_faq_pattern = r'<xhtml:link[^>]*hreflang=["\']en["\'][^>]*href=["\'][^"\']*\/en\/faq["\']'
    en_faq_matches = re.findall(en_faq_pattern, xml, re.IGNORECASE)
    assert len(en_faq_matches) >= 1, f"Expected at least 1 hreflang='en' alternate for /en/faq, found {len(en_faq_matches)}"
    print(f"✓ Found xhtml:link hreflang='en' alternate pointing to /en/faq")
    
    print("\n✅ TEST 4 PASSED: Sitemap regression complete")
    return True

def test_regression_prior_work():
    """Test 5: Regression on prior work"""
    print("\n" + "="*80)
    print("TEST 5: Regression on prior work — All previous endpoints should still work")
    print("="*80)
    
    endpoints = [
        ("/api/health", "Phase 0"),
        ("/services/vip-escort-hamburg", "Phase 1"),
        ("/models", "Phase 3 d1"),
        ("/blog", "Phase 3 d2"),
        ("/escort/hafencity", "Phase 3 d3"),
        ("/p/diskretion", "Phase 3 d4"),
        ("/kontakt", "Phase 3 d5"),
        ("/ueber-uns", "Phase 3 d5"),
        ("/impressum", "Phase 3 d5"),
    ]
    
    for path, phase in endpoints:
        url = f"{BASE_URL}{path}"
        resp = requests.get(url, timeout=30)
        assert resp.status_code == 200, f"{path} returned {resp.status_code}, expected 200"
        print(f"✓ GET {path} → 200 ({phase})")
    
    print("\n✅ TEST 5 PASSED: All prior work still functional")
    return True

def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("Phase 3 chunk d6 — Public /faq (+ /en/faq) SSR read-path smoke test")
    print("Base URL:", BASE_URL)
    print("="*80)
    
    try:
        test_faq_de()
        test_faq_en()
        test_en_zero_leak()
        test_sitemap_regression()
        test_regression_prior_work()
        
        print("\n" + "="*80)
        print("🎉 ALL TESTS PASSED (5/5)")
        print("="*80)
        return 0
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
