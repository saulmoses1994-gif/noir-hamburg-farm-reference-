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
    title: "Luxury Escort Hamburg",
    shortLabel: "Luxury",
    h1: "Luxury Escort Hamburg",
    tagline: "Begleitung auf höchstem Niveau",
    taglineEn: "Companionship at the highest level",
    description:
      "Unsere Luxury Escorts verkörpern jene seltene Mischung aus Eleganz, Bildung und natürlichem Charme, die im hanseatischen Premiumsegment erwartet wird.",
    descriptionEn:
      "Our Luxury Escorts embody that rare blend of elegance, education and natural charm expected in Hamburg's premium segment.",
    longCopy:
      "Im exklusiven Luxussegment ist eine Begleitung mehr als ein Service – sie ist eine Erweiterung Ihrer Persönlichkeit. Unsere Luxury Escorts in Hamburg sind sorgfältig ausgewählte Persönlichkeiten mit akademischem Hintergrund, multilingualer Eloquenz und einer instinktiven Souveränität, mit der sie sich auf jedem Parkett bewegen – von der Galaeröffnung in der Elbphilharmonie bis zum diskreten Dinner im Vier Jahreszeiten.",
    longCopyEn:
      "In the exclusive luxury segment, companionship is more than a service — it is an extension of your personality. Our Luxury Escorts in Hamburg are carefully chosen individuals with academic backgrounds, multilingual eloquence and an instinctive poise that carries effortlessly across every setting — from a gala opening at the Elbphilharmonie to a discreet dinner at the Vier Jahreszeiten.",
    keypoints: [
      "Akademisch gebildete Persönlichkeiten",
      "Mehrsprachige Konversation auf hohem Niveau",
      "Garderobe von gehobener Eleganz",
      "Erfahrung in internationalen Kreisen",
    ],
    keypointsEn: [
      "Academically educated personalities",
      "Multilingual conversation at the highest level",
      "Wardrobe of refined elegance",
      "Experience moving in international circles",
    ],
    image:
      "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Luxury Escort Hamburg | Premium Begleitung | Noir Hamburg",
    metaTitleEn: "Luxury Escort Hamburg | Premium Companionship | Noir Hamburg",
    metaDescription:
      "Luxury Escort Hamburg – exklusive Begleitung auf höchstem Niveau für anspruchsvolle Herren. Akademisch, mehrsprachig, diskret.",
    metaDescriptionEn:
      "Luxury Escort Hamburg — exclusive premium companionship for discerning gentlemen. Academic, multilingual, discreet.",
  },
  {
    slug: "vip-escort-hamburg",
    title: "VIP Escort Hamburg",
    shortLabel: "VIP",
    h1: "VIP Escort Hamburg",
    tagline: "Diskretion auf höchster Stufe",
    taglineEn: "Discretion at its highest standard",
    description:
      "Für Persönlichkeiten von öffentlichem Rang. Maximale Vertraulichkeit, maximale Qualität.",
    descriptionEn:
      "For figures of public standing. Maximum confidentiality, maximum quality.",
    longCopy:
      "Unsere VIP-Begleitung richtet sich an Persönlichkeiten, deren Anonymität nicht verhandelbar ist. Speziell ausgewählte Models, die mit der Welt der Hochfinanz, Politik und internationalen Hospitalität vertraut sind und die jeweiligen Codes meisterlich beherrschen.",
    longCopyEn:
      "Our VIP companionship is designed for individuals whose anonymity is non-negotiable. Specially selected companions familiar with the world of high finance, politics and international hospitality, who master the unwritten codes of each.",
    keypoints: [
      "Maximale Diskretion durch NDA-Standards",
      "Erfahrung mit Persönlichkeiten von öffentlichem Rang",
      "Komplette Reise- und Veranstaltungsplanung",
      "Vermittlung in geschlossener Kommunikation",
    ],
    keypointsEn: [
      "Maximum discretion under NDA-grade standards",
      "Experience with public figures",
      "Full travel and event coordination",
      "Bookings handled via closed communication channels",
    ],
    image:
      "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "VIP Escort Hamburg | Diskrete Premium-Begleitung | Noir Hamburg",
    metaTitleEn: "VIP Escort Hamburg | Discreet Premium Companionship | Noir Hamburg",
    metaDescription:
      "VIP Escort Hamburg – höchste Diskretion und Premium-Begleitung für Persönlichkeiten mit besonderen Ansprüchen an Vertraulichkeit.",
    metaDescriptionEn:
      "VIP Escort Hamburg — the highest level of discretion and premium companionship for clients with extraordinary confidentiality requirements.",
  },
  {
    slug: "business-escort-hamburg",
    title: "Business Escort Hamburg",
    shortLabel: "Business",
    h1: "Business Escort Hamburg",
    tagline: "Souveränität im geschäftlichen Kontext",
    taglineEn: "Poise in the business context",
    description:
      "Begleitung für Geschäftsessen, Konferenzen, Empfänge und internationale Anlässe.",
    descriptionEn:
      "Companionship for business dinners, conferences, receptions and international occasions.",
    longCopy:
      "Im internationalen Geschäftsumfeld ist die richtige Begleitung ein subtiler Faktor des Erfolgs. Unsere Business Escorts verfügen über die rhetorische Bildung, das diplomatische Feingefühl und die kulturelle Versiertheit, die in solchen Kreisen erwartet werden.",
    longCopyEn:
      "In the international business environment, the right companion is a subtle factor in success. Our Business Escorts bring the rhetorical education, diplomatic sensitivity and cultural fluency expected in such circles.",
    keypoints: [
      "Wirtschaftliches und politisches Sachverständnis",
      "Mehrsprachigkeit auf Verhandlungsniveau",
      "Professioneller Dresscode (Business, Cocktail, Black-tie)",
      "Selbstverständnis als diskrete Partnerin",
    ],
    keypointsEn: [
      "Economic and political fluency",
      "Multilingual at negotiation level",
      "Professional dress code (business, cocktail, black tie)",
      "Self-image as a discreet partner",
    ],
    image:
      "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
    metaTitle: "Business Escort Hamburg | Geschäftsbegleitung | Noir Hamburg",
    metaTitleEn: "Business Escort Hamburg | Business Companionship | Noir Hamburg",
    metaDescription:
      "Business Escort Hamburg – stilsichere und gebildete Begleitung für Geschäftsessen, Empfänge und Konferenzen.",
    metaDescriptionEn:
      "Business Escort Hamburg — refined and well-educated companionship for business dinners, receptions and conferences.",
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
      "https://images.pexels.com/photos/11541194/pexels-photo-11541194.png?auto=compress&cs=tinysrgb&w=1600",
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
      "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
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
      "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
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
      "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
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
      "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
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
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
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
    image: "https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=1600",
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
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1515138692129-197a2c608cfd?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?auto=format&fit=crop&w=1600&q=85",
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
    image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?auto=format&fit=crop&w=1600&q=85",
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
  ADVANTAGES_EN,
  BLOG_CATEGORIES,
};
