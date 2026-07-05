"""Backfill related_services + related_locations on the three original seed
blog posts (which shipped with empty arrays) so that every article surfaces
inline internal links to services + Hamburg areas via the sidebar/related widgets.
Idempotent — only writes when the arrays are currently empty."""
import os
import requests

BASE = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://client-portal-385.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE}/api"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

BACKFILL = {
    "die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner": {
        "related_services": ["dinner-companion-hamburg", "luxury-escort-hamburg", "event-escort-hamburg"],
        "related_locations": ["hafencity", "altona", "blankenese", "eppendorf"],
    },
    "hamburg-bei-nacht-ein-eleganter-leitfaden-durch-die-stadt": {
        "related_services": ["event-escort-hamburg", "dinner-companion-hamburg", "luxury-escort-hamburg"],
        "related_locations": ["st-pauli", "hafencity", "altona"],
    },
    "diskretion-verstehen-was-premium-begleitung-wirklich-bedeutet": {
        "related_services": ["vip-escort-hamburg", "business-escort-hamburg", "luxury-escort-hamburg"],
        "related_locations": ["hamburg", "harvestehude", "eppendorf"],
    },
}


def main() -> None:
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    print(f"✓ Logged in as {ADMIN_EMAIL}")

    r = s.get(f"{API}/blog")
    assert r.status_code == 200
    by_slug = {p["slug"]: p for p in r.json()}

    updated = skipped = 0
    for slug, patch in BACKFILL.items():
        post = by_slug.get(slug)
        if not post:
            print(f"  ⊘ {slug[:60]} — not found in DB, skipping")
            continue
        already = bool(post.get("related_services")) or bool(post.get("related_locations"))
        if already:
            print(f"  ⊘ {slug[:60]} — already has relations, skipping")
            skipped += 1
            continue
        # Fetch full post to include current fields we must NOT clobber.
        full = s.get(f"{API}/blog/{slug}").json()
        payload = {
            "title": full["title"],
            "excerpt": full["excerpt"],
            "content": full["content"],
            "category": full["category"],
            "cover_image": full.get("cover_image", ""),
            "title_en": full.get("title_en", ""),
            "excerpt_en": full.get("excerpt_en", ""),
            "content_en": full.get("content_en", ""),
            "meta_title": full.get("meta_title", ""),
            "meta_description": full.get("meta_description", ""),
            "meta_title_en": full.get("meta_title_en", ""),
            "meta_description_en": full.get("meta_description_en", ""),
            "related_services": patch["related_services"],
            "related_locations": patch["related_locations"],
            "faqs": full.get("faqs", []),
            "published": full.get("published", True),
        }
        r = s.put(f"{API}/blog/{slug}", json=payload)
        if r.status_code == 200:
            print(f"  ✓ {slug[:60]}  →  {len(patch['related_services'])} svc, {len(patch['related_locations'])} area")
            updated += 1
        else:
            print(f"  ✗ {slug[:60]}: {r.status_code} {r.text[:200]}")

    print(f"\nDone: {updated} updated, {skipped} skipped")


if __name__ == "__main__":
    main()
