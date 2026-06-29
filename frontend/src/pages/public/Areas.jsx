import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ModelCard from "@/components/ModelCard";
import { useSEO } from "@/lib/seo";
import { api } from "@/lib/api";
import { LOCATIONS, SERVICES } from "@/data/site";

export function AreasList() {
  useSEO({
    title: "Hamburg Areas — Premium Escort in der ganzen Metropolregion | Noir Hamburg",
    description: "Premium Escort in Hamburg und Umland: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona und weitere Stadtteile. Diskrete Begleitung in Ihrer Nähe.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="areas-list">
        <Breadcrumbs items={[{ label: "Hamburg Areas" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Reichweite</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Hamburg <em className="italic accent-text">Areas</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            Wir begleiten Sie in der gesamten Metropolregion Hamburg. Wählen Sie Ihren Stadtteil.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1414]/5">
          {LOCATIONS.map((l) => (
            <Link
              key={l.slug}
              to={`/escort/${l.slug}`}
              className="bg-[#FFFFFF] hover:bg-[#FBF7F4] transition-colors duration-500 group block"
              data-testid={`area-card-${l.slug}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={l.image} alt={l.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
              </div>
              <div className="p-8">
                <h2 className="font-heading text-2xl">{l.title}</h2>
                <p className="text-sm font-light text-[#6B5F5F] mt-2 leading-relaxed">{l.intro}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] accent-text">
                  Mehr <ArrowRight size={12} />
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

  useEffect(() => {
    if (slug) {
      api.get(`/models?location=${slug}`).then((r) => setModels(r.data.slice(0, 6))).catch(() => {});
    }
  }, [slug]);

  useSEO({
    title: area ? `${area.title} — Premium Begleitung in ${area.name} | Noir Hamburg` : "",
    description: area ? `${area.title}: ${area.intro} Diskrete Begleitung in ${area.name} – exklusiv vermittelt durch Noir Hamburg.` : "",
    image: area?.image,
  });

  if (!area) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">Standort nicht gefunden.</div></PublicLayout>;
  }

  const nearby = LOCATIONS.filter((l) => l.slug !== area.slug).slice(0, 6);

  return (
    <PublicLayout>
      <section className="relative h-[60vh] flex items-end" data-testid="area-hero">
        <div className="absolute inset-0">
          <img src={area.image} alt={area.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/60 to-transparent" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
          <Breadcrumbs items={[{ label: "Hamburg Areas", to: "/areas" }, { label: area.name }]} dark />
          <span className="overline block mt-6 mb-4 text-[#E5A5B5]">Escort {area.name}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-semibold tracking-tight leading-tight text-white">{area.title}</h1>
          <p className="font-heading italic text-xl text-white/80 mt-4">{area.intro}</p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-heading text-3xl lg:text-4xl mb-8">Begleitung in {area.name}</h2>
            <p className="text-base lg:text-lg font-light text-[#6B5F5F] leading-relaxed">{area.description}</p>

            {area.landmarks?.length > 0 && (
              <div className="mt-12">
                <span className="overline mb-4 block">Beliebte Adressen</span>
                <div className="flex flex-wrap gap-2">
                  {area.landmarks.map((lm) => (
                    <span key={lm} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15">{lm}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 flex gap-4 flex-wrap">
              <Link to="/kontakt" className="btn-primary">In {area.name} buchen <ArrowRight size={14} /></Link>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9 space-y-10">
            <div>
              <span className="overline mb-3 block">Beliebte Services</span>
              <ul className="space-y-3">
                {SERVICES.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <Link to={`/services/${s.slug}`} className="font-heading text-xl hover:accent-text transition-colors block py-1">{s.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="overline mb-3 block">In der Nähe</span>
              <div className="flex flex-wrap gap-2">
                {nearby.map((l) => (
                  <Link key={l.slug} to={`/escort/${l.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]">{l.name}</Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {models.length > 0 && (
        <section className="px-6 md:px-12 lg:px-16 py-20 border-t border-[#1A1414]/8">
          <h2 className="font-heading text-3xl mb-12">Models in {area.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
            {models.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
