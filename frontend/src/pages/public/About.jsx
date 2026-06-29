import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { ADVANTAGES } from "@/data/site";

export default function About() {
  useSEO({
    title: "Über uns — Die Philosophie von Noir Hamburg",
    description: "Noir Hamburg ist eine kleine, kuratierte Premium-Begleitagentur in Hamburg. Lernen Sie unsere Werte, Standards und unser Verständnis von Diskretion kennen.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="about-page">
        <Breadcrumbs items={[{ label: "Über uns" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Die Agentur</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Über <em className="italic accent-text">uns</em>
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6 text-lg font-light text-[#9CA3AF] leading-relaxed">
            <p>
              Noir Hamburg ist keine Agentur im klassischen Sinne. Wir sind eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen – auf beiden Seiten der Begegnung.
            </p>
            <p>
              Gegründet 2014 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet, die ihre Privatsphäre ebenso schätzen wie die Qualität ihrer Begegnungen.
            </p>
            <p>
              Unsere Models sind keine zufällig gewählten Profile. Jede Persönlichkeit wird in einem persönlichen Gespräch aufgenommen und genießt unser uneingeschränktes Vertrauen. Wir arbeiten ausnahmslos mit Menschen zusammen, die ihre Tätigkeit selbstbestimmt und mit Stolz ausüben.
            </p>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="editorial-image h-[60vh]">
              <img src="https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Hamburg Editorial" />
            </div>
          </aside>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#121214]">
        <h2 className="font-heading text-3xl lg:text-4xl mb-12">Unsere Prinzipien</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {ADVANTAGES.map((a, i) => (
            <div key={i} className="border-t border-white/10 pt-6">
              <div className="font-mono text-xs accent-text mb-4">0{i + 1}</div>
              <h3 className="font-heading text-2xl mb-3">{a.title}</h3>
              <p className="text-sm font-light text-[#9CA3AF] leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-20 text-center">
        <h2 className="font-heading text-4xl lg:text-5xl max-w-3xl mx-auto">
          Beginnen Sie ein <em className="italic accent-text">Gespräch</em>.
        </h2>
        <div className="mt-10">
          <Link to="/kontakt" className="btn-primary">Kontakt aufnehmen</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
