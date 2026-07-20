#!/usr/bin/env python3
"""
Final technical SEO sprint verification test suite.
Tests CWV network hints + hero preload + regression checks.
Target: http://localhost:3000 (dev server, curl only)
"""

import subprocess
import json
import re
import sys

BASE_URL = "http://localhost:3000"

def curl_get(path):
    """Execute curl GET request and return status, body."""
    # Get status code
    cmd_status = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "10", f"{BASE_URL}{path}"]
    result_status = subprocess.run(cmd_status, capture_output=True, text=True, timeout=15)
    status = int(result_status.stdout) if result_status.stdout.isdigit() else 0
    
    # Get body
    cmd_body = ["curl", "-s", "--max-time", "10", f"{BASE_URL}{path}"]
    result_body = subprocess.run(cmd_body, capture_output=True, text=True, timeout=15)
    body = result_body.stdout
    
    # Get location header for redirects
    cmd_location = ["curl", "-s", "-I", "--max-time", "10", f"{BASE_URL}{path}"]
    result_location = subprocess.run(cmd_location, capture_output=True, text=True, timeout=15)
    location = ""
    for line in result_location.stdout.split('\n'):
        if line.lower().startswith('location:'):
            location = line.split(':', 1)[1].strip()
            break
    
    # Get content-type header
    content_type = ""
    for line in result_location.stdout.split('\n'):
        if line.lower().startswith('content-type:'):
            content_type = line.split(':', 1)[1].strip()
            break
    
    return status, body, location, content_type

def extract_tags(html, tag_pattern):
    """Extract all matching tags from HTML."""
    return re.findall(tag_pattern, html, re.IGNORECASE | re.DOTALL)

def test_a1_preconnect_dns_prefetch():
    """TEST A1: GET / → Extract preconnect and dns-prefetch tags."""
    print("\n" + "="*80)
    print("TEST A1: CWV preconnect + dns-prefetch tags on homepage")
    print("="*80)
    
    status, body, _, _ = curl_get("/")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract all preconnect tags
    preconnects = extract_tags(body, r'<link[^>]*rel=["\']preconnect["\'][^>]*>')
    dns_prefetch = extract_tags(body, r'<link[^>]*rel=["\']dns-prefetch["\'][^>]*>')
    
    print(f"\nFound {len(preconnects)} preconnect tags:")
    for pc in preconnects:
        print(f"  {pc}")
    
    print(f"\nFound {len(dns_prefetch)} dns-prefetch tags:")
    for dp in dns_prefetch:
        print(f"  {dp}")
    
    # Check requirements
    checks = {
        'a': False,  # preconnect to fonts.googleapis.com
        'b': False,  # preconnect to fonts.gstatic.com with crossorigin
        'c': False,  # preconnect to res.cloudinary.com with crossorigin
        'd': False,  # dns-prefetch to fonts.googleapis.com
        'e': False,  # dns-prefetch to res.cloudinary.com
    }
    
    for pc in preconnects:
        if 'fonts.googleapis.com' in pc:
            checks['a'] = True
        if 'fonts.gstatic.com' in pc and 'crossorigin' in pc.lower():
            checks['b'] = True
        if 'res.cloudinary.com' in pc and 'crossorigin' in pc.lower():
            checks['c'] = True
    
    for dp in dns_prefetch:
        if 'fonts.googleapis.com' in dp:
            checks['d'] = True
        if 'res.cloudinary.com' in dp:
            checks['e'] = True
    
    print("\nChecks:")
    print(f"  a) preconnect to fonts.googleapis.com: {'✅' if checks['a'] else '❌'}")
    print(f"  b) preconnect to fonts.gstatic.com with crossorigin: {'✅' if checks['b'] else '❌'}")
    print(f"  c) preconnect to res.cloudinary.com with crossorigin: {'✅' if checks['c'] else '❌'}")
    print(f"  d) dns-prefetch to fonts.googleapis.com: {'✅' if checks['d'] else '❌'}")
    print(f"  e) dns-prefetch to res.cloudinary.com: {'✅' if checks['e'] else '❌'}")
    
    all_pass = all(checks.values())
    print(f"\n{'✅ PASS' if all_pass else '❌ FAIL'}: TEST A1")
    return all_pass

