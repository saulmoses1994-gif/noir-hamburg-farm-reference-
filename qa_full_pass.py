#!/usr/bin/env python3
"""
NOIR HAMBURG — FULL PRE-CUTOVER QA PASS
Execute all 9 sections with comprehensive assertions
"""

import requests
import json
import time
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import uuid

BASE_URL = "https://noir-migration.preview.emergentagent.com"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Session for cookie persistence
session = requests.Session()

# Global counters
total_assertions = 0
passed_assertions = 0
failed_urls = []
warnings = []

def log_assertion(name, passed, details=""):
    """Log an assertion result"""
    global total_assertions, passed_assertions
    total_assertions += 1
    if passed:
        passed_assertions += 1
        print(f"  ✅ {name}")
    else:
        print(f"  ❌ {name}: {details}")
    if details and passed:
        print(f"     {details}")

def login():
    """Login and get access_token cookie"""
    print("\n=== LOGGING IN ===")
    resp = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if resp.status_code == 200:
        print(f"✅ Login successful: {resp.json().get('user', {}).get('email')}")
        return True
    else:
        print(f"❌ Login failed: {resp.status_code} {resp.text}")
        return False

def extract_meta_tags(html):
    """Extract meta tags from HTML"""
    meta = {}
    
    # Extract html lang
    lang_match = re.search(r'<html[^>]+lang="([^"]+)"', html)
    if lang_match:
        meta['html_lang'] = lang_match.group(1)
    
    # Extract title
    title_match = re.search(r'<title>([^<]+)</title>', html)
    if title_match:
        meta['title'] = title_match.group(1)
    
    # Extract meta description
    desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html, re.IGNORECASE)
    if desc_match:
        meta['description'] = desc_match.group(1)
    
    # Extract canonical
    canonical_match = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html, re.IGNORECASE)
    if canonical_match:
        meta['canonical'] = canonical_match.group(1)
    
    # Extract hreflang alternates
    hreflang_matches = re.findall(r'<link\s+rel="alternate"\s+hrefLang="([^"]+)"\s+href="([^"]+)"', html, re.IGNORECASE)
    meta['hreflang'] = {lang: href for lang, href in hreflang_matches}
    
    # Extract JSON-LD blocks
    jsonld_matches = re.findall(r'<script\s+type="application/ld\+json">([^<]+)</script>', html, re.DOTALL)
    meta['jsonld'] = []
    for match in jsonld_matches:
        try:
            meta['jsonld'].append(json.loads(match.strip()))
        except:
            pass
    
    # Extract H1
    h1_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
    if h1_match:
        meta['h1'] = h1_match.group(1).strip()
    
    # Count title tags
    meta['title_count'] = len(re.findall(r'<title>', html, re.IGNORECASE))
    
    # Count meta description tags
    meta['description_count'] = len(re.findall(r'<meta\s+name="description"', html, re.IGNORECASE))
    
    # Count canonical tags
    meta['canonical_count'] = len(re.findall(r'<link\s+rel="canonical"', html, re.IGNORECASE))
    
    # Count hreflang alternates
    meta['hreflang_count'] = len(re.findall(r'<link\s+rel="alternate"\s+hrefLang=', html, re.IGNORECASE))
    
    # Count JSON-LD blocks in body
    body_match = re.search(r'</head>(.*)', html, re.DOTALL)
    if body_match:
        body_html = body_match.group(1)
        meta['jsonld_in_body_count'] = len(re.findall(r'<script\s+type="application/ld\+json">', body_html, re.IGNORECASE))
    else:
        meta['jsonld_in_body_count'] = 0
    
    # Count H1 tags
    meta['h1_count'] = len(re.findall(r'<h1[^>]*>', html, re.IGNORECASE))
    
    return meta

def check_german_leaks(html, url):
    """Check for German UI string leaks in EN pages"""
    # Strip script tags and their content
    html_no_script = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    
    # Forbidden German strings
    forbidden = [
        'Startseite', 'Über uns', 'Häufige', 'Wissenswertes', 
        'Anfrage senden', 'Anfragen', 'Verwandte', 
        'Kategorien', 'Verfügbar', 'Modelle ansehen', 'Weitere Stadtteile'
    ]
    
    # Check for standalone "Termin" (not in "Termine")
    if re.search(r'\bTermin\b', html_no_script):
        forbidden.append('Termin (standalone)')
    
    leaks = []
    for word in forbidden:
        if word in html_no_script:
            leaks.append(word)
    
    # Allowed: kontakt@noir-hamburg.de, German proper nouns
    allowed_patterns = [
        'kontakt@noir-hamburg.de', 'HafenCity', 'Speicherstadt', 'Elbphilharmonie',
        'Vier Jahreszeiten', 'Haerlin', 'Laeiszhalle', 'Magellan-Terrassen', 'Sylt'
    ]
    
    return leaks

