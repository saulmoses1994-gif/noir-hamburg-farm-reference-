/**
 * Default HTML content for the /p/diskretion page. Rendered when the admin
 * has not yet overridden `settings.diskretion_content` from the CMS.
 * Shared between React (Diskretion.jsx) and SSR (routes/static.js) so both
 * runtimes stay in exact lockstep — one source of truth, zero drift.
 */
const DISKRETION_DEFAULT_HTML = `
<p class="lead">Bei Noir Hamburg steht absolute Diskretion an erster Stelle. Wir verstehen, dass Privatsphäre, Vertrauen und ein professioneller Umgang die Grundlage für einen exklusiven Service bilden.</p>

<p>Alle Anfragen und Buchungen werden streng vertraulich behandelt. Persönliche Informationen unserer Kunden werden niemals an Dritte weitergegeben und ausschließlich für die Bearbeitung der jeweiligen Anfrage genutzt.</p>

<p>Unser Team legt größten Wert auf eine diskrete Kommunikation, eine respektvolle Betreuung und höchste Professionalität — vom ersten Kontakt bis zum Abschluss jeder Buchung.</p>

<p>Wir schaffen eine Atmosphäre, in der sich unsere Kunden sicher und wohlfühlen können. Vertrauen, Zuverlässigkeit und Verschwiegenheit sind die Werte, die Noir Hamburg auszeichnen.</p>

<p>Ob Geschäftsreisende, internationale Besucher oder anspruchsvolle Kunden aus Hamburg und Umgebung — wir garantieren einen diskreten und persönlichen Service auf höchstem Niveau.</p>

<p class="tagline"><em>Noir Hamburg — Exklusivität. Vertrauen. Diskretion.</em></p>
`.trim();

module.exports = { DISKRETION_DEFAULT_HTML };
module.exports.default = DISKRETION_DEFAULT_HTML;
