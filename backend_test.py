#!/usr/bin/env python3
"""
Phase 3 d3 — Public Area Detail SSR Routes Testing
Tests /escort/[slug] and /en/escort/[slug] for SSR + SEO compliance.
"""
import os
import sys
import json
import re
from urllib.parse import urlparse
import subprocess

BASE_URL = os.getenv('NEXT_PUBLIC_SITE_URL', 'https://noir-migration.preview.emergentagent.com')

def curl_get(path):
    """Execute curl and return (status_code, body_text)"""
    url = f"{BASE_URL}{path}"
    result = subprocess.run(
        ['curl', '-s', '-w', '\n__STATUS_CODE__:%{http_code}', url],
        capture_output=True,
        text=True,
        timeout=30
    )
    output = result.stdout
    if '__STATUS_CODE__:' in output:
        body, status_line = output.rsplit('__STATUS_CODE__:', 1)
        status = int(status_line.strip())
        return status, body
    return 0, output

def count_occurrences(html, pattern):
    """Count regex matches in html"""
    return len(re.findall(pattern, html, re.IGNORECASE | re.DOTALL))

def extract_json_ld_blocks(html):
    """Extract all JSON-LD script blocks from body"""
    # Find body content
    body_match = re.search(r'</head>(.*)', html, re.DOTALL | re.IGNORECASE)
    if not body_match:
        return []
    body = body_match.group(1)
    
    # Find all script type="application/ld+json" blocks
    pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
    matches = re.findall(pattern, body, re.DOTALL | re.IGNORECASE)
    
    blocks = []
    for match in matches:
        try:
            data = json.loads(match.strip())
            blocks.append(data)
        except:
            pass
    return blocks

def strip_tags_and_scripts(html):
    """Remove script tags and HTML tags, return visible text"""
    # Remove script and style tags with their content
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    return text