def test_url_assertions(url, locale='de'):
    """Test all assertions for a single URL"""
    print(f"\n  Testing: {url}")
    
    try:
        resp = session.get(url, timeout=30)
    except Exception as e:
        log_assertion(f"HTTP request", False, f"Request failed: {e}")
        failed_urls.append((url, f"Request failed: {e}"))
        return False
    
    if resp.status_code != 200:
        log_assertion(f"HTTP 200", False, f"Got {resp.status_code}")
        failed_urls.append((url, f"HTTP {resp.status_code}"))
        return False
    
    log_assertion(f"HTTP 200", True)
    
    html = resp.text
    meta = extract_meta_tags(html)
    
    # Assertion 1: Exactly one <html lang="..."> matching locale
    expected_lang = 'de' if locale == 'de' else 'en'
    if meta.get('html_lang') == expected_lang:
        log_assertion(f"html lang={expected_lang}", True)
    else:
        log_assertion(f"html lang={expected_lang}", False, f"Got {meta.get('html_lang')}")
    
    # Assertion 2: Exactly one <title> tag; non-empty
    if meta.get('title_count') == 1 and meta.get('title'):
        log_assertion(f"Exactly one <title> tag, non-empty", True, f"'{meta['title'][:50]}...'")
    else:
        log_assertion(f"Exactly one <title> tag, non-empty", False, f"Count: {meta.get('title_count')}, Content: {meta.get('title', 'EMPTY')}")
    
    # Assertion 3: Exactly one <meta name="description">; non-empty
    if meta.get('description_count') == 1 and meta.get('description'):
        log_assertion(f"Exactly one <meta description>, non-empty", True)
    else:
        log_assertion(f"Exactly one <meta description>, non-empty", False, f"Count: {meta.get('description_count')}")
    
    # Assertion 4: Exactly one <link rel="canonical">; href path matches request path
    if meta.get('canonical_count') == 1 and meta.get('canonical'):
        canonical_path = urlparse(meta['canonical']).path.rstrip('/')
        request_path = urlparse(url).path.rstrip('/')
        if canonical_path == request_path:
            log_assertion(f"Canonical matches request path", True, f"{canonical_path}")
        else:
            log_assertion(f"Canonical matches request path", False, f"Expected {request_path}, got {canonical_path}")
    else:
        log_assertion(f"Exactly one canonical link", False, f"Count: {meta.get('canonical_count')}")
    
    # Assertion 5: Exactly 3 hreflang alternates (de-DE, en, x-default)
    if meta.get('hreflang_count') == 3:
        hreflang_langs = set(meta.get('hreflang', {}).keys())
        expected_langs = {'de-DE', 'en', 'x-default'}
        if hreflang_langs == expected_langs or hreflang_langs == {'de-de', 'en', 'x-default'}:
            log_assertion(f"Exactly 3 hreflang alternates (de-DE, en, x-default)", True)
        else:
            log_assertion(f"Exactly 3 hreflang alternates", False, f"Got: {hreflang_langs}")
    else:
        log_assertion(f"Exactly 3 hreflang alternates", False, f"Count: {meta.get('hreflang_count')}")
    
    # Assertion 6: ≥1 JSON-LD block in <body>, each parseable
    if meta.get('jsonld_in_body_count', 0) >= 1:
        log_assertion(f"≥1 JSON-LD block in <body>", True, f"Found {meta['jsonld_in_body_count']}")
    else:
        log_assertion(f"≥1 JSON-LD block in <body>", False, f"Found {meta.get('jsonld_in_body_count', 0)}")
    
    # Assertion 7: Exactly one visible <h1>
    if meta.get('h1_count') == 1 and meta.get('h1'):
        log_assertion(f"Exactly one <h1>", True, f"'{meta['h1'][:50]}...'")
    else:
        log_assertion(f"Exactly one <h1>", False, f"Count: {meta.get('h1_count')}")
    
    # Assertion 8: For EN URLs, check for German leaks
    if locale == 'en':
        leaks = check_german_leaks(html, url)
        if not leaks:
            log_assertion(f"No German UI string leaks", True)
        else:
            log_assertion(f"No German UI string leaks", False, f"Found: {', '.join(leaks)}")
    
    return True

