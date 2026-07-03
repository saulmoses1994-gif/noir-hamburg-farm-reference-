"""
SSR EN-route + hreflang verification.

Confirms that every /en/* route exists, returns real HTML in English chrome,
and emits correct canonical + hreflang alternates pointing at the equivalent
URL in the other language. This is the SEO contract we promised users on
international Google indexes.
"""
import re
import requests
import pytest

BASE = "http://localhost:3000"
ORIGIN = "https://client-portal-385.preview.emergentagent.com"


def _fetch(path):
    r = requests.get(BASE + path, timeout=10, allow_redirects=False)
    return r


EN_ROUTES = [
    ("/en", "Luxury Escort"),
    ("/en/models", "Our Companions"),
    ("/en/services", "Escort Services Hamburg"),
    ("/en/areas", "Hamburg Areas"),
    ("/en/escort-hamburg", "Escort Hamburg"),
    ("/en/blog", "Noir Magazine"),
    ("/en/faq", "Frequently Asked Questions"),
    ("/en/about", "About"),
    ("/en/contact", "Contact"),
]


@pytest.mark.parametrize("path,marker", EN_ROUTES)
def test_en_route_returns_real_html_with_english_chrome(path, marker):
    r = _fetch(path)
    assert r.status_code == 200, f"{path} returned {r.status_code}"
    html = r.text
    assert "<html lang=\"en\">" in html, f"{path}: should have <html lang=\"en\">"
    assert marker in html, f"{path}: expected English chrome '{marker}' in HTML"
    assert "<noscript>" not in html, f"{path}: should not contain CRA noscript boilerplate"


def test_en_canonical_points_to_en_url():
    html = _fetch("/en/models").text
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html).group(1)
    assert canonical == f"{ORIGIN}/en/models"


def test_en_hreflang_alternates_present_on_en_page():
    html = _fetch("/en/models").text
    assert f'hreflang="de-DE" href="{ORIGIN}/models"' in html
    assert f'hreflang="en" href="{ORIGIN}/en/models"' in html
    assert f'hreflang="x-default" href="{ORIGIN}/models"' in html


def test_en_hreflang_alternates_present_on_de_page():
    html = _fetch("/models").text
    assert f'hreflang="de-DE" href="{ORIGIN}/models"' in html
    assert f'hreflang="en" href="{ORIGIN}/en/models"' in html
    assert f'hreflang="x-default" href="{ORIGIN}/models"' in html


def test_about_and_contact_slug_mapping():
    # DE /ueber-uns ↔ EN /en/about
    de_html = _fetch("/ueber-uns").text
    assert f'hreflang="en" href="{ORIGIN}/en/about"' in de_html
    en_html = _fetch("/en/about").text
    assert f'hreflang="de-DE" href="{ORIGIN}/ueber-uns"' in en_html
    # DE /kontakt ↔ EN /en/contact
    de_c = _fetch("/kontakt").text
    assert f'hreflang="en" href="{ORIGIN}/en/contact"' in de_c
    en_c = _fetch("/en/contact").text
    assert f'hreflang="de-DE" href="{ORIGIN}/kontakt"' in en_c


def test_en_page_carries_en_specific_meta_title():
    html = _fetch("/en").text
    assert "Exclusive Companionship" in html, "EN home should use English meta title"


def test_en_h1_is_english():
    html = _fetch("/en").text
    h1 = re.search(r"<h1>([^<]*<em>[^<]*</em>[^<]*)</h1>", html, re.S).group(1)
    assert "Luxury Escort" in h1


def test_en_nav_labels_are_english():
    html = _fetch("/en").text
    # nav links inside #seo-content render with EN chrome
    assert ">Home<" in html
    assert ">About<" in html
    assert ">Magazine<" in html


def test_en_preview_banner_absent_from_static_routes():
    # All site.js-driven EN pages now have full English copy, so the banner
    # never appears on them. Per-record banner behaviour (model/blog detail
    # without EN translation) is covered in test_per_record_en.py.
    for path in ["/en", "/en/services", "/en/areas", "/en/faq", "/en/about", "/en/contact"]:
        html = _fetch(path).text
        assert "EN preview" not in html, f"{path} should not contain banner"


def test_404_outside_en_namespace_still_works():
    # /en/nonexistent-model should 404 via the model lookup path
    r = _fetch("/en/models/this-model-does-not-exist")
    assert r.status_code == 404


def test_de_routes_still_use_german_chrome():
    html = _fetch("/models").text
    assert "<html lang=\"de\">" in html
    assert ">Startseite<" in html
    assert ">Über uns<" in html
