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
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8 bg-[#FBF7F4]" data-testid="models-page">
        <Breadcrumbs items={[{ label: "Models" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Roster</span>
          <h1 className="font-heading text-4xl lg:text-6xl font-semibold tracking-tight leading-tight mt-4">
            Unsere <em className="italic accent-text">Models</em>
          </h1>
          <p className="mt-6 text-base lg:text-lg text-[#6B5F5F] leading-relaxed">
            Eine sorgfältig kuratierte Auswahl an Persönlichkeiten – jede mit eigener Geschichte, Bildung und unverkennbarem Stil.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="px-6 md:px-12 lg:px-16 py-4 border-y border-[#1A1414]/8 sticky top-[64px] z-30 bg-white/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="overline">Filter</span>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="bg-white border border-[#1A1414]/15 text-sm py-2 px-4 rounded-md focus:border-[#8B1538] outline-none text-[#1A1414]"
            data-testid="filter-service"
          >
            <option value="">Alle Services</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-white border border-[#1A1414]/15 text-sm py-2 px-4 rounded-md focus:border-[#8B1538] outline-none text-[#1A1414]"
            data-testid="filter-location"
          >
            <option value="">Alle Standorte</option>
            {LOCATIONS.map((l) => (
              <option key={l.slug} value={l.slug}>{l.name}</option>
            ))}
          </select>
          {(filterService || filterLocation) && (
            <button
              onClick={() => { setFilterService(""); setFilterLocation(""); }}
              className="text-xs uppercase tracking-wider text-[#8B1538] hover:underline"
              data-testid="filter-reset"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {models.map((m, i) => (
            <ModelCard key={m.id} model={m} index={i} />
          ))}
          {models.length === 0 && (
            <div className="col-span-full text-center py-20 text-[#6B5F5F]" data-testid="models-empty">
              <p className="font-heading text-2xl">Keine Models gefunden.</p>
              <p className="text-sm mt-2">Bitte passen Sie die Filter an.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
