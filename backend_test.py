#!/usr/bin/env python3
"""
LCP Sprint P0 — Regression Testing after major SSR performance refactor
Test base URL: http://localhost:3000

Comprehensive curl-only regression test covering:
- Multi-root layouts (DE/EN)
- ISR conversion (revalidate=300)
- Request-scoped React cache()
- Responsive hero srcset
"""

import requests
import json
import re
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:3000"

# Test results tracking
passed_tests = []
failed_tests = []

def log_pass(test_id: str, message: str):
    """Log a passing test"""
    passed_tests.append((test_id, message))
    print(f"✅ {test_id}: {message}")

def log_fail(test_id: str, message: str, expected: str = "", actual: str = ""):
    """Log a failing test"""
    failed_tests.append((test_id, message, expected, actual))
    print(f"❌ {test_id}: {message}")
    if expected:
        print(f"   Expected: {expected}")
    if actual:
        print(f"   Actual: {actual}")

def get_html(path: str, max_retries: int = 3) -> Tuple[int, str]:
    """Fetch HTML from a path and return status code and content with retries"""
    import time
    for attempt in range(max_retries):
        try:
            response = requests.get(f"{BASE_URL}{path}", timeout=30, allow_redirects=False)
            time.sleep(0.2)  # Small delay between requests
            return response.status_code, response.text
        except requests.exceptions.ConnectionError as e:
            if attempt < max_retries - 1:
                print(f"   Connection error on {path}, retrying in 3s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(3)  # Wait for server to restart
            else:
                return 0, str(e)
        except Exception as e:
            return 0, str(e)
    return 0, "Max retries exceeded"

def count_occurrences(html: str, pattern: str) -> int:
    """Count occurrences of a pattern in HTML"""
    return len(re.findall(pattern, html, re.IGNORECASE))

def contains_pattern(html: str, pattern: str) -> bool:
    """Check if HTML contains a pattern (case-insensitive)"""
    return bool(re.search(pattern, html, re.IGNORECASE))

print("=" * 80)
print("LCP SPRINT P0 — REGRESSION TEST SUITE")
print("=" * 80)
print()

# ============================================================================
# SECTION A — Language attribute (multi-root)
# ============================================================================
print("SECTION A — Language attribute (multi-root)")
print("-" * 80)

# A1: GET / → status 200, HTML contains <html lang="de" and NOT <html lang="en"
status, html = get_html("/")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="de"'):
        if not contains_pattern(html, r'<html[^>]*lang="en"'):
            log_pass("A1", "/ has lang='de' and NOT lang='en'")
        else:
            log_fail("A1", "/ contains both lang='de' and lang='en'")
    else:
        log_fail("A1", "/ missing lang='de'")
else:
    log_fail("A1", f"/ returned status {status}, expected 200")

# A2: GET /en → status 200, HTML contains <html lang="en" and NOT <html lang="de"
status, html = get_html("/en")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="en"'):
        if not contains_pattern(html, r'<html[^>]*lang="de"'):
            log_pass("A2", "/en has lang='en' and NOT lang='de'")
        else:
            log_fail("A2", "/en contains both lang='en' and lang='de'")
    else:
        log_fail("A2", "/en missing lang='en'")
else:
    log_fail("A2", f"/en returned status {status}, expected 200")

# A3: GET /services → 200, lang="de"
status, html = get_html("/services")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="de"'):
        log_pass("A3", "/services has lang='de'")
    else:
        log_fail("A3", "/services missing lang='de'")
else:
    log_fail("A3", f"/services returned status {status}, expected 200")

# A4: GET /en/services → 200, lang="en"
status, html = get_html("/en/services")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="en"'):
        log_pass("A4", "/en/services has lang='en'")
    else:
        log_fail("A4", "/en/services missing lang='en'")
else:
    log_fail("A4", f"/en/services returned status {status}, expected 200")

# A5: GET /services/vip-escort-hamburg → 200, lang="de"
status, html = get_html("/services/vip-escort-hamburg")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="de"'):
        log_pass("A5", "/services/vip-escort-hamburg has lang='de'")
    else:
        log_fail("A5", "/services/vip-escort-hamburg missing lang='de'")
else:
    log_fail("A5", f"/services/vip-escort-hamburg returned status {status}, expected 200")

# A6: GET /en/services/vip-escort-hamburg → 200, lang="en"
status, html = get_html("/en/services/vip-escort-hamburg")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="en"'):
        log_pass("A6", "/en/services/vip-escort-hamburg has lang='en'")
    else:
        log_fail("A6", "/en/services/vip-escort-hamburg missing lang='en'")
else:
    log_fail("A6", f"/en/services/vip-escort-hamburg returned status {status}, expected 200")

# A7: GET /blog → 200, lang="de"
status, html = get_html("/blog")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="de"'):
        log_pass("A7", "/blog has lang='de'")
    else:
        log_fail("A7", "/blog missing lang='de'")
else:
    log_fail("A7", f"/blog returned status {status}, expected 200")

# A8: GET /en/blog → 200, lang="en"
status, html = get_html("/en/blog")
if status == 200:
    if contains_pattern(html, r'<html[^>]*lang="en"'):
        log_pass("A8", "/en/blog has lang='en'")
    else:
        log_fail("A8", "/en/blog missing lang='en'")
else:
    log_fail("A8", f"/en/blog returned status {status}, expected 200")

print()

# ============================================================================
# SECTION B — next/font persisted after root layout refactor
# ============================================================================
print("SECTION B — next/font persisted after root layout refactor")
print("-" * 80)

# B9: GET / → HTML <html> tag class attribute contains three __variable_ prefixes
status, html = get_html("/")
if status == 200:
    html_tag_match = re.search(r'<html[^>]*class="([^"]*)"', html)
    if html_tag_match:
        class_attr = html_tag_match.group(1)
        variable_count = len(re.findall(r'__variable_\w+', class_attr))
        if variable_count >= 3:
            log_pass("B9", f"/ has {variable_count} __variable_ classes (≥3)")
        else:
            log_fail("B9", f"/ has only {variable_count} __variable_ classes", "≥3", str(variable_count))
    else:
        log_fail("B9", "/ <html> tag missing class attribute")
else:
    log_fail("B9", f"/ returned status {status}, expected 200")

# B10: GET /en → same as B9
status, html = get_html("/en")
if status == 200:
    html_tag_match = re.search(r'<html[^>]*class="([^"]*)"', html)
    if html_tag_match:
        class_attr = html_tag_match.group(1)
        variable_count = len(re.findall(r'__variable_\w+', class_attr))
        if variable_count >= 3:
            log_pass("B10", f"/en has {variable_count} __variable_ classes (≥3)")
        else:
            log_fail("B10", f"/en has only {variable_count} __variable_ classes", "≥3", str(variable_count))
    else:
        log_fail("B10", "/en <html> tag missing class attribute")
else:
    log_fail("B10", f"/en returned status {status}, expected 200")

# B11: GET / → HTML contains "res.cloudinary.com" preconnect
status, html = get_html("/")
if status == 200:
    if contains_pattern(html, r'<link[^>]*rel="preconnect"[^>]*href="https://res\.cloudinary\.com"'):
        log_pass("B11", "/ has Cloudinary preconnect")
    else:
        log_fail("B11", "/ missing Cloudinary preconnect")
else:
    log_fail("B11", f"/ returned status {status}, expected 200")

# B12: GET / → HTML does NOT contain "fonts.googleapis.com" or "fonts.gstatic.com"
status, html = get_html("/")
if status == 200:
    has_google_fonts = contains_pattern(html, r'fonts\.googleapis\.com')
    has_gstatic = contains_pattern(html, r'fonts\.gstatic\.com')
    if not has_google_fonts and not has_gstatic:
        log_pass("B12", "/ does NOT contain Google Fonts URLs")
    else:
        issues = []
        if has_google_fonts:
            issues.append("fonts.googleapis.com")
        if has_gstatic:
            issues.append("fonts.gstatic.com")
        log_fail("B12", f"/ contains: {', '.join(issues)}")
else:
    log_fail("B12", f"/ returned status {status}, expected 200")

# B13: GET / → HTML does NOT contain @import url('https://fonts.googleapis
status, html = get_html("/")
if status == 200:
    if not contains_pattern(html, r'@import\s+url\([\'"]https://fonts\.googleapis'):
        log_pass("B13", "/ does NOT contain @import for Google Fonts")
    else:
        log_fail("B13", "/ contains @import for Google Fonts")
else:
    log_fail("B13", f"/ returned status {status}, expected 200")

print()

# ============================================================================
# SECTION C — SEO artifacts unchanged
# ============================================================================
print("SECTION C — SEO artifacts unchanged")
print("-" * 80)

# C14: GET / → contains exactly ONE <link rel="canonical" with href https://noir-hamburg.com
status, html = get_html("/")
if status == 200:
    canonical_matches = re.findall(r'<link[^>]*rel="canonical"[^>]*>', html, re.IGNORECASE)
    if len(canonical_matches) == 1:
        if contains_pattern(html, r'<link[^>]*rel="canonical"[^>]*href="https://noir-hamburg\.com"'):
            log_pass("C14", "/ has exactly ONE canonical pointing to https://noir-hamburg.com")
        else:
            log_fail("C14", "/ canonical href incorrect")
    else:
        log_fail("C14", f"/ has {len(canonical_matches)} canonical tags", "1", str(len(canonical_matches)))
else:
    log_fail("C14", f"/ returned status {status}, expected 200")

# C15: GET /en → canonical https://noir-hamburg.com/en
status, html = get_html("/en")
if status == 200:
    if contains_pattern(html, r'<link[^>]*rel="canonical"[^>]*href="https://noir-hamburg\.com/en"'):
        log_pass("C15", "/en canonical points to https://noir-hamburg.com/en")
    else:
        log_fail("C15", "/en canonical href incorrect")
else:
    log_fail("C15", f"/en returned status {status}, expected 200")

# C16: GET / → 3 hreflang tags: de, en, x-default
status, html = get_html("/")
if status == 200:
    hreflang_matches = re.findall(r'<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"', html, re.IGNORECASE)
    has_de = any('de' in h for h in hreflang_matches)
    has_en = 'en' in hreflang_matches
    has_x_default = 'x-default' in hreflang_matches
    
    if has_de and has_en and has_x_default:
        log_pass("C16", "/ has hreflang tags for de, en, x-default")
    else:
        missing = []
        if not has_de:
            missing.append("de")
        if not has_en:
            missing.append("en")
        if not has_x_default:
            missing.append("x-default")
        log_fail("C16", f"/ missing hreflang tags: {', '.join(missing)}")
else:
    log_fail("C16", f"/ returned status {status}, expected 200")

# C17: GET /services/vip-escort-hamburg → hreflang de → /services/vip-escort-hamburg, hreflang en → /en/services/vip-escort-hamburg
status, html = get_html("/services/vip-escort-hamburg")
if status == 200:
    # Check for DE hreflang
    has_de_hreflang = contains_pattern(html, r'<link[^>]*hreflang="de[^"]*"[^>]*href="[^"]*\/services\/vip-escort-hamburg"')
    # Check for EN hreflang
    has_en_hreflang = contains_pattern(html, r'<link[^>]*hreflang="en"[^>]*href="[^"]*\/en\/services\/vip-escort-hamburg"')
    
    if has_de_hreflang and has_en_hreflang:
        log_pass("C17", "/services/vip-escort-hamburg has correct DE and EN hreflang")
    else:
        issues = []
        if not has_de_hreflang:
            issues.append("missing DE hreflang")
        if not has_en_hreflang:
            issues.append("missing EN hreflang")
        log_fail("C17", f"/services/vip-escort-hamburg: {', '.join(issues)}")
else:
    log_fail("C17", f"/services/vip-escort-hamburg returned status {status}, expected 200")

# C18: GET /sitemap.xml → 200, at least 100 <loc> entries, uses hreflang="de" (not de-DE)
status, xml = get_html("/sitemap.xml")
if status == 200:
    loc_count = len(re.findall(r'<loc>', xml))
    has_hreflang_de = contains_pattern(xml, r'hreflang="de"')
    has_hreflang_de_DE = contains_pattern(xml, r'hreflang="de-DE"')
    
    if loc_count >= 100:
        if has_hreflang_de and not has_hreflang_de_DE:
            log_pass("C18", f"/sitemap.xml has {loc_count} <loc> entries with hreflang='de' (not de-DE)")
        elif has_hreflang_de_DE:
            log_fail("C18", "/sitemap.xml uses hreflang='de-DE' instead of 'de'")
        else:
            log_fail("C18", "/sitemap.xml missing hreflang='de'")
    else:
        log_fail("C18", f"/sitemap.xml has only {loc_count} <loc> entries", "≥100", str(loc_count))
else:
    log_fail("C18", f"/sitemap.xml returned status {status}, expected 200")

# C19: GET /robots.txt → 200, contains "Sitemap:" directive, does NOT contain "Host:"
status, txt = get_html("/robots.txt")
if status == 200:
    has_sitemap = contains_pattern(txt, r'Sitemap:')
    has_host = contains_pattern(txt, r'Host:')
    
    if has_sitemap and not has_host:
        log_pass("C19", "/robots.txt has Sitemap: and does NOT have Host:")
    else:
        issues = []
        if not has_sitemap:
            issues.append("missing Sitemap:")
        if has_host:
            issues.append("contains Host:")
        log_fail("C19", f"/robots.txt: {', '.join(issues)}")
else:
    log_fail("C19", f"/robots.txt returned status {status}, expected 200")

# C20: GET /llms.txt → 200, content-type includes "text/plain"
import time
for attempt in range(3):
    try:
        response = requests.get(f"{BASE_URL}/llms.txt", timeout=30)
        time.sleep(0.2)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'text/plain' in content_type:
                log_pass("C20", "/llms.txt returns 200 with content-type text/plain")
            else:
                log_fail("C20", f"/llms.txt content-type is '{content_type}'", "text/plain", content_type)
        else:
            log_fail("C20", f"/llms.txt returned status {response.status_code}", "200", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /llms.txt, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("C20", f"/llms.txt request failed: {str(e)}")
    except Exception as e:
        log_fail("C20", f"/llms.txt request failed: {str(e)}")
        break

# C21: GET /services/vip-escort-hamburg → contains JSON-LD @type":"Service"
status, html = get_html("/services/vip-escort-hamburg")
if status == 200:
    if contains_pattern(html, r'"@type"\s*:\s*"Service"'):
        log_pass("C21", "/services/vip-escort-hamburg has JSON-LD @type:Service")
    else:
        log_fail("C21", "/services/vip-escort-hamburg missing JSON-LD @type:Service")
else:
    log_fail("C21", f"/services/vip-escort-hamburg returned status {status}, expected 200")

# C22: GET / → contains JSON-LD @type":"Organization"
status, html = get_html("/")
if status == 200:
    if contains_pattern(html, r'"@type"\s*:\s*"Organization"'):
        log_pass("C22", "/ has JSON-LD @type:Organization")
    else:
        log_fail("C22", "/ missing JSON-LD @type:Organization")
else:
    log_fail("C22", f"/ returned status {status}, expected 200")

print()

# ============================================================================
# SECTION D — Titles, metadata unchanged
# ============================================================================
print("SECTION D — Titles, metadata unchanged")
print("-" * 80)

# D23: GET /blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen → <title> contains "Zeitalter" and does NOT contain "Datenschutz"
status, html = get_html("/blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen")
if status == 200:
    title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if title_match:
        title = title_match.group(1)
        has_zeitalter = 'Zeitalter' in title
        has_datenschutz = 'Datenschutz' in title
        
        if has_zeitalter and not has_datenschutz:
            log_pass("D23", "Blog post title contains 'Zeitalter' and NOT 'Datenschutz'")
        else:
            issues = []
            if not has_zeitalter:
                issues.append("missing 'Zeitalter'")
            if has_datenschutz:
                issues.append("contains 'Datenschutz'")
            log_fail("D23", f"Blog post title: {', '.join(issues)}", title=title)
    else:
        log_fail("D23", "Blog post missing <title> tag")
else:
    log_fail("D23", f"Blog post returned status {status}, expected 200")

# D24: GET /p/diskretion-und-datenschutz-noir-hamburg → <title> contains "Diskretion & Datenschutz"
status, html = get_html("/p/diskretion-und-datenschutz-noir-hamburg")
if status == 200:
    title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if title_match:
        title = title_match.group(1)
        if 'Diskretion' in title and 'Datenschutz' in title:
            log_pass("D24", "/p/diskretion-und-datenschutz-noir-hamburg title contains 'Diskretion & Datenschutz'")
        else:
            log_fail("D24", f"/p/diskretion-und-datenschutz-noir-hamburg title missing expected text", title=title)
    else:
        log_fail("D24", "/p/diskretion-und-datenschutz-noir-hamburg missing <title> tag")
else:
    log_fail("D24", f"/p/diskretion-und-datenschutz-noir-hamburg returned status {status}, expected 200")

# D25: GET /services/vip-escort-hamburg → <title> contains "VIP" and "Escort" and "Hamburg"
status, html = get_html("/services/vip-escort-hamburg")
if status == 200:
    title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if title_match:
        title = title_match.group(1)
        has_vip = 'VIP' in title or 'vip' in title.lower()
        has_escort = 'Escort' in title or 'escort' in title.lower()
        has_hamburg = 'Hamburg' in title
        
        if has_vip and has_escort and has_hamburg:
            log_pass("D25", "/services/vip-escort-hamburg title contains VIP, Escort, Hamburg")
        else:
            missing = []
            if not has_vip:
                missing.append("VIP")
            if not has_escort:
                missing.append("Escort")
            if not has_hamburg:
                missing.append("Hamburg")
            log_fail("D25", f"/services/vip-escort-hamburg title missing: {', '.join(missing)}", title=title)
    else:
        log_fail("D25", "/services/vip-escort-hamburg missing <title> tag")
else:
    log_fail("D25", f"/services/vip-escort-hamburg returned status {status}, expected 200")

# D26: GET /en/services/vip-escort-hamburg → <title> contains "VIP" or English variant
status, html = get_html("/en/services/vip-escort-hamburg")
if status == 200:
    title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if title_match:
        title = title_match.group(1)
        has_vip = 'VIP' in title or 'vip' in title.lower()
        
        if has_vip:
            log_pass("D26", "/en/services/vip-escort-hamburg title contains VIP")
        else:
            log_fail("D26", "/en/services/vip-escort-hamburg title missing VIP", title=title)
    else:
        log_fail("D26", "/en/services/vip-escort-hamburg missing <title> tag")
else:
    log_fail("D26", f"/en/services/vip-escort-hamburg returned status {status}, expected 200")

# D27: All 13 blog posts have UNIQUE titles
import time
for attempt in range(3):
    try:
        response = requests.get(f"{BASE_URL}/api/blog", timeout=30)
        time.sleep(0.2)
        if response.status_code == 200:
            blog_posts = response.json()
            titles = []
            for post in blog_posts:
                slug = post.get('slug', '')
                status, html = get_html(f"/blog/{slug}")
                if status == 200:
                    title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
                    if title_match:
                        titles.append(title_match.group(1))
            
            if len(titles) == len(set(titles)):
                log_pass("D27", f"All {len(titles)} blog posts have UNIQUE titles")
            else:
                duplicates = [t for t in titles if titles.count(t) > 1]
                log_fail("D27", f"Found duplicate titles: {set(duplicates)}")
        else:
            log_fail("D27", f"/api/blog returned status {response.status_code}", "200", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /api/blog, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("D27", f"Blog title uniqueness check failed: {str(e)}")
    except Exception as e:
        log_fail("D27", f"Blog title uniqueness check failed: {str(e)}")
        break

print()

# ============================================================================
# SECTION E — Redirects still fire (middleware unchanged)
# ============================================================================
print("SECTION E — Redirects still fire (middleware unchanged)")
print("-" * 80)

# E28: GET /p/diskretion → 301/308 to /p/diskretion-und-datenschutz-noir-hamburg
import time
for attempt in range(3):
    try:
        response = requests.get(f"{BASE_URL}/p/diskretion", timeout=30, allow_redirects=False)
        time.sleep(0.2)
        if response.status_code in [301, 308]:
            location = response.headers.get('location', '')
            if 'diskretion-und-datenschutz-noir-hamburg' in location:
                log_pass("E28", f"/p/diskretion redirects ({response.status_code}) to full slug")
            else:
                log_fail("E28", f"/p/diskretion redirects to wrong location: {location}")
        else:
            log_fail("E28", f"/p/diskretion returned status {response.status_code}", "301 or 308", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /p/diskretion, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("E28", f"/p/diskretion request failed: {str(e)}")
    except Exception as e:
        log_fail("E28", f"/p/diskretion request failed: {str(e)}")
        break

# E29: GET /en/p/diskretion → 301/308 to /en/p/diskretion-und-datenschutz-noir-hamburg
for attempt in range(3):
    try:
        response = requests.get(f"{BASE_URL}/en/p/diskretion", timeout=30, allow_redirects=False)
        time.sleep(0.2)
        if response.status_code in [301, 308]:
            location = response.headers.get('location', '')
            if 'diskretion-und-datenschutz-noir-hamburg' in location:
                log_pass("E29", f"/en/p/diskretion redirects ({response.status_code}) to full slug")
            else:
                log_fail("E29", f"/en/p/diskretion redirects to wrong location: {location}")
        else:
            log_fail("E29", f"/en/p/diskretion returned status {response.status_code}", "301 or 308", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /en/p/diskretion, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("E29", f"/en/p/diskretion request failed: {str(e)}")
    except Exception as e:
        log_fail("E29", f"/en/p/diskretion request failed: {str(e)}")
        break

# E30: GET /en/p/diskretion-und-datenschutz-noir-hamburg → 308 to DE version
for attempt in range(3):
    try:
        response = requests.get(f"{BASE_URL}/en/p/diskretion-und-datenschutz-noir-hamburg", timeout=30, allow_redirects=False)
        time.sleep(0.2)
        if response.status_code == 308:
            location = response.headers.get('location', '')
            if '/p/diskretion' in location and '/en/' not in location:
                log_pass("E30", "/en/p/diskretion-und-datenschutz-noir-hamburg redirects (308) to DE version")
            else:
                log_fail("E30", f"/en/p/diskretion-und-datenschutz-noir-hamburg redirects to wrong location: {location}")
        else:
            log_fail("E30", f"/en/p/diskretion-und-datenschutz-noir-hamburg returned status {response.status_code}", "308", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /en/p/diskretion-und-datenschutz-noir-hamburg, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("E30", f"/en/p/diskretion-und-datenschutz-noir-hamburg request failed: {str(e)}")
    except Exception as e:
        log_fail("E30", f"/en/p/diskretion-und-datenschutz-noir-hamburg request failed: {str(e)}")
        break

print()

# ============================================================================
# SECTION F — 404 flows
# ============================================================================
print("SECTION F — 404 flows")
print("-" * 80)

# F31: GET /does-not-exist → status 404 AND response body contains data-testid="not-found"
status, html = get_html("/does-not-exist")
if status == 404:
    if contains_pattern(html, r'data-testid="not-found"'):
        log_pass("F31", "/does-not-exist returns 404 with custom NotFoundBody")
    else:
        log_fail("F31", "/does-not-exist returns 404 but missing custom NotFoundBody")
else:
    log_fail("F31", f"/does-not-exist returned status {status}", "404", str(status))

# F32: GET /en/does-not-exist → status 404 AND contains data-testid="not-found"
status, html = get_html("/en/does-not-exist")
if status == 404:
    if contains_pattern(html, r'data-testid="not-found"'):
        log_pass("F32", "/en/does-not-exist returns 404 with custom NotFoundBody")
    else:
        log_fail("F32", "/en/does-not-exist returns 404 but missing custom NotFoundBody")
else:
    log_fail("F32", f"/en/does-not-exist returned status {status}", "404", str(status))

# F33: GET /some/deep/nonexistent/path → status 404 AND contains custom NotFoundBody
status, html = get_html("/some/deep/nonexistent/path")
if status == 404:
    if contains_pattern(html, r'data-testid="not-found"'):
        log_pass("F33", "/some/deep/nonexistent/path returns 404 with custom NotFoundBody")
    else:
        log_fail("F33", "/some/deep/nonexistent/path returns 404 but missing custom NotFoundBody")
else:
    log_fail("F33", f"/some/deep/nonexistent/path returned status {status}", "404", str(status))

# F34: GET /services/nonexistent-slug → 404 AND contains custom NotFoundBody
status, html = get_html("/services/nonexistent-slug")
if status == 404:
    if contains_pattern(html, r'data-testid="not-found"'):
        log_pass("F34", "/services/nonexistent-slug returns 404 with custom NotFoundBody")
    else:
        log_fail("F34", "/services/nonexistent-slug returns 404 but missing custom NotFoundBody")
else:
    log_fail("F34", f"/services/nonexistent-slug returned status {status}", "404", str(status))

# F35: GET /models/nonexistent-slug → 404 AND contains custom NotFoundBody
status, html = get_html("/models/nonexistent-slug")
if status == 404:
    if contains_pattern(html, r'data-testid="not-found"'):
        log_pass("F35", "/models/nonexistent-slug returns 404 with custom NotFoundBody")
    else:
        log_fail("F35", "/models/nonexistent-slug returns 404 but missing custom NotFoundBody")
else:
    log_fail("F35", f"/models/nonexistent-slug returned status {status}", "404", str(status))

# F36: GET /blog/nonexistent-slug → 404 AND contains custom NotFoundBody
status, html = get_html("/blog/nonexistent-slug")
if status == 404:
    if contains_pattern(html, r'data-testid="not-found"'):
        log_pass("F36", "/blog/nonexistent-slug returns 404 with custom NotFoundBody")
    else:
        log_fail("F36", "/blog/nonexistent-slug returns 404 but missing custom NotFoundBody")
else:
    log_fail("F36", f"/blog/nonexistent-slug returned status {status}", "404", str(status))

print()

# ============================================================================
# SECTION G — Hero image responsive srcset (verify HTML)
# ============================================================================
print("SECTION G — Hero image responsive srcset (verify HTML)")
print("-" * 80)

# G37: GET / → HTML contains <img> with fetchPriority="high" AND srcSet containing "600w" AND "900w" AND sizes containing "100vw"
status, html = get_html("/")
if status == 200:
    # Look for img with fetchPriority="high"
    has_fetch_priority = contains_pattern(html, r'<img[^>]*fetchpriority="high"[^>]*>')
    has_srcset_600w = contains_pattern(html, r'srcset="[^"]*\bw=600[^"]*600w')
    has_srcset_900w = contains_pattern(html, r'srcset="[^"]*\bw=900[^"]*900w')
    has_sizes_100vw = contains_pattern(html, r'sizes="[^"]*100vw')
    
    if has_fetch_priority and has_srcset_600w and has_srcset_900w and has_sizes_100vw:
        log_pass("G37", "/ has hero img with fetchPriority='high', srcSet (600w, 900w), sizes (100vw)")
    else:
        issues = []
        if not has_fetch_priority:
            issues.append("missing fetchPriority='high'")
        if not has_srcset_600w:
            issues.append("missing srcSet 600w")
        if not has_srcset_900w:
            issues.append("missing srcSet 900w")
        if not has_sizes_100vw:
            issues.append("missing sizes 100vw")
        log_fail("G37", f"/ hero image: {', '.join(issues)}")
else:
    log_fail("G37", f"/ returned status {status}", "200", str(status))

# G38: GET / → HTML contains <link rel="preload" as="image" with imageSrcSet and imageSizes and fetchPriority="high"
status, html = get_html("/")
if status == 200:
    has_preload = contains_pattern(html, r'<link[^>]*rel="preload"[^>]*as="image"[^>]*>')
    has_image_srcset = contains_pattern(html, r'<link[^>]*imagesrcset="[^"]*"')
    has_image_sizes = contains_pattern(html, r'<link[^>]*imagesizes="[^"]*"')
    has_fetch_priority = contains_pattern(html, r'<link[^>]*fetchpriority="high"[^>]*>')
    
    if has_preload and has_image_srcset and has_image_sizes and has_fetch_priority:
        log_pass("G38", "/ has preload link with as='image', imageSrcSet, imageSizes, fetchPriority='high'")
    else:
        issues = []
        if not has_preload:
            issues.append("missing preload link")
        if not has_image_srcset:
            issues.append("missing imageSrcSet")
        if not has_image_sizes:
            issues.append("missing imageSizes")
        if not has_fetch_priority:
            issues.append("missing fetchPriority='high'")
        log_fail("G38", f"/ preload link: {', '.join(issues)}")
else:
    log_fail("G38", f"/ returned status {status}", "200", str(status))

# G39: GET /services/vip-escort-hamburg → HTML contains <img fetchpriority="high" with srcSet containing "900w" AND "1600w"
status, html = get_html("/services/vip-escort-hamburg")
if status == 200:
    has_fetch_priority = contains_pattern(html, r'<img[^>]*fetchpriority="high"[^>]*>')
    has_srcset_900w = contains_pattern(html, r'srcset="[^"]*\bw=900[^"]*900w')
    has_srcset_1600w = contains_pattern(html, r'srcset="[^"]*\bw=1600[^"]*1600w')
    
    if has_fetch_priority and has_srcset_900w and has_srcset_1600w:
        log_pass("G39", "/services/vip-escort-hamburg has hero img with fetchPriority='high', srcSet (900w, 1600w)")
    else:
        issues = []
        if not has_fetch_priority:
            issues.append("missing fetchPriority='high'")
        if not has_srcset_900w:
            issues.append("missing srcSet 900w")
        if not has_srcset_1600w:
            issues.append("missing srcSet 1600w")
        log_fail("G39", f"/services/vip-escort-hamburg hero image: {', '.join(issues)}")
else:
    log_fail("G39", f"/services/vip-escort-hamburg returned status {status}", "200", str(status))

# G40: GET /services/vip-escort-hamburg → HTML contains <link rel="preload" with imageSrcSet containing "900w" and "1600w"
status, html = get_html("/services/vip-escort-hamburg")
if status == 200:
    has_preload = contains_pattern(html, r'<link[^>]*rel="preload"[^>]*as="image"[^>]*>')
    has_srcset_900w = contains_pattern(html, r'<link[^>]*imagesrcset="[^"]*\bw=900[^"]*900w')
    has_srcset_1600w = contains_pattern(html, r'<link[^>]*imagesrcset="[^"]*\bw=1600[^"]*1600w')
    
    if has_preload and has_srcset_900w and has_srcset_1600w:
        log_pass("G40", "/services/vip-escort-hamburg has preload link with imageSrcSet (900w, 1600w)")
    else:
        issues = []
        if not has_preload:
            issues.append("missing preload link")
        if not has_srcset_900w:
            issues.append("missing imageSrcSet 900w")
        if not has_srcset_1600w:
            issues.append("missing imageSrcSet 1600w")
        log_fail("G40", f"/services/vip-escort-hamburg preload link: {', '.join(issues)}")
else:
    log_fail("G40", f"/services/vip-escort-hamburg returned status {status}", "200", str(status))

# G41: GET /en/services/vip-escort-hamburg → same as G39 and G40
status, html = get_html("/en/services/vip-escort-hamburg")
if status == 200:
    # Check img
    has_fetch_priority = contains_pattern(html, r'<img[^>]*fetchpriority="high"[^>]*>')
    has_srcset_900w_img = contains_pattern(html, r'srcset="[^"]*\bw=900[^"]*900w')
    has_srcset_1600w_img = contains_pattern(html, r'srcset="[^"]*\bw=1600[^"]*1600w')
    
    # Check preload
    has_preload = contains_pattern(html, r'<link[^>]*rel="preload"[^>]*as="image"[^>]*>')
    has_srcset_900w_link = contains_pattern(html, r'<link[^>]*imagesrcset="[^"]*\bw=900[^"]*900w')
    has_srcset_1600w_link = contains_pattern(html, r'<link[^>]*imagesrcset="[^"]*\bw=1600[^"]*1600w')
    
    img_ok = has_fetch_priority and has_srcset_900w_img and has_srcset_1600w_img
    preload_ok = has_preload and has_srcset_900w_link and has_srcset_1600w_link
    
    if img_ok and preload_ok:
        log_pass("G41", "/en/services/vip-escort-hamburg has hero img and preload with correct srcSet")
    else:
        issues = []
        if not img_ok:
            issues.append("img issues")
        if not preload_ok:
            issues.append("preload issues")
        log_fail("G41", f"/en/services/vip-escort-hamburg: {', '.join(issues)}")
else:
    log_fail("G41", f"/en/services/vip-escort-hamburg returned status {status}", "200", str(status))

print()

# ============================================================================
# SECTION H — Regression sanity
# ============================================================================
print("SECTION H — Regression sanity")
print("-" * 80)

# H42: GET all these URLs return 200
urls_to_check = [
    "/", "/en", "/services", "/en/services", "/models", "/en/models", "/blog", "/en/blog",
    "/faq", "/en/faq", "/impressum", "/en/imprint", "/kontakt", "/en/contact",
    "/ueber-uns", "/en/about", "/escort-hamburg", "/en/escort-hamburg", "/areas", "/en/areas",
    "/escort/hafencity", "/en/escort/hafencity", "/p/diskretion-und-datenschutz-noir-hamburg",
    "/services/luxury-escort-hamburg", "/services/business-escort-hamburg"
]

all_200 = True
failed_urls = []
for url in urls_to_check:
    status, _ = get_html(url)
    if status != 200:
        all_200 = False
        failed_urls.append(f"{url} ({status})")

if all_200:
    log_pass("H42", f"All {len(urls_to_check)} regression URLs return 200")
else:
    log_fail("H42", f"Some URLs failed: {', '.join(failed_urls)}")

# H43: GET /api/health → 200, JSON with status:"ok"
import time
for attempt in range(3):
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=30)
        time.sleep(0.2)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                log_pass("H43", "/api/health returns 200 with status:'ok'")
            else:
                log_fail("H43", f"/api/health status is '{data.get('status')}'", "ok", str(data.get('status')))
        else:
            log_fail("H43", f"/api/health returned status {response.status_code}", "200", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /api/health, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("H43", f"/api/health request failed: {str(e)}")
    except Exception as e:
        log_fail("H43", f"/api/health request failed: {str(e)}")
        break

# H44: GET /admin/login → 200
status, _ = get_html("/admin/login")
if status == 200:
    log_pass("H44", "/admin/login returns 200")
else:
    log_fail("H44", f"/admin/login returned status {status}", "200", str(status))

print()

# ============================================================================
# SECTION I — Admin auth still works
# ============================================================================
print("SECTION I — Admin auth still works")
print("-" * 80)

# I45: POST /api/auth/login with credentials → 200 with access_token cookie
import time
for attempt in range(3):
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@noir-hamburg.de", "password": "NoirAdmin2026!"},
            timeout=30
        )
        time.sleep(0.2)
        if response.status_code == 200:
            cookies = response.cookies
            if 'access_token' in cookies:
                log_pass("I45", "POST /api/auth/login returns 200 with access_token cookie")
                
                # I46: Authed GET /admin → 200
                for admin_attempt in range(3):
                    try:
                        admin_response = requests.get(f"{BASE_URL}/admin", cookies=cookies, timeout=30)
                        time.sleep(0.2)
                        if admin_response.status_code == 200:
                            log_pass("I46", "Authed GET /admin returns 200")
                        else:
                            log_fail("I46", f"Authed GET /admin returned status {admin_response.status_code}", "200", str(admin_response.status_code))
                        break
                    except requests.exceptions.ConnectionError as e:
                        if admin_attempt < 2:
                            print(f"   Connection error on /admin, retrying in 3s...")
                            time.sleep(3)
                        else:
                            log_fail("I46", f"Authed GET /admin request failed: {str(e)}")
                    except Exception as e:
                        log_fail("I46", f"Authed GET /admin request failed: {str(e)}")
                        break
            else:
                log_fail("I45", "POST /api/auth/login missing access_token cookie")
        else:
            log_fail("I45", f"POST /api/auth/login returned status {response.status_code}", "200", str(response.status_code))
        break
    except requests.exceptions.ConnectionError as e:
        if attempt < 2:
            print(f"   Connection error on /api/auth/login, retrying in 3s...")
            time.sleep(3)
        else:
            log_fail("I45", f"Admin auth test failed: {str(e)}")
    except Exception as e:
        log_fail("I45", f"Admin auth test failed: {str(e)}")
        break

print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"✅ PASSED: {len(passed_tests)}")
print(f"❌ FAILED: {len(failed_tests)}")
print(f"TOTAL: {len(passed_tests) + len(failed_tests)}")
print()

if failed_tests:
    print("FAILED TESTS:")
    print("-" * 80)
    for test_id, message, expected, actual in failed_tests:
        print(f"❌ {test_id}: {message}")
        if expected:
            print(f"   Expected: {expected}")
        if actual:
            print(f"   Actual: {actual}")
    print()

print("=" * 80)
print("END OF TEST SUITE")
print("=" * 80)
