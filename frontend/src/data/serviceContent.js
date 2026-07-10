// Noir Hamburg — Extended editorial content per service.
// Each entry provides additional H2 sections (body paragraphs) and per-service
// FAQs on top of the base SERVICES entry in `site.js`. Consumed by
// ssr/routes/services.js (SSR) and src/pages/public/Services.jsx (SPA).
// CommonJS so it works in both React (Babel interop) and Node SSR.
//
// Content is written in a compact but editorial German (matching Hanseatic
// tone) with faithful EN translations. Aim: ~700–900 words of body per page
// including base longCopy, plus 5 FAQs.

const SERVICE_CONTENT = {
  "luxury-escort-hamburg": {
    sections: [
      {
        h2: "Was macht einen Luxus Escort Service besonders?",
        h2En: "What makes a luxury escort service special?",
        body: [
          "Ein hochwertiger Escort Service entsteht durch die Kombination aus Ausstrahlung, Persönlichkeit und Professionalität. Unsere Philosophie ist Qualität statt Quantität. Jede Anfrage wird individuell betrachtet, damit die Begleitung zum Anlass, zur Atmosphäre und zu den persönlichen Erwartungen passt.",
          "Ein Luxus Escort Erlebnis bedeutet: diskrete Organisation, persönliche Betreuung, stilvolle Begleitung, Zuverlässigkeit und eine individuelle Auswahl.",
        ],
        bodyEn: [
          "A premium escort service emerges from the combination of presence, personality and professionalism. Our philosophy is quality over quantity. Every enquiry is treated individually so the companion truly fits the occasion, the atmosphere and your personal expectations.",
          "A luxury escort experience means: discreet organisation, personal attention, stylish companionship, reliability and an individual selection.",
        ],
      },
      {
        h2: "Exklusive Escort Models in Hamburg",
        h2En: "Exclusive escort models in Hamburg",
        body: [
          "Unsere Models werden sorgfältig ausgewählt und präsentieren unterschiedliche Persönlichkeiten, Stile und Charaktere. Eine hochwertige Begleitung basiert nicht nur auf Aussehen — Charme, Kommunikation und ein angenehmes Auftreten sind genauso wichtig.",
          "Noir Hamburg möchte Kunden eine Auswahl ermöglichen, die zu ihrem persönlichen Geschmack und Anlass passt. Entdecken Sie unsere Premium Escort Models Hamburg auf der Modelübersicht.",
        ],
        bodyEn: [
          "Our models are carefully selected and present different personalities, styles and characters. A high-quality companionship is not based on appearance alone — charm, communication and a pleasant demeanour are equally important.",
          "Noir Hamburg offers a selection that matches your personal taste and occasion. Discover our Premium Escort Models Hamburg on the models page.",
        ],
      },
      {
        h2: "Luxus Escort für Business, Reisen und besondere Anlässe",
        h2En: "Luxury escort for business, travel and special occasions",
        body: [
          "Hamburg ist eine internationale Stadt mit Geschäftsreisenden, exklusiven Events, gehobenen Restaurants und luxuriösen Hotels. Unser Premium Escort Service eignet sich für Geschäftsreisen, Dinner-Begleitung, Events, private Treffen und gesellschaftliche Anlässe.",
          "Der Fokus liegt immer auf einer natürlichen und eleganten Begleitung — passend zum Anlass, zur Umgebung und zu Ihrem persönlichen Stil.",
        ],
        bodyEn: [
          "Hamburg is an international city with business travellers, exclusive events, fine restaurants and luxury hotels. Our premium escort service is suited to business trips, dinner companionship, events, private meetings and social occasions.",
          "The focus is always on natural, elegant companionship — matched to the occasion, the setting and your personal style.",
        ],
      },
      {
        h2: "Diskretion und Privatsphäre",
        h2En: "Discretion and privacy",
        body: [
          "Diskretion ist ein zentraler Bestandteil eines Premium Escort Services. Von der ersten Anfrage bis zur Organisation achten wir auf einen respektvollen und professionellen Umgang.",
          "Kunden können ihre Wünsche persönlich mitteilen, damit eine passende Begleitung empfohlen werden kann. Erfahren Sie mehr über unser Diskretionsversprechen.",
        ],
        bodyEn: [
          "Discretion is a central pillar of our premium escort service. From the first enquiry to the organisation itself, we take care to maintain a respectful, professional approach.",
          "Clients can share their preferences personally so that a fitting companion can be recommended. Read more about our discretion promise.",
        ],
      },
      {
        h2: "Luxus Escort Hamburg und Umgebung",
        h2En: "Luxury escort Hamburg and surroundings",
        body: [
          "Noir Hamburg konzentriert sich vollständig auf Hamburg und die umliegende Region. Unsere lokale Spezialisierung ermöglicht einen persönlichen Service in Hamburg Innenstadt, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg und Lüneburg.",
          "Diese lokale Konzentration ist bewusst gewählt: nur so garantieren wir kurze Reaktionszeiten, echte Ortskenntnis und einen persönlichen Ablauf statt anonymer Massenvermittlung.",
        ],
        bodyEn: [
          "Noir Hamburg focuses entirely on Hamburg and the surrounding region. Our local specialisation makes a personal service possible in Hamburg city centre, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg and Lüneburg.",
          "This local focus is deliberate — it is the only way to guarantee fast response times, real local knowledge and a personal experience rather than anonymous mass matchmaking.",
        ],
      },
      {
        h2: "Warum Noir Hamburg?",
        h2En: "Why Noir Hamburg?",
        body: [
          "Premium Fokus. Individuelle Beratung. Diskreter Ablauf. Persönlicher Service. Lokale Hamburg Spezialisierung. Qualität vor Quantität.",
          "Diese sechs Grundsätze prägen jede einzelne Buchung. Wer Wert auf ein wirklich professionelles Erlebnis legt, findet bei Noir Hamburg einen zuverlässigen Ansprechpartner für Luxus Escort in Hamburg.",
        ],
        bodyEn: [
          "Premium focus. Individual consultation. Discreet handling. Personal service. Local Hamburg specialisation. Quality over quantity.",
          "These six principles shape every single booking. If you value a truly professional experience, Noir Hamburg is a reliable partner for luxury escort in Hamburg.",
        ],
      },
    ],
    faqs: [
      { q: "Was bedeutet Luxus Escort Hamburg?", qEn: "What does luxury escort Hamburg mean?", a: "Luxus Escort beschreibt eine hochwertige Form der Begleitung, bei der Stil, Persönlichkeit, Diskretion und ein professioneller Service im Mittelpunkt stehen.", aEn: "Luxury escort describes a high-quality form of companionship focused on style, personality, discretion and professional service." },
      { q: "Kann ich eine Begleitung für ein Dinner oder Event buchen?", qEn: "Can I book a companion for a dinner or event?", a: "Ja. Viele Kunden suchen eine stilvolle Begleitung für besondere Anlässe, Geschäftsreisen oder gesellschaftliche Veranstaltungen.", aEn: "Yes. Many clients seek a stylish companion for special occasions, business trips or social events." },
      { q: "Ist der Service nur in Hamburg verfügbar?", qEn: "Is the service only available in Hamburg?", a: "Noir Hamburg konzentriert sich auf Hamburg und ausgewählte umliegende Regionen.", aEn: "Noir Hamburg focuses on Hamburg and selected surrounding regions." },
      { q: "Wie finde ich das passende Model?", qEn: "How do I find the right model?", a: "Durch eine persönliche Anfrage können individuelle Vorstellungen berücksichtigt werden, um eine passende Begleitung zu finden.", aEn: "Through a personal enquiry your individual expectations can be taken into account to find a fitting companion." },
    ],
  },

  "vip-escort-hamburg": {
    sections: [
      {
        h2: "Premium VIP Escort Service in Hamburg",
        h2En: "Premium VIP Escort Service in Hamburg",
        body: [
          "Ein hochwertiger VIP Escort Service entsteht durch Aufmerksamkeit für jedes Detail.",
          "Jeder Kunde hat unterschiedliche Erwartungen und Vorstellungen. Deshalb steht bei Noir Hamburg eine persönliche und individuelle Beratung im Mittelpunkt.",
          "Unser Ziel ist es, eine Begleitung zu vermitteln, die nicht nur optisch überzeugt, sondern auch durch Persönlichkeit, Ausstrahlung und Auftreten.",
          "Ein Premium Escort Erlebnis verbindet Eleganz, Diskretion und einen professionellen Service.",
        ],
        bodyEn: [
          "A high-end VIP escort service is built on attention to every detail.",
          "Every client has different expectations. That is why personal and individual consultation is at the heart of Noir Hamburg.",
          "Our aim is to arrange companionship that impresses not only visually, but also through personality, presence and demeanour.",
          "A premium escort experience combines elegance, discretion and professional service.",
        ],
      },
      {
        h2: "Exklusive Escort Models für anspruchsvolle Kunden",
        h2En: "Exclusive escort models for discerning clients",
        body: [
          "Unsere Models stehen für Eleganz, Stil und Persönlichkeit.",
          "Eine hochwertige VIP Begleitung bedeutet mehr als ein attraktives Erscheinungsbild.",
          "Charme, Kommunikation und ein natürliches Auftreten sind entscheidende Eigenschaften einer exklusiven Begleitung.",
          "Ob luxuriöses Restaurant, gesellschaftlicher Anlass, Business-Termin oder privates Treffen – die passende Begleitung schafft eine besondere Atmosphäre.",
        ],
        bodyEn: [
          "Our companions represent elegance, style and personality.",
          "High-quality VIP companionship means more than an attractive appearance.",
          "Charm, conversation and a natural presence are decisive qualities of an exclusive companion.",
          "Whether a luxurious restaurant, a social event, a business meeting or a private encounter — the right companion creates a truly special atmosphere.",
        ],
      },
      {
        h2: "VIP Begleitung für Business, Events und Reisen",
        h2En: "VIP companionship for business, events and travel",
        body: [
          "Hamburg ist eine internationale Stadt mit Geschäftsreisenden, exklusiven Hotels, Events und gehobener Gastronomie.",
          "Der VIP Escort Service von Noir Hamburg eignet sich für Geschäftsreisen, Business Meetings, exklusive Dinner, Hotelaufenthalte, Veranstaltungen und private Anlässe.",
          "Unser Fokus liegt auf einer stilvollen, angenehmen und hochwertigen Erfahrung.",
        ],
        bodyEn: [
          "Hamburg is an international city with business travellers, exclusive hotels, events and upscale gastronomy.",
          "Noir Hamburg's VIP escort service is ideal for business trips, meetings, exclusive dinners, hotel stays, events and private occasions.",
          "Our focus is a stylish, pleasant and premium experience.",
        ],
      },
      {
        h2: "Diskretion und Privatsphäre beim VIP Escort",
        h2En: "Discretion and privacy in VIP escort",
        body: [
          "Diskretion gehört zu den wichtigsten Grundlagen eines Premium Escort Services.",
          "Jede Anfrage wird professionell, respektvoll und mit Aufmerksamkeit behandelt.",
          "Von der ersten Kontaktaufnahme bis zur Organisation legen wir Wert auf einen angenehmen und diskreten Ablauf.",
        ],
        bodyEn: [
          "Discretion is one of the most essential foundations of a premium escort service.",
          "Every enquiry is treated professionally, respectfully and with full attention.",
          "From the first contact to the arrangement itself, we ensure a pleasant and discreet process.",
        ],
      },
      {
        h2: "VIP Escort Hamburg und Umgebung",
        h2En: "VIP Escort Hamburg and surrounding areas",
        body: [
          "Noir Hamburg konzentriert sich vollständig auf Hamburg und die umliegende Region.",
          "Zu unseren Servicebereichen zählen Hamburg Innenstadt, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg und Lüneburg.",
          "Diese lokale Spezialisierung ermöglicht einen persönlichen und hochwertigen Service.",
        ],
        bodyEn: [
          "Noir Hamburg focuses entirely on Hamburg and the surrounding region.",
          "Our service areas include Hamburg city centre, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg and Lüneburg.",
          "This local specialisation allows for a personal and high-quality service.",
        ],
      },
      {
        h2: "Warum Noir Hamburg für VIP Escort?",
        h2En: "Why choose Noir Hamburg for VIP escort?",
        body: [
          "Premium Escort Service Hamburg mit persönlicher Beratung und diskreter Kommunikation.",
          "Stilvolle Models, individuelle Auswahl und ausgeprägte Hamburg-Spezialisierung.",
          "Qualität statt Masse – dafür steht Noir Hamburg.",
        ],
        bodyEn: [
          "Premium escort service in Hamburg with personal consultation and discreet communication.",
          "Stylish companions, individual selection and dedicated Hamburg expertise.",
          "Quality over quantity — that is what Noir Hamburg stands for.",
        ],
      },
    ],
    faqs: [
      { q: "Was bedeutet VIP Escort Hamburg?", qEn: "What does VIP Escort Hamburg mean?", a: "VIP Escort beschreibt eine hochwertige Begleitung, bei der Persönlichkeit, Stil, Diskretion und ein individueller Service im Mittelpunkt stehen.", aEn: "VIP escort refers to a high-quality companionship in which personality, style, discretion and an individual service are at the centre." },
      { q: "Kann ich eine VIP Begleitung für Business oder Events buchen?", qEn: "Can I book a VIP companion for business or events?", a: "Ja. Viele Kunden suchen eine stilvolle Begleitung für Geschäftsreisen, Dinner, Events oder besondere private Anlässe.", aEn: "Yes. Many clients seek a stylish companion for business trips, dinners, events or special private occasions." },
      { q: "Ist Noir Hamburg nur in Hamburg verfügbar?", qEn: "Is Noir Hamburg only available in Hamburg?", a: "Noir Hamburg konzentriert sich auf Hamburg und ausgewählte umliegende Regionen.", aEn: "Noir Hamburg focuses on Hamburg and selected surrounding regions." },
      { q: "Wie finde ich das passende VIP Escort Model?", qEn: "How do I find the right VIP escort companion?", a: "Durch eine persönliche Anfrage können individuelle Wünsche berücksichtigt werden, um eine passende Begleitung auszuwählen.", aEn: "Through a personal enquiry, individual preferences can be taken into account to select the most fitting companion." },
    ],
  },

  "business-escort-hamburg": {
    sections: [
      {
        h2: "Premium Business Escort Service in Hamburg",
        h2En: "Premium Business Escort Service in Hamburg",
        body: [
          "Ein hochwertiger Business Escort Service basiert auf Vertrauen, Diskretion und Professionalität.",
          "Viele Geschäftsreisende wünschen während ihres Aufenthalts eine angenehme Begleitung für besondere Momente außerhalb ihres beruflichen Alltags.",
          "Noir Hamburg legt Wert auf eine individuelle Auswahl und einen Service, der zu den persönlichen Vorstellungen unserer Kunden passt.",
        ],
        bodyEn: [
          "A high-end business escort service is built on trust, discretion and professionalism.",
          "Many business travellers appreciate a pleasant companion for special moments outside their working day.",
          "Noir Hamburg places emphasis on individual selection and a service tailored to each client's personal expectations.",
        ],
      },
      {
        h2: "Exklusive Begleitung für Geschäftsreisen",
        h2En: "Exclusive companionship for business trips",
        body: [
          "Hamburg empfängt täglich internationale Gäste, Unternehmer und Führungskräfte.",
          "Unser Business Escort Service eignet sich für Geschäftsreisen, Business Dinner, Hotelaufenthalte, Veranstaltungen, Messen und die private Abendgestaltung.",
          "Eine passende Begleitung kann einen Aufenthalt angenehmer und persönlicher gestalten.",
        ],
        bodyEn: [
          "Hamburg welcomes international guests, entrepreneurs and executives every day.",
          "Our business escort service is ideal for business trips, business dinners, hotel stays, events, trade fairs and private evening arrangements.",
          "The right companionship can make any stay more pleasant and personal.",
        ],
      },
      {
        h2: "Eleganz, Kommunikation und Persönlichkeit",
        h2En: "Elegance, conversation and personality",
        body: [
          "Eine Business Begleitung sollte nicht nur durch ihr Erscheinungsbild überzeugen.",
          "Ein angenehmes Auftreten, Kommunikationsfähigkeit und soziale Kompetenz sind entscheidend.",
          "Unsere Philosophie konzentriert sich auf Qualität, Stil und eine natürliche Atmosphäre.",
        ],
        bodyEn: [
          "A business companion should impress with more than appearance alone.",
          "A pleasant demeanour, strong conversational skills and social competence are decisive.",
          "Our philosophy focuses on quality, style and a naturally elegant atmosphere.",
        ],
      },
      {
        h2: "Diskretion beim Business Escort Hamburg",
        h2En: "Discretion in business escort Hamburg",
        body: [
          "Gerade für Geschäftsreisende ist Privatsphäre besonders wichtig.",
          "Jede Anfrage wird respektvoll und professionell behandelt.",
          "Noir Hamburg legt großen Wert auf eine diskrete Organisation und eine angenehme Kommunikation.",
        ],
        bodyEn: [
          "For business travellers in particular, privacy is essential.",
          "Every enquiry is treated respectfully and professionally.",
          "Noir Hamburg places great emphasis on discreet arrangements and pleasant communication.",
        ],
      },
      {
        h2: "Business Escort Hamburg und Umgebung",
        h2En: "Business Escort Hamburg and surrounding areas",
        body: [
          "Unser Service konzentriert sich auf Hamburg und die umliegenden Regionen.",
          "Zu unseren Servicebereichen zählen Hamburg Innenstadt, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg und Lüneburg.",
        ],
        bodyEn: [
          "Our service focuses on Hamburg and the surrounding region.",
          "Service areas include Hamburg city centre, HafenCity, St. Pauli, Eppendorf, Winterhude, Altona, Blankenese, Norderstedt, Pinneberg and Lüneburg.",
        ],
      },
      {
        h2: "Warum Noir Hamburg für Business Escort?",
        h2En: "Why choose Noir Hamburg for business escort?",
        body: [
          "Premium Service mit persönlicher Auswahl und diskreter Kommunikation.",
          "Stilvolle Models, ausgeprägte Hamburg-Spezialisierung und Qualität vor Quantität.",
          "Noir Hamburg steht für einen professionellen und angenehmen Business Escort Service.",
        ],
        bodyEn: [
          "Premium service with personal selection and discreet communication.",
          "Stylish companions, dedicated Hamburg expertise and quality over quantity.",
          "Noir Hamburg stands for a professional and pleasant business escort service.",
        ],
      },
    ],
    faqs: [
      { q: "Was ist Business Escort Hamburg?", qEn: "What is business escort Hamburg?", a: "Business Escort beschreibt eine stilvolle Begleitung für Geschäftsreisende, Veranstaltungen, Dinner oder besondere Anlässe mit Fokus auf Persönlichkeit und Diskretion.", aEn: "Business escort refers to a stylish companion for business travellers, events, dinners or special occasions — with a focus on personality and discretion." },
      { q: "Kann ich eine Begleitung für ein Business Dinner buchen?", qEn: "Can I book a companion for a business dinner?", a: "Ja. Viele Kunden wünschen eine elegante Begleitung für Restaurants, geschäftliche Veranstaltungen oder gesellschaftliche Termine.", aEn: "Yes. Many clients request an elegant companion for restaurants, business events or social engagements." },
      { q: "Ist Diskretion gewährleistet?", qEn: "Is discretion guaranteed?", a: "Diskretion und ein professioneller Umgang mit persönlichen Informationen gehören zu den wichtigsten Grundlagen von Noir Hamburg.", aEn: "Discretion and a professional approach to personal information are among Noir Hamburg's core principles." },
      { q: "Ist der Service nur in Hamburg verfügbar?", qEn: "Is the service only available in Hamburg?", a: "Noir Hamburg konzentriert sich auf Hamburg und ausgewählte Regionen in der Umgebung.", aEn: "Noir Hamburg focuses on Hamburg and selected surrounding regions." },
    ],
  },

  "dinner-companion-hamburg": {
    sections: [
      {
        h2: "Dinner Companion Hamburg — der stilvolle Abend zu zweit",
        h2En: "Dinner Companion Hamburg — the elegant evening for two",
        body: [
          "Ein Dinner in Hamburg ist mehr als ein Menü — es ist ein Rahmen für Gespräch, Reflexion und Genuss. Unsere Dinner Companions sind darauf spezialisiert, Ihnen an genau diesem Rahmen eine ebenbürtige Partnerin zu geben: kultiviert, wortgewandt, mit natürlichem Geschmack für Wein, Küche und Konversation.",
          "Von Haerlin im Fairmont Vier Jahreszeiten über das Jacobs Restaurant an der Elbchaussee bis zum Clouds mit Blick über den Hafen: unsere Damen bewegen sich in Hamburgs erlesenster Gastronomie mit selbstverständlicher Sicherheit. Sie kennen die Karte, die Weinbegleitung, die Wahl der richtigen Menülänge — und wissen, wann ein Abend besser bei Ihnen zu Hause ausklingt.",
        ],
        bodyEn: [
          "A dinner in Hamburg is more than a menu — it is a setting for conversation, reflection and enjoyment. Our Dinner Companions are trained to give you an equal partner in exactly that setting: cultivated, articulate, with a natural taste for wine, cuisine and conversation.",
          "From Haerlin at the Fairmont Vier Jahreszeiten via Jacobs Restaurant on the Elbchaussee to Clouds overlooking the harbour: our ladies move through Hamburg's most refined dining with effortless assurance. They know the menu, the wine pairing, the choice of the right course length — and understand when the evening is best continued at your home.",
        ],
      },
      {
        h2: "Wählen Sie das Restaurant — wir kümmern uns um alles andere",
        h2En: "You choose the restaurant — we handle everything else",
        body: [
          "Sie nennen uns Ihr bevorzugtes Restaurant, den Zeitpunkt und optional Ihren Wein-Vorzug. Wir reservieren auf Ihren Namen, kommunizieren spezielle Wünsche (Fensterplatz, Weinkarte vorab, Menu Dégustation) und stellen sicher, dass Ihre Begleitung mindestens fünfzehn Minuten vor Ihnen eintrifft.",
          "Alternativ arrangieren wir gerne eine Empfehlung: ein diskretes Dinner in Blankenese mit Blick auf die Elbe, ein Weinabend in Eppendorf, ein Sechs-Gang-Menü im 100/200 Kitchen in Wilhelmsburg. Für Bestandskunden mit besonderen Anforderungen — Halal, Kosher, streng vegetarisch, Zöliakie — reservieren wir gerne im Vorfeld und stimmen die Küche direkt mit dem Sommelier ab.",
        ],
        bodyEn: [
          "You give us your preferred restaurant, timing and optionally your wine preference. We book in your name, communicate special requests (window seat, wine list in advance, tasting menu) and ensure your companion arrives at least fifteen minutes ahead of you.",
          "Alternatively, we gladly suggest an option: a discreet dinner in Blankenese overlooking the Elbe, a wine evening in Eppendorf, a six-course menu at 100/200 Kitchen in Wilhelmsburg. For existing clients with particular requirements — halal, kosher, strictly vegetarian, coeliac — we book in advance and coordinate the kitchen directly with the sommelier.",
        ],
      },
      {
        h2: "Wie ein Dinner-Abend bei uns aussieht",
        h2En: "How a dinner evening with us unfolds",
        body: [
          "18:00 Uhr: Ihre Begleitung wartet diskret an der Rezeption des Restaurants — dezent gekleidet, in einer der Anlassform angemessenen Robe. Sie treffen ein, werden begrüßt, an den Tisch geleitet. Der Sommelier weiß Bescheid; die Weinbegleitung ist wahlweise bereits vorbereitet oder wird spontan gewählt.",
          "22:30 Uhr: Der Abend endet nach Ihren Wünschen. Ob mit einem Digestif in der Hotelbar, einer stilvollen Verabschiedung am Ausgang oder einer Verlängerung in Ihrer Suite — die Wahl liegt bei Ihnen. Bezahlung und Trinkgeld werden diskret abgewickelt.",
        ],
        bodyEn: [
          "6:00 pm: your companion waits discreetly at the restaurant's reception — in tastefully occasion-appropriate attire. You arrive, are greeted and led to the table. The sommelier is informed; the wine pairing is either prepared in advance or chosen spontaneously.",
          "10:30 pm: the evening ends as you wish. Whether with a digestif in the hotel bar, an elegant farewell at the exit, or an extension in your suite — the choice is yours. Payment and gratuity are handled discreetly.",
        ],
      },
    ],
    faqs: [
      { q: "Wird meine Begleitung zum Restaurant abgeholt?", qEn: "Is my companion collected at the restaurant?", a: "Nach Ihren Wünschen: entweder wartet die Dame an der Rezeption des Restaurants oder wir organisieren eine gemeinsame Anreise per Chauffeur.", aEn: "As you prefer: either the lady waits at the restaurant's reception or we organise a joint arrival by chauffeur." },
      { q: "Können Sie Restaurants in Hamburg empfehlen?", qEn: "Can you recommend restaurants in Hamburg?", a: "Selbstverständlich. Wir kennen die relevanten Adressen persönlich und passen die Empfehlung an Anlass, Tageszeit und Ihre Vorlieben an.", aEn: "Of course. We know the relevant addresses personally and tailor the recommendation to the occasion, time of day and your preferences." },
      { q: "Ist eine Verlängerung nach dem Dinner möglich?", qEn: "Is an extension after dinner possible?", a: "Ja, sofern Sie dies vorab andeuten und die Dame verfügbar ist. Verlängerungen werden zum regulären Stundensatz abgerechnet.", aEn: "Yes, provided you indicate this in advance and the lady is available. Extensions are billed at the regular hourly rate." },
      { q: "Kleidet sich meine Begleitung dem Restaurant angemessen?", qEn: "Will my companion dress appropriately for the restaurant?", a: "Immer. Wir informieren uns über den Dresscode Ihres Restaurants und stimmen die Garderobe ab — von Business Casual bis Black Tie.", aEn: "Always. We inform ourselves about your restaurant's dress code and coordinate attire — from business casual to black tie." },
      { q: "Wie ist die Verfügbarkeit an Freitag- und Samstagabenden?", qEn: "How is availability on Friday and Saturday evenings?", a: "An Wochenenden empfehlen wir eine Vorlaufzeit von mindestens 48 Stunden. Für kurzfristige Anfragen prüfen wir gerne Ausnahmen.", aEn: "On weekends we recommend at least 48 hours of lead time. For short-notice requests we gladly examine exceptions." },
    ],
  },

  "hotel-escort-hamburg": {
    sections: [
      {
        h2: "Hotel Escort Hamburg — diskrete Begleitung im Hotelrahmen",
        h2En: "Hotel Escort Hamburg — discreet companionship in the hotel setting",
        body: [
          "Ein Hotelbesuch in Hamburg soll ruhig, souverän und ohne unnötige Aufmerksamkeit ablaufen. Unsere Hotel Escorts sind mit den Codes der Fünf-Sterne-Hotels der Stadt vertraut: sie kennen die Grüßformeln des Concierges, die dezente Ankunft über den Nebeneingang, den natürlichen Umgang mit Türstehern und Housekeeping.",
          "Vom Fairmont Vier Jahreszeiten bis zum Fontenay, vom Atlantic Kempinski bis zum Reichshof — wir vermitteln in allen relevanten Hotels der Stadt, ebenso in gehobenen Boutique-Häusern der HafenCity und in privaten Suites in Blankenese. Auf Wunsch übernehmen wir die Reservierung des Hotelzimmers auf Ihren Namen und stellen sicher, dass Ihre Begleitung Sie zeitgleich oder wenige Minuten nach Ihnen erreicht.",
        ],
        bodyEn: [
          "A hotel visit in Hamburg should proceed calmly, confidently and without unnecessary attention. Our Hotel Escorts are familiar with the codes of the city's five-star hotels: they know the concierge's forms of address, the discreet arrival via the side entrance, the natural interaction with doormen and housekeeping.",
          "From the Fairmont Vier Jahreszeiten to The Fontenay, from Atlantic Kempinski to the Reichshof — we place companions in every relevant hotel in the city, as well as in refined boutique houses in HafenCity and in private suites in Blankenese. On request we book the hotel room in your name and ensure your companion arrives either simultaneously with you or a few minutes after.",
        ],
      },
      {
        h2: "Für den Business-Traveller und den privaten Gast",
        h2En: "For the business traveller and the private guest",
        body: [
          "Sie kommen für zwei Nächte nach Hamburg — eine Konferenz am Flughafen, ein Board-Meeting in der HafenCity, ein privates Wochenende mit Blick über die Alster. In allen Fällen bieten wir eine passende Begleitform: von der klassischen Abendbegleitung mit anschließender Übernachtung bis zum diskreten Vormittagsbesuch vor Ihrem Rückflug.",
          "Unsere Hotel-Damen sind darauf trainiert, im Rahmen der Anonymität eines internationalen Hotels zu operieren: kein Blickkontakt mit anderen Gästen im Fahrstuhl, kein Small Talk an der Bar, kein Fotografieren im Zimmer. Diese Selbstverständlichkeiten sind in unserem Vermittlungsprozess Standard, nicht Extra.",
        ],
        bodyEn: [
          "You come to Hamburg for two nights — a conference at the airport, a board meeting in HafenCity, a private weekend overlooking the Alster. In every case we offer a suitable format: from classic evening companionship with overnight stay to a discreet morning visit before your return flight.",
          "Our hotel companions are trained to operate within the anonymity of an international hotel: no eye contact with other guests in the lift, no small talk at the bar, no photography in the room. These are standard in our matchmaking process, not an extra.",
        ],
      },
      {
        h2: "Ihre Sicherheit — unsere Verantwortung",
        h2En: "Your safety — our responsibility",
        body: [
          "Jede unserer Hotel-Damen ist uns persönlich bekannt, wird verifiziert und arbeitet ausschließlich mit uns. Sie unterlässt aktives Ansprechen im Hotel, verlässt das Zimmer diskret nach dem vereinbarten Zeitpunkt und trägt keine sichtbare Werbung für unsere Agentur. Für Sie bedeutet das: keine Peinlichkeiten, keine Nachfragen an der Rezeption, keine Bemerkungen des Housekeepings.",
          "Umgekehrt schützen wir auch unsere Damen. Erstbuchungen unterliegen einer diskreten Verifizierung; wir bitten um einen kurzen Rückruf, um Missverständnisse auszuschließen. Diese Doppelseitigkeit ist Grundlage einer vertrauensvollen Zusammenarbeit über Jahre hinweg.",
        ],
        bodyEn: [
          "Every one of our hotel companions is personally known to us, verified and works exclusively with us. She refrains from actively approaching anyone in the hotel, leaves the room discreetly after the agreed time and does not visibly advertise our agency. For you that means: no awkwardness, no enquiries at reception, no comments from housekeeping.",
          "Conversely, we also protect our ladies. First bookings undergo discreet verification; we ask for a brief callback to rule out misunderstandings. This reciprocity is the foundation of a trusting collaboration lasting many years.",
        ],
      },
    ],
    faqs: [
      { q: "In welchen Hamburger Hotels sind Sie tätig?", qEn: "Which Hamburg hotels do you operate in?", a: "In allen relevanten Fünf-Sterne- und First-Class-Hotels, darunter Fairmont Vier Jahreszeiten, The Fontenay, Atlantic Kempinski, SIDE Design Hotel, Le Méridien und Reichshof.", aEn: "In all relevant five-star and first-class hotels, including Fairmont Vier Jahreszeiten, The Fontenay, Atlantic Kempinski, SIDE Design Hotel, Le Méridien and Reichshof." },
      { q: "Wird meine Buchung dem Hotel gemeldet?", qEn: "Is my booking reported to the hotel?", a: "Nein. Ihre Begleitung erscheint als privater Besuch. Wir kommunizieren nicht mit dem Hotelpersonal — es sei denn, Sie wünschen ausdrücklich eine bestimmte Zimmerreservierung.", aEn: "No. Your companion appears as a private visit. We do not communicate with hotel staff — unless you explicitly wish for a specific room reservation." },
      { q: "Kann die Dame im Hotel übernachten?", qEn: "Can the lady stay overnight at the hotel?", a: "Ja. Overnight-Bookings ab 12 Stunden werden zum ausgewiesenen Nachttarif abgerechnet — siehe Profil der jeweiligen Dame.", aEn: "Yes. Overnight bookings from 12 hours are billed at the listed overnight rate — see each lady's profile." },
      { q: "Bevorzugen Sie bestimmte Ankunftszeiten im Hotel?", qEn: "Do you prefer specific arrival times at the hotel?", a: "Wir empfehlen Ankunft nach 18:00 Uhr für maximale Diskretion. Nachmittagstermine sind möglich, erfordern aber gelegentlich eine kurze Absprache mit der Concierge-Etage.", aEn: "We recommend arrival after 6:00 pm for maximum discretion. Afternoon bookings are possible but occasionally require a brief agreement with the concierge floor." },
      { q: "Kann ich das Hotelzimmer über Sie buchen lassen?", qEn: "Can you book the hotel room for me?", a: "Auf Wunsch übernehmen wir die Reservierung — auf Ihren Namen, mit Ihren Kartendaten oder anonym per bar bezahltem Voucher.", aEn: "On request we take care of the reservation — in your name, with your card details or anonymously via cash-paid voucher." },
    ],
  },

  "event-escort-hamburg": {
    sections: [
      {
        h2: "Event Escort Hamburg — für Galas, Empfänge und Vernissagen",
        h2En: "Event Escort Hamburg — for galas, receptions and vernissages",
        body: [
          "Bei kulturellen und geschäftlichen Events in Hamburg zählt nicht nur die Präsenz, sondern das Auftreten. Unsere Event Escorts sind speziell dafür geschult, Sie als natürliche Partnerin durch einen Abend zu begleiten — sei es eine Vernissage in der Deichtorhalle, ein Charity-Gala im Rathaus oder eine Konzertpremiere in der Elbphilharmonie.",
          "Diese Damen sind gewohnt, sich in gemischten Kreisen zu bewegen: sie führen Small Talk auf höchstem Niveau, kennen die aktuellen kulturellen Ereignisse Hamburgs und sind in der Lage, ein Gespräch über die aktuelle Ausstellung im Bucerius Kunst Forum ebenso souverän zu führen wie über Aktienmärkte oder Segeln vor Sylt.",
        ],
        bodyEn: [
          "At cultural and business events in Hamburg, presence alone is not what counts — bearing is. Our Event Escorts are specifically trained to accompany you through an evening as a natural partner — whether a vernissage at the Deichtorhalle, a charity gala at the City Hall or a concert premiere at the Elbphilharmonie.",
          "These ladies are used to moving in mixed circles: they engage in small talk at the highest level, are familiar with Hamburg's current cultural events and are equally comfortable discussing the current exhibition at the Bucerius Kunst Forum, financial markets or sailing off Sylt.",
        ],
      },
      {
        h2: "Perfekte Vorbereitung, entspannter Abend",
        h2En: "Perfect preparation, relaxed evening",
        body: [
          "Vor jedem Event stimmen wir mit Ihnen den Dresscode ab, koordinieren mit dem Veranstalter (falls gewünscht) die Sitzordnung und stellen sicher, dass Ihre Begleitung über die relevanten Namen und Kontexte informiert ist. Auf Wunsch fertigen wir Ihnen ein kurzes Briefing der wichtigsten Gäste, damit Ihre Begleitung im Small Talk sofort anschlussfähig ist.",
          "Kleidung: von Cocktail über Black Tie bis White Tie — unsere Damen verfügen über eine eigene Kollektion an Anlassgarderobe oder mieten für den Anlass entsprechend an. Wir kalkulieren diesen Aufwand transparent in die Buchung ein; keine versteckten Zusatzkosten.",
        ],
        bodyEn: [
          "Before every event we agree the dress code with you, coordinate with the organiser (if desired) on seating, and ensure your companion is briefed on the relevant names and contexts. On request we prepare a short brief on the key guests so that your companion is immediately at ease in small talk.",
          "Attire: from cocktail through black tie to white tie — our ladies maintain their own collection of occasion attire or rent accordingly. We factor this transparently into the booking; no hidden extras.",
        ],
      },
      {
        h2: "Diskrete Präsenz — nicht Bühne",
        h2En: "Discreet presence — not stage",
        body: [
          "Ein guter Event Escort ist präsent, aber nicht dominant. Unsere Damen wissen, wann sie Ihre Konversation stützen, wann sie selbst führen und wann sie sich in den Hintergrund zurücknehmen. Bei einer Vernissage können Sie ungestört mit einem Sammler sprechen, bei einem Charity-Empfang mit dem Vorstand ins Gespräch kommen — ohne dass Ihre Begleitung wirkt wie ein 'Anhang'.",
          "Nach dem Event: wir organisieren auf Wunsch Chauffeur oder Taxi, eine After-Event-Bar oder eine späte Auszeit in Ihrer Suite. Die Wahl liegt bei Ihnen. Wir treten dabei nie in Erscheinung — die Buchung ist ausschließlich zwischen Ihnen und Ihrer Begleitung.",
        ],
        bodyEn: [
          "A good event escort is present but not dominant. Our ladies know when to support your conversation, when to lead themselves and when to step into the background. At a vernissage you can speak undisturbed to a collector, at a charity reception you can engage the board — without your companion appearing as an accessory.",
          "After the event: on request we organise chauffeur or taxi, an after-event bar or a late retreat to your suite. The choice is yours. We are never visibly involved — the booking is exclusively between you and your companion.",
        ],
      },
    ],
    faqs: [
      { q: "Kennen Ihre Damen die Hamburger Kulturszene?", qEn: "Are your ladies familiar with Hamburg's cultural scene?", a: "Ja. Alle unsere Event-Damen sind regelmäßig in Hamburg unterwegs — Elbphilharmonie, Deichtorhalle, Bucerius, Kammerspiele — und kennen die aktuellen Programme.", aEn: "Yes. All our event companions move regularly through Hamburg's cultural venues — Elbphilharmonie, Deichtorhalle, Bucerius, Kammerspiele — and are aware of the current programmes." },
      { q: "Ist Black Tie möglich?", qEn: "Is black tie possible?", a: "Selbstverständlich. Unsere Damen haben eigene Anlassgarderobe für Cocktail-, Black-Tie- und White-Tie-Events oder mieten kurzfristig entsprechend an.", aEn: "Naturally. Our ladies keep their own attire for cocktail, black-tie and white-tie events or rent as needed." },
      { q: "Kann ich einen Chauffeur zu einem Event dazu buchen?", qEn: "Can I add a chauffeur for an event?", a: "Ja, wir koordinieren auf Wunsch einen diskreten Chauffeurdienst mit uns bekannten Fahrern.", aEn: "Yes, on request we coordinate a discreet chauffeur service with drivers known to us." },
      { q: "Wie funktioniert das mit der Sitzordnung?", qEn: "How does seating work?", a: "Nennen Sie uns die Namen der Veranstalter und wir kommunizieren, sofern dies gewünscht ist, dezent Ihre Begleitung als 'Frau …' — ansonsten bleibt Ihre Begleitung anonym.", aEn: "Give us the organiser's names and — if you wish — we discreetly announce your companion as 'Ms …'; otherwise she remains anonymous." },
      { q: "Sind mehrtägige Events möglich?", qEn: "Are multi-day events possible?", a: "Ja. Für Festivals, mehrtägige Konferenzen oder Fashion Weeks bieten wir spezielle Pakete an.", aEn: "Yes. For festivals, multi-day conferences or fashion weeks we offer dedicated packages." },
    ],
  },

  "travel-companion-hamburg": {
    sections: [
      {
        h2: "Travel Companion Hamburg — Begleitung ohne Grenzen",
        h2En: "Travel Companion Hamburg — companionship without borders",
        body: [
          "Ob ein Wochenende auf Sylt, eine Woche in Cortina d'Ampezzo oder eine mehrtägige Yacht-Reise entlang der italienischen Riviera — unsere Travel Companions begleiten Sie weltweit mit hanseatischer Zuverlässigkeit und internationalem Auftreten. Alle verfügen über gültige Reisepässe, Schengen-Erfahrung und die Fähigkeit, in mindestens zwei Fremdsprachen fließend zu kommunizieren.",
          "Diese Damen sind gewohnt zu reisen. Sie kennen den Ablauf am Hamburg Airport (Terminal 1 und 2), sind vertraut mit dem Boarding im Private Jet, sitzen unaufdringlich im First-Class-Salon der Lufthansa oder Emirates und wissen, wie man in einem Fünf-Sterne-Resort in Muscat oder auf den Malediven diskret auftritt.",
        ],
        bodyEn: [
          "Whether a weekend in Sylt, a week in Cortina d'Ampezzo or a multi-day yacht journey along the Italian Riviera — our Travel Companions accompany you worldwide with Hanseatic reliability and international poise. All hold valid passports, have Schengen experience and can communicate fluently in at least two foreign languages.",
          "These ladies are experienced travellers. They know the process at Hamburg Airport (Terminals 1 and 2), are familiar with boarding on a private jet, sit unobtrusively in the Lufthansa or Emirates First Class lounge and know how to conduct themselves discreetly in a five-star resort in Muscat or the Maldives.",
        ],
      },
      {
        h2: "Typische Reise-Anlässe",
        h2En: "Typical travel occasions",
        body: [
          "Business-Trips: Ihre Begleitung reist als Ihre Partnerin, wohnt separat und begleitet Sie ausschließlich zu offiziellen Empfängen. Weekender: gemeinsame Anreise, gemeinsames Hotel, entspannter Ausklang. Familienzeit: Ihre Begleitung tritt bei diskreten Anlässen als 'Freundin' auf — mit dem entsprechenden Auftreten. Yacht-Charter: Wochenaufenthalte auf einer 40-Meter-Yacht in der Adria, Karibik oder ab Split.",
          "Für längere Reisen (ab fünf Tagen) empfehlen wir eine erste kurze Begegnung in Hamburg — ein Dinner, ein Kaffee. So können sich beide Seiten kennenlernen, bevor Sie in einem ferngelegenen Ort mehrere Tage gemeinsam verbringen. Wir organisieren diesen Vorabend auf Wunsch mit.",
        ],
        bodyEn: [
          "Business trips: your companion travels as your partner, stays separately and accompanies you only to official events. Weekenders: joint arrival, shared hotel, relaxed conclusion. Family time: your companion appears at discreet occasions as your 'partner' — with the corresponding bearing. Yacht charter: week-long stays on a 40-metre yacht in the Adriatic, Caribbean or departing from Split.",
          "For longer trips (from five days) we recommend a first brief encounter in Hamburg — a dinner, a coffee. This allows both sides to become acquainted before spending several days together in a distant location. We arrange this preliminary evening on request.",
        ],
      },
      {
        h2: "Wie wir Reisen organisieren",
        h2En: "How we organise travel",
        body: [
          "Reisekosten werden transparent kalkuliert: Flug (Business oder First), Hotel oder Ferienwohnung, Transfers, Verpflegung. Wir arbeiten mit einem Netzwerk von Vertrauenspartnern für Chauffeure, Concierge-Services und Yacht-Charter zusammen. Auf Wunsch übernehmen wir die gesamte Reiseplanung — inklusive Visa, Impfungen und Reiseversicherung für die begleitende Dame.",
          "Sicherheit auf Reisen: Wir informieren Ihre Begleitung über Länder-spezifische Etikette, sensibilisieren für kulturelle Codes (insbesondere im Nahen Osten oder Asien) und stellen 24/7-Notfallkontakt sicher. Unsere Damen tragen keine Werbung, keinen Schmuck mit Firmenbezug, keine sichtbaren Notizen zu Kunden.",
        ],
        bodyEn: [
          "Travel costs are calculated transparently: flights (business or first), hotel or apartment, transfers, meals. We work with a network of trusted partners for chauffeurs, concierge services and yacht charters. On request we take over the entire travel planning — including visas, vaccinations and travel insurance for the accompanying lady.",
          "Safety in transit: we brief your companion on country-specific etiquette, alert her to cultural codes (particularly in the Middle East or Asia) and provide 24/7 emergency contact. Our ladies carry no advertising, no jewellery with corporate association and no visible notes referring to clients.",
        ],
      },
    ],
    faqs: [
      { q: "Werden Reisekosten separat berechnet?", qEn: "Are travel costs billed separately?", a: "Ja. Flug, Hotel und Transfers werden transparent im Voraus kalkuliert und bilden einen separaten Posten auf Ihrer Anfrage.", aEn: "Yes. Flight, hotel and transfers are transparently calculated in advance and form a separate line item on your enquiry." },
      { q: "Können Ihre Damen Visa-Länder bereisen?", qEn: "Can your companions travel to visa-required countries?", a: "Ja. Unsere Damen verfügen über gültige Reisepässe und ausreichend Schengen-, US-, VAE- und UK-Historie für schnelle Visa-Genehmigungen.", aEn: "Yes. Our companions hold valid passports and sufficient Schengen, US, UAE and UK history for swift visa approvals." },
      { q: "Wie viele Tage im Voraus sollte ich buchen?", qEn: "How many days in advance should I book?", a: "Für längere internationale Reisen empfehlen wir mindestens zwei Wochen. Kürzere Wochenendtrips innerhalb Europas sind mit 72 Stunden Vorlauf gut planbar.", aEn: "For longer international trips we recommend at least two weeks. Shorter European weekend trips are well planned with 72 hours' notice." },
      { q: "Werden Kosten auch bei Absage erstattet?", qEn: "Are costs refunded in case of cancellation?", a: "Bei Absage bis 72 Stunden vor Abreise erstatten wir vollständig. Danach erstatten wir Reisekosten anteilig — den Ausfall des Honorars behalten wir gemäß AGB.", aEn: "For cancellations up to 72 hours before departure we refund fully. Thereafter we refund travel costs pro rata; the honorarium loss remains per our terms." },
      { q: "Ist ein Yacht-Charter über Sie möglich?", qEn: "Is a yacht charter possible through you?", a: "Ja, wir arbeiten mit langjährigen Partnern in Split, Antibes, Monaco und Mallorca. Charter-Größen von 25 bis 60 Metern.", aEn: "Yes, we work with long-standing partners in Split, Antibes, Monaco and Mallorca. Charter sizes from 25 to 60 metres." },
    ],
  },

  "girlfriend-experience-hamburg": {
    sections: [
      {
        h2: "Girlfriend Experience Hamburg — Vertrautheit statt Inszenierung",
        h2En: "Girlfriend Experience Hamburg — intimacy over performance",
        body: [
          "Die Girlfriend Experience ist die persönlichste, natürlichste Form unserer Vermittlung. Statt formaler Begleitung geht es hier um eine echte Verbundenheit — eine Frau, mit der Sie sich unterhalten, spazieren gehen, gemeinsam kochen können, ohne dass ein steifer Rahmen darüberliegt. Für viele unserer Kunden ist dies die gesuchte Ergänzung zu einer Woche voller formeller Termine.",
          "Unsere GFE-Damen sind besonders empathisch und in der Lage, in kurzer Zeit eine natürliche Vertrautheit aufzubauen. Sie werden bemerken: es fühlt sich nicht wie eine Buchung an. Ein Kaffee an der Alster, ein Spaziergang durch den Stadtpark, ein Abend zu zweit auf dem Sofa mit einem Glas Wein und einem guten Film — das ist die Essenz der Girlfriend Experience.",
        ],
        bodyEn: [
          "The Girlfriend Experience is the most personal, most natural form of our matchmaking. Instead of formal companionship it centres on genuine connection — a woman with whom you converse, walk, cook, without any stiff framework hovering above. For many of our clients this is the counterbalance to a week of formal appointments.",
          "Our GFE ladies are particularly empathetic and able to build a natural intimacy within a short time. You will notice: it does not feel like a booking. A coffee at the Alster, a walk through the Stadtpark, an evening at home with a glass of wine and a good film — that is the essence of the Girlfriend Experience.",
        ],
      },
      {
        h2: "Für welche Kunden geeignet",
        h2En: "For which clients this suits",
        body: [
          "Die Girlfriend Experience richtet sich an Herren, die Wert auf echte menschliche Nähe legen — nicht auf einen konventionellen Escort-Rahmen. Häufig sind es beruflich stark eingebundene Personen, für die klassische Beziehungen zeitlich schwierig sind, aber ohne die menschliche Wärme das Leben deutlich ärmer wäre.",
          "Ebenso passt die GFE für Herren, die vor einem wichtigen Anlass — Beförderung, Präsentation, Prüfung — eine ruhige, entspannte Vor- oder Nachbereitung suchen. Und für Reisen, bei denen Sie nicht ins Formelle rutschen, sondern echte gemeinsame Zeit erleben möchten.",
        ],
        bodyEn: [
          "The Girlfriend Experience is aimed at gentlemen who value real human closeness — not a conventional escort framing. Often these are professionally intense individuals for whom classical relationships are difficult time-wise, yet without human warmth life would be markedly poorer.",
          "It equally suits gentlemen who, before a significant event — promotion, presentation, examination — seek a calm, relaxed preparation or aftermath. And for trips where you wish not to slip into the formal but to experience true shared time.",
        ],
      },
      {
        h2: "Was den Unterschied macht",
        h2En: "What makes the difference",
        body: [
          "Länger als eine Stunde. Die klassische Stunden-Buchung passt nicht zu dieser Form der Begleitung — echte Vertrautheit braucht Zeit. Wir empfehlen daher mindestens vier Stunden oder direkt einen Abend mit Übernachtung. Innerhalb dieser Zeit können Sie sich beide entspannen, kennenlernen, gemeinsam einen Rhythmus finden.",
          "Weniger Skript. Ihre GFE-Dame trägt kein Kleid für die Elbphilharmonie, sondern Jeans und Pullover, wenn das passt. Sie entscheiden gemeinsam über den Ablauf, sie kann kochen oder Sie gehen zu Ihrem Lieblings-Italiener. Die Buchung ist explizit weniger 'inszeniert' — dafür umso persönlicher.",
        ],
        bodyEn: [
          "Longer than an hour. The classic hourly booking does not suit this form — true intimacy needs time. We therefore recommend at least four hours or an entire evening with overnight. Within that time you can both relax, become acquainted and find a shared rhythm.",
          "Less scripted. Your GFE lady is not wearing a Elbphilharmonie gown but jeans and a jumper, if that fits. You decide together on the flow, she may cook or you go to your favourite Italian. The booking is explicitly less staged — and precisely for that reason far more personal.",
        ],
      },
    ],
    faqs: [
      { q: "Wie unterscheidet sich GFE von klassischer Begleitung?", qEn: "How does GFE differ from classic companionship?", a: "Weniger formal, längere Dauer, echte gemeinsame Zeit ohne inszenierten Rahmen. Ideal für Herren, die Wärme und Nähe suchen.", aEn: "Less formal, longer duration, real shared time without a staged framework. Ideal for gentlemen seeking warmth and closeness." },
      { q: "Welche Mindestdauer empfehlen Sie?", qEn: "What minimum duration do you recommend?", a: "Mindestens vier Stunden — besser einen Abend mit Übernachtung. Nur so entsteht die entspannte Atmosphäre, die diese Form ausmacht.", aEn: "At least four hours — better an evening with overnight stay. Only then does the relaxed atmosphere characteristic of this form emerge." },
      { q: "Kann ich zu Hause statt in einem Hotel treffen?", qEn: "Can we meet at my home rather than a hotel?", a: "Ja. Ein privates Zuhause ist häufig sogar der bessere Rahmen für GFE. Diskretion vorausgesetzt.", aEn: "Yes. A private home is often the better setting for GFE. Provided discretion is guaranteed." },
      { q: "Kann sie auch mit mir kochen?", qEn: "Can she also cook with me?", a: "Selbstverständlich. Viele unserer GFE-Damen kochen ausgesprochen gut und schätzen den Abend zu zweit in der Küche.", aEn: "Certainly. Many of our GFE ladies are excellent cooks and appreciate an evening together in the kitchen." },
      { q: "Ist ein zweites Treffen möglich?", qEn: "Is a second meeting possible?", a: "Sehr gerne. Viele GFE-Buchungen entwickeln sich zu wiederkehrenden Terminen. Wir freuen uns über Kontinuität und richten diese gerne über einen festen Termin ein.", aEn: "Very gladly. Many GFE bookings develop into recurring appointments. We appreciate continuity and are happy to establish this via a fixed weekly slot." },
    ],
  },
};