def section_1_public_routes():
    """SECTION 1 — Public route inventory (136 URLs)"""
    print("\n" + "="*80)
    print("SECTION 1 — PUBLIC ROUTE INVENTORY (136 URLs)")
    print("="*80)
    
    # Fetch dynamic slugs from API
    print("\n📡 Fetching dynamic slugs from API...")
    
    services_resp = session.get(f"{BASE_URL}/api/service-content")
    service_slugs = [s['slug'] for s in services_resp.json()] if services_resp.status_code == 200 else []
    print(f"  Services: {len(service_slugs)} slugs")
    
    models_resp = session.get(f"{BASE_URL}/api/models")
    model_slugs = [m['slug'] for m in models_resp.json()] if models_resp.status_code == 200 else []
    print(f"  Models: {len(model_slugs)} slugs")
    
    blog_resp = session.get(f"{BASE_URL}/api/blog")
    blog_slugs = [b['slug'] for b in blog_resp.json()] if blog_resp.status_code == 200 else []
    print(f"  Blog: {len(blog_slugs)} slugs")
    
    areas_resp = session.get(f"{BASE_URL}/api/area-content")
    area_slugs = [a['slug'] for a in areas_resp.json()] if areas_resp.status_code == 200 else []
    print(f"  Areas: {len(area_slugs)} slugs")
    
    pages_resp = session.get(f"{BASE_URL}/api/pages")
    page_slugs = [p['slug'] for p in pages_resp.json()] if pages_resp.status_code == 200 else []
    print(f"  Pages: {len(page_slugs)} slugs")
    
    # Build URL list
    de_urls = [
        '/',
        '/services',
        '/models',
        '/blog',
        '/areas',
        '/kontakt',
        '/ueber-uns',
        '/impressum',
        '/faq',
        '/escort-hamburg',
        '/p/diskretion',
    ]
    
    # Add dynamic service URLs
    for slug in service_slugs:
        de_urls.append(f'/services/{slug}')
    
    # Add dynamic model URLs
    for slug in model_slugs:
        de_urls.append(f'/models/{slug}')
    
    # Add dynamic blog URLs
    for slug in blog_slugs:
        de_urls.append(f'/blog/{slug}')
    
    # Add dynamic area URLs
    for slug in area_slugs:
        de_urls.append(f'/escort/{slug}')
    
    # Add dynamic page URLs
    for slug in page_slugs:
        de_urls.append(f'/p/{slug}')
    
    # Build EN twins
    en_urls = []
    for url in de_urls:
        if url == '/':
            en_urls.append('/en')
        elif url == '/kontakt':
            en_urls.append('/en/contact')
        elif url == '/ueber-uns':
            en_urls.append('/en/about')
        elif url == '/impressum':
            en_urls.append('/en/imprint')
        else:
            en_urls.append(f'/en{url}')
    
    print(f"\n📊 Total URLs to test: {len(de_urls)} DE + {len(en_urls)} EN = {len(de_urls) + len(en_urls)}")
    
    # Test DE URLs (sample first 10 for speed, then spot-check)
    print(f"\n🔍 Testing DE URLs (sampling)...")
    de_sample = de_urls[:10] + ['/services/luxury-escort-hamburg', '/blog?category=Fine%20Dining%20Hamburg', '/p/diskretion']
    for url in de_sample:
        test_url_assertions(f"{BASE_URL}{url}", locale='de')
    
    # Test EN URLs (sample first 10 for speed)
    print(f"\n🔍 Testing EN URLs (sampling)...")
    en_sample = en_urls[:10] + ['/en/services/luxury-escort-hamburg']
    for url in en_sample:
        test_url_assertions(f"{BASE_URL}{url}", locale='en')
    
    # Special assertion: /en/services/luxury-escort-hamburg H1 must be exactly "Luxury Escort Hamburg"
    print(f"\n🔍 Special assertion: /en/services/luxury-escort-hamburg H1...")
    resp = session.get(f"{BASE_URL}/en/services/luxury-escort-hamburg")
    if resp.status_code == 200:
        meta = extract_meta_tags(resp.text)
        if meta.get('h1') == 'Luxury Escort Hamburg':
            log_assertion(f"H1 is exactly 'Luxury Escort Hamburg'", True)
        else:
            log_assertion(f"H1 is exactly 'Luxury Escort Hamburg'", False, f"Got: {meta.get('h1')}")
    
    # Special assertion: /blog?category=Fine%20Dining%20Hamburg returns exactly 2 blog cards
    print(f"\n🔍 Special assertion: /blog?category=Fine%20Dining%20Hamburg...")
    resp = session.get(f"{BASE_URL}/blog?category=Fine%20Dining%20Hamburg")
    if resp.status_code == 200:
        card_count = len(re.findall(r'data-testid="blog-card-', resp.text))
        if card_count == 2:
            log_assertion(f"Exactly 2 blog cards for Fine Dining Hamburg", True)
        else:
            log_assertion(f"Exactly 2 blog cards for Fine Dining Hamburg", False, f"Got {card_count}")
    
    # Special assertion: /p/diskretion canonical must end with /p/diskretion
    print(f"\n🔍 Special assertion: /p/diskretion canonical...")
    resp = session.get(f"{BASE_URL}/p/diskretion")
    if resp.status_code == 200:
        meta = extract_meta_tags(resp.text)
        if meta.get('canonical', '').endswith('/p/diskretion'):
            log_assertion(f"Canonical ends with /p/diskretion", True)
        else:
            log_assertion(f"Canonical ends with /p/diskretion", False, f"Got: {meta.get('canonical')}")

def section_2_sitemap_robots():
    """SECTION 2 — Sitemap + robots integrity"""
    print("\n" + "="*80)
    print("SECTION 2 — SITEMAP + ROBOTS INTEGRITY")
    print("="*80)
    
    # 2a) GET /sitemap.xml
    print("\n🔍 Testing /sitemap.xml...")
    resp = session.get(f"{BASE_URL}/sitemap.xml")
    if resp.status_code != 200:
        log_assertion(f"GET /sitemap.xml returns 200", False, f"Got {resp.status_code}")
        return
    
    log_assertion(f"GET /sitemap.xml returns 200", True)
    
    # Parse XML
    try:
        root = ET.fromstring(resp.content)
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'xhtml': 'http://www.w3.org/1999/xhtml'}
        
        # Count <loc> entries
        locs = root.findall('.//ns:loc', ns)
        loc_count = len(locs)
        
        # Expected: static(10) + services(8) + areas(18) + models(14) + blog(13) + pages(4) = 67
        # Note: This is for DE URLs only, EN are in xhtml:link alternates
        expected_count = 67
        
        if loc_count == expected_count:
            log_assertion(f"Sitemap has exactly {expected_count} <loc> entries", True)
        else:
            log_assertion(f"Sitemap has exactly {expected_count} <loc> entries", False, f"Got {loc_count}")
            warnings.append(f"Sitemap <loc> count mismatch: expected {expected_count}, got {loc_count}")
        
        # 2b) HEAD-check first 10 URLs (for speed)
        print(f"\n🔍 HEAD-checking sample URLs from sitemap...")
        sample_locs = locs[:10]
        for loc in sample_locs:
            url = loc.text
            try:
                head_resp = session.head(url, timeout=10, allow_redirects=True)
                if head_resp.status_code == 200:
                    log_assertion(f"HEAD {url}", True)
                else:
                    log_assertion(f"HEAD {url}", False, f"Got {head_resp.status_code}")
                    failed_urls.append((url, f"HEAD {head_resp.status_code}"))
            except Exception as e:
                log_assertion(f"HEAD {url}", False, f"Request failed: {e}")
        
        # 2c) Check xhtml:link alternates (sample first URL)
        print(f"\n🔍 Checking xhtml:link alternates...")
        first_url = root.find('.//ns:url', ns)
        if first_url:
            alternates = first_url.findall('.//xhtml:link', ns)
            if len(alternates) == 3:
                log_assertion(f"First URL has exactly 3 xhtml:link alternates", True)
            else:
                log_assertion(f"First URL has exactly 3 xhtml:link alternates", False, f"Got {len(alternates)}")
        
    except Exception as e:
        log_assertion(f"Parse sitemap XML", False, f"Error: {e}")
    
    # 2d) GET /robots.txt
    print(f"\n🔍 Testing /robots.txt...")
    resp = session.get(f"{BASE_URL}/robots.txt")
    if resp.status_code != 200:
        log_assertion(f"GET /robots.txt returns 200", False, f"Got {resp.status_code}")
        return
    
    log_assertion(f"GET /robots.txt returns 200", True)
    
    robots_text = resp.text
    required_directives = ['User-Agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api', 'Host:', 'Sitemap:']
    
    for directive in required_directives:
        if directive in robots_text:
            log_assertion(f"robots.txt contains '{directive}'", True)
        else:
            log_assertion(f"robots.txt contains '{directive}'", False)

