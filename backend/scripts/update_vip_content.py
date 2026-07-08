"""One-shot updater for /services/vip-escort-hamburg — pushes new SEO copy
into the CMS via the admin PUT endpoint. Re-runnable; idempotent."""
import os
import sys
import json
import requests

BASE = os.environ.get("BASE", "http://localhost:8001").rstrip("/")
EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noir-hamburg.de")
PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirAdmin2026!")

sess = requests.Session()
r = sess.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=10)
r.raise_for_status()
print("login:", r.json().get("email"), r.json().get("role"))

current = sess.get(f"{BASE}/api/service-content/vip-escort-hamburg", timeout=10).json()

# --- Build the new content payload -----------------------------------------
long_copy_de = (
    "VIP bedeutet mehr als Luxus – es steht für Individualität, Diskretion und einen Service, "
    "der sich an den persönlichen Vorstellungen des Kunden orientiert. "
    "Noir Hamburg bietet einen exklusiven VIP Escort Service in Hamburg für Kunden, "
    "die Wert auf Stil, Persönlichkeit und ein besonderes Erlebnis legen. "
    "Unsere Philosophie basiert auf Qualität, Vertrauen und einer individuellen Auswahl. "
    "Ob geschäftlicher Aufenthalt, exklusives Dinner, gesellschaftliche Veranstaltung oder privater Anlass – "
    "Noir Hamburg bietet eine Begleitung, die sich natürlich und elegant jeder Situation anpasst."
)

