import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import SectionTitle from "@/components/SectionTitle";
import ModelCard from "@/components/ModelCard";
import { useSEO } from "@/lib/seo";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS, ADVANTAGES, FAQS, BRAND } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const pick = (o, key, lang) => (lang === "en" && o[`${key}En`] != null ? o[`${key}En`] : o[key]);

export default function Home() {
  const [models, setModels] = useState([]);
  const [posts, setPosts] = useState([]);
  const { lang } = useI18n();
  const settings = useSettings();

  useEffect(() => {
    api.get("/models").then((r) => setModels(r.data.slice(0, 8))).catch(() => {});
    api.get("/blog?limit=3").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  useSEO({
    title: "Luxus Escort Hamburg – Exklusive Begleitung mit Stil | Noir Hamburg",
    description: "Luxus Escort Hamburg — exklusive, diskrete Begleitagentur für Dinner, Business und Events. Handverlesene Models seit 2014, faire Tarife, Vermittlung in ganz Hamburg und Umland.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Noir Hamburg",
      "description": "Premium Escort Agency Hamburg",
      "address": { "@type": "PostalAddress", "addressLocality": "Hamburg", "addressCountry": "DE" },
      "areaServed": "Hamburg",
      "telephone": settings.phone,
      "email": settings.email,
    },
  });

  return (
    <PublicLayout>
      {/* Welcome Banner — Tia-style side-by-side hero */}
      <section className="px-6 md:px-12 lg:px-16 pt-16 pb-20" data-testid="home-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F4E4E4] text-[#8B1538] text-xs font-semibold uppercase tracking-wider rounded-full mb-6"
            >
              <Sparkles size={12} /> Premium · Hamburg seit 2014
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-[#1A1414]"
            >
              Luxus Escort Hamburg<br />
              <span className="accent-text italic font-medium">Exklusive Begleitung mit Stil</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 max-w-xl text-base lg:text-lg font-normal text-[#6B5F5F] leading-relaxed"
            >
              Ihre vertrauenswürdige Begleitagentur in Hamburg und Umland — ehrlich, diskret und stilvoll. Wir vermitteln charmante, gebildete Persönlichkeiten für unvergessliche Begegnungen.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/models" className="btn-primary" data-testid="hero-models-btn">
                Models entdecken <ArrowRight size={16} />
              </Link>
              <a
                href={settings.whatsappUrl}
                target="_blank" rel="noreferrer"
                className="btn-whatsapp"
                data-testid="hero-whatsapp-btn"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </motion.div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { num: "14+", label: "Jahre Erfahrung" },
                { num: "30+", label: "Premium Models" },
                { num: "18", label: "Hamburg Gebiete" },
              ].map((s) => (
                <div key={s.label} className="border-l-2 border-[#8B1538] pl-3">
                  <div className="font-heading text-3xl text-[#1A1414]">{s.num}</div>
                  <div className="text-xs text-[#6B5F5F] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-tl-[120px] rounded-br-[120px]">
              <img
                src="https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=85"
                alt="Premium Escort Hamburg — Noir Hamburg Begleitagentur"
                width="1200"
                height="1500"
                fetchpriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white shadow-xl px-6 py-4 hidden md:flex items-center gap-3">
              <div className="badge-available">Verfügbar</div>
              <div>
                <div className="font-heading text-lg text-[#1A1414]">Heute buchbar</div>
                <div className="text-xs text-[#6B5F5F]">Hamburg & Umland</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#FBF7F4] py-6 border-y border-[#1A1414]/8">
        <div className="px-6 md:px-12 lg:px-16">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-sm text-[#6B5F5F]">
            <span className="flex items-center gap-2"><Sparkles size={14} className="text-[#8B1538]" /> Geprüfte Models</span>
            <span className="flex items-center gap-2"><Sparkles size={14} className="text-[#8B1538]" /> 100% Diskret</span>
            <span className="flex items-center gap-2"><Sparkles size={14} className="text-[#8B1538]" /> 7 Tage/Woche erreichbar</span>
            <span className="flex items-center gap-2"><Sparkles size={14} className="text-[#8B1538]" /> Faire Preise</span>
            <span className="flex items-center gap-2"><Sparkles size={14} className="text-[#8B1538]" /> Persönliche Beratung</span>
          </div>
        </div>
      </section>

      {/* SEO copy — Why a professional agency */}
      <section className="px-6 md:px-12 lg:px-16 py-20 border-t border-[#1A1414]/8" data-testid="home-seo-why">
        <div className="max-w-4xl">
          <span className="overline text-[10px]">Warum Noir Hamburg</span>
          <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
            Warum eine professionelle Escort Agentur in Hamburg wählen?
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-[#3F3838] leading-relaxed">
            <p>
              Hamburg ist eine der anspruchsvollsten Städte Europas — hanseatisch, weltoffen, mit einem
              außergewöhnlich hohen Standard in Kultur, Gastronomie und Business. Wer sich hier für eine{" "}
              <strong>Escort Agentur</strong> entscheidet, sollte nicht auf zufällige Vermittlung setzen,
              sondern auf gewachsene Erfahrung und ein Team, das die Stadt versteht.
            </p>
            <p>
              Seit 2014 begleitet <strong>Noir Hamburg</strong> Herren und Damen von Rang zu privaten Dinner-Verabredungen,
              geschäftlichen Empfängen an der Elbphilharmonie, exklusiven Kunstvernissagen in der HafenCity und
              diskreten Wochenenden zwischen Blankenese und Winterhude. Unsere Vermittlung ist persönlich,
              handverlesen und diskret — nie automatisiert.
            </p>
          </div>
        </div>
      </section>

      {/* SEO copy — Luxus Escort Service */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]" data-testid="home-seo-luxus">
        <div className="max-w-4xl">
          <span className="overline text-[10px]">Luxus Escort Service</span>
          <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
            Luxus Escort Service in Hamburg — auf höchstem Niveau
          </h2>
          <div className="mt-8 space-y-6 text-[#3F3838] leading-relaxed">
            <p>
              Ein <strong>Luxus Escort in Hamburg</strong> unterscheidet sich in jedem Detail: die Damen tragen
              Kleider von Chanel, Dior oder maßgeschneiderte deutsche Ateliers. Sie sprechen mindestens zwei
              Sprachen fließend, verfügen über akademische Bildung oder eine künstlerische Karriere und bewegen
              sich mit der stillen Selbstsicherheit einer echten Dame — nicht mit einer einstudierten Rolle.
            </p>
            <p>
              Wir arbeiten ausschließlich mit Frauen, die wir persönlich kennen und deren Persönlichkeit,
              Kultiviertheit und Diskretion wir garantieren können. Für jeden Anlass — vom stillen Abendessen
              im Fischereihafen bis zur mehrtägigen Reise nach Sylt oder Cortina — finden wir die passende
              Begleitung. Kein Katalog, keine Massenware, sondern maßgeschneiderte Vermittlung.
            </p>
          </div>
        </div>
      </section>

      {/* SEO copy — Diskretion */}
      <section className="px-6 md:px-12 lg:px-16 py-20" data-testid="home-seo-diskretion">
        <div className="max-w-4xl">
          <span className="overline text-[10px]">Vertrauen</span>
          <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
            Diskretion, Vertrauen und Professionalität
          </h2>
          <div className="mt-8 space-y-6 text-[#3F3838] leading-relaxed">
            <p>
              Diskretion ist bei uns keine Marketing-Formel, sondern Arbeitsweise. Alle Anfragen laufen
              verschlüsselt, wir speichern keine unnötigen Daten, und selbstverständlich erfahren weder Ihre
              Begleitung noch Dritte mehr, als für den Abend zwingend erforderlich ist. NDAs auf Wunsch —
              schriftlich, gegengezeichnet.
            </p>
            <p>
              <strong>Professionalität</strong> beginnt für uns lange vor der Buchung: bei der Auswahl unserer
              Damen, bei der ehrlichen Beratung im Vorgespräch, bei transparenten Tarifen ohne versteckte Zusätze,
              und bei einer Erreichbarkeit sieben Tage die Woche — auch für kurzfristige Wünsche. Wenn Sie unsere
              Agentur einmal getestet haben, verstehen Sie, warum Kunden nach zehn Jahren immer wieder zu uns
              zurückkehren.
            </p>
          </div>
        </div>
      </section>

      {/* Warum Kunden uns vertrauen — five trust pillars */}
      <section className="px-6 md:px-12 lg:px-16 py-24 border-t border-[#1A1414]/8 bg-[#FBF7F4]" data-testid="home-trust-pillars">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="overline text-[10px]">Vertrauen seit 2014</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">Warum Kunden uns vertrauen</h2>
            <p className="mt-6 text-[#3F3838] leading-relaxed">
              Fünf Grundpfeiler, die den Unterschied zwischen einer beliebigen Vermittlung und einer{" "}
              <strong>gewachsenen Beziehung</strong> ausmachen — und die erklären, warum ein wesentlicher Teil
              unserer Kunden seit vielen Jahren immer wieder zu uns zurückkehrt.
            </p>
          </div>
          <dl className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {[
              {
                overline: "01 · Diskretion",
                title: "Absolute Diskretion",
                body: "Verschlüsselte Kommunikation, minimale Datenspeicherung und — auf Wunsch — schriftliche Geheimhaltungsvereinbarungen. Weder Ihre Begleitung noch Dritte erfahren mehr, als der Abend selbst erfordert.",
                testid: "trust-diskretion",
              },
              {
                overline: "02 · Datenschutz",
                title: "Kompromissloser Datenschutz",
                body: "Kein Newsletter, kein Retargeting, keine Analytics-Tracker Dritter auf sensiblen Seiten. Ihre Kontaktdaten sind nur den zwei Mitarbeitern zugänglich, die Ihre Buchung persönlich betreuen.",
                testid: "trust-datenschutz",
              },
              {
                overline: "03 · Qualität",
                title: "Hanseatische Qualitätsstandards",
                body: "Jede Dame wird von uns persönlich kennengelernt und mindestens zwei Mal getroffen, bevor sie auf Noir Hamburg erscheint. Bildung, sprachliche Gewandtheit, gepflegtes Auftreten — nicht verhandelbar.",
                testid: "trust-qualitaet",
              },
              {
                overline: "04 · Verifiziert",
                title: "Verifizierte Modelprofile",
                body: "Alle Fotos sind aktuell, unretuschiert und stammen aus professionellen Shootings, die wir persönlich in Auftrag gegeben haben. Keine Katalogbilder, keine Stock-Fotos, keine Überraschungen.",
                testid: "trust-verifiziert",
              },
              {
                overline: "05 · Persönlich",
                title: "Persönlicher Service",
                body: "Sie sprechen mit einem echten Menschen — nicht mit einem Bot, nicht mit einem Callcenter. Wir kennen unsere Damen persönlich und wählen für Sie die passende Begleitung nach Anlass, Sprache und Chemie aus.",
                testid: "trust-persoenlich",
              },
            ].map((p) => (
              <div key={p.testid} data-testid={p.testid}>
                <span className="overline text-[10px] accent-text">{p.overline}</span>
                <dt className="mt-3 font-heading text-2xl text-[#1A1414]">{p.title}</dt>
                <dd className="mt-4 text-sm font-light text-[#3F3838] leading-relaxed">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured Models */}
      <section className="px-6 md:px-12 lg:px-16 py-20" data-testid="home-models">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionTitle overline="Models" title="Unsere exklusiven Escort Models in Hamburg" description="Eine Auswahl unserer aktuellen Damen — sorgfältig ausgewählt, kultiviert und authentisch. Jedes Profil finden Sie mit ausführlicher Bio, Sprachen, Interessen und Tarifen." />
          <Link to="/models" className="btn-ghost" data-testid="home-all-models-btn">
            Alle Models <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {models.map((m, i) => (
            <ModelCard key={m.id} model={m} index={i} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]" data-testid="home-services">
        <SectionTitle overline="Anlässe" title="Begleitung für Business, Dinner und Events" description="Acht spezialisierte Begleitarten — vom Geschäftsempfang über Dinner-Verabredung bis zur mehrtägigen Reise. Für jeden Anlass die passende Begleitung mit klarem Rahmen." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="bg-white border border-[#1A1414]/8 hover:border-[#8B1538] transition-all duration-300 hover:shadow-lg p-6 group rounded-lg"
              data-testid={`service-card-${s.slug}`}
            >
              <span className="overline">{s.shortLabel}</span>
              <h3 className="font-heading text-xl mt-3 mb-2 text-[#1A1414] group-hover:accent-text transition-colors">{s.title}</h3>
              <p className="text-sm text-[#6B5F5F] leading-relaxed line-clamp-3">{pick(s, "description", lang)}</p>
              <div className="mt-4 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 accent-text">
                Mehr <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="px-6 md:px-12 lg:px-16 py-20" data-testid="home-advantages">
        <SectionTitle overline="Warum Noir Hamburg" title="Was uns ausmacht" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {ADVANTAGES.map((a, i) => (
            <div key={i} className="bg-white border border-[#1A1414]/8 p-6 rounded-lg">
              <div className="w-10 h-10 bg-[#F4E4E4] text-[#8B1538] font-heading text-xl flex items-center justify-center rounded-full mb-4">
                {i + 1}
              </div>
              <h3 className="font-heading text-xl mb-2 text-[#1A1414]">{a.title}</h3>
              <p className="text-sm text-[#6B5F5F] leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hamburg Areas */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]" data-testid="home-coverage">
        <SectionTitle overline="Reichweite" title="Escort Service in Hamburg Stadtteilen" description="Wir begleiten Sie diskret in der gesamten Hansestadt und Metropolregion — von HafenCity und Elbphilharmonie über Blankenese und Winterhude bis Norderstedt, Pinneberg und Lüneburg." />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-12">
          {LOCATIONS.map((l) => (
            <Link
              key={l.slug}
              to={`/escort/${l.slug}`}
              className="bg-white border border-[#1A1414]/8 px-4 py-3 text-center text-sm text-[#1A1414] hover:bg-[#8B1538] hover:text-white hover:border-[#8B1538] transition-all rounded-md font-medium"
              data-testid={`coverage-${l.slug}`}
            >
              {l.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="px-6 md:px-12 lg:px-16 py-20" data-testid="home-blog">
        <div className="flex items-end justify-between mb-12">
          <SectionTitle overline="Magazin" title="Aktuelle Beiträge" />
          <Link to="/blog" className="hidden md:inline-flex btn-ghost">
            Alle Beiträge <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group block bg-white border border-[#1A1414]/8 rounded-lg overflow-hidden hover:shadow-lg transition-shadow" data-testid={`blog-card-${p.slug}`}>
              <div className="editorial-image h-[280px]">
                <img src={p.cover_image} alt={p.title} loading="lazy" />
              </div>
              <div className="p-6">
                <span className="overline">{p.category}</span>
                <h3 className="font-heading text-xl mt-3 text-[#1A1414] group-hover:accent-text transition-colors leading-snug">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-[#6B5F5F] leading-relaxed line-clamp-2">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]" data-testid="home-faq">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <SectionTitle overline="FAQ" title="Häufig gestellte Fragen" />
            <Link to="/faq" className="btn-ghost mt-8 inline-flex">Alle Fragen <ArrowRight size={14} /></Link>
          </div>
          <div className="md:col-span-7 md:col-start-6 space-y-3">
            {FAQS.slice(0, 4).map((f, i) => (
              <details key={i} className="bg-white border border-[#1A1414]/8 rounded-lg group" data-testid={`faq-${i}`}>
                <summary className="cursor-pointer p-5 list-none flex items-center justify-between gap-4">
                  <span className="font-heading text-lg text-[#1A1414]">{lang === "en" ? f.qEn : f.q}</span>
                  <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#6B5F5F] leading-relaxed">{lang === "en" ? f.aEn : f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-16 py-24 text-center bg-gradient-to-b from-white to-[#FBF7F4]" data-testid="home-cta">
        <Sparkles className="mx-auto text-[#8B1538] mb-6" size={28} />
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl mx-auto text-[#1A1414]">
          Bereit für eine <span className="italic accent-text">unvergessliche</span> Begegnung?
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-[#6B5F5F] text-base lg:text-lg">
          Diskret. Persönlich. Unkompliziert. Wir freuen uns auf Ihre Anfrage.
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link to="/kontakt" className="btn-primary" data-testid="cta-contact-btn">Kontakt aufnehmen</Link>
          <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
