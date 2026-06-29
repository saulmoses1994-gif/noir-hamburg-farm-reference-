// Noir Hamburg — Site-wide content data (German)
// CommonJS exports so this file is the single source of truth
// for both the React app (via Babel's import interop) AND the SSR server
// (which `require`s this file from Node). Do NOT add ES `export` syntax here.

const BRAND = {
  name: "Noir Hamburg",
  tagline: "Premium Begleitagentur · Hamburg",
  phone: "+49 40 0000 0000",
  whatsapp: "+4940000000000",
  whatsappUrl: "https://wa.me/4940000000000",
  email: "kontakt@noir-hamburg.de",
};

const NAV = [
  { label: "Startseite", to: "/" },
  { label: "Models", to: "/models" },
  { label: "Escort Hamburg", to: "/escort-hamburg" },
  { label: "Services", to: "/services" },
  { label: "Hamburg Areas", to: "/areas" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/faq" },
  { label: "Über uns", to: "/ueber-uns" },
  { label: "Kontakt", to: "/kontakt" },
];

const SERVICES = [
  {
    slug: "luxury-escort-hamburg",
    title: "Luxury Escort Hamburg",
    shortLabel: "Luxury",
    h1: "Luxury Escort Hamburg",
    tagline: "Begleitung auf höchstem Niveau",
    description:
      "Unsere Luxury Escorts verkörpern jene seltene Mischung aus Eleganz, Bildung und natürlichem Charme, die im hanseatischen Premiumsegment erwartet wird.",
    longCopy:
      "Im exklusiven Luxussegment ist eine Begleitung mehr als ein Service – sie ist eine Erweiterung Ihrer Persönlichkeit. Unsere Luxury Escorts in Hamburg sind sorgfältig ausgewählte Persönlichkeiten mit akademischem Hintergrund, multilingualer Eloquenz und einer instinktiven Souveränität, mit der sie sich auf jedem Parkett bewegen – von der Galaeröffnung in der Elbphilharmonie bis zum diskreten Dinner im Vier Jahreszeiten.",
    keypoints: [
      "Akademisch gebildete Persönlichkeiten",
      "Mehrsprachige Konversation auf hohem Niveau",
      "Garderobe von gehobener Eleganz",
      "Erfahrung in internationalen Kreisen",
    ],
    image:
      "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Luxury Escort Hamburg | Premium Begleitung | Noir Hamburg",
    metaDescription:
      "Luxury Escort Hamburg – exklusive Begleitung auf höchstem Niveau für anspruchsvolle Herren. Akademisch, mehrsprachig, diskret.",
  },
  {
    slug: "vip-escort-hamburg",
    title: "VIP Escort Hamburg",
    shortLabel: "VIP",
    h1: "VIP Escort Hamburg",
    tagline: "Diskretion auf höchster Stufe",
    description:
      "Für Persönlichkeiten von öffentlichem Rang. Maximale Vertraulichkeit, maximale Qualität.",
    longCopy:
      "Unsere VIP-Begleitung richtet sich an Persönlichkeiten, deren Anonymität nicht verhandelbar ist. Speziell ausgewählte Models, die mit der Welt der Hochfinanz, Politik und internationalen Hospitalität vertraut sind und die jeweiligen Codes meisterlich beherrschen.",
    keypoints: [
      "Maximale Diskretion durch NDA-Standards",
      "Erfahrung mit Persönlichkeiten von öffentlichem Rang",
      "Komplette Reise- und Veranstaltungsplanung",
      "Vermittlung in geschlossener Kommunikation",
    ],
    image:
      "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "VIP Escort Hamburg | Diskrete Premium-Begleitung | Noir Hamburg",
    metaDescription:
      "VIP Escort Hamburg – höchste Diskretion und Premium-Begleitung für Persönlichkeiten mit besonderen Ansprüchen an Vertraulichkeit.",
  },
  {
    slug: "business-escort-hamburg",
    title: "Business Escort Hamburg",
    shortLabel: "Business",
    h1: "Business Escort Hamburg",
    tagline: "Souveränität im geschäftlichen Kontext",
    description:
      "Begleitung für Geschäftsessen, Konferenzen, Empfänge und internationale Anlässe.",
    longCopy:
      "Im internationalen Geschäftsumfeld ist die richtige Begleitung ein subtiler Faktor des Erfolgs. Unsere Business Escorts verfügen über die rhetorische Bildung, das diplomatische Feingefühl und die kulturelle Versiertheit, die in solchen Kreisen erwartet werden.",
    keypoints: [
      "Wirtschaftliches und politisches Sachverständnis",
      "Mehrsprachigkeit auf Verhandlungsniveau",
      "Professioneller Dresscode (Business, Cocktail, Black-tie)",
      "Selbstverständnis als diskrete Partnerin",
    ],
    image:
      "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Business Escort Hamburg | Geschäftsbegleitung | Noir Hamburg",
    metaDescription:
      "Business Escort Hamburg – stilsichere und gebildete Begleitung für Geschäftsessen, Empfänge und Konferenzen.",
  },
  {
    slug: "dinner-companion-hamburg",
    title: "Dinner Companion Hamburg",
    shortLabel: "Dinner",
    h1: "Dinner Date Hamburg",
    tagline: "Konversation auf Sterneniveau",
    description:
      "Begleitung zu Dinners in Hamburgs feinsten Restaurants und Privatclubs.",
    longCopy:
      "Ein Abendessen ist die feinste aller gesellschaftlichen Künste. Unsere Dinner Companions begleiten Sie mit Eleganz, kulinarischem Verständnis und einer Konversation, die jedes Menü zur Erfahrung werden lässt – vom Haerlin bis zu privaten Tafelrunden.",
    keypoints: [
      "Vertraut mit Hamburger Top-Gastronomie",
      "Stilvolle Garderobe für jeden Anlass",
      "Geschulte Konversation, Weinkunde, Etikette",
      "Diskrete Reservierungsmöglichkeiten",
    ],
    image:
      "https://images.pexels.com/photos/11541194/pexels-photo-11541194.png?auto=compress&cs=tinysrgb&w=1600",
    metaTitle: "Dinner Date Hamburg | Stilvolle Abendbegleitung | Noir Hamburg",
    metaDescription:
      "Dinner Date Hamburg – elegante Begleitung zu Restaurants und Privatclubs. Konversation, Stil und Diskretion auf Sterneniveau.",
  },
  {
    slug: "hotel-escort-hamburg",
    title: "Hotel Escort Hamburg",
    shortLabel: "Hotel",
    h1: "Hotel Escort Hamburg",
    tagline: "Diskrete Begleitung in 5★-Hotels",
    description:
      "Wir kennen die feinsten Adressen und ihre diskreten Prozeduren.",
    longCopy:
      "Vom Fairmont Vier Jahreszeiten über das Park Hyatt bis zum The Fontenay – unsere Models bewegen sich in den Lobbys und Suiten der Hamburger Premium-Hotellerie mit der Selbstverständlichkeit eines Stammgastes. Eintritte erfolgen stets diskret.",
    keypoints: [
      "Erfahrung mit Hamburgs 5-Sterne-Hotels",
      "Diskreter, professioneller Eintritt",
      "Reibungslose Abläufe, persönlicher Concierge-Kontakt",
      "Garderobe passend zum jeweiligen Haus",
    ],
    image:
      "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Hotel Escort Hamburg | Diskrete 5★-Begleitung | Noir Hamburg",
    metaDescription:
      "Hotel Escort Hamburg – Premium-Begleitung in den feinsten Häusern der Hansestadt. Diskret, stilvoll, zuverlässig.",
  },
  {
    slug: "event-escort-hamburg",
    title: "Event Escort Hamburg",
    shortLabel: "Event",
    h1: "Event Escort Hamburg",
    tagline: "Souveräne Präsenz auf jeder Bühne",
    description:
      "Galas, Vernissagen, Empfänge, Premieren – Begleitung für die Hamburger Szene.",
    longCopy:
      "Ob Reeperbahn Filmfestival, Premiere im Schauspielhaus oder Charity-Gala im Curio-Haus – unsere Event Escorts verstehen die jeweiligen Codes und repräsentieren Sie mit Selbstbewusstsein und Stil.",
    keypoints: [
      "Erfahrung mit Hamburger Gesellschaftsleben",
      "Garderobe vom Cocktailkleid bis zur Robe",
      "Charmant, aufmerksam, souverän",
      "Stilsichere Präsenz auf jedem Parkett",
    ],
    image:
      "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
    metaTitle: "Event Escort Hamburg | Begleitung Galas & Empfänge | Noir Hamburg",
    metaDescription:
      "Event Escort Hamburg – elegante Begleitung für Galas, Vernissagen und Empfänge. Stilvolle Präsenz, diskretes Auftreten.",
  },
  {
    slug: "travel-companion-hamburg",
    title: "Travel Companion Hamburg",
    shortLabel: "Travel",
    h1: "Travel Companion Hamburg",
    tagline: "Begleitung weltweit – mit Hanseatischer Eleganz",
    description:
      "Mehrtägige Reisen, internationale Trips, private Yacht-Reisen.",
    longCopy:
      "Unsere Travel Companions begleiten Sie auf Geschäftsreisen, privaten Wochenenden und längeren Aufenthalten – von Sylt bis Saint-Tropez, von Zürich bis Dubai. Reisepass, multilinguale Eloquenz und Erfahrung im internationalen Reisen sind Selbstverständlichkeit.",
    keypoints: [
      "International erfahren, weltweit verfügbar",
      "Gültiger Reisepass, multilingual",
      "Wochenend- und Mehrtagesreisen",
      "Yacht-, Ski-, und Stadt-Reisen",
    ],
    image:
      "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Travel Companion Hamburg | Reisebegleitung weltweit | Noir Hamburg",
    metaDescription:
      "Travel Companion Hamburg – internationale Reisebegleitung mit Stil, Bildung und Diskretion. Yacht, Sylt, weltweit.",
  },
  {
    slug: "girlfriend-experience-hamburg",
    title: "Girlfriend Experience Hamburg",
    shortLabel: "GFE",
    h1: "Girlfriend Experience Hamburg",
    tagline: "Vertrautheit, die selten geworden ist",
    description:
      "Die intimere, persönlichere Form der Begleitung – natürlich, herzlich, anwesend.",
    longCopy:
      "Die Girlfriend Experience steht für eine authentische, natürliche Verbundenheit, die jenseits formaler Begleitung beginnt. Eine entspannte Stunde im Café, ein Spaziergang an der Alster, ein vertrauter Abend zu Hause – mit jener seltenen Wärme, die sich nicht inszenieren lässt.",
    keypoints: [
      "Natürliche, herzliche Atmosphäre",
      "Persönliche, individuelle Chemie",
      "Geeignet für längere, ungezwungene Termine",
      "Diskretion und Verlässlichkeit",
    ],
    image:
      "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Girlfriend Experience Hamburg | Natürliche Nähe | Noir Hamburg",
    metaDescription:
      "Girlfriend Experience in Hamburg – die intimere, persönlichere Form der Premium-Begleitung. Authentisch, diskret, herzlich.",
  },
];

const LOCATIONS = [
  {
    slug: "hamburg",
    name: "Hamburg",
    title: "Escort Hamburg",
    intro: "Die Hansestadt – unsere Heimat. Zwischen Alster und Elbe verbinden wir Tradition und Weltgewandtheit.",
    description:
      "Hamburg ist das Tor zur Welt. Als Premium-Begleitagentur bewegen wir uns seit Jahren in den feinsten Kreisen der Stadt – von den eleganten Salons rund um die Binnenalster über die avantgardistische HafenCity bis zu den Villen an der Elbchaussee.",
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
    landmarks: ["Elbphilharmonie", "Vier Jahreszeiten", "Alster", "Speicherstadt"],
  },
  {
    slug: "st-pauli",
    name: "St. Pauli",
    title: "Escort St. Pauli",
    intro: "Das Viertel, das niemals schläft – kontrastreich, lebendig, ikonisch.",
    description:
      "St. Pauli ist Hamburgs Herzschlag. Hier treffen subkulturelle Lebendigkeit und feine Restaurants aufeinander, etwa im Clouds, mit Blick über den Hafen. Unsere Escorts begleiten Sie elegant durch dieses einzigartige Viertel.",
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
    landmarks: ["Reeperbahn", "Clouds", "Hafentreppe", "Bernhard-Nocht-Straße"],
  },
  {
    slug: "hafencity",
    name: "HafenCity",
    title: "Escort HafenCity",
    intro: "Hamburgs modernes Aushängeschild – Architektur, Wasser, Kultur.",
    description:
      "Die HafenCity ist ein urbanes Wunderwerk – mit der Elbphilharmonie als Kronjuwel. Hier begleiten wir Sie zu Konzerten, in die Sterneküche oder zum Spaziergang über die Magellan-Terrassen.",
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
    landmarks: ["Elbphilharmonie", "Magellan-Terrassen", "The Fontenay (nahe)", "Speicherstadt"],
  },
  {
    slug: "altona",
    name: "Altona",
    title: "Escort Altona",
    intro: "Großstädtisches Flair mit künstlerischer Seele.",
    description:
      "Altona vereint maritimen Charme, kreative Energie und exzellente Gastronomie. Unsere Escorts begleiten Sie zu den geschätztesten Adressen entlang der Elbchaussee.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Altonaer Balkon", "Fischmarkt", "Ottensen", "Elbchaussee"],
  },
  {
    slug: "winterhude",
    name: "Winterhude",
    title: "Escort Winterhude",
    intro: "Lebendiges Bürgertum, feine Gastronomie, Stadtparkidylle.",
    description:
      "Winterhude rund um den Mühlenkamp gilt als eines der charmantesten Quartiere Hamburgs. Cafés, Boutiquen, der Stadtpark – ein eleganter Rahmen für unbeschwerte Begleitstunden.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Mühlenkamp", "Stadtpark", "Goldbekkanal", "Sierichstraße"],
  },
  {
    slug: "eppendorf",
    name: "Eppendorf",
    title: "Escort Eppendorf",
    intro: "Akademisch geprägt, gediegen, gastronomisch hochkarätig.",
    description:
      "Eppendorf rund um den Eppendorfer Baum gilt als eine der wohlhabendsten Adressen Hamburgs. Hier begleiten wir Sie diskret durch ein Viertel klassischer Hanseatischer Eleganz.",
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Eppendorfer Baum", "Hayns Park", "Isebek-Kanal", "UKE"],
  },
  {
    slug: "blankenese",
    name: "Blankenese",
    title: "Escort Blankenese",
    intro: "Hamburgs maritime Riviera – Treppenviertel, Elbblick, Villen.",
    description:
      "Blankenese vereint Hanseatische Tradition und mediterrane Anmutung. Das Treppenviertel, der Strand am Elbufer und das Süllberg-Restaurant sind Klassiker für besondere Anlässe.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Süllberg", "Treppenviertel", "Strandweg", "Falkensteiner Ufer"],
  },
  {
    slug: "harvestehude",
    name: "Harvestehude",
    title: "Escort Harvestehude",
    intro: "Hamburgs feinste Adresse rund um die Außenalster.",
    description:
      "Harvestehude steht für Hanseatische Diskretion in Reinform. Konsulate, Privatkliniken, klassische Stadtvillen – ein gediegener Rahmen für anspruchsvolle Begleitung.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Außenalster", "Pöseldorf", "Mittelweg", "Krugkoppelbrücke"],
  },
  {
    slug: "barmbek",
    name: "Barmbek",
    title: "Escort Barmbek",
    intro: "Aufstrebend, urban, mit eigenem Charakter.",
    description:
      "Barmbek hat sich in den letzten Jahren zu einem lebhaften Quartier entwickelt – mit Restaurants, Bars und kultureller Vielfalt im Stadtpark-Umfeld.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Stadtpark", "Hartzlohplatz", "Museum der Arbeit", "Bramfelder Straße"],
  },
  {
    slug: "wandsbek",
    name: "Wandsbek",
    title: "Escort Wandsbek",
    intro: "Großstadtbezirk mit grünen Inseln.",
    description:
      "Wandsbek ist Hamburgs bevölkerungsstärkster Bezirk – mit eigenem urbanem Charme und gemütlichen Adressen abseits der Touristenpfade.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Quarrée", "Eichtalpark", "Marktplatz", "Wandsbeker Chaussee"],
  },
  {
    slug: "norderstedt",
    name: "Norderstedt",
    title: "Escort Norderstedt",
    intro: "Schleswig-Holsteins zweitgrößte Stadt – direkt vor den Toren Hamburgs.",
    description:
      "Norderstedt verbindet großstädtische Annehmlichkeiten mit ländlicher Ruhe. Unsere Escorts sind auf Anfrage gerne auch hier verfügbar.",
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["TriBühne", "Stadtpark Norderstedt", "Herold-Center"],
  },
  {
    slug: "pinneberg",
    name: "Pinneberg",
    title: "Escort Pinneberg",
    intro: "Kleinstädtische Eleganz im Hamburger Umland.",
    description:
      "Pinneberg gilt als eines der wohlhabenderen Umlandgebiete Hamburgs. Diskrete Begleitung auf Anfrage – mit besonderem Augenmerk auf Privatsphäre.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Drostei", "Fahltskamp", "Stadtmuseum"],
  },
  {
    slug: "reinbek",
    name: "Reinbek",
    title: "Escort Reinbek",
    intro: "Schloss-Charme an der Bille.",
    description:
      "Reinbek im Süden Hamburgs ist bekannt für sein Schloss und eine ruhige, gediegene Atmosphäre.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Schloss Reinbek", "Sachsenwald", "Mühlenredder"],
  },
  {
    slug: "ahrensburg",
    name: "Ahrensburg",
    title: "Escort Ahrensburg",
    intro: "Schloss, Park, Stille – die elegante Variante des Pendlerns.",
    description:
      "Ahrensburg ist eine der gefragtesten Adressen im Hamburger Speckgürtel. Wir vermitteln auf Anfrage mit besonderer Diskretion in dieser Gegend.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Schloss Ahrensburg", "Tunneltal", "Stormarnplatz"],
  },
  {
    slug: "wedel",
    name: "Wedel",
    title: "Escort Wedel",
    intro: "Elbblick mit Schiffsbegrüßungsanlage.",
    description:
      "Wedel ist bekannt für die Schiffsbegrüßungsanlage Willkomm-Höft und seine Lage direkt an der Elbe – ein malerischer Rahmen für besondere Begleitungen.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Willkomm-Höft", "Elbe", "Roland"],
  },
  {
    slug: "seevetal",
    name: "Seevetal",
    title: "Escort Seevetal",
    intro: "Niedersächsische Ruhe südlich der Elbe.",
    description:
      "Seevetal liegt in der Nordheide und ist von Hamburg aus schnell erreichbar – ländlich, ruhig, ideal für längere Besuche.",
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Seeve", "Karoxbosteler Heide", "Bullenhausen"],
  },
  {
    slug: "lueneburg",
    name: "Lüneburg",
    title: "Escort Lüneburg",
    intro: "Hansestadt mit Salz, Hopfen und mittelalterlichem Charme.",
    description:
      "Lüneburg ist eine der schönsten Hansestädte Norddeutschlands. Unsere Travel-Begleitung steht auf Anfrage gerne auch hier zur Verfügung.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Altstadt", "Wasserturm", "Kalkberg"],
  },
  {
    slug: "elmshorn",
    name: "Elmshorn",
    title: "Escort Elmshorn",
    intro: "Mittelzentrum mit großstädtischem Komfort.",
    description:
      "Elmshorn ist ein bedeutendes Mittelzentrum im Hamburger Umland und auf Anfrage Teil unseres Servicegebiets.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
    landmarks: ["Marktplatz", "Industriemuseum", "Steindamm"],
  },
];

