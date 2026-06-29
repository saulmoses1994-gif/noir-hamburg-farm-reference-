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

export default function ModelDetail() {
  const { slug } = useParams();
  const [model, setModel] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const { lang, t, to } = useI18n();

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

  useSEO({
    title: model ? `${model.name} — Escort Hamburg | Noir Hamburg` : "Model",
    description: model ? (isEn
      ? `${model.name}, ${model.age} years old — ${shortTagline || "premium companionship in Hamburg"}. Discreet, well-educated, hanseatic elegance.`
      : `${model.name}, ${model.age} Jahre – ${shortTagline || "Premium Begleitung in Hamburg"}. Diskret, gebildet, hanseatisch elegant.`) : "",
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
            <span className="overline">Noir Hamburg · {model.nationality || "Premium"}</span>
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
                ["Alter", `${model.age} Jahre`],
                ["Größe", model.height_cm ? `${model.height_cm} cm` : "–"],
                ["Konfektion", model.dress_size],
                ["Maße", model.measurements],
                ["Haar", model.hair_color],
                ["Augen", model.eye_color],
              ].filter(([_, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="overline text-[10px] mb-1">{k}</dt>
                  <dd className="font-light text-[#1A1414]">{v}</dd>
                </div>
              ))}
            </dl>

            {model.languages?.length > 0 && (
              <div className="mt-8">
                <span className="overline text-[10px] block mb-2">Sprachen</span>
                <div className="flex flex-wrap gap-2">
                  {model.languages.map((l) => (
                    <span key={l} className="text-xs font-mono uppercase tracking-[0.15em] py-1 px-3 border border-[#1A1414]/15">
                      {l}
                    </span>
                  ))}
                </div>
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
                <span className="overline text-[10px] block mb-2">Interessen</span>
                <p className="text-sm font-light text-[#1A1414]">{model.interests.join(" · ")}</p>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to={`/kontakt?model=${model.slug}`} className="btn-primary" data-testid="book-btn">
                {model.name} buchen <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Anfrage Noir Hamburg: " + model.name)}`}
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
                <span className="overline text-[10px] block mb-3">Services</span>
                <div className="flex flex-wrap gap-2">
                  {modelServices.map((s) => (
                    <Link key={s.slug} to={`/services/${s.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {modelLocations.length > 0 && (
              <div className="mt-8">
                <span className="overline text-[10px] block mb-3">Verfügbar in</span>
                <div className="flex flex-wrap gap-2">
                  {modelLocations.map((l) => (
                    <Link key={l.slug} to={`/escort/${l.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">
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
          <h2 className="font-heading text-3xl mb-12">Weitere Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
            {related.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]">
        <h2 className="font-heading text-3xl mb-12">Häufige Fragen</h2>
        <div className="space-y-px bg-[#1A1414]/5 max-w-4xl">
          {FAQS.slice(0, 4).map((f, i) => (
            <details key={i} className="bg-[#FBF7F4] group">
              <summary className="cursor-pointer p-6 list-none flex items-center justify-between gap-6">
                <span className="font-heading text-xl">{f.q}</span>
                <span className="accent-text text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-6 text-sm font-light text-[#6B5F5F] leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
