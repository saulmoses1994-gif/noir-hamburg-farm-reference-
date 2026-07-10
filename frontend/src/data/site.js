// Noir Hamburg — Site-wide content data (DE + EN)
// CommonJS exports so this file is the single source of truth
// for both the React app (via Babel's import interop) AND the SSR server
// (which `require`s this file from Node). Do NOT add ES `export` syntax here.
//
// Every content object carries the original DE fields and `*En` variants for
// English. Renderers pick the variant based on the current `lang` ("de" | "en").

const BRAND = {
  name: "Noir Hamburg",
  tagline: "Premium Begleitagentur · Hamburg",
  taglineEn: "Premium Companion Agency · Hamburg",
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
    title: "Luxus Escort Hamburg",
    shortLabel: "Luxus",
    h1: "Luxus Escort Hamburg – Exklusive Begleitung auf höchstem Niveau",
    tagline: "Exklusive Begleitung auf höchstem Niveau",
    taglineEn: "Exclusive companionship at the highest level",
    description:
      "Luxus bedeutet mehr als nur ein exklusives Erscheinungsbild. Bei Noir Hamburg steht Luxus für Persönlichkeit, Stil, Diskretion und eine Begleitung, die perfekt zu Ihren individuellen Vorstellungen passt.",
    descriptionEn:
      "Luxury is more than an exclusive appearance. At Noir Hamburg, luxury stands for personality, style, discretion and companionship that fits your individual expectations perfectly.",
    longCopy:
      "Luxus bedeutet mehr als nur ein exklusives Erscheinungsbild. Bei Noir Hamburg steht Luxus für Persönlichkeit, Stil, Diskretion und eine Begleitung, die perfekt zu Ihren individuellen Vorstellungen passt. Unser Luxus Escort Service in Hamburg richtet sich an Kunden, die Wert auf Qualität, Eleganz und einen professionellen Ablauf legen. Ob ein besonderes Dinner, eine gesellschaftliche Veranstaltung, eine Geschäftsreise oder ein privater Anlass — Noir Hamburg bietet eine stilvolle Begleitung für besondere Momente.",
    longCopyEn:
      "Luxury is more than an exclusive appearance. At Noir Hamburg it stands for personality, style, discretion and companionship perfectly matched to your individual expectations. Our luxury escort service in Hamburg is for clients who value quality, elegance and a professional experience — whether a private dinner, a social event, a business trip or a private occasion.",
    keypoints: [
      "Diskrete Organisation",
      "Persönliche Betreuung",
      "Stilvolle Begleitung",
      "Zuverlässigkeit",
      "Individuelle Auswahl",
    ],
    keypointsEn: [
      "Discreet organisation",
      "Personal support",
      "Stylish companionship",
      "Reliability",
      "Individual selection",
    ],
    image:
      "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=78",
    metaTitle: "Luxus Escort Hamburg | Exklusive Premium Begleitung | Noir Hamburg",
    metaTitleEn: "Luxury Escort Hamburg | Exclusive Premium Companionship | Noir Hamburg",
    metaDescription:
      "Erleben Sie Luxus Escort Hamburg mit Noir Hamburg. Exklusive Begleitung, stilvolle Models und diskreter Premium Service für anspruchsvolle Kunden in Hamburg.",
    metaDescriptionEn:
      "Luxury Escort Hamburg — exclusive premium companionship for discerning gentlemen. Academic, multilingual, discreet.",
  },
  {
    slug: "vip-escort-hamburg",
    title: "VIP Escort Hamburg",
    shortLabel: "VIP",
    h1: "VIP Escort Hamburg – Exklusive Begleitung für besondere Ansprüche",
    tagline: "Exklusive Begleitung für besondere Ansprüche",
    taglineEn: "Exclusive companionship for exceptional standards",
    description:
      "VIP Escort Hamburg von Noir Hamburg — exklusive, elegante und diskrete Premium Begleitung für anspruchsvolle Kunden in Hamburg und Umgebung.",
    descriptionEn:
      "VIP Escort Hamburg from Noir Hamburg — exclusive, elegant and discreet premium companionship for discerning clients across Hamburg and its region.",
    longCopy:
      "VIP bedeutet mehr als Luxus – es steht für Individualität, Diskretion und einen Service, der sich an den persönlichen Vorstellungen des Kunden orientiert. Noir Hamburg bietet einen exklusiven VIP Escort Service in Hamburg für Kunden, die Wert auf Stil, Persönlichkeit und ein besonderes Erlebnis legen. Unsere Philosophie basiert auf Qualität, Vertrauen und einer individuellen Auswahl. Ob geschäftlicher Aufenthalt, exklusives Dinner, gesellschaftliche Veranstaltung oder privater Anlass – Noir Hamburg bietet eine Begleitung, die sich natürlich und elegant jeder Situation anpasst.",
    longCopyEn:
      "VIP means more than luxury — it stands for individuality, discretion and a service tailored to each client's personal expectations. Noir Hamburg offers an exclusive VIP escort service in Hamburg for clients who value style, personality and a truly special experience. Our philosophy is built on quality, trust and individual selection. Whether for a business stay, an exclusive dinner, a social event or a private occasion, Noir Hamburg arranges companionship that adapts naturally and elegantly to every situation.",
    keypoints: [
      "Premium Escort Service Hamburg",
      "Persönliche Beratung",
      "Diskrete Kommunikation",
      "Stilvolle Models",
      "Individuelle Auswahl",
      "Hamburg Spezialisierung",
      "Qualität statt Masse",
    ],
    keypointsEn: [
      "Premium escort service Hamburg",
      "Personal consultation",
      "Discreet communication",
      "Stylish companions",
      "Individual selection",
      "Dedicated Hamburg expertise",
      "Quality over quantity",
    ],
    image:
      "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=78",
    metaTitle: "VIP Escort Hamburg | Exklusive Premium Begleitung | Noir Hamburg",
    metaTitleEn: "VIP Escort Hamburg | Exclusive Premium Companionship | Noir Hamburg",
    metaDescription:
      "Erleben Sie VIP Escort Hamburg mit Noir Hamburg. Exklusive Begleitung, elegante Models und diskreter Premium Service für anspruchsvolle Kunden in Hamburg.",
    metaDescriptionEn:
      "Experience VIP Escort Hamburg with Noir Hamburg. Exclusive companionship, elegant companions and discreet premium service for discerning clients in Hamburg.",
  },
  {
    slug: "business-escort-hamburg",
    title: "Business Escort Hamburg",
    shortLabel: "Business",
    h1: "Business Escort Hamburg – Stilvolle Begleitung für geschäftliche Anlässe",
    tagline: "Stilvolle Begleitung für geschäftliche Anlässe",
    taglineEn: "Stylish companionship for professional occasions",
    description:
      "Business Escort Hamburg von Noir Hamburg — stilvolle, professionelle und diskrete Begleitung für Geschäftsreisen, Dinner und Veranstaltungen.",
    descriptionEn:
      "Business escort Hamburg from Noir Hamburg — stylish, professional and discreet companionship for business trips, dinners and events.",
    longCopy:
      "Hamburg ist eine internationale Wirtschaftsmetropole mit Geschäftsreisenden, Unternehmern und anspruchsvollen Besuchern aus aller Welt. Noir Hamburg bietet einen exklusiven Business Escort Service für Kunden, die eine stilvolle und diskrete Begleitung für geschäftliche oder gesellschaftliche Anlässe suchen. Eine professionelle Begleitung bedeutet mehr als Eleganz – Persönlichkeit, Kommunikation und ein natürliches Auftreten stehen im Mittelpunkt. Ob Geschäftsreise, Dinner, Veranstaltung oder privater Aufenthalt in Hamburg – unser Ziel ist eine Begleitung, die perfekt zum Anlass passt.",
    longCopyEn:
      "Hamburg is an international business hub welcoming travellers, entrepreneurs and discerning visitors from around the world. Noir Hamburg offers an exclusive business escort service for clients seeking a stylish and discreet companion for professional or social occasions. Professional companionship means more than elegance — personality, conversation and a natural presence take centre stage. Whether it's a business trip, a dinner, an event or a private stay in Hamburg, our aim is to arrange a companion who fits the occasion perfectly.",
    keypoints: [
      "Premium Service",
      "Persönliche Auswahl",
      "Diskrete Kommunikation",
      "Stilvolle Models",
      "Hamburg Spezialisierung",
      "Qualität vor Quantität",
    ],
    keypointsEn: [
      "Premium service",
      "Personal selection",
      "Discreet communication",
      "Stylish companions",
      "Dedicated Hamburg expertise",
      "Quality over quantity",
    ],
    image:
      "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1200&q=78",
    metaTitle: "Business Escort Hamburg | Exklusive Begleitung für Geschäftsreisen | Noir Hamburg",
    metaTitleEn: "Business Escort Hamburg | Exclusive Companionship for Business Travel | Noir Hamburg",
    metaDescription:
      "Professioneller Business Escort Hamburg mit Noir Hamburg. Stilvolle Begleitung für Geschäftsreisen, Business Dinner, Veranstaltungen und anspruchsvolle Kunden.",
    metaDescriptionEn:
      "Professional business escort Hamburg with Noir Hamburg. Stylish companionship for business trips, dinners, events and discerning clients.",
  },
  {
    slug: "dinner-companion-hamburg",
    title: "Dinner Companion Hamburg",
    shortLabel: "Dinner",
    h1: "Dinner Date Hamburg",
    tagline: "Konversation auf Sterneniveau",
    taglineEn: "Conversation at Michelin level",
    description:
      "Begleitung zu Dinners in Hamburgs feinsten Restaurants und Privatclubs.",
    descriptionEn:
      "Companionship for dinners at Hamburg's finest restaurants and private clubs.",
    longCopy:
      "Ein Abendessen ist die feinste aller gesellschaftlichen Künste. Unsere Dinner Companions begleiten Sie mit Eleganz, kulinarischem Verständnis und einer Konversation, die jedes Menü zur Erfahrung werden lässt – vom Haerlin bis zu privaten Tafelrunden.",
    longCopyEn:
      "A dinner is the most refined of all social arts. Our Dinner Companions accompany you with elegance, a genuine understanding of cuisine and a conversation that turns every menu into an experience — from Haerlin to private tables.",
    keypoints: [
      "Vertraut mit Hamburger Top-Gastronomie",
      "Stilvolle Garderobe für jeden Anlass",
      "Geschulte Konversation, Weinkunde, Etikette",
      "Diskrete Reservierungsmöglichkeiten",
    ],
    keypointsEn: [
      "Familiar with Hamburg's top-tier restaurants",
      "Stylish wardrobe for every occasion",
      "Trained in conversation, wine and etiquette",
      "Discreet reservation arrangements",
    ],
    image:
      "https://images.pexels.com/photos/11541194/pexels-photo-11541194.png?auto=compress&cs=tinysrgb&w=1200",
    metaTitle: "Dinner Date Hamburg | Stilvolle Abendbegleitung | Noir Hamburg",
    metaTitleEn: "Dinner Date Hamburg | Refined Evening Companionship | Noir Hamburg",
    metaDescription:
      "Dinner Date Hamburg – elegante Begleitung zu Restaurants und Privatclubs. Konversation, Stil und Diskretion auf Sterneniveau.",
    metaDescriptionEn:
      "Dinner Date Hamburg — elegant companionship for restaurants and private clubs. Conversation, style and discretion at Michelin level.",
  },
  {
    slug: "hotel-escort-hamburg",
    title: "Hotel Escort Hamburg",
    shortLabel: "Hotel",
    h1: "Hotel Escort Hamburg",
    tagline: "Diskrete Begleitung in 5★-Hotels",
    taglineEn: "Discreet companionship in 5-star hotels",
    description:
      "Wir kennen die feinsten Adressen und ihre diskreten Prozeduren.",
    descriptionEn:
      "We know the finest addresses and the discreet procedures they expect.",
    longCopy:
      "Vom Fairmont Vier Jahreszeiten über das Park Hyatt bis zum The Fontenay – unsere Models bewegen sich in den Lobbys und Suiten der Hamburger Premium-Hotellerie mit der Selbstverständlichkeit eines Stammgastes. Eintritte erfolgen stets diskret.",
    longCopyEn:
      "From the Fairmont Vier Jahreszeiten and the Park Hyatt to The Fontenay — our companions move through the lobbies and suites of Hamburg's premium hotels with the ease of a returning guest. Arrivals are always handled discreetly.",
    keypoints: [
      "Erfahrung mit Hamburgs 5-Sterne-Hotels",
      "Diskreter, professioneller Eintritt",
      "Reibungslose Abläufe, persönlicher Concierge-Kontakt",
      "Garderobe passend zum jeweiligen Haus",
    ],
    keypointsEn: [
      "Experienced with Hamburg's five-star hotels",
      "Discreet, professional arrivals",
      "Seamless coordination, personal concierge contacts",
      "Wardrobe suited to each individual property",
    ],
    image:
      "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=78",
    metaTitle: "Hotel Escort Hamburg | Diskrete 5★-Begleitung | Noir Hamburg",
    metaTitleEn: "Hotel Escort Hamburg | Discreet 5-Star Companionship | Noir Hamburg",
    metaDescription:
      "Hotel Escort Hamburg – Premium-Begleitung in den feinsten Häusern der Hansestadt. Diskret, stilvoll, zuverlässig.",
    metaDescriptionEn:
      "Hotel Escort Hamburg — premium companionship in the finest hotels of the Hanseatic city. Discreet, stylish, reliable.",
  },
  {
    slug: "event-escort-hamburg",
    title: "Event Escort Hamburg",
    shortLabel: "Event",
    h1: "Event Escort Hamburg",
    tagline: "Souveräne Präsenz auf jeder Bühne",
    taglineEn: "Confident presence in every setting",
    description:
      "Galas, Vernissagen, Empfänge, Premieren – Begleitung für die Hamburger Szene.",
    descriptionEn:
      "Galas, vernissages, receptions, premieres — companionship for the Hamburg scene.",
    longCopy:
      "Ob Reeperbahn Filmfestival, Premiere im Schauspielhaus oder Charity-Gala im Curio-Haus – unsere Event Escorts verstehen die jeweiligen Codes und repräsentieren Sie mit Selbstbewusstsein und Stil.",
    longCopyEn:
      "Whether it's the Reeperbahn Film Festival, a premiere at the Schauspielhaus or a charity gala at the Curio-Haus — our Event Escorts understand the codes of each occasion and represent you with confidence and style.",
    keypoints: [
      "Erfahrung mit Hamburger Gesellschaftsleben",
      "Garderobe vom Cocktailkleid bis zur Robe",
      "Charmant, aufmerksam, souverän",
      "Stilsichere Präsenz auf jedem Parkett",
    ],
    keypointsEn: [
      "Experienced with Hamburg's social calendar",
      "Wardrobe from cocktail dress to full-length gown",
      "Charming, attentive, composed",
      "Stylish presence on every stage",
    ],
    image:
      "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1200",
    metaTitle: "Event Escort Hamburg | Begleitung Galas & Empfänge | Noir Hamburg",
    metaTitleEn: "Event Escort Hamburg | Companionship for Galas & Receptions | Noir Hamburg",
    metaDescription:
      "Event Escort Hamburg – elegante Begleitung für Galas, Vernissagen und Empfänge. Stilvolle Präsenz, diskretes Auftreten.",
    metaDescriptionEn:
      "Event Escort Hamburg — elegant companionship for galas, vernissages and receptions. Stylish presence, discreet manner.",
  },
  {
    slug: "travel-companion-hamburg",
    title: "Travel Companion Hamburg",
    shortLabel: "Travel",
    h1: "Travel Companion Hamburg",
    tagline: "Begleitung weltweit – mit Hanseatischer Eleganz",
    taglineEn: "Worldwide companionship — with Hanseatic elegance",
    description:
      "Mehrtägige Reisen, internationale Trips, private Yacht-Reisen.",
    descriptionEn:
      "Multi-day journeys, international trips, private yacht travel.",
    longCopy:
      "Unsere Travel Companions begleiten Sie auf Geschäftsreisen, privaten Wochenenden und längeren Aufenthalten – von Sylt bis Saint-Tropez, von Zürich bis Dubai. Reisepass, multilinguale Eloquenz und Erfahrung im internationalen Reisen sind Selbstverständlichkeit.",
    longCopyEn:
      "Our Travel Companions accompany you on business trips, private weekends and longer stays — from Sylt to Saint-Tropez, from Zurich to Dubai. A valid passport, multilingual eloquence and experience with international travel are a given.",
    keypoints: [
      "International erfahren, weltweit verfügbar",
      "Gültiger Reisepass, multilingual",
      "Wochenend- und Mehrtagesreisen",
      "Yacht-, Ski-, und Stadt-Reisen",
    ],
    keypointsEn: [
      "Internationally experienced, available worldwide",
      "Valid passport, multilingual",
      "Weekend trips and multi-day stays",
      "Yacht, ski and city journeys",
    ],
    image:
      "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=78",
    metaTitle: "Travel Companion Hamburg | Reisebegleitung weltweit | Noir Hamburg",
    metaTitleEn: "Travel Companion Hamburg | Worldwide Travel Companionship | Noir Hamburg",
    metaDescription:
      "Travel Companion Hamburg – internationale Reisebegleitung mit Stil, Bildung und Diskretion. Yacht, Sylt, weltweit.",
    metaDescriptionEn:
      "Travel Companion Hamburg — international travel companionship with style, education and discretion. Yacht, Sylt, worldwide.",
  },
  {
    slug: "girlfriend-experience-hamburg",
    title: "Girlfriend Experience Hamburg",
    shortLabel: "GFE",
    h1: "Girlfriend Experience Hamburg",
    tagline: "Vertrautheit, die selten geworden ist",
    taglineEn: "An intimacy that has grown rare",
    description:
      "Die intimere, persönlichere Form der Begleitung – natürlich, herzlich, anwesend.",
    descriptionEn:
      "A more intimate, more personal form of companionship — natural, warm, fully present.",
    longCopy:
      "Die Girlfriend Experience steht für eine authentische, natürliche Verbundenheit, die jenseits formaler Begleitung beginnt. Eine entspannte Stunde im Café, ein Spaziergang an der Alster, ein vertrauter Abend zu Hause – mit jener seltenen Wärme, die sich nicht inszenieren lässt.",
    longCopyEn:
      "The Girlfriend Experience stands for an authentic, natural connection that begins where formal companionship ends. A relaxed hour at a café, a walk along the Alster, an intimate evening at home — with that rare warmth that cannot be performed.",
    keypoints: [
      "Natürliche, herzliche Atmosphäre",
      "Persönliche, individuelle Chemie",
      "Geeignet für längere, ungezwungene Termine",
      "Diskretion und Verlässlichkeit",
    ],
    keypointsEn: [
      "Natural, warm atmosphere",
      "Personal, individual chemistry",
      "Ideal for longer, relaxed engagements",
      "Discretion and reliability",
    ],
    image:
      "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1200&q=78",
    metaTitle: "Girlfriend Experience Hamburg | Natürliche Nähe | Noir Hamburg",
    metaTitleEn: "Girlfriend Experience Hamburg | Natural Intimacy | Noir Hamburg",
    metaDescription:
      "Girlfriend Experience in Hamburg – die intimere, persönlichere Form der Premium-Begleitung. Authentisch, diskret, herzlich.",
    metaDescriptionEn:
      "Girlfriend Experience in Hamburg — the more intimate, more personal form of premium companionship. Authentic, discreet, warm.",
  },
];

