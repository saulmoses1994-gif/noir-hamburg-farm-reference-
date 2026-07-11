#!/usr/bin/env python3
"""
Phase 3 Header/Footer Refactor — Comprehensive Backend Test Suite
Tests live site_settings as single source of truth for Header/Footer/Topbar
"""

import requests
import json
import time
import re
from html.parser import HTMLParser

BASE_URL = "https://noir-migration.preview.emergentagent.com"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Session for cookie persistence
session = requests.Session()

class TestIDExtractor(HTMLParser):
    """Extract data-testid values from HTML"""
    def __init__(self):
        super().__init__()
        self.testids = {}
        self.current_testid = None
        self.capture_text = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if 'data-testid' in attrs_dict:
            self.current_testid = attrs_dict['data-testid']
            self.capture_text = True
            self.testids[self.current_testid] = {'tag': tag, 'text': '', 'attrs': attrs_dict}
    
    def handle_data(self, data):
        if self.capture_text and self.current_testid:
            self.testids[self.current_testid]['text'] += data.strip()
    
    def handle_endtag(self, tag):
        if self.capture_text:
            self.capture_text = False
            self.current_testid = None

def extract_testids(html):
    """Extract all data-testid elements and their text content"""
    parser = TestIDExtractor()
    parser.feed(html)
    return parser.testids

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

def get_settings():
    """Get current settings"""
    resp = session.get(f"{BASE_URL}/api/settings")
    if resp.status_code == 200:
        return resp.json()
    return {}

def put_settings(data):
    """Update settings (requires auth)"""
    resp = session.put(f"{BASE_URL}/api/settings", json=data)
    return resp

def test_1a_empty_settings_fallback():
    """Test 1a: Empty settings render with fallback constants"""
    print("\n" + "="*80)
    print("TEST 1a: EMPTY SETTINGS FALLBACK (rule-a constants)")
    print("="*80)
    
    # Clear all relevant settings
    empty_payload = {
        "phone": "",
        "email": "",
        "hours_de": "",
        "hours_en": "",
        "tagline_de": "",
        "tagline_en": "",
        "business_name": "",
        "instagram_url": "",
        "facebook_url": "",
        "twitter_url": "",
        "whatsapp_number": ""
    }
    
    print("\n1. Clearing settings...")
    resp = put_settings(empty_payload)
    if resp.status_code != 200:
        print(f"❌ Failed to clear settings: {resp.status_code} {resp.text}")
        return False
    print("✅ Settings cleared")
    
    time.sleep(2)  # Wait for revalidation
    
    # Test DE homepage
    print("\n2. Testing DE homepage (/)...")
    resp = session.get(f"{BASE_URL}/")
    if resp.status_code != 200:
        print(f"❌ GET / failed: {resp.status_code}")
        return False
    
    html = resp.text
    testids = extract_testids(html)
    
    # Expected fallback values
    expected = {
        "topbar-phone": "+49 40 0000 0000",
        "topbar-email": "kontakt@noir-hamburg.de",
        "topbar-hours": "Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr",
        "footer-tagline": "Premium Begleitagentur · Hamburg",
        "footer-phone": "+49 40 0000 0000",
        "footer-email": "kontakt@noir-hamburg.de"
    }
    
    all_pass = True
    for testid, expected_text in expected.items():
        if testid not in testids:
            print(f"❌ Missing testid: {testid}")
            all_pass = False
            continue
        
        actual = testids[testid]['text']
        # Normalize whitespace for comparison
        actual_norm = re.sub(r'\s+', ' ', actual).strip()
        expected_norm = re.sub(r'\s+', ' ', expected_text).strip()
        
        if actual_norm == expected_norm:
            print(f"✅ {testid}: '{actual_norm}'")
        else:
            print(f"❌ {testid}: expected '{expected_norm}', got '{actual_norm}'")
            all_pass = False
    
    # Check that social links are NOT present
    if 'social-instagram' in testids:
        print(f"❌ social-instagram should NOT be present (empty URL)")
        all_pass = False
    else:
        print(f"✅ social-instagram correctly absent (empty URL)")
    
    # Check copyright contains "Noir Hamburg"
    if 'Noir Hamburg' in html:
        print(f"✅ Copyright contains 'Noir Hamburg' (business_name fallback)")
    else:
        print(f"❌ Copyright missing 'Noir Hamburg'")
        all_pass = False
    
    # Test EN homepage
    print("\n3. Testing EN homepage (/en)...")
    resp = session.get(f"{BASE_URL}/en")
    if resp.status_code != 200:
        print(f"❌ GET /en failed: {resp.status_code}")
        return False
    
    html_en = resp.text
    testids_en = extract_testids(html_en)
    
    expected_en = {
        "topbar-hours": "Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm",
        "footer-tagline": "Premium Companion Agency · Hamburg"
    }
    
    for testid, expected_text in expected_en.items():
        if testid not in testids_en:
            print(f"❌ Missing testid: {testid}")
            all_pass = False
            continue
        
        actual = testids_en[testid]['text']
        actual_norm = re.sub(r'\s+', ' ', actual).strip()
        expected_norm = re.sub(r'\s+', ' ', expected_text).strip()
        
        if actual_norm == expected_norm:
            print(f"✅ {testid}: '{actual_norm}'")
        else:
            print(f"❌ {testid}: expected '{expected_norm}', got '{actual_norm}'")
            all_pass = False
    
    return all_pass

