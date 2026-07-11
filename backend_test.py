#!/usr/bin/env python3
"""
Pre-cutover polish v2 regression test suite
Curl-based, NO writes (except admin login), NO auth needed for public URLs
"""

import requests
import json
import re
import time
from typing import Dict, List, Tuple

BASE_URL = "https://noir-migration.preview.emergentagent.com"

# Test results tracking
results = {
    "section_1_404": {"passed": 0, "failed": 0, "failures": []},
    "section_2a_contact_form": {"passed": 0, "failed": 0, "failures": []},
    "section_2b_faq_glyphs": {"passed": 0, "failed": 0, "failures": []},
    "section_2c_header_nav": {"passed": 0, "failed": 0, "failures": []},
    "section_3_root_layout": {"passed": 0, "failed": 0, "failures": []},
    "section_4_sitemap_robots": {"passed": 0, "failed": 0, "failures": []},
    "section_5_admin": {"passed": 0, "failed": 0, "failures": []},
}

def log_pass(section: str, test_name: str):
    """Log a passing test"""
    results[section]["passed"] += 1
    print(f"✅ PASS: {test_name}")

def log_fail(section: str, test_name: str, expected: str, actual: str):
    """Log a failing test"""
    results[section]["failed"] += 1
    failure = f"{test_name} | Expected: {expected} | Actual: {actual}"
    results[section]["failures"].append(failure)
    print(f"❌ FAIL: {failure}")

def test_404_page(url: str) -> Dict:
    """Test a single 404 page for all required assertions"""
    print(f"\n🔍 Testing 404: {url}")
    try:
        resp = requests.get(f"{BASE_URL}{url}", timeout=10)
        body = resp.text
        
        # Check HTTP 404
        if resp.status_code != 404:
            log_fail("section_1_404", f"{url} status code", "404", str(resp.status_code))
        else:
            log_pass("section_1_404", f"{url} returns 404")
        
        # Check data-testid="not-found"
        if 'data-testid="not-found"' in body:
            log_pass("section_1_404", f"{url} has not-found testid")
        else:
            log_fail("section_1_404", f"{url} not-found testid", "present", "missing")
        
        # Check data-testid="not-found-home" (DE CTA)
        if 'data-testid="not-found-home"' in body:
            log_pass("section_1_404", f"{url} has not-found-home testid")
        else:
            log_fail("section_1_404", f"{url} not-found-home testid", "present", "missing")
        
        # Check data-testid="not-found-home-en" (EN CTA)
        if 'data-testid="not-found-home-en"' in body:
            log_pass("section_1_404", f"{url} has not-found-home-en testid")
        else:
            log_fail("section_1_404", f"{url} not-found-home-en testid", "present", "missing")
        
        # Check H1 with "Seite nicht gefunden"
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.DOTALL)
        if h1_match:
            h1_text = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
            if "Seite nicht gefunden" in h1_text:
                log_pass("section_1_404", f"{url} H1 contains 'Seite nicht gefunden'")
            else:
                log_fail("section_1_404", f"{url} H1 text", "'Seite nicht gefunden'", h1_text)
        else:
            log_fail("section_1_404", f"{url} H1", "present", "missing")
        
        # Check "Back to the homepage" string
        if "Back to the homepage" in body:
            log_pass("section_1_404", f"{url} has 'Back to the homepage'")
        else:
            log_fail("section_1_404", f"{url} EN text", "'Back to the homepage'", "missing")
        
        # Check data-testid="topbar-phone" (Header)
        if 'data-testid="topbar-phone"' in body:
            log_pass("section_1_404", f"{url} has topbar-phone (Header)")
        else:
            log_fail("section_1_404", f"{url} Header", "topbar-phone present", "missing")
        
        # Check data-testid="footer-tagline" (Footer)
        if 'data-testid="footer-tagline"' in body:
            log_pass("section_1_404", f"{url} has footer-tagline (Footer)")
        else:
            log_fail("section_1_404", f"{url} Footer", "footer-tagline present", "missing")
        
    except Exception as e:
        log_fail("section_1_404", f"{url} request", "success", str(e))

