#!/usr/bin/env python3
"""
CMS Blog Editor Regression Test Suite
Tests the admin blog CRUD flow with new faqs_de and faqs_en fields.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://noir-migration.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Test data
TEST_SLUG = f"regression-test-{int(time.time())}"

class BlogCRUDTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_slug = TEST_SLUG
        self.created_slug = None
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_1_admin_login(self):
        """Test 1: Admin login returns 200 + session cookie"""
        self.log("TEST 1: Admin login")
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data:
                    self.log("✅ TEST 1 PASSED: Admin login successful")
                    self.log(f"   User: {data['user'].get('email')}, Role: {data['user'].get('role')}")
                    # Check for session cookie
                    if 'access_token' in self.session.cookies:
                        self.log("   Session cookie set: access_token")
                    return True
                else:
                    self.log("❌ TEST 1 FAILED: Response missing 'user' field")
                    return False
            else:
                self.log(f"❌ TEST 1 FAILED: Status {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 1 FAILED: Exception - {str(e)}")
            return False
    
    def test_2_create_blog_post(self):
        """Test 2: POST /api/blog creates a new blog post with faqs_de and faqs_en"""
        self.log("TEST 2: Create blog post with faqs_de and faqs_en")
        try:
            payload = {
                "slug": self.test_slug,
                "title": "Regression Test DE",
                "title_en": "Regression Test EN",
                "category": "FAQ Guides",
                "excerpt": "Kurzer Auszug.",
                "excerpt_en": "Short excerpt.",
                "content": "## Überschrift\n\nErster Absatz.\n\nZweiter Absatz.",
                "content_en": "## Heading\n\nFirst paragraph.\n\nSecond paragraph.",
                "cover_image": "https://images.unsplash.com/photo-1533392151650-269f96231f65?w=1200",
                "meta_title": "Regression Meta DE",
                "meta_title_en": "Regression Meta EN",
                "meta_description": "Meta desc DE.",
                "meta_description_en": "Meta desc EN.",
                "related_services": [],
                "related_locations": [],
                "faqs": [],
                "faqs_de": [
                    {
                        "q": "Wie plane ich einen Abend?",
                        "a": "Wir empfehlen ein Restaurant zu reservieren und rechtzeitig zu buchen."
                    }
                ],
                "faqs_en": [
                    {
                        "q": "How do I plan an evening?",
                        "a": "We recommend reserving a restaurant and booking in advance."
                    }
                ],
                "slug_en": "",
                "published": True
            }
            
            response = self.session.post(
                f"{API_BASE}/blog",
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                if 'slug' in data:
                    self.created_slug = data['slug']
                    self.log("✅ TEST 2 PASSED: Blog post created successfully")
                    self.log(f"   Slug: {data['slug']}")
                    self.log(f"   ID: {data.get('id', 'N/A')}")
                    self.log(f"   Slug EN: {data.get('slug_en', 'N/A')}")
                    return True
                else:
                    self.log("❌ TEST 2 FAILED: Response missing 'slug' field")
                    self.log(f"   Response: {json.dumps(data, indent=2)[:500]}")
                    return False
            else:
                self.log(f"❌ TEST 2 FAILED: Status {response.status_code}")
                self.log(f"   Response: {response.text[:500]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 2 FAILED: Exception - {str(e)}")
            return False
    
    def test_3_get_blog_post(self):
        """Test 3: GET /api/blog/[slug] retrieves the blog post with faqs_de and faqs_en"""
        self.log("TEST 3: Get blog post and verify faqs_de and faqs_en")
        try:
            if not self.created_slug:
                self.log("❌ TEST 3 SKIPPED: No slug from previous test")
                return False
            
            response = self.session.get(
                f"{API_BASE}/blog/{self.created_slug}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify faqs_de
                faqs_de = data.get('faqs_de', [])
                if len(faqs_de) == 1:
                    faq_de = faqs_de[0]
                    if faq_de.get('q') == "Wie plane ich einen Abend?" and \
                       "Restaurant" in faq_de.get('a', ''):
                        self.log("✅ faqs_de verified correctly")
                    else:
                        self.log(f"❌ faqs_de content mismatch: {faq_de}")
                        return False
                else:
                    self.log(f"❌ faqs_de length mismatch: expected 1, got {len(faqs_de)}")
                    return False
                
                # Verify faqs_en
                faqs_en = data.get('faqs_en', [])
                if len(faqs_en) == 1:
                    faq_en = faqs_en[0]
                    if faq_en.get('q') == "How do I plan an evening?" and \
                       "restaurant" in faq_en.get('a', '').lower():
                        self.log("✅ faqs_en verified correctly")
                    else:
                        self.log(f"❌ faqs_en content mismatch: {faq_en}")
                        return False
                else:
                    self.log(f"❌ faqs_en length mismatch: expected 1, got {len(faqs_en)}")
                    return False
                
                # Verify content sanitization
                content = data.get('content', '')
                if '## Überschrift' in content:
                    self.log("✅ content preserved with h2 headings")
                else:
                    self.log(f"❌ content sanitization issue: {content[:100]}")
                    return False
                
                content_en = data.get('content_en', '')
                if '## Heading' in content_en:
                    self.log("✅ content_en preserved with h2 headings")
                else:
                    self.log(f"❌ content_en sanitization issue: {content_en[:100]}")
                    return False
                
                # Verify slug_en auto-derivation
                slug_en = data.get('slug_en', '')
                if slug_en and 'regression-test-en' in slug_en:
                    self.log(f"✅ slug_en auto-derived: {slug_en}")
                else:
                    self.log(f"⚠️  slug_en: {slug_en} (expected 'regression-test-en' or similar)")
                
                self.log("✅ TEST 3 PASSED: Blog post retrieved and verified")
                return True
            else:
                self.log(f"❌ TEST 3 FAILED: Status {response.status_code}")
                self.log(f"   Response: {response.text[:500]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 3 FAILED: Exception - {str(e)}")
            return False
    
    def test_4_update_blog_post(self):
        """Test 4: PUT /api/blog/[slug] updates the blog post"""
        self.log("TEST 4: Update blog post with modified content and additional FAQ")
        try:
            if not self.created_slug:
                self.log("❌ TEST 4 SKIPPED: No slug from previous test")
                return False
            
            payload = {
                "content": "## Überschrift\n\nErster Absatz.\n\nZweiter Absatz.\n\n## Second heading\n\nAdditional content.",
                "faqs_de": [
                    {
                        "q": "Wie plane ich einen Abend?",
                        "a": "Wir empfehlen ein Restaurant zu reservieren und rechtzeitig zu buchen."
                    },
                    {
                        "q": "Was sollte ich beachten?",
                        "a": "Bitte beachten Sie unsere Hinweise zur Diskretion und Planung."
                    }
                ],
                "published": True
            }
            
            response = self.session.put(
                f"{API_BASE}/blog/{self.created_slug}",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify updated content
                content = data.get('content', '')
                if '## Second heading' in content:
                    self.log("✅ content updated with new heading")
                else:
                    self.log(f"❌ content update failed: {content[:200]}")
                    return False
                
                # Verify updated faqs_de
                faqs_de = data.get('faqs_de', [])
                if len(faqs_de) == 2:
                    self.log("✅ faqs_de updated with 2 entries")
                else:
                    self.log(f"❌ faqs_de length mismatch: expected 2, got {len(faqs_de)}")
                    return False
                
                # Verify published status
                if data.get('published') == True:
                    self.log("✅ published status updated to true")
                else:
                    self.log(f"❌ published status not updated: {data.get('published')}")
                    return False
                
                self.log("✅ TEST 4 PASSED: Blog post updated successfully")
                return True
            else:
                self.log(f"❌ TEST 4 FAILED: Status {response.status_code}")
                self.log(f"   Response: {response.text[:500]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 4 FAILED: Exception - {str(e)}")
            return False
    
    def test_5_xss_sanitization(self):
        """Test 5: XSS sanitization - script tags should be stripped"""
        self.log("TEST 5: XSS sanitization in FAQ answers")
        try:
            if not self.created_slug:
                self.log("❌ TEST 5 SKIPPED: No slug from previous test")
                return False
            
            payload = {
                "faqs_de": [
                    {
                        "q": "Test XSS Question?",
                        "a": "<script>alert(1)</script>Legit answer with <strong>bold</strong> text."
                    }
                ]
            }
            
            response = self.session.put(
                f"{API_BASE}/blog/{self.created_slug}",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                faqs_de = data.get('faqs_de', [])
                
                if len(faqs_de) > 0:
                    answer = faqs_de[0].get('a', '')
                    
                    # Check that script tag is stripped
                    if '<script>' not in answer and 'alert(1)' not in answer:
                        self.log("✅ Script tag stripped from answer")
                    else:
                        self.log(f"❌ Script tag NOT stripped: {answer}")
                        return False
                    
                    # Check that legitimate content is preserved
                    if 'Legit answer' in answer:
                        self.log("✅ Legitimate content preserved")
                    else:
                        self.log(f"❌ Legitimate content missing: {answer}")
                        return False
                    
                    # Check if safe HTML like <strong> is preserved
                    if '<strong>' in answer or 'bold' in answer:
                        self.log("✅ Safe HTML preserved or text extracted")
                    else:
                        self.log(f"⚠️  HTML handling: {answer}")
                    
                    self.log("✅ TEST 5 PASSED: XSS sanitization working")
                    return True
                else:
                    self.log("❌ TEST 5 FAILED: No FAQs in response")
                    return False
            else:
                self.log(f"❌ TEST 5 FAILED: Status {response.status_code}")
                self.log(f"   Response: {response.text[:500]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 5 FAILED: Exception - {str(e)}")
            return False
    
    def test_6_auth_gate(self):
        """Test 6: Unauthenticated POST /api/blog should return 401/403"""
        self.log("TEST 6: Auth gate - unauthenticated request should fail")
        try:
            # Create a new session without auth
            unauth_session = requests.Session()
            
            payload = {
                "slug": f"unauthorized-test-{int(time.time())}",
                "title": "Unauthorized Test",
                "published": False
            }
            
            response = unauth_session.post(
                f"{API_BASE}/blog",
                json=payload,
                timeout=30
            )
            
            if response.status_code in [401, 403]:
                self.log(f"✅ TEST 6 PASSED: Unauthenticated request rejected with {response.status_code}")
                return True
            else:
                self.log(f"❌ TEST 6 FAILED: Expected 401/403, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 6 FAILED: Exception - {str(e)}")
            return False
    
    def test_7_cleanup(self):
        """Test 7: DELETE /api/blog/[slug] removes the test article"""
        self.log("TEST 7: Cleanup - delete test article")
        try:
            if not self.created_slug:
                self.log("❌ TEST 7 SKIPPED: No slug to delete")
                return False
            
            response = self.session.delete(
                f"{API_BASE}/blog/{self.created_slug}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('ok') == True and data.get('deleted_at'):
                    self.log("✅ Blog post soft-deleted successfully")
                    self.log(f"   Deleted at: {data.get('deleted_at')}")
                    
                    # Verify it's gone (should return 404 or have deleted_at)
                    verify_response = self.session.get(
                        f"{API_BASE}/blog/{self.created_slug}",
                        timeout=30
                    )
                    
                    if verify_response.status_code == 404:
                        self.log("✅ Verified: Blog post returns 404 after deletion")
                    elif verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        if verify_data.get('deleted_at'):
                            self.log("✅ Verified: Blog post has deleted_at set")
                        else:
                            self.log("⚠️  Blog post still accessible without deleted_at")
                    
                    self.log("✅ TEST 7 PASSED: Cleanup successful")
                    return True
                else:
                    self.log(f"❌ TEST 7 FAILED: Unexpected response: {data}")
                    return False
            else:
                self.log(f"❌ TEST 7 FAILED: Status {response.status_code}")
                self.log(f"   Response: {response.text[:500]}")
                return False
        except Exception as e:
            self.log(f"❌ TEST 7 FAILED: Exception - {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("=" * 80)
        self.log("CMS BLOG EDITOR REGRESSION TEST SUITE")
        self.log("=" * 80)
        self.log(f"Base URL: {BASE_URL}")
        self.log(f"Test Slug: {self.test_slug}")
        self.log("")
        
        results = []
        
        # Test 1: Admin login
        results.append(("Admin Login", self.test_1_admin_login()))
        self.log("")
        
        # Test 2: Create blog post
        results.append(("Create Blog Post", self.test_2_create_blog_post()))
        self.log("")
        
        # Test 3: Get blog post
        results.append(("Get Blog Post", self.test_3_get_blog_post()))
        self.log("")
        
        # Test 4: Update blog post
        results.append(("Update Blog Post", self.test_4_update_blog_post()))
        self.log("")
        
        # Test 5: XSS sanitization
        results.append(("XSS Sanitization", self.test_5_xss_sanitization()))
        self.log("")
        
        # Test 6: Auth gate
        results.append(("Auth Gate", self.test_6_auth_gate()))
        self.log("")
        
        # Test 7: Cleanup
        results.append(("Cleanup", self.test_7_cleanup()))
        self.log("")
        
        # Summary
        self.log("=" * 80)
        self.log("TEST SUMMARY")
        self.log("=" * 80)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status}: {test_name}")
        
        self.log("")
        self.log(f"TOTAL: {passed}/{total} tests passed ({int(passed/total*100)}%)")
        self.log("=" * 80)
        
        return passed == total

if __name__ == "__main__":
    tester = BlogCRUDTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
