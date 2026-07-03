import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, Sparkles } from "lucide-react";
import { BRAND, SERVICES, LOCATIONS } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

export default function Footer() {
  const { lang, t, to } = useI18n();
  const settings = useSettings();

  const taglineByLang = {
    de: "Ihre vertrauenswürdige Premium-Begleitagentur in Hamburg und Umland. Ehrlich, diskret und mit Herz für Service seit 2014.",
    en: "Your trusted premium companion agency in Hamburg and the surrounding region. Honest, discreet, and devoted to service since 2014.",
  };
  const moreLabelByLang = { de: "Mehr", en: "More" };
  const blogLabelByLang = { de: "Magazin", en: "Magazine" };
  const rightsByLang = {
    de: "Alle Rechte vorbehalten.",
    en: "All rights reserved.",
  };
  const tagBadgeByLang = {
    de: "Hamburg · 18+ · Diskret",
    en: "Hamburg · 18+ · Discreet",
  };

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
              {taglineByLang[lang] || taglineByLang.de}
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-white/90 hover:accent-text"><Phone size={14} /> {settings.phone}</a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-white/90 hover:accent-text"><Mail size={14} /> {settings.email}</a>
              <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/90 hover:accent-text"><MessageCircle size={14} /> WhatsApp</a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">{t("sec.services")}</h4>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.slice(0, 8).map((s) => (
                <li key={s.slug}>
                  <Link to={to(`/services/${s.slug}`)} className="text-white/70 hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">{t("nav.areas")}</h4>
            <ul className="grid grid-cols-2 gap-y-2.5 text-sm">
              {LOCATIONS.slice(0, 12).map((l) => (
                <li key={l.slug}>
                  <Link to={to(`/escort/${l.slug}`)} className="text-white/70 hover:text-white">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">{moreLabelByLang[lang] || moreLabelByLang.de}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={to("/models")} className="text-white/70 hover:text-white">{t("nav.models")}</Link></li>
              <li><Link to={to("/blog")} className="text-white/70 hover:text-white">{blogLabelByLang[lang] || blogLabelByLang.de}</Link></li>
              <li><Link to={to("/faq")} className="text-white/70 hover:text-white">{t("nav.faq")}</Link></li>
              <li><Link to={to("/ueber-uns")} className="text-white/70 hover:text-white">{t("nav.about")}</Link></li>
              <li><Link to={to("/kontakt")} className="text-white/70 hover:text-white">{t("nav.contact")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="overline text-[10px] text-white/50" data-testid="partner-badge-label">
            {lang === "en" ? "Featured on" : "Verzeichnis-Partner"}
          </span>
          <a
            href="https://www.eurogirlsescort.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            title="EuroGirlsEscort.com"
            className="opacity-70 hover:opacity-100 transition-opacity"
            data-testid="partner-banner-eurogirls"
          >
            <img
              src="https://www.eurogirlsescort.com/dist/images/banners/120X60.jpg"
              alt="EuroGirlsEscort.com"
              title="EuroGirlsEscort.com"
              width="120"
              height="60"
              loading="lazy"
            />
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[#E5A5B5]" /> © {new Date().getFullYear()} Noir Hamburg. {rightsByLang[lang] || rightsByLang.de}
          </div>
          <div className="uppercase tracking-wider">{tagBadgeByLang[lang] || tagBadgeByLang.de}</div>
        </div>
      </div>
    </footer>
  );
}
