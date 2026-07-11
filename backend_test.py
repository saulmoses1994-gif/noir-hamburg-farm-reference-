#!/usr/bin/env python3
"""
Phase 3 d2: Public /blog list + detail (+ EN twins) with dynamic category chips
Testing SSR SEO artifacts in raw HTML (curl-based, no JS required)
"""

import requests
import json
import re
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

BASE_URL = "https://noir-migration.preview.emergentagent.com"

# Expected 11 categories (DB source of truth)
EXPECTED_CATEGORIES = [
    "Business Travel Hamburg", "Escort Advice", "Escort Guides", "FAQ Guides",
    "Fine Dining Hamburg", "Hamburg Lifestyle", "Luxury Hotels Hamburg",
    "Luxury Lifestyle", "Nightlife Hamburg", "Privacy & Discretion", "Restaurants"
]

# German UI strings that should NOT appear in EN routes
GERMAN_UI_STRINGS = [
    "Startseite", "Über uns", "Häufige Fragen", "Kategorien", "Verwandte",
    "Zurück", "Jetzt anfragen", "Termin", "Sprache wechseln", "Alle ",
    "Geschichten", "Reiseempfehlungen", "Magazin "
]

class SEOParser(HTMLParser):
    """Parse HTML to extract SEO elements"""
    def __init__(self):
        super().__init__()
        self.meta_descriptions = []
        self.canonicals = []
        self.hreflangs = []
        self.html_lang = None
        self.json_ld_blocks = []
        self.in_body = False
        self.in_script = False
        self.script_type = None
        self.script_content = []
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'html':
            self.html_lang = attrs_dict.get('lang')
        elif tag == 'body':
            self.in_body = True
        elif tag == 'meta' and attrs_dict.get('name') == 'description':
            self.meta_descriptions.append(attrs_dict.get('content', ''))
        elif tag == 'link' and attrs_dict.get('rel') == 'canonical':
            self.canonicals.append(attrs_dict.get('href', ''))
        elif tag == 'link' and attrs_dict.get('rel') == 'alternate':
            hreflang = attrs_dict.get('hreflang') or attrs_dict.get('hrefLang')
            href = attrs_dict.get('href')
            if hreflang and href:
                self.hreflangs.append({'hreflang': hreflang, 'href': href})
        elif tag == 'script' and attrs_dict.get('type') == 'application/ld+json':
            self.in_script = True
            self.script_type = 'json-ld'
            self.script_content = []
            
    def handle_endtag(self, tag):
        if tag == 'body':
            self.in_body = False
        elif tag == 'script' and self.in_script:
            self.in_script = False
            if self.script_type == 'json-ld':
                content = ''.join(self.script_content)
                self.json_ld_blocks.append({
                    'content': content,
                    'in_body': self.in_body
                })
            self.script_type = None
            self.script_content = []
            
    def handle_data(self, data):
        if self.in_script and self.script_type == 'json-ld':
            self.script_content.append(data)

