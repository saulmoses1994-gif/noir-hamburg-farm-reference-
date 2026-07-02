import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Phone, Globe } from "lucide-react";
import { BRAND, NAV } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

// Map NAV entries' `to` (DE canonical) to their i18n keys for label translation.
const NAV_KEYS = {
  "/": "nav.home",
  "/models": "nav.models",
  "/escort-hamburg": "nav.escortHamburg",
  "/services": "nav.services",
  "/areas": "nav.areas",
  "/blog": "nav.blog",
  "/faq": "nav.faq",
  "/ueber-uns": "nav.about",
  "/kontakt": "nav.contact",
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, t, to, switchTo, switchPath } = useI18n();
  const settings = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hours = lang === "en"
    ? (settings.hours_en || "Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm")
    : (settings.hours_de || "Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr");

  return (
    <>
      {/* Top contact bar */}
      <div className="hidden md:block bg-[#1A1414] text-white text-xs py-2 px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-white/90">
            <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 hover:accent-text"><Phone size={12} /> {settings.phone}</a>
            <a href={`mailto:${settings.email}`} className="hover:accent-text">{settings.email}</a>
          </div>
          <div className="text-white/70 tracking-wide">{hours}</div>
        </div>
      </div>

      <header
        data-testid="site-header"
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white border-b border-[#1A1414]/8"
        }`}
      >
        <div className="px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <Link to={to("/")} className="font-heading text-2xl tracking-tight" data-testid="brand-logo">
            <span className="text-[#1A1414] font-semibold">Noir</span>{" "}
            <span className="accent-text italic">Hamburg</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={to(n.to)}
                data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors link-underline ${
                    isActive ? "accent-text" : "text-[#1A1414] hover:accent-text"
                  }`
                }
              >
                {t(NAV_KEYS[n.to])}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={switchPath}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#8B1538] text-[#8B1538] text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-[#8B1538] hover:text-white transition-colors"
              data-testid="lang-switcher-desktop"
              aria-label={t("lang.switchLabel")}
            >
              <Globe size={12} /> {t("lang.switch")}
            </Link>
            <a
              href={settings.whatsappUrl}
              target="_blank" rel="noreferrer"
              className="btn-whatsapp"
              data-testid="header-whatsapp-btn"
            >
              <MessageCircle size={14} /> {t("cta.whatsapp")}
            </a>
            <Link to={to("/kontakt")} className="btn-primary" data-testid="header-book-btn">
              {t("cta.book")}
            </Link>
          </div>
          <button
            className="lg:hidden text-[#1A1414]"
            onClick={() => setOpen(true)}
            aria-label={t("cta.menuOpen")}
            data-testid="mobile-menu-btn"
          >
            <Menu size={26} />
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-white z-50 px-6 py-6 lg:hidden overflow-y-auto" data-testid="mobile-menu">
            <div className="flex justify-between items-center mb-12">
              <Link
                to={to("/")}
                onClick={() => setOpen(false)}
                className="font-heading text-2xl tracking-tight"
              >
                <span className="text-[#1A1414] font-semibold">Noir</span>{" "}
                <span className="accent-text italic">Hamburg</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label={t("cta.menuClose")} data-testid="mobile-close-btn">
                <X size={26} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={to(n.to)}
                  onClick={() => setOpen(false)}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `font-heading text-2xl ${isActive ? "accent-text" : "text-[#1A1414]"}`
                  }
                >
                  {t(NAV_KEYS[n.to])}
                </NavLink>
              ))}
              <Link
                to={switchPath}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-[#8B1538] text-[#8B1538] rounded-full self-start text-sm font-semibold tracking-widest uppercase"
                data-testid="lang-switcher-mobile"
                aria-label={t("lang.switchLabel")}
              >
                <Globe size={14} /> {t("lang.switch")}
              </Link>
              <div className="flex gap-3 mt-8">
                <a
                  href={settings.whatsappUrl}
                  className="btn-whatsapp"
                  data-testid="mobile-whatsapp-btn"
                >
                  <MessageCircle size={14} /> {t("cta.whatsapp")}
                </a>
                <Link
                  to={to("/kontakt")}
                  onClick={() => setOpen(false)}
                  className="btn-primary"
                  data-testid="mobile-book-btn"
                >
                  {t("cta.book")}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
