"""Regression tests for the admin-managed pricing tiers on Models."""
import os, time
import requests
import pytest

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://client-portal-385.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"
SSR = BASE
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirAdmin2026!")


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200
    return s


def _create(session, name, prices):
    payload = {
        "name": name, "age": 28, "bio": "test", "short_tagline": "t",
        "height_cm": 170, "languages": ["Deutsch"], "services": [], "locations": [],
        "available": True, "featured": False,
        "prices": prices,
    }
    r = session.post(f"{API}/models", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()


def test_model_prices_persisted_and_returned(admin_session):
    m = _create(admin_session, f"Price Test {int(time.time())}", [
        {"label": "1 Stunde", "amount": 500, "currency": "EUR"},
        {"label": "Overnight", "amount": 2500, "currency": "EUR"},
    ])
    slug = m["slug"]
    try:
        assert len(m["prices"]) == 2
        assert m["prices"][0]["label"] == "1 Stunde"
        assert m["prices"][0]["amount"] == 500
        # Round-trip
        fetched = requests.get(f"{API}/models/{slug}", timeout=10).json()
        assert fetched["prices"] == m["prices"]
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)


def test_model_prices_rendered_in_ssr_de(admin_session):
    m = _create(admin_session, f"SSR DE Price {int(time.time())}", [
        {"label": "2 Stunden", "amount": 800, "currency": "EUR"},
    ])
    slug = m["slug"]
    try:
        html = requests.get(f"{SSR}/models/{slug}", timeout=10).text
        assert "<h2>Tarife</h2>" in html
        assert "2 Stunden" in html
        assert "800 EUR" in html
        assert "Reisekosten" in html
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)


def test_model_prices_rendered_in_ssr_en(admin_session):
    m = _create(admin_session, f"SSR EN Price {int(time.time())}", [
        {"label": "Dinner Date (4h)", "amount": 1500, "currency": "EUR"},
    ])
    slug = m["slug"]
    try:
        html = requests.get(f"{SSR}/en/models/{slug}", timeout=10).text
        assert "<h2>Rates</h2>" in html
        assert "Dinner Date (4h)" in html
        assert "1,500 EUR" in html  # EN locale formatting
        assert "Travel expenses" in html
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)


def test_model_without_prices_omits_section(admin_session):
    m = _create(admin_session, f"NoPrice {int(time.time())}", [])
    slug = m["slug"]
    try:
        html = requests.get(f"{SSR}/models/{slug}", timeout=10).text
        assert "<h2>Tarife</h2>" not in html, "section must be hidden when prices is empty"
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)


def test_update_replaces_price_ladder(admin_session):
    m = _create(admin_session, f"Update Price {int(time.time())}", [
        {"label": "1 Stunde", "amount": 500, "currency": "EUR"},
    ])
    slug = m["slug"]
    try:
        # Replace with a fully different ladder
        payload = {**m, "prices": [{"label": "Wochenende", "amount": 5000, "currency": "CHF"}]}
        for k in ("id", "slug", "created_at"):
            payload.pop(k, None)
        r = admin_session.put(f"{API}/models/{slug}", json=payload, timeout=15)
        assert r.status_code == 200
        assert len(r.json()["prices"]) == 1
        assert r.json()["prices"][0]["currency"] == "CHF"
    finally:
        admin_session.delete(f"{API}/models/{slug}", timeout=15)
