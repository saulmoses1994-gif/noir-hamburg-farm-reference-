#!/usr/bin/env python3
"""
Final Performance Sprint Verification Test Suite
Tests next/font migration + service page hero preload
Target: http://localhost:3000
"""

import subprocess
import re
import sys

BASE_URL = "http://localhost:3000"

def curl_get(path):
    """Execute curl GET request and return (status_code, response_body)"""
    try:
        result = subprocess.run(
            ["curl", "-s", "-w", "\\nHTTP_STATUS:%{http_code}", f"{BASE_URL}{path}", "--max-time", "10"],
            capture_output=True,
            text=True,
            timeout=15
        )
        output = result.stdout
        # Extract status code from the end
        if "HTTP_STATUS:" in output:
            parts = output.rsplit("HTTP_STATUS:", 1)
            body = parts[0]
            status = int(parts[1].strip())
            return status, body
        return 0, output
    except Exception as e:
        print(f"ERROR: curl failed for {path}: {e}")
        return 0, ""

def test_section_a():
    """SECTION A — next/font migration"""
    print("\n" + "="*80)
    print("SECTION A — next/font migration")
    print("="*80)
    
    results = []
    
    # A1: Check for three __variable_ CSS classes in <html> tag
    print("\n[A1] Testing for three __variable_ CSS classes in <html> tag...")
    status, body = curl_get("/")
    if status == 200:
        # Extract <html> tag
        html_match = re.search(r'<html[^>]*>', body, re.IGNORECASE)
        if html_match:
            html_tag = html_match.group(0)
            # Find className attribute
            class_match = re.search(r'class="([^"]*)"', html_tag)
            if class_match:
                class_value = class_match.group(1)
                # Count __variable_ occurrences
                variable_count = len(re.findall(r'__variable_\w+', class_value))
                if variable_count >= 3:
                    print(f"✅ PASS: Found {variable_count} __variable_ classes")
                    print(f"   Observed: {class_value}")
                    results.append(("A1", True, f"Found {variable_count} __variable_ classes"))
                else:
                    print(f"❌ FAIL: Found only {variable_count} __variable_ classes (expected 3)")
                    print(f"   Observed: {class_value}")
                    results.append(("A1", False, f"Found only {variable_count} __variable_ classes"))
            else:
                print("❌ FAIL: No class attribute found in <html> tag")
                results.append(("A1", False, "No class attribute in <html> tag"))
        else:
            print("❌ FAIL: Could not extract <html> tag")
            results.append(("A1", False, "Could not extract <html> tag"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("A1", False, f"GET / returned {status}"))
    
    # A2: Check that fonts.googleapis.com and fonts.gstatic.com are NOT present
    print("\n[A2] Testing that fonts.googleapis.com and fonts.gstatic.com are NOT present...")
    status, body = curl_get("/")
    if status == 200:
        has_googleapis = "fonts.googleapis.com" in body
        has_gstatic = "fonts.gstatic.com" in body
        if not has_googleapis and not has_gstatic:
            print("✅ PASS: No Google Fonts external URLs found")
            results.append(("A2", True, "No fonts.googleapis.com or fonts.gstatic.com"))
        else:
            issues = []
            if has_googleapis:
                issues.append("fonts.googleapis.com found")
            if has_gstatic:
                issues.append("fonts.gstatic.com found")
            print(f"❌ FAIL: {', '.join(issues)}")
            results.append(("A2", False, ', '.join(issues)))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("A2", False, f"GET / returned {status}"))
    
    # A3: Check that @import url('https://fonts.googleapis is NOT present
    print("\n[A3] Testing that @import url('https://fonts.googleapis is NOT present...")
    status, body = curl_get("/")
    if status == 200:
        has_import = "@import url('https://fonts.googleapis" in body or '@import url("https://fonts.googleapis' in body
        if not has_import:
            print("✅ PASS: No @import Google Fonts directive found")
            results.append(("A3", True, "No @import Google Fonts directive"))
        else:
            print("❌ FAIL: @import url('https://fonts.googleapis found in HTML")
            results.append(("A3", False, "@import Google Fonts directive found"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("A3", False, f"GET / returned {status}"))
    
    # A4: Check that Cloudinary preconnect IS still present
    print("\n[A4] Testing that Cloudinary preconnect IS still present...")
    status, body = curl_get("/")
    if status == 200:
        has_cloudinary = 'rel="preconnect"' in body and 'res.cloudinary.com' in body
        if has_cloudinary:
            print("✅ PASS: Cloudinary preconnect found")
            results.append(("A4", True, "Cloudinary preconnect present"))
        else:
            print("❌ FAIL: Cloudinary preconnect not found")
            results.append(("A4", False, "Cloudinary preconnect missing"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("A4", False, f"GET / returned {status}"))
    
    return results

def test_section_b():
    """SECTION B — Service page hero preload"""
    print("\n" + "="*80)
    print("SECTION B — Service page hero preload")
    print("="*80)
    
    results = []
    
    # B1: DE service page has preload with fetchPriority="high"
    print("\n[B1] Testing DE service page for hero preload...")
    status, body = curl_get("/services/vip-escort-hamburg")
    if status == 200:
        has_preload = 'rel="preload"' in body and 'as="image"' in body
        has_fetch_priority = 'fetchPriority="high"' in body or 'fetchpriority="high"' in body
        # Check if href points to cloudinary or unsplash
        preload_match = re.search(r'<link[^>]*rel="preload"[^>]*as="image"[^>]*>', body, re.IGNORECASE)
        has_valid_href = False
        href_value = ""
        if preload_match:
            preload_tag = preload_match.group(0)
            href_match = re.search(r'href="([^"]*)"', preload_tag)
            if href_match:
                href_value = href_match.group(1)
                has_valid_href = 'cloudinary' in href_value.lower() or 'unsplash' in href_value.lower()
        
        if has_preload and has_fetch_priority and has_valid_href:
            print(f"✅ PASS: Hero preload found with fetchPriority='high'")
            print(f"   Href: {href_value[:80]}...")
            results.append(("B1", True, f"Hero preload with fetchPriority='high', href={href_value[:50]}..."))
        else:
            issues = []
            if not has_preload:
                issues.append("no preload tag")
            if not has_fetch_priority:
                issues.append("no fetchPriority='high'")
            if not has_valid_href:
                issues.append(f"invalid href (not cloudinary/unsplash): {href_value}")
            print(f"❌ FAIL: {', '.join(issues)}")
            results.append(("B1", False, ', '.join(issues)))
    else:
        print(f"❌ FAIL: GET /services/vip-escort-hamburg returned {status}")
        results.append(("B1", False, f"GET returned {status}"))
    
    # B2: EN service page has preload with fetchPriority="high"
    print("\n[B2] Testing EN service page for hero preload...")
    status, body = curl_get("/en/services/vip-escort-hamburg")
    if status == 200:
        has_preload = 'rel="preload"' in body and 'as="image"' in body
        has_fetch_priority = 'fetchPriority="high"' in body or 'fetchpriority="high"' in body
        preload_match = re.search(r'<link[^>]*rel="preload"[^>]*as="image"[^>]*>', body, re.IGNORECASE)
        has_valid_href = False
        href_value = ""
        if preload_match:
            preload_tag = preload_match.group(0)
            href_match = re.search(r'href="([^"]*)"', preload_tag)
            if href_match:
                href_value = href_match.group(1)
                has_valid_href = 'cloudinary' in href_value.lower() or 'unsplash' in href_value.lower()
        
        if has_preload and has_fetch_priority and has_valid_href:
            print(f"✅ PASS: Hero preload found with fetchPriority='high'")
            print(f"   Href: {href_value[:80]}...")
            results.append(("B2", True, f"Hero preload with fetchPriority='high', href={href_value[:50]}..."))
        else:
            issues = []
            if not has_preload:
                issues.append("no preload tag")
            if not has_fetch_priority:
                issues.append("no fetchPriority='high'")
            if not has_valid_href:
                issues.append(f"invalid href: {href_value}")
            print(f"❌ FAIL: {', '.join(issues)}")
            results.append(("B2", False, ', '.join(issues)))
    else:
        print(f"❌ FAIL: GET /en/services/vip-escort-hamburg returned {status}")
        results.append(("B2", False, f"GET returned {status}"))
    
    # B3: DE service page hero <img> has loading="eager" AND fetchPriority="high"
    print("\n[B3] Testing DE service page hero <img> attributes...")
    status, body = curl_get("/services/vip-escort-hamburg")
    if status == 200:
        # Look for hero img tag (should be early in the page, likely with alt containing service name)
        img_matches = re.findall(r'<img[^>]*>', body, re.IGNORECASE)
        found_hero = False
        for img_tag in img_matches[:5]:  # Check first 5 img tags
            has_eager = 'loading="eager"' in img_tag or "loading='eager'" in img_tag
            has_fetch_priority = 'fetchPriority="high"' in img_tag or 'fetchpriority="high"' in img_tag
            if has_eager and has_fetch_priority:
                print(f"✅ PASS: Hero <img> has loading='eager' AND fetchPriority='high'")
                print(f"   Tag: {img_tag[:100]}...")
                results.append(("B3", True, "Hero <img> has loading='eager' AND fetchPriority='high'"))
                found_hero = True
                break
        if not found_hero:
            print("❌ FAIL: No <img> tag found with both loading='eager' AND fetchPriority='high'")
            results.append(("B3", False, "No hero <img> with required attributes"))
    else:
        print(f"❌ FAIL: GET /services/vip-escort-hamburg returned {status}")
        results.append(("B3", False, f"GET returned {status}"))
    
    # B4: EN service page hero <img> has loading="eager" AND fetchPriority="high"
    print("\n[B4] Testing EN service page hero <img> attributes...")
    status, body = curl_get("/en/services/vip-escort-hamburg")
    if status == 200:
        img_matches = re.findall(r'<img[^>]*>', body, re.IGNORECASE)
        found_hero = False
        for img_tag in img_matches[:5]:
            has_eager = 'loading="eager"' in img_tag or "loading='eager'" in img_tag
            has_fetch_priority = 'fetchPriority="high"' in img_tag or 'fetchpriority="high"' in img_tag
            if has_eager and has_fetch_priority:
                print(f"✅ PASS: Hero <img> has loading='eager' AND fetchPriority='high'")
                print(f"   Tag: {img_tag[:100]}...")
                results.append(("B4", True, "Hero <img> has loading='eager' AND fetchPriority='high'"))
                found_hero = True
                break
        if not found_hero:
            print("❌ FAIL: No <img> tag found with both loading='eager' AND fetchPriority='high'")
            results.append(("B4", False, "No hero <img> with required attributes"))
    else:
        print(f"❌ FAIL: GET /en/services/vip-escort-hamburg returned {status}")
        results.append(("B4", False, f"GET returned {status}"))
    
    return results

def test_section_c():
    """SECTION C — Regression checks"""
    print("\n" + "="*80)
    print("SECTION C — Regression checks")
    print("="*80)
    
    results = []
    
    # C1: GET / → <html lang="de">
    print("\n[C1] Testing DE homepage has lang='de'...")
    status, body = curl_get("/")
    if status == 200:
        has_lang_de = '<html lang="de"' in body or "<html lang='de'" in body
        if has_lang_de:
            print("✅ PASS: <html lang='de'> found")
            results.append(("C1", True, "<html lang='de'>"))
        else:
            print("❌ FAIL: <html lang='de'> not found")
            results.append(("C1", False, "<html lang='de'> missing"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("C1", False, f"GET / returned {status}"))
    
    # C2: GET /en → <html lang="en">
    print("\n[C2] Testing EN homepage has lang='en'...")
    status, body = curl_get("/en")
    if status == 200:
        has_lang_en = '<html lang="en"' in body or "<html lang='en'" in body
        if has_lang_en:
            print("✅ PASS: <html lang='en'> found")
            results.append(("C2", True, "<html lang='en'>"))
        else:
            print("❌ FAIL: <html lang='en'> not found")
            results.append(("C2", False, "<html lang='en'> missing"))
    else:
        print(f"❌ FAIL: GET /en returned {status}")
        results.append(("C2", False, f"GET /en returned {status}"))
    
    # C3: GET / → has <link rel="canonical" ...>
    print("\n[C3] Testing DE homepage has canonical link...")
    status, body = curl_get("/")
    if status == 200:
        has_canonical = 'rel="canonical"' in body
        if has_canonical:
            canonical_match = re.search(r'<link[^>]*rel="canonical"[^>]*href="([^"]*)"', body)
            if canonical_match:
                href = canonical_match.group(1)
                print(f"✅ PASS: Canonical link found: {href}")
                results.append(("C3", True, f"Canonical: {href}"))
            else:
                print("✅ PASS: Canonical link found (could not extract href)")
                results.append(("C3", True, "Canonical link present"))
        else:
            print("❌ FAIL: No canonical link found")
            results.append(("C3", False, "No canonical link"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("C3", False, f"GET / returned {status}"))
    
    # C4: GET / → has at least 3 hreflang tags
    print("\n[C4] Testing DE homepage has at least 3 hreflang tags...")
    status, body = curl_get("/")
    if status == 200:
        hreflang_count = len(re.findall(r'hreflang=', body, re.IGNORECASE))
        if hreflang_count >= 3:
            print(f"✅ PASS: Found {hreflang_count} hreflang tags")
            results.append(("C4", True, f"Found {hreflang_count} hreflang tags"))
        else:
            print(f"❌ FAIL: Found only {hreflang_count} hreflang tags (expected ≥3)")
            results.append(("C4", False, f"Only {hreflang_count} hreflang tags"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("C4", False, f"GET / returned {status}"))
    
    # C5: GET /sitemap.xml → 200, contains multiple <loc>
    print("\n[C5] Testing sitemap.xml...")
    status, body = curl_get("/sitemap.xml")
    if status == 200:
        loc_count = len(re.findall(r'<loc>', body, re.IGNORECASE))
        if loc_count > 1:
            print(f"✅ PASS: Sitemap has {loc_count} <loc> entries")
            results.append(("C5", True, f"Sitemap has {loc_count} <loc> entries"))
        else:
            print(f"❌ FAIL: Sitemap has only {loc_count} <loc> entries")
            results.append(("C5", False, f"Only {loc_count} <loc> entries"))
    else:
        print(f"❌ FAIL: GET /sitemap.xml returned {status}")
        results.append(("C5", False, f"GET /sitemap.xml returned {status}"))
    
    # C6: GET /robots.txt → 200, has "Sitemap:", does NOT have "Host:"
    print("\n[C6] Testing robots.txt...")
    status, body = curl_get("/robots.txt")
    if status == 200:
        has_sitemap = "Sitemap:" in body
        has_host = "Host:" in body
        if has_sitemap and not has_host:
            print("✅ PASS: robots.txt has 'Sitemap:' and no 'Host:'")
            results.append(("C6", True, "robots.txt correct"))
        else:
            issues = []
            if not has_sitemap:
                issues.append("missing 'Sitemap:'")
            if has_host:
                issues.append("contains 'Host:' (should not)")
            print(f"❌ FAIL: {', '.join(issues)}")
            results.append(("C6", False, ', '.join(issues)))
    else:
        print(f"❌ FAIL: GET /robots.txt returned {status}")
        results.append(("C6", False, f"GET /robots.txt returned {status}"))
    
    # C7: GET /llms.txt → 200, content-type text/plain
    print("\n[C7] Testing llms.txt...")
    result = subprocess.run(
        ["curl", "-s", "-I", f"{BASE_URL}/llms.txt", "--max-time", "10"],
        capture_output=True,
        text=True,
        timeout=15
    )
    headers = result.stdout
    status_match = re.search(r'HTTP/[\d.]+ (\d+)', headers)
    status = int(status_match.group(1)) if status_match else 0
    content_type_match = re.search(r'content-type:\s*([^\r\n]+)', headers, re.IGNORECASE)
    content_type = content_type_match.group(1).strip() if content_type_match else ""
    
    if status == 200:
        if 'text/plain' in content_type.lower():
            print(f"✅ PASS: llms.txt returns 200 with content-type: {content_type}")
            results.append(("C7", True, f"content-type: {content_type}"))
        else:
            print(f"❌ FAIL: llms.txt has wrong content-type: {content_type}")
            results.append(("C7", False, f"Wrong content-type: {content_type}"))
    else:
        print(f"❌ FAIL: GET /llms.txt returned {status}")
        results.append(("C7", False, f"GET /llms.txt returned {status}"))
    
    # C8: GET /p/diskretion → 301/308 to /p/diskretion-und-datenschutz-noir-hamburg
    print("\n[C8] Testing /p/diskretion redirect...")
    result = subprocess.run(
        ["curl", "-s", "-I", f"{BASE_URL}/p/diskretion", "--max-time", "10"],
        capture_output=True,
        text=True,
        timeout=15
    )
    headers = result.stdout
    status_match = re.search(r'HTTP/[\d.]+ (\d+)', headers)
    status = int(status_match.group(1)) if status_match else 0
    location_match = re.search(r'location:\s*([^\r\n]+)', headers, re.IGNORECASE)
    location = location_match.group(1).strip() if location_match else ""
    
    if status in [301, 308]:
        if 'diskretion-und-datenschutz-noir-hamburg' in location:
            print(f"✅ PASS: Redirects {status} to {location}")
            results.append(("C8", True, f"{status} → {location}"))
        else:
            print(f"❌ FAIL: Redirects to wrong location: {location}")
            results.append(("C8", False, f"Wrong location: {location}"))
    else:
        print(f"❌ FAIL: GET /p/diskretion returned {status} (expected 301/308)")
        results.append(("C8", False, f"Returned {status}, not 301/308"))
    
    # C9: GET /en/p/diskretion-und-datenschutz-noir-hamburg → 308 to /p/... (without /en)
    print("\n[C9] Testing EN privacy page redirect to DE...")
    result = subprocess.run(
        ["curl", "-s", "-I", f"{BASE_URL}/en/p/diskretion-und-datenschutz-noir-hamburg", "--max-time", "10"],
        capture_output=True,
        text=True,
        timeout=15
    )
    headers = result.stdout
    status_match = re.search(r'HTTP/[\d.]+ (\d+)', headers)
    status = int(status_match.group(1)) if status_match else 0
    location_match = re.search(r'location:\s*([^\r\n]+)', headers, re.IGNORECASE)
    location = location_match.group(1).strip() if location_match else ""
    
    if status == 308:
        # Check that location does NOT contain /en prefix
        if '/p/diskretion-und-datenschutz-noir-hamburg' in location and '/en/p/' not in location:
            print(f"✅ PASS: Redirects 308 to DE version: {location}")
            results.append(("C9", True, f"308 → {location} (no /en prefix)"))
        else:
            print(f"❌ FAIL: Redirects to wrong location: {location}")
            results.append(("C9", False, f"Wrong location: {location}"))
    else:
        print(f"❌ FAIL: GET /en/p/diskretion-und-datenschutz-noir-hamburg returned {status} (expected 308)")
        results.append(("C9", False, f"Returned {status}, not 308"))
    
    # C10: GET /blog/diskretion-im-zeitalter-digitaler-spuren-... → title contains "Zeitalter" NOT "Datenschutz"
    print("\n[C10] Testing blog post title uniqueness...")
    status, body = curl_get("/blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen")
    if status == 200:
        title_match = re.search(r'<title>([^<]+)</title>', body, re.IGNORECASE)
        if title_match:
            title = title_match.group(1)
            has_zeitalter = "Zeitalter" in title
            has_datenschutz = "Datenschutz" in title
            if has_zeitalter and not has_datenschutz:
                print(f"✅ PASS: Title contains 'Zeitalter' and NOT 'Datenschutz'")
                print(f"   Title: {title}")
                results.append(("C10", True, f"Title: {title[:60]}..."))
            else:
                issues = []
                if not has_zeitalter:
                    issues.append("missing 'Zeitalter'")
                if has_datenschutz:
                    issues.append("contains 'Datenschutz' (should not)")
                print(f"❌ FAIL: {', '.join(issues)}")
                print(f"   Title: {title}")
                results.append(("C10", False, f"{', '.join(issues)}: {title[:60]}..."))
        else:
            print("❌ FAIL: Could not extract <title> tag")
            results.append(("C10", False, "Could not extract <title>"))
    else:
        print(f"❌ FAIL: GET /blog/diskretion-im-zeitalter... returned {status}")
        results.append(("C10", False, f"GET returned {status}"))
    
    # C11: GET / → <h1> contains "Noir" and "Hamburg"
    print("\n[C11] Testing homepage H1 content...")
    status, body = curl_get("/")
    if status == 200:
        # Match H1 with nested elements (like <em>)
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.IGNORECASE | re.DOTALL)
        if h1_match:
            h1_content = h1_match.group(1)
            # Strip HTML tags to get text content
            h1_text = re.sub(r'<[^>]+>', '', h1_content)
            has_noir = "Noir" in h1_text
            has_hamburg = "Hamburg" in h1_text
            if has_noir and has_hamburg:
                print(f"✅ PASS: H1 contains 'Noir' and 'Hamburg'")
                print(f"   H1: {h1_text.strip()}")
                results.append(("C11", True, f"H1: {h1_text.strip()[:60]}..."))
            else:
                issues = []
                if not has_noir:
                    issues.append("missing 'Noir'")
                if not has_hamburg:
                    issues.append("missing 'Hamburg'")
                print(f"❌ FAIL: {', '.join(issues)}")
                print(f"   H1: {h1_text.strip()}")
                results.append(("C11", False, f"{', '.join(issues)}: {h1_text.strip()[:60]}..."))
        else:
            print("❌ FAIL: Could not extract <h1> tag")
            results.append(("C11", False, "Could not extract <h1>"))
    else:
        print(f"❌ FAIL: GET / returned {status}")
        results.append(("C11", False, f"GET / returned {status}"))
    
    # C12: GET /models → 200
    print("\n[C12] Testing /models page...")
    status, body = curl_get("/models")
    if status == 200:
        print("✅ PASS: /models returns 200")
        results.append(("C12", True, "200 OK"))
    else:
        print(f"❌ FAIL: GET /models returned {status}")
        results.append(("C12", False, f"Returned {status}"))
    
    # C13: GET /services/vip-escort-hamburg → 200
    print("\n[C13] Testing /services/vip-escort-hamburg page...")
    status, body = curl_get("/services/vip-escort-hamburg")
    if status == 200:
        print("✅ PASS: /services/vip-escort-hamburg returns 200")
        results.append(("C13", True, "200 OK"))
    else:
        print(f"❌ FAIL: GET /services/vip-escort-hamburg returned {status}")
        results.append(("C13", False, f"Returned {status}"))
    
    return results

def print_summary(all_results):
    """Print final summary"""
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    
    section_a = [r for r in all_results if r[0].startswith('A')]
    section_b = [r for r in all_results if r[0].startswith('B')]
    section_c = [r for r in all_results if r[0].startswith('C')]
    
    def print_section(name, results):
        passed = sum(1 for r in results if r[1])
        total = len(results)
        print(f"\n{name}: {passed}/{total} passed")
        for test_id, passed, detail in results:
            status = "✅" if passed else "❌"
            print(f"  {status} {test_id}: {detail}")
    
    print_section("SECTION A — next/font migration", section_a)
    print_section("SECTION B — Service page hero preload", section_b)
    print_section("SECTION C — Regression checks", section_c)
    
    total_passed = sum(1 for r in all_results if r[1])
    total_tests = len(all_results)
    print(f"\n{'='*80}")
    print(f"OVERALL: {total_passed}/{total_tests} tests passed")
    print(f"{'='*80}\n")
    
    return total_passed == total_tests

if __name__ == "__main__":
    print("="*80)
    print("FINAL PERFORMANCE SPRINT VERIFICATION")
    print("Target: http://localhost:3000")
    print("="*80)
    
    all_results = []
    
    # Run all test sections
    all_results.extend(test_section_a())
    all_results.extend(test_section_b())
    all_results.extend(test_section_c())
    
    # Print summary
    all_passed = print_summary(all_results)
    
    sys.exit(0 if all_passed else 1)
