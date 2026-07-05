"""Seed 10 SEO-optimised Hamburg lifestyle blog articles.

Each article is editorial in tone (matching the existing 3 seed posts) with
proper H2 structure (drives the auto-generated Table of Contents on the
public detail page), internal links to relevant services and area pages,
and complete SEO metadata in both German and English.

Idempotent — skips articles whose slugs already exist. Slugs are derived
server-side from the title.
"""
import os
import requests
from datetime import datetime, timezone

BASE = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://client-portal-385.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE}/api"
ADMIN_EMAIL = "admin@noir-hamburg.de"
ADMIN_PASSWORD = "NoirAdmin2026!"

# Placeholder cover image used across the batch — the admin can replace
# per-article afterwards through /admin/blog.
COVER = "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1600&q=85"

ARTICLES = [
    # ---------------- 1. LUXURY HOTELS HAMBURG ----------------
    {
        "title": "Die besten Luxus-Hotels in Hamburg 2026 — Ihr Wegweiser",
        "title_en": "The Best Luxury Hotels in Hamburg 2026 — Your Guide",
        "category": "Luxury Hotels Hamburg",
        "excerpt": "Ein persönlicher Wegweiser durch Hamburgs feinste Häuser — vom Fairmont Vier Jahreszeiten bis zum Fontenay.",
        "excerpt_en": "A personal guide through Hamburg's finest hotels — from the Fairmont Vier Jahreszeiten to The Fontenay.",
        "meta_title": "Die besten Luxus-Hotels in Hamburg 2026 | Noir Hamburg",
        "meta_description": "Fairmont Vier Jahreszeiten, The Fontenay, Atlantic Kempinski — unser detaillierter Wegweiser durch die feinsten Hamburger Luxushotels. Mit Einblicken zu Service, Lage und Diskretion.",
        "meta_title_en": "The Best Luxury Hotels in Hamburg 2026 | Noir Hamburg",
        "meta_description_en": "Fairmont Vier Jahreszeiten, The Fontenay, Atlantic Kempinski — our detailed guide through Hamburg's finest luxury hotels, with insights on service, location and discretion.",
        "related_services": ["luxury-escort-hamburg", "hotel-escort-hamburg"],
        "related_locations": ["hafencity", "harvestehude", "hamburg"],
        "cover_image": COVER,
        "content": """
<p>Hamburg zählt zu den wenigen Städten Europas, in denen die Auswahl an wirklich erstklassigen Hotels dicht genug ist, um Vergleiche zu erlauben. Wer regelmäßig hier übernachtet, entwickelt seine Vorlieben — und wir haben uns über die Jahre eine eigene Rangordnung erarbeitet. Hier unsere ehrliche Einschätzung der besten Häuser der Hansestadt.</p>

<h2>Fairmont Hotel Vier Jahreszeiten</h2>
<p>Das Fairmont am Neuen Jungfernstieg ist die klassische Wahl — und aus gutem Grund. Klassizistisches Interior, Blick über die Binnenalster, ein Concierge-Team, das seit Jahrzehnten die Erwartungen der Hanseatischen Elite kennt. Die Suiten der oberen Etagen mit Alsterblick sind unser Empfehlungsklassiker für Business-Reisende, die Wert auf ruhige Ankunft und diskrete Bedienung legen.</p>
<p>Für <a href="/services/dinner-companion-hamburg">Dinner-Abende</a> ist das hauseigene Haerlin (zwei Michelin-Sterne) die beste Adresse in Hamburg — mit einer Weinkarte, die dem Ambiente gerecht wird.</p>

<h2>The Fontenay</h2>
<p>Das jüngste Aushängeschild der Stadt und für viele unserer Kunden die aufregendere Alternative. Die kreisrunde Architektur direkt an der Außenalster ist einzigartig, das Lakeside-Restaurant hält zwei Michelin-Sterne. Für Gäste, die zeitgenössische Formensprache dem klassischen Grand-Hotel-Stil vorziehen, ist The Fontenay die klare Empfehlung.</p>

<h2>Atlantic Hotel Kempinski</h2>
<p>Das Atlantic am Alsterufer verkörpert die alte Reeder-Eleganz Hamburgs. Weite Suiten, hohe Decken, ein hauseigener Weinkeller. Perfekt für längere Aufenthalte und für Kunden, die den etwas leiseren Stil bevorzugen. Der Klassiker unter den Klassikern.</p>

<h2>SIDE Design Hotel</h2>
<p>Für Gäste mit einem Interesse an zeitgenössischem Design ist das SIDE in der Innenstadt eine spannende Alternative zu den grandes dames. Kompakter, urbaner, klar akzentuiert — perfekt für Wochenendaufenthalte, an denen das Hotel selbst Teil des Erlebnisses ist.</p>

<h2>Reichshof Hamburg</h2>
<p>Der Reichshof am Hauptbahnhof ist die schnellste, praktischste Wahl für Business-Reisende mit engem Zeitplan. Nicht so glamourös wie die vier oben — aber Service, Ruhe und Anonymität stimmen. Für kurze Übernachtungen zwischen zwei Terminen unsere Standard-Empfehlung.</p>

<h2>Louis C. Jacob (Nienstedten)</h2>
<p>Wer die Innenstadt meiden möchte, findet in Blankenese/Nienstedten das <em>Louis C. Jacob</em> — eine Villa an der Elbchaussee mit unverstelltem Blick auf die Elbe. Ideal für ein <a href="/escort/blankenese">Wochenende in Blankenese</a> oder ein privates Dinner in ruhigem Rahmen.</p>

<h2>Diskretion — wo funktioniert es am besten?</h2>
<p>Alle sechs Häuser haben lange Erfahrung mit privaten Besuchen und zeichnen sich durch professionelle Diskretion aus. Am wenigsten Aufmerksamkeit erhält Gäste erfahrungsgemäß in den Suiten des Fairmont, im Fontenay und im Louis C. Jacob — die Zimmerlage und die klare Aufgabentrennung zwischen Housekeeping und Concierge helfen dabei.</p>

<p><em>Für Ihre nächste Buchung empfehlen wir das Hotel gerne im Rahmen unserer <a href="/services/hotel-escort-hamburg">Hotel Escort</a> Beratung mit — passend zu Anlass, Aufenthaltsdauer und Ihren Diskretions-Anforderungen.</em></p>
""".strip(),
    },

    # ---------------- 2. FINE DINING HAMBURG ----------------
    {
        "title": "Fine Dining Hamburg — Zehn Restaurants, die den Abend besonders machen",
        "title_en": "Fine Dining Hamburg — Ten Restaurants That Elevate the Evening",
        "category": "Fine Dining Hamburg",
        "excerpt": "Von Sterneküchen an der Elbe bis zu versteckten Adressen im Stadtpark — unsere persönliche Auswahl.",
        "excerpt_en": "From starred kitchens on the Elbe to hidden gems near the Stadtpark — our personal selection.",
        "meta_title": "Fine Dining Hamburg — Die 10 besten Restaurants 2026 | Noir Hamburg",
        "meta_description": "Haerlin, Jacobs, 100/200 Kitchen, The Table Kevin Fehling — zehn Restaurants in Hamburg, die einen Abend zu zweit besonders machen. Unser persönlicher Guide.",
        "meta_title_en": "Fine Dining Hamburg — Top 10 Restaurants 2026 | Noir Hamburg",
        "meta_description_en": "Haerlin, Jacobs, 100/200 Kitchen, The Table Kevin Fehling — ten restaurants in Hamburg that turn an evening for two into something memorable. Our personal guide.",
        "related_services": ["dinner-companion-hamburg", "luxury-escort-hamburg"],
        "related_locations": ["hafencity", "altona", "eppendorf"],
        "cover_image": COVER,
        "content": """
<p>Ein gelungenes Dinner ist mehr als gutes Essen — es ist Timing, Atmosphäre, die richtige Weinbegleitung und ein Personal, das versteht, wann es präsent sein soll und wann nicht. Nach Jahren an denselben Tischen haben wir eine sehr konkrete Vorstellung davon, wo diese Balance in Hamburg funktioniert. Hier unsere zehn Favoriten.</p>

<h2>Haerlin (Fairmont Vier Jahreszeiten)</h2>
<p>Zwei Michelin-Sterne, klassizistische Eleganz, unverstellter Blick über die Binnenalster. Für einen wirklich besonderen Abend die erste Wahl — und die einzige Adresse in Hamburg, an der wir das Menu Dégustation ohne Vorbehalte empfehlen können.</p>

<h2>The Table Kevin Fehling</h2>
<p>Drei Michelin-Sterne, ein einziger geschwungener Tisch für 24 Gäste. Wer die klassische Restauration hinter sich lassen möchte, findet hier eine kompromisslos moderne Interpretation. Reservierung deutlich im Voraus — Wartelisten von drei Monaten sind normal.</p>

<h2>Jacobs Restaurant (Hotel Louis C. Jacob)</h2>
<p>Ein Stern, eine Terrasse mit Blick auf die Elbe, ein Weinkeller, der zu den bestbestückten Norddeutschlands zählt. Klassisch, ruhig, hanseatisch. Unsere Empfehlung für Abende, an denen die Küche kein Statement sein muss.</p>

<h2>100/200 Kitchen (Wilhelmsburg)</h2>
<p>Ein Stern, dezidiert modern. Thomas Imbusch führt in Wilhelmsburg eine der ehrlichsten Küchen der Stadt — mit Fokus auf Fermentation, Nose-to-Tail und norddeutsche Produkte. Für Kunden mit kulinarischem Interesse ein Muss.</p>

<h2>Landhaus Scherrer</h2>
<p>Eine Institution, seit Jahrzehnten. Klassische Küche, hohe Präzision, ruhige Atmosphäre. Perfekt für Business-Dinner in kleiner Runde.</p>

<h2>Clouds Heaven's Bar & Kitchen</h2>
<p>Panoramablick über den Hafen, moderne Küche, urbane Klientel. Für einen späten Aperitif oder ein Dinner mit spektakulärer Kulisse — ideal für <a href="/escort/st-pauli">Abende auf St. Pauli</a>.</p>

<h2>Se7en Oceans (Alsterarkaden)</h2>
<p>Fisch- und Meeresfrüchte-Spezialist, ein Michelin-Stern. Zentrale Lage direkt an den Alsterarkaden — perfekt für Business-Kunden im Nahbereich der Innenstadt.</p>

<h2>Zeik (Winterhude)</h2>
<p>Aufsteiger der letzten Jahre, jüngst ein Stern. Mut zur Reduktion, exzellente Weinauswahl, angenehm entspannte Atmosphäre. Für einen weniger inszenierten Abend in <a href="/escort/winterhude">Winterhude</a>.</p>

<h2>Bianc (HafenCity)</h2>
<p>Zwei Michelin-Sterne, italienisch-mediterrane Handschrift von Matteo Ferrantino. Modern, präzise, mit einer Weinbegleitung von hoher Klasse. In der HafenCity die feinste Adresse neben The Table.</p>

<h2>Piment (Eppendorf)</h2>
<p>Wahid Taheri führt in <a href="/escort/eppendorf">Eppendorf</a> ein Restaurant mit persischen Einflüssen und einem Michelin-Stern. Perfekt für kleine, ruhige Runden — mit einem Küchenchef, der nach dem Menü oft persönlich an den Tisch kommt.</p>

<h2>Reservierung — worauf achten</h2>
<p>Für Freitag- und Samstagabende empfehlen wir mindestens zwei Wochen Vorlauf; für Menü Dégustations in den Sterne-Häusern gerne einen Monat. Wenn Sie eine <a href="/services/dinner-companion-hamburg">Dinner-Begleitung</a> buchen, übernehmen wir die Reservierung inklusive Wein-Absprache mit dem Sommelier gerne für Sie.</p>

<p><em>Ein gutes Dinner in Hamburg beginnt lange vor dem Amuse-Bouche. Es beginnt mit der richtigen Adresse — und der passenden Begleitung.</em></p>
""".strip(),
    },

    # ---------------- 3. NIGHTLIFE HAMBURG ----------------
    {
        "title": "Nightlife Hamburg — Eine kultivierte Nacht in der Hansestadt",
        "title_en": "Hamburg Nightlife — A Cultivated Night in the Hanseatic City",
        "category": "Nightlife Hamburg",
        "excerpt": "Bars, Jazzclubs und Late-Night-Adressen für Gäste, die den Feierabend stilvoll ausklingen lassen möchten.",
        "excerpt_en": "Bars, jazz clubs and late-night addresses for guests who wish to conclude the evening in style.",
        "meta_title": "Nightlife Hamburg — Die 10 stilvollsten Bars und Clubs | Noir Hamburg",
        "meta_description": "Von der Le Lion Bar zum Mutter, vom Clouds zur Cotton Club Jazz-Nacht — unser Guide durch das kultivierte Hamburger Nightlife 2026.",
        "meta_title_en": "Hamburg Nightlife — The 10 Most Stylish Bars and Clubs | Noir Hamburg",
        "meta_description_en": "From Le Lion Bar to Mutter, from Clouds to the Cotton Club — our guide through Hamburg's cultivated nightlife in 2026.",
        "related_services": ["dinner-companion-hamburg", "event-escort-hamburg"],
        "related_locations": ["st-pauli", "hafencity", "altona"],
        "cover_image": COVER,
        "content": """
<p>Hamburg hat, ganz anders als Berlin, kein einheitliches Nightlife-Bild — es hat mehrere. Zwischen der subkulturellen Rauheit von <a href="/escort/st-pauli">St. Pauli</a>, der urbanen Coolness der HafenCity und den klassischen Hotelbars entfaltet sich ein bemerkenswert vielfältiges Angebot für den späteren Abend. Unsere zehn Favoriten.</p>

<h2>Le Lion Bar de Paris</h2>
<p>Regelmäßig unter Deutschlands besten Bars gelistet. Klassische Cocktailkultur, ruhige Atmosphäre, präzise Ausführung. Der Gin Basil Smash wurde hier erfunden — Grund genug für eine erste Bestellung.</p>

<h2>Bar Hansen (Fairmont Vier Jahreszeiten)</h2>
<p>Hotelbar auf höchstem Niveau. Für Gäste, die nach einem Dinner im Haerlin nicht weiter gehen möchten. Klassisch-elegant, exzellenter Sommelier, ruhige Klientel.</p>

<h2>Mutter</h2>
<p>Eine der bekanntesten Late-Night-Adressen des Grindelviertels. Klassische Bar-Küche bis in die späten Stunden, Weinauswahl mit Charakter. Ideal für Gespräche jenseits der Konvention.</p>

<h2>Clouds Heaven's Nest</h2>
<p>Wolkenkratzer-Blick über den Hafen. Die Bar über dem Restaurant ist unsere Empfehlung für einen späten Aperitif nach einem Dinner in <a href="/escort/st-pauli">St. Pauli</a>. Musik dezent, Atmosphäre urban.</p>

<h2>Bar Nouveau</h2>
<p>Kleinste, feinste Cocktailbar der Stadt — gerade zehn Plätze, aber jede Kreation ein Erlebnis. Reservierung Pflicht.</p>

<h2>Boilerman Bar (25hours HafenCity)</h2>
<p>Retro-Amerikanisch, entspannt, hervorragende Whisky- und Rum-Auswahl. Für einen langen Abend in der <a href="/escort/hafencity">HafenCity</a> ein sicherer Klassiker.</p>

<h2>Cotton Club</h2>
<p>Der älteste Jazzclub Hamburgs. Für Gäste, die einen musikalisch akzentuierten Abend suchen, ist der Cotton Club Pflichtprogramm — mit einer Klientel, die Musik ernst nimmt.</p>

<h2>Birdland</h2>
<p>Der zweite Klassiker der Hamburger Jazz-Szene. Kleiner, intimer, mit einer Bühne, an der Weltklasse-Musiker regelmäßig auftreten. Perfekt für einen späten Freitag oder Samstag.</p>

<h2>Roof Garden (25hours HafenCity)</h2>
<p>Dachbar mit unverstellter Sicht über die Elbphilharmonie. Ideal für einen frühen Aperitif — die Sonnenuntergänge im Frühsommer sind ein eigener Grund.</p>

<h2>Golden Cut (St. Pauli)</h2>
<p>Für spätere Stunden auf St. Pauli: eine Adresse, die zwischen Nachtclub und Bar oszilliert. Musik kuratiert, Klientel gut gemischt, Sicherheit stimmt.</p>

<h2>Wie plant man einen Abend?</h2>
<p>Wir empfehlen: Dinner um 20 Uhr in einem der Sterne-Restaurants, dann ein Aperitif in einer Hotelbar, danach — je nach Lust — Jazz oder eine der genannten Bars. Unsere <a href="/services/event-escort-hamburg">Event Escort</a> Damen sind mit diesen Adressen vertraut und finden sich souverän zurecht.</p>

<p><em>Hamburgs Nightlife ist nicht laut, aber es ist reichhaltig. Wer weiß, wo er hingehen kann, erlebt eine Nacht, die sich lohnt.</em></p>
""".strip(),
    },

    # ---------------- 4. BUSINESS TRAVEL HAMBURG ----------------
    {
        "title": "Business Travel Hamburg — Der pragmatische Wegweiser für den anspruchsvollen Reisenden",
        "title_en": "Business Travel Hamburg — The Pragmatic Guide for the Discerning Traveller",
        "category": "Business Travel Hamburg",
        "excerpt": "Vom Flughafen zum Meeting, vom Hotel zum Dinner — die effizientesten Wege durch die Hansestadt.",
        "excerpt_en": "From airport to meeting, from hotel to dinner — the most efficient paths through the Hanseatic city.",
        "meta_title": "Business Travel Hamburg 2026 — Hotel, Meeting, Restaurant | Noir Hamburg",
        "meta_description": "Alles, was Sie für eine professionelle Geschäftsreise nach Hamburg brauchen: Hotel-Empfehlungen, Meeting-Locations, Business-Restaurants, Chauffeur-Optionen.",
        "meta_title_en": "Business Travel Hamburg 2026 — Hotel, Meeting, Restaurant | Noir Hamburg",
        "meta_description_en": "Everything you need for a professional business trip to Hamburg: hotel recommendations, meeting venues, business restaurants, chauffeur options.",
        "related_services": ["business-escort-hamburg", "hotel-escort-hamburg", "dinner-companion-hamburg"],
        "related_locations": ["hafencity", "hamburg", "harvestehude"],
        "cover_image": COVER,
        "content": """
<p>Wer regelmäßig geschäftlich nach Hamburg reist, entwickelt schnell seine Rituale — bestimmte Hotels, bestimmte Restaurants, bestimmte Zeitpuffer zwischen den Terminen. Für Erstreisende und für alle, die ihre Routine überdenken möchten, hier unser pragmatischer Wegweiser.</p>

<h2>Ankunft — Flughafen oder Bahnhof?</h2>
<p>Der Hamburg Airport (HAM) ist zentraler gelegen als vergleichbare deutsche Hubs — vom Terminal 2 sind es 25 Minuten mit dem Taxi in die Innenstadt, deutlich weniger als in München oder Frankfurt. Wer aus Berlin oder Frankfurt anreist, ist mit dem ICE oft schneller: Hamburg Hauptbahnhof liegt direkt in der City.</p>

<h2>Hotel-Auswahl nach Meeting-Ort</h2>
<p>Für Meetings in der HafenCity empfehlen wir das <a href="/escort/hafencity">Hyatt Regency</a> oder das 25hours HafenCity — 5 bis 10 Minuten Fußweg. Für Termine in der Innenstadt ist das Reichshof am Hauptbahnhof am praktischsten. Für Board-Retreats oder repräsentative Meetings ist das <a href="/services/hotel-escort-hamburg">Fairmont Vier Jahreszeiten</a> unverändert die erste Wahl.</p>

<h2>Meeting-Locations</h2>
<p>Für kleinere Gruppen empfehlen wir die Meeting-Suiten des Fontenay (bis 15 Personen) oder das Business Center des Atlantic. Für größere Runden bietet das Kongresszentrum CCH modernste Technik in prominenter Lage. Für ganz vertrauliche Gespräche: das Small Meeting Room im Reichshof — buchbar, aber diskret.</p>

<h2>Business-Dinner — die drei sicheren Adressen</h2>
<p>Wenn Sie einen wichtigen Kunden zum Dinner ausführen, gehen Sie ins <em>Haerlin</em> (Fairmont), ins <em>Jacobs</em> (Elbchaussee) oder ins <em>Landhaus Scherrer</em>. Alle drei bieten diskrete Nischen, exzellente Weinbegleitung und ein Service-Team, das Business-Etikette versteht — auch mit internationalen Gästen.</p>

<h2>Chauffeur oder Uber?</h2>
<p>Für Business-Kunden empfehlen wir einen der zuverlässigen Chauffeur-Dienste, die wir seit Jahren einsetzen — <em>hansen chauffeur</em>, <em>elbe car service</em>, oder für den kurzen Weg <em>Hamburg Limousine</em>. Uber ist verfügbar, aber die Diskretion und Zuverlässigkeit privater Chauffeure ist im Business-Kontext das bessere Investment.</p>

<h2>Timing — Puffer richtig kalkulieren</h2>
<p>Zwischen Flughafen und Innenstadt: 45 Minuten in der Hauptverkehrszeit. Zwischen HafenCity und Elbchaussee: 25 Minuten (auch spät abends). Zwischen zwei Hotels in Harvestehude/Rotherbaum: 10 Minuten. Bei mehreren Terminen an einem Tag empfehlen wir immer 15 Minuten Puffer zwischen den Meetings.</p>

<h2>Wenn Sie Begleitung wünschen</h2>
<p>Für Empfänge, Board-Dinner oder Client-Entertainment vermitteln wir unsere <a href="/services/business-escort-hamburg">Business Escort</a> Damen — konferenzfähig, mehrsprachig, mit hanseatischer Etikette vertraut. Anfrage über unser Kontaktformular oder direkt per WhatsApp mit Anlassbeschreibung, Zeitrahmen und Ort.</p>

<p><em>Business Travel nach Hamburg soll effizient sein — nicht anstrengend. Mit der richtigen Vorbereitung gelingt beides.</em></p>
""".strip(),
    },

    # ---------------- 5. HAMBURG LIFESTYLE ----------------
    {
        "title": "Ein Wochenende in Hamburg — Der stilvolle Kurzurlaub in der Hansestadt",
        "title_en": "A Weekend in Hamburg — The Stylish Short Break in the Hanseatic City",
        "category": "Hamburg Lifestyle",
        "excerpt": "Zwei Tage, drei Nächte — ein persönliches Itinerar für einen kultivierten Aufenthalt in Hamburg.",
        "excerpt_en": "Two days, three nights — a personal itinerary for a cultivated stay in Hamburg.",
        "meta_title": "Wochenende in Hamburg — Das Premium-Itinerar 2026 | Noir Hamburg",
        "meta_description": "Wie Sie ein Wochenende in Hamburg wirklich genießen: Hotel, Restaurants, Kultur, Ausflüge und diskrete Begleitung. Unser Insider-Itinerar für stilvolle Kurzurlaube.",
        "meta_title_en": "Weekend in Hamburg — The Premium Itinerary 2026 | Noir Hamburg",
        "meta_description_en": "How to truly enjoy a weekend in Hamburg: hotel, restaurants, culture, excursions and discreet companionship. Our insider itinerary for stylish short breaks.",
        "related_services": ["luxury-escort-hamburg", "girlfriend-experience-hamburg", "dinner-companion-hamburg"],
        "related_locations": ["hafencity", "blankenese", "harvestehude"],
        "cover_image": COVER,
        "content": """
<p>Ein Wochenende in Hamburg lohnt sich — und zwar nicht nur für Deutsche. Die Hansestadt bietet in drei Tagen mehr Kultur, Genuss und Ruhe als viele europäische Städte in einer Woche. Unser Vorschlag für ein Itinerar, das die richtigen Adressen mit ausreichend Freiraum kombiniert.</p>

<h2>Freitag: Ankunft und Aperitif</h2>
<p>Anreise idealerweise um 16 Uhr, damit die Innenstadt noch nicht überlaufen ist. Check-in in einem der <a href="/blog/die-besten-luxus-hotels-in-hamburg-2026-ihr-wegweiser">Hamburger Luxus-Hotels</a>. Danach ein Spaziergang um die Binnenalster, ein Aperitif im Café Paris oder in der Le Lion Bar. Für das Dinner: das Haerlin oder — für eine ruhigere erste Nacht — das Jacobs an der Elbchaussee.</p>

<h2>Samstag: HafenCity und Kunst</h2>
<p>Morgens ein langsames Frühstück im Hotel, danach Fußweg oder Taxi zur HafenCity. Ein Rundgang beginnt idealerweise an den Magellan-Terrassen, weiter zur Elbphilharmonie (die Plaza ist frei zugänglich), dann durch die Speicherstadt.</p>
<p>Nachmittags: Bucerius Kunst Forum oder Hamburger Kunsthalle. Beide Häuser haben regelmäßig starke Wechselausstellungen — die aktuelle Übersicht finden Sie auf den jeweiligen Websites.</p>
<p>Abends: Konzert in der Elbphilharmonie (Karten mindestens vier Wochen im Voraus buchen), danach Dinner im Bianc oder Se7en Oceans. Für einen späten Ausklang: die Roof Bar des 25hours HafenCity.</p>

<h2>Sonntag: Blankenese und Elbe</h2>
<p>Sonntagvormittag empfehlen wir eine Fahrt nach <a href="/escort/blankenese">Blankenese</a>. Das Treppenviertel, ein langsamer Spaziergang am Elbufer, ein Mittagessen im Süllberg oder im Landhaus Scherrer. Wer noch Zeit hat, fährt anschließend mit der Fähre zurück nach Landungsbrücken — die entspannteste Rückreise in die Innenstadt.</p>

<h2>Begleitung — wann sinnvoll?</h2>
<p>Für Gäste, die einen erweiterten Rahmen suchen, empfehlen wir eine <a href="/services/girlfriend-experience-hamburg">Girlfriend Experience</a>-Buchung über das ganze Wochenende: eine ruhige, kultivierte Begleiterin, die den Aufenthalt persönlicher macht — ohne den formellen Rahmen einer klassischen Escort-Buchung. Kontaktieren Sie uns idealerweise zwei bis drei Wochen vorher, damit wir die passende Wahl treffen können.</p>

<h2>Was Sie definitiv nicht machen sollten</h2>
<p>Vermeiden Sie Touristenrouten: die Reeperbahn am Samstagabend, das Hard Rock Café, den Fischmarkt am Sonntagmorgen (wenn Sie mit Kater sind). Hamburg belohnt Ruhe und Auswahl — nicht Programm.</p>

<p><em>Drei Tage sind in Hamburg genug, um zu verstehen, warum unsere Kunden immer wieder herkommen. Mit der richtigen Planung wird aus dem Wochenende ein kleines Ereignis.</em></p>
""".strip(),
    },

    # ---------------- 6. PRIVACY & DISCRETION ----------------
    {
        "title": "Diskretion im Zeitalter digitaler Spuren — Wie wir Ihre Privatsphäre wirklich schützen",
        "title_en": "Discretion in the Age of Digital Footprints — How We Really Protect Your Privacy",
        "category": "Privacy & Discretion",
        "excerpt": "Verschlüsselte Kommunikation, minimale Datenspeicherung, NDA auf Wunsch — und warum das keine Marketing-Phrasen sind.",
        "excerpt_en": "Encrypted communication, minimal data storage, NDA on request — and why these are not marketing phrases.",
        "meta_title": "Diskretion & Datenschutz | Noir Hamburg Premium Escort",
        "meta_description": "Wie Noir Hamburg Diskretion garantiert: verschlüsselte Kommunikation, DSGVO-konforme Datenverarbeitung, NDA auf Wunsch. Der ehrliche Blick hinter die Kulissen.",
        "meta_title_en": "Discretion & Data Protection | Noir Hamburg Premium Escort",
        "meta_description_en": "How Noir Hamburg guarantees discretion: encrypted communication, GDPR-compliant data handling, NDA on request. The honest look behind the scenes.",
        "related_services": ["vip-escort-hamburg", "business-escort-hamburg", "luxury-escort-hamburg"],
        "related_locations": ["hamburg", "harvestehude"],
        "cover_image": COVER,
        "content": """
<p>In einer Zeit, in der jede Kartenzahlung, jeder Chat und jeder Kalendereintrag digitale Spuren hinterlässt, ist Diskretion zu einer echten Ingenieurleistung geworden. Wir haben uns seit 2014 sehr detailliert damit beschäftigt — hier eine ehrliche Übersicht, wie wir Ihre Privatsphäre schützen.</p>

<h2>Verschlüsselung als Standard</h2>
<p>Alle Kommunikation über unser Kontaktformular läuft über TLS 1.3. Für Bestandskunden bieten wir Signal-Verschlüsselung an; auf Wunsch auch PGP-Mail. Wir speichern keine Chat-Historien länger als notwendig — nach dem Termin werden Konversationen restlos entfernt.</p>

<h2>Was wir speichern — und warum</h2>
<p>Wir speichern das absolute Minimum: Ihren Namen (oder Pseudonym), eine Kontaktmöglichkeit (Telefon oder E-Mail), Ihre Terminhistorie (für Wiederholungsbuchungen sinnvoll). Wir speichern <strong>nicht</strong>: Ihre Adresse, Ihren Arbeitgeber, Ihre Familienverhältnisse, Ihre Aufenthaltsorte. Das entnehmen wir gegebenenfalls dem Kontext des Termins, aber nichts davon landet in unserem CRM.</p>

<h2>Wer Zugriff hat</h2>
<p>Nur zwei Mitarbeiter unseres Teams haben Zugriff auf sensible Kundendaten. Alle anderen — inklusive der begleitenden Damen — bekommen nur die Informationen, die sie zwingend für den Termin benötigen: Ort, Uhrzeit, Anlass, gegebenenfalls Dresscode.</p>

<h2>NDA — wann sinnvoll</h2>
<p>Für Kunden aus dem öffentlichen Leben — Politiker, Sportler, Vorstände, Sportprominente — bieten wir eine schriftliche Geheimhaltungsvereinbarung. Unser Standard-NDA wurde von einer Hamburger Wirtschaftskanzlei entworfen, entspricht deutschem Recht und wird von der begleitenden Dame gegengezeichnet.</p>

<h2>Zahlung — wo Diskretion konkret wird</h2>
<p>Bargeld ist und bleibt die diskreteste Zahlungsform. Bank-Überweisung ist möglich, wird aber auf Kontoauszügen sichtbar. Für Business-Kunden stellen wir auf Anfrage eine unauffällige Rechnung — als Beratungsleistung, Event-Koordination oder in einer anderen anlassgerechten Formulierung.</p>

<h2>Was Sie selbst tun können</h2>
<p>Ein paar einfache Verhaltensregeln machen viel aus: keine Buchung von einem Firmenrechner, keine Recherche von einem Diensttelefon, keine WhatsApp-Nachrichten in einer Gruppe. Wir helfen gerne mit weiteren Empfehlungen — sprechen Sie uns einfach an.</p>

<h2>Was DSGVO Ihnen garantiert</h2>
<p>Nach europäischem Datenschutzrecht haben Sie jederzeit das Recht auf Auskunft, Löschung, Widerspruch. Eine formlose E-Mail an unsere <a href="/kontakt">Kontakt-Adresse</a> genügt. Wir bearbeiten solche Anfragen innerhalb von 48 Stunden.</p>

<p><em>Diskretion ist bei uns keine Marketing-Phrase, sondern eine bewusste Ingenieurentscheidung. Genau deshalb kommen unsere Kunden seit Jahren zu uns zurück.</em></p>
""".strip(),
    },

    # ---------------- 7. LUXURY LIFESTYLE ----------------
    {
        "title": "Elbphilharmonie — Ein Abend im Konzertsaal, der die Stadt neu erfunden hat",
        "title_en": "Elbphilharmonie — An Evening in the Concert Hall That Reinvented the City",
        "category": "Luxury Lifestyle",
        "excerpt": "Karten, Restaurants, Nachbereitung — wie Sie einen Elbphilharmonie-Abend richtig planen.",
        "excerpt_en": "Tickets, restaurants, aftermath — how to properly plan an evening at the Elbphilharmonie.",
        "meta_title": "Elbphilharmonie — Konzertabend richtig planen 2026 | Noir Hamburg",
        "meta_description": "Wie Sie einen Abend in der Elbphilharmonie professionell planen: Karten, Restaurant vorher, Hotel, Nachbereitung. Unser Insider-Guide für stilvolle Konzertabende.",
        "meta_title_en": "Elbphilharmonie — Planning the Perfect Concert Evening 2026 | Noir Hamburg",
        "meta_description_en": "How to plan a professional evening at the Elbphilharmonie: tickets, pre-concert dinner, hotel, aftermath. Our insider guide for stylish concert evenings.",
        "related_services": ["luxury-escort-hamburg", "event-escort-hamburg", "dinner-companion-hamburg"],
        "related_locations": ["hafencity"],
        "cover_image": COVER,
        "content": """
<p>Die Elbphilharmonie ist unbestritten das eine Bauwerk, das Hamburg im letzten Jahrzehnt neu positioniert hat. Ein Abend dort ist mehr als ein Konzertbesuch — es ist eine kulturelle Aussage. Damit dieser Abend gelingt, braucht es Vorbereitung. Hier die wichtigsten Details.</p>

<h2>Karten — wann buchen</h2>
<p>Für den Großen Saal empfehlen wir mindestens sechs Wochen Vorlauf, für populäre Konzerte (etwa Berliner Philharmoniker, Kent Nagano) drei Monate. Die besten Plätze sind Reihe 12–16 im Parkett — nahe genug für Präsenz, hoch genug für Klangqualität. Für privatere Veranstaltungen ist der Kleine Saal (mit 550 Plätzen) unser Favorit.</p>

<h2>Vor dem Konzert — das Dinner</h2>
<p>Das Standard-Dinner vor der Elbphilharmonie: <em>The Table Kevin Fehling</em> in der HafenCity — drei Sterne, 15 Gehminuten. Reservierung mindestens zwei Monate vor dem Konzertdatum. Alternativ das <em>Bianc</em> in der HafenCity oder das <em>Se7en Oceans</em> an den Alsterarkaden.</p>
<p>Wichtig: Reservierungszeit auf 18:00 Uhr legen, damit Sie um 19:30 Uhr entspannt am Konzertsaal sind. Konzerte beginnen in der Elbphilharmonie in der Regel um 20 Uhr.</p>

<h2>Anreise</h2>
<p>Mit dem Taxi 12 Minuten von der Binnenalster. Parkplätze in der Speicherstadt sind rar, aber vorhanden. Wenn Sie mit <a href="/services/event-escort-hamburg">Begleitung</a> anreisen, empfehlen wir Chauffeur — er wartet während des Konzerts.</p>

<h2>Was anziehen</h2>
<p>Anders als in Wien oder Berlin gilt in der Elbphilharmonie kein strenger Dresscode. Business Casual ist Standard, ein Anzug angemessen. Für Premieren und Galaabende empfehlen wir schwarzen Anzug oder Smoking; für reguläre Konzerte ein dunkles Sakko.</p>

<h2>Nach dem Konzert</h2>
<p>Konzerte enden gegen 22:15 Uhr. Der schönste Ausklang ist eine späte Bar-Runde: die Boilerman Bar im 25hours HafenCity (Fußweg), die Roof Bar (im selben Haus) oder — für eine ruhigere Adresse — die Bar im Fontenay. Wir empfehlen, nach dem Konzert nicht mehr weit zu fahren.</p>

<h2>Die Plaza</h2>
<p>Wenig bekannt: die öffentliche Plaza auf 37 Metern Höhe ist auch ohne Konzertticket zugänglich (kostenfreie Reservierung online). Ideal für einen kleinen Sunset-Spaziergang vor einem Dinner in der HafenCity.</p>

<h2>Begleitung</h2>
<p>Für Konzertabende empfehlen wir eine Damen mit musikalischem Interesse — nicht jede unserer Damen ist gleich vertraut mit Klassik. Sprechen Sie das im <a href="/services/event-escort-hamburg">Vorgespräch</a> an, wir wählen entsprechend aus.</p>

<p><em>Die Elbphilharmonie ist ein Bauwerk, das den Aufwand belohnt. Wer den Abend richtig plant, erlebt einen der schönsten Konzertabende Europas.</em></p>
""".strip(),
    },

    # ---------------- 8. ESCORT GUIDES ----------------
    {
        "title": "Der stilvolle Herr in Hamburg — Ein Guide zur Etikette der Hansestadt",
        "title_en": "The Stylish Gentleman in Hamburg — A Guide to Hanseatic Etiquette",
        "category": "Escort Guides",
        "excerpt": "Wie Sie sich in Hamburgs feinsten Kreisen bewegen — Kleidung, Konversation, Codes.",
        "excerpt_en": "How to move in Hamburg's finest circles — attire, conversation, codes.",
        "meta_title": "Hanseatische Etikette — Der stilvolle Herr in Hamburg 2026 | Noir Hamburg",
        "meta_description": "Wie Sie in Hamburg als anspruchsvoller Gast bestehen: Dresscodes, Konversationskonventionen, Umgangsformen. Unser praktischer Guide zur hanseatischen Etikette.",
        "meta_title_en": "Hanseatic Etiquette — The Stylish Gentleman in Hamburg 2026 | Noir Hamburg",
        "meta_description_en": "How to succeed in Hamburg as a discerning guest: dress codes, conversational conventions, manners. Our practical guide to Hanseatic etiquette.",
        "related_services": ["luxury-escort-hamburg", "business-escort-hamburg", "vip-escort-hamburg"],
        "related_locations": ["harvestehude", "eppendorf", "blankenese"],
        "cover_image": COVER,
        "content": """
<p>Hamburg funktioniert nach anderen Regeln als Berlin, München oder Frankfurt. Die Hansestadt pflegt eine Zurückhaltung, die auf den ersten Blick unauffällig wirkt — bei näherer Betrachtung aber sehr konsequent durchgehalten wird. Wer diese Codes versteht, bewegt sich in den feinsten Kreisen mit spürbarer Selbstverständlichkeit.</p>

<h2>Kleidung — die hanseatische Grundregel</h2>
<p>Hanseatisch heißt: einen Ton weniger. Ein Anzug in Marineblau oder Anthrazit statt Schwarz. Ein Einstecktuch in weiß statt in Farbe. Eine dezente Uhr statt einer präsenten. Der wohlhabende Hamburger fällt genau dadurch auf, dass er nicht auffällt.</p>
<p>Für Business-Dinner: dunkler Anzug, weißes Hemd, dezent gemusterte Krawatte oder gar keine. Für Galas: schwarzer Anzug oder — bei explizitem Dresscode — Smoking. Für private Anlässe: gepflegter Casual-Look mit Blazer und Chino, keine Sneaker.</p>

<h2>Begrüßung</h2>
<p>Der Handschlag ist in Hamburg fester als in Berlin — kurz, fest, mit Augenkontakt. Bei Damen: leichte Verbeugung mit einem angedeuteten Handkuss ist im gehobenen Segment noch üblich, im mittleren Segment übertrieben. Bei Unsicherheit: warten, was die Dame anbietet.</p>

<h2>Konversation</h2>
<p>Hanseatische Gespräche vermeiden drei Themen: die eigene Vermögenslage, politische Meinungen und persönliche Kränkungen. Sichere Themen: Hamburg selbst (die Alster, die Kunst, die Elbphilharmonie), Reisen, klassische Musik, Yachting/Segeln, Kunst. Vermeiden Sie: Prahlerei mit Preisen (auch von Weinen), Berlin-Vergleiche, Anekdoten über andere Damen.</p>

<h2>Restaurants — die feineren Codes</h2>
<p>Im Restaurant: nicht zu laut sprechen, dem Kellner mit "Herr Ober" oder "Herr Kellner" begegnen (nicht "Chef" oder "Junge"). Rechnungen werden nicht am Tisch besprochen — der Kellner kommt mit der Karte, Sie geben unauffällig Ihre Kreditkarte. Trinkgeld in der Regel 10 Prozent, in Sterne-Restaurants gerne 15.</p>

<h2>Der stille Umgang</h2>
<p>Hanseatische Höflichkeit besteht aus dem Nicht-Gesagten. Sie fragen keine Dame nach ihrem Beruf, wenn sie ihn nicht selbst nennt. Sie kommentieren nicht das Aussehen einer Dritten. Sie halten Türen auf, ohne zu erwarten, dass es bemerkt wird.</p>

<h2>Umgang mit Ihrer Begleitung</h2>
<p>Wenn Sie mit einer <a href="/services/luxury-escort-hamburg">Luxus-Begleitung</a> unterwegs sind, gelten unsere internen Regeln der Diskretion: kein Fingerzeigen, keine expliziten Bemerkungen, keine Bezug auf ihre "Rolle". Behandeln Sie sie im öffentlichen Raum wie eine Partnerin oder Freundin — das ist der einzige Umgang, den unsere Damen erwarten und den ein hanseatischer Herr ohnehin pflegt.</p>

<h2>Ausklang</h2>
<p>Ein Abend endet in Hamburg selten spontan. Er endet an einem definierten Zeitpunkt, an einem definierten Ort. Der Abschied ist kurz, freundlich, ohne Nachhänger. "Vielen Dank für den schönen Abend" — mehr braucht es nicht.</p>

<p><em>Hanseatische Etikette ist nicht kompliziert. Sie ist eine Übung in Zurückhaltung — und genau darin liegt ihr Charme.</em></p>
""".strip(),
    },

    # ---------------- 9. RESTAURANTS ----------------
    {
        "title": "Frühstück in Hamburg — Die zehn schönsten Adressen für den langsamen Morgen",
        "title_en": "Breakfast in Hamburg — The Ten Most Charming Addresses for a Slow Morning",
        "category": "Fine Dining Hamburg",
        "excerpt": "Vom Kaffee an der Alster bis zum Champagner-Brunch im Fairmont — Hamburgs schönste Frühstücksadressen.",
        "excerpt_en": "From coffee by the Alster to champagne brunch at the Fairmont — Hamburg's most charming breakfast addresses.",
        "meta_title": "Frühstück in Hamburg — Die schönsten Adressen 2026 | Noir Hamburg",
        "meta_description": "Wo man in Hamburg wirklich schön frühstückt: Café Paris, Fairmont Brunch, Witthüs, Café Klatsch und mehr. Der langsame Morgen in der Hansestadt, richtig gemacht.",
        "meta_title_en": "Breakfast in Hamburg — The Most Charming Addresses 2026 | Noir Hamburg",
        "meta_description_en": "Where to enjoy a genuinely lovely breakfast in Hamburg: Café Paris, Fairmont brunch, Witthüs, Café Klatsch and more. A slow morning done right.",
        "related_services": ["girlfriend-experience-hamburg", "dinner-companion-hamburg"],
        "related_locations": ["hamburg", "winterhude", "blankenese"],
        "cover_image": COVER,
        "content": """
<p>Ein langsamer Morgen ist einer der unterschätzten Luxusgüter des modernen Lebens. Hamburg bietet dafür einige der schönsten Rahmenbedingungen Deutschlands — von hanseatischen Klassikern bis zu kleinen Cafés in Winterhude. Unsere zehn Empfehlungen.</p>

<h2>Café Paris (Rathausstraße)</h2>
<p>Wenn Sie einen Morgen nur an eine Adresse legen wollen, dann diese. Die Jugendstil-Fliesen, das Klavier im Hintergrund, das französische Frühstück mit frischen Croissants — Hamburgs beste Adresse für den ruhigen Vormittag.</p>

<h2>Fairmont Vier Jahreszeiten Brunch</h2>
<p>Der Sonntagsbrunch im Fairmont ist eine Institution. Champagner ab 11 Uhr, ein Buffet, das den Namen "Buffet" fast untertreibt, und ein Service, der sich Zeit nimmt. Reservierung mindestens eine Woche vorher.</p>

<h2>Witthüs am See (Winterhude)</h2>
<p>Direkt am Stadtpark-See gelegen. Im Sommer die schönste Terrasse in <a href="/escort/winterhude">Winterhude</a>. Klassisches Frühstück, gute Kaffeeröstung, hanseatische Klientel.</p>

<h2>Café Klatsch (Ottensen)</h2>
<p>Für einen entspannten Samstagmorgen: Café Klatsch in Ottensen mit einem der besten Käsekuchen der Stadt und einer angenehm kreativen Menu-Karte. Kein Fine Dining, aber genau richtig zum Wachwerden.</p>

<h2>Elbterrassen (Blankenese)</h2>
<p>Frühstück mit Elbblick. Nicht besonders elegant im Interior, aber die Terrasse gehört zu den schönsten Frühstücksadressen Deutschlands. Am besten mit dem Schiff hinfahren — der Weg ist Teil des Erlebnisses.</p>

<h2>The Fontenay Sonntagsbrunch</h2>
<p>Modernere Alternative zum Fairmont — mit denselben qualitativen Ansprüchen und einer Auswahl, die zeitgenössischer wirkt. Perfekt für Gäste, die klassischen Grand-Hotel-Charme durch avantgardistische Architektur ersetzen möchten.</p>

<h2>Café Herr Max (Schanze)</h2>
<p>Für einen etwas jüngeren, urbaneren Rahmen. Frisch gerösteter Kaffee, exzellente Backwaren, gute Auswahl für Vegetarier. Ideal für Samstagvormittage in der Sternschanze.</p>

<h2>Green Beans (Grindelallee)</h2>
<p>Espressobar mit dem Charme einer italienischen Bar-Fassade — kompakt, ohne Firlefanz, absolute Präzision beim Kaffee. Für ein schnelles Frühstück zwischen zwei Terminen.</p>

<h2>Meat Bakery (Ottensen)</h2>
<p>Wer auf Bagels und moderne Frühstücksmenüs steht, findet in der Meat Bakery die urbanste Adresse Hamburgs — angemessen laut, aber liebevoll gemacht.</p>

<h2>Freundlich & Kompetent (Winterhude)</h2>
<p>Der Klassiker unter den Winterhuder Cafés. Selbstgemachte Marmeladen, ausgezeichnetes Brot, freundlicher Service. Familienbetrieb seit Jahrzehnten.</p>

<h2>Zum Frühstück mit Begleitung</h2>
<p>Wer mit einer <a href="/services/girlfriend-experience-hamburg">Begleitung</a> übernachtet hat, kann den Morgen entspannt gemeinsam ausklingen lassen. Wir empfehlen dann das Café Paris oder — für einen Overnight im Fairmont — den hauseigenen Brunch. Reservierung übernehmen wir gerne mit.</p>

<p><em>Ein guter Morgen entscheidet über den ganzen Tag. In Hamburg lohnt es sich, ihn zu zelebrieren.</em></p>
""".strip(),
    },

    # ---------------- 10. FAQ GUIDES ----------------
    {
        "title": "Wie buche ich einen Escort in Hamburg? — Ihre Fragen, ehrlich beantwortet",
        "title_en": "How Do I Book an Escort in Hamburg? — Your Questions, Honestly Answered",
        "category": "FAQ Guides",
        "excerpt": "Von der ersten Anfrage bis zur Rechnung — alles, was Sie über eine Buchung bei Noir Hamburg wissen müssen.",
        "excerpt_en": "From your first enquiry to the invoice — everything you need to know about booking with Noir Hamburg.",
        "meta_title": "Escort in Hamburg buchen — Ihre Fragen ehrlich beantwortet | Noir Hamburg",
        "meta_description": "Wie funktioniert eine Escort-Buchung in Hamburg? Ablauf, Preise, Verifizierung, Diskretion — alle Ihre Fragen im Detail und ohne Marketing-Sprache.",
        "meta_title_en": "Booking an Escort in Hamburg — Your Questions Honestly Answered | Noir Hamburg",
        "meta_description_en": "How does booking an escort in Hamburg work? Process, pricing, verification, discretion — all your questions in detail and free of marketing jargon.",
        "related_services": ["luxury-escort-hamburg", "vip-escort-hamburg", "business-escort-hamburg", "dinner-companion-hamburg"],
        "related_locations": ["hamburg"],
        "cover_image": COVER,
        "content": """
<p>Erstbuchungen bei einer Escort-Agentur sind erklärungsbedürftig. Das ist völlig normal — und wir nehmen uns die Zeit, jede Frage zu beantworten. Hier die zehn häufigsten Themen, ehrlich und ohne Marketing-Sprache dargestellt.</p>

<h2>Wie kontaktiere ich Sie am besten?</h2>
<p>Die schnellsten Wege: unser <a href="/kontakt">Kontaktformular</a> auf noir-hamburg.de oder eine WhatsApp-Nachricht. Beide Kanäle werden sieben Tage die Woche betreut. Telefonisch sind wir werktags von 10 bis 22 Uhr erreichbar. Für Bestandskunden bieten wir zusätzlich Signal-Verschlüsselung.</p>

<h2>Wie schnell antworten Sie?</h2>
<p>Werktags in der Regel innerhalb einer Stunde. An Wochenenden und Feiertagen etwas verzögert (bis zu drei Stunden), aber immer noch am gleichen Tag. Für dringende, kurzfristige Anfragen (unter 24 Stunden) reagieren wir bevorzugt.</p>

<h2>Was frage ich am besten in der ersten Nachricht?</h2>
<p>Nennen Sie: Wunschtermin (Datum, Uhrzeit, Dauer), Anlass (Dinner, Business, Reise, privat), Ort (Hotel? Restaurant? Ihre Adresse?), Präferenzen (Sprache, Aussehen, Alter). Wenn Sie eine bestimmte <a href="/models">Dame</a> im Auge haben, ist das perfekt — sonst schlagen wir zwei bis drei passende Kandidatinnen vor.</p>

<h2>Wie sind Ihre Preise strukturiert?</h2>
<p>Preise sind auf jedem Modelprofil transparent ausgewiesen: Stundenpreis, Dinner-Package (mehrere Stunden inklusive Restaurant), Overnight (typischerweise 12 Stunden), Wochenende. Reisekosten und außergewöhnliche Zusatzleistungen kalkulieren wir vorab schriftlich. Keine Überraschungen.</p>

<h2>Verifizierung — was heißt das konkret?</h2>
<p>Bei Erstbuchungen bitten wir um eine kurze, diskrete Verifizierung — meist ein kurzer Rückruf zur bestätigten Telefonnummer oder eine XING/LinkedIn-Referenz. Das dient dem Schutz beider Seiten und dauert selten mehr als 15 Minuten.</p>

<h2>Wie erfolgt die Bezahlung?</h2>
<p>Bargeld ist Standard und wird diskret zu Beginn des Termins übergeben. Bank-Überweisung im Voraus ist möglich. Für Bestandskunden bieten wir auch dezente Rechnungsstellung — als Beratungsleistung, Event-Koordination oder anderer anlassgerechter Formulierung.</p>

<h2>Was passiert, wenn ich absage?</h2>
<p>Absagen bis 48 Stunden vor dem Termin sind kostenfrei. Zwischen 48 und 24 Stunden berechnen wir 30 Prozent des Honorars. Unter 24 Stunden das volle Honorar. Diese Regelung schützt auch unsere Damen — für die Termine mit Vorlauf blockiert wurden.</p>

<h2>Wie diskret sind Sie wirklich?</h2>
<p>Sehr. Verschlüsselte Kommunikation, minimale Datenspeicherung, keine Newsletter, kein Retargeting. NDA auf Wunsch. Details unter <a href="/p/diskretion">unserem Diskretions-Versprechen</a>.</p>

<h2>Was, wenn wir nicht harmonieren?</h2>
<p>Falls die Chemie beim Erstkontakt nicht stimmt, sagen Sie es der Dame oder uns. Für die verbleibende Zeit bieten wir Alternativen oder Anpassungen. Wir arbeiten mit Menschen, nicht mit Katalogware — und Menschen sind eben Persönlichkeiten.</p>

<h2>Kann ich dieselbe Dame wieder buchen?</h2>
<p>Selbstverständlich, und wir schätzen wiederkehrende Termine. Über die Zeit entstehen Vertrautheitsverhältnisse, die den Ablauf für beide Seiten angenehmer machen. Sprechen Sie einfach unseren Ansprechpartner an — er kennt Ihre Präferenzen.</p>

<p><em>Buchungen bei Noir Hamburg sind bewusst einfach — und ehrlich. Fragen Sie uns gerne alles Weitere, was Sie wissen möchten.</em></p>
""".strip(),
    },
]


def main() -> None:
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    print(f"✓ Logged in as {ADMIN_EMAIL}")

    # Fetch existing slugs to make this idempotent.
    r = s.get(f"{API}/blog")
    assert r.status_code == 200, r.text
    existing = {p["slug"] for p in r.json()}
    print(f"  Existing blog posts: {len(existing)}")

    def slugify(title: str) -> str:
        import re, unicodedata
        # Match the backend server.py's `to_slug` transliteration table.
        translit = {"ä": "ae", "ö": "oe", "ü": "ue", "Ä": "ae", "Ö": "oe", "Ü": "ue", "ß": "ss"}
        s = title
        for k, v in translit.items():
            s = s.replace(k, v)
        s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
        s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
        return s

    created = skipped = failed = 0
    for a in ARTICLES:
        slug = slugify(a["title"])
        if slug in existing:
            print(f"  ⊘ {slug[:60]} already exists — skipped")
            skipped += 1
            continue
        r = s.post(f"{API}/blog", json=a)
        if r.status_code == 200:
            print(f"  ✓ {slug[:60]}")
            created += 1
        else:
            print(f"  ✗ {slug[:60]}: {r.status_code} {r.text[:200]}")
            failed += 1

    print(f"\nDone: {created} created, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    main()
