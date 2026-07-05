// Noir Hamburg — Extended editorial content per Hamburg area.
// Provides additional body paragraphs and area-specific FAQs on top of the
// base LOCATIONS entry in `site.js`. Consumed by ssr/routes/areas.js (SSR)
// and src/pages/public/Areas.jsx (SPA).
//
// Generic FAQs are shared across all areas via `GENERIC_AREA_FAQS`.
// Area-specific additions live in `AREA_CONTENT[slug].faqs`.

// Generic FAQ items reused across all Hamburg area pages (localized).
// The `{name}` placeholder is replaced at render time with the area name.
const GENERIC_AREA_FAQS = [
  {
    q: "Sind Sie in {name} regelmäßig verfügbar?",
    qEn: "Are you regularly available in {name}?",
    a: "Ja. Noir Hamburg vermittelt kontinuierlich in {name} und den umliegenden Stadtteilen. Für Erstbuchungen empfehlen wir 24–48 Stunden Vorlauf, kurzfristige Termine sind je nach Verfügbarkeit möglich.",
    aEn: "Yes. Noir Hamburg continuously arranges bookings in {name} and the surrounding districts. For first bookings we recommend 24–48 hours' notice; short-notice engagements are possible subject to availability.",
  },
  {
    q: "Können Ihre Damen in Hotels und Privatadressen in {name} kommen?",
    qEn: "Can your companions visit hotels and private addresses in {name}?",
    a: "Selbstverständlich. Wir vermitteln sowohl in Hotels als auch zu privaten Adressen in {name} — diskret, pünktlich und ohne Nachfragen an der Rezeption.",
    aEn: "Naturally. We arrange bookings both in hotels and to private addresses in {name} — discreet, punctual and without any enquiry at reception.",
  },
  {
    q: "Wie diskret ist die Anfahrt nach {name}?",
    qEn: "How discreet is the arrival in {name}?",
    a: "Unsere Damen reisen anonym an, tragen keine sichtbare Werbung und verhalten sich in der Öffentlichkeit unauffällig. Auf Wunsch koordinieren wir Chauffeur oder Taxi.",
    aEn: "Our companions travel anonymously, carry no visible advertising and act unobtrusively in public. On request we coordinate a chauffeur or taxi.",
  },
];