const LOCATIONS = [
  {
    slug: "hamburg",
    name: "Hamburg",
    title: "Escort Hamburg",
    intro: "Die Hansestadt – unsere Heimat. Zwischen Alster und Elbe verbinden wir Tradition und Weltgewandtheit.",
    introEn: "The Hanseatic city — our home. Between the Alster and the Elbe we blend tradition with worldliness.",
    description:
      "Hamburg ist das Tor zur Welt. Als Premium-Begleitagentur bewegen wir uns seit Jahren in den feinsten Kreisen der Stadt – von den eleganten Salons rund um die Binnenalster über die avantgardistische HafenCity bis zu den Villen an der Elbchaussee.",
    descriptionEn:
      "Hamburg is the gateway to the world. As a premium companion agency we have been moving in the finest circles of the city for years — from the elegant salons around the Binnenalster, through the avant-garde HafenCity, to the villas along the Elbchaussee.",
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1200",
    landmarks: ["Elbphilharmonie", "Vier Jahreszeiten", "Alster", "Speicherstadt"],
  },
  {
    slug: "st-pauli",
    name: "St. Pauli",
    title: "Escort St. Pauli",
    intro: "Das Viertel, das niemals schläft – kontrastreich, lebendig, ikonisch.",
    introEn: "The district that never sleeps — vivid, contrasting, iconic.",
    description:
      "St. Pauli ist Hamburgs Herzschlag. Hier treffen subkulturelle Lebendigkeit und feine Restaurants aufeinander, etwa im Clouds, mit Blick über den Hafen. Unsere Escorts begleiten Sie elegant durch dieses einzigartige Viertel.",
    descriptionEn:
      "St. Pauli is Hamburg's heartbeat. Here subcultural energy meets fine restaurants — at Clouds, for instance, with sweeping views over the harbour. Our companions guide you elegantly through this unique neighbourhood.",
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1200",
    landmarks: ["Reeperbahn", "Clouds", "Hafentreppe", "Bernhard-Nocht-Straße"],
  },
  {
    slug: "hafencity",
    name: "HafenCity",
    title: "Escort HafenCity",
    intro: "Hamburgs modernes Aushängeschild – Architektur, Wasser, Kultur.",
    introEn: "Hamburg's modern landmark — architecture, water, culture.",
    description:
      "Die HafenCity ist ein urbanes Wunderwerk – mit der Elbphilharmonie als Kronjuwel. Hier begleiten wir Sie zu Konzerten, in die Sterneküche oder zum Spaziergang über die Magellan-Terrassen.",
    descriptionEn:
      "HafenCity is an urban marvel — crowned by the Elbphilharmonie. We accompany you here to concerts, to Michelin-starred restaurants or for a walk across the Magellan Terraces.",
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1200",
    landmarks: ["Elbphilharmonie", "Magellan-Terrassen", "The Fontenay (nahe)", "Speicherstadt"],
  },
  {
    slug: "altona",
    name: "Altona",
    title: "Escort Altona",
    intro: "Großstädtisches Flair mit künstlerischer Seele.",
    introEn: "Metropolitan flair with an artistic soul.",
    description:
      "Altona vereint maritimen Charme, kreative Energie und exzellente Gastronomie. Unsere Escorts begleiten Sie zu den geschätztesten Adressen entlang der Elbchaussee.",
    descriptionEn:
      "Altona blends maritime charm, creative energy and outstanding gastronomy. Our companions accompany you to the most cherished addresses along the Elbchaussee.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Altonaer Balkon", "Fischmarkt", "Ottensen", "Elbchaussee"],
  },
  {
    slug: "winterhude",
    name: "Winterhude",
    title: "Escort Winterhude",
    intro: "Lebendiges Bürgertum, feine Gastronomie, Stadtparkidylle.",
    introEn: "A lively bourgeois quarter — fine dining, Stadtpark idyll.",
    description:
      "Winterhude rund um den Mühlenkamp gilt als eines der charmantesten Quartiere Hamburgs. Cafés, Boutiquen, der Stadtpark – ein eleganter Rahmen für unbeschwerte Begleitstunden.",
    descriptionEn:
      "Winterhude around Mühlenkamp is considered one of Hamburg's most charming neighbourhoods. Cafés, boutiques, the Stadtpark — an elegant setting for unhurried hours together.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Mühlenkamp", "Stadtpark", "Goldbekkanal", "Sierichstraße"],
  },
  {
    slug: "eppendorf",
    name: "Eppendorf",
    title: "Escort Eppendorf",
    intro: "Akademisch geprägt, gediegen, gastronomisch hochkarätig.",
    introEn: "Academic, distinguished, with exceptional dining.",
    description:
      "Eppendorf rund um den Eppendorfer Baum gilt als eine der wohlhabendsten Adressen Hamburgs. Hier begleiten wir Sie diskret durch ein Viertel klassischer Hanseatischer Eleganz.",
    descriptionEn:
      "Eppendorf around Eppendorfer Baum is one of Hamburg's most affluent addresses. Here we accompany you discreetly through a neighbourhood of classic Hanseatic elegance.",
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Eppendorfer Baum", "Hayns Park", "Isebek-Kanal", "UKE"],
  },
  {
    slug: "blankenese",
    name: "Blankenese",
    title: "Escort Blankenese",
    intro: "Hamburgs maritime Riviera – Treppenviertel, Elbblick, Villen.",
    introEn: "Hamburg's maritime Riviera — stairway quarter, Elbe views, villas.",
    description:
      "Blankenese vereint Hanseatische Tradition und mediterrane Anmutung. Das Treppenviertel, der Strand am Elbufer und das Süllberg-Restaurant sind Klassiker für besondere Anlässe.",
    descriptionEn:
      "Blankenese combines Hanseatic tradition with a Mediterranean feel. The stairway quarter, the Elbe beach and the Süllberg restaurant are classics for special occasions.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Süllberg", "Treppenviertel", "Strandweg", "Falkensteiner Ufer"],
  },
  {
    slug: "harvestehude",
    name: "Harvestehude",
    title: "Escort Harvestehude",
    intro: "Hamburgs feinste Adresse rund um die Außenalster.",
    introEn: "Hamburg's finest address along the Außenalster.",
    description:
      "Harvestehude steht für Hanseatische Diskretion in Reinform. Konsulate, Privatkliniken, klassische Stadtvillen – ein gediegener Rahmen für anspruchsvolle Begleitung.",
    descriptionEn:
      "Harvestehude is Hanseatic discretion in its purest form. Consulates, private clinics, classic townhouses — a distinguished setting for refined companionship.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Außenalster", "Pöseldorf", "Mittelweg", "Krugkoppelbrücke"],
  },
  {
    slug: "barmbek",
    name: "Barmbek",
    title: "Escort Barmbek",
    intro: "Aufstrebend, urban, mit eigenem Charakter.",
    introEn: "Up-and-coming, urban, with a character of its own.",
    description:
      "Barmbek hat sich in den letzten Jahren zu einem lebhaften Quartier entwickelt – mit Restaurants, Bars und kultureller Vielfalt im Stadtpark-Umfeld.",
    descriptionEn:
      "Barmbek has developed in recent years into a vibrant quarter — restaurants, bars and cultural breadth around the Stadtpark.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Stadtpark", "Hartzlohplatz", "Museum der Arbeit", "Bramfelder Straße"],
  },
  {
    slug: "wandsbek",
    name: "Wandsbek",
    title: "Escort Wandsbek",
    intro: "Großstadtbezirk mit grünen Inseln.",
    introEn: "A large urban district with islands of green.",
    description:
      "Wandsbek ist Hamburgs bevölkerungsstärkster Bezirk – mit eigenem urbanem Charme und gemütlichen Adressen abseits der Touristenpfade.",
    descriptionEn:
      "Wandsbek is Hamburg's most populous district — with its own urban charm and welcoming addresses well away from the tourist trail.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Quarrée", "Eichtalpark", "Marktplatz", "Wandsbeker Chaussee"],
  },
  {
    slug: "norderstedt",
    name: "Norderstedt",
    title: "Escort Norderstedt",
    intro: "Schleswig-Holsteins zweitgrößte Stadt – direkt vor den Toren Hamburgs.",
    introEn: "Schleswig-Holstein's second-largest city — right at Hamburg's doorstep.",
    description:
      "Norderstedt verbindet großstädtische Annehmlichkeiten mit ländlicher Ruhe. Unsere Escorts sind auf Anfrage gerne auch hier verfügbar.",
    descriptionEn:
      "Norderstedt combines metropolitan amenities with countryside calm. Our companions are available here on request.",
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["TriBühne", "Stadtpark Norderstedt", "Herold-Center"],
  },
  {
    slug: "pinneberg",
    name: "Pinneberg",
    title: "Escort Pinneberg",
    intro: "Kleinstädtische Eleganz im Hamburger Umland.",
    introEn: "Small-town elegance in the Hamburg region.",
    description:
      "Pinneberg gilt als eines der wohlhabenderen Umlandgebiete Hamburgs. Diskrete Begleitung auf Anfrage – mit besonderem Augenmerk auf Privatsphäre.",
    descriptionEn:
      "Pinneberg is considered one of the more affluent areas surrounding Hamburg. Discreet companionship on request, with particular attention to privacy.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Drostei", "Fahltskamp", "Stadtmuseum"],
  },
  {
    slug: "reinbek",
    name: "Reinbek",
    title: "Escort Reinbek",
    intro: "Schloss-Charme an der Bille.",
    introEn: "Castle charm on the Bille river.",
    description:
      "Reinbek im Süden Hamburgs ist bekannt für sein Schloss und eine ruhige, gediegene Atmosphäre.",
    descriptionEn:
      "Reinbek, south of Hamburg, is known for its castle and a calm, distinguished atmosphere.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Schloss Reinbek", "Sachsenwald", "Mühlenredder"],
  },
  {
    slug: "ahrensburg",
    name: "Ahrensburg",
    title: "Escort Ahrensburg",
    intro: "Schloss, Park, Stille – die elegante Variante des Pendlerns.",
    introEn: "Castle, park, silence — the elegant version of commuter living.",
    description:
      "Ahrensburg ist eine der gefragtesten Adressen im Hamburger Speckgürtel. Wir vermitteln auf Anfrage mit besonderer Diskretion in dieser Gegend.",
    descriptionEn:
      "Ahrensburg is one of the most sought-after addresses in the Hamburg commuter belt. We arrange bookings here with particular discretion.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Schloss Ahrensburg", "Tunneltal", "Stormarnplatz"],
  },
  {
    slug: "wedel",
    name: "Wedel",
    title: "Escort Wedel",
    intro: "Elbblick mit Schiffsbegrüßungsanlage.",
    introEn: "Elbe views with the famous ship-greeting station.",
    description:
      "Wedel ist bekannt für die Schiffsbegrüßungsanlage Willkomm-Höft und seine Lage direkt an der Elbe – ein malerischer Rahmen für besondere Begleitungen.",
    descriptionEn:
      "Wedel is known for its Willkomm-Höft ship-greeting station and its position directly on the Elbe — a picturesque setting for special engagements.",
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Willkomm-Höft", "Elbe", "Roland"],
  },
  {
    slug: "seevetal",
    name: "Seevetal",
    title: "Escort Seevetal",
    intro: "Niedersächsische Ruhe südlich der Elbe.",
    introEn: "Lower Saxon calm south of the Elbe.",
    description:
      "Seevetal liegt in der Nordheide und ist von Hamburg aus schnell erreichbar – ländlich, ruhig, ideal für längere Besuche.",
    descriptionEn:
      "Seevetal lies in the Nordheide and is quickly reached from Hamburg — rural, quiet, ideal for longer engagements.",
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Seeve", "Karoxbosteler Heide", "Bullenhausen"],
  },
  {
    slug: "lueneburg",
    name: "Lüneburg",
    title: "Escort Lüneburg",
    intro: "Hansestadt mit Salz, Hopfen und mittelalterlichem Charme.",
    introEn: "A Hanseatic city of salt, hops and medieval charm.",
    description:
      "Lüneburg ist eine der schönsten Hansestädte Norddeutschlands. Unsere Travel-Begleitung steht auf Anfrage gerne auch hier zur Verfügung.",
    descriptionEn:
      "Lüneburg is one of the most beautiful Hanseatic cities in northern Germany. Our travel companionship is available here on request.",
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Altstadt", "Wasserturm", "Kalkberg"],
  },
  {
    slug: "elmshorn",
    name: "Elmshorn",
    title: "Escort Elmshorn",
    intro: "Mittelzentrum mit großstädtischem Komfort.",
    introEn: "A regional centre with metropolitan comfort.",
    description:
      "Elmshorn ist ein bedeutendes Mittelzentrum im Hamburger Umland und auf Anfrage Teil unseres Servicegebiets.",
    descriptionEn:
      "Elmshorn is a significant regional centre near Hamburg and part of our service area on request.",
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1200&q=78",
    landmarks: ["Marktplatz", "Industriemuseum", "Steindamm"],
  },
];