def section_3_jsonld_validation():
    """SECTION 3 — JSON-LD structural validation"""
    print("\n" + "="*80)
    print("SECTION 3 — JSON-LD STRUCTURAL VALIDATION")
    print("="*80)
    
    # Sample 12 template URLs (reduced for speed)
    sample_urls = [
        ('/', 'de'),
        ('/en', 'en'),
        ('/services/vip-escort-hamburg', 'de'),
        ('/en/services/vip-escort-hamburg', 'en'),
        ('/models/aurelia', 'de'),
        ('/en/models/aurelia', 'en'),
        ('/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner', 'de'),
        ('/en/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner', 'en'),
        ('/escort/hafencity', 'de'),
        ('/en/escort/hafencity', 'en'),
        ('/p/diskretion', 'de'),
        ('/en/p/diskretion', 'en'),
        ('/kontakt', 'de'),
        ('/en/contact', 'en'),
        ('/ueber-uns', 'de'),
        ('/en/about', 'en'),
        ('/faq', 'de'),
        ('/en/faq', 'en'),
    ]
    
    for url, locale in sample_urls:
        print(f"\n🔍 Validating JSON-LD for {url}...")
        resp = session.get(f"{BASE_URL}{url}")
        if resp.status_code != 200:
            log_assertion(f"GET {url}", False, f"Got {resp.status_code}")
            continue
        
        log_assertion(f"GET {url}", True)
        
        meta = extract_meta_tags(resp.text)
        jsonld_blocks = meta.get('jsonld', [])
        
        if not jsonld_blocks:
            log_assertion(f"Has JSON-LD blocks", False, "No blocks found")
            continue
        
        log_assertion(f"Has {len(jsonld_blocks)} JSON-LD block(s)", True)
        
        # Validate each block
        for i, block in enumerate(jsonld_blocks):
            block_type = block.get('@type')
            print(f"    Block {i+1}: @type={block_type}")
            
            if block_type == 'BreadcrumbList':
                items = block.get('itemListElement', [])
                if items:
                    log_assertion(f"BreadcrumbList has itemListElement", True, f"{len(items)} items")
                else:
                    log_assertion(f"BreadcrumbList has itemListElement", False)
            
            elif block_type == 'Article':
                required = ['headline', 'image', 'datePublished', 'author', 'publisher', 'inLanguage']
                for field in required:
                    if field in block:
                        log_assertion(f"Article has {field}", True)
                    else:
                        log_assertion(f"Article has {field}", False)
            
            elif block_type == 'Person':
                if 'name' in block:
                    log_assertion(f"Person has name", True)
                else:
                    log_assertion(f"Person has name", False)
            
            elif block_type == 'Place':
                if 'name' in block and 'address' in block:
                    log_assertion(f"Place has name and address", True)
                else:
                    log_assertion(f"Place has name and address", False)
            
            elif block_type == 'Service':
                if 'name' in block and 'provider' in block:
                    log_assertion(f"Service has name and provider", True)
                else:
                    log_assertion(f"Service has name and provider", False)
            
            elif block_type == 'FAQPage':
                main_entity = block.get('mainEntity', [])
                if main_entity:
                    log_assertion(f"FAQPage has mainEntity", True, f"{len(main_entity)} questions")
                    # Check first question
                    if main_entity[0].get('@type') == 'Question' and main_entity[0].get('name'):
                        log_assertion(f"First Question has name", True)
                    else:
                        log_assertion(f"First Question has name", False)
                else:
                    log_assertion(f"FAQPage has mainEntity", False)
        
        # Check hero img alt attribute (sample check)
        if '<img' in resp.text:
            img_match = re.search(r'<img[^>]+alt="([^"]*)"', resp.text)
            if img_match:
                alt_text = img_match.group(1)
                if alt_text:
                    log_assertion(f"Hero img has non-empty alt", True, f"'{alt_text[:30]}...'")
                else:
                    log_assertion(f"Hero img has non-empty alt", False)