const FAQS = [
  {
    q: "Wie verlässt sich Noir Hamburg auf Diskretion?",
    a: "Diskretion ist das Fundament unserer Arbeit. Alle Anfragen werden verschlüsselt verarbeitet, persönliche Daten werden ausschließlich für die Vermittlung genutzt und nach Abschluss eines Termins fachgerecht entfernt. Auf Wunsch arbeiten wir mit NDA-Standards.",
  },
  {
    q: "Wie erfolgt die Buchung?",
    a: "Eine Anfrage erfolgt am unkompliziertsten über unser Kontaktformular oder per WhatsApp. Nach kurzem Erstgespräch bestätigen wir Verfügbarkeit, Treffpunkt und alle relevanten Details. Erstbuchungen unterliegen einer kurzen Verifizierung.",
  },
  {
    q: "Welche Sprachen sprechen Ihre Models?",
    a: "Unsere Models sprechen ausnahmslos Deutsch und Englisch auf hohem Niveau, viele zusätzlich Französisch, Italienisch, Spanisch oder Russisch. Auf Anfrage stellen wir Models mit spezifischen Sprachkenntnissen zur Verfügung.",
  },
  {
    q: "Reisen Ihre Models auch international?",
    a: "Ja. Unsere Travel Companions sind international erfahren und stehen weltweit für Geschäfts- und Privatreisen zur Verfügung. Reisepässe, multilinguale Eloquenz und Vertrautheit mit internationalen Hospitalitätscodes sind selbstverständlich.",
  },
  {
    q: "Wie weit voraus sollte gebucht werden?",
    a: "Wir empfehlen eine Vorlaufzeit von mindestens 24 Stunden, gerne auch länger. Bei dringenden Anfragen versuchen wir, kurzfristige Lösungen zu finden – die Verfügbarkeit ist allerdings begrenzt.",
  },
  {
    q: "Welche Zahlungsmethoden akzeptieren Sie?",
    a: "Wir akzeptieren Bargeld in EUR oder Banküberweisung. Für Bestandskunden ist auf Anfrage auch eine Rechnungsstellung möglich. Alle Vereinbarungen werden vorab transparent kommuniziert.",
  },
];

const ADVANTAGES = [
  { title: "Sorgfältige Auswahl", text: "Jedes Model wird persönlich begleitet und nach klaren Qualitätskriterien aufgenommen." },
  { title: "Verbindliche Diskretion", text: "Datenschutz und Vertraulichkeit auf NDA-Niveau – für Sie und für uns selbstverständlich." },
  { title: "Persönliche Betreuung", text: "Ein fester Ansprechpartner – kein Callcenter, keine anonymen Abläufe." },
  { title: "Verlässliche Pünktlichkeit", text: "Termintreue und reibungsloser Ablauf sind das Mindeste, was wir versprechen." },
];

const BLOG_CATEGORIES = [
  "Luxury Lifestyle",
  "Hamburg Guide",
  "Hotels",
  "Restaurants",
  "Nightlife",
  "Business Travel",
  "Luxury Events",
  "Escort Advice",
  "Frequently Asked Questions",
  "Privacy",
  "Travel Tips",
];

module.exports = {
  BRAND,
  NAV,
  SERVICES,
  LOCATIONS,
  FAQS,
  ADVANTAGES,
  BLOG_CATEGORIES,
};
