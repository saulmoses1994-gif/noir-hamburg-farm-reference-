import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

// SEO-optimised anchor text: primary keyword + Hamburg qualifier so
// Googlebot receives strong topical signals via internal linking.
const SERVICE_LINKS = [
  { slug: "luxury-escort-hamburg",   label: "Luxus Escort Hamburg",    labelEn: "Luxury Escort Hamburg" },
  { slug: "vip-escort-hamburg",      label: "VIP Escort Hamburg",      labelEn: "VIP Escort Hamburg" },
  { slug: "business-escort-hamburg", label: "Business Escort Hamburg", labelEn: "Business Escort Hamburg" },
  { slug: "hotel-escort-hamburg",    label: "Hotel Escort Hamburg",    labelEn: "Hotel Escort Hamburg" },
  { slug: "dinner-companion-hamburg",label: "Dinner Escort Hamburg",   labelEn: "Dinner Companion Hamburg" },
];

const AREA_LINKS = [
  { slug: "st-pauli",    label: "Escort St. Pauli",   labelEn: "Escort St. Pauli" },
  { slug: "hafencity",   label: "Escort HafenCity",   labelEn: "Escort HafenCity" },
  { slug: "eppendorf",   label: "Escort Eppendorf",   labelEn: "Escort Eppendorf" },
  { slug: "winterhude",  label: "Escort Winterhude",  labelEn: "Escort Winterhude" },
  { slug: "altona",      label: "Escort Altona",      labelEn: "Escort Altona" },
  { slug: "blankenese",  label: "Escort Blankenese",  labelEn: "Escort Blankenese" },
];

export default function Footer() {
  const { lang, t, to } = useI18n();
  const settings = useSettings();

  const taglineByLang = {
    de: "Ihre vertrauenswürdige Premium-Begleitagentur in Hamburg und Umland. Ehrlich, diskret und mit Herz für Service seit 2025.",
    en: "Your trusted premium companion agency in Hamburg and the surrounding region. Honest, discreet, and devoted to service since 2025.",
  };
  const rightsByLang = { de: "Alle Rechte vorbehalten.", en: "All rights reserved." };
  const tagBadgeByLang = { de: "Hamburg · 18+ · Diskret", en: "Hamburg · 18+ · Discreet" };
  const infoLabel      = lang === "en" ? "Information" : "Informationen";
  const servicesLabel  = lang === "en" ? "Escort Services" : "Escort Services";
  const areasLabel     = lang === "en" ? "Escort Hamburg by Area" : "Escort Hamburg nach Stadtteil";
  const allServicesLabel = lang === "en" ? "All Escort Services →" : "Alle Escort Services →";
  const allAreasLabel  = lang === "en" ? "All Hamburg areas →" : "Alle Hamburg-Stadtteile →";
  const escortHamburgLabel = lang === "en" ? "Escort Hamburg — All Models" : "Escort Hamburg — Alle Models";
  const ctaLabel = lang === "en" ? "Contact Noir Hamburg" : "Kontakt Noir Hamburg";

  const link = (path, text, testid) => (
    <li>
      <Link to={to(path)} className="text-white/70 hover:accent-text transition-colors" data-testid={testid}>
        {text}
      </Link>
    </li>
  );

  return (
    <footer className="bg-[#1A1414] text-white mt-20" data-testid="site-footer">
      <div className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand + contact */}
          <div className="md:col-span-4">
            <h3 className="font-heading text-3xl tracking-tight mb-4">
              <span className="text-white">Noir</span>{" "}
              <span className="accent-text italic">Hamburg</span>
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              {taglineByLang[lang] || taglineByLang.de}
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-white/90 hover:accent-text" data-testid="footer-phone"><Phone size={14} /> {settings.phone}</a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-white/90 hover:accent-text" data-testid="footer-email"><Mail size={14} /> {settings.email}</a>
              <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/90 hover:accent-text" data-testid="footer-whatsapp"><MessageCircle size={14} /> WhatsApp</a>
            </div>
            <Link to={to("/kontakt")} className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#8B1538] hover:bg-[#a01a44] transition-colors text-white text-xs uppercase tracking-[0.2em]" data-testid="footer-cta-contact">
              {ctaLabel} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Escort Services — descriptive SEO anchors */}
          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">{servicesLabel}</h4>
            <ul className="space-y-2.5 text-sm">
              {link("/models", escortHamburgLabel, "footer-escort-hamburg")}
              {SERVICE_LINKS.map((s) => link(`/services/${s.slug}`, lang === "en" ? s.labelEn : s.label, `footer-service-${s.slug}`))}
              {link("/services", allServicesLabel, "footer-all-services")}
            </ul>
          </div>

          {/* Areas — descriptive "Escort {Bezirk}" anchors */}
          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">{areasLabel}</h4>
            <ul className="space-y-2.5 text-sm">
              {AREA_LINKS.map((a) => link(`/escort/${a.slug}`, lang === "en" ? a.labelEn : a.label, `footer-area-${a.slug}`))}
              {link("/areas", allAreasLabel, "footer-all-areas")}
            </ul>
          </div>

          {/* Information */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#E5A5B5] mb-5">{infoLabel}</h4>
            <ul className="space-y-2.5 text-sm">
              {link("/blog", lang === "en" ? "Magazine" : "Magazin", "footer-blog")}
              {link("/faq", "FAQ", "footer-faq")}
              {link("/ueber-uns", lang === "en" ? "About Noir Hamburg" : "Über Noir Hamburg", "footer-about")}
              {link("/kontakt", lang === "en" ? "Contact" : "Kontakt", "footer-contact")}
              {link("/p/diskretion", lang === "en" ? "Discretion Promise" : "Diskretion", "footer-discretion")}
              {link("/impressum", lang === "en" ? "Imprint" : "Impressum", "footer-imprint")}
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