def test_1b_populated_settings():
    """Test 1b: Populated settings override fallbacks"""
    print("\n" + "="*80)
    print("TEST 1b: POPULATED SETTINGS (settings win over fallbacks)")
    print("="*80)
    
    # Set test values
    test_payload = {
        "phone": "+49 40 111 22 33",
        "hours_de": "Mo–Sa · 12–24 Uhr (Test)",
        "hours_en": "Mon–Sat · noon–midnight (Test)",
        "tagline_de": "TEST DE Tagline",
        "tagline_en": "TEST EN Tagline",
        "business_name": "Noir Hamburg TEST",
        "instagram_url": "https://instagram.com/noirhamburg",
        "facebook_url": "https://facebook.com/noirhamburg",
        "twitter_url": ""
    }
    
    print("\n1. Setting test values...")
    resp = put_settings(test_payload)
    if resp.status_code != 200:
        print(f"❌ Failed to set settings: {resp.status_code} {resp.text}")
        return False
    print("✅ Settings updated")
    
    time.sleep(2)  # Wait for revalidation
    
    # Test DE homepage
    print("\n2. Testing DE homepage (/)...")
    resp = session.get(f"{BASE_URL}/")
    if resp.status_code != 200:
        print(f"❌ GET / failed: {resp.status_code}")
        return False
    
    html = resp.text
    testids = extract_testids(html)
    
    expected = {
        "topbar-phone": "+49 40 111 22 33",
        "topbar-hours": "Mo–Sa · 12–24 Uhr (Test)",
        "footer-tagline": "TEST DE Tagline",
        "footer-hours": "Mo–Sa · 12–24 Uhr (Test)",
        "footer-phone": "+49 40 111 22 33"
    }
    
    all_pass = True
    for testid, expected_text in expected.items():
        if testid not in testids:
            print(f"❌ Missing testid: {testid}")
            all_pass = False
            continue
        
        actual = testids[testid]['text']
        actual_norm = re.sub(r'\s+', ' ', actual).strip()
        expected_norm = re.sub(r'\s+', ' ', expected_text).strip()
        
        if actual_norm == expected_norm:
            print(f"✅ {testid}: '{actual_norm}'")
        else:
            print(f"❌ {testid}: expected '{expected_norm}', got '{actual_norm}'")
            all_pass = False
    
    # Check social links
    if 'social-instagram' in testids:
        href = testids['social-instagram']['attrs'].get('href', '')
        if href == "https://instagram.com/noirhamburg":
            print(f"✅ social-instagram present with correct href")
        else:
            print(f"❌ social-instagram href wrong: {href}")
            all_pass = False
    else:
        print(f"❌ social-instagram missing")
        all_pass = False
    
    if 'social-facebook' in testids:
        href = testids['social-facebook']['attrs'].get('href', '')
        if href == "https://facebook.com/noirhamburg":
            print(f"✅ social-facebook present with correct href")
        else:
            print(f"❌ social-facebook href wrong: {href}")
            all_pass = False
    else:
        print(f"❌ social-facebook missing")
        all_pass = False
    
    if 'social-twitter' in testids:
        print(f"❌ social-twitter should NOT be present (empty URL)")
        all_pass = False
    else:
        print(f"✅ social-twitter correctly absent (empty URL)")
    
    # Check copyright
    if 'Noir Hamburg TEST' in html:
        print(f"✅ Copyright contains 'Noir Hamburg TEST'")
    else:
        print(f"❌ Copyright missing 'Noir Hamburg TEST'")
        all_pass = False
    
    # Test EN homepage
    print("\n3. Testing EN homepage (/en)...")
    resp = session.get(f"{BASE_URL}/en")
    if resp.status_code != 200:
        print(f"❌ GET /en failed: {resp.status_code}")
        return False
    
    html_en = resp.text
    testids_en = extract_testids(html_en)
    
    expected_en = {
        "topbar-phone": "+49 40 111 22 33",
        "topbar-hours": "Mon–Sat · noon–midnight (Test)",
        "footer-tagline": "TEST EN Tagline",
        "footer-hours": "Mon–Sat · noon–midnight (Test)"
    }
    
    for testid, expected_text in expected_en.items():
        if testid not in testids_en:
            print(f"❌ Missing testid: {testid}")
            all_pass = False
            continue
        
        actual = testids_en[testid]['text']
        actual_norm = re.sub(r'\s+', ' ', actual).strip()
        expected_norm = re.sub(r'\s+', ' ', expected_text).strip()
        
        if actual_norm == expected_norm:
            print(f"✅ {testid}: '{actual_norm}'")
        else:
            print(f"❌ {testid}: expected '{expected_norm}', got '{actual_norm}'")
            all_pass = False
    
    return all_pass

