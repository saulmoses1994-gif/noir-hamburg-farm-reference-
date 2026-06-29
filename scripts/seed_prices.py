#!/usr/bin/env python3
"""Seed sample pricing tiers on every existing model.

These are starting defaults the admin can adjust at any time via the control
panel. Re-running with --force overwrites existing prices.
"""
import sys, requests

BASE = "https://client-portal-385.preview.emergentagent.com"
EMAIL = "admin@noir-hamburg.de"
PASSWORD = "NoirAdmin2026!"
FORCE = "--force" in sys.argv

# Different price ladders so the catalog doesn't look identical model-to-model.
# Amounts are starting suggestions in EUR — the admin will tune these.
PRICE_LADDERS = {
    "aurelia":   [("1 Stunde", 500), ("Dinner Date (4h)", 1500), ("Overnight", 2500), ("Wochenende", 5500)],
    "valentina": [("1 Stunde", 600), ("Dinner Date (4h)", 1800), ("Overnight", 3000), ("Wochenende", 6500)],
    "sophia":    [("1 Stunde", 450), ("Dinner Date (4h)", 1400), ("Overnight", 2400)],
    "helena":    [("1 Stunde", 700), ("Dinner Date (4h)", 2000), ("Overnight", 3500), ("Wochenende", 7500)],
    "mila":      [("1 Stunde", 550), ("Dinner Date (4h)", 1600), ("Overnight", 2800)],
    "lara":      [("1 Stunde", 400), ("Dinner Date (4h)", 1300), ("Overnight", 2200)],
}


def main():
    s = requests.Session()
    s.headers["Content-Type"] = "application/json"
    r = s.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    r.raise_for_status()
    print("✓ logged in\n")

    for slug, ladder in PRICE_LADDERS.items():
        m = s.get(f"{BASE}/api/models/{slug}", timeout=15).json()
        if m.get("prices") and not FORCE:
            print(f"  skip {slug} (already has {len(m['prices'])} prices)")
            continue
        payload = {**m, "prices": [{"label": l, "amount": a, "currency": "EUR"} for l, a in ladder]}
        for k in ("id", "slug", "created_at"):
            payload.pop(k, None)
        r = s.put(f"{BASE}/api/models/{slug}", json=payload, timeout=20)
        r.raise_for_status()
        tiers = ", ".join(f"{l}: {a}€" for l, a in ladder)
        print(f"✓ {slug:10s} → {tiers}")


if __name__ == "__main__":
    main()