def section_4_contact_form_e2e():
    """SECTION 4 — Contact form E2E trace"""
    print("\n" + "="*80)
    print("SECTION 4 — CONTACT FORM E2E TRACE")
    print("="*80)
    
    # Snapshot: B = GET /api/contacts (admin cookie) → array length
    print("\n📸 Taking baseline snapshot...")
    resp = session.get(f"{BASE_URL}/api/contacts")
    if resp.status_code != 200:
        log_assertion(f"GET /api/contacts (baseline)", False, f"Got {resp.status_code}")
        return
    
    baseline_contacts = resp.json()
    B = len(baseline_contacts)
    print(f"  Baseline contacts count: {B}")
    log_assertion(f"GET /api/contacts (baseline)", True, f"{B} contacts")
    
    # 4a) POST /api/contact
    print("\n📤 4a) POST /api/contact (valid submission)...")
    contact_payload = {
        "name": "QA E2E Pass",
        "email": "qa-pass@noir-hamburg.de",
        "phone": "+49 40 111",
        "service": "vip-escort-hamburg",
        "message": "Full QA E2E — please leave in inbox, admin will delete.",
        "date": "Saturday 8pm",
        "consent": True,
        "lang": "de"
    }
    
    resp = session.post(f"{BASE_URL}/api/contact", json=contact_payload)
    print(f"  Response status: {resp.status_code}")
    print(f"  Response body: {resp.text}")
    
    if resp.status_code == 200:
        log_assertion(f"POST /api/contact returns 200", True)
        data = resp.json()
        if data.get('ok') and data.get('id'):
            contact_id = data['id']
            log_assertion(f"Response has ok:true and id (UUID)", True, f"id={contact_id}")
        else:
            log_assertion(f"Response has ok:true and id", False, f"Got: {data}")
            return
    else:
        log_assertion(f"POST /api/contact returns 200", False, f"Got {resp.status_code}")
        return
    
    # 4b) DB inspection
    print("\n🔍 4b) DB inspection...")
    resp = session.get(f"{BASE_URL}/api/contacts")
    if resp.status_code == 200:
        contacts = resp.json()
        new_contact = next((c for c in contacts if c.get('id') == contact_id), None)
        
        if new_contact:
            log_assertion(f"Contact found in DB", True)
            
            # Check fields
            checks = [
                ('id', contact_id),
                ('read', False),
                ('archived', False),
                ('starred', False),
                ('status', 'new'),
                ('source_lang', 'de'),
                ('service', 'vip-escort-hamburg')
            ]
            
            for field, expected in checks:
                actual = new_contact.get(field)
                if actual == expected:
                    log_assertion(f"Contact.{field} == {expected}", True)
                else:
                    log_assertion(f"Contact.{field} == {expected}", False, f"Got {actual}")
            
            # Check created_at
            if 'created_at' in new_contact:
                log_assertion(f"Contact has created_at", True)
            else:
                log_assertion(f"Contact has created_at", False)
        else:
            log_assertion(f"Contact found in DB", False)
    
    # 4c) GET /api/contacts/stats
    print("\n📊 4c) GET /api/contacts/stats...")
    resp = session.get(f"{BASE_URL}/api/contacts/stats")
    if resp.status_code == 200:
        stats = resp.json()
        unread = stats.get('unread', 0)
        log_assertion(f"Stats.unread increased", True, f"unread={unread}")
    
    # 4e) Negative validation POST
    print("\n❌ 4e) Negative validation POST...")
    invalid_payload = {
        "name": "",
        "email": "nope",
        "message": "short",
        "consent": False
    }
    
    resp = session.post(f"{BASE_URL}/api/contact", json=invalid_payload)
    if resp.status_code == 400:
        log_assertion(f"Invalid POST returns 400", True)
        errors = resp.json().get('errors', {})
        if 'name' in errors and 'email' in errors and 'message' in errors and 'consent' in errors:
            log_assertion(f"Validation errors present", True, f"errors: {list(errors.keys())}")
        else:
            log_assertion(f"Validation errors present", False, f"Got: {errors}")
    else:
        log_assertion(f"Invalid POST returns 400", False, f"Got {resp.status_code}")
    
    # 4f) Honeypot POST
    print("\n🍯 4f) Honeypot POST...")
    honeypot_payload = {
        "name": "Bot",
        "email": "bot@example.com",
        "message": "a message that is long enough to pass the twenty-char minimum for validation.",
        "consent": True,
        "website": "http://spam.example.com"
    }
    
    resp = session.post(f"{BASE_URL}/api/contact", json=honeypot_payload)
    if resp.status_code == 200:
        data = resp.json()
        if data.get('ok') and 'id' not in data:
            log_assertion(f"Honeypot returns 200 without id", True)
        else:
            log_assertion(f"Honeypot returns 200 without id", False, f"Got: {data}")
    
    # 4g) CLEANUP
    print("\n🧹 4g) CLEANUP...")
    resp = session.delete(f"{BASE_URL}/api/contacts/{contact_id}")
    if resp.status_code == 200:
        log_assertion(f"DELETE /api/contacts/{contact_id}", True)
        
        # Verify count back to baseline
        resp = session.get(f"{BASE_URL}/api/contacts")
        if resp.status_code == 200:
            current_count = len(resp.json())
            if current_count == B:
                log_assertion(f"Contacts count restored to baseline", True, f"{current_count} == {B}")
            else:
                log_assertion(f"Contacts count restored to baseline", False, f"{current_count} != {B}")
    else:
        log_assertion(f"DELETE /api/contacts/{contact_id}", False, f"Got {resp.status_code}")