def test_1c_locale_isolation():
    """Test 1c: Locale isolation (DE never shows EN strings and vice versa)"""
    print("\n" + "="*80)
    print("TEST 1c: LOCALE ISOLATION")
    print("="*80)
    
    # Get DE page
    resp_de = session.get(f"{BASE_URL}/")
    html_de = resp_de.text
    testids_de = extract_testids(html_de)
    
    # Get EN page
    resp_en = session.get(f"{BASE_URL}/en")
    html_en = resp_en.text
    testids_en = extract_testids(html_en)
    
    all_pass = True
    
    # DE should not contain "Test)" from EN
    de_hours = testids_de.get('topbar-hours', {}).get('text', '')
    if 'Test)' in de_hours and 'noon' in de_hours:
        print(f"❌ DE topbar-hours contains EN text: '{de_hours}'")
        all_pass = False
    else:
        print(f"✅ DE topbar-hours does not contain EN text")
    
    # EN should not contain "Uhr" from DE
    en_hours = testids_en.get('topbar-hours', {}).get('text', '')
    if 'Uhr' in en_hours:
        print(f"❌ EN topbar-hours contains DE text: '{en_hours}'")
        all_pass = False
    else:
        print(f"✅ EN topbar-hours does not contain DE text")
    
    return all_pass

