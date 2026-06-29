import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import SectionTitle from "@/components/SectionTitle";
import ModelCard from "@/components/ModelCard";
import { useSEO } from "@/lib/seo";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS, ADVANTAGES, FAQS, BRAND } from "@/data/site";

export default function Home() {
  const [models, setModels] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/models?featured=true").then((r) => setModels(r.data.slice(0, 4))).catch(() => {});
    api.get("/blog?limit=3").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  useSEO({
    title: "Noir Hamburg — Premium Escort Hamburg | Diskrete Begleitung von höchster Eleganz",
    description: "Noir Hamburg ist die Premium-Begleitagentur für anspruchsvolle Herren in Hamburg. Diskret, gebildet, hanseatisch elegant. Buchen Sie Ihre persönliche Begleitung.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Noir Hamburg",
      "description": "Premium Escort Agency Hamburg",
      "address": { "@type": "PostalAddress", "addressLocality": "Hamburg", "addressCountry": "DE" },
      "areaServed": "Hamburg",
      "telephone": BRAND.phone,
      "email": BRAND.email,
    },
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative h-[100vh] flex items-end" data-testid="home-hero">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542533450-52ccfdc39aba?auto=format&fit=crop&w=2400&q=85"
            alt="Eleganter Schatten – Noir Hamburg"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]/40" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-20 md:pb-32 max-w-5xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="overline block mb-6"
          >
            Premium Escort · Hamburg seit 2014
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-heading text-5xl sm:text-6xl lg:text-8xl font-light tracking-tighter leading-[0.95]"
          >
            Begleitung,<br />
            <em className="font-light italic accent-text">die nichts erklären muss.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 max-w-xl text-lg font-light text-[#9CA3AF] leading-relaxed"
          >
            Ausgewählte Persönlichkeiten für Hamburgs anspruchsvollsten Kreis – eine Premium-Begleitagentur, die Eleganz, Bildung und Diskretion zur Selbstverständlichkeit macht.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link to="/models" className="btn-primary" data-testid="hero-models-btn">
              Models entdecken <ArrowRight size={16} />
            </Link>
            <Link to="/kontakt" className="btn-ghost" data-testid="hero-contact-btn">
              Kontakt aufnehmen
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 right-8 hidden md:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#52525B]">↓ Scroll</div>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <span className="overline">Die Agentur</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-tight mt-4">
              Eine Idee von <em className="italic accent-text">Stil</em>, die in Hamburg zu Hause ist.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 flex flex-col gap-6 text-base lg:text-lg font-light text-[#9CA3AF] leading-relaxed">
            <p>
              Noir Hamburg ist keine Agentur im klassischen Sinne. Wir sind eine kleine, kuratierte Plattform für Persönlichkeiten, die Bildung, Diskretion und einen feinen ästhetischen Anspruch teilen – auf beiden Seiten der Begegnung.
            </p>
            <p>
              Unsere Models sind Studentinnen, Juristinnen, Künstlerinnen, Berufstätige mit klaren Werten. Ihre Auswahl folgt nicht dem Standard einer Galerie, sondern dem Maß einer persönlichen Empfehlung.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="px-6 md:px-12 lg:px-16 py-20" data-testid="home-models">
        <div className="flex items-end justify-between mb-16">
          <SectionTitle overline="Featured" title="Unsere Models" description="Eine Auswahl aus unserem aktuellen Roster." />
          <Link to="/models" className="hidden md:inline-flex btn-ghost" data-testid="home-all-models-btn">
            Alle Models <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          {models.map((m, i) => (
            <ModelCard key={m.id} model={m} index={i} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-40 bg-[#121214]" data-testid="home-services">
        <SectionTitle overline="Services" title="Unsere Begleitarten" description="Acht sorgfältig definierte Servicearten – damit jede Begegnung ihren Rahmen findet." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 mt-16">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="bg-[#121214] hover:bg-[#1A1A1D] transition-colors duration-500 p-8 group"
              data-testid={`service-card-${s.slug}`}
            >
              <span className="overline accent-text">{s.shortLabel}</span>
              <h3 className="font-heading text-2xl mt-3 mb-3 group-hover:accent-text transition-colors">{s.title}</h3>
              <p className="text-sm font-light text-[#9CA3AF] leading-relaxed">{s.description}</p>
              <div className="mt-6 text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-2 text-[#9CA3AF] group-hover:accent-text">
                Mehr erfahren <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-40" data-testid="home-advantages">
        <SectionTitle overline="Warum Noir Hamburg" title="Was uns ausmacht" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-16">
          {ADVANTAGES.map((a, i) => (
            <div key={i} className="border-t border-white/5 pt-6">
              <div className="font-mono text-xs accent-text mb-4">0{i + 1}</div>
              <h3 className="font-heading text-2xl mb-3">{a.title}</h3>
              <p className="text-sm font-light text-[#9CA3AF] leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage Map (location list) */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 bg-[#121214]" data-testid="home-coverage">
        <SectionTitle overline="Reichweite" title="Hamburg & Umland" description="Wir begleiten Sie in der gesamten Metropolregion Hamburg." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4 mt-12 max-w-5xl">
          {LOCATIONS.map((l) => (
            <Link
              key={l.slug}
              to={`/escort/${l.slug}`}
              className="text-sm font-light text-[#F5F5F0] hover:accent-text transition-colors py-2 border-b border-white/5 link-underline"
              data-testid={`coverage-${l.slug}`}
            >
              {l.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Blog preview */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-40" data-testid="home-blog">
        <div className="flex items-end justify-between mb-16">
          <SectionTitle overline="Journal" title="Aktuelles aus dem Magazin" />
          <Link to="/blog" className="hidden md:inline-flex btn-ghost">
            Alle Beiträge <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group block" data-testid={`blog-card-${p.slug}`}>
              <div className="editorial-image h-[400px]">
                <img src={p.cover_image} alt={p.title} loading="lazy" />
              </div>
              <span className="overline mt-5 block accent-text">{p.category}</span>
              <h3 className="font-heading text-2xl mt-3 group-hover:accent-text transition-colors leading-tight">
                {p.title}
              </h3>
              <p className="mt-3 text-sm font-light text-[#9CA3AF] leading-relaxed line-clamp-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 bg-[#121214]" data-testid="home-faq">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <SectionTitle overline="FAQ" title="Häufig gestellte Fragen" />
            <Link to="/faq" className="btn-ghost mt-8 inline-flex">Alle Fragen <ArrowRight size={14} /></Link>
          </div>
          <div className="md:col-span-7 md:col-start-6 space-y-px bg-white/5">
            {FAQS.slice(0, 4).map((f, i) => (
              <details key={i} className="bg-[#121214] group" data-testid={`faq-${i}`}>
                <summary className="cursor-pointer p-6 list-none flex items-center justify-between gap-6">
                  <span className="font-heading text-xl">{f.q}</span>
                  <span className="accent-text text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm font-light text-[#9CA3AF] leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-16 py-32 md:py-48 text-center" data-testid="home-cta">
        <span className="overline">Buchung</span>
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter mt-6 max-w-4xl mx-auto">
          Ein Abend, der den Eindruck einer <em className="italic accent-text">Erinnerung</em> hinterlässt.
        </h2>
        <p className="mt-8 max-w-xl mx-auto text-[#9CA3AF] font-light text-lg">
          Diskret. Persönlich. Unkompliziert. Wir freuen uns auf Ihre Anfrage.
        </p>
        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          <Link to="/kontakt" className="btn-primary" data-testid="cta-contact-btn">Kontakt aufnehmen</Link>
          <Link to="/models" className="btn-ghost">Models ansehen</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
