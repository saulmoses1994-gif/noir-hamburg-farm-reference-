"""Seed the three trust-building CMS pages required for a serious SEO
foundation: Privacy Promise, Professional Standards, Booking Explained.

Idempotent — skips pages with slugs that already exist.
"""
import asyncio
import os
import requests

BASE = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://client-portal-385.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE}/api"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"


PAGES = [
    {
        "slug": "diskretion",
        "title": "Diskretion und Datenschutz | Noir Hamburg",
        "h1": "Unser Diskretions-Versprechen",
        "intro": "Diskretion ist bei uns kein Marketing-Begriff, sondern die Grundlage unserer Arbeit seit 2014.",
        "meta_title": "Diskretion & Datenschutz — Noir Hamburg Premium Escort",
        "meta_description": "Wie Noir Hamburg Diskretion garantiert: verschlüsselte Kommunikation, minimale Datenspeicherung, NDA auf Wunsch. Ihr Diskretions-Versprechen als Premium Escort Agentur in Hamburg.",
        "related_services": ["luxury-escort-hamburg", "vip-escort-hamburg", "business-escort-hamburg"],
        "related_locations": ["hamburg", "hafencity", "eppendorf"],
        "content": """
<p><strong>Diskretion ist unsere höchste Verpflichtung.</strong> Jede Anfrage, jedes Gespräch, jede Buchung — behandelt mit derselben professionellen Zurückhaltung, die wir seit über zehn Jahren pflegen. Wenn Sie sich für Noir Hamburg entscheiden, entscheiden Sie sich für einen Partner, der weiß, dass Vertrauen das kostbarste Gut in unserer Branche ist.</p>

<h2>Verschlüsselte Kommunikation</h2>
<p>Alle Anfragen — ob über Kontaktformular, WhatsApp oder E-Mail — laufen über verschlüsselte Verbindungen (TLS). Sensible Nachrichten löschen wir nach Abschluss der Buchung; nur die für Abrechnung und Steuer notwendigen Basisdaten verbleiben im System und werden nach den gesetzlichen Fristen sicher entsorgt.</p>

<h2>Minimale Datenspeicherung</h2>
<p>Wir erheben nur, was wir wirklich brauchen. Kein Newsletter, kein Retargeting, kein Analytics-Tracking Dritter auf sensiblen Seiten. Ihre Kontaktdaten sind nur den zwei Mitarbeitern zugänglich, die Ihre Buchung persönlich betreuen — nicht dem gesamten Team.</p>

<h2>NDA / Geheimhaltungsvereinbarung auf Wunsch</h2>
<p>Für Kunden aus dem öffentlichen Leben, Vorstände, Sportler und internationale Gäste erstellen wir auf Wunsch eine schriftliche Geheimhaltungsvereinbarung — von unserem Anwalt vorbereitet, gegengezeichnet vom betroffenen Model. Sprechen Sie uns einfach an; wir haben Standard-Templates auf Deutsch und Englisch parat.</p>

<h2>Was unsere Damen wissen — und was nicht</h2>
<p>Die Model erfährt vor der Buchung nur, was für den Abend zwingend notwendig ist: Ort, Uhrzeit, Anlass, gegebenenfalls Dresscode. Ihre vollständige Identität, Ihr Beruf, Ihre familiären Verhältnisse — all das bleibt bei uns, sofern Sie es nicht selbst preisgeben möchten.</p>

<h2>Ihre Rechte nach DSGVO</h2>
<p>Sie können jederzeit Auskunft über die zu Ihrer Person gespeicherten Daten verlangen, deren Berichtigung oder Löschung fordern (soweit gesetzliche Aufbewahrungspflichten nicht entgegenstehen), sowie der Datenverarbeitung widersprechen. Eine formlose E-Mail an unsere Kontaktadresse genügt.</p>

<p><em>Diskretion ist einfacher als sie klingt — sie beginnt damit, weniger zu wissen und weniger zu speichern. Genau das ist unsere Arbeitsweise.</em></p>
        """.strip(),
    },
    {
        "slug": "professionelle-standards",
        "title": "Professionelle Standards | Noir Hamburg",
        "h1": "Unsere professionellen Standards",
        "intro": "Vom ersten Kontakt bis zur Verabschiedung — was Sie bei Noir Hamburg erwarten dürfen.",
        "meta_title": "Professionelle Standards — Noir Hamburg Escort Agentur",
        "meta_description": "Wie Noir Hamburg seit 2014 professionelle Standards in der Hamburger Escort-Branche setzt: sorgfältige Auswahl, faire Tarife, ehrliche Beratung, verlässliche Erreichbarkeit.",
        "related_services": ["luxury-escort-hamburg", "business-escort-hamburg", "dinner-companion-hamburg"],
        "related_locations": ["hamburg", "harvestehude"],
        "content": """
<p><strong>Professionalität beginnt lange vor der Buchung.</strong> Sie beginnt bei der Auswahl der Damen, die wir vertreten. Sie zeigt sich in der Art, wie wir Ihre Anfrage beantworten. Und sie zieht sich durch bis zum unauffälligen Ende Ihres Abends. Hier sind die Standards, die wir uns selbst gesetzt haben.</p>

<h2>Auswahl unserer Damen</h2>
<p>Jede Dame, die wir vertreten, wird von uns persönlich kennengelernt — kein Model erscheint auf noir-hamburg.de, ohne dass ein Mitglied unseres Teams sie mindestens zwei Mal getroffen hat. Wir achten auf Bildung, sprachliche Gewandtheit, gepflegtes Auftreten, Zuverlässigkeit — und auf jene Selbstverständlichkeit, mit der nur echte Persönlichkeiten sich in unterschiedlichen Milieus bewegen.</p>

<h2>Ehrliche Beratung</h2>
<p>Wenn eine Buchung nicht das richtige Format ist, sagen wir das. Wenn eine bestimmte Dame für einen Anlass nicht ideal ist, empfehlen wir eine andere — selbst wenn sie günstiger ist. Wir verdienen langfristig mehr, wenn Sie wiederkommen, als wenn wir Sie einmalig maximal ausschöpfen.</p>

<h2>Transparente Tarife</h2>
<p>Alle Tarife stehen offen auf den Modelprofilen — Stundenpreis, Dinner-Packages, Overnight, Wochenende. Reisekosten und außergewöhnliche Zusatzleistungen (z. B. mehrtägige Reisen mit Perdiem, Business-Class-Flug) klären wir vorab schriftlich. Keine Überraschungen bei der Rechnung.</p>

<h2>Erreichbarkeit</h2>
<p>Wir beantworten Anfragen sieben Tage die Woche. Werktags in der Regel innerhalb einer Stunde, an Wochenenden und Feiertagen etwas verzögert, aber verlässlich. Kurzfristige Anfragen (weniger als 24 Stunden) sind möglich — die Verfügbarkeit hängt von der jeweiligen Dame ab.</p>

<h2>Zuverlässigkeit</h2>
<p>Ein bestätigter Termin ist bei uns ein bestätigter Termin. Sollte in absoluten Ausnahmefällen — Krankheit, familiärer Notfall — eine Dame kurzfristig ausfallen, informieren wir Sie umgehend und schlagen einen gleichwertigen Ersatz vor. In zehn Jahren ist das weniger als ein Dutzend Mal passiert.</p>

<p><em>Professionalität ist nicht, was wir versprechen. Es ist das, was wir seit 2014 tun.</em></p>
        """.strip(),
    },
    {
        "slug": "buchung",
        "title": "So funktioniert eine Buchung | Noir Hamburg",
        "h1": "So funktioniert eine Buchung bei Noir Hamburg",
        "intro": "In vier ruhigen Schritten von der ersten Anfrage bis zum Abend selbst.",
        "meta_title": "Buchung erklärt — Noir Hamburg Premium Escort Service",
        "meta_description": "Wie Sie bei Noir Hamburg buchen: Anfrage, Beratung, Bestätigung, Abend. Vier ruhige Schritte, klare Kommunikation, garantierte Diskretion.",
        "related_services": ["luxury-escort-hamburg", "vip-escort-hamburg", "dinner-companion-hamburg", "hotel-escort-hamburg"],
        "related_locations": ["hamburg", "hafencity"],
        "content": """
<p><strong>Buchungen bei Noir Hamburg sind bewusst einfach gehalten.</strong> Weniger Formulare, weniger Wartezeit, mehr persönliches Gespräch — so entstehen die Abende, an die man sich gerne erinnert.</p>

<h2>Schritt 1 · Ihre Anfrage</h2>
<p>Nutzen Sie unser Kontaktformular, WhatsApp oder rufen Sie an. Nennen Sie: Wunschtermin (Datum, Uhrzeit, geplante Dauer), Anlass (Dinner, Business-Event, Reise, privat), gegebenenfalls den Namen der Dame, die Sie im Auge haben. Alles Weitere klären wir im Gespräch.</p>

<h2>Schritt 2 · Persönliche Beratung</h2>
<p>Innerhalb einer Stunde melden wir uns zurück — bei kurzfristigen Anfragen deutlich schneller. Wir bestätigen Verfügbarkeit, klären offene Fragen (Dresscode, Restaurantvorschläge, Zeitplan) und schicken Ihnen — falls Sie noch unentschlossen sind — zwei bis drei passende Model-Vorschläge inklusive persönlicher Einschätzung.</p>

<h2>Schritt 3 · Verbindliche Bestätigung</h2>
<p>Sobald Sie sich entschieden haben, bestätigen wir schriftlich: Model, Termin, Dauer, Ort, Tarif inklusive eventueller Reisekosten. Bei erstmaligen Buchungen bitten wir um eine kleine Anzahlung als Vertrauensvorschuss — bei wiederkehrenden Kunden entfällt das selbstverständlich.</p>

<h2>Schritt 4 · Der Abend</h2>
<p>Die Dame erscheint pünktlich am vereinbarten Ort — im gewünschten Dresscode, mit einer Auffassung, die zum Anlass passt. Sie kümmern sich um nichts weiter als um die Freude am Abend. Restgeld wird diskret am Anfang des Termins übergeben; danach wird über nichts mehr gesprochen.</p>

<h2>Nach dem Abend</h2>
<p>Wir freuen uns über ein kurzes Feedback — und über Ihre nächste Anfrage. Bei zufriedenen Wiederholungskunden bevorzugen wir gewachsene Vertrauensbeziehungen, in denen die Standard-Anfrage in wenigen WhatsApp-Nachrichten erledigt ist.</p>

<p><em>Buchungen sollen entspannen, nicht Arbeit machen. Genau dafür sind wir da.</em></p>
        """.strip(),
    },
]


async def main() -> None:
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text

    for p in PAGES:
        r = s.get(f"{API}/pages/{p['slug']}")
        if r.status_code == 200:
            print(f"  ⊘ {p['slug']} already exists — skipped")
            continue
        r = s.post(f"{API}/pages", json=p)
        if r.status_code == 200:
            print(f"  ✓ {p['slug']:30} → {p['title']}")
        else:
            print(f"  ✗ {p['slug']}: {r.status_code} {r.text[:200]}")

    print(f"\nDone. Trust pages live at /p/diskretion, /p/professionelle-standards, /p/buchung")


if __name__ == "__main__":
    asyncio.run(main())