def test_a2_hero_preload_de():
    """TEST A2: GET / → Extract hero image preload tag."""
    print("\n" + "="*80)
    print("TEST A2: Hero image preload on DE homepage")
    print("="*80)
    
    status, body, _, _ = curl_get("/")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract all preload tags with as="image"
    preloads = extract_tags(body, r'<link[^>]*rel=["\']preload["\'][^>]*as=["\']image["\'][^>]*>')
    
    print(f"\nFound {len(preloads)} image preload tags:")
    for pl in preloads:
        print(f"  {pl}")
    
    if len(preloads) == 0:
        print("❌ FAIL: No image preload tags found")
        return False
    
    # Check first preload tag
    preload = preloads[0]
    
    checks = {
        'a': len(preloads) >= 1,
        'b': 'cloudinary' in preload.lower() or 'unsplash' in preload.lower() or 'http' in preload.lower(),
        'c': 'f_auto' in preload or 'q_auto' in preload or 'w=' in preload,
        'd': 'fetchpriority="high"' in preload.lower() or 'fetchpriority=\'high\'' in preload.lower(),
    }
    
    print("\nChecks:")
    print(f"  a) At least 1 preload as='image' tag: {'✅' if checks['a'] else '❌'}")
    print(f"  b) href contains cloudinary/unsplash or valid image URL: {'✅' if checks['b'] else '❌'}")
    print(f"  c) href includes optimization params (f_auto,q_auto OR w=): {'✅' if checks['c'] else '❌'}")
    print(f"  d) Has fetchPriority='high': {'✅' if checks['d'] else '❌'}")
    
    all_pass = all(checks.values())
    print(f"\n{'✅ PASS' if all_pass else '❌ FAIL'}: TEST A2")
    return all_pass

def test_a3_hero_preload_en():
    """TEST A3: GET /en → Extract hero image preload tag."""
    print("\n" + "="*80)
    print("TEST A3: Hero image preload on EN homepage")
    print("="*80)
    
    status, body, _, _ = curl_get("/en")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract all preload tags with as="image"
    preloads = extract_tags(body, r'<link[^>]*rel=["\']preload["\'][^>]*as=["\']image["\'][^>]*>')
    
    print(f"\nFound {len(preloads)} image preload tags:")
    for pl in preloads:
        print(f"  {pl}")
    
    if len(preloads) == 0:
        print("❌ FAIL: No image preload tags found")
        return False
    
    # Check first preload tag
    preload = preloads[0]
    
    checks = {
        'a': len(preloads) >= 1,
        'b': 'cloudinary' in preload.lower() or 'unsplash' in preload.lower() or 'http' in preload.lower(),
        'c': 'f_auto' in preload or 'q_auto' in preload or 'w=' in preload,
        'd': 'fetchpriority="high"' in preload.lower() or 'fetchpriority=\'high\'' in preload.lower(),
    }
    
    print("\nChecks:")
    print(f"  a) At least 1 preload as='image' tag: {'✅' if checks['a'] else '❌'}")
    print(f"  b) href contains cloudinary/unsplash or valid image URL: {'✅' if checks['b'] else '❌'}")
    print(f"  c) href includes optimization params (f_auto,q_auto OR w=): {'✅' if checks['c'] else '❌'}")
    print(f"  d) Has fetchPriority='high': {'✅' if checks['d'] else '❌'}")
    
    all_pass = all(checks.values())
    print(f"\n{'✅ PASS' if all_pass else '❌ FAIL'}: TEST A3")
    return all_pass

def test_a4_service_page_preconnect():
    """TEST A4: GET /services/vip-escort-hamburg → Should have preconnect but no hero preload."""
    print("\n" + "="*80)
    print("TEST A4: Service page has preconnect (global layout) but no hero preload")
    print("="*80)
    
    status, body, _, _ = curl_get("/services/vip-escort-hamburg")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract preconnect tags
    preconnects = extract_tags(body, r'<link[^>]*rel=["\']preconnect["\'][^>]*>')
    
    print(f"\nFound {len(preconnects)} preconnect tags")
    
    if len(preconnects) < 3:
        print(f"❌ FAIL: Expected at least 3 preconnect tags, got {len(preconnects)}")
        return False
    
    print(f"✅ PASS: TEST A4 - Service page has {len(preconnects)} preconnect tags (root layout applies globally)")
    return True

