import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const { lang, to } = useI18n();
  const settings = useSettings();

  useEffect(() => {
    api.get("/models").then((r) => setModels(r.data.slice(0, 8))).catch(() => {});
    api.get("/blog?limit=4").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  // Resolve the hero image with a graceful fallback chain:
  //   1. SSR-baked bootstrap (window.__NOIR_INITIAL__.heroImage) — same value
  //      the SSG output committed to HTML, prevents a flash on hydration
  //   2. Admin-configured `homepage_hero_image` in Settings
  //   3. First featured model's cover image
  //   4. Last-resort Unsplash placeholder we ship with
  const FALLBACK_HERO = "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=80";
  const ssrHero = typeof window !== "undefined" ? window.__NOIR_INITIAL__?.heroImage : "";
  const heroImage =
    settings.homepage_hero_image ||
    models.find((m) => m.featured)?.cover_image ||
    models[0]?.cover_image ||
    ssrHero ||
    FALLBACK_HERO;
  // Responsive srcset only makes sense when the URL is an Unsplash CDN URL
  // that supports the `w=` query parameter; for admin-uploaded custom images
  // we serve the original URL at every viewport.
  const isUnsplashHero = /images\.unsplash\.com/.test(heroImage);
  const heroSrcSet = isUnsplashHero
    ? `${heroImage.replace(/w=\d+/, "w=600").replace(/q=\d+/, "q=75")} 600w, ${heroImage.replace(/w=\d+/, "w=900").replace(/q=\d+/, "q=78")} 900w, ${heroImage.replace(/w=\d+/, "w=1200").replace(/q=\d+/, "q=80")} 1200w`
    : undefined;

  useSEO({
    title: "Luxus Escort Hamburg | Premium Escort Agentur Hamburg | Noir Hamburg",
    description: "Luxus Escort Hamburg – Premium Agentur für diskrete, professionelle Begleitung. Handverlesene Damen für Dinner, Business & Events. Höchste Diskretion seit 2025.",
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F4E4E4] text-[#8B1538] text-xs font-semibold uppercase tracking-wider rounded-full mb-6 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <Sparkles size={12} /> Premium · Hamburg seit 2025
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-[#1A1414] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Luxus Escort Hamburg<br />
              <span className="accent-text italic font-medium">Premium Begleitung mit Stil</span>
            </h1>
            <p className="mt-8 max-w-xl text-base lg:text-lg font-normal text-[#6B5F5F] leading-relaxed animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              Ihre vertrauenswürdige Begleitagentur in Hamburg und Umland — ehrlich, diskret und stilvoll. Wir vermitteln charmante, gebildete Persönlichkeiten für unvergessliche Begegnungen.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <Link to="/models" className="btn-primary" data-testid="hero-models-btn">
                Models entdecken <ArrowRight size={16} />
              </Link>
              <a
                href={settings.whatsappUrl}
                target="_blank" rel="noreferrer nofollow"
                className="btn-whatsapp"
                data-testid="hero-whatsapp-btn"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>

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

          <div
            className="lg:col-span-5 relative animate-hero-in"
            style={{ animationDuration: "1s", animationTimingFunction: "ease-out" }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-tl-[120px] rounded-br-[120px]">
              <img
                src={heroImage}
                {...(heroSrcSet ? { srcSet: heroSrcSet, sizes: "(max-width: 768px) 100vw, 42vw" } : {})}
                alt="Premium Escort Hamburg — Noir Hamburg Begleitagentur"
                width="1200"
                height="1500"
                fetchpriority="high"
                decoding="async"
                className="w-full h-full object-cover"
                data-testid="home-hero-image"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white shadow-xl px-6 py-4 hidden md:flex items-center gap-3">
              <div className="badge-available">Verfügbar</div>
              <div>
                <div className="font-heading text-lg text-[#1A1414]">Heute buchbar</div>
                <div className="text-xs text-[#6B5F5F]">Hamburg & Umland</div>
              </div>
            </div>
          </div>
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
              Seit 2025 begleitet <strong>Noir Hamburg</strong> Herren und Damen von Rang zu privaten Dinner-Verabredungen,
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
            Diskretion und Privatsphäre in Hamburg
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
            <p>
              Konkret bedeutet das: keine SMS an Ihre Privatnummer ohne Ihre ausdrückliche Freigabe, keine
              Kalendereinträge auf Diensttelefonen, kein Foto-Austausch, den Sie später nicht mehr zurückholen
              können. Wir verstehen die <strong>Vertraulichkeit</strong> hanseatischer Herren — und arbeiten
              nach diesem Maßstab.
            </p>
          </div>
        </div>
      </section>

      {/* NEW: VIP & Business Begleitung */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4] border-t border-[#1A1414]/8" data-testid="home-seo-vip-business">
        <div className="max-w-4xl">
          <span className="overline text-[10px]">VIP · Business</span>
          <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
            VIP &amp; Business Begleitung in Hamburg
          </h2>
          <div className="mt-8 space-y-6 text-[#3F3838] leading-relaxed">
            <p>
              Für <strong>Persönlichkeiten des öffentlichen Lebens</strong>, internationale Investoren und
              Geschäftsführer bieten wir eine eigene Klasse der Begleitung: <Link to="/services/vip-escort-hamburg" className="underline decoration-[#8B1538]/40 hover:decoration-[#8B1538]">VIP Escort</Link>{" "}
              und <Link to="/services/business-escort-hamburg" className="underline decoration-[#8B1538]/40 hover:decoration-[#8B1538]">Business Escort Hamburg</Link>.
              Diese Damen sind nicht nur präsentabel, sondern konferenzfähig — vertraut mit hanseatischer
              Etikette, mit Board-Dinner-Codes und mit dem international üblichen Umgang unter CEOs, Anwälten
              und Diplomaten.
            </p>
            <p>
              Ob ein diskretes <Link to="/services/dinner-companion-hamburg" className="underline decoration-[#8B1538]/40 hover:decoration-[#8B1538]">Dinner im Vier Jahreszeiten</Link>,
              ein Empfang in der Elbphilharmonie oder eine mehrtägige Delegation von{" "}
              <Link to="/services/travel-companion-hamburg" className="underline decoration-[#8B1538]/40 hover:decoration-[#8B1538]">Sylt bis Dubai</Link>{" "}
              — Ihre Begleitung tritt souverän auf, spricht mindestens Englisch und Deutsch fließend und
              versteht, wann sie unterhält und wann sie sich elegant zurücknimmt. Auf Wunsch mit
              wirtschaftlichem Hintergrund, akademischem Grad oder künstlerischer Karriere.
            </p>
            <p>
              Für <strong>Führungspersönlichkeiten</strong> gilt bei uns eine erweiterte Vertraulichkeitsstufe:
              keine öffentlichen Profile, keine gemeinsamen Fotos, kein Zwischenkontakt außerhalb Ihres
              Ansprechpartners. Buchungen werden ausschließlich zwischen Ihnen und einem festen Betreuer
              koordiniert — auf Wunsch mit NDA.
            </p>
          </div>
        </div>
      </section>

      {/* Simple 3-step booking process — conversion trust builder */}
      <section className="px-6 md:px-12 lg:px-16 py-24 border-t border-[#1A1414]/8" data-testid="home-booking-process">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="overline text-[10px]">In 3 Schritten</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">So einfach ist Ihre Buchung</h2>
            <p className="mt-6 text-[#3F3838] leading-relaxed">
              Kein Login, keine Formulare mit zwanzig Feldern, kein Warten auf Callcenter — der Ablauf ist bewusst
              schlicht gehalten und respektiert Ihre Zeit.
            </p>
          </div>

          <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* connecting line, desktop only */}
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#8B1538]/40 via-[#8B1538]/60 to-[#8B1538]/40" aria-hidden="true" />

            {[
              {
                num: "01",
                title: "Anfrage senden",
                body: "Über unser Kontaktformular, per WhatsApp oder Signal — schildern Sie uns Anlass, Zeitrahmen und Ihre Vorlieben. Sieben Tage die Woche, ohne Login.",
                testid: "step-anfrage",
              },
              {
                num: "02",
                title: "Beratung erhalten",
                body: "Innerhalb kurzer Zeit meldet sich Ihr persönlicher Ansprechpartner. Wir schlagen zwei bis drei passende Damen vor und beantworten Ihre Fragen — ehrlich und ohne Verkaufsdruck.",
                testid: "step-beratung",
              },
              {
                num: "03",
                title: "Begleitung auswählen",
                body: "Sie treffen Ihre Wahl in Ruhe. Wir bestätigen den Termin schriftlich, koordinieren Ort, Zeit und alle Details — den Rest überlassen Sie uns.",
                testid: "step-auswahl",
              },
            ].map((step) => (
              <div key={step.num} className="relative flex flex-col items-start" data-testid={step.testid}>
                <div className="relative z-10 w-16 h-16 rounded-full bg-[#1A1414] text-white flex items-center justify-center font-heading text-xl border border-[#8B1538]/40">
                  {step.num}
                </div>
                <h3 className="font-heading text-2xl mt-6 text-[#1A1414]">{step.title}</h3>
                <p className="mt-3 text-sm text-[#3F3838] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </ol>

          <div className="mt-14 flex flex-wrap gap-4 items-center">
            <Link to={to("/kontakt")} className="btn-primary" data-testid="booking-process-cta-contact">
              Anfrage jetzt senden <ArrowRight size={14} />
            </Link>
            <a href={settings.whatsappUrl} target="_blank" rel="noreferrer nofollow" className="btn-whatsapp" data-testid="booking-process-cta-whatsapp">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <span className="text-xs text-[#6B5F5F] uppercase tracking-[0.15em]">Diskret · Kostenfrei · Unverbindlich</span>
          </div>
        </div>
      </section>

      {/* Warum Noir Hamburg — six trust pillars (Diskretion, Privatsphäre,
          Qualität, Persönlicher Service, Einfache Kontaktaufnahme,
          Professionelle Standards) */}
      <section className="px-6 md:px-12 lg:px-16 py-24 border-t border-[#1A1414]/8 bg-[#FBF7F4]" data-testid="home-trust-pillars">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="overline text-[10px]">Vertrauen seit 2025</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">Warum Noir Hamburg?</h2>
            <p className="mt-6 text-[#3F3838] leading-relaxed">
              Sechs Grundpfeiler, die den Unterschied zwischen einer beliebigen Vermittlung und einer{" "}
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
                overline: "02 · Privatsphäre",
                title: "Kompromisslose Privatsphäre",
                body: "Kein Newsletter, kein Retargeting, keine Analytics-Tracker Dritter auf sensiblen Seiten. Ihre Kontaktdaten sind nur den zwei Mitarbeitern zugänglich, die Ihre Buchung persönlich betreuen.",
                testid: "trust-privatsphaere",
              },
              {
                overline: "03 · Qualität",
                title: "Hanseatische Qualität",
                body: "Jede Dame wird von uns persönlich kennengelernt und mindestens zwei Mal getroffen, bevor sie auf Noir Hamburg erscheint. Bildung, sprachliche Gewandtheit, gepflegtes Auftreten — nicht verhandelbar.",
                testid: "trust-qualitaet",
              },
              {
                overline: "04 · Persönlich",
                title: "Persönlicher Service",
                body: "Sie sprechen mit einem echten Menschen — nicht mit einem Bot, nicht mit einem Callcenter. Ein fester Ansprechpartner koordiniert Ihre Buchung von der Anfrage bis zur Nachbereitung.",
                testid: "trust-persoenlich",
              },
              {
                overline: "05 · Erreichbarkeit",
                title: "Einfache Kontaktaufnahme",
                body: "Kontaktformular, WhatsApp oder Signal — sieben Tage die Woche. Werktags antworten wir in der Regel innerhalb einer Stunde, an Wochenenden am selben Tag. Ohne Login, ohne Registrierung.",
                testid: "trust-kontakt",
              },
              {
                overline: "06 · Standards",
                title: "Professionelle Standards",
                body: "Pünktlichkeit als Selbstverständlichkeit, transparente Tarife ohne versteckte Zuschläge, klare Vereinbarungen im Vorgespräch. Seit 2025 dieselben Prinzipien — für Sie und für unsere Damen.",
                testid: "trust-standards",
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

      {/* Featured Articles — magazine hero cards + secondary grid */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-[#FBF7F4] deferred-paint" data-testid="home-featured-articles">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="overline text-[10px]">Magazin</span>
              <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">Ausgewählte Beiträge</h2>
              <p className="mt-4 max-w-2xl text-[#3F3838] leading-relaxed">
                Persönliche Wegweiser durch Hamburgs feinste Adressen — kuratiert von unserem Team,
                mit ehrlichen Empfehlungen für Hotels, Restaurants und Kultur.
              </p>
            </div>
            <Link to={to("/blog")} className="btn-ghost inline-flex" data-testid="featured-articles-all">
              Alle Beiträge <ArrowRight size={14} />
            </Link>
          </div>

          {posts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Hero article — first post, spans 7 columns on desktop */}
              <Link
                to={to(`/blog/${posts[0].slug}`)}
                className="lg:col-span-7 group block bg-white border border-[#1A1414]/8 rounded-lg overflow-hidden hover:shadow-xl transition-all"
                data-testid={`featured-hero-${posts[0].slug}`}
              >
                <div className="editorial-image aspect-[16/10] overflow-hidden">
                  <img
                    src={posts[0].cover_image}
                    alt={posts[0].title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em]">
                    <span className="accent-text font-mono">Feature</span>
                    <span className="text-[#6B5F5F]">·</span>
                    <span className="text-[#6B5F5F]">{posts[0].category}</span>
                  </div>
                  <h3 className="font-heading text-2xl lg:text-3xl mt-4 text-[#1A1414] group-hover:accent-text transition-colors leading-tight">
                    {posts[0].title}
                  </h3>
                  <p className="mt-4 text-[#3F3838] leading-relaxed line-clamp-3">{posts[0].excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] accent-text font-semibold">
                    Weiterlesen <ArrowRight size={12} />
                  </span>
                </div>
              </Link>

              {/* Secondary column — next 3 posts */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {posts.slice(1, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={to(`/blog/${p.slug}`)}
                    className="group flex gap-4 bg-white border border-[#1A1414]/8 rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-3"
                    data-testid={`featured-secondary-${p.slug}`}
                  >
                    <div className="editorial-image w-32 h-32 flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="overline text-[9px] text-[#6B5F5F]">{p.category}</span>
                      <h4 className="font-heading text-base mt-1.5 text-[#1A1414] group-hover:accent-text transition-colors leading-snug line-clamp-2">
                        {p.title}
                      </h4>
                      <span className="mt-2 text-xs accent-text uppercase tracking-[0.15em]">Weiterlesen →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories row — internal linking spread across topical clusters */}
          <div className="mt-16 pt-8 border-t border-[#1A1414]/8">
            <span className="overline text-[10px] block mb-4">Nach Kategorie</span>
            <div className="flex flex-wrap gap-2">
              {["Luxury Hotels Hamburg","Fine Dining Hamburg","Nightlife Hamburg","Business Travel Hamburg","Hamburg Lifestyle","Privacy & Discretion","Escort Guides"].map((c) => (
                <Link
                  key={c}
                  to={to(`/blog?category=${encodeURIComponent(c)}`)}
                  className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]"
                  data-testid={`featured-cat-${c.toLowerCase().replace(/\s+/g,'-')}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4] deferred-paint" data-testid="home-faq">
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
          <a href={settings.whatsappUrl} target="_blank" rel="noreferrer nofollow" className="btn-whatsapp">
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
