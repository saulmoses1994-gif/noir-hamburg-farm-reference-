#!/usr/bin/env python3
"""
Phase 3 chunk d7 (FINAL PUBLIC CHUNK) — Public /escort-hamburg landing + /areas list, plus EN twins.
Curl-based SSR + SEO smoke test. NO writes, NO auth.
"""

import requests
import json
import re
from html.parser import HTMLParser

BASE_URL = "https://noir-migration.preview.emergentagent.com"

class MetaExtractor(HTMLParser):
    """Extract meta tags, title, canonical, hreflang, and JSON-LD from HTML"""
    def __init__(self):
        super().__init__()
        self.title = None
        self.meta_description = None
        self.canonical = None
        self.hreflang = []
        self.html_lang = None
        self.jsonld_blocks = []
        self.in_body = False
        self.in_script = False
        self.current_script_type = None
        self.script_content = []
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'html':
            self.html_lang = attrs_dict.get('lang')
        
        if tag == 'body':
            self.in_body = True
            
        if tag == 'title':
            self.title = ''
            
        if tag == 'meta':
            if attrs_dict.get('name') == 'description':
                self.meta_description = attrs_dict.get('content', '')
                
        if tag == 'link':
            if attrs_dict.get('rel') == 'canonical':
                self.canonical = attrs_dict.get('href', '')
            if attrs_dict.get('rel') == 'alternate':
                hreflang = attrs_dict.get('hreflang')
                href = attrs_dict.get('href')
                if hreflang and href:
                    self.hreflang.append({'hreflang': hreflang, 'href': href})
                    
        if tag == 'script':
            script_type = attrs_dict.get('type')
            if script_type == 'application/ld+json':
                self.in_script = True
                self.current_script_type = script_type
                self.script_content = []
    
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_script:
            content = ''.join(self.script_content).strip()
            if content and self.in_body:
                self.jsonld_blocks.append(content)
            self.in_script = False
            self.current_script_type = None
            self.script_content = []
            
    def handle_data(self, data):
        if self.title == '':
            self.title = data
        if self.in_script and self.current_script_type == 'application/ld+json':
            self.script_content.append(data)

def extract_meta(html):
    """Extract all meta information from HTML"""
    parser = MetaExtractor()
    parser.feed(html)
    return {
        'html_lang': parser.html_lang,
        'title': parser.title,
        'meta_description': parser.meta_description,
        'canonical': parser.canonical,
        'hreflang': parser.hreflang,
        'jsonld_blocks': parser.jsonld_blocks
    }

def count_elements(html, pattern):
    """Count occurrences of a pattern in HTML"""
    return len(re.findall(pattern, html, re.IGNORECASE))

def check_testid(html, testid):
    """Check if a data-testid exists in HTML"""
    return f'data-testid="{testid}"' in html

def strip_scripts_and_tags(html):
    """Remove all <script> blocks and HTML tags, return visible text"""
    # Remove script blocks
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    # Remove all HTML tags
    html = re.sub(r'<[^>]+>', ' ', html)
    # Normalize whitespace
    html = re.sub(r'\s+', ' ', html)
    return html.strip()

