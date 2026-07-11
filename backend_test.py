#!/usr/bin/env python3
"""
Phase 3 d5 Backend Test Suite
Tests static pages (kontakt, ueber-uns, impressum) + EN twins + POST /api/contact
"""
import requests
import json
import re
from html.parser import HTMLParser
from typing import Dict, List, Tuple

BASE_URL = "https://noir-migration.preview.emergentagent.com"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

class HTMLMetaExtractor(HTMLParser):
    """Extract metadata from HTML"""
    def __init__(self):
        super().__init__()
        self.lang = None
        self.title = None
        self.title_count = 0
        self.canonical = None
        self.canonical_count = 0
        self.hreflang_alternates = []
        self.meta_description = None
        self.json_ld_blocks = []
        self.in_body = False
        self.in_script = False
        self.current_script_type = None
        self.script_content = ""
        self.visible_text = []
        self.in_title = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'html':
            self.lang = attrs_dict.get('lang')
        
        elif tag == 'title':
            self.in_title = True
            self.title_count += 1
        
        elif tag == 'link':
            rel = attrs_dict.get('rel')
            if rel == 'canonical':
                self.canonical = attrs_dict.get('href')
                self.canonical_count += 1
            elif rel == 'alternate':
                hreflang = attrs_dict.get('hreflang') or attrs_dict.get('hrefLang')
                href = attrs_dict.get('href')
                if hreflang and href:
                    self.hreflang_alternates.append({'hreflang': hreflang, 'href': href})
        
        elif tag == 'meta':
            name = attrs_dict.get('name')
            if name == 'description':
                self.meta_description = attrs_dict.get('content')
        
        elif tag == 'body':
            self.in_body = True
        
        elif tag == 'script' and self.in_body:
            script_type = attrs_dict.get('type')
            if script_type == 'application/ld+json':
                self.in_script = True
                self.current_script_type = script_type
                self.script_content = ""
    
    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'script' and self.in_script:
            if self.current_script_type == 'application/ld+json':
                self.json_ld_blocks.append(self.script_content.strip())
            self.in_script = False
            self.current_script_type = None
            self.script_content = ""
    
    def handle_data(self, data):
        if self.in_title and not self.title:
            self.title = data.strip()
        elif self.in_script:
            self.script_content += data
        elif self.in_body and not self.in_script:
            # Collect visible text for leak detection
            text = data.strip()
            if text:
                self.visible_text.append(text)

def extract_html_metadata(html: str) -> Dict:
    """Extract metadata from HTML string"""
    parser = HTMLMetaExtractor()
    parser.feed(html)
    
    # Parse JSON-LD blocks
    json_ld_parsed = []
    for block in parser.json_ld_blocks:
        try:
            parsed = json.loads(block)
            json_ld_parsed.append(parsed)
        except json.JSONDecodeError as e:
            json_ld_parsed.append({'error': str(e), 'raw': block[:100]})
    
    return {
        'lang': parser.lang,
        'title': parser.title,
        'title_count': parser.title_count,
        'canonical': parser.canonical,
        'canonical_count': parser.canonical_count,
        'hreflang_alternates': parser.hreflang_alternates,
        'meta_description': parser.meta_description,
        'json_ld_blocks': json_ld_parsed,
        'json_ld_count': len(parser.json_ld_blocks),
        'visible_text': ' '.join(parser.visible_text)
    }

def get_admin_cookie() -> str:
    """Login as admin and return cookie"""
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=10
    )
    if resp.status_code != 200:
        raise Exception(f"Admin login failed: {resp.status_code} {resp.text}")
    
    cookie = resp.cookies.get('access_token')
    if not cookie:
        raise Exception("No access_token cookie in login response")
    return cookie