// Related-service map — which services should be shown as "you may also
// consider" on each detail page. Small manual curation for editorial control.
const RELATED_SERVICES = {
  "luxury-escort-hamburg": ["vip-escort-hamburg", "dinner-companion-hamburg", "event-escort-hamburg"],
  "vip-escort-hamburg": ["luxury-escort-hamburg", "business-escort-hamburg", "travel-companion-hamburg"],
  "business-escort-hamburg": ["vip-escort-hamburg", "dinner-companion-hamburg", "travel-companion-hamburg"],
  "dinner-companion-hamburg": ["luxury-escort-hamburg", "event-escort-hamburg", "hotel-escort-hamburg"],
  "hotel-escort-hamburg": ["luxury-escort-hamburg", "dinner-companion-hamburg", "girlfriend-experience-hamburg"],
  "event-escort-hamburg": ["luxury-escort-hamburg", "dinner-companion-hamburg", "vip-escort-hamburg"],
  "travel-companion-hamburg": ["luxury-escort-hamburg", "vip-escort-hamburg", "girlfriend-experience-hamburg"],
  "girlfriend-experience-hamburg": ["dinner-companion-hamburg", "hotel-escort-hamburg", "travel-companion-hamburg"],
};

module.exports = { SERVICE_CONTENT, RELATED_SERVICES };