const FAQS = [
  {
    q: "Wie verlässt sich Noir Hamburg auf Diskretion?",
    qEn: "How does Noir Hamburg ensure discretion?",
    a: "Diskretion ist das Fundament unserer Arbeit. Alle Anfragen werden verschlüsselt verarbeitet, persönliche Daten werden ausschließlich für die Vermittlung genutzt und nach Abschluss eines Termins fachgerecht entfernt. Auf Wunsch arbeiten wir mit NDA-Standards.",
    aEn: "Discretion is the foundation of our work. All enquiries are processed encrypted, personal data is used solely to coordinate the booking, and is securely deleted after the engagement ends. On request, we work to NDA-grade standards.",
  },
  {
    q: "Wie erfolgt die Buchung?",
    qEn: "How does booking work?",
    a: "Eine Anfrage erfolgt am unkompliziertsten über unser Kontaktformular oder per WhatsApp. Nach kurzem Erstgespräch bestätigen wir Verfügbarkeit, Treffpunkt und alle relevanten Details. Erstbuchungen unterliegen einer kurzen Verifizierung.",
    aEn: "The simplest way to enquire is via our contact form or WhatsApp. After a brief initial conversation we confirm availability, the meeting point and all relevant details. First-time bookings include a short verification step.",
  },
  {
    q: "Welche Sprachen sprechen Ihre Models?",
    qEn: "What languages do your companions speak?",
    a: "Unsere Models sprechen ausnahmslos Deutsch und Englisch auf hohem Niveau, viele zusätzlich Französisch, Italienisch, Spanisch oder Russisch. Auf Anfrage stellen wir Models mit spezifischen Sprachkenntnissen zur Verfügung.",
    aEn: "All of our companions speak German and English to a high standard, many also French, Italian, Spanish or Russian. On request we can arrange companions with specific language skills.",
  },
  {
    q: "Reisen Ihre Models auch international?",
    qEn: "Do your companions travel internationally?",
    a: "Ja. Unsere Travel Companions sind international erfahren und stehen weltweit für Geschäfts- und Privatreisen zur Verfügung. Reisepässe, multilinguale Eloquenz und Vertrautheit mit internationalen Hospitalitätscodes sind selbstverständlich.",
    aEn: "Yes. Our Travel Companions are internationally experienced and available worldwide for business and private trips. A valid passport, multilingual eloquence and familiarity with international hospitality codes are a given.",
  },
  {
    q: "Wie weit voraus sollte gebucht werden?",
    qEn: "How far in advance should I book?",
    a: "Wir empfehlen eine Vorlaufzeit von mindestens 24 Stunden, gerne auch länger. Bei dringenden Anfragen versuchen wir, kurzfristige Lösungen zu finden – die Verfügbarkeit ist allerdings begrenzt.",
    aEn: "We recommend a lead time of at least 24 hours, ideally longer. For urgent requests we will try to find a short-notice solution — though availability is limited.",
  },
  {
    q: "Welche Zahlungsmethoden akzeptieren Sie?",
    qEn: "Which payment methods do you accept?",
    a: "Wir akzeptieren Bargeld in EUR oder Banküberweisung. Für Bestandskunden ist auf Anfrage auch eine Rechnungsstellung möglich.",
    aEn: "We accept cash in EUR or bank transfer. For existing clients, invoicing is available on request.",
  },
];

