import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO, breadcrumbSchema } from "@/lib/seo";
import { SERVICES, LOCATIONS } from "@/data/site";
import { useI18n } from "@/lib/i18n";

// Pick the EN field if lang=en and *En variant exists, otherwise the DE field.
const pick = (s, key, lang) => (lang === "en" && s[`${key}En`] != null ? s[`${key}En`] : s[key]);

export function ServicesList() {
  const { lang, t, to } = useI18n();
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
                <img src={s.image} alt={s.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
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
  const service = SERVICES.find((s) => s.slug === slug);
  const { lang, t, to } = useI18n();

  useSEO({
    title: service ? pick(service, "metaTitle", lang) : undefined,
    description: service ? pick(service, "metaDescription", lang) : undefined,
    image: service?.image,
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
    ] : null,
  });

  if (!service) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{lang === "en" ? "Service not found." : "Service nicht gefunden."}</div></PublicLayout>;
  }

  const relatedServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);
  const tagline = pick(service, "tagline", lang);

  return (
    <PublicLayout>
      <section className="relative h-[60vh] flex items-end" data-testid="service-hero">
        <div className="absolute inset-0">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
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
            <p className="text-base lg:text-lg font-light text-[#6B5F5F] leading-relaxed">{pick(service, "longCopy", lang)}</p>

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

            <div className="mt-16 flex gap-4 flex-wrap">
              <Link to={to("/kontakt")} className="btn-primary">{t("cta.bookNow")} <ArrowRight size={14} /></Link>
              <Link to={to("/models")} className="btn-ghost">{t("cta.discoverModels")}</Link>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9 space-y-10">
            <div>
              <span className="overline mb-3 block">{t("sec.availableIn")}</span>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.slice(0, 10).map((l) => (
                  <Link key={l.slug} to={to(`/escort/${l.slug}`)} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">{l.name}</Link>
                ))}
              </div>
            </div>
            <div>
              <span className="overline mb-3 block">{lang === "en" ? "Other Services" : "Weitere Services"}</span>
              <ul className="space-y-3">
                {relatedServices.map((s) => (
                  <li key={s.slug}>
                    <Link to={to(`/services/${s.slug}`)} className="font-heading text-xl hover:accent-text transition-colors">{s.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
