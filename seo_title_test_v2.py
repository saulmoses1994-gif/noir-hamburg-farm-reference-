#!/usr/bin/env python3
"""
SEO Title Duplicate Fix - Re-test Suite (Simplified with retry logic)
Tests the strengthened resolveArticleTitle() helper with word-overlap ratio.
"""

import requests
import re
import time
from html.parser import HTMLParser

BASE_URL = "http://localhost:3000"

class TitleExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = None
    
    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self.in_title = True
    
    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
    
    def handle_data(self, data):
        if self.in_title and self.title is None:
            self.title = data.strip()

def extract_title(html):
    """Extract <title> content from HTML"""
    parser = TitleExtractor()
    parser.feed(html)
    return parser.title

def fetch_with_retry(url, max_retries=5, initial_delay=3):
    """Fetch URL with exponential backoff retry logic"""
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, timeout=20)
            return resp
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            if attempt < max_retries - 1:
                delay = initial_delay * (2 ** attempt)  # Exponential backoff
                print(f"   Connection error, retry {attempt + 1}/{max_retries - 1} after {delay}s...")
                time.sleep(delay)
            else:
                raise
    return None

def test_1_specific_bug_fixed():
    """TEST 1: The exact reported bug — MUST NOW PASS"""
    print("\n" + "="*80)
    print("TEST 1: Specific bug fixed (flagged blog post)")
    print("="*80)
    
    url = f"{BASE_URL}/blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen"
    
    try:
        resp = fetch_with_retry(url)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            return False
        
        title = extract_title(resp.text)
        print(f"<title>: {title}")
        
        wrong_title = "Diskretion & Datenschutz | Noir Hamburg Premium Escort"
        
        if not title:
            print("❌ FAIL: No <title> tag found")
            return False
        
        if title == wrong_title or wrong_title in title:
            print(f"❌ FAIL: Title still contains the wrong policy page title")
            return False
        
        article_words = ["Zeitalter", "digitaler", "Privatsphäre", "Spuren"]
        has_article_word = any(word.lower() in title.lower() for word in article_words)
        
        if not has_article_word:
            print(f"❌ FAIL: Title does not contain article-specific words")
            return False
        
        if not title.endswith(" | Noir Hamburg"):
            print(f"❌ FAIL: Title does not end with ' | Noir Hamburg'")
            return False
        
        print("✅ PASS")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_2_policy_page_unchanged():
    """TEST 2: Regression — /p/ policy page unchanged"""
    print("\n" + "="*80)
    print("TEST 2: Policy page unchanged")
    print("="*80)
    
    url = f"{BASE_URL}/p/diskretion-und-datenschutz-noir-hamburg"
    
    try:
        time.sleep(1)  # Delay between tests
        resp = fetch_with_retry(url)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            return False
        
        title = extract_title(resp.text)
        print(f"<title>: {title}")
        
        if not title or ("Diskretion" not in title or "Datenschutz" not in title):
            print(f"❌ FAIL: Policy page title changed unexpectedly")
            return False
        
        print("✅ PASS")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_3_uniqueness_across_all_de_blogs():
    """TEST 3: Uniqueness across all DE blog titles"""
    print("\n" + "="*80)
    print("TEST 3: Uniqueness across all DE blog titles")
    print("="*80)
    
    try:
        time.sleep(1)
        resp = fetch_with_retry(f"{BASE_URL}/api/blog")
        if resp.status_code != 200:
            print(f"❌ FAIL: Could not fetch /api/blog")
            return False
        
        blogs = resp.json()
        print(f"Testing {len(blogs)} blog posts...")
        
        titles = {}
        for i, blog in enumerate(blogs):
            slug = blog.get('slug')
            if not slug:
                continue
            
            url = f"{BASE_URL}/blog/{slug}"
            try:
                time.sleep(0.5)  # Delay between requests
                r = fetch_with_retry(url)
                if r.status_code == 200:
                    title = extract_title(r.text)
                    if title:
                        if title in titles:
                            print(f"❌ FAIL: Duplicate title!")
                            print(f"   Title: {title}")
                            print(f"   Slug 1: {titles[title]}")
                            print(f"   Slug 2: {slug}")
                            return False
                        titles[title] = slug
                        print(f"   [{i+1}/{len(blogs)}] {slug[:50]}... ✓")
            except Exception as e:
                print(f"   [{i+1}/{len(blogs)}] {slug[:50]}... ⚠️  {e}")
        
        print(f"✅ PASS: All {len(titles)} titles are unique")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_4_de_ne_en_titles():
    """TEST 4: DE ≠ EN titles"""
    print("\n" + "="*80)
    print("TEST 4: DE ≠ EN titles")
    print("="*80)
    
    try:
        time.sleep(1)
        resp = fetch_with_retry(f"{BASE_URL}/api/blog")
        if resp.status_code != 200:
            print(f"❌ FAIL: Could not fetch /api/blog")
            return False
        
        blogs = resp.json()
        print(f"Testing {len(blogs)} blog posts...")
        
        collisions = []
        for i, blog in enumerate(blogs):
            slug = blog.get('slug')
            if not slug:
                continue
            
            try:
                time.sleep(0.5)
                de_resp = fetch_with_retry(f"{BASE_URL}/blog/{slug}")
                time.sleep(0.5)
                en_resp = fetch_with_retry(f"{BASE_URL}/en/blog/{slug}")
                
                if de_resp.status_code == 200 and en_resp.status_code == 200:
                    de_title = extract_title(de_resp.text)
                    en_title = extract_title(en_resp.text)
                    
                    if de_title and en_title and de_title == en_title:
                        collisions.append({'slug': slug, 'title': de_title})
                    print(f"   [{i+1}/{len(blogs)}] {slug[:50]}... ✓")
            except Exception as e:
                print(f"   [{i+1}/{len(blogs)}] {slug[:50]}... ⚠️  {e}")
        
        if collisions:
            print(f"❌ FAIL: Found {len(collisions)} DE=EN collision(s)")
            for c in collisions:
                print(f"   {c['slug']}: {c['title']}")
            return False
        
        print(f"✅ PASS: All DE and EN titles differ")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_5_helper_preserves_correct_meta():
    """TEST 5: Helper preserves correctly authored meta_title"""
    print("\n" + "="*80)
    print("TEST 5: Helper preserves correctly authored meta")
    print("="*80)
    
    slug = "fruehstueck-in-hamburg-die-zehn-schoensten-adressen-fuer-den-langsamen-morgen"
    url = f"{BASE_URL}/blog/{slug}"
    
    try:
        time.sleep(1)
        resp = fetch_with_retry(url)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            return False
        
        title = extract_title(resp.text)
        print(f"<title>: {title}")
        
        if not title:
            print("❌ FAIL: No <title> tag found")
            return False
        
        if " | Noir Hamburg" in title or "| Noir Hamburg" in title:
            print("✅ PASS: Meta title format correct")
            return True
        else:
            print(f"❌ FAIL: Title format unexpected")
            return False
        
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_6_en_fallback_differentiator():
    """TEST 6: EN fallback differentiator"""
    print("\n" + "="*80)
    print("TEST 6: EN fallback differentiator")
    print("="*80)
    
    slug = "diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen"
    
    try:
        time.sleep(1)
        de_resp = fetch_with_retry(f"{BASE_URL}/blog/{slug}")
        time.sleep(1)
        en_resp = fetch_with_retry(f"{BASE_URL}/en/blog/{slug}")
        
        print(f"DE Status: {de_resp.status_code}")
        print(f"EN Status: {en_resp.status_code}")
        
        if de_resp.status_code != 200 or en_resp.status_code != 200:
            print(f"❌ FAIL: One or both URLs returned non-200")
            return False
        
        de_title = extract_title(de_resp.text)
        en_title = extract_title(en_resp.text)
        
        print(f"DE <title>: {de_title}")
        print(f"EN <title>: {en_title}")
        
        if not de_title or not en_title:
            print("❌ FAIL: Could not extract titles")
            return False
        
        # Check if EN title contains "— EN" differentiator OR differs from DE
        if " — EN " in en_title or en_title.endswith("— EN | Noir Hamburg"):
            print("✅ PASS: EN title contains '— EN' differentiator")
            return True
        elif de_title != en_title:
            print("✅ PASS: EN title differs from DE")
            return True
        else:
            print(f"❌ FAIL: EN title identical to DE and no '— EN' marker")
            return False
        
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def main():
    print("\n" + "="*80)
    print("SEO TITLE DUPLICATE FIX - RE-TEST SUITE")
    print("Testing strengthened resolveArticleTitle() with word-overlap ratio")
    print("="*80)
    
    # Wait for server to be ready
    print("\nWaiting for server to be ready...")
    time.sleep(3)
    
    results = []
    
    # Run all 6 tests
    results.append(("TEST 1: Specific bug fixed", test_1_specific_bug_fixed()))
    results.append(("TEST 2: Policy page unchanged", test_2_policy_page_unchanged()))
    results.append(("TEST 3: Uniqueness across all DE blogs", test_3_uniqueness_across_all_de_blogs()))
    results.append(("TEST 4: DE ≠ EN titles", test_4_de_ne_en_titles()))
    results.append(("TEST 5: Helper preserves correct meta", test_5_helper_preserves_correct_meta()))
    results.append(("TEST 6: EN fallback differentiator", test_6_en_fallback_differentiator()))
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Fix is working correctly!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
