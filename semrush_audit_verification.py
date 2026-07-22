#!/usr/bin/env python3
"""
SEMrush Audit Fixes Verification Script
Tests PRODUCTION at https://noir-hamburg.com

Fix 1: /logo.png added (was 404, referenced by Organization JSON-LD)
Fix 2: Footer + Contact form emit direct URLs (/p/...) instead of /en/p/... for pages without EN translation
"""

import requests
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Production base URL
BASE_URL = "https://noir-hamburg.com"

# SEMrushBot User-Agent for realism
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SEMrushBot/7~bl; +http://www.semrush.com/bot.html)"
}

def get_page(url, follow_redirects=True):
    """Fetch a page with SEMrushBot UA"""
    try:
        response = requests.get(url, headers=HEADERS, allow_redirects=follow_redirects, timeout=15)
        return response
    except Exception as e:
        print(f"ERROR fetching {url}: {e}")
        return None

def extract_json_ld(html, type_filter=None):
    """Extract JSON-LD blocks from HTML, optionally filter by @type"""
    soup = BeautifulSoup(html, 'html.parser')
    scripts = soup.find_all('script', type='application/ld+json')
    blocks = []
    for script in scripts:
        try:
            data = json.loads(script.string)
            if type_filter:
                if isinstance(data, dict) and data.get('@type') == type_filter:
                    blocks.append(data)
            else:
                blocks.append(data)
        except:
            pass
    return blocks

def extract_footer_legal_links(html):
    """Extract footer legal/info links (Impressum, Datenschutz, etc.)"""
    soup = BeautifulSoup(html, 'html.parser')
    # Look for footer section containing "Impressum" or "Imprint"
    footer = soup.find('footer')
    if not footer:
        return []
    
    # Find all links in footer
    links = []
    for a in footer.find_all('a', href=True):
        href = a['href']
        text = a.get_text(strip=True)
        # Look for legal/info page links (typically /p/... or /en/p/...)
        if '/p/' in href:
            links.append({'href': href, 'text': text})
    
    return links

def extract_contact_form_consent_link(html):
    """Extract the consent checkbox link from ContactForm"""
    soup = BeautifulSoup(html, 'html.parser')
    # Look for checkbox with consent-related text, then find nearby link
    # The consent link is typically near text like "Datenschutz" or "Privacy" or "Diskretionserklärung"
    
    # Find all links that might be the privacy/consent link
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True).lower()
        if 'datenschutz' in text or 'privacy' in text or 'policy' in text or 'diskretion' in text:
            # Check if this is in a form context (has nearby input or checkbox)
            parent = a.find_parent(['form', 'div', 'label'])
            if parent:
                # Look for checkbox nearby
                if parent.find('input', type='checkbox') or 'consent' in str(parent).lower():
                    return a['href']
    
    return None

def extract_contact_sidebar_privacy_link(html):
    """Extract the sidebar 'Datenschutz →' or 'Privacy →' or 'Diskretionserklärung →' or 'Discretion policy →' link from ContactBody"""
    soup = BeautifulSoup(html, 'html.parser')
    # Look for links with arrow and privacy-related text
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        if ('datenschutz' in text.lower() or 'privacy' in text.lower() or 'diskretion' in text.lower() or 'discretion' in text.lower()) and '→' in text:
            return a['href']
    
    return None

def count_sitemap_locs(xml_content):
    """Count <loc> entries in sitemap"""
    return len(re.findall(r'<loc>', xml_content))

# Test results
results = []
pass_count = 0
fail_count = 0

print("=" * 80)
print("SEMrush Audit Fixes Verification — PRODUCTION")
print(f"Base URL: {BASE_URL}")
print("=" * 80)
print()