def test_de_detail_hafencity():
    """Test DE detail — GET /escort/hafencity"""
    print("\n" + "="*80)
    print("TEST 1: DE DETAIL — GET /escort/hafencity")
    print("="*80)
    
    status, html = curl_get('/escort/hafencity')
    
    # 1. 200 status
    assert status == 200, f"Expected 200, got {status}"
    print("✅ Status 200")
    
    # 2. Exactly one <html lang="de">
    html_lang_count = count_occurrences(html, r'<html[^>]*lang=["\']de["\']')
    assert html_lang_count == 1, f"Expected 1 <html lang='de'>, found {html_lang_count}"
    print("✅ Exactly one <html lang='de'>")
    
    # 3. Title check
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    assert title_match, "No <title> tag found"
    title = title_match.group(1).strip()
    expected_title = "Escort HafenCity — Premium Begleitung in HafenCity | Noir Hamburg"
    assert title == expected_title, f"Title mismatch. Expected: '{expected_title}', Got: '{title}'"
    print(f"✅ Title correct: {title}")
    
    # 4. Exactly one meta description, non-empty, contains HafenCity and Noir Hamburg
    meta_desc_pattern = r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']'
    meta_desc_matches = re.findall(meta_desc_pattern, html, re.IGNORECASE)
    assert len(meta_desc_matches) == 1, f"Expected 1 meta description, found {len(meta_desc_matches)}"
    meta_desc = meta_desc_matches[0]
    assert len(meta_desc) > 0, "Meta description is empty"
    assert 'HafenCity' in meta_desc, f"Meta description missing 'HafenCity': {meta_desc}"
    assert 'Noir Hamburg' in meta_desc, f"Meta description missing 'Noir Hamburg': {meta_desc}"
    print(f"✅ Meta description valid: {meta_desc[:80]}...")
    
    # 5. Exactly one canonical link
    canonical_pattern = r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']'
    canonical_matches = re.findall(canonical_pattern, html, re.IGNORECASE)
    assert len(canonical_matches) == 1, f"Expected 1 canonical link, found {len(canonical_matches)}"
    canonical = canonical_matches[0]
    assert canonical.endswith('/escort/hafencity'), f"Canonical should end with /escort/hafencity, got: {canonical}"
    print(f"✅ Canonical correct: {canonical}")
    
    # 6. Three hreflang alternates (de-DE, en, x-default)
    hreflang_pattern = r'<link[^>]*rel=["\']alternate["\'][^>]*hreflang=["\']([^"\']+)["\']'
    hreflang_matches = re.findall(hreflang_pattern, html, re.IGNORECASE)
    assert len(hreflang_matches) == 3, f"Expected 3 hreflang alternates, found {len(hreflang_matches)}"
    hreflang_set = set([h.lower() for h in hreflang_matches])
    assert 'de-de' in hreflang_set, f"Missing de-DE hreflang. Found: {hreflang_matches}"
    assert 'en' in hreflang_set, f"Missing en hreflang. Found: {hreflang_matches}"
    assert 'x-default' in hreflang_set, f"Missing x-default hreflang. Found: {hreflang_matches}"
    print(f"✅ Three hreflang alternates present: {hreflang_matches}")
    
    # 7. Exactly 3 JSON-LD blocks in body (Place, BreadcrumbList, FAQPage)
    json_ld_blocks = extract_json_ld_blocks(html)
    assert len(json_ld_blocks) == 3, f"Expected 3 JSON-LD blocks in body, found {len(json_ld_blocks)}"
    print(f"✅ Exactly 3 JSON-LD blocks in body")
    
    # Check types
    types = [block.get('@type') for block in json_ld_blocks]
    assert 'Place' in types, f"Missing Place JSON-LD. Found types: {types}"
    assert 'BreadcrumbList' in types, f"Missing BreadcrumbList JSON-LD. Found types: {types}"
    assert 'FAQPage' in types, f"Missing FAQPage JSON-LD. Found types: {types}"
    print(f"✅ JSON-LD types correct: {types}")
    
    # Check Place has address with addressLocality=HafenCity
    place_block = next((b for b in json_ld_blocks if b.get('@type') == 'Place'), None)
    assert place_block, "Place JSON-LD not found"
    address = place_block.get('address', {})
    assert address.get('addressLocality') == 'HafenCity', f"Place addressLocality should be 'HafenCity', got: {address.get('addressLocality')}"
    assert address.get('addressCountry') == 'DE', f"Place addressCountry should be 'DE', got: {address.get('addressCountry')}"
    print(f"✅ Place JSON-LD has correct address: {address}")
    
    # Check FAQPage has mainEntity with at least 1 Question
    faq_block = next((b for b in json_ld_blocks if b.get('@type') == 'FAQPage'), None)
    assert faq_block, "FAQPage JSON-LD not found"
    main_entity = faq_block.get('mainEntity', [])
    assert len(main_entity) >= 1, f"FAQPage should have at least 1 Question, found {len(main_entity)}"
    print(f"✅ FAQPage has {len(main_entity)} questions")
    
    # 8. Body contains H1 "Escort HafenCity"
    h1_pattern = r'<h1[^>]*>(.*?)</h1>'
    h1_matches = re.findall(h1_pattern, html, re.IGNORECASE | re.DOTALL)
    h1_text = ' '.join([re.sub(r'<[^>]+>', '', h).strip() for h in h1_matches])
    assert 'Escort HafenCity' in h1_text, f"H1 should contain 'Escort HafenCity', got: {h1_text}"
    print(f"✅ H1 contains 'Escort HafenCity': {h1_text}")
    
    # 9. Body contains "Begleitung in HafenCity" (h2) and DE intro
    assert 'Begleitung in HafenCity' in html, "Missing 'Begleitung in HafenCity' heading"
    assert 'Hamburgs modernes Aushängeschild' in html, "Missing DE intro text 'Hamburgs modernes Aushängeschild'"
    print("✅ DE headings and intro text present")
    
    # 10. Landmarks block renders 4 chips
    landmarks = ['Elbphilharmonie', 'Magellan-Terrassen', 'The Fontenay (nahe)', 'Speicherstadt']
    for lm in landmarks:
        assert lm in html, f"Missing landmark: {lm}"
    print(f"✅ All 4 landmarks present: {landmarks}")
    
    # 11. FAQ block renders 3 items (data-testid=area-faq-0/1/2)
    faq_0 = count_occurrences(html, r'data-testid=["\']area-faq-0["\']')
    faq_1 = count_occurrences(html, r'data-testid=["\']area-faq-1["\']')
    faq_2 = count_occurrences(html, r'data-testid=["\']area-faq-2["\']')
    assert faq_0 == 1, f"Expected 1 area-faq-0, found {faq_0}"
    assert faq_1 == 1, f"Expected 1 area-faq-1, found {faq_1}"
    assert faq_2 == 1, f"Expected 1 area-faq-2, found {faq_2}"
    print("✅ FAQ block renders 3 items (data-testid=area-faq-0/1/2)")
    
    # 12. Popular-services sidebar renders 5 service links, each href starts with /services/
    service_links = re.findall(r'href=["\'](/services/[^"\']+)["\']', html)
    assert len(service_links) >= 5, f"Expected at least 5 service links, found {len(service_links)}"
    print(f"✅ Popular-services sidebar has {len(service_links)} service links")
    
    # 13. Nearby-districts block renders exactly 6 chips, each href starts with /escort/ and slug is NOT hafencity
    escort_links = re.findall(r'href=["\'](/escort/([^"\']+))["\']', html)
    nearby_links = [link for link in escort_links if link[1] != 'hafencity']
    assert len(nearby_links) >= 6, f"Expected at least 6 nearby district links (excluding hafencity), found {len(nearby_links)}"
    print(f"✅ Nearby-districts block has {len(nearby_links)} links (excluding hafencity)")
    
    # 14. Contact CTA button label starts with "In HafenCity anfragen"
    cta_pattern = r'data-testid=["\']area-contact-btn["\'][^>]*>([^<]+)'
    cta_matches = re.findall(cta_pattern, html, re.IGNORECASE | re.DOTALL)
    assert len(cta_matches) >= 1, "Contact CTA button not found"
    cta_text = cta_matches[0].strip()
    assert cta_text.startswith('In HafenCity anfragen'), f"CTA should start with 'In HafenCity anfragen', got: {cta_text}"
    print(f"✅ Contact CTA correct: {cta_text}")
    
    # 15. "Models in HafenCity" section renders exactly 6 model cards
    model_cards = re.findall(r'data-testid=["\']area-model-([^"\']+)["\']', html)
    assert len(model_cards) == 6, f"Expected 6 model cards, found {len(model_cards)}"
    # Each href starts with /models/
    for card_slug in model_cards:
        model_link_pattern = f'href=["\'](/models/{re.escape(card_slug)})["\']'
        assert re.search(model_link_pattern, html), f"Model card {card_slug} missing /models/ link"
    print(f"✅ Models section has 6 model cards: {model_cards}")
    
    print("\n✅ TEST 1 PASSED: DE detail /escort/hafencity")
    return True

