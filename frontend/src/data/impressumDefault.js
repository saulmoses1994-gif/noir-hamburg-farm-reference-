/**
 * Default HTML content for the /impressum (§ 5 TMG) page. Rendered when the
 * admin has not yet overridden `settings.impressum_content` from the CMS.
 * Kept in a shared module so React (Impressum.jsx) and SSR (routes/static.js)
 * stay in exact lockstep — one source of truth, zero drift.
 */
const IMPRESSUM_DEFAULT_HTML = `
<h2>Angaben gemäß § 5 TMG</h2>
<address>
<strong>Noir Hamburg</strong><br/>
Pinneberger Chaussee 50<br/>
22523 Hamburg
</address>

<h2>Kontakt</h2>
<p>E-Mail: <a href="mailto:support@noir-hamburg.com">support@noir-hamburg.com</a></p>

<h2>Bildrechte</h2>
<p>© Noir Hamburg und unter Lizenz von Pixabay / Unsplash / Shutterstock.com</p>

<h2>Jugendschutzbeauftragter</h2>
<address>
<strong>Jochen Jüngst, LL.M.</strong><br/>
Tel.: <a href="tel:+494087408606">+49 40 874 086 06</a><br/>
Fax: 040 – 874 087 00<br/>
E-Mail: <a href="mailto:info@juengst-legal.de">info@juengst-legal.de</a><br/>
Web: <a href="https://www.juengst-legal.de" rel="noopener noreferrer" target="_blank">www.juengst-legal.de</a>
</address>
`.trim();

module.exports = { IMPRESSUM_DEFAULT_HTML };
// ESM re-export so React (webpack) can import it too.
module.exports.default = IMPRESSUM_DEFAULT_HTML;
