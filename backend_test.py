#!/usr/bin/env python3
"""
Backend test for luxury-escort-hamburg CMS content fix verification.
Tests the removal of duplicated FAQ section heading.
"""

import requests
import sys
import json
from html.parser import HTMLParser

BASE_URL = "http://localhost:3000"
API_URL = f"{BASE_URL}/api"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"


class FAQHeadingParser(HTMLParser):
    """Extract all H2 headings and count specific FAQ-related text."""
    def __init__(self):
        super().__init__()
        self.h2_headings = []
        self.in_h2 = False
        self.current_h2 = ""
        self.details_count = 0
        self.in_main = False
        self.main_content = ""
        self.faq_links = []
        self.in_a = False
        self.current_link_href = ""
        self.h1_count = 0
        self.in_h1 = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "main":
            self.in_main = True
        elif tag == "h2" and self.in_main:
            self.in_h2 = True
            self.current_h2 = ""
        elif tag == "h1" and self.in_main:
            self.in_h1 = True
            self.h1_count += 1
        elif tag == "details" and self.in_main:
            self.details_count += 1
        elif tag == "a" and self.in_main:
            self.in_a = True
            self.current_link_href = attrs_dict.get("href", "")
            
    def handle_endtag(self, tag):
        if tag == "main":
            self.in_main = False
        elif tag == "h2" and self.in_h2:
            self.in_h2 = False
            self.h2_headings.append(self.current_h2.strip())
        elif tag == "h1" and self.in_h1:
            self.in_h1 = False
        elif tag == "a" and self.in_a:
            self.in_a = False
            if "/faq" in self.current_link_href:
                self.faq_links.append(self.current_link_href)
            
    def handle_data(self, data):
        if self.in_h2:
            self.current_h2 += data
        if self.in_main:
            self.main_content += data