const ADVANTAGES = [
  { title: "Sorgfältige Auswahl", text: "Jedes Model wird persönlich begleitet und nach klaren Qualitätskriterien aufgenommen." },
  { title: "Verbindliche Diskretion", text: "Datenschutz und Vertraulichkeit auf NDA-Niveau – für Sie und für uns selbstverständlich." },
  { title: "Persönliche Betreuung", text: "Ein fester Ansprechpartner – kein Callcenter, keine anonymen Abläufe." },
  { title: "Verlässliche Pünktlichkeit", text: "Termintreue und reibungsloser Ablauf sind das Mindeste, was wir versprechen." },
];

const ADVANTAGES_EN = [
  { title: "Careful Selection", text: "Every companion is personally onboarded and accepted only against clear quality criteria." },
  { title: "Binding Discretion", text: "Data protection and confidentiality at NDA level — natural to us, reassuring to you." },
  { title: "Personal Attention", text: "A single dedicated contact — no call centre, no anonymous processes." },
  { title: "Reliable Punctuality", text: "Reliability and smooth coordination are the minimum we promise." },
];

// SEO taxonomy — 10 defined categories. Each drives a filtered blog view and
// its own /api/sitemap.xml URL. Extend cautiously — new categories dilute
// authority. See Phase 2 spec.
const BLOG_CATEGORIES = [
  "Hamburg Lifestyle",
  "Luxury Lifestyle",
  "Hotels",
  "Restaurants",
  "Nightlife",
  "Business Travel",
  "Events",
  "Escort Advice",
  "Privacy & Discretion",
  "FAQ Guides",
];

module.exports = {
  BRAND,
  NAV,
  SERVICES,
  LOCATIONS,
  FAQS,
  ADVANTAGES,
  ADVANTAGES_EN,
  BLOG_CATEGORIES,
};
