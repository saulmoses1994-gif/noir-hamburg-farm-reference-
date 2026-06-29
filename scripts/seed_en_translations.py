#!/usr/bin/env python3
"""
One-shot script to populate English translations for all seeded
Models (bio_en, short_tagline_en) and Blog posts (title_en, excerpt_en,
content_en, meta_title_en, meta_description_en).

Idempotent: safe to re-run. Skips records that already have EN content
unless --force is passed.
"""
import os
import sys
import requests

BASE = "https://client-portal-385.preview.emergentagent.com"
EMAIL = "admin@noir-hamburg.de"
PASSWORD = "NoirAdmin2026!"
FORCE = "--force" in sys.argv

# -------- English translations (hand-written by the editor) --------

MODELS_EN = {
    "aurelia": {
        "short_tagline_en": "Elegance with a classical education",
        "bio_en": (
            "Aurelia embodies timeless Hanseatic elegance. With a background "
            "in art history and a passion for classical music, she accompanies "
            "you with equal poise to a concert at the Elbphilharmonie or to an "
            "intimate dinner on the Alster."
        ),
    },
    "valentina": {
        "short_tagline_en": "Mediterranean warmth meets northern composure",
        "bio_en": (
            "Born in Milan, at home in Hamburg. Valentina speaks four languages "
            "fluently and is a treasured companion in international circles — "
            "whether at a gala dinner at the Vier Jahreszeiten or a business "
            "evening with international partners."
        ),
    },
    "sophia": {
        "short_tagline_en": "A young Hanseatic with style and substance",
        "bio_en": (
            "Sophia studies business law at the Bucerius Law School. Her "
            "eloquence, gentle smile and natural grace make her the ideal "
            "companion for high-end business occasions and private evenings."
        ),
    },
    "helena": {
        "short_tagline_en": "Mature, refined, irresistible",
        "bio_en": (
            "Helena embodies the maturity that only life experience grants. "
            "A former art curator, she moves effortlessly among Hamburg's "
            "finest circles and knows how to give every occasion exactly the "
            "right note."
        ),
    },
    "mila": {
        "short_tagline_en": "Parisian chic on the Elbe",
        "bio_en": (
            "Mila brings a touch of Paris to Hamburg. With her refined manner "
            "and an unmistakable feel for fashion, she accompanies you "
            "confidently to vernissages, fashion weeks and exclusive events."
        ),
    },
    "lara": {
        "short_tagline_en": "Radiant youth with Hanseatic discipline",
        "bio_en": (
            "Lara is in her final semester of International Relations. She is "
            "intelligent, worldly, and possesses that rare blend of youthful "
            "energy and quiet elegance."
        ),
    },
}