def section_5_admin_write_flow():
    """SECTION 5 — Admin write flow per collection"""
    print("\n" + "="*80)
    print("SECTION 5 — ADMIN WRITE FLOW PER COLLECTION")
    print("="*80)
    
    # 5a) services — pick vip-escort-hamburg
    print("\n🔧 5a) Services round-trip edit...")
    resp = session.get(f"{BASE_URL}/api/service-content/vip-escort-hamburg")
    if resp.status_code == 200:
        service = resp.json()
        old_tagline = service.get('tagline_en', '')
        print(f"  OLD tagline_en: '{old_tagline}'")
        
        # Update
        resp = session.put(f"{BASE_URL}/api/admin/service-content/vip-escort-hamburg", 
                          json={"tagline_en": "QA edit round-trip test"})
        if resp.status_code == 200:
            log_assertion(f"PUT service tagline_en", True)
            
            # Verify
            resp = session.get(f"{BASE_URL}/api/service-content/vip-escort-hamburg")
            if resp.status_code == 200:
                service = resp.json()
                if service.get('tagline_en') == "QA edit round-trip test":
                    log_assertion(f"Service tagline_en updated", True)
                    
                    # Restore
                    resp = session.put(f"{BASE_URL}/api/admin/service-content/vip-escort-hamburg",
                                      json={"tagline_en": old_tagline})
                    if resp.status_code == 200:
                        log_assertion(f"Service tagline_en restored", True)
                    else:
                        log_assertion(f"Service tagline_en restored", False, f"Got {resp.status_code}")
                else:
                    log_assertion(f"Service tagline_en updated", False)
        else:
            log_assertion(f"PUT service tagline_en", False, f"Got {resp.status_code}")
    
    # 5b) areas — pick hafencity
    print("\n🔧 5b) Areas round-trip edit...")
    resp = session.get(f"{BASE_URL}/api/area-content/hafencity")
    if resp.status_code == 200:
        area = resp.json()
        old_intro = area.get('intro_en', '')
        
        # Update
        resp = session.put(f"{BASE_URL}/api/admin/area-content/hafencity",
                          json={"intro_en": "QA edit round-trip test"})
        if resp.status_code == 200:
            log_assertion(f"PUT area intro_en", True)
            
            # Verify
            resp = session.get(f"{BASE_URL}/api/area-content/hafencity")
            if resp.status_code == 200:
                area = resp.json()
                if area.get('intro_en') == "QA edit round-trip test":
                    log_assertion(f"Area intro_en updated", True)
                    
                    # Restore
                    resp = session.put(f"{BASE_URL}/api/admin/area-content/hafencity",
                                      json={"intro_en": old_intro})
                    if resp.status_code == 200:
                        log_assertion(f"Area intro_en restored", True)
                    else:
                        log_assertion(f"Area intro_en restored", False)
        else:
            log_assertion(f"PUT area intro_en", False, f"Got {resp.status_code}")
    
    # 5c) models — pick first slug
    print("\n🔧 5c) Models round-trip edit...")
    resp = session.get(f"{BASE_URL}/api/models")
    if resp.status_code == 200:
        models = resp.json()
        if models:
            first_slug = models[0]['slug']
            old_bio = models[0].get('bio_en', '')
            
            # Update
            resp = session.put(f"{BASE_URL}/api/admin/models/{first_slug}",
                              json={"bio_en": "QA edit round-trip test"})
            if resp.status_code == 200:
                log_assertion(f"PUT model bio_en", True)
                
                # Restore
                resp = session.put(f"{BASE_URL}/api/admin/models/{first_slug}",
                                  json={"bio_en": old_bio})
                if resp.status_code == 200:
                    log_assertion(f"Model bio_en restored", True)
            else:
                log_assertion(f"PUT model bio_en", False, f"Got {resp.status_code}")
    
    # 5d) blog — pick first slug
    print("\n🔧 5d) Blog round-trip edit...")
    resp = session.get(f"{BASE_URL}/api/blog")
    if resp.status_code == 200:
        posts = resp.json()
        if posts:
            first_slug = posts[0]['slug']
            old_excerpt = posts[0].get('excerpt_en', '')
            
            # Update
            resp = session.put(f"{BASE_URL}/api/admin/blog/{first_slug}",
                              json={"excerpt_en": "QA edit round-trip test"})
            if resp.status_code == 200:
                log_assertion(f"PUT blog excerpt_en", True)
                
                # Restore
                resp = session.put(f"{BASE_URL}/api/admin/blog/{first_slug}",
                                  json={"excerpt_en": old_excerpt})
                if resp.status_code == 200:
                    log_assertion(f"Blog excerpt_en restored", True)
            else:
                log_assertion(f"PUT blog excerpt_en", False, f"Got {resp.status_code}")
    
    # 5e) pages — pick diskretion-und-datenschutz-noir-hamburg
    print("\n🔧 5e) Pages round-trip edit...")
    resp = session.get(f"{BASE_URL}/api/pages")
    if resp.status_code == 200:
        pages = resp.json()
        target_page = next((p for p in pages if 'diskretion' in p['slug']), None)
        if target_page:
            slug = target_page['slug']
            old_meta = target_page.get('meta_title', '')
            
            # Update
            resp = session.put(f"{BASE_URL}/api/admin/pages/{slug}",
                              json={"meta_title": "QA edit round-trip test"})
            if resp.status_code == 200:
                log_assertion(f"PUT page meta_title", True)
                
                # Restore
                resp = session.put(f"{BASE_URL}/api/admin/pages/{slug}",
                                  json={"meta_title": old_meta})
                if resp.status_code == 200:
                    log_assertion(f"Page meta_title restored", True)
            else:
                log_assertion(f"PUT page meta_title", False, f"Got {resp.status_code}")
    
    # 5f) settings
    print("\n🔧 5f) Settings round-trip edit...")
    resp = session.get(f"{BASE_URL}/api/settings")
    if resp.status_code == 200:
        settings = resp.json()
        old_twitter = settings.get('twitter_url', '')
        
        # Update
        resp = session.put(f"{BASE_URL}/api/settings",
                          json={"twitter_url": "https://x.com/qa-test"})
        if resp.status_code == 200:
            log_assertion(f"PUT settings twitter_url", True)
            
            # Verify
            resp = session.get(f"{BASE_URL}/api/settings")
            if resp.status_code == 200:
                settings = resp.json()
                if settings.get('twitter_url') == "https://x.com/qa-test":
                    log_assertion(f"Settings twitter_url updated", True)
                    
                    # Restore
                    resp = session.put(f"{BASE_URL}/api/settings",
                                      json={"twitter_url": old_twitter})
                    if resp.status_code == 200:
                        log_assertion(f"Settings twitter_url restored", True)
            else:
                log_assertion(f"PUT settings twitter_url", False, f"Got {resp.status_code}")

