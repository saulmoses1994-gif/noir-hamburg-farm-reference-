import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import SectionTitle from "@/components/SectionTitle";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { SERVICES, LOCATIONS } from "@/data/site";

export default function EscortHamburg() {
  useSEO({
    title: "Escort Hamburg — Premium Begleitagentur | Noir Hamburg",
    description: "Escort Hamburg auf höchstem Niveau: Diskret, gebildet, hanseatisch elegant. Sorgfältig ausgewählte Models für anspruchsvolle Herren in Hamburg und Umland.",
  });

  return (
    <PublicLayout>
      <section className="relative h-[70vh] flex items-end" data-testid="escort-hamburg-page">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=2400" alt="Hamburg bei Nacht" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]/40" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-16 max-w-5xl">
          <Breadcrumbs items={[{ label: "Escort Hamburg" }]} />
          <span className="overline block mt-6 mb-4">Hauptstadt der Eleganz</span>
          <h1 className="font-heading text-5xl lg:text-8xl font-light tracking-tighter leading-none">
            Escort <em className="italic accent-text">Hamburg</em>
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <span className="overline">Die Hansestadt</span>
            <h2 className="font-heading text-3xl lg:text-5xl font-light tracking-tight leading-tight mt-4">
              Eleganz, die in Hamburg geboren wird.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-base lg:text-lg font-light text-[#9CA3AF] leading-relaxed">
            <p>
              Hamburg ist eine Stadt der feinen Kontraste: maritime Weltläufigkeit und hanseatische Zurückhaltung, Reichtum ohne Pomp, Kultur ohne Eile. Wer hier um Begleitung bittet, sucht keine Bühne – er sucht eine Persönlichkeit.
            </p>
            <p>
              Noir Hamburg ist die Premium-Begleitagentur, die diese Stadt verstanden hat. Unsere Models bewegen sich zwischen Elbphilharmonie und Vier Jahreszeiten, zwischen Yacht und Privatclub – immer mit der Selbstverständlichkeit, die ihren Anspruch ausmacht.
            </p>
            <p>
              Ob ein geschäftliches Dinner im Haerlin, ein Galaabend in der Laeiszhalle oder ein Wochenende auf Sylt – wir vermitteln Persönlichkeiten, die solchen Anlässen den Rahmen geben, den sie verdienen.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#121214]">
        <SectionTitle overline="Services" title="Wofür Sie uns rufen können" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 mt-16">
          {SERVICES.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="bg-[#121214] hover:bg-[#1A1A1D] transition-colors duration-500 p-6 group">
              <h3 className="font-heading text-xl group-hover:accent-text">{s.title}</h3>
              <p className="text-xs font-light text-[#9CA3AF] mt-2 line-clamp-2">{s.description}</p>
              <div className="mt-4 text-xs font-mono uppercase tracking-[0.2em] inline-flex items-center gap-2 group-hover:accent-text">Details <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-20">
        <SectionTitle overline="Reichweite" title="Hamburg & Umland" description="Wir sind in der gesamten Metropolregion verfügbar." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4 mt-12">
          {LOCATIONS.map((l) => (
            <Link key={l.slug} to={`/escort/${l.slug}`} className="text-sm font-light text-[#F5F5F0] hover:accent-text border-b border-white/5 py-2 link-underline">{l.name}</Link>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-32 text-center">
        <h2 className="font-heading text-4xl lg:text-6xl max-w-3xl mx-auto">
          Buchen Sie diskret. <em className="italic accent-text">Heute Abend.</em>
        </h2>
        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <Link to="/kontakt" className="btn-primary">Anfrage senden</Link>
          <Link to="/models" className="btn-ghost">Models ansehen</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