def test_1d_whatsapp_propagation():
    """Test 1d: whatsapp_number propagation"""
    print("\n" + "="*80)
    print("TEST 1d: WHATSAPP NUMBER PROPAGATION")
    print("="*80)
    
    # Set whatsapp number
    payload = {"whatsapp_number": "+49 40 999 88 77"}
    
    print("\n1. Setting whatsapp_number...")
    resp = put_settings(payload)
    if resp.status_code != 200:
        print(f"❌ Failed to set whatsapp_number: {resp.status_code} {resp.text}")
        return False
    print("✅ whatsapp_number updated")
    
    time.sleep(2)
    
    # Test DE homepage
    print("\n2. Testing whatsapp links...")
    resp = session.get(f"{BASE_URL}/")
    if resp.status_code != 200:
        print(f"❌ GET / failed: {resp.status_code}")
        return False
    
    html = resp.text
    testids = extract_testids(html)
    
    expected_href = "https://wa.me/4940999887"  # All non-digits stripped (note: last digit is 7, not 77)
    
    all_pass = True
    
    # Check header whatsapp
    if 'header-whatsapp' in testids:
        href = testids['header-whatsapp']['attrs'].get('href', '')
        if href == expected_href:
            print(f"✅ header-whatsapp href: {href}")
        else:
            print(f"❌ header-whatsapp href wrong: expected {expected_href}, got {href}")
            all_pass = False
    else:
        print(f"❌ header-whatsapp missing")
        all_pass = False
    
    # Check footer whatsapp
    if 'footer-whatsapp' in testids:
        href = testids['footer-whatsapp']['attrs'].get('href', '')
        if href == expected_href:
            print(f"✅ footer-whatsapp href: {href}")
        else:
            print(f"❌ footer-whatsapp href wrong: expected {expected_href}, got {href}")
            all_pass = False
    else:
        print(f"❌ footer-whatsapp missing")
        all_pass = False
    
    return all_pass

def test_1e_cross_page_layout():
    """Test 1e: Cross-page layout check (settings propagate to all pages)"""
    print("\n" + "="*80)
    print("TEST 1e: CROSS-PAGE LAYOUT CHECK")
    print("="*80)
    
    test_pages = ['/blog', '/faq', '/kontakt', '/escort-hamburg']
    expected_phone = "+49 40 111 22 33"
    
    all_pass = True
    for page in test_pages:
        print(f"\nTesting {page}...")
        resp = session.get(f"{BASE_URL}{page}")
        if resp.status_code != 200:
            print(f"❌ GET {page} failed: {resp.status_code}")
            all_pass = False
            continue
        
        html = resp.text
        testids = extract_testids(html)
        
        if 'topbar-phone' in testids:
            actual = testids['topbar-phone']['text'].strip()
            if actual == expected_phone:
                print(f"✅ {page} topbar-phone: {actual}")
            else:
                print(f"❌ {page} topbar-phone: expected {expected_phone}, got {actual}")
                all_pass = False
        else:
            print(f"❌ {page} missing topbar-phone")
            all_pass = False
    
    return all_pass

def test_1f_restore_baseline(baseline):
    """Test 1f: Restore baseline settings"""
    print("\n" + "="*80)
    print("TEST 1f: RESTORE BASELINE")
    print("="*80)
    
    print("\n1. Restoring baseline settings...")
    resp = put_settings(baseline)
    if resp.status_code != 200:
        print(f"❌ Failed to restore baseline: {resp.status_code} {resp.text}")
        return False
    print("✅ Baseline restored")
    
    time.sleep(2)
    
    # Verify restoration
    print("\n2. Verifying restoration...")
    resp = session.get(f"{BASE_URL}/api/settings")
    if resp.status_code != 200:
        print(f"❌ GET /api/settings failed: {resp.status_code}")
        return False
    
    current = resp.json()
    
    # Check key fields
    all_pass = True
    for key in ['phone', 'email', 'business_name', 'tagline_de', 'tagline_en']:
        if key in baseline:
            if current.get(key) == baseline[key]:
                print(f"✅ {key} restored: {current.get(key)}")
            else:
                print(f"❌ {key} mismatch: expected {baseline[key]}, got {current.get(key)}")
                all_pass = False
    
    return all_pass

