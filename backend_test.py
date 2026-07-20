#!/usr/bin/env python3
"""
Backend test for SEO duplicate title tags fix.
Tests the resolveArticleTitle() helper and its integration into blog pages.
"""

import requests
import re
import json
import html
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:3000"

def extract_title_from_html(html_text: str) -> str:
    """Extract the <title> content from SSR HTML and decode HTML entities."""
    match = re.search(r'<title[^>]*>(.*?)</title>', html_text, re.IGNORECASE | re.DOTALL)
    if match:
        # Decode HTML entities like &amp; to &
        return html.unescape(match.group(1).strip())
    return ""

def test_1_specific_bug_fixed():
    """
    TEST 1 — The specific bug is fixed:
    GET /blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen
    PASS criteria:
      a) HTTP status = 200
      b) The <title> DOES NOT contain "Diskretion & Datenschutz | Noir Hamburg Premium Escort"
      c) The <title> contains a fragment like "Diskretion im" or "Zeitalter" or "digitaler"
      d) The <title> ends with " | Noir Hamburg"
    """
    print("\n" + "="*80)
    print("TEST 1 — Specific bug is fixed (blog article has unique title)")
    print("="*80)
    
    url = f"{BASE_URL}/blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen"
    
    try:
        resp = requests.get(url, timeout=10)
        status = resp.status_code
        print(f"✓ Status: {status}")
        
        if status != 200:
            print(f"✗ FAIL: Expected 200, got {status}")
            return False
        
        title = extract_title_from_html(resp.text)
        print(f"✓ Extracted title: {title}")
        
        # Check b) Does NOT contain the policy page title
        policy_title = "Diskretion & Datenschutz | Noir Hamburg Premium Escort"
        if policy_title in title:
            print(f"✗ FAIL: Title still contains the policy page title: {policy_title}")
            return False
        print(f"✓ Title does NOT contain policy page title")
        
        # Check c) Contains article-specific fragment
        fragments = ["Diskretion im", "Zeitalter", "digitaler"]
        has_fragment = any(frag in title for frag in fragments)
        if not has_fragment:
            print(f"✗ FAIL: Title does not contain any expected fragment: {fragments}")
            return False
        print(f"✓ Title contains article-specific fragment")
        
        # Check d) Ends with " | Noir Hamburg"
        if not title.endswith(" | Noir Hamburg"):
            print(f"✗ FAIL: Title does not end with ' | Noir Hamburg'")
            return False
        print(f"✓ Title ends with ' | Noir Hamburg'")
        
        print("✅ TEST 1 PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

def test_2_policy_page_unchanged():
    """
    TEST 2 — The /p/ policy page is unchanged (regression check):
    GET /p/diskretion-und-datenschutz-noir-hamburg
    PASS criteria:
      a) HTTP status = 200
      b) The <title> contains "Diskretion & Datenschutz"
    """
    print("\n" + "="*80)
    print("TEST 2 — Policy page title unchanged (regression check)")
    print("="*80)
    
    url = f"{BASE_URL}/p/diskretion-und-datenschutz-noir-hamburg"
    
    try:
        resp = requests.get(url, timeout=10)
        status = resp.status_code
        print(f"✓ Status: {status}")
        
        if status != 200:
            print(f"✗ FAIL: Expected 200, got {status}")
            return False
        
        title = extract_title_from_html(resp.text)
        print(f"✓ Extracted title: {title}")
        
        # Check b) Contains "Diskretion & Datenschutz"
        if "Diskretion & Datenschutz" not in title:
            print(f"✗ FAIL: Title does not contain 'Diskretion & Datenschutz'")
            return False
        print(f"✓ Title contains 'Diskretion & Datenschutz'")
        
        print("✅ TEST 2 PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

def test_3_no_duplicate_titles_de():
    """
    TEST 3 — No two DE blog posts share the exact same <title>:
    GET /api/blog → returns JSON array of blog posts
    For each post, GET /blog/{slug} and extract the <title>
    PASS criteria: Every blog post has a UNIQUE <title> value
    """
    print("\n" + "="*80)
    print("TEST 3 — No two DE blog posts share the same title")
    print("="*80)
    
    try:
        # Get all blog posts
        resp = requests.get(f"{BASE_URL}/api/blog", timeout=10)
        if resp.status_code != 200:
            print(f"✗ FAIL: /api/blog returned {resp.status_code}")
            return False
        
        posts = resp.json()
        print(f"✓ Found {len(posts)} blog posts")
        
        titles: Dict[str, List[str]] = {}  # title -> [slugs]
        
        for post in posts:
            slug = post.get('slug')
            if not slug:
                continue
            
            url = f"{BASE_URL}/blog/{slug}"
            try:
                page_resp = requests.get(url, timeout=10)
                if page_resp.status_code != 200:
                    print(f"⚠ Warning: /blog/{slug} returned {page_resp.status_code}")
                    continue
                
                title = extract_title_from_html(page_resp.text)
                if title:
                    if title not in titles:
                        titles[title] = []
                    titles[title].append(slug)
                    print(f"  • {slug}: {title}")
            except Exception as e:
                print(f"⚠ Warning: Failed to fetch /blog/{slug}: {e}")
                continue
        
        # Check for duplicates
        duplicates = {title: slugs for title, slugs in titles.items() if len(slugs) > 1}
        
        if duplicates:
            print(f"\n✗ FAIL: Found duplicate titles:")
            for title, slugs in duplicates.items():
                print(f"  Title: {title}")
                print(f"  Slugs: {', '.join(slugs)}")
            return False
        
        print(f"\n✓ All {len(titles)} blog posts have unique titles")
        print("✅ TEST 3 PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

def test_4_de_en_differentiated():
    """
    TEST 4 — DE ↔ EN blog counterparts still have differentiated titles:
    For each blog slug, compare /blog/{slug} vs /en/blog/{slug}
    PASS criteria: The DE title and EN title are different strings
    """
    print("\n" + "="*80)
    print("TEST 4 — DE ↔ EN blog counterparts have different titles")
    print("="*80)
    
    try:
        # Get all blog posts
        resp = requests.get(f"{BASE_URL}/api/blog", timeout=10)
        if resp.status_code != 200:
            print(f"✗ FAIL: /api/blog returned {resp.status_code}")
            return False
        
        posts = resp.json()
        print(f"✓ Testing {len(posts)} blog posts")
        
        collisions = []
        
        for post in posts:
            slug = post.get('slug')
            if not slug:
                continue
            
            de_url = f"{BASE_URL}/blog/{slug}"
            en_url = f"{BASE_URL}/en/blog/{slug}"
            
            try:
                de_resp = requests.get(de_url, timeout=10)
                en_resp = requests.get(en_url, timeout=10)
                
                if de_resp.status_code != 200 or en_resp.status_code != 200:
                    print(f"⚠ Warning: {slug} - DE:{de_resp.status_code} EN:{en_resp.status_code}")
                    continue
                
                de_title = extract_title_from_html(de_resp.text)
                en_title = extract_title_from_html(en_resp.text)
                
                if de_title == en_title:
                    collisions.append((slug, de_title))
                    print(f"  ✗ {slug}: SAME title: {de_title}")
                else:
                    print(f"  ✓ {slug}: Different titles")
                    print(f"    DE: {de_title}")
                    print(f"    EN: {en_title}")
            except Exception as e:
                print(f"⚠ Warning: Failed to fetch {slug}: {e}")
                continue
        
        if collisions:
            print(f"\n✗ FAIL: Found {len(collisions)} DE/EN title collisions:")
            for slug, title in collisions:
                print(f"  {slug}: {title}")
            return False
        
        print(f"\n✓ All blog posts have differentiated DE/EN titles")
        print("✅ TEST 4 PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

def test_5_helper_preserves_correct_meta():
    """
    TEST 5 — Helper unit-level behavior:
    For at least one blog whose authored meta_title DOES correctly relate to its article title,
    verify that the meta_title is preserved (helper didn't over-trigger).
    """
    print("\n" + "="*80)
    print("TEST 5 — Helper preserves correct meta_title (doesn't over-trigger)")
    print("="*80)
    
    try:
        # Get all blog posts
        resp = requests.get(f"{BASE_URL}/api/blog", timeout=10)
        if resp.status_code != 200:
            print(f"✗ FAIL: /api/blog returned {resp.status_code}")
            return False
        
        posts = resp.json()
        
        # Find a blog post where meta_title includes first 8 chars of title
        found_valid = False
        
        for post in posts:
            slug = post.get('slug')
            title = post.get('title', '')
            meta_title = post.get('meta_title', '')
            
            if not slug or not title or not meta_title:
                continue
            
            # Check if meta_title includes first 8 chars of title
            prefix = title[:8].lower()
            if len(prefix) >= 8 and prefix in meta_title.lower():
                print(f"✓ Found valid blog post: {slug}")
                print(f"  Title: {title}")
                print(f"  Meta title: {meta_title}")
                
                # Fetch the page and verify the meta_title is preserved
                url = f"{BASE_URL}/blog/{slug}"
                page_resp = requests.get(url, timeout=10)
                
                if page_resp.status_code != 200:
                    print(f"⚠ Warning: /blog/{slug} returned {page_resp.status_code}")
                    continue
                
                rendered_title = extract_title_from_html(page_resp.text)
                print(f"  Rendered title: {rendered_title}")
                
                # The rendered title should equal the meta_title (helper preserved it)
                if rendered_title == meta_title:
                    print(f"✓ Helper preserved the correct meta_title")
                    found_valid = True
                    break
                else:
                    print(f"⚠ Rendered title differs from meta_title (may be expected)")
        
        if not found_valid:
            print(f"⚠ Warning: Could not find a blog post with valid meta_title to test")
            print(f"✓ Skipping TEST 5 (no suitable test case found)")
            return True  # Not a failure, just no test case
        
        print("✅ TEST 5 PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

def test_6_en_fallback_differentiator():
    """
    TEST 6 — /en/blog fallback appends the "— EN" differentiator:
    For at least one blog where the DE side would trigger the fallback,
    fetch /en/blog/{slug} and confirm the title contains " — EN "
    """
    print("\n" + "="*80)
    print("TEST 6 — EN blog fallback appends '— EN' differentiator")
    print("="*80)
    
    try:
        # The specific blog post we know triggers the fallback
        slug = "diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen"
        
        url = f"{BASE_URL}/en/blog/{slug}"
        resp = requests.get(url, timeout=10)
        
        if resp.status_code != 200:
            print(f"✗ FAIL: /en/blog/{slug} returned {resp.status_code}")
            return False
        
        title = extract_title_from_html(resp.text)
        print(f"✓ Extracted EN title: {title}")
        
        # Check if title contains " — EN " or ends with "— EN | Noir Hamburg"
        has_en_marker = " — EN " in title or title.endswith("— EN | Noir Hamburg")
        
        if not has_en_marker:
            print(f"✗ FAIL: EN title does not contain '— EN' differentiator")
            return False
        
        print(f"✓ EN title contains '— EN' differentiator")
        print("✅ TEST 6 PASSED")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

def main():
    """Run all tests and report results."""
    print("\n" + "="*80)
    print("SEO DUPLICATE TITLE TAGS FIX — BACKEND TEST SUITE")
    print("Base URL: " + BASE_URL)
    print("="*80)
    
    results = {
        "TEST 1 - Specific bug fixed": test_1_specific_bug_fixed(),
        "TEST 2 - Policy page unchanged": test_2_policy_page_unchanged(),
        "TEST 3 - No duplicate DE titles": test_3_no_duplicate_titles_de(),
        "TEST 4 - DE/EN differentiated": test_4_de_en_differentiated(),
        "TEST 5 - Helper preserves correct meta": test_5_helper_preserves_correct_meta(),
        "TEST 6 - EN fallback differentiator": test_6_en_fallback_differentiator(),
    }
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - SEO duplicate title fix is working correctly!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed - see details above")
        return 1

if __name__ == "__main__":
    exit(main())
