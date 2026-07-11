#!/usr/bin/env python3
"""
Phase 3 d1: Public /models list + /models/{slug} detail + EN twins + sitemap updates
Testing SSR SEO artifacts in raw HTML (not just after JS hydration)
"""

import requests
import json
import re
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

BASE_URL = "https://noir-migration.preview.emergentagent.com"

# Expected 14 model slugs
EXPECTED_MODEL_SLUGS = [
    'aurelia', 'valentina', 'sophia', 'mila', 'helena', 'lara', 
    'isabella', 'charlotte', 'anastasia', 'camille', 'beatrice', 
    'nina', 'marlene', 'elena'
]

class SEOParser(HTMLParser):
    """Parse HTML to extract SEO elements"""
    def __init__(self):
        super().__init__()
        self.titles = []
        self.meta_descriptions = []
        self.canonicals = []
        self.hreflangs = []
        self.html_lang = None
        self.json_ld_blocks = []
        self.h1_tags = []
        self.in_head = False
        self.in_body = False
        self.in_script = False
        self.script_type = None
        self.script_content = []
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'html':
            self.html_lang = attrs_dict.get('lang')
        elif tag == 'head':
            self.in_head = True
        elif tag == 'body':
            self.in_body = True
            self.in_head = False
        elif tag == 'title':
            pass  # Will capture in handle_data
        elif tag == 'meta' and attrs_dict.get('name') == 'description':
            self.meta_descriptions.append(attrs_dict.get('content', ''))
        elif tag == 'link' and attrs_dict.get('rel') == 'canonical':
            self.canonicals.append(attrs_dict.get('href', ''))
        elif tag == 'link' and attrs_dict.get('rel') == 'alternate':
            hreflang = attrs_dict.get('hreflang')
            href = attrs_dict.get('href')
            if hreflang and href:
                self.hreflangs.append({'hreflang': hreflang, 'href': href})
        elif tag == 'h1':
            pass  # Will capture in handle_data
        elif tag == 'script' and attrs_dict.get('type') == 'application/ld+json':
            self.in_script = True
            self.script_type = 'json-ld'
            self.script_content = []
            
    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        elif tag == 'body':
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
        # Get the last open tag from the stack
        if self.in_script and self.script_type == 'json-ld':
            self.script_content.append(data)
        # We need to track what tag we're in - simplified approach
        # This is a limitation of HTMLParser, but we'll capture via regex instead
        