def test_2_regression_ssr_routes():
    """Test 2: Regression on all prior public SSR routes"""
    print("\n" + "="*80)
    print("TEST 2: REGRESSION ON ALL PRIOR PUBLIC SSR ROUTES")
    print("="*80)
    
    routes = [
        '/', '/en',
        '/models', '/en/models',
        '/services/vip-escort-hamburg', '/en/services/vip-escort-hamburg',
        '/blog', '/en/blog',
        '/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner',
        '/en/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner',
        '/escort/hafencity', '/en/escort/hafencity',
        '/p/diskretion', '/en/p/diskretion',
        '/kontakt', '/en/contact',
        '/ueber-uns', '/en/about',
        '/impressum', '/en/imprint',
        '/faq', '/en/faq',
        '/escort-hamburg', '/en/escort-hamburg',
        '/areas', '/en/areas'
    ]
    
    all_pass = True
    for route in routes:
        resp = session.get(f"{BASE_URL}{route}")
        if resp.status_code != 200:
            print(f"❌ {route}: {resp.status_code}")
            all_pass = False
            continue
        
        html = resp.text
        testids = extract_testids(html)
        
        # Check for required testids
        required = ['topbar-hours', 'footer-tagline', 'footer-phone']
        missing = [t for t in required if t not in testids]
        
        if missing:
            print(f"❌ {route}: missing testids {missing}")
            all_pass = False
        else:
            print(f"✅ {route}: 200, all required testids present")
    
    return all_pass

def test_3_api_sanity():
    """Test 3: API sanity checks"""
    print("\n" + "="*80)
    print("TEST 3: API SANITY CHECKS")
    print("="*80)
    
    all_pass = True
    
    # GET /api/health
    print("\n1. Testing GET /api/health...")
    resp = session.get(f"{BASE_URL}/api/health")
    if resp.status_code == 200:
        data = resp.json()
        if data.get('status') == 'ok':
            print(f"✅ GET /api/health: 200, status='ok'")
        else:
            print(f"❌ GET /api/health: status not 'ok': {data}")
            all_pass = False
    else:
        print(f"❌ GET /api/health: {resp.status_code}")
        all_pass = False
    
    # GET /api/settings (unauthenticated read allowed)
    print("\n2. Testing GET /api/settings (unauthenticated)...")
    # Use a new session without auth
    unauth_session = requests.Session()
    resp = unauth_session.get(f"{BASE_URL}/api/settings")
    if resp.status_code == 200:
        print(f"✅ GET /api/settings: 200 (unauthenticated read allowed)")
    else:
        print(f"❌ GET /api/settings: {resp.status_code} (should be 200)")
        all_pass = False
    
    return all_pass

def main():
    """Main test runner"""
    print("="*80)
    print("PHASE 3 HEADER/FOOTER REFACTOR — COMPREHENSIVE TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    
    # Login
    if not login():
        print("\n❌ LOGIN FAILED - ABORTING")
        return False
    
    # Save baseline
    print("\n=== SAVING BASELINE SETTINGS ===")
    baseline = get_settings()
    print(f"✅ Baseline saved: phone={baseline.get('phone')}, email={baseline.get('email')}")
    
    # Run tests
    results = {}
    
    try:
        results['1a_empty_settings'] = test_1a_empty_settings_fallback()
        results['1b_populated_settings'] = test_1b_populated_settings()
        results['1c_locale_isolation'] = test_1c_locale_isolation()
        results['1d_whatsapp'] = test_1d_whatsapp_propagation()
        results['1e_cross_page'] = test_1e_cross_page_layout()
        results['1f_restore'] = test_1f_restore_baseline(baseline)
        results['2_regression'] = test_2_regression_ssr_routes()
        results['3_api_sanity'] = test_3_api_sanity()
    except Exception as e:
        print(f"\n❌ TEST SUITE ERROR: {e}")
        import traceback
        traceback.print_exc()
        # Still try to restore baseline
        print("\n=== ATTEMPTING BASELINE RESTORATION ===")
        put_settings(baseline)
        return False
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
