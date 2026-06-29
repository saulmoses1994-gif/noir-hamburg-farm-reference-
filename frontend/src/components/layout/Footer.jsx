import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, Sparkles } from "lucide-react";
import { BRAND, SERVICES, LOCATIONS } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-[#1A1414] text-white mt-20" data-testid="site-footer">
      <div className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h3 className="font-heading text-3xl tracking-tight mb-4">
              <span className="text-white">Noir</span>{" "}
              <span className="accent-text italic">Hamburg</span>
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Ihre vertrauenswürdige Premium-Begleitagentur in Hamburg und Umland. Ehrlich, diskret und mit Herz für Service seit 2014.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 text-white/90 hover:accent-text"><Phone size={14} /> {BRAND.phone}</a>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 text-white/90 hover:accent-text"><Mail size={14} /> {BRAND.email}</a>
              <a href={`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/90 hover:accent-text"><MessageCircle size={14} /> WhatsApp</a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.slice(0, 8).map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-white/70 hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">Hamburg Areas</h4>
            <ul className="grid grid-cols-2 gap-y-2.5 text-sm">
              {LOCATIONS.slice(0, 12).map((l) => (
                <li key={l.slug}>
                  <Link to={`/escort/${l.slug}`} className="text-white/70 hover:text-white">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">Mehr</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/models" className="text-white/70 hover:text-white">Models</Link></li>
              <li><Link to="/blog" className="text-white/70 hover:text-white">Magazin</Link></li>
              <li><Link to="/faq" className="text-white/70 hover:text-white">FAQ</Link></li>
              <li><Link to="/ueber-uns" className="text-white/70 hover:text-white">Über uns</Link></li>
              <li><Link to="/kontakt" className="text-white/70 hover:text-white">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[#E5A5B5]" /> © {new Date().getFullYear()} Noir Hamburg. Alle Rechte vorbehalten.
          </div>
          <div className="uppercase tracking-wider">Hamburg · 18+ · Diskret</div>
        </div>
      </div>
    </footer>
  );
}
