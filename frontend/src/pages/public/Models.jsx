import { useEffect, useState, useMemo } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import SectionTitle from "@/components/SectionTitle";
import ModelCard from "@/components/ModelCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS } from "@/data/site";

export default function Models() {
  const [models, setModels] = useState([]);
  const [filterService, setFilterService] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterService) params.set("service", filterService);
    if (filterLocation) params.set("location", filterLocation);
    api.get(`/models?${params}`).then((r) => setModels(r.data)).catch(() => {});
  }, [filterService, filterLocation]);

  useSEO({
    title: "Models — Premium Escort Hamburg | Noir Hamburg",
    description: "Entdecken Sie das aktuelle Roster von Noir Hamburg – sorgfältig ausgewählte Persönlichkeiten für anspruchsvolle Begleitung in Hamburg und Umland.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="models-page">
        <Breadcrumbs items={[{ label: "Models" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Roster</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Unsere <em className="italic accent-text">Models</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#9CA3AF] leading-relaxed">
            Eine sorgfältig kuratierte Auswahl an Persönlichkeiten – jede mit eigener Geschichte, Bildung und unverkennbarem Stil.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="px-6 md:px-12 lg:px-16 py-6 border-y border-white/5 sticky top-[68px] z-30 backdrop-blur-xl bg-[#0A0A0B]/85">
        <div className="flex flex-wrap items-center gap-4">
          <span className="overline">Filter</span>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="bg-transparent border border-white/10 text-sm py-2 px-4 font-light focus:border-[#E5D3B3] outline-none"
            data-testid="filter-service"
          >
            <option value="">Alle Services</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug} className="bg-[#0A0A0B]">{s.title}</option>
            ))}
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-transparent border border-white/10 text-sm py-2 px-4 font-light focus:border-[#E5D3B3] outline-none"
            data-testid="filter-location"
          >
            <option value="">Alle Standorte</option>
            {LOCATIONS.map((l) => (
              <option key={l.slug} value={l.slug} className="bg-[#0A0A0B]">{l.name}</option>
            ))}
          </select>
          {(filterService || filterLocation) && (
            <button
              onClick={() => { setFilterService(""); setFilterLocation(""); }}
              className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF] hover:text-[#F5F5F0]"
              data-testid="filter-reset"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          {models.map((m, i) => (
            <ModelCard key={m.id} model={m} index={i} />
          ))}
          {models.length === 0 && (
            <div className="md:col-span-12 text-center py-20 text-[#9CA3AF]" data-testid="models-empty">
              <p className="font-heading text-2xl">Keine Models gefunden.</p>
              <p className="text-sm mt-2">Bitte passen Sie die Filter an.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
