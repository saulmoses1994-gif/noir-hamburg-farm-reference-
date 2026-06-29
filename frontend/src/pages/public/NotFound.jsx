import { Link } from "react-router-dom";
import { useEffect } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { SERVICES, LOCATIONS } from "@/data/site";
import { Home as HomeIcon, ArrowRight } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Seite nicht gefunden | Noir Hamburg";
    // Tell crawlers not to index 404
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    const prev = meta.getAttribute("content");
    meta.setAttribute("content", "noindex, follow");
    return () => { if (prev) meta.setAttribute("content", prev); };
  }, []);

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 py-24 text-center" data-testid="not-found">
        <div className="font-mono text-xs accent-text uppercase tracking-widest">404</div>
        <h1 className="font-heading text-5xl lg:text-7xl font-semibold mt-4">
          Seite nicht <em className="italic accent-text">gefunden</em>
        </h1>
        <p className="mt-6 text-lg text-[#6B5F5F] max-w-xl mx-auto">
          Die gesuchte Seite existiert nicht (mehr) — vielleicht finden Sie unten, was Sie gesucht haben.
        </p>
        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          <Link to="/" className="btn-primary"><HomeIcon size={14} /> Zur Startseite</Link>
          <Link to="/models" className="btn-ghost">Alle Models</Link>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="font-heading text-2xl mb-4">Beliebte Services</h2>
            <ul className="space-y-2 text-sm">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-[#1A1414] hover:accent-text inline-flex items-center gap-2">
                    <ArrowRight size={12} className="accent-text" /> {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl mb-4">Hamburger Stadtteile</h2>
            <ul className="space-y-2 text-sm">
              {LOCATIONS.slice(0, 8).map((l) => (
                <li key={l.slug}>
                  <Link to={`/escort/${l.slug}`} className="text-[#1A1414] hover:accent-text inline-flex items-center gap-2">
                    <ArrowRight size={12} className="accent-text" /> Escort {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
