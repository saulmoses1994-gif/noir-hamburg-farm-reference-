// Fallback rich prose for /ueber-uns + /en/about when
// site_settings.about_content(_en) is empty. Verbatim from the reference SPA.
// Rendered via dangerouslySetInnerHTML inside a .prose-noir container.

export const ABOUT_DEFAULT_HTML_DE = `
<p>Noir Hamburg ist keine Agentur im klassischen Sinne. Wir sind eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen – auf beiden Seiten der Begegnung.</p>
<p>Gegründet 2025 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet, die ihre Privatsphäre ebenso schätzen wie die Qualität ihrer Begegnungen.</p>
<p>Unsere Models sind keine zufällig gewählten Profile. Jede Persönlichkeit wird in einem persönlichen Gespräch aufgenommen und genießt unser uneingeschränktes Vertrauen. Wir arbeiten ausnahmslos mit Menschen zusammen, die ihre Tätigkeit selbstbestimmt und mit Stolz ausüben.</p>

<h2>Eine hanseatische Institution seit 2025</h2>
<p>Noir Hamburg entstand aus einer einfachen Beobachtung: In einer Stadt mit dem kulturellen und wirtschaftlichen Rang Hamburgs fehlte eine <strong>Begleitagentur mit hanseatischen Standards</strong>. Zu viele Vermittlungen waren anonym, industriell, austauschbar. Zu wenig Beratung, zu wenig Persönlichkeit, zu viel Kompromiss bei der Auswahl. Wir gründeten unsere Agentur, um genau das Gegenteil zu tun.</p>
<p>In den ersten Jahren begleiteten wir zwei bis drei Damen — alle persönliche Bekannte, alle mit der stillen Souveränität, die diese Arbeit erst zu einer Kunst macht. Über die Zeit ist unser Kreis auf vierzehn Damen und ein festes Netzwerk internationaler Kolleginnen gewachsen. Was sich <strong>nicht</strong> geändert hat: dass wir jede Dame persönlich kennen und ihr uneingeschränkt vertrauen.</p>

<h2>Was uns von einer klassischen Agentur unterscheidet</h2>
<p>Wir vermitteln keine Stunden — wir vermitteln <strong>Abende</strong>. Ein guter Abend beginnt lange bevor die Dame Ihr Hotel betritt: bei der Auswahl der passenden Persönlichkeit, bei der Beratung zu Restaurant und Kleidung, bei der ruhigen Klärung aller Erwartungen. Wenn diese Vorarbeit stimmt, braucht der Abend selbst kaum noch Regie. Er läuft von selbst — das ist unser Ideal.</p>
<p>Deshalb funktionieren wir bewusst nicht nach dem Prinzip „möglichst viele Buchungen möglichst schnell“. Wir nehmen uns Zeit für die Beratung, empfehlen aktiv gegen unpassende Anfragen und sagen „nein“, wenn eine Buchung uns oder unserer Dame nicht dienlich ist. Diese Zurückhaltung ist das eigentliche Fundament unseres Rufs.</p>

<h2>Die Auswahl unserer Damen</h2>
<p>Bevor eine Dame auf Noir Hamburg erscheint, treffen wir sie mindestens zwei Mal persönlich. Beim ersten Gespräch klären wir Beweggründe, Erwartungen und Lebenssituation. Beim zweiten — meist gemeinsam bei einem entspannten Abendessen — beobachten wir das, was sich im Formular nie erfassen lässt: <strong>wie sie sich in der Öffentlichkeit bewegt</strong>, wie sie mit Personal umgeht, wie sie ein Gespräch führt.</p>
<p>Fachliche Kriterien — Bildung, Sprachen, gepflegte Erscheinung — sind selbstverständlich. Aber sie sind nicht das Wesentliche. Das Wesentliche ist die <strong>stille Selbstverständlichkeit</strong>, mit der eine Dame in einem Sternerestaurant sitzt, ein Kunstwerk deutet oder mit einem CEO über internationale Politik spricht. Diese Selbstverständlichkeit lässt sich nicht trainieren — sie ist da oder nicht.</p>

<h2>Diskretion in der täglichen Praxis</h2>
<p>Diskretion ist bei uns nicht ein Versprechen auf einer Website — sie ist ein System aus vielen kleinen, konsequent umgesetzten Regeln. Kommunikation läuft verschlüsselt. Kontaktdaten sind nur zwei Personen in unserem Team zugänglich. Rechnungen tragen neutrale Bezeichnungen. Modelnamen sind Künstlernamen; die bürgerliche Identität kennen nur wir. Auf Wunsch arbeiten wir mit von unserem Anwalt vorbereiteten <strong>NDAs</strong> auf Deutsch und Englisch.</p>
<p>Für Kunden aus dem öffentlichen Leben — Vorstände, Sportler, Kulturschaffende — treffen wir zusätzliche Vorkehrungen: separate Telefonleitungen, verzögerte Rückrufe an neutralen Standorten, keine schriftlichen Bestätigungen mit vollem Namen.</p>

<h2>Für wen wir arbeiten</h2>
<p>Unsere Kunden sind Unternehmerinnen und Unternehmer, Anwältinnen, Ärzte, Kreative, internationale Geschäftsreisende. Was sie eint, ist selten das Einkommen — es ist die <strong>Erwartung an Verlässlichkeit, Diskretion und Kultiviertheit</strong>. Sie erwarten nicht das größte Modelportfolio; sie erwarten die passende Begleitung für einen konkreten Abend.</p>
<p>Ein wesentlicher Teil unserer Anfragen kommt heute über Empfehlungen bestehender Kunden. Das ist das größte Kompliment, das eine Agentur wie unsere sich wünschen kann.</p>
`.trim()