# CHECK 1: /logo.png exists and returns image/png
print("CHECK #1 — /logo.png exists (Fix 1)")
try:
    resp = get_page(f"{BASE_URL}/logo.png")
    if resp and resp.status_code == 200:
        content_type = resp.headers.get('Content-Type', '')
        size = len(resp.content)
        if 'image/png' in content_type and size >= 5000:
            print(f"  ✅ PASS")
            print(f"  Evidence: HTTP {resp.status_code}, Content-Type: {content_type}, Size: {size} bytes")
            results.append(("CHECK #1", "PASS", f"HTTP {resp.status_code}, {content_type}, {size} bytes"))
            pass_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: HTTP {resp.status_code}, Content-Type: {content_type}, Size: {size} bytes")
            results.append(("CHECK #1", "FAIL", f"Wrong content-type or size: {content_type}, {size} bytes"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #1", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #1", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 2: DE homepage Organization JSON-LD has logo field
print("CHECK #2 — DE homepage (/) Organization JSON-LD logo field")
try:
    resp = get_page(f"{BASE_URL}/")
    if resp and resp.status_code == 200:
        orgs = extract_json_ld(resp.text, 'Organization')
        if orgs and len(orgs) > 0:
            logo = orgs[0].get('logo', '')
            if logo == f"{BASE_URL}/logo.png":
                print(f"  ✅ PASS")
                print(f"  Evidence: logo = \"{logo}\"")
                results.append(("CHECK #2", "PASS", f"logo = \"{logo}\""))
                pass_count += 1
            else:
                print(f"  ❌ FAIL")
                print(f"  Evidence: logo = \"{logo}\" (expected \"{BASE_URL}/logo.png\")")
                results.append(("CHECK #2", "FAIL", f"logo = \"{logo}\""))
                fail_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: No Organization JSON-LD found")
            results.append(("CHECK #2", "FAIL", "No Organization JSON-LD found"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #2", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #2", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 3: EN homepage Organization JSON-LD has logo field
print("CHECK #3 — EN homepage (/en) Organization JSON-LD logo field")
try:
    resp = get_page(f"{BASE_URL}/en")
    if resp and resp.status_code == 200:
        orgs = extract_json_ld(resp.text, 'Organization')
        if orgs and len(orgs) > 0:
            logo = orgs[0].get('logo', '')
            if logo == f"{BASE_URL}/logo.png":
                print(f"  ✅ PASS")
                print(f"  Evidence: logo = \"{logo}\"")
                results.append(("CHECK #3", "PASS", f"logo = \"{logo}\""))
                pass_count += 1
            else:
                print(f"  ❌ FAIL")
                print(f"  Evidence: logo = \"{logo}\" (expected \"{BASE_URL}/logo.png\")")
                results.append(("CHECK #3", "FAIL", f"logo = \"{logo}\""))
                fail_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: No Organization JSON-LD found")
            results.append(("CHECK #3", "FAIL", "No Organization JSON-LD found"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #3", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #3", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 4: DE homepage footer legal links use /p/... (not /en/p/...)
print("CHECK #4 — DE homepage (/) footer legal links use /p/... (Fix 2)")
try:
    resp = get_page(f"{BASE_URL}/")
    if resp and resp.status_code == 200:
        links = extract_footer_legal_links(resp.text)
        # Filter for the 3 legal pages
        legal_links = [l for l in links if '/p/' in l['href']]
        
        # Check that all use /p/... and NOT /en/p/...
        bad_links = [l for l in legal_links if l['href'].startswith('/en/p/')]
        
        if len(legal_links) >= 3 and len(bad_links) == 0:
            print(f"  ✅ PASS")
            print(f"  Evidence: Found {len(legal_links)} legal links, all use /p/... format")
            for l in legal_links[:3]:
                print(f"    - {l['text']}: {l['href']}")
            results.append(("CHECK #4", "PASS", f"{len(legal_links)} legal links, all /p/..."))
            pass_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Found {len(legal_links)} legal links, {len(bad_links)} use /en/p/...")
            for l in bad_links:
                print(f"    - BAD: {l['text']}: {l['href']}")
            results.append(("CHECK #4", "FAIL", f"{len(bad_links)} links use /en/p/..."))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #4", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #4", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 5: EN homepage footer legal links use /p/... (since no EN copy in CMS)
print("CHECK #5 — EN homepage (/en) footer legal links use /p/... (Fix 2)")
try:
    resp = get_page(f"{BASE_URL}/en")
    if resp and resp.status_code == 200:
        links = extract_footer_legal_links(resp.text)
        legal_links = [l for l in links if '/p/' in l['href']]
        
        # Check that all use /p/... and NOT /en/p/... (since production has no EN copy)
        bad_links = [l for l in legal_links if l['href'].startswith('/en/p/')]
        
        if len(legal_links) >= 3 and len(bad_links) == 0:
            print(f"  ✅ PASS")
            print(f"  Evidence: Found {len(legal_links)} legal links, all use /p/... format (correct for pages without EN copy)")
            for l in legal_links[:3]:
                print(f"    - {l['text']}: {l['href']}")
            results.append(("CHECK #5", "PASS", f"{len(legal_links)} legal links, all /p/..."))
            pass_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Found {len(legal_links)} legal links, {len(bad_links)} use /en/p/...")
            for l in bad_links:
                print(f"    - BAD: {l['text']}: {l['href']}")
            results.append(("CHECK #5", "FAIL", f"{len(bad_links)} links use /en/p/..."))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #5", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #5", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 6: DE contact page consent link uses /p/...
print("CHECK #6 — DE contact (/kontakt) consent link uses /p/... (Fix 2)")
try:
    resp = get_page(f"{BASE_URL}/kontakt")
    if resp and resp.status_code == 200:
        consent_link = extract_contact_form_consent_link(resp.text)
        
        if consent_link and consent_link.startswith('/p/diskretion'):
            print(f"  ✅ PASS")
            print(f"  Evidence: Consent link = \"{consent_link}\"")
            results.append(("CHECK #6", "PASS", f"Consent link = \"{consent_link}\""))
            pass_count += 1
        elif consent_link:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Consent link = \"{consent_link}\" (expected /p/diskretion...)")
            results.append(("CHECK #6", "FAIL", f"Consent link = \"{consent_link}\""))
            fail_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: No consent link found")
            results.append(("CHECK #6", "FAIL", "No consent link found"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #6", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #6", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 7: EN contact page consent link uses /p/...
print("CHECK #7 — EN contact (/en/contact) consent link uses /p/... (Fix 2)")
try:
    resp = get_page(f"{BASE_URL}/en/contact")
    if resp and resp.status_code == 200:
        consent_link = extract_contact_form_consent_link(resp.text)
        
        if consent_link and consent_link.startswith('/p/diskretion'):
            print(f"  ✅ PASS")
            print(f"  Evidence: Consent link = \"{consent_link}\"")
            results.append(("CHECK #7", "PASS", f"Consent link = \"{consent_link}\""))
            pass_count += 1
        elif consent_link:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Consent link = \"{consent_link}\" (expected /p/diskretion...)")
            results.append(("CHECK #7", "FAIL", f"Consent link = \"{consent_link}\""))
            fail_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: No consent link found")
            results.append(("CHECK #7", "FAIL", "No consent link found"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #7", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #7", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 8: DE contact sidebar privacy link uses /p/...
print("CHECK #8 — DE contact (/kontakt) sidebar privacy link uses /p/... (Fix 2)")
try:
    resp = get_page(f"{BASE_URL}/kontakt")
    if resp and resp.status_code == 200:
        sidebar_link = extract_contact_sidebar_privacy_link(resp.text)
        
        if sidebar_link and sidebar_link.startswith('/p/diskretion'):
            print(f"  ✅ PASS")
            print(f"  Evidence: Sidebar link = \"{sidebar_link}\"")
            results.append(("CHECK #8", "PASS", f"Sidebar link = \"{sidebar_link}\""))
            pass_count += 1
        elif sidebar_link:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Sidebar link = \"{sidebar_link}\" (expected /p/diskretion...)")
            results.append(("CHECK #8", "FAIL", f"Sidebar link = \"{sidebar_link}\""))
            fail_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: No sidebar privacy link found")
            results.append(("CHECK #8", "FAIL", "No sidebar privacy link found"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #8", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #8", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 9: EN contact sidebar privacy link uses /p/...
print("CHECK #9 — EN contact (/en/contact) sidebar privacy link uses /p/... (Fix 2)")
try:
    resp = get_page(f"{BASE_URL}/en/contact")
    if resp and resp.status_code == 200:
        sidebar_link = extract_contact_sidebar_privacy_link(resp.text)
        
        if sidebar_link and sidebar_link.startswith('/p/diskretion'):
            print(f"  ✅ PASS")
            print(f"  Evidence: Sidebar link = \"{sidebar_link}\"")
            results.append(("CHECK #9", "PASS", f"Sidebar link = \"{sidebar_link}\""))
            pass_count += 1
        elif sidebar_link:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Sidebar link = \"{sidebar_link}\" (expected /p/diskretion...)")
            results.append(("CHECK #9", "FAIL", f"Sidebar link = \"{sidebar_link}\""))
            fail_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: No sidebar privacy link found")
            results.append(("CHECK #9", "FAIL", "No sidebar privacy link found"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #9", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #9", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 10: Regression - all URLs return 200
print("CHECK #10 — Regression: all production URLs return 200")
regression_urls = [
    "/",
    "/en",
    "/kontakt",
    "/en/contact",
    "/services/business-escort-hamburg",
    "/services/luxury-escort-hamburg",
    "/p/diskretion-und-datenschutz-noir-hamburg",
    "/p/professionelle-standards-noir-hamburg",
    "/p/so-funktioniert-eine-buchung-noir-hamburg"
]

try:
    all_ok = True
    failed_urls = []
    for path in regression_urls:
        resp = get_page(f"{BASE_URL}{path}")
        if not resp or resp.status_code != 200:
            all_ok = False
            status = resp.status_code if resp else "No response"
            failed_urls.append(f"{path} ({status})")
    
    if all_ok:
        print(f"  ✅ PASS")
        print(f"  Evidence: All {len(regression_urls)} URLs return HTTP 200")
        results.append(("CHECK #10", "PASS", f"All {len(regression_urls)} URLs return 200"))
        pass_count += 1
    else:
        print(f"  ❌ FAIL")
        print(f"  Evidence: {len(failed_urls)} URLs failed:")
        for url in failed_urls:
            print(f"    - {url}")
        results.append(("CHECK #10", "FAIL", f"{len(failed_urls)} URLs failed"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #10", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 11: Hreflang and canonical unchanged on /
print("CHECK #11 — Hreflang and canonical unchanged on /")
try:
    resp = get_page(f"{BASE_URL}/")
    if resp and resp.status_code == 200:
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Check canonical
        canonical = soup.find('link', rel='canonical')
        canonical_href = canonical['href'] if canonical else None
        
        # Check hreflang
        hreflangs = soup.find_all('link', rel='alternate', hreflang=True)
        hreflang_count = len(hreflangs)
        
        if canonical_href and hreflang_count >= 2:
            print(f"  ✅ PASS")
            print(f"  Evidence: Canonical = \"{canonical_href}\", {hreflang_count} hreflang alternates")
            results.append(("CHECK #11", "PASS", f"Canonical + {hreflang_count} hreflang alternates"))
            pass_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Canonical = \"{canonical_href}\", {hreflang_count} hreflang alternates")
            results.append(("CHECK #11", "FAIL", f"Missing canonical or hreflang"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #11", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #11", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# CHECK 12: Sitemap contains ≥100 <loc> entries
print("CHECK #12 — Sitemap contains ≥100 <loc> entries")
try:
    resp = get_page(f"{BASE_URL}/sitemap.xml")
    if resp and resp.status_code == 200:
        loc_count = count_sitemap_locs(resp.text)
        
        if loc_count >= 100:
            print(f"  ✅ PASS")
            print(f"  Evidence: {loc_count} <loc> entries in sitemap")
            results.append(("CHECK #12", "PASS", f"{loc_count} <loc> entries"))
            pass_count += 1
        else:
            print(f"  ❌ FAIL")
            print(f"  Evidence: Only {loc_count} <loc> entries (expected ≥100)")
            results.append(("CHECK #12", "FAIL", f"Only {loc_count} <loc> entries"))
            fail_count += 1
    else:
        status = resp.status_code if resp else "No response"
        print(f"  ❌ FAIL")
        print(f"  Evidence: HTTP {status}")
        results.append(("CHECK #12", "FAIL", f"HTTP {status}"))
        fail_count += 1
except Exception as e:
    print(f"  ❌ FAIL")
    print(f"  Evidence: Exception: {e}")
    results.append(("CHECK #12", "FAIL", f"Exception: {e}"))
    fail_count += 1
print()

# Summary
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print()

for check_name, status, evidence in results:
    print(f"{check_name} — [{status}]")
    print(f"  Evidence: {evidence}")
    print()

print(f"PASS: {pass_count}/12")
if fail_count > 0:
    print(f"FAIL: {fail_count}/12")
    failing_checks = [r[0] for r in results if r[1] == "FAIL"]
    print(f"  Failing checks: {', '.join(failing_checks)}")

print()
if pass_count == 12:
    print("Overall: ✅ PASS — All 12 checks passed")
else:
    print(f"Overall: ❌ FAIL — {fail_count} checks failed")

print("=" * 80)