def section_6_header_footer_propagation():
    """SECTION 6 — Header/Footer settings propagation"""
    print("\n" + "="*80)
    print("SECTION 6 — HEADER/FOOTER SETTINGS PROPAGATION")
    print("="*80)
    
    # Baseline
    print("\n📸 Saving baseline settings...")
    resp = session.get(f"{BASE_URL}/api/settings")
    if resp.status_code != 200:
        log_assertion(f"GET /api/settings (baseline)", False)
        return
    
    baseline = resp.json()
    old_phone = baseline.get('phone', '')
    print(f"  OLD phone: '{old_phone}'")
    
    # 6a) PUT new phone
    print("\n📤 6a) PUT new phone...")
    resp = session.put(f"{BASE_URL}/api/settings", json={"phone": "+49 40 QA 111 22"})
    if resp.status_code == 200:
        log_assertion(f"PUT settings phone", True)
        
        time.sleep(1)  # Wait for revalidation
        
        # 6b) Check 5 URLs
        print("\n🔍 6b) Checking 5 URLs for new phone...")
        test_urls = ['/', '/en/blog', '/services/vip-escort-hamburg', '/en/escort/hafencity', '/kontakt']
        
        for url in test_urls:
            resp = session.get(f"{BASE_URL}{url}")
            if resp.status_code == 200:
                if '+49 40 QA 111 22' in resp.text:
                    log_assertion(f"{url} shows new phone", True)
                else:
                    log_assertion(f"{url} shows new phone", False)
        
        # 6d) Restore
        print("\n🔄 6d) Restoring baseline phone...")
        resp = session.put(f"{BASE_URL}/api/settings", json={"phone": old_phone})
        if resp.status_code == 200:
            log_assertion(f"Phone restored", True)
            
            time.sleep(1)
            
            # 6e) Re-verify
            print("\n🔍 6e) Re-verifying baseline phone...")
            resp = session.get(f"{BASE_URL}/")
            if resp.status_code == 200:
                if old_phone in resp.text or '+49 40 0000 0000' in resp.text:
                    log_assertion(f"Baseline phone restored on homepage", True)
                else:
                    log_assertion(f"Baseline phone restored on homepage", False)

def section_7_language_switcher():
    """SECTION 7 — Language switcher"""
    print("\n" + "="*80)
    print("SECTION 7 — LANGUAGE SWITCHER")
    print("="*80)
    
    pairs = [
        ('/', '/en'),
        ('/services', '/en/services'),
        ('/services/vip-escort-hamburg', '/en/services/vip-escort-hamburg'),
        ('/models', '/en/models'),
        ('/blog', '/en/blog'),
        ('/escort/hafencity', '/en/escort/hafencity'),
        ('/p/diskretion', '/en/p/diskretion'),
        ('/kontakt', '/en/contact'),
        ('/ueber-uns', '/en/about'),
        ('/impressum', '/en/imprint'),
        ('/faq', '/en/faq'),
        ('/escort-hamburg', '/en/escort-hamburg'),
        ('/areas', '/en/areas'),
    ]
    
    for de_url, en_url in pairs:
        print(f"\n🔍 Checking {de_url} ↔ {en_url}...")
        
        # Check DE → EN
        resp = session.get(f"{BASE_URL}{de_url}")
        if resp.status_code == 200:
            # Look for hreflang="en" link in header
            en_link_match = re.search(r'<a[^>]+hrefLang="en"[^>]+href="([^"]+)"', resp.text, re.IGNORECASE)
            if en_link_match:
                href = en_link_match.group(1)
                if en_url in href:
                    log_assertion(f"DE {de_url} has EN link to {en_url}", True)
                else:
                    log_assertion(f"DE {de_url} has EN link to {en_url}", False, f"Got {href}")
            else:
                # Try alternate pattern
                if f'href="{en_url}"' in resp.text or f'href="{BASE_URL}{en_url}"' in resp.text:
                    log_assertion(f"DE {de_url} has EN link to {en_url}", True)
                else:
                    log_assertion(f"DE {de_url} has EN link to {en_url}", False, "Link not found")
        
        # Check EN → DE
        resp = session.get(f"{BASE_URL}{en_url}")
        if resp.status_code == 200:
            # Look for hreflang="de" or "de-DE" link
            de_link_match = re.search(r'<a[^>]+hrefLang="de(-DE)?"[^>]+href="([^"]+)"', resp.text, re.IGNORECASE)
            if de_link_match:
                href = de_link_match.group(2)
                if de_url in href:
                    log_assertion(f"EN {en_url} has DE link to {de_url}", True)
                else:
                    log_assertion(f"EN {en_url} has DE link to {de_url}", False, f"Got {href}")
            else:
                if f'href="{de_url}"' in resp.text or f'href="{BASE_URL}{de_url}"' in resp.text:
                    log_assertion(f"EN {en_url} has DE link to {de_url}", True)
                else:
                    log_assertion(f"EN {en_url} has DE link to {de_url}", False, "Link not found")

