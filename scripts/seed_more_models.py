"""
Add 8 new elegant model profiles to the Noir Hamburg roster.

  - Idempotent: skips names that already exist by slug.
  - Each profile ships with bilingual bios (bio + bio_en), taglines,
    a full 4-tier price ladder with correct units, and admin can
    edit any field afterwards through the CMS.
"""
import asyncio
import os
import re
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv("/app/backend/.env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


# --------------------------------------------------------------------------- #
# 8 new profiles — mirrors the tone of the existing seed data.
# All images are from unsplash/pexels (royalty-free); admin can replace.
# --------------------------------------------------------------------------- #
NEW_MODELS = [
    {
        "name": "Isabella", "age": 26, "nationality": "Italienisch",
        "short_tagline": "Toskanische Sonne trifft hanseatische Zurückhaltung",
        "short_tagline_en": "Tuscan sun meets hanseatic restraint",
        "bio": "Isabella wuchs zwischen Florenz und Hamburg auf. Ihre bilinguale Erziehung und ihr Studium in Kunstgeschichte prägen ein feines Gespür für Ästhetik — von der Auswahl eines Weines bis zur Choreografie eines Abends.",
        "bio_en": "Isabella grew up between Florence and Hamburg. Her bilingual upbringing and her studies in art history shape a refined sense of aesthetics — from the choice of a wine to the choreography of an evening.",
        "height_cm": 172, "hair_color": "Schwarzbraun", "eye_color": "Bernstein",
        "dress_size": "36", "measurements": "85-63-91",
        "languages": ["Deutsch", "Italienisch", "Englisch"],
        "services": ["luxury-escort-hamburg", "dinner-companion-hamburg", "travel-companion-hamburg", "event-escort-hamburg"],
        "locations": ["hamburg", "hafencity", "harvestehude", "winterhude"],
        "cover_image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Kunstgeschichte", "Oper", "Toskana"],
        "prices": [
            {"label": "1 Stunde", "amount": 550, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 1700, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 2800, "currency": "EUR", "unit": "night"},
            {"label": "Wochenende", "amount": 6000, "currency": "EUR", "unit": "weekend"},
        ],
        "available": True, "featured": False,
    },
    {
        "name": "Charlotte", "age": 29, "nationality": "Britisch",
        "short_tagline": "British poise, hanseatic warmth",
        "short_tagline_en": "British poise, hanseatic warmth",
        "bio": "Aus einer Londoner Familie mit deutschen Wurzeln stammend, verbindet Charlotte britische Zurückhaltung mit einer erfrischenden Wärme. Sie promoviert in Rechtswissenschaften und ist eine geschätzte Diskussionspartnerin auf Empfängen und Konferenzen.",
        "bio_en": "From a London family with German roots, Charlotte combines British reserve with a refreshing warmth. She holds a doctorate in law and is a valued conversationalist at receptions and conferences.",
        "height_cm": 175, "hair_color": "Rotblond", "eye_color": "Blau-Grün",
        "dress_size": "36", "measurements": "86-62-90",
        "languages": ["Englisch", "Deutsch", "Französisch"],
        "services": ["business-escort-hamburg", "vip-escort-hamburg", "dinner-companion-hamburg", "travel-companion-hamburg"],
        "locations": ["hamburg", "hafencity", "eppendorf", "blankenese", "harvestehude"],
        "cover_image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Recht", "Golf", "Whisky-Verkostung"],
        "prices": [
            {"label": "1 Stunde", "amount": 600, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 1800, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 3000, "currency": "EUR", "unit": "night"},
            {"label": "Wochenende", "amount": 6500, "currency": "EUR", "unit": "weekend"},
        ],
        "available": True, "featured": True,
    },
    {
        "name": "Anastasia", "age": 27, "nationality": "Russisch",
        "short_tagline": "Slawische Grazie mit Hamburger Zurückhaltung",
        "short_tagline_en": "Slavic grace with Hamburg restraint",
        "bio": "Ausgebildete Balletttänzerin an der Bolschoi-Ballettakademie, heute Kunsthistorikerin und Übersetzerin. Anastasias Haltung und Präsenz sind unverkennbar — sie fällt auf, ohne aufzufallen.",
        "bio_en": "Trained ballet dancer at the Bolshoi Ballet Academy, now an art historian and translator. Anastasia's poise and presence are unmistakable — she stands out without standing out.",
        "height_cm": 178, "hair_color": "Platinblond", "eye_color": "Eisblau",
        "dress_size": "34", "measurements": "84-60-88",
        "languages": ["Russisch", "Deutsch", "Englisch"],
        "services": ["luxury-escort-hamburg", "event-escort-hamburg", "vip-escort-hamburg", "hotel-escort-hamburg"],
        "locations": ["hamburg", "hafencity", "harvestehude", "eppendorf"],
        "cover_image": "https://images.unsplash.com/photo-1509967419775-8bb0ec6a79bc?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1509967419775-8bb0ec6a79bc?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Ballett", "Klassische Musik", "Zeitgenössische Kunst"],
        "prices": [
            {"label": "1 Stunde", "amount": 650, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 1900, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 3200, "currency": "EUR", "unit": "night"},
            {"label": "Wochenende", "amount": 7000, "currency": "EUR", "unit": "weekend"},
        ],
        "available": True, "featured": True,
    },
    {
        "name": "Camille", "age": 25, "nationality": "Französisch",
        "short_tagline": "Pariser Leichtigkeit am Alsterufer",
        "short_tagline_en": "Parisian ease along the Alster",
        "bio": "Aufgewachsen im 6. Arrondissement, wohnhaft in Winterhude. Camille studiert an der HfMT Hamburg und bewegt sich mit selbstverständlicher Grazie zwischen Konzertsälen, Vernissagen und intimen Bistros.",
        "bio_en": "Raised in the 6th arrondissement, now living in Winterhude. Camille studies at the HfMT Hamburg and moves with effortless grace between concert halls, gallery openings and intimate bistros.",
        "height_cm": 170, "hair_color": "Kastanie", "eye_color": "Grün",
        "dress_size": "34", "measurements": "83-61-89",
        "languages": ["Französisch", "Deutsch", "Englisch"],
        "services": ["girlfriend-experience-hamburg", "dinner-companion-hamburg", "event-escort-hamburg", "luxury-escort-hamburg"],
        "locations": ["hamburg", "winterhude", "hafencity", "eppendorf"],
        "cover_image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Musik", "Französische Poesie", "Kaffeekultur"],
        "prices": [
            {"label": "1 Stunde", "amount": 500, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 1500, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 2500, "currency": "EUR", "unit": "night"},
        ],
        "available": True, "featured": False,
    },
    {
        "name": "Beatrice", "age": 31, "nationality": "Deutsch",
        "short_tagline": "Klassische Bildung, moderne Souveränität",
        "short_tagline_en": "Classical education, contemporary poise",
        "bio": "Studierte Klassische Philologie in Heidelberg, promovierte in Cambridge. Beatrice bewegt sich mit gleicher Sicherheit im Kreis akademischer Symposien wie auf Galas — mit einer Ruhe, die nur echte Bildung verleiht.",
        "bio_en": "Studied Classical Philology in Heidelberg, doctorate from Cambridge. Beatrice moves with equal ease through academic symposia and gala receptions — with a calm that only genuine erudition confers.",
        "height_cm": 174, "hair_color": "Kastanienbraun", "eye_color": "Braun",
        "dress_size": "36", "measurements": "86-64-91",
        "languages": ["Deutsch", "Englisch", "Latein", "Altgriechisch"],
        "services": ["vip-escort-hamburg", "dinner-companion-hamburg", "business-escort-hamburg", "event-escort-hamburg"],
        "locations": ["hamburg", "harvestehude", "hafencity", "eppendorf"],
        "cover_image": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Antike Literatur", "Klavier", "Segeln"],
        "prices": [
            {"label": "1 Stunde", "amount": 700, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 2000, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 3500, "currency": "EUR", "unit": "night"},
            {"label": "Wochenende", "amount": 7500, "currency": "EUR", "unit": "weekend"},
        ],
        "available": True, "featured": True,
    },
    {
        "name": "Nina", "age": 24, "nationality": "Deutsch",
        "short_tagline": "Fröhlich, unverkrampft, überraschend belesen",
        "short_tagline_en": "Cheerful, unpretentious, surprisingly well-read",
        "bio": "Nina bringt eine seltene Eigenschaft mit: echte Fröhlichkeit. Ihre unverkrampfte Art, gepaart mit einem Bachelor in Literaturwissenschaft, macht sie zur idealen Begleitung für entspannte Wochenenden und lebhafte Abende in Hamburgs schönsten Restaurants.",
        "bio_en": "Nina brings a rare quality: genuine cheerfulness. Her unpretentious manner, paired with a bachelor's in literature, makes her an ideal companion for relaxed weekends and lively evenings in Hamburg's finest restaurants.",
        "height_cm": 167, "hair_color": "Blond", "eye_color": "Blau",
        "dress_size": "34", "measurements": "83-60-87",
        "languages": ["Deutsch", "Englisch"],
        "services": ["girlfriend-experience-hamburg", "dinner-companion-hamburg", "hotel-escort-hamburg", "luxury-escort-hamburg"],
        "locations": ["hamburg", "st-pauli", "altona", "winterhude", "hafencity"],
        "cover_image": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Zeitgenössische Literatur", "Radfahren", "Kochen"],
        "prices": [
            {"label": "1 Stunde", "amount": 450, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 1400, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 2400, "currency": "EUR", "unit": "night"},
        ],
        "available": True, "featured": False,
    },
    {
        "name": "Marlene", "age": 33, "nationality": "Deutsch",
        "short_tagline": "Reife Eleganz mit Berliner Kante",
        "short_tagline_en": "Mature elegance with a Berlin edge",
        "bio": "In Berlin geboren, in Hamburg verwurzelt. Marlene führte ein Modelabel, bevor sie sich der klassischen Sängerinnenlaufbahn zuwandte. Ihre Präsenz ist unverwechselbar, ihr Humor trocken, ihre Kultiviertheit selbstverständlich.",
        "bio_en": "Born in Berlin, rooted in Hamburg. Marlene ran a fashion label before turning to a classical singing career. Her presence is unmistakable, her humour dry, her sophistication effortless.",
        "height_cm": 176, "hair_color": "Rabenschwarz", "eye_color": "Grün",
        "dress_size": "36", "measurements": "88-64-92",
        "languages": ["Deutsch", "Englisch", "Französisch"],
        "services": ["vip-escort-hamburg", "luxury-escort-hamburg", "event-escort-hamburg", "travel-companion-hamburg"],
        "locations": ["hamburg", "hafencity", "harvestehude", "blankenese", "eppendorf"],
        "cover_image": "https://images.unsplash.com/photo-1526510747491-58f928ec870f?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1526510747491-58f928ec870f?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Klassischer Gesang", "Mode", "Zeitgenössische Kunst"],
        "prices": [
            {"label": "1 Stunde", "amount": 750, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 2200, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 3800, "currency": "EUR", "unit": "night"},
            {"label": "Wochenende", "amount": 8000, "currency": "EUR", "unit": "weekend"},
        ],
        "available": True, "featured": True,
    },
    {
        "name": "Elena", "age": 26, "nationality": "Spanisch",
        "short_tagline": "Andalusische Leidenschaft, europäische Klasse",
        "short_tagline_en": "Andalusian passion, European class",
        "bio": "Aus Sevilla, ausgebildet in Madrid und Barcelona. Elena arbeitete als Kunstberaterin für internationale Sammler, bevor sie nach Hamburg zog. Ihre warme Ausstrahlung und ihre Weltoffenheit machen sie zu einer besonderen Begleitung.",
        "bio_en": "From Seville, trained in Madrid and Barcelona. Elena worked as an art advisor for international collectors before moving to Hamburg. Her warm presence and cosmopolitan outlook make her an exceptional companion.",
        "height_cm": 173, "hair_color": "Schwarzbraun", "eye_color": "Dunkelbraun",
        "dress_size": "36", "measurements": "87-63-92",
        "languages": ["Spanisch", "Englisch", "Deutsch", "Italienisch"],
        "services": ["luxury-escort-hamburg", "travel-companion-hamburg", "event-escort-hamburg", "dinner-companion-hamburg"],
        "locations": ["hamburg", "hafencity", "altona", "winterhude"],
        "cover_image": "https://images.unsplash.com/photo-1521252659862-eec69941b071?auto=format&fit=crop&w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1521252659862-eec69941b071?auto=format&fit=crop&w=1600&q=85",
        ],
        "interests": ["Zeitgenössische Kunst", "Flamenco", "Weinkultur"],
        "prices": [
            {"label": "1 Stunde", "amount": 550, "currency": "EUR", "unit": "hour"},
            {"label": "Dinner Date (4h)", "amount": 1650, "currency": "EUR", "unit": "flat"},
            {"label": "Overnight", "amount": 2700, "currency": "EUR", "unit": "night"},
            {"label": "Wochenende", "amount": 5800, "currency": "EUR", "unit": "weekend"},
        ],
        "available": True, "featured": False,
    },
]


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    inserted = 0
    skipped = 0
    for m in NEW_MODELS:
        slug = slugify(m["name"])
        existing = await db.models.find_one({"slug": slug})
        if existing:
            print(f"  ⊘ {m['name']} ({slug}) already exists — skipped")
            skipped += 1
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "created_at": datetime.now(timezone.utc).isoformat(),
            **m,
        }
        await db.models.insert_one(doc)
        print(f"  ✓ {m['name']:12} (from {m['prices'][0]['amount']} EUR)")
        inserted += 1

    total = await db.models.count_documents({})
    print(f"\nSeed complete. Inserted {inserted}, skipped {skipped}. Total roster: {total}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