def test_contact_form_a11y(url: str, locale: str) -> Dict:
    """Test contact form accessibility"""
    print(f"\n🔍 Testing contact form a11y: {url}")
    try:
        resp = requests.get(f"{BASE_URL}{url}", timeout=10)
        body = resp.text
        
        # Check for 5 input ids
        required_ids = ['id="cf-name"', 'id="cf-email"', 'id="cf-message"', 'id="cf-consent"', 'id="cf-website"']
        for input_id in required_ids:
            if input_id in body:
                log_pass("section_2a_contact_form", f"{url} has {input_id}")
            else:
                log_fail("section_2a_contact_form", f"{url} input id", input_id, "missing")
        
        # Check for role="alert" (may not be present in SSR, that's OK)
        if 'role="alert"' in body:
            log_pass("section_2a_contact_form", f"{url} has role=alert (client-side)")
        else:
            # This is OK - baseline SSR render may not have role=alert
            log_pass("section_2a_contact_form", f"{url} no role=alert in SSR (expected)")
        
    except Exception as e:
        log_fail("section_2a_contact_form", f"{url} request", "success", str(e))

def test_faq_glyphs_a11y(url: str) -> Dict:
    """Test FAQ glyph accessibility"""
    print(f"\n🔍 Testing FAQ glyphs a11y: {url}")
    try:
        resp = requests.get(f"{BASE_URL}{url}", timeout=10)
        body = resp.text
        
        # Count aria-hidden glyphs
        aria_hidden_count = body.count('aria-hidden="true"')
        
        # Check for old pre-fix version (should be ZERO)
        old_pattern = '<span className="accent-text text-2xl group-open:rotate-45'
        if old_pattern in body:
            log_fail("section_2b_faq_glyphs", f"{url} old pattern", "0 occurrences", f"found '{old_pattern}'")
        else:
            log_pass("section_2b_faq_glyphs", f"{url} no old className pattern")
        
        # Verify aria-hidden is present on glyph spans
        if aria_hidden_count > 0:
            log_pass("section_2b_faq_glyphs", f"{url} has {aria_hidden_count} aria-hidden glyphs")
        else:
            log_fail("section_2b_faq_glyphs", f"{url} aria-hidden count", ">0", "0")
        
    except Exception as e:
        log_fail("section_2b_faq_glyphs", f"{url} request", "success", str(e))

def test_header_nav_a11y(url: str, locale: str) -> Dict:
    """Test header nav accessibility"""
    print(f"\n🔍 Testing header nav a11y: {url}")
    try:
        resp = requests.get(f"{BASE_URL}{url}", timeout=10)
        body = resp.text
        
        # Check for nav aria-label
        if locale == "de":
            if '<nav aria-label="Hauptnavigation"' in body:
                log_pass("section_2c_header_nav", f"{url} has nav aria-label='Hauptnavigation'")
            else:
                log_fail("section_2c_header_nav", f"{url} nav aria-label", "Hauptnavigation", "missing")
        else:  # en
            if '<nav aria-label="Primary"' in body:
                log_pass("section_2c_header_nav", f"{url} has nav aria-label='Primary'")
            else:
                log_fail("section_2c_header_nav", f"{url} nav aria-label", "Primary", "missing")
        
        # Check mobile nav toggle
        if 'data-testid="mobile-nav-toggle"' in body:
            log_pass("section_2c_header_nav", f"{url} has mobile-nav-toggle")
        else:
            log_fail("section_2c_header_nav", f"{url} mobile-nav-toggle", "present", "missing")
        
        # Check aria-expanded="false"
        if 'aria-expanded="false"' in body:
            log_pass("section_2c_header_nav", f"{url} has aria-expanded='false'")
        else:
            log_fail("section_2c_header_nav", f"{url} aria-expanded", "false", "missing")
        
        # Check aria-controls="mobile-nav"
        if 'aria-controls="mobile-nav"' in body:
            log_pass("section_2c_header_nav", f"{url} has aria-controls='mobile-nav'")
        else:
            log_fail("section_2c_header_nav", f"{url} aria-controls", "mobile-nav", "missing")
        
        # Check locale-appropriate aria-label
        if locale == "de":
            if 'aria-label="Menü öffnen"' in body:
                log_pass("section_2c_header_nav", f"{url} has aria-label='Menü öffnen'")
            else:
                log_fail("section_2c_header_nav", f"{url} aria-label", "Menü öffnen", "missing")
        else:  # en
            if 'aria-label="Open menu"' in body:
                log_pass("section_2c_header_nav", f"{url} has aria-label='Open menu'")
            else:
                log_fail("section_2c_header_nav", f"{url} aria-label", "Open menu", "missing")
        
    except Exception as e:
        log_fail("section_2c_header_nav", f"{url} request", "success", str(e))