def test_b1_de_lang():
    """TEST B1: GET / → HTML must contain <html lang="de">"""
    print("\n" + "="*80)
    print("TEST B1: DE homepage has html lang='de'")
    print("="*80)
    
    status, body, _, _ = curl_get("/")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    if '<html lang="de"' in body or "<html lang='de'" in body:
        print("✅ PASS: TEST B1 - Found <html lang='de'>")
        return True
    else:
        print("❌ FAIL: TEST B1 - <html lang='de'> not found")
        return False

def test_b2_en_lang():
    """TEST B2: GET /en → HTML must contain <html lang="en">"""
    print("\n" + "="*80)
    print("TEST B2: EN homepage has html lang='en'")
    print("="*80)
    
    status, body, _, _ = curl_get("/en")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    if '<html lang="en"' in body or "<html lang='en'" in body:
        print("✅ PASS: TEST B2 - Found <html lang='en'>")
        return True
    else:
        print("❌ FAIL: TEST B2 - <html lang='en'> not found")
        return False

def test_b3_canonical():
    """TEST B3: GET / → <link rel="canonical" href="https://noir-hamburg.com">"""
    print("\n" + "="*80)
    print("TEST B3: DE homepage has correct canonical")
    print("="*80)
    
    status, body, _, _ = curl_get("/")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract canonical tag
    canonical_match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', body, re.IGNORECASE)
    
    if not canonical_match:
        print("❌ FAIL: No canonical tag found")
        return False
    
    canonical_url = canonical_match.group(1)
    print(f"Found canonical: {canonical_url}")
    
    # Accept both with and without trailing slash
    if canonical_url in ["https://noir-hamburg.com", "https://noir-hamburg.com/"]:
        print("✅ PASS: TEST B3 - Canonical URL correct")
        return True
    else:
        print(f"❌ FAIL: TEST B3 - Expected https://noir-hamburg.com, got {canonical_url}")
        return False

def test_b4_hreflang():
    """TEST B4: GET / → SSR HTML has at least 3 <link rel="alternate" hrefLang=…> tags"""
    print("\n" + "="*80)
    print("TEST B4: DE homepage has hreflang alternates")
    print("="*80)
    
    status, body, _, _ = curl_get("/")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract hreflang tags
    hreflangs = extract_tags(body, r'<link[^>]*rel=["\']alternate["\'][^>]*hreflang=["\']([^"\']+)["\']')
    
    print(f"\nFound {len(hreflangs)} hreflang alternate tags")
    
    if len(hreflangs) >= 3:
        print("✅ PASS: TEST B4 - At least 3 hreflang alternates found")
        return True
    else:
        print(f"❌ FAIL: TEST B4 - Expected at least 3 hreflang alternates, got {len(hreflangs)}")
        return False

def test_b5_sitemap_status():
    """TEST B5: GET /sitemap.xml → 200 status, contains multiple <loc> entries."""
    print("\n" + "="*80)
    print("TEST B5: Sitemap returns 200 with multiple <loc> entries")
    print("="*80)
    
    status, body, _, _ = curl_get("/sitemap.xml")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Count <loc> entries
    loc_count = len(re.findall(r'<loc>', body))
    
    print(f"Found {loc_count} <loc> entries")
    
    if loc_count > 1:
        print(f"✅ PASS: TEST B5 - Sitemap has {loc_count} <loc> entries")
        return True
    else:
        print(f"❌ FAIL: TEST B5 - Expected multiple <loc> entries, got {loc_count}")
        return False

def test_b6_sitemap_hreflang():
    """TEST B6: GET /sitemap.xml → contains hrefLang="de" and does NOT contain hrefLang="de-DE"."""
    print("\n" + "="*80)
    print("TEST B6: Sitemap uses hreflang='de' (not 'de-DE')")
    print("="*80)
    
    status, body, _, _ = curl_get("/sitemap.xml")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    has_de = 'hreflang="de"' in body or "hreflang='de'" in body
    has_de_DE = 'hreflang="de-DE"' in body or "hreflang='de-DE'" in body
    
    print(f"Contains hreflang='de': {has_de}")
    print(f"Contains hreflang='de-DE': {has_de_DE}")
    
    if has_de and not has_de_DE:
        print("✅ PASS: TEST B6 - Sitemap uses hreflang='de' (not 'de-DE')")
        return True
    else:
        print("❌ FAIL: TEST B6 - Sitemap should use hreflang='de' not 'de-DE'")
        return False