def test_en_detail_hafencity():
    """Test EN detail — GET /en/escort/hafencity"""
    print("\n" + "="*80)
    print("TEST 2: EN DETAIL — GET /en/escort/hafencity")
    print("="*80)
    
    status, html = curl_get('/en/escort/hafencity')
    
    # 1. 200, html lang=en
    assert status == 200, f"Expected 200, got {status}"
    html_lang_count = count_occurrences(html, r'<html[^>]*lang=["\']en["\']')
    assert html_lang_count == 1, f"Expected 1 <html lang='en'>, found {html_lang_count}"
    print("✅ Status 200, <html lang='en'>")
    
    # 2. Title
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    assert title_match, "No <title> tag found"
    title = title_match.group(1).strip()
    expected_title = "Escort HafenCity — Premium Companionship in HafenCity | Noir Hamburg"
    assert title == expected_title, f"Title mismatch. Expected: '{expected_title}', Got: '{title}'"
    print(f"✅ Title correct: {title}")
    
    # 3. Canonical
    canonical_pattern = r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']'
    canonical_matches = re.findall(canonical_pattern, html, re.IGNORECASE)
    assert len(canonical_matches) == 1, f"Expected 1 canonical link, found {len(canonical_matches)}"
    canonical = canonical_matches[0]
    assert canonical.endswith('/en/escort/hafencity'), f"Canonical should end with /en/escort/hafencity, got: {canonical}"
    print(f"✅ Canonical correct: {canonical}")
    
    # 4. hreflang alternates present
    hreflang_pattern = r'<link[^>]*rel=["\']alternate["\'][^>]*hreflang=["\']([^"\']+)["\']'
    hreflang_matches = re.findall(hreflang_pattern, html, re.IGNORECASE)
    assert len(hreflang_matches) == 3, f"Expected 3 hreflang alternates, found {len(hreflang_matches)}"
    print(f"✅ Three hreflang alternates present")
    
    # 5. 3 JSON-LD blocks (Place + BreadcrumbList + FAQPage)
    json_ld_blocks = extract_json_ld_blocks(html)
    assert len(json_ld_blocks) == 3, f"Expected 3 JSON-LD blocks in body, found {len(json_ld_blocks)}"
    types = [block.get('@type') for block in json_ld_blocks]
    assert 'Place' in types, f"Missing Place JSON-LD. Found types: {types}"
    assert 'BreadcrumbList' in types, f"Missing BreadcrumbList JSON-LD. Found types: {types}"
    assert 'FAQPage' in types, f"Missing FAQPage JSON-LD. Found types: {types}"
    print(f"✅ 3 JSON-LD blocks with correct types: {types}")
    
    # Place still has addressLocality=HafenCity
    place_block = next((b for b in json_ld_blocks if b.get('@type') == 'Place'), None)
    address = place_block.get('address', {})
    assert address.get('addressLocality') == 'HafenCity', f"Place addressLocality should be 'HafenCity', got: {address.get('addressLocality')}"
    print(f"✅ Place JSON-LD has addressLocality='HafenCity'")
    
    # 6. "Companionship in HafenCity" h2 heading present
    assert 'Companionship in HafenCity' in html, "Missing 'Companionship in HafenCity' heading"
    print("✅ 'Companionship in HafenCity' heading present")
    
    # 7. EN intro present
    assert "Hamburg's modern landmark — architecture, water, culture." in html or "Hamburg's modern landmark" in html, "Missing EN intro text"
    print("✅ EN intro text present")
    
    # 8. body_extra_en text appears (NOT German body_extra in visible content)
    assert 'HafenCity is Hamburg' in html or "HafenCity is Hamburg's newest showcase" in html, "Missing EN body_extra text"
    # Should NOT have German body_extra in visible content (excluding script tags with hydration data)
    visible_text = strip_tags_and_scripts(html)
    assert 'Die HafenCity ist Hamburgs jüngstes Aushängeschild' not in visible_text, "German body_extra leaked into EN page visible content"
    print("✅ body_extra_en present, German body_extra not leaked in visible content")
    
    # 9. Contact CTA label starts with "Enquire in HafenCity"
    cta_pattern = r'data-testid=["\']area-contact-btn["\'][^>]*>([^<]+)'
    cta_matches = re.findall(cta_pattern, html, re.IGNORECASE | re.DOTALL)
    assert len(cta_matches) >= 1, "Contact CTA button not found"
    cta_text = cta_matches[0].strip()
    assert cta_text.startswith('Enquire in HafenCity'), f"CTA should start with 'Enquire in HafenCity', got: {cta_text}"
    print(f"✅ Contact CTA correct: {cta_text}")
    
    # 10. Popular-services sidebar links use /en/services/ prefix
    service_links = re.findall(r'href=["\'](/en/services/[^"\']+)["\']', html)
    assert len(service_links) >= 5, f"Expected at least 5 /en/services/ links, found {len(service_links)}"
    print(f"✅ Popular-services sidebar has {len(service_links)} /en/services/ links")
    
    # 11. Nearby-districts chips use /en/escort/ prefix
    escort_links = re.findall(r'href=["\'](/en/escort/[^"\']+)["\']', html)
    assert len(escort_links) >= 6, f"Expected at least 6 /en/escort/ links, found {len(escort_links)}"
    print(f"✅ Nearby-districts has {len(escort_links)} /en/escort/ links")
    
    # 12. Model cards use /en/models/ prefix
    model_links = re.findall(r'href=["\'](/en/models/[^"\']+)["\']', html)
    assert len(model_links) >= 6, f"Expected at least 6 /en/models/ links, found {len(model_links)}"
    print(f"✅ Model cards use /en/models/ prefix ({len(model_links)} links)")
    
    # 13. Zero German UI-string leaks
    visible_text = strip_tags_and_scripts(html)
    german_strings = [
        'Startseite', 'Über uns', 'Häufige Fragen', 'Kategorien', 
        'Termin', 'Sprache wechseln', 'Bekannte Adressen', 
        'Beliebte Services', 'Weitere Stadtteile', 
        'Begleitung in HafenCity', 'In HafenCity anfragen'
    ]
    leaked = []
    for gs in german_strings:
        if gs in visible_text:
            leaked.append(gs)
    
    # It's OK for German landmark proper-nouns and email to appear
    # Filter out acceptable German words
    acceptable = ['Magellan-Terrassen', 'Speicherstadt', 'The Fontenay (nahe)', 'kontakt@noir-hamburg.de']
    
    assert len(leaked) == 0, f"German UI strings leaked: {leaked}"
    print("✅ Zero German UI-string leaks (excluding landmarks and email)")
    
    print("\n✅ TEST 2 PASSED: EN detail /en/escort/hafencity")
    return True