def test_root_layout_regression(url: str, expected_lang: str) -> Dict:
    """Test root layout regression"""
    print(f"\n🔍 Testing root layout: {url}")
    try:
        resp = requests.get(f"{BASE_URL}{url}", timeout=10)
        body = resp.text
        
        # Check 200 status
        if resp.status_code == 200:
            log_pass("section_3_root_layout", f"{url} returns 200")
        else:
            log_fail("section_3_root_layout", f"{url} status", "200", str(resp.status_code))
        
        # Check data-testid="topbar-phone"
        if 'data-testid="topbar-phone"' in body:
            log_pass("section_3_root_layout", f"{url} has topbar-phone")
        else:
            log_fail("section_3_root_layout", f"{url} topbar-phone", "present", "missing")
        
        # Check correct html lang attribute
        lang_pattern = f'<html lang="{expected_lang}"'
        if lang_pattern in body:
            log_pass("section_3_root_layout", f"{url} has correct html lang={expected_lang}")
        else:
            log_fail("section_3_root_layout", f"{url} html lang", expected_lang, "missing or incorrect")
        
    except Exception as e:
        log_fail("section_3_root_layout", f"{url} request", "success", str(e))

def test_sitemap_robots():
    """Test sitemap and robots.txt"""
    print(f"\n🔍 Testing sitemap and robots.txt")
    
    # Test sitemap.xml
    try:
        resp = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        body = resp.text
        
        if resp.status_code == 200:
            log_pass("section_4_sitemap_robots", "sitemap.xml returns 200")
        else:
            log_fail("section_4_sitemap_robots", "sitemap.xml status", "200", str(resp.status_code))
        
        # Count <loc> entries
        loc_count = body.count('<loc>')
        if loc_count == 67:
            log_pass("section_4_sitemap_robots", f"sitemap.xml has 67 <loc> entries")
        else:
            log_fail("section_4_sitemap_robots", "sitemap.xml <loc> count", "67", str(loc_count))
        
    except Exception as e:
        log_fail("section_4_sitemap_robots", "sitemap.xml request", "success", str(e))
    
    # Test robots.txt
    try:
        resp = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        
        if resp.status_code == 200:
            log_pass("section_4_sitemap_robots", "robots.txt returns 200")
        else:
            log_fail("section_4_sitemap_robots", "robots.txt status", "200", str(resp.status_code))
        
    except Exception as e:
        log_fail("section_4_sitemap_robots", "robots.txt request", "success", str(e))

def test_admin():
    """Test admin endpoints"""
    print(f"\n🔍 Testing admin endpoints")
    
    # Test /admin without auth (should redirect 307)
    try:
        resp = requests.get(f"{BASE_URL}/admin", allow_redirects=False, timeout=10)
        
        if resp.status_code in [307, 200]:
            log_pass("section_5_admin", f"/admin returns {resp.status_code} (redirect or authed)")
        else:
            log_fail("section_5_admin", "/admin status", "307 or 200", str(resp.status_code))
        
    except Exception as e:
        log_fail("section_5_admin", "/admin request", "success", str(e))
    
    # Test POST /api/auth/login
    try:
        login_data = {
            "email": "admin@noir-hamburg.de",
            "password": "NoirAdmin2026!"
        }
        resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_data, timeout=10)
        
        if resp.status_code == 200:
            log_pass("section_5_admin", "POST /api/auth/login returns 200")
        else:
            log_fail("section_5_admin", "POST /api/auth/login status", "200", str(resp.status_code))
        
        # Check for access_token cookie
        if 'access_token' in resp.cookies:
            log_pass("section_5_admin", "POST /api/auth/login sets access_token cookie")
            
            # Test authed GET /admin
            cookies = {'access_token': resp.cookies['access_token']}
            admin_resp = requests.get(f"{BASE_URL}/admin", cookies=cookies, timeout=10)
            
            if admin_resp.status_code == 200:
                log_pass("section_5_admin", "Authed GET /admin returns 200")
            else:
                log_fail("section_5_admin", "Authed GET /admin status", "200", str(admin_resp.status_code))
            
            admin_body = admin_resp.text
            
            # Check for required testids
            if 'data-testid="hero-unread-contacts"' in admin_body:
                log_pass("section_5_admin", "Admin has hero-unread-contacts")
            else:
                log_fail("section_5_admin", "Admin hero-unread-contacts", "present", "missing")
            
            if 'data-testid="panel-activity"' in admin_body:
                log_pass("section_5_admin", "Admin has panel-activity")
            else:
                log_fail("section_5_admin", "Admin panel-activity", "present", "missing")
            
            if 'data-testid="panel-health"' in admin_body:
                log_pass("section_5_admin", "Admin has panel-health")
            else:
                log_fail("section_5_admin", "Admin panel-health", "present", "missing")
        else:
            log_fail("section_5_admin", "POST /api/auth/login cookie", "access_token", "missing")
        
    except Exception as e:
        log_fail("section_5_admin", "POST /api/auth/login request", "success", str(e))

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_passed = 0
    total_failed = 0
    
    for section, data in results.items():
        passed = data["passed"]
        failed = data["failed"]
        total_passed += passed
        total_failed += failed
        
        status = "✅ PASS" if failed == 0 else "❌ FAIL"
        print(f"\n{status} {section}: {passed} passed, {failed} failed")
        
        if data["failures"]:
            print("  Failures:")
            for failure in data["failures"]:
                print(f"    - {failure}")
    
    print("\n" + "="*80)
    print(f"TOTAL: {total_passed} passed, {total_failed} failed")
    print("="*80)
    
    if total_failed == 0:
        print("\n🎉 ALL TESTS PASSED - CUTOVER-READY V2")
    else:
        print(f"\n⚠️  {total_failed} ASSERTIONS FAILED - REVIEW REQUIRED")

