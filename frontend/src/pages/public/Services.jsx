import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO, breadcrumbSchema } from "@/lib/seo";
import { SERVICES, LOCATIONS } from "@/data/site";
import { SERVICE_CONTENT, RELATED_SERVICES } from "@/data/serviceContent";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { api } from "@/lib/api";

// Pick the EN field if lang=en and *En variant exists, otherwise the DE field.
const pick = (s, key, lang) => (lang === "en" && s[`${key}En`] != null ? s[`${key}En`] : s[key]);
// Pick from a CMS-shaped payload (snake_case keys, *_en variants).
const pickCms = (s, key, lang) => (lang === "en" && s[`${key}_en`] ? s[`${key}_en`] : s[key]);

export function ServicesList() {
  const { lang, t, to } = useI18n();
  const settings = useSettings();
  const serviceImages = settings.service_images || {};
  useSEO({
    title: lang === "en"
      ? "Escort Services Hamburg — Premium Companionship | Noir Hamburg"
      : "Escort Services Hamburg — Premium Begleitung | Noir Hamburg",
    description: lang === "en"
      ? "Eight carefully defined service categories from Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel and Girlfriend Experience."
      : "Acht sorgfältig definierte Servicearten von Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel und Girlfriend Experience. Diskret. Persönlich.",
    jsonLd: breadcrumbSchema([{ label: t("crumb.services") }]),
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="services-list">
        <Breadcrumbs items={[{ label: t("crumb.services") }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">{lang === "en" ? "Service Portfolio" : "Service-Portfolio"}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Escort <em className="italic accent-text">Services</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            {lang === "en"
              ? "Eight carefully defined companion categories — so every encounter finds its proper setting."
              : "Acht sorgfältig definierte Begleitarten – damit jede Begegnung ihren angemessenen Rahmen findet."}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1A1414]/5">
          {SERVICES.map((s, i) => (
            <Link
              key={s.slug}
              to={to(`/services/${s.slug}`)}
              className="bg-[#FFFFFF] hover:bg-[#FBF7F4] transition-colors duration-500 group block relative overflow-hidden"
              data-testid={`service-card-${s.slug}`}
            >
              <div className="aspect-[16/10] overflow-hidden">
                {/* Full opacity by default so mobile users (no hover state) see
                    the full-color photo immediately. Desktop still gets the
                    subtle zoom on hover for a premium editorial feel. */}
                <img src={serviceImages[s.slug] || s.image} alt={s.title} className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
              </div>
              <div className="p-8 lg:p-12">
                <span className="overline accent-text">0{i + 1}</span>
                <h2 className="font-heading text-3xl lg:text-4xl mt-3">{s.title}</h2>
                <p className="font-heading italic text-[#6B5F5F] mt-1">{pick(s, "tagline", lang)}</p>
                <p className="mt-5 text-sm font-light text-[#6B5F5F] leading-relaxed">{pick(s, "description", lang)}</p>
                <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] accent-text">
                  {t("cta.viewDetails")} <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const baseService = SERVICES.find((s) => s.slug === slug);
  const { lang, t, to } = useI18n();
  const settings = useSettings();
  const [models, setModels] = useState([]);
  // CMS content — starts as null and populates from /api/service-content/:slug
  // on mount. Merged with the bundled SERVICES/SERVICE_CONTENT fallbacks so
  // the page never shows a blank flash even during a slow API response.
  const [cms, setCms] = useState(null);

  useEffect(() => {
    api.get("/models").then((r) => setModels(r.data.slice(0, 4))).catch(() => {});
    if (slug) {
      api.get(`/service-content/${slug}`)
        .then((r) => setCms(r.data))
        .catch(() => setCms(null));
    }
  }, [slug]);

  // Effective values: prefer live CMS payload, fall back to bundled data.
  const bundled = baseService || {};
  const bundledExt = baseService ? (SERVICE_CONTENT[baseService.slug] || { sections: [], faqs: [] }) : { sections: [], faqs: [] };

  const service = cms ? {
    slug: cms.slug,
    title: cms.title,
    shortLabel: cms.short_label,
    h1: cms.h1,
    tagline: cms.tagline,
    taglineEn: cms.tagline_en,
    description: cms.description,
    descriptionEn: cms.description_en,
    longCopy: cms.long_copy,
    longCopyEn: cms.long_copy_en,
    keypoints: cms.keypoints,
    keypointsEn: cms.keypoints_en,
    image: cms.image || bundled.image,
    imageAlt: cms.image_alt,
    imageAltEn: cms.image_alt_en,
    metaTitle: cms.meta_title,
    metaTitleEn: cms.meta_title_en,
    metaDescription: cms.meta_description,
    metaDescriptionEn: cms.meta_description_en,
  } : bundled;

  const serviceImage = (settings.service_images && settings.service_images[slug]) || service?.image;
  const altText = pick({ imageAlt: service?.imageAlt || "", imageAltEn: service?.imageAltEn || "" }, "imageAlt", lang);

  // Editorial sections + FAQs — CMS format has snake_case; bundle has camelCase.
  // Normalise to a single shape.
  const sections = cms ? (cms.sections || []).map((sec) => ({
    h2: sec.h2, h2En: sec.h2_en, body: sec.body || [], bodyEn: sec.body_en || [],
  })) : bundledExt.sections;
  const faqs = cms ? (cms.faqs || []).map((f) => ({
    q: f.q, qEn: f.q_en, a: f.a, aEn: f.a_en,
  })) : bundledExt.faqs;
  const relatedSlugs = cms ? (cms.related_services || []) : (baseService ? (RELATED_SERVICES[baseService.slug] || []) : []);
  const relatedServices = relatedSlugs.map((sl) => SERVICES.find((x) => x.slug === sl)).filter(Boolean);

  useSEO({
    title: service ? pick(service, "metaTitle", lang) : undefined,
    description: service ? pick(service, "metaDescription", lang) : undefined,
    image: serviceImage,
    jsonLd: service ? [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": pick(service, "metaDescription", lang),
        "provider": { "@type": "LocalBusiness", "name": "Noir Hamburg", "areaServed": "Hamburg" },
        "areaServed": { "@type": "City", "name": "Hamburg" },
        "serviceType": service.shortLabel,
      },
      breadcrumbSchema([
        { label: t("crumb.services"), to: "/services" },
        { label: service.title },
      ]),
      ...(faqs.length ? [{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((f) => ({
          "@type": "Question",
          "name": lang === "en" ? f.qEn : f.q,
          "acceptedAnswer": { "@type": "Answer", "text": lang === "en" ? f.aEn : f.a },
        })),
      }] : []),
    ] : null,
  });

  if (!service || !service.slug) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{lang === "en" ? "Service not found." : "Service nicht gefunden."}</div></PublicLayout>;
  }

  const tagline = pick(service, "tagline", lang);
  const heroAlt = altText || `${service.title} — Noir Hamburg Premium Escort Service`;

  return (
    <PublicLayout>
      <section className="relative h-[60vh] flex items-end" data-testid="service-hero">
        <div className="absolute inset-0">
          <img src={serviceImage} alt={heroAlt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/60 to-transparent" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
          <Breadcrumbs items={[{ label: t("crumb.services"), to: "/services" }, { label: service.title }]} dark />
          <span className="overline block mt-6 mb-4 text-[#E5A5B5]">{service.shortLabel}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-semibold tracking-tight leading-tight text-white">{service.h1}</h1>
          <p className="font-heading italic text-xl text-white/80 mt-4">{tagline}</p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-heading text-3xl lg:text-4xl mb-8">{tagline}</h2>
            <p className="text-base lg:text-lg font-light text-[#3F3838] leading-relaxed">{pick(service, "longCopy", lang)}</p>

            {/* Extended editorial sections */}
            {sections.map((sec, i) => (
              <div key={i} className="mt-14" data-testid={`service-section-${i}`}>
                <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mb-5">{lang === "en" ? sec.h2En : sec.h2}</h2>
                <div className="space-y-4 text-[#3F3838] leading-relaxed">
                  {(lang === "en" ? sec.bodyEn : sec.body).map((p, j) => <p key={j}>{p}</p>)}
                </div>
              </div>
            ))}

            <div className="mt-16">
              <span className="overline">{t("sec.characteristics")}</span>
              <ul className="mt-6 space-y-4">
                {pick(service, "keypoints", lang).map((k) => (
                  <li key={k} className="flex gap-4 items-start border-t border-[#1A1414]/8 pt-4">
                    <span className="accent-text font-mono text-xs mt-1">·</span>
                    <span className="text-base font-light text-[#1A1414]">{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Per-service FAQ */}
            {faqs.length > 0 && (
              <div className="mt-16" data-testid="service-faq">
                <span className="overline">{lang === "en" ? "Questions" : "Fragen"}</span>
                <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mt-3 mb-6">
                  {lang === "en" ? `FAQ — ${service.title}` : `Häufige Fragen zu ${service.title}`}
                </h2>
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <details key={i} className="bg-white border border-[#1A1414]/8 rounded-lg group" data-testid={`service-faq-${i}`}>
                      <summary className="cursor-pointer p-5 list-none flex items-center justify-between gap-4">
                        <span className="font-heading text-lg text-[#1A1414]">{lang === "en" ? f.qEn : f.q}</span>
                        <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-[#6B5F5F] leading-relaxed">{lang === "en" ? f.aEn : f.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-16 flex gap-4 flex-wrap">
              <Link to={to("/kontakt")} className="btn-primary" data-testid="service-contact-btn">{t("cta.bookNow")} <ArrowRight size={14} /></Link>
              <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp" data-testid="service-whatsapp-btn">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <Link to={to("/models")} className="btn-ghost">{t("cta.discoverModels")}</Link>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9 space-y-10">
            {/* Available models */}
            {models.length > 0 && (
              <div>
                <span className="overline mb-3 block">{lang === "en" ? "Available companions" : "Verfügbare Damen"}</span>
                <ul className="space-y-4">
                  {models.map((m) => (
                    <li key={m.id}>
                      <Link to={to(`/models/${m.slug}`)} className="flex items-center gap-3 hover:accent-text transition-colors" data-testid={`related-model-${m.slug}`}>
                        {m.cover_image && <img src={m.cover_image} alt={`${m.name} — Escort Hamburg`} className="w-14 h-14 object-cover rounded" loading="lazy" />}
                        <div>
                          <div className="font-heading text-lg text-[#1A1414]">{m.name}</div>
                          <div className="text-xs text-[#6B5F5F]">{m.short_tagline}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={to("/models")} className="btn-ghost mt-4 inline-flex">{t("cta.allModels")} <ArrowRight size={14} /></Link>
              </div>
            )}

            {/* Related services */}
            {relatedServices.length > 0 && (
              <div>
                <span className="overline mb-3 block">{lang === "en" ? "Related services" : "Verwandte Services"}</span>
                <ul className="space-y-3">
                  {relatedServices.map((s) => (
                    <li key={s.slug}>
                      <Link to={to(`/services/${s.slug}`)} className="font-heading text-xl hover:accent-text transition-colors" data-testid={`related-service-${s.slug}`}>{s.title}</Link>
                      <p className="text-xs text-[#6B5F5F] mt-1">{pick(s, "description", lang)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Serviced areas */}
            <div>
              <span className="overline mb-3 block">{t("sec.availableIn")}</span>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.slice(0, 12).map((l) => (
                  <Link key={l.slug} to={to(`/escort/${l.slug}`)} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]" data-testid={`related-area-${l.slug}`}>{l.name}</Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