def extract_seo_elements(html):
    """Extract SEO elements from HTML"""
    parser = SEOParser()
    parser.feed(html)
    
    # Extract titles using regex (more reliable than parser for this)
    titles = re.findall(r'<title[^>]*>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    
    # Extract h1 tags using regex
    h1_tags = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    
    # Extract JSON-LD blocks and check if they're in body
    json_ld_blocks = []
    # Split by </head> to check if JSON-LD is after head
    parts = html.split('</head>', 1)
    in_head = parts[0] if len(parts) > 1 else ''
    in_body = parts[1] if len(parts) > 1 else html
    
    # Find all JSON-LD blocks
    json_ld_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
    for match in re.finditer(json_ld_pattern, html, re.DOTALL | re.IGNORECASE):
        content = match.group(1).strip()
        # Check if this block is in body
        is_in_body = match.start() > len(in_head) if len(parts) > 1 else False
        json_ld_blocks.append({
            'content': content,
            'in_body': is_in_body
        })
    
    return {
        'titles': titles,
        'meta_descriptions': parser.meta_descriptions,
        'canonicals': parser.canonicals,
        'hreflangs': parser.hreflangs,
        'html_lang': parser.html_lang,
        'json_ld_blocks': json_ld_blocks,
        'h1_tags': h1_tags
    }

def test_url(url, expected_status=200, expected_lang='de', test_name=''):
    """Test a URL and return SEO analysis"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"URL: {url}")
    print(f"{'='*80}")
    
    try:
        response = requests.get(url, timeout=30)
        print(f"✓ HTTP Status: {response.status_code}")
        
        if response.status_code != expected_status:
            print(f"✗ FAIL: Expected {expected_status}, got {response.status_code}")
            return False
        
        if expected_status == 404:
            print(f"✓ PASS: Correctly returns 404")
            return True
            
        html = response.text
        seo = extract_seo_elements(html)
        
        # Check title
        if len(seo['titles']) == 0:
            print(f"✗ FAIL: No <title> tag found")
            return False
        elif len(seo['titles']) > 1:
            print(f"✗ FAIL: Multiple <title> tags found: {len(seo['titles'])}")
            return False
        else:
            title = seo['titles'][0].strip()
            if not title:
                print(f"✗ FAIL: <title> tag is empty")
                return False
            print(f"✓ Title: {title[:80]}...")
        
        # Check meta description
        if len(seo['meta_descriptions']) == 0:
            print(f"✗ FAIL: No meta description found")
            return False
        elif len(seo['meta_descriptions']) > 1:
            print(f"✗ FAIL: Multiple meta descriptions found: {len(seo['meta_descriptions'])}")
            return False
        else:
            desc = seo['meta_descriptions'][0].strip()
            if not desc:
                print(f"✗ FAIL: Meta description is empty")
                return False
            print(f"✓ Meta description: {desc[:80]}...")
        
        # Check canonical
        if len(seo['canonicals']) == 0:
            print(f"✗ FAIL: No canonical link found")
            return False
        elif len(seo['canonicals']) > 1:
            print(f"✗ FAIL: Multiple canonical links found: {len(seo['canonicals'])}")
            return False
        else:
            print(f"✓ Canonical: {seo['canonicals'][0]}")
        
        # Check hreflang
        hreflang_de = [h for h in seo['hreflangs'] if h['hreflang'] == 'de-DE']
        hreflang_en = [h for h in seo['hreflangs'] if h['hreflang'] == 'en']
        hreflang_default = [h for h in seo['hreflangs'] if h['hreflang'] == 'x-default']
        
        if not hreflang_de:
            print(f"✗ FAIL: No hreflang de-DE found")
            return False
        if not hreflang_en:
            print(f"✗ FAIL: No hreflang en found")
            return False
        if not hreflang_default:
            print(f"✗ FAIL: No hreflang x-default found")
            return False
        
        print(f"✓ Hreflang de-DE: {hreflang_de[0]['href']}")
        print(f"✓ Hreflang en: {hreflang_en[0]['href']}")
        print(f"✓ Hreflang x-default: {hreflang_default[0]['href']}")
        
        # Check html lang
        if seo['html_lang'] != expected_lang:
            print(f"✗ FAIL: Expected html lang='{expected_lang}', got '{seo['html_lang']}'")
            return False
        print(f"✓ HTML lang: {seo['html_lang']}")
        
        # Check JSON-LD blocks
        if len(seo['json_ld_blocks']) == 0:
            print(f"✗ FAIL: No JSON-LD blocks found")
            return False
        
        print(f"✓ Found {len(seo['json_ld_blocks'])} JSON-LD block(s)")
        
        # Check all JSON-LD blocks are in body
        blocks_in_head = [b for b in seo['json_ld_blocks'] if not b['in_body']]
        if blocks_in_head:
            print(f"✗ FAIL: {len(blocks_in_head)} JSON-LD block(s) found in <head> (should be in <body>)")
            return False
        print(f"✓ All JSON-LD blocks are in <body>")
        
        # Validate JSON-LD blocks parse as valid JSON
        for i, block in enumerate(seo['json_ld_blocks']):
            try:
                data = json.loads(block['content'])
                print(f"✓ JSON-LD block {i+1} is valid JSON (@type: {data.get('@type', 'unknown')})")
            except json.JSONDecodeError as e:
                print(f"✗ FAIL: JSON-LD block {i+1} is invalid JSON: {e}")
                return False
        
        # Check H1
        if len(seo['h1_tags']) == 0:
            print(f"✗ FAIL: No <h1> tag found")
            return False
        print(f"✓ H1 found: {len(seo['h1_tags'])} tag(s)")
        
        return True
        
    except Exception as e:
        print(f"✗ EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_models_list_de():
    """Test 1: GET /models"""
    url = f"{BASE_URL}/models"
    result = test_url(url, expected_lang='de', test_name='GET /models (DE)')
    
    if not result:
        return False
    
    # Additional checks for models list
    response = requests.get(url, timeout=30)
    html = response.text
    seo = extract_seo_elements(html)
    
    # Check for ItemList JSON-LD
    item_list_found = False
    breadcrumb_found = False
    
    for block in seo['json_ld_blocks']:
        try:
            data = json.loads(block['content'])
            if data.get('@type') == 'ItemList':
                item_list_found = True
                items = data.get('itemListElement', [])
                print(f"✓ ItemList JSON-LD found with {len(items)} items")
                
                # Check if it references at least 14 model URLs
                if len(items) < 14:
                    print(f"✗ FAIL: ItemList has {len(items)} items, expected at least 14")
                    return False
                print(f"✓ ItemList references at least 14 model URLs")
                
            elif data.get('@type') == 'BreadcrumbList':
                breadcrumb_found = True
                print(f"✓ BreadcrumbList JSON-LD found")
        except:
            pass
    
    if not item_list_found:
        print(f"✗ FAIL: No ItemList JSON-LD found")
        return False
    
    if not breadcrumb_found:
        print(f"✗ FAIL: No BreadcrumbList JSON-LD found")
        return False
    
    # Check that all 14 model slugs appear in href attributes
    missing_slugs = []
    for slug in EXPECTED_MODEL_SLUGS:
        if f'/models/{slug}' not in html:
            missing_slugs.append(slug)
    
    if missing_slugs:
        print(f"✗ FAIL: Missing model slugs in HTML: {missing_slugs}")
        return False
    print(f"✓ All 14 model slugs found in href attributes")
    
    # Check canonical
    if seo['canonicals'][0] != f"{BASE_URL}/models":
        print(f"✗ FAIL: Canonical should be {BASE_URL}/models, got {seo['canonicals'][0]}")
        return False
    print(f"✓ Canonical is /models")
    
    print(f"\n✓✓✓ PASS: GET /models (DE)")
    return True

def test_models_detail_de():
    """Test 2: GET /models/aurelia"""
    url = f"{BASE_URL}/models/aurelia"
    result = test_url(url, expected_lang='de', test_name='GET /models/aurelia (DE)')
    
    if not result:
        return False
    
    # Additional checks for model detail
    response = requests.get(url, timeout=30)
    html = response.text
    seo = extract_seo_elements(html)
    
    # Check for Person JSON-LD with name="Aurelia" and nationality
    person_found = False
    breadcrumb_found = False
    
    for block in seo['json_ld_blocks']:
        try:
            data = json.loads(block['content'])
            if data.get('@type') == 'Person':
                person_found = True
                name = data.get('name', '')
                nationality = data.get('nationality')
                
                if name != 'Aurelia':
                    print(f"✗ FAIL: Person JSON-LD name should be 'Aurelia', got '{name}'")
                    return False
                print(f"✓ Person JSON-LD found with name='Aurelia'")
                
                if nationality:
                    print(f"✓ Person JSON-LD has nationality field: {nationality}")
                else:
                    print(f"⚠ WARNING: Person JSON-LD missing nationality field")
                
            elif data.get('@type') == 'BreadcrumbList':
                breadcrumb_found = True
                print(f"✓ BreadcrumbList JSON-LD found")
        except:
            pass
    
    if not person_found:
        print(f"✗ FAIL: No Person JSON-LD found")
        return False
    
    if not breadcrumb_found:
        print(f"✗ FAIL: No BreadcrumbList JSON-LD found")
        return False
    
    # Check canonical
    if seo['canonicals'][0] != f"{BASE_URL}/models/aurelia":
        print(f"✗ FAIL: Canonical should be {BASE_URL}/models/aurelia, got {seo['canonicals'][0]}")
        return False
    print(f"✓ Canonical is /models/aurelia")
    
    # Check hreflang en points to /en/models/aurelia
    hreflang_en = [h for h in seo['hreflangs'] if h['hreflang'] == 'en']
    if not hreflang_en or '/en/models/aurelia' not in hreflang_en[0]['href']:
        print(f"✗ FAIL: Hreflang en should point to /en/models/aurelia")
        return False
    print(f"✓ Hreflang en points to /en/models/aurelia")
    
    # Check meta description contains Aurelia bio text
    meta_desc = seo['meta_descriptions'][0]
    if 'Aurelia' not in meta_desc and 'Hanseatisch' not in meta_desc:
        print(f"⚠ WARNING: Meta description doesn't contain 'Aurelia' or 'Hanseatisch'")
    else:
        print(f"✓ Meta description contains Aurelia bio text")
    
    print(f"\n✓✓✓ PASS: GET /models/aurelia (DE)")
    return True

def test_models_404_de():
    """Test 3: GET /models/does-not-exist"""
    url = f"{BASE_URL}/models/does-not-exist"
    result = test_url(url, expected_status=404, test_name='GET /models/does-not-exist (404)')
    
    if result:
        print(f"\n✓✓✓ PASS: GET /models/does-not-exist returns 404")
    return result

def test_models_list_en():
    """Test 4: GET /en/models"""
    url = f"{BASE_URL}/en/models"
    result = test_url(url, expected_lang='en', test_name='GET /en/models (EN)')
    
    if not result:
        return False
    
    # Additional checks
    response = requests.get(url, timeout=30)
    html = response.text
    seo = extract_seo_elements(html)
    
    # Check for ItemList JSON-LD with /en/models/ URLs
    item_list_found = False
    
    for block in seo['json_ld_blocks']:
        try:
            data = json.loads(block['content'])
            if data.get('@type') == 'ItemList':
                item_list_found = True
                items = data.get('itemListElement', [])
                
                # Check if URLs contain /en/models/
                sample_url = items[0].get('url', '') if items else ''
                if '/en/models/' not in sample_url:
                    print(f"✗ FAIL: ItemList URLs should contain /en/models/, got {sample_url}")
                    return False
                print(f"✓ ItemList references /en/models/ URLs")
        except:
            pass
    
    if not item_list_found:
        print(f"✗ FAIL: No ItemList JSON-LD found")
        return False
    
    # Check canonical
    if seo['canonicals'][0] != f"{BASE_URL}/en/models":
        print(f"✗ FAIL: Canonical should be {BASE_URL}/en/models, got {seo['canonicals'][0]}")
        return False
    print(f"✓ Canonical is /en/models")
    
    print(f"\n✓✓✓ PASS: GET /en/models (EN)")
    return True

def test_models_detail_en():
    """Test 5: GET /en/models/aurelia"""
    url = f"{BASE_URL}/en/models/aurelia"
    result = test_url(url, expected_lang='en', test_name='GET /en/models/aurelia (EN)')
    
    if not result:
        return False
    
    # Additional checks
    response = requests.get(url, timeout=30)
    html = response.text
    seo = extract_seo_elements(html)
    
    # Check for Person JSON-LD
    person_found = False
    
    for block in seo['json_ld_blocks']:
        try:
            data = json.loads(block['content'])
            if data.get('@type') == 'Person':
                person_found = True
                print(f"✓ Person JSON-LD found")
        except:
            pass
    
    if not person_found:
        print(f"✗ FAIL: No Person JSON-LD found")
        return False
    
    # Check canonical
    if seo['canonicals'][0] != f"{BASE_URL}/en/models/aurelia":
        print(f"✗ FAIL: Canonical should be {BASE_URL}/en/models/aurelia, got {seo['canonicals'][0]}")
        return False
    print(f"✓ Canonical is /en/models/aurelia")
    
    # Check hreflang de-DE points to /models/aurelia
    hreflang_de = [h for h in seo['hreflangs'] if h['hreflang'] == 'de-DE']
    if not hreflang_de or '/models/aurelia' not in hreflang_de[0]['href']:
        print(f"✗ FAIL: Hreflang de-DE should point to /models/aurelia")
        return False
    print(f"✓ Hreflang de-DE points to /models/aurelia")
    
    print(f"\n✓✓✓ PASS: GET /en/models/aurelia (EN)")
    return True

def test_models_404_en():
    """Test 6: GET /en/models/does-not-exist"""
    url = f"{BASE_URL}/en/models/does-not-exist"
    result = test_url(url, expected_status=404, test_name='GET /en/models/does-not-exist (404)')
    
    if result:
        print(f"\n✓✓✓ PASS: GET /en/models/does-not-exist returns 404")
    return result

def test_sitemap():
    """Test 7: GET /sitemap.xml"""
    url = f"{BASE_URL}/sitemap.xml"
    print(f"\n{'='*80}")
    print(f"TEST: GET /sitemap.xml")
    print(f"URL: {url}")
    print(f"{'='*80}")
    
    try:
        response = requests.get(url, timeout=30)
        print(f"✓ HTTP Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"✗ FAIL: Expected 200, got {response.status_code}")
            return False
        
        # Check content-type
        content_type = response.headers.get('content-type', '')
        if 'xml' not in content_type.lower():
            print(f"✗ FAIL: Content-Type should include 'xml', got '{content_type}'")
            return False
        print(f"✓ Content-Type includes 'xml': {content_type}")
        
        # Parse XML
        xml_text = response.text
        root = ET.fromstring(xml_text)
        
        # Define namespace
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
              'xhtml': 'http://www.w3.org/1999/xhtml'}
        
        # Count total <loc> entries
        locs = root.findall('.//ns:loc', ns)
        total_locs = len(locs)
        print(f"✓ Total <loc> entries: {total_locs}")
        
        if total_locs != 67:
            print(f"✗ FAIL: Expected 67 <loc> entries, got {total_locs}")
            return False
        print(f"✓ Total <loc> count is 67")
        
        # Count by resource type
        services_count = sum(1 for loc in locs if '/services/' in loc.text and '/en/services/' not in loc.text)
        models_count = sum(1 for loc in locs if '/models/' in loc.text and '/en/models/' not in loc.text)
        blog_count = sum(1 for loc in locs if '/blog/' in loc.text and '/en/blog/' not in loc.text)
        pages_count = sum(1 for loc in locs if '/p/' in loc.text and '/en/p/' not in loc.text)
        areas_count = sum(1 for loc in locs if '/escort/' in loc.text and '/en/escort/' not in loc.text)
        
        # Count static entries (those not in the above categories)
        static_count = total_locs - services_count - models_count - blog_count - pages_count - areas_count
        
        print(f"\nBreakdown by resource type:")
        print(f"  Services: {services_count}")
        print(f"  Models: {models_count}")
        print(f"  Blog: {blog_count}")
        print(f"  Pages: {pages_count}")
        print(f"  Areas: {areas_count}")
        print(f"  Static: {static_count}")
        
        # Verify expected counts
        if services_count != 8:
            print(f"✗ FAIL: Expected 8 services, got {services_count}")
            return False
        print(f"✓ Services count is 8")
        
        if models_count != 14:
            print(f"✗ FAIL: Expected 14 models, got {models_count}")
            return False
        print(f"✓ Models count is 14")
        
        if blog_count != 13:
            print(f"✗ FAIL: Expected 13 blog posts, got {blog_count}")
            return False
        print(f"✓ Blog count is 13")
        
        if pages_count != 4:
            print(f"✗ FAIL: Expected 4 pages, got {pages_count}")
            return False
        print(f"✓ Pages count is 4")
        
        if areas_count != 18:
            print(f"✗ FAIL: Expected 18 areas, got {areas_count}")
            return False
        print(f"✓ Areas count is 18")
        
        # Static should be 10 (but let's verify the actual count)
        print(f"✓ Static count is {static_count}")
        
        # Verify each model entry has hreflang="en" pointing to /en/models/{slug}
        model_urls = root.findall('.//ns:url', ns)
        model_entries_checked = 0
        
        for url_elem in model_urls:
            loc_elem = url_elem.find('ns:loc', ns)
            if loc_elem is not None and '/models/' in loc_elem.text and '/en/models/' not in loc_elem.text:
                # This is a DE model entry, check for EN hreflang
                alternates = url_elem.findall('.//xhtml:link[@rel="alternate"]', ns)
                en_alternate = None
                
                for alt in alternates:
                    if alt.get('hreflang') == 'en':
                        en_alternate = alt.get('href')
                        break
                
                if not en_alternate:
                    print(f"✗ FAIL: Model entry {loc_elem.text} missing hreflang='en' alternate")
                    return False
                
                if '/en/models/' not in en_alternate:
                    print(f"✗ FAIL: Model entry {loc_elem.text} hreflang='en' should point to /en/models/, got {en_alternate}")
                    return False
                
                model_entries_checked += 1
        
        if model_entries_checked != 14:
            print(f"✗ FAIL: Expected to check 14 model entries, checked {model_entries_checked}")
            return False
        print(f"✓ All 14 model entries have hreflang='en' pointing to /en/models/{{slug}}")
        
        print(f"\n✓✓✓ PASS: GET /sitemap.xml")
        return True
        
    except Exception as e:
        print(f"✗ EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_regression():
    """Test 8-11: Regression tests"""
    print(f"\n{'='*80}")
    print(f"REGRESSION TESTS")
    print(f"{'='*80}")
    
    results = []
    
    # Test 8: GET /services/vip-escort-hamburg
    url = f"{BASE_URL}/services/vip-escort-hamburg"
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            print(f"✓ GET /services/vip-escort-hamburg → 200")
            results.append(True)
        else:
            print(f"✗ GET /services/vip-escort-hamburg → {response.status_code}")
            results.append(False)
    except Exception as e:
        print(f"✗ GET /services/vip-escort-hamburg → EXCEPTION: {e}")
        results.append(False)
    
    # Test 9: GET /api/health
    url = f"{BASE_URL}/api/health"
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                print(f"✓ GET /api/health → 200 with status='ok'")
                results.append(True)
            else:
                print(f"✗ GET /api/health → 200 but status != 'ok'")
                results.append(False)
        else:
            print(f"✗ GET /api/health → {response.status_code}")
            results.append(False)
    except Exception as e:
        print(f"✗ GET /api/health → EXCEPTION: {e}")
        results.append(False)
    
    # Test 10: GET /api/models
    url = f"{BASE_URL}/api/models"
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if len(data) == 14:
                print(f"✓ GET /api/models → 200 with 14 items")
                results.append(True)
            else:
                print(f"✗ GET /api/models → 200 but {len(data)} items (expected 14)")
                results.append(False)
        else:
            print(f"✗ GET /api/models → {response.status_code}")
            results.append(False)
    except Exception as e:
        print(f"✗ GET /api/models → EXCEPTION: {e}")
        results.append(False)
    
    # Test 11: GET /robots.txt
    url = f"{BASE_URL}/robots.txt"
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            text = response.text
            # Case-insensitive check for sitemap
            if 'sitemap' in text.lower() and '.xml' in text.lower():
                print(f"✓ GET /robots.txt → 200 and lists sitemap.xml")
                results.append(True)
            else:
                print(f"✗ GET /robots.txt → 200 but doesn't list sitemap.xml")
                print(f"  Content preview: {text[:200]}")
                results.append(False)
        else:
            print(f"✗ GET /robots.txt → {response.status_code}")
            results.append(False)
    except Exception as e:
        print(f"✗ GET /robots.txt → EXCEPTION: {e}")
        results.append(False)
    
    if all(results):
        print(f"\n✓✓✓ PASS: All regression tests passed")
        return True
    else:
        print(f"\n✗ FAIL: Some regression tests failed")
        return False

def main():
    """Run all tests"""
    print(f"\n{'#'*80}")
    print(f"# Phase 3 d1: Public /models SSR + EN twins + sitemap")
    print(f"# Base URL: {BASE_URL}")
    print(f"{'#'*80}\n")
    
    results = {
        'test_1_models_list_de': test_models_list_de(),
        'test_2_models_detail_de': test_models_detail_de(),
        'test_3_models_404_de': test_models_404_de(),
        'test_4_models_list_en': test_models_list_en(),
        'test_5_models_detail_en': test_models_detail_en(),
        'test_6_models_404_en': test_models_404_en(),
        'test_7_sitemap': test_sitemap(),
        'test_8_11_regression': test_regression(),
    }
    
    print(f"\n{'#'*80}")
    print(f"# FINAL RESULTS")
    print(f"{'#'*80}\n")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed")
    print(f"{'='*80}\n")
    
    if passed == total:
        print("✓✓✓ ALL TESTS PASSED ✓✓✓")
        return 0
    else:
        print("✗✗✗ SOME TESTS FAILED ✗✗✗")
        return 1

if __name__ == '__main__':
    exit(main())