export const ABOUT_DEFAULT_HTML_EN = `
<p>Noir Hamburg is not an agency in the classical sense. We are a small, curated platform for people who share a refined aesthetic sensibility, intellectual curiosity and a clear understanding of discretion — on both sides of the encounter.</p>
<p>Founded in Hamburg in 2025, we have built a reputation as a reliable intermediary for discerning clients who value their privacy as much as the quality of their encounters.</p>
<p>Our companions are not randomly chosen profiles. Every personality is onboarded through a personal conversation and enjoys our unconditional trust. We work exclusively with people who pursue this profession self-determined and with pride.</p>

<h2>A hanseatic institution since 2025</h2>
<p>Noir Hamburg emerged from a simple observation: in a city of Hamburg's cultural and economic stature, there was no <strong>companion agency with hanseatic standards</strong>. Too many introductions were anonymous, industrial, interchangeable. Too little counsel, too little personality, too much compromise in the selection. We founded our agency to do precisely the opposite.</p>
<p>In the early years we represented two or three ladies — all personal acquaintances, all with the quiet sovereignty that turns this work into an art. Over time our circle has grown to fourteen ladies and a network of international colleagues. What has <strong>not</strong> changed is that we know every lady personally and trust her unconditionally.</p>

<h2>What sets us apart from a classical agency</h2>
<p>We do not sell hours — we sell <strong>evenings</strong>. A good evening starts long before the lady enters your hotel: in the selection of the right personality, in advising on restaurant and dress, in the calm clarification of expectations. When this preparation is right, the evening itself barely needs direction. It runs by itself — that is our ideal.</p>
<p>We deliberately do not operate on the principle of "as many bookings as fast as possible". We take our time for consultation, actively recommend against unsuitable requests and say "no" when a booking would not serve us or our lady. This restraint is the actual foundation of our reputation.</p>

<h2>How we select our ladies</h2>
<p>Before a lady appears on Noir Hamburg we meet her at least twice in person. In the first conversation we clarify motives, expectations and circumstances. In the second — usually over a relaxed dinner — we observe what a form can never capture: <strong>how she moves in public</strong>, how she treats staff, how she holds a conversation.</p>
<p>Professional criteria — education, languages, groomed appearance — go without saying. But they are not the essence. The essence is the <strong>quiet self-assurance</strong> with which a lady sits in a star-rated restaurant, interprets a work of art or discusses international politics with a CEO. That self-assurance cannot be trained — it is there or it is not.</p>

<h2>Discretion in daily practice</h2>
<p>For us discretion is not a promise on a website — it is a system of many small, consistently applied rules. Communication runs encrypted. Contact details are accessible only to two people on our team. Invoices carry neutral descriptors. Companion names are stage names; only we know the civil identity. On request we work with <strong>NDAs</strong> in German and English, prepared by our lawyer.</p>
<p>For clients from public life — executives, athletes, cultural figures — we take additional precautions: separate phone lines, delayed callbacks from neutral locations, no written confirmations with full names.</p>

<h2>Who we work for</h2>
<p>Our clients are entrepreneurs, lawyers, physicians, creatives, international business travellers. What unites them is rarely income — it is the <strong>expectation of reliability, discretion and cultivation</strong>. They do not expect the largest model portfolio; they expect the right companion for a specific evening.</p>
<p>A significant share of our enquiries today come through referrals from existing clients — the greatest compliment an agency like ours could wish for.</p>
`.trim()

export const ADVANTAGES_DE = [
  { title: 'Sorgf\u00e4ltige Auswahl', text: 'Jedes Model wird pers\u00f6nlich begleitet und nach klaren Qualit\u00e4tskriterien aufgenommen.' },
  { title: 'Verbindliche Diskretion', text: 'Datenschutz und Vertraulichkeit auf NDA-Niveau \u2013 f\u00fcr Sie und f\u00fcr uns selbstverst\u00e4ndlich.' },
  { title: 'Pers\u00f6nliche Betreuung', text: 'Ein fester Ansprechpartner \u2013 kein Callcenter, keine anonymen Abl\u00e4ufe.' },
  { title: 'Verl\u00e4ssliche P\u00fcnktlichkeit', text: 'Termintreue und reibungsloser Ablauf sind das Mindeste, was wir versprechen.' },
]

export const ADVANTAGES_EN = [
  { title: 'Careful Selection', text: 'Every companion is personally onboarded and accepted only against clear quality criteria.' },
  { title: 'Binding Discretion', text: 'Data protection and confidentiality at NDA level \u2014 natural to us, reassuring to you.' },
  { title: 'Personal Attention', text: 'A single dedicated contact \u2014 no call centre, no anonymous processes.' },
  { title: 'Reliable Punctuality', text: 'Reliability and smooth coordination are the minimum we promise.' },
]
