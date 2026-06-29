import { Link } from "react-router-dom";
import { BRAND, SERVICES, LOCATIONS } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0B] mt-32" data-testid="site-footer">
      <div className="px-6 md:px-12 lg:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h3 className="font-heading text-3xl tracking-tight mb-4">
              <span className="text-[#F5F5F0]">Noir</span>{" "}
              <span className="accent-text">Hamburg</span>
            </h3>
            <p className="text-[#9CA3AF] font-light text-sm leading-relaxed max-w-sm">
              Premium-Begleitagentur mit Sitz in Hamburg.
              Wir verbinden hanseatische Diskretion mit internationalem Stil.
            </p>
            <div className="mt-8 space-y-2 text-sm font-light text-[#9CA3AF]">
              <div>
                <span className="overline text-[10px] block mb-1">Kontakt</span>
                <a href={`mailto:${BRAND.email}`} className="hover:text-[#F5F5F0]">{BRAND.email}</a>
              </div>
              <div>
                <a href={`tel:${BRAND.phone}`} className="hover:text-[#F5F5F0]">{BRAND.phone}</a>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="overline mb-6">Services</h4>
            <ul className="space-y-3 text-sm font-light">
              {SERVICES.slice(0, 8).map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-[#9CA3AF] hover:text-[#F5F5F0]">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="overline mb-6">Hamburg Areas</h4>
            <ul className="space-y-3 text-sm font-light grid grid-cols-2 gap-y-3">
              {LOCATIONS.slice(0, 10).map((l) => (
                <li key={l.slug}>
                  <Link to={`/escort/${l.slug}`} className="text-[#9CA3AF] hover:text-[#F5F5F0]">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="overline mb-6">Mehr</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/models" className="text-[#9CA3AF] hover:text-[#F5F5F0]">Models</Link></li>
              <li><Link to="/blog" className="text-[#9CA3AF] hover:text-[#F5F5F0]">Blog</Link></li>
              <li><Link to="/faq" className="text-[#9CA3AF] hover:text-[#F5F5F0]">FAQ</Link></li>
              <li><Link to="/ueber-uns" className="text-[#9CA3AF] hover:text-[#F5F5F0]">Über uns</Link></li>
              <li><Link to="/kontakt" className="text-[#9CA3AF] hover:text-[#F5F5F0]">Kontakt</Link></li>
              <li><Link to="/impressum" className="text-[#9CA3AF] hover:text-[#F5F5F0]">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-[#9CA3AF] hover:text-[#F5F5F0]">Datenschutz</Link></li>
            </ul>
          </div>
        </div>

        <div className="thin-divider mt-16 mb-8" />
        <div className="flex flex-col md:flex-row justify-between gap-4 text-xs text-[#52525B] font-light">
          <div>© {new Date().getFullYear()} Noir Hamburg. Alle Rechte vorbehalten.</div>
          <div className="font-mono uppercase tracking-[0.15em]">Hamburg · 18+ · Diskret</div>
        </div>
      </div>
    </footer>
  );
}