def test_404_handling():
    """Test 404 handling"""
    print("\n" + "="*80)
    print("TEST 3: 404 HANDLING")
    print("="*80)
    
    # DE 404
    status, _ = curl_get('/escort/does-not-exist')
    assert status == 404, f"Expected 404 for /escort/does-not-exist, got {status}"
    print("✅ GET /escort/does-not-exist → 404")
    
    # EN 404
    status, _ = curl_get('/en/escort/does-not-exist')
    assert status == 404, f"Expected 404 for /en/escort/does-not-exist, got {status}"
    print("✅ GET /en/escort/does-not-exist → 404")
    
    print("\n✅ TEST 3 PASSED: 404 handling")
    return True

def test_secondary_sanity():
    """Test secondary sanity — GET /escort/blankenese and GET /en/escort/blankenese"""
    print("\n" + "="*80)
    print("TEST 4: SECONDARY SANITY — blankenese")
    print("="*80)
    
    # DE blankenese
    status, html = curl_get('/escort/blankenese')
    assert status == 200, f"Expected 200 for /escort/blankenese, got {status}"
    html_lang_count = count_occurrences(html, r'<html[^>]*lang=["\']de["\']')
    assert html_lang_count == 1, f"Expected 1 <html lang='de'>, found {html_lang_count}"
    
    # Check canonical
    canonical_pattern = r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']'
    canonical_matches = re.findall(canonical_pattern, html, re.IGNORECASE)
    assert len(canonical_matches) == 1, f"Expected 1 canonical link, found {len(canonical_matches)}"
    
    # Check hreflang
    hreflang_pattern = r'<link[^>]*rel=["\']alternate["\'][^>]*hreflang=["\']([^"\']+)["\']'
    hreflang_matches = re.findall(hreflang_pattern, html, re.IGNORECASE)
    assert len(hreflang_matches) == 3, f"Expected 3 hreflang alternates, found {len(hreflang_matches)}"
    
    # Check JSON-LD
    json_ld_blocks = extract_json_ld_blocks(html)
    assert len(json_ld_blocks) == 3, f"Expected 3 JSON-LD blocks, found {len(json_ld_blocks)}"
    
    # Check H1
    h1_pattern = r'<h1[^>]*>(.*?)</h1>'
    h1_matches = re.findall(h1_pattern, html, re.IGNORECASE | re.DOTALL)
    assert len(h1_matches) >= 1, "No H1 found"
    
    print("✅ GET /escort/blankenese → 200, html lang=de, canonical + hreflang + 3 JSON-LD + H1")
    
    # EN blankenese
    status, html = curl_get('/en/escort/blankenese')
    assert status == 200, f"Expected 200 for /en/escort/blankenese, got {status}"
    html_lang_count = count_occurrences(html, r'<html[^>]*lang=["\']en["\']')
    assert html_lang_count == 1, f"Expected 1 <html lang='en'>, found {html_lang_count}"
    
    canonical_matches = re.findall(canonical_pattern, html, re.IGNORECASE)
    assert len(canonical_matches) == 1, f"Expected 1 canonical link, found {len(canonical_matches)}"
    
    hreflang_matches = re.findall(hreflang_pattern, html, re.IGNORECASE)
    assert len(hreflang_matches) == 3, f"Expected 3 hreflang alternates, found {len(hreflang_matches)}"
    
    json_ld_blocks = extract_json_ld_blocks(html)
    assert len(json_ld_blocks) == 3, f"Expected 3 JSON-LD blocks, found {len(json_ld_blocks)}"
    
    h1_matches = re.findall(h1_pattern, html, re.IGNORECASE | re.DOTALL)
    assert len(h1_matches) >= 1, "No H1 found"
    
    print("✅ GET /en/escort/blankenese → 200, html lang=en, canonical + hreflang + 3 JSON-LD + H1")
    
    print("\n✅ TEST 4 PASSED: Secondary sanity checks")
    return True

