/**
 * Home (/) SSR renderer.
 */
const { SERVICES, LOCATIONS, FAQS, BRAND } = require("../../src/data/site");
const {
  SITE_ORIGIN,
  esc,
  renderShell,
} = require("../shell");
const { backendJSON } = require("../backend");

async function renderHome(buildAssets) {
  let models = [];
  let posts = [];
  try {
    models = (await backendJSON("/api/models")).slice(0, 8);
    posts = await backendJSON("/api/blog?limit=3");
  } catch (e) {
    console.warn("home fetch fail:", e.message);
  }

  const body = `
<main id="main" role="main" style="padding:2rem;">
<section>
<p style="color:#8B1538;text-transform:uppercase;letter-spacing:0.2em;font-size:0.75rem;">Premium · Hamburg seit 2014</p>
<h1>Herzlich Willkommen bei <em>Noir Hamburg</em></h1>
<p>Ihre vertrauenswürdige Premium-Begleitagentur in Hamburg und Umland — ehrlich, diskret und stilvoll. Wir vermitteln charmante, gebildete Persönlichkeiten für unvergessliche Begegnungen.</p>
<p><a href="/models">Models entdecken</a> · <a href="${BRAND.whatsappUrl}">WhatsApp</a> · <a href="/kontakt">Kontakt</a></p>
</section>
<section>
<h2>Unsere Escort Damen</h2>
<ul>${models.map((m) => `<li><a href="/models/${m.slug}"><strong>${esc(m.name)}</strong>, ${m.age} Jahre — ${esc(m.short_tagline || "Premium Begleitung")}</a></li>`).join("")}</ul>
<p><a href="/models">Alle Models ansehen</a></p>
</section>
<section>
<h2>Was wir bieten</h2>
<ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}"><strong>${esc(s.title)}</strong> — ${esc(s.description)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>Hamburg & Umland</h2>
<ul>${LOCATIONS.map((l) => `<li><a href="/escort/${l.slug}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>Aktuelles aus dem Magazin</h2>
${posts.map((p) => `<article><h3><a href="/blog/${p.slug}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p></article>`).join("")}
<p><a href="/blog">Alle Beiträge</a></p>
</section>
<section>
<h2>Häufige Fragen</h2>
${FAQS.slice(0, 4).map((f) => `<details><summary><strong>${esc(f.q)}</strong></summary><p>${esc(f.a)}</p></details>`).join("")}
</section>
</main>`;

  return renderShell({
    ...buildAssets,
    title: "Noir Hamburg — Premium Escort Hamburg | Diskrete Begleitung von höchster Eleganz",
    description: "Noir Hamburg ist die Premium-Begleitagentur für anspruchsvolle Herren in Hamburg. Diskret, gebildet, hanseatisch elegant. Buchen Sie Ihre persönliche Begleitung.",
    canonical: `${SITE_ORIGIN}/`,
    ogImage: "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=85",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Noir Hamburg",
        description: "Premium Escort Agency Hamburg",
        address: { "@type": "PostalAddress", addressLocality: "Hamburg", addressCountry: "DE" },
        areaServed: "Hamburg",
        telephone: BRAND.phone,
        email: BRAND.email,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
    bodyContent: body,
  });
}

module.exports = { renderHome };
