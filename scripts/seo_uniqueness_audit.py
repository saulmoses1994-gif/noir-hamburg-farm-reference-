"""
SEO uniqueness audit for every service, area, and blog page (DE + EN).

Fetches the SSR-rendered HTML (what crawlers actually see) and validates:
  1. Title is present, non-empty, unique across sibling pages
  2. Meta description is present, non-empty, unique across sibling pages
  3. Exactly one H1 tag, non-empty, unique across sibling pages
  4. Canonical link is present and matches the requested URL
  5. Structured data (JSON-LD schema) is present and valid JSON

Exits non-zero if any check fails.
"""
import json
import os
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser

import requests
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://client-portal-385.preview.emergentagent.com").rstrip("/")

# ---------- Discover URLs from the backend + code ----------
def load_slugs_from_site_js():
    """Extract SERVICES and LOCATIONS slugs from the shared CommonJS data module."""
    import subprocess
    r = subprocess.run(
        ["node", "-e",
         "const {SERVICES,LOCATIONS}=require('/app/frontend/src/data/site');"
         "console.log(JSON.stringify({s:SERVICES.map(x=>x.slug),l:LOCATIONS.map(x=>x.slug)}))"],
        capture_output=True, text=True, check=True,
    )
    data = json.loads(r.stdout.strip())
    return data["s"], data["l"]


SERVICES, AREAS = load_slugs_from_site_js()


def fetch_blog_slugs():
    r = requests.get(f"{BASE}/api/blog", timeout=10)
    r.raise_for_status()
    return [p["slug"] for p in r.json()]


# ---------- HTML parsing ----------
class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.h1s = []
        self.json_ld_scripts = []
        self._in_title = False
        self._in_h1 = False
        self._in_jsonld = False
        self._buf_h1 = []
        self._buf_jsonld = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta" and a.get("name") == "description":
            self.description = a.get("content", "")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href", "")
        elif tag == "h1":
            self._in_h1 = True
            self._buf_h1 = []
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._buf_jsonld = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
            self.h1s.append("".join(self._buf_h1).strip())
        elif tag == "script" and self._in_jsonld:
            self._in_jsonld = False
            self.json_ld_scripts.append("".join(self._buf_jsonld).strip())

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        elif self._in_h1:
            self._buf_h1.append(data)
        elif self._in_jsonld:
            self._buf_jsonld.append(data)


def parse(url):
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    p = PageParser()
    p.feed(r.text)
    return {
        "url": url,
        "title": p.title.strip(),
        "description": p.description.strip(),
        "canonical": p.canonical.strip(),
        "h1s": p.h1s,
        "json_ld": p.json_ld_scripts,
    }


def build_urls():
    blog_slugs = fetch_blog_slugs()
    groups = {
        "services_de":  [f"{BASE}/services/{s}"           for s in SERVICES],
        "services_en":  [f"{BASE}/en/services/{s}"        for s in SERVICES],
        "areas_de":     [f"{BASE}/escort/{a}"             for a in AREAS],
        "areas_en":     [f"{BASE}/en/escort/{a}"          for a in AREAS],
        "blog_de":      [f"{BASE}/blog/{s}"               for s in blog_slugs],
        "blog_en":      [f"{BASE}/en/blog/{s}"            for s in blog_slugs],
    }
    return groups


def audit_group(name, urls):
    print(f"\n{'='*70}\n{name.upper()} ({len(urls)} pages)\n{'='*70}")
    pages = []
    errors = []
    for u in urls:
        try:
            pages.append(parse(u))
        except Exception as e:
            errors.append(f"  FETCH FAIL {u}: {e}")

    seen_titles = defaultdict(list)
    seen_descs = defaultdict(list)
    seen_h1s = defaultdict(list)

    for p in pages:
        # 1. Title
        if not p["title"]:
            errors.append(f"  [TITLE-EMPTY]  {p['url']}")
        seen_titles[p["title"]].append(p["url"])

        # 2. Description
        if not p["description"]:
            errors.append(f"  [DESC-EMPTY]   {p['url']}")
        seen_descs[p["description"]].append(p["url"])

        # 3. H1
        if len(p["h1s"]) == 0:
            errors.append(f"  [H1-MISSING]   {p['url']}")
        elif len(p["h1s"]) > 1:
            errors.append(f"  [H1-MULTIPLE]  {p['url']}  ({len(p['h1s'])} H1s: {p['h1s']!r})")
        else:
            if not p["h1s"][0]:
                errors.append(f"  [H1-EMPTY]     {p['url']}")
            seen_h1s[p["h1s"][0]].append(p["url"])

        # 4. Canonical — compare the URL path portion (the origin may
        # legitimately differ when auditing preview but canonical points to
        # production noir-hamburg.com — that is the correct SEO behaviour and
        # must not be flagged as a mismatch).
        if not p["canonical"]:
            errors.append(f"  [CANONICAL-EMPTY]      {p['url']}")
        else:
            from urllib.parse import urlparse
            expected_path = urlparse(p["url"]).path.rstrip("/") or "/"
            actual_path = urlparse(p["canonical"]).path.rstrip("/") or "/"
            if expected_path != actual_path:
                errors.append(f"  [CANONICAL-MISMATCH]   {p['url']} → canonical={p['canonical']}")

        # 5. Schema
        if len(p["json_ld"]) == 0:
            errors.append(f"  [SCHEMA-MISSING]  {p['url']}")
        else:
            for idx, blob in enumerate(p["json_ld"]):
                try:
                    json.loads(blob)
                except json.JSONDecodeError as e:
                    errors.append(f"  [SCHEMA-INVALID]  {p['url']} script[{idx}]: {e}")

    # Uniqueness checks
    for t, urls_ in seen_titles.items():
        if t and len(urls_) > 1:
            errors.append(f"  [TITLE-DUP]    '{t[:60]}' → {urls_}")
    for d, urls_ in seen_descs.items():
        if d and len(urls_) > 1:
            errors.append(f"  [DESC-DUP]     '{d[:60]}' → {urls_}")
    for h, urls_ in seen_h1s.items():
        if h and len(urls_) > 1:
            errors.append(f"  [H1-DUP]       '{h[:60]}' → {urls_}")

    if errors:
        for e in errors:
            print(e)
        print(f"\n  ✗ {len(errors)} issue(s) in {name}")
    else:
        print(f"  ✓ all {len(pages)} pages pass all 5 checks (title/desc/h1/canonical/schema — all unique)")
    return errors, pages


def main():
    print(f"SEO Uniqueness Audit — {BASE}")
    groups = build_urls()
    all_errors = []
    all_pages_by_group = {}
    for name, urls in groups.items():
        errs, pages = audit_group(name, urls)
        all_errors.extend(errs)
        all_pages_by_group[name] = pages

    # Print a preview so we can eyeball what's on each page
    print(f"\n{'='*70}\nSAMPLE — first entry per group\n{'='*70}")
    for name, pages in all_pages_by_group.items():
        if pages:
            p = pages[0]
            print(f"\n{name}: {p['url']}")
            print(f"  title:       {p['title']!r}")
            print(f"  description: {p['description'][:100]!r}")
            print(f"  h1:          {p['h1s']}")
            print(f"  canonical:   {p['canonical']}")
            print(f"  schemas:     {len(p['json_ld'])} JSON-LD block(s)")

    print(f"\n{'='*70}\nTOTAL: {len(all_errors)} issue(s) across all groups\n{'='*70}")
    sys.exit(0 if not all_errors else 1)


if __name__ == "__main__":
    main()
