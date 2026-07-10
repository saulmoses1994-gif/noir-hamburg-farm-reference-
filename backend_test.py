#!/usr/bin/env python3
"""
Phase 1 Backend Testing for Noir Hamburg Next.js Migration
Tests all read-only Route Handlers under /api/*
"""
import requests
import json
import os
from typing import Dict, Any, List

# Load base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://noir-migration.preview.emergentagent.com')

# Expected service slugs
EXPECTED_SERVICE_SLUGS = [
    'luxury-escort-hamburg',
    'vip-escort-hamburg',
    'business-escort-hamburg',
    'dinner-companion-hamburg',
    'hotel-escort-hamburg',
    'event-escort-hamburg',
    'travel-companion-hamburg',
    'girlfriend-experience-hamburg'
]

class TestResult:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed.append(f"✅ {test_name}" + (f": {details}" if details else ""))
        print(f"✅ PASS: {test_name}" + (f" - {details}" if details else ""))
    
    def add_fail(self, test_name: str, details: str):
        self.failed.append(f"❌ {test_name}: {details}")
        print(f"❌ FAIL: {test_name}: {details}")
    
    def add_warning(self, test_name: str, details: str):
        self.warnings.append(f"⚠️  {test_name}: {details}")
        print(f"⚠️  WARNING: {test_name}: {details}")
    
    def summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"Passed: {len(self.passed)}")
        print(f"Failed: {len(self.failed)}")
        print(f"Warnings: {len(self.warnings)}")
        print("="*80)
        
        if self.failed:
            print("\nFAILURES:")
            for f in self.failed:
                print(f)
        
        if self.warnings:
            print("\nWARNINGS:")
            for w in self.warnings:
                print(w)
        
        return len(self.failed) == 0