def test_sitemap_coverage():
    """Test sitemap coverage"""
    print("\n" + "="*80)
    print("TEST 5: SITEMAP COVERAGE")
    print("="*80)
    
    status, xml = curl_get('/sitemap.xml')
    assert status == 200, f"Expected 200 for /sitemap.xml, got {status}"
    
    # Count <loc> entries matching .../escort/...
    escort_locs = re.findall(r'<loc>([^<]*\/escort\/[^<]+)<\/loc>', xml, re.IGNORECASE)
    assert len(escort_locs) == 18, f"Expected 18 escort <loc> entries, found {len(escort_locs)}"
    print(f"✅ Sitemap has exactly 18 escort <loc> entries")
    
    # Each area entry must have an xhtml:link rel="alternate" hreflang="en"
    # Check for at least 18 hreflang="en" alternates pointing to /en/escort/
    en_alternates = re.findall(r'hreflang=["\']en["\'][^>]*href=["\']([^"\']*\/en\/escort\/[^"\']+)["\']', xml, re.IGNORECASE)
    assert len(en_alternates) >= 18, f"Expected at least 18 EN alternates for escort pages, found {len(en_alternates)}"
    print(f"✅ Each area entry has hreflang='en' alternate pointing to /en/escort/...")
    
    print("\n✅ TEST 5 PASSED: Sitemap coverage")
    return True