def check_ssr_page(url: str, expected_lang: str, expected_title_contains: str, 
                   expected_canonical_ends: str, expected_json_ld_types: List[str]) -> Dict:
    """Check SSR page for all required metadata"""
    print(f"\n  Testing {url}...")
    resp = requests.get(url, timeout=10)
    
    result = {
        'url': url,
        'status': resp.status_code,
        'errors': []
    }
    
    if resp.status_code != 200:
        result['errors'].append(f"Expected 200, got {resp.status_code}")
        return result
    
    meta = extract_html_metadata(resp.text)
    
    # Check html lang
    if meta['lang'] != expected_lang:
        result['errors'].append(f"html lang: expected '{expected_lang}', got '{meta['lang']}'")
    
    # Check title
    if meta['title_count'] != 1:
        result['errors'].append(f"Expected exactly 1 <title>, found {meta['title_count']}")
    if not meta['title'] or expected_title_contains not in meta['title']:
        result['errors'].append(f"Title '{meta['title']}' does not contain '{expected_title_contains}'")
    
    # Check canonical
    if meta['canonical_count'] != 1:
        result['errors'].append(f"Expected exactly 1 canonical, found {meta['canonical_count']}")
    if not meta['canonical'] or not meta['canonical'].endswith(expected_canonical_ends):
        result['errors'].append(f"Canonical '{meta['canonical']}' does not end with '{expected_canonical_ends}'")
    
    # Check hreflang alternates (should have de-DE, en, x-default)
    hreflang_values = [alt['hreflang'] for alt in meta['hreflang_alternates']]
    required_hreflangs = ['de-DE', 'en', 'x-default']
    for req in required_hreflangs:
        if req not in hreflang_values:
            result['errors'].append(f"Missing hreflang alternate: {req}")
    
    # Check JSON-LD blocks (should be exactly 2 in body)
    if meta['json_ld_count'] != 2:
        result['errors'].append(f"Expected exactly 2 JSON-LD blocks in body, found {meta['json_ld_count']}")
    
    # Check JSON-LD types
    found_types = []
    for block in meta['json_ld_blocks']:
        if isinstance(block, dict) and '@type' in block:
            found_types.append(block['@type'])
    
    for expected_type in expected_json_ld_types:
        if expected_type not in found_types:
            result['errors'].append(f"Missing JSON-LD type: {expected_type}")
    
    result['meta'] = meta
    return result

def check_en_leak(url: str) -> Dict:
    """Check EN page for German UI string leaks"""
    print(f"\n  Checking EN leak for {url}...")
    resp = requests.get(url, timeout=10)
    
    result = {
        'url': url,
        'status': resp.status_code,
        'leaks': []
    }
    
    if resp.status_code != 200:
        result['leaks'].append(f"Page returned {resp.status_code}")
        return result
    
    # Remove all script tags
    html = re.sub(r'<script[^>]*>.*?</script>', '', resp.text, flags=re.DOTALL | re.IGNORECASE)
    # Remove all tags
    text = re.sub(r'<[^>]+>', ' ', html)
    
    # Check for German UI strings (excluding allowed ones)
    forbidden_strings = [
        'Startseite',
        'Über uns',
        'Häufige',
        r'\bTermin\b',  # as standalone word
        'Kategorien',
        'Jetzt anfragen',
        'Anfrage senden',
        'Wunschtermin',
        'Ihre Nachricht',
        'Bitte wählen',
        'Diskretionserklärung',
        'Sorgfältige'
    ]
    
    for forbidden in forbidden_strings:
        if re.search(forbidden, text):
            result['leaks'].append(f"Found forbidden string: {forbidden}")
    
    return result