// Area-specific extended content. Every entry provides 2 additional paragraphs
// of neighborhood-specific editorial copy (DE + EN) plus 1–2 unique FAQs.
const AREA_CONTENT = {
  hamburg: {
    bodyExtra: [
      "Als Herzstück unserer Vermittlung ist Hamburg selbst mehr als eine Stadt — es ist eine Haltung. Zwischen der klassizistischen Ruhe rund um die Binnenalster und der maritimen Weltläufigkeit der HafenCity finden wir für jeden Anlass den passenden Rahmen. Ob ein Dinner im Fairmont Vier Jahreszeiten, ein Konzert in der Elbphilharmonie oder ein privater Empfang in einer Villa an der Elbchaussee: unsere Escorts verstehen die feinen Codes der Hansestadt und bewegen sich darin selbstverständlich.",
      "Diese Selbstverständlichkeit ist nicht antrainiert. Viele unserer Damen sind in Hamburg aufgewachsen oder leben seit Jahren hier, kennen die Küche des Landhauses Scherrer ebenso wie das Angebot der Hamburger Kunsthalle. Für Sie bedeutet das: keine Rollenspiele, keine 'Show', sondern eine natürliche, hanseatisch zurückhaltende Präsenz, die selbst kritischen Beobachtern nicht als Buchung auffällt.",
    ],
    bodyExtraEn: [
      "As the heart of our matchmaking, Hamburg itself is more than a city — it is an attitude. Between the classical calm around the Binnenalster and the maritime worldliness of HafenCity we find the right setting for every occasion. Whether a dinner at the Fairmont Vier Jahreszeiten, a concert at the Elbphilharmonie or a private reception in a villa along the Elbchaussee: our escorts understand the subtle codes of the Hanseatic city and move within them effortlessly.",
      "This ease is not learned. Many of our ladies grew up in Hamburg or have lived here for years, know the kitchen of Landhaus Scherrer as well as the current programme at the Hamburger Kunsthalle. For you that means: no role-play, no 'show', but a natural, hanseatic-restrained presence that even critical observers do not read as a booking.",
    ],
  },
  "st-pauli": {
    bodyExtra: [
      "St. Pauli ist Hamburgs kompromisslosester Stadtteil. Zwischen Reeperbahn und Hafenkante wechselt die Atmosphäre stündlich — von subkultureller Rauheit zu feiner Küche im Clouds mit Panoramablick über die Elbe. Wer hier begleitet werden möchte, sucht selten das Etikette-Dinner. Er sucht Persönlichkeit, Unaufgeregtheit und die Fähigkeit, sich in unterschiedlichen Milieus wohl zu fühlen — von der Jazz-Bar bis zum Late-Night-Sushi.",
      "Unsere Damen für St. Pauli sind bewusst charakterstark: unaufgeregt, humorvoll und mit einer eigenen Meinung zu Musik, Kultur und der Stadt. Sie sind nicht die klassische Business-Begleitung — sie sind die passende Gefährtin für einen Abend jenseits der Routine.",
    ],
    bodyExtraEn: [
      "St. Pauli is Hamburg's most uncompromising district. Between the Reeperbahn and the harbour edge the atmosphere shifts by the hour — from subcultural rawness to fine dining at Clouds with panoramic views of the Elbe. Anyone seeking companionship here rarely wants a formal dinner. They want personality, ease and the ability to be comfortable in different milieus — from the jazz bar to late-night sushi.",
      "Our St. Pauli companions are deliberately strong in character: unfussed, humorous and with their own opinions on music, culture and the city. They are not the classic business companion — they are the right partner for an evening beyond routine.",
    ],
  },
  hafencity: {
    bodyExtra: [
      "Die HafenCity ist Hamburgs jüngstes Aushängeschild — Architektur, Wasser und Kultur auf engstem Raum. Unsere Escorts für die HafenCity begleiten Sie zu Konzerten in der Elbphilharmonie, zu Dinner-Reservierungen im The Table Kevin Fehling oder auf einen Spaziergang über die Magellan-Terrassen bei Sonnenuntergang.",
      "Für Gäste aus dem Fontenay-Hotel oder dem Hyatt Regency an den Landungsbrücken organisieren wir diskrete Anreise und die kurze Wegstrecke zwischen Hotel und Restaurant. Die HafenCity ist gepflastert und flach — Ihre Begleitung wählt entsprechend passende Schuhe.",
    ],
    bodyExtraEn: [
      "HafenCity is Hamburg's newest showcase — architecture, water and culture in close proximity. Our companions for HafenCity accompany you to concerts at the Elbphilharmonie, dinner reservations at The Table Kevin Fehling, or a sunset walk across the Magellan Terraces.",
      "For guests staying at The Fontenay or Hyatt Regency at Landungsbrücken we arrange discreet arrival and the short walk between hotel and restaurant. HafenCity is paved and level — your companion will choose appropriate footwear accordingly.",
    ],
  },
  eppendorf: {
    bodyExtra: [
      "Eppendorf gilt als eines der wohlhabendsten Viertel Hamburgs. Rund um den Eppendorfer Baum, den Klosterstern und die Erikastraße finden sich exzellente Restaurants, feine Boutiquen und die klassisch hanseatischen Altbauwohnungen. Die Klientel ist akademisch, kaufkraftstark und diskret — genau der Rahmen, in dem sich unsere Damen wie selbstverständlich bewegen.",
      "Für Termine in Eppendorf bevorzugen wir eine leichte Überkleidung: Blazer, gepflegtes Kleid, sicheres Schuhwerk. Es geht hier nicht um Show, sondern um eine natürliche Zugehörigkeit zum Stadtbild.",
    ],
    bodyExtraEn: [
      "Eppendorf is one of Hamburg's most affluent quarters. Around Eppendorfer Baum, Klosterstern and Erikastraße you find excellent restaurants, refined boutiques and the classic Hanseatic period apartments. The clientele is academic, well-off and discreet — precisely the setting in which our companions feel at home.",
      "For engagements in Eppendorf we prefer a light-formal look: blazer, a well-cut dress, secure footwear. It is not about show but about a natural belonging to the neighbourhood's image.",
    ],
  },
  winterhude: {
    bodyExtra: [
      "Winterhude rund um den Mühlenkamp und den Goldbekkanal gilt als eines der charmantesten Wohnquartiere Hamburgs. Cafés, Boutiquen und die Nähe zum Stadtpark schaffen einen entspannten, urbanen Rahmen — perfekt für einen längeren Nachmittag oder ein gemütliches Dinner in kleiner Runde.",
      "Für Sie bedeutet das: weniger inszeniert, mehr Natürlichkeit. Unsere Damen für Winterhude sind gesprächsstark, kultiviert und passen sich einem entspannten Rhythmus an. Ein Spaziergang durch den Stadtpark mit anschließendem Aperitif bei Witthüs am See ist ein Klassiker.",
    ],
    bodyExtraEn: [
      "Winterhude around Mühlenkamp and the Goldbek canal is one of Hamburg's most charming residential quarters. Cafés, boutiques and proximity to the Stadtpark create a relaxed, urban setting — perfect for a longer afternoon or a quiet dinner in a small circle.",
      "For you that means: less staged, more natural. Our Winterhude companions are conversational, cultivated, and comfortable with a relaxed rhythm. A walk through the Stadtpark followed by an aperitif at Witthüs am See is a classic.",
    ],
  },
  altona: {
    bodyExtra: [
      "Altona verbindet maritime Nostalgie mit kreativer Energie. Zwischen Ottensen, Fischmarkt und Elbchaussee finden sich exzellente Restaurants und eine kulturelle Vielfalt, die Hamburg selbst in feineren Kreisen manchmal fehlt. Unsere Damen für Altona sind vielseitig — sie können ebenso gut ein Sonntags-Brunch im Bullerei begleiten wie ein Dinner im Landhaus Scherrer.",
      "Die Nähe zur Elbe macht Spaziergänge am Elbstrand oder entlang des Altonaer Balkons zu einem stilvollen Auftakt. Für Sie: entspannte, ungezwungene Begleitung mit hanseatischer Note.",
    ],
    bodyExtraEn: [
      "Altona blends maritime nostalgia with creative energy. Between Ottensen, the Fischmarkt and the Elbchaussee you find excellent restaurants and a cultural breadth that even Hamburg's finer circles sometimes lack. Our Altona companions are versatile — equally at home accompanying you to Sunday brunch at Bullerei or dinner at Landhaus Scherrer.",
      "The proximity to the Elbe makes walks along the Elbstrand or the Altonaer Balkon a stylish prelude. For you: relaxed, unforced companionship with a Hanseatic note.",
    ],
  },
  blankenese: {
    bodyExtra: [
      "Blankenese ist Hamburgs maritime Riviera. Das Treppenviertel mit seinen historischen Kapitänsvillen, der Strand am Elbufer und der Süllberg mit seinem Sterne-Restaurant machen den Stadtteil zu einer der begehrtesten Adressen der Stadt. Für einen Ausflug an einem sonnigen Nachmittag oder ein sechs Gänge Menü mit Elbblick: hier finden Sie den passenden Rahmen.",
      "Unsere Damen für Blankenese sind auf diese anspruchsvolle Kulisse eingestellt: Kleid und Schuhwerk sind für den kopfsteinpflaster-lastigen Weg durchs Treppenviertel gewählt, das Gespräch fließt zwischen Kunst, Segeln und den Klassikern der Hamburger Reederdynastien.",
    ],
    bodyExtraEn: [
      "Blankenese is Hamburg's maritime Riviera. The stairway quarter with its historic captains' villas, the beach along the Elbe and the Süllberg with its Michelin-starred restaurant make the district one of the city's most sought-after addresses. For an afternoon outing on a sunny day or a six-course menu with a view of the Elbe: here you find the right setting.",
      "Our Blankenese companions are attuned to this demanding backdrop: attire and footwear are chosen for the cobblestone path through the stairway quarter, and conversation flows from art through sailing to the classics of Hamburg's shipping dynasties.",
    ],
  },
  harvestehude: {
    bodyExtra: [
      "Harvestehude, an der Außenalster gelegen, ist Hamburgs diskreteste feine Adresse. Konsulate, Privatkliniken und klassische Stadtvillen prägen das Straßenbild. Es ist die Wohngegend der stillen Eliten — und genau in diesem Kontext sind unsere Damen vertraut. Sie kennen die Nachbarschaft, die richtigen Ansprechpartner an der Rezeption und die dezent gehaltenen Restaurants in der Umgebung.",
      "Für private Termine in Harvestehude organisieren wir auf Wunsch die Anreise per Chauffeur und stellen sicher, dass Ihre Begleitung diskret am Nebeneingang eintrifft. Für die Alster-Runde nachmittags bringen wir passende Schuhe und dezente Sportbekleidung mit.",
    ],
    bodyExtraEn: [
      "Harvestehude, located on the Außenalster, is Hamburg's most discreet fine address. Consulates, private clinics and classic townhouses shape the streetscape. It is the residential quarter of the quiet elite — and precisely in this context our companions are at ease. They know the neighbourhood, the right people at reception and the understated restaurants nearby.",
      "For private engagements in Harvestehude we arrange chauffeur transport on request and ensure your companion arrives discreetly at the side entrance. For an afternoon walk around the Alster we bring appropriate shoes and understated sportswear.",
    ],
  },
  barmbek: {
    bodyExtra: [
      "Barmbek hat sich in den letzten Jahren zu einem lebhaften urbanen Quartier entwickelt. Restaurants, Bars und kleine Kunstgalerien rund um den Stadtpark schaffen eine lockere, junge Atmosphäre. Für Sie bedeutet das: eine Begleitung, die entspannt agiert, in einem informellen Rahmen ebenso souverän wirkt wie in Restaurants höherer Preisklasse.",
      "Unsere Damen für Barmbek sind spontan, offen und lebensfroh — perfekt für einen ungezwungenen Abend in einer Weinbar oder ein Bar-Hopping in der Umgebung.",
    ],
    bodyExtraEn: [
      "Barmbek has developed in recent years into a lively urban quarter. Restaurants, bars and small art galleries around the Stadtpark create a relaxed, young atmosphere. For you that means: a companion who operates at ease, equally poised in an informal setting as in higher-priced restaurants.",
      "Our Barmbek companions are spontaneous, open and joyful — perfect for a casual evening in a wine bar or bar-hopping around the neighbourhood.",
    ],
  },
  wandsbek: {
    bodyExtra: [
      "Wandsbek als Hamburgs bevölkerungsstärkster Bezirk vereint großstädtische Vielfalt mit ruhigen Wohngebieten. Vom Quarrée-Zentrum über den Eichtalpark bis zu den Ausläufern nach Rahlstedt und Bramfeld bieten wir Vermittlung in einem breiten Umfeld. Diskrete Termine in Wandsbek erfolgen häufig als Outcall zu privaten Adressen.",
      "Für Kunden aus dem Wandsbek-Umland ist Wandsbek ein pragmatischer Treffpunkt: Zentrale Lage, gute Verkehrsanbindung, Anonymität einer Großstadt. Unsere Damen kommen pünktlich, diskret und mit dezenter Erscheinung.",
    ],
    bodyExtraEn: [
      "Wandsbek, Hamburg's most populous district, combines big-city diversity with quiet residential areas. From the Quarrée centre through Eichtalpark to the fringes toward Rahlstedt and Bramfeld we arrange bookings across a broad radius. Discreet engagements in Wandsbek most often take place as outcall to private addresses.",
      "For clients in the Wandsbek periphery, Wandsbek is a pragmatic meeting point: central location, good transport, big-city anonymity. Our companions arrive punctually, discreetly and understated.",
    ],
  },
  norderstedt: {
    bodyExtra: [
      "Norderstedt liegt direkt vor den Toren Hamburgs und verbindet ruhige Wohnlagen mit guter Anbindung an die Hansestadt. Wir vermitteln auf Anfrage regelmäßig hier — häufig als Outcall zu privaten Adressen oder Hotels entlang der A7. Für Business-Reisende, die im Hamburger Norden übernachten, ist Norderstedt eine praktische Alternative zur Innenstadt.",
      "Unsere Damen kommen pünktlich, mit dezenter Anreise und ohne Aufsehen zu erregen. Für längere Termine empfehlen wir eine Vorlaufzeit von 24 Stunden.",
    ],
    bodyExtraEn: [
      "Norderstedt lies just at Hamburg's northern gate and combines quiet residential areas with strong links to the Hanseatic city. We regularly arrange bookings here on request — often as outcall to private addresses or hotels along the A7. For business travellers staying in northern Hamburg, Norderstedt is a practical alternative to the city centre.",
      "Our companions arrive punctually, discreetly and without drawing attention. For longer engagements we recommend 24 hours of lead time.",
    ],
  },
  pinneberg: {
    bodyExtra: [
      "Pinneberg gilt als eines der wohlhabenderen Umlandgebiete Hamburgs. Wir vermitteln hier diskret und häufig zu privaten Adressen. Für einen ruhigen Nachmittag in der Drostei oder einen Restaurant-Abend im nahegelegenen Wedel bieten wir passende Begleitung.",
      "Unsere Damen sind mit der ländlicheren Prägung des Umlands vertraut und passen Kleidung und Auftreten entsprechend an. Anreise per Chauffeur oder eigenem Wagen — wir stimmen die Details vorher ab.",
    ],
    bodyExtraEn: [
      "Pinneberg is one of Hamburg's more affluent surrounding areas. We arrange bookings here discreetly and often to private addresses. For a quiet afternoon at the Drostei or a restaurant evening in nearby Wedel, we provide suitable companionship.",
      "Our companions are familiar with the more rural character of the surrounding region and adapt attire and demeanour accordingly. Arrival by chauffeur or private car — we clarify details beforehand.",
    ],
  },
  reinbek: {
    bodyExtra: [
      "Reinbek im Süden Hamburgs ist bekannt für sein Schloss und eine ruhige, gediegene Atmosphäre. Wir vermitteln hier auf Anfrage in privaten Rahmen oder für Dinner in den kleinen, feinen Adressen der Umgebung.",
      "Für Kunden mit Wohnsitz in Reinbek oder Umgebung bieten wir eine besonders diskrete Anreise per Chauffeur. Kein Aufsehen, keine Nachfragen.",
    ],
    bodyExtraEn: [
      "Reinbek, south of Hamburg, is known for its castle and a calm, distinguished atmosphere. On request we arrange bookings here in private settings or for dinners at the small, refined addresses in the area.",
      "For clients residing in Reinbek or the surrounding area we offer a particularly discreet chauffeur arrival. No fuss, no enquiries.",
    ],
  },
  ahrensburg: {
    bodyExtra: [
      "Ahrensburg zählt zu den gefragtesten Adressen des Hamburger Speckgürtels. Rund um das barocke Schloss und den umgebenden Park entstand über Jahrhunderte eine Wohnlage von hanseatischer Prägung — ruhig, wohlhabend, diskret. Wir vermitteln hier mit besonderer Sorgfalt und häufig für Bestandskunden.",
      "Für Termine in Ahrensburg empfehlen wir Outcall zu privaten Adressen. Öffentliche Restaurants sind selbstverständlich möglich, werden aber aus Diskretionsgründen selten gewählt.",
    ],
    bodyExtraEn: [
      "Ahrensburg is among the most sought-after addresses in the Hamburg commuter belt. Around the baroque castle and its surrounding park an area of Hanseatic character developed over centuries — quiet, prosperous, discreet. We arrange bookings here with particular care and often for long-standing clients.",
      "For engagements in Ahrensburg we recommend outcall to private addresses. Public restaurants are of course possible but are rarely chosen for reasons of discretion.",
    ],
  },
  wedel: {
    bodyExtra: [
      "Wedel liegt direkt an der Elbe, bekannt für die Schiffsbegrüßungsanlage Willkomm-Höft. Der maritim geprägte Ort bietet einen malerischen Rahmen für besondere Begleitungen — ein Spaziergang am Elbufer, ein Dinner mit Blick auf die vorbeifahrenden Container-Riesen.",
      "Unsere Damen kommen auf Wunsch mit sicherem Schuhwerk für den Elbstrand und passen die Kleidung dem maritimen Rahmen an. Anreise per Chauffeur ab Hamburg-Zentrum ist die diskreteste Option.",
    ],
    bodyExtraEn: [
      "Wedel lies directly on the Elbe, known for the Willkomm-Höft ship-greeting station. The maritime town offers a picturesque setting for special engagements — a walk along the Elbe shore, a dinner overlooking the passing container giants.",
      "Our companions arrive on request with secure footwear for the Elbstrand and adapt attire to the maritime setting. Chauffeur transport from central Hamburg is the most discreet option.",
    ],
  },
  seevetal: {
    bodyExtra: [
      "Seevetal liegt in der Nordheide, südlich der Elbe. Von Hamburg aus schnell erreichbar, aber ländlich ruhig, bietet der Ort einen abgeschiedenen Rahmen für längere Termine. Wir vermitteln hier auf Anfrage — häufig für Wochenendaufenthalte in privaten Anwesen.",
      "Für Termine in Seevetal empfehlen wir eine Vorlaufzeit von 48 Stunden. Anreise per Chauffeur, um Diskretion zu wahren.",
    ],
    bodyExtraEn: [
      "Seevetal lies in the Nordheide, south of the Elbe. Quickly reached from Hamburg yet rurally quiet, the town offers a secluded setting for longer engagements. We arrange bookings here on request — often for weekend stays at private estates.",
      "For engagements in Seevetal we recommend 48 hours' notice. Arrival by chauffeur to preserve discretion.",
    ],
  },
  lueneburg: {
    bodyExtra: [
      "Lüneburg ist eine der schönsten Hansestädte Norddeutschlands. Die mittelalterliche Altstadt mit dem Wasserturm, dem Kalkberg und den historischen Salzspeichern bietet einen einzigartigen Rahmen für einen kulturell geprägten Wochenendaufenthalt. Unsere Travel-Begleitung steht hier auf Anfrage zur Verfügung.",
      "Für einen zweitägigen Aufenthalt in Lüneburg mit Übernachtung im Bergström Hotel oder dem privaten Rahmen einer historischen Villa vermitteln wir Damen mit Sinn für Geschichte und ruhige, kultivierte Gespräche.",
    ],
    bodyExtraEn: [
      "Lüneburg is one of the most beautiful Hanseatic cities in northern Germany. The medieval old town with its water tower, Kalkberg and historic salt warehouses offers a unique setting for a culturally rich weekend stay. Our travel companionship is available here on request.",
      "For a two-day stay in Lüneburg with an overnight at the Bergström Hotel or in the private setting of a historic villa, we arrange companions with a sense of history and a taste for calm, cultivated conversation.",
    ],
  },
  elmshorn: {
    bodyExtra: [
      "Elmshorn ist ein bedeutendes Mittelzentrum im Hamburger Umland und Teil unseres Servicegebiets. Vom Marktplatz bis zum Industriemuseum bietet die Stadt eine überschaubare, ruhige Kulisse — häufig sind Termine hier private Outcalls.",
      "Für Kunden mit Wohnsitz in Elmshorn oder Umland empfehlen wir eine Vorlaufzeit von 24 Stunden. Unsere Damen reisen diskret an, keine Anrufe an der Rezeption.",
    ],
    bodyExtraEn: [
      "Elmshorn is a significant regional centre near Hamburg and part of our service area. From the market square to the industrial museum, the town offers a manageable, calm backdrop — engagements here are often private outcalls.",
      "For clients residing in Elmshorn or the surrounding area we recommend 24 hours' notice. Our companions arrive discreetly, no calls at reception.",
    ],
  },
};

module.exports = { AREA_CONTENT, GENERIC_AREA_FAQS };