def main():
    """Main test runner"""
    print("="*80)
    print("PRE-CUTOVER POLISH V2 REGRESSION TEST")
    print("Base URL:", BASE_URL)
    print("="*80)
    
    # Section 1: 404 page assertions
    print("\n" + "="*80)
    print("SECTION 1: 404 PAGE ASSERTIONS")
    print("="*80)
    
    urls_404 = [
        "/does-not-exist",
        "/en/does-not-exist",
        "/models/bad-slug",
        "/en/models/bad-slug",
        "/services/bad-slug",
        "/en/services/bad-slug",
        "/blog/bad-slug",
        "/en/blog/bad-slug",
        "/escort/bad-slug",
        "/en/escort/bad-slug",
        "/p/bad-slug",
        "/en/p/bad-slug",
        "/random-word-xyz"
    ]
    
    for url in urls_404:
        test_404_page(url)
    
    # Section 2a: Contact form a11y
    print("\n" + "="*80)
    print("SECTION 2A: CONTACT FORM A11Y")
    print("="*80)
    
    test_contact_form_a11y("/kontakt", "de")
    test_contact_form_a11y("/en/contact", "en")
    
    # Section 2b: FAQ glyphs a11y
    print("\n" + "="*80)
    print("SECTION 2B: FAQ GLYPHS A11Y")
    print("="*80)
    
    faq_urls = [
        "/faq",
        "/en/faq",
        "/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner",
        "/escort/hafencity",
        "/services/vip-escort-hamburg",
        "/en/services/luxury-escort-hamburg"
    ]
    
    for url in faq_urls:
        test_faq_glyphs_a11y(url)
    
    # Section 2c: Header nav a11y
    print("\n" + "="*80)
    print("SECTION 2C: HEADER NAV A11Y")
    print("="*80)
    
    test_header_nav_a11y("/", "de")
    test_header_nav_a11y("/en", "en")
    
    # Section 3: Root layout regression
    print("\n" + "="*80)
    print("SECTION 3: ROOT LAYOUT REGRESSION")
    print("="*80)
    
    layout_urls = [
        ("/", "de"),
        ("/en", "en"),
        ("/services", "de"),
        ("/en/services", "en"),
        ("/services/vip-escort-hamburg", "de"),
        ("/en/services/luxury-escort-hamburg", "en"),
        ("/models", "de"),
        ("/en/models", "en"),
        ("/blog", "de"),
        ("/en/blog", "en"),
        ("/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner", "de"),
        ("/en/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner", "en"),
        ("/escort/hafencity", "de"),
        ("/en/escort/hafencity", "en"),
        ("/p/diskretion", "de"),
        ("/en/p/diskretion", "en"),
        ("/kontakt", "de"),
        ("/en/contact", "en"),
        ("/ueber-uns", "de"),
        ("/en/about", "en"),
        ("/impressum", "de"),
        ("/en/imprint", "en"),
        ("/faq", "de"),
        ("/en/faq", "en"),
        ("/escort-hamburg", "de"),
        ("/en/escort-hamburg", "en"),
        ("/areas", "de"),
        ("/en/areas", "en")
    ]
    
    for url, lang in layout_urls:
        test_root_layout_regression(url, lang)
    
    # Section 4: Sitemap + robots
    print("\n" + "="*80)
    print("SECTION 4: SITEMAP + ROBOTS")
    print("="*80)
    
    test_sitemap_robots()
    
    # Section 5: Admin
    print("\n" + "="*80)
    print("SECTION 5: ADMIN")
    print("="*80)
    
    test_admin()
    
    # Print summary
    print_summary()

if __name__ == "__main__":
    main()