BLOG_EN = {
    "die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner": {
        "title_en": "The Ten Best Restaurants in Hamburg for an Unforgettable Dinner",
        "excerpt_en": (
            "From Michelin-starred Haerlin to a discreet hideaway in HafenCity — "
            "a guide to refined dining in Hamburg."
        ),
        "meta_title_en": "The 10 Best Restaurants in Hamburg | Noir Hamburg Guide",
        "meta_description_en": (
            "Discover the ten most exclusive restaurants in Hamburg — curated "
            "for discerning connoisseurs. Starred cuisine, atmosphere, discretion."
        ),
        "content_en": (
            "<p>Hamburg is a city of fine contrasts. The connoisseur who wishes "
            "to spend an evening in consummate style will find — between the "
            "Alster and the Elbe — a remarkable density of top-tier dining. In "
            "this guide we present ten addresses we hold particularly dear: "
            "for an elegant business dinner or a romantic evening for two.</p>"
            "<h2>1. Haerlin at the Fairmont Vier Jahreszeiten</h2>"
            "<p>Two Michelin stars, a view of the Binnenalster and an "
            "atmosphere that moves seamlessly between classical elegance and "
            "modern avant-garde.</p>"
            "<h2>2. Jacobs Restaurant</h2>"
            "<p>Set on the Elbchaussee, with a terrace above the river — "
            "a classic for special occasions.</p>"
            "<h2>3. The Table by Kevin Fehling</h2>"
            "<p>Three stars, an open kitchen and a tasting menu where every "
            "course tells its own story.</p>"
        ),
    },
    "hamburg-bei-nacht-ein-eleganter-leitfaden-durch-die-stadt": {
        "title_en": "Hamburg by Night: An Elegant Guide Through the City",
        "excerpt_en": (
            "When the city's lights come alive, a different Hamburg begins. "
            "We share the most beautiful spots for a cultivated evening."
        ),
        "meta_title_en": "Hamburg by Night — An Elegant City Guide | Noir Hamburg",
        "meta_description_en": (
            "The elegant guide to Hamburg's nightlife: bars, vistas, concerts "
            "and restaurants beyond the mainstream."
        ),
        "content_en": (
            "<p>Hamburg transforms after sunset. The Speicherstadt glows copper, "
            "the Elbphilharmonie rises like a crystal above the harbour, and "
            "in the bars of HafenCity whisky is celebrated as it is in "
            "London's finest salons.</p>"
            "<h2>The Viewpoints</h2>"
            "<p>The Elbphilharmonie's Plaza is accessible at night too and "
            "offers a 360° view across the sea of lights below.</p>"
        ),
    },
    "diskretion-verstehen-was-premium-begleitung-wirklich-bedeutet": {
        "title_en": "Understanding Discretion: What Premium Companionship Really Means",
        "excerpt_en": (
            "Discretion is not a marketing promise — it is a culture. "
            "We explain how to recognise a truly reputable agency."
        ),
        "meta_title_en": "Discretion in Premium Escort Services | Noir Hamburg",
        "meta_description_en": (
            "What distinguishes a truly discreet escort service? Learn how to "
            "recognise quality and confidentiality."
        ),
        "content_en": (
            "<p>In the premium segment, discretion is not an optional promise — "
            "it is the foundation. At Noir Hamburg we understand that our "
            "clients are individuals of public standing whose privacy deserves "
            "the very highest protection.</p>"
            "<h2>Data Security</h2>"
            "<p>Enquiries are processed only via encrypted channels; personal "
            "data is never stored beyond what is strictly necessary.</p>"
        ),
    },
}


def main():
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    r = s.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    r.raise_for_status()
    print("✓ logged in as admin\n")

    # ---- Models ----
    for slug, tr in MODELS_EN.items():
        current = s.get(f"{BASE}/api/models/{slug}", timeout=15).json()
        if current.get("bio_en") and not FORCE:
            print(f"  skip model {slug} (already has bio_en)")
            continue
        payload = {**current, **tr}
        for k in ("id", "slug", "created_at"):
            payload.pop(k, None)
        r = s.put(f"{BASE}/api/models/{slug}", json=payload, timeout=20)
        r.raise_for_status()
        print(f"✓ model {slug}: bio_en + short_tagline_en saved")

    # ---- Blog posts ----
    for slug, tr in BLOG_EN.items():
        current = s.get(f"{BASE}/api/blog/{slug}", timeout=15).json()
        if current.get("content_en") and not FORCE:
            print(f"  skip blog {slug} (already has content_en)")
            continue
        payload = {**current, **tr}
        for k in ("id", "slug", "created_at", "updated_at"):
            payload.pop(k, None)
        r = s.put(f"{BASE}/api/blog/{slug}", json=payload, timeout=20)
        r.raise_for_status()
        print(f"✓ blog  {slug[:40]}…: EN fields saved")

    print("\nDone. EN preview banner will disappear from each /en/models/<slug> "
          "and /en/blog/<slug> page (SSR 60s cache may delay propagation briefly).")


if __name__ == "__main__":
    main()
