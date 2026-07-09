"""One-shot updater for /services/business-escort-hamburg."""
import os
import sys
import requests

BASE = os.environ.get("BASE", "http://localhost:8001").rstrip("/")
EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de")
PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirAdmin2026!")

sess = requests.Session()
sess.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=10).raise_for_status()
current = sess.get(f"{BASE}/api/service-content/business-escort-hamburg", timeout=10).json()

hero_de = (
    "Hamburg ist eine internationale Wirtschaftsmetropole mit Geschäftsreisenden, "
    "Unternehmern und anspruchsvollen Besuchern aus aller Welt. "
    "Noir Hamburg bietet einen exklusiven Business Escort Service für Kunden, "
    "die eine stilvolle und diskrete Begleitung für geschäftliche oder gesellschaftliche Anlässe suchen. "
    "Eine professionelle Begleitung bedeutet mehr als Eleganz – Persönlichkeit, Kommunikation und ein natürliches Auftreten stehen im Mittelpunkt. "
    "Ob Geschäftsreise, Dinner, Veranstaltung oder privater Aufenthalt in Hamburg – "
    "unser Ziel ist eine Begleitung, die perfekt zum Anlass passt."
)
hero_en = (
    "Hamburg is an international business hub welcoming travellers, entrepreneurs and discerning "
    "visitors from around the world. Noir Hamburg offers an exclusive business escort service "
    "for clients seeking a stylish and discreet companion for professional or social occasions. "
    "Professional companionship means more than elegance — personality, conversation and a natural "
    "presence take centre stage. Whether it's a business trip, a dinner, an event or a private stay "
    "in Hamburg, our aim is to arrange a companion who fits the occasion perfectly."
)

sections = [
    {
        "h2": "Premium Business Escort Service in Hamburg",
        "h2_en": "Premium Business Escort Service in Hamburg",
        "body": [
            "Ein hochwertiger Business Escort Service basiert auf Vertrauen, Diskretion und Professionalität.",
            "Viele Geschäftsreisende wünschen während ihres Aufenthalts eine angenehme Begleitung für besondere Momente außerhalb ihres beruflichen Alltags.",
            "Noir Hamburg legt Wert auf eine individuelle Auswahl und einen Service, der zu den persönlichen Vorstellungen unserer Kunden passt.",
        ],
        "body_en": [
            "A high-end business escort service is built on trust, discretion and professionalism.",
            "Many business travellers appreciate a pleasant companion for special moments outside their working day.",
            "Noir Hamburg places emphasis on individual selection and a service tailored to each client's personal expectations.",
        ],
    },
    {
        "h2": "Exklusive Begleitung für Geschäftsreisen",
        "h2_en": "Exclusive companionship for business trips",
        "body": [
            "Hamburg empfängt täglich internationale Gäste, Unternehmer und Führungskräfte.",
            "Unser Business Escort Service eignet sich für Geschäftsreisen, Business Dinner, Hotelaufenthalte, Veranstaltungen, Messen und die private Abendgestaltung.",
            "Eine passende Begleitung kann einen Aufenthalt angenehmer und persönlicher gestalten.",
        ],
        "body_en": [
            "Hamburg welcomes international guests, entrepreneurs and executives every day.",
            "Our business escort service is ideal for business trips, business dinners, hotel stays, events, trade fairs and private evening arrangements.",
            "The right companionship can make any stay more pleasant and personal.",
        ],
    },
    {
        "h2": "Eleganz, Kommunikation und Persönlichkeit",
        "h2_en": "Elegance, conversation and personality",
        "body": [
            "Eine Business Begleitung sollte nicht nur durch ihr Erscheinungsbild überzeugen.",
            "Ein angenehmes Auftreten, Kommunikationsfähigkeit und soziale Kompetenz sind entscheidend.",
            "Unsere Philosophie konzentriert sich auf Qualität, Stil und eine natürliche Atmosphäre.",
        ],
        "body_en": [
            "A business companion should impress with more than appearance alone.",
            "A pleasant demeanour, strong conversational skills and social competence are decisive.",
            "Our philosophy focuses on quality, style and a naturally elegant atmosphere.",
        ],
    },
    {
        "h2": "Diskretion beim Business Escort Hamburg",
        "h2_en": "Discretion in business escort Hamburg",
        "body": [
            "Gerade für Geschäftsreisende ist Privatsphäre besonders wichtig.",
            "Jede Anfrage wird respektvoll und professionell behandelt.",
            "Noir Hamburg legt großen Wert auf eine diskrete Organisation und eine angenehme Kommunikation.",
        ],
        "body_en": [
            "For business travellers in particular, privacy is essential.",
            "Every enquiry is treated respectfully and professionally.",
            "Noir Hamburg places great emphasis on discreet arrangements and pleasant communication.",
        ],
    },
    {
        "h2": "Business Escort Hamburg und Umgebung",
        "h2_en": "Business Escort Hamburg and surrounding areas",
        "body": [
            "Unser Service konzentriert sich auf Hamburg und die umliegenden Regionen.",
            "Zu unseren Servicebereichen zählen Hamburg Innenstadt, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg und Lüneburg.",
        ],
        "body_en": [
            "Our service focuses on Hamburg and the surrounding region.",
            "Service areas include Hamburg city centre, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg and Lüneburg.",
        ],
    },
    {
        "h2": "Warum Noir Hamburg für Business Escort?",
        "h2_en": "Why choose Noir Hamburg for business escort?",
        "body": [
            "Premium Service mit persönlicher Auswahl und diskreter Kommunikation.",
            "Stilvolle Models, ausgeprägte Hamburg-Spezialisierung und Qualität vor Quantität.",
            "Noir Hamburg steht für einen professionellen und angenehmen Business Escort Service.",
        ],
        "body_en": [
            "Premium service with personal selection and discreet communication.",
            "Stylish companions, dedicated Hamburg expertise and quality over quantity.",
            "Noir Hamburg stands for a professional and pleasant business escort service.",
        ],
    },
]