sections = [
    {
        "h2": "Premium VIP Escort Service in Hamburg",
        "h2_en": "Premium VIP Escort Service in Hamburg",
        "body": [
            "Ein hochwertiger VIP Escort Service entsteht durch Aufmerksamkeit für jedes Detail.",
            "Jeder Kunde hat unterschiedliche Erwartungen und Vorstellungen. Deshalb steht bei Noir Hamburg eine persönliche und individuelle Beratung im Mittelpunkt.",
            "Unser Ziel ist es, eine Begleitung zu vermitteln, die nicht nur optisch überzeugt, sondern auch durch Persönlichkeit, Ausstrahlung und Auftreten.",
            "Ein Premium Escort Erlebnis verbindet Eleganz, Diskretion und einen professionellen Service.",
        ],
        "body_en": [
            "A high-end VIP escort service is built on attention to every detail.",
            "Every client has different expectations. That is why personal and individual consultation is at the heart of Noir Hamburg.",
            "Our aim is to arrange companionship that impresses not only visually, but also through personality, presence and demeanour.",
            "A premium escort experience combines elegance, discretion and professional service.",
        ],
    },
    {
        "h2": "Exklusive Escort Models für anspruchsvolle Kunden",
        "h2_en": "Exclusive escort models for discerning clients",
        "body": [
            "Unsere Models stehen für Eleganz, Stil und Persönlichkeit.",
            "Eine hochwertige VIP Begleitung bedeutet mehr als ein attraktives Erscheinungsbild.",
            "Charme, Kommunikation und ein natürliches Auftreten sind entscheidende Eigenschaften einer exklusiven Begleitung.",
            "Ob luxuriöses Restaurant, gesellschaftlicher Anlass, Business-Termin oder privates Treffen – die passende Begleitung schafft eine besondere Atmosphäre.",
        ],
        "body_en": [
            "Our companions represent elegance, style and personality.",
            "High-quality VIP companionship means more than an attractive appearance.",
            "Charm, conversation and a natural presence are decisive qualities of an exclusive companion.",
            "Whether a luxurious restaurant, a social event, a business meeting or a private encounter — the right companion creates a truly special atmosphere.",
        ],
    },
    {
        "h2": "VIP Begleitung für Business, Events und Reisen",
        "h2_en": "VIP companionship for business, events and travel",
        "body": [
            "Hamburg ist eine internationale Stadt mit Geschäftsreisenden, exklusiven Hotels, Events und gehobener Gastronomie.",
            "Der VIP Escort Service von Noir Hamburg eignet sich für Geschäftsreisen, Business Meetings, exklusive Dinner, Hotelaufenthalte, Veranstaltungen und private Anlässe.",
            "Unser Fokus liegt auf einer stilvollen, angenehmen und hochwertigen Erfahrung.",
        ],
        "body_en": [
            "Hamburg is an international city with business travellers, exclusive hotels, events and upscale gastronomy.",
            "Noir Hamburg's VIP escort service is ideal for business trips, meetings, exclusive dinners, hotel stays, events and private occasions.",
            "Our focus is a stylish, pleasant and premium experience.",
        ],
    },
    {
        "h2": "Diskretion und Privatsphäre beim VIP Escort",
        "h2_en": "Discretion and privacy in VIP escort",
        "body": [
            "Diskretion gehört zu den wichtigsten Grundlagen eines Premium Escort Services.",
            "Jede Anfrage wird professionell, respektvoll und mit Aufmerksamkeit behandelt.",
            "Von der ersten Kontaktaufnahme bis zur Organisation legen wir Wert auf einen angenehmen und diskreten Ablauf.",
        ],
        "body_en": [
            "Discretion is one of the most essential foundations of a premium escort service.",
            "Every enquiry is treated professionally, respectfully and with full attention.",
            "From the first contact to the arrangement itself, we ensure a pleasant and discreet process.",
        ],
    },
    {
        "h2": "VIP Escort Hamburg und Umgebung",
        "h2_en": "VIP Escort Hamburg and surrounding areas",
        "body": [
            "Noir Hamburg konzentriert sich vollständig auf Hamburg und die umliegende Region.",
            "Zu unseren Servicebereichen zählen Hamburg Innenstadt, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg und Lüneburg.",
            "Diese lokale Spezialisierung ermöglicht einen persönlichen und hochwertigen Service.",
        ],
        "body_en": [
            "Noir Hamburg focuses entirely on Hamburg and the surrounding region.",
            "Our service areas include Hamburg city centre, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg and Lüneburg.",
            "This local specialisation allows for a personal and high-quality service.",
        ],
    },
    {
        "h2": "Warum Noir Hamburg für VIP Escort?",
        "h2_en": "Why choose Noir Hamburg for VIP escort?",
        "body": [
            "Premium Escort Service Hamburg mit persönlicher Beratung und diskreter Kommunikation.",
            "Stilvolle Models, individuelle Auswahl und ausgeprägte Hamburg-Spezialisierung.",
            "Qualität statt Masse – dafür steht Noir Hamburg.",
        ],
        "body_en": [
            "Premium escort service in Hamburg with personal consultation and discreet communication.",
            "Stylish companions, individual selection and dedicated Hamburg expertise.",
            "Quality over quantity — that is what Noir Hamburg stands for.",
        ],
    },
]

faqs = [
    {
        "q": "Was bedeutet VIP Escort Hamburg?",
        "q_en": "What does VIP Escort Hamburg mean?",
        "a": "VIP Escort beschreibt eine hochwertige Begleitung, bei der Persönlichkeit, Stil, Diskretion und ein individueller Service im Mittelpunkt stehen.",
        "a_en": "VIP escort refers to a high-quality companionship in which personality, style, discretion and an individual service are at the centre.",
    },
    {
        "q": "Kann ich eine VIP Begleitung für Business oder Events buchen?",
        "q_en": "Can I book a VIP companion for business or events?",
        "a": "Ja. Viele Kunden suchen eine stilvolle Begleitung für Geschäftsreisen, Dinner, Events oder besondere private Anlässe.",
        "a_en": "Yes. Many clients seek a stylish companion for business trips, dinners, events or special private occasions.",
    },
    {
        "q": "Ist Noir Hamburg nur in Hamburg verfügbar?",
        "q_en": "Is Noir Hamburg only available in Hamburg?",
        "a": "Noir Hamburg konzentriert sich auf Hamburg und ausgewählte umliegende Regionen.",
        "a_en": "Noir Hamburg focuses on Hamburg and selected surrounding regions.",
    },
    {
        "q": "Wie finde ich das passende VIP Escort Model?",
        "q_en": "How do I find the right VIP escort companion?",
        "a": "Durch eine persönliche Anfrage können individuelle Wünsche berücksichtigt werden, um eine passende Begleitung auszuwählen.",
        "a_en": "Through a personal enquiry, individual preferences can be taken into account to select the most fitting companion.",
    },
]