def test_regression():
    """Test regression on prior work"""
    print("\n" + "="*80)
    print("TEST 6: REGRESSION ON PRIOR WORK")
    print("="*80)
    
    # GET /api/health
    status, body = curl_get('/api/health')
    assert status == 200, f"Expected 200 for /api/health, got {status}"
    data = json.loads(body)
    assert data.get('status') == 'ok', f"Expected status='ok', got {data.get('status')}"
    print("✅ GET /api/health → 200")
    
    # GET /api/area-content
    status, body = curl_get('/api/area-content')
    assert status == 200, f"Expected 200 for /api/area-content, got {status}"
    data = json.loads(body)
    assert len(data) == 18, f"Expected 18 areas, got {len(data)}"
    print("✅ GET /api/area-content → 200 with 18 items")
    
    # GET /api/models
    status, body = curl_get('/api/models')
    assert status == 200, f"Expected 200 for /api/models, got {status}"
    data = json.loads(body)
    assert len(data) == 14, f"Expected 14 models, got {len(data)}"
    print("✅ GET /api/models → 200 with 14 items")
    
    # GET /blog
    status, html = curl_get('/blog')
    assert status == 200, f"Expected 200 for /blog, got {status}"
    print("✅ GET /blog → 200 (Phase 3 d2 still works)")
    
    # GET /models
    status, html = curl_get('/models')
    assert status == 200, f"Expected 200 for /models, got {status}"
    print("✅ GET /models → 200 (Phase 3 d1 still works)")
    
    # GET /services/vip-escort-hamburg
    status, html = curl_get('/services/vip-escort-hamburg')
    assert status == 200, f"Expected 200 for /services/vip-escort-hamburg, got {status}"
    print("✅ GET /services/vip-escort-hamburg → 200 (Phase 1 still works)")
    
    print("\n✅ TEST 6 PASSED: Regression tests")
    return True

def main():
    print("="*80)
    print("PHASE 3 D3 — PUBLIC AREA DETAIL SSR ROUTES TESTING")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    try:
        test_de_detail_hafencity()
        test_en_detail_hafencity()
        test_404_handling()
        test_secondary_sanity()
        test_sitemap_coverage()
        test_regression()
        
        print("\n" + "="*80)
        print("✅ ALL TESTS PASSED (6/6)")
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

if __name__ == '__main__':
    sys.exit(main())