faqs = [
    {
        "q": "Was ist Business Escort Hamburg?",
        "q_en": "What is business escort Hamburg?",
        "a": "Business Escort beschreibt eine stilvolle Begleitung für Geschäftsreisende, Veranstaltungen, Dinner oder besondere Anlässe mit Fokus auf Persönlichkeit und Diskretion.",
        "a_en": "Business escort refers to a stylish companion for business travellers, events, dinners or special occasions — with a focus on personality and discretion.",
    },
    {
        "q": "Kann ich eine Begleitung für ein Business Dinner buchen?",
        "q_en": "Can I book a companion for a business dinner?",
        "a": "Ja. Viele Kunden wünschen eine elegante Begleitung für Restaurants, geschäftliche Veranstaltungen oder gesellschaftliche Termine.",
        "a_en": "Yes. Many clients request an elegant companion for restaurants, business events or social engagements.",
    },
    {
        "q": "Ist Diskretion gewährleistet?",
        "q_en": "Is discretion guaranteed?",
        "a": "Diskretion und ein professioneller Umgang mit persönlichen Informationen gehören zu den wichtigsten Grundlagen von Noir Hamburg.",
        "a_en": "Discretion and a professional approach to personal information are among Noir Hamburg's core principles.",
    },
    {
        "q": "Ist der Service nur in Hamburg verfügbar?",
        "q_en": "Is the service only available in Hamburg?",
        "a": "Noir Hamburg konzentriert sich auf Hamburg und ausgewählte Regionen in der Umgebung.",
        "a_en": "Noir Hamburg focuses on Hamburg and selected surrounding regions.",
    },
]

payload = {
    "title": current.get("title", "Business Escort Hamburg"),
    "short_label": current.get("short_label", "Business"),
    "h1": "Business Escort Hamburg – Stilvolle Begleitung für geschäftliche Anlässe",
    "tagline": "Stilvolle Begleitung für geschäftliche Anlässe",
    "tagline_en": "Stylish companionship for professional occasions",
    "description": (
        "Business Escort Hamburg von Noir Hamburg — stilvolle, professionelle und "
        "diskrete Begleitung für Geschäftsreisen, Dinner und Veranstaltungen."
    ),
    "description_en": (
        "Business escort Hamburg from Noir Hamburg — stylish, professional and "
        "discreet companionship for business trips, dinners and events."
    ),
    "long_copy": hero_de,
    "long_copy_en": hero_en,
    "keypoints": [
        "Premium Service",
        "Persönliche Auswahl",
        "Diskrete Kommunikation",
        "Stilvolle Models",
        "Hamburg Spezialisierung",
        "Qualität vor Quantität",
    ],
    "keypoints_en": [
        "Premium service",
        "Personal selection",
        "Discreet communication",
        "Stylish companions",
        "Dedicated Hamburg expertise",
        "Quality over quantity",
    ],
    "image": current.get("image", ""),
    "image_alt": "business-escort-hamburg-model — Premium Business Begleitung von Noir Hamburg",
    "image_alt_en": "business-escort-hamburg-model — Premium business companionship by Noir Hamburg",
    "meta_title": "Business Escort Hamburg | Exklusive Begleitung für Geschäftsreisen | Noir Hamburg",
    "meta_title_en": "Business Escort Hamburg | Exclusive Companionship for Business Travel | Noir Hamburg",
    "meta_description": (
        "Professioneller Business Escort Hamburg mit Noir Hamburg. Stilvolle Begleitung "
        "für Geschäftsreisen, Business Dinner, Veranstaltungen und anspruchsvolle Kunden."
    ),
    "meta_description_en": (
        "Professional business escort Hamburg with Noir Hamburg. Stylish companionship "
        "for business trips, dinners, events and discerning clients."
    ),
    "sections": sections,
    "faqs": faqs,
    "related_services": [
        "luxury-escort-hamburg",
        "vip-escort-hamburg",
        "hotel-escort-hamburg",
    ],
}

r = sess.put(f"{BASE}/api/service-content/business-escort-hamburg", json=payload, timeout=15)
r.raise_for_status()
new = r.json()
print("h1:", new["h1"])
print("sections:", len(new["sections"]))
print("faqs:", len(new["faqs"]))
print("meta_title:", new["meta_title"])
print("image_alt:", new["image_alt"])
print("related:", new["related_services"])