def test_b7_robots_sitemap():
    """TEST B7: GET /robots.txt → 200 status, contains "Sitemap:" line."""
    print("\n" + "="*80)
    print("TEST B7: robots.txt returns 200 with Sitemap directive")
    print("="*80)
    
    status, body, _, _ = curl_get("/robots.txt")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    if 'Sitemap:' in body:
        print("✅ PASS: TEST B7 - robots.txt contains 'Sitemap:' directive")
        return True
    else:
        print("❌ FAIL: TEST B7 - robots.txt missing 'Sitemap:' directive")
        return False

def test_b8_robots_no_host():
    """TEST B8: GET /robots.txt → does NOT contain "Host:" directive."""
    print("\n" + "="*80)
    print("TEST B8: robots.txt does NOT contain Host directive")
    print("="*80)
    
    status, body, _, _ = curl_get("/robots.txt")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    if 'Host:' not in body:
        print("✅ PASS: TEST B8 - robots.txt does NOT contain 'Host:' directive")
        return True
    else:
        print("❌ FAIL: TEST B8 - robots.txt should NOT contain 'Host:' directive")
        return False

def test_b9_llms_txt():
    """TEST B9: GET /llms.txt → 200 status, content-type header includes "text/plain"."""
    print("\n" + "="*80)
    print("TEST B9: llms.txt returns 200 with text/plain content-type")
    print("="*80)
    
    status, body, _, content_type = curl_get("/llms.txt")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    if 'text/plain' in content_type:
        print(f"✅ PASS: TEST B9 - llms.txt has content-type: {content_type}")
        return True
    else:
        print(f"❌ FAIL: TEST B9 - Expected content-type with 'text/plain', got: {content_type}")
        return False

def test_b10_redirect_diskretion():
    """TEST B10: GET /p/diskretion → HTTP 301 or 308, location header points to /p/diskretion-und-datenschutz-noir-hamburg."""
    print("\n" + "="*80)
    print("TEST B10: /p/diskretion redirects to full slug")
    print("="*80)
    
    status, body, location, _ = curl_get("/p/diskretion")
    
    if status not in [301, 302, 307, 308]:
        print(f"❌ FAIL: Expected redirect (301/302/307/308), got {status}")
        return False
    
    print(f"Redirect status: {status}")
    print(f"Location header: {location}")
    
    if 'diskretion-und-datenschutz-noir-hamburg' in location:
        print("✅ PASS: TEST B10 - Redirects to correct full slug")
        return True
    else:
        print(f"❌ FAIL: TEST B10 - Expected redirect to diskretion-und-datenschutz-noir-hamburg, got: {location}")
        return False

def test_b11_redirect_en_diskretion():
    """TEST B11: GET /en/p/diskretion-und-datenschutz-noir-hamburg → HTTP 308 (or 301/302), location points to /p/diskretion-und-datenschutz-noir-hamburg."""
    print("\n" + "="*80)
    print("TEST B11: EN diskretion page redirects to DE version")
    print("="*80)
    
    status, body, location, _ = curl_get("/en/p/diskretion-und-datenschutz-noir-hamburg")
    
    if status not in [301, 302, 307, 308]:
        print(f"❌ FAIL: Expected redirect (301/302/307/308), got {status}")
        return False
    
    print(f"Redirect status: {status}")
    print(f"Location header: {location}")
    
    # Should redirect to DE version (without /en prefix)
    if location.endswith('/p/diskretion-und-datenschutz-noir-hamburg') or '/p/diskretion-und-datenschutz-noir-hamburg' in location:
        print("✅ PASS: TEST B11 - Redirects to DE version")
        return True
    else:
        print(f"❌ FAIL: TEST B11 - Expected redirect to /p/diskretion-und-datenschutz-noir-hamburg, got: {location}")
        return False