payload = {
    "title": current.get("title", "VIP Escort Hamburg"),
    "short_label": current.get("short_label", "VIP"),
    "h1": "VIP Escort Hamburg – Exklusive Begleitung für besondere Ansprüche",
    "tagline": "Exklusive Begleitung für besondere Ansprüche",
    "tagline_en": "Exclusive companionship for exceptional standards",
    "description": (
        "VIP Escort Hamburg von Noir Hamburg — exklusive, elegante und diskrete "
        "Premium Begleitung für anspruchsvolle Kunden in Hamburg und Umgebung."
    ),
    "description_en": (
        "VIP Escort Hamburg from Noir Hamburg — exclusive, elegant and discreet "
        "premium companionship for discerning clients across Hamburg and its region."
    ),
    "long_copy": long_copy_de,
    "long_copy_en": (
        "VIP means more than luxury — it stands for individuality, discretion and a "
        "service tailored to each client's personal expectations. Noir Hamburg offers "
        "an exclusive VIP escort service in Hamburg for clients who value style, "
        "personality and a truly special experience. Our philosophy is built on "
        "quality, trust and individual selection. Whether for a business stay, an "
        "exclusive dinner, a social event or a private occasion, Noir Hamburg "
        "arranges companionship that adapts naturally and elegantly to every situation."
    ),
    "keypoints": [
        "Premium Escort Service Hamburg",
        "Persönliche Beratung",
        "Diskrete Kommunikation",
        "Stilvolle Models",
        "Individuelle Auswahl",
        "Hamburg Spezialisierung",
        "Qualität statt Masse",
    ],
    "keypoints_en": [
        "Premium escort service Hamburg",
        "Personal consultation",
        "Discreet communication",
        "Stylish companions",
        "Individual selection",
        "Dedicated Hamburg expertise",
        "Quality over quantity",
    ],
    "image": current.get("image", ""),
    "image_alt": "vip-escort-hamburg-model — Premium VIP Begleitung von Noir Hamburg",
    "image_alt_en": "vip-escort-hamburg-model — Premium VIP companionship by Noir Hamburg",
    "meta_title": "VIP Escort Hamburg | Exklusive Premium Begleitung | Noir Hamburg",
    "meta_title_en": "VIP Escort Hamburg | Exclusive Premium Companionship | Noir Hamburg",
    "meta_description": (
        "Erleben Sie VIP Escort Hamburg mit Noir Hamburg. Exklusive Begleitung, "
        "elegante Models und diskreter Premium Service für anspruchsvolle Kunden in Hamburg."
    ),
    "meta_description_en": (
        "Experience VIP Escort Hamburg with Noir Hamburg. Exclusive companionship, "
        "elegant companions and discreet premium service for discerning clients in Hamburg."
    ),
    "sections": sections,
    "faqs": faqs,
    # Descriptive internal links — Luxus, Business, Hotel, Models, Contact and area pages
    # are rendered by the ServiceDetail template through related_services + built-in
    # blocks. We wire the primary three related services here.
    "related_services": [
        "luxury-escort-hamburg",
        "business-escort-hamburg",
        "hotel-escort-hamburg",
    ],
}

r = sess.put(f"{BASE}/api/service-content/vip-escort-hamburg", json=payload, timeout=15)
r.raise_for_status()
new = r.json()
print("---")
print("updated h1:", new["h1"])
print("sections:", len(new["sections"]))
print("faqs:", len(new["faqs"]))
print("meta_title:", new["meta_title"])
print("image_alt:", new["image_alt"])
print("related_services:", new["related_services"])