def test_contact_api():
    """Test POST /api/contact endpoint"""
    print("\n=== TEST 3: POST /api/contact functional tests ===")
    
    # Get baseline count
    admin_cookie = get_admin_cookie()
    resp = requests.get(f"{BASE_URL}/api/contacts", cookies={'access_token': admin_cookie}, timeout=10)
    baseline_count = len(resp.json()) if resp.status_code == 200 else 0
    print(f"  Baseline contact count: {baseline_count}")
    
    # 3a) Valid submission
    print("\n  3a) Valid submission...")
    valid_payload = {
        "name": "Auto Test",
        "email": "auto@example.com",
        "phone": "+49 40 999999",
        "service": "dinner-companion-hamburg",
        "message": "This is an automated smoke test message that is comfortably longer than twenty characters.",
        "date": "Saturday 8pm",
        "consent": True,
        "lang": "en"
    }
    resp = requests.post(f"{BASE_URL}/api/contact", json=valid_payload, timeout=10)
    print(f"    Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"    ❌ Expected 200, got {resp.status_code}: {resp.text}")
        return False
    
    data = resp.json()
    if not data.get('ok'):
        print(f"    ❌ Expected ok:true, got {data}")
        return False
    if 'id' not in data:
        print(f"    ❌ Expected id field in response, got {data}")
        return False
    
    print(f"    ✅ Valid submission accepted, id: {data['id']}")
    
    # Check DB count increased
    resp = requests.get(f"{BASE_URL}/api/contacts", cookies={'access_token': admin_cookie}, timeout=10)
    new_count = len(resp.json()) if resp.status_code == 200 else 0
    if new_count != baseline_count + 1:
        print(f"    ❌ Expected count {baseline_count + 1}, got {new_count}")
        return False
    print(f"    ✅ DB count increased to {new_count}")
    
    # Check the new doc has correct fields
    contacts = resp.json()
    new_contact = next((c for c in contacts if c['email'] == 'auto@example.com'), None)
    if not new_contact:
        print(f"    ❌ Could not find new contact with email auto@example.com")
        return False
    
    required_fields = {
        'read': False,
        'archived': False,
        'starred': False,
        'status': 'new',
        'source_lang': 'en',
        'service': 'dinner-companion-hamburg'
    }
    for field, expected_value in required_fields.items():
        if new_contact.get(field) != expected_value:
            print(f"    ❌ Field {field}: expected {expected_value}, got {new_contact.get(field)}")
            return False
    
    if 'created_at' not in new_contact:
        print(f"    ❌ Missing created_at field")
        return False
    
    # Check id is UUID v4 shape
    if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', new_contact['id']):
        print(f"    ❌ id is not UUID v4 shape: {new_contact['id']}")
        return False
    
    print(f"    ✅ New contact has all required fields")
    
    # 3b) Admin unread badge increments
    print("\n  3b) Admin unread badge increments...")
    resp = requests.get(f"{BASE_URL}/api/contacts/stats", cookies={'access_token': admin_cookie}, timeout=10)
    if resp.status_code != 200:
        print(f"    ❌ Stats endpoint returned {resp.status_code}")
        return False
    
    stats = resp.json()
    if stats.get('unread', 0) < baseline_count + 1:
        print(f"    ❌ Expected unread >= {baseline_count + 1}, got {stats.get('unread')}")
        return False
    print(f"    ✅ Unread count: {stats.get('unread')}")
    
    # 3c) Validation errors
    print("\n  3c) Validation errors...")
    invalid_payload = {
        "name": "",
        "email": "not-an-email",
        "message": "too short",
        "consent": False
    }
    resp = requests.post(f"{BASE_URL}/api/contact", json=invalid_payload, timeout=10)
    if resp.status_code != 400:
        print(f"    ❌ Expected 400, got {resp.status_code}")
        return False
    
    data = resp.json()
    if data.get('detail') != 'Validation failed':
        print(f"    ❌ Expected 'Validation failed', got {data.get('detail')}")
        return False
    
    errors = data.get('errors', {})
    expected_errors = {
        'name': 'required',
        'email': 'invalid',
        'message': 'too_short',
        'consent': 'required'
    }
    for field, expected_code in expected_errors.items():
        if errors.get(field) != expected_code:
            print(f"    ❌ Field {field}: expected error '{expected_code}', got '{errors.get(field)}'")
            return False
    
    print(f"    ✅ Validation errors correct")
    
    # Check DB count unchanged
    resp = requests.get(f"{BASE_URL}/api/contacts", cookies={'access_token': admin_cookie}, timeout=10)
    if resp.status_code != 200:
        print(f"    ❌ Contacts endpoint returned {resp.status_code} after invalid submission")
        print(f"    Response: {resp.text[:200]}")
        return False
    count_after_invalid = len(resp.json())
    if count_after_invalid != baseline_count + 1:
        print(f"    ❌ DB count changed after invalid submission: expected {baseline_count + 1}, got {count_after_invalid}")
        return False
    print(f"    ✅ DB count unchanged: {count_after_invalid}")
    
    # 3d) Honeypot silently discarded
    print("\n  3d) Honeypot silently discarded...")
    honeypot_payload = {
        "name": "Bot",
        "email": "bot@example.com",
        "message": "a message that is long enough to pass validation.",
        "consent": True,
        "website": "http://spam.example.com"
    }
    resp = requests.post(f"{BASE_URL}/api/contact", json=honeypot_payload, timeout=10)
    if resp.status_code != 200:
        print(f"    ❌ Expected 200, got {resp.status_code}")
        return False
    
    data = resp.json()
    if not data.get('ok'):
        print(f"    ❌ Expected ok:true, got {data}")
        return False
    if 'id' in data:
        print(f"    ❌ Honeypot submission should not return id field")
        return False
    
    print(f"    ✅ Honeypot returned 200 without id")
    
    # Check DB count unchanged
    resp = requests.get(f"{BASE_URL}/api/contacts", cookies={'access_token': admin_cookie}, timeout=10)
    count_after_honeypot = len(resp.json()) if resp.status_code == 200 else 0
    if count_after_honeypot != baseline_count + 1:
        print(f"    ❌ DB count changed after honeypot: {count_after_honeypot}")
        return False
    
    # Verify no doc with bot@example.com exists
    contacts = resp.json()
    bot_contact = next((c for c in contacts if c['email'] == 'bot@example.com'), None)
    if bot_contact:
        print(f"    ❌ Found honeypot contact in DB")
        return False
    
    print(f"    ✅ DB count unchanged, no bot contact found")
    
    # 3e) Missing consent
    print("\n  3e) Missing consent...")
    no_consent_payload = {
        "name": "X",
        "email": "x@example.com",
        "message": "a message long enough to pass min-length validation."
    }
    resp = requests.post(f"{BASE_URL}/api/contact", json=no_consent_payload, timeout=10)
    if resp.status_code != 400:
        print(f"    ❌ Expected 400, got {resp.status_code}")
        return False
    
    data = resp.json()
    if data.get('errors', {}).get('consent') != 'required':
        print(f"    ❌ Expected consent error 'required', got {data.get('errors', {}).get('consent')}")
        return False
    
    print(f"    ✅ Missing consent rejected")
    
    # 3f) Existing leads still shown in admin
    print("\n  3f) Existing leads still shown in admin...")
    resp = requests.get(f"{BASE_URL}/api/contacts", cookies={'access_token': admin_cookie}, timeout=10)
    if resp.status_code != 200:
        print(f"    ❌ Contacts endpoint returned {resp.status_code}")
        return False
    
    contacts = resp.json()
    if len(contacts) < baseline_count + 1:
        print(f"    ❌ Expected at least {baseline_count + 1} contacts, got {len(contacts)}")
        return False
    
    # Verify we can access legacy contacts (spot-check one)
    test_contact = next((c for c in contacts if c['email'] == 'test@example.com'), None)
    if test_contact:
        # Verify it has the expected structure
        if not test_contact.get('id') or not test_contact.get('name') or not test_contact.get('email'):
            print(f"    ❌ Legacy contact missing required fields")
            return False
        print(f"    ✅ Legacy contacts accessible (spot-checked test@example.com)")
    
    print(f"    ✅ All {len(contacts)} contacts returned")
    
    return True

def main():
    print("=" * 80)
    print("Phase 3 d5 Backend Test Suite")
    print("=" * 80)
    
    # TEST 1: SSR smoke test for all 6 pages
    print("\n=== TEST 1: SSR smoke test (all 6 pages, curl-based) ===")
    
    test_cases = [
        {
            'url': f"{BASE_URL}/kontakt",
            'lang': 'de',
            'title_contains': 'Kontakt — Diskrete Buchung',
            'canonical_ends': '/kontakt',
            'json_ld_types': ['ContactPage', 'BreadcrumbList']
        },
        {
            'url': f"{BASE_URL}/en/contact",
            'lang': 'en',
            'title_contains': 'Contact — Discreet Booking',
            'canonical_ends': '/en/contact',
            'json_ld_types': ['ContactPage', 'BreadcrumbList']
        },
        {
            'url': f"{BASE_URL}/ueber-uns",
            'lang': 'de',
            'title_contains': 'Über uns — Die Philosophie',
            'canonical_ends': '/ueber-uns',
            'json_ld_types': ['AboutPage', 'BreadcrumbList']
        },
        {
            'url': f"{BASE_URL}/en/about",
            'lang': 'en',
            'title_contains': 'About — The philosophy',
            'canonical_ends': '/en/about',
            'json_ld_types': ['AboutPage', 'BreadcrumbList']
        },
        {
            'url': f"{BASE_URL}/impressum",
            'lang': 'de',
            'title_contains': 'Impressum | Noir Hamburg',
            'canonical_ends': '/impressum',
            'json_ld_types': ['WebPage', 'BreadcrumbList']
        },
        {
            'url': f"{BASE_URL}/en/imprint",
            'lang': 'en',
            'title_contains': 'Imprint | Noir Hamburg',
            'canonical_ends': '/en/imprint',
            'json_ld_types': ['WebPage', 'BreadcrumbList']
        }
    ]
    
    all_passed = True
    for tc in test_cases:
        result = check_ssr_page(
            tc['url'],
            tc['lang'],
            tc['title_contains'],
            tc['canonical_ends'],
            tc['json_ld_types']
        )
        
        if result['errors']:
            print(f"    ❌ FAILED:")
            for error in result['errors']:
                print(f"       - {error}")
            all_passed = False
        else:
            print(f"    ✅ PASSED")
    
    if not all_passed:
        print("\n❌ TEST 1 FAILED")
        return False
    
    print("\n✅ TEST 1 PASSED - All 6 pages have correct SSR metadata")
    
    # TEST 2: EN 0-leak scan
    print("\n=== TEST 2: EN 0-leak scan (regression on i18n hygiene) ===")
    
    en_pages = [
        f"{BASE_URL}/en/contact",
        f"{BASE_URL}/en/about",
        f"{BASE_URL}/en/imprint"
    ]
    
    all_clean = True
    for url in en_pages:
        result = check_en_leak(url)
        if result['leaks']:
            print(f"    ❌ FAILED:")
            for leak in result['leaks']:
                print(f"       - {leak}")
            all_clean = False
        else:
            print(f"    ✅ PASSED")
    
    if not all_clean:
        print("\n❌ TEST 2 FAILED")
        return False
    
    print("\n✅ TEST 2 PASSED - No German UI string leaks on EN pages")
    
    # TEST 3: POST /api/contact functional tests
    if not test_contact_api():
        print("\n❌ TEST 3 FAILED")
        return False
    
    print("\n✅ TEST 3 PASSED - POST /api/contact working correctly")
    
    # TEST 4: Sitemap coverage regression
    print("\n=== TEST 4: Sitemap coverage regression ===")
    resp = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
    if resp.status_code != 200:
        print(f"  ❌ Sitemap returned {resp.status_code}")
        return False
    
    sitemap_text = resp.text
    all_found = True
    
    # Check that DE pages are in <loc> entries
    de_entries = ['/kontakt', '/ueber-uns', '/impressum']
    for entry in de_entries:
        if f'<loc>{BASE_URL}{entry}</loc>' not in sitemap_text:
            print(f"  ❌ Missing sitemap <loc> entry: {entry}")
            all_found = False
        else:
            print(f"  ✅ Found <loc>: {entry}")
    
    # Check that EN pages are referenced as hreflang alternates
    en_entries = [
        ('/en/contact', 'kontakt'),
        ('/en/about', 'ueber-uns'),
        ('/en/imprint', 'impressum')
    ]
    for en_path, de_path in en_entries:
        # Check if EN path is referenced as hreflang alternate
        if f'href="{BASE_URL}{en_path}"' in sitemap_text:
            print(f"  ✅ Found hreflang alternate: {en_path}")
        else:
            print(f"  ❌ Missing hreflang alternate: {en_path}")
            all_found = False
    
    if not all_found:
        print("\n❌ TEST 4 FAILED")
        return False
    
    print("\n✅ TEST 4 PASSED - All static pages in sitemap")
    
    # TEST 5: Regression on prior work
    print("\n=== TEST 5: Regression on prior work ===")
    
    regression_tests = [
        (f"{BASE_URL}/api/health", 200),
        (f"{BASE_URL}/services/vip-escort-hamburg", 200),
        (f"{BASE_URL}/models", 200),
        (f"{BASE_URL}/blog", 200),
        (f"{BASE_URL}/escort/hafencity", 200),
        (f"{BASE_URL}/p/diskretion", 200)
    ]
    
    all_working = True
    for url, expected_status in regression_tests:
        resp = requests.get(url, timeout=10)
        if resp.status_code != expected_status:
            print(f"  ❌ {url} returned {resp.status_code}, expected {expected_status}")
            all_working = False
        else:
            print(f"  ✅ {url} → {resp.status_code}")
    
    if not all_working:
        print("\n❌ TEST 5 FAILED")
        return False
    
    print("\n✅ TEST 5 PASSED - All prior work still functional")
    
    print("\n" + "=" * 80)
    print("✅ ALL TESTS PASSED")
    print("=" * 80)
    return True

if __name__ == '__main__':
    try:
        success = main()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ TEST SUITE FAILED WITH EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