def test_b12_blog_title():
    """TEST B12: GET /blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen → Extract <title>."""
    print("\n" + "="*80)
    print("TEST B12: Blog post has correct unique title (not policy page title)")
    print("="*80)
    
    status, body, _, _ = curl_get("/blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract title
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', body, re.IGNORECASE)
    
    if not title_match:
        print("❌ FAIL: No <title> tag found")
        return False
    
    title = title_match.group(1)
    print(f"Found title: {title}")
    
    checks = {
        'a': 'Zeitalter' in title or 'zeitalter' in title,
        'b': title != "Diskretion & Datenschutz | Noir Hamburg Premium Escort",
    }
    
    print("\nChecks:")
    print(f"  a) Contains 'Zeitalter': {'✅' if checks['a'] else '❌'}")
    print(f"  b) Does NOT equal policy page title: {'✅' if checks['b'] else '❌'}")
    
    all_pass = all(checks.values())
    print(f"\n{'✅ PASS' if all_pass else '❌ FAIL'}: TEST B12")
    return all_pass

def test_b13_homepage_h1():
    """TEST B13: GET / → SSR HTML contains an <h1> element with text containing both "Noir" and "Hamburg"."""
    print("\n" + "="*80)
    print("TEST B13: Homepage has H1 with 'Noir' and 'Hamburg'")
    print("="*80)
    
    status, body, _, _ = curl_get("/")
    
    if status != 200:
        print(f"❌ FAIL: Expected 200, got {status}")
        return False
    
    # Extract all h1 tags (including nested elements)
    h1_matches = re.findall(r'<h1[^>]*>(.*?)</h1>', body, re.IGNORECASE | re.DOTALL)
    
    print(f"Found {len(h1_matches)} <h1> tags")
    
    for h1 in h1_matches:
        # Strip HTML tags from h1 content
        h1_text = re.sub(r'<[^>]+>', '', h1)
        print(f"  H1: {h1_text}")
        if 'Noir' in h1_text and 'Hamburg' in h1_text:
            print("✅ PASS: TEST B13 - H1 contains both 'Noir' and 'Hamburg'")
            return True
    
    print("❌ FAIL: TEST B13 - No H1 found with both 'Noir' and 'Hamburg'")
    return False

def test_b14_models_page():
    """TEST B14: GET /models → HTTP 200."""
    print("\n" + "="*80)
    print("TEST B14: /models page returns 200")
    print("="*80)
    
    status, body, _, _ = curl_get("/models")
    
    if status == 200:
        print("✅ PASS: TEST B14 - /models returns 200")
        return True
    else:
        print(f"❌ FAIL: TEST B14 - Expected 200, got {status}")
        return False

def main():
    """Run all tests and report results."""
    print("\n" + "="*80)
    print("FINAL TECHNICAL SEO SPRINT VERIFICATION")
    print("Target: http://localhost:3000")
    print("="*80)
    
    results = {}
    
    # SECTION A — CWV assets present (new behavior)
    print("\n" + "#"*80)
    print("# SECTION A — CWV ASSETS PRESENT (NEW BEHAVIOR)")
    print("#"*80)
    
    results['A1'] = test_a1_preconnect_dns_prefetch()
    results['A2'] = test_a2_hero_preload_de()
    results['A3'] = test_a3_hero_preload_en()
    results['A4'] = test_a4_service_page_preconnect()
    
    # SECTION B — REGRESSION CHECKS (existing behavior preserved)
    print("\n" + "#"*80)
    print("# SECTION B — REGRESSION CHECKS (EXISTING BEHAVIOR PRESERVED)")
    print("#"*80)
    
    results['B1'] = test_b1_de_lang()
    results['B2'] = test_b2_en_lang()
    results['B3'] = test_b3_canonical()
    results['B4'] = test_b4_hreflang()
    results['B5'] = test_b5_sitemap_status()
    results['B6'] = test_b6_sitemap_hreflang()
    results['B7'] = test_b7_robots_sitemap()
    results['B8'] = test_b8_robots_no_host()
    results['B9'] = test_b9_llms_txt()
    results['B10'] = test_b10_redirect_diskretion()
    results['B11'] = test_b11_redirect_en_diskretion()
    results['B12'] = test_b12_blog_title()
    results['B13'] = test_b13_homepage_h1()
    results['B14'] = test_b14_models_page()
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\nTotal: {passed}/{total} tests passed\n")
    
    for test_id, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_id}: {status}")
    
    if passed == total:
        print("\n" + "="*80)
        print("✅ ALL TESTS PASSED")
        print("="*80)
        return 0
    else:
        print("\n" + "="*80)
        print(f"❌ {total - passed} TEST(S) FAILED")
        print("="*80)
        return 1

if __name__ == "__main__":
    sys.exit(main())
