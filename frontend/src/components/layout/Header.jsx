import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Phone } from "lucide-react";
import { BRAND, NAV } from "@/data/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top contact bar */}
      <div className="hidden md:block bg-[#1A1414] text-white text-xs py-2 px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-white/90">
            <a href={`tel:${BRAND.phone}`} className="inline-flex items-center gap-2 hover:accent-text"><Phone size={12} /> {BRAND.phone}</a>
            <a href={`mailto:${BRAND.email}`} className="hover:accent-text">{BRAND.email}</a>
          </div>
          <div className="text-white/70 tracking-wide">Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr</div>
        </div>
      </div>

      <header
        data-testid="site-header"
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white border-b border-[#1A1414]/8"
        }`}
      >
        <div className="px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading text-2xl tracking-tight" data-testid="brand-logo">
            <span className="text-[#1A1414] font-semibold">Noir</span>{" "}
            <span className="accent-text italic">Hamburg</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors link-underline ${
                    isActive ? "accent-text" : "text-[#1A1414] hover:accent-text"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank" rel="noreferrer"
              className="btn-whatsapp"
              data-testid="header-whatsapp-btn"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <Link to="/kontakt" className="btn-primary" data-testid="header-book-btn">
              Buchen
            </Link>
          </div>
          <button
            className="lg:hidden text-[#1A1414]"
            onClick={() => setOpen(true)}
            aria-label="Menü öffnen"
            data-testid="mobile-menu-btn"
          >
            <Menu size={26} />
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-white z-50 px-6 py-6 lg:hidden overflow-y-auto" data-testid="mobile-menu">
            <div className="flex justify-between items-center mb-12">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="font-heading text-2xl tracking-tight"
              >
                <span className="text-[#1A1414] font-semibold">Noir</span>{" "}
                <span className="accent-text italic">Hamburg</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Menü schließen" data-testid="mobile-close-btn">
                <X size={26} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `font-heading text-2xl ${isActive ? "accent-text" : "text-[#1A1414]"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="flex gap-3 mt-8">
                <a
                  href={`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}`}
                  className="btn-whatsapp"
                  data-testid="mobile-whatsapp-btn"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <Link
                  to="/kontakt"
                  onClick={() => setOpen(false)}
                  className="btn-primary"
                  data-testid="mobile-book-btn"
                >
                  Buchen
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
