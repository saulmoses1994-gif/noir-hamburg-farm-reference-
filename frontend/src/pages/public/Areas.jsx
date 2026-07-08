import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ModelCard from "@/components/ModelCard";
import { useSEO, breadcrumbSchema } from "@/lib/seo";
import { api } from "@/lib/api";
import { LOCATIONS, SERVICES } from "@/data/site";
import { AREA_CONTENT, GENERIC_AREA_FAQS } from "@/data/areaContent";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const pick = (o, key, lang) => (lang === "en" && o[`${key}En`] != null ? o[`${key}En`] : o[key]);

export function AreasList() {
  const { lang, t, to } = useI18n();
  const settings = useSettings();
  const areaImages = settings.area_images || {};
  useSEO({
    title: lang === "en"
      ? "Hamburg Areas — Premium Escort across the Metropolitan Region | Noir Hamburg"
      : "Hamburg Areas — Premium Escort in der ganzen Metropolregion | Noir Hamburg",
    description: lang === "en"
      ? "Premium escort in Hamburg and the surrounding region: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona and further districts."
      : "Premium Escort in Hamburg und Umland: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona und weitere Stadtteile. Diskrete Begleitung in Ihrer Nähe.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="areas-list">
        <Breadcrumbs items={[{ label: t("crumb.areas") }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">{lang === "en" ? "Coverage" : "Reichweite"}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Hamburg <em className="italic accent-text">Areas</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            {lang === "en"
              ? "We accompany you throughout the entire Hamburg metropolitan region. Choose your district."
              : "Wir begleiten Sie in der gesamten Metropolregion Hamburg. Wählen Sie Ihren Stadtteil."}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1414]/5">
          {LOCATIONS.map((l) => (
            <Link
              key={l.slug}
              to={to(`/escort/${l.slug}`)}
              className="bg-[#FFFFFF] hover:bg-[#FBF7F4] transition-colors duration-500 group block"
              data-testid={`area-card-${l.slug}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                {/* Full opacity by default so mobile users (no hover state) see
                    the full-color photo immediately. Desktop still gets the
                    subtle zoom on hover for a premium editorial feel. */}
                <img src={areaImages[l.slug] || l.image} alt={l.title} className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
              </div>
              <div className="p-8">
                <h2 className="font-heading text-2xl">{l.title}</h2>
                <p className="text-sm font-light text-[#6B5F5F] mt-2 leading-relaxed">{pick(l, "intro", lang)}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] accent-text">
                  {lang === "en" ? "More" : "Mehr"} <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export function AreaDetail() {
  const { slug } = useParams();
  const area = LOCATIONS.find((l) => l.slug === slug);
  const [models, setModels] = useState([]);
  const { lang, t, to } = useI18n();
  const settings = useSettings();
  // Admin-uploaded override for this area's hero image, if any.
  const areaImage = (settings.area_images && settings.area_images[slug]) || area?.image;

  useEffect(() => {
    if (slug) {
      api.get(`/models?location=${slug}`).then((r) => setModels(r.data.slice(0, 6))).catch(() => {});
    }
  }, [slug]);

  const intro = area ? pick(area, "intro", lang) : "";
  const description = area ? pick(area, "description", lang) : "";
  const extra = area ? (AREA_CONTENT[area.slug] || { bodyExtra: [], bodyExtraEn: [] }) : { bodyExtra: [], bodyExtraEn: [] };
  const bodyExtra = lang === "en" ? (extra.bodyExtraEn || []) : (extra.bodyExtra || []);
  const areaFaqs = area
    ? (extra.faqs || GENERIC_AREA_FAQS).map((f) => ({
        q: (lang === "en" ? f.qEn : f.q).replace(/\{name\}/g, area.name),
        a: (lang === "en" ? f.aEn : f.a).replace(/\{name\}/g, area.name),
      }))
    : [];

  useSEO({
    title: area ? (lang === "en"
      ? `${area.title} — Premium Companionship in ${area.name} | Noir Hamburg`
      : `${area.title} — Premium Begleitung in ${area.name} | Noir Hamburg`) : "",
    description: area ? (lang === "en"
      ? `${area.title}: ${intro} Discreet companionship in ${area.name} — exclusively arranged by Noir Hamburg.`
      : `${area.title}: ${intro} Diskrete Begleitung in ${area.name} – exklusiv vermittelt durch Noir Hamburg.`) : "",
    image: areaImage,
    jsonLd: area ? [
      {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": `Escort ${area.name}`,
        "description": description,
        "address": { "@type": "PostalAddress", "addressLocality": area.name, "addressCountry": "DE" },
      },
      breadcrumbSchema([
        { label: t("crumb.areas"), to: "/areas" },
        { label: area.name },
      ]),
      ...(areaFaqs.length ? [{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": areaFaqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      }] : []),
    ] : null,
  });

  if (!area) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{lang === "en" ? "Location not found." : "Standort nicht gefunden."}</div></PublicLayout>;
  }

  const nearby = LOCATIONS.filter((l) => l.slug !== area.slug).slice(0, 6);

  return (
    <PublicLayout>
      <section className="relative h-[60vh] flex items-end" data-testid="area-hero">
        <div className="absolute inset-0">
          <img src={areaImage} alt={area.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/60 to-transparent" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
          <Breadcrumbs items={[{ label: t("crumb.areas"), to: "/areas" }, { label: area.name }]} dark />
          <span className="overline block mt-6 mb-4 text-[#E5A5B5]">Escort {area.name}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-semibold tracking-tight leading-tight text-white">{area.title}</h1>
          <p className="font-heading italic text-xl text-white/80 mt-4">{intro}</p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-heading text-3xl lg:text-4xl mb-8">
              {lang === "en" ? `Companionship in ${area.name}` : `Begleitung in ${area.name}`}
            </h2>
            <p className="text-base lg:text-lg font-light text-[#3F3838] leading-relaxed">{description}</p>

            {bodyExtra.length > 0 && (
              <div className="mt-8 space-y-5 text-[#3F3838] leading-relaxed" data-testid="area-body-extra">
                {bodyExtra.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            {area.landmarks?.length > 0 && (
              <div className="mt-12">
                <span className="overline mb-4 block">{t("sec.popularAddresses")}</span>
                <div className="flex flex-wrap gap-2">
                  {area.landmarks.map((lm) => (
                    <span key={lm} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15">{lm}</span>
                  ))}
                </div>
              </div>
            )}

            {areaFaqs.length > 0 && (
              <div className="mt-14" data-testid="area-faq">
                <span className="overline">{lang === "en" ? "Questions" : "Fragen"}</span>
                <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mt-3 mb-6">
                  {lang === "en" ? `FAQ — Escort in ${area.name}` : `Häufige Fragen — Escort in ${area.name}`}
                </h2>
                <div className="space-y-3">
                  {areaFaqs.map((f, i) => (
                    <details key={i} className="bg-white border border-[#1A1414]/8 rounded-lg group" data-testid={`area-faq-${i}`}>
                      <summary className="cursor-pointer p-5 list-none flex items-center justify-between gap-4">
                        <span className="font-heading text-lg text-[#1A1414]">{f.q}</span>
                        <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-[#6B5F5F] leading-relaxed">{f.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 flex gap-4 flex-wrap">
              <Link to={to("/kontakt")} className="btn-primary" data-testid="area-contact-btn">{t("cta.bookInArea", { name: area.name })} <ArrowRight size={14} /></Link>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9 space-y-10">
            <div>
              <span className="overline mb-3 block">{t("sec.popularServices")}</span>
              <ul className="space-y-3">
                {SERVICES.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <Link to={to(`/services/${s.slug}`)} className="font-heading text-xl hover:accent-text transition-colors block py-1">{s.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="overline mb-3 block">{t("sec.nearby")}</span>
              <div className="flex flex-wrap gap-2">
                {nearby.map((l) => (
                  <Link key={l.slug} to={to(`/escort/${l.slug}`)} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">{l.name}</Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {models.length > 0 && (
        <section className="px-6 md:px-12 lg:px-16 py-20 border-t border-[#1A1414]/8">
          <h2 className="font-heading text-3xl mb-12">{lang === "en" ? `Companions in ${area.name}` : `Models in ${area.name}`}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {models.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