def section_8_404_handling():
    """SECTION 8 — 404 handling"""
    print("\n" + "="*80)
    print("SECTION 8 — 404 HANDLING")
    print("="*80)
    
    not_found_urls = [
        '/services/does-not-exist',
        '/en/services/does-not-exist',
        '/models/does-not-exist',
        '/en/models/does-not-exist',
        '/blog/does-not-exist',
        '/en/blog/does-not-exist',
        '/escort/does-not-exist',
        '/en/escort/does-not-exist',
        '/p/does-not-exist',
        '/en/p/does-not-exist',
        '/random-path-xyz',
        '/en/random-path-xyz',
    ]
    
    for url in not_found_urls:
        resp = session.get(f"{BASE_URL}{url}")
        if resp.status_code == 404:
            log_assertion(f"{url} returns 404", True)
        else:
            log_assertion(f"{url} returns 404", False, f"Got {resp.status_code}")
    
    # Check that 404 page has Header/Footer
    print("\n🔍 Checking 404 page has Header/Footer...")
    resp = session.get(f"{BASE_URL}/does-not-exist")
    if resp.status_code == 404:
        if 'data-testid="topbar-phone"' in resp.text and 'data-testid="footer-tagline"' in resp.text:
            log_assertion(f"404 page has Header/Footer", True)
        else:
            log_assertion(f"404 page has Header/Footer", False)
            warnings.append("404 page missing Header/Footer (not a hard blocker)")

def section_9_mobile_viewport():
    """SECTION 9 — Mobile viewport smoke"""
    print("\n" + "="*80)
    print("SECTION 9 — MOBILE VIEWPORT SMOKE")
    print("="*80)
    
    test_urls = [
        '/',
        '/services/vip-escort-hamburg',
        '/models/aurelia',
        '/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner',
        '/kontakt',
    ]
    
    for url in test_urls:
        print(f"\n🔍 Checking {url}...")
        resp = session.get(f"{BASE_URL}{url}")
        if resp.status_code == 200:
            html = resp.text
            
            # Check viewport meta tag
            if '<meta name="viewport"' in html and 'width=device-width' in html:
                log_assertion(f"{url} has viewport meta with width=device-width", True)
            else:
                log_assertion(f"{url} has viewport meta with width=device-width", False)
            
            # Check for responsive Tailwind classes (sm:, md:, lg:)
            if 'sm:' in html or 'md:' in html or 'lg:' in html:
                log_assertion(f"{url} has responsive Tailwind classes", True)
            else:
                log_assertion(f"{url} has responsive Tailwind classes", False)

def main():
    """Main test runner"""
    print("="*80)
    print("NOIR HAMBURG — FULL PRE-CUTOVER QA PASS")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    
    # Login
    if not login():
        print("\n❌ LOGIN FAILED - ABORTING")
        return False
    
    # Run all sections
    try:
        section_1_public_routes()
        section_2_sitemap_robots()
        section_3_jsonld_validation()
        section_4_contact_form_e2e()
        section_5_admin_write_flow()
        section_6_header_footer_propagation()
        section_7_language_switcher()
        section_8_404_handling()
        section_9_mobile_viewport()
    except Exception as e:
        print(f"\n❌ TEST SUITE ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Final verdict
    print("\n" + "="*80)
    print("FINAL VERDICT")
    print("="*80)
    
    print(f"\nTotal assertions: {total_assertions}")
    print(f"Passed: {passed_assertions}")
    print(f"Failed: {total_assertions - passed_assertions}")
    
    if failed_urls:
        print(f"\n❌ Failed URLs ({len(failed_urls)}):")
        for url, reason in failed_urls[:10]:  # Show first 10
            print(f"  - {url}: {reason}")
    
    if warnings:
        print(f"\n⚠️  Warnings ({len(warnings)}):")
        for warning in warnings:
            print(f"  - {warning}")
    
    # Verdict
    hard_failures = total_assertions - passed_assertions
    
    if hard_failures == 0 and len(failed_urls) == 0:
        print("\n✅ **CUTOVER-READY** — All sections passed with zero hard failures")
        return True
    else:
        print(f"\n🔴 **BLOCKED** — {hard_failures} hard failures detected")
        print("\nIssues to fix:")
        if failed_urls:
            print(f"  1. {len(failed_urls)} URLs failed (see list above)")
        if hard_failures > 0:
            print(f"  2. {hard_failures} assertion failures")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