def test_health(result: TestResult):
    """Test 1: GET /api/health"""
    print("\n[TEST 1] GET /api/health")
    try:
        resp = requests.get(f"{BASE_URL}/api/health", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/health", f"Expected 200, got {resp.status_code}")
            return
        
        data = resp.json()
        
        # Check required fields
        if data.get('status') != 'ok':
            result.add_fail("GET /api/health", f"Expected status='ok', got {data.get('status')}")
            return
        
        if data.get('service') != 'noir-hamburg-nextjs':
            result.add_fail("GET /api/health", f"Expected service='noir-hamburg-nextjs', got {data.get('service')}")
            return
        
        if 'time' not in data:
            result.add_fail("GET /api/health", "Missing 'time' field")
            return
        
        # Verify time is ISO format
        try:
            from datetime import datetime
            datetime.fromisoformat(data['time'].replace('Z', '+00:00'))
        except:
            result.add_warning("GET /api/health", f"Time field not in ISO format: {data['time']}")
        
        result.add_pass("GET /api/health", f"status={data['status']}, service={data['service']}")
        
    except Exception as e:
        result.add_fail("GET /api/health", f"Exception: {str(e)}")

def test_service_content_list(result: TestResult):
    """Test 2: GET /api/service-content (list + lazy seed)"""
    print("\n[TEST 2] GET /api/service-content")
    try:
        resp = requests.get(f"{BASE_URL}/api/service-content", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/service-content", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return None
        
        data = resp.json()
        
        if not isinstance(data, list):
            result.add_fail("GET /api/service-content", f"Expected array, got {type(data)}")
            return None
        
        if len(data) != 8:
            result.add_fail("GET /api/service-content", f"Expected 8 items, got {len(data)}")
            return None
        
        # Check each item has required fields
        for idx, item in enumerate(data):
            required_fields = ['slug', 'title', 'h1', 'tagline', 'description', 
                             'meta_title', 'meta_description', 'sections', 'faqs']
            missing = [f for f in required_fields if f not in item]
            if missing:
                result.add_fail("GET /api/service-content", f"Item {idx} missing fields: {missing}")
                return None
            
            # Check sections and faqs are arrays
            if not isinstance(item['sections'], list):
                result.add_fail("GET /api/service-content", f"Item {idx} sections is not array")
                return None
            if not isinstance(item['faqs'], list):
                result.add_fail("GET /api/service-content", f"Item {idx} faqs is not array")
                return None
        
        # Verify all expected slugs are present
        actual_slugs = [item['slug'] for item in data]
        missing_slugs = [s for s in EXPECTED_SERVICE_SLUGS if s not in actual_slugs]
        if missing_slugs:
            result.add_fail("GET /api/service-content", f"Missing slugs: {missing_slugs}")
            return None
        
        # Check for _id field (should be stripped)
        has_id = any('_id' in item for item in data)
        if has_id:
            result.add_warning("GET /api/service-content", "Response contains _id field (should be stripped)")
        
        result.add_pass("GET /api/service-content", f"8 items with all required fields and expected slugs")
        return data
        
    except Exception as e:
        result.add_fail("GET /api/service-content", f"Exception: {str(e)}")
        return None

def test_service_content_single(result: TestResult):
    """Test 3: GET /api/service-content/vip-escort-hamburg"""
    print("\n[TEST 3] GET /api/service-content/vip-escort-hamburg")
    try:
        resp = requests.get(f"{BASE_URL}/api/service-content/vip-escort-hamburg", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/service-content/{slug}", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return
        
        data = resp.json()
        
        if not isinstance(data, dict):
            result.add_fail("GET /api/service-content/{slug}", f"Expected object, got {type(data)}")
            return
        
        if data.get('slug') != 'vip-escort-hamburg':
            result.add_fail("GET /api/service-content/{slug}", f"Expected slug='vip-escort-hamburg', got {data.get('slug')}")
            return
        
        # Check sections array
        if 'sections' not in data or not isinstance(data['sections'], list):
            result.add_fail("GET /api/service-content/{slug}", "Missing or invalid 'sections' array")
            return
        
        if len(data['sections']) == 0:
            result.add_fail("GET /api/service-content/{slug}", "sections array is empty")
            return
        
        # Check section structure
        for idx, section in enumerate(data['sections']):
            required = ['h2', 'h2_en', 'body', 'body_en']
            missing = [f for f in required if f not in section]
            if missing:
                result.add_fail("GET /api/service-content/{slug}", f"Section {idx} missing: {missing}")
                return
            if not isinstance(section['body'], list) or not isinstance(section['body_en'], list):
                result.add_fail("GET /api/service-content/{slug}", f"Section {idx} body/body_en not arrays")
                return
        
        # Check faqs array
        if 'faqs' not in data or not isinstance(data['faqs'], list):
            result.add_fail("GET /api/service-content/{slug}", "Missing or invalid 'faqs' array")
            return
        
        if len(data['faqs']) == 0:
            result.add_fail("GET /api/service-content/{slug}", "faqs array is empty")
            return
        
        # Check FAQ structure
        for idx, faq in enumerate(data['faqs']):
            required = ['q', 'q_en', 'a', 'a_en']
            missing = [f for f in required if f not in faq]
            if missing:
                result.add_fail("GET /api/service-content/{slug}", f"FAQ {idx} missing: {missing}")
                return
        
        # Check for _id field
        if '_id' in data:
            result.add_fail("GET /api/service-content/{slug}", "Response contains _id field (should be stripped)")
            return
        
        result.add_pass("GET /api/service-content/{slug}", f"{len(data['sections'])} sections, {len(data['faqs'])} FAQs, no _id")
        
    except Exception as e:
        result.add_fail("GET /api/service-content/{slug}", f"Exception: {str(e)}")

def test_service_content_404(result: TestResult):
    """Test 4: GET /api/service-content/does-not-exist"""
    print("\n[TEST 4] GET /api/service-content/does-not-exist")
    try:
        resp = requests.get(f"{BASE_URL}/api/service-content/does-not-exist", timeout=10)
        
        if resp.status_code != 404:
            result.add_fail("GET /api/service-content/nonexistent", f"Expected 404, got {resp.status_code}")
            return
        
        data = resp.json()
        
        if 'detail' not in data:
            result.add_fail("GET /api/service-content/nonexistent", "404 response missing 'detail' field")
            return
        
        result.add_pass("GET /api/service-content/nonexistent", f"404 with detail: {data['detail']}")
        
    except Exception as e:
        result.add_fail("GET /api/service-content/nonexistent", f"Exception: {str(e)}")

def test_area_content_list(result: TestResult):
    """Test 5: GET /api/area-content"""
    print("\n[TEST 5] GET /api/area-content")
    try:
        resp = requests.get(f"{BASE_URL}/api/area-content", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/area-content", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return None
        
        data = resp.json()
        
        if not isinstance(data, list):
            result.add_fail("GET /api/area-content", f"Expected array, got {type(data)}")
            return None
        
        if len(data) != 18:
            result.add_fail("GET /api/area-content", f"Expected 18 items, got {len(data)}")
            return None
        
        # Check structure
        for idx, item in enumerate(data):
            required_fields = ['slug', 'name', 'title', 'intro', 'description', 'faqs']
            missing = [f for f in required_fields if f not in item]
            if missing:
                result.add_fail("GET /api/area-content", f"Item {idx} missing fields: {missing}")
                return None
        
        result.add_pass("GET /api/area-content", f"18 items with required fields")
        return data
        
    except Exception as e:
        result.add_fail("GET /api/area-content", f"Exception: {str(e)}")
        return None

def test_area_content_single(result: TestResult, areas: List[Dict]):
    """Test 6: GET /api/area-content/{slug}"""
    print("\n[TEST 6] GET /api/area-content/{slug}")
    
    # Use first available slug from the list, or default to hafencity
    test_slug = 'hafencity'
    if areas and len(areas) > 0:
        test_slug = areas[0]['slug']
    
    try:
        resp = requests.get(f"{BASE_URL}/api/area-content/{test_slug}", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/area-content/{slug}", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return
        
        data = resp.json()
        
        if not isinstance(data, dict):
            result.add_fail("GET /api/area-content/{slug}", f"Expected object, got {type(data)}")
            return
        
        if data.get('slug') != test_slug:
            result.add_fail("GET /api/area-content/{slug}", f"Expected slug='{test_slug}', got {data.get('slug')}")
            return
        
        result.add_pass("GET /api/area-content/{slug}", f"Retrieved {test_slug}")
        
    except Exception as e:
        result.add_fail("GET /api/area-content/{slug}", f"Exception: {str(e)}")

def test_settings(result: TestResult):
    """Test 7: GET /api/settings"""
    print("\n[TEST 7] GET /api/settings")
    try:
        resp = requests.get(f"{BASE_URL}/api/settings", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/settings", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return
        
        data = resp.json()
        
        if not isinstance(data, dict):
            result.add_fail("GET /api/settings", f"Expected object, got {type(data)}")
            return
        
        # Check required fields
        required = {
            'site_name': 'Noir Hamburg',
            'email': 'kontakt@noir-hamburg.de',
        }
        
        for field, expected_value in required.items():
            if field not in data:
                result.add_fail("GET /api/settings", f"Missing field: {field}")
                return
            if data[field] != expected_value:
                result.add_fail("GET /api/settings", f"Expected {field}='{expected_value}', got '{data[field]}'")
                return
        
        # Check other expected fields exist
        other_fields = ['phone', 'whatsappUrl', 'hours_de', 'hours_en']
        missing = [f for f in other_fields if f not in data]
        if missing:
            result.add_fail("GET /api/settings", f"Missing fields: {missing}")
            return
        
        # Check for _id field
        if '_id' in data:
            result.add_fail("GET /api/settings", "Response contains _id field (should be stripped)")
            return
        
        result.add_pass("GET /api/settings", "All required fields present, no _id")
        
    except Exception as e:
        result.add_fail("GET /api/settings", f"Exception: {str(e)}")

def test_empty_collections(result: TestResult):
    """Test 8-10: GET /api/models, /api/blog, /api/pages"""
    print("\n[TEST 8-10] Empty collections")
    
    endpoints = ['/api/models', '/api/blog', '/api/pages']
    
    for endpoint in endpoints:
        try:
            resp = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            
            if resp.status_code != 200:
                result.add_fail(f"GET {endpoint}", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
                continue
            
            data = resp.json()
            
            if not isinstance(data, list):
                result.add_fail(f"GET {endpoint}", f"Expected array, got {type(data)}")
                continue
            
            if len(data) != 0:
                result.add_warning(f"GET {endpoint}", f"Expected empty array, got {len(data)} items")
            else:
                result.add_pass(f"GET {endpoint}", "Empty array []")
            
        except Exception as e:
            result.add_fail(f"GET {endpoint}", f"Exception: {str(e)}")

def test_sitemap_xml(result: TestResult):
    """Test 11: GET /sitemap.xml"""
    print("\n[TEST 11] GET /sitemap.xml")
    try:
        resp = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /sitemap.xml", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return
        
        content_type = resp.headers.get('content-type', '')
        if 'xml' not in content_type.lower():
            result.add_warning("GET /sitemap.xml", f"Content-Type '{content_type}' does not include 'xml'")
        
        body = resp.text
        
        if not body.startswith('<?xml'):
            result.add_fail("GET /sitemap.xml", "Body does not start with '<?xml'")
            return
        
        if '<urlset' not in body:
            result.add_fail("GET /sitemap.xml", "Missing <urlset> tag")
            return
        
        # Check for service page
        if '/services/vip-escort-hamburg' not in body:
            result.add_fail("GET /sitemap.xml", "Missing /services/vip-escort-hamburg in sitemap")
            return
        
        # Check for hreflang alternates
        if 'xhtml:link' not in body or 'hreflang="en"' not in body:
            result.add_fail("GET /sitemap.xml", "Missing hreflang alternates (xhtml:link)")
            return
        
        result.add_pass("GET /sitemap.xml", "Valid XML with hreflang alternates")
        
    except Exception as e:
        result.add_fail("GET /sitemap.xml", f"Exception: {str(e)}")

def test_robots_txt(result: TestResult):
    """Test 12: GET /robots.txt"""
    print("\n[TEST 12] GET /robots.txt")
    try:
        resp = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /robots.txt", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return
        
        body = resp.text
        
        required_lines = [
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /api',
            'Sitemap:'
        ]
        
        missing = [line for line in required_lines if line not in body]
        if missing:
            result.add_fail("GET /robots.txt", f"Missing required lines: {missing}")
            return
        
        result.add_pass("GET /robots.txt", "All required directives present")
        
    except Exception as e:
        result.add_fail("GET /robots.txt", f"Exception: {str(e)}")

def test_idempotency(result: TestResult):
    """Test 13: Idempotency - call /api/service-content twice"""
    print("\n[TEST 13] Idempotency test")
    try:
        resp1 = requests.get(f"{BASE_URL}/api/service-content", timeout=10)
        if resp1.status_code != 200:
            result.add_fail("Idempotency test", f"First call failed: {resp1.status_code}")
            return
        
        data1 = resp1.json()
        len1 = len(data1)
        
        resp2 = requests.get(f"{BASE_URL}/api/service-content", timeout=10)
        if resp2.status_code != 200:
            result.add_fail("Idempotency test", f"Second call failed: {resp2.status_code}")
            return
        
        data2 = resp2.json()
        len2 = len(data2)
        
        if len1 != 8:
            result.add_fail("Idempotency test", f"First call returned {len1} items, expected 8")
            return
        
        if len2 != 8:
            result.add_fail("Idempotency test", f"Second call returned {len2} items, expected 8 (lazy-seed duplicated data)")
            return
        
        result.add_pass("Idempotency test", f"Both calls returned 8 items (no duplication)")
        
    except Exception as e:
        result.add_fail("Idempotency test", f"Exception: {str(e)}")

def test_sitemap_status(result: TestResult):
    """Test 14: GET /api/sitemap/status"""
    print("\n[TEST 14] GET /api/sitemap/status")
    try:
        resp = requests.get(f"{BASE_URL}/api/sitemap/status", timeout=10)
        
        if resp.status_code != 200:
            result.add_fail("GET /api/sitemap/status", f"Expected 200, got {resp.status_code}. Body: {resp.text[:200]}")
            return
        
        data = resp.json()
        
        if not isinstance(data, dict):
            result.add_fail("GET /api/sitemap/status", f"Expected object, got {type(data)}")
            return
        
        if data.get('services') != 8:
            result.add_fail("GET /api/sitemap/status", f"Expected services=8, got {data.get('services')}")
            return
        
        if data.get('areas') != 18:
            result.add_fail("GET /api/sitemap/status", f"Expected areas=18, got {data.get('areas')}")
            return
        
        result.add_pass("GET /api/sitemap/status", "services=8, areas=18")
        
    except Exception as e:
        result.add_fail("GET /api/sitemap/status", f"Exception: {str(e)}")

def main():
    print("="*80)
    print("NOIR HAMBURG - PHASE 1 BACKEND TESTING")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    result = TestResult()
    
    # Run all tests
    test_health(result)
    service_list = test_service_content_list(result)
    test_service_content_single(result)
    test_service_content_404(result)
    area_list = test_area_content_list(result)
    test_area_content_single(result, area_list)
    test_settings(result)
    test_empty_collections(result)
    test_sitemap_xml(result)
    test_robots_txt(result)
    test_idempotency(result)
    test_sitemap_status(result)
    
    # Print summary
    success = result.summary()
    
    return 0 if success else 1

if __name__ == '__main__':
    exit(main())