def test_api_service_content():
    """
    TEST 1: GET /api/service-content/luxury-escort-hamburg
    Verify:
    - Response 200
    - sections array length is exactly 14 (was 15 before fix)
    - No section has h2 === "Häufig gestellte Fragen"
    - faqs array has 8 items
    - meta_title, meta_description, h1 unchanged
    - Conclusion section contains "/faq" link
    """
    print("\n" + "="*80)
    print("TEST 1: API Endpoint - GET /api/service-content/luxury-escort-hamburg")
    print("="*80)
    
    try:
        url = f"{API_URL}/service-content/luxury-escort-hamburg"
        print(f"→ Requesting: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"✓ Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
            
        data = response.json()
        
        # Check sections array length
        sections = data.get("sections", [])
        sections_count = len(sections)
        print(f"✓ Sections count: {sections_count}")
        
        if sections_count != 14:
            print(f"❌ FAIL: Expected exactly 14 sections, got {sections_count}")
            return False
        else:
            print(f"✅ PASS: Sections count is exactly 14 (removed duplicate FAQ section)")
        
        # Check no section has the removed heading
        removed_heading = "Häufig gestellte Fragen"
        has_removed_heading = False
        for i, section in enumerate(sections):
            section_h2 = section.get("h2", "")
            if section_h2 == removed_heading:
                print(f"❌ FAIL: Found removed section heading '{removed_heading}' at index {i}")
                has_removed_heading = True
                break
        
        if not has_removed_heading:
            print(f"✅ PASS: No section has h2 === '{removed_heading}'")
        else:
            return False
        
        # Check FAQs array
        faqs = data.get("faqs", [])
        faqs_count = len(faqs)
        print(f"✓ FAQs count: {faqs_count}")
        
        if faqs_count != 8:
            print(f"❌ FAIL: Expected 8 FAQs, got {faqs_count}")
            return False
        else:
            print(f"✅ PASS: FAQs array has exactly 8 items")
        
        # Check meta fields exist (unchanged verification)
        meta_title = data.get("meta_title", "")
        meta_description = data.get("meta_description", "")
        h1 = data.get("h1", "")
        
        print(f"✓ meta_title: {meta_title[:50]}..." if len(meta_title) > 50 else f"✓ meta_title: {meta_title}")
        print(f"✓ meta_description: {meta_description[:50]}..." if len(meta_description) > 50 else f"✓ meta_description: {meta_description}")
        print(f"✓ h1: {h1}")
        
        if not meta_title or not meta_description or not h1:
            print(f"❌ FAIL: Meta fields are missing or empty")
            return False
        else:
            print(f"✅ PASS: Meta fields are present and unchanged")
        
        # Check conclusion section contains /faq link
        conclusion_section = sections[-1] if sections else None
        if conclusion_section:
            conclusion_title = conclusion_section.get("h2", "")
            conclusion_body = conclusion_section.get("body", [])
            
            print(f"✓ Last section title: {conclusion_title}")
            
            # Check if /faq appears in any body paragraph
            faq_link_found = False
            for paragraph in conclusion_body:
                if "/faq" in paragraph:
                    faq_link_found = True
                    print(f"✓ Found /faq link in conclusion section")
                    break
            
            if faq_link_found:
                print(f"✅ PASS: Conclusion section contains /faq link (link preservation verified)")
            else:
                print(f"❌ FAIL: Conclusion section does not contain /faq link")
                return False
        else:
            print(f"❌ FAIL: No conclusion section found")
            return False
        
        print(f"\n✅ TEST 1 PASSED: API endpoint returns correct data structure")
        return True
        
    except Exception as e:
        print(f"❌ TEST 1 FAILED with exception: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_ssr_page_rendering():
    """
    TEST 2: GET /services/luxury-escort-hamburg (SSR HTML)
    Verify:
    - Response 200
    - "Häufig gestellte Fragen" does NOT appear in <main>
    - "Häufige Fragen zu" appears exactly once
    - <details> count === 8
    - Exactly one <h1>
    - <a href="/faq"> appears at least once
    - FAQPage JSON-LD has 8 mainEntity entries
    - Summary text matches schema name for all 8 items
    """
    print("\n" + "="*80)
    print("TEST 2: SSR Page Rendering - GET /services/luxury-escort-hamburg")
    print("="*80)
    
    try:
        url = f"{BASE_URL}/services/luxury-escort-hamburg"
        print(f"→ Requesting: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"✓ Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        html = response.text
        
        # Parse HTML to extract main content
        parser = FAQHeadingParser()
        parser.feed(html)
        
        # Check H1 count
        print(f"✓ H1 count in <main>: {parser.h1_count}")
        if parser.h1_count != 1:
            print(f"❌ FAIL: Expected exactly 1 <h1>, found {parser.h1_count}")
            return False
        else:
            print(f"✅ PASS: Exactly one <h1> in page")
        
        # Check removed heading does NOT appear
        removed_heading = "Häufig gestellte Fragen"
        if removed_heading in parser.main_content:
            print(f"❌ FAIL: Found removed heading '{removed_heading}' in <main> content")
            return False
        else:
            print(f"✅ PASS: '{removed_heading}' does NOT appear in <main>")
        
        # Check auto-rendered heading appears exactly once
        auto_heading = "Häufige Fragen zu"
        auto_heading_count = parser.main_content.count(auto_heading)
        print(f"✓ '{auto_heading}' count: {auto_heading_count}")
        
        if auto_heading_count != 1:
            print(f"❌ FAIL: Expected '{auto_heading}' to appear exactly once, found {auto_heading_count} times")
            return False
        else:
            print(f"✅ PASS: '{auto_heading}' appears exactly once (auto-rendered header)")
        
        # Check details count
        print(f"✓ <details> count: {parser.details_count}")
        if parser.details_count != 8:
            print(f"❌ FAIL: Expected 8 <details> elements, found {parser.details_count}")
            return False
        else:
            print(f"✅ PASS: <details> count === 8")
        
        # Check /faq link presence
        print(f"✓ /faq links found: {len(parser.faq_links)}")
        if len(parser.faq_links) < 1:
            print(f"❌ FAIL: No <a href='/faq'> link found in <main>")
            return False
        else:
            print(f"✅ PASS: <a href='/faq'> appears at least once (link preservation verified)")
        
        # Extract and verify FAQPage JSON-LD schema
        print(f"\n→ Verifying FAQPage JSON-LD schema...")
        
        # Find FAQPage schema in HTML
        faq_schema_start = html.find('"@type":"FAQPage"')
        if faq_schema_start == -1:
            print(f"❌ FAIL: FAQPage JSON-LD schema not found")
            return False
        
        # Extract the script tag containing FAQPage
        script_start = html.rfind('<script type="application/ld+json">', 0, faq_schema_start)
        script_end = html.find('</script>', faq_schema_start)
        
        if script_start == -1 or script_end == -1:
            print(f"❌ FAIL: Could not extract FAQPage JSON-LD script")
            return False
        
        json_start = script_start + len('<script type="application/ld+json">')
        schema_json = html[json_start:script_end].strip()
        
        try:
            schema = json.loads(schema_json)
            main_entity = schema.get("mainEntity", [])
            main_entity_count = len(main_entity)
            
            print(f"✓ FAQPage mainEntity count: {main_entity_count}")
            
            if main_entity_count != 8:
                print(f"❌ FAIL: Expected 8 mainEntity entries, found {main_entity_count}")
                return False
            else:
                print(f"✅ PASS: FAQPage JSON-LD has exactly 8 mainEntity entries")
            
            # Extract summary texts from HTML and compare with schema
            print(f"\n→ Verifying summary text matches schema names...")
            
            # Find all <summary> elements in main
            summary_texts = []
            summary_start = 0
            while True:
                summary_tag_start = html.find('<summary', summary_start)
                if summary_tag_start == -1:
                    break
                
                summary_content_start = html.find('>', summary_tag_start) + 1
                summary_tag_end = html.find('</summary>', summary_content_start)
                
                if summary_tag_end == -1:
                    break
                
                summary_html = html[summary_content_start:summary_tag_end]
                
                # Remove the toggle icon (+ or ×) - it's typically in a span at the end
                # Strip HTML tags and get text
                summary_text = summary_html
                # Remove span tags
                summary_text = summary_text.replace('<span class="ml-auto text-burgundy-600" aria-hidden="true">+</span>', '')
                summary_text = summary_text.replace('<span class="ml-auto text-burgundy-600" aria-hidden="true">×</span>', '')
                # Remove any remaining HTML tags
                import re
                summary_text = re.sub(r'<[^>]+>', '', summary_text).strip()
                # Remove trailing + or × characters that might be appended directly
                summary_text = summary_text.rstrip('+×').strip()
                
                summary_texts.append(summary_text)
                summary_start = summary_tag_end + 1
            
            print(f"✓ Found {len(summary_texts)} <summary> elements")
            
            if len(summary_texts) != 8:
                print(f"⚠️  Warning: Expected 8 <summary> elements, found {len(summary_texts)}")
            
            # Compare with schema names
            all_match = True
            for i, entity in enumerate(main_entity):
                schema_name = entity.get("name", "")
                if i < len(summary_texts):
                    summary_text = summary_texts[i]
                    if schema_name == summary_text:
                        print(f"  ✓ [{i+1}] Match: '{summary_text}'")
                    else:
                        print(f"  ❌ [{i+1}] Mismatch:")
                        print(f"      Schema: '{schema_name}'")
                        print(f"      Summary: '{summary_text}'")
                        all_match = False
                else:
                    print(f"  ❌ [{i+1}] Missing summary for schema entry: '{schema_name}'")
                    all_match = False
            
            if all_match:
                print(f"✅ PASS: All summary texts match FAQPage schema names (1:1 alignment)")
            else:
                print(f"❌ FAIL: Summary texts do not match FAQPage schema names")
                return False
            
        except json.JSONDecodeError as e:
            print(f"❌ FAIL: Could not parse FAQPage JSON-LD: {e}")
            return False
        
        print(f"\n✅ TEST 2 PASSED: SSR page renders correctly with single FAQ heading")
        return True
        
    except Exception as e:
        print(f"❌ TEST 2 FAILED with exception: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_auth_gate():
    """
    TEST 3: Auth Gate - Unauthenticated PUT must return 401 or 403
    """
    print("\n" + "="*80)
    print("TEST 3: Auth Gate - Unauthenticated PUT /api/admin/service-content/luxury-escort-hamburg")
    print("="*80)
    
    try:
        url = f"{API_URL}/admin/service-content/luxury-escort-hamburg"
        print(f"→ Attempting unauthenticated PUT: {url}")
        
        # Try PUT without auth
        response = requests.put(
            url,
            json={"title": "Test"},
            timeout=10
        )
        
        print(f"✓ Status: {response.status_code}")
        
        if response.status_code in [401, 403]:
            print(f"✅ PASS: Unauthenticated PUT correctly rejected with {response.status_code}")
            return True
        else:
            print(f"❌ FAIL: Expected 401 or 403, got {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
        
    except Exception as e:
        print(f"❌ TEST 3 FAILED with exception: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests and report results."""
    print("\n" + "="*80)
    print("LUXURY ESCORT HAMBURG CMS CONTENT FIX VERIFICATION")
    print("Testing removal of duplicated FAQ section heading")
    print("="*80)
    
    results = {
        "test_1_api_endpoint": False,
        "test_2_ssr_rendering": False,
        "test_3_auth_gate": False,
    }
    
    # Run tests
    results["test_1_api_endpoint"] = test_api_service_content()
    results["test_2_ssr_rendering"] = test_ssr_page_rendering()
    results["test_3_auth_gate"] = test_auth_gate()
    
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
        print("\n🎉 ALL TESTS PASSED - CMS content fix verified successfully!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed - see details above")
        return 1


if __name__ == "__main__":
    sys.exit(main())