def test_ssr_seo(url, expected_title_fragment, expected_canonical_path, expected_lang, expected_inlanguage, test_name):
    """Test SSR + SEO requirements for a single URL"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"URL: {url}")
    print(f"{'='*80}")
    
    try:
        resp = requests.get(url, timeout=30)
        print(f"✓ Status: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"✗ FAIL: Expected 200, got {resp.status_code}")
            return False
            
        html = resp.text
        meta = extract_meta(html)
        
        # Check html lang
        html_lang_count = count_elements(html, r'<html[^>]+lang=')
        print(f"✓ HTML lang count: {html_lang_count} (expected: 1)")
        if html_lang_count != 1:
            print(f"✗ FAIL: Expected exactly 1 <html lang>, found {html_lang_count}")
            return False
            
        if meta['html_lang'] != expected_lang:
            print(f"✗ FAIL: Expected html lang='{expected_lang}', got '{meta['html_lang']}'")
            return False
        print(f"✓ HTML lang: {meta['html_lang']}")
        
        # Check title
        title_count = count_elements(html, r'<title>')
        print(f"✓ Title count: {title_count} (expected: 1)")
        if title_count != 1:
            print(f"✗ FAIL: Expected exactly 1 <title>, found {title_count}")
            return False
            
        if not meta['title'] or expected_title_fragment not in meta['title']:
            print(f"✗ FAIL: Title '{meta['title']}' does not contain '{expected_title_fragment}'")
            return False
        print(f"✓ Title: {meta['title']}")
        
        # Check meta description
        meta_desc_count = count_elements(html, r'<meta[^>]+name=["\']description["\']')
        print(f"✓ Meta description count: {meta_desc_count} (expected: 1)")
        if meta_desc_count != 1:
            print(f"✗ FAIL: Expected exactly 1 meta description, found {meta_desc_count}")
            return False
            
        if not meta['meta_description']:
            print(f"✗ FAIL: Meta description is empty")
            return False
        print(f"✓ Meta description: {meta['meta_description'][:80]}...")
        
        # Check canonical
        canonical_count = count_elements(html, r'<link[^>]+rel=["\']canonical["\']')
        print(f"✓ Canonical count: {canonical_count} (expected: 1)")
        if canonical_count != 1:
            print(f"✗ FAIL: Expected exactly 1 canonical link, found {canonical_count}")
            return False
            
        if not meta['canonical'] or not meta['canonical'].endswith(expected_canonical_path):
            print(f"✗ FAIL: Canonical '{meta['canonical']}' does not end with '{expected_canonical_path}'")
            return False
        print(f"✓ Canonical: {meta['canonical']}")
        
        # Check hreflang alternates (should have de-DE, en, x-default)
        hreflang_langs = [h['hreflang'] for h in meta['hreflang']]
        print(f"✓ Hreflang alternates: {hreflang_langs}")
        if len(hreflang_langs) < 3:
            print(f"✗ FAIL: Expected at least 3 hreflang alternates, found {len(hreflang_langs)}")
            return False
        if 'de-DE' not in hreflang_langs or 'en' not in hreflang_langs or 'x-default' not in hreflang_langs:
            print(f"✗ FAIL: Missing required hreflang alternates (de-DE, en, x-default)")
            return False
        
        # Check JSON-LD blocks in body
        jsonld_count = len(meta['jsonld_blocks'])
        print(f"✓ JSON-LD blocks in body: {jsonld_count} (expected: 2)")
        if jsonld_count != 2:
            print(f"✗ FAIL: Expected exactly 2 JSON-LD blocks in body, found {jsonld_count}")
            return False
            
        # Parse and validate JSON-LD
        for i, block in enumerate(meta['jsonld_blocks']):
            try:
                data = json.loads(block)
                jsonld_type = data.get('@type')
                print(f"  ✓ JSON-LD block {i+1}: @type={jsonld_type}")
                
                # Check inLanguage for CollectionPage
                if jsonld_type == 'CollectionPage':
                    inlang = data.get('inLanguage')
                    if inlang != expected_inlanguage:
                        print(f"  ✗ FAIL: CollectionPage inLanguage '{inlang}' != '{expected_inlanguage}'")
                        return False
                    print(f"  ✓ CollectionPage inLanguage: {inlang}")
                    
            except json.JSONDecodeError as e:
                print(f"  ✗ FAIL: JSON-LD block {i+1} is not valid JSON: {e}")
                return False
        
        print(f"\n✅ {test_name} PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception during test: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_escort_hamburg_de():
    """Test GET /escort-hamburg (DE)"""
    url = f"{BASE_URL}/escort-hamburg"
    result = test_ssr_seo(
        url,
        "Escort Hamburg — Premium Begleitagentur",
        "/escort-hamburg",
        "de",
        "de-DE",
        "GET /escort-hamburg (DE)"
    )
    
    if not result:
        return False
        
    # Additional checks specific to escort-hamburg
    print("\nAdditional checks for /escort-hamburg:")
    resp = requests.get(url, timeout=30)
    html = resp.text
    
    # Check for specific testids
    if not check_testid(html, "escort-hamburg-page"):
        print("✗ FAIL: Missing data-testid='escort-hamburg-page'")
        return False
    print("✓ data-testid='escort-hamburg-page' present")
    
    if not check_testid(html, "escort-hamburg-hero-image"):
        print("✗ FAIL: Missing data-testid='escort-hamburg-hero-image'")
        return False
    print("✓ data-testid='escort-hamburg-hero-image' present")
    
    # Check H1 contains "Escort" and "Hamburg"
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    if not h1_match:
        print("✗ FAIL: No H1 found")
        return False
    h1_text = re.sub(r'<[^>]+>', '', h1_match.group(1))
    if 'Escort' not in h1_text or 'Hamburg' not in h1_text:
        print(f"✗ FAIL: H1 '{h1_text}' does not contain 'Escort' and 'Hamburg'")
        return False
    print(f"✓ H1 contains 'Escort' and 'Hamburg': {h1_text[:80]}")
    
    # Check services grid: exactly 8 elements with hub-service-*
    service_count = len(re.findall(r'data-testid="hub-service-[^"]*"', html))
    if service_count != 8:
        print(f"✗ FAIL: Expected 8 hub-service-* elements, found {service_count}")
        return False
    print(f"✓ Services grid: {service_count} elements")
    
    # Check each service href starts with /services/
    service_hrefs = re.findall(r'data-testid="hub-service-[^"]*"[^>]*href="([^"]*)"', html)
    if not service_hrefs:
        service_hrefs = re.findall(r'href="([^"]*)"[^>]*data-testid="hub-service-[^"]*"', html)
    for href in service_hrefs:
        if not href.startswith('/services/'):
            print(f"✗ FAIL: Service href '{href}' does not start with '/services/'")
            return False
    print(f"✓ All service hrefs start with '/services/'")
    
    # Check reach grid: exactly 18 elements with hub-area-*
    area_count = len(re.findall(r'data-testid="hub-area-[^"]*"', html))
    if area_count != 18:
        print(f"✗ FAIL: Expected 18 hub-area-* elements, found {area_count}")
        return False
    print(f"✓ Reach grid: {area_count} elements")
    
    # Check each area href starts with /escort/
    area_hrefs = re.findall(r'data-testid="hub-area-[^"]*"[^>]*href="([^"]*)"', html)
    if not area_hrefs:
        area_hrefs = re.findall(r'href="([^"]*)"[^>]*data-testid="hub-area-[^"]*"', html)
    for href in area_hrefs:
        if not href.startswith('/escort/'):
            print(f"✗ FAIL: Area href '{href}' does not start with '/escort/'")
            return False
    print(f"✓ All area hrefs start with '/escort/'")
    
    # Check bottom CTAs
    if not check_testid(html, "hub-cta-contact"):
        print("✗ FAIL: Missing data-testid='hub-cta-contact'")
        return False
    if not check_testid(html, "hub-cta-models"):
        print("✗ FAIL: Missing data-testid='hub-cta-models'")
        return False
    
    # Check CTA hrefs
    contact_cta = re.search(r'data-testid="hub-cta-contact"[^>]*href="([^"]*)"', html)
    if not contact_cta:
        contact_cta = re.search(r'href="([^"]*)"[^>]*data-testid="hub-cta-contact"', html)
    if not contact_cta or contact_cta.group(1) != '/kontakt':
        print(f"✗ FAIL: hub-cta-contact href is not '/kontakt'")
        return False
    print("✓ hub-cta-contact → /kontakt")
    
    models_cta = re.search(r'data-testid="hub-cta-models"[^>]*href="([^"]*)"', html)
    if not models_cta:
        models_cta = re.search(r'href="([^"]*)"[^>]*data-testid="hub-cta-models"', html)
    if not models_cta or models_cta.group(1) != '/models':
        print(f"✗ FAIL: hub-cta-models href is not '/models'")
        return False
    print("✓ hub-cta-models → /models")
    
    # Check overline "Reichweite" (DE) present
    if 'Reichweite' not in html:
        print("✗ FAIL: Overline 'Reichweite' not found")
        return False
    print("✓ Overline 'Reichweite' present")
    
    # Check JSON-LD for CollectionPage with about: Place(Hamburg)
    meta = extract_meta(html)
    for block in meta['jsonld_blocks']:
        data = json.loads(block)
        if data.get('@type') == 'CollectionPage':
            about = data.get('about')
            if not about or about.get('@type') != 'Place' or about.get('name') != 'Hamburg':
                print(f"✗ FAIL: CollectionPage missing correct 'about' Place(Hamburg)")
                return False
            print(f"✓ CollectionPage has about: Place(Hamburg)")
            break
    
    print("\n✅ All /escort-hamburg (DE) checks passed")
    return True

def test_escort_hamburg_en():
    """Test GET /en/escort-hamburg (EN)"""
    url = f"{BASE_URL}/en/escort-hamburg"
    result = test_ssr_seo(
        url,
        "Escort Hamburg — Premium Companion Agency",
        "/en/escort-hamburg",
        "en",
        "en",
        "GET /en/escort-hamburg (EN)"
    )
    
    if not result:
        return False
        
    # Additional checks specific to EN escort-hamburg
    print("\nAdditional checks for /en/escort-hamburg:")
    resp = requests.get(url, timeout=30)
    html = resp.text
    
    # Check services grid: 8 hub-service-* with hrefs starting with /en/services/
    service_count = len(re.findall(r'data-testid="hub-service-[^"]*"', html))
    if service_count != 8:
        print(f"✗ FAIL: Expected 8 hub-service-* elements, found {service_count}")
        return False
    print(f"✓ Services grid: {service_count} elements")
    
    service_hrefs = re.findall(r'data-testid="hub-service-[^"]*"[^>]*href="([^"]*)"', html)
    if not service_hrefs:
        service_hrefs = re.findall(r'href="([^"]*)"[^>]*data-testid="hub-service-[^"]*"', html)
    for href in service_hrefs:
        if not href.startswith('/en/services/'):
            print(f"✗ FAIL: Service href '{href}' does not start with '/en/services/'")
            return False
    print(f"✓ All service hrefs start with '/en/services/'")
    
    # Check reach grid: 18 hub-area-* with hrefs starting /en/escort/
    area_count = len(re.findall(r'data-testid="hub-area-[^"]*"', html))
    if area_count != 18:
        print(f"✗ FAIL: Expected 18 hub-area-* elements, found {area_count}")
        return False
    print(f"✓ Reach grid: {area_count} elements")
    
    area_hrefs = re.findall(r'data-testid="hub-area-[^"]*"[^>]*href="([^"]*)"', html)
    if not area_hrefs:
        area_hrefs = re.findall(r'href="([^"]*)"[^>]*data-testid="hub-area-[^"]*"', html)
    for href in area_hrefs:
        if not href.startswith('/en/escort/'):
            print(f"✗ FAIL: Area href '{href}' does not start with '/en/escort/'")
            return False
    print(f"✓ All area hrefs start with '/en/escort/'")
    
    # Check bottom CTAs point to /en/contact and /en/models
    contact_cta = re.search(r'data-testid="hub-cta-contact"[^>]*href="([^"]*)"', html)
    if not contact_cta:
        contact_cta = re.search(r'href="([^"]*)"[^>]*data-testid="hub-cta-contact"', html)
    if not contact_cta or contact_cta.group(1) != '/en/contact':
        print(f"✗ FAIL: hub-cta-contact href is not '/en/contact'")
        return False
    print("✓ hub-cta-contact → /en/contact")
    
    models_cta = re.search(r'data-testid="hub-cta-models"[^>]*href="([^"]*)"', html)
    if not models_cta:
        models_cta = re.search(r'href="([^"]*)"[^>]*data-testid="hub-cta-models"', html)
    if not models_cta or models_cta.group(1) != '/en/models':
        print(f"✗ FAIL: hub-cta-models href is not '/en/models'")
        return False
    print("✓ hub-cta-models → /en/models")
    
    # Check overline "Coverage" (EN) present
    if 'Coverage' not in html:
        print("✗ FAIL: Overline 'Coverage' not found")
        return False
    print("✓ Overline 'Coverage' present")
    
    print("\n✅ All /en/escort-hamburg (EN) checks passed")
    return True

def test_areas_de():
    """Test GET /areas (DE)"""
    url = f"{BASE_URL}/areas"
    result = test_ssr_seo(
        url,
        "Hamburg Areas — Premium Escort in der ganzen Metropolregion",
        "/areas",
        "de",
        "de-DE",
        "GET /areas (DE)"
    )
    
    if not result:
        return False
        
    # Additional checks specific to areas
    print("\nAdditional checks for /areas:")
    resp = requests.get(url, timeout=30)
    html = resp.text
    
    # Check for data-testid="areas-list"
    if not check_testid(html, "areas-list"):
        print("✗ FAIL: Missing data-testid='areas-list'")
        return False
    print("✓ data-testid='areas-list' present")
    
    # Check exactly 18 area-card-* items
    area_count = len(re.findall(r'data-testid="area-card-[^"]*"', html))
    if area_count != 18:
        print(f"✗ FAIL: Expected 18 area-card-* elements, found {area_count}")
        return False
    print(f"✓ Area cards: {area_count} elements")
    
    # Check each href starts with /escort/
    area_hrefs = re.findall(r'data-testid="area-card-[^"]*"[^>]*href="([^"]*)"', html)
    if not area_hrefs:
        area_hrefs = re.findall(r'href="([^"]*)"[^>]*data-testid="area-card-[^"]*"', html)
    for href in area_hrefs:
        if not href.startswith('/escort/'):
            print(f"✗ FAIL: Area href '{href}' does not start with '/escort/'")
            return False
    print(f"✓ All area hrefs start with '/escort/'")
    
    # Check JSON-LD CollectionPage has hasPart array with length 18
    meta = extract_meta(html)
    for block in meta['jsonld_blocks']:
        data = json.loads(block)
        if data.get('@type') == 'CollectionPage':
            has_part = data.get('hasPart', [])
            if len(has_part) != 18:
                print(f"✗ FAIL: CollectionPage hasPart length {len(has_part)} != 18")
                return False
            print(f"✓ CollectionPage hasPart length: {len(has_part)}")
            
            # Check each item is a Place with name and url
            for item in has_part:
                if item.get('@type') != 'Place':
                    print(f"✗ FAIL: hasPart item @type '{item.get('@type')}' != 'Place'")
                    return False
                if not item.get('name') or not item.get('url'):
                    print(f"✗ FAIL: hasPart Place missing name or url")
                    return False
            print(f"✓ All hasPart items are valid Places with name + url")
            break
    
    print("\n✅ All /areas (DE) checks passed")
    return True

def test_areas_en():
    """Test GET /en/areas (EN)"""
    url = f"{BASE_URL}/en/areas"
    result = test_ssr_seo(
        url,
        "Hamburg Areas — Premium Escort across the Metropolitan Region",
        "/en/areas",
        "en",
        "en",
        "GET /en/areas (EN)"
    )
    
    if not result:
        return False
        
    # Additional checks specific to EN areas
    print("\nAdditional checks for /en/areas:")
    resp = requests.get(url, timeout=30)
    html = resp.text
    
    # Check exactly 18 area-card-* with hrefs starting /en/escort/
    area_count = len(re.findall(r'data-testid="area-card-[^"]*"', html))
    if area_count != 18:
        print(f"✗ FAIL: Expected 18 area-card-* elements, found {area_count}")
        return False
    print(f"✓ Area cards: {area_count} elements")
    
    area_hrefs = re.findall(r'data-testid="area-card-[^"]*"[^>]*href="([^"]*)"', html)
    if not area_hrefs:
        area_hrefs = re.findall(r'href="([^"]*)"[^>]*data-testid="area-card-[^"]*"', html)
    for href in area_hrefs:
        if not href.startswith('/en/escort/'):
            print(f"✗ FAIL: Area href '{href}' does not start with '/en/escort/'")
            return False
    print(f"✓ All area hrefs start with '/en/escort/'")
    
    # Check JSON-LD CollectionPage has hasPart length 18
    meta = extract_meta(html)
    for block in meta['jsonld_blocks']:
        data = json.loads(block)
        if data.get('@type') == 'CollectionPage':
            has_part = data.get('hasPart', [])
            if len(has_part) != 18:
                print(f"✗ FAIL: CollectionPage hasPart length {len(has_part)} != 18")
                return False
            print(f"✓ CollectionPage hasPart length: {len(has_part)}")
            break
    
    print("\n✅ All /en/areas (EN) checks passed")
    return True

def test_en_leak_scan():
    """Test EN pages for German string leaks"""
    print(f"\n{'='*80}")
    print("TEST: EN 0-LEAK SCAN")
    print(f"{'='*80}")
    
    forbidden_strings = [
        'Startseite',
        'Über uns',
        'Häufige',
        'Wissenswertes',
        'Reichweite',
        'Hansestadt',
        'Hauptstadt der Eleganz',
        'Anfrage senden',
        'Models ansehen',
        'in der gesamten Metropolregion',
        'hanseatisch'
    ]
    
    urls = [
        f"{BASE_URL}/en/escort-hamburg",
        f"{BASE_URL}/en/areas"
    ]
    
    all_passed = True
    
    for url in urls:
        print(f"\nChecking: {url}")
        resp = requests.get(url, timeout=30)
        html = resp.text
        
        # Strip scripts and tags
        visible_text = strip_scripts_and_tags(html)
        
        found_leaks = []
        for forbidden in forbidden_strings:
            if forbidden in visible_text:
                found_leaks.append(forbidden)
        
        if found_leaks:
            print(f"✗ FAIL: Found German string leaks: {found_leaks}")
            all_passed = False
        else:
            print(f"✓ No German string leaks found")
        
        # Verify email is allowed
        if 'kontakt@noir-hamburg.de' not in html:
            print(f"✗ WARNING: Email 'kontakt@noir-hamburg.de' not found (should be present)")
        else:
            print(f"✓ Email 'kontakt@noir-hamburg.de' correctly present")
    
    if all_passed:
        print("\n✅ EN 0-LEAK SCAN PASSED")
    else:
        print("\n✗ EN 0-LEAK SCAN FAILED")
    
    return all_passed

def test_sitemap_regression():
    """Test sitemap contains escort-hamburg and areas entries with EN alternates"""
    print(f"\n{'='*80}")
    print("TEST: SITEMAP REGRESSION")
    print(f"{'='*80}")
    
    url = f"{BASE_URL}/sitemap.xml"
    print(f"URL: {url}")
    
    try:
        resp = requests.get(url, timeout=30)
        print(f"✓ Status: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"✗ FAIL: Expected 200, got {resp.status_code}")
            return False
        
        xml = resp.text
        
        # Check for /escort-hamburg entry
        if '<loc>https://noir-migration.preview.emergentagent.com/escort-hamburg</loc>' not in xml:
            print("✗ FAIL: Missing <loc> for /escort-hamburg")
            return False
        print("✓ Found <loc> for /escort-hamburg")
        
        # Check for /areas entry
        if '<loc>https://noir-migration.preview.emergentagent.com/areas</loc>' not in xml:
            print("✗ FAIL: Missing <loc> for /areas")
            return False
        print("✓ Found <loc> for /areas")
        
        # Check for EN alternates
        if 'hreflang="en"' not in xml or '/en/escort-hamburg' not in xml:
            print("✗ FAIL: Missing hreflang='en' alternate for /en/escort-hamburg")
            return False
        print("✓ Found hreflang='en' alternate for /en/escort-hamburg")
        
        if 'hreflang="en"' not in xml or '/en/areas' not in xml:
            print("✗ FAIL: Missing hreflang='en' alternate for /en/areas")
            return False
        print("✓ Found hreflang='en' alternate for /en/areas")
        
        print("\n✅ SITEMAP REGRESSION PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception during test: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_regression_prior_work():
    """Test regression on prior work"""
    print(f"\n{'='*80}")
    print("TEST: REGRESSION ON PRIOR WORK")
    print(f"{'='*80}")
    
    endpoints = [
        '/api/health',
        '/services/vip-escort-hamburg',
        '/models',
        '/blog',
        '/escort/hafencity',
        '/p/diskretion',
        '/kontakt',
        '/ueber-uns',
        '/impressum',
        '/faq'
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        try:
            resp = requests.get(url, timeout=30)
            if resp.status_code == 200:
                print(f"✓ {endpoint} → 200")
            else:
                print(f"✗ {endpoint} → {resp.status_code} (expected 200)")
                all_passed = False
        except Exception as e:
            print(f"✗ {endpoint} → Exception: {e}")
            all_passed = False
    
    if all_passed:
        print("\n✅ REGRESSION ON PRIOR WORK PASSED")
    else:
        print("\n✗ REGRESSION ON PRIOR WORK FAILED")
    
    return all_passed

def main():
    """Run all tests"""
    print("="*80)
    print("PHASE 3 CHUNK D7 - BACKEND TESTING")
    print("Public /escort-hamburg landing + /areas list (+ EN twins)")
    print("="*80)
    
    results = {}
    
    # Test 1: DE /escort-hamburg
    results['escort_hamburg_de'] = test_escort_hamburg_de()
    
    # Test 2: EN /en/escort-hamburg
    results['escort_hamburg_en'] = test_escort_hamburg_en()
    
    # Test 3: DE /areas
    results['areas_de'] = test_areas_de()
    
    # Test 4: EN /en/areas
    results['areas_en'] = test_areas_en()
    
    # Test 5: EN 0-leak scan
    results['en_leak_scan'] = test_en_leak_scan()
    
    # Test 6: Sitemap regression
    results['sitemap_regression'] = test_sitemap_regression()
    
    # Test 7: Regression on prior work
    results['regression_prior_work'] = test_regression_prior_work()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Phase 3 chunk d7 is production-ready.")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed. Please review the output above.")
        return 1

if __name__ == '__main__':
    exit(main())