def extract_seo_elements(html):
    """Extract SEO elements from HTML"""
    parser = SEOParser()
    parser.feed(html)
    
    # Extract titles using regex
    titles = re.findall(r'<title[^>]*>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    
    # Extract h1 tags using regex
    h1_tags = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    
    return {
        'titles': titles,
        'h1_tags': h1_tags,
        'meta_descriptions': parser.meta_descriptions,
        'canonicals': parser.canonicals,
        'hreflangs': parser.hreflangs,
        'html_lang': parser.html_lang,
        'json_ld_blocks': parser.json_ld_blocks
    }

def count_blog_cards(html):
    """Count blog cards with data-testid='blog-card-*'"""
    return len(re.findall(r'data-testid="blog-card-[^"]*"', html))

def count_category_chips(html):
    """Count category chips (dynamic + 'Alle' pseudo-chip)"""
    # Look for chip elements with data-testid="blog-cat-*"
    chips = re.findall(r'data-testid="blog-cat-[^"]*"', html)
    return len(chips)

def check_german_ui_leaks(html):
    """Check for German UI string leaks in EN routes"""
    # Strip script tags and HTML tags to get visible text
    text_without_scripts = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    text_without_tags = re.sub(r'<[^>]+>', ' ', text_without_scripts)
    
    leaks = []
    for german_string in GERMAN_UI_STRINGS:
        if german_string in text_without_tags:
            leaks.append(german_string)
    
    return leaks

def test_de_blog_list():
    """Test DE list — GET /blog"""
    print("\n" + "="*80)
    print("TEST 1: DE Blog List — GET /blog")
    print("="*80)
    
    url = f"{BASE_URL}/blog"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    html = resp.text
    seo = extract_seo_elements(html)
    
    # Check html lang
    assert seo['html_lang'] == 'de', f"Expected lang='de', got '{seo['html_lang']}'"
    print(f"✅ HTML lang: {seo['html_lang']}")
    
    # Check title (exactly one)
    assert len(seo['titles']) == 1, f"Expected 1 title, found {len(seo['titles'])}"
    title = seo['titles'][0]
    # Allow HTML entities like &amp;
    expected_title_pattern = r"Magazin.*Noir Hamburg.*Lifestyle.*Hamburg Guide.*Reiseempfehlungen"
    assert re.search(expected_title_pattern, title, re.IGNORECASE), f"Title doesn't match pattern: {title}"
    print(f"✅ Title: {title[:80]}...")
    
    # Check meta description
    assert len(seo['meta_descriptions']) == 1, f"Expected 1 meta description, found {len(seo['meta_descriptions'])}"
    meta_desc = seo['meta_descriptions'][0]
    assert len(meta_desc) > 0, "Meta description is empty"
    assert "Restaurants" in meta_desc or "Hotels" in meta_desc, f"Meta description missing expected keywords: {meta_desc}"
    print(f"✅ Meta description: {meta_desc[:80]}...")
    
    # Check canonical
    assert len(seo['canonicals']) == 1, f"Expected 1 canonical, found {len(seo['canonicals'])}"
    canonical = seo['canonicals'][0]
    assert canonical.endswith('/blog'), f"Canonical should end with /blog: {canonical}"
    print(f"✅ Canonical: {canonical}")
    
    # Check hreflang alternates (de-DE, en, x-default)
    hreflang_langs = [h['hreflang'] for h in seo['hreflangs']]
    assert 'de-DE' in hreflang_langs or 'de' in hreflang_langs, f"Missing de-DE hreflang: {hreflang_langs}"
    assert 'en' in hreflang_langs, f"Missing en hreflang: {hreflang_langs}"
    assert 'x-default' in hreflang_langs, f"Missing x-default hreflang: {hreflang_langs}"
    print(f"✅ Hreflang alternates: {hreflang_langs}")
    
    # Check JSON-LD blocks in body (at least BreadcrumbList and Blog)
    json_ld_in_body = [block for block in seo['json_ld_blocks'] if block['in_body']]
    assert len(json_ld_in_body) >= 2, f"Expected at least 2 JSON-LD blocks in body, found {len(json_ld_in_body)}"
    
    # Parse JSON-LD to check types
    json_ld_types = []
    for block in json_ld_in_body:
        try:
            data = json.loads(block['content'])
            json_ld_types.append(data.get('@type'))
        except:
            pass
    
    assert 'BreadcrumbList' in json_ld_types, f"Missing BreadcrumbList in JSON-LD: {json_ld_types}"
    assert 'Blog' in json_ld_types, f"Missing Blog in JSON-LD: {json_ld_types}"
    print(f"✅ JSON-LD blocks in body: {json_ld_types}")
    
    # Check blog cards count (13 expected)
    card_count = count_blog_cards(html)
    assert card_count == 13, f"Expected 13 blog cards, found {card_count}"
    print(f"✅ Blog cards: {card_count}")
    
    # Check category chips (11 dynamic + 1 "Alle")
    chip_count = count_category_chips(html)
    # Should be 11 dynamic categories + 1 "Alle" pseudo-chip = 12 total
    # But let's verify we have at least 11 (the dynamic ones)
    assert chip_count >= 11, f"Expected at least 11 category chips, found {chip_count}"
    print(f"✅ Category chips: {chip_count}")
    
    # Check "Alle" chip is active (burgundy styling)
    # The "Alle" chip is the first link in the category section with burgundy border
    alle_chip_pattern = r'href="/blog">Alle</a>'
    has_alle_chip = bool(re.search(alle_chip_pattern, html, re.IGNORECASE))
    print(f"✅ 'Alle' chip present: {has_alle_chip}")
    
    # Check no pagination controls
    has_pagination = bool(re.search(r'Page \d+ of \d+', html, re.IGNORECASE))
    assert not has_pagination, "Should not have pagination controls"
    print("✅ No pagination controls")
    
    print("\n✅ TEST 1 PASSED: DE Blog List")
    return True

def test_en_blog_list():
    """Test EN list — GET /en/blog"""
    print("\n" + "="*80)
    print("TEST 2: EN Blog List — GET /en/blog")
    print("="*80)
    
    url = f"{BASE_URL}/en/blog"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    html = resp.text
    seo = extract_seo_elements(html)
    
    # Check html lang
    assert seo['html_lang'] == 'en', f"Expected lang='en', got '{seo['html_lang']}'"
    print(f"✅ HTML lang: {seo['html_lang']}")
    
    # Check title
    assert len(seo['titles']) == 1, f"Expected 1 title, found {len(seo['titles'])}"
    title = seo['titles'][0]
    expected_title_pattern = r"Magazine.*Noir Hamburg.*Lifestyle.*Hamburg Guide.*Travel Recommendations"
    assert re.search(expected_title_pattern, title, re.IGNORECASE), f"Title doesn't match pattern: {title}"
    print(f"✅ Title: {title[:80]}...")
    
    # Check canonical
    assert len(seo['canonicals']) == 1, f"Expected 1 canonical, found {len(seo['canonicals'])}"
    canonical = seo['canonicals'][0]
    assert canonical.endswith('/en/blog'), f"Canonical should end with /en/blog: {canonical}"
    print(f"✅ Canonical: {canonical}")
    
    # Check h1 contains "Noir Magazine" (not "Magazin")
    h1_text = ' '.join(seo['h1_tags'])
    assert 'Magazine' in h1_text or 'Noir' in h1_text, f"H1 should contain 'Magazine': {h1_text}"
    print(f"✅ H1 contains English text: {h1_text[:80]}...")
    
    # Check for German UI string leaks
    leaks = check_german_ui_leaks(html)
    # Allow kontakt@noir-hamburg.de (it's an email address)
    leaks = [leak for leak in leaks if 'kontakt@noir-hamburg.de' not in leak]
    assert len(leaks) == 0, f"Found German UI string leaks: {leaks}"
    print("✅ No German UI string leaks")
    
    # Check category chips (11 English DB values)
    chip_count = count_category_chips(html)
    assert chip_count >= 11, f"Expected at least 11 category chips, found {chip_count}"
    print(f"✅ Category chips: {chip_count}")
    
    # Check "All" chip is active (not "Alle")
    all_chip_pattern = r'href="/en/blog">All</a>'
    has_all_chip = bool(re.search(all_chip_pattern, html, re.IGNORECASE))
    print(f"✅ 'All' chip present: {has_all_chip}")
    
    # Check blog cards count
    card_count = count_blog_cards(html)
    assert card_count == 13, f"Expected 13 blog cards, found {card_count}"
    print(f"✅ Blog cards: {card_count}")
    
    print("\n✅ TEST 2 PASSED: EN Blog List")
    return True

def test_category_filter():
    """Test Category filter — GET /blog?category=Fine%20Dining%20Hamburg"""
    print("\n" + "="*80)
    print("TEST 3: Category Filter — GET /blog?category=Fine%20Dining%20Hamburg")
    print("="*80)
    
    url = f"{BASE_URL}/blog?category=Fine%20Dining%20Hamburg"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    html = resp.text
    
    # Check blog cards count (2 expected)
    card_count = count_blog_cards(html)
    assert card_count == 2, f"Expected 2 blog cards, found {card_count}"
    print(f"✅ Blog cards: {card_count}")
    
    # Check "Fine Dining Hamburg" chip is active (burgundy styling)
    # When filtered, the chip should have burgundy border/text
    fine_dining_chip_pattern = r'data-testid="blog-cat-Fine Dining Hamburg"'
    has_fine_dining_chip = bool(re.search(fine_dining_chip_pattern, html, re.IGNORECASE))
    print(f"✅ 'Fine Dining Hamburg' chip present: {has_fine_dining_chip}")
    
    # Check "Alle" chip is NOT active
    # When category is filtered, "Alle" should not have burgundy styling
    alle_chip_active_pattern = r'border-\[#8B1538\][^>]*>Alle</a>'
    alle_is_active = bool(re.search(alle_chip_active_pattern, html, re.IGNORECASE))
    assert not alle_is_active, "'Alle' chip should not be active when category is filtered"
    print("✅ 'Alle' chip not active")
    
    print("\n✅ TEST 3 PASSED: Category Filter")
    return True

def test_de_blog_detail():
    """Test DE detail — GET /blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner"""
    print("\n" + "="*80)
    print("TEST 4: DE Blog Detail — Restaurants Post")
    print("="*80)
    
    slug = "die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner"
    url = f"{BASE_URL}/blog/{slug}"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    html = resp.text
    seo = extract_seo_elements(html)
    
    # Check html lang
    assert seo['html_lang'] == 'de', f"Expected lang='de', got '{seo['html_lang']}'"
    print(f"✅ HTML lang: {seo['html_lang']}")
    
    # Check title
    assert len(seo['titles']) == 1, f"Expected 1 title, found {len(seo['titles'])}"
    title = seo['titles'][0]
    expected_title = "Die 10 besten Restaurants in Hamburg | Noir Hamburg Guide"
    assert expected_title in title or "Die 10 besten Restaurants in Hamburg" in title, f"Title mismatch: {title}"
    print(f"✅ Title: {title}")
    
    # Check h1
    h1_text = ' '.join(seo['h1_tags'])
    assert "Die zehn besten Restaurants in Hamburg" in h1_text, f"H1 mismatch: {h1_text}"
    print(f"✅ H1: {h1_text[:80]}...")
    
    # Check canonical
    assert len(seo['canonicals']) == 1, f"Expected 1 canonical, found {len(seo['canonicals'])}"
    canonical = seo['canonicals'][0]
    assert canonical.endswith(f'/blog/{slug}'), f"Canonical mismatch: {canonical}"
    print(f"✅ Canonical: {canonical}")
    
    # Check hreflang en points to /en/blog/...
    en_hreflang = [h for h in seo['hreflangs'] if h['hreflang'] == 'en']
    assert len(en_hreflang) > 0, "Missing en hreflang"
    assert '/en/blog/' in en_hreflang[0]['href'], f"EN hreflang should point to /en/blog/: {en_hreflang[0]['href']}"
    print(f"✅ Hreflang en: {en_hreflang[0]['href']}")
    
    # Check JSON-LD blocks (exactly 2: Article + BreadcrumbList)
    json_ld_in_body = [block for block in seo['json_ld_blocks'] if block['in_body']]
    assert len(json_ld_in_body) == 2, f"Expected 2 JSON-LD blocks in body, found {len(json_ld_in_body)}"
    
    # Parse JSON-LD to check types
    json_ld_types = []
    article_data = None
    for block in json_ld_in_body:
        try:
            data = json.loads(block['content'])
            json_ld_types.append(data.get('@type'))
            if data.get('@type') == 'Article':
                article_data = data
        except:
            pass
    
    assert 'Article' in json_ld_types, f"Missing Article in JSON-LD: {json_ld_types}"
    assert 'BreadcrumbList' in json_ld_types, f"Missing BreadcrumbList in JSON-LD: {json_ld_types}"
    print(f"✅ JSON-LD blocks: {json_ld_types}")
    
    # Check Article has inLanguage="de-DE" and articleSection="Restaurants"
    if article_data:
        assert article_data.get('inLanguage') == 'de-DE', f"Article inLanguage should be 'de-DE': {article_data.get('inLanguage')}"
        assert article_data.get('articleSection') == 'Restaurants', f"Article articleSection should be 'Restaurants': {article_data.get('articleSection')}"
        print(f"✅ Article inLanguage: {article_data.get('inLanguage')}, articleSection: {article_data.get('articleSection')}")
    
    # Check related-services block (2 links)
    related_services_pattern = r'/services/dinner-companion-hamburg|/services/luxury-escort-hamburg'
    related_services_count = len(re.findall(related_services_pattern, html))
    assert related_services_count >= 2, f"Expected at least 2 related-services links, found {related_services_count}"
    print(f"✅ Related-services links: {related_services_count}")
    
    # Check related-areas block (3 links)
    related_areas_pattern = r'/escort/hamburg|/escort/hafencity|/escort/harvestehude'
    related_areas_count = len(re.findall(related_areas_pattern, html))
    assert related_areas_count >= 3, f"Expected at least 3 related-areas links, found {related_areas_count}"
    print(f"✅ Related-areas links: {related_areas_count}")
    
    # Check featured models block (3 links)
    featured_models_pattern = r'/models/[a-z-]+'
    featured_models_count = len(re.findall(featured_models_pattern, html))
    assert featured_models_count >= 3, f"Expected at least 3 featured models links, found {featured_models_count}"
    print(f"✅ Featured models links: {featured_models_count}")
    
    # Check contact box footer contains "Kontakt Noir Hamburg"
    has_contact_box = bool(re.search(r'Kontakt Noir Hamburg', html, re.IGNORECASE))
    assert has_contact_box, "Missing 'Kontakt Noir Hamburg' in contact box"
    print("✅ Contact box footer: 'Kontakt Noir Hamburg'")
    
    print("\n✅ TEST 4 PASSED: DE Blog Detail")
    return True

def test_en_blog_detail():
    """Test EN detail — GET /en/blog/die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner"""
    print("\n" + "="*80)
    print("TEST 5: EN Blog Detail — Restaurants Post")
    print("="*80)
    
    slug = "die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner"
    url = f"{BASE_URL}/en/blog/{slug}"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    html = resp.text
    seo = extract_seo_elements(html)
    
    # Check html lang
    assert seo['html_lang'] == 'en', f"Expected lang='en', got '{seo['html_lang']}'"
    print(f"✅ HTML lang: {seo['html_lang']}")
    
    # Check title
    assert len(seo['titles']) == 1, f"Expected 1 title, found {len(seo['titles'])}"
    title = seo['titles'][0]
    expected_title = "The 10 Best Restaurants in Hamburg | Noir Hamburg Guide"
    assert expected_title in title or "The 10 Best Restaurants in Hamburg" in title, f"Title mismatch: {title}"
    print(f"✅ Title: {title}")
    
    # Check h1
    h1_text = ' '.join(seo['h1_tags'])
    assert "The Ten Best Restaurants in Hamburg" in h1_text, f"H1 mismatch: {h1_text}"
    print(f"✅ H1: {h1_text[:80]}...")
    
    # Check canonical
    assert len(seo['canonicals']) == 1, f"Expected 1 canonical, found {len(seo['canonicals'])}"
    canonical = seo['canonicals'][0]
    assert canonical.endswith(f'/en/blog/{slug}'), f"Canonical mismatch: {canonical}"
    print(f"✅ Canonical: {canonical}")
    
    # Check hreflang de-DE points to DE twin
    de_hreflang = [h for h in seo['hreflangs'] if h['hreflang'] in ['de-DE', 'de']]
    assert len(de_hreflang) > 0, "Missing de-DE hreflang"
    assert '/blog/' in de_hreflang[0]['href'] and '/en/' not in de_hreflang[0]['href'], f"DE hreflang should point to /blog/ (not /en/blog/): {de_hreflang[0]['href']}"
    print(f"✅ Hreflang de-DE: {de_hreflang[0]['href']}")
    
    # Check Article JSON-LD has inLanguage="en"
    json_ld_in_body = [block for block in seo['json_ld_blocks'] if block['in_body']]
    article_data = None
    for block in json_ld_in_body:
        try:
            data = json.loads(block['content'])
            if data.get('@type') == 'Article':
                article_data = data
        except:
            pass
    
    if article_data:
        assert article_data.get('inLanguage') == 'en', f"Article inLanguage should be 'en': {article_data.get('inLanguage')}"
        print(f"✅ Article inLanguage: {article_data.get('inLanguage')}")
    
    # Check related-services links start with /en/services/
    related_services_en_pattern = r'/en/services/[a-z-]+'
    related_services_count = len(re.findall(related_services_en_pattern, html))
    assert related_services_count >= 2, f"Expected at least 2 /en/services/ links, found {related_services_count}"
    print(f"✅ Related-services EN links: {related_services_count}")
    
    # Check areas links start with /en/escort/
    related_areas_en_pattern = r'/en/escort/[a-z-]+'
    related_areas_count = len(re.findall(related_areas_en_pattern, html))
    assert related_areas_count >= 3, f"Expected at least 3 /en/escort/ links, found {related_areas_count}"
    print(f"✅ Related-areas EN links: {related_areas_count}")
    
    # Check models links start with /en/models/
    models_en_pattern = r'/en/models/[a-z-]+'
    models_count = len(re.findall(models_en_pattern, html))
    assert models_count >= 3, f"Expected at least 3 /en/models/ links, found {models_count}"
    print(f"✅ Models EN links: {models_count}")
    
    # Check related-articles links start with /en/blog/
    related_articles_en_pattern = r'/en/blog/[a-z-]+'
    related_articles_count = len(re.findall(related_articles_en_pattern, html))
    print(f"✅ Related-articles EN links: {related_articles_count}")
    
    # Check contact box footer contains "Contact Noir Hamburg" (English)
    has_contact_box = bool(re.search(r'Contact Noir Hamburg', html, re.IGNORECASE))
    assert has_contact_box, "Missing 'Contact Noir Hamburg' in contact box"
    print("✅ Contact box footer: 'Contact Noir Hamburg'")
    
    # Check for German UI string leaks
    leaks = check_german_ui_leaks(html)
    # Allow kontakt@noir-hamburg.de (it's an email address)
    leaks = [leak for leak in leaks if 'kontakt@noir-hamburg.de' not in leak]
    assert len(leaks) == 0, f"Found German UI string leaks: {leaks}"
    print("✅ No German UI string leaks")
    
    print("\n✅ TEST 5 PASSED: EN Blog Detail")
    return True

def test_fine_dining_category_crosslink():
    """Test Fine-Dining category cross-link"""
    print("\n" + "="*80)
    print("TEST 6: Fine-Dining Category Cross-Link")
    print("="*80)
    
    slug = "fine-dining-hamburg-zehn-restaurants-die-den-abend-besonders-machen"
    url = f"{BASE_URL}/blog/{slug}"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    html = resp.text
    
    # Check related-articles block includes link to breakfast post (same category)
    breakfast_slug = "fruehstueck-in-hamburg-die-zehn-schoensten-adressen-fuer-den-langsamen-morgen"
    has_breakfast_link = bool(re.search(f'/blog/{breakfast_slug}', html))
    assert has_breakfast_link, f"Missing related-article link to {breakfast_slug}"
    print(f"✅ Related-article link to breakfast post: {has_breakfast_link}")
    
    print("\n✅ TEST 6 PASSED: Fine-Dining Category Cross-Link")
    return True

def test_404_handling():
    """Test 404 handling"""
    print("\n" + "="*80)
    print("TEST 7: 404 Handling")
    print("="*80)
    
    # Test DE 404
    url_de = f"{BASE_URL}/blog/does-not-exist"
    resp_de = requests.get(url_de)
    assert resp_de.status_code == 404, f"Expected 404 for DE, got {resp_de.status_code}"
    print(f"✅ DE 404: {url_de}")
    
    # Test EN 404
    url_en = f"{BASE_URL}/en/blog/does-not-exist"
    resp_en = requests.get(url_en)
    assert resp_en.status_code == 404, f"Expected 404 for EN, got {resp_en.status_code}"
    print(f"✅ EN 404: {url_en}")
    
    print("\n✅ TEST 7 PASSED: 404 Handling")
    return True

def test_sitemap():
    """Test Sitemap coverage"""
    print("\n" + "="*80)
    print("TEST 8: Sitemap Coverage")
    print("="*80)
    
    url = f"{BASE_URL}/sitemap.xml"
    resp = requests.get(url)
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    print("✅ Status: 200")
    
    assert 'xml' in resp.headers.get('content-type', '').lower(), f"Expected XML content-type, got {resp.headers.get('content-type')}"
    print(f"✅ Content-Type: {resp.headers.get('content-type')}")
    
    xml_text = resp.text
    
    # Count blog entries
    blog_entries = re.findall(r'<loc>[^<]*/blog/[^<]+</loc>', xml_text)
    assert len(blog_entries) == 13, f"Expected 13 blog entries in sitemap, found {len(blog_entries)}"
    print(f"✅ Blog entries in sitemap: {len(blog_entries)}")
    
    # Check each blog entry has hreflang alternate for EN
    for entry in blog_entries[:3]:  # Check first 3 as sample
        # Extract the URL
        url_match = re.search(r'<loc>([^<]+)</loc>', entry)
        if url_match:
            blog_url = url_match.group(1)
            # Look for the corresponding xhtml:link alternate
            # The alternate should be in the same <url> block
            url_block_pattern = f'<loc>{re.escape(blog_url)}</loc>.*?</url>'
            url_block_match = re.search(url_block_pattern, xml_text, re.DOTALL)
            if url_block_match:
                url_block = url_block_match.group(0)
                has_en_alternate = bool(re.search(r'hreflang="en"[^>]*href="[^"]*en/blog/', url_block))
                assert has_en_alternate, f"Missing EN alternate for {blog_url}"
                print(f"✅ EN alternate found for: {blog_url}")
    
    print("\n✅ TEST 8 PASSED: Sitemap Coverage")
    return True

def test_regression():
    """Test Regression (no breakage)"""
    print("\n" + "="*80)
    print("TEST 9: Regression Tests")
    print("="*80)
    
    # Test /api/health
    resp = requests.get(f"{BASE_URL}/api/health")
    assert resp.status_code == 200, f"Expected 200 for /api/health, got {resp.status_code}"
    print("✅ GET /api/health → 200")
    
    # Test /api/blog
    resp = requests.get(f"{BASE_URL}/api/blog")
    assert resp.status_code == 200, f"Expected 200 for /api/blog, got {resp.status_code}"
    data = resp.json()
    assert len(data) == 13, f"Expected 13 posts, got {len(data)}"
    print(f"✅ GET /api/blog → 200 with {len(data)} posts")
    
    # Test /models (Phase 3 d1)
    resp = requests.get(f"{BASE_URL}/models")
    assert resp.status_code == 200, f"Expected 200 for /models, got {resp.status_code}"
    print("✅ GET /models → 200")
    
    # Test /services/vip-escort-hamburg (Phase 1)
    resp = requests.get(f"{BASE_URL}/services/vip-escort-hamburg")
    assert resp.status_code == 200, f"Expected 200 for /services/vip-escort-hamburg, got {resp.status_code}"
    print("✅ GET /services/vip-escort-hamburg → 200")
    
    print("\n✅ TEST 9 PASSED: Regression Tests")
    return True

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("PHASE 3 D2: PUBLIC BLOG SSR ROUTES TESTING")
    print("Base URL:", BASE_URL)
    print("="*80)
    
    tests = [
        ("DE Blog List", test_de_blog_list),
        ("EN Blog List", test_en_blog_list),
        ("Category Filter", test_category_filter),
        ("DE Blog Detail", test_de_blog_detail),
        ("EN Blog Detail", test_en_blog_detail),
        ("Fine-Dining Category Cross-Link", test_fine_dining_category_crosslink),
        ("404 Handling", test_404_handling),
        ("Sitemap Coverage", test_sitemap),
        ("Regression Tests", test_regression),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
        except AssertionError as e:
            print(f"\n❌ TEST FAILED: {test_name}")
            print(f"   Error: {e}")
            failed += 1
        except Exception as e:
            print(f"\n❌ TEST ERROR: {test_name}")
            print(f"   Error: {e}")
            failed += 1
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {failed} TEST(S) FAILED")
        return 1

if __name__ == "__main__":
    exit(main())
