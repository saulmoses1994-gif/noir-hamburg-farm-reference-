import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ModelCard from "@/components/ModelCard";
import { useSEO, breadcrumbSchema } from "@/lib/seo";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS, BRAND, FAQS } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

// Quick DE→EN map for the small set of nationality terms used in seed data.
// New entries can be added without a backend change.
const NATIONALITY_EN = {
  "Deutsch": "German",
  "Italienisch": "Italian",
  "Französisch": "French",
  "Spanisch": "Spanish",
  "Russisch": "Russian",
  "Polnisch": "Polish",
  "Brasilianisch": "Brazilian",
  "Britisch": "British",
  "Amerikanisch": "American",
};
const translateNationality = (n) => NATIONALITY_EN[n] || n || "Premium";

export default function ModelDetail() {
  const { slug } = useParams();
  const [model, setModel] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const { lang, t, to } = useI18n();
  const settings = useSettings();

  useEffect(() => {
    setModel(null);
    api.get(`/models/${slug}`).then((r) => setModel(r.data)).catch(() => setModel(false));
    api.get(`/models?limit=20`).then((r) => setRelated(r.data.filter((m) => m.slug !== slug).slice(0, 3))).catch(() => {});
  }, [slug]);

  // EN fields fall back to German originals when missing.
  const isEn = lang === "en";
  const bio = model ? (isEn && model.bio_en ? model.bio_en : model.bio) : "";
  const shortTagline = model
    ? (isEn && model.short_tagline_en ? model.short_tagline_en : model.short_tagline || "")
    : "";
  const enFallback = model && isEn && !model.bio_en;

  // Prefer admin-authored SEO meta when present; fall back to auto-generated.
  const metaTitle = model
    ? (isEn ? (model.meta_title_en || model.meta_title) : model.meta_title) || ""
    : "";
  const metaDescription = model
    ? (isEn ? (model.meta_description_en || model.meta_description) : model.meta_description) || ""
    : "";

  useSEO({
    title: metaTitle || (model ? `${model.name} — Escort Hamburg | Noir Hamburg` : "Model"),
    description: metaDescription || (model ? (isEn
      ? `${model.name}, ${model.age} years old — ${shortTagline || "premium companionship in Hamburg"}. Discreet, well-educated, hanseatic elegance.`
      : `${model.name}, ${model.age} Jahre – ${shortTagline || "Premium Begleitung in Hamburg"}. Diskret, gebildet, hanseatisch elegant.`) : ""),
    image: model?.cover_image,
    jsonLd: model ? [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": model.name,
        "description": bio,
        "knowsLanguage": model.languages,
        "image": model.cover_image,
        "nationality": model.nationality,
      },
      breadcrumbSchema([
        { label: t("crumb.models"), to: "/models" },
        { label: model.name },
      ]),
    ] : null,
  });

  if (model === false) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{isEn ? "Model not found." : "Model nicht gefunden."}</div></PublicLayout>;
  }
  if (!model) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{t("misc.loading")}</div></PublicLayout>;
  }

  const gallery = [model.cover_image, ...(model.gallery || [])].filter(Boolean);
  const modelServices = SERVICES.filter((s) => model.services?.includes(s.slug));
  const modelLocations = LOCATIONS.filter((l) => model.locations?.includes(l.slug));

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-8" data-testid="model-detail">
        <Breadcrumbs items={[{ label: "Models", to: "/models" }, { label: model.name }]} />
      </section>

      {/* Magazine Spread */}
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Sticky portrait */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="editorial-image h-[80vh]">
                <img src={gallery[activeImg]} alt={`${model.name} – Portrait`} />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`editorial-image h-24 ${i === activeImg ? "ring-1 ring-[#8B1538]" : "opacity-60 hover:opacity-100"}`}
                      data-testid={`gallery-thumb-${i}`}
                    >
                      <img src={img} alt={`${model.name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <span className="overline">Noir Hamburg · {isEn ? translateNationality(model.nationality) : (model.nationality || "Premium")}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter mt-3 leading-none">
              {model.name}
            </h1>
            {shortTagline && (
              <p className="mt-4 font-heading italic text-xl text-[#6B5F5F]">
                {shortTagline}
              </p>
            )}

            <div className="mt-10 thin-divider" />

            <dl className="mt-8 grid grid-cols-2 gap-y-5 gap-x-8 text-sm">
              {[
                [isEn ? "Age" : "Alter", `${model.age} ${isEn ? "years" : "Jahre"}`],
                [isEn ? "Height" : "Größe", model.height_cm ? `${model.height_cm} cm` : "–"],
                [isEn ? "Dress size" : "Konfektion", model.dress_size],
                [isEn ? "Measurements" : "Maße", model.measurements],
                [isEn ? "Hair" : "Haar", model.hair_color],
                [isEn ? "Eyes" : "Augen", model.eye_color],
              ].filter(([_, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="overline text-[10px] mb-1">{k}</dt>
                  <dd className="font-light text-[#1A1414]">{v}</dd>
                </div>
              ))}
            </dl>

            {model.languages?.length > 0 && (
              <div className="mt-8">
                <span className="overline text-[10px] block mb-2">{t("model.languages")}</span>
                <div className="flex flex-wrap gap-2">
                  {model.languages.map((l) => (
                    <span key={l} className="text-xs font-mono uppercase tracking-[0.15em] py-1 px-3 border border-[#1A1414]/15">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing tiers — admin-managed via control panel. */}
            {model.prices?.length > 0 && (
              <div className="mt-10" data-testid="model-prices">
                <span className="overline text-[10px] block mb-4">{isEn ? "Rates" : "Tarife"}</span>
                <dl className="grid grid-cols-1 gap-y-4">
                  {model.prices.map((p, i) => {
                    const unitKey = `price.unit.${p.unit || "hour"}`;
                    const unitText = t(unitKey);
                    return (
                      <div key={i} className="flex items-baseline justify-between border-b border-[#1A1414]/10 pb-4">
                        <dt className="font-light text-[#1A1414] text-base">{p.label}</dt>
                        <dd className="font-heading text-3xl md:text-4xl font-semibold text-[#8B1538] whitespace-nowrap leading-none">
                          {Number(p.amount).toLocaleString(isEn ? "en-GB" : "de-DE")} {p.currency || "EUR"}
                          {unitText && (
                            <span className="ml-1 text-sm font-light text-[#8B1538]/80">
                              {unitText}
                            </span>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <p className="mt-4 text-xs text-[#6B5F5F]">
                  {isEn
                    ? "Travel expenses and additional services on request."
                    : "Reisekosten und Zusatzleistungen auf Anfrage."}
                </p>
              </div>
            )}

            <div className="mt-10">
              <h2 className="font-heading text-2xl mb-4">{t("sec.aboutPerson", { name: model.name })}</h2>
              {enFallback && (
                <div className="mb-4 p-3 border-l-2 border-[#8B1538] bg-[#FAF5F2] text-xs text-[#4A3F3F]" data-testid="en-fallback-note">
                  <strong className="text-[#8B1538]">EN preview.</strong> {t("misc.englishComingSoon")}
                </div>
              )}
              <p className="text-base font-light text-[#6B5F5F] leading-relaxed">{bio}</p>
            </div>

            {model.interests?.length > 0 && (
              <div className="mt-8">
                <span className="overline text-[10px] block mb-2">{isEn ? "Interests" : "Interessen"}</span>
                <p className="text-sm font-light text-[#1A1414]">{model.interests.join(" · ")}</p>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to={to(`/kontakt?model=${model.slug}`)} className="btn-primary" data-testid="book-btn">
                {t("cta.bookModel", { name: model.name })} <ArrowRight size={14} />
              </Link>
              <a
                href={`${settings.whatsappUrl}?text=${encodeURIComponent((isEn ? "Noir Hamburg enquiry: " : "Anfrage Noir Hamburg: ") + model.name)}`}
                target="_blank" rel="noreferrer"
                className="btn-ghost"
                data-testid="whatsapp-btn"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>

            {/* Services */}
            {modelServices.length > 0 && (
              <div className="mt-12">
                <span className="overline text-[10px] block mb-3">{t("sec.services")}</span>
                <div className="flex flex-wrap gap-2">
                  {modelServices.map((s) => (
                    <Link key={s.slug} to={to(`/services/${s.slug}`)} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {modelLocations.length > 0 && (
              <div className="mt-8">
                <span className="overline text-[10px] block mb-3">{t("sec.availableIn")}</span>
                <div className="flex flex-wrap gap-2">
                  {modelLocations.map((l) => (
                    <Link key={l.slug} to={to(`/escort/${l.slug}`)} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">
                      {l.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Models */}
      {related.length > 0 && (
        <section className="px-6 md:px-12 lg:px-16 py-20 border-t border-[#1A1414]/8">
          <h2 className="font-heading text-3xl mb-12">{isEn ? "More companions" : "Weitere Models"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
            {related.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
          </div>
        </section>
      )}

      {/* Model-specific FAQ — unique per-page SEO copy that references the model
          by name. Rendered with FAQPage JSON-LD to earn rich snippets in Google. */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]">
        <h2 className="font-heading text-3xl mb-12">
          {isEn ? `Frequently asked questions about ${model.name}` : `Häufig gestellte Fragen zu ${model.name}`}
        </h2>
        <div className="space-y-px bg-[#1A1414]/5 max-w-4xl">
          {(() => {
            const langs = (model.languages || []).slice(0, 3).join(", ");
            const cities = (model.locations || []).slice(0, 3).map((s) =>
              s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            ).join(", ");
            const services = (model.services || []).slice(0, 3)
              .map((slug) => (SERVICES.find((sv) => sv.slug === slug)?.title) || slug)
              .join(", ");
            const cheapest = (model.prices || []).length > 0
              ? Math.min(...model.prices.map((p) => p.amount)) : null;
            const cur = (model.prices || [])[0]?.currency || "EUR";
            const modelFaqs = isEn ? [
              { q: `Where can I meet ${model.name} in Hamburg?`,
                a: `${model.name} is available for bookings ${cities ? `across ${cities} ` : ""}and, on request, throughout the greater Hamburg metropolitan area. Outcall to your hotel, private residence or event location is standard.` },
              { q: `What languages does ${model.name} speak?`,
                a: `${model.name} speaks ${langs || "German and English"} fluently — an important detail if your evening involves international guests or a business setting.` },
              { q: `Which occasions is ${model.name} best suited for?`,
                a: `${model.name} is especially recommended for ${services || "dinner engagements, business receptions and cultural events"}. She moves with equal ease through gala evenings, private dinners and multi-day travel.` },
              { q: `How do I book ${model.name}?`,
                a: `Send a discreet enquiry via our contact form or WhatsApp with your preferred date, duration and occasion. ${cheapest ? `Rates start at ${cheapest.toLocaleString("en-GB")} ${cur} for a single hour, ` : ""}with tiered packages for longer engagements. Confirmation is usually within a few hours.` },
            ] : [
              { q: `Wo kann ich ${model.name} in Hamburg treffen?`,
                a: `${model.name} ist ${cities ? `in ${cities} ` : ""}und auf Anfrage in der gesamten Metropolregion Hamburg buchbar. Outcall zu Ihrem Hotel, Ihrem privaten Rahmen oder Ihrem Event ist selbstverständlich.` },
              { q: `Welche Sprachen spricht ${model.name}?`,
                a: `${model.name} spricht ${langs || "Deutsch und Englisch"} fließend — wichtig, wenn Ihr Abend internationale Gäste oder einen geschäftlichen Rahmen einbezieht.` },
              { q: `Für welche Anlässe eignet sich ${model.name} besonders?`,
                a: `${model.name} empfehlen wir vor allem für ${services || "Dinner-Verabredungen, Geschäftsempfänge und kulturelle Ereignisse"}. Sie bewegt sich mit gleicher Selbstverständlichkeit auf Gala-Abenden, in privaten Dinner-Runden und auf mehrtägigen Reisen.` },
              { q: `Wie buche ich ${model.name}?`,
                a: `Senden Sie eine diskrete Anfrage über unser Kontaktformular oder per WhatsApp mit Ihrem Wunschtermin, der gewünschten Dauer und dem Anlass. ${cheapest ? `Die Tarife beginnen bei ${cheapest.toLocaleString("de-DE")} ${cur} für eine Stunde, ` : ""}mit gestaffelten Paketen für längere Buchungen. Die Bestätigung erfolgt in der Regel innerhalb weniger Stunden.` },
            ];
            // Emit FAQPage JSON-LD for rich snippets.
            const jsonLd = {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: modelFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            };
            return (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
                {modelFaqs.map((f, i) => (
                  <details key={i} className="bg-[#FBF7F4] group" data-testid={`model-faq-${i}`}>
                    <summary className="cursor-pointer p-6 list-none flex items-center justify-between gap-6">
                      <span className="font-heading text-xl">{f.q}</span>
                      <span className="accent-text text-xl group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="px-6 pb-6 text-sm font-light text-[#6B5F5F] leading-relaxed">{f.a}</div>
                  </details>
                ))}
              </>
            );
          })()}
        </div>
      </section>
    </PublicLayout>
  );
}
